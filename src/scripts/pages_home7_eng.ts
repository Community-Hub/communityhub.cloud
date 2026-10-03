import { registerProductNavigation } from "./ui/product-navigation";
/* Task 8: To Engage keeps its heading on screen while three stops (signs, phones,
   partner websites) pass under it, then the page moves on to To Educate.
   John (30 Sep) wants the original's three colour-coded groups, so To educate and
   To motivate and empower stage the same way. Each section is one stop per panel
   tall; this shows the panel for the stop in view. */
Array.from(
  document.querySelectorAll<HTMLElement>("#main > section.eng"),
).forEach(function (sec) {
  const stage = matchMedia(
    "(pointer:fine) and (min-width:901px) and (min-height:480px)",
  );
  const tabs = Array.from(sec.querySelectorAll<HTMLElement>("[data-eng-tab]"));
  const panels = Array.from(
    sec.querySelectorAll<HTMLElement>("[data-eng-panel]"),
  );
  const choice = sec.querySelector<HTMLSelectElement>("[data-eng-select]");
  let shown = -1;
  let frame = 0;
  let layoutFrame = 0;
  let activeSection = false;
  // True when the rail's own swipe or momentum picked the shown panel. The
  // layout that follows must not instant-scroll the rail under the user's
  // finger; it realigns once the rail has settled instead.
  let railDriven = false;
  let settlePending = false;
  let settleTimer = 0;
  function alignRail(rail: HTMLElement, panel: HTMLElement) {
    const offset = panel.getBoundingClientRect().left - rail.getBoundingClientRect().left;
    if (Math.abs(offset) < 1) return;
    rail.scrollTo({ left: rail.scrollLeft + offset, behavior: "instant" });
  }
  function settleRail() {
    clearTimeout(settleTimer);
    settleTimer = 0;
    if (!settlePending) return;
    settlePending = false;
    if (stage.matches) return;
    const rail = sec.querySelector<HTMLElement>("[data-story-rail]");
    const panel = panels[shown];
    if (rail && panel) alignRail(rail, panel);
  }
  function layoutPanel() {
    layoutFrame = 0;
    const driven = railDriven;
    railDriven = false;
    const panel = panels[shown];
    if (!panel) return;
    const copy = panel.querySelector<HTMLElement>("[data-eng-context]");
    const media = panel.querySelector<HTMLElement>("[data-eng-view]");
    const heading = sec.querySelector<HTMLElement>(".chapter-heading");
    if (!copy || !media || !heading) return;
    // Measure the selected product's natural composition, before the authored
    // context/media scenes add their viewport heights. Offscreen products do
    // not decide how tall the current product is.
    sec.classList.add("eng-measuring");
    const style = getComputedStyle(sec);
    const headingSpace = heading.offsetHeight +
      (parseFloat(getComputedStyle(heading).marginBottom) || 0) +
      (parseFloat(style.paddingTop) || 0);
    const natural = headingSpace + copy.offsetHeight + media.offsetHeight +
      (parseFloat(getComputedStyle(panel).rowGap) || 0) +
      (parseFloat(style.paddingBottom) || 0);
    sec.classList.remove("eng-measuring");
    const split = innerWidth <= 900 && natural > room() + 1;
    const mode = innerWidth <= 699 && innerHeight <= 740 ? "short-phone" : "";
    sec.style.setProperty("--eng-context-room", Math.max(0, room() - headingSpace) + "px");
    sec.classList.toggle("eng-sequenced", split);
    panels.forEach(function (item, index) {
      item.querySelectorAll<HTMLElement>("[data-eng-context], [data-eng-view]").forEach(function (scene) {
        if (split && index === shown) scene.setAttribute("data-story-scene", mode);
        else {
          scene.removeAttribute("data-story-scene");
          scene.classList.remove("ch-authored-scene", "is-scene-in");
          scene.inert = false;
        }
      });
    });
    if (!stage.matches) {
      const rail = sec.querySelector<HTMLElement>("[data-story-rail]");
      // Measuring and restoring the reading scenes changes the snap layout.
      // Align only after that geometry is final, otherwise the browser can
      // snap back to the previous column and leave the selected product offscreen.
      if (rail && driven) {
        settlePending = true;
        clearTimeout(settleTimer);
        settleTimer = window.setTimeout(settleRail, 120);
      } else if (rail) alignRail(rail, panel);
    }
    // Scene identity can change without changing the section's total height.
    // Ask the existing controller to publish ownership immediately.
    window.dispatchEvent(new CustomEvent("ch:fit", { detail: {} }));
  }
  function scheduleLayout() {
    if (!layoutFrame) layoutFrame = requestAnimationFrame(layoutPanel);
  }
  function room() {
    return (
      window.innerHeight -
      (parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--story-hdr-h",
        ),
      ) || 0)
    );
  }
  function show(i: number) {
    if (i === shown) return;
    if (panels[shown]?.contains(document.activeElement)) {
      const control = choice || tabs[i] || sec.querySelector<HTMLElement>("[data-story-rail]");
      control?.focus({ preventScroll: true });
    }
    shown = i;
    sec.setAttribute("data-i", String(i));
    if (choice) choice.value = String(i);
    tabs.forEach(function (t, k) {
      t.setAttribute("aria-selected", k === i ? "true" : "false");
      t.tabIndex = k === i ? 0 : -1;
    });
    panels.forEach(function (p, k) {
      p.toggleAttribute("inert", k !== i);
    });
    scheduleLayout();
  }
  function update() {
    frame = 0;
    if (!stage.matches) {
      const rail = sec.querySelector<HTMLElement>("[data-story-rail]");
      const left = rail?.getBoundingClientRect().left ?? 0;
      const index = panels.reduce((best, panel, i) => Math.abs(panel.getBoundingClientRect().left - left) < Math.abs(panels[best].getBoundingClientRect().left - left) ? i : best, 0);
      show(index);
      return;
    }
    const r = room();
    const span = Math.max(1, sec.offsetHeight - r);
    const p = (window.innerHeight - r - sec.getBoundingClientRect().top) / span;
    show(
      Math.max(
        0,
        Math.min(panels.length - 1, Math.round(p * (panels.length - 1))),
      ),
    );
  }
  function selectPanel(k: number) {
      if (!stage.matches) {
        const rail = sec.querySelector<HTMLElement>("[data-story-rail]");
        if (rail && panels[k]) {
          show(k);
          railDriven = false;
          if (layoutFrame) { cancelAnimationFrame(layoutFrame); layoutFrame = 0; }
          layoutPanel();
        }
        return;
      }
      const r = room();
      const step = (sec.offsetHeight - r) / (panels.length - 1);
      const top =
        sec.getBoundingClientRect().top +
        window.scrollY -
        (window.innerHeight - r);
      window.scrollTo({
        top: Math.round(top + step * k),
        behavior: "instant",
      });
  }
  registerProductNavigation(sec, {
    enabled: () => !stage.matches && innerWidth <= 900,
    current: () => Math.max(0, shown),
    count: () => panels.length,
    select: selectPanel,
  });
  tabs.forEach((t,k) => t.addEventListener("click", () => selectPanel(k)));
  choice?.addEventListener("change", () => selectPanel(Number(choice.value)));
  const rail = sec.querySelector<HTMLElement>("[data-story-rail]");
  rail?.addEventListener("scroll", () => {
    if (stage.matches || !rail) return;
    const index = panels.reduce((best, panel, i) => Math.abs(panel.getBoundingClientRect().left - rail.getBoundingClientRect().left) < Math.abs(panels[best].getBoundingClientRect().left - rail.getBoundingClientRect().left) ? i : best, 0);
    if (index !== shown) railDriven = true;
    show(index);
    if (settlePending) {
      clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settleRail, 120);
    }
  }, { passive: true });
  rail?.addEventListener("scrollend", settleRail);
  tabs.forEach((tab, i) => tab.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (i + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus({preventScroll:true});
    tabs[next].click();
  }));
  window.addEventListener(
    "scroll",
    function () {
      if (!frame) frame = requestAnimationFrame(update);
    },
    { passive: true },
  );
  window.addEventListener("ch:storychange", event => {
    activeSection = event.detail.els.includes(sec);
  });
  function resizeProduct() {
    if (frame) { cancelAnimationFrame(frame); frame = 0; }
    // A breakpoint can clamp scrollY before this event. The old pixel stops
    // may then name a different section; only the published owner may restore
    // a product, or an earlier offscreen rail can steal this resize.
    if (!activeSection) { scheduleLayout(); return; }
    const previous = window.chStory?.current();
    const selected = Math.max(0, shown);
    const anchor = previous?.els.includes(sec) ? previous : { y: window.scrollY, els: [sec], part: 0 };
    // Pixel positions change at the breakpoint. Preserve the selected semantic
    // product, then let the page restore its complete reading frame.
    selectPanel(selected);
    if (layoutFrame) { cancelAnimationFrame(layoutFrame); layoutFrame = 0; }
    layoutPanel();
    window.dispatchEvent(new CustomEvent("ch:fit", { detail: {
      anchor: { ...anchor, anchor: panels[selected] },
    } }));
  }
  window.addEventListener("resize", resizeProduct);
  stage.addEventListener("change", resizeProduct);
  window.addEventListener("load", scheduleLayout);
  document.fonts?.ready.then(scheduleLayout);
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(scheduleLayout);
    panels.forEach(panel => {
      panel.querySelectorAll<HTMLElement>("[data-eng-context], [data-eng-view]").forEach(scene => observer.observe(scene));
    });
  }
  sec.classList.add("eng-enhanced");
  update();
});
