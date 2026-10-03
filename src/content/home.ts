import { voicesPreview, buildingPreview, storiesPreview, dataHubPreview, citywidePreview, calendarPreview, previewGallery } from "./home-previews";
import { PRODUCTS } from "./catalog";
import { renderPlatformExplanation } from "./platform_explanation";
/** Homepage executive summary: place, people, mission and three product chapters. */
import type { SiteContext } from "../lib/site";

type Testimonial = Pick<SiteContext["TESTIMONIALS"][number], "img" | "alt" | "pos" | "quote" | "who" | "role">;
type Links = readonly (readonly [href: string, label: string])[];
type Pairs = readonly (readonly [string, string])[];
type ProductPanels = readonly (readonly [
  name: string,
  text: string,
  extra: string,
  links: Links,
  media: string,
])[];

export function register(H: SiteContext): void {
  const e = H.e;
  const ARR = H.ARR;
  // The hero plays forward once; the browser controller owns its end-frame hold.
  const hero = `<section class="hv full" aria-label="Community Hub: our place and people"><div class="hv-film" aria-label="Drone video zooming from high above down to downtown Oberlin, Ohio">
  <div class="hv-media">
    <div class="hv-stills" aria-hidden="true" data-hv-stills><i class="on" style="background-image:url(assets/hero-first-frame.jpg)"></i></div>
    <video class="hv-vid" muted playsinline preload="metadata" poster="assets/hero-first-frame.jpg" aria-hidden="true" data-hv-vid>
      <source src="assets/hero-ch-fwd.mp4" type="video/mp4" media="(min-width: 900px)">
      <source src="assets/hero-ch-fwd-720.mp4" type="video/mp4">
    </video>
  </div>
  <div class="hv-scrim" aria-hidden="true"></div>
  <div class="wrap hv-copy">
    <h1 class="hv-h"><span class="hv-premise">It has never been more important</span> <span class="hv-l">to <em>act locally</em> while <em>thinking globally</em></span></h1>
  </div>
  <div class="hv-skip"><span class="hv-prog" aria-hidden="true"><i data-hv-prog></i></span><button class="sec-next" type="button" data-hv-skip aria-label="Skip the video"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
  <a class="hv-next" href="#people" data-hv-next aria-label="Explore Community Hub">Explore</a>
</div></section>`;
  function person(t: Testimonial, go: Links): string {
    const btns = go.slice(0, 1)
      .map(
        ([u, l], i) =>
          `<a class="pp-btn${i ? " pp-btn2" : ""}" href="${u}">${e(l)} ${ARR}</a>`,
      )
      .join("");
    return `<figure class="pp">
  <img src="assets/${t["img"]}" alt="${e(t["alt"])}" style="object-position:${t["pos"]}" loading="lazy">
  <blockquote><p>${e(t["quote"])}</p></blockquote>
  <figcaption><b>${e(t["who"])}</b> ${e(t["role"])}</figcaption>
  <p class="pp-go">${btns}</p>
</figure>`;
  }
  // Text, primary product associations and photos are preserved from the live
  // homepage. The school dashboard/toolkit links follow the meeting example.
  const stories: readonly (readonly [Testimonial, Links])[] = [
    [
      {
        "img": "live-home-story-01.jpeg",
        "alt": "Participants examining illuminated bulbs during an energy demonstration",
        "pos": "50% 50%",
        "quote": "“I really feel that I am a part of the resource use graphs displayed on the dashboards. This feeling motivates me to be more thoughtful when consuming water and electricity”",
        "who": "Grace Gao",
        "role": "Oberlin College Student"
      },
      [["digital-signage.html", "Digital Signage"]],
    ],
    [
      {
        "img": "live-home-story-02.jpeg",
        "alt": "Children and a teacher gathered around a dashboard screen in a school hallway",
        "pos": "50% 50%",
        "quote": "“When you talk about 21st-century skills - gathering and interpreting data - the Dashboard will be a very important tool”",
        "who": "Kim Koos",
        "role": "Elementary Teacher"
      },
      [["phone-app.html", "Phone App"], ["schools.html#live", "Visit the Oberlin City Schools dashboard"], ["education.html", "Teacher toolkit"]],
    ],
    [
      {
        "img": "live-home-story-03.png",
        "alt": "A group discussing the dashboard display and touch-screen exhibit at the Great Lakes Science Center",
        "pos": "50% 50%",
        "quote": "“The dashboard signage is stitching together the work of Cleveland organizations to make the team effort apparent”",
        "who": "Scott Volmer",
        "role": "Great Lakes Science Center"
      },
      [["web-embeddables.html", "Web Embeddables"]],
    ],
    [
      {
        "img": "live-home-story-04.jpeg",
        "alt": "Students using laptops displaying the Citywide Dashboard",
        "pos": "50% 50%",
        "quote": "“Oberlin is helping us translate water and energy use in 44 school buildings into teaching and learning in the classroom”",
        "who": "Bob Mendenhall",
        "role": "Curriculum Director Toledo"
      },
      [["building-dashboard.html", "Building Dashboard"], ["education.html", "Teacher toolkit"]],
    ],
    [
      {
        "img": "live-home-story-05.jpeg",
        "alt": "Janet Haar outside the Oberlin Business Partnership, with Main Street behind her",
        "pos": "50% 50%",
        "quote": "“Environmental Dashboard enables residents to understand their electricity and water consumption, which in turn helps prevent overuse”",
        "who": "Janet Haar",
        "role": "Executive Director, Oberlin Business Partnership"
      },
      [["citywide-dashboard.html", "Citywide Dashboard"]],
    ],
    [
      {
        "img": "live-home-story-06.jpeg",
        "alt": "A group attending a workshop with a dashboard projected at the front of a library",
        "pos": "50% 50%",
        "quote": "\"CommunityHub's Digital Signage is central to our community's climate resilience communication strategy\"",
        "who": "Linda Arbogast",
        "role": "City of Oberlin Sustainability Coordinator"
      },
      [["the-hub.html", "Data Hub"]],
    ],
    [
      {
        "img": "live-home-story-07.jpeg",
        "alt": "Shoppers and vendors at an indoor market with vegetables and pumpkins",
        "pos": "50% 50%",
        "quote": "“Community Hub’s events calendar has made our work easier. People in the community are participating — it’s simple, but transformative!”",
        "who": "Janet Haar, Executive Director Oberlin Business Partnership",
        "role": ""
      },
      [["community-calendar.html", "Community Calendar"]],
    ],
    [
      {
        "img": "live-home-story-08.jpeg",
        "alt": "A speaker addressing a crowd at the corner of College and Main in Oberlin",
        "pos": "50% 50%",
        "quote": "“For a decade we have looked to the CommunityHub team as key partners in translating our energy conservation services into community engagement”",
        "who": "Geoff Hunter",
        "role": "President Palmer Conservation Consulting"
      },
      [["community-voices.html", "Community Voices"]],
    ],
  ];
  const people = `<div class="ppl-first" id="people" aria-label="People using Community Hub" hidden>
  <div class="wrap">
    <div class="people-heading"><h2 class="h2 people-context">How we solve it</h2><p>Act locally while thinking globally</p></div>
    <div class="pp-fade" data-pp-fade role="region" aria-roledescription="carousel" aria-label="Stories from the places we work" tabindex="0">${stories.map(([w, go]) => person(w, go)).join("")}</div>
    <div class="pp-nav" data-pp-nav hidden>
      <button type="button" class="pp-arrow" data-pp-prev aria-label="Previous story"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button>
      <span class="pp-count" data-pp-count>1 / ${stories.length}</span>
      <button type="button" class="pp-arrow" data-pp-next aria-label="Next story"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>
      <button type="button" class="pp-play" data-pp-play aria-pressed="false" aria-label="Pause automatic stories"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg></button>
    </div>
  </div>
</div>`;
  const why = renderPlatformExplanation(ARR);
  const signs: Pairs = [
    [
      "eng-sign-daves.jpg",
      "Above the checkout at Dave's Market in MidTown Cleveland, with a code to control the screen by phone",
    ] as const,
    ["hotel-oberlin-sign.jpg", "A lobby sign at the Hotel at Oberlin"] as const,
    [
      "kids-citywide-screen.jpg",
      "Students at a Citywide Dashboard screen in an Oberlin school hallway",
    ] as const,
    [
      "glsc-workshop.jpg",
      "A workshop at the Great Lakes Science Center, Cleveland",
    ] as const,
    [
      "glsc-exhibit.jpg",
      "A screen and touch kiosk at the Great Lakes Science Center, Cleveland",
    ] as const,
    [
      "carbon-neutral-science-center-original.jpeg",
      "The Carbon Neutral Stories exhibit at Oberlin College's Science Center",
    ] as const,
  ];
  const ctl_html = previewGallery("Phone App", [
    {image: "phone-person-water-display.jpg", alt: "A visitor holds the phone controller beside a large display showing Water Use", context: "Phone App · Choosing what appears on a shared display", readableText: "Using a phone to choose what appears on a shared display."},
    {image: "eng-ctl-midtown.jpg", alt: "The MidTown Community Dashboard Screen Controller on a phone, listing Community Calendar, Jobs Board, Community Voices and more", context: "Phone App · MidTown Cleveland controller", readableText: "Visitors pick what the MidTown screen shows from the controller on their own phone."},
    {image: "eng-ctl-story.jpg", alt: "Hands holding a phone showing the Carbon Neutral Stories controller with topics from Heating and Cooling to Live Data", context: "Phone App · Carbon Neutral Stories controller", readableText: "At Oberlin College, the phone chooses which Carbon Neutral Stories topic appears on the exhibit screen."},
  ]);
  const installationNames = ["Dave's Market · MidTown Cleveland", "Hotel at Oberlin", "Oberlin City Schools", "Great Lakes Science Center · Workshop", "Great Lakes Science Center · Exhibit", "Oberlin College · Carbon Neutral Stories"];
  const sign_media = previewGallery("Digital Signage", signs.map(([image, alt], index) => ({image, alt, context: installationNames[index], readableText: alt})));
  const emb_media = calendarPreview("Web Embeddables", false);
  const live = {
    "data-dashboard": buildingPreview(),
    "the-hub": dataHubPreview(),
    "community-calendar": calendarPreview("Community Calendar", false),
    "community-voices": voicesPreview(),
    stories: storiesPreview(),
  };
  // Each product is its own panel inside the section's horizontal story rail.
  function group(
    sid: string,
    head: string,
    tone: string,
    label: string,
    items: ProductPanels,
  ): string {
    const n = items.length;
    const tabs = items
      .map(
        (it, i) =>
          `<button type="button" role="tab" data-eng-tab aria-selected="${i === 0 ? "true" : "false"}">${it[0]}</button>`,
      )
      .join("");
    const controls = `<div class="eng-tabs" role="tablist" aria-label="${label}">${tabs}</div>`;
    function links(go: Links): string {
      return go.slice(0, 1)
        .map(
          ([u], i) =>
            `<a class="pc-a${i ? " pc-a2" : ""}" href="${u}">Learn more ${ARR}</a>`,
        )
        .join("");
    }
    const panels = items
      .map(
        ([
          name,
          text,
          extra,
          go,
          media,
        ]) => `<article class="eng-p" data-eng-panel aria-label="${name}">
      <div class="eng-copy" data-eng-context><div class="product-identity"><img class="product-identity-icon" src="assets/${PRODUCTS.find(product => product.name === name)?.icon || "icon-ch.png"}" alt="" width="48" height="48"><h3>${name}</h3></div>${text ? `<p>${text}</p>` : ""}${extra}<p class="eng-go">${links(go)}</p></div>
      <div class="eng-media" data-eng-view>${media}</div>
    </article>`,
      )
      .join("");
    const snaps = Array.from({ length: n - 1 }, (_, index) => index + 1)
      .map(
        (k) => `<i class="eng-snap" style="--k:${k}" aria-hidden="true"></i>`,
      )
      .join("");
    return `<section class="eng tone-${tone}" id="${sid}" data-i="0" data-nofit style="--n:${n}" aria-labelledby="${sid}-h">
  ${snaps}
  <div class="eng-stage">
    <div class="wrap"><div class="chapter-heading"><h2 class="h2 eng-label" id="${sid}-h">${head}</h2><span class="chapter-connector" aria-hidden="true">→</span>${controls}</div>
    <div class="eng-panels story-rail" data-story-rail role="region" aria-label="${label}" tabindex="0">${panels}</div>
  </div></div>
</section>`;
  }
  const engage = group("engage", "Engage", "lime", "Ways we engage", [
    [
      "Digital Signage",
      "Easy to use interactive digital signage makes it simple for multiple stakeholders to post and update content that connects community members with both organization and location-specific and community-wide information and events",
      "",
      [["digital-signage.html", "See Digital Signage"] as const],
      sign_media,
    ] as const,
    [
      "Phone App",
      "Our phone application is easily customized to meet the communication goals of each community. Viewers can directly access content that interests them on their phone and can also control current content displayed on the digital sign nearest to them by scanning a QR code",
      "",
      [["phone-app.html", "See the Phone App"] as const],
      ctl_html,
    ] as const,
    [
      "Web Embeddables",
      "CH content, such as community calendars, real-time data visualizations, and navigable dashboards can be easily customized and embedded into the websites of any partner organization",
      "",
      [["web-embeddables.html", "See Web Embeddables"] as const],
      emb_media,
    ] as const,
  ]);
  const products =
    group("products", "Educate", "dark", "Ways we educate", [
      [
        "Building Dashboard",
        "Building Dashboard tracks and communicates patterns of real-time resource use in buildings in ways that engage, are easy to understand and make connections between resource conservation and resulting environmental and community benefits.",
        "",
        [
          ["building-dashboard.html", "See the Building Dashboard"] as const,
        ],
        live["data-dashboard"],
      ] as const,
      [
        "Citywide Dashboard",
        "Citywide Dashboard is an animated visualization of whole-community flows of electricity, drinking water, and current environmental conditions. It is designed to enhance residents’ understandings of how they are connected to a larger whole — a whole that is ultimately dependent on renewable resource flows and a healthy environment.",
        "",
        [
          [
            "citywide-dashboard.html",
            "See the Citywide Dashboard",
          ] as const,
        ],
        citywidePreview(),
      ] as const,
      [
        "Data Hub",
        "Data Hub is a powerful and intuitive package of online data visualization tools. Data Hub makes it easy for managers, educators, students and communicators to translate real-time data acquired from a variety of sources into compelling visualizations that are easily understood and can be shared on websites and digital signage to tell stories of impact and opportunity.",
        "",
        [
          ["the-hub.html", "See Data Hub"] as const,
        ],
        live["the-hub"],
      ] as const,
      [
        "Stories",
        "Illustrated stories explain how local systems work, starting with nine from Oberlin College's Sustainable Infrastructure Program. They play on screens, phones and the web.",
        "",
        [
          ["stories.html", "See Stories"] as const,
        ],
        live["stories"],
      ] as const,
    ]) +
    group(
      "motivate",
      "Motivate and Empower",
      "green",
      "Ways we motivate and empower",
      [
        [
          "Community Voices",
          "Community Voices combines images and words drawn from the full diversity of a community to celebrate and cultivate thought and actions that advance ecological, economic, and social resilience. Community Hub’s unique software makes it easy to build, manage, organize and customize content into powerful messages for display on digital signage, phone apps, and websites.",
          "",
          [
            ["community-voices.html", "See Community Voices"] as const,
          ],
          live["community-voices"],
        ] as const,
        [
          "Community Calendar",
          "Engaged residents who can easily share information and are encouraged to participate are critical to community vibrancy and resilience. Our calendar application is a unique crowd-sourced venue that makes it easy for organizations and community members to share and promote events and announcements within organizations, neighborhoods, and whole cities.",
          "",
          [["community-calendar.html", "See the Community Calendar"] as const],
          live["community-calendar"],
        ] as const,
      ],
    );
  // Keep the public story order aligned with the section-navigation contract.
  const opening = hero.replace("</section>", people + "</section>");
  const body = opening + why + engage + products;
  const html_out = H.page(
    "index",
    "Community Hub",
    "Community Hub is a community-centered communication platform. Our software connects people with their community and the natural systems upon which we depend, on screens, phones and websites for neighborhoods, cities, museums, campuses and schools.",
    body,
    {
      current: "index",
      jsonld: H.ORG_LD,
      full_title: "Community Hub | Act locally, think globally",
    },
  );
  H.write_page("index", html_out);
}
