import { pc } from "@/lib/page-content";
import { copy } from "@/lib/copy";
import { site } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import {
  EducateChapter,
  EngageChapter,
  MotivateChapter,
  StoriesChapter,
  WhoChapter,
} from "@/components/chapters";
import { FooterChapter } from "@/components/site-footer";
import { Storyboard } from "@/components/storyboard";

const HOME_LABELS = [
  "Voices",
  "Who we are",
  "Engage",
  "Educate",
  "Motivate and Empower",
  "Footer",
] as const;

const HOME_IDS = ["problem", "who", "engage", "educate", "motivate", "footer"] as const;

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
    <Storyboard lead={heroName} labels={HOME_LABELS} ids={HOME_IDS}>
      <StoriesChapter />
      <WhoChapter />
      <EngageChapter />
      <EducateChapter />
      <MotivateChapter />
      <FooterChapter />
    </Storyboard>
  );
}
