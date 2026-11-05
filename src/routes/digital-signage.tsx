import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppLink } from "@/components/app-link";
import { PhoneControl } from "@/components/phone-control";
import { FrameSlider } from "@/components/product-section";
import { SiteFooter } from "@/components/site-footer";
import { engageBeats, placeTitle, type SlideFrame } from "@/lib/content";
import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";

const ICON = engageBeats.find((beat) => beat.id === "signage")?.icon ?? "";

const HERO_INSTALLATIONS: SlideFrame[] = [
  {
    src: "/assets/platform-explanation/interactive-signage.jpg",
    title: placeTitle("City of Oberlin", "Hotel at Oberlin"),
    alt: "A CommunityHub digital sign in the Hotel at Oberlin lobby",
    caption: "",
    fit: "contain",
  },
  {
    src: "/assets/phone-person-water-display.jpg",
    title: placeTitle("Great Lakes Science Center", "Digital Signage"),
    alt: "A visitor using her phone beside a digital sign and touchpad at Great Lakes Science Center",
    caption: "",
    fit: "contain",
  },
  {
    src: "/assets/phone-workflow/science-center-touchpad.jpg",
    title: placeTitle("Oberlin College", "Science Center"),
    alt: "Visitors beside the Carbon Neutral Stories digital sign at Oberlin College Science Center",
    caption: "",
    fit: "contain",
  },
  {
    src: "/assets/eng-sign-daves-full.jpg",
    title: placeTitle("MidTown Cleveland", "Dave's Market"),
    alt: "The Dave's Market digital sign installation in MidTown Cleveland",
    caption: "",
    fit: "contain",
  },
  {
    src: "/assets/signage-partners/fatima-family-center.jpg",
    title: placeTitle("MidTown Cleveland", "Fatima Family Center"),
    alt: "Community members viewing a digital sign at Fatima Family Center",
    caption: "",
    fit: "contain",
  },
  {
    src: "/assets/signage-partners/learning-to-grow.jpg",
    title: placeTitle("MidTown Cleveland", "Learning to Grow Child Enrichment"),
    alt: "A person beside the Learning to Grow digital sign in MidTown Cleveland",
    caption: "",
    fit: "contain",
  },
  {
    src: "/assets/signage-partners/asian-town-center.jpg",
    title: placeTitle("MidTown Cleveland", "Asian Town Center"),
    alt: "People beside a CommunityHub digital sign at Asian Town Center",
    caption: "",
    fit: "contain",
  },
  {
    src: "/assets/signage-partners/ichc-health-clinic.jpg",
    title: placeTitle("MidTown Cleveland", "ICHC Health Clinic"),
    alt: "People beside a digital sign at ICHC Health Clinic",
    caption: "",
    fit: "contain",
  },
  {
    src: "/assets/signage-partners/foundry-lofts.jpg",
    title: placeTitle("MidTown Cleveland", "Foundry Lofts"),
    alt: "Digital sign installation in the lobby at Foundry Lofts",
    caption: "",
    fit: "contain",
  },
];

