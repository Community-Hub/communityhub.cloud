/** Parent-owned scrolling keeps the scrollbar and its attention cue in the same document. */
export const EMBED_SCROLL_REGIONS = [
  '.lf-body', '.native-scroll', '.native-voices-content', '.native-application-viewport',
  '.native-phone-screen', '.zpb-emb-site', '.pw-picker', '.ev-mini', '.rs-lessons',
  '.hf-source-model', '.hf-grid', '.lv-box',
].join(',');

/** Reject malformed measurements rather than disabling a frame's native scrolling. */
export function reportedEmbedHeight(value: unknown): number | null {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return null;
  const height = Number(value);
  return Number.isFinite(height) && height > 0 && height <= 100000 ? Math.ceil(height) : null;
}

export function hasEmbedOverflow(scrollHeight: number, clientHeight: number): boolean {
  return clientHeight > 0 && scrollHeight - clientHeight > 1;
}

export function fittedEmbedSize(viewportWidth: number, sourceWidth: number, sourceHeight: number) {
  const width = Math.max(1, viewportWidth, sourceWidth);
  const scale = Math.min(1, Math.max(0, viewportWidth) / width);
  return { width, scale, height: Math.ceil(sourceHeight * scale) };
}

export function initEmbedScroll(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined'
    || typeof document.querySelectorAll !== 'function' || typeof document.createElement !== 'function') return;
  const main = document.getElementById('main');
  if (!main) return;
  const regions = new Set<HTMLElement>();
  const measured = new Map<HTMLIFrameElement, { region: HTMLElement; width: number; height: number }>();
  const canFitWithoutMoving = typeof CSS !== 'undefined' && CSS.supports('zoom', '0.5');
  let queued = 0;
  const style = (el: HTMLElement, property: string, value: string) => {
    if (el.style.getPropertyValue(property) !== value || el.style.getPropertyPriority(property) !== 'important')
      el.style.setProperty(property, value, 'important');
  };
  const schedule = () => { if (!queued) queued = requestAnimationFrame(refresh); };
  const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);

  function discover() {
    main!.querySelectorAll<HTMLElement>(EMBED_SCROLL_REGIONS).forEach(region => {
      if (regions.has(region)) return;
      regions.add(region);
      resize?.observe(region);
      Array.from(region.children).forEach(child => resize?.observe(child));
    });
  }

  function fitFrames() {
    measured.forEach((entry, frame) => {
      if (!main!.contains(frame)) { measured.delete(frame); return; }
      const { region } = entry;
      if (!region.clientWidth) return;
      const size = fittedEmbedSize(region.clientWidth, entry.width, entry.height);
      // Changing an iframe's parent reloads its browsing context. Keep the live
      // frame in place; zoom scales its layout overflow as well as its pixels.
      // Absolute positioning also keeps tall phone content from growing its bezel.
      style(frame, 'position', 'absolute');
      style(frame, 'inset', '0 auto auto 0');
      style(frame, 'max-width', 'none');
      style(frame, 'width', `${size.width}px`);
      style(frame, 'height', `${entry.height}px`);
      style(frame, 'transform', 'none');
      style(frame, 'zoom', String(size.scale));
      style(frame, 'transform-origin', '0 0');
    });
  }

  function refresh() {
    queued = 0;
    discover();
    fitFrames();
    let changed = false;
    const parents = new Set<HTMLElement>();
    regions.forEach(region => {
      if (!main!.contains(region)) { resize?.unobserve(region); regions.delete(region); return; }
      const parent = region.parentElement;
      if (parent) parents.add(parent);
      // Hidden cached tabs keep their allocation until visible again. A zero-sized
      // hidden region is not evidence that its content has stopped overflowing.
      if (!region.clientHeight || !region.clientWidth) return;
      const overflow = getComputedStyle(region).overflowY;
      // Keep an allocated gutter for this region's lifetime. Narrowing a scaled
      // embed can make its content fit; removing the gutter then makes it taller
      // again. Releasing it from that post-layout measurement creates an endless
      // resize loop. Native overflow:auto and the guide still use real overflow.
      const active = hasEmbedOverflow(region.scrollHeight, region.clientHeight)
        && (overflow === 'auto' || overflow === 'scroll');
      if (region.hasAttribute('data-embed-scroll') !== active) {
        region.toggleAttribute('data-embed-scroll', active);
        changed = true;
      }
      if (active && !region.hasAttribute('data-embed-scroll-reserved')) {
        region.setAttribute('data-embed-scroll-reserved', '');
        region.classList.add('embed-scroll-region');
        changed = true;
        region.setAttribute('data-scroll-owner', '');
        if (!region.hasAttribute('tabindex')) region.tabIndex = 0;
        if (!region.hasAttribute('role')) region.setAttribute('role', 'region');
        if (!region.hasAttribute('aria-label') && !region.hasAttribute('aria-labelledby')) {
          const frame = region.querySelector<HTMLIFrameElement>('iframe');
          const title = frame?.title || region.closest<HTMLElement>('[data-title]')?.dataset.title;
          region.setAttribute('aria-label', title ? `${title}, scroll to explore` : 'Scrollable content');
        }
      }
    });
    parents.forEach(parent => {
      const active = Array.from(parent.children).some(child => child.hasAttribute('data-embed-scroll-reserved'));
      if (parent.classList.contains('embed-scroll-shell') !== active) {
        parent.classList.toggle('embed-scroll-shell', active);
        changed = true;
      }
    });
    if (changed) window.dispatchEvent(new Event('ch:embed-scrollchange'));
  }

  window.addEventListener('message', event => {
    // Native frame scrolling is the safe fallback on older browser engines.
    if (!canFitWithoutMoving) return;
    if (event.data?.messageType !== 'content-resize') return;
    const height = reportedEmbedHeight(event.data.height);
    if (height === null) return;
    const frame = Array.from(main.querySelectorAll<HTMLIFrameElement>('.lf-body iframe, .native-application-viewport iframe, .native-phone-screen iframe'))
      .find(candidate => candidate.contentWindow === event.source);
    if (!frame || frame.hasAttribute('data-passive-preview')) return;
    const source = frame.getAttribute('src') || frame.dataset.deferSrc;
    if (!source) return;
    try { if (event.origin !== new URL(source, location.href).origin) return; } catch { return; }
    let entry = measured.get(frame);
    if (!entry) {
      const region = frame.closest<HTMLElement>('.lf-body, .native-application-viewport, .native-phone-screen');
      if (!region) return;
      // Preserve an established desktop canvas when the existing phone layout scales it.
      const transform = getComputedStyle(frame).transform;
      const scaled = transform !== 'none' && Math.abs(new DOMMatrixReadOnly(transform).a - 1) > .001;
      const width = scaled ? frame.offsetWidth : 0;
      region.classList.add('embed-content-fitted');
      style(region, 'overflow-y', 'auto');
      style(region, 'overflow-x', 'hidden');
      entry = { region, width, height };
      measured.set(frame, entry);
    }
    entry.height = height;
    frame.setAttribute('data-embed-measured-frame', '');
    frame.setAttribute('scrolling', 'no');
    fitFrames();
    schedule();
  });

  window.addEventListener('resize', schedule);
  window.addEventListener('ch:storychange', schedule);
  main.addEventListener('load', schedule, true);
  new MutationObserver(schedule).observe(main, {
    childList: true, subtree: true, attributes: true,
    // Region/child geometry is already observed above. Watching every animation
    // class and inline style in the page feeds unrelated layout work back here.
    attributeFilter: ['hidden', 'inert', 'src'],
  });
  document.fonts?.ready.then(schedule);
  schedule();
}
