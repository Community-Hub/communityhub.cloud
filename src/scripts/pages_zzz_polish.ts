import { htmlChildren } from "./dom";
/* Polish pass: number the children of each paged block so they rise in reading order,
   and drive the header's progress hairline where scroll timelines are not supported. */
(function () {
  document
    .querySelectorAll<HTMLElement>("#main[data-pager] > * > .wrap")
    .forEach(function (w) {
      htmlChildren(w).forEach(function (c, i) {
        c.style.setProperty("--i", String(Math.min(i, 6)));
      });
    });
  if (
    window.CSS &&
    CSS.supports &&
    CSS.supports("animation-timeline: scroll()")
  )
    return;
  const header = document.getElementById("hdr");
  if (!header) return;
  const hdr = header;
  const root = document.documentElement;
  let frame = 0;
  if (!hdr) return;
  function paint() {
    frame = 0;
    const max = root.scrollHeight - innerHeight;
    hdr.style.setProperty(
      "--prog",
      max > 0 ? Math.min(1, scrollY / max).toFixed(4) : "0",
    );
  }
  addEventListener(
    "scroll",
    function () {
      if (!frame) frame = requestAnimationFrame(paint);
    },
    { passive: true },
  );
  addEventListener("resize", paint);
  paint();
})();
