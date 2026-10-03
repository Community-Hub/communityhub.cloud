import type { StoryFrame, StoryTouch } from "./types";
import { WheelGesture } from "./ui/wheel-gesture";
import { productBoundary, productHasMore } from "./ui/product-navigation";
import { mayAutoAdvanceHero } from "./ui/hero-policy";
import { freshDocumentUrl } from "./ui/fresh-document-url";
import { required, eventElement, htmlChildren } from "./dom";
/* v6 home: problem line over the drone zoom, connection diagram, scaled live embeds */
(function () {
  const v = document.querySelector<HTMLVideoElement>("[data-hv-vid]");
  const p = document.querySelector<HTMLElement>(".hv-copy");
  if (v && p) {
    const hv = required(v.closest<HTMLElement>(".hv"));
    const stills = Array.from(
      document.querySelectorAll<HTMLElement>("[data-hv-stills] i"),
    );
    let si = 0;
    let rot: number | undefined = undefined;
    let wait: number | undefined = undefined;
    let away = false;
    const copy = function () {
      p.classList.add("on");
    };
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* The video is a scene of its own: it fills the first screen while playing and after it ends. */
    hv.classList.add("full");
    /* Reduced motion: no autoplaying video and no rotating stills; the poster frame and copy show at once. */
    if (still) {
      v.removeAttribute("autoplay");
      v.pause();
      copy();
    }
    /* Skip, Explore and the first downward gesture share the held-film arrival. */
    const bar = hv.querySelector<HTMLElement>("[data-hv-prog]");
    v.addEventListener("timeupdate", function () {
      if (bar && v.duration) bar.style.transform = "scaleX(" + (v.currentTime / v.duration).toFixed(3) + ")";
    });
    const finishAtPeople = function () {
      hv.classList.add("done", "live", "intro-peek");
      mainIntro?.classList.add("has-intro-peek");
      const people = hv.querySelector<HTMLElement>("#people");
      if (people) people.hidden = false;
      v.pause();
      const seekFinal = () => {
        if (Number.isFinite(v.duration) && v.duration > 0) v.currentTime = Math.max(0, v.duration - .05);
      };
      if (v.readyState >= 1) seekFinal();
      else v.addEventListener("loadedmetadata", seekFinal, { once: true });
      copy();
      rotate(false);
      window.dispatchEvent(new CustomEvent("ch:fit", { detail: {} }));
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    const mainIntro = hv.closest("main");
    hv.querySelector<HTMLElement>("[data-hv-skip]")?.addEventListener("click", finishAtPeople);
    window.addEventListener("ch:hero-peek", finishAtPeople);
    /* stills rotate (slow zoom) whenever the video is not actually moving: loading, stalled, blocked autoplay, error */
    const rotate = function (on: boolean) {
      if (on && !rot && stills.length > 1 && !still && !away)
        rot = window.setInterval(function () {
          stills[si].classList.remove("on");
          si = (si + 1) % stills.length;
          stills[si].classList.add("on");
        }, 6000);
      if (!on && rot) {
        clearInterval(rot);
        rot = undefined;
      }
    };
    const live = function (on: boolean) {
      clearTimeout(wait);
      hv.classList.toggle("live", on);
      rotate(!on);
    };
    rotate(true);
    v.addEventListener("timeupdate", function () {
      if (v.currentTime > 0.1 && !v.paused && !hv.classList.contains("live"))
        live(true);
      if (v.currentTime >= 6) copy();
    });
    ["waiting", "stalled"].forEach(function (ev) {
      v.addEventListener(ev, function () {
        if (hv.classList.contains("done") || v.currentTime > .1) return;
        clearTimeout(wait);
        wait = window.setTimeout(function () {
          live(false);
        }, 1500);
      });
    });
    v.addEventListener(
      "error",
      function () {
        live(false);
        copy();
      },
      true,
    );
    v.addEventListener("pause", function () {
      if (!v.ended && !hv.classList.contains("done")) live(false);
    });
    /* Once the visitor moves past the opening scene the video pauses where it is, and it picks up again on return. */
    new IntersectionObserver(function (entries) {
      away = !entries[entries.length - 1].isIntersecting;
      if (away) {
        v.pause();
        rotate(false);
      } else if (!hv.classList.contains("done")) tryPlay();
    }, { threshold: 0.35 }).observe(hv);
    const tryPlay = function () {
      if (v.ended || still || away || hv.classList.contains("done")) return;
      var r = v.play && v.play();
      if (r && r.catch)
        r.catch(function () {
          live(false);
          copy();
        });
    };
    tryPlay();
    /* autoplay blocked (low power mode, data saver): start on the first touch or scroll, and when the tab comes back */
    ["touchstart", "pointerdown", "scroll", "keydown"].forEach(function (ev) {
      window.addEventListener(
        ev,
        function once() {
          if (v.paused) tryPlay();
          window.removeEventListener(ev, once);
        },
        { passive: true },
      );
    });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && v.paused) tryPlay();
    });
    window.setTimeout(function () {
      if (!hv.classList.contains("live")) copy();
    }, 3000);
    /* Play forward once, hold briefly, then reveal the people below the final frame.
       The film and people remain one semantic opening section. */
    const btn = hv.querySelector<HTMLElement>("[data-hv-next]");
    if (btn) btn.addEventListener("click", function (e) { e.preventDefault(); finishAtPeople(); });
    if (location.hash === "#people") queueMicrotask(finishAtPeople);
    window.addEventListener("hashchange", () => { if (location.hash === "#people") finishAtPeople(); });
    v.addEventListener("ended", function () {
      copy();
      hv.classList.add("done");
      hv.querySelector("[data-hv-skip]")?.setAttribute("aria-label", "Next section");
      let y = window.scrollY;
      window.setTimeout(function () {
        if (
          mayAutoAdvanceHero({ hidden:document.hidden, away, scrollY:window.scrollY, scheduledY:y, top:hv.getBoundingClientRect().top })
        )
          finishAtPeople();
      }, 3000);
    });
  }

  document.querySelectorAll<HTMLElement>("[data-conn]").forEach(function (c) {
    if (c.closest("[data-communication-sequence]")) return;
    const btns = c.querySelectorAll<HTMLElement>("[data-step]");
    const cap = c.querySelector<HTMLElement>(".conn-cap");
    let timer: number | undefined = undefined;
    const set = function (n: number) {
      c.setAttribute("data-stage", String(n));
      btns.forEach(function (b) {
        var on = Number(b.getAttribute("data-step")) === n;
        b.setAttribute("aria-pressed", String(on));
        if (on && cap) cap.textContent = b.getAttribute("data-cap");
      });
    };
    const stop = function () {
      clearInterval(timer);
      timer = undefined;
    };
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        stop();
        set(Number(b.getAttribute("data-step")));
      });
    });
    set(3);
    if (
      !document.documentElement.classList.contains("motion") ||
      !("IntersectionObserver" in window)
    )
      return;
    set(1);
    // Loops Apart, Hub, Web while in view; the web holds twice as long. A click on a step stops it.
    let n = 1;
    let held = false;
    const tick = function () {
      if (held && n === 3) {
        held = false;
        return;
      }
      n = (n % 3) + 1;
      held = n === 3;
      set(n);
    };
    const io = new IntersectionObserver(
      function (es) {
        es.forEach(function (x) {
          if (x.isIntersecting && !timer && !c.hasAttribute("data-conn-held"))
            timer = window.setInterval(tick, 2400);
          else if (!x.isIntersecting) stop();
        });
      },
      { threshold: 0.45 },
    );
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        c.setAttribute("data-conn-held", "");
      });
    });
    io.observe(c);
  });

  /* pop out when the section arrives, tuck back when it leaves, and every few seconds while it is in view */
  document.querySelectorAll<HTMLElement>("[data-roll]").forEach(function (c) {
    if (c.closest("[data-communication-sequence]")) return;
    if (!("IntersectionObserver" in window)) {
      c.classList.add("on");
      return;
    }
    let loop: number | undefined = undefined;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    function stop() {
      clearInterval(loop);
      loop = undefined;
      c.classList.remove("tuck");
    }
    function start() {
      if (loop || calm.matches) return;
      loop = window.setInterval(function () {
        if (document.hidden) return;
        c.classList.add("tuck");
        window.setTimeout(function () {
          c.classList.remove("tuck");
        }, 1100);
      }, 6500);
    }
    new IntersectionObserver(
      function (es) {
        es.forEach(function (x) {
          if (x.isIntersecting) {
            c.classList.add("on");
            start();
          } else {
            c.classList.remove("on");
            stop();
          }
        });
      },
      { threshold: 0.35 },
    ).observe(c);
  });

  // Task 5: today's date above the live event scrolls.
  document.querySelectorAll<HTMLElement>("[data-today]").forEach(function (p) {
    p.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "America/New_York",
    });
  });
  // Each event list scrolls slowly on a loop once it loads. Hover or focus pauses it;
  // reduced motion leaves a plain list you scroll yourself.
  document
    .querySelectorAll<HTMLElement>("[data-ticker]")
    .forEach(function (box) {
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
      const go = function () {
        var ul = box.querySelector<HTMLElement>(".events-list");
        if (
          !ul ||
          box.classList.contains("run") ||
          calm.matches ||
          ul.children.length < 4
        )
          return;
        var copy = ul.cloneNode(true);
        if (!(copy instanceof HTMLElement)) return;
        copy.setAttribute("aria-hidden", "true");
        copy.querySelectorAll("a").forEach(function (a) {
          a.tabIndex = -1;
        });
        ul.after(copy);
        box.style.setProperty("--t", ul.children.length * 3.5 + "s");
        box.classList.add("run");
      };
      new MutationObserver(go).observe(box, { childList: true, subtree: true });
      go();
    });

  const minis = document.querySelectorAll<HTMLElement>("[data-mini]");
  const fit = function (m: HTMLElement) {
    var f = m.querySelector("iframe");
    if (f)
      m.style.setProperty(
        "--s",
        String(
          m.clientWidth /
            (Number(m.getAttribute("data-w")) ||
              Number(f.getAttribute("width")) ||
              1280),
        ),
      );
  };
  minis.forEach(fit);
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(function (es) {
      es.forEach(function (x) {
        if (x.target instanceof HTMLElement) fit(x.target);
      });
    });
    minis.forEach(function (m) {
      ro.observe(m);
    });
  } else
    window.addEventListener("resize", function () {
      minis.forEach(fit);
    });

  /* Phone controller demo: a channel tap swaps the sign beside it. */
  document.querySelectorAll<HTMLElement>("[data-remote]").forEach(function (r) {
    const sign = r.querySelector<HTMLElement>(".remote-sign .mini");
    const frame = sign && sign.querySelector("iframe");
    const cap = r.querySelector<HTMLElement>(".remote-sign .mini-cap");
    if (!sign || !frame || !cap) return;
    r.querySelectorAll<HTMLButtonElement>("[data-remote-ch]").forEach(function (b, _, all) {
      b.addEventListener("click", function () {
        if (b.getAttribute("aria-pressed") === "true") return;
        all.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        const url = b.dataset.url || "";
        sign.style.backgroundImage = "url(" + b.dataset.shot + ")";
        frame.src = freshDocumentUrl(url);
        cap.innerHTML = "";
        cap.append("Live: " + (b.dataset.cap || "") + ". ");
        const a = document.createElement("a");
        a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = "Open full size";
        cap.append(a);
      });
    });
  });
})();