const SIGNAGE_CONTENT_EXAMPLES: SlideFrame[] = [
  {
    src: "/assets/signage-partners/midtown-inc.jpg",
    title: placeTitle("MidTown Cleveland", "MidTown, Inc. Jobs Board"),
    alt: "A person beside a digital sign displaying the MidTown jobs board at MidTown, Inc.",
    caption: "Location-specific announcements and job boards alongside community-wide updates.",
    fit: "contain",
  },
  {
    src: "/assets/signage-live/events-calendar.png",
    title: placeTitle("City of Oberlin", "Community Calendar"),
    alt: "Oberlin Community Calendar displayed on a digital sign",
    caption: "Local events and announcements shared across public screens.",
    fit: "contain",
  },
  {
    src: "/assets/signage-live/community-voices.png",
    title: placeTitle("City of Oberlin", "Community Voices"),
    alt: "Community Voices slide displayed on a digital sign",
    caption: "Neighbors’ photos and quotes organized by community themes.",
    fit: "contain",
  },
  {
    src: "/assets/signage-live/live-data.png",
    title: placeTitle("Oberlin Public Schools", "Building Dashboard"),
    alt: "Oberlin Elementary School electricity-use graph on a digital sign",
    caption: "Real-time electricity and water visualizations for an individual building.",
    fit: "contain",
  },
  {
    src: "/assets/signage-live/citywide.png",
    title: placeTitle("City of Oberlin", "Citywide Dashboard"),
    alt: "Oberlin Citywide Dashboard on a digital sign",
    caption: "Whole-community flows of electricity, drinking water, and environmental conditions.",
    fit: "contain",
  },
  {
    src: "/assets/signage-live/story-content.png",
    title: placeTitle("Oberlin Public Schools", "Energy Use Story"),
    alt: "Illustrated Energy Use story slide on a digital sign",
    caption: "Illustrated stories explaining how local energy and water systems work.",
    fit: "contain",
  },
];

const SIGNAGE_FEATURES = [
  {
    title: "Interactive by design",
    body: "Visitors scan a QR code with their phone or use a nearby touchpad to choose what plays on the screen.",
  },
  {
    title: "Managed with Google Slides",
    body: "Organizations update slide decks, events, and announcements using familiar tools that publish straight to the display.",
  },
  {
    title: "Community & location content",
    body: "Bring community-wide calendars, voices, and dashboards together with content tailored to each host venue.",
  },
] as const;

export const Route = createFileRoute("/digital-signage")({
  component: DigitalSignage,
  head: () => ({
    meta: [{ title: pc.meta.digitalSignage.title }],
  }),
});

import { consumeNavigationTarget } from "@/lib/use-hash-stops";

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
    <div className="min-h-dvh bg-field text-ink pt-16">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-8 md:px-8 md:py-12">
        {/* Section 1: Digital Signage Hero + Installation Slider */}
        <section id="digital-signage" className="scroll-mt-20">
          <p className="t-small text-ink/70">
            <AppLink
              href={copy.productPager.ProductPager.AppLink_href1}
              className="text-pine underline underline-offset-4"
            >
              {copy.productPager.ProductPager.AppLink1}
            </AppLink>{" "}
            / {copy.digitalSignage.DigitalSignage.h11}
          </p>

          <div className="mt-6 grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <img src={ICON} alt="" className="size-11 shrink-0 object-contain" />
                <h1 className="t-h2">{copy.digitalSignage.DigitalSignage.h11}</h1>
              </div>
              <p className="mt-5 max-w-xl t-body">
                {copy.digitalSignage.DigitalSignage.p1}
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
                <h2 className="t-body font-bold text-pine">{feature.title}</h2>
                <p className="mt-1 t-small">{feature.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 2: Community and Local Content */}
        <section
          id="community-and-local-content"
          className="scroll-mt-20 border-t border-pine/20 pt-12"
        >
          <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <div className="min-w-0">
              <h2 className="t-h2">Community and local content</h2>
              <p className="mt-5 t-body">
                CommunityHub’s digital signage connects community members with information and events from across their community. Organizations can also post and update content specific to their location, bringing community-wide and organization-specific communication together on one screen.
              </p>
              <p className="mt-4 t-body">
                Community calendars, stories, and resource-use visualizations provide opportunities to inform, engage, and connect the people who live, shop, work, and play in the community.
              </p>
            </div>

            <div className="min-w-0" data-signage-content-slider>
              <FrameSlider
                frames={SIGNAGE_CONTENT_EXAMPLES}
                heading="Community and local content"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Interactive Phone Control Demo */}
        <section
          id="try-the-phone"
          className="scroll-mt-20 border-t border-pine/20 pt-12"
        >
          <PhoneControl venueIndex={0} />
        </section>
      </main>

      <div className="mt-8 border-t border-line bg-paper/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
