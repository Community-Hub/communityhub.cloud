import liveProducts from "./live-products.json";
import type { Product, Audience, CaseStudy, Testimonial, Triple, VoiceSlide, DataView, LinkPreview } from '../lib/types';

export const ORIGINAL_PRODUCTS = liveProducts.products;

// Original eight offerings, with the existing Stories destination retained.
// Short menu descriptions are exact excerpts of the original product paragraphs.
export const PRODUCTS: readonly Product[] = [
  {
    "slug": "building-dashboard",
    "name": "Building Dashboard",
    "group": "Educate",
    "icon": "icon-building-96.png",
    "short": "patterns of real-time resource use in buildings",
    "desc": ORIGINAL_PRODUCTS["building-dashboard"].description,
    "chips": [
      "Screens",
      "Web",
      "Orbs"
    ]
  },
  {
    "slug": "citywide-dashboard",
    "name": "Citywide Dashboard",
    "group": "Educate",
    "icon": "icon-cwd-96.png",
    "short": "whole-community flows of electricity, drinking water, and current environmental conditions",
    "desc": ORIGINAL_PRODUCTS["citywide-dashboard"].description,
    "chips": [
      "Screens",
      "Web",
      "Orbs"
    ]
  },
  {
    "slug": "the-hub",
    "name": "Data Hub",
    "group": "Educate",
    "icon": "icon-datahub-96.png",
    "short": "a powerful and intuitive package of online data visualization tools",
    "desc": ORIGINAL_PRODUCTS["the-hub"].description,
    "chips": [
      "Web"
    ]
  },
  {
    "slug": "digital-signage",
    "name": "Digital Signage",
    "group": "Engage",
    "icon": "icon-signage-96.png",
    "short": "Easy to use interactive digital signage",
    "desc": ORIGINAL_PRODUCTS["digital-signage"].description,
    "chips": [
      "Screens"
    ]
  },
  {
    "slug": "phone-app",
    "name": "Phone App",
    "group": "Engage",
    "icon": "icon-phone-96.png",
    "short": "directly access content that interests them on their phone",
    "desc": ORIGINAL_PRODUCTS["phone-app"].description,
    "chips": [
      "Phones"
    ]
  },
  {
    "slug": "web-embeddables",
    "name": "Web Embeddables",
    "group": "Engage",
    "icon": "icon-embed-96.png",
    "short": "community calendars, real-time data visualizations, and navigable dashboards",
    "desc": ORIGINAL_PRODUCTS["web-embeddables"].description,
    "chips": [
      "Web"
    ]
  },
  {
    "slug": "community-calendar",
    "name": "Community Calendar",
    "group": "Motivate and empower",
    "icon": "icon-calendar-96.png",
    "short": "share and promote events and announcements",
    "desc": ORIGINAL_PRODUCTS["community-calendar"].description,
    "chips": [
      "Screens",
      "Phones",
      "Web",
      "Email"
    ]
  },
  {
    "slug": "community-voices",
    "name": "Community Voices",
    "group": "Motivate and empower",
    "icon": "icon-cv-96.png",
    "short": "images and words drawn from the full diversity of a community",
    "desc": ORIGINAL_PRODUCTS["community-voices"].description,
    "chips": [
      "Screens",
      "Phones",
      "Web"
    ]
  },
  {
    "slug": "stories",
    "name": "Stories",
    "group": "Educate",
    "icon": "icon-stories-96.png",
    "short": "Animated chapters with live data",
    "desc": "",
    "chips": [
      "Screens",
      "Phones",
      "Web"
    ]
  }
];

export const GROUP_ORDER: readonly string[] = [
  "Engage",
  "Educate",
  "Motivate and empower"
];

export const GROUP_COLOR: Readonly<Record<string,string>> = {
  "Engage": "var(--amber)",
  "Educate": "var(--peri)",
  "Motivate and empower": "var(--leaf)"
};

