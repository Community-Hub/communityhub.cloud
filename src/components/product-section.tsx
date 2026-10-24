import { ScrollingDashboard } from "@/components/scrolling-dashboard";
import { SliderArrows } from "@/components/slider-arrows";
import { PlayPauseButton, useAutoplay } from "@/components/play-pause";
import { copy } from "@/lib/copy";
import { useEffect, useLayoutEffect, useRef, useState, type ElementType, type KeyboardEvent, type ReactNode } from "react";
import { AppLink } from "@/components/app-link";
import { VoicesPane, useVoicesRotation } from "@/components/community-voices";
import { GuardedEmbed } from "@/components/guarded-embed";
import { useInnerStep } from "@/components/storyboard";
import { usePreviewRotation } from "@/lib/use-preview-rotation";
import { useSwipe } from "@/lib/use-swipe";
import type { ProductBeat, SlideFrame } from "@/lib/content";
import { cn } from "@/lib/utils";
import { PhoneScanExample, PhoneWalkthrough } from "@/components/phone-walkthrough";

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

function PresentationPreview({ frame, home = false, previewPlaying = false }: { frame: SlideFrame; home?: boolean; previewPlaying?: boolean }) {
  const [playing, setPlaying] = useAutoplay();
  const src = frame.embed!.replace("start=true", `start=${home ? previewPlaying : playing}`);
  return <><GuardedEmbed src={src} title={frame.title} passive={home} className="absolute inset-0 h-full" />
    {!home && <div className="absolute right-2 top-2 z-20 rounded bg-paper">
      <PlayPauseButton playing={playing} onToggle={() => setPlaying(p => !p)} labels={{pause:"Stop story preview",play:"Start story preview"}} />
    </div>}</>;
}

function FrameGraphic({ frame, voices, home = false, previewPlaying = false, running = false, onWalkthroughComplete }: { frame: SlideFrame; voices: { title: string; url: string }; home?: boolean; previewPlaying?: boolean; running?: boolean; onWalkthroughComplete?: () => void }) {
  if (home && frame.nativeSize && frame.embed) return <ScrollingDashboard key={frame.embed} src={frame.embed} title={frame.title} running={running} onComplete={onWalkthroughComplete} />;
  if (frame.phoneWalkthrough) return <PhoneWalkthrough running={running} onComplete={onWalkthroughComplete} />;
  if (frame.phoneScan) return <PhoneScanExample />;
  if (frame.images) return <div className="absolute inset-0 grid grid-cols-2 gap-4 p-2" data-paired-examples>
    {frame.images.map(image => <div key={image.src} className="flex min-h-0 min-w-0 flex-col gap-2"><img src={image.src} alt={image.alt} className="block h-full min-h-0 w-full flex-1 object-contain" />{image.label && <p className="text-center t-small">{image.label}</p>}</div>)}
  </div>;
  if (frame.presentation) return <PresentationPreview frame={frame} home={home} previewPlaying={previewPlaying} />;
  if (frame.voices) return <VoicesPane src={voices.url} title={`Community Voices: ${voices.title}`} />;
  if (frame.embed) {
    const src = new URL(frame.embed);
    if (home && src.pathname.includes('/cv-public/')) {
      src.searchParams.set('portrait-mode', '0');
      src.searchParams.set('remove-controls', '1');
      src.searchParams.set('autoplay', previewPlaying ? '1' : '0');
    }
    return <GuardedEmbed key={frame.embed} src={src.toString()} title={frame.title} nativeSize={frame.nativeSize} passive={home && !frame.nativeSize} className="absolute inset-0 h-full" />;
  }
  // Photos fill the box with no bumpers; screenshots and diagrams (fit: "contain") are shown whole.
  return (
    <img
      key={frame.src}
      loading="lazy"
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
  const rotation = usePreviewRotation(figureRef, () => { if (many) stepRef.current(1); }, home && (many || Boolean(frames[i]?.phoneWalkthrough)), `${frames[0]?.title}:${i}`, (frames[i]?.phoneWalkthrough || frames[i]?.nativeSize) ? null : undefined, !phoneExamples);
  useSwipe(figureRef, (dir) => {
    if (many) stepRef.current(dir > 0 ? 1 : -1);
  });

  const at = Math.min(i, frames.length - 1);
  const frame = frames[at] ?? frames[0];
  const voices = useVoicesRotation(Boolean(frame?.voices));
  const slide = useSlide(at, frames.map((f) => f.title).join("|"), dirRef);
  // Contained portrait photos have side gutters. Keep their title on the photo edge.
  useLayoutEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;
    const image = frame?.src
      ? figure.querySelector<HTMLImageElement>(`[data-slide="${at}"] > img`)
      : null;
    const alignTitle = () => {
      let inset = 0;
      if (image?.naturalWidth && getComputedStyle(image).objectFit === "contain") {
        const width = Math.min(image.clientWidth, image.clientHeight * image.naturalWidth / image.naturalHeight);
        inset = Math.max(0, (image.clientWidth - width) / 2);
      }
      figure.style.setProperty("--photo-title-inset", `${inset}px`);
    };
    alignTitle();
    if (!image) return;
    image.addEventListener("load", alignTitle);
    const observer = new ResizeObserver(alignTitle);
    observer.observe(image);
    return () => {
      image.removeEventListener("load", alignTitle);
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
      {(showTitle || many || extra || frame.voices) && (
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
          {frame.voices && (
            <span className="ml-auto flex shrink-0">
              <PlayPauseButton
                playing={voices.playing}
                onToggle={voices.toggle}
                labels={{ pause: copy.productPager.ProductPager.button_label1, play: copy.productPager.ProductPager.button_label2 }}
              />
            </span>
          )}
          {extra && <span className="ml-auto flex shrink-0">{extra}</span>}
        </div>
      )}
      <div
        data-box-frame
        data-walkthrough-frame={frame.phoneWalkthrough || undefined}
        data-phone-scan-frame={frame.phoneScan || undefined}
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
              <FrameGraphic frame={frames[n]} voices={{ title: voices.filter.title, url: voices.filter.url }} home={home} previewPlaying={current && rotation.playing} running={current && rotation.running} onWalkthroughComplete={home && current && many ? () => stepRef.current(1) : undefined} />
            </div>
          );
        })}
        {(many || (home && (frame.phoneWalkthrough || frame.presentation))) && <div className="home-media-controls">
          {many && <SliderArrows onPrev={() => step(-1)} onNext={() => step(1)} labels={{prev: "Previous example", next: "Next example"}} />}
          {home && <PlayPauseButton playing={rotation.playing} onToggle={rotation.toggle} labels={frame.phoneWalkthrough ? {pause: "Pause animation", play: "Play animation"} : {pause: "Pause examples", play: "Play examples"}} />}
        </div>}
      </div>
      <figcaption className={home ? "sr-only" : "mt-2 text-left t-small md:min-h-[2.9em] max-sm:hidden"}>
        {frame.caption}
        {frame.legend && <span className="mt-0.5 block text-ink/60">{frame.legend}</span>}
      </figcaption>
      {many && <p className="sr-only" aria-live="polite">{`Example ${at + 1} of ${frames.length}`}</p>}
    </figure>
  );
}

