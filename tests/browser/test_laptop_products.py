"""Desktop product rails stay within one section and expose all five cards."""

import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright


SOURCE = Path(__file__).resolve().parents[1] / "runtime"
FIXTURE = """<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
#hdr { position: sticky; top: 0; height: 77px; z-index: 2; background: white; }
.foot { height: 400px; }
</style></head><body>
<header id="hdr">Community Hub</header>
<main id="main">
<section class="hv intro-peek"><h1>Community Hub</h1></section>
<section class="six"><div class="wrap">
<h2 class="h2">Our five products and what they can do for you</h2>
<p class="sec-p">Everything below is live, loading right now from Oberlin, Ohio.</p>
<div class="pc-grid story-rail" data-story-rail role="region" aria-label="Products" tabindex="0">
PRODUCT_CARDS
</div></div></section>
<section><div class="wrap">
<div class="pp-row story-rail" data-story-rail role="region" aria-label="People" tabindex="0">
<article>First person</article><article>Second person</article><article>Third person</article>
</div></div></section>
</main><footer class="foot">Contact</footer>
</body></html>"""


def product_cards():
    names = ["Data Dashboard", "Data Hub",
             "Calendar and Jobs Board", "Community Voices", "Stories"]
    cards = []
    for index, name in enumerate(names):
        if index == 1:
            preview = '<div class="gauges">' + ''.join(
                '<img width="290" height="190" alt="Live community gauge">'
                for _ in range(3)) + '</div>'
        else:
            preview = ('<div class="mini" data-w="1280" style="--w:1280;--h:720">'
                       '<iframe title="Product preview" width="1280" height="720" '
                       'srcdoc="<p>Live product preview</p>"></iframe></div>')
        cards.append(
            '<article class="pc"><div class="pc-h">'
            '<img width="44" height="44" alt="">'
            f'<div><h4>{name}</h4><p>Community Hub product</p></div></div>'
            f'<div class="pc-live">{preview}'
            '<p class="mini-cap">Live product preview. '
            '<a href="#details">Open full size</a></p></div>'
            '<a class="pc-a" href="#details">Explore the product</a></article>'
        )
    return ''.join(cards)


class LaptopProductTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)
        cls.script = (SOURCE / "pages_home6.js").read_text()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = self.browser.new_context(
            viewport={"width": 1366, "height": 768}, reduced_motion="reduce")
        self.page = self.context.new_page()
        self.page.set_content(FIXTURE.replace("PRODUCT_CARDS", product_cards()))
        self.page.add_style_tag(path=str(SOURCE / "base.css"))
        self.page.add_style_tag(path=str(SOURCE / "pages_home6.css"))
        self.page.add_script_tag(content=self.script)
        self.rail = self.page.get_by_role("region", name="Products", exact=True)
        self.nav = self.page.get_by_role("group", name="Products navigation")
        self.page.wait_for_timeout(100)

    def tearDown(self):
        self.context.close()

    def reveal_products(self):
        self.page.evaluate("""() => {
          const section = document.querySelector('.six');
          const stop = chStory.frames().find(frame => frame.els.includes(section));
          scrollTo({top: stop.y, behavior: 'instant'});
        }""")
        self.page.wait_for_timeout(80)

    def test_responsive_products_remain_one_horizontal_row(self):
        for width, height, visible in [(1440, 900, 3), (1366, 768, 3),
                                       (1280, 720, 3), (1024, 768, 2),
                                       (1024, 720, 2), (390, 844, 1)]:
            with self.subTest(width=width):
                self.page.set_viewport_size({"width": width, "height": height})
                self.page.wait_for_timeout(80)
                geometry = self.rail.evaluate("""rail => {
                  const cards = [...rail.children].map(card => card.getBoundingClientRect());
                  const bounds = rail.getBoundingClientRect();
                  return {tops: cards.map(card => card.top),
                    visible: cards.filter(card => card.right <= bounds.right + 1 &&
                      card.left >= bounds.left - 1).length,
                    overflow: rail.scrollWidth - rail.clientWidth};
                }""")
                self.assertLess(max(geometry["tops"]) - min(geometry["tops"]), 1)
                self.assertEqual(geometry["visible"], visible)
                self.assertGreater(geometry["overflow"], 100)

    def test_laptop_product_content_fits_one_section_stop(self):
        for width, height in [(1440, 900), (1366, 768), (1280, 720),
                              (1024, 768), (1024, 720)]:
            with self.subTest(width=width):
                self.page.set_viewport_size({"width": width, "height": height})
                self.page.wait_for_timeout(80)
                dimensions = self.page.locator('.six').evaluate("""section => ({
                  sectionHeight: section.offsetHeight,
                  available: innerHeight - document.querySelector('#hdr').offsetHeight,
                  stops: chStory.frames().filter(frame => frame.els.includes(section)).length
                })""")
                self.assertLessEqual(dimensions["sectionHeight"], dimensions["available"] + 1)
                self.assertEqual(dimensions["stops"], 1)

    def test_desktop_arrows_reach_last_product_and_stop(self):
        self.reveal_products()
        previous = self.nav.get_by_role("button", name="Previous: Products")
        next_button = self.nav.get_by_role("button", name="Next: Products")
        self.assertTrue(self.nav.is_visible())
        self.assertTrue(previous.is_disabled())
        self.assertIn("3", self.nav.locator('.story-rail-count').inner_text())
        for _ in range(6):
            if next_button.is_disabled():
                break
            next_button.click()
            self.page.wait_for_timeout(80)
        self.assertTrue(next_button.is_disabled())
        self.assertFalse(previous.is_disabled())
        self.assertLessEqual(self.rail.evaluate(
            'rail => rail.scrollWidth - rail.clientWidth - rail.scrollLeft'), 2)
        previous.click()
        self.page.wait_for_timeout(80)
        self.assertFalse(next_button.is_disabled())

    def test_horizontal_wheel_over_preview_keeps_vertical_section(self):
        self.reveal_products()
        initial_y = self.page.evaluate('scrollY')
        preview = self.rail.locator('.mini').first
        preview.hover()
        self.page.mouse.wheel(450, 0)
        self.page.wait_for_timeout(600)
        self.assertGreater(self.rail.evaluate('rail => rail.scrollLeft'), 100)
        self.assertAlmostEqual(self.page.evaluate('scrollY'), initial_y, delta=2)
        self.assertEqual(self.rail.locator('iframe').first.evaluate(
            'frame => getComputedStyle(frame).pointerEvents'), 'none')

    def test_keyboard_browses_desktop_products(self):
        self.reveal_products()
        self.rail.focus()
        self.page.keyboard.press('ArrowRight')
        self.page.wait_for_timeout(80)
        self.assertGreater(self.rail.evaluate('rail => rail.scrollLeft'), 100)
        self.page.keyboard.press('ArrowLeft')
        self.page.wait_for_timeout(80)
        self.assertAlmostEqual(self.rail.evaluate('rail => rail.scrollLeft'), 0, delta=2)

    def test_other_desktop_sections_keep_grid_navigation_hidden(self):
        self.assertFalse(self.page.get_by_role('group', name='People navigation').is_visible())
        self.page.set_viewport_size({'width': 390, 'height': 844})
        self.page.wait_for_timeout(80)
        self.assertTrue(self.page.get_by_role('group', name='People navigation').is_visible())


if __name__ == '__main__':
    unittest.main()
