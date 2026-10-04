"""Direct links retain their story through startup fit and menu focus changes."""
import os
import unittest
from playwright.sync_api import sync_playwright
from _support import LocalSite


class StoryStartupTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = None if os.environ.get('CH_STORY_TEST_URL') else LocalSite()
        cls.url = os.environ.get('CH_STORY_TEST_URL') or cls.server.url
        cls.pw = sync_playwright().start()
        cls.browser = getattr(cls.pw,os.environ.get('CH_STORY_BROWSER','chromium')).launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        if cls.server:
            cls.server.close()

    def setUp(self):
        self.context = self.browser.new_context(viewport={'width':1280,'height':720})
        def route(request):
            if request.request.url.startswith(self.url):
                request.continue_()
            elif request.request.resource_type == 'document' and '/dh-public/' in request.request.url:
                request.fulfill(status=200,content_type='text/html',body='<body>Dashboard fixture</body>')
            else:
                request.abort()
        self.context.route('**/*',route)
        self.page = self.context.new_page()
        self.page.set_default_timeout(5000)

    def tearDown(self):
        self.context.close()

    def open(self, path, motion='no-preference'):
        self.page.emulate_media(reduced_motion=motion)
        self.page.goto(self.url + path,wait_until='domcontentloaded')
        self.page.wait_for_function('!!window.chStory && !!window.chFit')
        self.page.wait_for_timeout(1800)  # Includes delayed startup fitting.

    def assert_first_frame(self, section):
        position = self.page.evaluate('''id=>({y:scrollY, target:chStory.frames().find(f=>f.els[0].id===id).y,
          owner:chStory.current().els[0].id,inert:document.getElementById(id).inert})''',section)
        self.assertAlmostEqual(position['y'],position['target'],delta=3, msg=str(position))
        self.assertEqual(position['owner'],section)
        self.assertFalse(position['inert'])

    def test_home_reload_and_logo_start_at_video(self):
        for width, height in [(1280, 720), (390, 844)]:
            with self.subTest(width=width):
                self.page.set_viewport_size({'width': width, 'height': height})
                self.open('index.html')
                # The first action reveals the held film and People without
                # leaving their shared opening owner; the next leaves it.
                self.page.evaluate('chStory.go(1)')
                self.assertTrue(self.page.evaluate("document.querySelector('.hv').classList.contains('intro-peek')"))
                self.assertTrue(self.page.locator('.hv > #people').is_visible())
                self.assertAlmostEqual(self.page.evaluate('scrollY'), 0, delta=3)
                self.page.evaluate('chStory.go(1)')
                self.page.wait_for_timeout(300)
                self.assertGreater(self.page.evaluate('scrollY'), 100)
                self.page.reload(wait_until='domcontentloaded')
                self.page.wait_for_timeout(1800)
                self.assertLessEqual(self.page.evaluate('scrollY'), 3)
                self.assertTrue(self.page.evaluate('chStory.current().els[0].matches(".hv")'))
                self.page.evaluate('chStory.go(1)')
                self.assertAlmostEqual(self.page.evaluate('scrollY'), 0, delta=3)
                self.page.evaluate('chStory.go(1)')
                self.page.wait_for_timeout(300)
                self.page.locator('#hdr .brand').click()
                self.page.wait_for_timeout(1800)
                self.assertLessEqual(self.page.evaluate('scrollY'), 3)

    def test_home_hash_and_back_preserve_requested_scene(self):
        self.open('index.html#problem', 'reduce')
        self.assert_first_frame('problem')
        self.open('index.html', 'reduce')
        self.page.evaluate('chStory.go(1)')
        self.assertAlmostEqual(self.page.evaluate('scrollY'), 0, delta=3)
        self.page.evaluate('chStory.go(1)')
        self.page.wait_for_timeout(300)
        original = self.page.evaluate('scrollY')
        self.assertGreater(original, 100)
        self.open('about.html', 'reduce')
        self.page.go_back(wait_until='domcontentloaded')
        self.page.wait_for_timeout(1800)
        self.assertAlmostEqual(self.page.evaluate('scrollY'), original, delta=3)

    def test_normal_motion_initial_product_hash_survives_startup_fit(self):
        self.open('products.html#how')
        self.assert_first_frame('how')
        next_button=self.page.locator('[data-hf-next]')
        next_button.click()
        self.assertEqual(self.page.locator('[data-hub-flow]').get_attribute('data-step'),'2')

    def test_reduced_motion_initial_product_hash_survives_startup_fit(self):
        self.open('products.html#how','reduce')
        self.assert_first_frame('how')

    def test_selected_dashboard_hash_keeps_title_and_tabs_in_context(self):
        self.page.set_viewport_size({'width':390,'height':844})
        for motion in ['no-preference','reduce']:
            with self.subTest(motion=motion):
                self.page.goto('about:blank')
                self.open('dashboards.html#great-lakes-science-center',motion)
                self.assert_first_frame('gallery')
                self.assertEqual(self.page.evaluate('location.hash'),'#great-lakes-science-center')
                panel=self.page.locator('[data-dashboard-panel="great-lakes-science-center"]')
                self.assertTrue(panel.is_visible())
                panel.locator('iframe').wait_for(state='attached')
                tab=self.page.locator('[data-dashboard-key="great-lakes-science-center"]')
                self.assertEqual(tab.get_attribute('aria-selected'),'true')
                header_bottom=self.page.locator('#hdr').bounding_box()['height']
                for element in [self.page.locator('#gallery h1'),self.page.locator('[data-dashboard-gallery] [role=tablist]')]:
                    box=element.bounding_box()
                    self.assertGreaterEqual(box['y'],header_bottom-1)
                    self.assertLessEqual(box['y']+box['height'],844)

    def test_initial_hash_does_not_reclaim_later_manual_scroll(self):
        self.open('products.html#how')
        self.assert_first_frame('how')
        self.page.evaluate('scrollTo({top:123,behavior:"instant"})')
        self.page.wait_for_timeout(100)
        self.page.evaluate('chFit.run()')
        self.page.wait_for_timeout(200)
        self.assertAlmostEqual(self.page.evaluate('scrollY'),123,delta=3)

    def test_remeasure_preserves_native_scroll_near_a_story_stop(self):
        self.open('products.html', 'reduce')
        for action in ['dispatchEvent(new Event("resize")); chStory.frames()', 'chFit.run()']:
            with self.subTest(action=action):
                self.page.evaluate('scrollTo({top:3,behavior:"instant"})')
                self.page.evaluate(action)
                self.page.wait_for_timeout(200)
                self.assertEqual(self.page.evaluate('scrollY'), 3)

    def test_back_navigation_does_not_issue_controller_hash_scroll(self):
        self.page.add_init_script('''(() => {
          window.__historyVisit = performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
          window.__historyScrollRequests = [];
          addEventListener('pageshow', event => {
            window.__historyVisit = event.persisted ||
              performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
            if (event.persisted) {
              window.__historyScrollRequests = [];
            }
          });
          for (const method of ['scroll', 'scrollTo', 'scrollBy']) {
            const native = window[method];
            window[method] = function(...args) {
              if (window.__historyVisit || performance.getEntriesByType('navigation')[0]?.type === 'back_forward')
                window.__historyScrollRequests.push({method, args});
              return native.apply(this, args);
            };
          }
        })();''')
        self.open('products.html#how')
        self.assert_first_frame('how')
        self.page.evaluate('scrollTo({top:123,behavior:"instant"})')
        self.page.wait_for_timeout(100)
        self.page.goto(self.url+'about.html',wait_until='domcontentloaded')
        self.page.go_back(wait_until='domcontentloaded')
        self.page.wait_for_timeout(1800)
        self.assertEqual(self.page.evaluate('location.hash'),'#how')
        self.assertTrue(self.page.evaluate('__historyVisit'))
        # Native restoration differs across engines and load timing. Our promise
        # is that startup never pins a history visit to its fragment destination.
        self.assertEqual(self.page.evaluate('__historyScrollRequests'), [])

    def test_menu_forward_reverse_wrap_and_escape_preserve_later_story(self):
        self.page.set_viewport_size({'width':390,'height':844})
        self.open('products.html','reduce')
        self.page.evaluate('scrollTo({top:chStory.frames().find(f=>f.els[0].id==="how").y,behavior:"instant"})')
        self.page.wait_for_timeout(100)
        self.assert_first_frame('how')
        y=self.page.evaluate('scrollY')
        self.assertGreater(y,500)
        opener=self.page.locator('.menu-btn')
        button=opener.bounding_box()
        # A real pointer hits the already-visible sticky header. Playwright's
        # locator auto-scroll can itself move the document before clicking it.
        self.page.mouse.click(button['x']+button['width']/2,button['y']+button['height']/2)
        self.assertAlmostEqual(self.page.evaluate('scrollY'),y,delta=1)
        controls=self.page.locator('#mnav a[href],#mnav button')
        # Move naturally through every menu link, including the two wrap edges.
        for key in ['Tab']*(controls.count()+2)+['Shift+Tab']*(controls.count()+2):
            self.page.keyboard.press(key)
            self.assertTrue(self.page.evaluate('document.activeElement.matches(".menu-btn") || !!document.activeElement.closest("#mnav")'))
            self.assertAlmostEqual(self.page.evaluate('scrollY'),y,delta=1,msg=key)
            self.assertTrue(self.page.evaluate('''()=>{
              const el=document.activeElement,menu=document.querySelector('#mnav');
              if(!menu.contains(el)) return true;
              const item=el.getBoundingClientRect(),box=menu.getBoundingClientRect();
              return item.top>=box.top-1 && item.bottom<=box.bottom+1;
            }'''))
        self.page.keyboard.press('Escape')
        self.assertTrue(self.page.locator('#mnav').is_hidden())
        self.assertTrue(opener.evaluate('el=>el===document.activeElement'))
        self.assertAlmostEqual(self.page.evaluate('scrollY'),y,delta=1)


if __name__=='__main__': unittest.main()
