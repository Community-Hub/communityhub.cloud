import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Partner pages are laid out for a desktop screen, so narrow boxes show them at this width, scaled down. */
const VIRTUAL_WIDTH = 1360;
/** A phone-sized box scales less, so the page stays readable. */
const NARROW_VIRTUAL_WIDTH = 600;

export type PortalEmbedKind = "oc" | "ops" | "city-of-oberlin" | "glsc";

/**
 * The four dh-public partner portals (`oc-embed`, `ops-embed`, `city-of-oberlin`, `glsc-embed`) open a 258px left sidebar
 * (`--opened-sidebar-width: 258px`, plus a 12px protruding toggle button up to x = 270px) on fresh cross-origin sessions
 * because `SidebarComponent` reads `localStorage.getItem("sidebarState")`. Rendering the partner banner across the top and
 * cropping `leftInset = 270` / `topInset = bannerH` collapses that sidebar pane so `.main-container` fills the frame cleanly.
 */
export function getPortalEmbedLayout(src: string): {
  kind: PortalEmbedKind;
  topInset: number;
  leftInset: number;
  virtualWidth: number;
  docHeight: number;
} | null {
  if (/\/dh-public\/oc-embed/.test(src)) {
    return { kind: "oc", topInset: 93, leftInset: 270, virtualWidth: 1120, docHeight: 980 };
  }
  if (/\/dh-public\/ops-embed/.test(src)) {
    return { kind: "ops", topInset: 179, leftInset: 270, virtualWidth: 1120, docHeight: 1080 };
  }
  if (/\/dh-public\/city-of-oberlin/.test(src)) {
    return { kind: "city-of-oberlin", topInset: 113, leftInset: 270, virtualWidth: 1120, docHeight: 1180 };
  }
  if (/\/dh-public\/glsc(-embed)?/.test(src)) {
    return { kind: "glsc", topInset: 110, leftInset: 270, virtualWidth: 1120, docHeight: 880 };
  }
  return null;
}

export function PortalPartnerBanner({ kind }: { kind: PortalEmbedKind }) {
  if (kind === "oc") {
    return (
      <div
        aria-hidden
        className="pointer-events-none flex h-9 w-full shrink-0 select-none items-center justify-between border-b-[3px] border-[#ffc72c] bg-[#a6192e] px-3 text-[#f4f4f2]"
      >
        <img
          src="https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/oberlin-college-logo.svg"
          alt=""
          draggable={false}
          className="h-5 w-auto"
        />
        <span className="text-xs font-semibold tracking-tight opacity-95">Home Oberlin College</span>
      </div>
    );
  }
  if (kind === "ops") {
    return (
      <div
        aria-hidden
        className="pointer-events-none flex h-10 w-full shrink-0 select-none items-center justify-between border-b border-black/10 px-3 text-[#f4f4f2]"
        style={{ background: "linear-gradient(rgb(1, 1, 53) 18%, rgb(29, 30, 74) 47%, rgb(244, 244, 242) 128%)" }}
      >
        <div className="flex items-center gap-2">
          <img
            src="https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/oberlin-schools.png"
            alt=""
            draggable={false}
            className="h-7 w-auto"
          />
          <span className="text-sm font-light tracking-tight">Oberlin City Schools</span>
        </div>
        <span className="text-xs font-semibold tracking-tight opacity-95">Home Oberlin City Schools</span>
      </div>
    );
  }
  if (kind === "city-of-oberlin") {
    return (
      <div
        aria-hidden
        className="pointer-events-none flex h-9 w-full shrink-0 select-none items-center justify-between border-b border-black/10 bg-[#a2b5bf] px-3 text-[#f4f4f2]"
      >
        <img
          src="https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/city-ofoberlin-logo.png"
          alt=""
          draggable={false}
          className="h-6 w-auto"
        />
        <span className="text-xs font-semibold tracking-tight opacity-95">Home City Of Oberlin</span>
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className="pointer-events-none relative flex h-10 w-full shrink-0 select-none items-center justify-between overflow-hidden border-b border-black/10 bg-[#d1eafc] px-3"
    >
      <div className="relative z-10 flex items-baseline gap-2">
        <span className="text-xs font-bold tracking-tight text-[#5bb951]">Cleveland Environmental Dashboard</span>
        <span className="text-xs font-medium text-neutral-700">educate, motivate, empower!</span>
      </div>
      <img
        src="https://communityhubstorage.cloud/ch-data-hub/data-hub/CLE_GLSCWebBanner.svg"
        alt=""
        draggable={false}
        className="h-full w-auto max-w-[55%] object-cover object-left opacity-90"
      />
    </div>
  );
}

/** A live page takes a moment; until it reports in (or a few seconds pass) the box shows a quiet loading mark, not an empty frame. */
export function useEmbedReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 6000);
    return () => window.clearTimeout(t);
  }, []);
  return [ready, () => setReady(true)] as const;
}

