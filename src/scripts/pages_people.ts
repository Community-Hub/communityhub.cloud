import { revealTabWithinList } from "./ui/tab-visibility";
import { $, $$, isPresent } from "./dom";
/* ================================================================
   pages_people.js: audience pages, case studies and the dashboards
   gallery. The only page-specific behavior these pages need beyond
   base.js's shared components is a scrollspy for the on-page jump
   nav ([data-ppl-jump]), so that's all this file does.
   ================================================================ */
(function () {
  function safe(fn: () => void) {
    try {
      fn();
    } catch (e) {}
  }

  /* Workaround for a bug in base.js: its auto-init for [data-events]
     (line ~391, "safe(function(){ $$('[data-events]').forEach(loadEvents); });")
     is missing the trailing "()" that every other safe(...) call in that file
     has, so the live events list never loads itself anywhere on the site.
     base.js is shared and not this module's to edit, so this calls the
     already-exposed window.chLoadEvents() directly instead. Flagged for
     whoever owns base.js to fix at the source. */
  safe(function () {
    if (typeof window.chLoadEvents !== "function") return;
    $$("[data-events]").forEach(function (box) {
      window.chLoadEvents?.(box);
    });
  });

  /* Citywide Dashboard on phones: the drawing and the picker that drives it belong to one
     scene. The source marks them as two scenes, so on narrow screens the drawing moves
     into the controls scene (same reading order) and is a plain part of it, and returns
     to its own place on wider screens. */
  safe(function () {
    const signs = $$<HTMLElement>(".cwd-sign.citywide-staged-sign");
    if (!signs.length || typeof matchMedia !== "function") return;
    const narrow = matchMedia("(max-width: 900px)");
    const home = new Map<HTMLElement, { stage: Element; next: Element | null }>();
    function sync() {
      let changed = false;
      signs.forEach(function (sign) {
        const fig = $<HTMLElement>("figure.cwd-scene", sign);
        const ctl = $<HTMLElement>(".citywide-controls-scene", sign);
        if (!fig || !ctl) return;
        if (narrow.matches && fig.parentElement !== ctl) {
          home.set(fig, { stage: fig.parentElement as Element, next: fig.nextElementSibling });
          fig.removeAttribute("data-story-scene");
          fig.classList.remove("ch-authored-scene", "is-scene-in");
          fig.inert = false;
          ctl.prepend(fig);
          changed = true;
        } else if (!narrow.matches && fig.parentElement === ctl) {
          const h = home.get(fig);
          if (h) h.stage.insertBefore(fig, h.next);
          fig.setAttribute("data-story-scene", "");
          changed = true;
        }
      });
      if (changed) requestAnimationFrame(function () { window.dispatchEvent(new Event("resize")); });
    }
    sync();
    narrow.addEventListener("change", sync);
  });

  /* Phones: scale each live dashboard (laid out at 560px) to the width of its frame. */
  safe(function () {
    if (typeof ResizeObserver === "undefined") return;
    const bodies = $$<HTMLElement>(
      '#main[data-page="great-lakes-science-center"] .live-frame .lf-body, #main[data-page="midtown-cleveland"] .live-frame .lf-body, #main[data-page="museums"] .live-frame .lf-body',
    );
    const ro = new ResizeObserver(function (entries) {
      entries.forEach(function (e) {
        const el = e.target as HTMLElement;
        const w = parseFloat(getComputedStyle(el).getPropertyValue("--embed-w")) || 560;
        const k = Math.min(1, el.clientWidth / w);
        if (k > 0) el.style.setProperty("--embed-scale", k.toFixed(4));
      });
    });
    bodies.forEach(function (b) { ro.observe(b); });
  });

  safe(function () {
    const nav = $("[data-ppl-jump]");
    if (!nav) return;
    const links = $$("a", nav);
    const sections = links
      .map(function (a) {
        var id = (a.getAttribute("href") || "").slice(1);
        return document.getElementById(id);
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
})();


// Public dashboard selections show the actual embed in the same story view.
(function () {
  const gallery = document.querySelector<HTMLElement>("[data-dashboard-gallery]");
  if (!gallery) return;
  const tabs = Array.from(gallery.querySelectorAll<HTMLButtonElement>("[data-dashboard-key]"));
  const panels = Array.from(gallery.querySelectorAll<HTMLElement>("[data-dashboard-panel]"));
  const tabList = gallery.querySelector<HTMLElement>('[role="tablist"]');
  const revealSelected = () => {
    const selected = tabs.find(tab => tab.getAttribute("aria-selected") === "true");
    if (tabList && selected) revealTabWithinList(tabList, selected);
  };
  function select(key: string, updateHash = false, focus = false) {
    const tab = tabs.find(item => item.dataset.dashboardKey === key);
    if (!tab) return;
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => {
      panel.hidden = panel.dataset.dashboardPanel !== key;
      if (!panel.hidden) panel.querySelector(".live-frame")?.dispatchEvent(new Event("ch:load-frame"));
    });
    if (updateHash) history.replaceState(null, "", "#" + key);
    if (focus) tab.focus({ preventScroll: true });
    revealSelected();
    window.dispatchEvent(new Event("resize"));
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab.dataset.dashboardKey || "", true));
    tab.addEventListener("keydown", event => {
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(tabs[next].dataset.dashboardKey || "", true, true);
    });
  });
  if (tabList && "ResizeObserver" in window) {
    const observer = new ResizeObserver(revealSelected);
    observer.observe(tabList);
    tabs.forEach(tab => observer.observe(tab));
  }
  const fromHash = () => select(location.hash.slice(1));
  window.addEventListener("hashchange", fromHash);
  select(tabs.some(tab => tab.dataset.dashboardKey === location.hash.slice(1)) ? location.hash.slice(1) : tabs[0].dataset.dashboardKey || "");
})();
