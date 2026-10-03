"""Meeting regressions: user input, session isolation, categories and staged data flow."""
import unittest
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
from _support import LocalSite

class OctoberFixTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.site=LocalSite();cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
 @classmethod
 def tearDownClass(cls):
  cls.browser.close();cls.pw.stop();cls.site.close()
 def setUp(self):
  self.ctx=self.browser.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce')
  self.ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(self.site.url) else r.abort())
  self.p=self.ctx.new_page();self.p.set_default_timeout(8000)
 def tearDown(self):self.ctx.close()
 def open(self,path=''):
  self.p.goto(self.site.url+path,wait_until='domcontentloaded');self.p.wait_for_timeout(500)
 def panel(self,name):
  el=self.p.locator(f'[data-eng-panel][aria-label="{name}"] .eng-media');el.evaluate("e=>e.scrollIntoView({block:'center'})");self.p.wait_for_timeout(400);return el
 def test_harkness_inner_scroll_then_fresh_gesture_handoff(self):
  self.open();panel=self.panel('Building Dashboard');box=panel.locator('.native-scroll');rect=box.bounding_box();self.p.mouse.move(rect['x']+rect['width']/2,rect['y']+100)
  y=self.p.evaluate('scrollY');self.p.mouse.wheel(0,200);self.p.wait_for_timeout(250)
  self.assertGreater(box.evaluate('e=>e.scrollTop'),100);self.assertAlmostEqual(self.p.evaluate('scrollY'),y,delta=2)
  box.evaluate('e=>e.scrollTop=e.scrollHeight');self.p.wait_for_timeout(600);self.p.mouse.wheel(0,200);self.p.wait_for_timeout(300)
  self.assertGreater(self.p.evaluate('scrollY'),y+100)
 def test_story_pair_uses_same_private_session_and_switches_single_context(self):
  self.open('stories.html#play');pair=self.p.locator('.native-story-pair');self.p.wait_for_timeout(500)
  frames=pair.locator('iframe');self.assertEqual(frames.count(),2)
  urls=[parse_qs(urlparse(x).query) for x in frames.evaluate_all('fs=>fs.map(f=>f.src)')]
  self.assertEqual(urls[0]['webSesssionId'],urls[1]['webSesssionId']);first=urls[0]['webSesssionId']
  self.p.get_by_role('button',name='Great Lakes Science Center',exact=True).click()
  self.assertEqual(self.p.locator('.native-story-pair').count(),1)
  src=self.p.locator('.native-story-screen').get_attribute('src');self.assertEqual(parse_qs(urlparse(src).query)['displayId'],['112']);self.assertNotEqual(parse_qs(urlparse(src).query)['webSesssionId'],first)
 def test_phone_demo_keyboard_selection_changes_screen(self):
  self.open('phone-app.html#controller');scan=self.p.locator('[data-phone-scan]');scan.focus();self.p.keyboard.press('Enter')
  choice=self.p.locator('[data-phone-channel=heating]');self.assertTrue(choice.evaluate('(el) => document.activeElement === el'));self.p.keyboard.press('Enter')
  self.assertIn('art-geothermal-band.jpg',self.p.locator('[data-phone-screen]').get_attribute('src'))
  self.assertEqual(choice.get_attribute('aria-pressed'),'true')
  recorded=self.p.locator('[data-phone-channel=ajlc]');recorded.focus();self.p.keyboard.press('Enter')
  self.assertIn('ajlc-electricity-recorded.png',self.p.locator('[data-phone-screen]').get_attribute('src'))
  self.assertIn('not current readings',self.p.locator('[data-phone-caption]').inner_text())
  self.assertEqual(choice.get_attribute('aria-pressed'),'false');self.assertEqual(recorded.get_attribute('aria-pressed'),'true')
  self.p.locator('[data-phone-reset]').click();self.assertTrue(scan.is_visible())
  self.assertTrue(scan.evaluate('(el) => document.activeElement === el'))
 def test_diagram_reveals_matching_outputs_and_phone_scrolls(self):
  self.open('products.html#how');root=self.p.locator('[data-hub-flow]');root.locator('[data-hf-next]').click()
  self.assertEqual(root.get_attribute('data-step'),'1');root.locator('[data-hf-next]').click();root.locator('[data-hf-next]').click()
  apps=root.locator('.hf-apps li.is-on');self.assertEqual(apps.count(),2);self.assertIn('Hub Analytics',apps.all_text_contents())
  self.ctx.close();self.ctx=self.browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');self.p=self.ctx.new_page();self.open('products.html#how')
  grid=self.p.locator('.hf-grid');rect=grid.bounding_box();self.p.mouse.move(rect['x']+80,rect['y']+80);y=self.p.evaluate('scrollY');self.p.mouse.wheel(0,320);self.p.wait_for_timeout(250)
  self.assertGreater(grid.evaluate('e=>e.scrollTop'),0);self.assertAlmostEqual(self.p.evaluate('scrollY'),y,delta=2)
if __name__=='__main__':unittest.main()
