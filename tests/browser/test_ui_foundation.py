"""Shared UI contracts and real Contact/Pricing integration; no email is sent."""
import json
import unittest
from pathlib import Path
from lxml import html
from playwright.sync_api import sync_playwright, expect
from _support import LocalSite, SITE, RUNTIME

ARTIFACTS = Path(__file__).resolve().parents[1] / 'artifacts' / 'ui-foundation'

class UIFoundationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.site = LocalSite()
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch()
        ARTIFACTS.mkdir(parents=True, exist_ok=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.site.close()

    def setUp(self):
        self.context = self.browser.new_context(viewport={'width':1280,'height':720}, reduced_motion='reduce')
        self.context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(self.site.url) else route.abort())
        self.page = self.context.new_page()

    def tearDown(self):
        self.context.close()

    def fixture(self, route='contact', form_id='contact-form', status_id='contact-out'):
        tree = html.fromstring((SITE / f'{route}.html').read_text())
        form = html.tostring(tree.get_element_by_id(form_id), encoding='unicode')
        css = (SITE.parent / 'src/styles/ui.css').read_text()
        self.page.set_content(f'<html><head><style>{css}</style></head><body>{form}</body></html>')
        self.page.add_script_tag(path=str(RUNTIME / 'ui.js'))
        self.page.evaluate('''args => {
            window.opened = [];
            window.cleanup = CommunityHubFixture_ui.enhanceEmailForm(document.getElementById(args.form), {
                subject: 'Community Hub demo', status: document.getElementById(args.status),
                fields: [{name:'name',label:'Name'},{name:'org',label:'Organization'},{name:'msg',label:'Message'}],
                open: url => window.opened.push(url)
            });
        }''', {'form': form_id, 'status': status_id})

    def test_required_fields_errors_focus_repair_and_email_encoding(self):
        self.fixture()
        self.page.get_by_role('button', name='Prepare my email').click()
        expect(self.page.locator('#contact-name')).to_be_focused()
        expect(self.page.locator('#contact-name')).to_have_attribute('aria-invalid', 'true')
        self.assertEqual(self.page.evaluate('opened.length'), 0)
        self.page.locator('#contact-name').fill('   ')
        self.page.locator('#contact-org').fill('Example & Co')
        self.page.get_by_role('button', name='Prepare my email').click()
        self.assertEqual(self.page.evaluate('opened.length'), 0)
        self.page.locator('#contact-name').fill('A < B')
        expect(self.page.locator('#contact-name-error')).to_be_hidden()
        self.page.locator('#contact-msg').fill('Hello & goodbye\n<script>not markup</script>')
        self.page.get_by_role('button', name='Prepare my email').click()
        self.assertEqual(self.page.evaluate('opened.length'), 1)
        url = self.page.evaluate('opened[0]')
        self.assertIn('Example%20%26%20Co', url)
        self.assertIn('%3Cscript%3E', url)
        expect(self.page.locator('#contact-out')).to_contain_text('Nothing has been sent')
        expect(self.page.get_by_role('link', name='Open your email app')).to_have_attribute('href', url)
        self.page.locator('#contact-msg').fill('Changed')
        expect(self.page.get_by_role('link', name='Open your email app')).to_have_count(0)

    def test_long_draft_is_preserved_without_launching_truncated_mailto(self):
        self.fixture()
        self.page.locator('#contact-name').fill('Example')
        self.page.locator('#contact-org').fill('Example organization')
        long_message = 'Long message 日本語 ' * 100
        self.page.locator('#contact-msg').fill(long_message)
        self.page.get_by_role('button', name='Prepare my email').click()
        self.assertEqual(self.page.evaluate('opened.length'), 0)
        expect(self.page.get_by_label('Copy this message into your email')).to_have_value('Name: Example\n\nOrganization: Example organization\n\nMessage: ' + long_message.strip())
        self.assertNotIn('&body=', self.page.get_by_role('link', name='Open your email app').get_attribute('href'))

    def test_pricing_uses_same_validation_and_native_select(self):
        self.fixture('pricing', 'quote-form', 'quote-out')
        self.page.get_by_role('button', name='Prepare my email').click()
        expect(self.page.locator('#quote-name')).to_be_focused()
        self.page.get_by_label('What you are pricing').select_option('Not sure yet')
        expect(self.page.get_by_label('What you are pricing')).to_have_value('Not sure yet')

    def test_disabled_required_controls_do_not_block_native_form_validation(self):
        self.fixture()
        self.page.locator('#contact-name').evaluate('e=>e.disabled=true')
        self.page.locator('#contact-org').fill('Example organization')
        self.page.get_by_role('button',name='Prepare my email').click()
        self.assertEqual(self.page.evaluate('opened.length'),1)
        expect(self.page.locator('#contact-name-error')).to_be_hidden()

    def test_loading_button_restores_original_disabled_state_and_text(self):
        self.fixture()
        result = self.page.evaluate('''() => {
            const button = document.querySelector('button');
            button.disabled = true;
            const ui = CommunityHubFixture_ui;
            ui.setButtonLoading(button,true,'Working…');
            ui.setButtonLoading(button,true,'Still working…');
            const during = [button.disabled,button.getAttribute('aria-busy'),button.textContent];
            ui.setButtonLoading(button,false);
            return {during,after:[button.disabled,button.hasAttribute('aria-busy'),button.textContent]};
        }''')
        self.assertEqual(result['during'], [True,'true','Still working…'])
        self.assertEqual(result['after'], [True,False,'Prepare my email'])

    def test_initial_server_rendered_loading_button_can_finish(self):
        self.fixture()
        result = self.page.evaluate('''() => {
            const b=document.querySelector('button');
            b.dataset.uiLabel='Save changes';b.dataset.uiDisabled='false';b.disabled=true;
            b.setAttribute('aria-busy','true');b.querySelector('[data-ui-button-label]').textContent='Saving…';
            CommunityHubFixture_ui.setButtonLoading(b,false);
            return [b.disabled,b.textContent,b.hasAttribute('aria-busy')];
        }''')
        self.assertEqual(result,[False,'Save changes',False])

    def test_hidden_scene_arrow_is_absent_from_accessibility_queries(self):
        self.page.set_viewport_size({'width':375,'height':667})
        self.page.goto(self.site.url+'contact.html',wait_until='domcontentloaded')
        self.page.wait_for_function('window.chStory && window.chStory.frames().length')
        # A screen with a next one (the footer counts) shows the circle; the footer screen hides it.
        expect(self.page.locator('.page-next')).to_have_attribute('aria-hidden','false')
        expect(self.page.get_by_role('button',name='Next section',exact=True)).to_have_count(1)
        self.page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
        expect(self.page.locator('.page-next')).to_have_attribute('aria-hidden','true')
        expect(self.page.get_by_role('button',name='Next section',exact=True)).to_have_count(0)

    def async_fixture(self, timeout=15000):
        self.page.set_content('<div id="status" role="status" aria-live="polite"><p data-ui-message></p></div><div id="content" hidden></div><button id="retry" hidden>Try again</button>')
        self.page.add_script_tag(path=str(RUNTIME / 'ui.js'))
        self.page.evaluate('''timeout => {
            window.requests=[];
            window.region=CommunityHubFixture_ui.createAsyncRegion({
                status:document.getElementById('status'),content:document.getElementById('content'),retry:document.getElementById('retry'),
                timeoutMs:timeout,
                load:signal => new Promise((resolve,reject)=>requests.push({resolve,reject,signal})),
                isEmpty:items=>items.length===0,
                render:items=>{const p=document.createElement('p');p.textContent=items.join(', ');return p;},
                messages:{loading:'Loading',empty:'No results',error:'Could not load. Try again.',success:'Results loaded'}
            });
            void region.reload();
        }''', timeout)

    def test_async_states_retry_focus_and_untrusted_text(self):
        self.async_fixture()
        expect(self.page.locator('#status')).to_have_text('Loading')
        expect(self.page.locator('#content')).to_have_attribute('aria-busy','true')
        self.page.evaluate('requests[0].resolve([])')
        expect(self.page.locator('#status')).to_have_text('No results')
        self.page.locator('#retry').click()
        self.page.evaluate('requests[1].reject(new Error("bad"))')
        expect(self.page.locator('#status')).to_contain_text('Could not load')
        self.page.locator('#retry').click()
        self.page.evaluate('requests[2].resolve(["<img src=x onerror=alert(1)>"])')
        expect(self.page.locator('#content')).to_be_visible()
        expect(self.page.locator('#content')).to_be_focused()
        expect(self.page.locator('#content img')).to_have_count(0)
        expect(self.page.locator('#retry')).to_be_hidden()

    def test_superseded_responses_and_disposed_loaders_cannot_replace_content(self):
        self.async_fixture()
        self.page.evaluate('void region.reload()')
        self.assertTrue(self.page.evaluate('requests[0].signal.aborted'))
        self.page.evaluate('requests[1].resolve(["new"])')
        expect(self.page.locator('#content')).to_have_text('new')
        self.page.evaluate('requests[0].resolve(["old"])')
        expect(self.page.locator('#content')).to_have_text('new')
        self.page.evaluate('void region.reload()')
        self.page.evaluate('region.dispose();requests[2].resolve(["disposed"])')
        expect(self.page.locator('#content')).to_have_text('new')
        self.assertFalse(self.page.locator('#content').get_attribute('aria-busy'))

    def test_never_resolving_loader_times_out_and_can_retry(self):
        self.async_fixture(30)
        expect(self.page.locator('#status')).to_contain_text('Could not load')
        self.assertTrue(self.page.evaluate('requests[0].signal.aborted'))
        expect(self.page.locator('#retry')).to_be_visible()
        self.assertFalse(self.page.locator('#content').get_attribute('aria-busy'))

    def test_no_javascript_keeps_direct_email_and_prevents_get_submission(self):
        context = self.browser.new_context(java_script_enabled=False)
        context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(self.site.url) else route.abort())
        page = context.new_page()
        page.goto(self.site.url+'contact.html',wait_until='domcontentloaded')
        expect(page.get_by_role('button',name='Prepare my email')).to_be_disabled()
        expect(page.locator('#contact-form noscript a')).to_be_visible()
        context.close()

    def test_production_contact_and_pricing_keyboard_validation_and_responsive_geometry(self):
        evidence=[]
        for route,prefix in [('contact','contact'),('pricing','quote')]:
            for width,height in [(1280,720),(390,844),(375,667)]:
                self.page.set_viewport_size({'width':width,'height':height})
                self.page.goto(self.site.url+route+'.html'+('#quote' if route=='pricing' else ''),wait_until='domcontentloaded')
                button=self.page.locator(f'#{prefix}-form button[type="submit"]')
                self.page.wait_for_function('window.chStory && window.chStory.frames().length > 0')
                for _ in range(20):
                    if button.is_visible() and not button.evaluate('e=>!!e.closest("[inert]")'):
                        break
                    self.page.mouse.move(width / 2, height / 2)
                    self.page.mouse.wheel(0, 650)
                    self.page.wait_for_timeout(250)
                self.page.locator(f'#{prefix}-name').fill('')
                self.page.locator(f'#{prefix}-org').fill('')
                button.focus()
                expect(button).to_be_enabled()
                button.press('Enter')
                expect(self.page.locator(f'#{prefix}-name')).to_be_focused()
                expect(self.page.locator(f'#{prefix}-out')).to_contain_text('Please check')
                self.page.locator(f'#{prefix}-org').fill('Example organization')
                self.page.locator(f'#{prefix}-name').fill('Example visitor')
                boxes=self.page.locator(f'#{prefix}-form .ui-field-control').evaluate_all('(nodes)=>nodes.map(e=>{const b=e.getBoundingClientRect();return {id:e.id,x:b.x,right:b.right,height:b.height,width:b.width};})')
                for box in boxes:
                    self.assertGreaterEqual(box['height'],44,box)
                    self.assertGreaterEqual(box['x'],-1,box)
                    self.assertLessEqual(box['right'],width+1,box)
                self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width+1)
                self.page.screenshot(path=str(ARTIFACTS/f'{route}-{width}.png'))
                evidence.append({'route':route,'viewport':[width,height],'controls':boxes})
        (ARTIFACTS/'geometry.json').write_text(json.dumps(evidence,indent=2))

    def test_new_recovery_link_accepts_immediate_focus_without_scene_race(self):
        self.page.set_viewport_size({'width':375,'height':667})
        for route,prefix in [('contact','contact'),('pricing','quote')]:
            self.page.goto(self.site.url+route+'.html'+('#quote' if route=='pricing' else ''),wait_until='load')
            self.page.wait_for_function('window.chStory && window.chStory.frames().length')
            form=self.page.locator(f'#{prefix}-form')
            for _ in range(20):
                if not form.evaluate('e=>!!e.closest("[inert]")'):
                    break
                self.page.mouse.move(180,500)
                self.page.mouse.wheel(0,650)
                self.page.wait_for_timeout(250)
            self.page.locator(f'#{prefix}-name').fill('Example visitor')
            self.page.locator(f'#{prefix}-org').fill('Example organization')
            self.page.locator(f'#{prefix}-msg').fill('Long draft 日本語 '*120)
            # Intentionally focus in the submit task, before ResizeObserver can
            # settle the story. A deferred layout update previously hid the form.
            state=self.page.evaluate('''prefix=>{
                const form=document.getElementById(prefix+'-form');
                form.querySelector('button[type="submit"]').click();
                const link=form.querySelector('[data-email-recovery] a');
                link.focus();const r=link.getBoundingClientRect();
                return {focused:document.activeElement===link,inert:!!link.closest('[inert]'),top:r.top,bottom:r.bottom};
            }''',prefix)
            self.assertTrue(state['focused'],state)
            self.assertFalse(state['inert'],state)
            self.assertGreaterEqual(state['top'],77,state)
            self.assertLessEqual(state['bottom'],667,state)
            expect(form.get_by_role('link',name='Open your email app')).to_be_focused()

if __name__ == '__main__': unittest.main()
