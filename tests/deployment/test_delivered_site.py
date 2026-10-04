"""Smoke checks for the delivered pages, rather than earlier design directions."""
import unittest
from playwright.sync_api import sync_playwright
from _support import LocalSite

class DeliveredSiteTests(unittest.TestCase):
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

    def page(self, width, height):
        context = self.browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce')
        self.addCleanup(context.close)
        context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(self.site.url) else route.abort())
        page = context.new_page()
        page.set_default_timeout(8000)
        return page

    def test_home_explore_and_story_navigation(self):
        for size in [(1280, 720), (390, 844)]:
            with self.subTest(viewport=size):
                page = self.page(*size)
                page.goto(self.site.url)
                page.evaluate('document.fonts.ready')
                self.assertEqual(page.locator('.hv video').count(), 1)
                self.assertTrue(page.get_by_role('heading', level=1).is_visible())
                page.get_by_role('link', name='Explore Community Hub', exact=True).click()
                page.locator('#people').wait_for(state='visible')
                self.assertIn('Grace Gao', page.locator('#people').inner_text())
                page.get_by_role('button', name='Next story', exact=True).click()
                self.assertIn('Kim Koos', page.locator('#people').inner_text())
                self.assertIn('2 / 8', page.locator('#people').inner_text())
                self.assertLessEqual(page.evaluate('document.documentElement.scrollWidth - innerWidth'), 1)

    def test_mobile_menu_reaches_contact_without_submitting(self):
        page = self.page(390, 844)
        page.goto(self.site.url)
        page.get_by_role('button', name='Menu', exact=True).click()
        menu = page.locator('#mnav')
        self.assertTrue(menu.is_visible())
        menu.get_by_role('link', name='Book a demo', exact=True).click()
        page.wait_for_url('**/contact.html')
        self.assertEqual(page.get_by_role('heading', level=1).inner_text(), 'Contact Us')
        self.assertGreater(page.locator('a[href^="mailto:connect@communityhub.cloud"]').count(), 0)

    def test_product_and_dashboard_entry_routes_render(self):
        for route, heading in [('products.html', 'Products'), ('the-hub.html', 'Data Hub'), ('digital-signage.html', 'Digital Signage')]:
            with self.subTest(route=route):
                page = self.page(1280, 720)
                response = page.goto(self.site.url + route)
                self.assertEqual(response.status, 200)
                self.assertIn(heading, page.get_by_role('heading', level=1).inner_text())
                self.assertGreater(page.locator('img').count(), 0)

if __name__ == '__main__':
    unittest.main()
