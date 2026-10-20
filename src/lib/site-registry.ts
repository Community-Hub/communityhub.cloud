/**
 * Everything the editors can change, in one index. Safe to import in the browser and on the server.
 *
 * Keys are permanent: a root name plus the path inside it. Renaming a root here orphans its saved edits,
 * so add roots, do not rename them.
 */
import lessonsData from "@/data/lessons.json";
import publicationsData from "@/data/publications.json";
import { createContentIndex, type ListSpec, type RootSpec, type SectionSpec } from "@/lib/cms/core";
import {
  ABOUT_ORIGIN_FRAMES,
  demoBringNotes,
  demoChanges,
  demoReads,
  demos,
  demoSteps,
  educateBeats,
  empowerBeats,
  engageBeats,
  orbBeats,
  PHONE_FRAMES,
  stories,
  WORK_CASE_FRAMES,
} from "@/lib/content";
import { copy, copyContext } from "@/lib/copy";
import { pc } from "@/lib/page-content";
import { bundles, faq, services } from "@/lib/pricing";
import { productPages } from "@/lib/product-pages";
import { site } from "@/lib/site";
import { whoStops } from "@/lib/who";

/** Page names as the editors see them. */
const PAGE: Record<string, string> = {
  meta: "Browser tab titles and search text",
  about: "About",
  demos: "Dashboards",
  digitalSignage: "Digital Signage",
  pricing: "Pricing",
  products: "Products",
  research: "Research",
  resources: "Resources",
  story: "Story of the Dashboard",
  toolkit: "Teacher toolkit",
  who: "Who it's for",
  work: "Where it runs",
  chapters: "Home",
  notFound: "Page not found",
  productPager: "Product pages",
  siteFooter: "Footer (every page)",
  siteHeader: "Header (every page)",
};

const roots: RootSpec[] = [
  { name: "site", page: "Whole site", value: site },
  ...Object.entries(copy).map(
    ([ns, value]): RootSpec => ({
      name: `copy.${ns}`,
      page: PAGE[ns] ?? ns,
      value,
      context: (path) => copyContext[`${ns}.${path}`],
    }),
  ),
  ...Object.entries(pc).map(
    ([ns, value]): RootSpec => ({
      name: `page.${ns}`,
      page: PAGE[ns] ?? ns,
      value,
      // The page headings are edited where they are drawn (the DocSection labels in `copy`).
      skip: ns === "about" || ns === "story" ? /\.STOPS\.\d+\.label$/ : undefined,
    }),
  ),
  { name: "stories", page: "Home: stories", value: stories },
  { name: "engageBeats", page: "Home: Engage", value: engageBeats },
  { name: "educateBeats", page: "Home: Educate", value: educateBeats },
  { name: "empowerBeats", page: "Home: Motivate and Empower", value: empowerBeats },
  { name: "orbBeats", page: "Home: Environmental Orb", value: orbBeats },
  { name: "demos", page: "Dashboards", value: demos },
  { name: "demoReads", page: "Dashboards", value: demoReads },
  { name: "demoChanges", page: "Dashboards", value: demoChanges },
  { name: "demoSteps", page: "Dashboards", value: demoSteps },
  { name: "demoBringNotes", page: "Dashboards", value: demoBringNotes },
  { name: "aboutOriginFrames", page: "About", value: ABOUT_ORIGIN_FRAMES },
  { name: "phoneFrames", page: "Digital Signage", value: PHONE_FRAMES },
  { name: "workCaseFrames", page: "Where it runs", value: WORK_CASE_FRAMES },
  { name: "productPages", page: "Product pages", value: productPages },
  { name: "bundles", page: "Pricing", value: bundles },
  { name: "services", page: "Pricing", value: services },
  { name: "faq", page: "Pricing", value: faq },
  { name: "whoStops", page: "Who it's for", value: whoStops },
  { name: "lessons", page: "Teacher toolkit", value: lessonsData, only: ["title", "description", "url"] },
  {
    name: "publications",
    page: "Research",
    value: publicationsData,
    only: ["title", "authors", "venue", "finding", "url", "drive_url", "src", "alt"],
  },
];

const frameLabel = (frame: { title?: string; caption?: string }) => frame.title || frame.caption || "Picture";

const frameLists = (name: string, beats: { title: string; frames: unknown[] }[], page: string): ListSpec[] =>
  beats.map((beat, i) => ({
    path: `${name}.${i}.frames`,
    label: `${beat.title}: pictures and examples`,
    page,
    itemLabel: frameLabel,
  }));

const lists: ListSpec[] = [
  { path: "lessons", label: "Lessons", page: "Teacher toolkit", itemLabel: (l) => l.title },
  { path: "publications", label: "Publications", page: "Research", itemLabel: (p) => p.title },
  { path: "page.work.CASES", label: "Where it runs", page: "Where it runs", itemLabel: (c) => c.name },
  { path: "page.work.VOICES", label: "Voices (quotes)", page: "Where it runs", itemLabel: (v) => v.org },
  { path: "bundles", label: "Pricing tiers", page: "Pricing", itemLabel: (b) => b.name },
  { path: "services", label: "Design services", page: "Pricing", itemLabel: (s) => s.name },
  { path: "faq", label: "Questions and answers", page: "Pricing", itemLabel: (f) => f.q },
  { path: "stories", label: "Home page stories", page: "Home: stories", itemLabel: (s) => s.org || s.alt },
  { path: "aboutOriginFrames", label: "Where it began: pictures", page: "About", itemLabel: frameLabel },
  { path: "phoneFrames", label: "Use your phone: pictures", page: "Digital Signage", itemLabel: frameLabel },
  ...Object.keys(WORK_CASE_FRAMES).map(
    (id): ListSpec => ({
      path: `workCaseFrames.${id}`,
      label: `${pc.work.CASES.find((c) => c.id === id)?.name ?? id}: more pictures`,
      page: "Where it runs",
      itemLabel: frameLabel,
    }),
  ),
  ...frameLists("engageBeats", engageBeats, "Home: Engage"),
  ...frameLists("educateBeats", educateBeats, "Home: Educate"),
  ...frameLists("empowerBeats", empowerBeats, "Home: Motivate and Empower"),
  ...frameLists("orbBeats", orbBeats, "Home: Environmental Orb"),
];

/**
 * Sections an editor can hide. The first screen of a page holds its title and is always shown.
 * `id` is the stop id the page's DocShell uses.
 */
const sections: SectionSpec[] = [
  { path: "/about", id: "origin", label: "Where it began", page: "About" },
  { path: "/about", id: "supporters", label: "Supporters", page: "About" },
  { path: "/demos", id: "who", label: "Who uses it", page: "Dashboards" },
  { path: "/demos", id: "read", label: "How to read it", page: "Dashboards" },
  { path: "/demos", id: "changed", label: "Results", page: "Dashboards" },
  { path: "/demos", id: "bring", label: "Bring one to your town", page: "Dashboards" },
  { path: "/pricing", id: "services", label: "Design services", page: "Pricing" },
  { path: "/pricing", id: "questions", label: "Questions", page: "Pricing" },
  { path: "/who", id: "example", label: "An example", page: "Who it's for" },
  { path: "/work", id: "voices", label: "Voices", page: "Where it runs" },
];

export const siteIndex = createContentIndex({ roots, lists, sections });
