import { ScrollingDashboard } from "@/components/scrolling-dashboard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PlayPauseButton } from "@/components/play-pause";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useVoicesRotation } from "@/components/community-voices";
import { GuardedEmbed } from "@/components/guarded-embed";
import { usePreviewRotation } from "@/lib/use-preview-rotation";
import { useSwipe } from "@/lib/use-swipe";
import type { SlideFrame } from "@/lib/content";
import { cn } from "@/lib/utils";
import { PhoneScanExample, PhoneWalkthrough } from "@/components/phone-walkthrough";
import voicesSlidesData from "@/data/voices-slides.json";

type VoiceSlideItem = {
  id: number;
  quote: string;
  quotationMarks: boolean;
  attribution: string;
  subAttribution: string;
  image: string;
  alt: string;
  categoryLabel: string;
  categoryColor: string;
  categoryIcon: string;
  logo: string;
};
const voicesSlides = voicesSlidesData as Record<string, VoiceSlideItem[]>;

export const slugOf = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const SLIDE_MS = 380;

/**
 * Tracks the slide that is leaving, so the box can move sideways from one example to the next.
 * A different set of examples (a new product) swaps at once, with no movement.
 */
export function useSlide(i: number, set: string, dirRef: { current: 1 | -1 }) {
  const [state, setState] = useState<{ prev: number | null; dir: 1 | -1 }>({ prev: null, dir: 1 });
  const last = useRef({ i, set });
  useLayoutEffect(() => {
    const was = last.current;
    last.current = { i, set };
    if (was.set !== set) {
      setState({ prev: null, dir: 1 });
      return;
    }
    if (was.i === i) return;
    setState({ prev: was.i, dir: dirRef.current });
    const t = window.setTimeout(() => setState((s) => ({ ...s, prev: null })), SLIDE_MS + 40);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, set]);
  return state;
}

function PresentationPreview({ frame, previewPlaying = false }: { frame: SlideFrame; home?: boolean; previewPlaying?: boolean }) {
  const src = frame.embed!.replace("start=true", `start=${previewPlaying}`);
  // A Studios story or loop is laid out for a full screen: it always renders at display width and scales down.
  const displayWidthOnly = src.includes("studios.communityhb.tech");
  return <GuardedEmbed src={src} title={frame.title} passive={false} narrowBelow={displayWidthOnly ? 0 : undefined} className="absolute inset-0 h-full" />;
}

