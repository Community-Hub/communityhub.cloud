import { useLocation } from "@tanstack/react-router";
import { Children, isValidElement, useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { siteIndex } from "@/lib/site-registry";
import { imageSize } from "@/lib/image-dimensions";
import { FooterChapter } from "@/components/site-footer";
import { Chapter, Storyboard } from "@/components/storyboard";

export type DocStop = { id: string; label: string };

/** A page of one or more titled sections, one per screen, then the footer. Same paging, dots, Next and swipe as the home page. */
export function DocShell({ stops, children }: { stops: readonly DocStop[]; children: ReactNode }) {
  const pathname = useLocation({ select: (l) => l.pathname.replace(/\/+$/, "") || "/" });
  const kids = Children.toArray(children);
  // One child per stop. An editor can hide a section (never the first); a page that does not line up is left alone.
  const aligned = kids.length === stops.length;
  const keep = stops.map((s, i) => !aligned || i === 0 || !siteIndex.isHidden(pathname, s.id));
  const shownStops = stops
    .filter((_, i) => keep[i])
    .map((s) => {
      const kid = kids[stops.indexOf(s)];
      // The dots follow the heading the editors can change.
      const label = aligned && isValidElement<{ label?: unknown }>(kid) && typeof kid.props.label === "string" ? kid.props.label : s.label;
      return { ...s, label };
    });
  const all = [...shownStops, { id: "footer", label: "Footer" }];
  return (
    <Storyboard labels={all.map((s) => s.label)} ids={all.map((s) => s.id)}>
      {aligned ? kids.filter((_, i) => keep[i]) : children}
      <FooterChapter />
    </Storyboard>
  );
}

/** A scroll area that shows a bottom fade while there is more below, so an overflowing screen says so. */
function ScrollFade({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 4);
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, []);
  // On a phone the scroll viewport itself stops above the fixed Next button, so content can never pass under it mid-scroll; the fade sits on that viewport's actual bottom edge. Desktop keeps the full-height viewport and its raised fade.
  return (
    <div className="relative h-[calc(100%-var(--chrome-bottom))] md:h-full">
      <div ref={ref} data-allow-scroll className="scroll-visible h-full">
        {children}
      </div>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-field to-transparent transition-opacity md:bottom-(--chrome-bottom) ${more ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

/** One titled screen. The first one on a page carries the h1. */
export function DocSection({
  label,
  title,
  as: Title = "h2",
  titleClassName,
  ledeClassName,
  lede,
  cut = lede ? 6 : 0,
  minShot = 6,
  children,
}: {
  label: string;
  title: string;
  as?: ElementType;
  titleClassName?: string;
  ledeClassName?: string;
  lede?: string;
  /** Rem taken from the picture budget by anything else on this screen (a lede, a tab row). */
  cut?: number;
  /** Rem floor for the picture, so a long lede above it cannot squeeze it to a thumbnail on a phone. */
  minShot?: number;
  children?: ReactNode;
}) {
  return (
    <Chapter label={label} className="bg-field text-ink">
      <ScrollFade>
        <div className={"wrap screen-pad max-md:pt-[calc(var(--header-h)+0.75rem)] max-md:pb-4"} style={cut ? ({ "--shot-h": `max(${minShot}rem, calc(var(--shot-base) - ${cut}rem))` } as CSSProperties) : undefined}>
          <Title className={titleClassName ?? (Title === "h1" ? "t-h1" : "t-h2")}>{title}</Title>
          {lede && <p className={`mt-2 max-w-3xl md:mt-3 ${ledeClassName ?? "t-lede short:t-small"}`}>{lede}</p>}
          {children && <div className="mt-3 md:mt-6">{children}</div>}
        </div>
      </ScrollFade>
    </Chapter>
  );
}

/** Text left, image right (`stacked`: text above and a very wide picture full width below on md+); stacked on a phone, where `mediaFirst` puts the picture above the text so long copy cannot push it under the Next button. */
export function Split({ media, mediaFirst = false, stacked = false, children }: { media: ReactNode; mediaFirst?: boolean; stacked?: boolean; children: ReactNode }) {
  return (
    <div className={`grid items-start gap-4 md:gap-8 ${stacked ? "" : "md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"}`}>
      <div className={`min-w-0 md:order-last space-y-3 t-body short:space-y-2 short:t-small ${stacked ? "md:max-w-3xl" : ""}`}>{children}</div>
      <div className={`min-w-0 ${mediaFirst ? "max-md:order-first" : ""}`}>{media}</div>
    </div>
  );
}

/** One picture sized from the shared screen budget. Intrinsic width/height reserve its aspect box before it loads. */
export function Shot({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const size = imageSize(src);
  return (
    <img loading="lazy" decoding="async"
      src={src}
      alt={alt}
      width={size?.width}
      height={size?.height}
      className={`block h-auto max-h-(--shot-h) max-w-full rounded-md border border-line bg-paper object-contain object-left-top shadow-[0_1px_3px_rgba(36,75,56,0.07)] ${className}`}
    />
  );
}
