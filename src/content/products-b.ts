import { phoneDemo, nativeStories, nativeVoices } from "./meeting-embeds";
/** Calendar, Community Voices, Digital Signage, Phone App, and Web Embeddables. */
import type { SiteContext } from "../lib/site";
import type { Pair, Triple } from "../lib/types";

type PartnerExample = readonly [
  image: string,
  alt: string,
  label: string,
  title: string,
  description: string,
  url: string,
  cta: string,
  host: string,
];

export function register(H: SiteContext): void {
  const e = H.e;
  const ARR = H.ARR;
  function opening(...args: Parameters<SiteContext["hero"]>): string {
    const shortScenes = [H.PBY["community-calendar"].name, H.PBY["community-voices"].name].includes(args[2]);
    const hero = H.hero(...args);
    const content = shortScenes
      ? hero.replace('<div class="wrap page-intro-grid"><div>', '<div class="wrap page-intro-grid"><div class="detail-intro-copy" data-story-scene="short-phone">')
        .replace('<div class="page-intro-media">', '<div class="page-intro-media detail-intro-evidence" data-story-scene="short-phone">')
      : hero;
    return `<section class="content-opening product-opening" aria-label="${e(args[2])}"><div class="opening-scene" data-story-scene="${shortScenes ? "desktop" : "all"}">${content}</div></section>`;
  }
  function feature_groups(items: readonly Pair[], cols = 2): string {
    if (items.length <= 2) return H.feat_list(items, cols);
    const groups: string[] = [];
    for (let i = 0; i < items.length; i += 2)
      groups.push(H.feat_list(items.slice(i, i + 2), cols).replace('<div class="feat-list', '<div data-story-scene class="feat-list'));
    return `<div class="feature-groups">${groups.join("")}</div>`;
  }
  function place_cards(items: readonly (readonly [string, string, string, string])[]): string {
    return `<div class="place-cards">${items.map(([img, alt, t, d]) =>
      `<figure class="place-card"><img src="assets/${img}" alt="${alt}" loading="lazy"><figcaption><h3>${t}</h3><p>${d}</p></figcaption></figure>`).join("")}</div>`;
  }
  function jump(items: readonly Pair[]): string {
    const links = items.map(([i, t]) => `<a href="#${i}">${t}</a>`).join("");
    return `<nav class="zpb-jump" aria-label="On this page" data-zpb-jump><div class="wrap">${links}</div></nav>`;
  }
  function sec(
    sid: string,
    _label: string,
    h2: string,
    inner: string,
    intro: string | null = null,
    _dark: boolean = false,
    alt: boolean = false,
    opening_controls: string = "",
  ): string {
    const cls = "" + (alt ? " zpb-alt" : "");
    const intro_html = intro
      ? `<p class="lede" style="margin-top:10px" data-reveal>${intro}</p>`
      : "";
    const scene = inner.includes('data-story-scene="all"') || inner.includes("data-chapter-scenes") ? "" : ` data-story-scene="${inner.includes("data-story-scene") ? "desktop" : "all"}"`;
    const shortIntro = sid === "try" && inner.includes("zpb-emb-demo--focused") ? ' data-story-scene="short-phone"' : '';
    const heading = `<header class="product-chapter-heading"${shortIntro}><h2 class="h2" id="${sid}-h" data-reveal>${h2}</h2>${intro_html}</header>`;
    const introduction = opening_controls ? `<div class="voice-wall-intro" data-story-scene="short-phone">${heading}${opening_controls}</div>` : heading;
    return `<section class="zpb-sec product-chapter${cls}" id="${sid}" aria-labelledby="${sid}-h"><div class="wrap chapter-scene"${scene}>${introduction}<div class="zpb-sec-body">${inner}</div></div></section>`;
  }
  function src_list(items: readonly Triple[], after = ""): string {
    const groups: string[] = [];
    for (let i = 0; i < items.length; i += 3)
      groups.push(`<div class="source-group" data-story-scene><ul class="zpb-src">${items.slice(i, i + 3).map(([ic, t, d]) =>
        `<li><img src="assets/${ic}" alt="" width="34" height="34"><span><b>${t}</b><span>${d}</span></span></li>`).join("")}</ul>${i + 3 >= items.length ? after : ""}</div>`);
    return `<div class="source-groups">${groups.join("")}</div>`;
  }
  function related(slugs: readonly string[]): string {
    const items = slugs
      .map(
        (s) =>
          `<a href="${s}.html">${H.picon(H.PBY[s])}<span>${H.PBY[s]["name"]}</span></a>`,
      )
      .join("");
    return `<div class="zpb-related">${items}</div>`;
  }
  function related_group(title: string, slugs: readonly string[]): string {
    return `<aside class="product-related" id="related" aria-labelledby="related-h"><h3 id="related-h">${title}</h3>${related(slugs)}</aside>`;
  }
  function stepper(
    steps: readonly Pair[],
    media_img: string | null = null,
    media_alt: string = "",
    step_ms: number = 4200,
    aria_label: string = "",
    media_html: string = "",
  ): string {
    const li = steps
      .map(
        ([t, d], i) =>
          `<li class="zpb-step"><span class="zpb-step-n">${i + 1}</span><span><h3>${t}</h3><p>${d}</p><span class="zpb-step-bar"><i></i></span></span></li>`,
      )
      .join("");
    const list_html = `<ol class="zpb-steps" data-story-scene>${li}</ol>`;
    if (media_html) {
      const media = `<figure class="zpb-stepper-media is-live" style="margin:0" data-story-scene>${media_html}</figure>`;
      return `<div class="zpb-stepper" data-zpb-stepper data-zpb-step-ms="${step_ms}" aria-label="${e(aria_label)}">${list_html}${media}</div>`;
    }
    if (media_img) {
      const media = `<figure class="zpb-stepper-media has-caption" style="margin:0" data-story-scene><img src="assets/${media_img}" alt="${e(media_alt)}" loading="lazy"><figcaption>${e(media_alt)}</figcaption></figure>`;
      // Text first, image second: text left, image right on desktop, copy before image when stacked.
      return `<div class="zpb-stepper" data-zpb-stepper data-zpb-step-ms="${step_ms}" aria-label="${e(aria_label)}">${list_html + media}</div>`;
    }
    return `<div class="zpb-stepper" data-zpb-stepper data-zpb-step-ms="${step_ms}" aria-label="${e(aria_label)}" style="display:block">${list_html}</div>`;
  }
  function trio(items: readonly PartnerExample[]): string {
    const figs = items
      .map(
        ([img, alt, k, t, d, u, cta, _host]) =>
          `<a href="${u}" target="_blank" rel="noopener" data-story-scene><figure><img src="assets/${img}" alt="${e(alt)}" loading="lazy"></figure><figcaption><p class="fig">${k}</p><h3>${t}</h3><p>${d}</p><span class="go">${cta} ${ARR}</span></figcaption></a>`,
      )
      .join("");
    return `<div class="zpb-trio" data-reveal-group>${figs}</div>`;
  }
  function slugify(s: string): string {
    return s.toLowerCase().replaceAll(" ", "-");
  }
  function community_calendar(): void {
    const p = H.PBY["community-calendar"];
    const media = H.live_frame("https://cleveland.communityhub.cloud/calendar/?embed=1&show-menu-bar=1", "Cleveland Community Calendar", "cleveland.communityhub.cloud", 440);
    let body = opening(
      H.crumbs([null, p["group"]] as const, [null, p["name"]] as const),
      p["group"],
      p["name"],
      p["desc"],
      media,
      `<a class="btn-ink btn-ghost btn-big" href="#live">See this week’s events</a>`,
    );
    body += jump([
      ["live", "This week"] as const,
      ["features", "What it does"] as const,
      ["kinds", "What people post"] as const,
      ["modes", "How people see it"] as const,
      ["related", "Works well with"] as const,
    ]);
    const features = feature_groups([
      [
        "Anyone can post",
        "Local organizations and businesses can promote volunteer opportunities. City officials can post pertinent announcements. Educators and administrators can share school specific content. Local artists can announce upcoming concerts, workshops, or exhibits",
      ] as const,
      [
        "Customize viewable content.",
        "Filter by event, announcement, or volunteer opportunities, type, location, or sponsor.",
      ] as const,
      [
        "Various display modes.",
        "Explore events in list or calendar view via our customizable web-embeddable or phone app",
      ] as const,
      [
        "Web Embeddable",
        "Educators, business owners, city managers can embed community calendar into their organizations' existing websites.",
      ] as const,
      [
        "Weekly Newsletter",
        "Subscribe to a weekly newsletter that consolidates and shares upcoming events.",
      ] as const,
      [
        "Target specific organizations and audiences",
        "Content can be targetted towards specific groups.",
      ] as const,
    ]);
    const feature_section = sec(
      "features",
      "Calendar and Jobs Board",
      "Community engagement is community building.",
      features,
      "",
    );
    body += sec(
      "live",
      "Live",
      "Community Calendar, Events & Job Board",
      `<div class="product-calendar-events">${H.events_block(undefined, undefined, 6).replace(/<h2 class="h2">[\s\S]*?<\/h2>/, "")}</div><p class="cal-open"><a class="hand-link" href="https://environmentaldashboard.org/calendar/" target="_blank" rel="noopener">Open Oberlin’s calendar</a><a class="hand-link" href="https://cleveland.communityhub.cloud/calendar/" target="_blank" rel="noopener">Open Cleveland’s calendar</a><a class="hand-link" href="https://cleveland.communityhub.cloud/calendar/jobs?show-menu-bar=1" target="_blank" rel="noopener">Open Cleveland’s Jobs Board</a></p>`,
      undefined,
      undefined,
      true,
    );
    body += feature_section;
    const kinds = [
      ["dance", "Dance"], ["music", "Music"], ["festivals", "Festivals and fairs"], ["films", "Films"],
      ["exhibits", "Exhibits"], ["tours", "Tours"], ["workshops", "Workshops"], ["presentations", "Presentations"],
      ["games", "Games"], ["sports", "Sports"], ["volunteering", "Volunteering"], ["government", "Government"],
    ] as const;
    body += sec(
      "kinds",
      "What people post",
      "Calendar experiences",
      `<ul class="cal-kinds">${kinds.map(([k, label]) => `<li><img src="assets/cal-cat-${k}.svg" alt="" width="449" height="598" loading="lazy"><span>${label}</span></li>`).join("")}</ul>`,
      "Drawn by the Environmental Dashboard team with Flash the squirrel and Wally the walleye.",
    );
    const modes =
      '<div class="stanza-row c3"><div class="stanza" data-story-scene style="background:var(--leaf-tint)"><h3>On the desktop</h3><p>Access calendar and post using any web browser. Browse through events and announcements using slider, list, or calendar view</p></div><div class="stanza" data-story-scene style="background:var(--amber-tint)"><h3>On Digital Signage</h3><p>Display the Calendar\'s slider view on public screens throughout your community.</p></div><div class="product-context-scene" data-story-scene><div class="stanza" style="background:var(--violet-tint)"><h3>On the Phone App</h3><p>Access the calendar on your phone, post events and subscribe to the weekly newsletter. Control nearby digital signage to display community calendar content.</p></div>' + related_group("Where the calendar shows up", ["digital-signage", "phone-app", "web-embeddables"]) + '</div></div>';
    body += sec(
      "modes",
      "Display modes",
      "Access through various display modes.",
      modes,
    );
    body += H.quote(
      "Community Hub’s events calendar has made our work easier. People in the community are participating — it’s simple, but transformative!",
      "Janet Haar, Executive Director Oberlin Business Partnership",
      "",
    );
    body += H.quote(
      "The volunteer feature of the Dashboard Calendar bridges the gap between the many organizations in the area seeking volunteers and Oberlin residents and students looking for ways to invest in this community",
      "Yael Reichler",
      "OC '19",
    );
    body += H.cta_band("Contact Us", "");
    H.write_page(
      "community-calendar",
      H.page(
        "community-calendar",
        p["name"],
        p["desc"],
        body,
        { current: "community-calendar", jsonld: H.sw_ld(p) },
      ),
    );
  }
  const CV_CATEGORIES = [
    [
      "Serving Our Community",
      "var(--violet)",
      "Features the sustainability-related work of community organizations, public schools and city government workers",
    ] as const,
    [
      "Our Downtown",
      "var(--clay)",
      "Includes positive thoughts, commitments and actions of those who own, work in and shop from local businesses, encouraging the recognition and importance of supporting the local economy by supporting local businesses",
    ] as const,
    [
      "Next Generation",
      "var(--amber)",
      "Features words and often artwork by and about children in the community. While children are important agents of change within a community, they are not often provided with a public platform to share their thoughts and ideas with the larger community. The “Next Generation” CV category provides a space for and boosts young voices",
    ] as const,
    [
      "Heritage",
      "var(--red)",
      "Includes images and words reflective of a community’s legacy of stewardship and engagement on sustainability-related issues. The environmental, social and economic challenges and leadership opportunities that a community faces today build on the historic challenges and opportunities that the community has faced and addressed in the past.",
    ] as const,
    [
      "Natural Oberlin",
      "var(--leaf-deep)",
      "Includes images and words that relate to the natural and cultivated beauty of a community. Photographs and artwork emphasize people interacting with and appreciating the natural world in order to reinforce interconnectivity and people’s sense of pride and belonging to an ecological place.",
    ] as const,
    [
      "Neighbors",
      "var(--peri-deep)",
      "Features quotes from members of a community who are, through their personal examples, promoting sustainable actions in their homes, backyards, gardens, neighborhoods, etc. Those featured develop a sense of pride and identity as community leaders. Those viewing the material see “people like me” – and ideally people they recognize – exhibiting pro-environmental and pro-community behavior, thus establishing and reinforcing positive social norms",
    ] as const,
    [
      "Climate Action",
      "var(--peri)",
      "Features actions, big and small, that community members are taking to address climate change.",
    ] as const,
  ];
  function community_voices(): void {
    const p = H.PBY["community-voices"];
    const media = `<div class="zpb-sign-wrap">${H.voices_sign_mode()}</div>`;
    let body = opening(
      H.crumbs([null, p["group"]] as const, [null, p["name"]] as const),
      p["group"],
      p["name"],
      p.desc,
      media + '<h2 class="opening-caption" id="show-h">Oberlin’s saved slides, playing on a screen.</h2>',
    );
    body = body.replace('<section ', '<section id="show" ');
    body += sec("live", "Explore", "Explore Community Voices", nativeVoices());
    body += jump([
      ["show", "On a screen"] as const,
      ["live", "Explore live"] as const,
      ["wall", "The wall"] as const,
      ["categories", "Seven categories"] as const,
      ["related", "Works well with"] as const,
    ]);
    const counts: Record<string, number> = {};
    for (const [_img, _alt, _q, _who, _role, _ckey, cat] of H.CV_SLIDES) {
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    const tabs =
      `<button type="button" class="zpb-cv-tab" data-filter="all" aria-pressed="true">All slides<span>${H.CV_SLIDES.length}</span></button>` +
      CV_CATEGORIES.filter(([name, _color, _desc]) => counts[name] ?? 0)
        .map(
          ([name, _color, _desc]) =>
            `<button type="button" class="zpb-cv-tab" data-filter="${slugify(name)}" aria-pressed="false">${name}<span>${counts[name] ?? 0}</span></button>`,
        )
        .join("");
    const cards = H.CV_SLIDES.map(
      ([img, alt, q, who, role, ckey, cat]) =>
        `<article class="zpb-cv-card" data-story-scene data-key="${slugify(cat)}"><div class="zpb-cv-ph"><img src="assets/${img}" alt="${e(alt)}" loading="lazy"></div><div class="zpb-cv-body"><p>&ldquo;${e(q)}&rdquo;</p><p class="zpb-cv-who"><b>${e(who)}</b>${role ? ", " + e(role) : ""}</p></div><div class="zpb-cv-cat" style="background:${H.CV_COLOR[ckey]}">${e(cat)}</div></article>`,
    );
    const card_rows = [cards.slice(0, 4), cards.slice(4)].map(row => `<div class="zpb-cv-row" data-story-scene="desktop">${row.join("")}</div>`).join("");
    const filters = `<div class="zpb-cv-tabs" data-zpb-cv-tabs role="group" aria-label="Filter by category">${tabs}</div>`;
    const wall = `<div class="zpb-cv-wall" data-zpb-cv-wall data-chapter-scenes>${card_rows}<p class="zpb-cv-empty" data-zpb-cv-empty hidden>None of Oberlin’s saved slides are tagged with this category yet. See it live at <a class="hand-link" href="https://environmentaldashboard.org/cv-public/digital-signage" target="_blank" rel="noopener">environmentaldashboard.org</a></p></div>`;
    body += sec(
      "wall",
      "The wall",
      "Listen to and celebrate your community.",
      wall,
      "Highlight and celebrate the positive thought and action shared by the members of your community",
      undefined,
      undefined,
      filters,
    );
    const cat_html = CV_CATEGORIES.map(
      ([name, color, desc]) =>
        `<div data-story-scene class="zpb-cv-cat-b${(counts[name] ?? 0) === 0 ? " zpb-none" : ""}" style="${(counts[name] ?? 0) ? "background:" + color : ""}"><h3>${name}</h3><p>${desc}</p>` +
        ((counts[name] ?? 0)
          ? `<p style="margin-top:12px"><a class="hand-link${(counts[name] ?? 0) ? " hand-link-light" : ""}" href="#wall" data-zpb-cv-goto="${slugify(name)}"><svg class="hand-arrow" viewBox="0 0 70 44" aria-hidden="true"><path d="M4 8 C 18 34, 40 38, 62 26"/></svg>See ${counts[name] ?? 0} slide${(counts[name] ?? 0) !== 1 ? "s" : ""}</a></p>`
          : '<p style="margin-top:12px">Oberlin has not saved a slide in this category yet.</p>') +
        "</div>",
    );
    const category_rows = [cat_html.slice(0, 4), cat_html.slice(4)].map((row, i) => {
      const content = row.map((card, index) => i === 1 && index === row.length - 1
        ? `<div class="product-context-scene" data-story-scene>${card.replace("data-story-scene ", "")}${related_group("Where the slides run", ["digital-signage", "phone-app", "web-embeddables"])}</div>`
        : card).join("");
      return `<div class="voice-theme-scene" data-story-scene="desktop"><div class="zpb-cv-cats">${content}</div></div>`;
    }).join("");
    body += sec(
      "categories",
      "Themes",
      "Sort, access and display content categorically",
      `<div class="voice-theme-groups" data-chapter-scenes>${category_rows}</div>`,
      "Community Voices content can be grouped based on subject matter, offering robust collections of material relevant to the following categories:",
      undefined,
      true,
    );
    // Both partner quotes share one titled scene, so a visitor knows who is speaking and why.
    const said = [
      H.quote(
        "When I see the dashboard sign in our lobby, I get that good feeling that people are doing good things",
        "Jennifer Harris",
        "Director of the Oberlin Early Childhood Center",
        "quote-text-only",
      ),
      H.quote(
        "Psychology and marketing teach us that what we believe other community members are doing powerfully influences our own behavior; Community Voices encourages pro-environmental and pro-community behavior",
        "Dr. Cindy Frantz",
        "Professor of Psychology, Oberlin College",
        "quote-text-only",
      ),
    ].map(q => q.replace(" data-story-scene>", ">")).join("");
    body += sec("said", "In their words", "What people say about Community Voices", `<div class="cv-said">${said}</div>`);
    body += H.cta_band("Contact Us", "");
    H.write_page(
      "community-voices",
      H.page(
        "community-voices",
        p["name"],
        p["desc"],
        body,
        { current: "community-voices", jsonld: H.sw_ld(p) },
      ),
    );
  }
  function digital_signage(): void {
    const p = H.PBY["digital-signage"];
    const media = H.postcard(
      "hotel-oberlin-sign.jpg",
      "A Community Hub screen in the Hotel at Oberlin lobby",
      "A Community Hub screen in the Hotel at Oberlin lobby.",
    );
    let body = opening(
      H.crumbs([null, p["group"]] as const, [null, p["name"]] as const),
      p["group"],
      p["name"],
      p["desc"],
      media,
    );
    body += jump([
      ["shows", "What plays"] as const,
      ["multileveled", "Multileveled"] as const,
      ["loop", "Dave's Market"] as const,
      ["managed", "Managing content"] as const,
      ["controller", "Phone control"] as const,
      ["examples", "Controllers"] as const,
      ["locations", "Oberlin"] as const,
      ["campus", "Cleveland and campus"] as const,
      ["related", "Works well with"] as const,
    ]);
    // What plays on the screens: one line per application, in the source's own words (catalog "short").
    const shows_items = ["building-dashboard", "citywide-dashboard", "community-calendar", "community-voices", "stories"]
      .map((slug) => {
        const sp = H.PBY[slug];
        const line = String(sp["short"]);
        return `<li><a href="${slug}.html">${H.picon(sp)}<span><b>${sp["name"]}</b><span>${line.charAt(0).toUpperCase()}${line.slice(1)}</span></span></a></li>`;
      })
      .join("");
    const shows = `<div class="ds-shows"><ul class="ds-shows-list" data-story-scene>${shows_items}</ul><figure class="ds-shows-photo" data-story-scene><img src="assets/carbon-neutral-science-center-original.jpeg" alt="Three people at the Carbon Neutral Stories exhibit in Oberlin College's Science Center" loading="lazy"><figcaption>The Carbon Neutral Stories exhibit in Oberlin College's Science Center.</figcaption></figure></div>`;
    body += sec("shows", "What plays on the screens", "What plays on the screens", shows);
    const multi =
      '<div class="stanza-row c2"><div class="stanza" data-story-scene style="background:var(--leaf-tint)"><img class="stanza-photo is-screen" src="assets/sign-farmers-market.jpg" alt="A digital sign showing the Oberlin Farmers Market event, posted from the Community Calendar" loading="lazy"><h3>Events on the screen</h3><p>All events or job opportunities posted to Community Calendar and Jobs Board are auto formatted and added to live digital signage sequences upon their approval</p></div><div class="stanza" data-story-scene style="background:var(--sky-2)"><img class="stanza-photo" src="assets/kids-citywide-screen.jpg" alt="Elementary students gathered in front of a Citywide Dashboard screen in a school hallway" loading="lazy"><h3>Shared community content</h3><p>Screens throughout a community can display shared content, while also hosting location specific material unique to a handful of or single display</p></div></div>';
    body += sec(
      "multileveled",
      "Multileveled signs",
      "Digital Signage",
      multi,
      "Each Digital Signage display can have its own unique sequence, content featured dependent on location",
    );
    const loop_steps = stepper(
      [
        [
          "The shared loop",
          "Dashboard explained, Community Voices, the Citywide Dashboard, the Community Calendar and the Jobs Board cycle first, the same content every MidTown screen shows.",
        ] as const,
        [
          "The MidTown Story",
          "A story chapter about the neighborhood plays next, shared by every screen in MidTown.",
        ] as const,
        [
          "Dave's Market's own content",
          "Content specific to Dave's Market plays last, shown only on the screen inside the store.",
        ] as const,
      ],
      "eng-sign-daves.jpg",
      "The MidTown screen above the checkout at Dave's Market, with a QR code poster to control it by phone",
      undefined,
      "What shows on the screen at Dave's MidTown Market",
    );
    body += sec(
      "loop",
      "Dave's Market",
      "Location Specific Content",
      loop_steps,
      undefined,
      undefined,
      true,
    );
    const managed_steps = stepper(
      [
        [
          "Post to the calendar or jobs board",
          "Organizations and community members share events, announcements and job opportunities on the Community Calendar and Jobs Board.",
        ] as const,
        [
          "Approve it",
          "All events or job opportunities posted to Community Calendar and Jobs Board are auto formatted and added to live digital signage sequences upon their approval.",
        ] as const,
        [
          "Each screen keeps its own sequence",
          "Each Digital Signage display can have its own unique sequence, content featured dependent on location.",
        ] as const,
      ],
      "eng-midtown-events.jpg",
      "The MidTown Community Calendar, with a Post to Calendar button and tabs for events, announcements and volunteer opportunities",
      undefined,
      "How content reaches the screens",
    );
    body += sec(
      "managed",
      "Managing content",
      "Managing content",
      managed_steps,
      "Easy to use interactive digital signage makes it simple for multiple stakeholders to post and update content",
    );
    const controllerIntro = `<p>Our phone app doubles as a remote, giving users the power to control digital signage by simply scanning the respective QR code on location and selecting viewable content. <a class="hand-link" href="phone-app.html">Phone App</a></p>`;
    const controller = nativeStories() + `<details class="native-help"><summary>Using the phone controller</summary>${controllerIntro}<ol><li><b>Scan the QR code</b><p>Stand at the screen and scan the code on the poster beside it with your phone camera.</p></li><li><b>Pick a topic on your phone</b><p>Your phone shows that screen's menu. At Oberlin College's Carbon Neutral Stories screen it lists Energy, Water, Climate and more.</p></li><li><b>It plays on the big screen</b><p>The screen switches to your choice, so everyone in the room sees it.</p></li></ol></details>`;
    body += sec(
      "controller",
      "Controlled by phone",
      "Controlled by phone",
      controller,
    );
    const ctls = [
      [
        "eng-ctl-midtown.jpg",
        "The MidTown Community Dashboard Screen Controller on a phone, listing Community Calendar, Jobs Board, Community Voices and more",
        "MidTown Cleveland",
        "Visitors pick what the MidTown screen shows from the controller on their own phone.",
      ],
      [
        "eng-ctl-story.jpg",
        "Hands holding a phone showing the Carbon Neutral Stories controller with topics from Heating and Cooling to Live Data",
        "Carbon Neutral Stories",
        "At Oberlin College, the phone chooses which Carbon Neutral Stories topic appears on the exhibit screen.",
      ],
      [
        "eng-ctl-exhibit.jpg",
        "The exhibit case controller on a phone, headed Select an Exhibit Case Feature, listing lights, a lava lamp, a hair dryer, a mini-fridge heat pump, the meters and data system and the geothermal model",
        "Exhibit case",
        "At the Science Center exhibit case, the phone selects a feature: the lights, a lava lamp, a hair dryer, a mini-fridge heat pump, the meters and data system, or the geothermal model.",
      ],
    ] as const;
    const examples = `<div class="ds-ctls">${ctls
      .map(
        ([img, alt, t, d]) =>
          `<figure data-story-scene><img src="assets/${img}" alt="${e(alt)}" loading="lazy"><figcaption><h3>${t}</h3><p>${d}</p></figcaption></figure>`,
      )
      .join("")}</div>`;
    body += sec("examples", "Controllers in use", "Controllers in use", examples);
    const locations = place_cards([
      [
        "oberlin-aerial.jpg",
        "Aerial view of Oberlin, Ohio",
        "Oberlin, Ohio",
        "24 interactive screens run in Oberlin's City Schools, the public library, a food pantry, downtown businesses, City Hall, the Fire Station, a retirement community and churches.",
      ] as const,
      [
        "cafe-window-sign.jpg",
        "A Community Hub screen in the window of Slow Train Cafe, downtown Oberlin",
        "Slow Train Cafe",
        "A Community Hub screen in the window of Slow Train Cafe, downtown Oberlin.",
      ] as const,
    ]);
    body += sec("locations", "Oberlin, Ohio", "Where the screens are: Oberlin", locations);
    const campus = place_cards([
      [
        "glsc-exhibit.jpg",
        "A screen and touch kiosk at the Great Lakes Science Center, Cleveland",
        "Great Lakes Science Center",
        "A screen and touch kiosk at the Great Lakes Science Center, Cleveland.",
      ] as const,
      [
        "glsc-workshop.jpg",
        "Students and staff pose in front of a dashboard screen and a touch tablet at the Great Lakes Science Center",
        "Great Lakes Science Center workshop",
        "Students and staff in front of a dashboard screen and a touch tablet.",
      ] as const,
      [
        "eng-sign-oc-exhibit.jpg",
        "Three people at the Carbon Neutral Stories exhibit in Oberlin College's Science Center",
        "Oberlin College",
        "The Carbon Neutral Stories exhibit in the Science Center. Oberlin College has 12 signs on campus.",
      ] as const,
    ]).replace('class="place-cards"', 'class="place-cards is-three"');
    body += sec(
      "campus",
      "Cleveland and campus",
      "Where the screens are: Cleveland and campus",
      campus + related_group("Works well with", ["phone-app", "web-embeddables", "community-calendar"]),
      "In MidTown, four screens run at Dave's MidTown Market, MidTown Inc's office, Fatima Family Center and Willson Tower Apartments.",
      undefined,
      true,
    );
    body += H.quote(
      "The dashboard signage is stitching together the work of Cleveland organizations to make the team effort apparent",
      "Scott Volmer",
      "Great Lakes Science Center",
    );
    body += H.quote(
      "You come into our community, you see Environmental Dashboard display signs, and you know what this community is about",
      "Greg Jones",
      "Energy Advocate",
    );
    body += H.cta_band("Contact Us", "");
    H.write_page(
      "digital-signage",
      H.page(
        "digital-signage",
        p["name"],
        p["desc"],
        body,
        { current: "digital-signage", jsonld: H.sw_ld(p) },
      ),
    );
  }
  function phone_app(): void {
    const p = H.PBY["phone-app"];
    const media = H.postcard(
      "art-choose-story.jpg",
      "A hand holding the phone story menu, with a live chart on a screen and Flash and his friends watching",
    );
    // Learn more lands on the working controller, not the photo the homepage block already shows.
    const phone_preview = phoneDemo();
    let body = opening(
      H.crumbs([null, p["group"]] as const, [null, p["name"]] as const),
      p["group"],
      p["name"],
      p["desc"],
      phone_preview,
    );
    body += jump([
      ["what", "What it does"] as const,
      ["qr", "QR posters"] as const,
      ["related", "Works well with"] as const,
    ]);
    const what = feature_groups([
      [
        "Puts every app in one place",
        "The phone app consolidates all of CommunityHub’s applications into one place.",
      ] as const,
      [
        "Doubles as a remote",
        "Our phone app doubles as a remote, giving users the power to control digital signage by simply scanning the respective QR code on location and selecting viewable content",
      ] as const,
    ]);

    const qr = `<div class="product-evidence" data-story-scene="all"><div class="product-evidence-copy" id="what" aria-labelledby="what-h"><h3 id="what-h">What it does</h3>${what}<div class="phone-related-links">${related_group("What the app opens", ["digital-signage", "community-calendar", "community-voices", "stories"])}</div></div><div class="product-evidence-media">${media}</div></div>`;
    body += sec("qr", "QR posters", "Phone App & Screen Controller", qr);
    body += H.cta_band("Contact Us", "");
    H.write_page(
      "phone-app",
      H.page(
        "phone-app",
        p["name"],
        p["desc"],
        body,
        { current: "phone-app", jsonld: H.sw_ld(p) },
      ),
    );
  }
  const FONTS = [
    [
      "trebuchet",
      "Trebuchet MS",
      '"Trebuchet MS","Lucida Grande","Segoe UI",sans-serif',
      "system",
    ] as const,
    [
      "verdana",
      "Verdana",
      "Verdana,Geneva,Tahoma,sans-serif",
      "system",
    ] as const,
    [
      "mono",
      "Monospace",
      'ui-monospace,"SF Mono",Menlo,Consolas,monospace',
      "system",
    ] as const,
    [
      "georgia",
      "Georgia",
      'Georgia,"Times New Roman",serif',
      "system",
    ] as const,
    [
      "palatino",
      "Palatino",
      '"Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif',
      "system",
    ] as const,
    [
      "comfortaa",
      "Comfortaa",
      '"Comfortaa",ui-rounded,system-ui,sans-serif',
      "already loaded on this site",
    ] as const,
    [
      "lato",
      "Lato",
      '"Lato",system-ui,sans-serif',
      "already loaded on this site",
    ] as const,
    [
      "system",
      "System UI",
      'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',
      "system",
    ] as const,
  ];
  const FBY: Record<string, { label: string; stack: string; src: string }> =
    Object.fromEntries(
      FONTS.map(
        ([k, l, s, src]) => [k, { label: l, stack: s, src: src }] as const,
      ),
    );
  const SPACING: Record<string, number> = {
    compact: 0.82,
    regular: 1,
    roomy: 1.18,
  };
  function _svg(d: string): string {
    return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  }
  const LOGOS: Record<string, string> = {
    basket: _svg(
      '<path d="M4 10h16l-1.6 9.2a2 2 0 01-2 1.8H7.6a2 2 0 01-2-1.8z"/><path d="M8 10l3-6M16 10l-3-6M9.5 14v3M14.5 14v3"/>',
    ),
    school: _svg('<path d="M4 21V9l8-5 8 5v12M9 21v-6h6v6M2 21h20"/>'),
    atom: _svg(
      '<circle cx="12" cy="12" r="1.4"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)"/>',
    ),
    hall: _svg(
      '<path d="M3 9l9-5 9 5M5 9v10M9.5 9v10M14.5 9v10M19 9v10M3 21h18"/>',
    ),
    book: _svg(
      '<path d="M12 6.5C10 5 7 4.5 3.5 5v13.5c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"/><path d="M12 6.5V20"/>',
    ),
  };
  const PRESETS = [
    {
      key: "grocery",
      name: "A neighborhood grocery",
      site: "Anytown Market",
      host: "anytownmarket.example",
      menu: ["Weekly deals", "Recipes", "Pharmacy", "About us"],
      page: "Community",
      tagline: "Events, jobs and news from the blocks around the store.",
      head: "solid",
      tabs: "pills",
      list: "cards",
      scheme: "light",
      font: "trebuchet",
      body: "trebuchet",
      radius: 18,
      spacing: "roomy",
      logo: "basket",
      v: {
        p: "#C8402A",
        acc: "#F2B544",
        bg: "#FFF7EC",
        surf: "#FFFFFF",
        text: "#2E1F16",
        muted: "#735E4E",
        line: "#EFDDC8",
        head: "#C8402A",
      },
    },
    {
      key: "school",
      name: "A school district",
      site: "Anytown Schools",
      host: "anytownschools.example",
      menu: ["Our schools", "Families", "Staff", "Board of education"],
      page: "Community",
      tagline: "What's happening in and around our school buildings.",
      head: "dark",
      tabs: "underline",
      list: "rows",
      scheme: "light",
      font: "verdana",
      body: "verdana",
      radius: 4,
      spacing: "compact",
      logo: "school",
      v: {
        p: "#1D4E89",
        acc: "#F4B400",
        bg: "#F4F6F9",
        surf: "#FFFFFF",
        text: "#13233F",
        muted: "#55627A",
        line: "#D5DDE8",
        head: "#14305A",
      },
    },
    {
      key: "museum",
      name: "A science museum",
      site: "Anytown Science Museum",
      host: "anytownscience.example",
      menu: ["Visit", "Exhibits", "Field trips", "Membership"],
      page: "Around the region",
      tagline:
        "Events, jobs and live readings from the communities around the museum.",
      head: "dark",
      tabs: "boxed",
      list: "cards",
      scheme: "dark",
      font: "mono",
      body: "system",
      radius: 0,
      spacing: "regular",
      logo: "atom",
      v: {
        p: "#2BC4B4",
        acc: "#FF7A59",
        bg: "#0D1726",
        surf: "#142238",
        text: "#E6EDF7",
        muted: "#9DAEC6",
        line: "#26395C",
        head: "#070D18",
      },
    },
    {
      key: "city",
      name: "A city website",
      site: "City of Anytown",
      host: "cityofanytown.example",
      menu: ["Residents", "Business", "Government", "Services"],
      page: "Community",
      tagline:
        "Events, jobs and live data for people who live and work in town.",
      head: "light",
      tabs: "boxed",
      list: "rows",
      scheme: "light",
      font: "georgia",
      body: "system",
      radius: 2,
      spacing: "compact",
      logo: "hall",
      v: {
        p: "#1F6B4F",
        acc: "#C9A227",
        bg: "#FFFFFF",
        surf: "#F3F6F4",
        text: "#1B1F1D",
        muted: "#56615B",
        line: "#D8DFDA",
        head: "#FFFFFF",
      },
    },
    {
      key: "library",
      name: "A public library",
      site: "Anytown Public Library",
      host: "anytownlibrary.example",
      menu: ["Catalog", "Visit", "Kids and teens", "Research"],
      page: "Community",
      tagline: "Programs and news from the library and the town around it.",
      head: "light",
      tabs: "pills",
      list: "cards",
      scheme: "light",
      font: "palatino",
      body: "georgia",
      radius: 10,
      spacing: "regular",
      logo: "book",
      v: {
        p: "#6A2C5B",
        acc: "#E0875F",
        bg: "#FBF6F0",
        surf: "#FFFFFF",
        text: "#2B1E2A",
        muted: "#6E5F6C",
        line: "#E9DDD2",
        head: "#FFFFFF",
      },
    },
  ];
  // Captured examples remain visible when a live feed is unavailable; the UI labels their dates.
  const EVENTS_FALLBACK = [
    [4358, "Sep", "24", "Thursday, 5:30 PM", "Guided Hike"] as const,
    [3827, "Sep", "24", "Thursday, 6:00 PM", "Oberlin Line Dance"] as const,
    [4366, "Sep", "25", "Friday, 12:00 PM", "Farm Fridays"] as const,
    [
      5719,
      "Sep",
      "25",
      "Friday, 5:00 PM",
      "Ba Duan Jin/Eight-Pieces Brocade Course",
    ] as const,
    [5870, "Sep", "25", "Friday, 7:30 PM", "Dawn & Hawkes"] as const,
    [4439, "Sep", "26", "Saturday, 9:00 AM", "Oberlin Farmers Market"] as const,
  ];
  const JOBS_FALLBACK = [
    [
      "Assistant Administrator (Recreation)",
      "City of Cleveland",
      "Full-time",
      "Jul 21",
    ] as const,
    [
      "Assistant Administrator II (CCA)",
      "City of Cleveland",
      "Full-time",
      "Jul 21",
    ] as const,
    [
      "Maintenance Technician",
      "Cleveland State University",
      "Full-time",
      "Jul 15",
    ] as const,
    [
      "Cashier, Rock & Roll Hall of Fame",
      "Aramark",
      "Part-time",
      "Jul 15",
    ] as const,
  ];
  const GAUGE_FALLBACK = {
    title: "Whole City Electricity",
    value: "17,531",
    unit: "kW",
    pos: 0.03,
  };
  const CV_PICK = [0, 1, 2, 7];
  const BRIEFCASE = _svg(
    '<rect x="3" y="7.5" width="18" height="12.5" rx="2"/><path d="M9 7.5V5.5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 5.5v2M3 13h18"/>',
  );
  function _radius(pp: (typeof PRESETS)[number]): number {
    return pp["radius"] || 12;
  }
  function _style_vars(pp: (typeof PRESETS)[number]): string {
    const v = pp["v"];
    const r = _radius(pp);
    return [
      `--s-p:${v["p"]}`,
      pp["key"] !== "museum" ? "--s-p-ink:#FFFFFF" : "--s-p-ink:#08131F",
      `--s-acc:${v["acc"]}`,
      `--s-bg:${v["bg"]}`,
      `--s-surf:${v["surf"]}`,
      `--s-text:${v["text"]}`,
      `--s-muted:${v["muted"]}`,
      `--s-line:${v["line"]}`,
      `--s-head:${v["head"]}`,
      `--s-font-h:${FBY[pp["font"]]["stack"]}`,
      `--s-font-b:${FBY[pp["body"]]["stack"]}`,
      `--s-r:${r}px`,
      `--s-r-sm:${Math.min(r, 8)}px`,
      `--s-r-pill:${r ? "999px" : "0px"}`,
      `--s-d:${SPACING[pp["spacing"]]}`,
    ].join(";");
  }
  function _preset_buttons(): string {
    const out: string[] = [];
    for (const [i, pp] of PRESETS.entries()) {
      out.push(
        `<button type="button" class="zpb-emb-pre" data-preset="${pp["key"]}" aria-pressed="${i === 0 ? "true" : "false"}"><span class="zpb-emb-pre-t">${pp["name"]}</span></button>`,
      );
    }
    return out.join("");
  }
  function _events_html(): string {
    const items = EVENTS_FALLBACK.map(
      ([pid, mon, day, when, name]) =>
        `<li><a href="https://environmentaldashboard.org/calendar/post/${pid}" target="_blank" rel="noopener"><span class="zpb-emb-date"><small>${mon}</small><b>${day}</b></span><span class="zpb-emb-what"><b>${e(name)}</b><small>${when}</small></span><span class="zpb-emb-vh"> (opens in a new tab)</span></a></li>`,
    ).join("");
    return `<ul class="zpb-emb-list zpb-emb-ev" data-zpb-emb-events>${items}</ul><p class="zpb-emb-src" data-zpb-emb-ev-src>Events from Oberlin’s community calendar, captured on 23 Sep 2026. Live events load here when the calendar answers.</p>`;
  }
  function _jobs_html(): string {
    const items = JOBS_FALLBACK.map(
      ([t, org, kind, posted]) =>
        `<li><span class="zpb-emb-job-ic">${BRIEFCASE}</span><span class="zpb-emb-what"><b>${e(t)}</b><small>${e(org)}</small></span><span class="zpb-emb-job-meta"><span class="zpb-emb-chip">${kind}</span><small>Posted ${posted}</small></span></li>`,
    ).join("");
    return `<ul class="zpb-emb-list zpb-emb-jobs" data-zpb-emb-jobs>${items}</ul><p class="zpb-emb-src" data-zpb-emb-jobs-src>Latest posts on MidTown Cleveland’s jobs board, captured on 23 Sep 2026.</p>`;
  }
  function _ticks(): string {
    const out: string[] = [];
    for (const i of Array.from({ length: 11 }, (_, index) => index)) {
      const t = Math.PI * (1 - i / 10);
      const [r1, r2] =
        i % 5 === 0 ? ([102, 110] as const) : ([103, 107] as const);
      out.push(
        `<line x1="${(110 + r1 * Math.cos(t)).toFixed(1)}" y1="${(114 - r1 * Math.sin(t)).toFixed(1)}" x2="${(110 + r2 * Math.cos(t)).toFixed(1)}" y2="${(114 - r2 * Math.sin(t)).toFixed(1)}"/>`,
      );
    }
    return '<g class="zpb-emb-g-ticks">' + out.join("") + "</g>";
  }
  function _gauge_html(): string {
    const g = GAUGE_FALLBACK;
    return `<div class="zpb-emb-live-grid">
<figure class="zpb-emb-gauge" data-zpb-emb-gauge aria-label="${g["title"]}: ${g["value"]} ${g["unit"]}, near the low end of its usual range">
<svg class="zpb-emb-g-svg" viewBox="0 0 220 128" aria-hidden="true">
${_ticks()}
<path class="zpb-emb-g-track" d="M20 114 A90 90 0 0 1 200 114" pathLength="100"/>
<path class="zpb-emb-g-fill" data-zpb-emb-g-fill d="M20 114 A90 90 0 0 1 200 114" pathLength="100" style="stroke-dashoffset:${(100 - g["pos"] * 100).toFixed(1)}"/>
<circle class="zpb-emb-g-knob" data-zpb-emb-g-knob r="9" cx="20.4" cy="105.5"/>
</svg>
<div class="zpb-emb-g-read"><b data-zpb-emb-g-val>${g["value"]}</b><span data-zpb-emb-g-unit>${g["unit"]}</span></div>
<div class="zpb-emb-g-scale" aria-hidden="true"><span>Low</span><span>High</span></div>
</figure>
<div><p class="zpb-emb-g-k">Electricity use in Oberlin</p><p class="zpb-emb-g-title" data-zpb-emb-g-title>${g["title"]}</p>
<p class="zpb-emb-g-p">The whole town's electricity use, from the city's own utility. The scale compares it with its usual range.</p>
<p class="zpb-emb-src" data-zpb-emb-g-src>Reading captured on 23 Sep 2026. The live value loads here when the gauge feed answers.</p></div>
</div>`;
  }
  function _voices_html(): string {
    const slides: string[] = [];
    for (const [n, i] of CV_PICK.entries()) {
      const [img, alt, q, who, role, c, cat] = H.CV_SLIDES[i];
      slides.push(
        `<figure class="zpb-emb-cv-slide"${n === 0 ? "" : " hidden"}><div class="zpb-emb-cv-ph"><img src="assets/${img}" alt="${e(alt)}" loading="lazy"></div><figcaption><p class="zpb-emb-cv-q">&ldquo;${e(q)}&rdquo;</p><p class="zpb-emb-cv-who"><b>${e(who)}</b>, ${e(role)}</p><span class="zpb-emb-cv-cat" style="background:${H.CV_COLOR[c]}">${cat}</span></figcaption></figure>`,
      );
    }
    const arrow =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="{d}"/></svg>';
    return `<div class="zpb-emb-cv" data-zpb-emb-cv><div style="display:grid">${slides.join("")}</div><div class="zpb-emb-cv-ctl"><button type="button" data-zpb-emb-cv-prev aria-label="Previous voice">${arrow.replaceAll("{d}", "M15 5l-7 7 7 7")}</button><span data-zpb-emb-cv-n>1 of ${CV_PICK.length}</span><button type="button" data-zpb-emb-cv-next aria-label="Next voice">${arrow.replaceAll("{d}", "M9 5l7 7-7 7")}</button></div></div>`;
  }
  function _citywide_html(): string {
    return H.cwd_sign();
  }
  function _code_html(): string {
    const pp = PRESETS[0];
    const lines = [
      ["com", "<!-- Example, not a real API -->"] as const,
      ["raw", '<script src="https://embed.example/ch.js"></script>'] as const,
      ["raw", "<community-dashboard"] as const,
      ["raw", '  community="oberlin"'] as const,
      ["raw", `  partner="${pp["key"]}"`] as const,
      ["raw", '  tabs="events jobs live-data voices citywide"'] as const,
      ["raw", `  brand-color="${pp["v"]["p"].toLowerCase()}"`] as const,
      ["raw", `  font="${FBY[pp["font"]]["label"]}"`] as const,
      ["raw", '  corners="rounded"'] as const,
      ["raw", `  spacing="${pp["spacing"]}"`] as const,
      ["raw", '  color-scheme="light">'] as const,
      ["raw", "</community-dashboard>"] as const,
    ];
    return lines.map(([_k, t]) => `<span class="ln">${e(t)}</span>`).join("");
  }
  function _demo(): string {
    const pp = PRESETS[0];
    const menu = pp["menu"].map((m) => `<li>${m}</li>`).join("");
    const font_opts = FONTS.map(
      ([k, l, _s, src]) =>
        `<option value="${k}"${k === pp["font"] ? " selected" : ""}>${l} (${src})</option>`,
    ).join("");
    const swatches = [
      ["#58BA51", "Community Hub green"] as const,
      ["#1B7FB0", "lake blue"] as const,
      ["#E9A13B", "sunflower"] as const,
      ["#D9533F", "brick red"] as const,
      ["#6A4AA2", "purple"] as const,
      ["#15242A", "near black"] as const,
    ];
    const sw_html = swatches
      .map(
        ([c, n]) =>
          `<button type="button" class="zpb-emb-swatch" data-color="${c}" style="--c:${c}" aria-label="Use ${n}, ${c}"></button>`,
      )
      .join("");
    const data = {
      presets: PRESETS.map(({ logo, ...preset }) => ({
        ...preset,
        logo: LOGOS[logo],
      })),
      fonts: FBY,
      spacing: SPACING,
    };
    const data_json = JSON.stringify(data).replaceAll("</", "<\\/");
    const tabs = [
      ["events", "Events"] as const,
      ["jobs", "Jobs"] as const,
      ["live", "Live data"] as const,
      ["voices", "Community Voices"] as const,
      ["citywide", "Citywide Dashboard"] as const,
    ];
    const tab_btns = tabs
      .map(
        ([k, n], i) =>
          `<button type="button" role="tab" id="zpb-emb-t-${k}" aria-controls="zpb-emb-p-${k}" aria-selected="${i === 0 ? "true" : "false"}"${i === 0 ? "" : ' tabindex="-1"'}>${n}</button>`,
      )
      .join("");
    const panels: Record<string, string> = {
      events: _events_html(),
      jobs: _jobs_html(),
      live: _gauge_html(),
      voices: _voices_html(),
      citywide: _citywide_html(),
    };
    const panel_html = tabs
      .map(
        ([k, _n], i) =>
          `<div class="zpb-emb-panel-body" role="tabpanel" id="zpb-emb-p-${k}" aria-labelledby="zpb-emb-t-${k}" tabindex="0"${i === 0 ? "" : " hidden"}>${panels[k]}</div>`,
      )
      .join("");
    return `<div class="zpb-emb-demo zpb-emb-demo--focused" data-zpb-emb data-chapter-scenes data-story-scene="all">
<script type="application/json" id="zpb-emb-data">${data_json}</script>
<div class="zpb-emb-presets" role="group" aria-label="Example partner sites" data-squirrel="Choose one to explore" data-squirrel-side="top" data-squirrel-short="Choose one">${_preset_buttons()}</div>
<label class="zpb-emb-preset-field">Example partner<select data-zpb-emb-preset-select>${PRESETS.map(preset => `<option value="${e(preset.key)}">${e(preset.name)}</option>`).join("")}</select></label>
<div class="zpb-emb-stage">
<div class="zpb-emb-main" data-story-scene>
<div class="zpb-emb-browser">
<div class="zpb-emb-site" data-zpb-emb-site role="region" aria-label="Example partner website with Community Hub content embedded" data-head="${pp["head"]}" data-tabs="${pp["tabs"]}" data-list="${pp["list"]}" data-scheme="${pp["scheme"]}" data-corners="rounded" style="${_style_vars(pp)}">
<header class="zpb-emb-s-head zpb-emb-swap">
<span class="zpb-emb-s-logo"><span class="zpb-emb-s-mark" data-zpb-emb-logo>${LOGOS[pp["logo"]]}</span><b data-zpb-emb-name>${pp["site"]}</b></span>
<ul class="zpb-emb-s-nav" data-zpb-emb-menu aria-label="The partner's own menu (example)">${menu}<li class="on">Community</li></ul>
</header>
<div class="zpb-emb-s-title zpb-emb-swap"><p class="zpb-emb-s-crumb">Home <span aria-hidden="true">/</span> <span data-zpb-emb-page-c>${pp["page"]}</span></p><p class="zpb-emb-s-h" data-zpb-emb-page>${pp["page"]}</p><p class="zpb-emb-s-tag" data-zpb-emb-tagline>${pp["tagline"]}</p></div>
<div class="zpb-emb-embed">
<div class="zpb-emb-e-nav">
<div class="zpb-emb-e-tabs" role="tablist" aria-label="Community Dashboard">${tab_btns}</div></div>
<div class="zpb-emb-e-body zpb-emb-swap">${panel_html}</div>
</div>
<footer class="zpb-emb-s-foot zpb-emb-swap"><b data-zpb-emb-name2>${pp["site"]}</b><span>Hours</span><span>Contact</span><span>Careers</span></footer>
</div>
</div>

<div class="zpb-emb-customization"><details class="zpb-emb-appearance"><summary id="zpb-emb-own-h">Appearance settings <span class="zpb-emb-custom" data-zpb-emb-custom hidden>Custom style</span></summary><div class="zpb-emb-settings-body"><div class="zpb-emb-panel" role="group" aria-labelledby="zpb-emb-own-h">
<div class="zpb-emb-field"><label for="zpb-emb-color">Brand color</label>
<div class="zpb-emb-color"><input type="color" id="zpb-emb-color" value="${pp["v"]["p"].toLowerCase()}"><output for="zpb-emb-color" data-zpb-emb-hex>${pp["v"]["p"]}</output></div>
<div class="zpb-emb-swatches" role="group" aria-label="Suggested colors">${sw_html}</div></div>
<div class="zpb-emb-field"><label for="zpb-emb-font">Font</label><div class="zpb-emb-select"><select id="zpb-emb-font">${font_opts}</select></div></div>
<fieldset class="zpb-emb-field zpb-emb-seg"><legend>Corners</legend><div class="zpb-emb-seg-row">
<label><input type="radio" name="zpb-emb-corners" value="rounded" checked><span>Rounded</span></label>
<label><input type="radio" name="zpb-emb-corners" value="square"><span>Square</span></label></div></fieldset>
<fieldset class="zpb-emb-field zpb-emb-seg"><legend>Spacing</legend><div class="zpb-emb-seg-row">
<label><input type="radio" name="zpb-emb-spacing" value="compact"><span>Compact</span></label>
<label><input type="radio" name="zpb-emb-spacing" value="regular"><span>Regular</span></label>
<label><input type="radio" name="zpb-emb-spacing" value="roomy" checked><span>Roomy</span></label></div></fieldset>
<label class="zpb-emb-switch"><input type="checkbox" role="switch" id="zpb-emb-outline"><span class="zpb-emb-switch-ui" aria-hidden="true"></span><span>Outline the embedded part</span></label>
<button type="button" class="zpb-emb-reset" data-zpb-emb-reset disabled>Reset to the preset</button>
</div><details class="zpb-emb-code"><summary>Show the example embed code</summary><pre><code data-zpb-emb-code>${_code_html()}</code></pre><p class="zpb-emb-code-note">An illustration of the options above, not a real API. Community Hub sets up each embed with the partner.</p></details></div></details>
<p class="zpb-emb-note">The events load from Oberlin's community calendar, the jobs from MidTown Cleveland's jobs board and the electricity reading from Oberlin's gauge feed. The partner websites are made up.</p></div>
</div>
</div>
</div>`;
  }
  function web_embeddables(): void {
    // One titled section = one scene on every screen: drop the per-group phone stops.
    const one_scene = (h: string): string => h.replace(/\sdata-story-scene(?![=\w-])/g, "");
    const p = H.PBY["web-embeddables"];
    const media = H.postcard(
      "ops-embed-shot.jpg",
      "The Oberlin City Schools dashboard embed, with the district's logo and menu",
    );
    let body = opening(
      H.crumbs([null, p["group"]] as const, [null, p["name"]] as const),
      p["group"],
      p["name"],
      p["desc"],
      media,
      `<a class="btn-ink btn-ghost btn-big" href="#try">Try the restyle demo</a>`,
    );
    body += jump([
      ["try", "Try it"] as const,
      ["fits", "How it fits"] as const,
      ["hold", "What it can hold"] as const,
      ["partners", "Partner pages"] as const,
      ["examples", "Already in use"] as const,
      ["related", "Works well with"] as const,
    ]);
    body += sec(
      "try",
      "Try it",
      "Easily access and/or host CommunityHub content on your organization’s website.",
      _demo(),
      "A made-up partner site with Community Hub content inside. Pick an example, or set your own color, font and corners. Only the look changes.",
    );
    const fit_items = [
      [
        "The partner's header and menu stay",
        "CommunityHub provides HTML embeddable code that allows customized content to be inserted into organizational websites that are built with any content management system.",
      ] as const,
      [
        "A sub-menu switches the content",
        "Which applications accessed through the Web Embeddable can be tailored to the interests and needs of your organization.",
      ] as const,
      [
        "We match the site's style",
        "Embeddables are built using the colors, fonts, and important stylistic details of your organization’s brand identity so CommunityHub content can fit seamlessly within any organizations website",
      ] as const,
    ];
    const fits = fit_items
      .map(
        ([t, d], i) =>
          `<li><span class="zpb-fit-n">${i + 1}</span><span><h3>${t}</h3><p>${d}</p></span></li>`,
      )
      .join("");
    body += sec(
      "fits",
      "How it fits",
      "Web Embeddables are customized to stylistically match any organization’s pre-existing website.",
      `<ol class="zpb-fit">${fits}</ol>`,
      undefined,
      undefined,
      true,
    );
    const hold = src_list([
      [
        "icon-calendar.png",
        "Events calendar",
        "The community calendar, with the same posts that run on the screens.",
      ] as const,
      [
        "icon-jobs.png",
        "Jobs board",
        "Local job posts from the same board that runs on MidTown Cleveland's screens, such as the one in Dave's Market.",
      ] as const,
      [
        "icon-cv.png",
        "Community Voices",
        "The Community Voices slideshow that runs on Oberlin's screens.",
      ] as const,
      [
        "icon-cwd.png",
        "Citywide Dashboard",
        "The animated drawing of a town's live resource flows.",
      ] as const,
      [
        "icon-signage.png",
        "Digital Signage presentations",
        "The presentations that run on Community Hub's screens can also run on a web page.",
      ] as const,
    ], related_group("What sits inside the embed", ["community-calendar", "community-voices", "digital-signage"]));
    body += sec(
      "hold",
      "What it can hold",
      "The Web Embeddable can feature any or all of the applications provided by CommunityHub",
      one_scene(hold),
      "",
    );
    const live_tabs = [
      [
        "https://midtowncleveland.org/events/",
        "icon-calendar.png",
        "MidTown Cleveland",
      ] as const,
      [
        "https://www.cityofoberlin.com/city-government/departments/sustainability/",
        "icon-environment.png",
        "City of Oberlin",
      ] as const,
    ];
    const tab_btns = live_tabs
      .map(
        ([src, ic, label], i) =>
          `<button type="button" role="tab" aria-selected="${i === 0 ? "true" : "false"}"${i === 0 ? "" : " tabindex=-1"} data-src="${src}"><img src="assets/${ic}" alt="">${label}</button>`,
      )
      .join("");
    const partners = `<div class="live-tabs" role="tablist" aria-label="Partner pages" data-live-tabs="zpb-webemb-live-panel">${tab_btns}</div>
<figure class="live-frame" id="zpb-webemb-live-panel" data-src="${live_tabs[0][0]}" data-title="${live_tabs[0][2]}" style="--h:520px">
<div class="bar"><i></i><i></i><i></i><span data-live-url>${live_tabs[0][0].replaceAll("https://", "")}</span><span class="lf-saved">Showing a saved picture</span><button type="button" class="lf-retry">Try again</button><a data-live-open href="${live_tabs[0][0]}" target="_blank" rel="noopener">Open full site ${ARR}</a></div>
<div class="lf-body"></div>
</figure>
<p style="margin-top:14px;color:var(--ink-2);max-width:64ch">Two partner pages, live: MidTown Cleveland's events page, which runs the Community Calendar, and the City of Oberlin’s climate action plan page. Community Hub is the City’s communication platform for that plan.</p>`;
    body += sec(
      "partners",
      "Partner pages",
      "Organizational websites with CH plugins",
      partners,
    );
    const examples = [
      [
        "ops-embed-shot.jpg",
        "The Oberlin City Schools dashboard embed, with the district's logo and menu",
        "School district",
        "Oberlin City Schools",
        "Open the school dashboard to explore its buildings.",
        "https://oberlin.communityhub.cloud/dh-public/ops-embed",
        "Open the district dashboard",
        "oberlin.communityhub.cloud/dh-public/ops-embed",
      ] as const,
      [
        "ecolympics-2026-standings.jpg",
        "The 2026 Ecolympics standings from Data Hub, as embedded on environmentaldashboard.org",
        "Competition",
        "Ecolympics standings",
        "Data Hub's standings embedded on the 2025 and 2026 Ecolympics pages.",
        "https://environmentaldashboard.org/ecolympics",
        "See the 2026 Ecolympics results",
        "environmentaldashboard.org/ecolympics",
      ] as const,
      [
        "cv-slideshow-shot.jpg",
        "Mike Cariglio's Community Voices slide, as it runs in the full-screen slideshow",
        "Slideshow",
        "Community Voices slideshow",
        "A full-screen slideshow that any partner site can show.",
        "https://environmentaldashboard.org/cv-public/digital-signage",
        "Open Oberlin's slideshow",
        "environmentaldashboard.org/cv-public/digital-signage",
      ] as const,
    ];
    body += sec(
      "examples",
      "Already in use",
      "Embeds already running",
      one_scene(trio(examples)),
      undefined,
      undefined,
      true,
    );
    body += H.quote(
      "Community Hub is central to our communities climate resilience communication strategy",
      "City of Oberlin",
      "",
      "",
      {
        img: "cv-matthew-dewitt.jpg",
        alt: "High school students posing behind a Climate Anxiety Counseling booth",
        cap: "From Community Voices, Climate Action: Matthew Dewitt, OHS '25",
      },
    );
    body += H.cta_band("Contact Us", "");
    H.write_page(
      "web-embeddables",
      H.page(
        "web-embeddables",
        p["name"],
        p["desc"],
        body,
        { current: "web-embeddables", jsonld: H.sw_ld(p) },
      ),
    );
  }
  community_calendar();
  community_voices();
  digital_signage();
  phone_app();
  web_embeddables();
}
