"""Render the frozen and TypeScript sites under identical, deterministic conditions.

Run after the TypeScript build:
  python tests/visual_parity.py

Checks 32 content routes at three sizes and captures the first two section stops.
Remote services and videos are blocked, local animated images use their first
frame, and both pages use the same frozen browser clock, reduced motion, fonts,
and browser context. All baseline/new screenshots and pair contact sheets are
retained. A geometry mismatch, JavaScript exception, overflow, or unexplained
pixel difference fails the run; this is separate from live-service testing.
"""
from __future__ import annotations

import argparse
import asyncio
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
import json
from pathlib import Path
import re
import threading
from urllib.parse import unquote, urlparse

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageStat
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "tests/artifacts/visual-parity"
VIEWPORTS = {"desktop": (1440, 900), "laptop": (1280, 720), "phone": (390, 844)}
FIXED_TIME = datetime(2026, 9, 30, 16, 0, tzinfo=timezone.utc)
JUMPS = '[data-zpa-jump],[data-zpb-jump],[data-ppl-jump]'

SNAPSHOT = r'''() => {
  const main = document.querySelector('#main');
  const blocks = [...main.children].filter(el => !el.matches('[data-zpa-jump],[data-zpb-jump],[data-ppl-jump]'));
  const footer = document.querySelector('.foot'); if (footer) blocks.push(footer);
  const frames = chStory.frames();
  const current = chStory.current();
  const owner = current ? blocks.indexOf(current.els[0]) : -1;
  const label = el => el.id || el.querySelector('h1,h2,h3')?.textContent.trim() || el.className;
  const round = n => Math.round(n * 100) / 100;
  const box = el => {
    const r = el.getBoundingClientRect();
    return [r.x,r.y,r.width,r.height].map(round);
  };
  function visible(el) {
    for (let node=el; node; node=node.parentElement) {
      const style=getComputedStyle(node);
      if(style.display==='none'||style.visibility==='hidden'||+style.opacity<.05)return false;
      if(node.tagName==='DETAILS'&&!node.open&&!node.querySelector(':scope > summary')?.contains(el))return false;
    }
    const r=el.getBoundingClientRect();
    let [left,right,top,bottom]=[r.left,r.right,r.top,r.bottom];
    for(let parent=el.parentElement;parent;parent=parent.parentElement){
      const css=getComputedStyle(parent), clip=parent.getBoundingClientRect();
      if(/hidden|clip|auto|scroll/.test(css.overflowX)){left=Math.max(left,clip.left);right=Math.min(right,clip.right);}
      if(/hidden|clip|auto|scroll/.test(css.overflowY)){top=Math.max(top,clip.top);bottom=Math.min(bottom,clip.bottom);}
    }
    return Math.min(innerWidth,right)-Math.max(0,left)>2&&Math.min(innerHeight,bottom)-Math.max(0,top)>2;
  }
  const geometry = [...document.querySelectorAll('#hdr, #main h1, #main h2, #main h3, #main p, #main a, #main button, #main img, #main iframe, #main video, #main canvas, #main svg, .story-nav')]
    .filter(visible).map(el=>({tag:el.tagName,id:el.id,class:el.getAttribute('class')||'',box:box(el)}));
  return {
    scroll:round(scrollY), width:document.documentElement.scrollWidth, viewport:innerWidth,
    current:{owner,part:current?.part,label:owner>=0?label(blocks[owner]):''},
    frames:frames.map(frame=>({owner:blocks.indexOf(frame.els[0]),part:frame.part,y:round(frame.y)})),
    geometry,
  };
}'''


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


@contextmanager
def local_server(directory: Path):
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(directory)))
    server.daemon_threads = True
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    try:
        yield f'http://127.0.0.1:{server.server_port}/'
    finally:
        server.shutdown()
        server.server_close()
        worker.join(timeout=2)


ANIMATED_CACHE: dict[str, bytes | None] = {}


def still_image(path: Path) -> bytes | None:
    key = str(path)
    if key not in ANIMATED_CACHE:
        ANIMATED_CACHE[key] = None
        if path.suffix.lower() in ('.gif', '.webp') and path.exists():
            with Image.open(path) as source:
                if getattr(source, 'is_animated', False):
                    source.seek(0)
                    stream = BytesIO()
                    source.convert('RGBA').save(stream, format='PNG')
                    ANIMATED_CACHE[key] = stream.getvalue()
    return ANIMATED_CACHE[key]