export const AUDIENCES: readonly Audience[] = [
  {
    "slug": "neighborhoods",
    "name": "Neighborhoods",
    "group": "Communities",
    "icon": "icon-neighborhoods-96.png",
    "short": "Shops, clinics, pantries and housing"
  },
  {
    "slug": "cities",
    "name": "Cities and towns",
    "group": "Communities",
    "icon": "icon-cities-96.png",
    "short": "Utilities, libraries and city buildings"
  },
  {
    "slug": "museums",
    "name": "Museums and science centers",
    "group": "Communities",
    "icon": "icon-museums-96.png",
    "short": "Exhibits on live regional data"
  },
  {
    "slug": "campuses",
    "name": "Colleges and universities",
    "group": "Campuses and schools",
    "icon": "icon-campuses-96.png",
    "short": "The campus as a teaching tool"
  },
  {
    "slug": "schools",
    "name": "K-12 schools",
    "group": "Campuses and schools",
    "icon": "icon-schools-96.png",
    "short": "Hallway screens and free lessons"
  }
];

export const CASES: readonly CaseStudy[] = [
  {
    "slug": "oberlin-college",
    "name": "Oberlin College",
    "kind": "Campus",
    "img": "orb-dorm.jpg",
    "fact": "700+ metered points in 85 buildings"
  },
  {
    "slug": "city-of-oberlin",
    "name": "City of Oberlin",
    "kind": "City",
    "img": "hotel-oberlin-sign.jpg",
    "fact": "24 interactive signs around town"
  },
  {
    "slug": "midtown-cleveland",
    "name": "MidTown Cleveland",
    "kind": "Neighborhood",
    "img": "tile-midtown.jpg",
    "fact": "10 partner locations by January 2026"
  },
  {
    "slug": "great-lakes-science-center",
    "name": "Great Lakes Science Center",
    "kind": "Museum",
    "img": "glsc-exhibit.jpg",
    "fact": "Live air and Lake Erie data for Cleveland"
  },
  {
    "slug": "hamilton-college",
    "name": "Hamilton College",
    "kind": "Campus pilot",
    "img": "tile-hamilton.jpg",
    "fact": "A campus dashboard pilot, 2026 to 2027"
  }
];

