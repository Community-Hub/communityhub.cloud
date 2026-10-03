/** Give a live application's own scroll region the remaining visible scene space. */
export function availableToolRoom(height: number, top: number, reserve: number): number {
  return Math.max(80, Math.min(680, Math.floor(height - top - reserve)));
}
/** Where the tool sits when its section fills the screen below the sticky header. The tool's offset inside its section is layout, so this never depends on the scroll position. */
export function settledToolTop(headerHeight: number, sectionTop: number, toolTop: number): number {
  return Math.max(0, headerHeight) + (toolTop - sectionTop);
}
/** Keep the whole landscape story and its actual category controls together. */
export function availableVoicesStage(room: number, categories: number): number {
  return Math.max(240, Math.floor(room - categories - 10));
}
export function fitViewportTools(): void {
  const main = document.getElementById('main');
  if (!main) return;
  let queued = 0;
  const selector = '.native-voices-content, #main[data-page="see-it-live"] .lf-body';
  const fit = () => {
    queued = 0;
    main.querySelectorAll<HTMLElement>(selector).forEach(target => {
      if (target.closest('[inert]') || getComputedStyle(target).visibility === 'hidden') return;
      // Measure from the section, not the viewport: a scroll-dependent room resized the
      // scene (and clipped the categories) each time a community remount re-ran this.
      const section = target.closest('section');
      const header = document.querySelector<HTMLElement>('.hdr');
      const targetTop = target.getBoundingClientRect().top;
      const top = section
        ? settledToolTop(header?.getBoundingClientRect().height ?? 0, section.getBoundingClientRect().top, targetTop)
        : targetTop;
      if (!section && (top < 0 || top >= innerHeight)) return;
      // Only the next-scene circle (44px + 10px gap + room) sits below the tool: the same 60px every scene keeps clear.
      const reserve = 60;
      const value = `${availableToolRoom(innerHeight, top, reserve)}px`;
      if (target.style.getPropertyValue('--viewport-tool-room') !== value)
        target.style.setProperty('--viewport-tool-room', value);
      if (target.classList.contains('native-voices-content') && innerWidth >= 700) {
        const categories = target.querySelector<HTMLElement>('.native-categories');
        if (categories) {
          const stageRoom = `${availableVoicesStage(parseFloat(value), categories.getBoundingClientRect().height)}px`;
          if (target.style.getPropertyValue('--voices-stage-room') !== stageRoom)
            target.style.setProperty('--voices-stage-room', stageRoom);
        }
      }
    });
  };
  const schedule = () => { if (!queued) queued = requestAnimationFrame(fit); };
  window.addEventListener('ch:storychange', schedule);
  window.addEventListener('resize', schedule);
  main.addEventListener('load', schedule, true);
  new MutationObserver(schedule).observe(main, {childList:true,subtree:true});
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(main);
  document.fonts?.ready.then(schedule);
  schedule();
}
