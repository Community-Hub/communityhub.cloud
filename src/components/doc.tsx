import { useLocation } from "@tanstack/react-router";
import { Children, cloneElement, isValidElement, useEffect } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { siteIndex } from "@/lib/site-registry";
import { imageSize } from "@/lib/image-dimensions";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";

export type DocStop = { id: string; label: string };

/** A continuous vertical document page of one or more titled sections, followed by the site footer. */
export function DocShell({ stops, children }: { stops: readonly DocStop[]; children: ReactNode }) {
  const pathname = useLocation({ select: (l) => l.pathname.replace(/\/+$/, "") || "/" });
  const kids = Children.toArray(children);
  // One child per stop. An editor can hide a section (never the first); a page that does not line up is left alone.
  const aligned = kids.length === stops.length;
  const keep = stops.map((s, i) => !aligned || i === 0 || !siteIndex.isHidden(pathname, s.id));
  const shownKids = aligned ? kids.filter((_, i) => keep[i]) : kids;
  const shownStops = aligned ? stops.filter((_, i) => keep[i]) : stops;

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-field text-ink pt-16">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-8 md:px-8 md:py-12">
        {shownKids.map((kid, index) => {
          const stop = shownStops[index];
          if (isValidElement<{ id?: string; isFirst?: boolean }>(kid)) {
            return cloneElement(kid, {
              id: kid.props.id ?? stop?.id,
              isFirst: index === 0,
            });
          }
          return kid;
        })}
      </main>
      <div className="mt-8 border-t border-line bg-paper/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}

/** One titled section on a document page. The first one on a page carries the h1. */
export function DocSection({
  id,
  isFirst = false,
  label,
  title,
  as: Title = "h2",
  titleClassName,
  ledeClassName,
  lede,
  cut = 0,
  minShot = 6,
  children,
}: {
  id?: string;
  isFirst?: boolean;
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
  const sectionId = id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (
    <section
      id={sectionId}
      aria-label={label}
      className={cn(
        "scroll-mt-20",
        !isFirst && Title !== "h1" && "border-t border-pine/20 pt-10",
      )}
      style={cut ? ({ "--shot-h": `max(${minShot}rem, 26rem)` } as CSSProperties) : ({ "--shot-h": "28rem" } as CSSProperties)}
    >
      <Title className={titleClassName ?? (Title === "h1" ? "t-h1" : "t-h2")}>{title}</Title>
      {lede && <p className={`mt-2 max-w-3xl md:mt-3 ${ledeClassName ?? "t-lede"}`}>{lede}</p>}
      {children && <div className="mt-4 md:mt-6">{children}</div>}
    </section>
  );
}

/** Text left, image right (`stacked`: text above and a very wide picture full width below on md+); stacked on a phone, where `mediaFirst` puts the picture above the text. */
export function Split({ media, mediaFirst = false, stacked = false, children }: { media: ReactNode; mediaFirst?: boolean; stacked?: boolean; children: ReactNode }) {
  return (
    <div className={`grid items-start gap-6 md:gap-8 ${stacked ? "" : "md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]"}`}>
      <div className={`min-w-0 space-y-3 t-body ${stacked ? "md:max-w-3xl" : ""}`}>{children}</div>
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