def pixel_metrics(before_path: Path, after_path: Path, diff_path: Path):
    with Image.open(before_path) as before, Image.open(after_path) as after:
        delta = ImageChops.difference(before.convert('RGB'), after.convert('RGB'))
        maximum = ImageChops.lighter(ImageChops.lighter(*delta.split()[:2]), delta.split()[2])
        significant = maximum.point(lambda value: 255 if value > 12 else 0)
        ratio = significant.histogram()[255] / (delta.width * delta.height)
        mean = sum(ImageStat.Stat(delta).mean) / 3
        if ratio > 0.0001:
            delta.point(lambda value: min(255, value * 4)).save(diff_path)
        return {'changed_fraction_over_12': round(ratio, 6), 'mean_channel_difference': round(mean, 4)}


def geometry_differences(before, after):
    failures = []
    for key in ('current', 'frames'):
        if before[key] != after[key]:
            failures.append(f'{key} differs')
    if abs(before['scroll'] - after['scroll']) > 1:
        failures.append(f"scroll differs: {before['scroll']} vs {after['scroll']}")
    bg, ag = before['geometry'], after['geometry']
    if len(bg) != len(ag):
        failures.append(f'visible element count differs: {len(bg)} vs {len(ag)}')
    for index, (b, a) in enumerate(zip(bg, ag)):
        if [b[k] for k in ('tag', 'id', 'class')] != [a[k] for k in ('tag', 'id', 'class')]:
            failures.append(f'visible element {index} identity differs')
        elif any(abs(x-y) > 1 for x, y in zip(b['box'], a['box'])):
            failures.append(f"visible element {index} {b['tag']} {b['id']} box differs: {b['box']} vs {a['box']}")
    return failures


async def open_page(page, url):
    await page.goto(url, wait_until='load')
    await page.clock.run_for(80)
    if not await page.evaluate('!!window.chStory'):
        raise AssertionError('Section controller did not initialize')
    await page.evaluate('document.fonts.ready')
    await page.evaluate('''async () => {
      const images=[...document.images]; images.forEach(image=>image.loading='eager');
      await Promise.all(images.map(image=>image.decode().catch(()=>{})));
    }''')
    await page.clock.run_for(1000)
    await page.evaluate('window.chFit?.run()')
    await page.clock.run_for(240)


async def compare_case(browser, bases, filename, viewport, semaphore):
    async with semaphore:
        width, height = VIEWPORTS[viewport]
        context = await browser.new_context(viewport={'width': width, 'height': height},
                                            reduced_motion='reduce', is_mobile=width < 700,
                                            has_touch=width < 700, device_scale_factor=1,
                                            timezone_id='America/New_York', locale='en-US')
        async def route_request(route):
            url = route.request.url
            source = next((name for name, base in bases.items() if url.startswith(base)), None)
            if source is None or route.request.resource_type == 'media':
                await route.abort()
                return
            image = still_image(ROOT / source / unquote(urlparse(url).path.lstrip('/')))
            if image:
                await route.fulfill(body=image, content_type='image/png')
            else:
                await route.continue_()
        await context.route('**/*', route_request)
        pages = [await context.new_page(), await context.new_page()]
        errors = [[], []]
        results = []
        try:
            for index, page in enumerate(pages):
                page.on('pageerror', lambda error, index=index: errors[index].append(str(error)))
                await page.clock.install(time=FIXED_TIME - timedelta(seconds=10))
                await page.clock.pause_at(FIXED_TIME)
            await asyncio.gather(*(open_page(page, bases[source] + filename)
                                   for page, source in zip(pages, ('reference', 'dist'))))
            for stop in range(2):
                if stop:
                    moved = await asyncio.gather(*(page.evaluate('chStory.go(1)') for page in pages))
                    if moved != [True, True]:
                        raise AssertionError(f'Cannot advance to second stop: {moved}')
                    await asyncio.gather(*(page.clock.run_for(300) for page in pages))
                    # Native scroll events arrive outside the virtual timer queue.
                    # Let Chromium deliver them, then flush their animation-frame work.
                    await asyncio.sleep(.1)
                    await asyncio.gather(*(page.clock.run_for(64) for page in pages))
                snapshots = await asyncio.gather(*(page.evaluate(SNAPSHOT) for page in pages))
                stem = f'{viewport}-{Path(filename).stem}-stop{stop}'
                paths = [ARTIFACTS / (stem + suffix + '.png') for suffix in ('-reference', '-typescript')]
                await asyncio.gather(*(page.screenshot(path=path, animations='disabled') for page, path in zip(pages, paths)))
                pixels = pixel_metrics(*paths, ARTIFACTS / (stem + '-diff.png'))
                failures = geometry_differences(*snapshots)
                for source, snapshot, source_errors in zip(('reference', 'typescript'), snapshots, errors):
                    if snapshot['width'] > width + 2:
                        failures.append(f'{source} horizontal overflow: {snapshot["width"] - width}px')
                    if source_errors:
                        failures.append(f'{source} JavaScript errors: {source_errors}')
                if pixels['changed_fraction_over_12'] > .005 or pixels['mean_channel_difference'] > 1:
                    failures.append(f'Pixel difference exceeds 0.5% or mean 1/255: {pixels}')
                result = {'page': filename, 'viewport': viewport, 'stop': stop,
                          'pixels': pixels, 'failures': failures,
                          'reference': snapshots[0], 'typescript': snapshots[1]}
                (ARTIFACTS / (stem + '.json')).write_text(json.dumps(result, indent=2))
                results.append(result)
            print(f'{viewport}: {filename}: '+('PASS' if not any(r['failures'] for r in results) else 'FAIL'), flush=True)
        except Exception as error:
            results.append({'page': filename, 'viewport': viewport, 'stop': None,
                            'failures': [str(error)]})
            print(f'{viewport}: {filename}: ERROR: {error}', flush=True)
        finally:
            await context.close()
        return results


