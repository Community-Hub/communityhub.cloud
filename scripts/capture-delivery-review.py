"""Capture the review candidate with brand fonts and optional live public feeds."""
from pathlib import Path
import json
import os
import shutil
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('CH_REVIEW_DIR', ROOT / 'tests/artifacts/website-delivery-20261001/review'))
OUT.mkdir(parents=True, exist_ok=True)
BASE = os.environ.get('CH_REVIEW_URL', 'http://127.0.0.1:4327/').rstrip('/') + '/'
LIVE = os.environ.get('CH_REVIEW_LIVE') == '1'
CASES = [
    ('home-opening', '', None),
    ('home-testimonials', '', '#people'),
    ('home-mission', '', '#problem'),
    ('home-engage', '', '#engage'),
    ('home-educate', '', '#products'),
    ('home-motivate', '', '#motivate'),
    ('products-first', 'products.html', None),
    ('products-model', 'products.html', '#how'),
    ('dashboards-first', 'dashboards.html', None),
    ('glsc-live', 'great-lakes-science-center.html#live', '#live'),
    ('signage-first', 'digital-signage.html', None),
    ('education-first', 'education.html', None),
    ('about-first', 'about.html', None),
    ('contact-next', 'contact.html', '.next'),
]
evidence = []
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    for width, height in [(1920, 1080), (1280, 720), (390, 844)]:
        context = browser.new_context(viewport={'width': width, 'height': height},
                                      reduced_motion='reduce', is_mobile=width < 700,
                                      has_touch=width < 700)
        context.add_init_script("try { localStorage.setItem('ch-aashe-off','1'); } catch {}")
        context.route('**/*', lambda route: route.continue_() if
                      (LIVE and route.request.resource_type != 'media') or
                      (route.request.url.startswith(BASE) or route.request.url.startswith(
                          ('https://fonts.googleapis.com/', 'https://fonts.gstatic.com/')))
                      and route.request.resource_type != 'media' else route.abort())
        page = context.new_page()
        for name, path, selector in CASES:
            errors = []
            def on_error(error): errors.append(str(error))
            page.on('pageerror', on_error)
            page.goto(BASE + path, wait_until='load')
            page.evaluate('document.fonts.ready')
            page.evaluate('''async () => { await Promise.all([...document.images].map(image => {
                image.loading='eager'; return image.decode().catch(()=>{}); })); }''')
            page.wait_for_timeout(300)
            if selector:
                page.evaluate('''sel => {
                    const target=document.querySelector(sel);
                    const frame=chStory.frames().find(f=>f.els.includes(target));
                    if(!frame) throw new Error('No story frame for '+sel);
                    scrollTo({top:frame.y,behavior:'instant'});
                }''', selector)
            page.wait_for_timeout(550)
            if name == 'home-educate':
                # The chart's accepted introductory explanation holds4.2s and fades1.4s.
                page.wait_for_timeout(6000)
            if LIVE and name in ('dashboards-first', 'glsc-live'):
                page.wait_for_timeout(6000)
            file = f'{name}-{width}.png'
            page.screenshot(path=str(OUT / file))
            result = page.evaluate('''() => ({
                y:scrollY, overflow:document.documentElement.scrollWidth-innerWidth,
                active:[...document.querySelectorAll('.ch-story-section.is-in')].map(el=>el.id||el.className),
                title:document.title,
                fonts:{comfortaa:document.fonts.check('400 16px Comfortaa'),
                       lato:document.fonts.check('400 16px Lato'),
                       openSans:document.fonts.check('600 16px "Open Sans"'),
                       loadedFamilies:[...new Set([...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family))]},
                firstHeading:document.querySelector('#main h1,h2')?.textContent,
                next:document.querySelector('[data-story-next]')?.getAttribute('aria-label')
            })''')
            evidence.append({'name': name, 'viewport': [width,height], 'file':file,
                             'url':BASE+path, 'captureMode':'live' if LIVE else 'controlled',
                             'errors': errors, **result})
            page.remove_listener('pageerror', on_error)
        context.close()
    browser.close()
(OUT/'inspection.json').write_text(json.dumps(evidence,indent=2)+'\n')
before = ROOT.parent / 'tasks/2026-10-01-website-delivery/baseline-visuals'
(OUT/'before').mkdir(exist_ok=True)
for path in before.glob('*.png'):
    shutil.copy2(path, OUT/'before'/path.name)
