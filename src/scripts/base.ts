import { shouldLoadDeferredFrame } from "./ui/deferred-frame-policy";
import { initAttentionSquirrel } from "./ui/attention-squirrel";
import { initEmbedScroll } from "./ui/embed-scroll";
import { freshDocumentUrl } from "./ui/fresh-document-url";
import type { GaugeReading, Mood } from "./types";
import { calendarData } from "./data";
type NowReading = Pick<GaugeReading, "title" | "value" | "num" | "pos" | "ok">;
type GaugeTile = Pick<
  GaugeReading,
  "title" | "unit" | "value" | "pos" | "color"
> &
  Partial<Pick<GaugeReading, "aqi">>;
import { $, $$, isPresent, required, eventElement } from "./dom";
/* ================================================================
   Community Hub v5: shared runtime (every live/interactive component)
   Ported logic: parseGauge, gauge API, events API from site_src/site.js.
   Every component is opt-in through a data attribute, so a page only
   pays for what it includes.
   ================================================================ */
(function () {
  "use strict";
  const doc = document;
  const root = doc.documentElement;

  function esc(s: unknown) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
          c
        ] || c
      );
    });
  }
  function safe<A extends unknown[], R>(fn: (...args: A) => R) {
    return function (...args: A) {
      try {
        return fn(...args);
      } catch (e) {
        console.warn("[ch]", e);
      }
    };
  }
  function restart(el: HTMLElement | null, cls: string) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }
  const TZ = { timeZone: "America/New_York" };
  function clock(d: Date) {
    return d.toLocaleTimeString(
      "en-US",
      Object.assign<Intl.DateTimeFormatOptions, Intl.DateTimeFormatOptions>(
        { hour: "numeric", minute: "2-digit" },
        TZ,
      ),
    );
  }
  function withTimeout<T>(p: Promise<T>, ms: number) {
    return Promise.race([
      p,
      new Promise<never>(function (_, rej) {
        window.setTimeout(function () {
          rej(new Error("timeout"));
        }, ms);
      }),
    ]);
  }
  function getText(url: string) {
    return withTimeout(
      fetch(url, { cache: "no-store" }).then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        return r.text();
      }),
      9000,
    );
  }
  function getJSON(url: string): Promise<unknown> {
    return withTimeout(
      fetch(url).then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      }),
      9000,
    );
  }

  let reduce =
    !window.matchMedia ||
    !matchMedia("(prefers-reduced-motion: reduce)").matches
      ? false
      : true;
  reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("js");
  if (!reduce) root.classList.add("motion");
  const ax = document.querySelector<HTMLElement>(".aashe-x");
  if (ax)
    ax.addEventListener("click", function () {
      root.classList.add("no-aashe");
      try {
        localStorage.setItem("ch-aashe-off", "1");
      } catch (e) {}
    });
  // The notice steps aside after 10 seconds so it does not compete with the page.
  const aashe = document.querySelector<HTMLElement>(".aashe");
  if (aashe && !root.classList.contains("no-aashe"))
    setTimeout(function () {
      aashe.classList.add("aashe-out");
      setTimeout(function () {
        root.classList.add("no-aashe");
        dispatchEvent(new Event("resize"));
      }, reduce ? 0 : 400);
    }, 10000);

  /* ---------------------------------------------------------------- header + nav */
  safe(function () {
    const hdr = $("#hdr");
    if (!hdr) return;
    const onScroll = function () {
      hdr.classList.toggle("scrolled", window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const dds = $$(".dd", hdr);
    function closeDD(except?: HTMLElement) {
      dds.forEach(function (d) {
        if (d === except) return;
        const b = $(".nav-btn", d);
        const p = $(".dd-panel", d);
        if (b) b.setAttribute("aria-expanded", "false");
        if (p) p.classList.remove("open");
      });
    }
    dds.forEach(function (d) {
      const b = $(".nav-btn", d);
      const p = $(".dd-panel", d);
      if (!b || !p) return;
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        const open = b.getAttribute("aria-expanded") !== "true";
        closeDD(d);
        b.setAttribute("aria-expanded", String(open));
        p.classList.toggle("open", open);
      });
      d.addEventListener("focusout", function (e) {
        if (
          !d.contains(e.relatedTarget instanceof Node ? e.relatedTarget : null)
        ) {
          b.setAttribute("aria-expanded", "false");
          p.classList.remove("open");
        }
      });
    });
    doc.addEventListener("click", function (e) {
      if (!eventElement(e)?.closest(".dd")) closeDD();
    });
    const mb = $(".menu-btn");
    const mnav = $("#mnav");
    let priorOverflow = "";
    let menuStory: ReturnType<NonNullable<Window["chStory"]>["current"]> = null;
    const menuBackground = new Map<HTMLElement, boolean>();
    function menuControls() {
      if (!mb || !mnav) return [];
      return [mb, ...Array.from(mnav.querySelectorAll<HTMLElement>(
        'a[href], button, input, select, textarea, [tabindex]',
      ))].filter(function (el) {
        return el.tabIndex >= 0 && !el.matches(":disabled") &&
          el.getClientRects().length && getComputedStyle(el).visibility !== "hidden";
      });
    }
    function setMenu(open: boolean, restoreFocus = true) {
      if (!mb || !mnav) return;
      if (open === !mnav.hidden) return;
      if (open) menuStory = window.chStory?.current() || null;
      mb.setAttribute("aria-expanded", String(open));
      mnav.hidden = !open;
      const t = $(".menu-t", mb);
      if (t) t.textContent = open ? "Close" : "Menu";
      if (open) {
        closeDD();
        priorOverflow = doc.body.style.overflow;
        doc.body.style.overflow = "hidden";
        Array.from(doc.body.children).forEach(function (el) {
          if (!(el instanceof HTMLElement) || el === hdr || el === mnav ||
              el.contains(hdr) || el.contains(mnav)) return;
          menuBackground.set(el, el.inert);
          el.inert = true;
        });
        mnav.scrollTop = 0;
        (menuControls()[1] || mb).focus({ preventScroll: true });
      } else {
        menuBackground.forEach(function (wasInert, el) { el.inert = wasInert; });
        menuBackground.clear();
        doc.body.style.overflow = priorOverflow;
        if (restoreFocus) mb.focus({ preventScroll: true });
        if (menuStory) window.dispatchEvent(new CustomEvent("ch:fit", { detail: { anchor: menuStory } }));
        menuStory = null;
      }
    }
    if (mb)
      mb.addEventListener("click", function () {
        setMenu(mb.getAttribute("aria-expanded") !== "true");
      });
    if (mnav)
      $$("a", mnav).forEach(function (a) {
        a.addEventListener("click", function () {
          setMenu(false);
        });
      });
    doc.addEventListener("focusin", function (e) {
      if (!mb || !mnav || mnav.hidden) return;
      const target = eventElement(e);
      if (target && (mnav.contains(target) || mb.contains(target))) return;
      (menuControls()[1] || mb).focus({ preventScroll: true });
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !mnav || mnav.hidden) return;
      const controls = menuControls();
      const first = controls[0], last = controls[controls.length - 1];
      if (!first || !last) return;
      const index = controls.indexOf(doc.activeElement as HTMLElement);
      const target = index < 0 ? (e.shiftKey ? last : first) :
        controls[(index + (e.shiftKey ? -1 : 1) + controls.length) % controls.length];
      e.preventDefault();
      target.focus({ preventScroll: true });
      if (mnav.contains(target)) {
        const bounds = mnav.getBoundingClientRect();
        const item = target.getBoundingClientRect();
        // Reveal each link inside the drawer. Both wrap and reverse traversal
        // through the header trigger must leave the underlying story in place.
        if (item.top < bounds.top) mnav.scrollTop += item.top - bounds.top;
        else if (item.bottom > bounds.bottom) mnav.scrollTop += item.bottom - bounds.bottom;
      }
    });
    window.addEventListener("resize", function () {
      if (mb && mnav && !mnav.hidden && getComputedStyle(mb).display === "none") {
        setMenu(false, false);
        $("a", hdr)?.focus({ preventScroll: true });
      }
    }, { passive: true });
    doc.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      const openDD = dds.filter(function (d) {
        var b = $(".nav-btn", d);
        return b && b.getAttribute("aria-expanded") === "true";
      })[0];
      if (openDD) {
        closeDD();
        $(".nav-btn", openDD)?.focus();
      }
      if (mb && mb.getAttribute("aria-expanded") === "true") {
        setMenu(false);
      }
    });
  })();

  /* ---------------------------------------------------------------- scroll reveal */
  safe(function () {
    const els = $$("[data-reveal]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window) || reduce) {
      els.forEach(function (e) {
        e.classList.add("in");
      });
      return;
    }
    const groups: Record<string, HTMLElement[]> = {};
    els.forEach(function (e) {
      const g = e.closest<HTMLElement>("[data-reveal-group]");
      if (g) {
        const key = "_g" + Array.from($$("[data-reveal-group]")).indexOf(g);
        (groups[key] = groups[key] || []).push(e);
      }
    });
    Object.keys(groups).forEach(function (k) {
      groups[k].forEach(function (e, i) {
        e.style.setProperty("--i", String(i));
      });
    });
    const io = new IntersectionObserver(
      function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    els.forEach(function (e) {
      io.observe(e);
    });
  })();

  /* ---------------------------------------------------------------- count-up numbers (data-countup="1234" data-decimals="0") */
  function decimals(s: string) {
    return (String(s).split(".")[1] || "").length;
  }
  function fmt(n: number, d: number) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    });
  }
  function countTo(el: HTMLElement, from: number, to: number, tmplStr: string) {
    const d = decimals(tmplStr);
    if (reduce) {
      el.textContent = fmt(to, d);
      return;
    }
    const t0 = performance.now();
    const dur = 1100;
    (function step(t) {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e, d);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  window.chCountTo = countTo;
  safe(function () {
    const els = $$("[data-countup]");
    if (!els.length) return;
    function run(el: Element) {
      const to = parseFloat(el.getAttribute("data-countup") || "");
      if (isNaN(to)) return;
      if (el instanceof HTMLElement)
        countTo(el, 0, to, el.getAttribute("data-countup") || "");
    }
    if (!("IntersectionObserver" in window)) {
      els.forEach(run);
      return;
    }
    const io = new IntersectionObserver(
      function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting) {
            run(en.target);
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.6 },
    );
    els.forEach(function (e) {
      io.observe(e);
    });
  })();

  /* ================================================================
     LIVE GAUGES: Oberlin now (hero strip + persistent dock) + any cwd sign
     ================================================================ */
  const GAUGE_API =
    "https://oberlin.communityhub.cloud/fe/api/data-hub-v2/visualizations/gauges/";
  const DIGITS: Record<string, string> = {
    zero: "0",
    one: "1",
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    six: "6",
    seven: "7",
    eight: "8",
    nine: "9",
  };
  function aqiColor(v: number) {
    return v <= 50
      ? "#3E9B47"
      : v <= 100
        ? "#D9A21B"
        : v <= 150
          ? "#E67E22"
          : v <= 200
            ? "#D9533F"
            : v <= 300
              ? "#8E44AD"
              : "#7B1E2B";
  }
  function parseGauge(svg: string): GaugeReading {
    const texts = [];
    let m;
    const re = /<text([^>]*)>([\s\S]*?)<\/text>/g;
    while ((m = re.exec(svg))) {
      const t = m[2]
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (t && !/^\d$/.test(t)) texts.push(t);
    }
    const parts: [number, string][] = [];
    const r2 = /translate\(([-0-9.]+),\s*0\)">\s*<g class='(\w+)'/g;
    while ((m = r2.exec(svg)))
      parts.push([parseFloat(m[1]), DIGITS[m[2]] || ""]);
    const r3 = /<text[^>]*\bx=["']([-0-9.]+)["'][^>]*>\s*([,.])\s*<\/text>/g;
    while ((m = r3.exec(svg))) parts.push([parseFloat(m[1]), m[2]]);
    parts.sort(function (a, b) {
      return a[0] - b[0];
    });
    const value = parts
      .map(function (p) {
        return p[1];
      })
      .join("");
    const words = texts.filter(function (t) {
      return t !== "," && t !== ".";
    });
    let neg = false;
    if (words[0] === "-" || words[0] === "−") {
      neg = true;
      words.shift();
    }
    const aqi = words[0] === "Air Quality Index";
    const title = aqi ? words[1] : words[0] || "";
    const unit = aqi ? "AQI" : words[1] || "";
    const fill = (svg.match(/<rect[^>]*style="fill:(#[0-9a-fA-F]{3,6})/) ||
      [])[1];
    const cx = (svg.match(/<circle cx="([-0-9.]+)%"/) || [])[1];
    const num = parseFloat(value.replace(/,/g, ""));
    const pos = aqi
      ? Math.min(1, (num || 0) / 300)
      : cx != null
        ? Math.max(0, Math.min(1, parseFloat(cx) / 70))
        : 0.5;
    const ok = value !== "" && !isNaN(num) && !neg;
    return {
      title: title,
      unit: unit,
      value: ok ? value : "No reading",
      num: num,
      pos: ok ? pos : 0.5,
      color: aqi ? aqiColor(num) : fill || "#3498db",
      aqi: aqi,
      ok: ok,
    };
  }
  window.chParseGauge = parseGauge;

  const MOOD_WORD = { happy: "Happy", neutral: "Calm", angry: "Upset" };
  function moodOf(pos: number): Mood {
    return pos < 0.4 ? "happy" : pos < 0.7 ? "neutral" : "angry";
  }
  function moodSrc(m: Mood) {
    return "assets/mascot-" + m + "-clean.gif";
  }
  function setRing(ring: HTMLElement | null, m: Mood) {
    if (!ring) return;
    ring.setAttribute("data-mood", m);
    const img = $("img", ring);
    const src = moodSrc(m);
    if (img && img.getAttribute("src") !== src) img.setAttribute("src", src);
    if (img)
      img.alt = "Flash the energy squirrel, " + (m === "angry" ? "upset" : m);
  }
  window.chSetRing = setRing;
  window.chMoodOf = moodOf;

  /* ------ Oberlin now: hero strip ------ */
  const NOWDATA: Record<number, NowReading> = {};
  const NOW_ORDER = [1021, 1019, 1033, 1030];
  let NOW_ACTIVE = 0;
  let NOW_HAS = false;
  const NOW_SHORT: Record<number, [string, (value: string) => string]> = {
    1021: [
      "Whole city electricity",
      function (v) {
        return v + " kW";
      },
    ],
    1019: [
      "Oberlin College",
      function (v) {
        return v + " W per student";
      },
    ],
    1033: [
      "Air temperature",
      function (v) {
        return v + "°F";
      },
    ],
    1030: [
      "Air quality",
      function (v) {
        return "AQI " + v;
      },
    ],
  };
  function nowLine(id: number, g: NowReading) {
    if (id === 1021) {
      let m = moodOf(g.pos);
      return m === "happy"
        ? "Oberlin is using " +
            g.value +
            " kW right now. That’s low, so Flash is happy."
        : m === "neutral"
          ? g.value + " kW right now. About normal for Oberlin."
          : g.value + " kW right now. That’s a lot, so Flash is upset.";
    }
    if (id === 1019)
      return "Oberlin College is at " + g.value + " watts per student.";
    if (id === 1033) return "It’s " + g.value + "°F in Oberlin right now.";
    if (id === 1030)
      return "The air quality index is " + g.value + " right now.";
    return "";
  }
  safe(function () {
    const now = $("[data-now]");
    if (!now) return;
    const cells = $$(".cell", now);
    const sayEl = $("[data-now-say]", now);
    const timeEl = $("[data-now-time]", now);
    const wordEl = $("[data-mood-word]", now);
    const dock = $("[data-dock]");
    const dockL = dock && $("[data-dock-l]", dock);
    const dockV = dock && $("[data-dock-v]", dock);
    // A value in the saved snapshot is never evidence of a current response.
    const confirmedLive = new Set<number>();
    function showCell(i: number) {
      const id = NOW_ORDER[i];
      if (!confirmedLive.has(id)) return;
      NOW_ACTIVE = i;
      cells.forEach(function (c, j) {
        c.classList.toggle("on", j === i);
      });
      const g = NOWDATA[id];
      if (g && sayEl) {
        sayEl.textContent = nowLine(id, g);
        restart(sayEl, "pop");
      }
      if (g && dockV && dockL) {
        dockL.textContent = NOW_SHORT[id][0];
        dockV.textContent = NOW_SHORT[id][1](g.value);
        restart(dock, "tick");
      }
    }
    let rotT: number | undefined = undefined;
    function startRotation() {
      const firstLive = NOW_ORDER.findIndex(id => confirmedLive.has(id));
      if (firstLive < 0) return;
      showCell(firstLive);
      if (reduce || rotT) return;
      rotT = window.setInterval(function () {
        if (doc.hidden) return;
        let n = NOW_ACTIVE;
        let guard = 0;
        do {
          n = (n + 1) % NOW_ORDER.length;
          guard++;
        } while (!confirmedLive.has(NOW_ORDER[n]) && guard < 5);
        showCell(n);
      }, 4200);
    }
    function applyReadings(byId: Record<number, NowReading>, first: boolean, saved = false) {
      confirmedLive.clear();
      if (!saved) NOW_ORDER.forEach(id => { if (byId[id]) confirmedLive.add(id); });
      cells.forEach(function (c) {
        const id = Number(c.getAttribute("data-g"));
        const g = byId[id];
        const b = required($("[data-num]", c));
        const bar = $(".cell-bar i", c);
        const unit = $("small", c);
        if (unit) unit.hidden = !g;
        if (!g) {
          delete NOWDATA[id];
          b.textContent = "Unavailable";
          if (bar) bar.style.width = "0%";
          c.classList.add("off");
          c.classList.remove("on");
          c.removeAttribute("data-level");
          return;
        }
        c.classList.remove("off");
        const prev = NOWDATA[id];
        NOWDATA[id] = g;
        if (!prev || prev.num !== g.num) {
          countTo(b, prev ? prev.num : g.num * 0.86, g.num, g.value);
          if (prev) restart(c, "fresh");
          else b.textContent = g.value;
        }
        if (bar) bar.style.width = Math.max(4, Math.round(g.pos * 100)) + "%";
        c.setAttribute(
          "data-level",
          g.pos < 0.4 ? "lo" : g.pos < 0.7 ? "mid" : "hi",
        );
      });
      if (byId[1021]) {
        let m = moodOf(byId[1021].pos);
        $$("[data-flash-face]").forEach(function (img) {
          const r = img.closest<HTMLElement>(".ring");
          if (r) setRing(r, m);
        });
        if (wordEl) wordEl.textContent = MOOD_WORD[m];
      } else {
        $$("[data-flash-face]", now).forEach(img => setRing(img.closest<HTMLElement>(".ring"), "neutral"));
        if (wordEl) wordEl.textContent = "Unavailable";
      }
      if (saved) return;
      if (timeEl) timeEl.textContent = "Updated " + clock(new Date());
      if (!first) restart(now, "flash-update");
      if (!NOW_HAS && Object.keys(byId).length) {
        NOW_HAS = true;
        startRotation();
      } else if (NOW_HAS) {
        showCell(confirmedLive.has(NOW_ORDER[NOW_ACTIVE]) ? NOW_ACTIVE : NOW_ORDER.findIndex(id => confirmedLive.has(id)));
      }
    }
    const FALLBACK = {
      1021: {
        title: "Whole city electricity",
        value: "12,963",
        num: 12963,
        pos: 0.34,
        ok: true,
      },
      1019: {
        title: "Oberlin College",
        value: "354",
        num: 354,
        pos: 0.28,
        ok: true,
      },
      1033: {
        title: "Air temperature",
        value: "61",
        num: 61,
        pos: 0.4,
        ok: true,
      },
      1030: { title: "Air quality", value: "32", num: 32, pos: 0.11, ok: true },
    };
    function showSavedReadings() {
      // A saved snapshot must not rotate into present-tense live commentary.
      if (rotT) window.clearInterval(rotT);
      rotT = undefined;
      NOW_HAS = false;
      applyReadings(FALLBACK, true, true);
      if (timeEl) timeEl.textContent = "Saved reading, 23 Sep 2026";
      if (sayEl) sayEl.textContent = "Live meters could not be reached, so this is the saved reading from 23 September 2026.";
      if (dockL) dockL.textContent = "Saved 23 Sep 2026";
      if (dockV) dockV.textContent = FALLBACK[1021].value + " kW";
    }
    function pull(first: boolean) {
      Promise.all(
        NOW_ORDER.map(function (id) {
          return getText(GAUGE_API + id)
            .then(parseGauge)
            .then(function (g) {
              return { id: id, g: g };
            })
            .catch(function () {
              return null;
            });
        }),
      ).then(
        safe(function (res: ({ id: number; g: GaugeReading } | null)[]) {
          const good = res.filter(isPresent).filter(function (x) {
            return x.g.ok;
          });
          const byId: Record<number, NowReading> = {};
          good.forEach(function (x) {
            byId[x.id] = x.g;
          });
          if (!good.length) {
            showSavedReadings();
            return;
          }
          applyReadings(byId, first);
        }),
      );
    }
    pull(true);
    window.setInterval(function () {
      if (!doc.hidden) pull(false);
    }, 60000);
    /* fallback timeout: if nothing answers within 6s, show the saved reading immediately */
    window.setTimeout(function () {
      if (!NOW_HAS) showSavedReadings();
    }, 6000);
  })();

  /* ------ persistent dock visibility ------ */
  safe(function () {
    const maybeDock = $("[data-dock]");
    const maybeNow = $("[data-now]");
    if (!maybeDock || !maybeNow) return;
    const dock = maybeDock;
    const now = maybeNow;
    if (now.id) dock.setAttribute("href", "#" + now.id);
    const foot = $(".foot");
    let ticking = false;
    function upd() {
      ticking = false;
      const vh = window.innerHeight;
      const past = now.getBoundingClientRect().bottom < 0;
      const footIn = foot && foot.getBoundingClientRect().top < vh - 40;
      dock.classList.toggle("show", past && !footIn);
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(upd);
        }
      },
      { passive: true },
    );
    window.addEventListener("resize", upd);
    upd();
  })();

  /* ================================================================
     CITYWIDE DASHBOARD sign: [data-cwd] with the what-if slider inside
     ================================================================ */
  const VIEWS: Record<string, { label: string; ids: number[] }> = {
    electricity: { label: "Electricity", ids: [1021, 1020, 1019, 1018] },
    water: { label: "Water", ids: [1025, 1024, 1023, 1022] },
    stream: { label: "Stream", ids: [1029, 1028, 1027, 1026] },
    weather: { label: "Weather", ids: [1033, 1031, 1032, 1030] },
  };
  function tileHTML(g: GaugeTile) {
    return (
      '<div class="tile" style="background:' +
      g.color +
      '"><div class="t">' +
      esc(g.title) +
      '</div><div class="v' +
      (g.value === "No reading" ? " nodata" : "") +
      '">' +
      esc(g.value) +
      '</div><div class="u">' +
      esc(g.unit) +
      "</div>" +
      '<div class="bar" aria-hidden="true">' +
      (g.aqi ? "HEALTHY" : "LOW") +
      '<span class="track"><span class="knob" style="left:' +
      (g.pos * 100).toFixed(1) +
      '%"></span></span>' +
      (g.aqi ? "HAZARD" : "HIGH") +
      "</div></div>"
    );
  }
  safe(function () {
    $$("[data-cwd]").forEach(function (sign) {
      const tiles = required($("[data-cwd-tiles]", sign));
      const modeEl = $("[data-cwd-mode]", sign);
      const cap = $("[data-cwd-cap]", sign);
      const viewBtns = $$("[data-cwd-views] button", sign);
      let current = "electricity";
      let timer: number | undefined = undefined;
      const cache: Record<string, GaugeTile[]> = {};
      const mascot = $("[data-cwd-mascot]", sign);
      const sim = sign.classList;
      const whatif =
        $("[data-whatif]", sign.parentElement) || $("[data-whatif]", sign);
      const range = whatif && $<HTMLInputElement>("[data-wi-range]", whatif);
      const wiRing = whatif && $("[data-wi-ring]", whatif);
      const wiWord = whatif && $("[data-wi-word]", whatif);
      const wiNote = whatif && $("[data-wi-note]", whatif);
      const wiBack = whatif && $("[data-wi-back]", whatif);
      function setMood(pos: number) {
        if (mascot) {
          let m = moodOf(pos);
          const src = moodSrc(m);
          if (mascot.getAttribute("src") !== src)
            mascot.setAttribute("src", src);
        }
        if (wiRing && !sim.contains("simulating")) setRing(wiRing, moodOf(pos));
      }
      function load(view: string) {
        const ids = VIEWS[view].ids;
        return Promise.all(
          ids.map(function (id) {
            return getText(GAUGE_API + id)
              .then(parseGauge)
              .catch(function () {
                return {
                  title: "",
                  unit: "",
                  value: "No reading",
                  pos: 0.5,
                  color: "#3498db",
                };
              });
          }),
        ).then(function (gs) {
          cache[view] = gs;
          if (view !== current || sim.contains("simulating")) return;
          let okGs = gs.filter(function (g) {
            return g.value !== "No reading";
          });
          if (okGs.length % 2 && okGs.length > 1) okGs = okGs.slice(0, -1);
          tiles.innerHTML = (okGs.length ? okGs : gs).map(tileHTML).join("");
          if (modeEl) modeEl.textContent = VIEWS[view].label;
          if (cap) cap.innerHTML = okGs.length
            ? '<span class="live-tag">Live from Oberlin, updated ' + clock(new Date()) + " Eastern.</span>"
            : '<span class="reading-unavailable">Readings are unavailable. The dashboard will try again.</span>';
          sign.classList.toggle("is-live", okGs.length > 0);
          if (view === "electricity" && gs[0] && gs[0].value !== "No reading") {
            setMood(gs[0].pos);
            if (range && !sim.contains("simulating"))
              range.value = String(Math.round(gs[0].pos * 100));
          }
        });
      }
      function pick(view: string | null) {
        if (!view || !VIEWS[view]) return;
        current = view;
        viewBtns.forEach(function (b) {
          b.setAttribute(
            "aria-pressed",
            b.getAttribute("data-view") === view ? "true" : "false",
          );
        });
        if (cache[view]) {
          tiles.innerHTML = cache[view].map(tileHTML).join("");
          if (modeEl) modeEl.textContent = VIEWS[view].label;
        }
        load(view);
      }
      viewBtns.forEach(function (b) {
        b.addEventListener("click", function () {
          pick(b.getAttribute("data-view"));
        });
      });
      if (range) {
        range.addEventListener("input", function () {
          const p = Number(range.value) / 100;
          let m = moodOf(p);
          sim.add("simulating");
          setRing(wiRing, m);
          if (wiWord) wiWord.textContent = MOOD_WORD[m];
          setMood(p);
          if (wiNote)
            wiNote.textContent =
              m === "happy"
                ? "A simulation. Flash is happy: this is low use."
                : m === "neutral"
                  ? "A simulation. This is about normal use."
                  : "A simulation. Flash is upset: this is high use.";
          if (wiBack) wiBack.hidden = false;
          const first = $(".tile", tiles);
          const knob = first && $(".knob", first);
          if (knob) knob.style.left = (p * 100).toFixed(1) + "%";
        });
        if (wiBack)
          wiBack.addEventListener("click", function () {
            sim.remove("simulating");
            wiBack.hidden = true;
            if (wiNote)
              wiNote.textContent =
                "A simulation. The marker shows where Oberlin is right now.";
            pick("electricity");
          });
      }
      function start() {
        if (timer) return;
        load(current);
        timer = window.setInterval(function () {
          load(current);
        }, 60000);
      }
      function stop() {
        clearInterval(timer);
        timer = undefined;
      }
      if ("IntersectionObserver" in window)
        new IntersectionObserver(
          function (es) {
            es.forEach(function (en) {
              if (en.isIntersecting) start();
              else stop();
            });
          },
          { threshold: 0.1 },
        ).observe(sign);
      else start();
    });
  })();

  /* ================================================================
     TESTIMONIAL SLIDER: [data-slider]
     ================================================================ */
  safe(function () {
    $$("[data-slider]").forEach(function (sl) {
      const slides = $$("[data-slide]", sl);
      const dotsBox = required($("[data-sl-dots]", sl));
      const nEl = $("[data-sl-n]", sl);

      let cur = 0;
      let timer: number | undefined = undefined;
      let paused = false;
      let inView = false;
      const DUR = 7000;
      const dots = slides.map(function (_slide, i) {
        var b = doc.createElement("button");
        b.type = "button";
        b.className = "sl-dot";
        b.setAttribute(
          "aria-label",
          "Quote " + (i + 1) + " of " + slides.length,
        );
        b.innerHTML = "<i></i>";
        b.addEventListener("click", function () {
          go(i, true);
        });
        dotsBox.appendChild(b);
        return b;
      });
      sl.style.setProperty("--dur", DUR + "ms");
      function go(i: number, user: boolean) {
        i = (i + slides.length) % slides.length;
        if (i !== cur) {
          slides[cur].hidden = true;
          cur = i;
          slides[i].hidden = false;
        }
        dots.forEach(function (d, j) {
          d.setAttribute("aria-current", j === i ? "true" : "false");
        });
        if (nEl) nEl.textContent = String(i + 1);
        if (user) {
          stop();
          sl.classList.remove("auto");
        }
      }
      function tick() {
        if (!paused && inView && !doc.hidden) go(cur + 1, false);
      }
      function start() {
        if (reduce || timer) return;
        sl.classList.add("auto");
        timer = window.setInterval(tick, DUR);
      }
      function stop() {
        clearInterval(timer);
        timer = undefined;
      }
      const prev = $("[data-sl-prev]", sl.closest("section") || doc);
      const next = $("[data-sl-next]", sl.closest("section") || doc);
      if (prev)
        prev.addEventListener("click", function () {
          go(cur - 1, true);
        });
      if (next)
        next.addEventListener("click", function () {
          go(cur + 1, true);
        });
      sl.addEventListener("mouseenter", function () {
        paused = true;
      });
      sl.addEventListener("mouseleave", function () {
        paused = false;
      });
      sl.addEventListener("focusin", function () {
        paused = true;
      });
      sl.addEventListener("focusout", function (e) {
        if (
          !sl.contains(e.relatedTarget instanceof Node ? e.relatedTarget : null)
        )
          paused = false;
      });
      go(0, false);
      if ("IntersectionObserver" in window)
        new IntersectionObserver(
          function (es) {
            es.forEach(function (en) {
              inView = en.isIntersecting;
              if (inView) start();
            });
          },
          { threshold: 0.35 },
        ).observe(sl);
      else start();
    });
  })();

  /* ================================================================
     STORY PLAYER: [data-story] (John's real deck slides)
     ================================================================ */
  safe(function () {
    $$("[data-story]").forEach(function (root_) {
      const slides = $$(".sp-slide", root_);
      const dots = $$(".sp-dots button", root_);
      const still = matchMedia("(prefers-reduced-motion: reduce)");
      const readingPreview = root_.getAttribute("data-reading-preview") !== null;
      const requestedInterval = Number(root_.getAttribute("data-reading-interval"));
      const interval = readingPreview ? (requestedInterval >= 12000 ? requestedInterval : 12000) : 4200;
      let i = 0;
      let timer: number | undefined = undefined;
      let remaining = interval;
      let startedAt: number | null = null;
      let inView = false;
      function go(n: number) {
        i = (n + slides.length) % slides.length;
        slides.forEach(function (s, k) {
          s.hidden = k !== i;
        });
        dots.forEach(function (d, k) {
          d.setAttribute("aria-current", k === i ? "true" : "false");
        });
        const count = root_.querySelector("[data-sp-count]");
        if (count) count.textContent = `${i + 1} / ${slides.length}`;
      }
      let hovered = false;
      let focused = false;
      let paused = root_.getAttribute("data-manual-preview") !== null;
      function tick(reset = false) {
        const now = performance.now();
        clearTimeout(timer);
        timer = undefined;
        if (startedAt !== null) remaining = Math.max(0, remaining - (now - startedAt));
        startedAt = null;
        if (reset) remaining = interval;
        if (still.matches || !inView || hovered || focused || paused || doc.hidden || root_.closest?.("[inert]")) return;
        startedAt = now;
        timer = window.setTimeout(function () {
          go(i + 1);
          tick(true);
        }, remaining);
      }
      // Holds preserve the current picture's remaining time. Only choosing a
      // picture or automatically advancing starts a complete new interval.
      // Previews without a visible pause button never latch forever: after a
      // quiet spell (no pointer, focus, wheel or touch) they resume rotating.
      const idleResume = root_.getAttribute("data-reading-idle-resume") !== null && root_.getAttribute("data-manual-preview") === null;
      let idleTimer: number | undefined = undefined;
      function hold() {
        paused = true;
        updatePauseControl();
        if (!idleResume) return;
        clearTimeout(idleTimer);
        idleTimer = window.setTimeout(function () {
          if (hovered || focused) { hold(); return; }
          paused = false;
          tick(true);
        }, 20000);
      }
      function choose(n: number) {
        go(n);
        if (readingPreview) hold();
        tick(true);
      }
      const pv = $("[data-sp-prev]", root_);
      const nx = $("[data-sp-next]", root_);
      const ps = $("[data-sp-pause]", root_);
      if (pv) pv.addEventListener("click", () => choose(i - 1));
      if (nx) nx.addEventListener("click", () => choose(i + 1));
      dots.forEach((d, k) => d.addEventListener("click", () => choose(k)));
      function updatePauseControl() {
        if (!ps) return;
        ps.setAttribute("aria-pressed", String(paused));
        ps.setAttribute("aria-label", readingPreview ? (paused ? "Play examples automatically" : "Pause automatic examples") : (paused ? "Play slides" : "Pause slides"));
        ps.innerHTML = paused ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 10 7-10 7Z"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
      }
      if (ps) {
        ps.addEventListener("click", function () { paused = !paused; updatePauseControl(); tick(); });
        updatePauseControl();
      }
      if (readingPreview) {
        // Explicit interaction keeps the selected example stable after focus or
        // pointer leaves. A visible play control (when present) is the resume
        // action; controls-free previews resume after twenty quiet seconds.
        root_.addEventListener("wheel", () => { hold(); tick(); }, { passive: true });
        root_.addEventListener("touchstart", e => { if (!ps?.contains(e.target as Node)) { hold(); tick(); } }, { passive: true });
        root_.addEventListener("scroll", e => { if ((e.target as HTMLElement)?.hasAttribute?.("data-scroll-hinting")) return; hold(); tick(); }, { passive: true, capture: true });
        window.addEventListener?.("blur", () => {
          if (root_.contains(document.activeElement)) { hold(); tick(); }
        });
      }
      if (!pv && !nx) {
        // Controls-free preview: arrow keys still step through the examples.
        root_.addEventListener("keydown", e => {
          const key = (e as KeyboardEvent).key;
          if (key !== "ArrowLeft" && key !== "ArrowRight") return;
          choose(key === "ArrowLeft" ? i - 1 : i + 1);
          // The slide that held focus is now hidden; keep the keyboard in the carousel.
          const next = slides[i]?.querySelector?.<HTMLElement>('[tabindex="0"]');
          next?.focus?.({ preventScroll: true });
        });
      }
      // Independent gates prevent pointer exit from cancelling a keyboard hold.
      root_.addEventListener("pointerenter", () => { hovered = true; tick(); });
      root_.addEventListener("pointerleave", () => { hovered = false; tick(readingPreview); });
      root_.addEventListener("focusin", e => { focused = true; if (readingPreview && !ps?.contains(e.target as Node)) hold(); tick(); });
      root_.addEventListener("focusout", e => {
        if (!root_.contains(e.relatedTarget instanceof Node ? e.relatedTarget : null)) {
          focused = false;
          tick();
        }
      });
      doc.addEventListener("visibilitychange", () => tick());
      if (readingPreview) {
        window.addEventListener?.("ch:storychange", () => tick(true));
        const owner = root_.closest?.("[data-eng-panel]");
        if (owner && typeof MutationObserver !== "undefined") {
          new MutationObserver(() => tick(true)).observe(owner, {attributes:true,attributeFilter:["inert"]});
        }
      }
      function motionChanged() {
        if (ps) ps.hidden = still.matches;
        tick();
      }
      still.addEventListener("change", motionChanged);
      go(0);
      root_.setAttribute("data-story-ready", "");
      if ("IntersectionObserver" in window)
        new IntersectionObserver(
          function (es) {
            es.forEach(function (en) {
              inView = en.isIntersecting && en.intersectionRatio >= 0.5;
            });
            tick();
          },
          { threshold: [0, 0.5] },
        ).observe(root_);
      else inView = true;
      motionChanged();
    });
  })();

  /* ================================================================
     INNER SCROLL REGIONS: every one owns the wheel until its edge (the
     page scripts read [data-scroll-owner]) and shows the same pine
     scrollbar (oct3_controls.css). The "Scroll here" cue is the attention
     squirrel (ui/attention-squirrel.ts), not a content nudge.
     ================================================================ */
  safe(function () {
    const SEL = ".native-scroll,.native-voices-content,.native-application-viewport,.ev-mini,.rs-lessons,.zpb-emb-site,.hf-source-model,.hf-grid,.pw-picker,.page-contents-panel";
    function adopt() {
      $$(SEL).forEach(function (el) {
        if (!el.hasAttribute("data-scroll-owner")) el.setAttribute("data-scroll-owner", "");
      });
    }
    let later: number | undefined;
    function rescan() { clearTimeout(later); later = window.setTimeout(adopt, 250); }
    adopt();
    if (doc.body && typeof MutationObserver !== "undefined") new MutationObserver(rescan).observe(doc.body, { childList: true, subtree: true });
    initEmbedScroll();
    initAttentionSquirrel();
  })();

  /* ================================================================
     LIVE IFRAME FRAMES: .live-frame[data-src]
     ================================================================ */
  safe(function () {
    // The original still is an explicit preview, not proof that remote charts loaded.
    function bindPreview(host: HTMLElement, frame: HTMLIFrameElement) {
      if (!host.hasAttribute("data-embed-preview")) return;
      const image = $<HTMLImageElement>(".embed-preview-image", host);
      const status = host.closest(".live-frame")?.querySelector("[data-embed-preview-status]")
        || host.nextElementSibling?.querySelector("[data-embed-preview-status]");
      if (!image) return;
      const stillText = status?.textContent || "Original still image. Select Interact for the live dashboard.";
      function update() {
        const live = frame.classList.contains("ch-live");
        host.toggleAttribute("data-preview-active", !live);
        image!.hidden = live;
        frame.setAttribute("aria-hidden", String(!live));
        if (status) status.textContent = live
          ? "Live view. If it stays blank, open the dashboard full size."
          : stillText;
      }
      update();
      frame.addEventListener("ch:embed-interact", update);
      new MutationObserver(update).observe(frame, { attributes: true, attributeFilter: ["class"] });
    }
    // Third-party embeds load only once their scene is on screen. Browser lazy
    // loading fetches frames several discrete scenes away (61 MB on the home page).
    const deferred = new Set($$<HTMLIFrameElement>("iframe[data-defer-src]"));
    const loadDeferred = (f: HTMLIFrameElement) => {
      const rect = f.getBoundingClientRect();
      if (!shouldLoadDeferredFrame({loaded:!!f.getAttribute("src"),inactive:!!f.closest("[inert]"),visibility:getComputedStyle(f).visibility,width:rect.width,height:rect.height,top:rect.top,bottom:rect.bottom},innerHeight)) return;
      f.src = freshDocumentUrl(f.dataset.deferSrc || "");
      deferred.delete(f);
    };
    const activateVisible = () => deferred.forEach(loadDeferred);
    if (deferred.size && "IntersectionObserver" in window) {
      // A frame can enter view while its scene is still inert or hidden mid-cut; the observer
      // will not fire again while it stays in view, so keep retrying until it loads or leaves.
      const waiting = new Set<HTMLIFrameElement>();
      let retry = 0;
      const retryWaiting = () => {
        retry = 0;
        waiting.forEach(f => { loadDeferred(f); if (!deferred.has(f)) { waiting.delete(f); io.unobserve(f); } });
        if (waiting.size) retry = window.setTimeout(retryWaiting, 400);
      };
      const io = new IntersectionObserver(entries => entries.forEach(entry => {
        const f = entry.target as HTMLIFrameElement;
        if (!entry.isIntersecting) { waiting.delete(f); return; }
        loadDeferred(f);
        if (!deferred.has(f)) io.unobserve(f);
        else { waiting.add(f); if (!retry) retry = window.setTimeout(retryWaiting, 400); }
      }));
      const owners = new Set<Element>();
      deferred.forEach(f => {
        io.observe(f);
        const product=f.closest("[data-eng-panel]"), example=f.closest("[data-sp]");
        if(product)owners.add(product);if(example)owners.add(example);
      });
      const observer=new MutationObserver(activateVisible);
      owners.forEach(owner=>observer.observe(owner,{attributes:true,attributeFilter:["inert","hidden"]}));
      window.addEventListener("ch:storychange",activateVisible);
    } else activateVisible();
    $$(".mini[data-embed-preview]").forEach(host => {
      const frame = $<HTMLIFrameElement>("iframe", host);
      if (frame) bindPreview(host, frame);
    });
    function loadFrame(fig: Element, retry = false) {
      if (fig.getAttribute("data-loaded") && !retry) return;
      fig.setAttribute("data-loaded", "1");
      fig.classList.remove("needs-retry");
      $(".lf-notice", fig)?.remove();
      const body = required($(".lf-body", fig));
      const title = fig.getAttribute("data-title") || "the dashboard";
      const source = fig.getAttribute("data-src") || "";
      const retryButton = fig.querySelector<HTMLButtonElement>(".lf-load");
      if (retryButton) { retryButton.disabled = true; retryButton.setAttribute("aria-busy", "true"); retryButton.textContent = "Loading…"; }
      const f = doc.createElement("iframe");
      f.title = "Live view of " + title;
      f.loading = "eager";
      f.style.opacity = "0";
      f.referrerPolicy = "strict-origin-when-cross-origin";
      const wait = doc.createElement("p");
      wait.className = "lf-wait";
      wait.setAttribute("role", "status");
      wait.textContent = "Loading " + title + "…";
      const preview = $(".embed-preview-image", body);
      body.replaceChildren(...(preview ? [preview, f] : [wait, f]));
      bindPreview(body, f);
      // embed-scroll promotes the parent only after this frame reports a valid
      // content height. Until then the embedded application's scrolling works.
      let finished = false;
      const timeout = window.setTimeout(() => {
        if (!finished && body.contains(f)) slowWait(body, source);
      }, 12000);
      f.addEventListener("load", () => {
        finished = true;
        window.clearTimeout(timeout);
        if (body.contains(f)) {
          f.style.opacity = "1";
          clearWait(body);
          if (retryButton) { retryButton.disabled = false; retryButton.removeAttribute("aria-busy"); retryButton.textContent = "Reload dashboard"; }
        }
      });
      f.addEventListener("error", () => {
        finished = true;
        window.clearTimeout(timeout);
        if (body.contains(f)) slowWait(body, source);
      });
      f.src = freshDocumentUrl(source);
    }
    // A cross-origin load event cannot prove the remote application's health.
    // Keep the separate Open dashboard link visible even after the iframe loads.
    function clearWait(body: HTMLElement) {
      $(".lf-wait", body)?.remove();
      const fig = body.closest(".live-frame");
      if (fig) { $(".lf-notice", fig)?.remove(); fig.classList.remove("needs-retry"); }
    }
    function slowWait(body: HTMLElement, src: string) {
      body.closest(".live-frame")?.classList.add("needs-retry");
      const retryButton = body.closest(".live-frame")?.querySelector<HTMLButtonElement>(".lf-load");
      if (retryButton) { retryButton.disabled = false; retryButton.removeAttribute("aria-busy"); retryButton.textContent = "Retry dashboard"; }
      $(".lf-wait", body)?.remove();
      const frame = $<HTMLIFrameElement>("iframe", body);
      if (frame) frame.style.opacity = "1";
      const fig = body.closest(".live-frame");
      let w = fig ? $(".lf-notice", fig) : null;
      if (!w) { w = doc.createElement("p"); w.className = "lf-notice"; w.setAttribute("role", "status"); body.after(w); }
      w.replaceChildren();
      w.textContent = "This dashboard is taking longer to load. ";
      const a = doc.createElement("a");
      a.href = src;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "Open the dashboard in a new tab";
      w.appendChild(a);

    }
    const frames = $$(".live-frame[data-src]");
    frames.forEach(fig => {
      $(".lf-load", fig)?.addEventListener("click", () => loadFrame(fig, true));
      fig.addEventListener("ch:load-frame", () => loadFrame(fig));
    });
    if ("IntersectionObserver" in window && frames.length) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadFrame(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "150px" });
      frames.forEach(fig => io.observe(fig));
    } else {
      frames.filter(fig => !fig.closest("[hidden]")).forEach(fig => loadFrame(fig));
    }
    /* tabbed picker: [data-live-tabs] feeding one [data-live-panel] iframe */
    $$("[data-live-tabs]").forEach(function (tabs) {
      const btns = $$('[role="tab"]', tabs);
      if (!btns.length) return;
      const panelSel = tabs.getAttribute("data-live-tabs");
      const panel = doc.getElementById(panelSel || "");
      if (!panel) return;
      panel.setAttribute(
        "data-loaded",
        "1",
      ); /* the tabs own this frame, not the plain loader above */
      const body = required($(".lf-body", panel));
      const urlEl = $("[data-live-url]", panel);
      const openEl = $<HTMLAnchorElement>("[data-live-open]", panel);
      let current = btns[0];
      let loaded = false;
      let frameTimeout: number | undefined;
      function frame() {
        const src = current.getAttribute("data-src") || "";
        window.clearTimeout(frameTimeout);
        clearWait(body);
        const wait = doc.createElement("span");
        wait.className = "lf-wait";
        wait.setAttribute("role", "status");
        wait.textContent = "Loading the live dashboard";
        const f = doc.createElement("iframe");
        f.title = current.textContent.trim() + " live dashboard";
        f.loading = "eager";
        f.referrerPolicy = "no-referrer-when-downgrade";
        f.style.cssText = "position:relative;z-index:1;opacity:1";
        let finished = false;
        const timeout = window.setTimeout(() => {
          if (!finished && body.contains(f)) slowWait(body, src);
        }, 12000);
        frameTimeout = timeout;
        f.addEventListener("load", () => {
          finished = true;
          window.clearTimeout(timeout);
          if (body.contains(f)) clearWait(body);
        });
        f.addEventListener("error", () => {
          finished = true;
          window.clearTimeout(timeout);
          if (body.contains(f)) slowWait(body, src);
        });
        // Register handlers before navigation, including fast cached responses.
        f.src = freshDocumentUrl(src);
        body.replaceChildren(wait, f);
        loaded = true;
      }
      function select(b: HTMLElement, load: boolean) {
        btns.forEach(function (t) {
          const on = t === b;
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
        });
        current = b;
        const src = b.getAttribute("data-src") || "";
        if (urlEl) urlEl.textContent = src.replace(/^https:\/\//, "");
        if (openEl) openEl.href = src;
        if (load || loaded) frame();
      }
      btns.forEach(function (b, k) {
        b.addEventListener("click", function () {
          select(b, true);
        });
        // Roving tabindex leaves one tab in the tab order; arrows move between them.
        b.addEventListener("keydown", function (e) {
          const n = { ArrowRight: k + 1, ArrowLeft: k - 1, Home: 0, End: btns.length - 1 }[e.key];
          if (n == null) return;
          e.preventDefault();
          const next = btns[(n + btns.length) % btns.length];
          select(next, true);
          next.focus();
        });
      });
      if ("IntersectionObserver" in window)
        new IntersectionObserver(
          function (es) {
            es.forEach(function (en) {
              if (en.isIntersecting && !loaded) {
                frame();
              }
            });
          },
          { rootMargin: "150px" },
        ).observe(panel);
      else frame();
    });
  })();

  /* ================================================================
     LIVE EVENTS LIST: [data-events]
     ================================================================ */
  /* data-city picks the calendar: oberlin (default) or cleveland */
  const CITIES: Record<string, { api: string; post: string; name: string }> = {
    oberlin: {
      api: "https://oberlin.communityhub.cloud",
      post: "https://environmentaldashboard.org/calendar/post/",
      name: "Oberlin",
    },
    cleveland: {
      api: "https://cleveland.communityhub.cloud",
      post: "https://cleveland.communityhub.cloud/calendar/post/",
      name: "Cleveland",
    },
  };
  function monthKey(y: number, m: number) {
    return Math.floor(new Date(y, m - 1, 3).getTime() / 1000);
  }
  function loadEvents(box: HTMLElement) {
    let n = parseInt(box.getAttribute("data-count") || "6", 10);
    const now = new Date();
    const city =
      CITIES[box.getAttribute("data-city") || "oberlin"] || CITIES.oberlin;
    const CAL = city.api + "/api/legacy/calendar/full?t=";
    const y = now.getFullYear();
    let m = now.getMonth() + 1;
    const ny = m === 12 ? y + 1 : y;
    const nm = m === 12 ? 1 : m + 1;
    Promise.all([
      getJSON(CAL + monthKey(y, m)).then(calendarData),
      getJSON(CAL + monthKey(ny, nm))
        .then(calendarData)
        .catch(function () {
          return { sessions: [] };
        }),
    ])
      .then(function (res) {
        const nowS = Date.now() / 1000;
        const seen: Record<string, number> = {};
        const list = (res[0].sessions || [])
          .concat(res[1].sessions || [])
          .filter(function (s) {
            return s.start >= nowS && s.end - s.start < 86400 * 2 && s.postName;
          })
          .sort(function (a, b) {
            return a.start - b.start;
          })
          .filter(function (s) {
            var k = s.postId + ":" + new Date(s.start * 1000).toDateString();
            if (seen[k]) return false;
            seen[k] = 1;
            return true;
          })
          .slice(0, n);
        if (!list.length) {
          const fallback = $(".events-fallback", box);
          if (fallback) fallback.textContent = "No upcoming " + city.name + " events are available in this preview.";
          return;
        }
        box.innerHTML =
          '<ul class="events-list">' +
          list
            .map(function (s) {
              const d = new Date(s.start * 1000);
              const mon = d.toLocaleDateString(
                "en-US",
                Object.assign<
                  Intl.DateTimeFormatOptions,
                  Intl.DateTimeFormatOptions
                >({ month: "short" }, TZ),
              );
              const day = d.toLocaleDateString(
                "en-US",
                Object.assign<
                  Intl.DateTimeFormatOptions,
                  Intl.DateTimeFormatOptions
                >({ day: "numeric" }, TZ),
              );
              const wd = d.toLocaleDateString(
                "en-US",
                Object.assign<
                  Intl.DateTimeFormatOptions,
                  Intl.DateTimeFormatOptions
                >({ weekday: "long" }, TZ),
              );
              const item = (
                '<li><a href="' +
                city.post +
                s.postId +
                '" target="_blank" rel="noopener"><span class="ev-date"><small>' +
                mon +
                "</small><b>" +
                day +
                '</b></span><span class="ev-what"><b>' +
                esc(s.postName) +
                "</b><small>" +
                wd +
                ", " +
                clock(d) +
                "</small></span></a></li>"
              );
              return box.getAttribute("data-event-preview") === ""
                ? item.replace(/<a [^>]+>/, '<div class="event-preview-row">').replace('</a>', '</div>')
                : item;
            })
            .join("") +
          '</ul><p class="events-src">Updated ' +
          clock(new Date()) +
          " Eastern. From " +
          city.name +
          "’s community calendar.</p>";
      })
      .catch(function () {
        const f = $(".events-fallback", box);
        if (f)
          f.innerHTML =
            "Upcoming events couldn't load here. <a href=\"" + city.api +
            "/calendar/\" target=\"_blank\" rel=\"noopener\">Browse the " +
            city.name + " community calendar</a>.";
      });
  }
  window.chLoadEvents = loadEvents;
  safe(function () {
    $$("[data-events]").forEach(loadEvents);
  });

  /* ================================================================
     COMMUNITY VOICES: [data-voices-wall] and [data-voices-sign]
     ================================================================ */
  safe(function () {
    $$("[data-voices-sign]").forEach(function (sign) {
      const cards = $$(".cv", sign);
      let i = 0;
      let timer: number | undefined = undefined;
      function go(n: number) {
        i = (n + cards.length) % cards.length;
        cards.forEach(function (c, k) {
          c.classList.toggle("is-on", k === i);
        });
      }
      function tick() {
        go(i + 1);
      }
      go(0);
      if (!reduce && "IntersectionObserver" in window)
        new IntersectionObserver(
          function (es) {
            es.forEach(function (en) {
              if (en.isIntersecting) {
                if (!timer) timer = window.setInterval(tick, 3600);
              } else {
                clearInterval(timer);
                timer = undefined;
              }
            });
          },
          { threshold: 0.4 },
        ).observe(sign);
    });
  })();
})();