function VoicesCategoryPreview({ url, iframeSrc, title, running }: { url: string; iframeSrc: string; title: string; running: boolean }) {
  const slides = voicesSlides[url] ?? [];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    setIndex(0);
  }, [url]);
  useEffect(() => {
    if (!running || slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [running, slides.length]);

  // The slide is drawn here rather than in the player, so it uses the player's own lettering: Community Voices sets
  // every word in Comfortaa (cv-public/css/slide.css), not the site's Figtree (John, 19 Nov: "the font is not quite right").
  if (slides.length === 0) {
    return <GuardedEmbed src={iframeSrc} title={title} passive={false} className="absolute inset-0 h-full" />;
  }

  const current = slides[index % slides.length];
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0c0e0d] text-white select-none">
      {/* Keep underlying iframe mounted for source parity and automated attribute checks */}
      <iframe
        src={iframeSrc}
        title={title}
        tabIndex={-1}
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute inset-0 size-full border-0 opacity-0"
      />
      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-[40%_60%] items-center gap-3 px-3 py-2.5 sm:grid-cols-[44%_56%] sm:gap-4 sm:px-5 sm:py-4 md:px-7 md:py-5">
        <div className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden">
          {current.image && (
            <img
              key={current.image}
              src={current.image}
              alt={current.alt || current.attribution}
              className="max-h-full max-w-full rounded-sm object-contain shadow-md"
            />
          )}
        </div>
        <div className="flex min-h-0 flex-col justify-center pr-10 sm:pr-12">
          <blockquote className="line-clamp-4 font-brand text-[clamp(0.82rem,1.45vw,1.3rem)] leading-[1.32] font-normal text-white sm:line-clamp-none sm:leading-[1.38]">
            {current.quotationMarks ? `“${current.quote}”` : current.quote}
          </blockquote>
          {current.attribution && (
            <p className="mt-1.5 line-clamp-2 font-brand text-[clamp(0.72rem,1vw,0.95rem)] leading-tight text-white/90 sm:mt-3 sm:line-clamp-none sm:leading-snug">
              — {current.attribution}
              {current.subAttribution ? `, ${current.subAttribution}` : ""}
            </p>
          )}
        </div>
      </div>
      <div
        className="relative z-10 flex h-9 shrink-0 items-center justify-between px-3 sm:h-11 sm:px-4 md:h-12 md:px-5"
        style={{ backgroundColor: current.categoryColor || "#4f758b" }}
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {current.logo && (
            <img src={current.logo} alt="" className="h-5 w-auto shrink-0 object-contain sm:h-6 md:h-7" />
          )}
          <span className="truncate font-brand text-xs font-bold tracking-wider uppercase text-white sm:text-sm md:text-base">
            {current.categoryLabel}
          </span>
        </div>
        {current.categoryIcon && (
          <img
            src={current.categoryIcon}
            alt=""
            className="-mt-3 mr-10 h-10 w-10 shrink-0 rounded-full bg-white/95 p-1 object-contain shadow-md sm:-mt-4 sm:mr-11 sm:h-12 sm:w-12 md:h-14 md:w-14"
          />
        )}
      </div>
      {/* Google-Slides-style bottom control bar for intra-category slide navigation */}
      <div
        data-voices-bottom-controls
        className="relative z-20 flex h-8 shrink-0 items-center justify-between border-t border-black/10 bg-[#f8f9fa] px-2 text-xs text-[#3c4043]"
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            data-voices-prev
            aria-label="Previous slide in category"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((prev) => (prev - 1 + slides.length) % slides.length);
            }}
            className="inline-flex size-6 items-center justify-center rounded hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-pine"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5" aria-hidden>
              <path d="M12.5 5L7.5 10L12.5 15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="min-w-10 rounded-full bg-white px-2 py-0.5 text-center font-medium tabular-nums shadow-2xs">
            {index + 1} / {slides.length}
          </span>
          <button
            type="button"
            data-voices-next
            aria-label="Next slide in category"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((prev) => (prev + 1) % slides.length);
            }}
            className="inline-flex size-6 items-center justify-center rounded hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-pine"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5" aria-hidden>
              <path d="M7.5 5L12.5 10L7.5 15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <span className="pr-1 text-xs font-medium text-[#5f6368]">Community Voices</span>
      </div>
    </div>
  );
}

