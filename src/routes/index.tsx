import { createFileRoute } from "@tanstack/react-router";
import {
  EducateChapter,
  EngageChapter,
  MotivateChapter,
  OrbChapter,
  StoriesChapter,
  VoicesChapter,
  WhoChapter,
} from "@/components/chapters";
import { FooterChapter } from "@/components/site-footer";
import { Storyboard } from "@/components/storyboard";

const HOME_LABELS = ["It has never been more important to act locally while thinking globally.", "Voices", "Who we are", "Engage", "Educate", "Motivate and Empower", "Environmental Orb", "Footer"] as const;
const HOME_IDS = ["hero", "voices", "who", "engage", "educate", "motivate", "orb", "footer"] as const;

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Community Hub — Community data, made legible" },
      {
        name: "description",
        content: "Community Hub turns energy, water and air-quality data into dashboards, signage and stories that cities, campuses and schools can understand — and act on.",
      },
      { property: "og:title", content: "Community Hub — Community data, made legible" },
      {
        property: "og:description",
        content: "Live community data, published where people already are: dashboards, digital signage, Data Hub, calendars and community voices.",
      },
    ],
  }),
});


function Home() {
  return (
    <Storyboard labels={HOME_LABELS} ids={HOME_IDS}>
      <StoriesChapter />
      <VoicesChapter />
      <WhoChapter />
      <EngageChapter />
      <EducateChapter />
      <MotivateChapter />
      <OrbChapter />
      <FooterChapter />
    </Storyboard>
  );
}
