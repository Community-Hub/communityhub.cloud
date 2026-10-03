import { storySlides } from "./data";
import { required } from "./dom";
/* Task 13: Story of Dashboard storyboard. Arrows, the strip or the keyboard move through the slides. */
(function () {
  document.querySelectorAll<HTMLElement>("[data-sb]").forEach(function (view) {
    const sec = required(view.closest(".sb"));
    const data = storySlides(
      JSON.parse(
        required(sec.querySelector<HTMLElement>("[data-sb-data]"))
          .textContent || "[]",
      ),
    );
    const img = required(view.querySelector<HTMLImageElement>("[data-sb-img]"));
    const original = sec.querySelector<HTMLAnchorElement>("[data-sb-original]");
    const ch = required(view.querySelector<HTMLElement>("[data-sb-ch]"));
    const t = required(view.querySelector<HTMLElement>("[data-sb-t]"));
    const d = required(view.querySelector<HTMLElement>("[data-sb-d]"));
    const n = required(view.querySelector<HTMLElement>("[data-sb-n]"));
    const prev = required(
      view.querySelector<HTMLButtonElement>("[data-sb-prev]"),
    );
    const next = required(
      view.querySelector<HTMLButtonElement>("[data-sb-next]"),
    );
    const strip = required(sec.querySelector<HTMLElement>(".sb-strip"));
    const thumbs = strip.querySelectorAll<HTMLElement>("[data-sb-go]");
    let i = 0;
    const pad = function (k: number) {
      return (k < 9 ? "0" : "") + (k + 1);
    };
    const go = function (k: number) {
      i = Math.max(0, Math.min(data.length - 1, k));
      var s = data[i];
      img.src = "assets/sod/" + pad(i) + ".jpg";
      img.alt = "Slide " + (i + 1) + ": " + s.t;
      if (original) { original.href = img.src; original.setAttribute("aria-label", "Open original slide " + (i + 1) + ": " + s.t); }
      ch.textContent = s.c;
      t.textContent = s.t;
      d.textContent = s.d;
      n.textContent = i + 1 + " of " + data.length;
      prev.disabled = i === 0;
      next.disabled = i === data.length - 1;
      thumbs.forEach(function (b, j) {
        if (j === i) {
          b.setAttribute("aria-current", "true");
          var r = b.getBoundingClientRect(),
            sr = strip.getBoundingClientRect();
          if (r.left < sr.left || r.right > sr.right)
            strip.scrollBy({
              left: r.left - sr.left - sr.width / 2 + r.width / 2,
              behavior: "smooth",
            });
        } else b.removeAttribute("aria-current");
      });
      if (i + 1 < data.length) {
        var p = new Image();
        p.src = "assets/sod/" + pad(i + 1) + ".jpg";
      }
    };
    prev.addEventListener("click", function () {
      go(i - 1);
    });
    next.addEventListener("click", function () {
      go(i + 1);
    });
    thumbs.forEach(function (b) {
      b.addEventListener("click", function () {
        go(Number(b.getAttribute("data-sb-go")));
      });
    });
    view.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") {
        go(i + 1);
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        go(i - 1);
        e.preventDefault();
      }
    });
    const start = Number(sec.getAttribute("data-story-start") || "0");
    go(Number.isFinite(start) ? start : 0);
  });
})();
