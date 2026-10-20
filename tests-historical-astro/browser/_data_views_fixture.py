"""Two-chart DOM fixture for the retained Data Hub component.

No production route currently renders its load-profile/tab variant. Read the
actual catalog for endpoint/caption metadata and run the real compiled adapter;
full-page heat-map integration is checked separately.
"""
import json
import re
from html import escape
from _support import PROJECT, RUNTIME, built_styles


def chart_views():
    source=(PROJECT/'src/content/catalog.ts').read_text(encoding='utf-8')
    match=re.search(r'export const DATA_VIEWS:[^=]+=(\s*\[.*?\n\]);',source,re.S)
    if not match:
        raise AssertionError('DATA_VIEWS catalog could not be read')
    return [view for view in json.loads(match.group(1)) if view['key'] in ('heat','load')]


def open_chart_fixture(page, site_url):
    views=chart_views()
    tabs=[]
    panels=[]
    for index,view in enumerate(views):
        key=view['key']
        tabs.append(f'''<button type="button" role="tab" id="dvt-{key}" aria-controls="dvp-{key}"
            aria-selected="{str(index==0).lower()}" tabindex="{0 if index==0 else -1}">{escape(view['tab'])}</button>''')
        panels.append(f'''<div class="dv-view{' is-on' if index==0 else ''}" role="tabpanel" id="dvp-{key}" aria-labelledby="dvt-{key}">
            <div class="dv-frame"><div class="dv-chart" data-dv-{key}="{escape(view['src'],quote=True)}"></div></div>
            <div class="dv-note" id="dv-note-{key}" hidden><p><b>{escape(view['tab'])}</b>{escape(view['note'])}</p></div>
            <p class="dv-cap">Live: {escape(view['title'])}. <a href="{escape(view['live'],quote=True)}" target="_blank" rel="noopener">Open the live chart</a>
            <button type="button" data-dv-help aria-expanded="false" aria-controls="dv-note-{key}">What does this show?</button></p>
            </div>''')
    markup=f'''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body><main id="main"><section><div class="dv" data-dv style="max-width:720px;margin:24px">
        <div role="tablist">{''.join(tabs)}</div><div class="dv-stage">{''.join(panels)}</div>
        </div></section></main></body></html>'''
    url=site_url+'__test-data-views-fixture'
    page.route(url,lambda route:route.fulfill(status=200,content_type='text/html',body=markup))
    page.goto(url,wait_until='domcontentloaded')
    page.add_style_tag(content=built_styles())
    page.add_script_tag(path=str(RUNTIME/'pages_dataviews.js'))
    page.wait_for_function("document.querySelector('#dvp-heat').classList.contains('is-read')")
