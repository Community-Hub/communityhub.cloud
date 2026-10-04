import { enhanceVideoPoster, mountVideoFrame } from "./ui/video-preview";
import { enhanceEmailForm } from "./ui/email-form";
import { $, $$, eventElement } from "./dom";
/* pages_resources.js: education, bring-a-dashboard, media, contact.
   Only touches elements this module renders (#lessons, .rs-flow, [data-yt],
   #contact-form), so it is safe to run on every page. */
(function () {
  /* ---- education: lesson library filter ---- */
  const lessons = $("#lessons");
  if (lessons) {
    const q = $<HTMLInputElement>("#lesson-q");
    let level = "all";
    const items = $$("li", lessons);
    const empty = $("#lessons-empty");
    const count = $("#lesson-count");
    const run = function () {
      var t = ((q && q.value) || "").toLowerCase().trim(),
        n = 0;
      items.forEach(function (li) {
        var lv = li.getAttribute("data-level") || "";
        var ok =
          (level === "all" || lv.indexOf(level) > -1) &&
          (!t || li.textContent.toLowerCase().indexOf(t) > -1);
        li.hidden = !ok;
        if (ok) n++;
      });
      if (empty) empty.hidden = n > 0;
      if (count)
        count.textContent = n + " of " + items.length + " lessons and units";
    };
    if (q) q.addEventListener("input", run);
    $$("#lesson-level button").forEach(function (b) {
      b.addEventListener("click", function () {
        level = b.getAttribute("data-level") || "all";
        $$("#lesson-level button").forEach(function (x) {
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        run();
      });
    });
    run();
  }

  /* ---- bring-a-dashboard: pause the flow-line dot while off screen ---- */
  const flow = $(".rs-flow");
  if (flow && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          flow.classList.toggle("rs-paused", !en.isIntersecting);
        });
      },
      { threshold: 0.1 },
    );
    io.observe(flow);
  }

  /* ---- media / any page: click-to-load YouTube players (real video, a user
     choice, not an ambient loop, so this is a normal link, never a claimed
     "replay" control) ---- */
  $$<HTMLImageElement>("[data-video-poster]").forEach(enhanceVideoPoster);
  document.addEventListener("click", function (ev) {
    const a = eventElement(ev)?.closest("a[data-yt]");
    if (!a || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
    const box = a.hasAttribute("data-for")
      ? document.getElementById(a.getAttribute("data-for") || "")
      : a.closest(".rs-player, .rs-vid");
    if (!box || box.querySelector("iframe")) return;
    ev.preventDefault();
    const f = document.createElement("iframe");
    f.src =
      "https://www.youtube-nocookie.com/embed/" +
      a.getAttribute("data-yt") +
      "?autoplay=1&rel=0";
    f.title =
      a.getAttribute("data-title") ||
      (a.textContent || "").trim() ||
      "YouTube video";
    f.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    );
    f.setAttribute("allowfullscreen", "");
    f.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    f.style.cssText = "width:100%;height:100%;border:0;display:block";
    mountVideoFrame(box as HTMLElement, f);
  });

  /* ---- story-of-dashboard storyboard: pages_sod.ts owns the slides. This keeps focus on the control the visitor used
     (end buttons are dimmed with aria-disabled instead of the disabled attribute, which dropped focus to BODY) and lets
     Left and Right work from anywhere inside the storyboard, including the thumbnail strip. ---- */
  $$<HTMLElement>(".sb").forEach(function (sb) {
    const prev = $<HTMLButtonElement>("[data-sb-prev]", sb);
    const next = $<HTMLButtonElement>("[data-sb-next]", sb);
    const count = $("[data-sb-n]", sb);
    if (!prev || !next || !count) return;
    const sync = function () {
      const m = /(\d+)\s+of\s+(\d+)/.exec(count.textContent || "");
      if (!m) return;
      [prev, next].forEach(function (b) {
        b.removeAttribute("disabled");
      });
      prev.setAttribute("aria-disabled", String(Number(m[1]) <= 1));
      next.setAttribute("aria-disabled", String(Number(m[1]) >= Number(m[2])));
    };
    const mo = new MutationObserver(sync);
    mo.observe(count, { childList: true, characterData: true, subtree: true });
    [prev, next].forEach(function (b) {
      mo.observe(b, { attributes: true, attributeFilter: ["disabled"] });
    });
    sync();
    sb.addEventListener("keydown", function (ev) {
      if (ev.defaultPrevented || ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
      if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
      const t = eventElement(ev);
      if (t && t.closest("input,textarea,select,[contenteditable='true']")) return;
      const b = ev.key === "ArrowRight" ? next : prev;
      ev.preventDefault();
      if (b.getAttribute("aria-disabled") !== "true") b.click();
    });
  });

  /* ---- contact: prepare a mailto with the visitor's own details ---- */
  const form = $<HTMLFormElement>("#contact-form");
  const status = $("#contact-out");
  if (form && status) enhanceEmailForm(form, {
    subject: 'Community Hub demo', status,
    onLayoutChange: () => window.dispatchEvent(new CustomEvent('ch:fit', { detail: { anchor: window.chStory?.current() ?? null } })),
    fields: [{ name: 'name', label: 'Name' }, { name: 'org', label: 'Organization' }, { name: 'msg', label: 'Message' }],
  });
})();
