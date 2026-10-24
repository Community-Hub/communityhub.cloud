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

const heroName = "Act locally. Think globally.";

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
