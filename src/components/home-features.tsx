import { useRef } from "react";
import { useStory } from "@/components/storyboard";
import { AppLink } from "@/components/app-link";
import { PlayPauseButton } from "@/components/play-pause";
import { SliderArrows } from "@/components/slider-arrows";
import { useSlide } from "@/components/product-section";
import { usePreviewRotation } from "@/lib/use-preview-rotation";
import { useSwipe } from "@/lib/use-swipe";
import { homeFeatureStories } from "@/lib/home-feedback";
import { cn } from "@/lib/utils";
import { imageSize } from "@/lib/image-dimensions";

/** Oct 7 pp. 4-5: the image, quote and its controls move as one clearly bounded story. */
export function HomeFeatures({ chapter = 1 }: { chapter?: number } = {}) {
  const features = homeFeatureStories();
  const { hashBeat, reportBeat } = useStory();
  const match = /^quote-(\d+)$/.exec(hashBeat);
  const at = match ? Math.min(Number(match[1]), features.length - 1) : 0;
  const setAt = (next: number) => reportBeat(chapter, `quote-${next}`);
  const ref = useRef<HTMLDivElement>(null);
  const direction = useRef<1 | -1>(1);
  const step = (dir: 1 | -1) => { direction.current = dir; setAt((at + dir + features.length) % features.length); };
  const rotation = usePreviewRotation(ref, () => step(1), true, at);
  const slide = useSlide(at, "features", direction);
  useSwipe(ref, dir => step(dir > 0 ? 1 : -1));
  const layers = [at, ...(slide.prev !== null && slide.prev !== at ? [slide.prev] : [])];
  return <div data-scroll-restoration-id="home-testimonials" data-allow-scroll className="home-features-scroll">
    <div ref={ref} tabIndex={0} data-feature-box data-swipe-own data-index={at} className="home-feature wrap"
      onKeyDown={e => {
        if ((e.key !== "ArrowLeft" && e.key !== "ArrowRight") || e.altKey || e.ctrlKey || e.metaKey) return;
        e.preventDefault(); e.stopPropagation(); step(e.key === "ArrowRight" ? 1 : -1);
      }}>
      <div className="home-feature-controls">
        <PlayPauseButton playing={rotation.playing} onToggle={rotation.toggle} labels={{pause:"Pause stories",play:"Play stories"}} className="home-pause" />
        <SliderArrows onPrev={() => step(-1)} onNext={() => step(1)} labels={{prev:"Previous story",next:"Next story"}} />
      </div>
      <div className="home-feature-stage">
        {layers.map(n => <div key={n} aria-hidden={n !== at || undefined} inert={n !== at || undefined}
          className={cn("home-feature-content", n === at ? slide.prev !== null && (slide.dir > 0 ? "sb-in-next" : "sb-in-prev") : ["home-feature-leaving", slide.dir > 0 ? "sb-out-next" : "sb-out-prev"])}>
          <img src={features[n].img} alt={features[n].alt} width={imageSize(features[n].img)?.width} height={imageSize(features[n].img)?.height} className="home-feature-image" />
          <div className="home-feature-quote">
            <blockquote>“{features[n].quote}”</blockquote>
            <p className="mt-4 font-bold">{features[n].speaker}</p>
            <p className="t-small">{features[n].sourceRole}</p>
            <p data-quote-org className="sr-only">{features[n].org}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">{features[n].links.map(link => <AppLink key={link.href} href={link.href} className="link">{link.label}</AppLink>)}</div>
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}
