// Native disclosure keeps chapter access in the existing navigation row.
const contents = document.querySelector<HTMLDetailsElement>("[data-page-contents]");
if (contents) {
  const trigger = contents.querySelector<HTMLElement>("summary");
  const close = (restore = false) => {
    if (!contents.open) return;
    contents.open = false;
    if (restore) trigger?.focus({ preventScroll: true });
  };
  contents.addEventListener("toggle", () => {
    if (!contents.open) return;
    document.querySelectorAll<HTMLElement>(".dd .nav-btn[aria-expanded=true]").forEach(button => button.click());
  });
  contents.addEventListener("click", event => {
    if ((event.target as Element)?.closest("a[href]")) close(true);
  });
  contents.addEventListener("focusout", event => {
    if (!contents.contains(event.relatedTarget as Node | null)) close();
  });
  contents.addEventListener("keydown", event => {
    if (event.key !== "Tab" || !contents.open) return;
    const items = Array.from(contents.querySelectorAll<HTMLElement>("summary, a[href]"));
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = items[index + (event.shiftKey ? -1 : 1)];
    if (!next) return;
    event.preventDefault();
    next.focus({ preventScroll: true });
    const panel = contents.querySelector<HTMLElement>(".page-contents-panel");
    if (panel?.contains(next)) {
      const bounds = panel.getBoundingClientRect(), item = next.getBoundingClientRect();
      if (item.top < bounds.top) panel.scrollTop += item.top - bounds.top;
      else if (item.bottom > bounds.bottom) panel.scrollTop += item.bottom - bounds.bottom;
    }
  });
  document.addEventListener("pointerdown", event => {
    if (!contents.contains(event.target as Node)) close();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && contents.open) {
      event.preventDefault();
      close(true);
    }
  });
  document.querySelectorAll(".menu-btn, .nav-btn").forEach(button => button.addEventListener("click", () => close()));
}
