"""Deliberate story gestures cut between complete owners without spatial travel."""
import os
import unittest
from playwright.sync_api import sync_playwright
from _support import LocalSite
import test_page_isolation


class StoryCutTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = None if os.environ.get('CH_STORY_TEST_URL') else LocalSite()
        cls.url = os.environ.get('CH_STORY_TEST_URL') or cls.server.url
        cls.pw = sync_playwright().start()
        cls.browser = getattr(cls.pw, os.environ.get('CH_STORY_BROWSER', 'chromium')).launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        if cls.server:
            cls.server.close()

    def open_page(self, width, height, motion, route='#people', touch=False):
        context = self.browser.new_context(viewport={'width':width,'height':height},
            reduced_motion=motion, has_touch=touch)
        self.addCleanup(context.close)
        context.route('**/*', lambda r:r.continue_() if r.request.url.startswith(self.url) else r.abort())
        page = context.new_page()
        page.set_default_timeout(7000)
        response=page.goto(self.url+route, wait_until='load')
        self.assertEqual(response.status,200,'The tested page must render before checking gestures')
        page.wait_for_function('!!window.chStory')
        page.evaluate('''()=>{
          window.__cutWheelEvents=[];
          addEventListener('wheel',e=>__cutWheelEvents.push({time:performance.now(),dy:e.deltaY,
            target:e.target.tagName,cls:e.target.className?.baseVal??e.target.className}),true);
        }''')
        page.evaluate('document.fonts.ready')
        page.wait_for_timeout(600)
        return page

    def sample(self, page):
        return page.evaluate('''()=>{
          const frames=chStory.frames(),current=chStory.current(),index=frames.indexOf(current);
          window.__cutSamples=[];window.__sampleCut=true;
          function record(){
            const frame=chStory.current();
            __cutSamples.push({y:scrollY,owner:frame.els[0].id,
              visible:[...document.querySelectorAll('.ch-story-section')]
                .filter(el=>getComputedStyle(el).visibility==='visible'&&!el.inert)
                .map(el=>el.id)});
            if(__sampleCut)requestAnimationFrame(record);
          }
          record();return {start:scrollY,startOwner:current.els[0].id,
            startIsHero:current.els[0].matches('.hv'),
            next:frames[index+1].y,owner:frames[index+1].els[0].id};
        }''')

    def assert_cut(self, page, start, end, owner):
        page.wait_for_timeout(100)
        samples=page.evaluate('()=>{__sampleCut=false;return __cutSamples}')
        self.assertTrue(samples)
        self.assertTrue(all(min(abs(s['y']-start),abs(s['y']-end))<=2 for s in samples),
            {'start':start,'end':end,'positions':sorted(set(s['y'] for s in samples)),
             'wheel':page.evaluate('__cutWheelEvents')})
        self.assertTrue(all(s['visible']==[s['owner']] for s in samples),samples)
        self.assertAlmostEqual(page.evaluate('scrollY'),end,delta=2)
        self.assertEqual(page.evaluate('chStory.current().els[0].id'),owner)

    def settle(self, page):
        test_page_isolation.AllPageIsolationTests.settle(self,page)

    def test_wheel_momentum_and_reversal_cut_at_three_sizes_in_both_motion_modes(self):
        for width,height in ((1280,720),(390,844),(375,667)):
            for motion in ('no-preference','reduce'):
                with self.subTest(viewport=(width,height),motion=motion):
                    page=self.open_page(width,height,motion)
                    position=self.sample(page)
                    page.mouse.move(width-15,300)
                    # A real wheel burst, including two delayed momentum samples.
                    for delay,delta in ((0,90),(30,72),(30,54),(95,32),(30,20),(110,10),(30,4)):
                        if delay:page.wait_for_timeout(delay)
                        page.mouse.wheel(0,delta)
                    self.assert_cut(page,position['start'],position['next'],position['owner'])
                    self.sample(page)
                    # The gesture latch holds for 450ms after a step, so the way back is a new gesture.
                    page.wait_for_timeout(600)
                    page.mouse.wheel(0,-90)
                    self.assertTrue(position['startIsHero'])
                    self.assert_cut(page,position['next'],position['start'],position['startOwner'])
                    page.context.close()

    def test_keyboard_cuts_and_held_key_does_not_repeat(self):
        for width,height in ((1280,720),(390,844),(375,667)):
            for motion in ('no-preference','reduce'):
                with self.subTest(viewport=(width,height),motion=motion):
                    page=self.open_page(width,height,motion)
                    position=self.sample(page)
                    page.keyboard.down('PageDown')
                    page.keyboard.down('PageDown')
                    page.keyboard.up('PageDown')
                    self.assert_cut(page,position['start'],position['next'],position['owner'])
                    self.sample(page)
                    page.keyboard.press('PageUp')
                    self.assertTrue(position['startIsHero'])
                    self.assert_cut(page,position['next'],position['start'],position['startOwner'])
                    page.context.close()

    def test_real_phone_touch_cuts_forward_and_back_without_inertia(self):
        if os.environ.get('CH_STORY_BROWSER','chromium')!='chromium':
            self.skipTest('Actual CDP touch dispatch requires Chromium')
        for width,height in ((390,844),(375,667)):
            for motion in ('no-preference','reduce'):
                with self.subTest(viewport=(width,height),motion=motion):
                    page=self.open_page(width,height,motion,touch=True)
                    cdp=page.context.new_cdp_session(page)
                    position=self.sample(page)
                    test_page_isolation.AllPageIsolationTests.touch_swipe(self,page,cdp)
                    self.assert_cut(page,position['start'],position['next'],position['owner'])
                    self.sample(page)
                    test_page_isolation.AllPageIsolationTests.touch_swipe(self,page,cdp,reverse=True)
                    self.assertTrue(position['startIsHero'])
                    self.assert_cut(page,position['next'],position['start'],position['startOwner'])
                    page.context.close()

    def test_interior_arrival_has_no_generic_fade_or_rise(self):
        for width,height in ((1280,720),(390,844),(375,667)):
            page=self.open_page(width,height,'no-preference','education.html')
            position=self.sample(page)
            page.keyboard.press('PageDown')
            self.assert_cut(page,position['start'],position['next'],position['owner'])
            styles=page.evaluate('''()=>{
              const owner=chStory.current().els[0];
              return [...owner.querySelectorAll(':scope > .wrap,[data-reveal]')]
                .filter(el=>getComputedStyle(el).visibility==='visible')
                .map(el=>({opacity:getComputedStyle(el).opacity,
                  transform:getComputedStyle(el).transform,transition:getComputedStyle(el).transitionDuration}));
            }''')
            self.assertTrue(styles)
            for style in styles:
                self.assertEqual(style,{'opacity':'1','transform':'none','transition':'0s'})
            page.context.close()

    def test_renewed_impulse_and_reversal_bypass_public_request_coalescing(self):
        page=self.open_page(1280,720,'no-preference')
        expected=page.evaluate('''()=>{
          const fs=chStory.frames(),i=fs.indexOf(chStory.current());
          return [fs[i].y,fs[i+1].y,fs[i+2].y];
        }''')
        positions=page.evaluate('''async()=>{
          const result=[];
          const send=dy=>document.body.dispatchEvent(new WheelEvent('wheel',{deltaY:dy,bubbles:true,cancelable:true}));
          for(const dy of [90,60,25,10]){
            send(dy);await new Promise(resolve=>setTimeout(resolve,30));
          }
          result.push(scrollY);send(90);result.push(scrollY);
          send(-90);result.push(scrollY);return result;
        }''')
        # One gesture moves one section: a renewed impulse or reversal inside it is ignored.
        self.assertEqual(positions,[expected[1],expected[1],expected[1]])
        page.evaluate('''async()=>{
          for(let i=0;i<6;i++){
            chStory.go(1);await new Promise(resolve=>setTimeout(resolve,25));
          }
        }''')
        self.assertAlmostEqual(page.evaluate('scrollY'),expected[2],delta=2)

    def test_lesson_search_and_nested_wheel_keep_native_ownership(self):
        for width,height in ((1280,720),(390,844),(375,667)):
            page=self.open_page(width,height,'no-preference','education.html#lesson-q')
            search=page.locator('#lesson-q')
            search.click()
            # Focusing the native input can smoothly reveal its outline by10px;
            # settle that browser action before measuring the separate wheel.
            page.wait_for_timeout(400)
            y=page.evaluate('scrollY')
            lessons=page.locator('#lessons')
            self.assertTrue(lessons.evaluate('el=>el.scrollHeight>el.clientHeight'))
            box=lessons.bounding_box()
            page.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2)
            page.mouse.wheel(0,180)
            page.wait_for_timeout(150)
            self.assertGreater(lessons.evaluate('el=>el.scrollTop'),0)
            self.assertAlmostEqual(page.evaluate('scrollY'),y,delta=1)
            search.evaluate('el=>el.focus({preventScroll:true})')
            self.assertTrue(search.evaluate('el=>el===document.activeElement'))
            page.evaluate('''()=>{
              window.__searchKeyPrevented=null;
              addEventListener('keydown',e=>{__searchKeyPrevented=e.defaultPrevented},{once:true});
            }''')
            page.keyboard.press('PageDown')
            # Chromium may natively scroll away from the search input and blur
            # it when its story becomes hidden. The key must remain native and
            # focus must not be stranded inside an inert scene.
            self.assertFalse(page.evaluate('__searchKeyPrevented'))
            page.wait_for_timeout(400)
            self.assertFalse(page.evaluate("!!document.activeElement.closest('[inert]')"))
            page.context.close()

    def test_voices_category_link_filters_and_cuts_to_the_wall(self):
        for width,height in ((1280,720),(390,844),(375,667)):
            for motion in ('no-preference','reduce'):
                with self.subTest(viewport=(width,height),motion=motion):
                    page=self.open_page(width,height,motion,'community-voices.html#categories')
                    link=page.locator('[data-zpb-cv-goto]:visible').first
                    key=link.get_attribute('data-zpb-cv-goto')
                    position=self.sample(page)
                    link.click()
                    page.wait_for_timeout(150)
                    destination=page.evaluate('chStory.frames().find(f=>f.els[0].id==="wall").y')
                    self.assert_cut(page,position['start'],destination,'wall')
                    self.assertEqual(page.evaluate('location.hash'),'#wall')
                    selected=page.locator(f'[data-zpb-cv-tabs] [data-filter="{key}"]')
                    self.assertEqual(selected.get_attribute('aria-pressed'),'true')
                    self.assertTrue(selected.evaluate('el=>el===document.activeElement&&!el.closest("[inert]")'))
                    keys=page.locator('.zpb-cv-card:not([hidden])').evaluate_all('items=>items.map(el=>el.dataset.key)')
                    self.assertTrue(keys)
                    self.assertTrue(all(value==key for value in keys),keys)
                    page.context.close()

    def test_desktop_product_tab_end_cuts_directly_to_the_selected_panel(self):
        for motion in ('no-preference','reduce'):
            with self.subTest(motion=motion):
                page=self.open_page(1280,720,motion,'#products')
                tabs=page.locator('#products [data-eng-tab]')
                tabs.first.evaluate('el=>el.focus({preventScroll:true})')
                position=self.sample(page)
                expected=page.evaluate('chStory.frames().filter(f=>f.els[0].id==="products").at(-1).y')
                page.keyboard.press('End')
                self.assert_cut(page,position['start'],expected,'products')
                page.wait_for_timeout(300)
                self.assertEqual(tabs.last.get_attribute('aria-selected'),'true')
                self.assertTrue(tabs.last.evaluate('el=>el===document.activeElement'))
                panels=page.locator('#products [data-eng-panel]').evaluate_all('''items=>items
                  .filter(el=>getComputedStyle(el).visibility==='visible')
                  .map(el=>({opacity:getComputedStyle(el).opacity,transform:getComputedStyle(el).transform,
                    transition:getComputedStyle(el).transitionDuration,inert:el.inert}))''')
                self.assertEqual(panels,[{'opacity':'1','transform':'none','transition':'0s','inert':False}])
                page.context.close()


if __name__=='__main__':unittest.main()
