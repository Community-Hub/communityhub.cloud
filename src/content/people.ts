import { nativeContexts, storyContexts } from "./meeting-embeds";
/** Audience pages and case studies, sharing section and product-link renderers. */
import type { SiteContext } from "../lib/site";

type Pairs = readonly (readonly [string, string])[];
interface SectionOptions {
  intro?: string | null;
  alt?: boolean;
  facts?: Pairs;
}

export function register(H: SiteContext): void {
  const e = H.e;
  const ARR = H.ARR;
  function opening(...args: Parameters<SiteContext["hero"]>): string {
    return `<section class="content-opening audience-opening" aria-label="${e(args[2])}"><div class="opening-scene" data-story-scene="all">${H.hero(...args)}</div></section>`;
  }
  function feature_groups(items: Pairs, cols = 2): string {
    if (items.length <= 2) return H.feat_list(items, cols);
    const groups: string[] = [];
    for (let i = 0; i < items.length; i += 2)
      groups.push(H.feat_list(items.slice(i, i + 2), cols).replace('<div class="feat-list', '<div data-story-scene class="feat-list'));
    return `<div class="feature-groups">${groups.join("")}</div>`;
  }
  function jump(items: Pairs): string {
    const links = items.map(([i, t]) => `<a href="#${i}">${t}</a>`).join("");
    return `<nav class="ppl-jump" aria-label="On this page" data-ppl-jump><div class="wrap">${links}</div></nav>`;
  }
  function staged_citywide(): string {
    return H.cwd_sign();
  }

  function stats(items: Pairs): string {
    const cells = items
      .map(
        ([b, c]) => `<div class="ppl-stat"><b>${b}</b><span>${c}</span></div>`,
      )
      .join("");
    return `<div class="ppl-stats">${cells}</div>`;
  }
  function installed(items: Pairs): string {
    let rows = "";
    for (const [slug, note] of items) {
      const [base, anchor = ""] = slug.split("#", 2);
      const p = H.PBY[base];
      const href = `${base}.html` + (anchor ? `#${anchor}` : "");
      rows += `<li><a href="${href}">${H.picon(p, "ppl-ic")}<span><b>${e(p["name"])}</b><small>${note}</small></span></a></li>`;
    }
    if (items.length >= 5) {
      const entries = rows.match(/<li>[\s\S]*?<\/li>/g) ?? [];
      return `<div class="installed-groups" data-story-scene="desktop"><ul class="ppl-installed" data-story-scene>${entries.slice(0, 2).join("")}</ul><ul class="ppl-installed" data-story-scene>${entries.slice(2).join("")}</ul></div>`;
    }
    return `<ul class="ppl-installed">${rows}</ul>`;
  }
  function faq(items: Pairs): string {
    const qa = items
      .map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`)
      .join("");
    return `<div class="ppl-faq">${qa}</div>`;
  }
  function timeline(items: Pairs): string {
    const rows = items.map(([y, t]) => `<li><span class="yr">${y}</span><p>${t}</p></li>`);
    if (rows.length <= 3) return `<ol class="ppl-tl">${rows.join("")}</ol>`;
    return `<div class="timeline-groups">${[rows.slice(0, 3), rows.slice(3)].map(group => `<ol class="ppl-tl" data-story-scene>${group.join("")}</ol>`).join("")}</div>`;
  }
  const CBY = Object.fromEntries(H.CASES.map((c) => [c["slug"], c] as const));
  const JOURNEY_NOTE =
    'Dates for {} only. Community Hub\'s own history since 2000 is on the <a href="about.html#history">About page</a>.';
  function case_switch(slug: string): string {
    const links = H.CASES.map(
      (c) =>
        `<a href="${c["slug"]}.html"` +
        (c["slug"] === slug ? ' aria-current="page"' : "") +
        `>${e(c["name"])}</a>`,
    ).join("");
    return `<nav class="cs-switch" aria-label="Case studies"><span class="fig">Case studies</span>${links}</nav>`;
  }
  function next_story(slug: string, label: string): string {
    const img = CBY[slug]?.img ?? "oberlin-aerial.jpg";
    return `<a class="ppl-next" href="${slug}.html">${H.postcard(img, "", undefined, 1)}<span><span class="fig">Next story</span><b>${e(label)}</b></span></a>`;
  }
  let pending_case_context = "";
  let pending_case_split = false;
  function sec(
    sid: string,
    label: string,
    h2: string,
    inner: string,
    { intro = null, alt = false, facts = [] }: SectionOptions = {},
  ): string {
    const cls = "" + (alt ? " ppl-alt" : "");
    const intro_html = intro
      ? `<p class="lede" style="margin-top:10px" data-reveal>${intro}</p>`
      : "";
    const evidence = facts.length ? `<div class="case-evidence-facts">${stats(facts)}</div>` : "";
    if (pending_case_context) {
      const context = pending_case_context;
      pending_case_context = "";
      if (pending_case_split) {
        pending_case_split = false;
        return `<section class="ppl-sec${cls}" id="${sid}" aria-labelledby="${sid}-h"><div class="wrap"><div class="case-context chapter-scene" data-story-scene="desktop"><div class="case-context-overview" data-story-scene><p class="fig">${label}</p><h2 class="h2" id="${sid}-h" data-reveal>${h2}</h2>${intro_html}${context}</div><div class="case-context-results" data-story-scene>${evidence}</div></div><div class="case-detail chapter-scene" data-story-scene="all">${inner}</div></div></section>`;
      }
      return `<section class="ppl-sec${cls}" id="${sid}" aria-labelledby="${sid}-h"><div class="wrap"><div class="case-context chapter-scene" data-story-scene="all"><p class="fig">${label}</p><h2 class="h2" id="${sid}-h" data-reveal>${h2}</h2>${intro_html}${context}${evidence}</div><div class="case-detail chapter-scene" data-story-scene="all">${inner}</div></div></section>`;
    }
    const scene = inner.includes('data-story-scene="all"') || inner.includes("data-chapter-scenes") ? "" : ` data-story-scene="${inner.includes("data-story-scene") ? "desktop" : "all"}"`;
    return `<section class="ppl-sec${cls}" id="${sid}" aria-labelledby="${sid}-h"><div class="wrap chapter-scene"${scene}><p class="fig">${label}</p><h2 class="h2" id="${sid}-h" data-reveal>${h2}</h2>${intro_html}<div class="ppl-sec-body">${evidence}${inner}</div></div></section>`;
  }
  const TBY = Object.fromEntries(
    H.TESTIMONIALS.map((t) => [t["who"].split(",")[0].trim(), t] as const),
  );
  function tquote(who: string, cls: string = ""): string {
    const t = TBY[who];
    return H.quote(t["quote"], t["who"], t["role"], cls);
  }
  function cross(href: string, label: string): string {
    return `<p class="ppl-cross"><a class="hand-link" href="${href}"><svg class="hand-arrow" viewBox="0 0 70 44" aria-hidden="true"><path d="M4 8 C 18 34, 40 38, 62 26"/></svg>${label}</a></p>`;
  }
  function bars(
    rows: readonly (readonly [label: string, value: number, shown: string])[],
    cap_label: string,
    hi: string | null = null,
  ): string {
    const li = rows
      .map(
        ([l, v, shown]) =>
          `<li class="${l === hi ? "hi" : ""}"><span class="l">${e(l)}</span><span class="t"><i style="--v:${v}%"></i></span><span class="v">${shown}</span></li>`,
      )
      .join("");
    return `<ul class="ppl-bars" aria-label="${e(cap_label)}">${li}</ul>`;
  }
  function kind_pill(icon: string, text: string): string {
    return `<p class="ppl-kind"><img src="assets/${icon}" alt="" width="20" height="20">${text}</p>`;
  }
  function case_hero(
    slug: string,
    kind_icon: string,
    kind_text: string,
    headline: string,
    summary: string,
    glance: Pairs,
    media: string,
    notice: string = "",
  ): string {
    const c = CBY[slug];
    const media_caption: Record<string, string> = {
      "oberlin-college": "Oberlin College campus, photographed at dusk.",
      "city-of-oberlin": "Oberlin’s Citywide Dashboard.",
      "midtown-cleveland": "Cleveland Citywide Dashboard, shown on MidTown’s screens.",
      "great-lakes-science-center": "Dashboard workshop at the Great Lakes Science Center.",
      "hamilton-college": "Hamilton College pilot. Generic campus illustration.",
    };
    const crumbs = H.crumbs(
      ["examples.html", "Case studies"] as const,
      [null, c["name"]] as const,
    );
    const gl = glance.map(([a, b]) => `<div class="ppl-glance-pair"><dt>${a}</dt><dd>${b}</dd></div>`).join("");
    pending_case_context = `<dl class="ppl-glance">${gl}</dl>`;
    pending_case_split = slug === "oberlin-college" || slug === "city-of-oberlin";
    return `<section class="page-hero case-hero"><div class="wrap">${crumbs}${case_switch(slug)}<div class="ph-grid" data-story-scene="desktop">
<div class="case-copy" data-story-scene>${kind_pill(kind_icon, kind_text)}<h1 class="h1">${e(c["name"])}</h1>${headline ? `<h2 class="case-headline">${headline}</h2>` : ""}<p class="lede" style="margin-top:16px">${summary}</p>${notice}
</div>
<div class="case-evidence" data-story-scene>${media}<p class="case-media-caption">${e(media_caption[slug])}</p></div>
</div></div></section>`;
  }
  const LIVE = {
    city: "https://oberlin.communityhub.cloud/dh-public/city-of-oberlin",
    ops: "https://oberlin.communityhub.cloud/dh-public/ops-embed",
    oc: "https://oberlin.communityhub.cloud/dh-public/oc-embed",
    glsc: "https://cleveland.communityhub.cloud/dh-public/glsc-embed",
  };
  // Neighborhoods
  function neighborhoods(): void {
    const a = H.ABY["neighborhoods"];
    const media = H.postcard(
      "tile-midtown.jpg",
      "The Cleveland Citywide Dashboard with live air readings, part of the loop on MidTown's screens",
    );
    let body = opening(
      H.crumbs([null, "Who it's for"] as const, [null, a["name"]] as const),
      "Neighborhoods",
      "Neighborhoods",
      "Using our tools, organizations, neighborhoods, and cities are motivating and empowering community engagement, connection, and resilience in the face of a rapidly changing environment.",
      H.postcard("cafe-window-sign.jpg", "A Community Hub screen in the window of Slow Train Cafe, downtown Oberlin"),
    );
    body += jump([
      ["gets", "What you get"] as const,
      ["who", "Who does this"] as const,
      ["levels", "Ways to take part"] as const,
      ["live", "Live"] as const,
      ["faq", "Questions"] as const,
    ]);
    body += sec(
      "gets",
      "What you get",
      "Products and Services",
      H.stanza_row([
        [
          "var(--amber-tint)",
          '<a href="community-calendar.html">A calendar and jobs board</a>',
          "Any resident or organization posts an event or a job opening with a short form. It usually reaches every screen and the web within hours.",
        ] as const,
        [
          "var(--peri-tint)",
          '<a href="digital-signage.html">Screens in partner locations</a>',
          "Each screen cycles through neighborhood news, plus that host's own announcements, such as a grocery's weekly specials.",
        ] as const,
        [
          "var(--leaf-tint)",
          '<a href="phone-app.html">A phone remote and web embeds</a>',
          "Scan the QR code by a screen to control it from your phone, or put the calendar and Community Voices on your own website, restyled to match it.",
        ] as const,
      ]),
    );
    body += sec(
      "who",
      "Who already does this",
      "MidTown Cleveland and downtown Oberlin",
      `
<div class="audience-evidence"><div class="audience-evidence-copy" data-story-scene><div class="feat-list">
<div><h3>MidTown Cleveland</h3><p>Dave's Market, Fatima Family Center, Willson Tower and MidTown, Inc. piloted the dashboard from 2022 to 2024. It reached 10 locations by January 2026, and it's still growing. ${H.product_link_row(["community-calendar"])}</p></div>
<div><h3>Downtown Oberlin</h3><p>Slow Train Cafe, the Hotel at Oberlin, IGA and the Oberlin Business Partnership host screens that carry the town calendar and Community Voices.</p></div>
</div>
</div><div class="audience-evidence-media" data-story-scene>${media}<p class="fig">The Cleveland Citywide Dashboard, part of the loop on MidTown’s screens. Slow Train Cafe in downtown Oberlin runs the same software.</p></div></div>`,
      { alt: true },
    );
    const levels = [
      [
        "Level 1",
        "Read what's shared",
        "Using community info shared on screens and websites;",
      ] as const,
      [
        "Level 2",
        "Post and subscribe",
        "Subscribing to the newsletter and encouraging others to do so; Posting MidTown-focused happenings and career opportunities and encouraging others to do so;",
      ] as const,
      [
        "Level 3",
        "Embed it on your site",
        "Embedding Community Dashboard content into your organization’s website;",
      ] as const,
      [
        "Level 4",
        "Add it to your signage",
        "Integrating Dashboard content into your organization’s existing digital signage;",
      ] as const,
      [
        "Level 5",
        "Host a screen",
        "Hosting interactive dashboard signs in your organization’s facilities;",
      ] as const,
      [
        "Level 6",
        "Sponsor the project",
        "Being an official sponsor of the project (and getting featured for doing so)",
      ] as const,
    ];
    const level_items: readonly (readonly [string, string, string])[] =
      levels.map(
        ([n, t, d]) =>
          ["var(--amber-tint)", `<span class="n">${n}</span>${t}`, d] as const,
      );
    body += sec(
      "levels",
      "Ways to take part",
      "Ways to take part",
      `<div class="ppl-ladder participation-groups" data-chapter-scenes data-story-scene="desktop"><div class="participation-group" data-story-scene>${H.stanza_row(level_items.slice(0, 2), 2)}</div><div class="participation-group" data-story-scene>${H.stanza_row(level_items.slice(2, 4), 2)}</div><div class="participation-group" data-story-scene>${H.stanza_row(level_items.slice(4), 2)}<p class="participation-cost" style="margin-top:16px;color:var(--ink-2)">Posting is free, as long as it meets the posting guidelines. Hosting a screen means buying and installing it, and covering baseline software and content costs for a two year trial.</p></div></div>`,
      {
        intro:
          "Partnership is easy at whatever level makes sense for individuals and organizations:",
      },
    );
    body += sec(
      "live",
      "Live",
      "Community Calendar and Jobs Board",
      H.events_block(
        "Happening in Oberlin this week",
        "This is the same Calendar and Jobs Board product MidTown's screens run, pulled live from Oberlin's feed.",
      ),
    );
    body += sec(
      "faq",
      "Questions",
      "Common questions",
      faq([
        [
          "Does every partner need a screen?",
          "No. A partner can post to the calendar and jobs board, or embed them on its website, without hosting a screen.",
        ] as const,
        [
          "Who can post, and how fast does it appear?",
          "Anyone can post a public, non-commercial event with a short form. It's usually live on the screens and the web within a few hours.",
        ] as const,
        [
          "Who sponsors MidTown's dashboard?",
          "The Cleveland Foundation, MidTown Cleveland, Cleveland Neighborhood Progress, Dave's Market, and Oberlin College's Environmental Studies and Environmental Dashboard Program.",
        ] as const,
      ]),
      { alt: true },
    );
    body += cross(
      "campuses.html",
      "Also working with a campus or a school? See campuses and schools",
    );
    body += H.cta_band(
      "Contact Us",
      "We welcome inquiries about our software applications and pricing options for organizations and whole communities.",
    );
    H.write_page(
      "neighborhoods",
      H.page(
        "neighborhoods",
        a["name"],
        "A shared calendar, screens and web embeds for neighborhood organizations. Running in MidTown Cleveland since the 2022 pilot.",
        body,
        { current: "neighborhoods" },
      ),
    );
  }
  // Cities and towns
  function cities(): void {
    const a = H.ABY["cities"];
    const media = H.postcard(
      "oberlin-aerial.jpg",
      "Aerial view of downtown Oberlin, Ohio in autumn",
    );
    let body = opening(
      H.crumbs([null, "Who it's for"] as const, [null, a["name"]] as const),
      "Cities and towns",
      "Cities and towns",
      "Oberlin, Ohio has used Community Hub since 2008, with 24 screens in its schools, library, City Hall, Fire Station, businesses and churches.",
      media,
    );
    body += jump([
      ["gets", "What you get"] as const,
      ["live", "The Citywide Dashboard"] as const,
      ["climate", "Climate campaign"] as const,
      ["who", "Who does this"] as const,
      ["faq", "Questions"] as const,
    ]);
    body += sec(
      "gets",
      "What you get",
      "Products and Services",
      H.stanza_row([
        [
          "var(--sky-2)",
          '<a href="data-dashboard.html#citywide">The Citywide Dashboard</a>',
          "An animated drawing of your town, run by live data from your utility and water plants.",
        ] as const,
        [
          "var(--peri-tint)",
          '<a href="digital-signage.html">Screens across the city</a>',
          "City buildings, schools and businesses, all fed from one platform.",
        ] as const,
        [
          "var(--leaf-tint)",
          '<a href="community-calendar.html">A town calendar</a>',
          "Residents and organizations post to it, with a weekly email summing up what's coming.",
        ] as const,
      ]),
    );
    body += sec(
      "live",
      "Live",
      "Citywide Dashboard",
      staged_citywide(),
      {
        intro:
          "This is the live dashboard, fed every minute by Oberlin Municipal Light and Power and the water and wastewater plants. Drag the slider and watch Flash react.",
      },
    );
    body += sec(
      "climate",
      "Climate campaign",
      "The screens carry Oberlin's Climate Action Plan",
      `
<p>Under a four year contract, Community Hub runs the City's communication platform and promotes its Climate Action Plan. Later Is Too Late is Oberlin's campaign with the City, POWER, Efficiency Smart, Oberlin Municipal Light and Power and the Lorain Citizens Climate Lobby. It asks residents to be efficient, go electric and go solar.</p>
${stats([["36", "homes joined the two solar buyer groups"] as const, ["5,000", "metric tons of CO2e avoided over the systems' lifetime"] as const, ["100%", "of Oberlin's electricity is already carbon free"] as const])}`,
      { alt: true },
    );
    body += sec(
      "who",
      "Who already does this",
      "The City of Oberlin and the Oberlin Business Partnership",
      `
<div class="organization-context" data-story-scene="all"><div class="feat-list c2">
<div><h3>City of Oberlin</h3><p>Oberlin has 24 interactive signs around town.</p></div>
<div><h3>Oberlin Business Partnership</h3><p>It hosts a screen and posts downtown events to the town calendar.</p></div>
</div></div>${tquote("Janet Haar").replace("data-story-scene", 'data-story-scene="all"')}`,
    );
    body += sec(
      "faq",
      "Questions",
      "Common questions",
      faq([
        [
          "Does it work with a municipal utility?",
          "Yes. Oberlin's dashboard reads from Oberlin Municipal Light and Power and the city's water and wastewater plants every minute, plus a stream station.",
        ] as const,
        [
          "Do residents need to be near a screen?",
          "No. The calendar, Community Voices and the Citywide Dashboard are all on the phone app and the web.",
        ] as const,
        [
          "Can we show our own climate plan?",
          "Yes. Oberlin's screens carry its Climate Action Plan and stories about where the town's water and electricity come from.",
        ] as const,
      ]),
      { alt: true },
    );
    body += cross(
      "campuses.html",
      "Also working with a campus or a school? See campuses and schools",
    );
    body += H.cta_band(
      "Contact Us",
      "We welcome inquiries about our software applications and pricing options for organizations and whole communities.",
    );
    H.write_page(
      "cities",
      H.page(
        "cities",
        a["name"],
        "City news, a town calendar and live utility data on screens around town. Oberlin, Ohio has used Community Hub since 2008.",
        body,
        { current: "cities" },
      ),
    );
  }
  // Museums and science centers
  function museums(): void {
    const a = H.ABY["museums"];
    const media = H.postcard(
      "glsc-exhibit.jpg",
      "Visitors at the Environmental Dashboard exhibit at the Great Lakes Science Center in Cleveland",
    );
    let body = opening(
      H.crumbs([null, "Who it's for"] as const, [null, a["name"]] as const),
      "Museums and science centers",
      "Museums and science centers",
      "The Great Lakes Science Center in Cleveland runs an Environmental Dashboard, combining the museum's own sensors with Lake Erie data from the USGS and an EPA air station.",
      media,
    );
    body += jump([
      ["gets", "What you get"] as const,
      ["trust", "Why museums"] as const,
      ["live", "Live data"] as const,
      ["faq", "Questions"] as const,
    ]);
    body += sec(
      "gets",
      "What you get",
      "Products and Services",
      H.stanza_row([
        [
          "var(--violet-tint)",
          '<a href="digital-signage.html">Live exhibit screens</a>',
          "A large screen and a touch kiosk, showing your region's live data.",
        ] as const,
        [
          "var(--sky-2)",
          '<a href="data-dashboard.html#citywide">A drawing of your city or watershed</a>',
          "Oberlin, Toledo and Cleveland each have their own Citywide Dashboard illustration.",
        ] as const,
        [
          "var(--leaf-tint)",
          '<a href="phone-app.html">A phone remote and a public web version</a>',
          "Visitors take over a screen from their phone, then keep reading at home.",
        ] as const,
      ]),
    );
    body += sec(
      "trust",
      "Why museums",
      "Museums rank second in public trust, just behind friends and family",
      bars(
        [
          ["Friends and family", 94, "6.6"] as const,
          ["Museums", 91, "6.4"] as const,
          ["Scientists", 87, "6.1"] as const,
          ["NGOs", 76, "5.3"] as const,
          ["Local news", 73, "5.1"] as const,
          ["National news", 69, "4.8"] as const,
          ["Government", 64, "4.5"] as const,
          ["Business", 63, "4.4"] as const,
          ["Social media", 54, "3.8"] as const,
        ],
        "Trust score by source, survey of US adults (N = 1,200)",
        "Museums",
      ) + '<p class="ppl-src">From a national survey of 1,200 US adults.</p>',
      { alt: true },
    );
    body += sec(
      "live",
      "Live",
      "The Cleveland Environmental Dashboard, live",
      `
<div class="ppl-sources" data-story-scene="all">
<div style="--c:var(--leaf-deep);--c-tint:var(--leaf-tint)"><b>Great Lakes Science Center</b><span>Environmental monitoring equipment at the center</span></div>
<div style="--c:var(--leaf-deep);--c-tint:var(--leaf-tint)"><b>Lake Erie</b><span>Lake data from the US Geological Survey</span></div>
<div style="--c:var(--leaf-deep);--c-tint:var(--leaf-tint)"><b>Cleveland air</b><span>An EPA air quality monitoring station</span></div>
</div>
<div class="museum-live-scene" style="margin-top:22px" data-story-scene="all"><h3 class="museum-live-title">Cleveland Environmental Dashboard</h3>${H.live_frame(LIVE["glsc"], "the Cleveland Environmental Dashboard", "cleveland.communityhub.cloud", 560, "Cleveland Environmental Dashboard at the Great Lakes Science Center.")}</div>
${tquote("Scott Volmer").replace("data-story-scene", 'data-story-scene="all"')}`,
    );
    body += sec(
      "faq",
      "Questions",
      "Common questions",
      faq([
        [
          "Can visitors keep exploring after they leave?",
          "Yes. The Cleveland Environmental Dashboard is public on the web, and pieces of it can go on your own website.",
        ] as const,
        [
          "Do you draw our city or watershed?",
          "Yes. Oberlin, Toledo and Cleveland each have a Citywide Dashboard drawing in the same hand-drawn style.",
        ] as const,
      ]),
      { alt: true },
    );
    body += cross(
      "campuses.html",
      "Also working with a campus or a school? See campuses and schools",
    );
    body += H.cta_band(
      "Contact Us",
      "We welcome inquiries about our software applications and pricing options for organizations and whole communities.",
    );
    H.write_page(
      "museums",
      H.page(
        "museums",
        a["name"],
        "Exhibits on live regional air, lake and energy data, as at the Great Lakes Science Center in Cleveland. Museums rank second in public trust.",
        body,
        { current: "museums" },
      ),
    );
  }
  // Colleges and universities
  function campuses(): void {
    const a = H.ABY["campuses"];
    const media = H.postcard(
      "carbon-neutral-science-center-original.jpeg",
      "Three people at Oberlin College’s Carbon Neutral Stories exhibit in the Science Center",
    );
    let body = opening(
      H.crumbs([null, "Who it's for"] as const, [null, a["name"]] as const),
      "Colleges and universities",
      "Colleges and universities",
      "Oberlin College meters 85 buildings and shows the data on 12 campus signs and glowing Environmental Orbs, and Hamilton College is piloting a campus dashboard from May 2026 to spring 2027.",
      media,
    );
    body += jump([
      ["gets", "What you get"] as const,
      ["emissions", "Buildings and emissions"] as const,
      ["where", "Where it helps"] as const,
      ["town", "Town and gown"] as const,
      ["live", "Live"] as const,
      ["cases", "Case studies"] as const,
      ["faq", "Questions"] as const,
    ]);
    body += sec(
      "gets",
      "What you get",
      "Products and Services",
      H.stanza_row([
        [
          "var(--peri-tint)",
          '<a href="data-dashboard.html">Building dashboards and orbs</a>',
          "Each dorm and academic building sees its own electricity and water, in real time.",
        ] as const,
        [
          "var(--sky-2)",
          '<a href="the-hub.html">Data Hub exports</a>',
          "Variables and dates a class or a research project needs.",
        ] as const,
        [
          "var(--leaf-tint)",
          '<a href="stories.html">C-Neutral Stories</a>',
          "Animated chapters that explain how the campus heats, cools and powers itself.",
        ] as const,
      ]),
    );
    const emissions = `<div class="feat-list c2">
<div data-story-scene><h3>What US buildings account for</h3>${bars([["Electricity use", 67, "67%"] as const, ["Energy use", 37, "37%"] as const, ["CO2 emissions", 35, "35%"] as const, ["Fresh water use", 12, "12%"] as const, ["Global CO2", 9, "9%"] as const], "Share of US totals that come from buildings")}
<p class="ppl-src">People spend more than 90% of their time indoors.</p></div>
<div data-story-scene><h3>Hamilton College's 2023 emissions</h3>${bars([["Heating buildings", 67, "67%"] as const, ["Electricity", 28, "28%"] as const], "Share of Hamilton's 2023 emissions", "Heating buildings")}
<p style="margin-top:14px;color:var(--ink-2)">Feedback inside a building lets the students and staff who use it see its own energy use. That's why a campus dashboard starts with building meters.</p></div>
</div>`;
    body += sec(
      "emissions",
      "Buildings and emissions",
      "Heating buildings made up 67% of Hamilton College's 2023 emissions",
      emissions,
      {
        intro:
          "Buildings are where most campus emissions come from, and where students spend their days.",
        alt: true,
      },
    );
    const lanes = `<div class="ppl-lanes">
<div class="ppl-lane" data-story-scene><h3>Facilities and sustainability offices</h3><p>See electricity, water, heating and cooling for every metered building, and track carbon goals. Oberlin College meters 85 buildings and a geothermal well field, more than 700 metered points in all.</p></div>
<div class="ppl-lane" data-story-scene><h3>Classroom and research</h3><p>Environmental Studies, Data Science, Geology, Biology, Psychology, Computer Science and Public Health all use campus data in class. Data Hub exports the variables a project needs.</p></div>
<div class="ppl-lane" data-story-scene><h3>Residential life and public engagement</h3><p>Dorm electricity use drops about 10% during Ecolympics, and the drop holds afterward. Orbs glow with a building's use, and nine C-Neutral Stories explain the campus systems behind carbon neutrality.</p></div>
</div>`;
    body += sec(
      "where",
      "Where it helps",
      "Who on campus uses the dashboard data",
      lanes,
    );
    const nodes = [
      [
        "Oberlin College",
        LIVE["oc"],
        "Dorms, orbs and campus buildings",
      ] as const,
      [
        "City of Oberlin",
        LIVE["city"],
        "Town-wide electricity and water",
      ] as const,
      ["Oberlin City Schools", LIVE["ops"], "Every school building"] as const,
    ];
    const town_links = nodes
      .map(
        ([n, u, d]) =>
          `<li><a class="hand-link" href="${u}" target="_blank" rel="noopener">${n}</a><small style="display:block;color:var(--ink-2);margin-top:2px">${d}</small></li>`,
      )
      .join("");
    body += sec(
      "town",
      "Town and gown",
      "Oberlin's college, city and public schools share one platform",
      `<div class="ppl-split"><div data-story-scene><p>The Citywide Dashboard shows Oberlin College's electricity per student next to the City Schools'. Ecolympics runs four competitions at once: the City Schools, community buildings, college houses and college buildings. All three share the community calendar, Community Voices and the Citywide Dashboard.</p><ul style="display:grid;gap:14px;margin-top:18px;max-width:480px">${town_links}</ul></div>` +
        H.postcard(
          "town-gown-kids.jpg",
          "College students in Oberlin sweatshirts run an activity table with a prize wheel for local children",
          "College students run an activity table for local children, from a Community Voices slide in Oberlin",
        ).replace('<figure ', '<figure data-story-scene ') +
        "</div>",
      { alt: true },
    );
    body += sec(
      "live",
      "Live",
      "Building Dashboards",
      H.live_frame(
        LIVE["oc"] + "?active-page=exploreData&active-data-dashboard=815",
        "Oberlin College's public dashboard",
        "oberlin.communityhub.cloud",
        560,
        "Choose a building in Data Dashboard to see its readings.",
      ),
    );
    const cases_html = `<div class="feat-list c2">
<div class="campus-case" data-story-scene>${H.postcard("cs-oberlin-snow.jpg", "Snow-covered trees and a campus building in Oberlin at dusk", undefined, -1)}<h3 style="margin-top:14px">Oberlin College</h3>${stats([["85", "buildings metered"] as const, ["700+", "metered points"] as const, ["12", "signs on campus"] as const])}<p style="margin-top:12px"><a class="hand-link" href="oberlin-college.html">Read the Oberlin College case study</a></p></div>
<div class="campus-case" data-story-scene>${H.postcard("tile-hamilton.jpg", "Hamilton College, drawn in the Citywide Dashboard illustration style", undefined, 1)}<h3 style="margin-top:14px">Hamilton College</h3>${stats([["67%", "of 2023 emissions came from heating buildings"] as const, ["2026", "to 2027, the pilot's run"] as const])}<p style="margin-top:12px"><a class="hand-link" href="hamilton-college.html">Read the Hamilton College case study</a></p></div>
</div>`;
    body += sec(
      "cases",
      "Case studies",
      "Oberlin College and the Hamilton College pilot",
      cases_html,
      { alt: true },
    );
    body += sec(
      "faq",
      "Questions",
      "Common questions",
      faq([
        [
          "Can we start with a pilot?",
          "Yes. Hamilton College's pilot runs from May 2026 to spring 2027.",
        ] as const,
        [
          "Can students use the data in class?",
          "Yes. Data Hub exports the variables and dates a class needs.",
        ] as const,
        [
          "Do we need new meters?",
          "Not always. Community Hub reads utility meters, data loggers and building automation systems.",
        ] as const,
      ]),
    );
    body += cross(
      "cities.html",
      "Also working with a town or a neighborhood? See cities and towns",
    );
    body += H.cta_band(
      "Contact Us",
      "We welcome inquiries about our software applications and pricing options for organizations and whole communities.",
    );
    H.write_page(
      "campuses",
      H.page(
        "campuses",
        a["name"],
        "Live building energy and water data for campuses: orbs, dorm competitions, class data and C-Neutral Stories. Oberlin College and a Hamilton College pilot.",
        body,
        { current: "campuses" },
      ),
    );
  }
  // K–12 schools
  function schools(): void {
    const a = H.ABY["schools"];
    const media = H.postcard(
      "kids-citywide-screen.jpg",
      "Elementary students gathered in front of a Citywide Dashboard screen in a school hallway",
    );
    let body = opening(
      H.crumbs([null, "Who it's for"] as const, [null, a["name"]] as const),
      "K-12 schools",
      "K–12 schools",
      "Every Oberlin public school has sensors and a hallway screen, Toledo Public Schools connected 44 school buildings, and teachers can download 35 free lessons that use the same data.",
      media,
    );
    body += jump([
      ["gets", "What you get"] as const,
      ["eco", "Ecolympics"] as const,
      ["live", "Live"] as const,
      ["toledo", "Toledo"] as const,
      ["roles", "Who uses it"] as const,
      ["faq", "Questions"] as const,
    ]);
    body += sec(
      "gets",
      "What you get",
      "Products and Services",
      `<div class="school-uses">${H.feat_list([
        [
          '<a href="digital-signage.html">Hallway screens</a>',
          "The school's own building dashboard, the Citywide Dashboard and the district calendar.",
        ] as const,
        [
          "Ecolympics",
          "A yearly competition where each school works against its own baseline.",
        ] as const,
        [
          '<a href="education.html">35 free lessons</a>',
          "Lesson plans and units, by grade band, that use the school's own data.",
        ] as const,
      ], 1)}</div>`,
    );
    const eco = `<div class="school-results-group" data-story-scene="all">${stats([["31%", "less electricity at the winning Oberlin school in a recent Ecolympics"] as const, ["2,570", "gallons saved by Oberlin City Schools in 2024, the biggest water cut of any group"] as const, ["30%+", "electricity cut at Prospect Elementary, in both 2014 and 2015"] as const])}
<figure class="school-result-figure"><img src="assets/ecolympics-2024-kwh.jpg" alt="Ecolympics 2024 slide: Oberlin met its community-wide electricity reduction goal and saved 10,050 kilowatt-hours"><figcaption>Community electricity savings, 2024.</figcaption></figure>
</div><div class="school-results-group" data-story-scene="all"><figure class="school-result-figure"><img src="assets/ecolympics-2024-water.jpg" alt="Ecolympics 2024 slide: Oberlin City Schools achieved the greatest water reduction, saving 2,570 gallons"><figcaption>Water savings by Oberlin City Schools, 2024.</figcaption></figure>
<p style="margin-top:10px;color:var(--ink-2)">Ecolympics 2024 results, as they ran on Oberlin's screens. The town-wide goal for 2026 was 20,000 kWh and 15,000 gallons.</p></div>`;
    body += sec(
      "eco",
      "Ecolympics",
      "Each school competes against its own baseline",
      eco,
      { alt: true },
    );
    body += sec(
      "live",
      "Live",
      "Building Dashboards",
      H.live_frame(
        LIVE["ops"],
        "the Oberlin City Schools dashboard",
        "oberlin.communityhub.cloud",
        560,
        "Select Data Dashboard, then choose a school building.",
      ),
    );
    body += sec(
      "toledo",
      "Toledo",
      "Toledo connected all 44 of its school buildings",
      tquote("Bob Mendenhall"),
    );
    body += sec(
      "roles",
      "Who uses it",
      "A screen for administration, teachers, the board and students",
      feature_groups([
        [
          "Administration",
          "Superintendents, communications staff and facilities managers see every building's readings in one place.",
        ] as const,
        [
          "Teachers",
          "35 free lessons, filed by grade band, turn the school's own data into a lesson.",
        ] as const,
        [
          "The school board",
          "Ecolympics results and building trends give the board a dated record.",
        ] as const,
        [
          "Students",
          "Hallway screens put the numbers where students already walk.",
        ] as const,
      ]),
      { alt: true },
    );
    body += sec(
      "faq",
      "Questions",
      "Common questions",
      faq([
        [
          "Are the lessons really free?",
          "Yes. All 35 lessons and units are free to download from environmentaldashboard.org.",
        ] as const,
        [
          "What grades do they cover?",
          "Grade 1 through high school, plus college-level units.",
        ] as const,
        [
          "Can each principal post to their own school's screen?",
          "Yes. Principals and the superintendent post announcements to their own buildings' screens.",
        ] as const,
      ]),
    );
    body += cross(
      "cities.html",
      "Also working with a city or a neighborhood? See cities and towns",
    );
    body += H.cta_band(
      "Contact Us",
      "We welcome inquiries about our software applications and pricing options for organizations and whole communities.",
    );
    H.write_page(
      "schools",
      H.page(
        "schools",
        a["name"],
        "Hallway screens with each school's electricity and water, Ecolympics, 35 free lessons and a district dashboard. Oberlin City Schools and Toledo Public Schools.",
        body,
        { current: "schools" },
      ),
    );
  }
  // Case study index
  function examples(): void {
    const cards = H.CASES.map((c, i) => `<a href="${c["slug"]}.html" data-story-scene>${H.postcard(c["img"], "", undefined, i % 2 === 0 ? -2 : 2)}<b>${e(c["name"])}</b><span class="case-kind">${e(c["kind"])}</span><span>${e(c["fact"])}</span></a>`);
    const also = feature_groups([
      [
        "Toledo Public Schools",
        "By 2016, Toledo had connected all 44 of its school buildings.",
      ] as const,
      [
        "Great Lakes Colleges Association",
        "A grant funded by the Andrew W. Mellon Foundation brought the dashboard approach to Albion, Antioch, DePauw and Hope, alongside Oberlin.",
      ] as const,
    ]);
    const firstCase = H.CASES[0];
    let body = `<section class="sec-pad case-index case-index-opening"><div class="wrap" data-story-scene="all">${H.crumbs([null, "Case studies"] as const)}<h1 class="h1">Case studies</h1><div class="case-index-lead"><div><h2>${e(firstCase.name)}</h2><p class="case-kind">${e(firstCase.kind)}</p><p class="lede">${e(firstCase.fact)}</p><a class="pc-a" href="${firstCase.slug}.html">Read the case study ${ARR}</a></div>${H.postcard("cs-oberlin-snow.jpg", "Snow-covered trees and an Oberlin College campus building at dusk")}</div></div></section>
<section class="sec-pad case-index" aria-labelledby="cases-places-h"><div class="wrap chapter-scene" data-story-scene="desktop"><h2 class="h2" id="cases-places-h">Cities and neighborhoods</h2><div class="ppl-board" data-reveal-group>${cards.slice(1, 3).join("")}</div></div></section>
<section class="sec-pad case-index" aria-labelledby="cases-more-h"><div class="wrap chapter-scene" data-story-scene="desktop"><h2 class="h2" id="cases-more-h">A museum and a campus pilot</h2><div class="ppl-board" data-reveal-group>${cards.slice(3).join("")}</div></div></section>`;
    body += sec(
      "also",
      "More places",
      "Other partners and earlier projects",
      `<div class="case-partners" data-story-scene>${also}</div>` + tquote("Bob Mendenhall"),
      { alt: true },
    );
    body += sec(
      "dash",
      "Live",
      "Public dashboards you can open now",
      `<p style="margin-top:6px">Explore the public dashboards from Oberlin and the Great Lakes Science Center. Hamilton College’s pilot dashboard remains nonpublic. <a href="dashboards.html">See the public dashboards ${ARR}</a></p>`,
    );
    body += H.cta_band(
      "Contact Us",
      "We welcome inquiries about our software applications and pricing options for organizations and whole communities.",
    );
    H.write_page(
      "examples",
      H.page(
        "examples",
        "Case studies",
        "Case studies from Oberlin College, the City of Oberlin, MidTown Cleveland, the Great Lakes Science Center and Hamilton College, with dated numbers and live dashboards.",
        body,
        { current: "examples" },
      ),
    );
  }
  // Oberlin College case study
  function oberlin_college(): void {
    const media = H.postcard(
      "cs-oberlin-snow.jpg",
      "Snow-covered trees and a campus building in Oberlin at dusk",
    );
    let body = case_hero(
      "oberlin-college",
      "icon-campuses.png",
      "Case study, campus",
      "",
      "Oberlin College meters electricity, water, heat and cooling in 85 buildings, more than 700 points in all. Students see the data on 12 campus signs, glowing Environmental Orbs and a set of animated stories. The College committed to carbon neutrality in 2006 and reached it in 2025.",
      [
        ["Where", "Oberlin, Ohio"] as const,
        [
          "Metered",
          "85 buildings, plus the geothermal well field and central plant",
        ] as const,
        [
          "On display",
          "12 signs, Environmental Orbs and a Science Center exhibit",
        ] as const,
        ["Carbon neutrality", "Committed in 2006, reached in 2025"] as const,
        [
          "Public dashboard",
          `<a href="${LIVE["oc"]}" target="_blank" rel="noopener">oberlin.communityhub.cloud</a>`,
        ] as const,
      ],
      media,
    );
    const heat = sec(
      "heat",
      "Heating and cooling",
      "Oberlin heats its campus with geothermal now, after 74 years of coal",
      `
<p>The College has heated its campus from a central plant behind Mudd Library since the 1940s. The plant burned coal until 2014, when it switched to natural gas. In 2024, geothermal heat pumps became the main source of heating and cooling.</p>
<p>Oberlin committed to carbon neutrality in 2006, the first of its peer institutions to do so. It reached that goal in 2025. The College also gets 100% carbon free electricity through a partnership with the City of Oberlin.</p>`,
      {
        alt: true,
        facts: [
          ["85", "campus buildings metered for electricity, water, heat and cooling"],
          ["700+", "metered points, including the geothermal well field and central plant"],
          ["12", "signs on campus that show dashboard content"],
          ["10%", "less electricity in dorms during Ecolympics"],
        ],
      },
    );
    body += heat;
    body += sec(
      "installed",
      "Products",
      "Modes of information delivery",
      installed([
        [
          "data-dashboard",
          "Live electricity, water, heat and cooling for 85 campus buildings, plus dorm orbs",
        ] as const,
        [
          "the-hub",
          "More than 700 metered points and the College's public dashboard",
        ] as const,
        [
          "digital-signage",
          "Twelve signs on campus, with story teasers in the home loop",
        ] as const,
        [
          "stories",
          "Nine C-Neutral Stories about the systems behind carbon neutrality",
        ] as const,
      ]),
    );
    body += sec(
      "use",
      "People",
      "How people use it",
      `
<div class="feature-groups"><div class="feat-list c2" data-story-scene>
<div><h3>Orbs show each dorm its use</h3><p>Glowing orbs change color with a building's electricity and water use. Oberlin College has 34 Environmental Orbs across its dorms.</p></div>
<div><h3>Dorms compete in Ecolympics</h3><p>Oberlin ran its first dorm electricity and water competition in 2006, and joined Campus Conservation Nationals in 2010. Dorm electricity use drops about 10% during competitions, and the drop holds afterward.</p></div>
</div><div class="feat-list c2" data-story-scene><div><h3>Visitors follow a story at the Science Center</h3><p>Our team built a geothermal model for the Science Center in summer 2026. LEDs light up to show the flows, and a QR code opens the story on a phone.</p></div>
<div><h3>Screens tease the stories</h3><p>The home loop on campus signs runs short teasers from the C-Neutral Stories, one chapter at a time.</p></div>
</div></div>`,
      { alt: true },
    );
    body += tquote("Grace Gao");
    body += sec(
      "stories",
      "C-Neutral Stories",
      "Animated stories explain the campus systems behind carbon neutrality",
      `
<div class="case-story-copy" data-story-scene="all"><p>Nine stories come from the College's Sustainable Infrastructure Program: Heating and Cooling, Energy, Water, Climate, Transportation, Materials, Land, Food and the Adam Joseph Lewis Center. Each chapter answers one question in 5 to 10 slides, with live charts of what the campus is using right now.</p>
<p>In fall 2024, the team tested the stories with about 130 people: alumni at reunion weekend, tour guides and student staff, admissions staff, students, parents and the Committee on Environmental Sustainability.</p></div>
<div class="case-story-player" data-story-scene="all">${nativeContexts('stories', [storyContexts[0]])}<p class="case-source-link"><a href="story-of-dashboard.html#college-heating">Original heating and cooling story frames</a></p></div>`,
    );
    body += sec(
      "journey",
      "Timeline",
      "Origin Story",
      timeline([
        [
          "2006",
          "Oberlin commits to carbon neutrality, the first of its peers. Dorms run the first electricity and water reduction competition.",
        ] as const,
        [
          "2010",
          "Oberlin's dorms take part in Campus Conservation Nationals.",
        ] as const,
        [
          "2014",
          "The central plant stops burning coal after 74 years and switches to natural gas.",
        ] as const,
        [
          "2024",
          "Geothermal heat pumps become the main source of heating and cooling. That fall, focus groups test the C-Neutral Stories.",
        ] as const,
        [
          "2025",
          "Oberlin reaches carbon neutrality, 19 years after it committed.",
        ] as const,
        [
          "Summer 2026",
          "A working geothermal model goes up at the Science Center.",
        ] as const,
      ]),
      { intro: JOURNEY_NOTE.replace("{}", "Oberlin College"), alt: true },
    );
    body += sec(
      "live",
      "Live",
      "Oberlin College's public dashboard",
      H.live_frame(
        LIVE["oc"] + "?active-page=exploreData&active-data-dashboard=815",
        "Oberlin College's public dashboard",
        "oberlin.communityhub.cloud",
        560,
        "In Data Dashboard, choose a residence hall or the Adam Joseph Lewis Center.",
      ),
    );
    body += `<section class="sec-pad" style="padding-top:0"><div class="wrap">${next_story("hamilton-college", "Hamilton College")}</div></section>`;
    body += H.cta_band(
      "Contact Us",
      "We welcome inquiries about our software applications and pricing options for organizations and whole communities.",
    );
    H.write_page(
      "oberlin-college",
      H.page(
        "oberlin-college",
        "Oberlin College case study",
        "Oberlin College meters 85 buildings and shows the data on 12 signs, glowing orbs and nine animated stories. Dorm electricity drops about 10% during Ecolympics.",
        body,
        {
          current: "oberlin-college",
          jsonld: H.sw_ld(H.PBY["data-dashboard"]),
        },
      ),
    );
  }
  // City of Oberlin case study
  function city_of_oberlin(): void {
    const media = H.cwd_sign(false);
    let body = case_hero(
      "city-of-oberlin",
      "icon-cities.png",
      "Case study, city",
      "",
      "Oberlin is a city of about 8,300 people with its own electric utility. Community Hub runs the City's communication platform, with 24 interactive signs in schools, the library, City Hall, shops and churches. The Citywide Dashboard shows live data from the utility and the water plants, updated every minute.",
      [
        [
          "Where",
          "Oberlin, Ohio, about 8,300 residents including students",
        ] as const,
        ["Screens", "24 interactive signs around town"] as const,
        [
          "Data",
          "Oberlin Municipal Light and Power, the water and wastewater plants, and Plum Creek",
        ] as const,
        [
          "Contract",
          "Four years, to run the City's platform and promote its Climate Action Plan",
        ] as const,
        [
          "Public dashboards",
          `<a href="${LIVE["city"]}" target="_blank" rel="noopener">City of Oberlin</a> and <a href="${LIVE["ops"]}" target="_blank" rel="noopener">Oberlin City Schools</a>`,
        ] as const,
      ],
      media,
    );
    body += sec(
      "signs",
      "Where the screens are",
      "Screens run in schools, the library, City Hall and local businesses",
      `
<p>Oberlin has 24 interactive digital dashboard signs. They're in the City Schools, the library, a food pantry, businesses, City Hall, the Fire Station, a retirement community and churches.</p>
${H.postcard("hotel-oberlin-sign.jpg", "A Community Hub screen on a wood-paneled wall in the Hotel at Oberlin lobby", "A Community Hub screen in the Hotel at Oberlin lobby")}
<p>When nobody's touching a screen, it cycles through the dashboards, the calendar and Community Voices. Each screen also carries content for its own location, such as a principal's announcements in a school.</p>`,
      {
        alt: true,
        facts: [
          ["24", "interactive signs in schools, the library, City Hall and businesses"],
          ["1 min", "between readings from the city utility and water plants"],
          ["10,050", "kWh saved community-wide in the 2024 Ecolympics"],
          ["2,570", "gallons saved by the City Schools in the 2024 Ecolympics"],
        ],
      },
    );
    body += sec(
      "installed",
      "Products",
      "Modes of information delivery",
      installed([
        [
          "data-dashboard#citywide",
          "An animated drawing of Oberlin, fed every minute by the utility and water plants, plus building dashboards for the library, Fire Station, Community Center and City Schools",
        ] as const,
        [
          "digital-signage",
          "Twenty-four interactive signs around town",
        ] as const,
        [
          "community-calendar",
          "Events and volunteer posts from anyone, on screens, online and in a weekly email",
        ] as const,
        [
          "community-voices",
          "Photos and words from residents, sorted into sections such as Neighbors and Our Downtown",
        ] as const,
        [
          "web-embeddables",
          "Community Hub content on the City's own website",
        ] as const,
      ]),
    );
    body += sec(
      "use",
      "People",
      "How people use it",
      feature_groups([
        [
          "Residents post events",
          "Anyone can post a public, non-commercial event with a short form. It usually reaches the screens and the web within hours.",
        ] as const,
        [
          "Neighbors appear in Community Voices",
          "Seven sections, such as Neighbors, Heritage and Next Generation, carry photos and words from people in Oberlin.",
        ] as const,
        [
          "Anyone can take over a screen",
          "A QR code poster next to each screen turns a phone into its remote.",
        ] as const,
        [
          "Principals post to their own school",
          "Each school's screens carry the principal's announcements alongside town-wide content.",
        ] as const,
      ]),
      { alt: true },
    );
    body += tquote("Janet Haar");
    body += sec(
      "eco",
      "Ecolympics",
      "Oberlin's buildings compete every year to cut electricity and water",
      `
<p>Four groups compete: the City Schools, community buildings, Oberlin College houses and College buildings. The biggest cut against each building's own baseline wins. The 2026 competition ran March 2 to 15, with community goals of 20,000 kWh and 15,000 gallons, up from 10,000 of each in 2025.</p>
<div class="ppl-pair">
<figure data-story-scene><img src="assets/ecolympics-2024-kwh.jpg" alt="Ecolympics 2024 slide: Oberlin met its community-wide electricity reduction goal and saved 10,050 kilowatt-hours"></figure>
<figure data-story-scene><img src="assets/ecolympics-2024-water.jpg" alt="Ecolympics 2024 slide: Oberlin City Schools achieved the greatest water reduction, saving 2,570 gallons"></figure>
</div>`,
    );
    body += sec(
      "journey",
      "Timeline",
      "Origin Story",
      timeline([
        [
          "2008",
          "Environmental Dashboard's Oberlin pilot begins, supported by the Great Lakes Protection Fund.",
        ] as const,
        [
          "2014 and 2015",
          "Prospect Elementary cuts electricity by more than 30% in both years' competitions, and water by 10% in 2015.",
        ] as const,
        [
          "By 2016",
          "Signs run in 11 city locations, including all four public schools the town had then.",
        ] as const,
        [
          "2024",
          "Ecolympics takes the theme Later Is Too Late: Efficiency, Electrification and Solarization. The community saves 10,050 kWh.",
        ] as const,
        [
          "2026",
          "Oberlin has 24 interactive signs, and Community Hub promotes the Climate Action Plan under a four year contract.",
        ] as const,
      ]),
      { intro: JOURNEY_NOTE.replace("{}", "the City of Oberlin"), alt: true },
    );
    body += sec(
      "live",
      "Live",
      "Oberlin's public dashboards",
      H.live_frame(
        LIVE["city"],
        "the City of Oberlin dashboard",
        "oberlin.communityhub.cloud",
        560,
        "The City's public dashboard. Explore city buildings and town-wide electricity and water.",
      ),
    );
    body += `<section class="sec-pad" style="padding-top:0"><div class="wrap">${next_story("midtown-cleveland", "MidTown Cleveland")}</div></section>`;
    body += H.cta_band(
      "Contact Us",
      "We welcome inquiries about our software applications and pricing options for organizations and whole communities.",
    );
    H.write_page(
      "city-of-oberlin",
      H.page(
        "city-of-oberlin",
        "City of Oberlin case study",
        "The City of Oberlin runs 24 interactive signs, a community calendar and a live Citywide Dashboard. Its 2024 Ecolympics saved 10,050 kWh.",
        body,
        { current: "city-of-oberlin" },
      ),
    );
  }
  // MidTown Cleveland case study
  function midtown_cleveland(): void {
    const media = H.postcard(
      "tile-midtown.jpg",
      "The Cleveland Citywide Dashboard with live air readings, part of the loop on MidTown's screens",
    );
    let body = case_hero(
      "midtown-cleveland",
      "icon-neighborhoods.png",
      "Case study, neighborhood",
      "MidTown Community Dashboard",
      "MidTown Community Dashboard is a communication platform designed to enhance connection and empower vibrant, sustainable and resilient neighborhoods. The goal of MidTown Dashboard is to make it easy for organizations and individuals to share information and celebrate community.",
      [
        ["Where", "MidTown, Cleveland, Ohio"] as const,
        ["Started", "2021, with partnerships and design"] as const,
        ["Locations", "10 by January 2026, still expanding"] as const,
        [
          "Runs",
          "Screens, a calendar and jobs board, Community Voices, stories and web embeds",
        ] as const,
      ],
      media,
    );
    const partners = [
      ["Dave's Market", "Pilot site"] as const,
      [
        "Fatima Family Center",
        "Community Voices interviews with staff and patrons",
      ] as const,
      ["Willson Tower (CMHA)", "Pilot site"] as const,
      ["MidTown, Inc.", "Pilot site"] as const,
      [
        "Learning to Grow Child Enrichment",
        "Community Voices interviews with parents",
      ] as const,
      ["ICHC Health Clinic", ""] as const,
      ["Asian Town Center", ""] as const,
      ["Hunger Network", "MidTown Market Pantry"] as const,
      ["Oriana House", ""] as const,
      ["Foundry Lofts", "Fitness center"] as const,
    ];
    const plist = partners
      .map(([n, d]) => `<li><b>${e(n)}</b>${d ? " " + e(d) : ""}</li>`)
      .join("");
    body += sec(
      "partners",
      "Partner sites",
      "Partner sites in MidTown",
      `
<h3 class="h3">Partner sites in MidTown</h3><p>These organizations are partner sites for the MidTown dashboard. The first four were the pilot sites from 2022 to 2024.</p>
<ul class="ppl-orgs">${plist}</ul>`,
      {
        alt: true,
        facts: [
          ["4", "pilot sites from 2022 to 2024"],
          ["10", "locations by January 2026, still expanding"],
        ],
      },
    );
    body += sec(
      "words",
      "In their words",
      "What partner sites say",
      [
        [
          "The MidTown Cleveland Dashboard above our checkout counter helps us to communicate that we are locally owned, locally operated and locally involved!",
          "Aaron Saltzman",
          "Co-owner, Dave's Market",
        ] as const,
        [
          "The two Dashboard screens in the entrance of the building keep residents up to date with cultural and career opportunities in the community and provide CMHA with a means of sharing important information",
          "LaKisha Vaughn",
          "Lead Asset Site Manager, Willson Tower",
        ] as const,
        [
          "The Dashboard display in our lobby helps us to welcome and engage Fatima visitors and allows us to share our offerings with the broader community",
          "Khaalise Makupson",
          "Assistant Director, Fatima Family Center at Catholic Charities",
        ] as const,
      ]
        .map(([q, w, r]) => H.quote(q, w, r).replace("data-story-scene", 'data-story-scene="all"'))
        .join(""),
    );
    body += sec(
      "installed",
      "Products",
      "Modes of information delivery",
      installed([
        [
          "digital-signage",
          "Screens at partner sites, each with a neighborhood loop and local content",
        ] as const,
        [
          "phone-app",
          "Scan the QR code at a screen to control it or keep reading on your phone",
        ] as const,
        [
          "community-calendar",
          "A MidTown calendar and jobs board, launched during the pilot",
        ] as const,
        [
          "community-voices",
          "Interviews with staff, patrons and parents at partner sites",
        ] as const,
        [
          "web-embeddables",
          "The calendar, jobs board and more on partners' own websites",
        ] as const,
      ]),
    );
    body += sec(
      "use",
      "People",
      "How a screen works",
      `
<p>When nobody's using the screen at Dave's Market, it cycles through three kinds of content: app content shared across the neighborhood (Community Voices, the Citywide Dashboard, the calendar and jobs board), the MidTown Story, and Dave's Market's own content, shown only on its screen.</p>
<p>Anyone can take over a screen from their phone: scan the QR code, choose content or take control, and watch it play. Tap More to keep reading on the phone.</p>
<p><a class="hand-link" href="neighborhoods.html"><svg class="hand-arrow" viewBox="0 0 70 44" aria-hidden="true"><path d="M4 8 C 18 34, 40 38, 62 26"/></svg>See the six levels a partner can take part at</a></p>`,
      { alt: true },
    );
    const orgs = [
      "Cleveland Metroparks",
      "Northeast Ohio Regional Sewer District",
      "Cleveland 2030 Districts",
      "Cleveland Clinic",
      "The Cleveland Foundation",
    ];
    body += sec(
      "cleveland",
      "Partners",
      "Cleveland organizations listed as partners",
      '<ul class="ppl-orgs"><li><a href="great-lakes-science-center.html">Great Lakes Science Center</a></li>' +
        orgs.map((o) => `<li>${o}</li>`).join("") +
        "</ul>",
    );
    body += sec(
      "journey",
      "Timeline",
      "Origin Story",
      timeline([
        [
          "2021",
          "The team develops partnerships and design concepts with MidTown organizations.",
        ] as const,
        [
          "2022 to 2024",
          "The pilot builds the first content, launches the calendar and jobs board, and runs a baseline assessment, at Dave's Market, the Fatima Family Center, Willson Tower and MidTown.",
        ] as const,
        [
          "2025 to 2027",
          "The dashboard reaches 10 locations by January 2026 and is still expanding, as partners embed the calendar and jobs board on their own websites.",
        ] as const,
      ]),
      { intro: JOURNEY_NOTE.replace("{}", "MidTown Cleveland"), alt: true },
    );
    body += sec(
      "live",
      "Live",
      "Cleveland's lake and air data, live from the Great Lakes Science Center",
      H.live_frame(
        LIVE["glsc"],
        "the Cleveland Environmental Dashboard",
        "cleveland.communityhub.cloud",
        560,
        "The museum's public dashboard, with data from its own sensors, Lake Erie and an EPA air station.",
      ),
    );
    body += `<section class="sec-pad" style="padding-top:0"><div class="wrap">${next_story("great-lakes-science-center", "Great Lakes Science Center")}</div></section>`;
    body += H.cta_band(
      "Contact Us",
      "We welcome inquiries about our software applications and pricing options for organizations and whole communities.",
    );
    H.write_page(
      "midtown-cleveland",
      H.page(
        "midtown-cleveland",
        "MidTown Cleveland case study",
        "MidTown Cleveland's neighborhood dashboard grew from 4 pilot sites to 10 locations by January 2026, with screens, a calendar, a jobs board and Community Voices.",
        body,
        { current: "midtown-cleveland" },
      ),
    );
  }
  // Great Lakes Science Center case study
  function great_lakes_science_center(): void {
    const media = H.postcard(
      "glsc-workshop.jpg",
      "Students and staff pose in front of a dashboard screen and a touch tablet at the Great Lakes Science Center",
    );
    let body = case_hero(
      "great-lakes-science-center",
      "icon-museums.png",
      "Case study, museum",
      "",
      "The Great Lakes Science Center is a science museum in Cleveland. Its Cleveland Environmental Dashboard combines the museum's own sensors, Lake Erie data from the USGS, and an EPA air quality station. Oberlin College environmental studies students worked on the Cleveland Foundation grant behind the exhibit.",
      [
        ["Where", "Cleveland, Ohio"] as const,
        [
          "Data",
          "Museum sensors, Lake Erie (USGS) and Cleveland air quality (EPA)",
        ] as const,
        ["Students", "Oberlin College environmental studies students"] as const,
        [
          "Public dashboard",
          `<a href="${LIVE["glsc"]}" target="_blank" rel="noopener">Cleveland Environmental Dashboard</a>`,
        ] as const,
      ],
      media,
    );
    body += sec(
      "dashboard",
      "The dashboard",
      "What feeds the Cleveland Environmental Dashboard",
      `
<h3 class="h3">What feeds the Cleveland Environmental Dashboard</h3>
<div class="ppl-sources">
<div style="--c:var(--leaf-deep);--c-tint:var(--leaf-tint)"><b>The museum's own sensors</b><span>Environmental monitoring equipment at the Great Lakes Science Center</span></div>
<div style="--c:var(--leaf-deep);--c-tint:var(--leaf-tint)"><b>Lake Erie</b><span>Lake data from the US Geological Survey</span></div>
<div style="--c:var(--leaf-deep);--c-tint:var(--leaf-tint)"><b>Cleveland's air</b><span>An EPA air quality monitoring station</span></div>
</div>
<p style="margin-top:16px">The dashboard is public, so the exhibit and the website show the same live data.</p>`,
      {
        alt: true,
        facts: [
          ["3", "live data sources in one public dashboard"],
          ["6.4", "trust score for museums, second only to friends and family at 6.6"],
        ],
      },
    );
    body += sec(
      "installed",
      "Products",
      "Modes of information delivery",
      installed([
        [
          "the-hub",
          "The Cleveland Environmental Dashboard, built from the three live sources",
        ] as const,
        [
          "data-dashboard#citywide",
          "A Citywide Dashboard drawn for Cleveland, on the exhibit screen",
        ] as const,
        [
          "digital-signage",
          "The exhibit screen, with a touch tablet on a stand beside it",
        ] as const,
        [
          "web-embeddables",
          "An embeddable version of the dashboard for websites",
        ] as const,
      ]),
    );
    body += sec(
      "use",
      "People",
      "How people use it",
      feature_groups([
        [
          "Students",
          "Oberlin College environmental studies students worked on the Cleveland Foundation grant behind the exhibit. In October 2019, students and staff held a workshop at the museum.",
        ] as const,
        [
          "Anyone online",
          "People can open Cleveland's lake and air data at home after a visit.",
        ] as const,
      ]),
      { alt: true },
    );
    body += tquote("Scott Volmer");
    body += sec(
      "journey",
      "Timeline",
      "Origin Story",
      timeline([
        [
          "October 2019",
          "Students and staff hold an Environmental Dashboard workshop at the Great Lakes Science Center.",
        ] as const,
        [
          "Today",
          "The Cleveland Environmental Dashboard is public online, and it's live further down this page.",
        ] as const,
      ]),
      { intro: JOURNEY_NOTE.replace("{}", "the Great Lakes Science Center") },
    );
    body += sec(
      "live",
      "Live",
      "The Cleveland Environmental Dashboard",
      H.live_frame(
        LIVE["glsc"],
        "the Cleveland Environmental Dashboard",
        "cleveland.communityhub.cloud",
        560,
        "",
      ),
      { alt: true },
    );
    body += `<section class="sec-pad" style="padding-top:0"><div class="wrap">${next_story("midtown-cleveland", "MidTown Cleveland")}</div></section>`;
    body += H.cta_band(
      "Contact Us",
      "We welcome inquiries about our software applications and pricing options for organizations and whole communities.",
    );
    H.write_page(
      "great-lakes-science-center",
      H.page(
        "great-lakes-science-center",
        "Great Lakes Science Center case study",
        "The Great Lakes Science Center in Cleveland runs a public exhibit and dashboard with live data from its own sensors, Lake Erie and a Cleveland air station.",
        body,
        { current: "great-lakes-science-center" },
      ),
    );
  }
  // Hamilton College pilot
  function hamilton_college(): void {
    const media = H.postcard(
      "tile-hamilton.jpg",
      "Generic campus illustration for the Hamilton College pilot",
    );
    const notice =
      '<p class="ppl-notice"><b>Pilot in progress.</b><span>Results aren\'t in yet, so this page covers the plan.</span></p>';
    let body = case_hero(
      "hamilton-college",
      "icon-campuses.png",
      "Case study, campus pilot",
      "The Built Environment as a Campus Laboratory",
      "The pilot puts Hamilton's building data on a campus dashboard, growing out of our January 2026 presentation to Hamilton.",
      [
        ["Status", "Pilot"] as const,
        ["Dates", "May 2026 to spring 2027"] as const,
        ["Data", "Hamilton's building data"] as const,
        ["Conference", "AASHE 2026, a joint proposal with Oberlin"] as const,
      ],
      media,
      notice,
    );
    body += sec(
      "buildings",
      "Why buildings",
      "Buildings and resource use",
      '<h3>National and global context</h3><p>The following benchmarks describe buildings across the United States and worldwide, not Hamilton College.</p>' + bars(
        [
          ["US electricity use", 67, "67%"] as const,
          ["US energy use", 37, "37%"] as const,
          ["US CO2 emissions", 35, "35%"] as const,
          ["US fresh water use", 12, "12%"] as const,
          ["Global CO2", 9, "9%"] as const,
        ],
        "Building shares of US resource use and emissions, with global CO2 shown separately",
      ) +
        '<p class="ppl-src">From our January 2026 presentation to Hamilton.</p>',
      {
        alt: true,
        facts: [
          ["67%", "of Hamilton's 2023 emissions came from heating buildings"],
          ["28%", "of Hamilton's 2023 emissions came from electricity"],
        ],
      },
    );
    body += sec(
      "pedagogy",
      "Architecture as Pedagogy",
      "The plan is to teach with the campus buildings",
      `
<p>The pilot builds on Architecture as Pedagogy (Orr, 1993). Its premise is that a campus's buildings are part of its education. The goal is to combine storytelling with real time feedback, so students learn from their own community.</p>
${H.postcard("cs-illo-ajlc.png", "The Adam Joseph Lewis Center at Oberlin College, drawn in the Citywide Dashboard illustration style", "An Oberlin example: the Adam Joseph Lewis Center at Oberlin College.")}`,
    );
    body += sec(
      "installed",
      "Products",
      "What the pilot uses",
      installed([
        ["the-hub", "Connected to Hamilton's building data."] as const,
        [
          "data-dashboard",
          "A campus dashboard for the pilot buildings",
        ] as const,
      ]),
      { alt: true },
    );
    body += sec(
      "use",
      "People",
      "How people will use it",
      `
<p>These are the teaching opportunities in the presentation to Hamilton. They're plans for now, not results.</p>
<div class="feat-list c2">
<div><h3>In class</h3><p>Environmental Studies, Data Science, Geology, Biology, Psychology, Computer Science and Public Health.</p></div>
<div><h3>In residential life</h3><p>The plan includes town-gown projects, C-Neutral stories like Oberlin's, and a sustainability trail, still in development.</p></div>
</div>
<p style="margin-top:16px"><a class="hand-link" href="oberlin-college.html"><svg class="hand-arrow" viewBox="0 0 70 44" aria-hidden="true"><path d="M4 8 C 18 34, 40 38, 62 26"/></svg>See how Oberlin College uses stories and orbs</a></p>`,
    );
    body += sec(
      "journey",
      "Timeline",
      "Origin Story",
      timeline([
        [
          "January 2026",
          "We present The Built Environment as a Campus Laboratory to Hamilton.",
        ] as const,
        [
          "March 2026",
          "A proposal sets the pilot's phases, from May 2026 to spring 2027.",
        ] as const,
        ["May 2026", "The pilot phase begins."] as const,
        [
          "2026",
          "Hamilton and Oberlin submit a joint proposal for AASHE 2026.",
        ] as const,
        ["Spring 2027", "The pilot phase ends."] as const,
      ]),
      { intro: JOURNEY_NOTE.replace("{}", "Hamilton College"), alt: true },
    );
    body += sec(
      "live",
      "Live",
      "Hamilton's dashboard isn't public yet",
      `
<p>To see a campus dashboard live now, open Oberlin College's.</p>
<p style="margin-top:12px"><a class="btn-ghost btn-ink" href="oberlin-college.html#live">See Oberlin College's live dashboard ${ARR}</a></p>`,
    );
    body += `<section class="sec-pad" style="padding-top:0"><div class="wrap">${next_story("oberlin-college", "Oberlin College")}</div></section>`;
    body += H.cta_band(
      "Contact Us",
      "We welcome inquiries about our software applications and pricing options for organizations and whole communities.",
    );
    H.write_page(
      "hamilton-college",
      H.page(
        "hamilton-college",
        "Hamilton College pilot",
        "Hamilton College's campus dashboard pilot runs from May 2026 to spring 2027. Heating buildings produced 67% of Hamilton's 2023 emissions.",
        body,
        { current: "hamilton-college" },
      ),
    );
  }
  // Public dashboard gallery
  function dashboards(): void {
    const tiles = [
      ["city-of-oberlin", LIVE.city, "City of Oberlin", "oberlin.communityhub.cloud"],
      ["oberlin-city-schools", LIVE.ops, "Oberlin City Schools", "oberlin.communityhub.cloud"],
      ["oberlin-college", LIVE.oc, "Oberlin College", "oberlin.communityhub.cloud"],
      ["great-lakes-science-center", LIVE.glsc, "Great Lakes Science Center", "cleveland.communityhub.cloud"],
    ] as const;
    const tabs = tiles.map(([key, , name], i) => `<button type="button" role="tab" id="demo-tab-${key}" data-dashboard-key="${key}" aria-controls="${key}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${name}</button>`).join("");
    const panels = tiles.map(([key, url, name, host], i) => `<div id="${key}" role="tabpanel" aria-labelledby="demo-tab-${key}" data-dashboard-panel="${key}"${i ? " hidden" : ""}>${H.live_frame(url, name, host, 720)
      .replace('<figure class="live-frame"', '<figure class="live-frame" data-fit-content')
      .replace('<div class="lf-body"', `<div class="lf-body" data-scroll-owner data-squirrel="Scroll down to explore" data-squirrel-short="Scroll down" tabindex="0" role="region" aria-label="${name} dashboard"`)}</div>`).join("");
    let body = `<section class="dashboard-gallery" id="gallery" aria-labelledby="dashboard-heading" data-dashboard-gallery><div class="wrap">
      <h1 class="h1" id="dashboard-heading">Dashboard demos</h1><p class="dashboard-intro">Explore a public dashboard or visit its partner page.</p>
      <div class="dashboard-tabs" role="tablist" aria-label="Choose a public dashboard">${tabs}</div>${panels}
      <p class="dashboard-other"><a href="#cwd">Citywide Dashboard</a><a href="#orbs">Orbs in the dorms</a></p>
    </div></section>`;
    body += sec(
      "cwd",
      "Live",
      "Citywide Dashboard",
      staged_citywide(),
      {
        intro:
          "Oberlin's Citywide Dashboard, fed every minute by the utility and water plants.",
      },
    );
    body += sec(
      "orbs",
      "Orbs",
      "Orbs",
      `<figure class="orbmap"><iframe data-defer-src="https://oberlin.communityhub.cloud/data-hub/orbs-gauge/slide/1069/chart-window/yesterday?orgId=2" title="Oberlin College electricity by building, yesterday's readings" loading="lazy"></iframe><figcaption>Oberlin College electricity by building. Measured readings from yesterday, replayed hour by hour. <a href="https://oberlin.communityhub.cloud/dh-public/ops/dashboard/1081?active-tab=Orb+Map+Visualization" target="_blank" rel="noopener noreferrer">Visit embedded version</a></figcaption></figure>`,
      {
        intro: "Each orb sits on a building and shows how much of a resource it is using, such as electricity or water.",
      },
    );
    body += H.cta_band();
    H.write_page(
      "dashboards",
      H.page(
        "dashboards",
        "Dashboard demos",
        "Every public Community Hub dashboard, loading live in one place: Oberlin, Oberlin City Schools, Oberlin College and the Great Lakes Science Center.",
        body,
        { current: "dashboards" },
      ),
    );
  }
  neighborhoods();
  cities();
  museums();
  campuses();
  schools();
  examples();
  oberlin_college();
  city_of_oberlin();
  midtown_cleveland();
  great_lakes_science_center();
  hamilton_college();
  dashboards();
}
