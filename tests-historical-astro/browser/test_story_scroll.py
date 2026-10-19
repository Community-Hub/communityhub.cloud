"""Browser regressions for the homepage's section navigation.

Run with a Python environment containing Playwright and its Chromium browser:
    python -m unittest discover -s tests/browser -p 'test_story_scroll.py' -v
"""

import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright


SOURCE = Path(__file__).resolve().parents[1] / "runtime" / "pages_home6.js"
# These controller fixtures begin after the opening film has completed. The real
# first-gesture/film/people arrival is covered in test_home_hero.py.
FIXTURE = """<!doctype html><html><head><style>
* { box-sizing: border-box; }
html, body { margin: 0; }
h1, h2 { margin: 0; }
#hdr { position: sticky; top: 0; height: 80px; z-index: 2; }
#main > section { position: relative; height: 720px; }
.foot { height: 400px; }
.scroller { width: 240px; height: 120px; overflow-y: auto; }
.scroller > div { height: 600px; }
#mnav { position: fixed; inset: 80px 0 0; z-index: 3; }
</style></head><body>
<header id="hdr"><button class="menu-btn" aria-expanded="false">Menu</button></header>
<main id="main">
<section class="hv intro-peek"><h1>Hero</h1>
  <div class="scroller" data-scroll-owner tabindex="0"><div>Scrollable content</div></div>
  <div role="slider" tabindex="0" aria-label="Volume" aria-valuenow="50"></div>
  <button id="control">Action</button>
</section>
<section id="one"><h2>First section</h2></section>
<section id="two"><h2>Second section</h2></section>
<section id="three"><h2>Third section</h2></section>
<section id="four"><h2>Fourth section</h2></section>
</main><footer class="foot">Footer</footer><nav id="mnav" hidden>Navigation</nav>
</body></html>"""


class StoryScrollTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.script = SOURCE.read_text()
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
        self.page.add_script_tag(content=self.script)

    def tearDown(self):
        self.context.close()

    def position(self):
        return self.page.evaluate("window.scrollY")

    def wheel(self, delta=60, count=1, interval=20, target="body"):
        self.page.evaluate(
            """async ({delta, count, interval, target}) => {
              const el = document.querySelector(target);
              for (let i = 0; i < count; i++) {
                el.dispatchEvent(new WheelEvent('wheel', {
                  deltaY: delta, bubbles: true, cancelable: true
                }));
                await new Promise(resolve => setTimeout(resolve, interval));
              }
            }""",
            {"delta": delta, "count": count, "interval": interval, "target": target},
        )

    def settled(self):
        self.page.wait_for_timeout(950)

    def assert_position(self, expected):
        self.assertAlmostEqual(self.position(), expected, delta=3)

    def load_home_styles(self, width=1200, height=800):
        self.page.goto("about:blank")
        self.page.set_viewport_size({"width": width, "height": height})
        self.page.set_content(FIXTURE.replace(
            '<main id="main">',
            '<aside class="aashe" style="height:44px">Announcement</aside><main id="main">',
        ))
        self.page.add_style_tag(path=str(SOURCE.parent / "base.css"))
        self.page.add_style_tag(path=str(SOURCE.parent / "pages_home6.css"))
        self.page.add_style_tag(content="#main > section { height: auto; }")
        self.page.locator(".hv").evaluate("""el => {
          el.innerHTML = '<div class="hv-media"><video class="hv-vid"></video></div>' +
            '<div class="hv-copy"><h1 class="hv-h">Community Hub</h1>' +
            '<p class="hv-p">Local connections.</p></div>';
        }""")
        self.page.add_script_tag(content=self.script)
        self.page.wait_for_timeout(100)

    def test_hero_and_banner_share_the_first_screen(self):
        self.load_home_styles()
        self.assertAlmostEqual(self.page.locator("#one").evaluate("el => el.offsetTop"), 800, delta=1)
        self.wheel()
        self.settled()
        self.assert_position(720)

    def test_phone_keeps_visible_media_and_controlled_section_stops(self):
        self.load_home_styles(width=390, height=844)
        media = self.page.locator(".hv-media").bounding_box()
        self.assertAlmostEqual(media["width"], 390, delta=1)
        self.assertAlmostEqual(media["height"], 219.375, delta=1)
        self.assertEqual(self.page.evaluate("getComputedStyle(document.documentElement).scrollSnapType"), "none")
        self.assertEqual(self.page.locator("#one").evaluate("el => getComputedStyle(el).scrollSnapStop"), "always")
        self.assertTrue(self.page.evaluate("chStory.go(1)"))
        self.settled()
        self.assert_position(764)

    def test_hybrid_touch_uses_the_same_section_controller(self):
        self.load_home_styles()
        self.page.evaluate("""() => {
          const target = document.querySelector('.hv');
          const point = new Touch({identifier: 1, target, clientX: 300, clientY: 500});
          target.dispatchEvent(new TouchEvent('touchstart', {touches: [point], bubbles: true}));
        }""")
        self.assertEqual(self.page.evaluate("getComputedStyle(document.documentElement).scrollSnapType"), "none")
        self.wheel()
        self.settled()
        self.assertEqual(self.page.evaluate("getComputedStyle(document.documentElement).scrollSnapType"), "none")
        self.assert_position(720)

    def test_long_wheel_stream_moves_only_one_section(self):
        self.wheel(count=70)
        self.settled()
        self.assert_position(720)

    def test_reduced_motion_still_consumes_only_one_gesture(self):
        self.page.emulate_media(reduced_motion="reduce")
        self.wheel(count=35)
        self.settled()
        self.assert_position(720)

    def test_idle_gap_allows_the_next_swipe(self):
        self.wheel(count=5)
        self.settled()
        self.assert_position(720)
        self.wheel(count=5)
        self.settled()
        self.assert_position(1440)

    def test_opposite_direction_noise_does_not_rearm_a_used_gesture(self):
        self.page.emulate_media(reduced_motion="reduce")
        self.wheel()
        for _ in range(4):
            self.wheel(delta=-2)
            self.wheel()
        self.settled()
        self.assert_position(720)

    def test_deliberate_reversal_cancels_the_prior_direction(self):
        self.wheel()
        self.settled()
        self.wheel()
        self.page.wait_for_timeout(100)
        self.wheel(delta=-60)
        self.settled()
        self.assert_position(720)

    def test_repeated_public_navigation_shares_one_transition(self):
        self.page.evaluate("""async () => {
          for (let i = 0; i < 6; i++) {
            window.chStory.go(1);
            await new Promise(resolve => setTimeout(resolve, 35));
          }
        }""")
        self.settled()
        self.assert_position(720)

    def test_held_navigation_key_advances_only_once(self):
        self.page.emulate_media(reduced_motion="reduce")
        self.page.evaluate("""() => {
          for (let i = 0; i < 8; i++) {
            document.body.dispatchEvent(new KeyboardEvent('keydown', {
              key: 'PageDown', repeat: i > 0, bubbles: true, cancelable: true
            }));
          }
        }""")
        self.settled()
        self.assert_position(720)

    def test_zoom_and_horizontal_wheel_are_not_canceled(self):
        canceled = self.page.evaluate("""() => {
          return [{deltaY: 60, ctrlKey: true}, {deltaY: 20, deltaX: 80}].map(options => {
            const event = new WheelEvent('wheel', {
              ...options, bubbles: true, cancelable: true
            });
            document.body.dispatchEvent(event);
            return event.defaultPrevented;
          });
        }""")
        self.assertEqual(canceled, [False, False])
        self.settled()
        self.assert_position(0)

    def test_tiny_wheel_noise_does_not_navigate(self):
        self.wheel(delta=1, count=8)
        self.settled()
        self.assert_position(0)

    def test_tall_section_has_no_unreachable_viewport(self):
        self.page.evaluate("""() => {
          const section = document.querySelector('#two');
          section.style.height = '2500px';
          section.innerHTML = '<div style="height:2400px">Tall content</div>';
        }""")
        self.page.wait_for_timeout(100)
        positions = self.page.evaluate("window.chStory.frames().map(frame => frame.y)")
        inside = [y for y in positions if 1440 <= y <= 3940]
        self.assertEqual(inside[0], 1440)
        self.assertEqual(inside[-1], 3940)
        self.assertLessEqual(max(b - a for a, b in zip(inside, inside[1:])), 721)

    def test_frame_measurement_does_not_mutate_layout(self):
        self.page.evaluate("""() => {
          const section = document.querySelector('#two');
          section.style.height = 'auto';
          section.style.minHeight = '720px';
          section.innerHTML = '<div class="grid" style="display:grid;' +
            'grid-template-columns:1fr 1fr;gap:20px">' +
            '<article style="height:400px">Card</article>'.repeat(8) + '</div>';
        }""")
        before = self.page.locator("#main").inner_html()
        self.page.evaluate("() => { for (let i = 0; i < 3; i++) window.chStory.frames(); }")
        self.assertEqual(self.page.locator("#main").inner_html(), before)

    def test_programmatic_scroll_is_not_pulled_to_a_frame(self):
        self.page.evaluate("window.scrollTo(0, 330)")
        self.settled()
        self.assert_position(330)

    def test_nested_scroller_keeps_wheel_and_keyboard_input(self):
        self.page.locator(".scroller").hover()
        self.page.mouse.wheel(0, 80)
        self.page.wait_for_timeout(150)
        self.assertGreater(self.page.locator(".scroller").evaluate("el => el.scrollTop"), 0)
        self.assert_position(0)
        self.page.locator(".scroller").focus()
        self.page.keyboard.press("PageDown")
        self.settled()
        self.assert_position(0)

    def test_nested_scroller_boundary_does_not_leave_a_partial_section(self):
        scroller = self.page.locator(".scroller")
        scroller.evaluate("el => el.scrollTop = el.scrollHeight")
        scroller.hover()
        self.page.mouse.wheel(0, 300)
        self.settled()
        self.assertLessEqual(min(abs(self.position()), abs(self.position() - 720)), 3)

    def test_custom_control_and_prevented_keys_are_not_hijacked(self):
        prevented = self.page.evaluate("""() => {
          const el = document.querySelector('[role=slider]');
          const event = new KeyboardEvent('keydown', {
            key: 'ArrowDown', bubbles: true, cancelable: true
          });
          el.dispatchEvent(event);
          return event.defaultPrevented;
        }""")
        self.assertFalse(prevented)
        self.page.evaluate("""() => {
          const el = document.querySelector('#control');
          el.addEventListener('keydown', event => event.preventDefault());
          el.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'PageDown', bubbles: true, cancelable: true
          }));
        }""")
        self.settled()
        self.assert_position(0)

    def test_open_menu_prevents_background_navigation(self):
        self.page.set_viewport_size({"width": 950, "height": 800})
        self.page.evaluate("""() => {
          document.querySelector('#mnav').hidden = false;
          document.querySelector('.menu-btn').setAttribute('aria-expanded', 'true');
          document.body.style.overflow = 'hidden';
        }""")
        self.wheel(count=5, target="#mnav")
        self.settled()
        self.assert_position(0)

    def test_resize_keeps_the_destination_of_an_active_transition(self):
        self.wheel()
        self.page.wait_for_timeout(100)
        self.page.set_viewport_size({"width": 800, "height": 800})
        self.page.wait_for_timeout(50)
        self.settled()
        self.assert_position(720)


if __name__ == "__main__":
    unittest.main()