export const RESOURCES: readonly Triple[] = [
  [
    "education.html",
    "Teacher toolkit",
    "35 free lessons and units"
  ],
  [
    "research.html",
    "Research and publications",
    "What the studies found"
  ],
  [
    "media.html",
    "Media and press",
    "The 2040 film, Doughnut Economics and more"
  ],
  [
    "bring-a-dashboard.html",
    "Bring a dashboard to your community",
    "The steps, from first call to launch"
  ],
  [
    "story-of-dashboard.html",
    "Story of Dashboard",
    "The slideshow, one slide at a time"
  ]
];

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    "img": "live-home-story-01.jpeg",
    "alt": "Participants examining illuminated bulbs during an energy demonstration",
    "pos": "50% 50%",
    "c": "var(--leaf)",
    "ink": "var(--ink)",
    "quote": "I really feel that I am a part of the resource use graphs displayed on the dashboards. This feeling motivates me to be more thoughtful when consuming water and electricity",
    "who": "Grace Gao",
    "role": "Oberlin College Student",
    "link": "digital-signage.html",
    "link_label": "Learn more: Digital Signage",
    "link_icon": "icon-signage-96.png"
  },
  {
    "img": "live-home-story-03.png",
    "alt": "A group discussing the dashboard display and touch-screen exhibit at the Great Lakes Science Center",
    "pos": "50% 50%",
    "c": "var(--peri)",
    "ink": "var(--ink)",
    "quote": "The dashboard signage is stitching together the work of Cleveland organizations to make the team effort apparent",
    "who": "Scott Volmer",
    "role": "Great Lakes Science Center",
    "link": "web-embeddables.html",
    "link_label": "Learn more: Web Embeddables",
    "link_icon": "icon-embed-96.png"
  },
  {
    "img": "live-home-story-07.jpeg",
    "alt": "Shoppers and vendors at an indoor market with vegetables and pumpkins",
    "pos": "50% 50%",
    "c": "var(--amber)",
    "ink": "var(--ink)",
    "quote": "Community Hub’s events calendar has made our work easier. People in the community are participating — it’s simple, but transformative!",
    "who": "Janet Haar, Executive Director Oberlin Business Partnership",
    "role": "",
    "link": "community-calendar.html",
    "link_label": "Learn more: Community Calendar",
    "link_icon": "icon-calendar-96.png"
  },
  {
    "img": "live-home-story-04.jpeg",
    "alt": "Students using laptops displaying the Citywide Dashboard",
    "pos": "50% 50%",
    "c": "var(--violet)",
    "ink": "#fff",
    "quote": "Oberlin is helping us translate water and energy use in 44 school buildings into teaching and learning in the classroom",
    "who": "Bob Mendenhall",
    "role": "Curriculum Director Toledo",
    "link": "building-dashboard.html",
    "link_label": "Learn more: Building Dashboard",
    "link_icon": "icon-building-96.png"
  },
  {
    "img": "cv-slideshow-shot.jpg",
    "alt": "A Community Voices slide as it appears on a sign: tomatoes on the vine with a quote from Mike Cariglio of Lorenzo's Pizza",
    "pos": "50% 50%",
    "c": "var(--red)",
    "ink": "#fff",
    "quote": "When I see the dashboard sign in our lobby, I get that good feeling that people are doing good things",
    "who": "Jennifer Harris",
    "role": "Director of the Oberlin Early Childhood Center",
    "link": "community-voices.html",
    "link_label": "About Community Voices",
    "link_icon": "icon-cv-96.png"
  },
  {
    "img": "live-home-story-08.jpeg",
    "alt": "A speaker addressing a crowd at the corner of College and Main in Oberlin",
    "pos": "50% 50%",
    "c": "var(--leaf-deep)",
    "ink": "#fff",
    "quote": "For a decade we have looked to the CommunityHub team as key partners in translating our energy conservation services into community engagement",
    "who": "Geoff Hunter",
    "role": "President Palmer Conservation Consulting",
    "link": "community-voices.html",
    "link_label": "Learn more: Community Voices",
    "link_icon": "icon-cv-96.png"
  },
  {
    "img": "hotel-oberlin-sign.jpg",
    "alt": "A Community Hub screen in the Hotel at Oberlin lobby",
    "pos": "50% 50%",
    "c": "var(--clay)",
    "ink": "#fff",
    "quote": "You come into our community, you see Environmental Dashboard display signs, and you know what this community is about",
    "who": "Greg Jones",
    "role": "Energy Advocate",
    "link": "digital-signage.html",
    "link_label": "About Digital Signage",
    "link_icon": "icon-signage-96.png"
  },
  {
    "img": "live-home-story-02.jpeg",
    "alt": "Children and a teacher gathered around a dashboard screen in a school hallway",
    "pos": "50% 50%",
    "c": "var(--sky-deep)",
    "ink": "#fff",
    "quote": "When you talk about 21st-century skills - gathering and interpreting data - the Dashboard will be a very important tool",
    "who": "Kim Koos",
    "role": "Elementary Teacher",
    "link": "phone-app.html",
    "link_label": "Learn more: Phone App",
    "link_icon": "icon-phone-96.png"
  },
  {
    "img": "tile-midtown.jpg",
    "alt": "The Cleveland Citywide Dashboard with live air readings, part of the loop on MidTown's screens",
    "pos": "50% 50%",
    "c": "var(--water)",
    "ink": "#fff",
    "quote": "The MidTown Cleveland Dashboard above our checkout counter helps us to communicate that we are locally owned, locally operated and locally involved!",
    "who": "Aaron Saltzman",
    "role": "Co-owner, Dave's Market",
    "link": "midtown-cleveland.html",
    "link_label": "About MidTown Cleveland",
    "link_icon": "icon-neighborhoods-96.png"
  }
];

