"""Rendered checks for review tasks 11–15; serves the actual generated site locally.

External services are excluded here. Their live checks and source limits are recorded in
research/review_2026_09_30_publication_sources.md and the review evidence.
"""
import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import unittest
from playwright.sync_api import sync_playwright

SITE = Path(__file__).resolve().parents[2] / 'dist'

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

class ReviewTasksBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(SITE)))
        cls.thread = Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f'http://127.0.0.1:{cls.server.server_port}/'
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        self.context = self.browser.new_context(viewport={'width':1280,'height':720}, reduced_motion='reduce')
        self.context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(self.url) else route.abort())
        self.page = self.context.new_page()

    def tearDown(self):
        self.context.close()

    def test_storyboard_images_notes_and_all_31_slide_controls(self):
        self.page.goto(self.url+'story-of-dashboard.html', wait_until='domcontentloaded')
        self.assertTrue(self.page.locator('[data-sb-prev]').is_disabled())
        for index in range(31):
            if index:
                self.page.locator('[data-sb-next]').click()
            self.page.wait_for_function('i => {const p=document.querySelector("[data-sb-img]"); return p.complete && p.naturalWidth>0 && p.src.endsWith(String(i).padStart(2,"0")+".jpg");}', arg=index+1)
            self.assertEqual(self.page.locator('[data-sb-n]').inner_text(), f'{index+1} of 31')
            self.assertTrue(self.page.locator('[data-sb-t]').inner_text().strip())
            self.assertTrue(self.page.locator('[data-sb-d]').inner_text().strip())
            self.assertEqual(self.page.locator('[data-sb-go][aria-current="true"]').get_attribute('data-sb-go'), str(index))
        self.assertTrue(self.page.locator('[data-sb-next]').is_disabled())
        self.page.locator('[data-sb]').focus()
        self.page.keyboard.press('ArrowLeft')
        self.assertEqual(self.page.locator('[data-sb-n]').inner_text(), '30 of 31')
        self.page.locator('[data-sb-go="0"]').click()
        self.assertEqual(self.page.locator('[data-sb-n]').inner_text(), '1 of 31')

    def test_home_story_links_resolve_and_reach_requested_sections(self):
        self.page.goto(self.url, wait_until='domcontentloaded')
        cards = self.page.locator('#people .pp').evaluate_all('(cards)=>cards.map(c=>[...c.querySelectorAll("a")].map(a=>a.getAttribute("href")))')
        self.assertGreaterEqual(len(cards), 6)
        destinations = set()
        for links in cards:
            self.assertIn(len(links), (1,2,3))
            for href in links:
                destinations.add(href)
                file, _, anchor = href.partition('#')
                response = self.context.request.get(self.url+file)
                self.assertEqual(response.status, 200, href)
                if anchor:
                    self.assertIn(f'id="{anchor}"', response.text(), href)
        for href in ('digital-signage.html','phone-app.html','web-embeddables.html','building-dashboard.html','citywide-dashboard.html','the-hub.html','community-calendar.html','community-voices.html','education.html','schools.html#live'):
            self.assertIn(href, destinations)

    def test_identity_reduced_motion_stays_settled_and_readable(self):
        self.page.goto(self.url+'#problem', wait_until='domcontentloaded')
        self.page.wait_for_function("document.querySelector('#problem').dataset.sequencePhase === 'complete'")
        self.assertEqual(self.page.locator('#problem [data-roll] img').count(), 5)
        self.assertEqual(self.page.locator('#problem [data-platform-explanation]').count(), 0)
        self.assertEqual(self.page.locator('#problem [data-platform-replay]').count(), 0)
        self.assertTrue(self.page.locator('#problem .why-copy p').is_visible())
        self.assertEqual(self.page.locator('#problem .why-a').get_attribute('href'), 'about.html')
        self.assertTrue(self.page.locator('#problem').evaluate("el=>el.getAnimations({subtree:true}).every(a=>a.playState!=='running')"))
        self.page.clock.install()
        self.page.clock.fast_forward(30000)
        self.assertEqual(self.page.evaluate('chStory.current().els[0].id'), 'problem')

    def test_identity_first_completion_advances_once_to_next_real_section(self):
        self.page.emulate_media(reduced_motion='no-preference')
        self.page.mouse.move(5, 5)
        self.page.goto(self.url+'#problem', wait_until='load')
        self.page.wait_for_function("document.querySelector('#problem').dataset.sequencePhase === 'identity'")
        self.page.wait_for_function("document.querySelector('#problem').dataset.sequencePhase === 'complete'", timeout=15000)
        self.assertEqual(self.page.evaluate('chStory.current().els[0].id'), 'engage')
        self.page.clock.install()
        self.page.clock.fast_forward(30000)
        self.assertEqual(self.page.evaluate('chStory.current().els[0].id'), 'engage')
        self.page.evaluate("scrollTo({top:chStory.frames().find(f=>f.els[0].id==='problem').y,behavior:'instant'})")
        self.page.wait_for_timeout(200)
        self.page.clock.fast_forward(30000)
        self.assertEqual(self.page.evaluate('chStory.current().els[0].id'), 'problem')

    def test_identity_manual_departure_preserves_animation_but_disarms_auto_advance(self):
        self.page.emulate_media(reduced_motion='no-preference')
        self.page.mouse.move(5, 5)
        self.page.goto(self.url+'#problem', wait_until='load')
        self.page.wait_for_function("document.querySelector('#problem').dataset.sequencePhase === 'identity'")
        self.page.clock.install()
        self.page.evaluate("scrollTo({top:chStory.frames().find(f=>f.els[0].id==='engage').y,behavior:'instant'})")
        self.page.wait_for_timeout(200)
        held = self.page.locator('#problem').get_attribute('data-sequence-phase')
        self.page.clock.fast_forward(30000)
        self.assertEqual(self.page.locator('#problem').get_attribute('data-sequence-phase'), held)
        self.page.evaluate("scrollTo({top:chStory.frames().find(f=>f.els[0].id==='problem').y,behavior:'instant'})")
        self.page.wait_for_timeout(200)
        self.page.clock.run_for(10000)
        self.assertEqual(self.page.locator('#problem').get_attribute('data-sequence-phase'), 'complete')
        self.assertEqual(self.page.evaluate('chStory.current().els[0].id'), 'problem')

    def test_identity_remains_complete_without_javascript(self):
        with self.browser.new_context(viewport={'width':1280,'height':720}, java_script_enabled=False) as context:
            context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(self.url) else route.abort())
            page = context.new_page()
            page.goto(self.url+'#problem', wait_until='load')
            self.assertEqual(page.locator('#problem').get_attribute('data-sequence-phase'), 'complete')
            self.assertEqual(page.locator('#problem [data-roll] img').count(), 5)
            self.assertTrue(page.locator('#problem .roll-c').is_visible())
            self.assertTrue(page.locator('#problem .why-copy p').is_visible())
            self.assertTrue(page.locator('#problem .why-a').is_visible())
            self.assertEqual(page.locator('#problem [data-platform-explanation]').count(), 0)

    def test_research_has_current_published_link_and_honest_accepted_paper_path(self):
        self.page.goto(self.url+'research.html#paper-empathetic-character-gauges', wait_until='domcontentloaded')
        self.assertEqual(self.page.locator('.va-card').count(),10)
        # Only measured charts receive a figure. Decorative summary sketches
        # were removed; all ten findings, citations and paper paths remain.
        self.assertEqual(self.page.locator('.va-card svg[role="img"]').count(),2)
        first=self.page.locator('.va-card').first
        first.locator('h3').wait_for(state='visible')
        self.assertIn('accepted', first.inner_text())
        self.assertEqual(first.locator('a').inner_text().strip(), 'Request the paper')
        self.assertTrue(first.locator('a').get_attribute('href').startswith('mailto:'))
        self.assertEqual(self.page.locator('.va-card a[href^="https://"]').count(),9)
        self.assertEqual(self.page.locator('.va-card a[href="https://doi.org/10.3390/su172210318"]').count(),1)
        self.assertNotIn('preprint',self.page.locator('main').text_content().lower())

    def test_storyboard_and_research_keep_content_accessible_at_three_widths(self):
        for width,height in ((1440,900),(1280,720),(390,844)):
            self.page.set_viewport_size({'width':width,'height':height})
            for filename in ('story-of-dashboard.html','research.html'):
                self.page.goto(self.url+filename, wait_until='domcontentloaded')
                self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth-innerWidth'),1,(width,filename))
                if filename.startswith('story'):
                    self.page.locator('[data-sb-next]').click()
                    self.assertEqual(self.page.locator('[data-sb-n]').inner_text(),'2 of 31')
                else:
                    self.page.wait_for_function('!!window.chStory')
                    self.page.evaluate('document.fonts.ready')
                    self.page.wait_for_timeout(250)
                    max_steps = self.page.evaluate('chStory.frames().length') + 1
                    for index,card in enumerate(self.page.locator('.va-card').all()):
                        seen_heading = seen_link = False
                        for _ in range(max_steps):
                            state = card.evaluate('''el=>{
                                const top=document.querySelector('#hdr').getBoundingClientRect().bottom;
                                const painted=node=>{const r=node.getBoundingClientRect();
                                    return getComputedStyle(node).visibility==='visible' &&
                                        r.bottom>top && r.top<innerHeight && r.right>0 && r.left<innerWidth;
                                };
                                return {heading:painted(el.querySelector('h3')),
                                    link:painted(el.querySelector('a'))};
                            }''')
                            seen_heading |= state['heading']
                            seen_link |= state['link']
                            if seen_heading and seen_link:
                                break
                            before = self.page.evaluate('scrollY')
                            self.page.keyboard.press('PageDown')
                            self.page.wait_for_timeout(100)
                            self.assertGreater(self.page.evaluate('scrollY'),before,
                                               (width,index,'Article cannot be reached with PageDown'))
                        self.assertTrue(seen_heading and seen_link,(width,index,'Article title and source must be readable'))

if __name__ == '__main__':
    unittest.main()
