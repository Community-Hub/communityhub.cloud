import { originalStory } from "./original-story";
import { nativeStories } from "./meeting-embeds";
import { renderButton, renderField, renderStatus } from "../lib/ui";
/** Data Hub, Data Dashboard, Stories, and Pricing page renderers. */
import type { SiteContext } from "../lib/site";
import type { Pair, Triple } from "../lib/types";

export function register(H: SiteContext): void {
  const e = H.e;
  function opening(variant: "hub" | "dashboard" | "stories", ...args: Parameters<SiteContext["hero"]>): string {
    const hero = H.hero(...args);
    const shortScenes = variant === "hub" || variant === "dashboard";
    const copyClass = variant === "hub" ? "hub-intro-copy" : "detail-intro-copy";
    const mediaClass = variant === "hub" ? "hub-intro-evidence" : "detail-intro-evidence";
    const content = shortScenes
      ? hero.replace('<div class="wrap page-intro-grid"><div>', `<div class="wrap page-intro-grid"><div class="${copyClass}" data-story-scene="short-phone">`)
        .replace('<div class="page-intro-media">', `<div class="page-intro-media ${mediaClass}" data-story-scene="short-phone">`)
      : hero;
    return `<section class="content-opening product-opening product-opening--${variant}" aria-label="${e(args[2])}"><div class="opening-scene" data-story-scene="${shortScenes ? "desktop" : "all"}">${content}</div></section>`;
  }
  function feature_groups(items: readonly Pair[], cols = 2): string {
    if (items.length <= 2) return H.feat_list(items, cols);
    const groups: string[] = [];
    for (let i = 0; i < items.length; i += 2)
      groups.push(H.feat_list(items.slice(i, i + 2), cols).replace('<div class="feat-list', '<div data-story-scene class="feat-list'));
    return `<div class="feature-groups">${groups.join("")}</div>`;
  }
  function jump(items: readonly Pair[]): string {
    const links = items.map(([i, t]) => `<a href="#${i}">${t}</a>`).join("");
    return `<nav class="zpa-jump" aria-label="On this page" data-zpa-jump><div class="wrap">${links}</div></nav>`;
  }
  function sec(
    sid: string,
    _label: string,
    h2: string,
    inner: string,
    intro: string | null = null,
    _dark: boolean = false,
    alt: boolean = false,
  ): string {
    const cls = "" + (alt ? " zpa-alt" : "");
    const intro_html = intro
      ? `<p class="lede" style="margin-top:10px" data-reveal>${intro}</p>`
      : "";
    const scene = inner.includes('data-story-scene="all"') ? "" : ` data-story-scene="${inner.includes("data-story-scene") ? "desktop" : "all"}"`;
    const shortIntro = sid === "building" ? ' data-story-scene="short-phone"' : "";
    return `<section class="zpa-sec product-chapter${cls}" id="${sid}" aria-labelledby="${sid}-h"><div class="wrap chapter-scene"${scene}><header class="product-chapter-heading"${shortIntro}><h2 class="h2" id="${sid}-h" data-reveal>${h2}</h2>${intro_html}</header><div class="zpa-sec-body">${inner}</div></div></section>`;
  }
  function stats(items: readonly Pair[]): string {
    const cells = items
      .map(
        ([b, c]) => `<div class="zpa-stat"><b>${b}</b><span>${c}</span></div>`,
      )
      .join("");
    return `<div class="zpa-stats">${cells}</div>`;
  }
  function faq(items: readonly Pair[]): string {
    const qa = items
      .map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`)
      .join("");
    return `<div class="zpa-faq">${qa}</div>`;
  }
  function pair(
    img_a: string,
    alt_a: string,
    cap_a: string,
    img_b: string,
    alt_b: string,
    cap_b: string,
    first_copy = "",
  ): string {
    return `<div class="zpa-pair">${evidence_scene(img_a, alt_a, cap_a, first_copy)}${evidence_scene(img_b, alt_b, cap_b)}</div>`;
  }
  function evidence_scene(img: string, alt: string, caption: string, copy = ""): string {
    return `<article class="product-story-group dashboard-evidence-scene${copy ? "" : " dashboard-evidence-scene--image-only"}" data-story-scene="all"><figure class="dashboard-evidence-image"><img src="assets/${img}" alt="${e(alt)}" loading="lazy"><figcaption>${caption}</figcaption></figure>${copy ? `<div class="dashboard-evidence-copy">${copy}</div>` : ""}</article>`;
  }
  function staged_citywide(): string {
    return H.cwd_sign();
  }

  function trio(items: readonly Triple[], after = ""): string {
    const figs = items
      .map(
        ([img, alt, cap], index) =>
          `<figure data-story-scene><img src="assets/${img}" alt="${e(alt)}" loading="lazy"><figcaption>${cap}</figcaption>${index === items.length - 1 ? after : ""}</figure>`,
      )
      .join("");
    return `<div class="zpa-trio" data-reveal-group>${figs}</div>`;
  }
  function works_with(slugs: readonly string[]): string {
    return H.product_link_row(slugs);
  }
  function related(slugs: readonly string[], id = ""): string {
    return `<aside class="product-related"${id ? ` id="${id}"` : ""}><h3>Works well with</h3>${works_with(slugs)}</aside>`;
  }
  const STORY_TINTS: Record<string, string> = Object.fromEntries(
    (
      [
        "water",
        "climate",
        "energy",
        "heating",
        "transport",
        "materials",
        "land",
        "food",
        "ajlc",
      ] as const
    ).map((k) => [k, "var(--leaf-tint)"] as const),
  );
  const STORY_TOPICS = [
    ["heating", "Heating and cooling"] as const,
    ["energy", "Energy"] as const,
    ["water", "Water"] as const,
    ["climate", "Climate"] as const,
    ["transport", "Transportation"] as const,
    ["materials", "Materials"] as const,
    ["land", "Land"] as const,
    ["food", "Food"] as const,
    ["ajlc", "Adam Joseph Lewis Center"] as const,
  ];
  function the_hub(): void {
    const p = H.PBY["the-hub"];
    const sources = [
      [
        "icon-building.png",
        "Building automation systems",
        "Modern building automation systems use or can be equipped with a device known as a JACE that stores all metered data. Additional metering can be added and the JACE configured to automatically transfers real-time data gathered by that system to CHub.",
      ] as const,
      [
        "icon-cities.png",
        "SCADA systems",
        "SCADA systems used by public utilities and manufacturing sites",
      ] as const,
      [
        "icon-electricity.png",
        "Obvius dataloggers",
        "Obvius brand dataloggers",
      ] as const,
      ["icon-air.png", "AirNow", "EPA air quality monitoring stations through AirNow"] as const,
      [
        "icon-water.png",
        "GLOS and USGS",
        "water quality monitoring stations such as GLOS bouys and USGS stations",
      ] as const,
      [
        "icon-datahub.png",
        "Any CSV export",
        "any other device that can be automated to export .CSV files.",
      ] as const,
    ];
    const src_html = [sources.slice(0, 3), sources.slice(3)].map((group, i) =>
      `<div class="source-group" data-story-scene><ul class="zpa-src">${group.map(([ic, n, d]) =>
        `<li><img src="assets/${ic}" alt=""><span><b>${n}</b><span>${d}</span></span></li>`).join("")}</ul>${i === 1 ? "<p>A simple equation editor window allows users to easily create derived variables from those that are acquired. For example new variables representing greenhouse gas emissions can be created associated with electricity, gas and water use and then added together to express total greenhouse gas emissions for a given monitored entity.</p>" : ""}</div>`,
    ).join("");
    const manager = sec(
      "manager",
      "Data Manager",
      "Data Manager",
      `<div class="source-groups manager-sources" data-story-scene="desktop">${src_html}</div>`,
      "The data manager provides the tools for capturing and configuring real-time data from a wide variety of sources that include building automation systems, SCADA systems, independent datalogging devices and data that are publically accessible from weather stations and air and water quality monitoring stations.",
    );
    const viz = `<div class="hub-reading-guide">${feature_groups([
      [
        "Time series",
        "View resource use data over a selected period of time. Display multiple variables on one time series graph to see how they compare. Choose from week, weekend, month, or year view. Customize a unique time window by setting a start and end date. View today’s data trends as well as yesterdays on the same time axis to compare and contrast resource use patterns.",
      ] as const,
      [
        "Line Graph, Heat Map, Load Profile",
        "Choose which variable(s) you wish to graph.",
      ] as const,
      [
        "Gauges",
        "Share collected data via simple and interpretable visual indicators. CommunityHub offers various animated gauges that can stand alone or supplement other data visualizations. <span>Needle Gauge · Odometer Gauge · Empathetic Character</span>",
      ] as const,
      [
        "Group comparison",
        "Compare conditions among (and within) monitored points over a specific time period. Each building is represented by a box. The size and color of the box corresponds with the building’s magnitude of resource use in comparison to others within the set.",
      ] as const,
    ])}</div>`;
    const gallery = H.story_player(
      [
        [
          "h66.jpg",
          "Box and color in Data Visualizer, for Kahn, an Oberlin College residence hall. Box size compares total electricity use across floors, and color compares current use with typical use.",
        ] as const,
        [
          "h67.jpg",
          "A Data Visualizer time series for Kahn's electricity, with Flash reacting to the reading.",
        ] as const,
        [
          "h68.jpg",
          "A Data Visualizer time series for Kahn's water use, with Wally reacting to the reading.",
        ] as const,
        [
          "h70.jpg",
          "Kahn · Whole Building Water · Heatmap Analysis · Last 60 Days",
        ] as const,
      ],
      "Oberlin College dashboard screens, from Data Visualizer",
      "deck/",
      true,
    );
    let body = opening(
      "hub",
      H.crumbs([null, p["group"]] as const, [null, p["name"]] as const),
      p["group"],
      p["name"],
      p["desc"],
      `<div class="opening-gallery hub-evidence-gallery">${gallery}<p class="product-caption">Oberlin College dashboard screens.</p></div>`,
      `<a class="btn-ink btn-ghost btn-big" href="#visualizer">Explore chart types</a>`,
    );
    body += jump([
      ["visualizer", "Data Visualizer"] as const,
      ["manager", "Data Manager"] as const,
      ["creator", "Dashboard Builder"] as const,
      ["live", "Live"] as const,
    ]);
    body += sec(
      "visualizer",
      "Data Visualizer",
      "Data Visualizer / Explorer",
      viz,
      undefined,
      undefined,
      true,
    );
    body += manager;
    body += originalStory("manager-platform", "How the Dashboard Platform Works");
    body += sec(
      "creator",
      "Dashboard Builder",
      "Assemble, interpret, and share unique data stories",
      '<div class="hub-builder-context" data-story-scene="short-phone"><p>Choose from various data visualizations to tell the story of a building, community, environment, and more</p></div>' +
        H.quote(
          "For a decade we have looked to the CommunityHub team as key partners in translating our energy conservation services into community engagement",
          "Geoff Hunter",
          "President Palmer Conservation Consulting",
          "hub-builder-evidence",
        ),
    );
    const lib_url =
      "https://oberlin.communityhub.cloud/dh-public/city-of-oberlin?active-page=exploreData&active-data-dashboard=1001";
    body += sec(
      "live",
      "Live",
      "Building Dashboard",
      `<div class="hub-live-scene" data-story-scene="all">${H.live_frame(
        lib_url,
        "the Oberlin Public Library's data",
        "oberlin.communityhub.cloud",
        680,
        "Data Hub's own public Explore Data page for the City of Oberlin, loaded live. Pick the library to see its readings.",
      )}${related(["data-dashboard"])}</div>`,
    );
    body += H.cta_band("Contact Us", "");
    H.write_page(
      "the-hub",
      H.page(
        "the-hub",
        p["name"],
        p["desc"],
        body,
        { current: "the-hub", jsonld: H.sw_ld(p) },
      ),
    );
  }
  function data_dashboard(): void {
    const p = H.PBY["data-dashboard"];
    let body = jump([
      ["building", "Buildings"] as const,
      ["citywide", "Citywide"] as const,
      ["orbs", "Live map"] as const,
      ["eco", "Ecolympics"] as const,
      ["heat", "During a competition"] as const,
      ["sources", "Where readings come from"] as const,
    ]);
    const oc_url =
      "https://oberlin.communityhub.cloud/dh-public/oc-embed?active-page=exploreData&active-data-dashboard=815";
    body += sec(
      "building",
      "Buildings",
      H.PBY["building-dashboard"].name,
      `<div class="building-live-scene" data-story-scene="all">${H.live_frame(
        oc_url,
        "an Oberlin College residence hall dashboard",
        "oberlin.communityhub.cloud",
        680,
      )}</div>`,
      H.PBY["building-dashboard"].desc,
    );
    body += sec(
      "citywide",
      "Citywide",
      H.PBY["citywide-dashboard"].name,
      `<div class="citywide-product-layout" data-story-scene="all"><div class="citywide-product-copy"><p>${H.PBY["citywide-dashboard"].desc}</p></div><div class="citywide-product-live">${staged_citywide()}</div></div>`,
      undefined,
      undefined,
      true,
    );
    // This viewer replays measured electricity readings; Cleveland remains a labelled demo.
    const OC_ORBS =
      "https://oberlin.communityhub.cloud/dh-public/ops/dashboard/1081?active-tab=Orb+Map+Visualization";
    const orb_intro = "Each orb sits on a building and shows how much of a resource it is using, such as electricity or water.";
    const orb_maps = `<div class="orb-scenes" data-chapter-scenes><article class="orb-product-scene" data-story-scene="all"><div class="orb-context-copy"><h3>Oberlin College electricity</h3><p>${orb_intro}</p></div><figure class="orbmap"><iframe data-defer-src="https://oberlin.communityhub.cloud/data-hub/orbs-gauge/slide/1069/chart-window/yesterday?orgId=2" title="Oberlin College electricity by building, yesterday's readings" loading="lazy"></iframe><figcaption>Yesterday’s electricity, replayed hour by hour. <a href="${OC_ORBS}" target="_blank" rel="noopener">Open full map</a> · <a href="https://environmentaldashboard.org/orbs" target="_blank" rel="noopener">About the orbs</a></figcaption></figure></article><article class="orb-product-scene orb-product-scene--cleveland" data-story-scene="all"><p class="orb-scene-label h2" aria-hidden="true">Orbs</p><div class="orb-context-copy"><h3>Cleveland air quality</h3><p>${orb_intro} Here each orb shows the air quality at a spot in Cleveland. This demo runs on simulated readings.</p></div><figure class="orbmap"><iframe data-defer-src="https://community-hub-studios.vercel.app/viewer.html?map=cleveland&embed=1" title="Air quality in Cleveland, simulated readings" loading="lazy"></iframe><figcaption><a href="https://community-hub-studios.vercel.app/viewer.html?map=cleveland" target="_blank" rel="noopener">Open the demo full size</a></figcaption></figure></article></div>`;
    body += sec("orbs", "Orbs", "Orbs", orb_maps, undefined, undefined, true);
    // Both Ecolympics 2024 results side by side in one scene, each labelled with who saved what.
    const eco_cards = [
      ["ecolympics-2024-kwh.jpg", "Ecolympics 2024 slide: Oberlin met its community-wide electricity reduction goal and saved 10,050 kilowatt-hours", "Whole community · electricity", "10,050 kWh saved community-wide, meeting the 10,000 kWh goal"],
      ["ecolympics-2024-water.jpg", "Ecolympics 2024 slide: Oberlin City Schools achieved the greatest water reduction, saving 2,570 gallons", "Oberlin City Schools · water", "2,570 gallons saved, the biggest water cut of any group"],
    ].map(([img, alt, label, note]) => `<figure class="eco-card"><h3 class="eco-label">${label}</h3><img src="assets/${img}" alt="${e(alt)}" width="960" height="540" loading="lazy"><figcaption>${note}</figcaption></figure>`).join("");
    const eco = `<div class="eco-pair">${eco_cards}</div>`;
    body += sec(
      "eco",
      "Ecolympics",
      "Oberlin Ecolympics 2024",
      eco,
      "Ecolympics runs at the City Schools, community buildings and Oberlin College, with the biggest percentage cut against each building's own baseline winning.",
      undefined,
      true,
    );
    const heat = pair(
      "evidence/prospect-competition-heatmap.jpg",
      "Historical Prospect Elementary heat map showing before, during and after an Ecolympics competition",
      "Prospect Elementary: before, during and after Ecolympics",
      "evidence/oberlin-dorm-competition-2006-2009.jpg",
      "Oberlin dorm electricity chart for the 2006–07, 2007–08 and 2008–09 academic years",
      "Oberlin College dorm electricity, 2006–2009",
      stats([
        ["31%", "less electricity at the winning Oberlin school during Ecolympics"],
        ["30%+", "less electricity at Prospect Elementary, in both 2014 and 2015"],
      ]),
    );
    body += sec(
      "heat",
      "During a competition",
      "Building Dashboards",
      heat,
      "A heat map from Prospect Elementary and a results chart from the Oberlin College dorms, both during Ecolympics.",
    );
    const sources_html =
      '<ul class="zpa-src"><li><img class="src-scene" src="assets/cwd-scene-energy.png" alt="" width="88" height="88" loading="lazy"><span><b>Oberlin Municipal Light and Power</b><span>Whole-city electricity. The community-owned utility was founded in 1934.</span></span></li><li><img class="src-scene" src="assets/cwd-scene-tower.png" alt="" width="88" height="88" loading="lazy"><span><b>Drinking water plant</b><span>Water comes from the West Branch of the Black River and is stored in the Parsons Rd reservoir, which holds 450 million gallons when full.</span></span></li><li><img class="src-scene" src="assets/cwd-scene-water.png" alt="" width="88" height="88" loading="lazy"><span><b>Wastewater plant</b><span>Treated water flows into Plum Creek, whose watershed covers 12.4 square miles and is 60% farmland.</span></span></li><li><img class="src-scene" src="assets/cwd-scene-weather.png" alt="" width="88" height="88" loading="lazy"><span><b>Weather and air</b><span>Air temperature and air quality, read through the day.</span></span></li></ul>';
    body += sec(
      "sources",
      "Where readings come from",
      "Where Citywide readings come from",
      `<div class="source-groups">${[0, 2].map((offset, i) => `<div class="source-group" data-story-scene><ul class="zpa-src">${(sources_html.match(/<li>[\s\S]*?<\/li>/g) ?? []).slice(offset, offset + 2).join("")}</ul>${i === 1 ? related(["the-hub", "digital-signage", "web-embeddables"], "more") : ""}</div>`).join("")}</div>`,
      "Oberlin's Citywide Dashboard combines data from the city's own utility, its water system and local weather and air monitoring.",
    );
    body = body.replace('<h2 class="h2" id="building-h"', '<h1 class="h2" id="building-h"').replace(/(id="building-h"[^>]*>[^<]*)<\/h2>/, "$1</h1>");
    body += H.cta_band("Contact Us", "");
    H.write_page(
      "data-dashboard",
      H.page(
        "data-dashboard",
        p["name"],
        p["desc"],
        body,
        { current: "data-dashboard", jsonld: H.sw_ld(p) },
      ),
    );
  }
  function stories(): void {
    const p = H.PBY["stories"];
    let body = "";
    body += jump([
      ["play", "Try a story"] as const,
      ["topics", "Nine topics"] as const,
      ["exhibit", "The Science Center"] as const,
      ["trail", "The trail"] as const,
    ]);
    const tiles = STORY_TOPICS.map(
      ([k, name]) =>
        `<div class="zpa-topic" style="--c-tint:${STORY_TINTS[k]}"><img src="assets/story-ic-${k}.png" alt=""><b>${name}</b></div>`,
    );
    const topic_groups = [0, 3, 6].map(offset => `<div class="story-topic-group">${tiles.slice(offset, offset + 3).join("")}</div>`).join("");
    const topics = sec(
      "topics",
      "Nine topics",
      "Nine stories, from Oberlin College's Sustainable Infrastructure Program",
      `<div class="zpa-topics topic-groups" data-reveal-group>${topic_groups}</div>`,
      undefined,
    );
    const gallery = nativeStories();
    body += `<section class="stories-opening" id="play" aria-labelledby="stories-h"><div class="wrap" data-story-scene="all"><h1 class="h1" id="stories-h">Stories</h1><p class="lede">Illustrated stories explain how local systems work. They play on screens, phones and the web.</p>${gallery}</div></section>`;
    body += topics;
    body += sec(
      "energy",
      "The energy system",
      "The campus energy system",
      '<img src="assets/art-geothermal-band.jpg" alt="Illustration of Oberlin College\'s district energy system: campus buildings, the central plant, solar panels and geothermal wells" style="width:100%;border-radius:20px" loading="lazy"><p class="energy-note" style="margin-top:14px;color:var(--ink-2);max-width:64ch">We use the heating and cooling story to explain this system: the campus, the central plant, and the geothermal wells that replaced its coal boiler.</p>',
    );
    const exhibit = trio([
      [
        "deck/h51c.jpg",
        "The C-Neutral exhibit taking shape at Oberlin College's Science Center",
        "The exhibit taking shape",
      ] as const,
      [
        "deck/h52c.jpg",
        "The finished exhibit case, with a kiosk menu of the nine Carbon Neutral Stories",
        "The exhibit case",
      ] as const,
      [
        "carbon-neutral-science-center-original.jpeg",
        "Three people at the Carbon Neutral Stories exhibit in Oberlin College’s Science Center",
        "Carbon Neutral Stories at the Science Center",
      ] as const,
    ]).replaceAll(" data-story-scene", "") + '<p class="exhibit-context" style="margin-top:24px;max-width:80ch">At Oberlin College\'s Science Center, a model of the geothermal system uses LEDs, run by ESP32 boards, to show heat moving through the wells and pipes. Oberlin students built it with Community Hub in summer 2026. People scan a QR code on the model to open the story on their phone.</p>';
    body += sec(
      "exhibit",
      "The Science Center",
      "The Science Center exhibit",
      exhibit,
      undefined,
      undefined,
      true,
    );
    const notice =
      '<div class="zpa-notice"><img src="assets/icon-remote.png" alt="" width="28" height="28"><span><b>In development</b>QR codes placed around town, for example at the Oberlin Bike Co-op or the geothermal field. Scanning one opens the matching chapter of a story, with live data where it applies, as a self-guided tour by topic such as transportation or energy.</span></div>';
    body += sec(
      "trail",
      "The trail",
      "Sustainability trail",
      notice + related(["data-dashboard", "phone-app", "digital-signage"]),
    );
    body += H.cta_band("Contact Us", "");
    H.write_page(
      "stories",
      H.page(
        "stories",
        p["name"],
        p["desc"],
        body,
        { current: "stories", jsonld: H.sw_ld(p) },
      ),
    );
  }
  function pricing(): void {
    let body = H.hero(
      H.crumbs([null, "Pricing"] as const),
      "Pricing",
      "Packages and pricing",
      "Community Hub is cloud-hosted, with an annual fee. Pricing depends on what you connect and how many screens you run. Request a quote below.",
      "",
      '<a class="btn-ink" href="#quote">Request a quote</a>',
    );
    body += jump([
      ["bundles", "Bundles"] as const,
      ["services", "Design services"] as const,
      ["factors", "What changes the price"] as const,
      ["quote", "Request a quote"] as const,
    ]);
    const bundles = [
      [
        "Communications Bundle",
        "Digital Signage software, the Community Calendar, Community Voices and Story Maker. Story Maker is in development.",
        "var(--sky-2)",
      ] as const,
      [
        "Data Bundle",
        "Data Manager and Data Visualizer.",
        "var(--leaf-tint)",
      ] as const,
      [
        "Pro Bundle",
        "Both the Communications Bundle and the Data Bundle.",
        "var(--amber-tint)",
      ] as const,
    ];
    const bh = bundles
      .map(
        ([n, d, c], i) =>
          `<article class="zpa-bundle" style="background:${c}" data-story-scene><img class="product-bundle-icon" src="assets/${["icon-signage.png", "icon-datahub.png", "icon-cwd.png"][i]}" alt="" width="44" height="44"><h3>${n}</h3><p>${d}</p><div class="price">Pricing on request</div></article>`,
      )
      .join("");
    body += sec(
      "bundles",
      "Bundles",
      "Three bundles, cloud-hosted with an annual fee",
      `<div class="zpa-bundles">${bh}</div>`,
    );
    const services = feature_groups([
      [
        "Data design services",
        "Data system design and data integration.",
      ] as const,
      [
        "Graphic design services",
        "Custom illustration of your campus or town, like Oberlin's Citywide Dashboard. Stories that explain local systems. Posters, QR signage and outreach material.",
      ] as const,
    ]);
    const factors =
      '<ul class="zpa-factors"><li><b>Monitoring points</b><span>How many buildings and meters you want to show.</span></li><li><b>Data sources</b><span>Utility feeds, data loggers, building automation systems or new sensors.</span></li><li><b>Screens</b><span>How many signs, and whether you need help with the hardware.</span></li><li><b>Teaching support</b><span>How much curriculum help and training your teachers want.</span></li><li><b>Community Voices</b><span>Whether your team gathers the content, or you want help doing it.</span></li></ul>';
    body += sec(
      "services",
      "Design services",
      "Two services beyond the software itself",
      `<div class="product-pricing-scope"><div data-story-scene>${services}</div><div id="factors" data-story-scene aria-labelledby="factors-h"><h3 id="factors-h">Five things we ask about before we quote</h3>${factors}</div></div>`,
      undefined,
      undefined,
      true,
    );
    const form = `<div class="zpa-form-wrap"><form id="quote-form" class="zpa-form" novalidate>
      ${renderField({ id: 'quote-name', name: 'name', label: 'Your name', autocomplete: 'name', required: true, maxLength: 120 })}
      ${renderField({ id: 'quote-org', name: 'org', label: 'Organization', autocomplete: 'organization', required: true, maxLength: 160 })}
      ${renderField({ id: 'quote-need', name: 'need', label: 'What you are pricing', kind: 'select', options: ['Communications Bundle', 'Data Bundle', 'Pro Bundle', 'Data design services', 'Graphic design services', 'Not sure yet'].map(label => ({ label, value: label })) })}
      ${renderField({ id: 'quote-msg', name: 'msg', label: 'Buildings, meters and screens', kind: 'textarea', rows: 4, placeholder: 'How many buildings, meters and screens you have in mind', maxLength: 3000 })}
      ${renderButton({ type: 'submit', label: 'Prepare my email', disabled: true })}
      ${renderStatus({ id: 'quote-out', className: 'zpa-out' })}
      <div class="ui-email-recovery" data-email-recovery></div>
      <noscript><p>To prepare an email, enable JavaScript or <a href="mailto:connect@communityhub.cloud">email connect@communityhub.cloud directly</a>.</p></noscript>
      <p class="zpa-note">This opens your email app with the message filled in, addressed to connect@communityhub.cloud.</p>
    </form><p style="margin-top:8px">Or email <a class="hand-link" href="mailto:connect@communityhub.cloud">connect@communityhub.cloud<svg class="hand-arrow" viewBox="0 0 70 44" aria-hidden="true"><path d="M4 8 C 18 34, 40 38, 62 26"/></svg></a> directly.</p></div>`;
    body += sec(
      "quote",
      "Request a quote",
      "Tell us what you are pricing",
      form,
      undefined,
      undefined,
      true,
    );
    body += sec(
      "faq",
      "Questions",
      "Common questions",
      faq([
        [
          "Do we need to buy new meters?",
          "Community Hub reads utility meters, data loggers and building automation systems. Tell us what you already have and we'll tell you what, if anything, you'd need to add.",
        ] as const,
        [
          "Do you provide the screens?",
          "Screen setup depends on the site. Tell us what's already in the room and we'll help you take it from there.",
        ] as const,
        [
          "Can we start small?",
          "Yes. Hamilton College started with a campus pilot in May 2026.",
        ] as const,
        [
          "Can you help us find funding?",
          "Environmental Dashboard work has been funded by the U.S. EPA, the Great Lakes Protection Fund, the Cleveland Foundation and, through the Great Lakes Colleges Association, the Andrew W. Mellon Foundation. We're glad to talk through funding sources with you.",
        ] as const,
      ]),
    );
    body += H.cta_band(
      "Tell us what you want to connect",
      "A short call is enough for a first quote.",
    );
    H.write_page(
      "pricing",
      H.page(
        "pricing",
        "Pricing",
        "Communications Bundle, Data Bundle and Pro Bundle, plus data design and graphic design services. Cloud-hosted, with an annual fee. Request a quote.",
        body,
        { current: "pricing" },
      ),
    );
  }
  the_hub();
  data_dashboard();
  stories();
  pricing();
}