/**
 * A page inside an iframe swallows the wheel (and the keys, once clicked), so a visitor whose pointer rests on one cannot
 * scroll the site on. With a mouse the embed is covered by a clear shield until it is clicked: until then the wheel moves
 * the page. Leaving the box puts the shield back and hands the keyboard back to the page.
 */
export function useEmbedShield() {
  const leave = () => {
    if (document.activeElement instanceof HTMLIFrameElement) document.activeElement.blur();
  };
  return { shield: null, boxProps: { onPointerLeave: leave } };
}

/** Sits under the iframe, which is transparent until it paints. Draws no words, so there is no copy to edit. */
export function EmbedLoading({ ready }: { ready: boolean }) {
  return (
    <span
      aria-hidden
      data-embed-loading
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center bg-paper transition-opacity duration-300",
        ready && "opacity-0",
      )}
    >
      <span className="size-8 rounded-full border-2 border-line border-t-pine motion-safe:animate-spin" />
    </span>
  );
}

/**
 * A live embed. Wheel and touch scroll it directly; the page pager and dots still move chapters.
 * A box narrower than `narrowBelow` is drawn at the phone width, otherwise at `wideWidth`.
 * `children` sit over the embed (a cue such as "Scroll inside").
 */
export function GuardedEmbed({
  src,
  title,
  className,
  narrowBelow = 480,
  nativeSize = false,
  passive = false,
  wideWidth = VIRTUAL_WIDTH,
  children,
}: {
  src: string;
  title: string;
  className?: string;
  narrowBelow?: number;
  nativeSize?: boolean;
  passive?: boolean;
  wideWidth?: number;
  children?: ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useEmbedReady();
  const { shield, boxProps } = useEmbedShield();
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const apply = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const isBuildingDashboard = /\/dashboard\/\d+/.test(src);
  const isCitywideDashboard = /cwd-files|citywide-dashboard/.test(src);
  const isSingleFrameEmbed = isCitywideDashboard || /\/heat-map\//.test(src);
  const portalLayout = getPortalEmbedLayout(src);
  const hideScrollbar = passive || isSingleFrameEmbed;
  const effectiveWideWidth = portalLayout
    ? portalLayout.virtualWidth
    : isBuildingDashboard && wideWidth === VIRTUAL_WIDTH
      ? 1440
      : wideWidth;
  const virtualWidth = !passive && !portalLayout && box.w && box.w < narrowBelow ? NARROW_VIRTUAL_WIDTH : effectiveWideWidth;
  const scale = nativeSize || isCitywideDashboard ? 1 : box.w ? Math.min(1, box.w / virtualWidth) : 1;
  const bannerPx = portalLayout ? (portalLayout.kind === "ops" || portalLayout.kind === "glsc" ? 40 : 36) : 0;
  const topInset = portalLayout ? portalLayout.topInset : passive && isBuildingDashboard ? 92 : 0;
  const leftInset = portalLayout ? portalLayout.leftInset : 0;
  const unscaledW = box.w ? box.w / scale + leftInset + (hideScrollbar && scale < 1 ? 18 : 0) : 0;
  const unscaledH = box.h ? Math.max(0, box.h - bannerPx) / scale + topInset : 0;
  return (
    <div ref={boxRef} aria-busy={!ready} {...(children ? {} : boxProps)} className={cn("relative block w-full overflow-hidden bg-paper", className)}>
      {/* A finger landing just above the embed is snapped to it by the browser and the page never sees the swipe; this strip keeps those touches. */}
      <span aria-hidden className="absolute inset-x-0 top-0 z-10 hidden h-3 pointer-coarse:block" />
      <EmbedLoading ready={ready} />
      {portalLayout && (
        <div className="relative z-10 w-full">
          <PortalPartnerBanner kind={portalLayout.kind} />
        </div>
      )}
      {passive ? <span aria-hidden data-passive-preview className="absolute inset-0 z-10" /> : !children && shield}
      <iframe
        src={src}
        onLoad={setReady}
        title={title}
        loading="lazy"
        scrolling={hideScrollbar ? "no" : undefined}
        tabIndex={passive ? -1 : undefined}
        className={cn("absolute left-0 origin-top-left border-0", passive && "pointer-events-none")}
        style={{
          top: bannerPx - topInset * scale,
          left: leftInset ? -leftInset * scale : 0,
          width: unscaledW || "100%",
          height: unscaledH || "100%",
          transform: scale === 1 ? undefined : `scale(${scale})`,
        }}
      />
      {children}
    </div>
  );
}
