(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return [].slice.call((r || document).querySelectorAll(s)); }

  /* header shadow + mobile menu */
  var head = $('#site-head');
  if (head){ var onS = function(){ head.classList.toggle('scrolled', window.scrollY > 8); }; window.addEventListener('scroll', onS, {passive:true}); onS(); }
  var btn = $('#menu-btn'), nav = $('#site-nav');
  function setMenu(o){
    if(!nav) return;
    if(o && head) nav.style.setProperty('--nav-top', Math.round(head.getBoundingClientRect().bottom) + 'px');
    if(head) head.classList.toggle('menu-open', o);
    nav.classList.toggle('open', o);
    btn.setAttribute('aria-expanded', o ? 'true' : 'false');
    if(btn.lastChild && btn.lastChild.nodeType === 3) btn.lastChild.textContent = o ? 'Close' : 'Menu';
    document.body.style.overflow = o ? 'hidden' : '';
  }
  if (btn) btn.addEventListener('click', function(){ setMenu(!nav.classList.contains('open')); });

  /* dropdowns */
  var dds = $$('.nav .dd');
  function closeAll(except){ dds.forEach(function(d){ if(d !== except){ d.classList.remove('open'); d.querySelector('button').setAttribute('aria-expanded','false'); } }); }
  dds.forEach(function(d){
    var b = d.querySelector('button');
    b.addEventListener('click', function(e){ e.stopPropagation(); var o = !d.classList.contains('open'); closeAll(d); d.classList.toggle('open', o); b.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  });
  document.addEventListener('click', function(e){ if(!e.target.closest('.dd')) closeAll(null); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ closeAll(null); if(nav && nav.classList.contains('open')){ setMenu(false); btn.focus(); } } });

  /* tabs helper with arrow keys */
  function tabs(list, sel, onPick){
    var items = $$(sel, list);
    function pick(b, focus){ items.forEach(function(x){ var on = x === b; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; }); if(focus) b.focus(); onPick(b); }
    list.addEventListener('click', function(e){ var b = e.target.closest(sel); if(b) pick(b, false); });
    list.addEventListener('keydown', function(e){
      var i = items.indexOf(document.activeElement); if(i < 0) return; var k = e.key, n = null;
      if(k === 'ArrowRight' || k === 'ArrowDown') n = items[(i+1) % items.length];
      else if(k === 'ArrowLeft' || k === 'ArrowUp') n = items[(i-1+items.length) % items.length];
      else if(k === 'Home') n = items[0]; else if(k === 'End') n = items[items.length-1];
      if(n){ e.preventDefault(); pick(n, true); }
    });
    return pick;
  }

  /* audience switcher */
  var tl = $('.tabs[data-for="aud"]');
  if (tl) tabs(tl, '[role="tab"]', function(b){ $$('.aud').forEach(function(p){ p.hidden = p.id !== b.getAttribute('aria-controls'); }); });

  /* product explorer */
  var plist = $('#plist');
  if (plist){
    var stage = $('#pstage');
    var show = function(b){
      var k = b.getAttribute('data-p');
      stage.innerHTML = ''; stage.appendChild($('#tpl-' + k).content.cloneNode(true));
      $('#pfig').textContent = b.getAttribute('data-fig');
      $('#ptitle').textContent = b.getAttribute('data-title');
      $('#pdesc').textContent = b.getAttribute('data-desc');
      $('#pchips').innerHTML = b.getAttribute('data-chips').split(',').map(function(x){ return '<span class="chip">' + x + '</span>'; }).join('');
      var l = $('#plink'); l.href = b.getAttribute('data-href'); l.firstChild.textContent = 'More about ' + b.getAttribute('data-title') + ' ';
      if (b.id) $('#pview').setAttribute('aria-labelledby', b.id);
      if (window.chLoadEvents) $$('[data-events]', stage).forEach(window.chLoadEvents);
    };
    tabs(plist, '.pbtn', show);
    show($('.pbtn[aria-selected="true"]', plist));
  }

  /* community voices arrows */
  var row = $('#cv-row');
  if (row){
    var step = function(dir){ var c = $('.cv', row); var w = c ? c.getBoundingClientRect().width + 18 : 320; row.scrollBy({left: dir * w * (window.innerWidth > 900 ? 2 : 1), behavior: reduce ? 'auto' : 'smooth'}); };
    $('#cv-prev').addEventListener('click', function(){ step(-1); });
    $('#cv-next').addEventListener('click', function(){ step(1); });
  }

  /* phone controller */
  var pad = $('#pad');
  if (pad){
    var names = {cwd:'Citywide Dashboard', building:'Building Dashboard', calendar:'Community Calendar', voices:'Community Voices', stories:'Stories', local:'This screen only'};
    var seq = ['cwd','calendar','voices','local','building','stories'];
    var views = $$('#screen .view'), nameEl = $('#screen-name'), modeEl = $('#screen-mode'), meta = $('.screen-meta');
    var cur = 'cwd', timer = null, manual = false, inView = false, idle = null;
    var showV = function(k){ cur = k; views.forEach(function(v){ v.hidden = v.getAttribute('data-view') !== k; }); $$('button', pad).forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-go') === k ? 'true' : 'false'); }); nameEl.textContent = 'Showing: ' + names[k]; };
    var tick = function(){ showV(seq[(seq.indexOf(cur)+1) % seq.length]); };
    var start = function(){ if(reduce || manual || timer || !inView) return; timer = setInterval(tick, 6000); };
    var stop = function(){ clearInterval(timer); timer = null; };
    pad.addEventListener('click', function(e){
      var b = e.target.closest('button'); if(!b) return;
      if (meta) meta.setAttribute('aria-live', 'polite');
      manual = true; stop(); showV(b.getAttribute('data-go')); modeEl.textContent = 'Phone control';
      clearTimeout(idle);
      idle = setTimeout(function(){ manual = false; if (meta) meta.setAttribute('aria-live', 'off'); modeEl.textContent = reduce ? 'Tap to change' : 'Back to the loop'; start(); }, 20000);
    });
    if (reduce) modeEl.textContent = 'Tap to change';
    var ctl = $('#controller');
    if ('IntersectionObserver' in window && ctl){ new IntersectionObserver(function(es){ es.forEach(function(en){ inView = en.isIntersecting; if(inView) start(); else stop(); }); }, {threshold: .3}).observe(ctl); } else { inView = true; start(); }
    var pmOpen = $('#pm-open'), pmBack = $('#pm-back'), more = $('#phone-more'), pmView = $('#pm-view'), foot = $('#phone-foot');
    if (pmOpen && pmBack && more && pmView){
      pmOpen.addEventListener('click', function(){
        var v = $('#screen .view[data-view="' + cur + '"]');
        pmView.innerHTML = '';
        if (v){ var c = v.cloneNode(true); c.hidden = false; c.removeAttribute('data-view'); pmView.appendChild(c); }
        var k = $('.pm-k', more); if (k) k.textContent = 'On your phone: ' + names[cur];
        pad.hidden = true; if (foot) foot.hidden = true; pmOpen.parentNode.hidden = true; more.hidden = false; pmBack.focus();
      });
      pmBack.addEventListener('click', function(){ more.hidden = true; pad.hidden = false; if (foot) foot.hidden = false; pmOpen.parentNode.hidden = false; pmOpen.focus(); });
    }
  }

  /* statement fill on scroll */
  var st = $('#statement');
  if (st){
    var words = st.textContent.trim().split(/\s+/);
    st.innerHTML = words.map(function(w){ return '<span class="w">' + w + '</span> '; }).join('');
    var ws = $$('.w', st);
    var fill = function(){ var r = st.getBoundingClientRect(), vh = window.innerHeight; var p = reduce ? 1 : Math.min(1, Math.max(0, (vh*0.85 - r.top) / (r.height + vh*0.35))); var n = Math.round(p * ws.length); ws.forEach(function(w, i){ w.classList.toggle('on', i < n); }); };
    window.addEventListener('scroll', fill, {passive:true}); window.addEventListener('resize', fill); fill();
  }

  /* lesson library filter */
  var lessons = $('#lessons');
  if (lessons){
    var q = $('#lesson-q'), level = 'all', items = $$('li', lessons), empty = $('#lessons-empty'), count = $('#lesson-count');
    var run = function(){
      var t = (q.value || '').toLowerCase().trim(), n = 0;
      items.forEach(function(li){ var ok = (level === 'all' || li.getAttribute('data-level').indexOf(level) > -1) && (!t || li.textContent.toLowerCase().indexOf(t) > -1); li.hidden = !ok; if(ok) n++; });
      empty.hidden = n > 0; count.textContent = n + ' of ' + items.length + ' lessons and units';
    };
    q.addEventListener('input', run);
    $$('#lesson-level button').forEach(function(b){ b.addEventListener('click', function(){ level = b.getAttribute('data-level'); $$('#lesson-level button').forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); run(); }); });
    run();
  }

  /* copy email */
  $$('[data-copy]').forEach(function(cb){
    cb.addEventListener('click', function(){
      var em = document.getElementById(cb.getAttribute('data-copy')), ok = document.getElementById(cb.getAttribute('data-ok'));
      var sel = function(){ var r = document.createRange(); r.selectNodeContents(em); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); ok.textContent = 'Selected. Press Ctrl+C or Cmd+C to copy.'; };
      try { navigator.clipboard.writeText(em.textContent).then(function(){ ok.textContent = 'Copied to your clipboard.'; }, sel); } catch(err){ sel(); }
    });
  });

  /* contact form: compose the message (no server in this prototype) */
  var form = $('#contact-form');
  if (form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var f = new FormData(form), out = $('#form-out');
      if(!f.get('name') || !f.get('org')){ out.textContent = 'Add your name and organization so we know who to reply to.'; return; }
      var msg = 'Name: ' + f.get('name') + '\nOrganization: ' + f.get('org') + '\nType: ' + (f.get('type') || 'not given') + '\nBuildings or sites: ' + (f.get('sites') || 'not sure yet') + '\n\n' + (f.get('msg') || '');
      var done = function(){ out.textContent = 'Your message is copied. Paste it into an email to connect@communityhub.cloud.'; };
      try { navigator.clipboard.writeText(msg).then(done, function(){ out.textContent = 'Copy this into an email to connect@communityhub.cloud: ' + msg.replace(/\n/g, ' | '); }); } catch(err){ out.textContent = 'Copy this into an email to connect@communityhub.cloud: ' + msg.replace(/\n/g, ' | '); }
      location.href = 'mailto:connect@communityhub.cloud?subject=' + encodeURIComponent('Demo request from ' + f.get('org')) + '&body=' + encodeURIComponent(msg);
    });
  }
})();

