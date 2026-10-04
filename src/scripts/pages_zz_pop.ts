import type { StoryChange, StoryFrame } from "./types";

/* The section controller owns reveal state. Intersection alone can expose both
   neighbours during a swipe and can leave nested reveal effects waiting forever. */
(function () {
  const main = document.getElementById("main");
  const root = document.documentElement;
  if (!main) return;
  const story = window.chStory;
  if (story && typeof story.current === "function") {
    function show(frame: StoryChange | StoryFrame | null) {
      if (!frame || !frame.els || !frame.els.length) return;
      const blocks =
        document.querySelectorAll<HTMLElement>(".ch-story-section");
      if (!blocks.length) return;
      Array.from(blocks).forEach(function (block) {
        const on = frame.els.indexOf(block) !== -1;
        if (
          !on &&
          document.activeElement instanceof HTMLElement &&
          block.contains(document.activeElement)
        )
          document.activeElement.blur();
        block.inert = !on;
        block.classList.toggle("is-in", on);
        if (on) {
          if (block.hasAttribute("data-reveal")) block.classList.add("in");
          Array.from(
            block.querySelectorAll<HTMLElement>("[data-reveal]"),
          ).forEach(function (el) {
            el.classList.add("in");
          });
        }
      });
      root.classList.add("ch-story-isolated");
    }
    window.addEventListener("ch:storychange", function (event) {
      show(event.detail);
    });
    show(story.current());
    return;
  }
  /* A page without the controller keeps ordinary scroll reveal and keyboard access. */
  if (!main.hasAttribute("data-pager")) return;
  const blocks = Array.from(main.children).filter(function (block) {
    return !block.matches("[data-zpa-jump], [data-zpb-jump], [data-ppl-jump]");
  });
  if (!("IntersectionObserver" in window)) {
    blocks.forEach(function (block) {
      block.classList.add("is-in");
    });
    return;
  }
  const io = new IntersectionObserver(
    function (es) {
      es.forEach(function (x) {
        x.target.classList.toggle("is-in", x.isIntersecting);
      });
    },
    { rootMargin: "0px 0px -18% 0px", threshold: 0 },
  );
  blocks.forEach(function (block) {
    io.observe(block);
  });
})();
