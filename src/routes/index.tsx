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
      <main id="main" className="brochure deck">
        <HeroFilm />
        <Audiences />
        <Platform />
        <Categories target={target} />
        <Voices />
        <Results />
        <PricingTeaser />
        <ContactBand />
      </main>
      <SiteFooter />
    </>
  );
}
