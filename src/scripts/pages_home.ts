interface QueuedImage extends HTMLImageElement {
  _cbs: (() => void)[];
}
import { $, $$, required } from "./dom";
/* ================================================================
   Home page only: hero video loop, problem-story beats, product
   group carousels, doors, remote demo. Shared components (now strip,
   cwd sign, testimonial slider, live tabs, events, voices) are wired
   by base.js from the same data attributes on this page.
   ================================================================ */
(function () {
  "use strict";
  const doc = document;

  function safe<A extends unknown[], R>(fn: (...args: A) => R) {
    return function (...args: A) {
      try {
        return fn(...args);
      } catch (e) {
        console.warn("[home]", e);
      }
    };
  }
  const reduce = !doc.documentElement.classList.contains("motion");

  /* ---------- hero: scroll-to-zoom, Earth to downtown Oberlin (ported from site/assets/zoom/zoom.js) ---------- */
  safe(function () {
    const rootNode = $("[data-zoom]");
    if (!rootNode) return;
    const root = rootNode;
    const N = Number(root.getAttribute("data-frames")) || 72;
    const base = root.getAttribute("data-base") || "assets/zoom/";
    const small = window.matchMedia("(max-width: 700px)").matches;
    const dir = base + (small ? "m/" : "d/");
    const canvas = required($<HTMLCanvasElement>(".zoom-canvas", root));
    const ctx = required(canvas.getContext("2d"));
    const caps = $$(".zoom-cap", root);
    const imgs = new Array<QueuedImage | null>(N + 1);
    const bmps = new Array<ImageBitmap | HTMLImageElement>(N + 1);
    let shown = -1;
    let want = 1;
    let lastW = 0;
    let lastH = 0;

    /* progress -> frame, lingering on the sharp stops and rushing past the blurry descent */
    const KEYS = [
      [0, 1],
      [0.1, 1],
      [0.16, 4],
      [0.23, 4],
      [0.27, 5],
      [0.33, 5],
      [0.38, 7],
      [0.45, 7],
      [0.52, 13],
      [0.59, 15],
      [0.66, 25],
      [0.73, 28],
      [0.9, 66],
      [1, N],
    ];
    function frameAt(p: number) {
      for (var i = 1; i < KEYS.length; i++) {
        if (p <= KEYS[i][0]) {
          const a = KEYS[i - 1];
          const b = KEYS[i];
          const t = (p - a[0]) / (b[0] - a[0] || 1);
          return Math.round(a[1] + (b[1] - a[1]) * t);
        }
      }
      return N;
    }
    function src(i: number) {
      return dir + "f" + ("00" + i).slice(-3) + ".jpg";
    }
    /* one download at a time; decode ahead so drawing never blocks scrolling */
    function load(i: number, cb?: () => void) {
      if (imgs[i]) {
        if (cb)
          bmps[i] ? cb() : (imgs[i]._cbs = (imgs[i]._cbs || []).concat(cb));
        return;
      }
      const im: QueuedImage = Object.assign(new Image(), {
        _cbs: [] as (() => void)[],
      });
      imgs[i] = im;
      im._cbs = cb ? [cb] : [];
      function done() {
        const c = im._cbs;
        im._cbs = [];
        c.forEach(function (f) {
          f();
        });
        if (i === want || shown < 0) draw(want);
      }
      im.onload = function () {
        if (typeof createImageBitmap !== "undefined") {
          createImageBitmap(im).then(
            function (b) {
              bmps[i] = b;
              done();
            },
            function () {
              bmps[i] = im;
              done();
            },
          );
        } else {
          bmps[i] = im;
          done();
        }
      };
      im.onerror = function () {
        imgs[i] = null;
        window.setTimeout(function () {
          load(i);
        }, 1500);
        const c = im._cbs;
        im._cbs = [];
        c.forEach(function (f) {
          f();
        });
      };
      im.src = src(i);
    }
    function nearestLoaded(i: number) {
      for (var d = 0; d < N; d++) {
        if (bmps[i - d]) return i - d;
        if (bmps[i + d]) return i + d;
      }
      return -1;
    }
    function size(force: boolean) {
      const r = canvas.getBoundingClientRect();
      /* phones fire resize whenever the address bar moves; only redraw when the width really changes */
      if (
        !force &&
        Math.abs(r.width - lastW) < 2 &&
        Math.abs(r.height - lastH) < 160
      )
        return;
      lastW = r.width;
      lastH = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      shown = -1;
      draw(want);
    }
    function draw(i: number) {
      let k = nearestLoaded(i);
      if (k < 0) return;
      if (k === shown) return;
      shown = k;
      const im = bmps[k];
      const iw =
        im.width || (im instanceof HTMLImageElement ? im.naturalWidth : 0);
      const ih =
        im.height || (im instanceof HTMLImageElement ? im.naturalHeight : 0);
      const cw = canvas.width;
      const ch = canvas.height;
      const s = Math.max(cw / iw, ch / ih);
      const w = iw * s;
      const h = ih * s;
      ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
    }
    function progress() {
      const r = root.getBoundingClientRect();
      const total = root.offsetHeight - window.innerHeight;
      return Math.min(1, Math.max(0, -r.top / (total || 1)));
    }
    let queue: number[] = [];
    function update() {
      const p = reduce ? 0 : progress();
      want = frameAt(p);
      if (!bmps[want] && queue.indexOf(want) > 0) {
        queue.splice(queue.indexOf(want), 1);
        queue.unshift(want);
      }
      draw(want);
      caps.forEach(function (c) {
        const on =
          p >= Number(c.getAttribute("data-from")) &&
          p <= Number(c.getAttribute("data-to"));
        c.classList.toggle("on", on);
      });
      root.style.setProperty("--p", p.toFixed(3));
    }

    /* first frame now; the rest only after the page (icons, Flash, photos) has loaded */
    load(1, function () {
      size(true);
      update();
    });
    if (!reduce) {
      const order = [4, 5, 7, 13, 15, 25, 28, 40, 55, 66, N];
      for (var i = 1; i <= N; i += 4) order.push(i);
      for (i = 1; i <= N; i++) order.push(i);
      queue = order.filter(function (v, k, a) {
        return a.indexOf(v) === k && v >= 1 && v <= N;
      });
      function next() {
        const i2 = queue.shift();
        if (!i2) return;
        load(i2, next);
      }
      if (document.readyState === "complete") window.setTimeout(next, 300);
      else
        window.addEventListener("load", function () {
          window.setTimeout(next, 300);
        });
      let ticking = false;
      window.addEventListener(
        "scroll",
        function () {
          if (!ticking) {
            ticking = true;
            requestAnimationFrame(function () {
              ticking = false;
              update();
            });
          }
        },
        { passive: true },
      );
    } else {
      root.classList.add("zoom-still");
    }
    window.addEventListener("resize", function () {
      size(false);
    });
  })();

  /* ---------- any image that fails on a weak connection gets one retry ---------- */
  safe(function () {
    const retried = new WeakSet<HTMLImageElement>();
    function retry(img: HTMLImageElement) {
      if (retried.has(img) || !img.getAttribute("src")) return;
      retried.add(img);
      const s = img.getAttribute("src") || "";
      window.setTimeout(function () {
        img.src = s + (s.indexOf("?") < 0 ? "?r=1" : "&r=1");
      }, 1200);
    }
    document.addEventListener(
      "error",
      function (e) {
        if (e.target instanceof HTMLImageElement) retry(e.target);
      },
      true,
    );
    Array.from(document.images).forEach(function (img) {
      if (img.complete && !img.naturalWidth && img.getAttribute("src"))
        retry(img);
    });
  })();

  /* ---------- hero: invisible, then visible ---------- */
  safe(function () {
    const rootNode = $("[data-reveal-hero]");
    if (!rootNode) return;
    const root = rootNode;
    const color = required($("[data-rv-color]", root));
    const tags = $$(".rv-tag", root);
    const say = $("[data-rv-say]", root);
    const flashImg = $("[data-rv-flash]", root);
    const API =
      "https://oberlin.communityhub.cloud/fe/api/data-hub-v2/visualizations/gauges/";
    const SAVED: Record<string, string> = {
      "1021": "18,236",
      "1019": "277",
      "1018": "201",
      "1033": "68",
    };
    const vals: Record<string, string> = {};
    let pos1021: number | null = null;
    function setTag(t: HTMLElement, v: string, _live: boolean) {
      const b = $("[data-rv-v]", t);
      if (b && b.textContent !== v) {
        b.textContent = v;
        t.classList.remove("flash-num");
        void t.offsetWidth;
        t.classList.add("flash-num");
      }
    }
    function pull() {
      tags.forEach(function (t) {
        const g = t.getAttribute("data-rv-g") || "";
        fetch(API + g, { cache: "no-store" })
          .then(function (r) {
            if (!r.ok) throw 0;
            return r.text();
          })
          .then(function (svg) {
            const p = window.chParseGauge ? window.chParseGauge(svg) : null;
            if (p && p.ok) {
              vals[g] = p.value;
              setTag(t, p.value, true);
              if (g === "1021") {
                pos1021 = p.pos;
                mood();
              }
            } else if (!vals[g]) setTag(t, SAVED[g], false);
          })
          .catch(function () {
            if (!vals[g]) setTag(t, SAVED[g], false);
          });
      });
    }
    function mood() {
      if (pos1021 == null || !flashImg) return;
      const m = pos1021 < 0.4 ? "happy" : pos1021 < 0.7 ? "neutral" : "angry";
      const src = "assets/mascot-" + m + "-clean.gif";
      if (flashImg.getAttribute("src") !== src)
        flashImg.setAttribute("src", src);
    }
    let lines = function () {
      var out = [];
      if (vals["1021"])
        out.push("Right now Oberlin is using " + vals["1021"] + " kilowatts.");
      if (vals["1019"])
        out.push(
          "Oberlin College is at " + vals["1019"] + " watts per student.",
        );
      if (vals["1018"])
        out.push(
          "The public schools are at " + vals["1018"] + " watts per student.",
        );
      out.push(
        "Every building hides what it uses. Tap a label to see where it runs.",
      );
      return out;
    };
    let li = 0;
    function speak() {
      if (!say) return;
      const L = lines();
      say.textContent = L[li % L.length];
      li++;
      say.classList.add("on");
    }

    function reveal() {
      root.classList.remove("done");
      tags.forEach(function (t) {
        t.classList.remove("on");
      });
      if (say) say.classList.remove("on");
      if (reduce) {
        root.classList.add("done");
        tags.forEach(function (t) {
          t.classList.add("on");
        });
        speak();
        return;
      }
      let t0: number | null = null;
      const D = 3200;
      const delays = [0, 450, 900];
      function step(ts: number) {
        if (t0 === null) t0 = ts;
        const e = ts - t0;
        delays.forEach(function (d, k) {
          let f = Math.max(0, Math.min(1, (e - d) / D));
          f = 1 - Math.pow(1 - f, 3);
          color.style.setProperty("--r" + (k + 1), (f * 80).toFixed(2) + "%");
        });
        if (e < D + 900) requestAnimationFrame(step);
        else {
          root.classList.add("done");
          tags.forEach(function (t, k) {
            window.setTimeout(function () {
              t.classList.add("on");
            }, 160 * k);
          });
          window.setTimeout(speak, 700);
        }
      }
      window.setTimeout(function () {
        requestAnimationFrame(step);
      }, 700);
    }
    const GSAVED: Record<string, string> = {
      "1021": "18,236",
      "1020": "2,368",
      "1019": "277",
      "1018": "201",
    };
    function gauges() {
      $$("[data-rv-gauge]", root).forEach(function (el) {
        const g = el.getAttribute("data-rv-gauge") || "";
        fetch(API + g, { cache: "no-store" })
          .then(function (r) {
            if (!r.ok) throw 0;
            return r.text();
          })
          .then(function (svg) {
            const p = window.chParseGauge ? window.chParseGauge(svg) : null;
            if (!p || !p.ok) throw 0;
            required($("b", el)).textContent = p.value;
            el.style.background = p.color;
            required($(".bar i", el)).style.left =
              (p.pos * 100).toFixed(1) + "%";
          })
          .catch(function () {
            const b = $("b", el);
            if (b && !/\d/.test(b.textContent)) b.textContent = GSAVED[g];
          });
      });
    }
    pull();
    gauges();
    window.setInterval(function () {
      if (!doc.hidden) {
        pull();
        gauges();
      }
    }, 60000);
    window.setInterval(function () {
      if (!doc.hidden && root.classList.contains("done")) speak();
    }, 6500);
    let seen = false;
    let gone = false;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (es) {
          es.forEach(function (en) {
            if (en.isIntersecting && en.intersectionRatio > 0.35) {
              if (!seen || gone) {
                seen = true;
                gone = false;
                reveal();
              }
            } else if (!en.isIntersecting) {
              gone = true;
            }
          });
        },
        { threshold: [0, 0.35] },
      ).observe(root);
    } else reveal();
  })();

  /* ---------- hero: the little planet ---------- */
  safe(function () {
    const rootNode = $("[data-planet]");
    if (!rootNode) return;
    const root = rootNode;
    const say = $("[data-pl-say]", root);
    const flash = $("[data-pl-flash]", root);
    const where = $("[data-pl-where]", root);
    function oberlinTime() {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(new Date());
      const h =
        Number(
          parts.find(function (x) {
            return x.type === "hour";
          })?.value || 0,
        ) % 24;
      const m = Number(
        parts.find(function (x) {
          return x.type === "minute";
        })?.value || 0,
      );
      return h + m / 60;
    }
    function sky() {
      const t = oberlinTime();
      const phase =
        t >= 7.5 && t < 18
          ? "day"
          : t >= 6 && t < 7.5
            ? "dawn"
            : t >= 18 && t < 20
              ? "dusk"
              : "night";
      root.setAttribute("data-phase", phase);
      /* sun (or moon) travels an arc across the sky */
      let f =
        phase === "night"
          ? ((t + 24 - 20) % 24) / 10
          : Math.min(1, Math.max(0, (t - 6) / 14));
      root.style.setProperty("--sx", (72 + f * 20).toFixed(1) + "%");
      root.style.setProperty(
        "--sy",
        (34 - Math.sin(Math.PI * f) * 16).toFixed(1) + "%",
      );
      const clock = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date());
      const temp = $('[data-g="1033"] [data-num]');
      const tv = temp && temp.textContent.trim();
      if (where)
        where.textContent =
          "Oberlin, Ohio, " +
          clock +
          (tv && /\d/.test(tv) ? ", " + tv + "°F" : "");
    }
    let lines: string[] = [];
    let k = 0;
    function read() {
      const kw = $('[data-g="1021"] [data-num]');
      const col = $('[data-g="1019"] [data-num]');
      const kv = kw && kw.textContent.trim();
      const cv = col && col.textContent.trim();
      lines = [];
      if (kv && /\d/.test(kv))
        lines.push("Right now Oberlin is using " + kv + " kilowatts.");
      if (cv && /\d/.test(cv))
        lines.push("Oberlin College is at " + cv + " watts per student.");
      lines.push(
        "Act locally. Think globally. I watch the numbers so you can see them.",
      );
      const ring = $(".now-flash img");
      if (
        ring &&
        flash &&
        ring.getAttribute("src") &&
        /mascot-/.test(ring.getAttribute("src") || "") &&
        flash.getAttribute("src") !== ring.getAttribute("src")
      )
        flash.setAttribute("src", ring.getAttribute("src") || "");
    }
    function speak() {
      read();
      if (!say || !lines.length) return;
      say.textContent = lines[k % lines.length];
      k++;
      say.classList.remove("pop");
      void say.offsetWidth;
      say.classList.add("pop");
    }
    sky();
    window.setInterval(sky, 60000);
    window.setTimeout(speak, 1800);
    window.setInterval(function () {
      if (!doc.hidden) speak();
    }, 6000);
  })();

  /* ---------- the problem story: which beat is in view ---------- */
  safe(function () {
    const story = $(".story");
    if (!story) return;
    const beats = $$(".beat", story);
    if (!("IntersectionObserver" in window)) {
      story.setAttribute("data-step", "3");
      return;
    }
    const io = new IntersectionObserver(
      function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting) {
            var n = en.target.getAttribute("data-beat");
            story.setAttribute("data-step", String(n));
            beats.forEach(function (b) {
              b.setAttribute("data-on", String(b === en.target));
            });
          }
        });
      },
      {
        rootMargin: window.matchMedia("(max-width:900px)").matches
          ? "-55% 0px -25% 0px"
          : "-40% 0px -40% 0px",
      },
    );
    beats.forEach(function (b) {
      io.observe(b);
    });
  })();

  /* ---------- product groups: each has its own self-playing carousel, no play button ---------- */
  safe(function () {
    $$("[data-grp]").forEach(function (grp) {
      const reels = $$(".reel", grp);
      const rows = $$(".gp", grp);
      let i = 0;
      let timer: number | undefined = undefined;
      let inView = false;
      function show(n: number) {
        i = (n + reels.length) % reels.length;
        reels.forEach(function (r, k) {
          r.classList.toggle("is-on", k === i);
        });
        rows.forEach(function (li, k) {
          li.classList.toggle("is-on", k === i);
          const b = li;
          b.setAttribute("aria-pressed", String(k === i));
        });
      }
      function tick() {
        if (inView && !doc.hidden) show(i + 1);
      }
      function start() {
        if (reduce || timer) return;
        timer = window.setInterval(tick, 4600);
      }
      function stop() {
        clearInterval(timer);
        timer = undefined;
      }
      rows.forEach(function (li, k) {
        li.addEventListener("click", function () {
          show(k);
        });
        li.addEventListener("mouseenter", function () {
          show(k);
        });
      });
      show(0);
      if ("IntersectionObserver" in window)
        new IntersectionObserver(
          function (es) {
            es.forEach(function (en) {
              inView = en.isIntersecting;
              if (inView) start();
              else stop();
            });
          },
          { threshold: 0.3 },
        ).observe(grp);
      else start();
    });
  })();

  /* ---------- doors ---------- */
  safe(function () {
    const doors = $$("[data-door]");
    function setDoor(unit: HTMLElement, open: boolean) {
      unit.classList.toggle("open", open);
      const b = $(".door-btn", unit);
      if (b) b.setAttribute("aria-expanded", String(open));
    }
    doors.forEach(function (unit) {
      const btn = $(".door-btn", unit);
      btn?.addEventListener("click", function () {
        setDoor(unit, !unit.classList.contains("open"));
      });
    });
    $$("[data-open-door]").forEach(function (a) {
      a.addEventListener("click", function () {
        const which = a.getAttribute("data-open-door");
        doors.forEach(function (u) {
          setDoor(u, u.getAttribute("data-door") === which);
        });
      });
    });
  })();

  /* ---------- remote demo: a small self-playing loop, cycling the same real views ---------- */
  safe(function () {
    const tv = $("[data-tv]");
    if (!tv) return;
    const views = $$(".tv-view", tv);
    const order = ["cwd", "voices", "calendar"];
    let idx = 0;
    let timer: number | undefined = undefined;
    let inView = false;
    function show(k: string) {
      views.forEach(function (v) {
        v.classList.toggle("is-on", v.getAttribute("data-view") === k);
      });
    }
    function tick() {
      if (!inView || doc.hidden) return;
      idx = (idx + 1) % order.length;
      show(order[idx]);
    }
    function start() {
      if (reduce || timer) return;
      timer = window.setInterval(tick, 3400);
    }
    function stop() {
      clearInterval(timer);
      timer = undefined;
    }
    show(order[0]);
    if ("IntersectionObserver" in window)
      new IntersectionObserver(
        function (es) {
          es.forEach(function (en) {
            inView = en.isIntersecting;
            if (inView) start();
            else stop();
          });
        },
        { threshold: 0.3 },
      ).observe(tv);
    else start();
  })();
})();
