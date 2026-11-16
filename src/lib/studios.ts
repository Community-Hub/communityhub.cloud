/** Community Hub Studios: where maps, stories and loops are made and published. */
export const STUDIOS_ORIGIN = "https://studios.communityhb.tech";

/** The editor. It refuses to run inside another site, so it is the one Studios link that opens studios.communityhb.tech. */
export const OPEN_STUDIO = `${STUDIOS_ORIGIN}/studio`;

export type StudioWork = { kind: "show" | "map"; slug: string; title: string; meta: string; src: string };

/** Published stories and loops (play.html). Loops play as a hands-free display. */
export const STUDIO_SHOWS: StudioWork[] = [
  { kind: "show", slug: "oberlin-geothermal", title: "Heating & Cooling at Oberlin", meta: "Story · 12 slides", src: `${STUDIOS_ORIGIN}/play.html?show=oberlin-geothermal` },
  { kind: "show", slug: "oberlin-home-loop", title: "Carbon Neutral Stories", meta: "Signage loop · 14 slides", src: `${STUDIOS_ORIGIN}/play.html?show=oberlin-home-loop&mode=kiosk` },
  { kind: "show", slug: "cleveland-air-loop", title: "What’s in Cleveland’s air?", meta: "Signage loop · 6 slides", src: `${STUDIOS_ORIGIN}/play.html?show=cleveland-air-loop&mode=kiosk` },
];

/** Published orb maps (viewer.html). */
const MAPS: { slug: string; title: string; meta: string }[] = [
  { slug: "cleveland", title: "Air quality in Cleveland", meta: "41 sensors" },
  { slug: "pittsburgh", title: "Air quality in Pittsburgh", meta: "14 sensors" },
  { slug: "accra", title: "Air quality in Accra", meta: "15 sensors" },
  { slug: "oberlin", title: "Resource flows in Oberlin College", meta: "37 buildings" },
  { slug: "hamilton", title: "Resource flows at Hamilton College", meta: "28 buildings" },
  { slug: "woodland-f1", title: "Woodland Hall, first floor", meta: "8 rooms" },
  { slug: "woodland-f2", title: "Woodland Hall, second floor", meta: "8 rooms" },
  { slug: "woodland-f3", title: "Woodland Hall, third floor", meta: "8 rooms" },
  { slug: "woodland-f4", title: "Woodland Hall, fourth floor", meta: "8 rooms" },
];
export const STUDIO_MAPS: StudioWork[] = MAPS.map((map) => ({ kind: "map", ...map, src: `${STUDIOS_ORIGIN}/viewer.html?map=${map.slug}` }));

/** The in-site page for a published work, so it opens on communityhub.cloud. */
export function studioWorkHref(work: StudioWork): string {
  return `/studios/view?${work.kind}=${encodeURIComponent(work.slug)}`;
}

export function findStudioWork(search: { show?: string; map?: string }): StudioWork | undefined {
  if (search.show) return STUDIO_SHOWS.find((work) => work.slug === search.show);
  if (search.map) return STUDIO_MAPS.find((work) => work.slug === search.map);
  return undefined;
}
