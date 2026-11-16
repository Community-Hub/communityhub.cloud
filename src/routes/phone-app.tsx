import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/phone-app")({
  component: PhoneApp,
  head: () => ({ meta: [{ title: "Phone App — Community Hub" }] }),
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
          <nav aria-label="Breadcrumb" className="mb-6 text-[0.9375rem] text-ink/65">
            <AppLink href="/products" className="font-medium text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-pine">
              Products
            </AppLink>
            <span aria-hidden className="px-2 text-ink/35">/</span>
            <span aria-current="page">Phone App</span>
          </nav>
          <div className="phone-page-split">
            <div>
              {icon && <img src={icon} alt="" width={56} height={56} className="mb-5 size-14 object-contain" />}
              <h1 className="t-h1">Phone App</h1>
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
                Oberlin — Oberlin College Carbon Neutral Stories
              </figcaption>
              <img
                className="phone-intro-photo"
                src="/assets/phone-workflow/science-center-touchpad.jpg"
                alt="Visitors beside the Carbon Neutral Stories exhibit and touchpad at Oberlin College"
              />
            </figure>
          </div>
          <div className="phone-capabilities">
            <div>
              <h2 className="t-h3">Control a sign</h2>
              <p className="mt-2 t-body">Your phone can choose the content on a nearby display.</p>
            </div>
            <div>
              <h2 className="t-h3">Open a story</h2>
              <p className="mt-2 t-body">A story’s QR code brings its content directly to your phone.</p>
            </div>
            <div>
              <h2 className="t-h3">Browse content</h2>
              <p className="mt-2 t-body">
                Events, community messages, and dashboards are available on your own screen.
              </p>
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
              <h2 className="t-h2">Your community, on your phone</h2>
              <p className="mt-5 t-body">
                The phone app also brings community content to your own screen. You can find local events, view Community Voices, and explore resource-use information wherever you are.
              </p>
              <p className="mt-4 t-body">
                Each community can customize its app to reflect its communication goals and the content it shares.
              </p>
              <p className="mt-6 text-[0.9375rem] font-semibold text-ink/70">Oberlin — Live phone app</p>
              <div className="phone-mascot-cue">
                <img src="/assets/squirrel-cue-still.png" alt="" />
                <p className="t-h3">
                  This app works.
                  <br />
                  Try it out. <span aria-hidden="true">→</span>
                </p>
              </div>
              <button
                type="button"
                className="link mt-4"
                onClick={() => setVisit((v) => v + 1)}
              >
                Back to app home
              </button>
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