function DisplayFramedEmbed({ frame, running }: { frame: SlideFrame; running: boolean }) {
  if (frame.displayFrame === "screen") {
    return (
      <div
        data-display-frame="screen"
        className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-3 md:p-5"
      >
        <div className="flex h-full w-full max-w-[96%] flex-col overflow-hidden rounded-lg border-[5px] border-[#1f2622] bg-[#111614] shadow-xl sm:max-w-[94%] sm:border-[8px]">
          <div className="flex h-5 shrink-0 items-center justify-between bg-[#1f2622] px-2.5 text-xs font-medium tracking-wide text-paper/85 sm:h-6 sm:px-3">
            <span className="flex items-center gap-1.5 truncate">
              <span className="inline-block size-2 shrink-0 rounded-full bg-leaf" />
              <span className="truncate">Digital Signage Display — Community Event Carousel</span>
            </span>
            <span className="ml-2 shrink-0 text-paper/60 max-sm:hidden">City of Oberlin</span>
          </div>
          <div className="relative min-h-0 flex-1 w-full bg-white">
            <GuardedEmbed src={frame.embed!} title={frame.title} passive={false} className="absolute inset-0 h-full" />
          </div>
        </div>
        <div className="h-1.5 w-16 shrink-0 rounded-b bg-[#1f2622] sm:h-2 sm:w-20" />
      </div>
    );
  }
  return (
    <div
      data-display-frame="phone"
      className="absolute inset-0 flex items-center justify-center gap-6 px-3 py-2 sm:px-4 sm:py-3 md:px-8"
    >
      <div className="flex h-full w-[min(100%,14rem)] flex-col overflow-hidden rounded-[1.4rem] border-[5px] border-[#1f2622] bg-white shadow-xl sm:w-[min(100%,15rem)] sm:rounded-[1.6rem] sm:border-[6px]">
        <div className="flex h-5 shrink-0 items-center justify-center bg-[#1f2622]">
          <span className="h-1 w-10 rounded-full bg-white/30" />
        </div>
        <div className="relative min-h-0 flex-1 w-full bg-white">
          <ScrollingDashboard
            src={frame.embed!}
            title={frame.title}
            running={running}
            passiveMarker={false}
            virtualWidthOverride={430}
          />
        </div>
        <div className="flex h-4 shrink-0 items-center justify-center bg-[#1f2622]">
          <span className="h-1 w-14 rounded-full bg-white/40" />
        </div>
      </div>
      <div className="hidden max-w-44 text-left md:block">
        <p className="font-display text-sm font-bold text-pine">Mobile Phone View</p>
        <p className="mt-1 text-xs leading-relaxed text-ink/75">
          Community members can browse, search, and post events directly from their phone.
        </p>
      </div>
    </div>
  );
}

function isScrollableHomeEmbed(frame: SlideFrame | undefined) {
  if (!frame?.embed || frame.presentation || frame.voices || frame.displayFrame) return false;
  if (frame.nativeSize) return true;
  return /\/(calendar|data-hub\/embed\/ecolympic-tab-contents|dh-public\/(ops-embed|oc-embed|city-of-oberlin|glsc|.*\/dashboard\/))/.test(frame.embed);
}

function FrameGraphic({ frame, voices, home = false, previewPlaying = false, running = false, onWalkthroughComplete }: { frame: SlideFrame; voices: { title: string; url: string }; home?: boolean; previewPlaying?: boolean; running?: boolean; onWalkthroughComplete?: () => void }) {
  if (frame.displayFrame && frame.embed) {
    return <DisplayFramedEmbed key={frame.embed} frame={frame} running={running} />;
  }
  if (isScrollableHomeEmbed(frame) && frame.embed) {
    return (
      <ScrollingDashboard
        key={frame.embed}
        src={frame.embed}
        title={frame.title}
        running={running}
        partnerHeader={frame.partnerHeader}
        passiveMarker={home && !frame.nativeSize}
        phoneStart={frame.phoneStart}
        onComplete={onWalkthroughComplete}
      />
    );
  }
  if (frame.phoneWalkthrough) return <PhoneWalkthrough running={running} onComplete={onWalkthroughComplete} />;
  if (frame.phoneScan) return <PhoneScanExample />;
  if (frame.images) return <div className="absolute inset-0 grid grid-cols-2 gap-4 p-2" data-paired-examples>
    {frame.images.map(image => <div key={image.src} className="flex min-h-0 min-w-0 flex-col gap-2"><img src={image.src} alt={image.alt} className="block h-full min-h-0 w-full flex-1 object-contain" />{image.label && <p className="text-center t-small">{image.label}</p>}</div>)}
  </div>;
  if (frame.presentation) return <PresentationPreview frame={frame} home={home} previewPlaying={previewPlaying} />;
  if (frame.voices) {
    const src = new URL(voices.url);
    src.searchParams.set("portrait-mode", "0");
    src.searchParams.set("remove-controls", "1");
    src.searchParams.set("autoplay", previewPlaying ? "1" : "0");
    return (
      <VoicesCategoryPreview
        key={voices.url}
        url={voices.url}
        iframeSrc={src.toString()}
        title={`Community Voices: ${voices.title}`}
        running={running}
      />
    );
  }
  if (frame.embed) {
    const src = new URL(frame.embed);
    const isVoicesEmbed = src.pathname.includes("/cv-public/");
    if (isVoicesEmbed) {
      src.searchParams.set("portrait-mode", "0");
      src.searchParams.set("remove-controls", "1");
      src.searchParams.set("autoplay", previewPlaying ? "1" : "0");
      return (
        <VoicesCategoryPreview
          key={frame.embed}
          url={frame.embed}
          iframeSrc={src.toString()}
          title={frame.title}
          running={running}
        />
      );
    }
    if (frame.partnerHeader) {
      return (
        <div key={frame.embed} className="absolute inset-0 flex flex-col overflow-hidden bg-white">
          <img
            src={frame.partnerHeader}
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none block aspect-[960/90] w-full shrink-0 select-none object-cover object-top"
          />
          <GuardedEmbed
            src={src.toString()}
            title={frame.title}
            nativeSize={frame.nativeSize}
            passive={false}
            className="relative min-h-0 flex-1 w-full"
          />
        </div>
      );
    }
    return <GuardedEmbed key={frame.embed} src={src.toString()} title={frame.title} nativeSize={frame.nativeSize} passive={false} className="absolute inset-0 h-full" />;
  }
  // Photos fill the box with no bumpers; screenshots and diagrams (fit: "contain") are shown whole.
  return (
    // Not lazy: a contained photo is sized from its own pixels, so before it loads it has no box to be seen in.
    <img
      key={frame.src}
      decoding="async"
      src={frame.src}
      alt={frame.alt ?? ""}
      draggable={false}
      className={cn("absolute inset-0 block size-full object-center", frame.fit === "contain" ? "object-contain" : "object-cover")}
    />
  );
}

