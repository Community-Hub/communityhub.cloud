import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Partner pages are laid out for a desktop screen, so narrow boxes show them at this width, scaled down. */
const VIRTUAL_WIDTH = 960;
/** A phone-sized box scales less, so the page stays readable. */
const NARROW_VIRTUAL_WIDTH = 600;

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
  const [active, setActive] = useState(false);
  const leave = () => {
    setActive(false);
    if (document.activeElement instanceof HTMLIFrameElement) document.activeElement.blur();
  };
  const shield = active ? null : (
    <span aria-hidden data-embed-shield onClick={() => setActive(true)} className="absolute inset-0 z-10 hidden pointer-fine:block" />
  );
  return { shield, boxProps: { onPointerLeave: leave } };
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
  const virtualWidth = box.w && box.w < narrowBelow ? NARROW_VIRTUAL_WIDTH : wideWidth;
  const scale = nativeSize ? 1 : box.w ? Math.min(1, box.w / virtualWidth) : 1;
  return (
    <div ref={boxRef} aria-busy={!ready} {...(children ? {} : boxProps)} className={cn("relative block w-full overflow-hidden bg-paper", className)}>
      {/* A finger landing just above the embed is snapped to it by the browser and the page never sees the swipe; this strip keeps those touches. */}
      <span aria-hidden className="absolute inset-x-0 top-0 z-10 hidden h-3 pointer-coarse:block" />
      <EmbedLoading ready={ready} />
      {passive ? <span aria-hidden data-passive-preview className="absolute inset-0 z-10" /> : !children && shield}
      <iframe
        src={src}
        onLoad={setReady}
        title={title}
        loading="lazy"
        tabIndex={passive ? -1 : undefined}
        className={cn("absolute top-0 left-0 origin-top-left border-0", passive && "pointer-events-none")}
        style={{ width: box.w / scale || "100%", height: box.h / scale || "100%", transform: `scale(${scale})` }}
      />
      {children}
    </div>
  );
}