export const CV_SLIDES: readonly VoiceSlide[] = [
  [
    "cv-kelley-singleton.jpg",
    "Electric substation towers against a blue sky",
    "Not many towns own their own electric utility. We do. So we can control where our electricity comes from.",
    "Kelley Singleton",
    "Long time Oberlin resident",
    "peri",
    "Climate Action"
  ],
  [
    "cv-jason-adelman.jpg",
    "Jason Adelman leaning on the bar at The Feve",
    "The quality of local food is way better. You're buying from a face instead of a company.",
    "Jason Adelman",
    "Owner of The Feve",
    "violet",
    "Serving Our Community"
  ],
  [
    "cv-leigha.jpg",
    "A circular garden labyrinth beside a small house, seen from above",
    "My favorite way to interact with the environment is to plant things and make the planet brighter.",
    "Leigha",
    "6th Grade Student at Langston Middle School",
    "leaf-deep",
    "Natural Oberlin"
  ],
  [
    "cv-lydia.jpg",
    "A parent and child reading together on a classroom rug",
    "Our son is in kindergarten so it's our first Ecolympics. We're excited.",
    "Lydia",
    "Oberlin Community Member",
    "amber",
    "Next Generation"
  ],
  [
    "cv-greg-jones.jpg",
    "Greg Jones smiling in a garden",
    "Being Oberlin's Energy Advocate is not just a job, 9 to 5, I kind of live it and breathe it.",
    "Greg Jones",
    "Energy Advocate at POWER",
    "amber",
    "Neighbors"
  ],
  [
    "cv-mike-cariglio.jpg",
    "Green tomatoes ripening on the vine",
    "I'm old school. I don't buy anything pre-made. It takes more labor to control it from start to finish, but the quality is better.",
    "Mike Cariglio",
    "Owner Lorenzo’s Pizza",
    "clay",
    "Our Downtown"
  ],
  [
    "cv-matthew-dewitt.jpg",
    "High school students posing behind a Climate Anxiety Counseling booth",
    "We're raising awareness about the future. Later is too late.",
    "Matthew Dewitt",
    "OHS '25",
    "peri",
    "Climate Action"
  ],
  [
    "cv-lillie-estes.jpg",
    "Students loading boxes of food into a car",
    "Communities are only sustained when people care about each other and have a sense of interconnectedness.",
    "Lillie Estes",
    "OC '22",
    "amber",
    "Neighbors"
  ]
];

export const CV_COLOR: Readonly<Record<string,string>> = {
  "peri": "#2f7d3a",
  "amber": "#2f7d3a",
  "leaf-deep": "#2f7d3a",
  "clay": "#2f7d3a",
  "violet": "#2f7d3a",
  "red": "#2f7d3a"
};

export const TIMELINE: readonly Triple[] = [
  [
    "2000",
    "Feedback work starts",
    "The Adam Joseph Lewis Center opens at Oberlin College, with feedback built into the building."
  ],
  [
    "2004",
    "U.S. EPA support",
    "The U.S. EPA supports early building dashboard work at Lucid."
  ],
  [
    "2006",
    "The first dorm competition",
    "Oberlin residence halls compete to cut electricity and water use. Ecolympics begins."
  ],
  [
    "2008",
    "Environmental Dashboard",
    "The Oberlin pilot starts with support from the Great Lakes Protection Fund: Building Dashboard, Citywide Dashboard, Community Voices and the calendar."
  ],
  [
    "2018",
    "Hub Analytics",
    "We build Hub Analytics, our own data platform. Community Hub grows out of it."
  ],
  [
    "2021",
    "MidTown Cleveland",
    "Partnerships and design work begin for a neighborhood dashboard."
  ],
  [
    "2024",
    "Stories",
    "Oberlin College's C-Neutral Stories go through fall 2024 focus groups with alumni, parents, admissions staff, tour guides and students."
  ],
  [
    "2026",
    "MidTown grows, Hamilton starts a pilot",
    "MidTown reaches 10 partner locations in January. Hamilton College starts a campus pilot in May."
  ]
];

