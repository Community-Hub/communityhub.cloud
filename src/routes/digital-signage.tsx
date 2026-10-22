import { SignageSlidePreview } from "@/components/signage-slide-preview";
import { SignageContentGallery } from "@/components/signage-content-gallery";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Chapter, Storyboard, useStory } from "@/components/storyboard";
import { useEffect, type ReactNode } from "react";
import { AppLink } from "@/components/app-link";
import { homeStopFor } from "@/components/product-pager";
import { engageBeats, type SlideFrame } from "@/lib/content";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

import { PhoneControl } from "@/components/phone-control";
import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
const PHONE_SHEET = 2;
const ICON = engageBeats.find((beat) => beat.id === "signage")?.icon ?? "";
const INSTALLATIONS: SlideFrame[] = [
  { src: "/assets/signage-partners/asian-town-center.jpg", title: "Asian Town Center", alt: "People beside a CommunityHub digital sign at Asian Town Center", caption: "MidTown Cleveland" },
  { src: "/assets/signage-partners/ichc-health-clinic.jpg", title: "ICHC AsiaTown", alt: "People beside a digital sign at ICHC AsiaTown", caption: "MidTown Cleveland" },
];


function Shot({ src, alt, caption, fill = false }: { src: string; alt: string; caption?: string; fill?: boolean }) {
  return (
    <figure className={fill ? "flex min-h-0 w-full flex-1 flex-col" : "min-h-0 w-full"}>
      <img
        src={src}
        alt={alt}
        className={fill ? "min-h-0 w-full shrink object-contain object-left-top" : "max-h-[calc(100dvh-18rem)] w-full object-contain object-left object-top"}
      />
      {caption && <figcaption className="pt-2 text-left t-small">{caption}</figcaption>}
    </figure>
  );
}

function Sheet({ id, label, children, single = false }: { id: string; label: string; children: ReactNode; single?: boolean }) {
  return (
    <Chapter label={label} className="bg-field text-ink">
      <div id={id} data-allow-scroll className="h-[calc(100%-var(--chrome-bottom))] overflow-y-auto px-4 pt-16 pr-8 pb-6 md:h-full md:px-8 md:pt-20 md:pr-12 md:pb-24">
      <div
        className={cn(
          "mx-auto h-full min-h-0 min-w-0 w-full max-w-6xl",
          single ? "flex flex-col" : "flex flex-col gap-3",
        )}
      >
        {children}
      </div>
      </div>
    </Chapter>
  );
}

export const Route = createFileRoute("/digital-signage")({
  component: DigitalSignage,
  head: () => ({
    meta: [{ title: pc.meta.digitalSignage.title }],
  }),
});
const LABELS = ["Digital Signage", "Community and local content", "Try the phone", "Our partners", "Keep exploring"];

