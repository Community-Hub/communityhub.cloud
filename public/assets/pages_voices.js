/* Community Voices page: live wall, theme filters and the "Play as a sign" player.
   Only runs when the page's elements exist. Every network step has a fallback. */
(function(){
  var wall = document.querySelector('[data-cvp-wall]');
  var player = document.getElementById('cvp-player');
  if (!wall && !player) return;

  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var DUR = 7000;
  var LIVE_URL = '/api/voices';
  var SOURCE_URL = 'https://environmentaldashboard.org/cv-public/digital-signage';
  /* Slides that must never show here, whatever the feed sends (internal quote, no consent). */
  var BLOCK_NAME = /^ben(jamin)?\s+jones$/i, BLOCK_IMG = /6639397ecec7a/;
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return [].slice.call((r || document).querySelectorAll(s)); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function readJSON(id, dflt){ try { var el = document.getElementById(id); return el ? JSON.parse(el.textContent) : dflt; } catch(e){ return dflt; } }

  var THEMES = readJSON('cvp-themes', {});
  var KEY_BY_NAME = {};
  Object.keys(THEMES).forEach(function(k){ KEY_BY_NAME[THEMES[k].toLowerCase()] = k; });

  function fromSaved(x){
    return { quote: x.quote, name: x.name, role: x.role || '', key: x.key, category: x.category, color: 'var(--cv-' + x.key + ')',
             img: x.image, big: x.image, raw: x.image, alt: x.alt || '', w: x.w, h: x.h, icon: THEMES[x.key] ? 'assets/cv-icon-' + x.key + '.png' : '' };
  }
  function vimg(url, w){ return '/_vercel/image?url=' + encodeURIComponent(url) + '&w=' + w + '&q=70'; }
  function cleanAlt(a, name){
    a = String(a || '').trim();
    if (!a || /\.(jpe?g|png|gif|webp|heic)$/i.test(a) || /^screen ?shot/i.test(a) || /^\S{24,}$/.test(a) || /^(dsc|img|dcim|pxl|p)[_-]?\d+/i.test(a)) return 'Photo on ' + name + '’s Community Voices slide';
    return a;
  }
  function fromLive(x){
    var cat = String(x.category || '').trim() || 'Community Voices';
    var key = KEY_BY_NAME[cat.toLowerCase()] || ('x-' + cat.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    var hex = /^#[0-9a-f]{3,6}$/i.test(x.color || '') ? x.color : '#58BA51';
    return { quote: String(x.quote).trim(), name: String(x.name).trim(), role: String(x.role || '').trim(), key: key, category: cat,
             color: THEMES[key] ? 'var(--cv-' + key + ')' : hex, img: vimg(x.image, 640), big: vimg(x.image, 1280), raw: x.image,
             alt: cleanAlt(x.alt, String(x.name).trim()), icon: THEMES[key] ? 'assets/cv-icon-' + key + '.png' : '', live: true };
  }

  var saved = readJSON('cvp-saved', []).map(fromSaved);
  var pool = saved.slice();      // every slide that has a card on the wall, indexed by data-i
  var liveCount = 0, isLive = false, filter = 'all';

  /* ---------- images: optimized first, raw URL second, hide last ---------- */
  function wireImg(img, onFail){
    img.addEventListener('error', function(){
      var raw = img.getAttribute('data-raw');
      if (raw && img.getAttribute('src') !== raw){ img.removeAttribute('data-raw'); img.src = raw; return; }
      if (onFail) onFail(img);
    });
    var src = img.getAttribute('data-src');
    if (src){ img.removeAttribute('data-src'); img.src = src; }
  }

  /* =============================== wall =============================== */
  var chipsBox = $('.cvp-chips');
  var statusEl = $('[data-cvp-status]');
  var statusText = $('[data-cvp-status-text]');
  var announce = $('[data-cvp-announce]');
  var emptyEl = $('[data-cvp-empty]');
  var io = null;
  var moreRow = $('[data-cvp-more-row]'), moreBtn = $('[data-cvp-more]'), expanded = false, CLIP = 6;
  var narrow = window.matchMedia ? window.matchMedia('(max-width: 619px)') : null;
  function clip(shown){
    var on = !expanded && narrow && narrow.matches && shown.length > CLIP + 2;
    shown.forEach(function(c, k){ c.classList.toggle('cvp-clip', on && k >= CLIP); });
    if (moreRow){ moreRow.hidden = !on; if (on && moreBtn) moreBtn.textContent = 'Show all ' + shown.length + ' slides'; }
  }

  function playIcon(){ var b = $('[data-cvp-play] svg'); return b ? b.outerHTML : ''; }
  var PLAY_SVG = playIcon();

  function cardHTML(s, i, extra){
    var d = Math.min(i, 8) * 60;
    return '<article class="cvp-card' + (extra ? ' is-extra' : '') + '" data-key="' + esc(s.key) + '" data-i="' + i + '" style="--c:' + esc(s.color) + ';--d:' + d + 'ms">' +
      '<div class="cvp-ph"><img data-src="' + esc(s.img) + '"' + (s.raw && s.raw !== s.img ? ' data-raw="' + esc(s.raw) + '"' : '') + ' alt="' + esc(s.alt) + '"' +
        (s.w ? ' width="' + s.w + '" height="' + s.h + '"' : '') + ' loading="lazy"></div>' +
      '<div class="cvp-body"><p class="cvp-q">“' + esc(s.quote) + '”</p><p class="cvp-who"><b>' + esc(s.name) + '</b>' + (s.role ? '<span>' + esc(s.role) + '</span>' : '') + '</p></div>' +
      '<div class="cvp-bar"><span>' + esc(s.category) + '</span>' + (s.icon ? '<img src="' + s.icon + '" alt="" loading="lazy">' : '') + '</div>' +
      '<button type="button" class="cvp-card-play" data-play="' + i + '" aria-label="Play as a sign, starting with ' + esc(s.name) + '">' +
        '<span class="cvp-card-hint" aria-hidden="true">' + PLAY_SVG + 'Play from here</span></button></article>';
  }
  function wireCards(cards){
    cards.forEach(function(c){
      $$('.cvp-ph img', c).forEach(function(img){ wireImg(img, function(){ img.parentNode.classList.add('noimg'); }); });
    });
    reveal(cards);
  }
  function reveal(cards){
    if (!wall.classList.contains('cvp-js')){ return; }
    if (!io){ cards.forEach(function(c){ c.classList.add('in'); }); return; }
    cards.forEach(function(c){ io.observe(c); });
  }
  function replay(cards){
    if (!wall.classList.contains('cvp-js')) return;
    cards.forEach(function(c, k){ c.style.setProperty('--d', Math.min(k, 9) * 45 + 'ms'); c.classList.remove('in'); if (io) io.unobserve(c); });
    void wall.offsetWidth;
    cards.forEach(function(c){ c.classList.add('in'); });
  }

  function counts(){
    var n = {all: 0};
    $$('.cvp-card:not(.is-extra)', wall).forEach(function(c){ var k = c.getAttribute('data-key'); n[k] = (n[k] || 0) + 1; n.all++; });
    return n;
  }
  function ensureChip(s){
    if (!chipsBox || THEMES[s.key] || $('.cvp-chip[data-filter="' + s.key + '"]', chipsBox)) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'cvp-chip'; b.setAttribute('data-filter', s.key); b.setAttribute('aria-pressed', 'false');
    b.style.setProperty('--c', s.color);
    b.innerHTML = '<i aria-hidden="true"></i><span>' + esc(s.category) + '</span><b data-count="' + esc(s.key) + '">0</b>';
    chipsBox.appendChild(b);
  }
  function updateCounts(){
    var n = counts();
    $$('[data-count]').forEach(function(el){ el.textContent = n[el.getAttribute('data-count')] || 0; });
  }
  function themeName(k){
    if (k === 'all') return 'all themes';
    if (THEMES[k]) return THEMES[k];
    var c = $('.cvp-chip[data-filter="' + k + '"] span', chipsBox); return c ? c.textContent : k;
  }

  function applyFilter(k, animate){
    filter = k;
    $$('.cvp-chip', chipsBox).forEach(function(c){ c.setAttribute('aria-pressed', c.getAttribute('data-filter') === k ? 'true' : 'false'); });
    $$('.cvp-card.is-extra', wall).forEach(function(c){ c.parentNode.removeChild(c); });
    pool.length = $$('.cvp-card', wall).length;
    var shown = [];
    $$('.cvp-card', wall).forEach(function(c){
      var on = k === 'all' || c.getAttribute('data-key') === k;
      c.hidden = !on; if (on) shown.push(c);
    });
    var note = '';
    if (!shown.length && k !== 'all'){
      var extra = saved.filter(function(s){ return s.key === k; });
      if (extra.length){
        var html = extra.map(function(s){ pool.push(s); return cardHTML(s, pool.length - 1, true); }).join('');
        wall.insertAdjacentHTML('beforeend', html);
        shown = $$('.cvp-card.is-extra', wall);
        wireCards(shown);
        note = 'None of the ' + liveCount + ' slides in this live load are tagged ' + themeName(k) + '. ' + (extra.length === 1 ? 'This is a saved slide' : 'These are saved slides') + ' from Oberlin with that theme.';
      } else {
        note = 'None of the slides in this load are tagged ' + themeName(k) + '. Reload the page for a different set, or pick another theme.';
      }
    }
    if (emptyEl){ emptyEl.textContent = note; emptyEl.hidden = !note; }
    clip(shown);
    if (animate) replay(shown.filter(function(c){ return !c.classList.contains('cvp-clip'); }));
    if (announce) announce.textContent = k === 'all' ? 'Showing all ' + shown.length + ' slides.' : 'Showing ' + shown.length + ' ' + themeName(k) + ' slide' + (shown.length === 1 ? '' : 's') + '.';
  }

  function setStatus(html, live){
    if (!statusEl) return;
    statusEl.classList.toggle('is-live', !!live);
    if (statusText) statusText.innerHTML = html;
  }

  function renderLive(list){
    pool = list.slice();
    wall.innerHTML = list.map(function(s, i){ return cardHTML(s, i, false); }).join('');
    list.forEach(ensureChip);
    wireCards($$('.cvp-card', wall));
    updateCounts();
    var k = filter;
    if (k !== 'all' && !$('.cvp-chip[data-filter="' + k + '"]', chipsBox)) k = 'all';
    applyFilter(k, false);
  }

  function loadLive(){
    if (!window.fetch){ failed(); return; }
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function(){ if (ctl) ctl.abort(); }, 9000);
    setStatus('Loading the current slides from Oberlin’s slideshow…', false);
    fetch(LIVE_URL, ctl ? {signal: ctl.signal} : {}).then(function(r){ if (!r.ok) throw new Error('status ' + r.status); return r.json(); })
      .then(function(d){
        clearTimeout(timer);
        var list = ((d && d.slides) || []).filter(function(x){ return x && x.quote && x.image && x.name && !BLOCK_NAME.test(String(x.name).trim()) && !BLOCK_IMG.test(String(x.image)); }).map(fromLive);
        if (list.length < 4) throw new Error('too few');
        liveCount = list.length; isLive = true;
        renderLive(list);
        var t = '';
        try { t = new Date().toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York'}); } catch(e){}
        setStatus('Live: ' + list.length + ' slides from <a href="' + SOURCE_URL + '" target="_blank" rel="noopener">Oberlin’s public slideshow</a>' + (t ? ', loaded at ' + t + ' Eastern' : '') +
          '. The slideshow serves a random set on every load, so reloading brings different people.', true);
      })
      .catch(function(){ clearTimeout(timer); failed(); });
  }
  function failed(){
    setStatus('Showing ' + saved.length + ' slides saved from Oberlin’s slideshow. The live feed didn’t load here, so these are copies kept on this site. <a href="' + SOURCE_URL + '" target="_blank" rel="noopener">Open the live slideshow</a>', false);
  }

  if (wall){
    if (!reduce && 'IntersectionObserver' in window){
      io = new IntersectionObserver(function(es){
        es.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
      }, {rootMargin: '0px 0px -6% 0px', threshold: 0.06});
    }
    if (!reduce) wall.classList.add('cvp-js');
    wall.addEventListener('transitionend', function(ev){
      var c = ev.target;
      if (c.classList && c.classList.contains('cvp-card') && ev.propertyName === 'transform' && c.classList.contains('in')) c.style.setProperty('--d', '0ms');
    });
    wireCards($$('.cvp-card', wall));
    clip(visibleCards());
    if (moreBtn) moreBtn.addEventListener('click', function(){
      expanded = true;
      var hiddenOnes = $$('.cvp-card.cvp-clip', wall);
      hiddenOnes.forEach(function(c){ c.classList.remove('cvp-clip'); });
      if (moreRow) moreRow.hidden = true;
      replay(hiddenOnes);
      if (hiddenOnes[0]){ var b = hiddenOnes[0].querySelector('.cvp-card-play'); if (b){ try { b.focus({preventScroll: true}); } catch(e){} } }
    });
    if (narrow && narrow.addEventListener) narrow.addEventListener('change', function(){ clip(visibleCards()); });
    if (chipsBox) chipsBox.addEventListener('click', function(ev){
      var b = ev.target.closest('.cvp-chip'); if (!b) return;
      applyFilter(b.getAttribute('data-filter'), true);
    });
    wall.addEventListener('click', function(ev){
      var b = ev.target.closest('[data-play]'); if (!b) return;
      var list = visibleCards(), card = b.closest('.cvp-card');
      openPlayer(list.map(function(c){ return pool[+c.getAttribute('data-i')]; }).filter(Boolean), Math.max(0, list.indexOf(card)), b);
    });
    $$('[data-goto]').forEach(function(b){
      b.addEventListener('click', function(){
        var k = b.getAttribute('data-goto');
        applyFilter(k, true);
        var chip = $('.cvp-chip[data-filter="' + k + '"]', chipsBox);
        var sec = document.getElementById('wall');
        if (sec) sec.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start'});
        if (chip) { try { chip.focus({preventScroll: true}); } catch(e){ chip.focus(); } }
      });
    });
    loadLive();
  }
  function visibleCards(){ return wall ? $$('.cvp-card', wall).filter(function(c){ return !c.hidden; }) : []; }
  function currentList(){
    var l = visibleCards().map(function(c){ return pool[+c.getAttribute('data-i')]; }).filter(Boolean);
    return l.length ? l : (pool.length ? pool.slice() : saved.slice());
  }
  $$('[data-cvp-play]').forEach(function(b){ b.addEventListener('click', function(){ openPlayer(currentList(), 0, b); }); });

  /* =============================== sign player =============================== */
  if (!player) return;
  document.body.appendChild(player);
  var frame = $('[data-cvp-frame]', player);
  var bPrev = $('[data-cvp-prev]', player), bNext = $('[data-cvp-next]', player), bPause = $('[data-cvp-pause]', player);
  var bClose = $('[data-cvp-close]', player), bFs = $('[data-cvp-fs]', player);
  var countEl = $('[data-cvp-count]', player), stateEl = $('[data-cvp-state]', player), bar = $('[data-cvp-progress]', player);
  var P = {list: [], i: 0, open: false, playing: true, hover: false, remain: DUR, t0: 0, tid: null, tok: 0, cur: null, opener: null, inerted: []};
  var fsOK = !!(document.fullscreenEnabled && player.requestFullscreen);
  if (bFs && fsOK) bFs.hidden = false;

  function slideHTML(s, src, i, n){
    var who = esc(s.name) + (s.role ? ', ' + esc(s.role) : '');
    return '<div class="cvp-slide' + (s.quote.length > 120 ? ' is-long' : '') + (src ? '' : ' noimg') + '" style="--c:' + esc(s.color) + '" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + n + '">' +
      '<div class="cvp-s-main">' + (src ? '<div class="cvp-s-img"><span class="cvp-s-pic"><img src="' + esc(src) + '" alt="' + esc(s.alt) + '"></span></div>' : '') +
      '<div class="cvp-s-text"><p class="cvp-s-q">“' + esc(s.quote) + '”</p><p class="cvp-s-who"><span class="cvp-s-rule" aria-hidden="true"></span><span>' + who + '</span></p></div></div>' +
      '<div class="cvp-s-bar"><span class="cvp-s-cat">' + esc(s.category) + '</span>' + (s.icon ? '<img class="cvp-s-ico" src="' + s.icon + '" alt="">' : '') + '</div></div>';
  }
  function preload(s, cb){
    var im = new Image(), done = false, triedRaw = false;
    function fin(src){ if (done) return; done = true; cb(src); }
    im.onload = function(){ fin(im.src); };
    im.onerror = function(){ if (!triedRaw && s.raw && s.raw !== s.big){ triedRaw = true; im.src = s.raw; } else fin(null); };
    im.src = s.big || s.img;
    setTimeout(function(){ fin(im.src); }, 3500);
  }
  function running(){ return P.open && P.playing && !P.hover && !document.hidden; }
  function clearT(){ if (P.tid){ clearTimeout(P.tid); P.tid = null; } }
  function freeze(){ if (!bar) return; var f = Math.max(0, Math.min(1, 1 - P.remain / DUR)); bar.style.transition = 'none'; bar.style.transform = 'scaleX(' + f + ')'; }
  function arm(){
    clearT(); freeze(); state();
    if (!running()) return;
    P.t0 = Date.now();
    P.tid = setTimeout(function(){ P.tid = null; show(P.i + 1); }, P.remain);
    if (bar && !reduce){ void bar.offsetWidth; bar.style.transition = 'transform ' + P.remain + 'ms linear'; bar.style.transform = 'scaleX(1)'; }
  }
  function hold(){ if (P.tid){ clearT(); P.remain = Math.max(0, P.remain - (Date.now() - P.t0)); } freeze(); state(); }
  function state(){
    if (stateEl) stateEl.textContent = !P.playing ? 'Paused' : (P.hover ? 'Paused while the pointer is on the sign' : '');
    if (countEl) countEl.setAttribute('aria-live', running() ? 'off' : 'polite');
    if (bPause){ bPause.classList.toggle('is-paused', !P.playing); bPause.setAttribute('aria-label', P.playing ? 'Pause' : 'Play'); }
  }
  function show(i){
    var n = P.list.length; if (!n) return;
    i = ((i % n) + n) % n; P.i = i;
    var s = P.list[i], tok = ++P.tok;
    clearT();
    if (countEl) countEl.textContent = (i + 1) + ' of ' + n;
    preload(s, function(src){
      if (tok !== P.tok || !P.open) return;
      var box = document.createElement('div'); box.innerHTML = slideHTML(s, src, i, n);
      var el = box.firstChild, old = P.cur;
      $$('.cvp-slide', frame).forEach(function(x){ if (x !== old) x.parentNode.removeChild(x); });
      frame.appendChild(el); P.cur = el;
      var pic = $('.cvp-s-pic img', el);
      if (pic) pic.addEventListener('error', function(){ el.classList.add('noimg'); });
      if (reduce){ el.classList.add('on'); if (old && old.parentNode) old.parentNode.removeChild(old); }
      else {
        void el.offsetWidth; el.classList.add('on');
        if (old){ old.classList.remove('on'); setTimeout(function(){ if (old.parentNode && old !== P.cur) old.parentNode.removeChild(old); }, 800); }
      }
      player.style.setProperty('--pc', s.color);
      P.remain = DUR; arm();
      var nx = P.list[(i + 1) % n]; if (nx && nx !== s){ var pre = new Image(); pre.src = nx.big || nx.img; }
    });
  }
  function focusables(){ return $$('button, [href], [tabindex]:not([tabindex="-1"])', player).filter(function(el){ return !el.hidden && !el.disabled && el.offsetParent !== null; }); }
  function onKey(ev){
    if (!P.open) return;
    if (ev.key === 'Escape'){ ev.preventDefault(); closePlayer(); return; }
    if (ev.key === 'ArrowRight'){ ev.preventDefault(); show(P.i + 1); return; }
    if (ev.key === 'ArrowLeft'){ ev.preventDefault(); show(P.i - 1); return; }
    if (ev.key === 'Tab'){
      var f = focusables(); if (!f.length){ ev.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1], a = document.activeElement;
      if (ev.shiftKey && (a === first || !player.contains(a))){ ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && (a === last || !player.contains(a))){ ev.preventDefault(); first.focus(); }
    }
  }
  function setInert(on){
    if (on){
      P.inerted = [].slice.call(document.body.children).filter(function(el){ return el !== player && !el.inert && el.tagName !== 'SCRIPT'; })
        .map(function(el){ return {el: el, ah: el.getAttribute('aria-hidden')}; });
      P.inerted.forEach(function(x){ x.el.inert = true; x.el.setAttribute('aria-hidden', 'true'); });
    } else {
      P.inerted.forEach(function(x){ x.el.inert = false; if (x.ah === null) x.el.removeAttribute('aria-hidden'); else x.el.setAttribute('aria-hidden', x.ah); });
      P.inerted = [];
    }
  }
  function openPlayer(list, start, opener){
    if (!list || !list.length) return;
    P.list = list; P.opener = opener || document.activeElement; P.open = true; P.playing = true; P.hover = false; P.remain = DUR;
    frame.innerHTML = ''; P.cur = null;
    player.hidden = false;
    document.documentElement.classList.add('cvp-lock');
    setInert(true);
    document.addEventListener('keydown', onKey, true);
    requestAnimationFrame(function(){ player.classList.add('open'); });
    state();
    show(start || 0);
    try { bPause.focus({preventScroll: true}); } catch(e){ bPause.focus(); }
  }
  function closePlayer(){
    if (!P.open) return;
    P.open = false; P.tok++; clearT();
    document.removeEventListener('keydown', onKey, true);
    if (document.fullscreenElement && document.exitFullscreen){ document.exitFullscreen().catch(function(){}); }
    player.classList.remove('open');
    setInert(false);
    document.documentElement.classList.remove('cvp-lock');
    setTimeout(function(){ if (!P.open){ player.hidden = true; frame.innerHTML = ''; P.cur = null; } }, reduce ? 0 : 300);
    if (P.opener && document.body.contains(P.opener)){ try { P.opener.focus({preventScroll: true}); } catch(e){ P.opener.focus(); } }
  }

  bPrev.addEventListener('click', function(){ show(P.i - 1); });
  bNext.addEventListener('click', function(){ show(P.i + 1); });
  bPause.addEventListener('click', function(){ if (P.playing){ P.playing = false; hold(); } else { P.playing = true; arm(); } });
  bClose.addEventListener('click', closePlayer);
  if (bFs && fsOK){
    bFs.addEventListener('click', function(){
      if (document.fullscreenElement) document.exitFullscreen().catch(function(){});
      else player.requestFullscreen().catch(function(){});
    });
    document.addEventListener('fullscreenchange', function(){ bFs.textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen'; });
  }
  frame.addEventListener('pointerenter', function(ev){ if (ev.pointerType === 'mouse'){ P.hover = true; hold(); } });
  frame.addEventListener('pointerleave', function(ev){ if (ev.pointerType === 'mouse' && P.hover){ P.hover = false; arm(); } });
  document.addEventListener('visibilitychange', function(){ if (!P.open) return; if (document.hidden) hold(); else arm(); });
  var tx = null;
  frame.addEventListener('touchstart', function(ev){ tx = ev.touches[0].clientX; }, {passive: true});
  frame.addEventListener('touchend', function(ev){
    if (tx === null) return;
    var dx = ev.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 45) show(P.i + (dx < 0 ? 1 : -1));
  }, {passive: true});
})();
