"""Semantic article ownership and the header's native chapter navigation.

Uses the generated production site. Remote documents, feeds and images are blocked;
the assertions concern the host page's navigation, focus and readable content.
"""
import os
import json
import unittest
from playwright.sync_api import sync_playwright
from _support import LocalSite, PROJECT


PAPER = 'paper-dorms-cut-electricity-with-live-feedback'
PAPER_TITLE = 'Dorms cut electricity with live feedback'


class AuthoredSceneTests(unittest.TestCase):
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
        self.context = self.browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
        self.context.route('**/*',lambda r:r.continue_() if r.request.url.startswith(self.url) else r.abort())
        self.page = self.context.new_page()
        self.page.set_default_timeout(5000)

    def tearDown(self):
        self.context.close()

    def open(self,path):
        self.page.goto(self.url+path,wait_until='load')
        self.page.wait_for_function('!!window.chStory')
        self.page.evaluate('document.fonts.ready')
        self.page.wait_for_timeout(500)

    def assert_paper_owned(self):
        state = self.page.locator('#'+PAPER).evaluate('''el=>{
            const f=chStory.current(),h=el.querySelector('h3'),r=h.getBoundingClientRect();
            return {title:h.textContent,sceneContains:!!f.scene?.contains(el),
                owner:f.els[0].id,hidden:!!el.closest('[inert]'),
                visibility:getComputedStyle(h).visibility,top:r.top,bottom:r.bottom,
                header:document.querySelector('#hdr').getBoundingClientRect().bottom,
                height:innerHeight,y:scrollY,stop:f.y};
        }''')
        self.assertEqual(state['title'],PAPER_TITLE)
        self.assertEqual(state['owner'],'papers-feedback',state)
        self.assertTrue(state['sceneContains'],state)
        self.assertFalse(state['hidden'],state)
        self.assertEqual(state['visibility'],'visible',state)
        self.assertGreater(state['bottom'],state['header'],state)
        self.assertLess(state['top'],state['height'],state)
        self.assertAlmostEqual(state['y'],state['stop'],delta=2,msg=str(state))

    def test_later_research_article_direct_link_selects_its_scene(self):
        for width,height in ((390,844),(1280,720)):
            for motion in ('reduce','no-preference'):
                with self.subTest(viewport=(width,height),motion=motion):
                    self.page.set_viewport_size({'width':width,'height':height})
                    self.page.emulate_media(reduced_motion=motion)
                    self.page.goto('about:blank')
                    self.open('research.html#'+PAPER)
                    self.assertEqual(self.page.evaluate('location.hash'),'#'+PAPER)
                    self.assert_paper_owned()

    def test_native_fragment_change_reaches_later_article(self):
        self.open('research.html')
        # This is native same-document fragment navigation. Do not scroll a
        # hidden locator into view or change its visibility to make it pass.
        self.page.evaluate('id=>{location.hash=id}',PAPER)
        self.page.wait_for_timeout(500)
        self.assert_paper_owned()

    def test_resize_retains_the_article_across_phone_and_desktop_groups(self):
        self.open('research.html#'+PAPER)
        self.assert_paper_owned()
        # The selected paper is the second article in a desktop group, but is
        # its own phone scene. Ordinal stop preservation would substitute a peer.
        for width,height in ((1280,720),(390,844),(1280,720),(390,844)):
            with self.subTest(viewport=(width,height)):
                self.page.set_viewport_size({'width':width,'height':height})
                self.page.wait_for_timeout(500)
                self.assert_paper_owned()

    def test_focused_lesson_tool_survives_short_and_tall_phone_scene_changes(self):
        self.page.set_viewport_size({'width':375,'height':667})
        self.open('education.html')
        self.page.keyboard.press('PageDown')
        self.page.wait_for_timeout(250)
        search=self.page.locator('#lesson-q')
        search.click()
        search.fill('electricity')
        for width,height in ((390,844),(375,667),(390,844),(375,667)):
            with self.subTest(viewport=(width,height)):
                self.page.set_viewport_size({'width':width,'height':height})
                self.page.wait_for_timeout(450)
                state=search.evaluate("""el=>{
                    const frame=chStory.current(),r=el.getBoundingClientRect();
                    return {focused:el===document.activeElement,inert:!!el.closest('[inert]'),
                        owner:frame.els[0].id,sceneContains:!!frame.scene?.contains(el),
                        visibility:getComputedStyle(el).visibility,value:el.value,
                        top:r.top,bottom:r.bottom,header:document.querySelector('#hdr').getBoundingClientRect().bottom,
                        y:scrollY,stop:frame.y};
                }""")
                self.assertTrue(state['focused'],state)
                self.assertFalse(state['inert'],state)
                self.assertEqual(state['owner'],'library',state)
                self.assertEqual(state['visibility'],'visible',state)
                self.assertEqual(state['value'],'electricity',state)
                self.assertGreaterEqual(state['top'],state['header']-1,state)
                self.assertLessEqual(state['bottom'],height+1,state)
                self.assertAlmostEqual(state['y'],state['stop'],delta=2,msg=str(state))
                if height==667:
                    self.assertTrue(state['sceneContains'],state)

    def test_all_lesson_titles_link_to_their_verified_pdf(self):
        self.open('education.html#lesson-q')
        expected=json.loads((PROJECT/'src/content/lesson-links.json').read_text(encoding='utf-8'))
        links=self.page.locator('#lessons li b a')
        self.assertEqual(links.count(),35)
        self.assertEqual(len(expected),35)
        found={}
        for link in links.all():
            title=link.text_content().strip()
            found[title]=link.get_attribute('href')
            self.assertEqual(link.get_attribute('aria-label'),'Open PDF: '+title)
            self.assertEqual(link.get_attribute('target'),'_blank')
            self.assertEqual(set(link.get_attribute('rel').split()),{'noopener','noreferrer'})
            self.assertTrue(found[title].startswith('https://environmentaldashboard.org/'))
            self.assertTrue(found[title].endswith('.pdf'))
        self.assertEqual(found,expected)

    def test_page_down_moves_focus_out_of_a_newly_hidden_article(self):
        self.open('research.html#'+PAPER)
        paper = self.page.locator('#'+PAPER)
        paper.locator('a').evaluate('el=>el.focus({preventScroll:true})')
        self.assertTrue(paper.evaluate('el=>el.contains(document.activeElement)'))
        for _ in range(self.page.evaluate('chStory.frames().length')):
            self.page.keyboard.press('PageDown')
            self.page.wait_for_timeout(100)
            if not paper.evaluate('el=>!!chStory.current().scene?.contains(el)'):
                break
        state = paper.evaluate('''el=>({hidden:!!el.closest('[inert]'),
            oldFocus:el.contains(document.activeElement),
            activeVisible:getComputedStyle(document.activeElement).visibility,
            activeInert:!!document.activeElement.closest('[inert]'),
            newFocus:!!chStory.current().scene?.contains(document.activeElement)})''')
        self.assertTrue(state['hidden'],state)
        self.assertFalse(state['oldFocus'],state)
        self.assertTrue(state['newFocus'],state)
        self.assertEqual(state['activeVisible'],'visible',state)
        self.assertFalse(state['activeInert'],state)
        self.page.keyboard.press('Tab')
        self.assertTrue(self.page.evaluate('''getComputedStyle(document.activeElement).visibility==='visible' &&
            !document.activeElement.closest('[inert]')'''))

    def test_desktop_contents_keeps_native_panel_scroll_and_keyboard_navigation(self):
        # A short window makes the real chapter list scroll naturally.
        self.page.set_viewport_size({'width':1280,'height':300})
        self.open('data-dashboard.html#orbs')
        trigger = self.page.locator('[data-page-contents] > summary')
        trigger.evaluate('el=>el.focus({preventScroll:true})')
        self.page.keyboard.press('Enter')
        self.assertTrue(self.page.locator('[data-page-contents]').evaluate('el=>el.open'))
        panel = self.page.locator('.page-contents-panel')
        self.assertTrue(panel.evaluate('el=>el.scrollHeight>el.clientHeight'))
        y = self.page.evaluate('scrollY')
        box = panel.bounding_box()
        self.page.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2)
        self.page.mouse.wheel(0,500)
        self.page.wait_for_timeout(200)
        self.assertGreater(panel.evaluate('el=>el.scrollTop'),0)
        self.assertAlmostEqual(self.page.evaluate('scrollY'),y,delta=1)
        self.page.mouse.wheel(0,500)
        self.page.wait_for_timeout(200)
        self.assertAlmostEqual(self.page.evaluate('scrollY'),y,delta=1)
        self.page.keyboard.press('Escape')
        self.assertFalse(self.page.locator('[data-page-contents]').evaluate('el=>el.open'))
        self.assertTrue(trigger.evaluate('el=>el===document.activeElement'))
        self.assertAlmostEqual(self.page.evaluate('scrollY'),y,delta=1)
        self.page.keyboard.press('Enter')
        self.page.keyboard.press('Tab')
        self.assertEqual(self.page.evaluate('document.activeElement.getAttribute("href")'),'#building')
        for _ in range(3):
            self.page.keyboard.press('Tab')
        self.assertEqual(self.page.evaluate('document.activeElement.getAttribute("href")'),'#eco')
        self.assertAlmostEqual(self.page.evaluate('scrollY'),y,delta=1)
        self.page.keyboard.press('Enter')
        self.page.wait_for_timeout(200)
        self.assertFalse(self.page.locator('[data-page-contents]').evaluate('el=>el.open'))
        self.assertEqual(self.page.evaluate('location.hash'),'#eco')
        self.assertEqual(self.page.evaluate('chStory.current().els[0].id'),'eco')

    def test_phone_contents_uses_existing_menu_and_preserves_background_position(self):
        self.open('data-dashboard.html#orbs')
        y = self.page.evaluate('scrollY')
        self.assertFalse(self.page.locator('[data-page-contents]').is_visible())
        opener = self.page.locator('.menu-btn')
        opener.evaluate('el=>el.focus({preventScroll:true})')
        self.page.keyboard.press('Enter')
        menu = self.page.locator('#mnav')
        self.assertTrue(menu.is_visible())
        chapters = menu.locator('.mobile-contents a')
        self.assertGreater(chapters.count(),3)
        box = menu.bounding_box()
        self.page.mouse.move(box['x']+box['width']/2,min(500,box['y']+box['height']/2))
        self.page.mouse.wheel(0,350)
        self.page.wait_for_timeout(200)
        self.assertGreater(menu.evaluate('el=>el.scrollTop'),0)
        self.assertAlmostEqual(self.page.evaluate('scrollY'),y,delta=1)
        self.page.keyboard.press('Escape')
        self.assertTrue(menu.is_hidden())
        self.assertTrue(opener.evaluate('el=>el===document.activeElement'))
        self.page.keyboard.press('Enter')
        for _ in range(menu.locator('a,button').count()+1):
            if self.page.evaluate('document.activeElement.matches(".mobile-contents a[href=\\"#eco\\"]")'):
                break
            self.page.keyboard.press('Tab')
        self.assertTrue(self.page.evaluate('document.activeElement.matches(".mobile-contents a[href=\\"#eco\\"]")'))
        self.assertAlmostEqual(self.page.evaluate('scrollY'),y,delta=1)
        self.page.keyboard.press('Enter')
        self.page.wait_for_timeout(200)
        self.assertTrue(menu.is_hidden())
        self.assertEqual(self.page.evaluate('location.hash'),'#eco')
        self.assertEqual(self.page.evaluate('chStory.current().els[0].id'),'eco')


if __name__ == '__main__':
    unittest.main()
