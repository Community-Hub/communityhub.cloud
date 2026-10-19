import { useEffect, useRef, useState } from "react";

/** Scroll the live document's outer viewport, without scripting across origins. */
export function ScrollingDashboard({ src, title, running, onComplete }: {
  src: string; title: string; running: boolean; onComplete?: () => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [touching, setTouching] = useState(false);
  const elapsed = useRef(0);
  const bottomTime = useRef(0);
  const completed = useRef(false);
  const complete = useRef(onComplete);
  complete.current = onComplete;
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  // Full-document heights are calibrated against the published responsive dashboards.
  const height = src.includes('/815') ? (width < 600 ? 4800 : 4500)
    : src.includes('/529') ? (width < 600 ? 5600 : 4300)
    : (width < 600 ? 5260 : 4570);
  useEffect(() => {
    if (!running || !loaded || touching) return;
    let raf = 0;
    let last = 0;
    let position = viewport.current?.scrollTop ?? 0;
    const tick = (now: number) => {
      const delta = last ? Math.min(now - last, 64) : 0;
      last = now;
      elapsed.current += delta;
      const el = viewport.current;
      if (el && elapsed.current > 3000) {
        position += delta * .03;
        el.scrollTop = position;
        if (el.scrollTop >= el.scrollHeight - el.clientHeight - 2) {
          bottomTime.current += delta;
          if (bottomTime.current > 2000 && !completed.current) {
            completed.current = true;
            complete.current?.();
          }
        } else bottomTime.current = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, loaded, touching]);
  return <div ref={viewport} data-dashboard-scroll data-running={running && !touching} data-allow-scroll
    onWheel={event => event.stopPropagation()}
    onTouchStart={() => setTouching(true)} onTouchEnd={() => setTouching(false)} onTouchCancel={() => setTouching(false)} tabIndex={0}
    aria-label={`${title} scrolling preview`} className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain bg-white">
    {width > 0 && <iframe src={src} title={title} onLoad={() => setLoaded(true)} tabIndex={-1}
      className="block w-full border-0 pointer-events-none" style={{height}} />}
  </div>;
}
