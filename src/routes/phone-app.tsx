import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useEffect, useRef, useState } from "react";
import { AppLink } from "@/components/app-link";
import { PhoneControl } from "@/components/phone-control";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/lib/site";
import { copy } from "@/lib/copy";
import { DEMO_HREF } from "@/lib/links";
import { ContactBand } from "@/components/contact-band";
import { RelatedProducts } from "@/components/product-pager";
import { engageBeats } from "@/lib/content";
import { txt } from "@/lib/page-text/phoneApp";

export const Route = createFileRoute("/phone-app")({
  component: PhoneApp,
  head: () => ({ meta: [{ title: txt.title1 }] }),
});

function LivePhoneApp({ visit }: { visit: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="phone-live-app">
      {width > 0 && (
        <iframe
          key={visit}
          title="Oberlin Hub live phone app"
          src="https://environmentaldashboard.org/nav/"
          style={{ width: 750, height: 1334, transform: `scale(${width / 750})` }}
        />
      )}
    </div>
  );
}

function PhoneApp() {
  const [visit, setVisit] = useState(0);
  const icon = engageBeats.find((b) => b.id === "phone")?.icon ?? "";

  return (
    <div className="bg-paper text-ink">
      <main id="main" className="product-main deck">
        <section id="phone-app" className="product-section page page-first page-center">
          <div className="wrap page-body">
          <Breadcrumbs className="mb-6" />
          <div className="phone-page-split">
            <div>
              {icon && <img src={icon} alt="" width={56} height={56} className="mb-5 size-14 object-contain" />}
              <h1 className="t-h1">{txt.h11}</h1>
              <p className="mt-5 t-lede">{engageBeats.find((b) => b.id === "phone")?.body}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <AppLink href={site.contactHref} className="btn-primary">
                  {copy.siteHeader.SiteHeader.a1}
                </AppLink>
                <AppLink href={DEMO_HREF} className="btn-secondary">
                  {copy.siteHeader.SiteHeader.a2}
                </AppLink>
              </div>
            </div>
            <figure>
              <figcaption className="mb-3 text-[0.9375rem] font-semibold text-ink/70">
                {txt.figcaption1}</figcaption>
              <img
                className="phone-intro-photo"
                src="/assets/phone-workflow/science-center-touchpad.jpg"
                alt="Visitors beside the Carbon Neutral Stories exhibit and touchpad at Oberlin College"
              />
            </figure>
          </div>
          <div className="phone-capabilities">
            <div>
              <h2 className="t-h3">{txt.h21}</h2>
              <p className="mt-2 t-body">{txt.p1}</p>
            </div>
            <div>
              <h2 className="t-h3">{txt.h22}</h2>
              <p className="mt-2 t-body">{txt.p2}</p>
            </div>
            <div>
              <h2 className="t-h3">{txt.h23}</h2>
              <p className="mt-2 t-body">
                {txt.p3}</p>
            </div>
          </div>
          </div>
        </section>

        <section id="control-a-sign" className="product-section page page-center">
          <div className="wrap page-body">
          <PhoneControl venueIndex={1} />
          </div>
        </section>

        <section
          id="community-on-your-phone"
          className="product-section page page-center"
        >
          <div className="wrap page-body">
          <div className="phone-page-split phone-browse-layout">
            <div className="phone-browse-copy">
              <h2 className="t-h2">{txt.h24}</h2>
              <p className="mt-5 t-body">
                {txt.p4}</p>
              <p className="mt-4 t-body">
                {txt.p5}</p>
              <p className="mt-6 text-[0.9375rem] font-semibold text-ink/70">{txt.p6}</p>
              <div className="phone-mascot-cue">
                <img src="/assets/squirrel-cue-still.png" alt="" />
                <p className="t-h3">
                  {txt.p7}<br />
                  {txt.p8}{" "}<span aria-hidden="true">→</span>
                </p>
              </div>
              <button
                type="button"
                className="link mt-4"
                onClick={() => setVisit((v) => v + 1)}
              >
                {txt.button1}</button>
            </div>
            <div className="phone-hub-example">
              <LivePhoneApp visit={visit} />
            </div>
          </div>
          </div>
        </section>
        <RelatedProducts page="/phone-app" />
        <ContactBand />
      </main>
      <SiteFooter />
    </div>
  );
}
