"""Real touch regressions for section navigation and horizontal phone rails."""

import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright


SOURCE = Path(__file__).resolve().parents[1] / "runtime" / "pages_home6.js"
# A completed opening keeps these isolated tests about gesture ownership; the
# production film's first-gesture reveal has its own test_home_hero.py coverage.
FRAME = 764
FIXTURE = """<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
* { box-sizing: border-box; }
html, body { margin: 0; }
h1, h2 { margin: 0; }
#hdr { position: sticky; top: 0; height: 80px; z-index: 2; background: white; }
#main > section { position: relative; height: 764px; }
.foot { height: 764px; }
.actions { position: absolute; top: 50px; left: 20px; }
.scroller { position: absolute; top: 140px; left: 20px;
  width: 260px; height: 140px; overflow-y: auto; overscroll-behavior-y: contain; }
.scroller > div { height: 700px; }
[role=slider] { position: absolute; top: 320px; left: 20px; width: 200px; height: 40px; }
.story-rail { position: absolute; top: 120px; width: 390px; height: 280px;
  display: flex; overflow-x: auto; overflow-y: hidden;
  scroll-snap-type: x mandatory; overscroll-behavior-x: contain; }
.story-rail > article { flex: 0 0 390px; scroll-snap-align: start;
  scroll-snap-stop: always; background: #eee; }
.story-rail-nav { position: absolute; top: 420px; left: 20px; }
#mnav { position: fixed; inset: 80px 0 0; z-index: 3; background: white; }
</style></head><body>
<header id="hdr"><button class="menu-btn" aria-expanded="false">Menu</button></header>
<main id="main">
<section class="hv intro-peek"><h1>Hero</h1>
  <div class="actions"><button id="action">Action</button> <a id="link" href="#one">Details</a></div>
  <div class="scroller" data-scroll-owner><div>Scrollable content</div></div>
  <div role="slider" tabindex="0" aria-label="Volume" aria-valuenow="50"></div>
</section>
<section id="one"><h2>First section</h2>
  <div class="story-rail" data-story-rail role="region" aria-label="Featured projects" tabindex="0">
    <article>First panel</article><article>Second panel</article><article>Third panel</article>
  </div>
</section>
<section id="two"><h2>Second section</h2></section>
<section id="three"><h2>Third section</h2></section>
<section id="four"><h2>Fourth section</h2></section>
</main><footer class="foot">Footer</footer><nav id="mnav" hidden>Navigation</nav>
<script>
window.taps = {action: 0, link: 0};
for (const id of ['action', 'link']) {
  document.getElementById(id).addEventListener('click', event => {
    event.preventDefault(); window.taps[id] += 1;
  });
}
</script></body></html>"""


