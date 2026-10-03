import {
  embedData,
  jobsData,
  calendarData,
  type EmbedPreset,
  type EmbedData,
  type DisplayJob,
} from "./data";
interface EmbedState {
  preset: string;
  brand: string;
  font: string;
  fontAll: boolean;
  corners: string;
  spacing: string;
  custom: boolean;
}
interface EmbeddedGauge {
  title: string;
  unit: string;
  value: string;
  pos: number;
}
import { $, $$, isPresent, required, eventElement } from "./dom";
/* ================================================================
   pages_zprod_b.js: Calendar and Jobs Board, Community Voices,
   Digital Signage, Phone App and Web Embeddables. Page-specific
   behavior beyond base.js's shared components. Every component here
   is opt-in (checks its element exists first) and auto-plays while
   in view, per the brief: no play or replay buttons anywhere.
   ================================================================ */
(function () {
  function safe(fn: () => void) {
    try {
      fn();
    } catch (e) {}
  }
  const reduce = !!(
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  /* ---------------------------------------------------------------- jump-nav scrollspy (own copy of pages_zprod_a.js's pattern) */
  safe(function () {
    const nav = $("[data-zpb-jump]");
    if (!nav) return;
    const links = $$("a", nav);
    const sections = links
      .map(function (a) {
        return document.getElementById((a.getAttribute("href") || "").slice(1));
      })
      .filter(isPresent);
    if (!sections.length || !("IntersectionObserver" in window)) return;
    let current: Element | null = null;
    function mark(sec: Element) {
      if (sec === current) return;
      current = sec;
      links.forEach(function (a) {
        a.classList.toggle("is-on", a.getAttribute("href") === "#" + sec.id);
      });
    }
    const io = new IntersectionObserver(
      function (entries) {
        var best = null,
          bestTop = Infinity;
        entries.forEach(function (en) {
          if (en.isIntersecting && en.boundingClientRect.top < bestTop) {
            bestTop = en.boundingClientRect.top;
            best = en.target;
          }
        });
        if (best) mark(best);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );
    sections.forEach(function (s) {
      io.observe(s);
    });
  });

  /* ---------------------------------------------------------------- generic auto-stepper: [data-zpb-stepper] > .zpb-step
     Highlights one step at a time, looping while the stepper is in view. No
     button: it starts itself, per "everything auto-plays" (design_brief_v5.md). */
  safe(function () {
    $$("[data-zpb-stepper]").forEach(function (box) {
      const steps = $$(".zpb-step", box);
      if (steps.length < 2) return;
      const ms =
        parseInt(box.getAttribute("data-zpb-step-ms") || "", 10) || 4200;
      box.style.setProperty("--zpb-step", ms + "ms");
      let i = 0;
      let timer: number | undefined = undefined;
      let visible = false;
      function show(n: number) {
        i = (n + steps.length) % steps.length;
        steps.forEach(function (s, k) {
          s.classList.toggle("is-on", k === i);
        });
      }
      function tick() {
        show(i + 1);
      }
      function start() {
        if (timer || reduce) return;
        timer = window.setInterval(tick, ms);
      }
      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = undefined;
        }
      }
      box.classList.add("zpb-js");
      show(0);
      if (reduce || !("IntersectionObserver" in window)) {
        return;
      }
      const io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            visible = en.isIntersecting;
            if (visible) start();
            else stop();
          });
        },
        { threshold: 0.35 },
      );
      io.observe(box);
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop();
        else if (visible) start();
      });
    });
  });

  /* ---------------------------------------------------------------- Community Voices: filterable wall
     Built entirely from H.CV_SLIDES (server-rendered cards, data-key per
     theme). No live fetch: /api/voices only answers on Vercel (see
     site_src5/README.md), and the wall already shows every saved slide. */
  safe(function () {
    const wall = $("[data-zpb-cv-wall]");
    const tabs = $("[data-zpb-cv-tabs]");
    if (!wall || !tabs) return;
    const cards = $$(".zpb-cv-card", wall);
    const rows = $$<HTMLElement>(".zpb-cv-row", wall);
    const empty = $("[data-zpb-cv-empty]", wall);
    const buttons = $$(".zpb-cv-tab", tabs);
    const io =
      !reduce && "IntersectionObserver" in window
        ? new IntersectionObserver(
            function (entries) {
              entries.forEach(function (en) {
                if (en.isIntersecting) {
                  en.target.classList.add("in");
                  io?.unobserve(en.target);
                }
              });
            },
            { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
          )
        : null;
    if (io)
      cards.forEach(function (c) {
        io.observe(c);
      });
    else
      cards.forEach(function (c) {
        c.classList.add("in");
      });

    function apply(key: string | null, alignToWall = false) {
      let shown = 0;
      cards.forEach(function (c) {
        const on = key === "all" || c.getAttribute("data-key") === key;
        c.hidden = !on;
        if (on) shown++;
      });
      // Keep matching quotations together rather than leaving their old empty slots.
      const ordered = [...cards.filter(c => !c.hidden), ...cards.filter(c => c.hidden)];
      rows.forEach((row, index) => {
        const group = ordered.slice(index * 4, index * 4 + 4);
        group.forEach(card => row.appendChild(card));
        const visible = group.filter(card => !card.hidden).length;
        row.hidden = visible === 0;
        row.style.setProperty('--voices-columns', String(Math.max(1, visible)));
      });
      buttons.forEach(function (b) {
        b.setAttribute(
          "aria-pressed",
          b.getAttribute("data-filter") === key ? "true" : "false",
        );
      });
      if (empty) empty.hidden = shown > 0;
      if (alignToWall) {
        const firstFrame = window.chStory?.frames().find(frame => frame.scene === rows[0]);
        window.dispatchEvent(new CustomEvent('ch:fit', {detail:{anchor:firstFrame || null}}));
      }
    }
    tabs.addEventListener("click", function (ev) {
      const b = eventElement(ev)?.closest(".zpb-cv-tab");
      if (!b) return;
      apply(b.getAttribute("data-filter"), true);
    });
    apply("all");
    /* "See X slides" links from the seven-category section */
    $$("[data-zpb-cv-goto]").forEach(function (a) {
      a.addEventListener("click", function (ev) {
        const key = a.getAttribute("data-zpb-cv-goto");
        apply(key);
        const btn = buttons.filter(function (b) {
          return b.getAttribute("data-filter") === key;
        })[0];
        if (window.chStory) {
          // Filtering changes the wall's height before the shared fragment
          // handler chooses its complete destination. Keep that handler's cut.
          window.dispatchEvent(new CustomEvent("ch:fit", { detail: {} }));
          requestAnimationFrame(function () { btn?.focus({ preventScroll: true }); });
          return;
        }
        ev.preventDefault();
        wall.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
        if (btn) {
          try {
            btn.focus({ preventScroll: true });
          } catch (e) {
            btn.focus();
          }
        }
      });
    });
  });

  /* ================================================================================================================
     Web Embeddables: restyle demo. Ported and restyled from
     site_src/pages_embeds.js: same state machine and live data (the
     Oberlin calendar feed, the MidTown Cleveland jobs board and gauge
     1021), v5 class names throughout. The manual "Play the style tour"
     button is gone: the tour now starts itself once, the first time the
     demo scrolls into view, and stops as soon as anyone touches a
     control, per the brief's "no play or replay buttons" rule.
     ================================================================================================================ */
  safe(function () {
    const rootNode = $("[data-zpb-emb]");
    if (!rootNode) return;
    const root = rootNode;
    let data: EmbedData;
    try {
      data = embedData(JSON.parse(required($("#zpb-emb-data")).textContent));
    } catch (e) {
      return;
    }

    function qq<T extends Element = HTMLElement>(
      s: string,
      r?: ParentNode | null,
    ): T | null {
      return (r || root).querySelector<T>(s);
    }
    function qqa<T extends Element = HTMLElement>(
      s: string,
      r?: ParentNode | null,
    ): T[] {
      return $$<T>(s, r || root);
    }
    function esc(s: unknown) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return (
          {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[c] || c
        );
      });
    }
    function clock(d: Date) {
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
      });
    }

    const PRESETS = data.presets || [];
    const FONTS = data.fonts || {};
    const SPACING = data.spacing || { compact: 0.82, regular: 1, roomy: 1.18 };
    const PBY: Record<string, EmbedPreset> = {};
    PRESETS.forEach(function (p) {
      PBY[p.key] = p;
    });
    const siteNode = qq("[data-zpb-emb-site]");
    if (!siteNode || !PRESETS.length) return;
    const site = siteNode;

    function rgb(h: string) {
      h = String(h || "").replace("#", "");
      if (h.length === 3)
        h = h
          .split("")
          .map(function (c) {
            return c + c;
          })
          .join("");
      let n = parseInt(h, 16);
      if (isNaN(n)) n = 0;
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    function lum(h: string) {
      const c = rgb(h).map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    }
    function inkOn(h: string) {
      const L = lum(h);
      const light = 1.05 / (L + 0.05);
      const dark = (L + 0.05) / (lum("#10151A") + 0.05);
      return light >= dark ? "#FFFFFF" : "#10151A";
    }
    function normHex(h: string | null) {
      h = String(h || "").trim();
      if (!/^#[0-9a-f]{6}$/i.test(h)) return null;
      return h.toUpperCase();
    }

    let state: EmbedState = {
      preset: PRESETS[0].key,
      brand: PRESETS[0].v.p,
      font: PRESETS[0].font,
      fontAll: false,
      corners: "rounded",
      spacing: PRESETS[0].spacing,
      custom: false,
    };

    const colorIn = qq<HTMLInputElement>("#zpb-emb-color");
    const hexOut = qq("[data-zpb-emb-hex]");
    const fontSel = qq<HTMLSelectElement>("#zpb-emb-font");
    const cornerIns = qqa<HTMLInputElement>('input[name="zpb-emb-corners"]');
    const spaceIns = qqa<HTMLInputElement>('input[name="zpb-emb-spacing"]');
    const outline = qq<HTMLInputElement>("#zpb-emb-outline");
    const resetBtn = qq<HTMLButtonElement>("[data-zpb-emb-reset]");
    const customTag = qq("[data-zpb-emb-custom]");
    const presetBtns = qqa(".zpb-emb-pre");
    const presetSelect = qq<HTMLSelectElement>("[data-zpb-emb-preset-select]");
    const swatches = qqa(".zpb-emb-swatch");

    function radiusFor(p: EmbedPreset) {
      return state.corners === "square" ? 0 : p.radius || 12;
    }

    function paint() {
      const p = PBY[state.preset];
      let v = p.v;
      const st = site.style;
      const fh =
        (FONTS[state.font] || FONTS[p.font] || {}).stack ||
        "system-ui, sans-serif";
      const fb = state.fontAll ? fh : (FONTS[p.body] || {}).stack || fh;
      const r = radiusFor(p);
      const vars: Record<string, string> = {
        "--s-p": state.brand,
        "--s-p-ink": inkOn(state.brand),
        "--s-acc": v.acc,
        "--s-bg": v.bg,
        "--s-surf": v.surf,
        "--s-text": v.text,
        "--s-muted": v.muted,
        "--s-line": v.line,
        "--s-head": v.head,
        "--s-font-h": fh,
        "--s-font-b": fb,
        "--s-r": r + "px",
        "--s-r-sm": Math.min(r, 8) + "px",
        "--s-r-pill": r ? "999px" : "0px",
        "--s-d": String(SPACING[state.spacing] || 1),
      };
      Object.keys(vars).forEach(function (k) {
        st.setProperty(k, vars[k]);
      });
      site.setAttribute("data-head", p.head);
      site.setAttribute("data-tabs", p.tabs);
      site.setAttribute("data-list", p.list);
      site.setAttribute("data-scheme", p.scheme);
      site.setAttribute("data-corners", state.corners);
    }

    function setText(sel: string, t: string) {
      const el = qq(sel);
      if (el) el.textContent = t;
    }
    function partnerContent(p: EmbedPreset) {
      setText("[data-zpb-emb-name]", p.site);
      setText("[data-zpb-emb-name2]", p.site);
      setText("[data-zpb-emb-host]", p.host);
      setText("[data-zpb-emb-page]", p.page);
      setText("[data-zpb-emb-page-c]", p.page);
      setText("[data-zpb-emb-tagline]", p.tagline);
      const logo = qq("[data-zpb-emb-logo]");
      if (logo) logo.innerHTML = p.logo;
      const menu = qq("[data-zpb-emb-menu]");
      if (menu)
        menu.innerHTML =
          p.menu
            .map(function (m) {
              return "<li>" + esc(m) + "</li>";
            })
            .join("") + '<li class="on">Community</li>';
    }

    let swapTimer: number | undefined;
    function swap() {
      if (reduce) return;
      [site, qq(".zpb-emb-url")].forEach(function (el) {
        if (!el) return;
        el.classList.remove("is-swapping");
        void el.offsetWidth;
        el.classList.add("is-swapping");
      });
      clearTimeout(swapTimer);
      swapTimer = window.setTimeout(function () {
        site.classList.remove("is-swapping");
        const u = qq(".zpb-emb-url");
        if (u) u.classList.remove("is-swapping");
      }, 650);
    }

    function syncControls() {
      if (presetSelect) presetSelect.value = state.preset;
      if (colorIn) colorIn.value = state.brand.toLowerCase();
      if (hexOut) hexOut.textContent = state.brand.toUpperCase();
      if (fontSel) fontSel.value = state.font;
      cornerIns.forEach(function (i) {
        i.checked = i.value === state.corners;
      });
      spaceIns.forEach(function (i) {
        i.checked = i.value === state.spacing;
      });
      presetBtns.forEach(function (b) {
        b.setAttribute(
          "aria-pressed",
          !state.custom && b.getAttribute("data-preset") === state.preset
            ? "true"
            : "false",
        );
      });
      swatches.forEach(function (s) {
        s.setAttribute(
          "aria-pressed",
          normHex(s.getAttribute("data-color")) === state.brand.toUpperCase()
            ? "true"
            : "false",
        );
      });
      if (customTag) customTag.hidden = !state.custom;
      if (resetBtn) resetBtn.disabled = !state.custom;
    }

    const codeEl = qq("[data-zpb-emb-code]");
    let lastLines: string[] | null = null;
    function hl(line: string) {
      let t = esc(line);
      if (/^&lt;!--/.test(t)) return '<span class="t-com">' + t + "</span>";
      t = t
        .replace(
          /(&lt;\/?)([a-z-]+)/g,
          '<span class="t-pun">$1</span><span class="t-tag">$2</span>',
        )
        .replace(
          /([a-z-]+)=(&quot;)(.*?)(&quot;)/g,
          '<span class="t-attr">$1</span><span class="t-pun">=</span><span class="t-val">$2$3$4</span>',
        )
        .replace(/(&gt;)/g, '<span class="t-pun">$1</span>');
      return t;
    }
    function snippet() {
      if (!codeEl) return;
      const p = PBY[state.preset];
      const lines = [
        "<!-- Example, not a real API -->",
        '<script src="https://embed.example/ch.js"></script>',
        "<community-dashboard",
        '  community="oberlin"',
        '  partner="' + (state.custom ? "your-organization" : p.key) + '"',
        '  tabs="events jobs live-data voices citywide"',
        '  brand-color="' + state.brand.toLowerCase() + '"',
        '  font="' + ((FONTS[state.font] || {}).label || "") + '"',
        '  corners="' + state.corners + '"',
        '  spacing="' + state.spacing + '"',
        '  color-scheme="' + p.scheme + '">',
        "</community-dashboard>",
      ];
      codeEl.innerHTML = lines
        .map(function (l, i) {
          const fresh = lastLines && lastLines[i] !== l && !reduce;
          return (
            '<span class="ln' +
            (fresh ? " is-new" : "") +
            '">' +
            hl(l) +
            "</span>"
          );
        })
        .join("");
      lastLines = lines;
    }

    function applyPreset(key: string | null, quiet = false) {
      if (!key) return;
      const p = PBY[key];
      if (!p) return;
      const changed = key !== state.preset || state.custom;
      state = {
        preset: key,
        brand: normHex(p.v.p) || "#58BA51",
        font: p.font,
        fontAll: false,
        corners: p.radius === 0 ? "square" : "rounded",
        spacing: p.spacing,
        custom: false,
      };
      partnerContent(p);
      paint();
      syncControls();
      snippet();
      if (changed && !quiet) swap();
    }
    function customize(patch: Partial<EmbedState>, fontChange = false) {
      Object.assign(state, patch);
      state.custom = true;
      paint();
      syncControls();
      snippet();
      if (fontChange) swap();
    }

    /* ---- automatic style tour: starts itself once on scroll into view, stops on interaction. No button. ---- */
    let touring = false;
    let toured = false;
    let interacted = false;
    let tourTimer: number | undefined = undefined;
    let tourLeft = 0;
    let startT: number | undefined = undefined;
    let startIo: IntersectionObserver | undefined = undefined;
    const STEP = 3200;
    root.style.setProperty("--zpb-emb-step", STEP + "ms");
    function stopTour() {
      clearInterval(tourTimer);
      tourTimer = undefined;
      touring = false;
      root.classList.remove("is-touring");
    }
    function tourNext() {
      const keys = PRESETS.map(function (p) {
        return p.key;
      });
      let i = keys.indexOf(state.preset);
      applyPreset(keys[(i + 1) % keys.length]);
      tourLeft--;
      if (tourLeft <= 0) {
        stopTour();
        if (startIo) startIo.disconnect();
      } else {
        root.classList.remove("is-touring");
        void root.offsetWidth;
        root.classList.add("is-touring");
      }
    }
    function startTour() {
      if (reduce || interacted) return;
      touring = true;
      toured = true;
      tourLeft = PRESETS.length;
      root.classList.add("is-touring");
      tourTimer = window.setInterval(tourNext, STEP);
    }
    function userAct() {
      interacted = true;
      clearTimeout(startT);
      if (startIo) startIo.disconnect();
      if (touring) stopTour();
    }
    root.addEventListener("pointerdown", userAct);
    root.addEventListener("keydown", function (ev) {
      if (ev.key !== "Tab" && ev.key !== "Shift") userAct();
    });

    if (presetSelect) {
      presetSelect.addEventListener("change", () => safe(() => {
        userAct();
        applyPreset(presetSelect.value);
      }));
      root.classList.add("has-preset-select");
    }
    presetBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        safe(function () {
          userAct();
          applyPreset(b.getAttribute("data-preset"));
        });
      });
    });
    if (colorIn) {
      const onColor = function () {
        safe(function () {
          var h = normHex(colorIn.value);
          if (h) customize({ brand: h });
        });
      };
      colorIn.addEventListener("input", onColor);
      colorIn.addEventListener("change", onColor);
    }
    swatches.forEach(function (s) {
      s.addEventListener("click", function () {
        safe(function () {
          let h = normHex(s.getAttribute("data-color"));
          if (h) customize({ brand: h });
        });
      });
    });
    if (fontSel)
      fontSel.addEventListener("change", function () {
        safe(function () {
          customize({ font: fontSel.value, fontAll: true }, true);
        });
      });
    cornerIns.forEach(function (i) {
      i.addEventListener("change", function () {
        safe(function () {
          if (i.checked) customize({ corners: i.value });
        });
      });
    });
    spaceIns.forEach(function (i) {
      i.addEventListener("change", function () {
        safe(function () {
          if (i.checked) customize({ spacing: i.value });
        });
      });
    });
    if (outline) {
      const onOutline = function () {
        root.classList.toggle("is-outlined", outline.checked);
      };
      outline.addEventListener("change", onOutline);
      onOutline();
    }
    if (resetBtn)
      resetBtn.addEventListener("click", function () {
        safe(function () {
          applyPreset(state.preset);
        });
      });

    /* tabs inside the embed */
    const tablist = qq(".zpb-emb-e-tabs");
    const tabs = tablist ? qqa('[role="tab"]', tablist) : [];
    function pickTab(t: HTMLElement, focus: boolean) {
      tabs.forEach(function (x) {
        const on = x === t;
        x.setAttribute("aria-selected", on ? "true" : "false");
        x.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(
          x.getAttribute("aria-controls") || "",
        );
        if (panel) panel.hidden = !on;
      });
      if (focus) t.focus();
      if (t.id === "zpb-emb-t-live" || t.id === "zpb-emb-t-citywide")
        gauge.start();
      else gauge.pause();
      if (
        t.scrollIntoView &&
        tablist &&
        tablist.scrollWidth > tablist.clientWidth
      ) {
        try {
          t.scrollIntoView({ block: "nearest", inline: "nearest" });
        } catch (e) {}
      }
    }
    if (tablist) {
      tablist.addEventListener("click", function (ev) {
        let t = eventElement(ev)?.closest<HTMLElement>('[role="tab"]');
        if (t) pickTab(t, false);
      });
      tablist.addEventListener("keydown", function (ev) {
        let i =
          document.activeElement instanceof HTMLElement
            ? tabs.indexOf(document.activeElement)
            : -1;
        if (i < 0) return;
        let n = null;
        const k = ev.key;
        if (k === "ArrowRight")
          n = tabs[(i + 1) % tabs.length];
        else if (k === "ArrowLeft")
          n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (k === "Home") n = tabs[0];
        else if (k === "End") n = tabs[tabs.length - 1];
        if (n) {
          ev.preventDefault();
          pickTab(n, true);
        }
      });
    }

    /* Community Voices slides inside the embed */
    const cv = qq("[data-zpb-emb-cv]");
    if (cv) {
      const slides = qqa(".zpb-emb-cv-slide", cv);
      let ci = 0;
      const counter = qq("[data-zpb-emb-cv-n]", cv);
      const go = function (n: number) {
        ci = (n + slides.length) % slides.length;
        slides.forEach(function (s, k) {
          s.hidden = k !== ci;
        });
        if (counter) counter.textContent = ci + 1 + " of " + slides.length;
      };
      const prev = qq("[data-zpb-emb-cv-prev]", cv);
      const next = qq("[data-zpb-emb-cv-next]", cv);
      if (prev)
        prev.addEventListener("click", function () {
          userAct();
          go(ci - 1);
        });
      if (next)
        next.addEventListener("click", function () {
          userAct();
          go(ci + 1);
        });
    }

    /* live data */
    function getJSON(url: string): Promise<unknown> {
      const ctl = "AbortController" in window ? new AbortController() : null;
      let t = ctl
        ? window.setTimeout(function () {
            ctl.abort();
          }, 9000)
        : undefined;
      return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) {
        clearTimeout(t);
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      });
    }
    function getText(url: string) {
      const ctl = "AbortController" in window ? new AbortController() : null;
      let t = ctl
        ? window.setTimeout(function () {
            ctl.abort();
          }, 9000)
        : undefined;
      return fetch(
        url,
        ctl ? { signal: ctl.signal, cache: "no-store" } : { cache: "no-store" },
      ).then(function (r) {
        clearTimeout(t);
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      });
    }
    const LIVE = '<span class="zpb-emb-live"><i></i>Live</span>';

    const evBox = qq("[data-zpb-emb-events]");
    const evSrc = qq("[data-zpb-emb-ev-src]");
    if (evBox && typeof fetch !== "undefined") {
      const CAL =
        "https://oberlin.communityhub.cloud/api/legacy/calendar/full?t=";
      const monthKey = function (y: number, m: number) {
        return Math.floor(new Date(y, m - 1, 3).getTime() / 1000);
      };
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth() + 1;
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
          const t0 = new Date();
          t0.setHours(0, 0, 0, 0);
          const nowS = Date.now() / 1000;
          const fromS = t0.getTime() / 1000;
          const seen: Record<string, number> = {};
          const list = (res[0].sessions || [])
            .concat(res[1].sessions || [])
            .filter(function (s) {
              return (
                s &&
                s.postName &&
                s.start >= fromS &&
                s.end >= nowS &&
                s.end - s.start < 86400 * 2
              );
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
            .slice(0, 6);
          if (!list.length) throw new Error("no events");
          const o = { timeZone: "America/New_York" };
          evBox.innerHTML = list
            .map(function (s) {
              const d = new Date(s.start * 1000);
              const mon = d.toLocaleDateString(
                "en-US",
                Object.assign<
                  Intl.DateTimeFormatOptions,
                  Intl.DateTimeFormatOptions
                >({ month: "short" }, o),
              );
              const day = d.toLocaleDateString(
                "en-US",
                Object.assign<
                  Intl.DateTimeFormatOptions,
                  Intl.DateTimeFormatOptions
                >({ day: "numeric" }, o),
              );
              const wd = d.toLocaleDateString(
                "en-US",
                Object.assign<
                  Intl.DateTimeFormatOptions,
                  Intl.DateTimeFormatOptions
                >({ weekday: "long" }, o),
              );
              return (
                '<li><a href="https://environmentaldashboard.org/calendar/post/' +
                encodeURIComponent(s.postId) +
                '" target="_blank" rel="noopener">' +
                '<span class="zpb-emb-date"><small>' +
                esc(mon) +
                "</small><b>" +
                esc(day) +
                "</b></span>" +
                '<span class="zpb-emb-what"><b>' +
                esc(s.postName) +
                "</b><small>" +
                esc(wd) +
                ", " +
                esc(clock(d)) +
                "</small></span>" +
                '<span class="zpb-emb-vh"> (opens in a new tab)</span></a></li>'
              );
            })
            .join("");
          if (evSrc)
            evSrc.innerHTML =
              LIVE +
              "<span>From Oberlin&rsquo;s community calendar, updated " +
              esc(clock(new Date())) +
              " Eastern.</span>";
        })
        .catch(function () {
          if (evSrc)
            evSrc.textContent =
              "The live calendar did not answer, so these are events captured on 23 Sep 2026.";
        });
    }

    const jobBox = qq("[data-zpb-emb-jobs]");
    const jobSrc = qq("[data-zpb-emb-jobs-src]");
    if (jobBox && typeof fetch !== "undefined") {
      const JOBS =
        "https://cleveland.communityhub.cloud/api/legacy/calendar/jobs/list";
      const KIND: Record<number, string> = {
        1: "Full-time",
        2: "Part-time",
        3: "Contract",
        4: "Temporary",
        5: "Volunteer",
        6: "Internship",
      };
      const BRIEF =
        jobBox.querySelector<HTMLElement>(".zpb-emb-job-ic")?.innerHTML || "";
      getJSON(JOBS)
        .then(jobsData)
        .then(function (d) {
          const last = Math.max(
            0,
            Math.ceil((d.count || 0) / (d.limit || 10)) - 1,
          );
          if (last === 0) return d.posts || [];
          return Promise.all([
            getJSON(JOBS + "?page=" + last).then(jobsData),
            getJSON(JOBS + "?page=" + (last - 1))
              .then(jobsData)
              .catch(function () {
                return { posts: [] };
              }),
          ]).then(function (r) {
            return (r[0].posts || []).concat(r[1].posts || []);
          });
        })
        .then(function (posts) {
          const per: Record<string, number> = {};
          const pick: DisplayJob[] = [];
          posts
            .filter(function (p) {
              return (
                p &&
                p.name &&
                p.approved !== false &&
                p.public !== false &&
                !p.isAnnouncement
              );
            })
            .sort(function (a, b) {
              return (b.createdAt || 0) - (a.createdAt || 0);
            })
            .forEach(function (p) {
              if (pick.length >= 4) return;
              const org = (p.sponsors || [])
                .map(function (s) {
                  return s && s.name ? String(s.name).trim() : "";
                })
                .filter(function (n) {
                  return n && !/^adding sponsor$/i.test(n);
                })[0];
              if (!org) return;
              per[org] = (per[org] || 0) + 1;
              if (per[org] > 2) return;
              pick.push({
                name: String(p.name).trim(),
                org: org,
                kind: KIND[p.employmentType] || "",
                at: p.createdAt,
              });
            });
          if (pick.length < 2) throw new Error("too few jobs");
          jobBox.innerHTML = pick
            .map(function (j) {
              const posted = j.at
                ? new Date(j.at * 1000).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    timeZone: "America/New_York",
                  })
                : "";
              return (
                '<li><span class="zpb-emb-job-ic">' +
                BRIEF +
                '</span><span class="zpb-emb-what"><b>' +
                esc(j.name) +
                "</b><small>" +
                esc(j.org) +
                "</small></span>" +
                '<span class="zpb-emb-job-meta">' +
                (j.kind
                  ? '<span class="zpb-emb-chip">' + esc(j.kind) + "</span>"
                  : "") +
                (posted ? "<small>Posted " + esc(posted) + "</small>" : "") +
                "</span></li>"
              );
            })
            .join("");
          if (jobSrc)
            jobSrc.innerHTML =
              LIVE +
              "<span>Latest posts on MidTown Cleveland&rsquo;s jobs board, checked " +
              esc(clock(new Date())) +
              " Eastern.</span>";
        })
        .catch(function () {
          if (jobSrc)
            jobSrc.textContent =
              "The jobs board did not answer, so these are posts captured on 23 Sep 2026.";
        });
    }

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
    function parseGauge(svg: string): EmbeddedGauge {
      const texts = [];
      let mm;
      const re = /<text([^>]*)>([\s\S]*?)<\/text>/g;
      while ((mm = re.exec(svg))) {
        const tx = mm[2]
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .trim();
        if (tx && !/^\d$/.test(tx)) texts.push(tx);
      }
      const parts: [number, string][] = [];
      const r2 = /translate\(([-0-9.]+),\s*0\)">\s*<g class='(\w+)'/g;
      while ((mm = r2.exec(svg)))
        parts.push([parseFloat(mm[1]), DIGITS[mm[2]] || ""]);
      const r3 = /<text[^>]*\bx=["']([-0-9.]+)["'][^>]*>\s*([,.])\s*<\/text>/g;
      while ((mm = r3.exec(svg))) parts.push([parseFloat(mm[1]), mm[2]]);
      parts.sort(function (a, b) {
        return a[0] - b[0];
      });
      const value = parts
        .map(function (p) {
          return p[1];
        })
        .join("");
      const words = texts.filter(function (t) {
        return t !== "," && t !== "." && t !== "LOW" && t !== "HIGH";
      });
      const cx = (svg.match(/<circle cx="([-0-9.]+)%"/) || [])[1];
      return {
        title: words[0] || "",
        unit: words[1] || "",
        value: value,
        pos: cx != null ? Math.max(0, Math.min(1, parseFloat(cx) / 70)) : 0.5,
      };
    }
    function where(pos: number) {
      return pos < 0.2
        ? "near the low end"
        : pos < 0.4
          ? "below the middle"
          : pos < 0.6
            ? "in the middle"
            : pos < 0.8
              ? "above the middle"
              : "near the high end";
    }
    const gauge = (function () {
      var box = qq("[data-zpb-emb-gauge]"),
        timer: number | undefined = undefined,
        visible = false,
        active = false,
        got = false;
      var GAUGE =
        "https://oberlin.communityhub.cloud/fe/api/data-hub-v2/visualizations/gauges/1021";
      function render(g: EmbeddedGauge) {
        var pos = Math.max(0, Math.min(1, g.pos));
        var fill = qq<SVGPathElement>("[data-zpb-emb-g-fill]"),
          knob = qq("[data-zpb-emb-g-knob]");
        if (fill)
          fill.style.strokeDashoffset = String(100 - Math.max(pos * 100, 1.5));
        if (knob) {
          var a = Math.PI * pos;
          knob.setAttribute("cx", (110 - 90 * Math.cos(a)).toFixed(1));
          knob.setAttribute("cy", (114 - 90 * Math.sin(a)).toFixed(1));
        }
        var fl = qq<HTMLImageElement>("[data-zpb-emb-flash]");
        if (fl) {
          var mood = pos < 0.4 ? "happy" : pos < 0.7 ? "neutral" : "angry";
          var want = "assets/mascot-" + mood + "-clean.gif";
          if (fl.getAttribute("src") !== want) fl.setAttribute("src", want);
          fl.alt =
            "Flash the squirrel looks " +
            (mood === "angry" ? "upset" : mood) +
            " about the city’s electricity use right now";
        }
        setText("[data-zpb-emb-g-val]", g.value);
        setText("[data-zpb-emb-g-unit]", g.unit);
        setText("[data-zpb-emb-g-title]", g.title);
        if (box)
          box.setAttribute(
            "aria-label",
            g.title +
              ": " +
              g.value +
              " " +
              g.unit +
              ", " +
              where(pos) +
              " of its usual range",
          );
      }
      function load() {
        if (!window.fetch || !box) return;
        getText(GAUGE)
          .then(parseGauge)
          .then(function (g) {
            if (!g.value || !/\d/.test(g.value)) throw new Error("no value");
            got = true;
            render(g);
            var src = qq("[data-zpb-emb-g-src]");
            if (src)
              src.innerHTML =
                LIVE +
                "<span>From Oberlin&rsquo;s gauge feed, updated " +
                esc(clock(new Date())) +
                " Eastern.</span>";
          })
          .catch(function () {
            if (!got) {
              setText(
                "[data-zpb-emb-g-src]",
                "The gauge feed did not answer, so this is a reading captured on 23 Sep 2026.",
              );
            }
          });
      }
      function tick() {
        if (active && visible && !document.hidden) load();
      }
      function start() {
        active = true;
        if (!timer) {
          timer = window.setInterval(tick, 60000);
        }
      }
      function pause() {
        active = false;
      }
      render({
        title: qq("[data-zpb-emb-g-title]")?.textContent || "",
        value: qq("[data-zpb-emb-g-val]")?.textContent || "",
        unit: qq("[data-zpb-emb-g-unit]")?.textContent || "",
        pos: 0.03,
      });
      load();
      if ("IntersectionObserver" in window)
        new IntersectionObserver(
          function (es) {
            es.forEach(function (en) {
              visible = en.isIntersecting;
            });
          },
          { threshold: 0.1 },
        ).observe(root);
      else visible = true;
      return { start: start, pause: pause };
    })();

    applyPreset(state.preset, true);
    if (!reduce && "IntersectionObserver" in window) {
      startIo = new IntersectionObserver(
        function (es) {
          es.forEach(function (en) {
            if (en.isIntersecting) {
              if (!toured && !touring && !interacted) {
                clearTimeout(startT);
                startT = window.setTimeout(function () {
                  if (!interacted && !toured && !touring) startTour();
                }, 900);
              }
            } else {
              // Scene left: cancel a pending start, and rewind a running tour so it replays on return.
              clearTimeout(startT);
              if (touring) {
                stopTour();
                toured = false;
              }
            }
          });
        },
        { threshold: 0.45 },
      );
      startIo.observe(site);
    }
  });
})();

// Partner frame: "Try again" reloads the selected partner page (a tab click reloads it).
document.addEventListener("click", function (ev) {
  const btn = (ev.target as Element | null)?.closest?.(".lf-retry");
  if (!btn) return;
  const root = btn.closest(".zpb-sec-body");
  const tab = root?.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]');
  tab?.click();
});