reference = ROOT / 'tests/artifacts/website-delivery-20261001/navigation/reference-comparison'
(OUT/'reference').mkdir(exist_ok=True)
for path in reference.glob('live-*.png'):
    shutil.copy2(path, OUT/'reference'/path.name)
source_pairs=[]
for width,height in [(1280,720),(390,844)]:
    for source,current,label in [('carousel','home-testimonials','Stories'),('mission','home-mission','Mission'),
            ('engage','home-engage','Engage'),('educate','home-educate','Educate'),('motivate','home-motivate','Motivate')]:
        name=f'live-{width}x{height}-{source}.png'
        if (OUT/'reference'/name).exists():
            source_pairs.append(f'''<details><summary>{label} · {'Phone' if width<700 else 'Laptop'} ({width}px)</summary>
<div class="pair"><figure><figcaption>Original CommunityHub.cloud</figcaption><img src="reference/{name}" alt="Original {label}" loading="lazy"></figure>
<figure><figcaption>New story view</figcaption><img src="{current}-{width}.png" alt="Updated {label}" loading="lazy"></figure></div></details>''')
names = [('home-testimonials','Complete story photographs'),('home-mission','A clear, sequenced mission'),
         ('products-first','Products on arrival'),('dashboards-first','Public dashboards on arrival'),
         ('home-engage','Compact, distinct themes')]
panels=''.join(f'''<section><h2>{label}</h2><div class="pair"><figure><figcaption>Earlier local prototype</figcaption>
<img src="before/{name}.png" alt="Before: {label}" loading="lazy"></figure><figure><figcaption>After</figcaption>
<img src="{name}-1920.png" alt="After: {label}" loading="lazy"></figure></div></section>''' for name,label in names)
thumbs=''.join(f'<a href="{r["file"]}"><img src="{r["file"]}" alt="{r["name"]}, {r["viewport"][0]} pixels" loading="lazy"><span>{r["name"]} · {r["viewport"][0]}px</span></a>' for r in evidence)
(OUT/'index.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Community Hub · October 1 review</title><style>
*{box-sizing:border-box}body{margin:0;background:#f3f5ef;color:#203c2a;font:16px/1.5 system-ui,sans-serif}
header,main{max-width:1500px;margin:auto;padding:32px}header{border-bottom:1px solid #ccd7c9}
h1{font-size:clamp(30px,4vw,50px);line-height:1.1;max-width:20ch}h2{font-size:25px;margin:32px 0 16px}
a{color:#246438}nav{display:flex;gap:20px;flex-wrap:wrap}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}
figure{margin:0}figcaption{font-weight:700;margin-bottom:8px}img{width:100%;display:block;border:1px solid #ccd7c9;background:white;border-radius:8px}
details{margin:12px 0;border-top:1px solid #ccd7c9}summary{cursor:pointer;padding:15px 0;font-weight:700}details .pair{padding-bottom:20px}
.gallery{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}.gallery a{text-decoration:none}.gallery img{height:190px;object-fit:contain}span{display:block;margin-top:5px}
@media(max-width:800px){header,main{padding:20px}.pair{grid-template-columns:1fr}.gallery{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style><header><p>COMMUNITY HUB · OCTOBER 1, 2026</p><h1>Community Hub: revised visual story</h1>
<p>Responsive local candidate. Screenshots use the site’s brand fonts and reduced motion. Capture evidence records whether public feeds and embeds were enabled or blocked. Original CommunityHub.cloud copy is checked separately against captured source data.</p>
<nav><a href="http://127.0.0.1:4327/">Open website</a><a href="http://127.0.0.1:4327/products.html">Products</a><a href="http://127.0.0.1:4327/dashboards.html">Public dashboards</a><a href="inspection.json">Capture evidence</a></nav></header><main><section><h2>The live reference and the new slides</h2>'''+''.join(source_pairs)+'</section>'+panels+'<section><h2>Desktop, laptop and phone</h2><div class="gallery">'+thumbs+'</div></section></main></html>')
print(f'Saved {len(evidence)} screenshots and review at {OUT}')
print(json.dumps({'overflow': [r for r in evidence if r['overflow']>1], 'pageErrors':[r for r in evidence if r['errors']]}, indent=2))