/* All vertical gestures share the same section stops. Horizontal content rails
   retain native scrolling; oversized sections keep stops inside their own content. */
(function () {
  const mainNode = document.getElementById("main");
  if (!mainNode) return;
  const main = mainNode;
  /* The homepage (.hv) and every inner page marked data-pager share the section stops.
     Inner pages count every block under main except the sticky jump bar. */
  const home = main && main.querySelector<HTMLElement>(":scope > .hv");
  if (!main || !(home || main.hasAttribute("data-pager"))) return;
  const jump = home
    ? null
    : main.querySelector<HTMLElement>(
        ":scope > [data-zpa-jump], :scope > [data-zpb-jump], :scope > [data-ppl-jump]",
      );
  const secs = Array.from(
    main.querySelectorAll<HTMLElement>(
      home ? ":scope > section" : ":scope > *",
    ),
  ).filter(function (el) {
    // A title-only page intro is not a screen of its own: it rides on top of the
    // first section, so a visitor never lands on a page that is just a heading.
    if (!home && el.matches(".page-intro") && el.nextElementSibling) return false;
    return el !== jump && !el.matches("script, style, template, [hidden]");
  });
  const ban = document.querySelector<HTMLElement>(".aashe");
  const root = document.documentElement;
  const header = document.getElementById("hdr");
  const foot = document.querySelector<HTMLElement>(".foot");
  const menu = document.getElementById("mnav");
  let stops: StoryFrame[] = [];
  let dirty = true;
  let layoutFrame = 0;
  let publicRequest: { direction: number; y: number; until: number } | null = null;
  let headerHeight = 0;
  let baseHeaderHeight = 0;
  let bannerHeight = -1;
  let activeFrame: StoryFrame | null = null;
  let activePaint = 0;
  let fitAnchor: StoryFrame | null = null;
  secs.concat(foot ? [foot] : []).forEach(function (el) {
    el.classList.add("ch-story-section");
  });
  // A lazy image that has not loaded has no height until the story nears it, so
  // its scene would appear (and shift every later stop) only after the first cut.
  main.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach(function (img) {
    if (!img.complete || !img.offsetHeight) img.loading = "eager";
  });
  let touch: StoryTouch | null = null;
  const wheelGesture = new WheelGesture();
  const frameWheelGesture = new WheelGesture();
  let frameScroll: { y: number; at: number } | null = null;
  let frameScrollBypassUntil = 0;
  let allowFrameFocus = true;
  let guardUntil = 0;
  // Fields that use the arrow, page and wheel keys themselves. A horizontal tablist,
  // button, link or slider arrow does not: page keys keep cutting scenes from there.
  const controls =
    'input:not([type="checkbox"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="file"]):not([type="image"]), textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="spinbutton"], [role="listbox"], [role="combobox"], [role="menu"], [role="textbox"], [role="radiogroup"], [role="tree"], [role="grid"]';
  // Boxes that consume the wheel or a drag on their own. Any other scrolling box
  // hands the gesture to the page, so one deliberate notch moves one scene.
  const owners = '[data-scroll-owner], textarea, select, [role="listbox"], [role="combobox"], [role="menu"], [role="tree"], [role="grid"]';
  // Keys that activate the focused control and so never cut scenes.
  const activators = 'button, a[href], summary, [role="tab"], [role="button"], [role="switch"], [role="tablist"], input';
  const initialHash = location.hash;
  const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  let initialHashPending = !!initialHash &&
    (!navigationEntry || navigationEntry.type !== "back_forward");
  if (initialHashPending) {
    // Startup may finish after input. A direct link must never reclaim a newer
    // gesture, history restoration, or an explicitly chosen destination.
    ["pointerdown", "wheel", "touchstart", "keydown", "hashchange", "popstate"].forEach(function (event) {
      window.addEventListener(event, function () {
        if (event !== "hashchange" || location.hash !== initialHash) initialHashPending = false;
      },
        { capture: true, passive: true, once: true });
    });
  }

  function cancel() {
    publicRequest = null;
  }
  function resetGesture() { wheelGesture.reset(); }
  function syncChrome() {
    const base = header ? header.offsetHeight : 0;
    const h = base;
    const b = ban ? ban.offsetHeight : 0;
    if (base !== baseHeaderHeight) {
      baseHeaderHeight = base;
      root.style.setProperty("--story-base-hdr-h", base + "px");
    }
    if (h !== headerHeight) {
      headerHeight = h;
      root.style.setProperty("--story-hdr-h", h + "px");
    }
    if (b !== bannerHeight) {
      bannerHeight = b;
      root.style.setProperty("--ban-h", b + "px");
    }
    root.classList.toggle("ch-story-banner", b > 0);
  }
  /* Offset positions ignore the transforms used by the existing reveal effects. */
  function absTop(el: HTMLElement | null) {
    let y = 0;
    for (
      ;
      el;
      el = el.offsetParent instanceof HTMLElement ? el.offsetParent : null
    )
      y += el.offsetTop;
    return y;
  }
  function current(): StoryFrame | null {
    let y = window.scrollY;
    let best: StoryFrame | null = null;
    stops.forEach(function (f) {
      if (!best || Math.abs(f.y - y) < Math.abs(best.y - y)) best = f;
    });
    return best;
  }
  function publish() {
    activePaint = 0;
    const f = current();
    if (!f || activeFrame === f) return;
    activeFrame = f;
    if (main.hasAttribute("data-pager")) {
      // Short final groups must keep their owner's surface below the content,
      // without adding padding, scroll distance, or another reading stop.
      const surface = getComputedStyle(f.els[0]);
      if (surface.backgroundImage !== "none" || surface.backgroundColor !== "rgba(0, 0, 0, 0)")
        main.style.setProperty("--story-owner-background", surface.background);
      else main.style.removeProperty("--story-owner-background");
    }
    let hiddenFocus = false;
    for (const scene of main.querySelectorAll<HTMLElement>(".ch-authored-scene")) {
      const on = scene === f.scene;
      if (!on && scene.contains(document.activeElement)) hiddenFocus = true;
      scene.inert = !on;
      scene.classList.toggle("is-scene-in", on);
    }
    window.dispatchEvent(
      new CustomEvent("ch:storychange", {
        detail: { els: f.els, moving: false },
      }),
    );
    if (hiddenFocus) {
      const target = f.scene || f.els[0];
      if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }
  function frameForElement(element: HTMLElement, frames: StoryFrame[]) {
    const candidates = frames.filter(frame => frame.els.some(section => section.contains(element)));
    const authored = candidates.filter(frame => frame.scene &&
      (frame.scene === element || frame.scene.contains(element)));
    const y = absTop(element) - headerHeight;
    const choices = authored.length ? authored : candidates;
    const destination = choices.filter(frame => frame.y <= y + 3).at(-1) || choices[0];
    if (destination) destination.anchor = element;
    return destination;
  }
  // A direct-link intent also owns startup remeasurement. Late fitting must not
  // restore the first section before a slow embedded document finishes loading.
  function initialHashFrame(fs: StoryFrame[]): StoryFrame | null {
    if (!initialHashPending || location.hash !== initialHash) return null;
    let id = initialHash.slice(1);
    try { id = decodeURIComponent(id); } catch (err) {}
    const element = document.getElementById(id);
    if (!element || !main.contains(element)) return null;
    if (element.closest("[data-dashboard-panel]"))
      return fs.find(frame => frame.els.some(section => section.contains(element))) || null;
    return frameForElement(element, fs) || null;
  }
  /* Further stops inside a block taller than the screen. The last stop shows
     the end of the block's content (not its bottom padding), the stops are
     spaced evenly so no gesture moves a few pixels, and each one snaps to the top
     of a nearby heading, paragraph, card or figure so no stop bisects text. */
  const NEXT_ROOM = 60; // px the floating next control keeps free at the screen bottom
  const UNITS = "h2,h3,h4,p,li,figure,blockquote,details,article,table,img,iframe,video,.card,[class*=card]";
  // A section that overflows its screen by less than a quarter screen starts at
  // its first line of content instead of its top padding, so it needs no tail stop.
  function lead(owner: HTMLElement, start: number, room: number, inset: number, from: HTMLElement = owner) {
    if (owner.closest("[data-stable-start]")) return start;
    // `from` supplies the first line of content: a section's own heading sits before its
    // first scene, and shifting the stop past it would tuck that heading under the header.
    const first = Array.from(from.querySelectorAll<HTMLElement>(UNITS))
      .find(el => el.getClientRects().length && el.offsetHeight > 0 && !/absolute|fixed/.test(getComputedStyle(el).position));
    if (!first) return start;
    const over = absTop(owner) + owner.offsetHeight - window.innerHeight - start;
    const top = Math.round(absTop(first) - inset - 16);
    return over > 0 && over < room * 0.25 && top > start ? Math.min(top, start + over) : start;
  }
  // A block heading, figure or card top is a meaningful place to begin a further stop.
  const BLOCKS = "h2,h3,h4,figure,article,details,table,blockquote,.card,[class*=card],[class*=group]";
  function splitAt(owner: HTMLElement, start: number, end: number, room: number, inset: number) {
    const ys: number[] = [];
    // Prefer substantial reading steps. A real final content tail is retained
    // below, even when short; padding and sticky tracks need no tiny stop.
    const gap = Math.round(window.innerHeight * 0.25);
    const spaced = function (list: number[]) {
      const kept: number[] = [];
      let prior = start;
      list.forEach(function (y) {
        if (y - prior >= gap) kept.push(prior = y);
      });
      return kept;
    };
    const units = Array.from(owner.querySelectorAll<HTMLElement>(UNITS + ",a,button,svg,canvas,picture"))
      .filter(el => el.getClientRects().length && el.offsetHeight > 0 &&
        !/absolute|fixed/.test(getComputedStyle(el).position));
    const bottom = units.reduce((max, el) => Math.max(max, absTop(el) + el.offsetHeight), 0);
    // A sticky stage is much taller than its content on purpose: its height is the scroll
    // track, and its panel script expects even steps along it.
    const stage = owner.querySelector<HTMLElement>(".eng-stage");
    if ((stage && getComputedStyle(stage).position === "sticky") || absTop(owner) + owner.offsetHeight - bottom > room * 0.5) {
      const count = end - start > 16 ? Math.ceil((end - start) / Math.max(1, room - 64)) : 0;
      for (let n = 1; n <= count; n++) ys.push(start + (end - start) * n / count);
      return spaced(ys);
    }
    // Content that already fits, or overflows by a few pixels of padding, needs no further stop.
    // It still needs a short tail stop when part of it would sit under the next control.
    const zone = start + window.innerHeight - NEXT_ROOM + 4;
    const centre = window.innerWidth / 2;
    const covered = bottom > zone && units.some(el => {
      const r = el.getBoundingClientRect();
      return absTop(el) + el.offsetHeight > zone && r.left < centre + 24 && r.right > centre - 24;
    });
    if (bottom && bottom <= start + window.innerHeight + 8 && !covered) return ys;
    // The owner's own bottom is the furthest any stop may reach, so the next section
    // never shares the screen with a tail.
    const limit = end;
    // 60px: the down control keeps the screen bottom free of the last lines of a long scene.
    if (bottom) end = Math.max(start, Math.min(end, Math.round(bottom + 24 + 60 - window.innerHeight)));
    if (end - start <= 16) return ys;
    const step = Math.max(1, room - 64);
    const count = Math.ceil((end - start) / step);
    const topOf = (el: HTMLElement) => Math.round(absTop(el) - inset - 12);
    const tops = units.filter(el => el.matches(UNITS)).map(topOf).sort((x, y) => x - y);
    const blocks = units.filter(el => el.matches(BLOCKS)).map(topOf).sort((x, y) => x - y);
    let prev = start;
    for (let n = 1; n < count; n++) {
      const ideal = start + (end - start) * n / count;
      // The nearest block top that neither skips content nor leaves too short a step.
      const near = tops.filter(t => t > prev + room * 0.3 && t <= prev + step && Math.abs(t - ideal) <= room * 0.25)
        .sort((x, y) => Math.abs(x - ideal) - Math.abs(y - ideal))[0];
      prev = near ?? ideal;
      ys.push(prev);
    }
    // Snapping early must never leave a last step longer than one screen.
    while (end - prev > step) ys.push(prev += step);
    // The last stop begins at a block boundary at or just below the bottom-aligned
    // position, so the visitor meets a heading, figure or card rather than the middle
    // of one. It still shows everything to the end and never reaches the next section.
    const reach = Math.min(limit, prev + step);
    const last = [blocks, tops].map(list => list.find(t => t >= end && t <= reach)).find(t => t != null);
    ys.push(last ?? end);
    const kept = spaced(ys);
    // The checks above have established that real content extends below the
    // viewport. Never lose its final links/lines merely because that tail is
    // shorter than the preferred gesture distance.
    const tail = ys.at(-1);
    if (tail != null && tail > start + 16 && kept.at(-1) !== tail) kept.push(tail);
    return kept;
  }
  function measure() {
    const max = Math.max(0, root.scrollHeight - window.innerHeight);
    const list: StoryFrame[] = [];
    let resting = fitAnchor || current();
    if (!fitAnchor && resting && Math.abs(resting.y - window.scrollY) > 1)
      resting = null;
    fitAnchor = null;
    function add(y: number, el: HTMLElement, part: number, scene?: HTMLElement, scenePart = 0) {
      y = Math.max(0, Math.min(max, Math.round(y)));
      if (!list.length || y > list[list.length - 1].y + 2)
        list.push({ y: y, els: [el], part: part, scene, scenePart, anchor: scene });
    }
    // A block that begins within a quarter screen of the previous stop (a
    // breadcrumb strip, a short divider) shares that stop: one gesture never
    // moves a few dozen pixels, and the short block is not hidden under the header.
    function join(start: number, el: HTMLElement, room: number) {
      const last = list[list.length - 1];
      if (!last || start <= last.y || start - last.y >= room * 0.25) return start;
      if (!last.els.includes(el)) last.els.push(el);
      return last.y;
    }
    // Every frame belongs to one visible semantic block. Hidden UI and packed
    // neighbours must never create empty stops or inherit another block's owner.
    const sections = (foot ? secs.concat([foot]) : secs).filter(function (s) {
      return (
        s.getClientRects().length &&
        s.offsetHeight > 0 &&
        getComputedStyle(s).display !== "none"
      );
    });
    sections.forEach(function (s, i) {
      const inset = s === foot ? baseHeaderHeight : headerHeight;
      const room = Math.max(1, window.innerHeight - inset);
      // A long explanation can author its phone sequence around complete
      // content blocks, so the next stop never bisects the connection diagram.
      const shortPhone = innerWidth <= 699 && innerHeight <= 740;
      const sceneSelector = innerWidth <= 900
        ? '[data-story-scene]:not([data-story-scene="desktop"])' + (shortPhone ? '' : ':not([data-story-scene="short-phone"])')
        : '[data-story-scene="all"],[data-story-scene="desktop"]';
      const scenes = Array.from(s.querySelectorAll<HTMLElement>(sceneSelector)).filter(scene =>
        scene.getClientRects().length > 0 && scene.offsetHeight > 0 && !scene.hidden &&
        !scene.parentElement?.closest(sceneSelector)
      );
      for (const scene of s.querySelectorAll<HTMLElement>("[data-story-scene]")) {
        scene.classList.toggle("ch-authored-scene", scenes.includes(scene));
        if (!scenes.includes(scene)) {
          scene.classList.remove("is-scene-in");
          scene.inert = false;
        }
      }
      if (scenes.length) {
        let part = 0;
        scenes.forEach((scene, sceneIndex) => {
          const start = sceneIndex === 0 ? join(i === 0 ? 0 : lead(scene, absTop(s) - inset, room, inset, s), s, room) : lead(scene, absTop(scene) - inset, room, inset);
          /* The next control floats over the screen bottom, so a scene's last stop clears it:
             the final scene by the section's own padding, earlier ones by the reserve (the
             following scenes are hidden meanwhile, so nothing else shows beneath). */
          const sceneBottom = absTop(scene) + scene.offsetHeight;
          const last = sceneIndex === scenes.length - 1;
          const reach = last ? Math.min(sceneBottom + NEXT_ROOM, absTop(s) + s.offsetHeight) : sceneBottom + NEXT_ROOM;
          const end = Math.max(start, reach - window.innerHeight);
          add(start, s, part++, scene);
          splitAt(scene, start, end, room, inset).forEach((y, n) => add(y, s, part++, scene, n + 1));
        });
        return;
      }
      const start = join(i === 0 ? 0 : lead(s, absTop(s) - inset, room, inset), s, room);
      const end = Math.max(
        start,
        absTop(s) + s.offsetHeight - window.innerHeight,
      );
      add(start, s, 0);
      splitAt(s, start, end, room, inset).forEach((y, n) => add(y, s, n + 1));
    });
    stops = list;
    dirty = false;
    function relocated(frame: StoryFrame | null | false) {
      if (!frame) return null;
      const matches = list.filter(function (f) {
        return f.els[0] === frame.els[0];
      });
      // A taller viewport may combine authored scenes into one section frame.
      // Keep its focused tool as the anchor when the scenes separate again.
      const focus = document.activeElement instanceof HTMLElement &&
        frame.els.some(owner => owner.contains(document.activeElement)) ? document.activeElement : null;
      const anchor = focus || frame.anchor || frame.scene;
      if (anchor) {
        const owner = frame.els[0];
        const panel = anchor.closest<HTMLElement>("[data-eng-panel]") ||
          frame.anchor?.closest<HTMLElement>("[data-eng-panel]");
        const stage = owner.querySelector<HTMLElement>(".eng-stage");
        // The stage remains sticky in some narrow styles, but only the mouse
        // desktop track has one stop per product. Mobile stops are reading
        // scenes within the selected product, not product indices.
        if (panel && stage && getComputedStyle(stage).position === "sticky" &&
          matchMedia("(pointer:fine) and (min-width:901px) and (min-height:480px)").matches) {
          const index = Array.from(owner.querySelectorAll("[data-eng-panel]")).indexOf(panel);
          if (index >= 0 && matches[index]) {
            matches[index].anchor = panel;
            return matches[index];
          }
        }
        const sameScene = frame.scene ? matches.filter(f => f.scene === frame.scene) : [];
        const semantic = sameScene.length ? sameScene : matches.filter(f => f.scene &&
          (f.scene.contains(anchor) || anchor.contains(f.scene)));
        const target = semantic[Math.min(frame.scenePart || 0, semantic.length - 1)];
        if (target) {
          target.anchor = anchor;
          return target;
        }
      }
      const target = matches[Math.min(frame.part || 0, matches.length - 1)] || null;
      // Combining a narrow product's reading scenes must not discard its
      // identity before a later resize restores the desktop product stops.
      if (target) target.anchor = frame.anchor || frame.scene || focus || undefined;
      return target;
    }
    // Fonts, feeds, image loads and rotation can move stops. Preserve the
    // resting element rather than picking whichever is near its old pixels.
    const target = initialHashFrame(list) || relocated(resting);
    if (target && Math.abs(target.y - window.scrollY) > 1) window.scrollTo({ top: target.y, behavior: "instant" });
    publish();
  }
  function frames() {
    if (dirty) {
      syncChrome();
      measure();
    }
    return stops;
  }
  function invalidate() {
    dirty = true;
    if (!layoutFrame)
      layoutFrame = requestAnimationFrame(function () {
        layoutFrame = 0;
        syncChrome();
        measure();
      });
  }

  /* Position and ownership change before the next paint. The document keeps
     its natural geometry for direct scroll, anchors, selection and browser history. */
  function cutTo(y: number) {
    cancel();
    guardUntil = 0;
    window.scrollTo({ top: y, behavior: "instant" });
    publish();
  }
  function blocked() {
    return (
      (menu && !menu.hidden) ||
      document.body.style.overflow === "hidden" ||
      document.querySelector('[data-page-contents][open], .dd .nav-btn[aria-expanded="true"]') ||
      document.querySelector('dialog[open], [aria-modal="true"]')
    );
  }
  // A stop a few pixels ahead (a tab click or late layout leaves the page just short of
  // its stop) shows the scene already on screen: stepping to it would be a dead gesture.
  const NEAR = 24;
  // A scene with community tabs (Oberlin College / Great Lakes Science Center) steps
  // through its tabs before the next scene: scrolling down shows the next community.
  function choiceStep(dir: number, act: boolean) {
    const els = current()?.els || [];
    for (const el of els) {
      const group = el.querySelector<HTMLElement>(".native-choices");
      if (!group || !group.getClientRects().length) continue;
      const btns = [...group.querySelectorAll<HTMLButtonElement>("[data-native-choice]")];
      const at = btns.findIndex(b => b.getAttribute("aria-pressed") === "true");
      const next = btns[at + (dir > 0 ? 1 : -1)];
      if (at < 0 || !next) return false;
      if (act) next.click();
      return true;
    }
    return false;
  }
  // The phone controller demo (Phone App) steps the same way while it is on screen:
  // scroll down opens Screen Controller, then shows each controller choice in turn,
  // and only then leaves for the next scene.
  function phoneStep(dir: number, act: boolean) {
    const els = current()?.els || [];
    for (const el of els) {
      const demo = el.querySelector<HTMLElement>("[data-phone-demo]");
      const device = demo?.querySelector<HTMLElement>(".pw-phone");
      if (!demo || !device) continue;
      const r = device.getBoundingClientRect();
      if (!r.height || r.top < 0 || r.bottom > window.innerHeight) continue;
      const btns = [...demo.querySelectorAll<HTMLButtonElement>("[data-phone-channel]")];
      const menu = demo.dataset.phase === "menu";
      const at = btns.findIndex(b => b.getAttribute("aria-pressed") === "true");
      if (dir > 0 && menu) {
        if (act) demo.querySelector<HTMLButtonElement>("[data-phone-scan]")?.click();
        return true;
      }
      const next = menu ? undefined : btns[at + (dir > 0 ? 1 : -1)];
      if (!next || (dir < 0 && at < 0)) return false;
      if (act) next.click();
      return true;
    }
    return false;
  }
  function go(dir: number, advance = false) {
    if (blocked() || !dir) return false;
    if (typeof choiceStep === "function" && choiceStep(dir, true)) return true;
    if (typeof phoneStep === "function" && phoneStep(dir, true)) return true;
    // An explicit control or the scoped identity sequence now owns navigation;
    // a slow startup resource must not later restore the older hash destination.
    initialHashPending = false;
    dir = dir > 0 ? 1 : -1;
    if (dir > 0 && home && !home.classList.contains("intro-peek") &&
      current()?.els.includes(home)) {
      window.dispatchEvent(new Event("ch:hero-peek"));
      return true;
    }
    // Repeated notifications for one public action still share its destination.
    // Actual gestures bypass this latch and keep their existing intent gates.
    if (!advance && publicRequest && publicRequest.direction === dir &&
      performance.now() < publicRequest.until && Math.abs(window.scrollY - publicRequest.y) <= 1)
      return true;
    // A pending resize/font/embed layout can synchronously relocate the resting
    // scene in frames(). Choose from that new position, never the old pixel
    // offset, or this gesture may merely select the scene we are already on.
    const fs = frames();
    const y = window.scrollY;
    let target: StoryFrame | null = null;
    if (dir > 0) {
      for (var i = 0; i < fs.length; i++)
        if (fs[i].y > y + NEAR) {
          target = fs[i];
          break;
        }
    } else {
      for (var j = fs.length - 1; j >= 0; j--)
        if (fs[j].y < y - NEAR) {
          target = fs[j];
          break;
        }
    }
    const product = productBoundary(current()?.els[0], target?.els[0], dir);
    if (product) {
      // Selection changes the narrow product's height and authored reading
      // frames. Remeasure synchronously before selecting its first/last frame.
      dirty = true;
      const selected = frames().filter(frame => frame.els.includes(product.section));
      target = (dir > 0 ? selected[0] : selected.at(-1)) || null;
    }
    if (target) {
      // Change position and ownership in the same task: no intermediate scene
      // is painted while a deliberate story gesture crosses the document.
      cutTo(target.y);
      publicRequest = { direction: dir, y: target.y, until: performance.now() + 220 };
    }
    return !!target;
  }
  /* Tab to a control below or above the screen: show its whole scene rather
     than the browser's partial scroll-into-view, which rests between stops. */
  document.addEventListener("focusin", function (e) {
    const t = e.target;
    if (!(t instanceof HTMLElement) || !main.contains(t) || t === main) return;
    const r = t.getBoundingClientRect();
    if (!r.height || (r.top >= headerHeight - 1 && r.bottom <= window.innerHeight + 1)) return;
    const f = frameForElement(t, frames());
    if (f && Math.abs(f.y - window.scrollY) > 1) cutTo(f.y);
  });
  // The same test go(1) applies, without moving: stops that share one position
  // (product tabs) still count, so the next control matches what a swipe would do.
  function hasNext() {
    const y = window.scrollY;
    if ((typeof choiceStep === "function" && choiceStep(1, false)) || (typeof phoneStep === "function" && phoneStep(1, false)) || frames().some(f => f.y > y + NEAR)) return true;
    return productHasMore(current()?.els[0], 1);
  }
  window.chStory = { frames: frames, go: go, current: current, hasNext: hasNext };
  function iframeOwnsScroll() {
    // Child wheel/touch events never bubble across an iframe boundary. Hover
    // and focus are observable without reading its cross-origin document.
    const hovered = main.querySelector<HTMLIFrameElement>("iframe:hover");
    const focused = document.activeElement;
    const frame = hovered || (allowFrameFocus && focused instanceof HTMLIFrameElement ? focused : null);
    return !!frame && !frame.closest("[inert],[hidden]") &&
      !!activeFrame?.els.some(owner => owner.contains(frame));
  }
  function releaseFrameScroll() {
    frameScroll = null;
    frameWheelGesture.reset();
    frameScrollBypassUntil = performance.now() + 400;
  }
  function handleFrameScroll() {
    const now = performance.now();
    if (dirty || initialHashPending || blocked() || now < frameScrollBypassUntil) {
      frameScroll = null;
      return false;
    }
    const continuing = !!frameScroll && now - frameScroll.at <= 260;
    const sourceY = continuing ? frameScroll!.y : activeFrame?.y;
    if (sourceY == null) return false;
    const delta = window.scrollY - sourceY;
    // Our own instant cut emits a scroll event too. Never treat it as input.
    if (Math.abs(delta) <= 1) return false;
    // Exact destinations remain available to links, scripts and restoration.
    if (stops.some(frame => Math.abs(frame.y - window.scrollY) <= 1)) {
      frameScroll = null;
      frameWheelGesture.reset();
      return false;
    }
    if (!continuing) {
      frameScroll = null;
      frameWheelGesture.reset();
      if (!iframeOwnsScroll()) return false;
    }
    // Only document drift reaches here. Native iframe or parent-region
    // scrolling keeps its position and never becomes a page gesture.
    // The first native movement already establishes direction. Cancelling the
    // browser's smooth animation can remove its later samples, so do not wait
    // for a wheel threshold that only the child document could have observed.
    const movement = continuing ? delta : Math.sign(delta) * Math.max(28, Math.abs(delta));
    const decision = frameWheelGesture.next(movement, now, false);
    cutTo(sourceY);
    if (decision.kind === "step") go(decision.direction, true);
    frameScroll = { y: window.scrollY, at: now };
    return true;
  }
  // Explicit parent input and browser navigation take ownership from an old
  // embedded gesture. In particular, a scrollbar drag must remain direct.
  document.addEventListener("pointerdown", e => {
    allowFrameFocus = e.target instanceof HTMLIFrameElement;
    releaseFrameScroll();
  }, { capture: true, passive: true });
  document.addEventListener("focusin", e => {
    allowFrameFocus = e.target instanceof HTMLIFrameElement;
  });
  window.addEventListener("blur", () => { allowFrameFocus = true; });
  document.addEventListener("keydown", releaseFrameScroll, { capture: true, passive: true });
  document.addEventListener("wheel", releaseFrameScroll, { capture: true, passive: true });
  document.addEventListener("touchstart", releaseFrameScroll, { capture: true, passive: true });
  // Content fitting already remeasures and restores its semantic stop below.
  // It must not release the still-active momentum of an embedded gesture.
  ["hashchange", "popstate", "pagehide", "resize"].forEach(event =>
    window.addEventListener(event, releaseFrameScroll, { capture: true, passive: true }));
  window.addEventListener(
    "scroll",
    function () {
      if (guardUntil && performance.now() < guardUntil && tabY >= 0 && Math.abs(window.scrollY - tabY) > 1)
        window.scrollTo({ top: tabY, behavior: "instant" });
      if (handleFrameScroll()) return;
      if (!activePaint) activePaint = requestAnimationFrame(publish);
    },
    { passive: true },
  );

  function innerScroller(el: Element | null, dy?: number, owned = false) {
    for (
      ;
      el && el !== document.body && el !== document.documentElement;
      el = el.parentElement
    ) {
      if (owned && !el.matches(owners)) continue;
      const st = getComputedStyle(el);
      if (
        /(auto|scroll|overlay)/.test(st.overflowY) &&
        el.scrollHeight > el.clientHeight + 1
      ) {
        // A contained scroller at its edge must not swallow the gesture: the
        // page would neither scroll nor cut until the pointer left the box.
        if (dy == null) return true;
        if (
          dy > 0
            ? el.scrollTop + el.clientHeight < el.scrollHeight - 1
            : el.scrollTop > 1
        )
          return true;
      }
    }
    return false;
  }
  function horizontalScroller(el: Element | null) {
    for (; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
      const st = getComputedStyle(el);
      if (/(auto|scroll|overlay)/.test(st.overflowX) && el.scrollWidth > el.clientWidth + 1)
        return true;
    }
    return false;
  }
  /* Wheel events have no gesture-end signal. Consume one burst, including its
     momentum, until a quiet gap or a deliberate change of direction. */
  window.addEventListener(
    "wheel",
    function (e) {
      if (
        e.defaultPrevented ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        !e.deltaY
      )
        return;
      if (blocked()) {
        cancel();
        resetGesture();
        return;
      }
      // A diagonal gesture over a horizontal rail belongs to that rail. Over
      // ordinary copy its vertical component still belongs to the story;
      // otherwise the browser smoothly drifts between the authored stops.
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY) && horizontalScroller(eventElement(e))) return;
      // Input time, not dispatch time: a stalled main thread (the cut to the next
      // section lays out iframes) must not turn queued momentum events into a
      // "quiet gap" that unlocks a second advance.
      const now = e.timeStamp || performance.now();
      const dy =
        e.deltaY *
        (e.deltaMode === 1
          ? 16
          : e.deltaMode === 2
            ? window.innerHeight - headerHeight
            : 1);
      const decision = wheelGesture.next(dy, now, innerScroller(eventElement(e), dy, true));
      if (decision.kind === "native") { cancel(); return; }
      e.preventDefault();
      if (decision.kind === "step" && !go(decision.direction, true))
        resetGesture(); // An outward boundary attempt must not hold an inward swipe.

    },
    { passive: false },
  );

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Tab") {
      cancel();
      resetGesture();
      return;
    }
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || blocked())
      return;
    const pageKey = e.key === "PageDown" || e.key === "PageUp";
    const target = eventElement(e);
    const field = target?.closest(controls);
    // Text fields keep Home/End/PageUp/PageDown for the caret. Once the caret is
    // already at that edge Chrome passes the key on as a native smooth page scroll,
    // which rests between scenes and drops the field's focus: stop it there.
    if (field) {
      if (pageKey || e.key === "Home" || e.key === "End") {
        const forward = e.key === "End" || e.key === "PageDown";
        const text = field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement ? field : null;
        const start = text ? text.selectionStart : null;
        const atEdge = text && start != null
          ? (forward ? text.selectionEnd === text.value.length : start === 0)
          : false;
        // Page keys stay native (the inert hand-off moves focus out of a hidden scene).
        if (!pageKey && atEdge && !innerScroller(field, forward ? 1 : -1)) e.preventDefault();
      }
      return;
    }
    if (e.key === "Home" || e.key === "End") {
      if (innerScroller(target, undefined, !target?.matches("[tabindex]"))) return;
      cancel();
      resetGesture();
      const fs = frames();
      const edge = e.key === "Home" ? fs[0] : fs[fs.length - 1];
      e.preventDefault();
      if (edge && Math.abs(edge.y - window.scrollY) > 1) cutTo(edge.y);
      return;
    }
    const k = e.key;
    let dir = 0;
    // Space activates a focused button, link or tab; the arrow and page keys never do.
    if (k === "ArrowDown" || k === "PageDown" || (k === " " && !e.shiftKey && !target?.closest(activators)))
      dir = 1;
    else if (k === "ArrowUp" || k === "PageUp" || (k === " " && e.shiftKey && !target?.closest(activators)))
      dir = -1;
    if (!dir) return;
    // A focused scrolling box keeps the key until it reaches its end.
    if (innerScroller(target, dir, !target?.matches("[tabindex]"))) return;
    e.preventDefault();
    if (!e.repeat) {
      resetGesture();
      go(dir, true);
    }
  });

  /* Tab never rewinds or strands the story. With no focused control the browser
     would start from the top of the document, reveal the skip link there and
     rewind the scroll; start inside the scene on screen instead. */
  const FOCUSABLE =
    'a[href], button, input:not([type="hidden"]), select, textarea, summary, iframe, [tabindex], [contenteditable]:not([contenteditable="false"])';
  let tabY = -1;
  let tabAt = -Infinity;
  let arrowY = -1;
  // `shown` is false for a control in a scene that is not on screen yet: its scene is
  // inert and may be hidden until the story reaches it.
  function tabbable(el: HTMLElement, shown = true) {
    return !(el.tabIndex < 0 || (el as HTMLButtonElement).disabled || (shown && el.closest("[inert]")) ||
      !el.getClientRects().length || (shown && getComputedStyle(el).visibility === "hidden"));
  }
  function enterScene(backward: boolean) {
    const f = current();
    if (!f) return false;
    const list: HTMLElement[] = [];
    f.els.forEach(function (owner) {
      owner.querySelectorAll<HTMLElement>(FOCUSABLE).forEach(function (el) {
        if (!tabbable(el)) return;
        const r = el.getBoundingClientRect();
        if (r.bottom > headerHeight && r.top < window.innerHeight) list.push(el);
      });
    });
    const el = backward ? list[list.length - 1] : list[0];
    if (el) {
      el.focus({ preventScroll: true });
      return document.activeElement === el;
    }
    // A scene of plain text has no control of its own: Tab continues with the nearest
    // control in the scenes after it (before it, with Shift), shown as a whole scene.
    const fs = frames();
    const here = fs.indexOf(f);
    for (let i = here + (backward ? -1 : 1); i >= 0 && i < fs.length; i += backward ? -1 : 1) {
      const g = fs[i];
      const found: HTMLElement[] = [];
      (g.scene ? [g.scene] : g.els).forEach(function (owner) {
        owner.querySelectorAll<HTMLElement>(FOCUSABLE).forEach(function (c) {
          if (tabbable(c, false) && !f.els.includes(owner)) found.push(c);
        });
      });
      const c = backward ? found[found.length - 1] : found[0];
      if (!c) continue;
      const back = window.scrollY;
      cutTo(g.y);
      c.focus({ preventScroll: true });
      if (document.activeElement === c) return true;
      cutTo(back);
    }
    return false;
  }
  window.addEventListener(
    "keydown",
    function (e) {
      if (e.key !== "Tab" || e.altKey || e.ctrlKey || e.metaKey) return;
      tabY = window.scrollY;
      tabAt = performance.now();
      if (blocked()) return;
      const active = document.activeElement;
      if (active && active !== document.body && active !== root) {
        // The floating "Next section" arrow ends the document's tab order. After it
        // has moved the story, Tab continues into the scene it revealed.
        if (!e.shiftKey && active.classList.contains("page-next") &&
          Math.abs(window.scrollY - arrowY) > 3 && enterScene(false))
          e.preventDefault();
        return;
      }
      const fs = frames();
      if (!fs.length || window.scrollY <= fs[0].y + 3) return;
      const anchor = getSelection()?.anchorNode;
      const here = current();
      if (anchor && here && here.els.some(owner => owner.contains(anchor))) return;
      if (enterScene(e.shiftKey)) e.preventDefault();
    },
    true,
  );
  document.addEventListener("focusin", function (e) {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.classList.contains("page-next")) arrowY = window.scrollY;
    // The skip link, header and floating controls sit outside the scenes. Revealing
    // them must never carry the page away from the scene the visitor is reading: the
    // browser's smooth reveal starts after focus, so hold the scroll for a moment.
    if (!main.contains(t) && !(foot && foot.contains(t)) &&
      performance.now() - tabAt < 500 && tabY >= 0) {
      guardUntil = performance.now() + 700;
      if (Math.abs(window.scrollY - tabY) > 1) window.scrollTo({ top: tabY, behavior: "instant" });
    }
  });


  window.addEventListener(
    "touchstart",
    function (e) {
      touch = null;
      resetGesture();
      if (e.touches.length !== 1) {
        cancel();
        return;
      }
      if (
        (window.visualViewport && window.visualViewport.scale > 1.01) ||
        blocked() ||
        eventElement(e)?.closest(controls)
      )
        return;
      const finger = e.touches[0];
      const target = eventElement(e);
      if (!target) return;
      touch = {
        id: finger.identifier,
        x: finger.clientX,
        y: finger.clientY,
        target: target,
        vertical: false,
        used: false,
      };
    },
    { passive: true },
  );
  window.addEventListener(
    "touchmove",
    function (e) {
      if (!touch) return;
      if (e.defaultPrevented || e.touches.length !== 1 || blocked()) {
        touch = null;
        return;
      }
      const finger = e.touches[0];
      const target = eventElement(e);
      if (!target) return;
      if (finger.identifier !== touch.id) {
        touch = null;
        return;
      }
      const dx = finger.clientX - touch.x;
      const dy = touch.y - finger.clientY;
      if (!touch.vertical) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
        if (Math.abs(dx) > Math.abs(dy) || innerScroller(touch.target, dy, true)) {
          touch = null;
          return;
        }
        touch.vertical = true;
      }
      // Own the first vertical move before the browser starts inertial scrolling.
      if (!e.cancelable) {
        touch = null;
        return;
      }
      e.preventDefault();
      if (!touch.used && Math.abs(dy) >= 32) {
        touch.used = true;
        go(dy > 0 ? 1 : -1, true);
      }
    },
    { passive: false },
  );
  ["touchend", "touchcancel"].forEach(function (ev) {
    window.addEventListener(
      ev,
      function () {
        touch = null;
      },
      { passive: true },
    );
  });

  // Browser navigation and direct manipulation keep their own scroll positions.
  window.addEventListener(
    "pointerdown",
    function (e) {
      if (e.pointerType !== "touch") {
        cancel();
        resetGesture();
      }
    },
    { passive: true },
  );
  ["hashchange", "popstate", "pagehide"].forEach(function (ev) {
    window.addEventListener(
      ev,
      function () {
        cancel();
        resetGesture();
      },
      { passive: true },
    );
  });
  window.addEventListener("hashchange", function () {
    // The browser may target a nested article whose desktop grouping differs
    // from the phone grouping. Reveal the owner of that exact element.
    let id = location.hash.slice(1);
    try { id = decodeURIComponent(id); } catch (err) {}
    const element = document.getElementById(id);
    if (!element || !main.contains(element)) return;
    requestAnimationFrame(function () {
      const destination = frameForElement(element!, frames());
      if (destination) {
        window.scrollTo({ top: destination.y, behavior: "instant" });
        publish();
      }
    });
  });
  /* In-page links cut to the complete story that holds their target. */
  document.addEventListener("click", function (e) {
    const a = eventElement(e)?.closest("a[href]");
    if (!a) return;
    cancel();
    const href = a.getAttribute("href") || "";
    if (
      e.defaultPrevented ||
      e.button ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      href.length < 2 ||
      href.charAt(0) !== "#" ||
      blocked()
    )
      return;
    let id = href.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch (err) {}
    let target = document.getElementById(id);
    if (!target || !main.contains(target)) return;
    const dest = frameForElement(target, frames());
    if (!dest) return;
    e.preventDefault();
    try {
      history.pushState(null, "", href);
    } catch (err) {}
    cutTo(dest.y);
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      cancel();
      resetGesture();
    }
  });
  window.addEventListener("resize", invalidate, { passive: true });
  window.addEventListener("load", invalidate);
  window.addEventListener("ch:fit", function (e) {
    if (e.detail && e.detail.anchor) fitAnchor = e.detail.anchor;
    // Finish the refit's anchoring in the same task. A deferred anchor must
    // never rewind a newer wheel, touch, hash, or direct scroll.
    dirty = true;
    syncChrome();
    measure();
  });
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(invalidate);
    [...secs, main, header, ban, foot].forEach(function (el) {
      if (el) observer.observe(el);
    });
  }
  if (document.fonts) document.fonts.ready.then(invalidate);
  root.classList.add("ch-story-controlled");
  invalidate();
  function positionInitialHash(final = false) {
    if (!initialHashPending || location.hash !== initialHash) return;
    let id = initialHash.slice(1);
    try { id = decodeURIComponent(id); } catch (err) {}
    const element = document.getElementById(id);
    if (!element || !main.contains(element)) return;
    const candidates = frames().filter(function (frame) {
      return frame.els.some(function (section) { return section.contains(element); });
    });
    // A dashboard hash selects a panel. Keep its gallery title and tabs in view;
    // ordinary section/deep-content hashes retain the stop containing the target.
    const panel = element.closest("[data-dashboard-panel]");
    const destination = panel ? candidates[0] : frameForElement(element, frames());
    if (!destination) return;
    // Cancel the browser's smooth fragment scroll after synchronous module/fit
    // startup. Subsequent layout changes use ordinary resting-frame anchoring.
    window.scrollTo({ top: destination.y, behavior: "instant" });
    publish();
    if (final) initialHashPending = false;
  }
  if (initialHashPending) {
    const finishInitialHash = function () {
      // WebKit applies its native fragment offset during the first post-load
      // paint, so finalize after that paint rather than racing it in the same one.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { positionInitialHash(true); });
      });
    };
    // Keep the target usable while resources load, then cancel the native
    // fragment scroll that some engines initiate only at window load.
    if (document.readyState === "complete")
      finishInitialHash();
    else {
      requestAnimationFrame(function () { positionInitialHash(); });
      window.addEventListener("load", finishInitialHash, { once: true });
    }
  }
})();