export const FUNDERS: readonly string[] = [
  "U.S. EPA",
  "Ohio EPA",
  "Great Lakes Protection Fund",
  "The Cleveland Foundation",
  "Andrew W. Mellon Foundation",
  "Great Lakes Colleges Association",
  "City of Oberlin",
  "Oberlin College",
  "The Oberlin Project",
  "State Farm Youth Advisory Board"
];

export const ORG_LD: Record<string,unknown> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Community Hub",
  "alternateName": "CommunityHub",
  "url": "https://www.communityhub.cloud/",
  "email": "connect@communityhub.cloud",
  "logo": "https://www.communityhub.cloud/assets/icon-ch.png",
  "foundingLocation": {
    "@type": "Place",
    "name": "Oberlin, Ohio"
  },
  "description": "Software and design services that turn live energy, water and community data into digital signage, phone pages and web dashboards for schools, campuses, museums and cities. Community Hub builds and runs the software behind Oberlin's Environmental Dashboard, which began in 2008.",
  "makesOffer": PRODUCTS.map(product => ({
    "@type": "Offer",
    "itemOffered": { "@type": "SoftwareApplication", "name": product.name },
  }))
};

// Official partner destinations checked October 1, 2026. City and GLSC host
// embeds; College and Schools link to their public dashboards from these pages.
// Do not describe those latter links as verified partner-hosted embeds.
export const ORG_SITES: readonly Triple[] = [
  [
    "https://oberlin.communityhub.cloud/dh-public/heat-map/969/",
    "City of Oberlin Sustainability",
    "https://cityofoberlin.com/city-government/departments/sustainability/"
  ],
  [
    "https://oberlin.communityhub.cloud/dh-public/time-series-chart/embed/0/",
    "City of Oberlin Sustainability",
    "https://cityofoberlin.com/city-government/departments/sustainability/"
  ],
  [
    "https://oberlin.communityhub.cloud/dh-public/oc-embed",
    "Oberlin College Environmental Dashboard",
    "https://www.oberlin.edu/arts-and-sciences/departments/environmental-studies/dashboard"
  ],
  [
    "https://cleveland.communityhub.cloud/dh-public/glsc-embed",
    "Great Lakes Science Center Environmental Dashboard",
    "https://greatscience.com/explore/exhibits/environmental-dashboard"
  ],
  [
    "https://oberlin.communityhub.cloud/dh-public/ops-embed",
    "Oberlin City Schools",
    "https://www.oberlinschools.net/#h.78ca501b910ca40b_115"
  ],
  [
    "https://oberlin.communityhub.cloud/dh-public/city-of-oberlin",
    "City of Oberlin Sustainability",
    "https://cityofoberlin.com/city-government/departments/sustainability/"
  ],
  [
    "https://environmentaldashboard.org/cwd-files/kiosk.php",
    "City of Oberlin Sustainability",
    "https://cityofoberlin.com/city-government/departments/sustainability/"
  ]
];

