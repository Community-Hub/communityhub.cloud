/** Landing pages for the header tabs: each shows the full contents of its dropdown. */
import type { SiteContext } from "../lib/site";
import { AUDIENCES, CASES, DASH_DEMOS, LIVE_DEMOS, RESOURCES } from "./catalog";

type Card = readonly [href: string, icon: string, title: string, note: string];
type Column = readonly [title: string, cards: readonly Card[], more?: readonly [href: string, label: string]];

export function register(H: SiteContext): void {
  const card = ([href, icon, title, note]: Card): string =>
    `<li><a href="${href}">${icon ? `<img src="assets/${icon}" alt="" width="44" height="44">` : ""}<span><b>${title}</b><small>${note}</small></span></a></li>`;
  const column = ([title, cards, more]: Column): string =>
    `<div class="product-category" data-story-scene><h2>${title}</h2><ul>${cards.map(card).join("")}</ul>${more ? `<a class="product-how-link" href="${more[0]}">${more[1]} ${H.ARR}</a>` : ""}</div>`;
  const directory = (slug: string, title: string, lede: string, desc: string, columns: readonly Column[]): void => {
    const body = `<section class="product-directory" aria-labelledby="${slug}-h"><div class="wrap" data-story-scene="desktop">
    ${H.crumbs([null, title] as const)}<h1 class="h1" id="${slug}-h">${title}</h1><p class="lede">${lede}</p>
    <div class="product-directory-grid${columns.length === 2 ? " dir-2" : ""}">${columns.map(column).join("")}</div>
  </div></section>` + H.cta_band("Contact Us", "");
    H.write_page(slug, H.page(slug, title, desc, body, { current: slug, jsonld: H.ORG_LD }));
  };
  const res = (href: string, icon: string): Card => {
    const r = RESOURCES.find(([h]) => h === href)!;
    return [r[0], icon, r[1], r[2]];
  };

  // One live example is the focal point. The complete destination list stays
  // available through compact native disclosures instead of competing columns.
  const liveTitle = "Great Lakes Science Center";
  const liveSource = "https://cleveland.communityhub.cloud/dh-public/glsc-embed";
  const liveChoices = DASH_DEMOS.map(([href, , title]) => `<li><a href="${href}">${title}</a></li>`).join("");
  const toolChoices = LIVE_DEMOS.map(([href, , title]) => `<li><a href="${href}">${title}</a></li>`).join("");
  const liveBody = `<section class="live-directory" data-nofit aria-labelledby="see-live-h"><div class="wrap">
    <h1 class="h1" id="see-live-h">See it live</h1>
    <div class="live-pickers">
      <details class="live-demo-picker"><summary data-squirrel="Open this to explore other dashboards" data-squirrel-short="Open this to explore other dashboards" data-squirrel-for="4500">${liveTitle}</summary><ul>${liveChoices}</ul></details>
      <details class="live-more-tools"><summary>More live examples</summary><div class="live-more-list"><ul>${toolChoices}</ul><a href="dashboards.html">All public dashboards</a></div></details>
    </div>
    ${H.live_frame(liveSource, "The Cleveland Environmental Dashboard", "Great Lakes Science Center", 520).replace('<div class="lf-body"', '<div class="lf-body" data-scroll-owner data-squirrel="Scroll here to see the whole dashboard" data-squirrel-short="Scroll here" tabindex="0" aria-label="Great Lakes Science Center dashboard, scrolls"')}
  </div></section>` + H.cta_band("Contact Us", "");
  H.write_page("see-it-live", H.page("see-it-live", "See it live", "Explore Community Hub’s public dashboards and community tools.", liveBody, {current:"see-it-live",jsonld:H.ORG_LD}));
  directory(
    "who-its-for",
    "Who it's for",
    "Choose your kind of place, or read how a partner uses it.",
    "Community Hub for neighborhoods, cities, museums, campuses and schools, with case studies from each.",
    [
      ...[...new Set(AUDIENCES.map((a) => a.group))].map((group): Column => [
        group,
        AUDIENCES.filter((a) => a.group === group).map((a): Card => [`${a.slug}.html`, a.icon, a.name, a.short]),
      ]),
      ["Case studies", CASES.map((c): Card => [`${c.slug}.html`, "", c.name, c.kind]), ["examples.html", "All case studies"]],
    ],
  );
  directory(
    "resources",
    "Resources",
    "Lessons, research, press and the story of the Dashboard.",
    "The teacher toolkit, research and publications, media and press, and how to bring a dashboard to your community.",
    [
      ["Teach and learn", [
        res("education.html", "icon-schools.png"),
        res("story-of-dashboard.html", "icon-stories.png"),
        ["environmental-dashboard.html", "icon-environment.png", "The Dashboard story", "Why people need feedback from nature"],
      ]],
      ["Research and press", [res("research.html", "icon-datahub.png"), res("media.html", "icon-signage.png")]],
      ["Start one", [res("bring-a-dashboard.html", "icon-cwd.png")]],
    ],
  );
}
