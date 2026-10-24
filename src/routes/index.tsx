import { pc } from "@/lib/page-content";
import { copy } from "@/lib/copy";
import { site } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import {
  EducateChapter,
  EngageChapter,
  MotivateChapter,
  OrbChapter,
  StoriesChapter,
  WhoChapter,
} from "@/components/chapters";
import { FooterChapter } from "@/components/site-footer";
import { Storyboard } from "@/components/storyboard";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: pc.meta.home.title },
      { name: "description", content: "Community Hub is a community-centered communication platform. " + site.mission.split(". ")[0] + "." },
    ],
  }),
});

const hero = copy.chapters.StoriesChapter;
/** The film's own stop is named by the heading it carries. */
const heroName = [hero.h11, hero.h12, hero.span1, hero.h13, hero.span2].join(" ");

function Home() {
  return (
    <Storyboard lead={heroName}>
      <StoriesChapter />
      <WhoChapter />
      <EngageChapter />
      <EducateChapter />
      <MotivateChapter />
      <OrbChapter />
      <FooterChapter />
    </Storyboard>
  );
}
