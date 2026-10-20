"""September 30 homepage decisions: complete stories and deliberate playback.

Uses local production output; external services are blocked and not certified here.
"""
import unittest
from playwright.sync_api import sync_playwright
from _support import LocalSite


class HomeDeliveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.site = LocalSite()
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.site.close()

    def setUp(self):
        self.context = self.browser.new_context(viewport={'width':1280, 'height':720}, reduced_motion='reduce')
        self.context.route('**/*', lambda r: r.continue_() if r.request.url.startswith(self.site.url) else r.abort())
        self.page = self.context.new_page()

    def tearDown(self):
        self.context.close()

    def open_stories(self):
        self.page.goto('about:blank')
        self.page.goto(self.site.url+'#people', wait_until='domcontentloaded')
        self.page.wait_for_function("document.querySelector('[data-pp-fade]').classList.contains('is-js')")
        self.page.wait_for_timeout(350)

    def test_every_story_keeps_complete_photo_and_one_active_card_at_three_sizes(self):
        for width,height in ((1920,1080),(1280,720),(390,844)):
            self.page.set_viewport_size({'width':width,'height':height})
            self.open_stories()
            for direction, text in (('prev', 'Previous'), ('next', 'Next')):
                action = self.page.locator(f'[data-pp-{direction}]')
                self.assertTrue(action.is_visible())
                self.assertEqual(action.locator('svg').count(), 1)
                self.assertEqual(action.get_attribute('aria-label'), f'{text} story')
            for index in range(8):
                if index:
                    self.page.locator('[data-pp-next]').click()
                self.page.wait_for_function("[...document.querySelectorAll('.pp.is-on img')].every(i=>i.complete&&i.naturalWidth>0)")
                state = self.page.locator('[data-pp-fade]').evaluate('''el => {
                  const slides = [...el.children];
                  const visible = slides.filter(s => getComputedStyle(s).visibility === 'visible' && getComputedStyle(s).opacity === '1');
                  const image = el.querySelector('.is-on img');
                  const r = image.getBoundingClientRect();
                  return {visible: visible.length, interactive:slides.filter(s=>!s.inert).length,
                    fit:getComputedStyle(image).objectFit, imageTop:r.top, imageBottom:r.bottom,
                    imageLeft:r.left, imageRight:r.right, viewportWidth:innerWidth,
                    activeText:el.querySelector('.is-on blockquote').textContent.trim(),
                    overflow:document.documentElement.scrollWidth-innerWidth};
                }''')
                self.assertEqual(state['visible'],1,(width,index,state))
                self.assertEqual(state['interactive'],1,(width,index,state))
                self.assertEqual(state['fit'],'contain',(width,index,state))
                self.assertGreaterEqual(state['imageLeft'],-1)
                self.assertLessEqual(state['imageRight'],width+1)
                self.assertGreater(state['imageTop'],60)
                self.assertLessEqual(state['imageBottom'],height)
                self.assertLessEqual(state['overflow'],1)
                self.assertTrue(state['activeText'])
            self.assertEqual(self.page.locator('[data-pp-count]').inner_text(),'8 / 8')

    def test_offline_data_hub_explanation_keeps_chart_and_recovery_available(self):
        for width,height in ((1280,720),(390,844),(375,667)):
            with self.subTest(viewport=(width,height)):
                self.page.set_viewport_size({'width':width,'height':height})
                self.page.goto(self.site.url+'#products',wait_until='domcontentloaded')
                self.page.wait_for_function('!!window.chStory')
                self.page.wait_for_timeout(300)
                self.page.locator('#products [data-eng-tab]').nth(2).click()
                self.page.wait_for_timeout(350)
                self.page.evaluate("""() => {
                    const frames=chStory.frames().filter(f=>f.els[0].id==='products');
                    const media=frames.find(f=>f.scene?.hasAttribute('data-eng-view'));
                    if(media) scrollTo({top:media.y,behavior:'instant'});
                }""")
                self.page.wait_for_function("document.querySelector('#products .dv-wait')?.textContent.includes('not reachable')")
                view=self.page.locator('#products .dv-view')
                help_button=view.locator('[data-dv-help]')
                if 'is-read' in view.get_attribute('class'):
                    help_button.click()
                chart=view.locator('.dv-chart')
                self.assertEqual(chart.evaluate('e=>getComputedStyle(e).visibility'),'visible')
                self.assertFalse(chart.evaluate('e=>e.inert'))
                self.assertFalse(view.locator('.dv-note').evaluate('e=>!!e.closest(\".dv-frame\")'))
                note=view.locator('.dv-note')
                self.assertTrue(note.is_visible())
                self.assertEqual(help_button.get_attribute('aria-expanded'),'true')
                self.assertGreaterEqual(note.bounding_box()['y'],
                    chart.bounding_box()['y']+chart.bounding_box()['height']-1)
                view.locator('.dv-wait a').evaluate('e=>e.focus()')
                self.assertTrue(view.locator('.dv-wait a').evaluate('e=>e===document.activeElement'))
                help_button.click()
                self.assertEqual(chart.evaluate('e=>getComputedStyle(e).visibility'),'visible')
                self.assertFalse(chart.evaluate('e=>e.inert'))
                self.assertTrue(note.is_hidden())
                self.assertEqual(help_button.get_attribute('aria-expanded'),'false')
                bounds=chart.bounding_box()
                self.assertLessEqual(bounds['x']+bounds['width'],width+1)
                self.assertGreaterEqual(bounds['x'],-1)
                recovery=view.locator('.dv-cap a').bounding_box()
                help_bounds=help_button.bounding_box()
                self.assertTrue(help_bounds['x']>=recovery['x']+recovery['width']+10 or
                    help_bounds['y']>=recovery['y']+recovery['height']+2,
                    (recovery,help_bounds))

    def test_horizontal_touch_and_keyboard_keep_vertical_story_ownership(self):
        self.page.set_viewport_size({'width':390,'height':844})
        self.open_stories()
        y = self.page.evaluate('scrollY')
        self.page.locator('[data-pp-fade]').evaluate('''el=>{
          const start = new Touch({identifier:1,target:el,clientX:300,clientY:320});
          const end = new Touch({identifier:1,target:el,clientX:100,clientY:325});
          el.dispatchEvent(new TouchEvent('touchstart',{touches:[start],changedTouches:[start],bubbles:true}));
          el.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[end],bubbles:true}));
        }''')
        self.assertEqual(self.page.locator('[data-pp-count]').inner_text(),'2 / 8')
        self.assertAlmostEqual(self.page.evaluate('scrollY'),y,delta=2)
        self.page.locator('[data-pp-fade]').focus()
        self.page.keyboard.press('ArrowRight')
        self.assertEqual(self.page.locator('[data-pp-count]').inner_text(),'3 / 8')
        self.assertAlmostEqual(self.page.evaluate('scrollY'),y,delta=2)

    def test_phone_identity_is_one_centered_story_before_engage(self):
        self.page.set_viewport_size({'width':390,'height':844})
        self.page.goto(self.site.url+'#problem',wait_until='domcontentloaded')
        self.page.wait_for_function('!!window.chStory')
        self.page.wait_for_timeout(600)
        state=self.page.evaluate('''()=>{
            const frames=chStory.frames().filter(f=>f.els[0].id==='problem');
            const owners=[...new Set(frames.map(f=>f.scene))];
            const content=document.querySelector('#problem [data-identity-content]');
            const r=content.getBoundingClientRect();
            return {owners:owners.length,identityOwner:owners[0]===content,
                positions:frames.map(f=>f.y),left:r.left,right:r.right};
        }''')
        self.assertEqual(state['owners'],1)
        self.assertTrue(state['identityOwner'])
        self.assertAlmostEqual((state['left']+state['right'])/2,195,delta=2)
        self.assertEqual(self.page.locator('#problem [data-roll] img').count(),5)
        self.assertEqual(self.page.locator('#problem [data-platform-explanation], #problem [data-conn]').count(),0)
        self.assertTrue(self.page.locator('#why-h').is_visible())
        # Any short-screen reading tail stays with the same identity. It is never
        # a separate right-hand diagram; ordinary navigation then reaches Engage.
        for _ in state['positions']:
            self.page.keyboard.press('PageDown')
            self.page.wait_for_timeout(100)
        self.assertEqual(self.page.evaluate('chStory.current().els[0].id'),'engage')

    def test_first_visit_phone_opening_fits_below_current_header(self):
        for width,height in ((390,844),(375,667),(360,640)):
            with self.subTest(viewport=(width,height)):
                self.page.set_viewport_size({'width':width,'height':height})
                self.page.goto(self.site.url,wait_until='domcontentloaded')
                self.page.wait_for_function('!!window.chStory')
                self.page.wait_for_timeout(400)
                advance = self.page.get_by_role('button', name='Explore Community Hub')
                self.assertEqual(advance.inner_text().strip(), 'Explore')
                state=self.page.evaluate('''()=>({
                    top:document.querySelector('.hv').getBoundingClientRect().top,
                    header:document.querySelector('#hdr').getBoundingClientRect().bottom,
                    bottom:document.querySelector('.hv').getBoundingClientRect().bottom,
                    text:document.querySelector('.hv-h').getBoundingClientRect().bottom,
                    advance:document.querySelector('.hv-next').getBoundingClientRect().toJSON(),
                    parts:chStory.frames().filter(f=>f.els[0].matches('.hv')).length,
                    fit:getComputedStyle(document.querySelector('.hv-vid')).objectFit,
                    overflow:document.documentElement.scrollWidth-innerWidth
                })''')
                self.assertGreaterEqual(state['top'],state['header']-1)
                self.assertLessEqual(state['bottom'],height+1)
                self.assertLess(state['text'],state['advance']['top'])
                self.assertLessEqual(state['advance']['bottom'],height)
                self.assertEqual(state['parts'],1)
                self.assertEqual(state['fit'],'cover')
                self.assertLessEqual(state['overflow'],1)

    def test_homepage_building_demo_matches_its_explanation(self):
        self.page.goto(self.site.url,wait_until='domcontentloaded')
        panel=self.page.locator('#products [data-eng-panel]').first
        source=panel.locator('iframe').evaluate('f=>f.getAttribute("src")||f.dataset.deferSrc')
        self.assertEqual(source,'https://oberlin.communityhub.cloud/dh-public/oc-embed?active-page=exploreData&active-data-dashboard=815')
        self.assertEqual(panel.locator('.native-caption a').get_attribute('href'),source)
        self.assertEqual(panel.locator('.native-scroll[data-scroll-owner]').count(),1)
        self.assertEqual(panel.locator('.embed-preview-image').count(),0)
        heat=self.page.locator('#dvp-heat')
        self.assertEqual(heat.get_attribute('role'),'region')
        self.assertIn('Whole city electricity',heat.get_attribute('aria-label'))

    def test_engage_native_selector_reaches_all_three_products_on_desktop_and_phone(self):
        products = [('Digital Signage','digital-signage.html'),
                    ('Phone App','phone-app.html'),
                    ('Web Embeddables','web-embeddables.html')]
        for width,height in ((1280,720),(390,844)):
            with self.subTest(viewport=(width,height)):
                self.page.set_viewport_size({'width':width,'height':height})
                self.page.goto(self.site.url+'#engage',wait_until='load')
                self.page.wait_for_function('!!window.chStory')
                self.page.wait_for_timeout(400)
                tabs = self.page.locator('#engage [data-eng-tab]')
                self.assertEqual(tabs.count(),3)
                self.assertEqual(tabs.all_text_contents(),[name for name,_ in products])
                start_y = self.page.evaluate('scrollY')
                for index,(_,href) in enumerate(products):
                    tabs.nth(index).click()
                    self.page.wait_for_function("i=>document.querySelector('#engage').dataset.i===String(i)",arg=index)
                    panel = self.page.locator('#engage [data-eng-panel]').nth(index)
                    self.assertTrue(panel.locator(f'.eng-go a[href="{href}"]').is_visible())
                    state = panel.evaluate('''el=>{const r=el.getBoundingClientRect();return {
                        left:r.left,right:r.right,inert:el.inert,
                        owner:chStory.current().els[0].id,
                        overflow:document.documentElement.scrollWidth-innerWidth};}''')
                    self.assertFalse(state['inert'])
                    self.assertGreaterEqual(state['left'],-1)
                    self.assertLessEqual(state['right'],width+1)
                    self.assertEqual(state['owner'],'engage')
                    self.assertLessEqual(state['overflow'],1)
                    if width < 901:
                        self.assertAlmostEqual(self.page.evaluate('scrollY'),start_y,delta=2)
                self.assertEqual(self.page.evaluate('chStory.current().els[0].id'),'engage')

    def test_educate_and_motivate_keep_keyboard_operated_tabs(self):
        for width,height in ((1280,720),(390,844)):
            self.page.set_viewport_size({'width':width,'height':height})
            for section_id in ('products','motivate'):
                with self.subTest(viewport=(width,height),section=section_id):
                    self.page.goto(self.site.url+'#'+section_id,wait_until='load')
                    self.page.wait_for_function('!!window.chStory')
                    self.page.wait_for_timeout(400)
                    section = self.page.locator('#'+section_id)
                    tabs = section.locator('[data-eng-tab]')
                    count = tabs.count()
                    self.assertGreaterEqual(count,2)
                    self.assertEqual(section.locator('select[data-eng-select]').count(),0)
                    tabs.first.evaluate('el=>el.focus({preventScroll:true})')
                    self.page.keyboard.press('End')
                    self.page.wait_for_function("([id,i])=>document.getElementById(id).dataset.i===String(i)",arg=[section_id,count-1])
                    self.assertEqual(tabs.last.get_attribute('aria-selected'),'true')
                    self.page.keyboard.press('ArrowLeft')
                    self.page.wait_for_function("([id,i])=>document.getElementById(id).dataset.i===String(i)",arg=[section_id,count-2])
                    self.assertEqual(tabs.nth(count-2).get_attribute('aria-selected'),'true')
                    self.assertEqual(section.locator('[data-eng-tab][aria-selected="true"]').count(),1)
                    self.assertEqual(self.page.evaluate('chStory.current().els[0].id'),section_id)

    def test_normal_motion_crossfade_never_overlays_two_quotes(self):
        self.page.emulate_media(reduced_motion='no-preference')
        self.open_stories()
        self.page.locator('[data-pp-next]').click()
        self.page.wait_for_timeout(100)
        visible=self.page.locator('[data-pp-fade] blockquote').evaluate_all("items=>items.filter(el=>getComputedStyle(el).visibility==='visible').length")
        self.assertEqual(visible,1)
        self.assertEqual(self.page.locator('[data-pp-count]').inner_text(),'2 / 8')

    def test_autoplay_waits_until_visible_and_focus_remains_paused_after_hover_leaves(self):
        self.page.emulate_media(reduced_motion='no-preference')
        self.page.clock.install()
        self.page.goto(self.site.url,wait_until='domcontentloaded')
        self.page.wait_for_function("document.querySelector('[data-pp-fade]').classList.contains('is-js')")
        self.page.clock.run_for(7500)
        self.assertEqual(self.page.locator('[data-pp-count]').text_content(),'1 / 8')
        self.page.evaluate("location.hash='people'")
        self.page.wait_for_timeout(300)
        self.page.clock.run_for(1500)
        self.page.clock.run_for(7500)
        self.assertEqual(self.page.locator('[data-pp-count]').text_content(),'2 / 8')
        self.page.locator('[data-pp-fade]').focus()
        self.page.locator('[data-pp-fade]').dispatch_event('mouseenter')
        self.page.locator('[data-pp-fade]').dispatch_event('mouseleave')
        self.page.clock.run_for(7500)
        self.assertEqual(self.page.locator('[data-pp-count]').text_content(),'2 / 8')
        self.page.evaluate('document.activeElement.blur()')
        self.page.emulate_media(reduced_motion='reduce')
        self.page.wait_for_function("document.querySelector('[data-pp-play]').getAttribute('aria-label') === 'Play stories automatically'")
        self.page.clock.run_for(7500)
        self.assertEqual(self.page.locator('[data-pp-count]').text_content(),'2 / 8')
        self.assertEqual(self.page.locator('[data-pp-play]').get_attribute('aria-label'),'Play stories automatically')


if __name__ == '__main__':
    unittest.main()
