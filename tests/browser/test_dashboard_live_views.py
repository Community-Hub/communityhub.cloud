"""Review task 6: a live preview and its full-size link describe the same data.

Set CH_LIVE=1 for the real endpoint/browser checks. API responses are production
data. The retained load-profile component uses a clearly identified DOM fixture
because no current route renders that tab variant; homepage heat coverage uses
the actual page. CH_REVIEW_URL can point at the generated site.
"""

import os
from _support import LocalSite
from _data_views_fixture import open_chart_fixture
import unittest
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import sync_playwright

SITE = Path(__file__).resolve().parents[2] / "dist" / "index.html"


@unittest.skipUnless(os.environ.get("CH_LIVE"), "set CH_LIVE=1 for production data")
class DashboardLiveViewsTest(unittest.TestCase):
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

    def setUp(self):
        self.context = self.browser.new_context(
            viewport={"width": 1280, "height": 720}, reduced_motion="reduce")
        self.addCleanup(self.context.close)
        self.page = self.context.new_page()
        self.base = os.environ.get("CH_REVIEW_URL", self.site.url).rstrip('/') + '/'
        open_chart_fixture(self.page, self.base)

    def test_today_link_uses_the_same_meter_and_window_as_the_preview(self):
        chart = self.page.locator("#dvp-load .dv-chart")
        api_url = chart.get_attribute("data-dv-load")
        response = self.context.request.get(api_url)
        self.assertTrue(response.ok)
        data = response.json()
        variable_id = str(data["data"][0]["id"])
        live_url = self.page.locator("#dvp-load .dv-cap a").get_attribute("href")
        parsed = urlparse(live_url)
        self.assertEqual(parse_qs(parsed.query).get("variableId"), [variable_id])
        self.assertTrue(parsed.path.endswith("/chart-window/today"))

        full = self.context.new_page()
        with full.expect_response(lambda r: (
            f"time-series-by-variable/{variable_id}/chart-window/today" in r.url
        ), timeout=30000) as actual:
            full.goto(live_url, wait_until="domcontentloaded")
        self.assertTrue(actual.value.ok)
        full.get_by_text("SYSTOT Today", exact=False).first.wait_for()

    def test_preview_draws_real_readings_and_help_can_be_reopened(self):
        with self.page.expect_response(lambda r: (
            "/visualizations/time-series/972/chart-window/today" in r.url
        ), timeout=30000) as actual:
            self.page.locator("#dvt-load").click()
        data = actual.value.json()
        points = data["data"][0]["data"]
        latest = [p for p in points if p.get("storageValue") is not None][-1]
        expected = f"Now {round(latest['storageValue']):,} kW"
        self.page.locator("#dvp-load svg").wait_for()
        self.assertIn(expected, self.page.locator("#dvp-load svg").text_content())
        self.assertNotIn("NaN", self.page.locator("#dvp-load svg").evaluate("s => s.outerHTML"))
        self.page.wait_for_function("document.querySelector('#dvp-load').classList.contains('is-read')")
        view = self.page.locator('#dvp-load')
        help_button = view.locator('[data-dv-help]')
        chart, note = view.locator('.dv-chart'), view.locator('.dv-note')
        original_svg = chart.locator('svg').evaluate('el => el.outerHTML')
        for _ in range(2):
            help_button.click()
            self.assertEqual(help_button.get_attribute('aria-expanded'), 'true')
            self.assertTrue(note.is_visible())
            self.assertFalse(note.evaluate('el => !!el.closest(".dv-frame")'))
            self.assertFalse(chart.evaluate('el => el.inert'))
            self.assertEqual(chart.evaluate('el => getComputedStyle(el).visibility'), 'visible')
            self.assertEqual(chart.locator('svg').evaluate('el => el.outerHTML'), original_svg)
            self.assertGreaterEqual(note.bounding_box()['y'], chart.bounding_box()['y'] + chart.bounding_box()['height'] - 1)
            help_button.click()
            self.assertTrue(note.is_hidden())
            self.assertEqual(help_button.get_attribute('aria-expanded'), 'false')
            self.assertTrue(chart.is_visible())
            self.assertFalse(chart.evaluate('el => el.inert'))
        self.page.locator("#dvt-load").focus()
        self.page.keyboard.press("ArrowLeft")
        self.assertEqual(self.page.locator("#dvt-heat").get_attribute("aria-selected"), "true")

    def test_homepage_data_hub_heat_map_uses_real_data_and_keeps_help_below_chart(self):
        self.page.goto(self.base+'index.html#products',wait_until='domcontentloaded')
        self.page.wait_for_function('!!window.chStory')
        with self.page.expect_response(lambda r: '/visualizations/heat-map/969/chart-window/last-60-days' in r.url,
                                       timeout=30000) as actual:
            self.page.locator('#products').get_by_role('tab',name='Data Hub',exact=True).click()
        self.assertTrue(actual.value.ok)
        data=actual.value.json()
        points=[point for point in data['data'][0]['data'] if point.get('storageValue') is not None]
        self.assertTrue(points)
        view=self.page.locator('#products #dvp-heat')
        chart=view.locator('.dv-chart')
        chart.locator('svg').wait_for()
        self.assertEqual(view.get_attribute('role'),'region')
        self.assertIn('Whole city electricity',view.get_attribute('aria-label'))
        self.assertEqual(self.page.locator('#products [data-dv] [role=tab]').count(),0)
        self.assertIn('heat-map/969/chart-window/last-60-days',view.locator('.dv-cap a').get_attribute('href'))
        self.assertGreater(chart.locator('svg rect title').count(),0)
        self.assertNotIn('NaN',chart.locator('svg').evaluate('el=>el.outerHTML'))
        view.locator('[data-dv-help]').click()
        note=view.locator('.dv-note')
        self.assertTrue(chart.is_visible())
        self.assertFalse(chart.evaluate('el=>el.inert'))
        self.assertTrue(note.is_visible())
        self.assertGreaterEqual(note.bounding_box()['y'],chart.bounding_box()['y']+chart.bounding_box()['height']-1)


if __name__ == "__main__":
    unittest.main()
