import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { Breadcrumbs } from "@/components/breadcrumbs";
export { ContactBand } from "@/components/contact-band";
import { Examples, slugOf } from "@/components/product-section";
import publicationsData from "@/data/publications.json";
import { demoChanges, type ProductBeat } from "@/lib/content";
import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
import { homeEducateBeats, homeEmpowerBeats, homeEngageBeats, homeFeatureStories, homeMission } from "@/lib/home-feedback";
import { imageSize } from "@/lib/image-dimensions";
import { implementationHref, implementations } from "@/lib/implementations";
import { usePreviewRotation } from "@/lib/use-preview-rotation";
import { useSwipe } from "@/lib/use-swipe";
import { whoStops } from "@/lib/who";

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Smooth in-page jump that leaves no #fragment in the address bar. */
export function scrollToSection(id: string, event?: MouseEvent) {
  const el = document.getElementById(id);
  if (!el) return;
  event?.preventDefault();
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

/* ------------------------------------------------------------------ Film */

export function HeroFilm() {
  const hero = copy.chapters.StoriesChapter;
  const t = copy.home.Hero;
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    let handOff: number | undefined;
    let handedOff = false;
    // Once the visitor scrolls, clicks or types, the page is theirs: it never moves by itself after that.
    let touched = false;
    const cancel = () => {
      touched = true;
      window.clearTimeout(handOff);
    };
    const onPlay = () => setPlaying(true);
    const onStop = () => setPlaying(false);
    // When the film ends and the visitor is still at the top, the page moves on to what Community Hub is, once
    // (Maddie, 19 Nov 2026: "it should go straight from 'it has never been more important' into the community-centered
    // communication platform"). Any scroll, key or touch in the meantime cancels it.
    const onEnded = () => {
      setPlaying(false);
      if (handedOff || touched || document.hidden || window.scrollY > 24) return;
      handedOff = true;
      handOff = window.setTimeout(() => {
        if (window.scrollY <= 24) scrollToSection("platform");
      }, 700);
    };
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onStop);
    v.addEventListener("ended", onEnded);
    for (const type of ["wheel", "touchstart", "keydown", "pointerdown"] as const) window.addEventListener(type, cancel, { passive: true });
    // The film plays once and rests on its last frame. Reduced motion keeps it still until the visitor presses Play.
    if (!prefersReducedMotion()) v.play().catch(() => setPlaying(false));
    return () => {
      cancel();
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onStop);
      v.removeEventListener("ended", onEnded);
      for (const type of ["wheel", "touchstart", "keydown", "pointerdown"] as const) window.removeEventListener(type, cancel);
    };
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      if (v.ended) v.currentTime = 0;
      v.play().catch(() => {});
    } else v.pause();
  };
  const label = playing ? t.button_label1 : t.button_label2;

  return (
    <section id="top" aria-labelledby="home-title" className="home-hero page">
      <div className="home-hero-panel panel">
        <video ref={video} muted playsInline preload="auto" poster={hero.video_poster1} aria-hidden tabIndex={-1}>
          <source src="/assets/hero-ch-fwd.mp4" type="video/mp4" media="(min-width: 768px)" />
          <source src="/assets/hero-ch-fwd-720.mp4" type="video/mp4" />
        </video>
        <div aria-hidden className="home-hero-scrim" />
        <div className="home-hero-copy wrap">
          <h1 id="home-title" className="home-hero-title">
            {hero.h11} {hero.h12} <span className="text-lime">{hero.span1}</span> {hero.h13}{" "}
            <span className="text-lime">{hero.span2}</span>
          </h1>
          <p className="home-hero-line">{t.p1}</p>
          {/* No Contact us or Book a demo here (John, 19 Nov 2026: "that's a cut from the first page"); both are on the
              closing page, and Contact us is in the menu. */}
        </div>
        <button type="button" onClick={toggle} aria-label={label} title={label} className="home-film-toggle">
          {playing ? <Pause className="size-4.5" fill="currentColor" strokeWidth={0} aria-hidden /> : <Play className="size-4.5 translate-x-px" fill="currentColor" strokeWidth={0} aria-hidden />}
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Who it's for */

const AUDIENCE_ORDER = ["cities", "neighborhoods", "schools", "campuses", "museums"] as const;

/**
 * Each place's card photo. None of these appears anywhere else on the home (the quotes, examples and closing
 * page use their own), so no picture shows twice on one page.
 */
const AUDIENCE_PHOTO: Record<(typeof AUDIENCE_ORDER)[number], { src: string; alt: string; focus?: string }> = {
  cities: {
    src: "/assets/photos/chalk-walk-2022/chalk-walk-2022-14.jpg",
    alt: "Families drawing with chalk on a downtown Oberlin sidewalk at the 2022 Chalk Walk, a fire engine parked behind them",
    focus: "44% 50%",
  },
  neighborhoods: {
    src: "/assets/signage-partners/asian-town-center.jpg",
    alt: "Three young people in front of the MidTown digital sign at Asian Town Center",
    focus: "38% 50%",
  },
  schools: { src: "/assets/classroom-dashboard.jpg", alt: "A classroom with the school building dashboard on screen", focus: "62% 50%" },
  campuses: {
    src: "/assets/photos/big-parade-2023/big-parade-2023-13.jpg",
    alt: "A crowd in colorful costumes beside an Oberlin College stone building with a pointed tower",
    focus: "40% 50%",
  },
  museums: {
    src: "/assets/glsc-exhibit.jpg",
    alt: "Students and staff in front of a dashboard screen and a touch tablet at the Great Lakes Science Center",
    focus: "48% 50%",
  },
};

/** Previous and next for a sideways row: each press moves one card; an arrow fades out at its end of the row. */
function useRowArrows() {
  const ref = useRef<HTMLUListElement>(null);
  const [ends, setEnds] = useState({ start: true, end: false });
  useEffect(() => {
    const row = ref.current;
    if (!row) return;
    const update = () => {
      const max = row.scrollWidth - row.clientWidth;
      setEnds({ start: row.scrollLeft <= 4, end: row.scrollLeft >= max - 4 });
    };
    update();
    row.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(row);
    return () => {
      row.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);
  const move = (dir: 1 | -1) => {
    const row = ref.current;
    const card = row?.querySelector("li");
    if (!row || !card) return;
    const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    row.scrollBy({ left: dir * (card.getBoundingClientRect().width + gap), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };
  return { ref, ends, move };
}

/**
 * The kinds of community Community Hub serves, each with its real place. It is the Communities page under Bring
 * Dashboard to Your Community, not a home section (John, 19 Nov 2026: "I do kind of like it. It just doesn't belong
 * where it is ... it could be under Bring Dashboard to Your Community, because your community could be cities,
 * neighborhoods, schools"). `title` is the page's name from the menu.
 */
export function Audiences({ title, lede }: { title?: string; lede?: string }) {
  const t = copy.home.Audiences;
  const stops = AUDIENCE_ORDER.flatMap((id) => whoStops.filter((stop) => stop.id === id));
  const row = useRowArrows();
  const Heading = title ? "h1" : "h2";
  return (
    <section id="audiences" aria-labelledby="audiences-title" className={title ? "page page-first" : "page"}>
      <div className="wrap page-body">
        {title && <Breadcrumbs className="mb-5" />}
        <div className="page-head">
          <div className="min-w-0">
            <Heading id="audiences-title" className="t-h2">
              {title ?? t.h21}
            </Heading>
            {lede && <p className="mt-2 max-w-3xl t-body text-ink/80">{lede}</p>}
          </div>
          <AppLink href="/implementations" className="link">
            {t.AppLink1} <ArrowRight className="size-4" aria-hidden />
          </AppLink>
        </div>
        <div className="home-audiences-stage page-fill">
        <button type="button" className="home-round-btn home-row-arrow" data-side="prev" aria-label="Previous places" disabled={row.ends.start} onClick={() => row.move(-1)}>
          <ChevronLeft className="size-5" strokeWidth={2.25} aria-hidden />
        </button>
        <ul ref={row.ref} className="home-audiences">
          {stops.map((stop) => {
            const place = implementations.find((p) => p.audience === stop.id);
            const photo = AUDIENCE_PHOTO[stop.id as keyof typeof AUDIENCE_PHOTO];
            const size = imageSize(photo.src);
            return (
              <li key={stop.id}>
                <AppLink href={place ? implementationHref(place.slug) : "/implementations"} className="home-audience">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    width={size?.width}
                    height={size?.height}
                    decoding="async"
                    className="home-audience-photo"
                    style={photo.focus ? { objectPosition: photo.focus } : undefined}
                  />
                  <span className="home-audience-text">
                    <span className="home-audience-name">
                      <img src={`/assets/icon-${stop.id}.png`} alt="" width={32} height={32} className="home-audience-icon" />
                      {stop.name}
                    </span>
                    <span className="home-audience-line">{stop.description}</span>
                    {place && (
                      <span className="home-audience-place">
                        {place.name}
                        <ArrowRight className="size-4" aria-hidden />
                      </span>
                    )}
                  </span>
                </AppLink>
              </li>
            );
          })}
        </ul>
        <button type="button" className="home-round-btn home-row-arrow" data-side="next" aria-label="Next places" disabled={row.ends.end} onClick={() => row.move(1)}>
          <ChevronRight className="size-5" strokeWidth={2.25} aria-hidden />
        </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ The platform */

const IDENTITY = [
  { src: "/assets/v1/CVicon.png" },
  { src: "/assets/v1/CWD.png" },
  { src: "/assets/v1/CH.png", center: true },
  { src: "/assets/v1/bdash.png" },
  { src: "/assets/v1/calicon_v2.png" },
];

/**
 * The product family's icons assemble outward from the Community Hub mark (the original site's animation).
 * It plays whenever the row comes into view and plays again after the visitor scrolls away and back.
 * The server renders it at rest (visible); once mounted it waits hidden only while it is below the fold.
 */
function IdentityRow() {
  const ref = useRef<HTMLDivElement>(null);
  // "rest" on the server and for visitors without scripts: the five icons simply show.
  const [state, setState] = useState<"rest" | "pending" | "in">("rest");
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const box = el.getBoundingClientRect();
    setState(box.top < window.innerHeight && box.bottom > 0 ? "in" : "pending");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.intersectionRatio >= 0.5) setState("in");
        else if (!entry.isIntersecting) setState("pending");
      },
      { threshold: [0, 0.5] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} data-state={state} aria-hidden className="home-identity-row">
      {IDENTITY.map((icon) => (
        <img key={icon.src} src={icon.src} alt="" data-center={icon.center || undefined} />
      ))}
    </div>
  );
}

export function Platform() {
  const t = copy.chapters.WhoChapter;
  return (
    <section id="platform" aria-labelledby="platform-title" className="page page-center">
      <div className="wrap page-body">
        <IdentityRow />
        <h2 id="platform-title" className="t-h2 mx-auto mt-10 max-w-3xl text-center">
          {t.h21}
        </h2>
        <p className="t-lede mx-auto mt-4 max-w-2xl text-center">{t.p1}</p>
        <div className="home-mission-text mx-auto mt-[clamp(1.5rem,4vh,3rem)] grid max-w-5xl gap-6 md:grid-cols-2 md:gap-14">
          <p className="t-body text-ink/80">{homeMission.problem}</p>
          <p className="t-body text-ink/80">{homeMission.solution}</p>
        </div>
        <p className="mt-[clamp(1rem,3vh,2rem)] text-center">
          <AppLink href={t.TextLink_href1} className="link">
            {t.TextLink_label1}
            <span className="sr-only"> about Community Hub</span>
            <ArrowRight className="size-4" aria-hidden />
          </AppLink>
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Engage, Educate, Motivate and Empower */

export type CategoryTarget = { section: string; beat: string; example?: string; n: number };

/** The product's one-line description from the Products menu, as a sentence. Falls back to the long description. */
function lineFor(item: ProductBeat) {
  const blurb = pc.products.GROUPS.flatMap((group) => group.items).find((entry) => entry.id === item.id)?.blurb;
  if (!blurb) return item.body;
  return /[.!?]$/.test(blurb) ? blurb : `${blurb}.`;
}

function Category({ id, title, beats, target }: { id: string; title: string; beats: ProductBeat[]; target?: CategoryTarget }) {
  const [active, setActive] = useState(0);
  const [example, setExample] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const item = beats[active] ?? beats[0];

  // A link such as /#engage/embed opens that product (and, when named, that example).
  useEffect(() => {
    if (!target || target.section !== id) return;
    const i = beats.findIndex((beat) => beat.id === target.beat);
    if (i < 0) return;
    setActive(i);
    const f = target.example
      ? beats[i].frames.findIndex((frame) => slugOf(frame.title) === target.example || frame.aliases?.includes(target.example!))
      : -1;
    setExample(Math.max(0, f));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const select = (n: number) => {
    setActive(n);
    setExample(0);
  };

  // ARIA tabs: arrows, Home and End move between products; only the chosen tab is in the tab order.
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const to = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: beats.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const next = (to + beats.length) % beats.length;
    select(next);
    requestAnimationFrame(() => tabsRef.current?.querySelectorAll<HTMLElement>("[role='tab']")[next]?.focus());
  };

  if (!item) return null;
  return (
    <section id={id} aria-labelledby={`${id}-title`} data-home-category className="page">
      <div className="wrap page-body">
        <div className="home-category-head">
        <h2 id={`${id}-title`} className="t-h2">
          {title}
        </h2>
        <div ref={tabsRef} role="tablist" aria-label={title} onKeyDown={onKey} className="home-tabs">
          {beats.map((beat, n) => (
            <button
              key={beat.id}
              id={`${id}-tab-${beat.id}`}
              type="button"
              role="tab"
              aria-selected={n === active}
              aria-controls={`${id}-panel`}
              tabIndex={n === active ? 0 : -1}
              onClick={() => select(n)}
              className="home-tab"
            >
              {beat.title}
            </button>
          ))}
        </div>
        </div>
        <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${item.id}`} className="home-category-panel">
          <div key={item.id} className="home-category-copy">
            <img src={item.icon} alt="" width={56} height={56} className="size-14 object-contain" />
            <h3 className="t-h3 mt-5">{item.title}</h3>
            <p className="mt-3 t-lede">{lineFor(item)}</p>
            <AppLink href={item.href} className="link mt-4">
              Learn more<span className="sr-only"> about {item.title}</span>
              <ArrowRight className="size-4" aria-hidden />
            </AppLink>
          </div>
          <div className="home-category-media min-w-0">
            <Examples key={item.id} frames={item.frames} i={example} onI={setExample} home />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Categories({ target }: { target?: CategoryTarget }) {
  const c = copy.chapters;
  return (
    <div className="home-categories">
      <Category id="engage" title={c.EngageChapter.Pillar_kicker1} beats={homeEngageBeats()} target={target} />
      <Category id="educate" title={c.EducateChapter.Pillar_kicker1} beats={homeEducateBeats()} target={target} />
      <Category id="motivate" title={c.MotivateChapter.Pillar_kicker1} beats={homeEmpowerBeats()} target={target} />
    </div>
  );
}

/* ------------------------------------------------------------------ What people say */

export function Voices() {
  const t = copy.home.Voices;
  const stories = homeFeatureStories();
  const [at, setAt] = useState(0);
  const [moved, setMoved] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const go = (next: number) => {
    setMoved(true);
    setAt((next + stories.length) % stories.length);
  };
  const step = (dir: 1 | -1) => {
    setMoved(true);
    setAt((n) => (n + dir + stories.length) % stories.length);
  };
  const rotation = usePreviewRotation(ref, () => step(1), stories.length > 1, at);
  useSwipe(ref, (dir) => step(dir > 0 ? 1 : -1));
  const story = stories[at];
  if (!story) return null;
  const size = imageSize(story.img);
  const arrow = (dir: 1 | -1, className: string) => (
    <button type="button" className={className} aria-label={dir < 0 ? t.button_label1 : t.button_label2} onClick={() => step(dir)}>
      {dir < 0 ? <ChevronLeft className="size-6" aria-hidden /> : <ChevronRight className="size-6" aria-hidden />}
    </button>
  );

  return (
    <section id="voices" aria-labelledby="voices-title" className="page bg-lime-pale">
      <div className="wrap page-body">
        <h2 id="voices-title" className="t-h2">
          {t.h21}
        </h2>
        <div ref={ref} className="home-voices" style={{ touchAction: "pan-y pinch-zoom" }}>
          {arrow(-1, "home-voices-arrow")}
          <div key={at} data-animate={moved || undefined} aria-live={rotation.running ? "off" : "polite"} className="home-voice">
            <img src={story.img} alt={story.alt} width={size?.width} height={size?.height} className="home-voice-photo" />
            <figure className="min-w-0">
              <blockquote className="home-voice-quote">“{story.quote}”</blockquote>
              <figcaption className="mt-6">
                <span className="block font-semibold text-ink">{story.speaker}</span>
                <span className="block text-[0.9375rem] text-ink/72">{story.sourceRole}</span>
              </figcaption>
              {story.links.length > 0 && (
                <p className="mt-4 flex flex-wrap gap-x-5">
                  {story.links.map((link) => (
                    <AppLink key={link.href} href={link.href} className="link">
                      {link.label}
                      <ArrowRight className="size-4" aria-hidden />
                    </AppLink>
                  ))}
                </p>
              )}
            </figure>
          </div>
          {arrow(1, "home-voices-arrow")}
        </div>
        <div className="home-voices-nav">
          {arrow(-1, "home-voices-arrow home-voices-arrow-sm")}
          <div role="group" aria-label={t.h21} className="flex items-center">
            {stories.map((entry, n) => (
              <button
                key={`${entry.speaker}-${n}`}
                type="button"
                className="home-dot"
                aria-label={`${n + 1} of ${stories.length}: ${entry.speaker}`}
                aria-current={n === at || undefined}
                onClick={() => go(n)}
              >
                <span />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="home-round-btn"
            aria-label={rotation.playing ? t.button_label3 : t.button_label4}
            title={rotation.playing ? t.button_label3 : t.button_label4}
            onClick={rotation.toggle}
          >
            {rotation.playing ? <Pause className="size-4" fill="currentColor" strokeWidth={0} aria-hidden /> : <Play className="size-4 translate-x-px" fill="currentColor" strokeWidth={0} aria-hidden />}
          </button>
          {arrow(1, "home-voices-arrow home-voices-arrow-sm")}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ What it changed */

/** Each result leads with the line that carries its number; the next line gives the context. */
function resultLines(change: (typeof demoChanges)[number]) {
  const [first = "", second = ""] = change.lines;
  if (change.id === "dorms") {
    const study = publicationsData.find((paper) => String(paper.year) === "2007")?.finding;
    return { lead: study ?? first, support: change.lines.find((line) => line.includes("chart")) ?? second };
  }
  if (change.id === "schools") return { lead: change.lines.find((line) => /\d+%/.test(line)) ?? first, support: first };
  return { lead: first, support: second };
}

/** `onResearch`: shown on the Research page itself, so it does not link there (it moved from the home on 21 Nov 2026). */
export function Results({ onResearch = false }: { onResearch?: boolean }) {
  const t = copy.home.Results;
  const shown = demoChanges.filter((change) => change.image);
  const research = demoChanges.find((change) => change.id === "research");
  return (
    <section id="results" aria-labelledby="results-title" className="page bg-field">
      <div className="wrap page-body">
        <div className="page-head">
          <div className="max-w-3xl">
            <h2 id="results-title" className="t-h2">
              {t.h21}
            </h2>
            {research?.lines[0] && <p className="t-lede mt-4">{research.lines[0]}</p>}
          </div>
          {!onResearch && (
            <AppLink href="/research" className="link">
              {t.AppLink1} <ArrowRight className="size-4" aria-hidden />
            </AppLink>
          )}
        </div>
        <ul className="home-results strip page-fill">
          {shown.map((change) => {
            const size = imageSize(change.image!);
            const { lead, support } = resultLines(change);
            return (
              <li key={change.id} className="strip-item min-w-0">
                <span className="home-fit block aspect-[16/9]">
                  <img src={change.image} alt={change.alt} width={size?.width} height={size?.height} loading="lazy" decoding="async" />
                </span>
                <h3 className="t-h3 mt-[clamp(0.75rem,2.5vh,1.5rem)]">{change.name}</h3>
                <p className="mt-3 text-lg leading-snug font-medium text-pine">{lead}</p>
                {support && <p className="result-support mt-2 t-body text-ink/72">{support}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
