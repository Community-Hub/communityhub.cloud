import { createFileRoute } from "@tanstack/react-router";
import { AppLink } from "@/components/app-link";
import { DocSection, DocShell, Shot, Split } from "@/components/doc";
import { FrameSlider } from "@/components/product-section";
import { ABOUT_ORIGIN_FRAMES } from "@/lib/content";
import { site } from "@/lib/site";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: pc.meta.about.title },
      { name: "description", content: site.mission },
    ],
  }),
});
const STOPS = pc.about.STOPS;

// John's own "Systems thinkers" slide (Story of the Dashboard, slide 11), with the slide's caption.
function SystemsThinkers() {
  return (
    <figure className="min-w-0">
      <Shot src={copy.about.SystemsThinkers.Shot_src1} alt={copy.about.SystemsThinkers.Shot_alt1} />
      <figcaption className="mt-2 t-small text-ink">{copy.about.SystemsThinkers.figcaption1}</figcaption>
      <AppLink href={copy.about.SystemsThinkers.AppLink_href1} className="link inline-flex min-h-11 items-center t-small font-bold">{copy.about.SystemsThinkers.AppLink1}</AppLink>
    </figure>
  );
}

function About() {
  return (
    <DocShell stops={STOPS}>
      <DocSection label={STOPS[0].label} title={copy.about.About.DocSection_title1} as="h1" cut={6}>
        <div className="grid items-start gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-8">
          <div className="min-w-0 md:order-last space-y-3 t-body max-md:text-[0.9375rem] max-md:leading-snug md:t-lede">
            <p>{site.mission}</p>
          </div>
          <SystemsThinkers />
        </div>
      </DocSection>
      <DocSection label={STOPS[1].label} title={copy.about.About.DocSection_title2}>
        <Split media={<div className="max-md:short:[--card-media-h:6.5rem] md:[--card-media-h:clamp(8rem,calc(100dvh-24rem),28rem)]"><FrameSlider frames={ABOUT_ORIGIN_FRAMES} /></div>}>
          <p className="t-body max-md:text-[0.9375rem] max-md:leading-snug">{copy.about.About.p2}</p>
          <p className="flex flex-wrap gap-x-6">
            <AppLink href={copy.about.About.AppLink_href1} className="link inline-flex min-h-11 items-center font-bold">{copy.about.About.AppLink1}</AppLink>
            <AppLink href={copy.about.About.AppLink_href2} className="link inline-flex min-h-11 items-center font-bold">{copy.about.About.AppLink2}</AppLink>
            <AppLink href={copy.about.About.AppLink_href3} className="link inline-flex min-h-11 items-center font-bold">{copy.about.About.AppLink3}</AppLink>
          </p>
        </Split>
      </DocSection>
      <DocSection label={STOPS[2].label} title={copy.about.About.DocSection_title3}>
        <p className="max-w-3xl t-lede">{copy.about.About.p1}</p>
      </DocSection>
    </DocShell>
  );
}
