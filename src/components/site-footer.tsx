import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { Chapter } from "@/components/storyboard";
import { bundles } from "@/lib/pricing";
import { quoteHref } from "@/lib/links";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { whoStops } from "@/lib/who";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
export const FOOTER = pc.siteFooter.FOOTER;
const DOORS = pc.siteFooter.DOORS;

const FOOTER_TABS = [
  { id: "contact", label: "Contact Us" },
  { id: "who", label: "Who It’s For" },
  { id: "pricing", label: "Pricing" },
] as const;

export function SiteFooter() {
  return (
    <footer className="t-small text-ink">
      {/* Two columns on a phone: Products down the left, the other two stacked on the right. */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 sm:gap-8">
        {FOOTER.map((col, i) => (
          <div key={col.title} className={i === 0 ? "max-sm:row-span-2" : undefined}>
            <p className="eyebrow">{col.title}</p>
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
  const [activeTab, setActiveTab] = useState<(typeof FOOTER_TABS)[number]["id"]>("contact");

  const check = useCallback(() => {
    const el = scroller.current;
    if (el) setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 40);
  }, []);
  useEffect(() => {
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [check, activeTab]);

  return (
    <Chapter label={copy.siteFooter.FooterChapter.Chapter_label1} className={className}>
      <div ref={scroller} onScroll={check} data-allow-scroll className="scroll-visible relative h-full">
        <div className="wrap screen-pad pb-8! max-md:pt-[calc(var(--header-h)+1.25rem)] max-sm:pb-6!">
          <h2 className="t-h2 text-pine">{copy.siteFooter.FooterChapter.h21}</h2>
          <div
            role="tablist"
            aria-label={copy.siteFooter.FooterChapter.h21}
            className="mt-2 flex flex-wrap gap-x-6 gap-y-1 border-b border-line"
          >
            {FOOTER_TABS.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "-mb-px min-h-11 border-b-2 pb-2 t-body transition-colors",
                    selected
                      ? "border-pine font-bold text-pine"
                      : "border-transparent text-ink/70 hover:text-pine",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            className="mt-4 rounded-2xl border border-line bg-paper p-5 shadow-xs md:p-6"
          >
            {activeTab === "contact" && (
              <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-8">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <img src="/assets/icon-ch.png" alt="" className="size-8 shrink-0 object-contain" />
                    <h3 className="t-h3 text-pine">{copy.siteFooter.FooterChapter.a1}</h3>
                  </div>
                  <p className="mt-3 font-semibold t-body text-pine">{copy.siteFooter.FooterChapter.p1}</p>
                  <p className="mt-2 t-body text-ink/85">{copy.siteFooter.FooterChapter.p2}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <a
                      href={site.contactHref}
                      className="inline-flex min-h-11 items-center rounded-md bg-pine px-4 py-2 font-bold text-paper transition-colors hover:bg-pine/90"
                    >
                      {copy.siteFooter.FooterChapter.a1}
                    </a>
                    <ul
                      data-footer-doors
                      aria-label={copy.siteFooter.FooterChapter.ul_aria_label1}
                      className="flex flex-wrap gap-x-6 gap-y-1"
                    >
                      {DOORS.map((door) => (
                        <li key={door.label}>
                          <AppLink
                            href={door.href}
                            className="link inline-flex min-h-11 items-center font-bold"
                          >
                            {door.label}
                          </AppLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <figure className="min-w-0 overflow-hidden rounded-lg border border-line bg-field/40">
                  <img
                    src="/assets/live-contact-workshop.jpg"
                    alt="Community Hub workshop with community partners in front of a dashboard display"
                    className="max-h-64 w-full object-cover object-center md:max-h-72"
                  />
                </figure>
              </div>
            )}

            {activeTab === "who" && (
              <div className="grid items-start gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.45fr)] md:gap-8">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <img src="/assets/icon-cities.png" alt="" className="size-8 shrink-0 object-contain" />
                    <h3 className="t-h3 text-pine">Who It’s For</h3>
                  </div>
                  <p className="mt-3 t-body text-ink/85">
                    Community Hub serves neighborhoods, cities, public schools, colleges and universities, and science centers and museums working to connect people with local resources and each other.
                  </p>
                  <p className="mt-4">
                    <AppLink href="/who" className="link font-bold">
                      Explore All Audiences
                    </AppLink>
                  </p>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {whoStops.map((stop) => (
                    <li
                      key={stop.id}
                      className="rounded-lg border border-line bg-field/45 p-3.5 transition-colors hover:border-pine/50"
                    >
                      <AppLink href={`/who#${stop.id}`} className="font-display font-bold text-pine underline underline-offset-4">
                        {stop.name}
                      </AppLink>
                      <p className="mt-1 text-xs leading-relaxed text-ink/80">{stop.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "pricing" && (
              <div className="grid items-start gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)] md:gap-8">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <img src="/assets/icon-signage.png" alt="" className="size-8 shrink-0 object-contain" />
                    <h3 className="t-h3 text-pine">Pricing &amp; Bundles</h3>
                  </div>
                  <p className="mt-3 t-body text-ink/85">{site.pricingLede}</p>
                  <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    <AppLink href="/pricing" className="link font-bold">
                      View Full Pricing &amp; FAQ
                    </AppLink>
                    <a href={site.contactHref} className="link font-bold">
                      Request a Quote
                    </a>
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {bundles.map((bundle) => (
                    <div key={bundle.id} className="flex flex-col justify-between rounded-lg border border-line bg-field/45 p-3.5">
                      <div>
                        <h4 className="font-display text-base font-bold text-pine">{bundle.name} Bundle</h4>
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-ink/85">
                          {bundle.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="mt-3 pt-2 border-t border-line/60">
                        <AppLink href={quoteHref(`${bundle.name} bundle`)} className="text-xs font-bold text-pine underline underline-offset-4">
                          Inquire about {bundle.name}
                        </AppLink>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-line pt-4">
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