/* Example/content rails expose each item through touch, arrows, or the keyboard.
   Product selection belongs to the vertical story and its explicit tabs. */
(function () {
  const mobile = matchMedia("(max-width:900px)");
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  document
    .querySelectorAll<HTMLElement>("[data-story-rail]")
    .forEach(function (rail) {
      if (rail.querySelector(":scope > [data-eng-panel]")) return;
      const desktop =
        rail.classList.contains("pc-grid") ||
        rail.hasAttribute("data-rail-desktop");
      const items = htmlChildren(rail).filter(function (el) {
        return !el.classList.contains("hd-arr");
      });
      if (items.length < 2) return;
      const label = rail.getAttribute("aria-label") || "Items";
      const nav = document.createElement("div");
      const previous = document.createElement("button");
      const next = document.createElement("button");
      const count = document.createElement("span");
      nav.className = "story-rail-nav";
      nav.setAttribute("role", "group");
      nav.setAttribute("aria-label", label + " navigation");
      count.className = "story-rail-count";
      count.setAttribute("aria-live", "polite");
      previous.textContent = "\u2190";
      next.textContent = "\u2192";
      [previous, next].forEach(function (button, i) {
        button.type = "button";
        button.className = "story-rail-button";
        button.title = (i ? "Next: " : "Previous: ") + label;
        button.setAttribute("aria-label", button.title);
      });
      nav.append(previous, count, next);
      rail.after(nav);
      let current = -1;
      let lastVisible = -1;
      let frame = 0;
      function start() {
        return (
          rail.getBoundingClientRect().left +
          rail.clientLeft +
          (parseFloat(getComputedStyle(rail).scrollPaddingLeft) || 0)
        );
      }
      function update() {
        frame = 0;
        if ((!mobile.matches && !desktop) || !rail.clientWidth) return;
        const left = start();
        const right =
          rail.getBoundingClientRect().right -
          rail.clientLeft -
          (parseFloat(getComputedStyle(rail).scrollPaddingRight) || 0);
        let best = 0;
        let last = 0;
        let distance = Infinity;
        items.forEach(function (item, i) {
          const rect = item.getBoundingClientRect();
          const d = Math.abs(rect.left - left);
          if (d < distance) {
            best = i;
            distance = d;
          }
          if (rect.right <= right + 2) last = i;
        });
        last = Math.max(best, last);
        if (current !== best || lastVisible !== last) {
          count.textContent =
            best +
            1 +
            (last > best ? "-" + (last + 1) : "") +
            " / " +
            items.length;
        }
        current = best;
        lastVisible = last;
        previous.disabled = rail.scrollLeft <= 1;
        next.disabled =
          rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 1;
      }
      function move(dir: number) {
        update();
        const index = Math.max(0, Math.min(items.length - 1, current + dir));
        rail.scrollTo({
          left:
            rail.scrollLeft +
            items[index].getBoundingClientRect().left -
            start(),
          behavior: still.matches ? "instant" : "smooth",
        });
      }
      previous.addEventListener("click", function () {
        move(-1);
      });
      next.addEventListener("click", function () {
        move(1);
      });
      rail.addEventListener("keydown", function (e) {
        if (
          e.target !== rail ||
          (!mobile.matches && !desktop) ||
          e.altKey ||
          e.ctrlKey ||
          e.metaKey
        )
          return;
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          move(e.key === "ArrowRight" ? 1 : -1);
        }
      });
      rail.addEventListener(
        "scroll",
        function () {
          if (!frame) frame = requestAnimationFrame(update);
        },
        { passive: true },
      );
      if (window.ResizeObserver) new ResizeObserver(update).observe(rail);
      mobile.addEventListener("change", update);
      update();
    });
})();
