"""Section identity survives layout changes and navigation never selects empty UI."""

import unittest

from playwright.sync_api import sync_playwright

from test_story_scroll import FIXTURE, SOURCE


class ControllerIsolationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = self.browser.new_context(viewport={"width": 1200, "height": 800})
        self.page = self.context.new_page()
        self.page.set_content(FIXTURE)
        self.page.add_script_tag(content=SOURCE.read_text())
        self.page.wait_for_timeout(80)

    def tearDown(self):
        self.context.close()

    def settle(self):
        self.page.wait_for_function("!document.documentElement.classList.contains('ch-moving')")
        self.page.wait_for_timeout(80)

    def test_inflight_reflow_preserves_destination_section(self):
        self.page.evaluate("chStory.go(1)")
        self.page.wait_for_timeout(100)
        self.page.locator('.hv').evaluate("el => el.style.height = '1440px'")
        self.settle()
        self.assertAlmostEqual(self.page.locator('#one').bounding_box()['y'], 80, delta=3)

    def test_resize_finishes_at_intended_section(self):
        self.page.evaluate("chStory.go(1)")
        self.page.wait_for_timeout(100)
        self.page.set_viewport_size({"width": 1000, "height": 800})
        self.settle()
        self.assertAlmostEqual(self.page.locator('#one').bounding_box()['y'], 80, delta=3)

    def test_pending_growth_does_not_consume_forward_navigation_on_current_scene(self):
        self.page.evaluate('chStory.go(1, true)')
        self.settle()
        self.assertEqual(self.page.evaluate('chStory.current().els[0].id'), 'one')
        self.page.evaluate('''() => {
            document.querySelector('.hv').style.height = '900px';
            dispatchEvent(new Event('resize'));
            // Navigation lands before the scheduled layout animation frame.
            chStory.go(1, true);
        }''')
        self.settle()
        self.assertEqual(self.page.evaluate('chStory.current().els[0].id'), 'two')
        self.assertAlmostEqual(self.page.locator('#two').bounding_box()['y'], 80, delta=3)

    def test_pending_shrink_does_not_consume_reverse_navigation_on_current_scene(self):
        self.page.evaluate('scrollTo({top:1440, behavior:"instant"})')
        self.settle()
        self.assertEqual(self.page.evaluate('chStory.current().els[0].id'), 'two')
        self.page.evaluate('''() => {
            document.querySelector('.hv').style.height = '540px';
            dispatchEvent(new Event('resize'));
            chStory.go(-1, true);
        }''')
        self.settle()
        self.assertEqual(self.page.evaluate('chStory.current().els[0].id'), 'one')
        self.assertAlmostEqual(self.page.locator('#one').bounding_box()['y'], 80, delta=3)

    def test_fit_anchor_does_not_override_newer_navigation(self):
        self.page.evaluate("""() => {
            const anchor = chStory.current();
            dispatchEvent(new CustomEvent('ch:fit', {detail: {anchor}}));
            scrollTo({top: 1440, behavior: 'instant'});
        }""")
        self.settle()
        self.assertAlmostEqual(self.page.evaluate('scrollY'), 1440, delta=3)

    def test_hash_link_uses_owning_section_not_previous_numeric_stop(self):
        self.page.emulate_media(reduced_motion='reduce')
        self.page.locator('.hv').evaluate("""el => {
            el.insertAdjacentHTML('beforeend', '<a href="#deep">Details</a>');
        }""")
        self.page.locator('#two').evaluate("""el => {
            el.style.height = '1500px';
            el.innerHTML = '<div style="height:1000px"></div><h2 id="deep">Deep detail</h2>';
        }""")
        self.page.wait_for_timeout(80)
        self.page.get_by_role('link', name='Details').click()
        self.settle()
        heading = self.page.locator('#deep').bounding_box()
        self.assertGreaterEqual(heading['y'], 79)
        self.assertLessEqual(heading['y'] + heading['height'], 801)

    def test_footer_uses_header_offset_after_jump_bar_leaves_main(self):
        self.page.goto('about:blank')
        self.page.set_content(FIXTURE.replace('<main id="main">', '<main id="main" data-pager>')
                              .replace('class="hv intro-peek"', 'class="page-hero"')
                              .replace('<section id="one">', '<nav data-zpa-jump style="height:40px">Jump</nav><section id="one">')
                              .replace('.foot { height: 400px; }', '.foot { height: 900px; }'))
        self.page.add_script_tag(content=SOURCE.read_text())
        self.page.wait_for_timeout(80)
        first_footer = self.page.evaluate("chStory.frames().find(f => f.els[0].classList.contains('foot')).y")
        self.page.evaluate('y => scrollTo(0, y)', first_footer)
        self.assertAlmostEqual(self.page.locator('.foot').bounding_box()['y'], 80, delta=3)


if __name__ == '__main__':
    unittest.main()
