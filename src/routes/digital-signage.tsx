import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useEffect } from "react";
import { AppLink } from "@/components/app-link";
import { PhoneControl } from "@/components/phone-control";
import { FrameSlider } from "@/components/product-section";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/lib/site";
import { DEMO_HREF } from "@/lib/links";
import { ContactBand, DOWNTOWN_CHALK_WALK } from "@/components/contact-band";
import { RelatedProducts } from "@/components/product-pager";
import { engageBeats, type SlideFrame } from "@/lib/content";
import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";

const ICON = engageBeats.find((beat) => beat.id === "signage")?.icon ?? "";

const HERO_INSTALLATIONS: SlideFrame[] = [
  {
    src: "/assets/platform-explanation/interactive-signage.jpg",
    get title() { return txt.installation1; },
    get alt() { return txt.alt1; },
    caption: "",
    fit: "contain",
  },
  {
    src: "/assets/phone-person-water-display.jpg",
    get title() { return txt.installation2; },
    get alt() { return txt.alt2; },
    caption: "",
    fit: "contain",
  },
  {
    src: "/assets/phone-workflow/science-center-touchpad.jpg",
    get title() { return txt.installation3; },
    get alt() { return txt.alt3; },
    caption: "",
    fit: "contain",
  },
  {
    src: "/assets/eng-sign-daves-full.jpg",
    get title() { return txt.installation4; },
    get alt() { return txt.alt4; },
    caption: "",
    fit: "contain",
  },
  {
    src: "/assets/signage-partners/fatima-family-center.jpg",
    get title() { return txt.installation5; },
    get alt() { return txt.alt5; },
    caption: "",
    fit: "contain",
  },
  {
    src: "/assets/signage-partners/learning-to-grow.jpg",
    get title() { return txt.installation6; },
    get alt() { return txt.alt6; },
    caption: "",
    fit: "contain",
  },
  {
    src: "/assets/signage-partners/asian-town-center.jpg",
    get title() { return txt.installation7; },
    get alt() { return txt.alt7; },
    caption: "",
    fit: "contain",
  },
  {
    src: "/assets/signage-partners/ichc-health-clinic.jpg",
    get title() { return txt.installation8; },
    get alt() { return txt.alt8; },
    caption: "",
    fit: "contain",
  },
  {
    src: "/assets/signage-partners/foundry-lofts.jpg",
    get title() { return txt.installation9; },
    get alt() { return txt.alt9; },
    caption: "",
    fit: "contain",
  },
];

const SIGNAGE_CONTENT_EXAMPLES: SlideFrame[] = [
  {
    src: "/assets/signage-partners/midtown-inc.jpg",
    get title() { return txt.installation10; },
    get alt() { return txt.alt10; },
    get caption() { return txt.caption1; },
    fit: "contain",
  },
  {
    src: "/assets/signage-live/events-calendar.png",
    get title() { return txt.installation11; },
    get alt() { return txt.alt11; },
    get caption() { return txt.caption2; },
    fit: "contain",
  },
  {
    src: "/assets/signage-live/community-voices.png",
    get title() { return txt.installation12; },
    get alt() { return txt.alt12; },
    get caption() { return txt.caption3; },
    fit: "contain",
  },
  {
    src: "/assets/signage-live/live-data.png",
    get title() { return txt.installation13; },
    get alt() { return txt.alt13; },
    get caption() { return txt.caption4; },
    fit: "contain",
  },
  {
    src: "/assets/signage-live/citywide.png",
    get title() { return txt.installation14; },
    get alt() { return txt.alt14; },
    get caption() { return txt.caption5; },
    fit: "contain",
  },
  {
    src: "/assets/signage-live/story-content.png",
    get title() { return txt.installation15; },
    get alt() { return txt.alt15; },
    get caption() { return txt.caption6; },
    fit: "contain",
  },
];

const SIGNAGE_FEATURES = [
  {
    get title() { return txt.title1; },
    get body() { return txt.body1; },
  },
  {
    get title() { return txt.title2; },
    get body() { return txt.body2; },
  },
  {
    get title() { return txt.title3; },
    get body() { return txt.body3; },
  },
] as const;

export const Route = createFileRoute("/digital-signage")({
  component: DigitalSignage,
  head: () => ({
    meta: [{ title: pc.meta.digitalSignage.title }],
  }),
});