/* ================= live data from Community Hub's public endpoints ================= */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return [].slice.call((r || document).querySelectorAll(s)); }
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function clock(d){ return d.toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit', timeZone:'America/New_York'}); }

  /* ---- Citywide Dashboard gauges ---- */
  var GAUGE_API = 'https://oberlin.communityhub.cloud/fe/api/data-hub-v2/visualizations/gauges/';
  var VIEWS = {
    electricity: {label:'Electricity', ids:[1021,1020,1019,1018]},
    water: {label:'Water', ids:[1025,1024,1023,1022]},
    stream: {label:'Stream', ids:[1029,1028,1027,1026]},
    weather: {label:'Weather', ids:[1033,1031,1032,1030]}
  };
  var DIGITS = {zero:'0',one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',seven:'7',eight:'8',nine:'9'};
  function aqiColor(v){ return v <= 50 ? '#3E9B47' : v <= 100 ? '#D9A21B' : v <= 150 ? '#E67E22' : v <= 200 ? '#D9533F' : v <= 300 ? '#8E44AD' : '#7B1E2B'; }
  function parseGauge(svg){
    var texts = [], m, re = /<text([^>]*)>([\s\S]*?)<\/text>/g;
    while ((m = re.exec(svg))){ var t = m[2].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); if (t && !/^\d$/.test(t)) texts.push({attrs:m[1], t:t}); }
    var parts = [], r2 = /translate\(([-0-9.]+),\s*0\)">\s*<g class='(\w+)'/g;
    while ((m = r2.exec(svg))) parts.push([parseFloat(m[1]), DIGITS[m[2]] || '']);
    var r3 = /<text[^>]*\bx=["']([-0-9.]+)["'][^>]*>\s*([,.])\s*<\/text>/g;
    while ((m = r3.exec(svg))) parts.push([parseFloat(m[1]), m[2]]);
    parts.sort(function(a,b){ return a[0]-b[0]; });
    var value = parts.map(function(p){ return p[1]; }).join('');
    var words = texts.map(function(x){ return x.t; }).filter(function(t){ return t !== ',' && t !== '.'; });
    if (words[0] === '-' || words[0] === '\u2212'){ value = '-' + value; words.shift(); }
    var aqi = words[0] === 'Air Quality Index';
    var title = aqi ? words[1] : (words[0] || '');
    var unit = aqi ? 'Air Quality Index' : (words[1] || '');
    var fill = (svg.match(/<rect[^>]*style="fill:(#[0-9a-fA-F]{3,6})/) || [])[1];
    var cx = (svg.match(/<circle cx="([-0-9.]+)%"/) || [])[1];
    var num = parseFloat(value.replace(/,/g,''));
    var pos = aqi ? Math.min(1, (num || 0) / 300) : (cx != null ? Math.max(0, Math.min(1, parseFloat(cx) / 70)) : .5);
    var bad = !aqi && num < 0 && unit.indexOf('\u00b0') < 0;
    return {title:title, unit: bad ? '' : unit, value: bad ? 'No reading' : value, pos: bad ? .5 : pos, color: aqi ? aqiColor(num) : (fill || '#3498db'), aqi:aqi};
  }
  function tileHTML(g){
    return '<div class="tile" style="background:' + g.color + '"><div class="t">' + esc(g.title) + '</div><div class="v' + (g.value === 'No reading' ? ' nodata' : '') + '">' + esc(g.value) + '</div><div class="u">' + esc(g.unit) + '</div>' +
      '<div class="bar" aria-hidden="true">' + (g.aqi ? 'HEALTHY' : 'LOW') + '<span class="track"><span class="knob" style="left:' + (g.pos*100).toFixed(1) + '%"></span></span>' + (g.aqi ? 'HAZARD' : 'HIGH') + '</div></div>';
  }
  function setMood(sign, pos){
    var m = $('.cwd-mascot', sign); if (!m) return;
    var mood = pos < .4 ? 'happy' : pos < .7 ? 'neutral' : 'angry';
    var want = 'assets/mascot-' + mood + '-clean.gif';
    if (m.getAttribute('src') !== want) m.setAttribute('src', want);
    m.alt = 'Flash the squirrel looks ' + (mood === 'angry' ? 'upset' : mood) + ' about the city\u2019s electricity use right now';
    m.hidden = false;
    var box = sign.parentNode || sign;
    $$('.sim-flash', box).forEach(function(f){
      var im = $('img', f); if (im && im.getAttribute('src') !== want) im.setAttribute('src', want);
      var lab = $('.sim-mood', f); if (lab) lab.textContent = mood === 'angry' ? 'Upset' : mood === 'happy' ? 'Happy' : 'Okay';
      f.setAttribute('data-mood', mood);
      f.classList.remove('pop'); void f.offsetWidth; f.classList.add('pop');
    });
  }
  $$('[data-live-cwd]').forEach(function(sign){
    var panel = $('.cwd-panel', sign), tiles = $('.tiles', panel), mode = $('.cwd-mode', panel);
    var cap = $('[data-live-cap]', sign), views = $$('.cwd-views button', sign);
    var current = 'electricity', timer = null, cache = {};
    var scene = $('.cwd-scene', sign), inlined = false;
    function inlineScene(){
      if (inlined || !scene || !window.fetch) return; inlined = true;
      var img = $('.sign-img', scene); if (!img) return;
      fetch(img.getAttribute('src')).then(function(r){ if(!r.ok) throw 0; return r.text(); }).then(function(t){
        var d = document.createElement('div'); d.innerHTML = t; var s = d.querySelector('svg'); if (!s) return;
        s.setAttribute('class', 'sign-img cwd-svg'); s.setAttribute('role', 'img'); s.setAttribute('aria-label', img.alt);
        img.replaceWith(s); scene.setAttribute('data-view', current);
      }).catch(function(){});
    }
    function load(view){
      var ids = VIEWS[view].ids;
      return Promise.all(ids.map(function(id){ return fetch(GAUGE_API + id, {cache:'no-store'}).then(function(r){ if(!r.ok) throw 0; return r.text(); }).then(parseGauge); }))
        .then(function(gs){
          cache[view] = gs;
          if (view !== current || sign.classList.contains('simulating')) return;
          tiles.innerHTML = gs.map(tileHTML).join('');
          tiles.setAttribute('aria-label', gs.map(function(g){ return g.title + ' ' + g.value + ' ' + g.unit; }).join('; '));
          mode.textContent = VIEWS[view].label;
          if (cap) cap.innerHTML = '<span class="live"><i></i>Live from Oberlin</span><span>Updated ' + clock(new Date()) + ' Eastern. Readings come straight from Community Hub’s public gauge feed, the same one the screens in town use. Flash reacts to the city\u2019s electricity use.</span>';
          sign.classList.add('is-live');
          if (view === 'electricity' && gs[0] && gs[0].value !== 'No reading' && !sign.classList.contains('simulating')){ setMood(sign, gs[0].pos); var r = $('.cwd-sim input', sign.parentNode); if (r) r.value = Math.round(gs[0].pos * 100); }
        })
        .catch(function(){
          if (view === current && !cache[view] && view !== 'electricity') mode.textContent = VIEWS[view].label + ' (not loading)';
          if (!cap || sign.classList.contains('is-live')) return;
          var lv = cap.querySelector('.live'); if (lv && lv.lastChild && lv.lastChild.nodeType === 3) lv.lastChild.textContent = 'Saved readings, 23 September 2026';
          var t = cap.querySelector('span:last-child');
          if (t && !t.hasAttribute('data-offline')){ t.setAttribute('data-offline', ''); t.textContent += ' Live readings could not be reached, so these are the values captured on September 23.'; }
        });
    }
    function pick(view){ current = view; if (scene && inlined) scene.setAttribute('data-view', view); views.forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-view') === view ? 'true' : 'false'); }); if (cache[view]){ tiles.innerHTML = cache[view].map(tileHTML).join(''); mode.textContent = VIEWS[view].label; } load(view); }
    views.forEach(function(b){ b.addEventListener('click', function(){ pick(b.getAttribute('data-view')); }); });
    var sim = $('.cwd-sim', sign.parentNode) || $('.cwd-sim', sign), range = sim && $('input', sim), back = sim && $('.sim-back', sim), flag = $('.sim-flag', sign);
    if (range){
      range.addEventListener('input', function(){
        var live = cache.electricity && cache.electricity[0];
        if (current !== 'electricity'){ var eb = sign.querySelector('.cwd-views button[data-view="electricity"]'); if (eb) eb.click(); else pick('electricity'); }
        var p = range.value / 100;
        sign.classList.add('simulating'); if (flag) flag.hidden = false; if (back) back.hidden = false;
        setMood(sign, p);
        var first = $('.tile', tiles);
        if (first && live){
          var knob = $('.knob', first); if (knob) knob.style.left = (p * 100).toFixed(1) + '%';
        }
        var out = $('.sim-out', sim); if (out) out.textContent = p < .4 ? 'Flash is happy. The town is using less than usual.' : p < .7 ? 'Flash is fine. Use is about normal.' : 'Flash is upset. The town is using a lot more than usual.';
      });
      if (back) back.addEventListener('click', function(){
        sign.classList.remove('simulating'); if (flag) flag.hidden = true; back.hidden = true;
        var live = cache.electricity && cache.electricity[0];
        if (live){ range.value = Math.round(live.pos * 100); }
        var out = $('.sim-out', sim); if (out) out.textContent = '';
        pick('electricity');
      });
    }
    function start(){ inlineScene(); if (timer) return; load(current); timer = setInterval(function(){ load(current); }, 60000); }
    function stop(){ clearInterval(timer); timer = null; }
    if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting) start(); else stop(); }); }, {threshold:.15}).observe(sign); else start();
  });

  /* ---- "Oberlin now" chip on every page ---- */
  var chip = $('[data-now]');
  var dismissed = false;
  try { dismissed = sessionStorage.getItem('ch-now-off') === '1'; } catch (e) {}
  if (chip && !dismissed){
    var NOW = [1021, 1019, 1033], readings = [], k = 0, rot = null;
    function show(){
      if (!readings.length) return;
      var g = readings[k % readings.length]; k++;
      $('[data-now-v]', chip).textContent = g.title + ': ' + g.value + ' ' + g.unit;
    }
    function pull(){
      Promise.all(NOW.map(function(id){ return fetch(GAUGE_API + id, {cache:'no-store'}).then(function(r){ if(!r.ok) throw 0; return r.text(); }).then(parseGauge).catch(function(){ return null; }); }))
        .then(function(gs){
          readings = gs.filter(function(g){ return g && g.value && g.value !== 'No reading'; });
          if (readings.length){ chip.hidden = false; show(); if (!chip.getAttribute('data-mini')){ chip.setAttribute('data-mini', '1'); setTimeout(function(){ chip.classList.add('mini'); }, 6000); } }
        });
    }
    pull();
    setInterval(function(){ if (!document.hidden) pull(); }, 60000);
    rot = setInterval(function(){ if (!document.hidden) show(); }, 5000);
    var x = $('.now-x', chip);
    var signs = $$('[data-live-cwd]');
    if (signs.length && 'IntersectionObserver' in window){
      var near = [];
      var nio = new IntersectionObserver(function(es){ es.forEach(function(en){ near[signs.indexOf(en.target)] = en.isIntersecting; }); chip.classList.toggle('near-sign', near.some(Boolean)); });
      signs.forEach(function(s){ nio.observe(s); });
    }
    if (x) x.addEventListener('click', function(ev){ ev.preventDefault(); ev.stopPropagation(); chip.hidden = true; clearInterval(rot); try { sessionStorage.setItem('ch-now-off', '1'); } catch (e) {} });
  }

  /* ---- contact page: Flash's mood from the live city electricity gauge ---- */
  var flash = $('.flash');
  if (flash){
    fetch(GAUGE_API + 1021, {cache:'no-store'}).then(function(r){ if(!r.ok) throw 0; return r.text(); }).then(parseGauge).then(function(g){
      if (!g || !g.value || g.value === 'No reading') return;
      var mood = g.pos < .4 ? 'happy' : g.pos < .7 ? 'neutral' : 'angry', word = mood === 'angry' ? 'upset' : mood;
      var img = $('img', flash), bub = $('.bubble', flash);
      if (img){ img.src = 'assets/mascot-' + mood + '-clean.gif'; img.alt = 'Flash the energy squirrel, looking ' + word; }
      if (bub) bub.textContent = 'Right now Oberlin is using ' + (mood === 'happy' ? 'less electricity than usual' : mood === 'neutral' ? 'about its usual amount of electricity' : 'more electricity than usual') + ', so Flash looks ' + word + '.';
    }).catch(function(){});
  }

  /* ---- upcoming events from the community calendar ---- */
  var CAL = 'https://oberlin.communityhub.cloud/api/legacy/calendar/full?t=';
  function monthKey(y, m){ return Math.floor(new Date(y, m - 1, 3).getTime() / 1000); }
  function loadEvents(box){
    var n = parseInt(box.getAttribute('data-count') || '6', 10), now = new Date();
    var y = now.getFullYear(), m = now.getMonth() + 1, ny = m === 12 ? y + 1 : y, nm = m === 12 ? 1 : m + 1;
    Promise.all([fetch(CAL + monthKey(y, m)).then(function(r){ return r.json(); }), fetch(CAL + monthKey(ny, nm)).then(function(r){ return r.json(); }).catch(function(){ return {sessions:[]}; })])
      .then(function(res){
        var t0 = new Date(); t0.setHours(0,0,0,0); var nowS = Date.now() / 1000, fromS = t0.getTime() / 1000, seen = {};
        var list = res[0].sessions.concat(res[1].sessions || []).filter(function(s){ return s.start >= fromS && s.end >= nowS && (s.end - s.start) < 86400 * 2; })
          .sort(function(a, b){ return a.start - b.start; })
          .filter(function(s){ var k = s.postId + ':' + new Date(s.start*1000).toDateString(); if (seen[k]) return false; seen[k] = 1; return true; }).slice(0, n);
        if (!list.length) throw 0;
        box.innerHTML = '<ul class="events-list">' + list.map(function(s){
          var d = new Date(s.start * 1000), opt = {timeZone:'America/New_York'};
          var mon = d.toLocaleDateString('en-US', Object.assign({month:'short'}, opt)), day = d.toLocaleDateString('en-US', Object.assign({day:'numeric'}, opt));
          var wd = d.toLocaleDateString('en-US', Object.assign({weekday:'long'}, opt));
          return '<li><a href="https://environmentaldashboard.org/calendar/post/' + s.postId + '" target="_blank" rel="noopener"><span class="date"><small>' + mon + '</small><b>' + day + '</b></span><span class="what"><b>' + esc(s.postName) + '</b><small>' + wd + ', ' + clock(d) + '</small></span></a></li>';
        }).join('') + '</ul><p class="events-src"><span class="live"><i></i>Live</span> From Oberlin’s community calendar, updated ' + clock(new Date()) + ' Eastern.</p>';
      })
      .catch(function(){ var f = box.querySelector('.events-fallback'); if (f && f.firstChild && f.firstChild.nodeType === 3) f.firstChild.textContent = "Upcoming events couldn't load here. Browse the "; });
  }
  $$('[data-events]').forEach(loadEvents);
  window.chLoadEvents = loadEvents;

  /* ---- live Community Voices slides (needs the site's /api/voices function) ---- */
  $$('[data-live-voices]').forEach(function(row){
    fetch('/api/voices').then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(d){
      var s = (d.slides || []).filter(function(x){ return x.quote.length <= 180; });
      if (s.length < 6) return;
      row.innerHTML = s.map(function(x){
        var img = '/_vercel/image?url=' + encodeURIComponent(x.image) + '&w=640&q=70';
        return '<article class="cv"><div class="ph"><img src="' + img + '" alt="' + esc(x.alt || '') + '" loading="lazy"></div><div class="q"><p>"' + esc(x.quote) + '"</p><div class="who"><b>' + esc(x.name) + '</b>' + (x.role ? ', ' + esc(x.role) : '') + '</div></div><div class="cat" style="background:' + esc(x.color) + '">' + esc(x.category) + '</div></article>';
      }).join('').replace(/([.!?])\."/g, '$1"');
      var note = document.getElementById('voices-live-note');
      if (note) note.innerHTML = '<span class="live"><i></i>Live</span> ' + s.length + ' slides pulled from Oberlin’s screens just now.';
    }).catch(function(){});
  });

  /* ---- live orbs (needs the site's /api/orbs function) ---- */
  $$('[data-orbs]').forEach(function(box){
    fetch('/api/orbs').then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(d){
      var elec = (d.orbs || []).filter(function(o){ return o.resource === 'electricity'; });
      if (!elec.length) throw 0;
      var byB = {}; elec.forEach(function(o){ (byB[o.building] = byB[o.building] || []).push(o); });
      var counts = {}; elec.forEach(function(o){ counts[o.status] = (counts[o.status] || 0) + 1; });
      box.innerHTML = '<div class="orb-grid">' + Object.keys(byB).sort().map(function(b){
        var o = byB[b][0];
        var st = String(o.status || '');
        return '<div class="orb-cell"><span class="orb" style="--c:' + o.color + '"></span><b>' + esc(b) + '</b><small>' + esc(st.charAt(0).toUpperCase() + st.slice(1)) + (byB[b].length > 1 ? ' · ' + byB[b].length + ' orbs' : '') + '</small></div>';
      }).join('') + '</div><p class="events-src"><span class="live"><i></i>Live</span> ' + elec.length + ' electricity orbs in ' + Object.keys(byB).length + ' buildings on the public orb page, updated ' + clock(new Date()) + ' Eastern: ' +
        ['very low','low','normal','high','very high'].filter(function(k){ return counts[k]; }).map(function(k){ return counts[k] + ' ' + k; }).join(', ') + '.</p>';
    }).catch(function(){});
  });
})();

