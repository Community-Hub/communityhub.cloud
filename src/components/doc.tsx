import { useLocation } from "@tanstack/react-router";
import { Children, cloneElement, isValidElement, useEffect } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { siteIndex } from "@/lib/site-registry";
import { imageSize } from "@/lib/image-dimensions";
import { consumeNavigationTarget } from "@/lib/use-hash-stops";
import { SiteFooter } from "@/components/site-footer";
import { ContactBand } from "@/components/contact-band";
import { cn } from "@/lib/utils";

export type DocStop = { id: string; label: string };

/** A continuous vertical document page of one or more titled sections, followed by the site footer. */
/** `cta`: end the page with the Contact us band (default). */
export function DocShell({ stops, children, cta = true }: { stops: readonly DocStop[]; children: ReactNode; cta?: boolean }) {
  const pathname = useLocation({ select: (l) => l.pathname.replace(/\/+$/, "") || "/" });
  const kids = Children.toArray(children);
  // One child per stop. An editor can hide a section (never the first); a page that does not line up is left alone.
  const aligned = kids.length === stops.length;
  const keep = stops.map((s, i) => !aligned || i === 0 || !siteIndex.isHidden(pathname, s.id));
  const shownKids = aligned ? kids.filter((_, i) => keep[i]) : kids;
  const shownStops = aligned ? stops.filter((_, i) => keep[i]) : stops;

  useEffect(() => {
    const scrollToTarget = (target: string) => {
      if (!target) return;
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    const initial = consumeNavigationTarget();
    if (initial) scrollToTarget(initial);

    const onTarget = (event: Event) => {
      const target = (event as CustomEvent<string>).detail;
      consumeNavigationTarget();
      if (target) scrollToTarget(target);
    };
    const onHash = () => {
      const target = consumeNavigationTarget();
      if (target) scrollToTarget(target);
    };
    window.addEventListener("ch:target", onTarget);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("ch:target", onTarget);
      window.removeEventListener("hashchange", onHash);
    };
  }, [pathname]);

  return (
    <div className="bg-paper text-ink">
      <main id="main" className="doc-main wrap">
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
      {cta && <ContactBand />}
      <SiteFooter />
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
      className={cn("doc-section-block scroll-mt-24", !isFirst && Title !== "h1" && "doc-section-rule")}
      style={cut ? ({ "--shot-h": `max(${minShot}rem, 26rem)` } as CSSProperties) : ({ "--shot-h": "30rem" } as CSSProperties)}
    >
      <Title className={titleClassName ?? (Title === "h1" ? "t-h1 max-w-4xl" : "t-h2 max-w-3xl")}>{title}</Title>
      {lede && <p className={cn("max-w-3xl", Title === "h1" ? "mt-5" : "mt-4", ledeClassName ?? "t-lede")}>{lede}</p>}
      {children && <div className={Title === "h1" ? "mt-10 md:mt-12" : "mt-8 md:mt-10"}>{children}</div>}
    </section>
  );
}

/** Text left, image right (`stacked`: text above and a very wide picture full width below on md+); stacked on a phone, where `mediaFirst` puts the picture above the text. */
export function Split({ media, mediaFirst = false, stacked = false, children }: { media: ReactNode; mediaFirst?: boolean; stacked?: boolean; children: ReactNode }) {
  return (
    <div className={`grid items-start gap-8 md:gap-12 ${stacked ? "" : "md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]"}`}>
      <div className={`min-w-0 space-y-4 t-body text-ink/85 ${stacked ? "md:max-w-3xl" : ""}`}>{children}</div>
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
      className={`block h-auto max-h-(--shot-h) max-w-full rounded-[1.25rem] border border-line bg-paper object-contain object-left-top ${className}`}
    />
  );
}
