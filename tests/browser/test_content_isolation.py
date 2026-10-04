"""Section ownership and live-embed gesture regressions, using a real browser."""

import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright


SOURCE = Path(__file__).resolve().parents[1] / "runtime"
FIXTURE = """<!doctype html><html class="motion"><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
* { box-sizing: border-box; }
html, body { margin: 0; }
#hdr { position: sticky; top: 0; height: 80px; z-index: 2; }
#main > section { height: 640px; padding: 24px; }
.foot { height: 640px; }
[data-reveal] { opacity: 0; transform: translateY(22px); }
.orbmap { position: relative; width: 280px; height: 220px; }
iframe { width: 100%; height: 100%; border: 0; }
</style></head><body>
<header id="hdr"><a href="#second">Second section</a></header>
<main id="main" data-pager>
<section id="first"><div class="wrap"><h1>First section</h1>
<a id="first-link" href="#second">Continue</a>
<div class="orbmap"><iframe id="embed" title="Test dashboard"
srcdoc="<button onclick='document.body.dataset.activations=Number(document.body.dataset.activations||0)+1'>Dashboard action</button>"></iframe></div>
</div></section>
<section id="second"><div class="wrap"><h2 data-reveal>Second section</h2>
<a id="second-link" href="#first">Return</a></div></section>
<section id="third"><div class="wrap"><h2>Third section</h2></div></section>
</main><footer class="foot"><a href="#first">Footer link</a></footer>
</body></html>"""


class ContentIsolationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = self.browser.new_context(viewport={"width": 1200, "height": 720})
        self.page = self.context.new_page()
        self.load()

    def tearDown(self):
        self.context.close()

    def load(self, controller=True):
        self.page.set_content(FIXTURE)
        self.page.add_style_tag(path=str(SOURCE / "pages_zz_pop.css"))
        if controller:
            self.page.add_script_tag(path=str(SOURCE / "pages_home6.js"))
        self.page.add_script_tag(path=str(SOURCE / "pages_zz_pop.js"))
        self.page.add_script_tag(path=str(SOURCE / "pages_zzzzz_shield.js"))
        self.page.wait_for_timeout(100)

    def move(self, y):
        self.page.evaluate("y => scrollTo({top: y, behavior: 'instant'})", y)
        self.page.wait_for_timeout(120)

    def test_adjacent_sections_never_reveal_together(self):
        self.move(400)
        visible = self.page.evaluate("""() => [...document.querySelectorAll('#main > section')]
            .filter(el => getComputedStyle(el).visibility === 'visible').map(el => el.id)""")
        self.assertEqual(visible, ["second"])

    def test_current_section_reveals_nested_content_without_another_observer(self):
        self.move(640)
        self.assertEqual(self.page.locator("#second h2").evaluate(
            "el => getComputedStyle(el).opacity"), "1")

    def test_staggered_reveal_does_not_delay_section_visibility(self):
        self.page.goto("about:blank")
        markup = FIXTURE.replace('<h2 data-reveal>Second section</h2>',
            '<h2 data-reveal>Second section</h2><div data-reveal-group>'
            '<p id="staggered" style="--i:6">Last item in a staggered group</p></div>')
        self.page.set_content(markup)
        self.page.add_style_tag(content=(
            '[data-reveal-group]>*{transition-delay:calc(var(--i,0)*70ms)}'))
        self.page.add_style_tag(path=str(SOURCE / "pages_zz_pop.css"))
        self.page.add_script_tag(path=str(SOURCE / "pages_home6.js"))
        self.page.add_script_tag(path=str(SOURCE / "pages_zz_pop.js"))
        self.page.wait_for_timeout(500)
        self.page.evaluate("""async () => {
            scrollTo({top:640, behavior:'instant'});
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        }""")
        self.assertEqual(self.page.locator("#staggered").evaluate(
            "el => getComputedStyle(el).visibility"), "visible")
        self.page.evaluate("""async () => {
            scrollTo({top:0, behavior:'instant'});
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        }""")
        self.assertEqual(self.page.locator("#staggered").evaluate(
            "el => getComputedStyle(el).visibility"), "hidden")

    def test_inactive_section_cannot_capture_keyboard_focus(self):
        self.page.locator("#second-link").evaluate("el => el.focus()")
        self.assertNotEqual(self.page.evaluate("document.activeElement.id"), "second-link")
        self.move(640)
        self.page.locator("#second-link").focus()
        self.assertEqual(self.page.evaluate("document.activeElement.id"), "second-link")

    def test_footer_becomes_the_only_active_owner(self):
        self.move(1920)
        self.assertEqual(self.page.locator(".foot").evaluate(
            "el => getComputedStyle(el).visibility"), "visible")
        self.assertTrue(self.page.locator("#third").evaluate("el => el.inert"))

    def test_sticky_jump_links_stay_visible_between_sections(self):
        self.page.goto("about:blank")
        markup = FIXTURE.replace('<section id="second">',
            '<nav data-zpa-jump><div class="wrap"><a href="#second">Second</a>'
            '</div></nav><section id="second">')
        self.page.set_content(markup)
        self.page.add_style_tag(path=str(SOURCE / "pages_zz_pop.css"))
        self.page.add_style_tag(path=str(SOURCE / "pages_zzz_polish.css"))
        self.page.add_script_tag(path=str(SOURCE / "pages_home6.js"))
        self.page.add_script_tag(path=str(SOURCE / "pages_zz_pop.js"))
        self.page.wait_for_timeout(100)
        self.assertEqual(self.page.locator("[data-zpa-jump] a").evaluate(
            "el => getComputedStyle(el).opacity"), "1")

    def assert_direct_live_frame(self, selector):
        frame = self.page.locator(selector)
        self.assertEqual(frame.evaluate("el => getComputedStyle(el).pointerEvents"), "auto")
        self.assertEqual(frame.evaluate("el => el.tabIndex"), 0)
        self.assertTrue(frame.evaluate("el => el.classList.contains('ch-live')"))
        self.assertFalse(frame.evaluate("el => el.classList.contains('ch-embed-shield')"))
        self.assertEqual(self.page.locator('.ch-embed-toggle, .ch-embed-toolbar').count(), 0)
        return frame

    def test_desktop_embed_is_directly_interactive_without_activation(self):
        self.assert_direct_live_frame('#embed')
        self.page.frame_locator('#embed').get_by_role('button', name='Dashboard action').click()
        self.assertEqual(self.page.frame_locator('#embed').locator('body').get_attribute('data-activations'), '1')

    def test_touch_embed_is_directly_interactive_without_activation(self):
        self.context.close()
        self.context = self.browser.new_context(
            viewport={"width": 390, "height": 720}, is_mobile=True, has_touch=True)
        self.page = self.context.new_page()
        self.load()
        self.assert_direct_live_frame('#embed')
        self.page.frame_locator('#embed').get_by_role('button', name='Dashboard action').tap()
        self.assertEqual(self.page.frame_locator('#embed').locator('body').get_attribute('data-activations'), '1')

    def test_embed_controls_keep_native_keyboard_ownership(self):
        self.assert_direct_live_frame('#embed')
        # Tab reaches the app itself, without an activation control in between.
        self.page.locator('#first-link').focus()
        self.page.keyboard.press('Tab')
        action = self.page.frame_locator('#embed').get_by_role('button', name='Dashboard action')
        self.assertTrue(action.evaluate('el => el === document.activeElement'))
        self.page.keyboard.press('Enter')
        self.assertEqual(self.page.frame_locator('#embed').locator('body').get_attribute('data-activations'), '1')
        action.evaluate("""el => addEventListener('keydown', event => {
            document.body.dataset.lastKey = event.key;
            document.body.dataset.prevented = String(event.defaultPrevented);
        })""")
        for key in ['PageDown', 'Escape']:
            self.page.keyboard.press(key)
            self.assertEqual(self.page.frame_locator('#embed').locator('body').get_attribute('data-last-key'), key)
            self.assertEqual(self.page.frame_locator('#embed').locator('body').get_attribute('data-prevented'), 'false')
            self.assertAlmostEqual(self.page.evaluate('scrollY'), 0, delta=1)
            self.assert_direct_live_frame('#embed')

    def test_changing_section_preserves_live_state_but_respects_scene_isolation(self):
        frame = self.page.locator("#embed")
        self.move(640)
        self.assertTrue(frame.evaluate("el => el.classList.contains('ch-live')"))
        self.assertTrue(frame.evaluate("el => !!el.closest('[inert]')"))
        self.assertEqual(frame.evaluate('el => getComputedStyle(el).visibility'), 'hidden')
        self.move(0)
        self.assert_direct_live_frame('#embed')
        self.assertFalse(frame.evaluate("el => !!el.closest('[inert]')"))

    def test_dynamically_loaded_embed_is_immediately_live(self):
        self.page.evaluate("""() => {
            const frame = document.createElement('iframe');
            frame.title = 'Late dashboard'; frame.id = 'late';
            frame.srcdoc = '<button>Late action</button>';
            document.querySelector('#first .wrap').appendChild(frame);
        }""")
        self.page.wait_for_function("document.querySelector('#late').classList.contains('ch-live')")
        self.assert_direct_live_frame('#late')
        self.page.frame_locator('#late').get_by_role('button', name='Late action').click()

    def test_embed_has_no_activation_toolbar_or_overlay_over_app_content(self):
        frame = self.assert_direct_live_frame('#embed')
        host_box, frame_box = self.page.locator('.orbmap').bounding_box(), frame.bounding_box()
        self.assertAlmostEqual(frame_box['y'], host_box['y'], delta=1)
        self.assertAlmostEqual(frame_box['width'], host_box['width'], delta=1)
        self.assertAlmostEqual(frame_box['height'], host_box['height'], delta=1)
        self.assertTrue(frame.evaluate('''el => {
            const r = el.getBoundingClientRect();
            return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === el;
        }'''))

    def test_replacing_partner_frame_keeps_direct_controls_without_toolbars(self):
        self.page.locator(".orbmap").evaluate("""host => {
            host.innerHTML = '<div class="lf-body" style="height:120px"></div>';
        }""")
        for index in range(3):
            self.page.locator(".lf-body").evaluate("""(host,index) => {
                const frame = document.createElement('iframe');
                frame.title = 'Partner ' + index;
                frame.srcdoc = '<button>Partner action</button>';
                host.replaceChildren(frame);
            }""", index)
            self.page.wait_for_function("""index => {
                const frame=document.querySelector('.lf-body iframe');
                return frame?.title === 'Partner ' + index && frame.classList.contains('ch-live');
            }""", arg=index)
            self.assertEqual(self.page.locator('.lf-body iframe').count(), 1)
            self.assert_direct_live_frame('.lf-body iframe')
            action = self.page.frame_locator('.lf-body iframe').get_by_role('button', name='Partner action')
            action.click()
            self.page.keyboard.press('Escape')
            self.assert_direct_live_frame('.lf-body iframe')
            self.assertTrue(action.evaluate('el => el === document.activeElement'))

    def test_frames_sharing_a_parent_are_both_directly_interactive(self):
        self.page.locator('.orbmap').evaluate("""host => {
            host.innerHTML = '<iframe title="First independent app" style="height:60px" srcdoc="<button>First</button>"></iframe>' +
                '<iframe title="Second independent app" style="height:60px" srcdoc="<button>Second</button>"></iframe>';
        }""")
        self.page.wait_for_function("document.querySelectorAll('.orbmap iframe.ch-live').length === 2")
        for name in ['First', 'Second']:
            selector = f'.orbmap iframe[title="{name} independent app"]'
            self.assert_direct_live_frame(selector)
            self.page.frame_locator(selector).get_by_role('button', name=name, exact=True).click()
            self.assertEqual(self.page.locator('.orbmap iframe.ch-live').count(), 2)

    def test_content_remains_available_without_the_section_controller(self):
        self.page.goto("about:blank")
        self.load(controller=False)
        self.assertEqual(self.page.locator("#second").evaluate(
            "el => getComputedStyle(el).visibility"), "visible")
        self.assertFalse(self.page.locator("#second").evaluate("el => el.inert"))


if __name__ == "__main__":
    unittest.main()
