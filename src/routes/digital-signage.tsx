import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppLink } from "@/components/app-link";
import { PhoneControl } from "@/components/phone-control";
import { FrameSlider } from "@/components/product-section";
import { SignageContentGallery } from "@/components/signage-content-gallery";
import { SignageSlidePreview } from "@/components/signage-slide-preview";
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

export const Route = createFileRoute("/digital-signage")({
  component: DigitalSignage,
  head: () => ({
    meta: [{ title: pc.meta.digitalSignage.title }],
  }),
});

function DigitalSignage() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
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
    } else if (hash === "dave-s-market") {
      targetId = "community-and-local-content";
    } else if (
      hash === "what-the-screen-shows" ||
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
  }, []);

  return (
    <div className="min-h-dvh bg-field text-ink pt-16">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-8 md:px-8 md:py-12">
        {/* Section 1: Digital Signage Hero + Installation Slider + Content Gallery */}
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

          <div className="mt-8">
            <SignageContentGallery />
          </div>
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

            <figure className="min-w-0">
              <figcaption className="mb-2 t-body font-bold text-ink">
                MidTown Cleveland – MidTown, Inc.
              </figcaption>
              <img
                src="/assets/signage-partners/midtown-inc.jpg"
                alt="A person beside a digital sign displaying the MidTown jobs board at MidTown, Inc."
                className="max-h-[26rem] w-full rounded-md object-contain object-left-top"
              />
            </figure>
          </div>

          <div className="mt-8">
            <SignageSlidePreview />
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

      <SiteFooter />
    </div>
  );
}
