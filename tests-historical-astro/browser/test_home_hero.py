"""Accepted opening: Earth first, then held film and People in one story owner.

These are future browser regressions, not a claim of execution. The observed
reference is private preview version 8; this module exercises current build output.
"""
import unittest
from lxml import html
from playwright.sync_api import sync_playwright
from _support import LocalSite


class HomeHeroTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.site = LocalSite()
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.site.close()

    def page(self, width=1280, height=720, motion='reduce', media=True, touch=False):
        context = self.browser.new_context(viewport={'width':width,'height':height},
            reduced_motion=motion, has_touch=touch, is_mobile=touch)
        self.addCleanup(context.close)
        context.route('**/*', lambda r:r.continue_() if r.request.url.startswith(self.site.url)
            and (media or r.request.resource_type!='media') else r.abort())
        page = context.new_page()
        page.set_default_timeout(10000)
        page.goto(self.site.url, wait_until='domcontentloaded')
        page.wait_for_function('!!window.chStory')
        return page

    def assert_opening_owner(self, page):
        self.assertEqual(page.locator('#main > .hv').count(),1)
        self.assertEqual(page.locator('.hv > .hv-film').count(),1)
        self.assertEqual(page.locator('.hv > div#people').count(),1)
        self.assertEqual(page.locator('#main > #people').count(),0)
        self.assertTrue(page.evaluate("chStory.current().els[0]===document.querySelector('.hv')"))
        self.assertEqual(page.evaluate("chStory.frames().filter(f=>f.els[0].matches('.hv')).length"),1)

    def assert_finished(self, page, seek=True):
        page.wait_for_function("document.querySelector('.hv').classList.contains('intro-peek')")
        self.assert_opening_owner(page)
        self.assertTrue(page.locator('#people').is_visible())
        self.assertAlmostEqual(page.evaluate('scrollY'),0,delta=3)
        self.assertTrue(page.locator('[data-hv-vid]').evaluate('v=>v.paused'))
        if seek:
            page.wait_for_function('''()=>{
                const v=document.querySelector('[data-hv-vid]');
                return !v.seeking && v.readyState>=2 && Math.abs(v.currentTime-(v.duration-.05))<.03;
            }''')
            state=page.locator('[data-hv-vid]').evaluate('v=>({time:v.currentTime,duration:v.duration})')
            self.assertAlmostEqual(state['duration'],17.9,delta=.05)
            self.assertAlmostEqual(state['time'],17.85,delta=.05)
        film,people=page.locator('.hv-film').bounding_box(),page.locator('#people').bounding_box()
        self.assertAlmostEqual(film['y']+film['height'],people['y'],delta=2)
        self.assertLess(film['height'],page.viewport_size['height']/2)
        self.assertTrue(page.locator('[data-hv-next]').is_hidden())
        self.assertTrue(page.locator('[data-hv-skip]').is_hidden())

    def assert_next_gesture_reaches_mission(self, page):
        page.wait_for_timeout(600)  # A fresh gesture after the opening's latch.
        page.mouse.move(page.viewport_size['width']-12,120)
        page.mouse.wheel(0,90)
        page.wait_for_function("chStory.current().els[0].id==='problem'")
        self.assertTrue(page.locator('#why-h').is_visible())
        self.assertEqual(page.locator('#why-h').inner_text(),'Who we are')
        self.assertEqual(page.evaluate("chStory.frames().filter(f=>f.els[0].id==='people').length"),0)

    def test_server_markup_starts_full_on_earth_with_people_hidden(self):
        context=self.browser.new_context()
        self.addCleanup(context.close)
        response=context.request.get(self.site.url)
        try:
            self.assertEqual(response.status,200)
            tree=html.fromstring(response.text())
            hero=tree.xpath('//main/section[contains(concat(" ",@class," ")," hv ")]')[0]
            self.assertIn('full',hero.get('class').split())
            people=tree.get_element_by_id('people')
            self.assertEqual(people.tag,'div')
            self.assertIs(people.getparent(),hero)
            self.assertIn('hidden',people.attrib)
            video=hero.xpath('.//video')[0]
            self.assertEqual(video.get('poster'),'assets/hero-first-frame.jpg')
            self.assertNotIn('loop',video.attrib)
            self.assertIn('hero-first-frame.jpg',hero.xpath('.//*[@data-hv-stills]/i')[0].get('style'))
        finally:
            response.dispose()

    def test_blocked_media_first_view_preserves_earth_and_full_height(self):
        for width,height in [(1280,720),(390,844),(375,667)]:
            with self.subTest(viewport=(width,height)):
                page=self.page(width,height,media=False)
                self.assert_opening_owner(page)
                self.assertTrue(page.locator('#people').is_hidden())
                self.assertIn('full',page.locator('.hv').get_attribute('class').split())
                self.assertIn('hero-first-frame.jpg',page.locator('[data-hv-stills] i').evaluate('el=>getComputedStyle(el).backgroundImage'))
                film=page.locator('.hv-film').bounding_box()
                self.assertAlmostEqual(film['y']+film['height'],height,delta=2)
                self.assertGreater(film['height'],height/2)
                page.get_by_role('button',name='Explore Community Hub',exact=True).click()
                self.assert_finished(page,seek=False)
                self.assert_next_gesture_reaches_mission(page)
                page.context.close()

    def test_skip_and_explore_hold_final_frame_in_the_same_section(self):
        for motion in ['reduce','no-preference']:
            for width,height in [(1280,720),(390,844)]:
                for selector in ['[data-hv-skip]','[data-hv-next]']:
                    with self.subTest(motion=motion,viewport=(width,height),action=selector):
                        page=self.page(width,height,motion)
                        page.locator(selector).click()
                        self.assert_finished(page)
                        self.assert_next_gesture_reaches_mission(page)
                        page.context.close()

    def test_first_downward_wheel_or_key_reveals_people_before_leaving(self):
        for width,height in [(1280,720),(390,844)]:
            for gesture in ['wheel','ArrowDown','PageDown']:
                with self.subTest(viewport=(width,height),gesture=gesture):
                    page=self.page(width,height)
                    if gesture=='wheel':
                        page.mouse.move(width-12,200)
                        page.mouse.wheel(0,90)
                    else:
                        page.keyboard.press(gesture)
                    self.assert_finished(page)
                    self.assert_next_gesture_reaches_mission(page)
                    page.context.close()

    def test_first_real_phone_swipe_reveals_people_in_place(self):
        page=self.page(390,844,touch=True)
        cdp=page.context.new_cdp_session(page)
        cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':365,'y':480,'id':1}]})
        for y in range(460,279,-20):
            cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':365,'y':y,'id':1}]})
            page.wait_for_timeout(16)
        cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        self.assert_finished(page)
        self.assert_next_gesture_reaches_mission(page)

    def test_natural_playback_holds_three_seconds_then_reveals_without_scroll(self):
        page=self.page(motion='no-preference')
        page.evaluate('''()=>{
            window.__heroEndedAt=null;
            document.querySelector('[data-hv-vid]').addEventListener('ended',()=>{
                window.__heroEndedAt=performance.now();
            },{once:true});
        }''')
        self.assertTrue(page.locator('#people').is_hidden())
        page.wait_for_function('window.__heroEndedAt!==null',timeout=30000)
        page.wait_for_timeout(1800)
        self.assertTrue(page.locator('#people').is_hidden())
        self.assertTrue(page.locator('.hv').evaluate("el=>!el.classList.contains('intro-peek')"))
        self.assert_finished(page)
        self.assertGreaterEqual(page.evaluate('performance.now()-window.__heroEndedAt'),2900)
        self.assert_next_gesture_reaches_mission(page)


if __name__=='__main__':
    unittest.main()
