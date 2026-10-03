"""Manual chart selection and non-obscuring explanations, using real adapter/CSS.

The response here is deterministic synthetic data, never evidence of live service
availability. test_dashboard_live_views.py retains opt-in production-data checks.
"""
import json
import unittest
from playwright.sync_api import sync_playwright
from _support import LocalSite
from _data_views_fixture import open_chart_fixture


class ManualDataViewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.site=LocalSite()
        cls.pw=sync_playwright().start()
        cls.browser=cls.pw.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.site.close()

    def setUp(self):
        self.context=self.browser.new_context(viewport={'width':1280,'height':900},reduced_motion='no-preference')
        self.addCleanup(self.context.close)
        data={'data':[{'data':[
            {'timestamp':f'2026-10-01T{hour:02}:00:00Z','storageValue':100+hour,
             'typicalValue':110,'binPosition':hour%5+1} for hour in range(24)]}],
             'bins':[100,105,110,115,120]}
        def route(request):
            if '/visualizations/' in request.request.url:
                request.fulfill(status=200,content_type='application/json',
                    headers={'Access-Control-Allow-Origin':'*'},body=json.dumps(data))
            elif request.request.url.startswith(self.site.url):
                request.continue_()
            else:
                request.abort()
        self.context.route('**/*',route)
        self.page=self.context.new_page()
        self.page.clock.install()
        open_chart_fixture(self.page,self.site.url)
        self.page.locator('#dvp-heat svg').wait_for()

    def test_chart_choice_never_changes_on_a_timer_and_keyboard_still_selects(self):
        self.page.locator('#dvt-load').click()
        self.page.locator('#dvp-load svg').wait_for()
        self.assertIn('Now 123 kW',self.page.locator('#dvp-load svg').text_content())
        self.page.evaluate('document.activeElement.blur()')
        self.page.mouse.move(1200,850)
        self.page.clock.run_for(60000)
        self.assertEqual(self.page.locator('#dvt-load').get_attribute('aria-selected'),'true')
        self.assertEqual(self.page.locator('.dv-view.is-on').get_attribute('id'),'dvp-load')
        self.assertTrue(self.page.locator('#dvp-load .dv-note').is_hidden())
        self.page.locator('#dvt-load').focus()
        self.page.keyboard.press('ArrowLeft')
        self.assertEqual(self.page.locator('#dvt-heat').get_attribute('aria-selected'),'true')
        self.assertTrue(self.page.locator('#dvt-heat').evaluate('el=>el===document.activeElement'))
        self.page.clock.run_for(60000)
        self.assertEqual(self.page.locator('#dvt-heat').get_attribute('aria-selected'),'true')
        self.page.keyboard.press('ArrowRight')
        self.assertEqual(self.page.locator('#dvt-load').get_attribute('aria-selected'),'true')
        self.assertEqual(self.page.locator('[role=tab][aria-selected=true]').count(),1)

    def test_open_explanation_stays_below_chart_and_preserves_values_and_links(self):
        self.page.locator('#dvt-load').click()
        self.page.locator('#dvp-load svg').wait_for()
        view=self.page.locator('#dvp-load')
        chart,note,help_button=view.locator('.dv-chart'),view.locator('.dv-note'),view.locator('[data-dv-help]')
        before=chart.locator('svg').evaluate('el=>el.outerHTML')
        help_button.click()
        self.assertTrue(note.is_visible())
        self.assertFalse(note.evaluate('el=>!!el.closest(".dv-frame")'))
        self.assertEqual(help_button.get_attribute('aria-expanded'),'true')
        self.assertTrue(chart.is_visible())
        self.assertFalse(chart.evaluate('el=>el.inert'))
        self.assertGreaterEqual(note.bounding_box()['y'],chart.bounding_box()['y']+chart.bounding_box()['height']-1)
        view.locator('.dv-cap a').focus()
        self.assertTrue(view.locator('.dv-cap a').evaluate('el=>el===document.activeElement'))
        self.page.clock.run_for(60000)
        self.assertTrue(note.is_visible())
        self.assertEqual(chart.locator('svg').evaluate('el=>el.outerHTML'),before)
        help_button.click()
        self.assertTrue(note.is_hidden())
        self.assertEqual(help_button.get_attribute('aria-expanded'),'false')
        self.assertTrue(chart.is_visible())
        self.assertFalse(chart.evaluate('el=>el.inert'))
        help_button.click()
        self.assertTrue(note.is_visible())


if __name__=='__main__':
    unittest.main()
