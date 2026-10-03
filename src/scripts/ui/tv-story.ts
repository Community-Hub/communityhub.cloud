// About: the story plays itself on the TV once it is on screen; dots jump, pause holds.
export function initTvStory(doc: Document = document): void {
  doc.querySelectorAll<HTMLElement>("[data-tv-story]").forEach(root => {
    const slides = [...root.querySelectorAll<HTMLElement>(".about-tv-slide")];
    const dots = [...root.querySelectorAll<HTMLButtonElement>("[data-tv-go]")];
    const pause = root.querySelector<HTMLButtonElement>("[data-tv-pause]");
    const every = Number(root.dataset.interval) || 6500;
    let at = 0, timer = 0, seen = false, held = false;
    const show = (i: number) => {
      at = (i + slides.length) % slides.length;
      slides.forEach((s, k) => { s.hidden = k !== at; s.classList.toggle("is-on", k === at); });
      dots.forEach((d, k) => k === at ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current"));
    };
    const run = () => {
      clearInterval(timer);
      if (seen && !held && doc.visibilityState === "visible") timer = window.setInterval(() => show(at + 1), every);
    };
    dots.forEach((d, k) => d.addEventListener("click", () => { show(k); run(); }));
    pause?.addEventListener("click", () => {
      held = !held;
      pause.setAttribute("aria-pressed", String(held));
      pause.setAttribute("aria-label", held ? "Play story" : "Pause story");
      run();
    });
    new IntersectionObserver(es => { seen = es.some(e => e.isIntersecting); run(); }, { threshold: 0.5 }).observe(root);
    doc.addEventListener("visibilitychange", run);
  });
}
