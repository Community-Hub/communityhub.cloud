"""The mobile navigation owns focus and returns it without scrolling the page."""
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright

RUNTIME = Path(__file__).resolve().parents[1] / 'runtime'
FIXTURE = '''<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
body{margin:0}#hdr{height:76px;position:sticky;top:0;background:white}#main{height:1800px}
#mnav{position:fixed;inset:76px 0 0;background:white;overflow:auto}#mnav[hidden]{display:none}
#mnav a{display:block;padding:18px}.deep{margin-top:600px}.menu-btn{display:block}
</style></head><body><header id="hdr"><a href="#home">Brand</a><button class="menu-btn" aria-expanded="false" aria-controls="mnav"><span class="menu-t">Menu</span></button></header>
<nav id="mnav" hidden><a id="first" href="#home">First destination</a><a id="last" href="#details">Last destination</a></nav>
<main id="main"><a id="home" href="#details">Main Home</a><p class="deep" id="details"><a id="background-link" href="#home">Background link</a></p></main><footer class="foot"><a href="#home">Footer Home</a></footer></body></html>'''

class MobileMenuFocusTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright=sync_playwright().start()
        cls.browser=cls.playwright.chromium.launch(headless=True)
    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
    def setUp(self):
        self.context=self.browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
        self.page=self.context.new_page()
        self.page.set_content(FIXTURE)
        self.page.add_script_tag(path=str(RUNTIME/'base.js'))
        self.page.locator('.menu-btn').click()
    def tearDown(self):
        self.context.close()
    def test_tab_and_shift_tab_never_reach_covered_page(self):
        for key in ['Tab']*9+['Shift+Tab']*9:
            self.page.keyboard.press(key)
            self.assertTrue(self.page.evaluate("document.activeElement.matches('.menu-btn') || !!document.activeElement.closest('#mnav')"))
            self.assertEqual(self.page.evaluate('scrollY'),0)
        self.assertTrue(self.page.locator('#main').evaluate('el=>el.inert'))
    def test_escape_restores_trigger_and_background(self):
        self.page.keyboard.press('Tab')
        self.page.keyboard.press('Escape')
        self.assertTrue(self.page.locator('#mnav').is_hidden())
        self.assertEqual(self.page.evaluate('document.activeElement.className'),'menu-btn')
        self.assertFalse(self.page.locator('#main').evaluate('el=>el.inert'))
        self.assertEqual(self.page.evaluate('document.body.style.overflow'),'')
        self.assertEqual(self.page.evaluate('scrollY'),0)
    def test_selecting_link_closes_menu_and_preserves_hash_navigation(self):
        self.page.locator('#last').click()
        self.assertTrue(self.page.locator('#mnav').is_hidden())
        self.assertFalse(self.page.locator('#main').evaluate('el=>el.inert'))
        self.assertEqual(self.page.evaluate('location.hash'),'#details')
        self.assertFalse(self.page.evaluate("!!document.activeElement.closest('#mnav')"))
    def test_closing_restores_preexisting_inert_and_overflow(self):
        self.page.keyboard.press('Escape')
        self.page.evaluate("document.querySelector('.foot').inert=true; document.body.style.overflow='clip'")
        self.page.locator('.menu-btn').click()
        self.page.keyboard.press('Escape')
        self.assertTrue(self.page.locator('.foot').evaluate('el=>el.inert'))
        self.assertEqual(self.page.evaluate('document.body.style.overflow'),'clip')

if __name__=='__main__': unittest.main()
