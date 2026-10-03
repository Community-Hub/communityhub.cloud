/* Web Embeddables: restyle demo. Runs only when [data-emb] exists. */
(function(){
  'use strict';
  var root = document.querySelector('[data-emb]');
  if (!root) return;
  var data;
  try { data = JSON.parse(document.getElementById('emb-data').textContent); } catch (e) { return; }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r){ return (r || root).querySelector(s); }
  function $$(s, r){ return [].slice.call((r || root).querySelectorAll(s)); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function clock(d){ return d.toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit', timeZone:'America/New_York'}); }
  function safe(fn){ return function(){ try { return fn.apply(this, arguments); } catch (e) { /* keep the page usable */ } }; }

  var PRESETS = data.presets || [], FONTS = data.fonts || {}, SPACING = data.spacing || {compact:.82, regular:1, roomy:1.18};
  var PBY = {}; PRESETS.forEach(function(p){ PBY[p.key] = p; });
  var site = $('[data-emb-site]');
  if (!site || !PRESETS.length) return;

  /* ------------------------------------------------ color helpers */
  function rgb(h){
    h = String(h || '').replace('#', '');
    if (h.length === 3) h = h.split('').map(function(c){ return c + c; }).join('');
    var n = parseInt(h, 16); if (isNaN(n)) n = 0;
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function lum(h){
    var c = rgb(h).map(function(v){ v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
  }
  function inkOn(h){
    var L = lum(h), light = 1.05 / (L + .05), dark = (L + .05) / (lum('#10151A') + .05);
    return light >= dark ? '#FFFFFF' : '#10151A';
  }
  function normHex(h){ h = String(h || '').trim(); if (!/^#[0-9a-f]{6}$/i.test(h)) return null; return h.toUpperCase(); }

  /* ------------------------------------------------ state */
  var state = {preset: PRESETS[0].key, brand: PRESETS[0].v.p, font: PRESETS[0].font, fontAll: false, corners: 'rounded', spacing: PRESETS[0].spacing, custom: false};

  var colorIn = $('#emb-color'), hexOut = $('[data-emb-hex]'), fontSel = $('#emb-font');
  var cornerIns = $$('input[name="emb-corners"]'), spaceIns = $$('input[name="emb-spacing"]');
  var outline = $('#emb-outline'), resetBtn = $('[data-emb-reset]'), customTag = $('[data-emb-custom]');
  var presetBtns = $$('.emb-pre'), swatches = $$('.emb-swatch');

  function radiusFor(p){ return state.corners === 'square' ? 0 : (p.radius || 12); }

  function paint(){
    var p = PBY[state.preset], v = p.v, st = site.style;
    var fh = (FONTS[state.font] || FONTS[p.font] || {}).stack || 'system-ui, sans-serif';
    var fb = state.fontAll ? fh : ((FONTS[p.body] || {}).stack || fh);
    var r = radiusFor(p);
    var vars = {
      '--s-p': state.brand, '--s-p-ink': inkOn(state.brand), '--s-acc': v.acc, '--s-bg': v.bg, '--s-surf': v.surf,
      '--s-text': v.text, '--s-muted': v.muted, '--s-line': v.line, '--s-head': v.head,
      '--s-font-h': fh, '--s-font-b': fb, '--s-r': r + 'px', '--s-r-sm': Math.min(r, 8) + 'px', '--s-r-pill': r ? '999px' : '0px',
      '--s-d': String(SPACING[state.spacing] || 1)
    };
    Object.keys(vars).forEach(function(k){ st.setProperty(k, vars[k]); });
    site.setAttribute('data-head', p.head);
    site.setAttribute('data-tabs', p.tabs);
    site.setAttribute('data-list', p.list);
    site.setAttribute('data-scheme', p.scheme);
    site.setAttribute('data-corners', state.corners);
  }

  function setText(sel, t){ var el = $(sel); if (el) el.textContent = t; }
  function partnerContent(p){
    setText('[data-emb-name]', p.site); setText('[data-emb-name2]', p.site);
    setText('[data-emb-host]', p.host); setText('[data-emb-page]', p.page); setText('[data-emb-page-c]', p.page);
    setText('[data-emb-tagline]', p.tagline);
    var logo = $('[data-emb-logo]'); if (logo) logo.innerHTML = p.logo;
    var menu = $('[data-emb-menu]');
    if (menu) menu.innerHTML = p.menu.map(function(m){ return '<li>' + esc(m) + '</li>'; }).join('') + '<li class="on">Community</li>';
  }

  function swap(){
    if (reduce) return;
    [site, $('.emb-url')].forEach(function(el){ if (!el) return; el.classList.remove('is-swapping'); void el.offsetWidth; el.classList.add('is-swapping'); });
    clearTimeout(swap.t);
    swap.t = setTimeout(function(){ site.classList.remove('is-swapping'); var u = $('.emb-url'); if (u) u.classList.remove('is-swapping'); }, 650);
  }

  function syncControls(){
    if (colorIn) colorIn.value = state.brand.toLowerCase();
    if (hexOut) hexOut.textContent = state.brand.toUpperCase();
    if (fontSel) fontSel.value = state.font;
    cornerIns.forEach(function(i){ i.checked = i.value === state.corners; });
    spaceIns.forEach(function(i){ i.checked = i.value === state.spacing; });
    presetBtns.forEach(function(b){ b.setAttribute('aria-pressed', !state.custom && b.getAttribute('data-preset') === state.preset ? 'true' : 'false'); });
    swatches.forEach(function(s){ s.setAttribute('aria-pressed', normHex(s.getAttribute('data-color')) === state.brand.toUpperCase() ? 'true' : 'false'); });
    if (customTag) customTag.hidden = !state.custom;
    if (resetBtn) resetBtn.disabled = !state.custom;
  }

  /* ------------------------------------------------ example snippet */
  var codeEl = $('[data-emb-code]'), lastLines = null;
  function hl(line){
    var t = esc(line);
    if (/^&lt;!--/.test(t)) return '<span class="t-com">' + t + '</span>';
    t = t.replace(/(&lt;\/?)([a-z-]+)/g, '<span class="t-pun">$1</span><span class="t-tag">$2</span>')
         .replace(/([a-z-]+)=(&quot;)(.*?)(&quot;)/g, '<span class="t-attr">$1</span><span class="t-pun">=</span><span class="t-val">$2$3$4</span>')
         .replace(/(&gt;)/g, '<span class="t-pun">$1</span>');
    return t;
  }
  function snippet(){
    if (!codeEl) return;
    var p = PBY[state.preset];
    var lines = [
      '<!-- Example, not a real API -->',
      '<script src="https://embed.example/ch.js"></script>',
      '<community-dashboard',
      '  community="oberlin"',
      '  partner="' + (state.custom ? 'your-organization' : p.key) + '"',
      '  tabs="events jobs live-data voices citywide"',
      '  brand-color="' + state.brand.toLowerCase() + '"',
      '  font="' + ((FONTS[state.font] || {}).label || '') + '"',
      '  corners="' + state.corners + '"',
      '  spacing="' + state.spacing + '"',
      '  color-scheme="' + p.scheme + '">',
      '</community-dashboard>'
    ];
    codeEl.innerHTML = lines.map(function(l, i){
      var fresh = lastLines && lastLines[i] !== l && !reduce;
      return '<span class="ln' + (fresh ? ' is-new' : '') + '">' + hl(l) + '</span>';
    }).join('');
    lastLines = lines;
  }

  /* ------------------------------------------------ apply */
  function applyPreset(key, quiet){
    var p = PBY[key]; if (!p) return;
    var changed = key !== state.preset || state.custom;
    state = {preset: key, brand: normHex(p.v.p) || '#58BA51', font: p.font, fontAll: false, corners: p.radius === 0 ? 'square' : 'rounded', spacing: p.spacing, custom: false};
    partnerContent(p); paint(); syncControls(); snippet();
    if (changed && !quiet) swap();
  }
  function customize(patch, fontChange){
    Object.keys(patch).forEach(function(k){ state[k] = patch[k]; });
    state.custom = true;
    paint(); syncControls(); snippet();
    if (fontChange) swap();
  }

  /* ------------------------------------------------ style tour */
  var tourBtn = $('[data-emb-tour]'), tourLabel = $('[data-emb-tour-t]'), tourTimer = null, touring = false, toured = false, interacted = false, tourLeft = 0;
  var STEP = 2800;
  root.style.setProperty('--emb-step', STEP + 'ms');
  function setTourUI(){ if (!tourBtn) return; tourBtn.classList.toggle('is-on', touring); if (tourLabel) tourLabel.textContent = touring ? 'Stop the style tour' : 'Play the style tour'; root.classList.toggle('is-touring', touring); }
  function stopTour(){ clearInterval(tourTimer); tourTimer = null; touring = false; setTourUI(); }
  function tourNext(){
    var keys = PRESETS.map(function(p){ return p.key; });
    var i = keys.indexOf(state.preset);
    applyPreset(keys[(i + 1) % keys.length]);
    tourLeft--; if (tourLeft <= 0) stopTour();
    else { root.classList.remove('is-touring'); void root.offsetWidth; root.classList.add('is-touring'); }
  }
  function startTour(){
    stopTour(); touring = true; toured = true; tourLeft = PRESETS.length;
    setTourUI();
    tourTimer = setInterval(safe(tourNext), STEP);
  }
  if (tourBtn){
    tourBtn.hidden = false;
    tourBtn.addEventListener('click', function(ev){ ev.stopPropagation(); interacted = true; if (touring) stopTour(); else startTour(); });
  }
  function userAct(){ interacted = true; if (touring) stopTour(); }
  root.addEventListener('pointerdown', function(ev){ if (tourBtn && tourBtn.contains(ev.target)) return; userAct(); });
  root.addEventListener('keydown', function(ev){ if (tourBtn && tourBtn.contains(ev.target)) return; if (ev.key !== 'Tab' && ev.key !== 'Shift') userAct(); });

  /* ------------------------------------------------ wire controls */
  presetBtns.forEach(function(b){ b.addEventListener('click', safe(function(){ userAct(); applyPreset(b.getAttribute('data-preset')); })); });
  if (colorIn){
    var onColor = safe(function(){ var h = normHex(colorIn.value); if (h) customize({brand: h}); });
    colorIn.addEventListener('input', onColor); colorIn.addEventListener('change', onColor);
  }
  swatches.forEach(function(s){ s.addEventListener('click', safe(function(){ var h = normHex(s.getAttribute('data-color')); if (h) customize({brand: h}); })); });
  if (fontSel) fontSel.addEventListener('change', safe(function(){ customize({font: fontSel.value, fontAll: true}, true); }));
  cornerIns.forEach(function(i){ i.addEventListener('change', safe(function(){ if (i.checked) customize({corners: i.value}); })); });
  spaceIns.forEach(function(i){ i.addEventListener('change', safe(function(){ if (i.checked) customize({spacing: i.value}); })); });
  if (outline){
    var onOutline = function(){ root.classList.toggle('is-outlined', outline.checked); };
    outline.addEventListener('change', onOutline); onOutline();
  }
  if (resetBtn) resetBtn.addEventListener('click', safe(function(){ applyPreset(state.preset); }));

  /* ------------------------------------------------ tabs inside the embed */
  var tablist = $('.emb-e-tabs'), tabs = tablist ? $$('[role="tab"]', tablist) : [];
  function pickTab(t, focus){
    tabs.forEach(function(x){
      var on = x === t;
      x.setAttribute('aria-selected', on ? 'true' : 'false');
      x.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(x.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focus) t.focus();
    if (t.id === 'emb-t-live' || t.id === 'emb-t-citywide') gauge.start(); else gauge.pause();
    if (t.scrollIntoView && tablist.scrollWidth > tablist.clientWidth){ try { t.scrollIntoView({block:'nearest', inline:'nearest'}); } catch (e) {} }
  }
  if (tablist){
    tablist.addEventListener('click', function(ev){ var t = ev.target.closest('[role="tab"]'); if (t) pickTab(t, false); });
    tablist.addEventListener('keydown', function(ev){
      var i = tabs.indexOf(document.activeElement); if (i < 0) return;
      var n = null, k = ev.key;
      if (k === 'ArrowRight' || k === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
      else if (k === 'ArrowLeft' || k === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (k === 'Home') n = tabs[0];
      else if (k === 'End') n = tabs[tabs.length - 1];
      if (n){ ev.preventDefault(); pickTab(n, true); }
    });
  }

  /* ------------------------------------------------ Community Voices slides */
  var cv = $('[data-emb-cv]');
  if (cv){
    var slides = $$('.emb-cv-slide', cv), ci = 0, counter = $('[data-emb-cv-n]', cv);
    var go = function(n){ ci = (n + slides.length) % slides.length; slides.forEach(function(s, k){ s.hidden = k !== ci; }); if (counter) counter.textContent = (ci + 1) + ' of ' + slides.length; };
    var prev = $('[data-emb-cv-prev]', cv), next = $('[data-emb-cv-next]', cv);
    if (prev) prev.addEventListener('click', function(){ go(ci - 1); });
    if (next) next.addEventListener('click', function(){ go(ci + 1); });
  }

  /* ------------------------------------------------ live data */
  function getJSON(url){
    var ctl = ('AbortController' in window) ? new AbortController() : null;
    var t = ctl ? setTimeout(function(){ ctl.abort(); }, 9000) : null;
    return fetch(url, ctl ? {signal: ctl.signal} : {}).then(function(r){ clearTimeout(t); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }
  function getText(url){
    var ctl = ('AbortController' in window) ? new AbortController() : null;
    var t = ctl ? setTimeout(function(){ ctl.abort(); }, 9000) : null;
    return fetch(url, ctl ? {signal: ctl.signal, cache: 'no-store'} : {cache: 'no-store'}).then(function(r){ clearTimeout(t); if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); });
  }
  var LIVE = '<span class="emb-live"><i></i>Live</span>';

  /* events: the same Oberlin calendar feed the rest of the site uses */
  var evBox = $('[data-emb-events]'), evSrc = $('[data-emb-ev-src]');
  if (evBox && window.fetch){
    var CAL = 'https://oberlin.communityhub.cloud/api/legacy/calendar/full?t=';
    var monthKey = function(y, m){ return Math.floor(new Date(y, m - 1, 3).getTime() / 1000); };
    var now = new Date(), y = now.getFullYear(), m = now.getMonth() + 1, ny = m === 12 ? y + 1 : y, nm = m === 12 ? 1 : m + 1;
    Promise.all([getJSON(CAL + monthKey(y, m)), getJSON(CAL + monthKey(ny, nm)).catch(function(){ return {sessions: []}; })])
      .then(function(res){
        var t0 = new Date(); t0.setHours(0, 0, 0, 0);
        var nowS = Date.now() / 1000, fromS = t0.getTime() / 1000, seen = {};
        var list = (res[0].sessions || []).concat(res[1].sessions || [])
          .filter(function(s){ return s && s.postName && s.start >= fromS && s.end >= nowS && (s.end - s.start) < 86400 * 2; })
          .sort(function(a, b){ return a.start - b.start; })
          .filter(function(s){ var k = s.postId + ':' + new Date(s.start * 1000).toDateString(); if (seen[k]) return false; seen[k] = 1; return true; })
          .slice(0, 6);
        if (!list.length) throw new Error('no events');
        var o = {timeZone: 'America/New_York'};
        evBox.innerHTML = list.map(function(s){
          var d = new Date(s.start * 1000);
          var mon = d.toLocaleDateString('en-US', Object.assign({month: 'short'}, o)), day = d.toLocaleDateString('en-US', Object.assign({day: 'numeric'}, o));
          var wd = d.toLocaleDateString('en-US', Object.assign({weekday: 'long'}, o));
          return '<li><a href="https://environmentaldashboard.org/calendar/post/' + encodeURIComponent(s.postId) + '" target="_blank" rel="noopener">' +
            '<span class="emb-date"><small>' + esc(mon) + '</small><b>' + esc(day) + '</b></span>' +
            '<span class="emb-what"><b>' + esc(s.postName) + '</b><small>' + esc(wd) + ', ' + esc(clock(d)) + '</small></span>' +
            '<span class="emb-vh"> (opens in a new tab)</span></a></li>';
        }).join('');
        if (evSrc) evSrc.innerHTML = LIVE + '<span>From Oberlin’s community calendar, updated ' + esc(clock(new Date())) + ' Eastern.</span>';
      })
      .catch(function(){ if (evSrc) evSrc.textContent = 'The live calendar did not answer, so these are events captured on 23 Sep 2026.'; });
  }

  /* jobs: the newest posts on the Cleveland (MidTown) jobs board */
  var jobBox = $('[data-emb-jobs]'), jobSrc = $('[data-emb-jobs-src]');
  if (jobBox && window.fetch){
    var JOBS = 'https://cleveland.communityhub.cloud/api/legacy/calendar/jobs/list';
    var KIND = {1: 'Full-time', 2: 'Part-time', 3: 'Contract', 4: 'Temporary', 5: 'Volunteer', 6: 'Internship'};
    var BRIEF = (jobBox.querySelector('.emb-job-ic') || {}).innerHTML || '';
    getJSON(JOBS)
      .then(function(d){
        var last = Math.max(0, Math.ceil((d.count || 0) / (d.limit || 10)) - 1);
        if (last === 0) return d.posts || [];
        return Promise.all([getJSON(JOBS + '?page=' + last), getJSON(JOBS + '?page=' + (last - 1)).catch(function(){ return {posts: []}; })])
          .then(function(r){ return (r[0].posts || []).concat(r[1].posts || []); });
      })
      .then(function(posts){
        var per = {}, pick = [];
        posts.filter(function(p){ return p && p.name && p.approved !== false && p.public !== false && !p.isAnnouncement; })
          .sort(function(a, b){ return (b.createdAt || 0) - (a.createdAt || 0); })
          .forEach(function(p){
            if (pick.length >= 4) return;
            var org = (p.sponsors || []).map(function(s){ return s && s.name ? String(s.name).trim() : ''; }).filter(function(n){ return n && !/^adding sponsor$/i.test(n); })[0];
            if (!org) return;
            per[org] = (per[org] || 0) + 1; if (per[org] > 2) return;
            pick.push({name: String(p.name).trim(), org: org, kind: KIND[p.employmentType] || '', at: p.createdAt});
          });
        if (pick.length < 2) throw new Error('too few jobs');
        jobBox.innerHTML = pick.map(function(j){
          var posted = j.at ? new Date(j.at * 1000).toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone: 'America/New_York'}) : '';
          return '<li><span class="emb-job-ic">' + BRIEF + '</span><span class="emb-what"><b>' + esc(j.name) + '</b><small>' + esc(j.org) + '</small></span>' +
            '<span class="emb-job-meta">' + (j.kind ? '<span class="emb-chip">' + esc(j.kind) + '</span>' : '') + (posted ? '<small>Posted ' + esc(posted) + '</small>' : '') + '</span></li>';
        }).join('');
        if (jobSrc) jobSrc.innerHTML = LIVE + '<span>Latest posts on MidTown Cleveland’s jobs board, checked ' + esc(clock(new Date())) + ' Eastern.</span>';
      })
      .catch(function(){ if (jobSrc) jobSrc.textContent = 'The jobs board did not answer, so these are posts captured on 23 Sep 2026.'; });
  }

  /* gauge 1021: whole-city electricity, parsed from the public gauge SVG (same method as site.js) */
  var DIGITS = {zero:'0', one:'1', two:'2', three:'3', four:'4', five:'5', six:'6', seven:'7', eight:'8', nine:'9'};
  function parseGauge(svg){
    var texts = [], mm, re = /<text([^>]*)>([\s\S]*?)<\/text>/g;
    while ((mm = re.exec(svg))){ var tx = mm[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); if (tx && !/^\d$/.test(tx)) texts.push(tx); }
    var parts = [], r2 = /translate\(([-0-9.]+),\s*0\)">\s*<g class='(\w+)'/g;
    while ((mm = r2.exec(svg))) parts.push([parseFloat(mm[1]), DIGITS[mm[2]] || '']);
    var r3 = /<text[^>]*\bx=["']([-0-9.]+)["'][^>]*>\s*([,.])\s*<\/text>/g;
    while ((mm = r3.exec(svg))) parts.push([parseFloat(mm[1]), mm[2]]);
    parts.sort(function(a, b){ return a[0] - b[0]; });
    var value = parts.map(function(p){ return p[1]; }).join('');
    var words = texts.filter(function(t){ return t !== ',' && t !== '.' && t !== 'LOW' && t !== 'HIGH'; });
    var cx = (svg.match(/<circle cx="([-0-9.]+)%"/) || [])[1];
    return {title: words[0] || '', unit: words[1] || '', value: value, pos: cx != null ? Math.max(0, Math.min(1, parseFloat(cx) / 70)) : .5};
  }
  function where(pos){ return pos < .2 ? 'near the low end' : pos < .4 ? 'below the middle' : pos < .6 ? 'in the middle' : pos < .8 ? 'above the middle' : 'near the high end'; }
  var gauge = (function(){
    var box = $('[data-emb-gauge]'), timer = null, visible = false, active = false, got = false;
    var GAUGE = 'https://oberlin.communityhub.cloud/fe/api/data-hub-v2/visualizations/gauges/1021';
    function render(g){
      var pos = Math.max(0, Math.min(1, g.pos));
      var fill = $('[data-emb-g-fill]'), knob = $('[data-emb-g-knob]');
      if (fill) fill.style.strokeDashoffset = String(100 - Math.max(pos * 100, 1.5));
      if (knob){ var a = Math.PI * pos; knob.setAttribute('cx', (110 - 90 * Math.cos(a)).toFixed(1)); knob.setAttribute('cy', (114 - 90 * Math.sin(a)).toFixed(1)); }
      // Flash on the Citywide Dashboard tab: same mood thresholds and GIFs as setMood() in site.js
      var fl = $('[data-emb-flash]');
      if (fl){
        var mood = pos < .4 ? 'happy' : pos < .7 ? 'neutral' : 'angry';
        var want = 'assets/mascot-' + mood + '-clean.gif';
        if (fl.getAttribute('src') !== want) fl.setAttribute('src', want);
        fl.alt = 'Flash the squirrel looks ' + (mood === 'angry' ? 'upset' : mood) + ' about the city\u2019s electricity use right now';
      }
      setText('[data-emb-g-val]', g.value); setText('[data-emb-g-unit]', g.unit); setText('[data-emb-g-title]', g.title);
      if (box) box.setAttribute('aria-label', g.title + ': ' + g.value + ' ' + g.unit + ', ' + where(pos) + ' of its usual range');
    }
    function load(){
      if (!window.fetch || !box) return;
      getText(GAUGE).then(parseGauge).then(function(g){
        if (!g.value || !/\d/.test(g.value)) throw new Error('no value');
        got = true; render(g);
        setText('[data-emb-g-src]', '');
        var src = $('[data-emb-g-src]'); if (src) src.innerHTML = LIVE + '<span>From Oberlin’s gauge feed, updated ' + esc(clock(new Date())) + ' Eastern.</span>';
      }).catch(function(){ if (!got){ setText('[data-emb-g-src]', 'The gauge feed did not answer, so this is a reading captured on 23 Sep 2026.'); } });
    }
    function tick(){ if (active && visible && !document.hidden) load(); }
    function start(){ active = true; if (!timer){ timer = setInterval(tick, 60000); } }
    function pause(){ active = false; }
    // Initial knob position from the server-rendered fallback, then one live read.
    render({title: ($('[data-emb-g-title]') || {}).textContent || '', value: ($('[data-emb-g-val]') || {}).textContent || '', unit: ($('[data-emb-g-unit]') || {}).textContent || '', pos: .03});
    load();
    if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ es.forEach(function(en){ visible = en.isIntersecting; }); }, {threshold: .1}).observe(root);
    else visible = true;
    return {start: start, pause: pause};
  })();

  /* ------------------------------------------------ start */
  applyPreset(state.preset, true);
  if (!reduce && 'IntersectionObserver' in window && tourBtn){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(en){
        if (en.isIntersecting && !toured && !interacted){ io.disconnect(); setTimeout(function(){ if (!interacted && !toured) startTour(); }, 900); }
      });
    }, {threshold: .45});
    io.observe(site);
  }
})();