/** Self-contained version for screens that show one product's examples without tabs. */
export function FrameSlider({ frames, heading, extra }: { frames: SlideFrame[]; heading?: string; extra?: ReactNode }) {
  const [i, setI] = useState(0);
  return <Examples frames={frames} i={i} onI={setI} heading={heading} extra={extra} />;
}

export type ProductAction = { href: string; label: string } | null;

type Props = {
  /** Homepage corrections are isolated from the product-page layouts. */
  home?: boolean;
  title: string;
  as?: ElementType;
  items: ProductBeat[];
  active: number;
  /** Chapter mode: tabs are buttons that switch the card. */
  onActive?: (next: number) => void;
  /** Page mode: tabs are links to each product's own page. */
  tabs?: "buttons" | "links";
  /** The call to action under the body. Defaults to a "Learn more" link to the product page. */
  action?: (item: ProductBeat) => ProductAction;
  /** Slug of the example to open, and a callback when the visitor pages to another one. */
  openExample?: string;
  onExample?: (slug: string) => void;
};

/**
 * The one multi-item section. A big title, a row of arrow-prefixed product links over a thin rule,
 * and one outlined card: icon, name, body and a link on the left; examples on the right.
 * On a phone it stacks (title, scrolling link row, text, image) and still fits one screen.
 */
