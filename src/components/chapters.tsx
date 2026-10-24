import { useRouterState } from "@tanstack/react-router";
import { HomeFeatures } from "@/components/home-features";
import { useEffect, useRef, useState } from "react";
import { Chapter, useStory } from "@/components/storyboard";
import { ProductSection } from "@/components/product-section";
import { homeEducateBeats, homeEngageBeats, homeEmpowerBeats, homeMission, homeOrbBeats } from "@/lib/home-feedback";
import {
  type ProductBeat,
} from "@/lib/content";
import { cn } from "@/lib/utils";

import { copy } from "@/lib/copy";

function Pillar({
  chapter,
  kicker,
  beats,
  className,
}: {
  chapter: number;
  kicker: string;
  beats: ProductBeat[];
  className: string;
}) {
  const { index, hashBeat, reportBeat } = useStory();
  const example = useRouterState({ select: s => s.location.hash.split("/")[2] ?? "" });
  const [beat, setBeat] = useState(0);
  const active = index === chapter;
  const wanted = useRef<number | null>(null);

  // "#educate/harkness" opens that beat; the visible beat is written back so Back returns to it.
  useEffect(() => {
    if (!active || !hashBeat) return;
    const i = beats.findIndex((item) => item.id === hashBeat);
    if (i >= 0 && i !== beat) {
      wanted.current = i;
      setBeat(i);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, hashBeat]);
  useEffect(() => {
    if (!active) return;
    if (wanted.current !== null) {
      if (wanted.current !== beat) return;
      wanted.current = null;
    }
    const id = beats[beat]?.id;
    if (id) reportBeat(chapter, id === hashBeat && example ? `${id}/${example}` : id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, beat]);

  return (
    <Chapter label={kicker} className={className}>
      <ProductSection home title={kicker} items={beats} active={beat} onActive={setBeat}
        openExample={active && beats[beat]?.id === hashBeat ? example : undefined}
        onExample={slug => reportBeat(chapter, `${beats[beat].id}/${slug}`)} />
    </Chapter>
  );
}

export function StoriesChapter() {
  const { index, register, reportBeat } = useStory();
  const videoRef = useRef<HTMLVideoElement>(null);
  const peekRef = useRef(false);
  const returnedRef = useRef(false);
  const [peek, setPeek] = useState(false);

  const reveal = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      if (Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = Math.max(0, video.duration - 0.05);
      }
    }
    peekRef.current = true;
    setPeek(true);
    if (!window.location.hash) reportBeat(0, "quote-0");
  };

  /** Brings the full-screen film back (the first rail dot, Home, or a step up from the stories). */
  const restore = () => {
    const video = videoRef.current;
    peekRef.current = false;
    returnedRef.current = true; // a visitor who came back chooses when to leave; the film does not close itself again
    setPeek(false);
    if (video) {
      video.currentTime = 0;
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) video.play().catch(() => {});
    }
  };

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("ch:film", { detail: index === 0 && !peek }));
  }, [index, peek]);

  useEffect(() => {
    register(0, (dir) => {
      if (peekRef.current) {
        if (dir > 0) return false;
        restore();
        return true;
      }
      if (dir < 0) return false;
      reveal();
      return true;
    });
    return () => register(0, null);
  }, [register]);

  useEffect(() => {
    const on = (event: Event) => {
      const want = (event as CustomEvent<string>).detail;
      if (want === "film" && peekRef.current) restore();
      if (want === "stories" && !peekRef.current) reveal();
    };
    window.addEventListener("ch:hero", on);
    return () => window.removeEventListener("ch:hero", on);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.location.hash || reduce) {
      reveal();
      return;
    }
    const onEnd = () => {
      window.setTimeout(() => {
        if (!peekRef.current && !returnedRef.current) reveal();
      }, 3000);
    };
    video.addEventListener("ended", onEnd);
    // A browser that blocks autoplay (Low Power Mode, data saver) skips the film and opens the stories.
    video.play().catch(() => reveal());
    return () => video.removeEventListener("ended", onEnd);
  }, []);


  return (
    <Chapter label={copy.chapters.StoriesChapter.Chapter_label1} className={peek ? "bg-field text-ink" : "bg-pine text-paper"}>
      <div className="flex h-full flex-col pt-16">
        <div
          data-hero-film={peek ? "banner" : "film"}
          className={cn(
            "relative shrink-0 overflow-hidden transition-[height,flex] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            peek ? "h-16 sm:h-36 md:h-[clamp(160px,26vh,290px)]" : "min-h-0 flex-1",
          )}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
            poster={copy.chapters.StoriesChapter.video_poster1}
          >
            <source src="/assets/hero-ch-fwd-720.mp4" type="video/mp4" />
          </video>
          <div className={cn("absolute inset-0", peek ? "bg-pine/55" : "bg-gradient-to-t from-pine/80 via-pine/55 to-pine/50")} />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 px-6 text-center max-md:pr-12">
            <h1
              className={cn(
                "max-w-5xl text-balance font-display leading-tight text-paper drop-shadow-[0_2px_12px_rgba(0,0,0,.55)]",
                peek ? "max-sm:sr-only text-2xl md:text-4xl" : "text-[2rem] leading-[1.18] sm:text-4xl md:text-6xl",
              )}
            >{copy.chapters.StoriesChapter.h11}<br />{copy.chapters.StoriesChapter.h12}{" "}<span className="text-lime">{copy.chapters.StoriesChapter.span1}</span>{" "}{copy.chapters.StoriesChapter.h13}{" "}<span className="text-lime">{copy.chapters.StoriesChapter.span2}</span>
            </h1>
            {!peek && <p className="max-w-xl text-base leading-relaxed text-paper md:text-xl">Community Hub is a community-centered communication platform.</p>}
          </div>
        </div>
        {peek && <div className="h-[3px] shrink-0 bg-lime" />}
        {peek && <HomeFeatures />}
      </div>
    </Chapter>
  );
}

