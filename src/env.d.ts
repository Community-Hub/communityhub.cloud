/// <reference types="astro/client" />
import type {
  GaugeReading,
  Mood,
  StoryController,
  StoryChange,
  StoryFrame,
} from "./scripts/types";
declare global {
  interface Window {
    chStory?: StoryController;
    chCountTo?: (
      element: HTMLElement,
      from: number,
      to: number,
      template: string,
    ) => void;
    chParseGauge?: (svg: string) => GaugeReading;
    chSetRing?: (ring: HTMLElement | null, mood: Mood) => void;
    chMoodOf?: (position: number) => Mood;
    chLoadEvents?: (box: HTMLElement) => void;
    chFit?: { run(): void };
  }
  interface WindowEventMap {
    "ch:storychange": CustomEvent<StoryChange>;
    "ch:fit": CustomEvent<{ anchor: StoryFrame | null }>;
  }
}