function DigitalSignage() {
  const slugs = LABELS.map(label => label.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
  return <Storyboard labels={LABELS} ids={slugs}><DigitalSignageSections /></Storyboard>;
}

function DigitalSignageSections() {
  const home = homeStopFor("/digital-signage")!;
  const { go } = useStory();
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash === "oberlin" || hash === "cleveland-and-campus" || hash === "where-screens-are") go(3);
    else if (hash === "dave-s-market") go(1);
    else if (hash === "what-the-screen-shows") go(0);
    else if (hash === "from-a-post-to-the-screen" || hash === "how-phone-control-works") go(2);
    else if (hash === "phone" || hash === "use-phone" || hash === "use-your-phone") go(PHONE_SHEET);
  }, [go]);

  return (
    <>
        <Sheet id="digital-signage" label={copy.digitalSignage.DigitalSignage.Sheet_label1} single>
          <div className="flex h-full min-h-0 flex-col">
            <p className="t-small">
              <AppLink href={copy.productPager.ProductPager.AppLink_href1} className="text-pine underline">{copy.productPager.ProductPager.AppLink1}</AppLink>{" "}
              / {copy.digitalSignage.DigitalSignage.h11}
            </p>
            <div className="grid content-start items-start gap-6 pt-6 pb-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] md:gap-8">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <img src={ICON} alt="" className="size-11 shrink-0 object-contain" />
                  <h1 className="t-h2">{copy.digitalSignage.DigitalSignage.h11}</h1>
                </div>
                <p className="mt-5 max-w-xl t-body">
                  {copy.digitalSignage.DigitalSignage.p1}
                </p>
                <a href={site.contactHref} className="link mt-6 inline-block">{copy.productPager.ProductPager.a1}</a>
              </div>
              <figure className="min-w-0">
                <img
                  src={copy.digitalSignage.DigitalSignage.img_src1}
                  alt={copy.digitalSignage.DigitalSignage.img_alt1}
                  className="h-auto w-full rounded-md object-contain"
                />
                <figcaption className="mt-3 t-small text-ink/70">{copy.digitalSignage.DigitalSignage.p2}</figcaption>
              </figure>
            </div>
            <SignageContentGallery />
          </div>
        </Sheet>

        <Sheet id="community-and-local-content" label="Community and local content">
          <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <div className="min-w-0">
              <h2 className="t-h2">Community and local content</h2>
              <p className="mt-5 t-body">CommunityHub’s digital signage connects community members with information and events from across their community. Organizations can also post and update content specific to their location, bringing community-wide and organization-specific communication together on one screen.</p>
              <p className="mt-4 t-body">Community calendars, stories, and resource-use visualizations provide opportunities to inform, engage, and connect the people who live, shop, work, and play in the community.</p>
            </div>
            <Shot src="/assets/signage-partners/midtown-inc.jpg" alt="A person beside a digital sign displaying the MidTown jobs board at MidTown, Inc." caption="MidTown Cleveland – MidTown, Inc." />
          </div>
          <SignageSlidePreview />
        </Sheet>

        <Sheet id="try-the-phone" label={copy.digitalSignage.DigitalSignage.Sheet_label6} single>
          <PhoneControl venueIndex={0} />
        </Sheet>

        <Sheet id="our-partners" label="Our partners">
          <div className="grid min-w-0 items-start gap-5">
            <div className="min-w-0">
              <h2 className="t-h2">Our partners</h2>
              <p className="mt-5 t-body">CommunityHub partners with schools, libraries, businesses, and community organizations to connect people with their community.</p>


            </div>
            <div className="grid min-w-0 grid-cols-2 items-start gap-4">
              {INSTALLATIONS.map(frame => (
                <figure key={frame.src} className="min-w-0">
                  <figcaption className="mb-2 t-small"><span className="block font-bold">{frame.title}</span><span className="text-ink/70">{frame.caption}</span></figcaption>
                  <img src={frame.src} alt={frame.alt} className="aspect-[4/5] w-full rounded-md object-cover object-center md:aspect-auto md:h-[calc(100dvh-21rem)] md:max-h-[38rem]" />
                </figure>
              ))}
            </div>
          </div>
        </Sheet>

        <Sheet id="keep-exploring" label={copy.digitalSignage.DigitalSignage.Sheet_label9}>
          <div className="min-w-0">
            <h2 className="t-h2">{copy.digitalSignage.DigitalSignage.h27}</h2>
            <ul className="mt-3 space-y-3 t-body md:mt-6 md:space-y-6">
              <li>
                <a className="font-bold text-pine underline" href={copy.digitalSignage.DigitalSignage.a_href1}>{copy.digitalSignage.DigitalSignage.a1}</a>
                <p className="t-body text-ink/70">{copy.digitalSignage.DigitalSignage.p11}</p>
              </li>
              <li>
                <AppLink href={home.href} className="font-bold text-pine underline">
                  {home.label}
                </AppLink>
                <p className="t-body text-ink/70">{copy.digitalSignage.DigitalSignage.p12}</p>
              </li>
              <li>
                <Link to="/who" className="font-bold text-pine underline">{copy.digitalSignage.DigitalSignage.Link1}</Link>
                <p className="t-body text-ink/70">{copy.digitalSignage.DigitalSignage.p13}</p>
              </li>
              <li>
                <Link to="/pricing" className="font-bold text-pine underline">{copy.digitalSignage.DigitalSignage.Link2}</Link>
                <p className="t-body text-ink/70">{copy.digitalSignage.DigitalSignage.p14}</p>
              </li>
            </ul>
          </div>

        </Sheet>
    </>
  );
}