class PhoneScrollTests(unittest.TestCase):
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
        self.context = self.browser.new_context(
            viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True
        )
        self.page = self.context.new_page()
        self.page.set_content(FIXTURE)
        self.page.add_script_tag(content=self.script)
        self.cdp = self.context.new_cdp_session(self.page)
        self.page.wait_for_timeout(100)

    def tearDown(self):
        self.context.close()

    def touch(self, event_type, x=None, y=None):
        points = [] if x is None else [{"x": x, "y": y, "id": 1}]
        self.cdp.send("Input.dispatchTouchEvent", {"type": event_type, "touchPoints": points})

    def swipe(self, start=(350, 680), end=(350, 350), steps=12, interval=18):
        self.touch("touchStart", *start)
        for i in range(1, steps + 1):
            self.touch(
                "touchMove",
                start[0] + (end[0] - start[0]) * i / steps,
                start[1] + (end[1] - start[1]) * i / steps,
            )
            self.page.wait_for_timeout(interval)
        self.touch("touchEnd")

    def settled(self):
        self.page.wait_for_timeout(800)

    def assert_position(self, expected):
        self.assertAlmostEqual(self.page.evaluate("window.scrollY"), expected, delta=2)

    def test_vertical_swipe_advances_exactly_one_section(self):
        self.swipe()
        self.settled()
        self.assert_position(FRAME)

    def test_short_vertical_movement_stays_on_current_section(self):
        self.swipe(end=(350, 660), steps=4, interval=30)
        self.settled()
        self.assert_position(0)

    def test_continued_touch_moves_only_one_section(self):
        self.swipe(end=(350, 200), steps=40, interval=30)
        self.settled()
        self.assert_position(FRAME)

    def test_separate_swipes_advance_and_reverse(self):
        self.swipe()
        self.settled()
        self.assert_position(FRAME)
        self.swipe()
        self.settled()
        self.assert_position(FRAME * 2)
        self.swipe(start=(350, 350), end=(350, 680))
        self.settled()
        self.assert_position(FRAME)

    def test_horizontal_rail_swipe_keeps_document_on_section(self):
        self.page.evaluate("window.scrollTo(0, 764)")
        self.swipe(start=(340, 310), end=(45, 315), steps=15, interval=20)
        self.settled()
        self.assert_position(FRAME)
        self.assertAlmostEqual(
            self.page.locator("[data-story-rail]").evaluate("el => el.scrollLeft"),
            390,
            delta=2,
        )

    def test_vertical_swipe_over_rail_advances_section(self):
        self.page.evaluate("window.scrollTo(0, 764)")
        self.swipe(start=(340, 450), end=(340, 200))
        self.settled()
        self.assert_position(FRAME * 2)
        self.assertEqual(
            self.page.locator("[data-story-rail]").evaluate("el => el.scrollLeft"), 0
        )

    def test_transformed_rail_items_do_not_steal_vertical_swipe(self):
        self.page.evaluate("""() => {
          const rule = [...document.styleSheets[0].cssRules].find(rule => rule.selectorText === '.story-rail');
          rule.style.removeProperty('overflow-y');
          document.querySelectorAll('[data-story-rail] > article').forEach(item => {
            item.style.height = '280px';
            item.style.transform = 'translateY(22px)';
          });
        }""")
        self.page.add_style_tag(path=str(SOURCE.parent / "pages_home6.css"))
        self.page.wait_for_timeout(100)
        rail = self.page.locator("[data-story-rail]")
        self.assertGreater(rail.evaluate("el => el.scrollHeight - el.clientHeight"), 0)
        self.page.evaluate("window.scrollTo(0, 764)")
        self.swipe(start=(340, 450), end=(340, 200))
        self.settled()
        self.assert_position(FRAME * 2)
        self.assertEqual(rail.evaluate("el => el.scrollTop"), 0)

    def test_rail_arrow_buttons_update_count_and_boundaries(self):
        self.page.evaluate("window.scrollTo(0, 764)")
        previous = self.page.get_by_role("button", name="Previous: Featured projects")
        next_button = self.page.get_by_role("button", name="Next: Featured projects")
        count = self.page.locator(".story-rail-count")
        self.assertEqual(count.inner_text(), "1 / 3")
        self.assertTrue(previous.is_disabled())
        for expected in (2, 3):
            next_button.tap()
            self.settled()
            self.assertEqual(count.inner_text(), f"{expected} / 3")
            self.assertAlmostEqual(
                self.page.locator("[data-story-rail]").evaluate("el => el.scrollLeft"),
                390 * (expected - 1),
                delta=2,
            )
            self.assert_position(FRAME)
        self.assertTrue(next_button.is_disabled())
        previous.tap()
        self.settled()
        self.assertEqual(count.inner_text(), "2 / 3")
        self.assertFalse(previous.is_disabled())
        self.assertFalse(next_button.is_disabled())
        self.assert_position(FRAME)

    def test_focused_rail_accepts_horizontal_keyboard_navigation(self):
        self.page.evaluate("window.scrollTo(0, 764)")
        rail = self.page.get_by_role("region", name="Featured projects")
        rail.focus()
        self.page.keyboard.press("ArrowRight")
        self.settled()
        self.assertAlmostEqual(rail.evaluate("el => el.scrollLeft"), 390, delta=2)
        self.assertEqual(self.page.locator(".story-rail-count").inner_text(), "2 / 3")
        self.assert_position(FRAME)
        self.page.keyboard.press("ArrowLeft")
        self.settled()
        self.assertAlmostEqual(rail.evaluate("el => el.scrollLeft"), 0, delta=2)
        self.assertEqual(self.page.locator(".story-rail-count").inner_text(), "1 / 3")
        self.assert_position(FRAME)

    def test_button_and_link_taps_keep_native_clicks(self):
        for selector in ("#action", "#link"):
            box = self.page.locator(selector).bounding_box()
            self.page.touchscreen.tap(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        self.assertEqual(self.page.evaluate("window.taps"), {"action": 1, "link": 1})
        self.assert_position(0)

    def test_nested_scroller_consumes_its_own_touch(self):
        self.swipe(start=(160, 335), end=(160, 245), steps=12, interval=25)
        self.settled()
        self.assertGreater(self.page.locator(".scroller").evaluate("el => el.scrollTop"), 20)
        self.assert_position(0)

    def test_controls_and_open_menu_touch_events_are_not_canceled(self):
        for selector in ('[role="slider"]', "#mnav"):
            if selector == "#mnav":
                self.page.evaluate("""() => {
                  document.querySelector('#mnav').hidden = false;
                  document.querySelector('.menu-btn').setAttribute('aria-expanded', 'true');
                  document.body.style.overflow = 'hidden';
                }""")
            prevented = self.page.evaluate("""selector => {
              const target = document.querySelector(selector);
              const dispatch = (type, y) => {
                const touches = type === 'touchend' ? [] : [new Touch({
                  identifier: 1, target, clientX: 100, clientY: y,
                  pageX: 100, pageY: y, screenX: 100, screenY: y
                })];
                const event = new TouchEvent(type, {
                  touches, targetTouches: touches, changedTouches: touches,
                  bubbles: true, cancelable: true
                });
                target.dispatchEvent(event);
                return event.defaultPrevented;
              };
              return [dispatch('touchstart', 500), dispatch('touchmove', 400), dispatch('touchend', 400)];
            }""", selector)
            self.assertEqual(prevented, [False, False, False])
            self.settled()
            self.assert_position(0)

    def test_two_finger_zoom_is_not_canceled(self):
        prevented = self.page.evaluate("""() => {
          const target = document.querySelector('.hv');
          const dispatch = (type, positions) => {
            const touches = positions.map(([x, y], identifier) => new Touch({
              identifier, target, clientX: x, clientY: y,
              pageX: x, pageY: y, screenX: x, screenY: y
            }));
            const event = new TouchEvent(type, {
              touches, targetTouches: touches, changedTouches: touches,
              bubbles: true, cancelable: true
            });
            target.dispatchEvent(event);
            return event.defaultPrevented;
          };
          return [
            dispatch('touchstart', [[120, 600], [260, 600]]),
            dispatch('touchmove', [[80, 600], [300, 600]]),
            dispatch('touchend', []),
            dispatch('touchstart', [[120, 600]]),
            dispatch('touchstart', [[120, 600], [260, 600]]),
            dispatch('touchmove', [[80, 600], [300, 600]]),
            dispatch('touchend', [])
          ];
        }""")
        self.assertEqual(prevented, [False] * 7)
        self.settled()
        self.assert_position(0)

    def test_native_pinch_can_zoom(self):
        self.cdp.send("Input.synthesizePinchGesture", {
            "x": 200, "y": 600, "scaleFactor": 1.6,
            "relativeSpeed": 800, "gestureSourceType": "touch",
        })
        self.page.wait_for_timeout(500)
        self.assertGreater(self.page.evaluate("visualViewport.scale"), 1.4)
        self.assert_position(0)

    def test_zoomed_page_keeps_one_finger_pan_native(self):
        self.cdp.send("Input.synthesizePinchGesture", {
            "x": 200, "y": 600, "scaleFactor": 1.6,
            "relativeSpeed": 800, "gestureSourceType": "touch",
        })
        self.page.wait_for_timeout(500)
        self.assertGreater(self.page.evaluate("visualViewport.scale"), 1.4)
        prevented = self.page.evaluate("""() => {
          const target = document.querySelector('.hv');
          const dispatch = (type, y) => {
            const touches = type === 'touchend' ? [] : [new Touch({
              identifier: 1, target, clientX: 150, clientY: y,
              pageX: 150, pageY: y, screenX: 150, screenY: y
            })];
            const event = new TouchEvent(type, {
              touches, targetTouches: touches, changedTouches: touches,
              bubbles: true, cancelable: true
            });
            target.dispatchEvent(event);
            return event.defaultPrevented;
          };
          return [dispatch('touchstart', 400), dispatch('touchmove', 320), dispatch('touchend', 320)];
        }""")
        self.assertEqual(prevented, [False, False, False])
        self.settled()
        self.assert_position(0)

    def test_reduced_motion_touch_still_advances_one_section(self):
        self.page.emulate_media(reduced_motion="reduce")
        self.swipe(steps=30, interval=25)
        self.settled()
        self.assert_position(FRAME)


if __name__ == "__main__":
    unittest.main()
