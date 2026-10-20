"""One gesture remains one story without a persistent next-section control."""

import unittest

from playwright.sync_api import sync_playwright
from test_story_scroll import FIXTURE, SOURCE


class StoryDeliveryTests(unittest.TestCase):
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
        self.page.add_style_tag(path=str(SOURCE.parent / 'pages_home6.css'))
        self.page.add_script_tag(content=SOURCE.read_text())
        self.page.wait_for_timeout(80)
        self.page.evaluate("scrollTo({top: 0, behavior: 'instant'})")

    def tearDown(self):
        self.context.close()

    def settle(self):
        self.page.wait_for_function("!document.documentElement.classList.contains('ch-moving')")
        self.page.wait_for_timeout(80)

    def stream(self, samples):
        self.page.evaluate("""async samples => {
          for (const [delay, delta] of samples) {
            if (delay) await new Promise(resolve => setTimeout(resolve, delay));
            document.body.dispatchEvent(new WheelEvent('wheel', {
              deltaY: delta, bubbles: true, cancelable: true
            }));
          }
        }""", samples)
        self.settle()

    def test_paused_decaying_momentum_does_not_skip_testimonial_stop(self):
        self.stream([[0, 72], [16, 62], [16, 48], [95, 32], [16, 24],
                     [110, 16], [16, 10], [16, 6], [16, 2]])
        self.assertAlmostEqual(self.page.evaluate('scrollY'), 720, delta=3)

    def test_reduced_motion_keeps_paused_momentum_in_one_story(self):
        self.page.emulate_media(reduced_motion='reduce')
        self.test_paused_decaying_momentum_does_not_skip_testimonial_stop()

    def test_browser_wheel_stream_keeps_paused_tail_in_one_story(self):
        self.page.mouse.move(1000, 500)
        for delay, delta in [[0, 72], [16, 62], [16, 48], [95, 32],
                             [16, 24], [110, 16], [16, 10], [16, 6]]:
            self.page.wait_for_timeout(delay)
            self.page.mouse.wheel(0, delta)
        self.settle()
        self.assertAlmostEqual(self.page.evaluate('scrollY'), 720, delta=3)

    def test_delayed_constant_wheel_stream_is_one_gesture(self):
        # These gaps were recorded during normal playback on the real page.
        self.stream([[0,90],[117,90],[112,90],[104,90],[136,90],[193,90],[78,90],[112,90]])
        self.assertAlmostEqual(self.page.evaluate('scrollY'),720,delta=3)

    def test_nested_scroll_boundary_keeps_remainder_of_its_gesture(self):
        self.page.evaluate("""async () => {
          const scroller = document.querySelector('.scroller');
          const send = delta => scroller.dispatchEvent(new WheelEvent('wheel', {
            deltaY: delta, bubbles: true, cancelable: true
          }));
          send(72);
          scroller.scrollTop = scroller.scrollHeight;
          await new Promise(resolve => setTimeout(resolve, 20));
          send(54);
          await new Promise(resolve => setTimeout(resolve, 20));
          send(36);
        }""")
        self.settle()
        self.assertAlmostEqual(self.page.evaluate('scrollY'), 0, delta=3)
        # Once the nested gesture has ended, a fresh stroke at its edge can advance.
        self.page.wait_for_timeout(260)
        self.page.locator('.scroller').hover()
        self.page.mouse.wheel(0, 72)
        self.settle()
        self.assertAlmostEqual(self.page.evaluate('scrollY'), 720, delta=3)

    def test_page_keys_move_one_story_without_a_persistent_next_control(self):
        self.assertEqual(self.page.locator('[data-story-next]').count(), 0)
        self.page.keyboard.press('PageDown')
        self.settle()
        self.assertAlmostEqual(self.page.evaluate('scrollY'), 720, delta=3)
        self.assertEqual(self.page.locator('[data-story-next]').count(), 0)
        self.page.keyboard.press('PageUp')
        self.settle()
        self.assertAlmostEqual(self.page.evaluate('scrollY'), 0, delta=3)

    def test_menu_and_final_stop_do_not_create_a_persistent_next_control(self):
        self.assertEqual(self.page.locator('[data-story-next]').count(), 0)
        self.page.locator('#mnav').evaluate('el => el.hidden = false')
        self.assertEqual(self.page.locator('[data-story-next]').count(), 0)
        self.page.locator('#mnav').evaluate('el => el.hidden = true')
        self.page.evaluate("scrollTo(0, chStory.frames().at(-1).y)")
        self.settle()
        self.assertEqual(self.page.locator('[data-story-next]').count(), 0)

    def test_existing_hero_action_does_not_add_a_persistent_next_control(self):
        self.page.goto('about:blank')
        self.page.set_content(FIXTURE.replace('<h1>Hero</h1>',
            '<h1>Hero</h1><button data-hv-next aria-label="Explore Community Hub">Explore</button>'))
        self.page.add_script_tag(content=SOURCE.read_text())
        self.page.wait_for_timeout(80)
        self.assertTrue(self.page.get_by_role('button', name='Explore Community Hub').is_visible())
        self.assertEqual(self.page.locator('[data-story-next]').count(), 0)
        self.page.evaluate('chStory.go(1)')
        self.settle()
        self.assertEqual(self.page.locator('[data-story-next]').count(), 0)

    def test_hash_navigation_during_motion_is_not_overridden(self):
        self.page.evaluate("""() => {
          const link = document.createElement('a');
          link.href = '#three'; link.id = 'jump'; link.textContent = 'Jump to fourth story';
          document.querySelector('#hdr').append(link);
          chStory.go(1);
        }""")
        self.page.wait_for_timeout(120)
        self.page.locator('#jump').click()
        self.settle()
        self.assertAlmostEqual(self.page.locator('#three').bounding_box()['y'], 80, delta=3)

    def test_page_keys_from_ordinary_links_use_story_stops(self):
        self.page.emulate_media(reduced_motion='reduce')
        self.page.locator('.hv').evaluate("""el => el.insertAdjacentHTML('beforeend',
            '<a id="ordinary-link" href="/product">Product details</a>')""")
        self.page.locator('#ordinary-link').focus()
        self.page.keyboard.press('PageDown')
        self.page.wait_for_timeout(350)
        self.assertAlmostEqual(self.page.evaluate('scrollY'), 720, delta=3)
        self.page.locator('#one').evaluate("""el => el.insertAdjacentHTML('beforeend',
            '<button id="ordinary-button">Product action</button>')""")
        self.page.locator('#ordinary-button').focus()
        self.page.keyboard.press('PageUp')
        self.page.wait_for_timeout(350)
        self.assertAlmostEqual(self.page.evaluate('scrollY'), 0, delta=3)

    def test_page_keys_still_belong_to_nested_controls(self):
        self.page.locator('.scroller').focus()
        self.page.keyboard.press('PageDown')
        self.page.wait_for_timeout(350)
        self.assertAlmostEqual(self.page.evaluate('scrollY'), 0, delta=3)
        self.assertGreater(self.page.locator('.scroller').evaluate('el => el.scrollTop'), 0)
        self.page.locator('[role=slider]').focus()
        prevented = self.page.locator('[role=slider]').evaluate("""el => {
            const e = new KeyboardEvent('keydown', {key:'PageDown',bubbles:true,cancelable:true});
            el.dispatchEvent(e); return e.defaultPrevented;
        }""")
        self.assertFalse(prevented)


if __name__ == '__main__':
    unittest.main()
