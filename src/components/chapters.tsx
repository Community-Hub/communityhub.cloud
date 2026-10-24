import { useRouterState } from "@tanstack/react-router";
import { HomeFeatures } from "@/components/home-features";
import { AppLink } from "@/components/app-link";
import { useEffect, useRef, useState } from "react";
import { Chapter, useStory } from "@/components/storyboard";
import { ProductSection } from "@/components/product-section";
import { homeEducateBeats, homeEngageBeats, homeEmpowerBeats, homeMission, homeOrbBeats } from "@/lib/home-feedback";
import {
  type ProductBeat,
} from "@/lib/content";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

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
    <Chapter label={copy.chapters.StoriesChapter.Chapter_label1} className={peek ? "bg-paper text-ink" : "bg-pine text-paper"}>
      <div className="flex h-full flex-col">
        <div
          data-hero-film={peek ? "banner" : "film"}
          className={cn("hero-film", peek ? "hero-film--banner" : "hero-film--full")}
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
          <div className="hero-scrim" />
          {peek ? (
            <div className="hero-banner">
              <span className="font-display text-lg font-semibold tracking-[-0.03em] text-paper">Community Hub</span>
              <span className="text-sm text-paper/65">Voices</span>
            </div>
          ) : (
            <div className="hero-content">
              <div className="hero-top">
                <span>Oberlin, Ohio</span>
                <span className="max-sm:hidden">Community-centered communication</span>
              </div>
              <div className="hero-bottom">
                <div className="hero-copy">
                  <h1>
                    {copy.chapters.StoriesChapter.h11} {copy.chapters.StoriesChapter.h12}{" "}
                    <span>{copy.chapters.StoriesChapter.span1}</span> {copy.chapters.StoriesChapter.h13}{" "}
                    <span>{copy.chapters.StoriesChapter.span2}</span>.
                  </h1>
                  <p>
                    Community Hub creates software products that foster stronger, more sustainable,
                    and more resilient connections among people and the natural systems upon which we
                    depend.
                  </p>
                  <div className="hero-actions">
                    <AppLink href="/products" className="btn btn-light">Explore products and services</AppLink>
                    <a href={site.contactHref} className="hero-text-link">Contact us</a>
                  </div>
                </div>
                <div className="hero-aside max-lg:hidden">
                  <p className="hero-aside-title">What we make</p>
                  <ul>
                    <li>Dashboards</li>
                    <li>Digital signage</li>
                    <li>Community calendar</li>
                    <li>Community voices</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        {peek && <HomeFeatures />}
      </div>
    </Chapter>
  );
}


export function WhoChapter() {
  const { index } = useStory();
  return (
    <Chapter label={copy.chapters.WhoChapter.Chapter_label1} className="bg-pine text-paper">
      <div data-allow-scroll data-scroll-restoration-id="home-who" className="home-who">
        <div className="home-who-inner">
          <h2 className="home-who-title">
            Community Hub is a community-centered communication platform.
          </h2>
          <div className="home-who-bottom">
            <figure className="home-who-figure" data-animate={index === 1 ? "in" : "out"}>
              <img src="/assets/oberlin-aerial.jpg.webp" alt="Aerial view of Oberlin, Ohio in autumn" width={780} height={439} />
              <figcaption>Oberlin, Ohio · the community the platform grew up in</figcaption>
            </figure>
            <div className="home-who-copy">
              <p className="home-mission" data-problem>{homeMission.problem}</p>
              <p className="home-mission">{homeMission.solution}</p>
            </div>
          </div>
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
