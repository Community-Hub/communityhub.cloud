import { enhanceEmailForm } from "./ui/email-form";
import { $, $$, isPresent } from "./dom";
/* ================================================================
   pages_zprod_a.js: The Hub, Citywide Dashboard, Building Dashboard,
   Stories and Pricing. Page-specific behavior beyond base.js's shared
   components: a scrollspy for the on-page jump nav ([data-zpa-jump])
   and the pricing page's request-a-quote mailto form (#quote-form).
   ================================================================ */
(function () {
  function safe(fn: () => void) {
    try {
      fn();
    } catch (e) {}
  }

  /* ---- jump-nav scrollspy ---- */
  safe(function () {
    const nav = $("[data-zpa-jump]");
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

  /* Pricing shares validation and local email preparation with Contact. */
  safe(function () {
    const form = $<HTMLFormElement>("#quote-form");
    const status = $("#quote-out");
    if (form && status) enhanceEmailForm(form, {
      subject: 'Community Hub pricing', status,
      onLayoutChange: () => window.dispatchEvent(new CustomEvent('ch:fit', { detail: { anchor: window.chStory?.current() ?? null } })),
      fields: [{ name: 'name', label: 'Name' }, { name: 'org', label: 'Organization' }, { name: 'need', label: 'Looking at' }, { name: 'msg', label: 'Message' }],
    });
  });

  /* ---- Data Manager / Data Visualizer / Dashboard Creator tab-like
     reveal: purely additive to base.js's [data-reveal], no extra wiring
     needed beyond that shared mechanism. Nothing else to do here. ---- */
})();


// Reveal the source diagram in order, and hold its complete state until replay.
(function () {
  document.querySelectorAll<HTMLElement>("[data-platform-story]").forEach(story => {
    const stages = Array.from(story.querySelectorAll<HTMLElement>("[data-platform-stage]"));
    const button = story.querySelector<HTMLButtonElement>("[data-platform-next]");
    const caption = story.querySelector<HTMLElement>("[data-platform-caption]");
    if (!button || !caption || !stages.length) return;
    const diagram = story.querySelector<HTMLElement>(".platform-diagram");
    const wires = story.querySelector<SVGSVGElement>(".platform-wires");
    function drawConnections() {
      if (!diagram || !wires) return;
      const bounds = diagram.getBoundingClientRect();
      wires.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
      const vertical = window.innerWidth < 700;
      const point = (element: Element, side: "in" | "out") => {
        const b = element.getBoundingClientRect();
        return vertical ? [b.left + b.width/2 - bounds.left, (side === "out" ? b.bottom : b.top) - bounds.top] : [(side === "out" ? b.right : b.left) - bounds.left, b.top + b.height/2 - bounds.top];
      };
      const path = (from: Element, to: Element, stage: number) => {
        const [x1,y1] = point(from,"out"), [x2,y2] = point(to,"in");
        const d = vertical ? `M${x1},${y1} C${x1},${(y1+y2)/2} ${x2},${(y1+y2)/2} ${x2},${y2}` : `M${x1},${y1} C${(x1+x2)/2},${y1} ${(x1+x2)/2},${y2} ${x2},${y2}`;
        return `<path d="${d}" class="platform-wire wire-stage-${stage}"/>`;
      };
      const hub = diagram.querySelector(".platform-hub");
      const apps = diagram.querySelector(".platform-apps");
      const venues = diagram.querySelector(".platform-venues");
      if (!hub) return;
      let html = '';
      diagram.querySelectorAll(".platform-sources li").forEach(source => { html += path(source,hub,2); });
      // Connect the labeled groups through their empty gutters. Individual
      // curves through the application names obscured the explanation.
      if (apps) html += path(hub,apps,3);
      if (apps && venues) html += path(apps,venues,4);
      wires.innerHTML = html;
    }
    if (diagram) new ResizeObserver(drawConnections).observe(diagram);
    document.fonts.ready.then(drawConnections);
    window.addEventListener("resize", drawConnections);
    drawConnections();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stage = reducedMotion.matches ? stages.length : 1;
    story.classList.add("is-enhanced");
    button.hidden = false;
    function show() {
      story.dataset.stage = String(stage);
      stages.forEach((item, index) => {
        const revealed = index < stage;
        item.classList.toggle("is-current", index === stage - 1);
        item.classList.toggle("is-revealed", revealed);
        item.setAttribute("aria-hidden", String(!revealed));
        item.inert = !revealed;
      });
      caption!.textContent = `${stage} of ${stages.length}: ${stages[stage - 1].dataset.caption}`;
      button!.textContent = stage === stages.length ? "Replay explanation" : "Show the next step";
    }
    button.addEventListener("click", () => { stage = stage % stages.length + 1; show(); });
    reducedMotion.addEventListener("change", () => { if (reducedMotion.matches) { stage = stages.length; show(); } });
    show();
  });
})();
