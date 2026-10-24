import { useRouterState } from "@tanstack/react-router";
import { AppLink } from "@/components/app-link";
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
  return (
    <Chapter label="Act locally. Think globally." className="bg-paper text-ink">
      <div className="home-hero-split">
        <div className="home-hero-copy">
          <h1>Act locally.<br />Think globally.</h1>
          <p className="home-hero-lede">
            Community Hub turns community data into dashboards, signage and stories that people
            understand — and act on.
          </p>
          <div className="home-hero-actions">
            <AppLink href="/demos" className="home-hero-button">Explore the dashboards</AppLink>
            <AppLink href="/work" className="home-hero-link">See where it runs</AppLink>
          </div>
          <p className="home-hero-clients">Oberlin College · City of Oberlin · Great Lakes Science Center</p>
        </div>
        <figure className="home-hero-figure">
          <img
            src="/assets/eng-sign-daves-full.jpg"
            alt="A person standing beside a Community Hub digital sign and a phone-controller poster at Dave's Market in Cleveland"
            width={739}
            height={800}
          />
          <figcaption>MidTown Cleveland · Dave’s Market</figcaption>
        </figure>
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

export function VoicesChapter() {
  return (
    <Chapter label="Voices" className="bg-field text-ink">
      <div className="flex h-full flex-col justify-center pt-[var(--header-h)]">
        <HomeFeatures chapter={1} />
      </div>
    </Chapter>
  );
}

export function WhoChapter() {
  const { index } = useStory();
  return (
    <Chapter label={copy.chapters.WhoChapter.Chapter_label1} className="bg-white text-ink">
      <div data-allow-scroll data-scroll-restoration-id="home-who" className="home-who wrap screen-pad h-full">
        <div className="home-identity-wrap">
          <div className="home-identity" data-animate={index === 1 ? "in" : "out"} aria-label="Community Hub">
            {WHO_ICONS.map(icon => <img key={icon.src} src={icon.src} alt={"hero" in icon ? "Community Hub" : ""}
              className={cn("home-identity-icon", "hero" in icon && "home-identity-center")} />)}
          </div>
          <p className="home-identity-note">Built in Oberlin, Ohio since 2008.<br />Working in campuses, cities and schools across Northeast Ohio and beyond.</p>
        </div>
        <div className="home-who-copy space-y-4">
          <h2 className="t-h2 text-pine">Community Hub is a <span className="whitespace-nowrap">community-centered</span> communication platform.</h2>
          <p className="home-mission" data-problem>{homeMission.problem}</p>
          <p className="home-mission">{homeMission.solution}</p>
          <p className="pt-1"><AppLink href="/about" className="link font-bold">About Community Hub</AppLink></p>
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
