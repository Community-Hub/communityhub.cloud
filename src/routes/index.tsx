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
      { title: "Community Hub" },
      {
        name: "description",
        content: "Community Hub creates software products that foster stronger, more sustainable, and more resilient connections among people and the natural systems upon which we depend.",
      },
      { property: "og:title", content: "Community Hub" },
      {
        property: "og:description",
        content: "Community Hub’s award-winning communication platform includes sophisticated data acquisition and display applications for organizations, neighborhoods, and cities.",
      },
    ],
  }),
});

const heroName = "It has never been more important to act locally while thinking globally.";

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
