// Typed access to embeds.json by group and id, so a slide says getEmbed('calendar', 'midtown-calendar') and not an
// array index. Throws on a typo. Ported from the Astro site (projects/community-hub/site/src/data/embeds.ts).
import data from "./embeds.json";
import { SCHOOLS_NAME } from "@/lib/names";

export interface EmbedItem {
  id: string;
  name: string; // full name: iframe title and legend text
  title: string;
  place: string | null; // one of PRIMARY_PLACES in src/lib/content.ts, or null when the repo does not say
  sublocation: string | null;
  src: string;
  visit?: string;
  visitLabel?: string;
}
type Group = "dashboards" | "datahub" | "calendar" | "stories";

/** Where "Open live" goes. An embed with a visitLabel has a visit page that is not the dashboard, so those link to
 *  the live embed itself. */
export const liveHref = (e: EmbedItem): string => (e.visitLabel || !e.visit ? e.src : e.visit);

export function getEmbed(group: Group, id: string): EmbedItem {
  const hit = (data[group] as EmbedItem[]).find((e) => e.id === id);
  if (!hit) throw new Error(`embeds.json has no ${group}.${id}`);
  // The schools' name lives in src/lib/names.ts, not in the JSON.
  if (id === "oberlin-city-schools") {
    return { ...hit, name: `${SCHOOLS_NAME}' environmental dashboard`, title: SCHOOLS_NAME, place: SCHOOLS_NAME };
  }
  return hit;
}

/** The Story of Dashboard deck (Google Slides). It autoplays; srcReduced starts paused for reduced motion. */
export const storyOfDashboard = data.storyOfDashboard as {
  name: string;
  title: string;
  src: string;
  srcReduced: string;
  visit: string;
};