const WHO_ICONS = [
  { src: "/assets/v1/CVicon.png" },
  { src: "/assets/v1/CWD.png" },
  { src: "/assets/v1/CH.png", hero: true },
  { src: "/assets/v1/bdash.png" },
  { src: "/assets/v1/calicon_v2.png" },
] as const;

export function WhoChapter() {
  const { index } = useStory();
  return (
    <Chapter label={copy.chapters.WhoChapter.Chapter_label1} className="bg-white text-ink">
      <div data-allow-scroll data-scroll-restoration-id="home-who" className="home-who wrap screen-pad h-full">
        <div className="home-identity" data-animate={index === 1 ? "in" : "out"} aria-label="Community Hub">
          {WHO_ICONS.map(icon => <img key={icon.src} src={icon.src} alt={"hero" in icon ? "Community Hub" : ""}
            className={cn("home-identity-icon", "hero" in icon && "home-identity-center")} />)}
        </div>
        <div className="home-who-copy space-y-4">
          <h2 className="t-h2 text-pine">Community Hub is a <span className="whitespace-nowrap">community-centered</span> communication platform.</h2>
          <p className="home-mission" data-problem>{homeMission.problem}</p>
          <p className="home-mission">{homeMission.solution}</p>
        </div>
      </div>
    </Chapter>
  );
}

export function EngageChapter({ chapter = 2 }: { chapter?: number }) {
  return <Pillar chapter={chapter} kicker={copy.chapters.EngageChapter.Pillar_kicker1} beats={homeEngageBeats()} className="bg-field text-ink" />;
}

export function EducateChapter({ chapter = 3 }: { chapter?: number }) {
  return <Pillar chapter={chapter} kicker={copy.chapters.EducateChapter.Pillar_kicker1} beats={homeEducateBeats()} className="bg-paper text-ink" />;
}

export function OrbChapter({ chapter = 5 }: { chapter?: number }) {
  return <Pillar chapter={chapter} kicker={copy.chapters.OrbChapter.Pillar_kicker1} beats={homeOrbBeats()} className="bg-field text-ink" />;
}

export function MotivateChapter({ chapter = 4 }: { chapter?: number }) {
  return <Pillar chapter={chapter} kicker={copy.chapters.MotivateChapter.Pillar_kicker1} beats={homeEmpowerBeats()} className="bg-paper text-ink" />;
}