/* v4: live frames, story player, bars, hub motion */
(function(){
  function $$(s, r){ return [].slice.call((r || document).querySelectorAll(s)); }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Live iframes: load when visible, or on click
  function loadFrame(fig){
    if (fig.getAttribute('data-loaded')) return;
    fig.setAttribute('data-loaded', '1');
    var body = fig.querySelector('.lf-body');
    var f = document.createElement('iframe');
    f.src = fig.getAttribute('data-src');
    f.title = 'Live view of ' + (fig.getAttribute('data-title') || 'a Community Hub dashboard');
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.style.opacity = '0';
    var shown = false, reveal = function(){ if (shown) return; shown = true; f.style.opacity = '1'; };
    f.addEventListener('load', function(){ setTimeout(reveal, 600); });
    setTimeout(reveal, 9000);
    body.innerHTML = '<span class="lf-wait">Loading the live dashboard</span>';
    body.appendChild(f);
  }
  // Phones get the full site in a new tab: the embeds' desktop layout doesn't fit a 350px frame
  var wide = !window.matchMedia || window.matchMedia('(min-width: 760px)').matches;
  var frames = $$('.live-frame[data-src]');
  frames.forEach(function(fig){
    var b = fig.querySelector('.lf-load');
    if (!b) return;
    if (!wide && b.lastChild && b.lastChild.nodeType === 3) b.lastChild.textContent = b.lastChild.textContent.replace(/^Load/, 'Open') + ' in a new tab';
    b.addEventListener('click', function(){ if (!wide){ window.open(fig.getAttribute('data-src'), '_blank', 'noopener'); return; } loadFrame(fig); });
  });
  if (wide && 'IntersectionObserver' in window && frames.length){
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting){ loadFrame(en.target); io.unobserve(en.target); } }); }, {rootMargin: '150px'});
    frames.forEach(function(f){ io.observe(f); });
  }

  // Story player
  $$('[data-story]').forEach(function(root){
    var slides = $$('.sp-slide', root), dots = $$('.sp-dots button', root), i = 0, timer = null, touched = false, pb = root.querySelector('.sp-pause');
    function go(n){
      i = (n + slides.length) % slides.length;
      slides.forEach(function(s, k){ s.hidden = k !== i; });
      dots.forEach(function(d, k){ if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    }
    function label(){ if (pb) pb.textContent = touched ? 'Play' : 'Pause'; }
    function stop(){ touched = true; clearInterval(timer); timer = null; label(); }
    function play(){ touched = false; if (!timer) timer = setInterval(function(){ go(i + 1); }, 6000); label(); }
    if (reduce) touched = true;
    label();
    if (pb) pb.addEventListener('click', function(){ if (touched) play(); else stop(); });
    root.querySelector('.sp-prev').addEventListener('click', function(){ stop(); go(i - 1); });
    root.querySelector('.sp-next').addEventListener('click', function(){ stop(); go(i + 1); });
    dots.forEach(function(d, k){ d.addEventListener('click', function(){ stop(); go(k); }); });
    root.addEventListener('keydown', function(ev){ if (ev.key === 'ArrowRight'){ stop(); go(i + 1); } if (ev.key === 'ArrowLeft'){ stop(); go(i - 1); } });
    if (!reduce && 'IntersectionObserver' in window){
      new IntersectionObserver(function(es){ es.forEach(function(en){
        if (en.isIntersecting && !touched && !timer) timer = setInterval(function(){ go(i + 1); }, 6000);
        if (!en.isIntersecting){ clearInterval(timer); timer = null; }
      }); }, {threshold: .5}).observe(root);
    }
  });

  // Bars fill when they come into view
  var bars = $$('[data-bars]');
  if ('IntersectionObserver' in window && !reduce){
    var bo = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('in'); bo.unobserve(en.target); } }); }, {threshold: .4});
    bars.forEach(function(b){ bo.observe(b); });
  } else bars.forEach(function(b){ b.classList.add('in'); });

  // Hub: stop the moving dots for people who prefer less motion
  if (reduce) $$('.hub-svg').forEach(function(s){ if (s.pauseAnimations) s.pauseAnimations(); });
})();

