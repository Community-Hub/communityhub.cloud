import { required, htmlChildren } from "./dom";
/* John (30 Sep): the homepage stories fade one at a time, as on the original communityhub.cloud.
   Auto-advance pauses on hover, focus, the pause button and reduced motion. */
(function () {
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  document
    .querySelectorAll<HTMLElement>("[data-pp-fade]")
    .forEach(function (box) {
      const slides = htmlChildren(box);
      const nav = box.nextElementSibling;
      if (
        slides.length < 2 ||
        !(nav instanceof HTMLElement) ||
        !nav.hasAttribute("data-pp-nav")
      )
        return;
      const dots = Array.from(
        nav.querySelectorAll<HTMLElement>("[data-pp-go]"),
      );
      const play = required(nav.querySelector<HTMLElement>("[data-pp-play]"));
      const count = nav.querySelector<HTMLElement>("[data-pp-count]");
      const interval = 7000;
      let cur = 0;
      let timer = 0;
      let remaining = interval;
      let startedAt: number | null = null;
      let paused = still.matches;
      let hovered = false;
      let focused = false;
      let inView = false;
      box.classList.add("is-js");
      nav.hidden = false;
      function show(i: number) {
        cur = (i + slides.length) % slides.length;
        slides.forEach(function (s, k) {
          const on = k === cur;
          s.classList.toggle("is-on", on);
          s.setAttribute("aria-hidden", on ? "false" : "true");
          s.inert = !on;
        });
        if (count) count.textContent = (cur + 1) + " / " + slides.length;
        dots.forEach(function (d, k) {
          d.setAttribute("aria-current", k === cur ? "true" : "false");
        });
      }
      function tick(reset = false) {
        const now = performance.now();
        clearTimeout(timer);
        if (startedAt !== null) remaining = Math.max(0, remaining - (now - startedAt));
        startedAt = null;
        if (reset) remaining = interval;
        const running = !paused && !hovered && !focused && inView && !document.hidden;
        // Preserve both the timeout and its existing visual timer across pauses.
        // Only selecting a new picture starts another complete story interval.
        box.classList.add("is-timing");
        const section = box.closest("section");
        for (const animation of section?.getAnimations?.() || []) {
          if ((animation as CSSAnimation).animationName !== "pp-timer") continue;
          animation.currentTime = interval - remaining;
          if (running) animation.play(); else animation.pause();
        }
        if (running) {
          startedAt = now;
          timer = window.setTimeout(function () {
            show(cur + 1);
            tick(true);
          }, remaining);
        }
      }
      function setPaused(p: boolean) {
        paused = p;
        play.innerHTML = p ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 10 7-10 7Z"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
        play.setAttribute("aria-label", p ? "Play stories automatically" : "Pause automatic stories");
        play.setAttribute("aria-pressed", p ? "true" : "false");
        tick();
      }
      nav
        .querySelector<HTMLElement>("[data-pp-prev]")
        ?.addEventListener("click", function () {
          show(cur - 1);
          tick(true);
        });
      nav
        .querySelector<HTMLElement>("[data-pp-next]")
        ?.addEventListener("click", function () {
          show(cur + 1);
          tick(true);
        });
      dots.forEach(function (d, k) {
        d.addEventListener("click", function () {
          show(k);
          tick(true);
        });
      });
      play.addEventListener("click", function () {
        setPaused(!paused);
      });
      box.addEventListener("keydown", function (ev) {
        if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
          ev.preventDefault();
          show(cur + (ev.key === "ArrowRight" ? 1 : -1));
          tick(true);
        }
      });
      [box, nav].forEach(function (el) {
        el.addEventListener("mouseenter", function () {
          hovered = true;
          tick();
        });
        el.addEventListener("mouseleave", function () {
          hovered = false;
          tick();
        });
        el.addEventListener("focusin", function () {
          focused = true;
          tick();
        });
        el.addEventListener("focusout", function () {
          // Focus may be moving between the story and its controls.
          queueMicrotask(function () {
            focused = box.contains(document.activeElement) || nav.contains(document.activeElement);
            tick();
          });
        });
      });
      document.addEventListener("visibilitychange", function () { tick(); });
      still.addEventListener("change", function () {
        if (still.matches) setPaused(true);
      });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          inView = entries.some(function (entry) {
            return entry.isIntersecting && entry.intersectionRatio >= 0.5;
          });
          tick();
        }, { threshold: [0, 0.5] }).observe(box);
      } else inView = true;
      let touch: { x: number; y: number } | null = null;
      box.addEventListener("touchstart", function (event) {
        const point = event.touches.length === 1 ? event.touches[0] : null;
        touch = point ? { x: point.clientX, y: point.clientY } : null;
      }, { passive: true });
      box.addEventListener("touchend", function (event) {
        const start = touch;
        touch = null;
        const point = event.changedTouches[0];
        if (!start || !point) return;
        const dx = point.clientX - start.x;
        const dy = point.clientY - start.y;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          show(cur + (dx < 0 ? 1 : -1));
          tick(true);
        }
      }, { passive: true });
      box.addEventListener("touchcancel", function () { touch = null; }, { passive: true });
      show(0);
      setPaused(paused);
    });
})();
