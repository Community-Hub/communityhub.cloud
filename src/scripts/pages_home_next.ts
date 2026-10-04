/* John (30 Sep): a subtle down arrow on each homepage section advances to the next section. */
(function () {
  const main = document.querySelector<HTMLElement>('#main[data-page="index"]');
  if (!main) return;
  const arrow = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  for (const id of ["people", "problem", "engage", "products", "motivate"]) {
    const section = document.getElementById(id);
    if (!section) continue;
    const host = section.querySelector<HTMLElement>(".eng-stage") || section;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sec-next";
    btn.setAttribute("aria-label", "Continue to the next section or product");
    btn.innerHTML = arrow;
    btn.addEventListener("click", () => {
      const story = window.chStory;
      if (!story) return;
      // Use exactly the same next stop as wheel and keyboard navigation. The
      // old loop skipped the remaining products in the current chapter.
      story.go(1, true);
    });
    host.appendChild(btn);
  }
})();
/* The same arrow on every page that scrolls, the home page included: one fixed circle, bottom centre. It moves to the next screen (the footer is the last one) and leaves there. */
(function () {
  const main = document.querySelector<HTMLElement>("#main");
  if (!main) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "sec-next page-next";
  btn.setAttribute("aria-label", "Next section");
  btn.setAttribute("aria-hidden", "true");
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(btn);
  const foot = document.querySelector<HTMLElement>(".foot");
  const hdr = document.getElementById("hdr");
  function ahead() {
    const story = window.chStory;
    // The story's own test: the footer counts as a next screen (the last content
    // scene cues it), and product tabs that share one position still count.
    if (story) return story.hasNext();
    const end = foot ? foot.getBoundingClientRect().top + scrollY : document.documentElement.scrollHeight;
    return scrollY + innerHeight < end - 4;
  }
  let frame = 0;
  function sync() {
    frame = 0;
    // Present on every scene that has a next one. It is never hidden because
    // content sits near the bottom edge: the scene reserves the room instead
    // (oct3_scroll.css), and the circle keeps its own solid face either way.
    const on = ahead();
    btn.classList.remove("at-side", "on-card", "on-dark");
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-hidden", String(!on));
    btn.tabIndex = on ? 0 : -1;
  }
  let settle = 0;
  /* Sections animate in after a move, so the spot is checked again once they settle. */
  function later() {
    if (!frame) frame = requestAnimationFrame(sync);
    clearTimeout(settle);
    settle = window.setTimeout(function () { sync(); settle = window.setTimeout(sync, 700); }, 450);
  }
  btn.addEventListener("click", function () {
    const story = window.chStory;
    if (story && story.go(1, true)) return;
    window.scrollBy({ top: innerHeight - (hdr ? hdr.offsetHeight : 0), behavior: "smooth" });
  });
  addEventListener("scroll", later, { passive: true });
  addEventListener("resize", later);
  addEventListener("ch:storychange", later);
  addEventListener("load", later);
  later();
})();
/* Event lists on the home page end on a whole row: the box is trimmed to the rows that fit above the arrow and caption, so no row is cut off at the bottom of the screen (the rest scroll, rows snap into place). */
(function () {
  const main = document.querySelector<HTMLElement>('#main[data-page="index"]');
  if (!main) return;
  const RESERVE = 56;
  function fit(box: HTMLElement) {
    const rows = [...box.querySelectorAll<HTMLElement>("li")].filter(li => li.offsetHeight > 0);
    if (!rows.length) return;
    const keep = box.scrollTop;
    box.style.removeProperty("max-height");
    const own = parseFloat(getComputedStyle(box).maxHeight);
    const top = box.getBoundingClientRect().top;
    const after = box.nextElementSibling instanceof HTMLElement ? box.nextElementSibling.offsetHeight + 12 : 0;
    const room = innerHeight - RESERVE - after - top;
    const cap = Math.min(isFinite(own) ? own : Infinity, room);
    const origin = top - box.scrollTop + box.clientTop;
    let best = 0;
    for (const li of rows) {
      const end = li.getBoundingClientRect().bottom - origin;
      if (end <= cap + 0.5) best = end; else break;
    }
    if (best > 0 && best < box.scrollHeight - 1) box.style.maxHeight = Math.ceil(best) + "px";
    box.scrollTop = keep;
  }
  const seen = new WeakMap<HTMLElement, string>();
  function sweep() {
    main!.querySelectorAll<HTMLElement>(".ev-mini").forEach(function (box) {
      const r = box.getBoundingClientRect();
      if (r.width === 0 || r.bottom < 0 || r.top > innerHeight) return;
      const key = [Math.round(r.top), innerHeight, box.scrollHeight, box.querySelectorAll("li").length].join();
      if (seen.get(box) === key) return;
      fit(box);
      seen.set(box, [Math.round(box.getBoundingClientRect().top), innerHeight, box.scrollHeight, box.querySelectorAll("li").length].join());
    });
  }
  let pending = 0;
  const schedule = () => {
    if (document.hidden || pending) return;
    pending = requestAnimationFrame(() => { pending = 0; sweep(); });
  };
  addEventListener("resize", schedule);
  addEventListener("ch:storychange", schedule);
  addEventListener("scroll", schedule, {passive:true});
  document.addEventListener("visibilitychange", schedule);
  new MutationObserver(schedule).observe(main, {childList:true,subtree:true});
  if (window.ResizeObserver) new ResizeObserver(schedule).observe(main);
  schedule();
})();