/* v4: rotate the real Citywide Dashboard tips inside each sign */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  [].slice.call(document.querySelectorAll('[data-live-cwd]')).forEach(function(sign){
    var src = sign.previousElementSibling, data = null;
    try { if (src && src.classList.contains('cwd-msgs')) data = JSON.parse(src.textContent); } catch (e) {}
    var tip = sign.querySelector('.cwd-tip p');
    if (!data || !tip) return;
    var view = 'electricity', n = 0;
    [].slice.call(sign.querySelectorAll('.cwd-views button')).forEach(function(b){
      b.addEventListener('click', function(){ view = b.getAttribute('data-view'); n = 0; next(); });
    });
    function next(){
      var sel = sign.querySelector('.cwd-views [aria-pressed="true"]'), v = sel ? sel.getAttribute('data-view') : 'electricity';
      if (v !== view){ view = v; n = 0; }
      var list = (data[view] && data[view].length ? data[view] : []).concat(data.landing || []);
      if (!list.length) return;
      var msg = list[n % list.length]; n++;
      if (reduce){ tip.textContent = msg; return; }
      tip.style.opacity = 0;
      setTimeout(function(){ tip.textContent = msg; tip.style.opacity = 1; }, 350);
    }
    tip.style.transition = 'opacity .35s ease';
    setInterval(function(){ if (!document.hidden) next(); }, 9000);
  });
})();