export const DATA_VIEWS: readonly DataView[] = [
  {
    "key": "heat",
    "tab": "Heat map",
    "title": "Whole city electricity, last 60 days",
    "src": "https://oberlin.communityhub.cloud/fe/api/data-hub-v2/visualizations/heat-map/969/chart-window/last-60-days",
    "live": "https://oberlin.communityhub.cloud/dh-public/heat-map/969/chart-window/last-60-days?show-header=1&show-chart-title=1",
    "note": "A heat map uses color to show recurring and changing patterns of use. Each column is an hour of the day and each row is one day, so every small rectangle is one hour of one day. Red means highest use, dark green means lowest, and yellow is in between."
  },
  {
    "key": "load",
    "tab": "Load profile",
    "title": "Whole city electricity today, every 15 minutes",
    "src": "https://oberlin.communityhub.cloud/fe/api/data-hub-v2/visualizations/time-series/972/chart-window/today",
    "live": "https://oberlin.communityhub.cloud/dh-public/time-series-chart/embed/0/chart-window/today?variableId=45660",
    "note": "A load profile shows how use rises and falls through the day. The line is today's electricity for the whole city. The shaded area is typical use for the same time of day, so you can see whether today is running above or below normal."
  },
  {
    "key": "building",
    "tab": "Building",
    "title": "Oberlin College's public building dashboard",
    "live": "https://oberlin.communityhub.cloud/dh-public/oc-embed?active-page=exploreData&active-data-dashboard=805",
    "shot": "mini-oc-embed.jpg",
    "note": "A building dashboard shows one building's electricity, water and heating use in real time. This is Oberlin College's public dashboard, where anyone can open any of 85 campus buildings."
  },
  {
    "key": "city",
    "tab": "Citywide",
    "title": "Oberlin's Citywide Dashboard",
    "live": "https://environmentaldashboard.org/cwd-files/kiosk.php",
    "shot": "mini-cwd.jpg",
    "note": "The Citywide Dashboard is an animated drawing of the whole town. Live electricity, drinking water, wastewater, stream and weather data move through it, and Flash the energy squirrel reacts to the numbers."
  }
];

export const NEXT: Readonly<Record<string,LinkPreview>> = {
  "data-dashboard": [
    "data-dashboard.html#orbs",
    "orb-dorm.jpg",
    "See the orb map",
    "Buildings as glowing orbs, playing now"
  ],
  "products": [
    "products.html",
    "student-data-hub.jpg",
    "All products",
    "How the platform fits together"
  ],
  "dashboards": [
    "dashboards.html",
    "kids-citywide-screen.jpg",
    "Dashboard demos",
    "Client dashboards, loading live"
  ],
  "stories": [
    "stories.html#play",
    "art-choose-story.jpg",
    "Play a story",
    "An animated data story"
  ],
  "community-calendar": [
    "community-calendar.html#live",
    "street-event.jpg",
    "This week's events",
    "Oberlin and Cleveland, live"
  ],
  "community-voices": [
    "community-voices.html",
    "cv-slideshow-shot.jpg",
    "Community Voices",
    "Neighbors' photos and words"
  ],
  "digital-signage": [
    "digital-signage.html",
    "hotel-oberlin-sign.jpg",
    "Digital signage",
    "Screens in lobbies and shop windows"
  ],
  "cities": [
    "cities.html",
    "oberlin-aerial.jpg",
    "For cities",
    "A whole town's water, power and air"
  ],
  "campuses": [
    "campuses.html",
    "town-gown-kids.jpg",
    "For campuses",
    "Dorm competitions and orbs"
  ],
  "schools": [
    "schools.html",
    "classroom-dashboard.jpg",
    "For schools",
    "Building data in the classroom"
  ],
  "education": [
    "education.html",
    "kid-lightbulb.jpg",
    "Teacher toolkit",
    "Lessons built on your town's data"
  ],
  "research": [
    "research.html",
    "rs-empathetic-gauges.jpg",
    "The research",
    "Why feedback changes behavior"
  ],
  "pricing": [
    "pricing.html",
    "downtown-shop.jpg",
    "Pricing",
    "Packages and what they include"
  ],
  "oberlin-college": [
    "oberlin-college.html",
    "cs-ecolympics-table.jpg",
    "Case study: Oberlin College",
    "Twenty years of dorm competitions"
  ],
  "about": [
    "about.html",
    "team-john.jpg",
    "About us",
    "Who we are and how we started"
  ]
};

