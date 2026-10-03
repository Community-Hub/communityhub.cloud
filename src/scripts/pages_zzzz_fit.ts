import { htmlChildren } from "./dom";
/* Fit each semantic section independently inside the available screen.
   Small sections retain their own viewport. Desktop content can scale within a
   readable bound; taller content keeps natural size and its own internal stops.
   Phones retain natural text size. Blocks marked data-nofit size themselves. */
(function () {
  const mainNode = document.getElementById("main");
  if (!mainNode) return;
  const main = mainNode;
  if (!main) return;
  const home = !!main.querySelector<HTMLElement>(":scope > .hv");
  if (!home && !main.hasAttribute("data-pager")) return;
  let MIN = 0.74;
  const root = document.documentElement;
  const header = document.getElementById("hdr");
  const jump = home
    ? null
    : main.querySelector<HTMLElement>(
        ":scope > [data-zpa-jump], :scope > [data-zpb-jump], :scope > [data-ppl-jump]",
      );
  const blocks = Array.from(
    main.querySelectorAll<HTMLElement>(
      home ? ":scope > section" : ":scope > *",
    ),
  ).filter(function (el) {
    return (
      el !== jump &&
      !el.matches("script, style, template, [hidden], [data-nofit]") &&
      getComputedStyle(el).display !== "none"
    );
  });
  let timer = 0;
  let running = false;
  let lastW = 0;
  let lastH = 0;

  function reset(b: HTMLElement) {
    b.removeAttribute("data-pack");
    b.removeAttribute("data-lite");
    b.classList.remove("ch-fit");
    Array.from(b.querySelectorAll<HTMLElement>("[data-fb]")).forEach(
      function (el) {
        el.removeAttribute("data-fb");
        el.style.removeProperty("font-size");
      },
    );
    b.style.removeProperty("--fit");
    b.style.removeProperty("--pk-t");
    b.style.removeProperty("--pk-b");
    b.style.removeProperty("--pg-pad");
    b.style.removeProperty("padding-top");
    b.style.removeProperty("padding-bottom");
  }
  function padOf(b: HTMLElement) {
    const st = getComputedStyle(b);
    return (
      (parseFloat(st.paddingTop) || 0) + (parseFloat(st.paddingBottom) || 0)
    );
  }
  function setFit(group: HTMLElement[], s: number) {
    group.forEach(function (b) {
      if (s < 0.995) {
        b.style.setProperty("--fit", s.toFixed(4));
        b.classList.add("ch-fit");
      } else {
        b.style.removeProperty("--fit");
        b.classList.remove("ch-fit");
      }
    });
  }

  function run() {
    if (root.classList.contains("ch-moving")) {
      later(260);
      return;
    }
    running = true;
    const keepY = window.scrollY;
    let anchor =
      window.chStory && window.chStory.current
        ? window.chStory.current()
        : null;
    if (anchor && Math.abs(anchor.y - keepY) > 1) anchor = null;
    function finish() {
      running = false;
      /* Temporary natural-size measurements can clamp scroll near the footer.
         Preserve the resting semantic frame as well as its previous pixels. */
      if (Math.abs(window.scrollY - keepY) > 1)
        window.scrollTo({ top: keepY, behavior: "instant" });
      window.dispatchEvent(
        new CustomEvent("ch:fit", { detail: { anchor: anchor } }),
      );
    }
    lastW = innerWidth;
    lastH = innerHeight;
    blocks.forEach(reset);
    // Authored interiors retain their typography. Longer material receives
    // additional story stops instead of changing size from section to section.
    if (innerWidth < 700 || main.hasAttribute("data-natural-type")) {
      finish();
      return;
    }
    const hh =
      (header ? header.offsetHeight : 0) + (jump ? jump.offsetHeight : 0);
    const R = innerHeight - hh;
    const bn = document.querySelector<HTMLElement>(".aashe");
    const bnH = bn && bn.offsetParent !== null ? bn.offsetHeight : 0;
    MIN = R < 560 ? 0.72 : 0.76;
    main.classList.add("ch-fit-measure");
    const nat = blocks.map(function (b) {
      return b.offsetHeight;
    });
    const pad = blocks.map(padOf);
    main.classList.remove("ch-fit-measure");

    /* A quote, cross-link, and following section remain distinct stops. */
    const groups = blocks.map(function (_block, i) {
      return [i];
    });

    /* scale each group to the screen. Zoom reflows text (the wrap is widened to compensate),
       so the real height is read back and the scale refined. */
    function contentH(b: HTMLElement) {
      const kids = htmlChildren(b).filter(function (c) {
        return (
          c.offsetParent !== null || getComputedStyle(c).position === "fixed"
        );
      });
      if (!kids.length) return 0;
      let top = Infinity;
      let bot = -Infinity;
      kids.forEach(function (c) {
        const r = c.getBoundingClientRect();
        if (r.height) {
          top = Math.min(top, r.top);
          bot = Math.max(bot, r.bottom);
        }
      });
      return bot > top ? bot - top : 0;
    }
    function fitGroup(g: number[]) {
      const RR =
        g[0] === 0 ? innerHeight - (header ? header.offsetHeight : 0) - bnH : R;
      const members = g.map(function (k) {
        return blocks[k];
      });
      if (!home && members[0].classList.contains("ph2")) return false;
      if (members[0].classList.contains("hv")) return false;
      const natural = g.reduce(function (a, k) {
        return a + nat[k];
      }, 0);
      if (natural <= RR + 1) return false;
      const padSum = g.reduce(function (a, k) {
        return a + pad[k];
      }, 0);
      function actual() {
        return (
          padSum +
          members.reduce(function (a, b) {
            return a + contentH(b);
          }, 0)
        );
      }
      let s = Math.max(MIN, (RR - padSum) / (natural - padSum));
      let h = 0;
      for (var pass = 0; pass < 5; pass++) {
        setFit(members, s);
        h = actual();
        if (Math.abs(h - RR) <= 2 || (h > RR && s <= MIN)) break;
        const ns = Math.min(
          1,
          Math.max(MIN, (s * (RR - padSum)) / Math.max(1, h - padSum)),
        );
        if (Math.abs(ns - s) < 0.003) break;
        s = ns;
      }
      if (h > RR + 2) {
        const body = h - padSum;
        const room = RR - body;
        if (room >= 12 * members.length) {
          /* the copy fits, only the padding is too generous */
          const pp = Math.max(6, room / (2 * members.length) - 2);
          members.forEach(function (b) {
            b.style.setProperty("--pg-pad", pp.toFixed(1) + "px");
            b.style.setProperty(
              "padding-top",
              pp.toFixed(1) + "px",
              "important",
            );
            b.style.setProperty(
              "padding-bottom",
              pp.toFixed(1) + "px",
              "important",
            );
          });
        } else setFit(members, h > RR * 1.08 ? 1 : s);
      }
      return h > RR + 2;
    }
    /* Zoom shrinks type with the block, so small captions and labels are raised by 1/zoom to stay at 14px or more on screen. */
    function bump(members: HTMLElement[]) {
      let n = 0;
      members.forEach(function (b) {
        const z = parseFloat(b.style.getPropertyValue("--fit")) || 1;
        Array.from(b.querySelectorAll<HTMLElement>("*")).forEach(function (el) {
          if (
            el.namespaceURI !== "http://www.w3.org/1999/xhtml" ||
            el.closest('svg,iframe,.mini,[aria-hidden="true"]')
          )
            return;
          const own = Array.from(el.childNodes).some(function (c) {
            return c.nodeType === 3 && c.nodeValue?.trim();
          });
          if (!own) return;
          const fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs * z < 13.9) {
            el.style.setProperty(
              "font-size",
              (14.05 / z).toFixed(2) + "px",
              "important",
            );
            el.setAttribute("data-fb", "");
            n++;
          }
        });
      });
      return n;
    }
    groups.forEach(function (g) {
      fitGroup(g);
      const members = g.map(function (k) {
        return blocks[k];
      });
      if (
        members.some(function (b) {
          return b.classList.contains("ch-fit");
        }) &&
        bump(members) &&
        fitGroup(g)
      ) {
        /* raising the type made the screen overflow: text stays at 14px or more, so drop the zoom and let the screen take two stops */
        members.forEach(function (b) {
          Array.from(b.querySelectorAll<HTMLElement>("[data-fb]")).forEach(
            function (el) {
              el.removeAttribute("data-fb");
              el.style.removeProperty("font-size");
            },
          );
        });
        setFit(members, 1);
      }
    });
    finish();
  }
  function later(ms: number) {
    clearTimeout(timer);
    timer = window.setTimeout(run, ms);
  }

  run();
  window.addEventListener(
    "resize",
    function () {
      if (innerWidth !== lastW || Math.abs(innerHeight - lastH) > 40)
        later(120);
    },
    { passive: true },
  );
  window.addEventListener("load", function () {
    later(60);
    window.setTimeout(run, 1600);
  });
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(function () {
      later(30);
    });
  /* images and embeds that arrive late change block heights */
  main.addEventListener(
    "load",
    function (e) {
      if (
        e.target instanceof Element &&
        (e.target.tagName === "IMG" || e.target.tagName === "IFRAME")
      )
        later(200);
    },
    true,
  );
  /* live feeds (events, jobs) add nodes after load and change block heights; refit a few times, never on our own attribute edits */
  if (window.MutationObserver) {
    let mutRuns = 0;
    new MutationObserver(function () {
      if (running || mutRuns > 8) return;
      mutRuns++;
      later(350);
    }).observe(main, { childList: true, subtree: true });
  }
  const bnEl = document.querySelector<HTMLElement>(".aashe");
  if (bnEl)
    bnEl.addEventListener("click", function () {
      later(80);
      later(400);
    });
  window.chFit = { run: run };
})();
