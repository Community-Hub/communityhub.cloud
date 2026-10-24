import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { Chapter } from "@/components/storyboard";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
export const FOOTER = pc.siteFooter.FOOTER;
const DOORS = pc.siteFooter.DOORS;

export function SiteFooter() {
  return (
    <footer className="t-small text-ink">
      {/* Two columns on a phone: Products down the left, the other two stacked on the right. */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 sm:gap-8">
        {FOOTER.map((col, i) => (
          <div key={col.title} className={i === 0 ? "max-sm:row-span-2" : undefined}>
            <p className="mb-1 text-[0.9375rem] font-semibold text-pine">{col.title}</p>
            {/* On a short screen the long Products list runs in two columns so the footer still fits. */}
            <ul className={i === 0 ? "mt-1 short:sm:columns-2 short:sm:gap-x-4" : "mt-1"}>
              {col.links.map((link) => (
                <li key={link.label} className={cn("break-inside-avoid", link.hideOnPhone && "max-sm:hidden")}>
                  <AppLink href={link.href} className="inline-flex min-h-8 items-center hover:text-pine short:min-h-7">
                    {link.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2 border-t border-line pt-3 sm:mt-6 sm:gap-3 sm:pt-5 short:mt-3 short:pt-2 md:flex-row md:items-start md:justify-between">
        <p className="max-w-md max-sm:hidden">{copy.siteFooter.SiteFooter.p1}</p>
        <p>{copy.siteFooter.SiteFooter.p2}{" "}
          <a href={`mailto:${site.contactEmail}`} className="inline-flex min-h-8 items-center font-bold text-pine underline underline-offset-4">
            {site.contactEmail}
          </a>
        </p>
      </div>
      <nav aria-label="Legal" className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-line pt-3 t-small">
        <AppLink href="/privacy-policy" className="inline-flex min-h-11 items-center font-bold text-pine underline decoration-2 underline-offset-4">
          Privacy Policy
        </AppLink>
        <AppLink href="/terms-of-service" className="inline-flex min-h-11 items-center font-bold text-pine underline decoration-2 underline-offset-4">
          Terms of Service
        </AppLink>
        <span className="text-ink/80">Community Hub Inc · Oberlin, Ohio</span>
      </nav>
    </footer>
  );
}

/** The last stop of every paged screen: the one footer. */
export function FooterChapter({ className = "bg-field text-ink" }: { className?: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  // A fade and chevron show while there is more footer below; they go once it is all in view.
  const check = useCallback(() => {
    const el = scroller.current;
    if (el) setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 40);
  }, []);
  useEffect(() => {
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [check]);
  return (
    <Chapter label={copy.siteFooter.FooterChapter.Chapter_label1} className={className}>
      <div ref={scroller} onScroll={check} data-allow-scroll className="scroll-visible relative h-full">
        {/* The last stop has no Next button, so it needs no room under it. */}
        <div className="wrap screen-pad pb-8! max-md:pt-[calc(var(--header-h)+0.75rem)] max-sm:pb-3!">
          <h2 className="t-h2">{copy.siteFooter.FooterChapter.h21}</h2>
          <p className="mt-1 t-lede max-sm:t-small">{copy.siteFooter.FooterChapter.p1}</p>
          <p className="mt-2 max-w-2xl t-body max-sm:hidden">{copy.siteFooter.FooterChapter.p2}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-6 max-sm:gap-x-4 max-sm:t-small sm:mt-2">
            <a href={site.contactHref} className="link inline-flex min-h-11 items-center font-bold max-sm:min-h-10 short:min-h-9">{copy.siteFooter.FooterChapter.a1}</a>
            <ul data-footer-doors aria-label={copy.siteFooter.FooterChapter.ul_aria_label1} className="flex flex-wrap gap-x-6 max-sm:gap-x-4">
              {DOORS.map((door) => (
                <li key={door.label}>
                  <AppLink href={door.href} className="link inline-flex min-h-11 items-center max-sm:min-h-10 short:min-h-9">
                    {door.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-1 sm:mt-4">
            <SiteFooter />
          </div>
        </div>
        <div
          aria-hidden
          className={`pointer-events-none sticky bottom-0 -mt-14 flex h-14 items-end justify-center bg-gradient-to-t from-field to-transparent pb-1 transition-opacity ${more ? "opacity-100" : "opacity-0"}`}
        >
          <ChevronDown className="size-6 text-ink" strokeWidth={2.25} />
        </div>
      </div>
    </Chapter>
  );
}
