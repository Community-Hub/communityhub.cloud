"""October 1 agreed direct product/dashboard entry and partner-context behavior.

Remote dashboards are deterministic HTML stubs here; live availability is a
separate check. Test what the host site controls: destination, loading trigger,
selection, accessible controls, content geometry and privacy.
"""
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright
from _support import LocalSite


class DeliveryInteriorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = LocalSite()
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.server.close()

    def setUp(self):
        self.context = self.browser.new_context(viewport={"width": 1280, "height": 720}, reduced_motion="reduce")
        def route(request):
            if request.request.url.startswith(self.server.url):
                request.continue_()
            elif request.request.resource_type == 'document' and '/dh-public/' in request.request.url:
                request.fulfill(status=200, content_type='text/html', body='''<html><body>Public dashboard fixture
                    <button onclick="document.body.dataset.activated='true'">Dashboard fixture action</button>
                    </body></html>''')
            else:
                request.abort()
        self.context.route('**/*', route)
        self.page = self.context.new_page()
        self.page.set_default_timeout(5000)

    def tearDown(self):
        self.context.close()

    def open(self, path):
        self.page.goto(self.server.url + path, wait_until='domcontentloaded')
        self.page.wait_for_timeout(180)

    def test_product_entry_exposes_readable_product_links_without_splash(self):
        self.open('products.html')
        cards = self.page.locator('.product-category a[href$=".html"]')
        self.assertEqual(cards.count(), 9)
        self.assertEqual(self.page.locator('.product-directory a.product-how-link[href="#how"]').count(), 1)
        self.assertEqual(self.page.locator('#main > section').first.get_attribute('id'), 'groups')
        geometry = cards.evaluate_all('items => items.map(item => {const r=item.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,overflow:item.scrollWidth-item.clientWidth};})')
        for card in geometry:
            self.assertGreaterEqual(card['top'], 0)
            self.assertLessEqual(card['bottom'], 720)
            self.assertGreaterEqual(card['height'], 44)
            self.assertLessEqual(card['overflow'], 1)
        for category in self.page.locator('.product-category').all():
            rows = category.locator('a[href$=".html"]').evaluate_all('items => items.map(item => {const r=item.getBoundingClientRect();return {top:r.top,bottom:r.bottom};})')
            self.assertTrue(all(b['top'] >= a['bottom'] - 1 for a,b in zip(rows,rows[1:])))
        for link in cards.all():
            self.assertTrue(link.locator('b').inner_text())
            self.assertTrue(link.locator('small').inner_text())

    def test_products_navigation_opens_the_comparison_immediately(self):
        self.open('index.html')
        self.page.get_by_role('button',name='Show the Products menu',exact=True).click()
        self.page.locator('#dd-products').get_by_role('link',name='See all 9 products',exact=True).click()
        self.page.wait_for_url('**/products.html')
        self.page.wait_for_function('!!window.chStory')
        self.page.evaluate('document.fonts.ready')
        self.page.wait_for_timeout(200)
        self.assertEqual(self.page.locator('#main > section').first.get_attribute('id'),'groups')
        self.assertEqual(self.page.evaluate('chStory.current().els[0].id'),'groups')
        cards = self.page.locator('.product-category a[href$=".html"]')
        self.assertEqual(cards.count(),9)
        self.assertEqual(self.page.locator('.product-directory a.product-how-link[href="#how"]').count(),1)
        for card in cards.all():
            self.assertTrue(card.is_visible())
            self.assertTrue(card.locator('b').inner_text().strip())
            self.assertTrue(card.locator('small').inner_text().strip())
            box = card.bounding_box()
            self.assertGreaterEqual(box['y'],self.page.locator('#hdr').bounding_box()['height'])
            self.assertLessEqual(box['y']+box['height'],720)
            self.assertGreaterEqual(box['height'],44)

    def test_see_it_live_navigation_opens_selected_glsc_dashboard(self):
        self.open('index.html')
        self.page.get_by_role('button',name='Show the See it live menu',exact=True).click()
        self.page.locator('#dd-live a[href="dashboards.html#great-lakes-science-center"]').click()
        self.page.wait_for_url('**/dashboards.html#great-lakes-science-center')
        self.page.wait_for_function('!!window.chStory')
        panel = self.page.locator('[data-dashboard-panel="great-lakes-science-center"]')
        panel.locator('iframe').wait_for(state='attached')
        self.page.wait_for_timeout(250)
        self.assertTrue(panel.is_visible())
        self.assertIn('cleveland.communityhub.cloud/dh-public/glsc-embed',panel.locator('iframe').get_attribute('src'))
        self.assertEqual(self.page.locator('[data-dashboard-key="great-lakes-science-center"]').get_attribute('aria-selected'),'true')
        self.assertEqual(self.page.evaluate('chStory.current().els[0].id'),'gallery')
        self.assertLess(panel.locator('iframe').bounding_box()['y'],500)
        for element in (self.page.locator('#gallery h1'),self.page.locator('[data-dashboard-gallery] [role=tablist]')):
            box = element.bounding_box()
            self.assertGreaterEqual(box['y'],self.page.locator('#hdr').bounding_box()['height']-1)
            self.assertLessEqual(box['y']+box['height'],720)

    def assert_complete_opening_example(self, image_selector, height):
        opening = self.page.locator('#main > section').first
        self.assertTrue(opening.evaluate('el=>el.matches(".product-opening")'))
        self.assertEqual(opening.locator('.page-intro h1').count(),1)
        self.assertEqual(self.page.locator('#main > .page-intro').count(),0)
        self.assertTrue(opening.locator('.page-intro h1').inner_text().strip())
        image = opening.locator(image_selector)
        self.assertEqual(image.count(),1)
        image.wait_for(state='visible')
        self.page.wait_for_function('''selector=>{
            const img=document.querySelector('.product-opening '+selector);
            return img.complete && img.naturalWidth>0;
        }''',arg=image_selector)
        self.page.evaluate('document.fonts.ready')
        self.page.wait_for_timeout(100)
        state = image.evaluate('''el=>{const r=el.getBoundingClientRect();return {
            top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height,
            viewport:innerWidth,fit:getComputedStyle(el).objectFit,
            header:document.querySelector('#hdr').getBoundingClientRect().bottom};}''')
        self.assertGreater(state['height'],60,state)
        self.assertGreaterEqual(state['top'],state['header']-1,state)
        self.assertLessEqual(state['bottom'],height+1,state)
        self.assertGreaterEqual(state['left'],-1,state)
        self.assertLessEqual(state['right'],state['viewport']+1,state)
        self.assertEqual(state['fit'],'contain',state)
        self.assertEqual(self.page.evaluate('chStory.frames().filter(f=>f.els[0].matches(".product-opening")).length'),1)

    def test_product_titles_share_a_complete_story_with_source_examples(self):
        for route,image in [
            ('the-hub.html','.opening-gallery [data-sp]:not([hidden]) img'),
            ('community-calendar.html','img[src="assets/calendar.png"]')]:
            with self.subTest(route=route):
                self.open(route)
                self.assert_complete_opening_example(image,720)

    def test_dashboard_selection_embeds_immediately_and_preserves_partner_context(self):
        self.open('dashboards.html')
        panels = self.page.locator('[data-dashboard-panel]')
        self.assertEqual(panels.count(), 4)
        destinations = {
            'city-of-oberlin':'https://cityofoberlin.com/city-government/departments/sustainability/',
            'oberlin-city-schools':'https://www.oberlinschools.net/#h.78ca501b910ca40b_115',
            'oberlin-college':'https://www.oberlin.edu/arts-and-sciences/departments/environmental-studies/dashboard',
            'great-lakes-science-center':'https://greatscience.com/explore/exhibits/environmental-dashboard',
        }
        for key, destination in destinations.items():
            self.page.locator(f'[data-dashboard-key="{key}"]').click()
            panel = self.page.locator(f'[data-dashboard-panel="{key}"]')
            panel.locator('iframe').wait_for(state='attached')
            self.page.wait_for_function("key => getComputedStyle(document.querySelector('[data-dashboard-panel=\"' + key + '\"] iframe')).opacity === '1'", arg=key)
            self.assertEqual(self.page.locator('[data-dashboard-panel]:not([hidden])').count(), 1)
            partner = panel.locator('a.lf-org')
            self.assertIn('Visit partner page',partner.inner_text())
            self.assertTrue(partner.get_attribute('aria-label').startswith('Visit '))
            self.assertEqual(partner.get_attribute('href'),destination)
            self.assertEqual(partner.get_attribute('target'), '_blank')
            self.assertEqual(set(partner.get_attribute('rel').split()), {'noopener', 'noreferrer'})
            self.assertNotIn('communityhub.cloud', partner.get_attribute('href'))
            self.assertIn('If the dashboard is blank or blocked', panel.inner_text())
            self.assertLess(panel.locator('iframe').bounding_box()['y'], 500)
        self.assertNotIn('Hamilton', self.page.locator('[role=tablist]').inner_text())

    def test_slow_dashboard_keeps_loading_feedback_and_an_external_recovery(self):
        pending = []
        self.context.route('**/dh-public/**', lambda route: pending.append(route))
        self.page.clock.install()
        self.open('dashboards.html')
        panel = self.page.locator('[data-dashboard-panel="city-of-oberlin"]')
        self.assertIn('Loading City of Oberlin', panel.get_by_role('status').inner_text())
        self.page.clock.fast_forward(12001)
        status = panel.get_by_role('status')
        self.assertIn('taking longer to load', status.inner_text())
        recovery = status.get_by_role('link')
        self.assertEqual(recovery.get_attribute('target'), '_blank')
        self.assertEqual(set(recovery.get_attribute('rel').split()), {'noopener', 'noreferrer'})
        self.assertIn('/dh-public/city-of-oberlin', recovery.get_attribute('href'))
        self.assertTrue(panel.get_by_role('link', name='Visit City of Oberlin Sustainability', exact=True).is_visible())
        for request in pending:
            request.abort()

    def test_building_dashboard_is_directly_live_and_keeps_external_recovery(self):
        for width, height in [(1280, 720), (375, 667)]:
            with self.subTest(width=width):
                self.page.set_viewport_size({'width': width, 'height': height})
                self.open('data-dashboard.html#building')
                # Short phones give the description and the complete live view
                # separate authored scenes; reach the live owner by navigation.
                for _ in range(40):
                    state = self.page.evaluate('''()=>{
                        const host=document.querySelector('#building .live-frame');
                        const frames=chStory.frames(), current=frames.indexOf(chStory.current());
                        const target=frames.findIndex(f=>f.scene?.contains(host));
                        return {current,target};
                    }''')
                    if state['current'] == state['target']:
                        break
                    self.page.evaluate('direction=>chStory.go(direction)', 1 if state['current'] < state['target'] else -1)
                    self.page.wait_for_timeout(50)
                self.assertEqual(state['current'],state['target'],state)
                host = self.page.locator('#building .live-frame')
                frame = host.locator('iframe')
                frame.wait_for(state='attached')
                self.assertEqual(frame.get_attribute('src'), 'https://oberlin.communityhub.cloud/dh-public/oc-embed?active-page=exploreData&active-data-dashboard=815')
                self.page.wait_for_function("document.querySelector('#building iframe')?.classList.contains('ch-live')")
                self.assertEqual(host.locator('.embed-preview-image, [data-embed-preview]').count(), 0)
                self.assertNotEqual(frame.get_attribute('aria-hidden'), 'true')
                self.assertEqual(frame.evaluate('el => el.tabIndex'), 0)
                self.assertEqual(frame.evaluate('el => getComputedStyle(el).pointerEvents'), 'auto')
                self.assertEqual(self.page.locator('#building .ch-embed-toggle, #building .ch-embed-toolbar').count(), 0)
                recovery = self.page.locator('#building .bar').get_by_role('link', name='Open dashboard', exact=False)
                self.assertIn('active-data-dashboard=815', recovery.get_attribute('href'))
                self.assertEqual(recovery.get_attribute('href'),frame.get_attribute('src'))
                self.assertEqual(recovery.get_attribute('target'),'_blank')
                self.assertEqual(set(recovery.get_attribute('rel').split()),{'noopener','noreferrer'})
                action = self.page.frame_locator('#building iframe').get_by_role('button', name='Dashboard fixture action')
                action.focus()
                self.page.keyboard.press('Enter')
                self.assertEqual(self.page.frame_locator('#building iframe').locator('body').get_attribute('data-activated'), 'true')
                self.page.keyboard.press('Escape')
                self.assertTrue(action.evaluate('el => el === document.activeElement'))
                self.assertTrue(frame.evaluate("el => el.classList.contains('ch-live')"))

    def test_dashboard_deep_link_keyboard_and_phone_load(self):
        self.page.set_viewport_size({'width': 390, 'height': 844})
        self.open('dashboards.html#oberlin-college')
        panel = self.page.locator('[data-dashboard-panel="oberlin-college"]')
        panel.locator('iframe').wait_for(state='attached')
        self.assertFalse(panel.is_hidden())
        tab = self.page.locator('[data-dashboard-key="oberlin-college"]')
        tab.focus()
        self.page.keyboard.press('ArrowRight')
        self.assertEqual(self.page.locator('[data-dashboard-key="great-lakes-science-center"]').get_attribute('aria-selected'), 'true')
        self.page.locator('[data-dashboard-panel="great-lakes-science-center"] iframe').wait_for(state='attached')
        self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'), 1)

    def test_platform_explanation_reveals_one_step_at_a_time_and_holds_final_step(self):
        self.page.emulate_media(reduced_motion='no-preference')
        self.open('products.html#how')
        flow = self.page.locator('[data-hub-flow]')
        self.assertEqual(self.page.locator('#how-h').inner_text(), 'How the Dashboard Platform Works')
        flow.hover()  # the whole content reveals the compact navigation arrows
        next_button = flow.locator('[data-hf-next]')
        back_button = flow.locator('[data-hf-back]')
        self.page.wait_for_timeout(1700)  # startup fitting settles before the position is recorded
        story_y = self.page.evaluate('scrollY')
        # Steps reveal sources, then the Hub, then the apps, then where people meet them.
        shown = {1: 2, 2: 4, 3: 8, 4: 9, 5: 10, 6: 11, 7: 13, 8: 18}
        self.assertEqual(flow.get_attribute('data-step'), '1')
        self.assertTrue(back_button.is_disabled())
        for step in range(1, 9):
            self.assertEqual(flow.get_attribute('data-step'), str(step))
            self.assertEqual(flow.locator('[data-hf-step].is-on').count(), shown[step])
            self.assertEqual(flow.locator('[data-hf-count]').count(), 0)
            self.assertEqual(flow.locator('[data-hf-controls] button svg').count(), 2)
            self.assertTrue(flow.locator('[data-hf-say]').inner_text().strip())
            if step < 8:
                next_button.click()
                self.assertAlmostEqual(self.page.evaluate('scrollY'), story_y, delta=3)
        self.assertEqual(next_button.get_attribute('aria-label'), 'Replay explanation')
        self.assertEqual(next_button.inner_text(), '')
        self.assertEqual(next_button.locator('svg').count(), 1)
        self.assertEqual(flow.locator('.hf-sources li').all_text_contents(), [
            'Building performance data', 'Environmental and municipal data', 'Social data and storytelling'])
        self.assertEqual(flow.locator('.hf-apps a').all_text_contents(), [
            'Building Dashboard', 'Citywide Dashboard', 'Calendar and Jobs Board', 'Community Voices', 'Hub Analytics'])
        self.assertEqual(flow.locator('.hf-venues a').all_text_contents(), [
            'Interactive Signage', 'Web Embeddables', 'Phone App'])
        self.page.wait_for_timeout(1200)
        self.assertEqual(flow.get_attribute('data-step'), '8')
        next_button.click()
        self.assertEqual(flow.get_attribute('data-step'), '1')
        self.assertAlmostEqual(self.page.evaluate('scrollY'), story_y, delta=3)

    def test_reduced_motion_model_and_phone_useful_product_content_remain_available(self):
        self.page.set_viewport_size({'width': 390, 'height': 844})
        self.open('products.html#how')
        flow = self.page.locator('[data-hub-flow]')
        self.assertEqual(flow.get_attribute('data-step'), '8')
        self.assertEqual(flow.locator('[data-hf-step].is-on').count(), 18)
        self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'), 1)
        for route,image,next_id in [
            ('the-hub.html','.opening-gallery [data-sp]:not([hidden]) img','visualizer'),
            ('community-calendar.html','img[src="assets/calendar.png"]','live')]:
            with self.subTest(route=route):
                self.open(route)
                self.assert_complete_opening_example(image,844)
                if route == 'the-hub.html':
                    gallery = self.page.locator('.opening-gallery [data-story]')
                    self.assertEqual(gallery.locator('[data-sp-count]').text_content(),'1 / 4')
                    self.assertTrue(gallery.locator('[data-sp-count]').evaluate('''el => {
                        const r=el.getBoundingClientRect();
                        return r.width <= 1 && r.height <= 1 && getComputedStyle(el).clipPath !== 'none';
                    }'''))
                    first_image = gallery.locator('[data-sp]:not([hidden]) img').get_attribute('src')
                    next_slide = gallery.locator('[data-sp-next]')
                    self.assertEqual(next_slide.get_attribute('aria-label'), 'Next slide')
                    self.assertEqual(next_slide.locator('svg').count(), 1)
                    box = next_slide.bounding_box()
                    self.assertGreaterEqual(box['y'],self.page.locator('#hdr').bounding_box()['height'])
                    self.assertLessEqual(box['y']+box['height'],844)
                    self.page.mouse.click(box['x']+box['width']/2,box['y']+box['height']/2)
                    self.assertEqual(gallery.locator('[data-sp-count]').text_content(),'2 / 4')
                    self.assertEqual(gallery.locator('[data-sp]:not([hidden])').count(), 1)
                    self.assertNotEqual(gallery.locator('[data-sp]:not([hidden]) img').get_attribute('src'), first_image)
                self.page.keyboard.press('PageDown')
                self.page.wait_for_timeout(150)
                self.assertEqual(self.page.evaluate('chStory.current().els[0].id'),next_id)
                section = self.page.locator('#'+next_id)
                self.assertTrue(section.locator('h2').first.is_visible())
                if route == 'community-calendar.html':
                    self.assertTrue(section.locator('[data-events]').is_visible())
                    self.assertTrue(section.locator('[data-events]').text_content().strip())
                    self.assertEqual(section.locator('.cal-open a').count(),3)
                    self.assertIn('environmentaldashboard.org/calendar/',section.locator('.cal-open a').first.get_attribute('href'))
                self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1)

    def test_model_is_readable_without_javascript(self):
        context = self.browser.new_context(java_script_enabled=False, viewport={'width': 390, 'height': 844})
        try:
            page = context.new_page()
            page.goto(self.server.url + 'products.html#how', wait_until='domcontentloaded')
            for group in page.locator('[data-hf-step]:not(.hf-link)').all():
                self.assertTrue(group.is_visible())
            self.assertTrue(page.locator('[data-hf-controls]').is_hidden())
        finally:
            context.close()


if __name__ == '__main__':
    unittest.main()
