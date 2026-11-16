import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Audiences,
  Categories,
  ContactBand,
  HeroFilm,
  Platform,
  PricingTeaser,
  Results,
  Voices,
  scrollToSection,
  type CategoryTarget,
} from "@/components/home";
import { SiteFooter } from "@/components/site-footer";
import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
import { site } from "@/lib/site";
import { consumeNavigationTarget } from "@/lib/use-hash-stops";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: pc.meta.home.title },
      { name: "description", content: "Community Hub is a community-centered communication platform. " + site.mission.split(". ")[0] + "." },
    ],
  }),
});

/** Stops of the old full-screen home, so links written for it still land in the right place. */
const OLD_STOPS: Record<string, string> = { problem: "top", who: "platform", orb: "educate", footer: "contact" };
const CATEGORY_IDS = new Set(["engage", "educate", "motivate"]);

/** The brochure's pages, in order, named for the dots. */
function pages() {
  const c = copy.chapters;
  const hero = c.StoriesChapter;
  return [
    { id: "top", label: [hero.h11, hero.h12, hero.span1, hero.h13, hero.span2].join(" ") },
    { id: "audiences", label: copy.home.Audiences.h21 },
    { id: "platform", label: c.WhoChapter.h21 },
    { id: "engage", label: c.EngageChapter.Pillar_kicker1 },
    { id: "educate", label: c.EducateChapter.Pillar_kicker1 },
    { id: "motivate", label: c.MotivateChapter.Pillar_kicker1 },
    { id: "voices", label: copy.home.Voices.h21 },
    { id: "results", label: copy.home.Results.h21 },
    { id: "pricing", label: copy.home.Pricing.h21 },
    { id: "contact", label: copy.siteFooter.FooterChapter.h21 },
  ];
}

/** The page dots on the right edge: the page you are on, and a way to jump to any other. */
function PageRail() {
  const list = pages();
  const [at, setAt] = useState(0);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      let best = 0;
      list.forEach((page, n) => {
        const el = document.getElementById(page.id);
        if (el && el.getBoundingClientRect().top <= middle) best = n;
      });
      setAt(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <nav aria-label="Pages" className="page-rail">
      {list.map((page, n) => (
        <button
          key={page.id}
          type="button"
          aria-label={page.label}
          title={page.label}
          aria-current={n === at || undefined}
          onClick={() => (page.id === "top" ? window.scrollTo({ top: 0, behavior: "smooth" }) : scrollToSection(page.id))}
        >
          <span />
        </button>
      ))}
    </nav>
  );
}

function Home() {
  const [target, setTarget] = useState<CategoryTarget>();

  useEffect(() => {
    let n = 0;
    const open = (raw: string) => {
      if (!raw) return;
      const [stop = "", beat, example] = raw.split("/");
      const id = stop in OLD_STOPS ? OLD_STOPS[stop] : stop;
      if (id === "top") {
        window.scrollTo({ top: 0 });
        return;
      }
      if (CATEGORY_IDS.has(id) && beat) setTarget({ section: id, beat, example, n: ++n });
      requestAnimationFrame(() => scrollToSection(id));
    };
    open(consumeNavigationTarget());
    const onTarget = (event: Event) => {
      consumeNavigationTarget();
      open((event as CustomEvent<string>).detail);
    };
    window.addEventListener("ch:target", onTarget);
    return () => window.removeEventListener("ch:target", onTarget);
  }, []);

  return (
    <>
      <main id="main" className="brochure">
        <HeroFilm />
        <Audiences />
        <Platform />
        <Categories target={target} />
        <Voices />
        <Results />
        <PricingTeaser />
        <ContactBand />
      </main>
      <PageRail />
      <SiteFooter />
    </>
  );
}
