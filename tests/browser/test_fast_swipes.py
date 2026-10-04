"""Rapid fresh gestures must remain responsive without replaying momentum."""

import unittest

from playwright.sync_api import sync_playwright

from test_phone_scroll import FIXTURE as PHONE_FIXTURE, FRAME
from test_story_scroll import FIXTURE, SOURCE


class FastSwipeTests(unittest.TestCase):
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
        self.page.wait_for_timeout(60)

    def tearDown(self):
        self.context.close()

    def wheel_stream(self, samples):
        self.page.evaluate("""async samples => {
          for (const [delay, delta] of samples) {
            if (delay) await new Promise(resolve => setTimeout(resolve, delay));
            document.body.dispatchEvent(new WheelEvent('wheel', {
              deltaY: delta, bubbles: true, cancelable: true
            }));
          }
        }""", samples)

    def assert_settled(self, expected):
        self.page.wait_for_timeout(800)
        self.assertAlmostEqual(self.page.evaluate("window.scrollY"), expected, delta=3)

    def test_constant_wheel_events_after_100ms_remain_one_gesture(self):
        self.wheel_stream([[0, 60], [100, 60]])
        self.assert_settled(720)

    def test_extra_swipe_toward_last_stop_finishes_pending_transition(self):
        stops = self.page.evaluate("chStory.frames().map(frame => frame.y)")
        self.page.evaluate("y => window.scrollTo(0, y)", stops[-2])
        self.wheel_stream([[0, 60], [100, 60]])
        self.assert_settled(stops[-1])

    def test_extra_swipe_toward_first_stop_finishes_pending_transition(self):
        self.page.evaluate("window.scrollTo(0, 720)")
        self.wheel_stream([[0, -60], [100, -60]])
        self.assert_settled(0)

    def test_continuous_plateau_and_decay_remain_one_swipe(self):
        self.wheel_stream(
            [[0, 60]] + [[16, 60]] * 20
            + [[16, value] for value in (52, 44, 36, 28, 20, 12, 7, 4, 2, 1)]
        )
        self.assert_settled(720)

    def test_single_noisy_dip_does_not_restart_a_gesture(self):
        self.wheel_stream([[0, 60]] + [[16, 60]] * 6 + [[16, 8], [16, 60]])
        self.assert_settled(720)

    def test_wheel_reversal_after_the_hold_returns_to_origin(self):
        self.wheel_stream([[0, 60], [600, -60]])
        self.assert_settled(0)

    def test_deliberate_reversal_cancels_the_prior_direction(self):
        self.wheel_stream([[0, 60], [100, -60]])
        self.assert_settled(0)

    def test_renewed_impulse_inside_one_gesture_does_not_advance_again(self):
        self.wheel_stream(
            [[0, 72]] + [[16, value] for value in (65, 54, 40, 28, 16, 8, 70)]
        )
        self.assert_settled(720)

    def test_page_gesture_tail_does_not_enter_new_scene_scroller(self):
        self.page.locator('#one').evaluate('''el => el.insertAdjacentHTML('beforeend',
            '<div id="next-scroller" data-scroll-owner style="height:120px;width:240px;overflow-y:auto">' +
            '<div style="height:600px">Native application content</div></div>')''')
        prevented=self.page.evaluate('''async () => {
            const send = target => {
                const event = new WheelEvent('wheel', {deltaY:80,bubbles:true,cancelable:true});
                target.dispatchEvent(event);
                return event.defaultPrevented;
            };
            const first = send(document.body);
            await new Promise(resolve => setTimeout(resolve,40));
            return [first,send(document.getElementById('next-scroller'))];
        }''')
        self.assertEqual(prevented,[True,True])
        self.assertAlmostEqual(self.page.evaluate('scrollY'),720,delta=3)
        self.assertEqual(self.page.locator('#next-scroller').evaluate('el=>el.scrollTop'),0)
        self.page.wait_for_timeout(600)
        self.page.locator('#next-scroller').hover()
        self.page.mouse.wheel(0,80)
        self.page.wait_for_timeout(150)
        self.assertGreater(self.page.locator('#next-scroller').evaluate('el=>el.scrollTop'),0)
        self.assertAlmostEqual(self.page.evaluate('scrollY'),720,delta=3)

    def test_separate_fast_touch_strokes_advance_again(self):
        self.context.close()
        self.context = self.browser.new_context(
            viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True
        )
        self.page = self.context.new_page()
        self.page.set_content(PHONE_FIXTURE)
        self.page.add_script_tag(content=self.script)
        self.page.wait_for_timeout(60)
        cdp = self.context.new_cdp_session(self.page)

        def touch(event_type, y=None):
            points = [] if y is None else [{"x": 350, "y": y, "id": 1}]
            cdp.send("Input.dispatchTouchEvent", {"type": event_type, "touchPoints": points})

        for index in range(2):
            touch("touchStart", 680)
            touch("touchMove", 610)
            touch("touchEnd")
            if index == 0:
                self.page.wait_for_timeout(100)
        self.assert_settled(FRAME * 2)


if __name__ == "__main__":
    unittest.main()