export function ProductSection({
  title,
  home = false,
  as: Title = "h2",
  items,
  active,
  onActive,
  tabs = "buttons",
  action,
  openExample,
  onExample,
}: Props) {
  const item = items[active] ?? items[0];
  const [fi, setFi] = useState(0);
  const written = useRef("");
  const rowRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ l: false, r: false });
  const activeId = item?.id;

  // Page scroll moves through the product menu before leaving the chapter; examples stay on the < > arrows.
  useInnerStep(rootRef, (dir) => {
    if (tabs !== "buttons" || !onActive) return false;
    const next = active + dir;
    if (next < 0 || next >= items.length) return false;
    onActive(next);
    return true;
  });

  // A new product starts at its first example, unless the address names one.
  useEffect(() => {
    if (!item) return;
    if (openExample && openExample === written.current) return;
    const at = openExample ? item.frames.findIndex((frame) => slugOf(frame.title) === openExample || frame.aliases?.includes(openExample)) : -1;
    setFi(at >= 0 ? at : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, openExample]);

  // Keep the active link in view when the row scrolls sideways (phones).
  useEffect(() => {
    const row = rowRef.current;
    const tab = row?.querySelector<HTMLElement>("[data-active='true']");
    if (!row || !tab) return;
    row.scrollLeft = Math.max(0, tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2);
  }, [activeId]);

  // On a phone the row wraps so every tab shows. Where it scrolls, a fade on the side with more links says so.
  const updateFade = () => {
    const row = rowRef.current;
    if (!row) return;
    const l = row.scrollLeft > 2;
    const r = row.scrollLeft + row.clientWidth < row.scrollWidth - 2;
    setFade((f) => (f.l === l && f.r === r ? f : { l, r }));
  };
  useEffect(() => {
    updateFade();
    window.addEventListener("resize", updateFade);
    return () => window.removeEventListener("resize", updateFade);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, items.length]);

  if (!item) return null;
  const cta: ProductAction = action ? action(item) : { href: item.href, label: "Learn more" };

  // ARIA tabs: Left/Right/Home/End move focus and selection, and only the chosen tab is in the tab order.
  const onTabKey = (e: KeyboardEvent<HTMLElement>) => {
    if (tabs !== "buttons" || !onActive || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const to = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: items.length - 1 }[e.key];
    if (to === undefined || to < 0 || to >= items.length) return;
    e.preventDefault();
    onActive(to);
    requestAnimationFrame(() => rowRef.current?.querySelectorAll<HTMLElement>("[role='tab']")[to]?.focus({ preventScroll: true }));
  };

  const tabClass = (on: boolean) =>
    cn(
      "flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap t-body max-md:min-h-9 short:min-h-9",
      on ? "font-bold text-ink" : "text-ink/70",
    );
  const label = (text: string, on: boolean) => (
    <span className={cn("py-0.5", on && "border-b-2 border-ink")}>{text}</span>
  );

  return (
    <div ref={rootRef} data-scroll-restoration-id={`product-${slugOf(title)}`} data-allow-scroll data-home-product={home || undefined} className="scroll-visible h-full">
      <div className="wrap screen-pad max-md:[--card-media-h:clamp(7rem,calc(100dvh-34rem),24rem)]">
        <Title className="t-h2">{title}</Title>
        {items.length > 1 && (
          <div
            ref={rowRef}
            onScroll={updateFade}
            onKeyDown={onTabKey}
            style={{
              touchAction: "pan-x",
              maskImage: `linear-gradient(to right, ${fade.l ? "transparent, #000 1.75rem" : "#000, #000"}, ${fade.r ? "#000 calc(100% - 1.75rem), transparent" : "#000, #000"})`,
            }}
            className="mt-1 flex gap-x-6 border-b border-pine/25 [scrollbar-width:none] max-md:flex-wrap max-md:gap-x-4 md:overflow-x-auto"
            {...(tabs === "buttons" ? { role: "tablist", "aria-label": title } : { "aria-label": title })}
          >
            {items.map((entry, n) =>
              tabs === "links" ? (
                <AppLink
                  key={entry.id}
                  href={entry.href}
                  aria-current={n === active ? "page" : undefined}
                  data-active={n === active}
                  className={tabClass(n === active)}
                >
                  {label(entry.title, n === active)}
                </AppLink>
              ) : (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={n === active}
                  data-active={n === active}
                  tabIndex={n === active ? 0 : -1}
                  onClick={() => onActive?.(n)}
                  className={tabClass(n === active)}
                >
                  {label(entry.title, n === active)}
                </button>
              ),
            )}
          </div>
        )}
        <div data-product-composition data-compact-preview={home && title === "Engage" || undefined} className="mt-3 short:mt-2 grid rounded-xl border border-pine/45 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div data-product-copy className="flex min-w-0 flex-col md:order-last px-4 pt-4 pb-2 md:p-6 short:md:p-4">
            <div className={cn("items-center gap-3 md:flex", home ? "flex" : "hidden")}>
              <img src={item.icon} alt="" className="size-11 shrink-0 object-contain" />
              <h3 className="t-h3">{item.title}</h3>
            </div>
            <p className="line-clamp-3 max-w-xl t-body mt-3 md:line-clamp-none short:md:mt-2">{item.body}</p>
            {cta && (
              <div className="mt-1 md:mt-3 short:md:mt-1">
                <AppLink href={cta.href} className="link">
                  {cta.label}
                </AppLink>
              </div>
            )}
          </div>
          <div data-product-media className="min-w-0 px-3 pt-0 pb-3 md:px-4 md:py-4 short:md:py-3">
            <Examples
              frames={item.frames}
              home={home}
              i={home ? Math.max(0, item.frames.findIndex(frame => slugOf(frame.title) === openExample || (openExample && frame.aliases?.includes(openExample)))) : fi}
              onI={(next) => {
                setFi(next);
                const slug = slugOf(item.frames[next]?.title ?? "");
                written.current = slug;
                onExample?.(slug);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