def contact_sheets(results):
    font = ImageFont.load_default(size=12)
    for viewport in VIEWPORTS:
        for stop in range(2):
            rows = sorted([r for r in results if r['viewport'] == viewport and r['stop'] == stop], key=lambda r:r['page'])
            for sheet_number, offset in enumerate(range(0, len(rows), 8), 1):
                selected = rows[offset:offset+8]
                thumb_w = 240 if viewport != 'phone' else 156
                ratio = VIEWPORTS[viewport][1]/VIEWPORTS[viewport][0]
                thumb_h = round(thumb_w * ratio)
                tile_w, tile_h = thumb_w*2+20, thumb_h+48
                sheet = Image.new('RGB', (tile_w*2, tile_h*4), '#eeeae3')
                draw = ImageDraw.Draw(sheet)
                for index, result in enumerate(selected):
                    x, y = (index%2)*tile_w, (index//2)*tile_h
                    status = 'PASS' if not result['failures'] else 'FAIL'
                    draw.text((x+4,y+3), f'{result["page"]} | {status}', fill='#1c2720', font=font)
                    for side, suffix in enumerate(('reference','typescript')):
                        path = ARTIFACTS / f'{viewport}-{Path(result["page"]).stem}-stop{stop}-{suffix}.png'
                        with Image.open(path) as image:
                            image.thumbnail((thumb_w,thumb_h))
                            sheet.paste(image,(x+side*(thumb_w+10),y+38))
                        draw.text((x+side*(thumb_w+10)+4,y+20), suffix, fill='#33473a', font=font)
                sheet.save(ARTIFACTS/f'contact-{viewport}-stop{stop}-{sheet_number:02}.jpg',quality=88)


async def main(args):
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    content = sorted(p.name for p in (ROOT/'reference').glob('*.html')
                     if not re.search(r'<meta\s+http-equiv="refresh"', p.read_text(), re.I))
    if len(content) != 32:
        raise RuntimeError(f'Expected 32 content pages, found {len(content)}')
    if args.pages:
        content = [p for p in content if p in args.pages.split(',')]
    sizes = args.viewports.split(',') if args.viewports else list(VIEWPORTS)
    with local_server(ROOT/'reference') as reference, local_server(ROOT/'dist') as output:
        bases = {'reference': reference, 'dist': output}
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)
            semaphore = asyncio.Semaphore(args.workers)
            cases = await asyncio.gather(*(compare_case(browser,bases,page,size,semaphore)
                                           for size in sizes for page in content))
            await browser.close()
    results = [r for case in cases for r in case]
    if not args.pages and not args.viewports:
        contact_sheets(results)
    failed = [r for r in results if r['failures']]
    summary = {'pages':len(content),'viewports':sizes,'screenshots':len([r for r in results if r['stop'] is not None])*2,
               'comparisons':len(results),'passed':len(results)-len(failed),'failed':len(failed),
               'conditions':'Chromium, device scale 1, reduced motion, frozen clock, remote services/videos blocked, local animated images first frame.',
               'pixel_threshold':'At most 0.5% of pixels may differ by more than 12/255 in a channel; mean absolute channel difference at most 1/255.',
               'geometry_threshold':'Visible element boxes within 1 CSS pixel; identical owner/part and frame geometry.',
               'failures':[{k:r[k] for k in ('page','viewport','stop','failures')} for r in failed]}
    summary_file = 'summary-subset.json' if args.pages or args.viewports else 'summary.json'
    (ARTIFACTS/summary_file).write_text(json.dumps(summary,indent=2))
    print(json.dumps({k:v for k,v in summary.items() if k!='failures'},indent=2),flush=True)
    return 1 if failed else 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pages', help='Comma separated subset for development')
    parser.add_argument('--viewports', help='Comma separated viewport names')
    parser.add_argument('--workers', type=int, default=3)
    raise SystemExit(asyncio.run(main(parser.parse_args())))
