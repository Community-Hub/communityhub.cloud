import { createFileRoute } from "@tanstack/react-router";
import { FrameSlider } from "@/components/product-section";
import { DocSection, DocShell } from "@/components/doc";
import { storyOfDashboard } from "@/data/embeds";
import type { SlideFrame } from "@/lib/content";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
export const Route = createFileRoute("/story")({
  component: Story,
  head: () => ({
    meta: [
      { title: pc.meta.story.title },
      { name: "description", content: pc.meta.story.description },
    ],
  }),
});
const STOPS = pc.story.STOPS;

// Oct 2: preserve the original editable presentation and its native animation.
const ORIGINAL_SLIDES: SlideFrame[] = [{
  title: "Story of the Dashboard",
  caption: "",
  embed: storyOfDashboard.src,
  presentation: true,
}];

// Leaves room under the picture for its caption and the source link.
const ROOM = "md:[--card-media-h:clamp(8rem,calc(100dvh-28rem),30rem)]";

function SourceLink() {
  return (
    <a href={storyOfDashboard.visit} className="link mt-2 inline-flex min-h-11 items-center font-bold" target="_blank" rel="noreferrer">{copy.story.SourceLink.a1}</a>
  );
}

function Story() {
  return (
    <DocShell stops={STOPS}>
      <DocSection label={STOPS[0].label} title={copy.story.Story.DocSection_title1} as="h1" cut={8}>
        <div className={ROOM}>
          <FrameSlider frames={ORIGINAL_SLIDES} heading={copy.story.Story.DocSection_title1} />
          <SourceLink />
        </div>
      </DocSection>
    </DocShell>
  );
}
