"""Presentation must not obscure gallery actions or move story destinations."""
import unittest
from playwright.sync_api import sync_playwright
from _support import LocalSite


class AestheticControlTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.site = LocalSite()
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.site.close()

    def page(self, width, height, motion='reduce'):
        context = self.browser.new_context(viewport={'width': width, 'height': height},
                                          reduced_motion=motion)
        self.addCleanup(context.close)
        context.route('**/*', lambda r: r.continue_() if r.request.url.startswith(self.site.url)
                      and r.request.resource_type != 'media' else r.abort())
        return context.new_page()

    def test_gallery_controls_have_clear_hit_targets_and_change_slide(self):
        for width, height in ((1280,720),(390,844),(375,667)):
            with self.subTest(viewport=(width,height)):
                page = self.page(width,height)
                page.goto(self.site.url+'#engage')
                page.evaluate('document.fonts.ready')
                page.wait_for_timeout(500)
                player=page.locator('#engage .story-player').first
                # Short phones put the complete media stage after its prose.
                next_button=player.locator('[data-sp-next]')
                if next_button.bounding_box()['y'] + 44 > height:
                    page.mouse.move(width-12,height//2)
                    page.mouse.wheel(0,100)
                    page.wait_for_timeout(600)
                buttons=player.locator('.sp-bar .sp-nav:visible')
                self.assertGreaterEqual(buttons.count(),2)
                for button in buttons.all():
                    self.assertTrue(button.evaluate('''el=>{
                        const r=el.getBoundingClientRect();
                        return r.top>=0 && r.bottom<=innerHeight &&
                          el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
                    }'''))
                for selector, label in [('[data-sp-prev]', 'Previous slide'), ('[data-sp-next]', 'Next slide')]:
                    control=player.locator(selector)
                    self.assertEqual(control.get_attribute('aria-label'), label)
                    self.assertEqual(control.locator('svg').count(), 1)
                    self.assertEqual(control.text_content().strip(), '')
                count=player.locator('.sp-count')
                self.assertTrue(count.evaluate('''el=>{
                    const r=el.getBoundingClientRect();
                    return r.width<=1 && r.height<=1 && getComputedStyle(el).clipPath!=='none';
                }'''))
                before=count.text_content()
                before_image=player.locator('[data-sp]:not([hidden]) img').get_attribute('src')
                next_button.click()
                self.assertNotEqual(count.text_content(),before)
                self.assertEqual(player.locator('[data-sp]:not([hidden])').count(),1)
                self.assertNotEqual(player.locator('[data-sp]:not([hidden]) img').get_attribute('src'),before_image)

    def test_explore_works_without_video_in_both_motion_modes(self):
        for motion in ('reduce','no-preference'):
            for width,height in ((1280,720),(375,667)):
                with self.subTest(motion=motion,viewport=(width,height)):
                    page=self.page(width,height,motion)
                    page.goto(self.site.url)
                    page.evaluate('document.fonts.ready')
                    page.wait_for_timeout(1200)
                    button=page.get_by_role('button',name='Explore Community Hub',exact=True)
                    button.click()
                    page.wait_for_timeout(200)
                    self.assertTrue(page.evaluate("chStory.current().els[0] === document.querySelector('.hv')"))
                    self.assertEqual(page.locator('.hv > #people:not([hidden])').count(),1)
                    self.assertEqual(page.locator('#main > #people').count(),0)
                    film, people=page.locator('.hv-film').bounding_box(),page.locator('#people').bounding_box()
                    self.assertAlmostEqual(film['y']+film['height'],people['y'],delta=2)
                    self.assertLess(film['height'],height/2)
                    self.assertEqual(page.evaluate('document.documentElement.scrollWidth-innerWidth'),0)

if __name__ == '__main__':
    unittest.main()
