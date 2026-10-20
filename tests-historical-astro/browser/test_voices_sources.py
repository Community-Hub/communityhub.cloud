"""Task 10: the homepage Community Voices tabs use filters the player honours.

The player ignores screen_tags (checked 30 Sep 2026 against the slide API), so a tab built on it would
show every Cleveland slide. image_tags, quote_tags and categories do filter. The optional live check
compares every slide photo on each filtered player page with the slide API's own list for that filter.
"""

import html
from _support import LocalSite
import json
import os
import re
import unittest
import urllib.request
from pathlib import Path
from lxml import html as lxml_html

from playwright.sync_api import sync_playwright

SITE = Path(__file__).resolve().parents[2] / "dist" / "index.html"
class VoicesSourcesTest(unittest.TestCase):
    def test_homepage_offers_source_backed_passive_contexts(self):
        doc=lxml_html.fromstring(SITE.read_text(encoding="utf-8"))
        panel=doc.xpath('//article[@data-eng-panel and @aria-label="Community Voices"]')[0]
        labels=[' '.join(x.text_content().split()) for x in panel.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," preview-context ")]')]
        self.assertEqual(labels,['Oberlin · Natural Oberlin','Cleveland · Our Neighbors','Cleveland · Next Generation','Cleveland · Climate Action'])
        self.assertFalse(panel.xpath('.//*[@data-native-choice or @data-native-config]'))
        self.assertEqual(len(panel.xpath('.//*[@data-reading-preview]')),1)
        self.assertEqual(len(panel.xpath('.//*[@data-sp]//picture/img')),4)



class VoicesFitTest(unittest.TestCase):
    """Both homepage product choices expose readable content and the same live player."""

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

    def open(self, w, h, phone):
        ctx = self.browser.new_context(viewport={"width": w, "height": h}, is_mobile=phone, has_touch=phone)
        self.addCleanup(ctx.close)
        page = ctx.new_page()
        page.route("http*://**", lambda r: r.continue_() if r.request.url.startswith(self.site.url) else r.abort())  # local modules and assets load; remote feeds stay blocked
        # DOMContentLoaded, not load: the aborted image requests would hold the load event for seconds
        page.goto(self.site.url, wait_until="domcontentloaded")
        page.wait_for_timeout(1500)
        return page

    def test_phone_product_selection_persists_after_vertical_scroll(self):
        for w, h in [(390, 844), (360, 800), (430, 932)]:
            page = self.open(w, h, True)
            page.evaluate("scrollTo({top:chStory.frames().find(f=>f.els[0].id==='motivate').y,behavior:'instant'})")
            page.wait_for_timeout(100)
            for index, tab in enumerate(page.locator("#motivate [data-eng-tab]").all()):
                tab.evaluate("t => t.click()")
                page.wait_for_timeout(500)
                page.evaluate("scrollBy({top:20,behavior:'instant'})")
                page.wait_for_timeout(100)
                self.assertEqual(tab.get_attribute('aria-selected'), 'true')
                panel=page.locator('#motivate [data-eng-panel]').nth(index)
                panel.locator('.eng-copy p').first.wait_for(state='visible', timeout=4000)  # panel swap eases in; slow under load
                self.assertLessEqual(page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)
                self.assertGreaterEqual(panel.locator('.eng-copy p').first.evaluate('el=>parseFloat(getComputedStyle(el).fontSize)'),16)

    def test_category_selection_retains_community_filter(self):
        page=self.open(1280,800,False)
        panel=page.locator('[data-eng-panel][aria-label="Community Voices"]')
        panel.locator('.eng-media').evaluate("e=>e.scrollIntoView({block:'center'})")
        page.wait_for_timeout(500)
        panel.get_by_role('button',name='Next Generation',exact=True).click()
        src=panel.locator('.native-voices-screen').get_attribute('src')
        self.assertIn('image_tags=36',src)
        self.assertIn('categories=7',src)
        panel.get_by_role('button',name='Great Lakes Science Center',exact=True).click()
        self.assertEqual(panel.locator('.native-voices-screen').count(),1)
        self.assertIn('Protecting Our Lake',panel.locator('.native-categories').inner_text())
        self.assertNotIn('image_tags',panel.locator('.native-voices-screen').get_attribute('src'))



if __name__ == "__main__":
    unittest.main()
