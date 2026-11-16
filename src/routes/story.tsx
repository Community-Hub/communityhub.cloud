import { createFileRoute } from "@tanstack/react-router";
import { FrameSlider } from "@/components/product-section";
import { DocShell } from "@/components/doc";
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

function SourceLink() {
  return (
    <a href={storyOfDashboard.visit} className="link mt-2 inline-flex min-h-11 items-center font-bold" target="_blank" rel="noreferrer">{copy.story.SourceLink.a1}</a>
  );
}

/**
 * One screen: the title and source at the left, the presentation as large as the screen allows at the right.
 * The frame takes the slides' own shape (4:3 plus the Slides toolbar), so the deck fills it with no black bars.
 */
function StorySection({ id, label }: { id?: string; isFirst?: boolean; label: string }) {
  const title = copy.story.Story.DocSection_title1;
  return (
    <section id={id} aria-label={label} className="doc-section-block page page-first">
      <div className="wrap page-body">
        <div className="story-layout">
          <div className="story-copy">
            <h1 className="t-h1 max-w-[12ch]">{title}</h1>
            <SourceLink />
          </div>
          <div className="story-deck min-w-0">
            <FrameSlider frames={ORIGINAL_SLIDES} heading={title} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Story() {
  return (
    <DocShell stops={STOPS}>
      <StorySection label={STOPS[0].label} />
    </DocShell>
  );
}
