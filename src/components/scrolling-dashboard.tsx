import { useEffect, useRef, useState } from "react";
import { EmbedLoading, getPortalEmbedLayout, PortalPartnerBanner, useEmbedReady } from "@/components/guarded-embed";

/** Scroll the live document's outer viewport at desktop layout width, with no scrollbar noise. */
export function ScrollingDashboard({
  src,
  title,
  running,
  partnerHeader,
  passiveMarker = false,
  virtualWidthOverride,
  onComplete,
}: {
  src: string;
  title: string;
  running: boolean;
  partnerHeader?: string;
  passiveMarker?: boolean;
  virtualWidthOverride?: number;
  onComplete?: () => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useEmbedReady();
  const [hovered, setHovered] = useState(false);
  const [touching, setTouching] = useState(false);
  const [reportedHeight, setReportedHeight] = useState<number | null>(null);
  const manualUntil = useRef(0);
  const lastAutoScrollTop = useRef(0);
  const elapsed = useRef(0);
  const subpixel = useRef(0);
  const bottomTime = useRef(0);
  const completed = useRef(false);
  const complete = useRef(onComplete);
  complete.current = onComplete;

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const apply = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setReportedHeight(null);
    elapsed.current = 0;
    subpixel.current = 0;
    bottomTime.current = 0;
    completed.current = false;
    if (viewport.current) viewport.current.scrollTop = 0;
    const onMessage = (event: MessageEvent) => {
      if (
        event.source === iframeRef.current?.contentWindow &&
        event.data?.messageType === "content-resize" &&
        typeof event.data.height === "number" &&
        Number.isFinite(event.data.height) &&
        event.data.height >= 700
      ) {
        setReportedHeight(Math.ceil(event.data.height));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [src]);

  const isBuildingDashboard = /\/dashboard\/\d+/.test(src);
  const portalLayout = getPortalEmbedLayout(src);
  const virtualWidth = virtualWidthOverride ?? (portalLayout ? portalLayout.virtualWidth : isBuildingDashboard ? 1440 : 1360);
  const scale = box.w ? Math.min(1, box.w / virtualWidth) : 1;
  const topInset = portalLayout ? portalLayout.topInset : isBuildingDashboard ? 92 : 0;
  const leftInset = portalLayout ? portalLayout.leftInset : 0;

  // Desktop-width document heights, refined dynamically when dh-public posts content-resize.
  const defaultDocHeight = portalLayout
    ? portalLayout.docHeight
    : src.includes("/815")
      ? 2550
      : src.includes("/529")
        ? 2150
        : src.includes("/953")
          ? 2450
          : src.includes("/calendar")
            ? 1500
            : 1650;
  const docHeight =
    portalLayout && reportedHeight !== null && reportedHeight < 1350
      ? portalLayout.docHeight
      : (reportedHeight ?? defaultDocHeight);
  const unscaledW = box.w ? box.w / scale + leftInset + 18 : virtualWidth + leftInset + 18;
  const visibleUnscaledH = Math.max(400, docHeight - topInset);
  const scaledHeight = Math.max(box.h, Math.ceil(visibleUnscaledH * scale));

  useEffect(() => {
    if (!running || !ready || touching || hovered) return;
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      const delta = last ? Math.min(now - last, 64) : 0;
      last = now;
      const el = viewport.current;
      if (now < manualUntil.current) {
        elapsed.current = 1200;
        subpixel.current = 0;
      } else {
        elapsed.current += delta;
        if (el && elapsed.current > 2000) {
          const step = delta * 0.048 + subpixel.current;
          const whole = Math.trunc(step);
          subpixel.current = step - whole;
          if (whole > 0) {
            const nextTop = el.scrollTop + whole;
            lastAutoScrollTop.current = nextTop;
            el.scrollTop = nextTop;
          }
          if (el.scrollTop >= el.scrollHeight - el.clientHeight - 2) {
            bottomTime.current += delta;
            if (bottomTime.current > 1800 && !completed.current) {
              completed.current = true;
              if (complete.current) {
                complete.current();
              } else {
                lastAutoScrollTop.current = 0;
                el.scrollTop = 0;
                elapsed.current = 0;
                bottomTime.current = 0;
                completed.current = false;
              }
            }
          } else {
            bottomTime.current = 0;
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, ready, touching, hovered]);

  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden bg-white"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHovered(true);
      }}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse" && !hovered) setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onWheel={(event) => {
        event.stopPropagation();
        manualUntil.current = performance.now() + 2500;
        const el = viewport.current;
        if (el && event.target !== el && !el.contains(event.target as Node)) {
          el.scrollTop += event.deltaY;
        }
      }}
    >
      {partnerHeader && (
        <img
          src={partnerHeader}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none block aspect-[960/90] w-full shrink-0 select-none object-cover object-top"
        />
      )}
      {!partnerHeader && portalLayout && <PortalPartnerBanner kind={portalLayout.kind} />}
      <div
        ref={viewport}
        data-dashboard-scroll
        data-running={running && !touching && !hovered}
        data-allow-scroll
        aria-busy={!ready}
        onWheel={(event) => {
          event.stopPropagation();
          manualUntil.current = performance.now() + 2500;
        }}
        onScroll={(event) => {
          const top = event.currentTarget.scrollTop;
          if (Math.abs(top - lastAutoScrollTop.current) > 2) {
            manualUntil.current = performance.now() + 2500;
            lastAutoScrollTop.current = top;
          }
        }}
        onTouchStart={() => setTouching(true)}
        onTouchEnd={() => setTouching(false)}
        onTouchCancel={() => setTouching(false)}
        tabIndex={0}
        aria-label={`${title} scrolling preview`}
        className="relative min-h-0 flex-1 w-full overflow-y-auto overflow-x-hidden overscroll-contain bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <EmbedLoading ready={ready} />
        {passiveMarker && <span aria-hidden data-passive-preview className="pointer-events-none absolute inset-0 z-10" />}
        {box.w > 0 && (
          <div className="relative w-full overflow-hidden" style={{ height: scaledHeight }}>
            <iframe
              ref={iframeRef}
              src={src}
              title={title}
              onLoad={setReady}
              scrolling="no"
              tabIndex={-1}
              className="absolute left-0 origin-top-left border-0"
              style={{
                top: topInset ? -topInset * scale : 0,
                left: leftInset ? -leftInset * scale : 0,
                width: unscaledW,
                height: docHeight + 120,
                transform: `scale(${scale})`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