export const NEXT_FOR: Readonly<Record<string,readonly string[]>> = {
  "products": [
    "data-dashboard",
    "dashboards",
    "pricing"
  ],
  "data-dashboard": [
    "dashboards",
    "stories",
    "pricing"
  ],
  "data-hub": [
    "data-dashboard",
    "education",
    "pricing"
  ],
  "the-hub": [
    "data-dashboard",
    "education",
    "pricing"
  ],
  "stories": [
    "data-dashboard",
    "campuses",
    "pricing"
  ],
  "community-calendar": [
    "community-voices",
    "digital-signage",
    "pricing"
  ],
  "community-voices": [
    "community-calendar",
    "digital-signage",
    "pricing"
  ],
  "digital-signage": [
    "community-calendar",
    "data-dashboard",
    "pricing"
  ],
  "web-embeddables": [
    "digital-signage",
    "data-dashboard",
    "pricing"
  ],
  "phone-app": [
    "stories",
    "data-dashboard",
    "pricing"
  ],
  "cities": [
    "data-dashboard",
    "dashboards",
    "pricing"
  ],
  "neighborhoods": [
    "community-voices",
    "community-calendar",
    "pricing"
  ],
  "campuses": [
    "data-dashboard",
    "oberlin-college",
    "pricing"
  ],
  "schools": [
    "education",
    "data-dashboard",
    "pricing"
  ],
  "museums": [
    "data-dashboard",
    "stories",
    "pricing"
  ],
  "dashboards": [
    "data-dashboard",
    "products",
    "pricing"
  ],
  "pricing": [
    "products",
    "dashboards",
    "about"
  ],
  "education": [
    "schools",
    "research",
    "dashboards"
  ],
  "research": [
    "education",
    "dashboards",
    "about"
  ],
  "about": [
    "products",
    "dashboards",
    "research"
  ]
};

const productBySlug = Object.fromEntries(PRODUCTS.map(p => [p.slug, p]));
export const PBY: Readonly<Record<string, Product>> = {
  ...productBySlug,
  // Existing links keep their combined detail route; navigation names the two
  // original products separately and reaches their established detail sections.
  "data-dashboard": {
    ...productBySlug["building-dashboard"],
    slug: "data-dashboard",
    name: "Building Dashboard and Citywide Dashboard",
    desc: `${ORIGINAL_PRODUCTS["building-dashboard"].description} ${ORIGINAL_PRODUCTS["citywide-dashboard"].description}`,
  },
};
export const ABY: Readonly<Record<string, Audience>> = Object.fromEntries(AUDIENCES.map(a => [a.slug, a]));

export const DASH_DEMOS: readonly LinkPreview[] = [
  [
    "dashboards.html#great-lakes-science-center",
    "icon-museums-96.png",
    "Great Lakes Science Center",
    "The Cleveland Environmental Dashboard"
  ],
  [
    "dashboards.html#oberlin-city-schools",
    "icon-schools-96.png",
    "Oberlin City Schools",
    "Every building in the district"
  ],
  [
    "dashboards.html#oberlin-college",
    "icon-campuses-96.png",
    "Oberlin College",
    "Dorms and campus buildings"
  ],
  [
    "dashboards.html#city-of-oberlin",
    "icon-cities-96.png",
    "City of Oberlin",
    "Town-wide electricity and water"
  ],
  [
    "the-hub.html#live",
    "icon-datahub-96.png",
    "Data Hub",
    "The Oberlin Public Library's data"
  ]
];

export const LIVE_DEMOS: readonly LinkPreview[] = [
  [
    "data-dashboard.html#orbs",
    "icon-orb-96.png",
    "Orbs",
    "Oberlin College buildings, replaying yesterday's use"
  ],
  [
    "data-dashboard.html#citywide",
    "icon-cwd-96.png",
    "Citywide Dashboard",
    "Oberlin's water, power and weather, animated"
  ],
  [
    "data-dashboard.html#building",
    "icon-building-96.png",
    "Building dashboard",
    "One building's use, in real time"
  ],
  [
    "community-calendar.html#live",
    "icon-calendar-96.png",
    "Community calendar",
    "This week's events in Oberlin and Cleveland"
  ],
  [
    "community-voices.html#wall",
    "icon-cv-96.png",
    "Community Voices",
    "Neighbors' photos and words"
  ],
  [
    "stories.html#play",
    "icon-stories-96.png",
    "Stories",
    "Play an animated story with live data"
  ]
];