import { consumeNavigationTarget } from "@/lib/use-hash-stops";
import { txt } from "@/lib/page-text/digitalSignage";

function DigitalSignage() {
  useEffect(() => {
    const applyTarget = (hash: string) => {
      if (!hash) return;
      let targetId = hash;
      if (
        hash === "from-a-post-to-the-screen" ||
        hash === "how-phone-control-works" ||
        hash === "phone" ||
        hash === "use-phone" ||
        hash === "use-your-phone"
      ) {
        targetId = "try-the-phone";
      } else if (hash === "dave-s-market" || hash === "what-the-screen-shows") {
        targetId = "community-and-local-content";
      } else if (
        hash === "oberlin" ||
        hash === "cleveland-and-campus" ||
        hash === "where-screens-are"
      ) {
        targetId = "digital-signage";
      }
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    const initial = consumeNavigationTarget();
    if (initial) applyTarget(initial);
    const onTarget = (event: Event) => {
      const target = (event as CustomEvent<string>).detail;
      consumeNavigationTarget();
      if (target) applyTarget(target);
    };
    const onHash = () => {
      const target = consumeNavigationTarget();
      if (target) applyTarget(target);
    };
    window.addEventListener("ch:target", onTarget);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("ch:target", onTarget);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  return (
    <div className="bg-paper text-ink">
      <main id="main" className="product-main deck">
        {/* Section 1: Digital Signage Hero + Installation Slider */}
        <section id="digital-signage" className="product-section page page-first page-center">
          <div className="wrap page-body">
          <Breadcrumbs className="mb-6" />

          <div className="product-detail-layout product-detail-split">
            <div className="min-w-0">
              <img src={ICON} alt="" width={56} height={56} className="mb-5 size-14 object-contain" />
              <h1 className="t-h1">{copy.digitalSignage.DigitalSignage.h11}</h1>
              <p className="mt-5 max-w-xl t-lede">
                {copy.digitalSignage.DigitalSignage.p1}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <AppLink href={site.contactHref} className="btn-primary">
                  {copy.siteHeader.SiteHeader.a1}
                </AppLink>
                <AppLink href={DEMO_HREF} className="btn-secondary">
                  {copy.siteHeader.SiteHeader.a2}
                </AppLink>
              </div>
              <p className="mt-5">
                <a href="#try-the-phone" onClick={(e) => { const el = document.getElementById("try-the-phone"); if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth", block: "start" }); } }} className="link">
                  {txt.a1}</a>
              </p>
            </div>

            <div className="min-w-0" data-signage-hero-slider>
              <FrameSlider
                frames={HERO_INSTALLATIONS}
                heading={copy.digitalSignage.DigitalSignage.h11}
              />
            </div>
          </div>

          <ul className="product-detail-features">
            {SIGNAGE_FEATURES.map((feature) => (
              <li key={feature.title}>
                <h2 className="text-lg font-semibold text-pine">{feature.title}</h2>
                <p className="mt-2 t-body text-ink/78">{feature.body}</p>
              </li>
            ))}
          </ul>
          </div>
        </section>

        {/* Section 2: Community and Local Content */}
        <section
          id="community-and-local-content"
          className="product-section page page-center"
        >
          <div className="wrap page-body">
          <div className="product-detail-layout product-detail-split">
            <div className="min-w-0">
              <h2 className="t-h2">{txt.h21}</h2>
              <p className="mt-5 t-body text-ink/80">
                {txt.p1}</p>
              <p className="mt-4 t-body text-ink/80">
                {txt.p2}</p>
            </div>

            <div className="min-w-0" data-signage-content-slider>
              <FrameSlider
                frames={SIGNAGE_CONTENT_EXAMPLES}
                heading={txt.heading1}
              />
            </div>
          </div>
          </div>
        </section>

        {/* Section 3: Interactive Phone Control Demo */}
        <section
          id="try-the-phone"
          className="product-section page page-center"
        >
          <div className="wrap page-body">
          <PhoneControl venueIndex={0} />
          </div>
        </section>
        <RelatedProducts page="/digital-signage" />
        <ContactBand photo={DOWNTOWN_CHALK_WALK} />
      </main>
      <SiteFooter />
    </div>
  );
}
