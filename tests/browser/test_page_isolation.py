"""Audit the generated site, including every content route and redirect.

Build the Astro site and fixture runtime first, then run:
    python -m unittest discover -s tests/browser -p 'test_page_isolation.py' -v

The browser uses local assets while remote fonts, embeds, and feeds are blocked.
This suite verifies site-owned layout/navigation, not remote service availability.
"""

import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
import threading
import unittest

from playwright.sync_api import sync_playwright


SITE = Path(__file__).resolve().parents[2] / 'dist'
JUMP = '[data-zpa-jump], [data-zpb-jump], [data-ppl-jump]'
VIEWPORTS = [(1440, 900), (1280, 720), (390, 844)]

FRAME_POSITIONS = r'''() => {
 const blocks=[...document.querySelector('#main').children].filter(el=>
  !el.matches('[data-zpa-jump], [data-zpb-jump], [data-ppl-jump]'));
 const foot=document.querySelector('.foot'); if(foot) blocks.push(foot);
 return chStory.frames().map(frame=>({y:frame.y,owner:blocks.indexOf(frame.els[0]),part:frame.part}));
}''' 

# Inspect painted text/media independently of the active-section classes. Checking
# computed ancestors and clipping distinguishes offscreen rail cards from leaks.
PAINTED_CONTENT = r'''() => {
  const main = document.querySelector('#main');
  const blocks = [...main.children].filter(el =>
    !el.matches('[data-zpa-jump], [data-zpb-jump], [data-ppl-jump]'));
  const footer = document.querySelector('.foot');
  if (footer) blocks.push(footer);
  const header = document.querySelector('#hdr');
  const top = header ? header.getBoundingClientRect().bottom : 0;
  const label = el => el.id || el.getAttribute('aria-label') ||
    el.querySelector('h1,h2,h3')?.textContent.trim().slice(0,70) || el.className;
  function visible(el) {
    for (let node=el; node; node=node.parentElement) {
      if (node.tagName === 'DETAILS' && !node.open &&
          !node.querySelector(':scope > summary')?.contains(el)) return false;
      const css = getComputedStyle(node);
      if (css.display === 'none' || css.visibility === 'hidden' || +css.opacity < .05)
        return false;
    }
    return true;
  }
  function painted(el) {
    if (!visible(el) || el.closest('[aria-hidden="true"]')) return false;
    const box = el.getBoundingClientRect();
    let left=box.left, right=box.right, y1=box.top, y2=box.bottom;
    for (let parent=el.parentElement; parent; parent=parent.parentElement) {
      const css=getComputedStyle(parent), clip=parent.getBoundingClientRect();
      if (/hidden|clip|auto|scroll/.test(css.overflowX)) {
        left=Math.max(left,clip.left); right=Math.min(right,clip.right);
      }
      if (/hidden|clip|auto|scroll/.test(css.overflowY)) {
        y1=Math.max(y1,clip.top); y2=Math.min(y2,clip.bottom);
      }
    }
    return Math.min(innerWidth,right)-Math.max(0,left)>3 &&
      Math.min(innerHeight,y2)-Math.max(top,y1)>3;
  }
  return {
    y: scrollY,
    width: document.documentElement.scrollWidth,
    viewportWidth: innerWidth,
    blocks: blocks.map((block,index) => {
      const content=[...block.querySelectorAll('*')].filter(el =>
        el.matches('img,iframe,video,canvas') ||
        [...el.childNodes].some(n=>n.nodeType===3 && n.textContent.trim()));
      return {index,label:label(block),painted:content.filter(painted).map(el=>
        (el.textContent.trim() || el.getAttribute('alt') || el.tagName).slice(0,70))};
    })
  };
}'''


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


class AllPageIsolationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.files = sorted(SITE.glob('*.html'))
        if not cls.files:
            raise RuntimeError('Run npm run build in site_ts before running generated-page tests')
        cls.content_pages = []
        cls.redirects = {}
        for file in cls.files:
            redirect = re.search(
                r'<meta\s+http-equiv="refresh"\s+content="0;\s*url=([^";]+)',
                file.read_text(), re.I)
            if redirect:
                cls.redirects[file.name] = redirect.group(1)
            else:
                cls.content_pages.append(file.name)
        handler = functools.partial(QuietHandler, directory=str(SITE))
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), handler)
        cls.server.daemon_threads = True
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        cls.base = f'http://127.0.0.1:{cls.server.server_port}/'
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.server_thread.join(timeout=2)

    def context(self, width, height):
        context = self.browser.new_context(
            viewport={'width': width, 'height': height},
            reduced_motion='reduce', is_mobile=width < 700, has_touch=width < 700)
        context.route('**/*', lambda route: route.continue_()
                      if route.request.url.startswith(self.base)
                      and route.request.resource_type != 'media' else route.abort())
        return context

    def settle(self, page):
        page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')

    def settle_target(self, page, owner, part):
        result = page.evaluate(r'''async ({owner,part}) => {
          const end=performance.now()+1200;
          let stable=0,last=null;
          while (performance.now()<end) {
            await new Promise(resolve=>requestAnimationFrame(resolve));
            const blocks=[...document.querySelector('#main').children].filter(el=>
              !el.matches('[data-zpa-jump],[data-zpb-jump],[data-ppl-jump]'));
            const footer=document.querySelector('.foot');if(footer)blocks.push(footer);
            const frames=chStory.frames().filter(frame=>frame.els.includes(blocks[owner]));
            const target=frames[Math.min(part,frames.length-1)];
            const y=target?.y;
            if (target && Math.abs(scrollY-y)<=3 && last===y) stable++;
            else stable=0;
            last=y;
            if(stable>=2)return {ok:true,y};
          }
          return {ok:false,y:scrollY,target:last};
        }''', {'owner': owner, 'part': part})
        self.assertTrue(result['ok'],
                        f'Block {owner} part {part} failed to settle: {result}')
        return result['y']

    def open_page(self, page, filename):
        page.goto(self.base + filename, wait_until='load')
        page.evaluate('document.fonts.ready')
        page.evaluate('''async () => {
          const images=[...document.images];
          images.forEach(image=>image.loading='eager');
          await Promise.all(images.map(image=>image.decode().catch(()=>{})));
        }''')
        page.wait_for_timeout(220)
        if filename == 'index.html':
            # The film and People are now one semantic owner. Exercise the real
            # reveal first so generic traversal includes the complete opening.
            self.assertTrue(page.locator('#people').is_hidden())
            page.get_by_role('button', name='Explore Community Hub', exact=True).click()
            page.wait_for_function("document.querySelector('.hv').classList.contains('intro-peek')")
            self.assertTrue(page.locator('.hv > #people').is_visible())
            self.assertTrue(page.evaluate("chStory.current().els[0] === document.querySelector('.hv')"))
            self.assertAlmostEqual(page.evaluate('scrollY'), 0, delta=3)
        page.evaluate('window.chFit?.run()')
        self.settle(page)

    def test_every_route_has_reachable_isolated_content_at_each_stop(self):
        for width, height in VIEWPORTS:
            context = self.context(width, height)
            try:
                for filename in self.content_pages:
                    with self.subTest(page=filename, viewport=f'{width}x{height}'):
                        page = context.new_page()
                        errors = []
                        page.on('pageerror', lambda error: errors.append(str(error)))
                        try:
                            self.open_page(page, filename)
                            self.assertTrue(page.evaluate('!!window.chStory'),
                                            'Every content page must have section navigation')
                            frames = page.evaluate('chStory.frames().map(frame=>frame.y)')
                            self.assertGreaterEqual(len(frames), 2)
                            self.assertTrue(all(b > a + 2 for a, b in zip(frames, frames[1:])),
                                            'Section stops must advance, never repeat')
                            seen = set()
                            failures = []
                            block_count = len(page.evaluate(PAINTED_CONTENT)['blocks'])
                            for owner in range(block_count):
                                part = 0
                                while True:
                                    owner_frames = [f for f in page.evaluate(FRAME_POSITIONS)
                                                    if f['owner'] == owner]
                                    if part >= len(owner_frames):
                                        break
                                    frame = owner_frames[part]
                                    y = frame['y']
                                    page.evaluate('y=>scrollTo({top:y,behavior:"instant"})', y)
                                    self.settle_target(page, owner, part)
                                    snapshot = page.evaluate(PAINTED_CONTENT)
                                    painted = [b for b in snapshot['blocks'] if b['painted']]
                                    seen.update(b['index'] for b in painted)
                                    label = f'block {owner} part {part} at {y}px'
                                    if len(painted) != 1 or painted[0]['index'] != owner:
                                        failures.append(f'{label} paints '
                                                        f'{[b["label"] for b in painted]}')
                                    # Live-preview fallbacks may resize their section on arrival.
                                    # Its owner and same within-section stop must remain selected.
                                    latest = [f for f in page.evaluate(FRAME_POSITIONS)
                                              if f['owner'] == owner]
                                    expected = latest[min(part, len(latest) - 1)]['y'] if latest else y
                                    if abs(snapshot['y'] - expected) > 3:
                                        failures.append(f'{label} settled at {snapshot["y"]}px '
                                                        f'instead of its current {expected}px stop')
                                    if snapshot['width'] > width + 2:
                                        failures.append(f'{label} overflows horizontally by '
                                                        f'{snapshot["width"] - width}px')
                                    part += 1
                            missing = [b['label'] for b in snapshot['blocks'] if b['index'] not in seen]
                            if missing:
                                failures.append(f'unreachable content blocks: {missing}')
                            if errors:
                                failures.append(f'JavaScript errors: {errors}')
                            self.assertEqual(failures, [], '\n'.join(failures))
                        finally:
                            page.close()
            finally:
                context.close()

    def test_real_wheel_advances_one_stop_on_every_content_page(self):
        context = self.context(1280, 720)
        try:
            for filename in self.content_pages:
                with self.subTest(page=filename):
                    page = context.new_page()
                    try:
                        self.open_page(page, filename)
                        frames = page.evaluate(FRAME_POSITIONS)
                        self.assertGreaterEqual(len(frames), 2)
                        target = frames[1]
                        page.mouse.move(1272, 350)
                        page.mouse.wheel(0, 90)
                        expected = self.settle_target(page, target['owner'], target['part'])
                        self.assertAlmostEqual(page.evaluate('scrollY'), expected, delta=3)
                        snapshot = page.evaluate(PAINTED_CONTENT)
                        self.assertEqual(len([b for b in snapshot['blocks'] if b['painted']]), 1)
                    finally:
                        page.close()
        finally:
            context.close()

    def touch_swipe(self, page, cdp, reverse=False):
        # Chromium expands touch targets beyond their painted box. Leave room
        # around controls so this test exercises page navigation; native form
        # and nested-scroll ownership have separate regressions.
        point = page.evaluate('''reverse => {
          const selector='input,textarea,select,[contenteditable]:not([contenteditable="false"]),iframe,[role="slider"],[role="spinbutton"],[role="listbox"],[role="combobox"],[role="menu"],[role="tablist"],[role="tree"],[role="grid"]';
          const controls=[...document.querySelectorAll(selector)].filter(el=>el.getClientRects().length&&
            getComputedStyle(el).visibility==='visible'&&getComputedStyle(el).pointerEvents!=='none'&&!el.closest('[inert]'))
            .map(el=>el.getBoundingClientRect());
          // Preserve existing gesture points; only if all fail, try the clear
          // heading above a form. Keep the same 32px control margin.
          const rowGroups=reverse?[[350,430,510],[180,260]]:[[680,600,520,440],[340]];
          for(const rows of rowGroups)for(const x of [376,195,24])for(const y of rows){
            if(controls.some(r=>x>r.left-32&&x<r.right+32&&y>r.top-32&&y<r.bottom+32))continue;
            let target=document.elementFromPoint(x,y),nested=false;
            for(let el=target;el&&el!==document.body;el=el.parentElement){
              if(/auto|scroll/.test(getComputedStyle(el).overflowY)&&el.scrollHeight>el.clientHeight+2)nested=true;
            }
            if(target&&!nested)return {x,y};
          }
          return null;
        }''', reverse)
        self.assertIsNotNone(point, 'A page gesture needs a visible area clear of controls')
        start=point['y']
        end=start+(330 if reverse else -330)
        page.evaluate('''() => {
          window.__pageGestureTarget=null;
          window.addEventListener('touchstart',event=>{
            const el=event.target;
            window.__pageGestureTarget={tag:el.tagName,id:el.id,
              control:!!el.closest('input,textarea,select,[contenteditable],iframe,[role="tablist"]')};
          },{once:true,capture:true});
        }''')
        cdp.send('Input.dispatchTouchEvent', {
            'type': 'touchStart', 'touchPoints': [{'x': point['x'], 'y': start, 'id': 1}]})
        actual=page.evaluate('window.__pageGestureTarget')
        self.assertIsNotNone(actual)
        self.assertFalse(actual['control'], actual)
        for step in range(1, 9):
            cdp.send('Input.dispatchTouchEvent', {
                'type': 'touchMove', 'touchPoints': [
                    {'x': point['x'], 'y': start + (end - start) * step / 8, 'id': 1}]})
            page.wait_for_timeout(12)
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        self.settle(page)

    def test_real_touch_advances_and_reverses_on_every_mobile_page(self):
        context = self.context(390, 844)
        try:
            for filename in self.content_pages:
                with self.subTest(page=filename):
                    page = context.new_page()
                    try:
                        self.open_page(page, filename)
                        cdp = context.new_cdp_session(page)
                        frames = page.evaluate(FRAME_POSITIONS)
                        self.assertGreaterEqual(len(frames), 2)
                        target = frames[1]
                        self.touch_swipe(page, cdp)
                        expected = self.settle_target(page, target['owner'], target['part'])
                        self.assertAlmostEqual(page.evaluate('scrollY'), expected, delta=3)
                        self.assertEqual(len([b for b in page.evaluate(PAINTED_CONTENT)['blocks']
                                              if b['painted']]), 1)
                        self.touch_swipe(page, cdp, reverse=True)
                        self.settle_target(page, 0, 0)
                        self.assertAlmostEqual(page.evaluate('scrollY'), 0, delta=3)
                    finally:
                        page.close()
        finally:
            context.close()

    def test_long_pages_traverse_every_stop_forward_and_backward_by_wheel(self):
        context = self.context(1280, 720)
        try:
            for filename in ('index.html', 'data-dashboard.html', 'education.html',
                             'community-voices.html'):
                with self.subTest(page=filename):
                    page = context.new_page()
                    try:
                        self.open_page(page, filename)
                        page.mouse.move(1272, 350)
                        for direction in (1, -1):
                            for _ in range(100):
                                frames = page.evaluate(FRAME_POSITIONS)
                                y = page.evaluate('scrollY')
                                index = min(range(len(frames)), key=lambda n: abs(frames[n]['y'] - y))
                                next_index = index + direction
                                if next_index < 0 or next_index >= len(frames):
                                    break
                                target = frames[next_index]
                                # Each step represents a new gesture after momentum ends.
                                # The latch holds 450ms after a step; bursts have their own tests.
                                page.wait_for_timeout(520)
                                page.mouse.wheel(0, direction * 90)
                                expected = self.settle_target(page, target['owner'], target['part'])
                                self.assertAlmostEqual(page.evaluate('scrollY'), expected, delta=3,
                                                       msg=f'{filename}, direction {direction}')
                                snapshot = page.evaluate(PAINTED_CONTENT)
                                painted = [b for b in snapshot['blocks'] if b['painted']]
                                self.assertEqual([b['index'] for b in painted], [target['owner']])
                            else:
                                self.fail(f'{filename}: wheel navigation never reached the endpoint')
                    finally:
                        page.close()
        finally:
            context.close()

    def test_aliases_reach_their_existing_destinations(self):
        context = self.context(1280, 720)
        try:
            for source, destination in self.redirects.items():
                with self.subTest(source=source, destination=destination):
                    self.assertTrue((SITE / destination.split('#')[0]).is_file())
                    page = context.new_page()
                    try:
                        page.goto(self.base + source, wait_until='load')
                        page.wait_for_url(self.base + destination)
                        self.assertEqual(page.locator('main').count(), 1)
                    finally:
                        page.close()
        finally:
            context.close()


if __name__ == '__main__':
    unittest.main()
