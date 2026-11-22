import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Categories, ContactBand, HeroFilm, Platform, Voices, scrollToSection, type CategoryTarget } from "@/components/home";
import { SiteFooter } from "@/components/site-footer";
import { pc } from "@/lib/page-content";
import { site } from "@/lib/site";
import { consumeNavigationTarget } from "@/lib/use-hash-stops";
import { txt } from "@/lib/page-text/index";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: pc.meta.home.title },
      { name: "description", content: txt.text1 + site.mission.split(". ")[0] + "." },
    ],
  }),
});

/** Stops of the old full-screen home, so links written for it still land in the right place. */
const OLD_STOPS: Record<string, string> = { problem: "top", who: "platform", orb: "educate", footer: "contact", audiences: "platform", results: "voices", pricing: "contact" };
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
        {/* The order John and Maddie agreed on 19 Nov 2026: the problem, what Community Hub is, what it does, what people
            say, then how to bring it to your community. Who it's for is the Communities page, What it changed is on
            Research, and Pricing is its own page; all three sit under the menu now. */}
        <HeroFilm />
        <Platform />
        <Categories target={target} />
        <Voices />
        <ContactBand />
      </main>
      <SiteFooter />
    </>
  );
}
