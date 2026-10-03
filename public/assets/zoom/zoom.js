/* Scroll-driven "think globally, act locally" zoom: Earth to downtown Oberlin.
   Markup: <section class="zoom" data-zoom data-frames="72" data-base="assets/zoom/"> with .zoom-canvas and .zoom-cap[data-from][data-to] children. */
(function () {
  var root = document.querySelector('[data-zoom]');
  if (!root) return;
  var N = +root.getAttribute('data-frames') || 72;
  var base = root.getAttribute('data-base') || 'assets/zoom/';
  var small = window.matchMedia('(max-width: 700px)').matches;
  var dir = base + (small ? 'm/' : 'd/');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = root.querySelector('.zoom-canvas');
  var ctx = canvas.getContext('2d');
  var caps = [].slice.call(root.querySelectorAll('.zoom-cap'));
  var imgs = new Array(N + 1), shown = -1, want = 1;

  // progress -> frame, lingering on the sharp stops and rushing past the blurry descent
  var KEYS = [[0, 1], [0.1, 1], [0.16, 4], [0.23, 4], [0.27, 5], [0.33, 5], [0.38, 7], [0.45, 7], [0.52, 13], [0.59, 15], [0.66, 25], [0.73, 28], [0.9, 66], [1, N]];
  function frameAt(p) {
    for (var i = 1; i < KEYS.length; i++) {
      if (p <= KEYS[i][0]) {
        var a = KEYS[i - 1], b = KEYS[i], t = (p - a[0]) / (b[0] - a[0] || 1);
        return Math.round(a[1] + (b[1] - a[1]) * t);
      }
    }
    return N;
  }
  function src(i) { return dir + 'f' + ('00' + i).slice(-3) + '.jpg'; }
  function load(i, cb) {
    if (imgs[i]) { if (imgs[i].complete && cb) cb(); return; }
    var im = new Image(); im.decoding = 'async'; im.src = src(i); imgs[i] = im;
    im.onload = function () { if (cb) cb(); if (i === want) draw(i); };
  }
  function nearestLoaded(i) {
    for (var d = 0; d < N; d++) {
      if (imgs[i - d] && imgs[i - d].complete && imgs[i - d].naturalWidth) return i - d;
      if (imgs[i + d] && imgs[i + d].complete && imgs[i + d].naturalWidth) return i + d;
    }
    return -1;
  }
  function size() {
    var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    shown = -1; draw(want);
  }
  function draw(i) {
    var k = nearestLoaded(i); if (k < 0) return;
    if (k === shown) return; shown = k;
    var im = imgs[k], cw = canvas.width, ch = canvas.height;
    var s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
    var w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
  }
  function progress() {
    var r = root.getBoundingClientRect(), total = root.offsetHeight - window.innerHeight;
    return Math.min(1, Math.max(0, -r.top / (total || 1)));
  }
  function update() {
    var p = reduce ? 0 : progress();
    want = frameAt(p);
    load(want); draw(want);
    caps.forEach(function (c) {
      var on = p >= +c.getAttribute('data-from') && p <= +c.getAttribute('data-to');
      c.classList.toggle('on', on);
    });
    root.style.setProperty('--p', p.toFixed(3));
  }

  // load the first frame now, then the stops, then everything else
  load(1, function () { size(); update(); });
  if (!reduce) {
    var order = [4, 5, 7, 13, 15, 25, 28, 40, 55, 66, N];
    for (var i = 1; i <= N; i += 4) order.push(i);
    for (i = 1; i <= N; i++) order.push(i);
    var q = order.filter(function (v, k, a) { return a.indexOf(v) === k && v >= 1 && v <= N; });
    (function next() { var i = q.shift(); if (!i) return; load(i, next); })();
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; update(); }); }
    }, { passive: true });
  } else {
    root.classList.add('zoom-still');
  }
  window.addEventListener('resize', size);
})();
