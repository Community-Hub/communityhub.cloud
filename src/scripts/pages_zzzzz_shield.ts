/** Public applications are directly usable. Their own controls own interaction;
 * no extra activation button, overlay or keyboard barrier is added by this site. */
(function () {
  const main = document.getElementById("main");
  if (!main) return;
  const known = new WeakSet<HTMLIFrameElement>();
  function connect() {
    main!.querySelectorAll<HTMLIFrameElement>("iframe").forEach(frame => {
      if (known.has(frame)) return;
      if (frame.hasAttribute("data-passive-preview")) { known.add(frame); return; }
      known.add(frame);
      frame.classList.remove("ch-embed-shield");
      frame.classList.add("ch-live");
      frame.tabIndex = 0;
      frame.dispatchEvent(new CustomEvent("ch:embed-interact", { bubbles: true }));
    });
  }
  connect();
  new MutationObserver(connect).observe(main, { childList: true, subtree: true });
})();
