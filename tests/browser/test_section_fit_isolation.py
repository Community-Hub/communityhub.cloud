"""Viewport ownership regressions for the shared section fitting layer."""

import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright

SOURCE = Path(__file__).resolve().parents[1] / "runtime"
FIXTURE = """<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
* { box-sizing: border-box; }
html, body { margin: 0; }
:root { --hdr-h: 80px; --story-base-hdr-h: 80px; --story-hdr-h: 130px; --ban-h: 44px; --gut: 24px; }
#hdr { height: 80px; }
.aashe { height: 44px; }
[data-zpa-jump] { height: 50px; }
#main > section, #main > blockquote { display: flex; flex-direction: column; justify-content: center; }
#main > section, #main > blockquote, #main > p { margin: 0; padding: 24px; }
.wrap { width: 100%; }
h1, h2, p { margin: 0; }
h1, h2 { font-size: 24px; }
p, a, footer { font-size: 16px; line-height: 1.5; }
</style></head><body>
<header id="hdr">Header</header><aside class="aashe">Announcement</aside>
<main id="main" data-pager>
<section class="page-hero ch-story-section"><div class="wrap"><h1>Hero</h1></div></section>
<nav data-zpa-jump>Section navigation</nav>
<section id="one" class="ch-story-section"><div class="wrap"><h2>Products</h2><p>One product description.</p></div></section>
<blockquote id="quote" class="ch-story-section"><p>A separate customer quotation.</p><footer>A named customer</footer></blockquote>
<p id="cross" class="ppl-cross ch-story-section">Also working with a campus? See <a href="#one">campuses</a>.</p>
<section id="two" class="ch-story-section"><div class="wrap"><h2>Another section</h2><p>Its own content.</p></div></section>
</main><footer class="foot ch-story-section"><div class="wrap">Footer navigation</div></footer>
</body></html>"""


class SectionFitIsolationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def tearDown(self):
        self.context.close()

    def load(self, width=1200, height=800):
        self.context = self.browser.new_context(viewport={"width": width, "height": height})
        self.page = self.context.new_page()
        self.page.set_content(FIXTURE)
        self.page.add_style_tag(path=str(SOURCE / "pages_zzzz_fit.css"))
        self.page.add_script_tag(path=str(SOURCE / "pages_zzzz_fit.js"))
        self.page.wait_for_timeout(100)

    def height(self, selector):
        return self.page.locator(selector).evaluate("el => el.getBoundingClientRect().height")

    def test_short_quote_and_cross_link_keep_separate_viewports(self):
        self.load()
        for selector in ["#one", "#quote", "#cross", "#two"]:
            self.assertGreaterEqual(self.height(selector), 670)
        self.assertEqual(self.page.locator("[data-pack]").count(), 0)
        self.assertEqual(self.page.locator("#cross a").inner_text(), "campuses")

    def test_phone_short_sections_fill_room_without_shrinking_type(self):
        self.load(width=390, height=844)
        for selector in ["#one", "#quote", "#cross", "#two"]:
            self.assertGreaterEqual(self.height(selector), 714)
        size = self.page.locator("#quote p").evaluate("el => parseFloat(getComputedStyle(el).fontSize)")
        self.assertEqual(size, 16)

    def test_hero_reserves_only_header_and_announcement(self):
        self.load()
        self.assertAlmostEqual(self.height(".page-hero"), 676, delta=1)
        self.assertAlmostEqual(
            self.page.locator("[data-zpa-jump]").bounding_box()["y"], 800, delta=1
        )

    def test_footer_has_room_to_fully_clear_the_previous_section(self):
        self.load()
        self.assertGreaterEqual(self.height(".foot"), 720)

    def test_fit_publishes_the_resting_owner_before_layout_changes(self):
        self.load()
        for width in [1200, 390]:
            self.page.set_viewport_size({"width": width, "height": 800})
            owner = self.page.evaluate("""() => {
                const frame = {y: scrollY, els: [document.querySelector('#quote')], part: 1};
                window.chStory = {current: () => frame};
                let received;
                window.addEventListener('ch:fit', event => received = event.detail.anchor, {once: true});
                window.chFit.run();
                return {same: received === frame, part: received.part};
            }""")
            self.assertEqual(owner, {"same": True, "part": 1})

    def test_long_content_stays_reachable_at_readable_size(self):
        self.load()
        self.page.locator("#two .wrap").evaluate("""el => {
            const p = document.createElement('p');
            p.textContent = 'Readable long-form content. '.repeat(1500);
            el.append(p);
            window.chFit.run();
        }""")
        self.assertGreater(self.height("#two"), 670)
        self.assertGreaterEqual(self.page.locator("#two p").last.evaluate(
            """el => {
                let scale = 1;
                for (let parent = el; parent; parent = parent.parentElement) {
                    scale *= parseFloat(getComputedStyle(parent).zoom) || 1;
                }
                return parseFloat(getComputedStyle(el).fontSize) * scale;
            }"""
        ), 16)
        self.assertEqual(self.page.locator("#two").evaluate("el => getComputedStyle(el).overflowY"), "visible")


if __name__ == "__main__":
    unittest.main()