/**
 * The examples of one product: name with < > circles, one picture in one fixed-shape box, one caption.
 * The box never changes size and the controls never move. Slides move sideways (they cut under reduced motion).
 * Left and Right work inside the box. Horizontal swipe pages the examples; vertical strokes pass through to the page.
 */
export function Examples({
  frames,
  i,
  onI,
  heading,
  extra,
  home = false,
}: {
  frames: SlideFrame[];
  i: number;
  onI: (next: number) => void;
  /** The page's own title: an example with the same name leaves its title out. */
  heading?: string;
  /** Another control for the header row, beside the arrows (a Pause / Play for a slideshow that moves by itself). */
  extra?: ReactNode;
  home?: boolean;
}) {
  const figureRef = useRef<HTMLElement>(null);
  const dirRef = useRef<1 | -1>(1);
  const many = frames.length > 1;
  // Galleries share the default interval; walkthroughs finish their loops before advancing.
  const phoneExamples = frames.some(frame => frame.phoneWalkthrough);
  const step = (dir: 1 | -1) => {
    dirRef.current = dir;
    onI((i + dir + frames.length) % frames.length);
  };
  const stepRef = useRef(step);
  stepRef.current = step;
  const activeFrame = frames[Math.min(i, frames.length - 1)] ?? frames[0];
  const hasAutoMotion =
    many ||
    Boolean(activeFrame?.phoneWalkthrough) ||
    isScrollableHomeEmbed(activeFrame) ||
    Boolean(activeFrame?.presentation) ||
    Boolean(activeFrame?.voices) ||
    Boolean(activeFrame?.embed?.includes("/cv-public/"));
  const rotation = usePreviewRotation(
    figureRef,
    () => {
      if (many) stepRef.current(1);
    },
    hasAutoMotion,
    `${frames[0]?.title}:${i}`,
    activeFrame?.phoneWalkthrough || isScrollableHomeEmbed(activeFrame) ? null : undefined,
    // A dashboard answers only to Play / Pause (see ScrollingDashboard); other examples still hold while hovered.
    !phoneExamples && !isScrollableHomeEmbed(activeFrame),
    // John and Maddie, 19 Nov: a live dashboard sits still until the visitor presses Play, and can be scrolled by hand.
    isScrollableHomeEmbed(activeFrame),
  );
  useSwipe(figureRef, (dir) => {
    if (many) stepRef.current(dir > 0 ? 1 : -1);
  });

  const at = Math.min(i, frames.length - 1);
  const frame = frames[at] ?? frames[0];
  const voices = useVoicesRotation(Boolean(frame?.voices));
  const slide = useSlide(at, frames.map((f) => f.title).join("|"), dirRef);
  // The example's title and caption start where the picture starts: the frame's edge, or a contained photo's own edge.
  useLayoutEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;
    const image = frame?.src
      ? figure.querySelector<HTMLImageElement>(`[data-slide="${at}"] > img`)
      : null;
    // Layout positions only (offsetLeft ignores transforms), so a slide caught mid-animation measures the same as one at rest.
    const offsetWithin = (el: HTMLElement | null) => {
      let x = 0;
      for (let n: HTMLElement | null = el; n && n !== figure; n = n.offsetParent as HTMLElement | null) x += n.offsetLeft;
      return x;
    };
    const alignTitle = () => {
      const frameEl = figure.querySelector<HTMLElement>("[data-box-frame]");
      let left = offsetWithin(frameEl);
      if (image?.naturalWidth && getComputedStyle(image).objectFit === "contain") {
        const width = Math.min(image.offsetWidth, (image.offsetHeight * image.naturalWidth) / image.naturalHeight);
        left = offsetWithin(image) + (image.offsetWidth - width) / 2;
      }
      figure.style.setProperty("--photo-title-inset", `${Math.max(0, Math.round(left))}px`);
    };
    alignTitle();
    image?.addEventListener("load", alignTitle);
    const observer = new ResizeObserver(alignTitle);
    observer.observe(figure);
    if (image) observer.observe(image);
    return () => {
      image?.removeEventListener("load", alignTitle);
      observer.disconnect();
    };
  }, [at, frame?.src]);
  // Fetch the neighbouring pictures ahead of the click so a big image is not a blank box on arrival.
  useEffect(() => {
    if (!many) return;
    for (const n of [at + 1, at - 1]) {
      const src = frames[(n + frames.length) % frames.length]?.src;
      if (src) new Image().src = src;
    }
  }, [at, many, frames]);
  if (!frame) return null;
  const title = frame.voices ? voices.filter.title : frame.title;
  const showTitle = !heading || title !== heading;

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!many || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      step(e.key === "ArrowRight" ? 1 : -1);
    }
  };
  const layers = [at, ...(slide.prev !== null && slide.prev !== at && frames[slide.prev] ? [slide.prev] : [])];
  const scrollingEmbed = isScrollableHomeEmbed(frame);
  // On the home, a dashboard says how it works (John, 19 Nov 2026: "I don't know how anyone would know that").
  const legend = frame.legend ?? (home && scrollingEmbed && !frame.displayFrame ? "Scroll inside the dashboard, or press Play to scroll through it." : undefined);
  const hasPause = Boolean(many || scrollingEmbed || frame.phoneWalkthrough || frame.presentation || frame.voices || frame.embed?.includes("/cv-public/"));

  return (
    <figure
      ref={(el) => {
        (figureRef as { current: HTMLElement | null }).current = el;
        voices.ref(el);
      }}
      tabIndex={0}
      onKeyDown={onKeyDown}
      data-swipe-own
      data-slider-box
      data-home-example={home || undefined}
      data-rotating={home ? rotation.running : undefined}
      data-index={at}
      style={{ touchAction: "pan-y pinch-zoom" }}
      className="relative flex min-w-0 flex-col rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
    >
      {(showTitle || extra) && (
        <div className={cn("mb-1 flex min-h-11 items-center justify-between gap-2", !showTitle && "max-sm:absolute max-sm:top-1 max-sm:right-1 max-sm:z-10 max-sm:mb-0 max-sm:min-h-0")}>
          {showTitle && (
            <p data-example-title style={{ marginLeft: "var(--photo-title-inset, 0px)" }} className="flex min-w-0 items-center gap-2 font-bold text-ink t-body">
              {frame.logo && !home && (
                <img
                  src={frame.logo}
                  alt=""
                  className={cn("size-9 shrink-0 rounded object-contain", /white/i.test(frame.logo) && "bg-pine p-1")}
                />
              )}
              <span className="min-w-0 max-sm:line-clamp-2 max-sm:leading-tight sm:truncate">{title}</span>
            </p>
          )}
          {extra && <span className="ml-auto flex shrink-0">{extra}</span>}
        </div>
      )}
      {/* The stage holds the frame; on a wide screen the arrows stand outside it, on either side. */}
      <div className="media-stage" data-arrows={many || undefined}>
        <div
          data-box-frame
          data-walkthrough-frame={frame.phoneWalkthrough || undefined}
          data-phone-scan-frame={frame.phoneScan || undefined}
          data-presentation-frame={frame.presentation || undefined}
          data-voices-frame={frame.voices || frame.embed?.includes("/cv-public/") || undefined}
          className="relative aspect-[16/10] max-h-(--card-media-h) w-full min-w-0 overflow-hidden rounded-md border border-line bg-paper/60"
        >
          {layers.map((n) => {
            const current = n === at;
            return (
              <div
                key={n}
                data-slide={n}
                aria-hidden={current ? undefined : true}
                className={cn(
                  "absolute inset-0",
                  current && slide.prev !== null && (slide.dir > 0 ? "sb-in-next" : "sb-in-prev"),
                  !current && (slide.dir > 0 ? "sb-out-next" : "sb-out-prev"),
                )}
              >
                <FrameGraphic frame={frames[n]} voices={{ title: voices.filter.title, url: voices.filter.url }} home={home} previewPlaying={current && rotation.playing} running={current && rotation.running} onWalkthroughComplete={current && many ? () => stepRef.current(1) : undefined} />
              </div>
            );
          })}
        </div>
        {/* Previous, Pause and Next: arrows beside the frame and Pause below it on a wide screen; one row under it on a phone. */}
        {(many || hasPause) && (
          <div className="media-controls" data-slider-arrows>
            {many && (
              <button type="button" aria-label="Previous example" data-control="prev" className="slider-arrow-button" onClick={() => step(-1)}>
                <ChevronLeft className="size-5" strokeWidth={2.25} aria-hidden />
              </button>
            )}
            {hasPause && (
              <PlayPauseButton
                playing={rotation.playing}
                onToggle={rotation.toggle}
                className="home-round-btn media-pause-button"
                labels={
                  frame.phoneWalkthrough
                    ? { pause: "Pause animation", play: "Play animation" }
                    : scrollingEmbed
                      ? { pause: "Stop scrolling", play: "Scroll through the dashboard" }
                      : { pause: "Pause examples", play: "Play examples" }
                }
              />
            )}
            {many && (
              <button type="button" aria-label="Next example" data-control="next" className="slider-arrow-button" onClick={() => step(1)}>
                <ChevronRight className="size-5" strokeWidth={2.25} aria-hidden />
              </button>
            )}
          </div>
        )}
      </div>
      {many && <p className="sr-only" aria-live="polite">{`Example ${at + 1} of ${frames.length}`}</p>}
      <figcaption
        data-has-legend={Boolean(legend) || undefined}
        style={{ paddingLeft: "var(--photo-title-inset, 0px)" }}
        className={
          home
            ? legend
              ? "mt-2 text-left t-small text-ink/75"
              : "sr-only"
            : legend || frame.caption
              ? "mt-2 text-left t-small text-ink/75"
              : "sr-only"
        }
      >
        {legend ? (
          <span className="block text-ink/75">{legend}</span>
        ) : (
          !home && frame.caption
        )}
      </figcaption>
    </figure>
  );
}

/** Self-contained version for screens that show one product's examples without tabs. */
export function FrameSlider({ frames, heading, extra }: { frames: SlideFrame[]; heading?: string; extra?: ReactNode }) {
  const [i, setI] = useState(0);
  return <Examples frames={frames} i={i} onI={setI} heading={heading} extra={extra} />;
}
