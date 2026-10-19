// Text and links that used to be constants at the top of the pages and components, in one place.
// Created once by a script; add new ones by hand. The editor patches these in place, and the pages read them when they render.

import { placeTitle, type SlideFrame } from "@/lib/content";
import { SCHOOLS_NAME } from "@/lib/names";
import { BRING_HREF, ORB_HREF, PRICING_HREF, WHO_HREF } from "@/lib/links";
import { site } from "@/lib/site";

// from src/routes/about.tsx
const about = (() => {
const STOPS = [
  { id: "about", label: "About" },
  { id: "origin", label: "Where it began" },
  { id: "supporters", label: "Supporters" },
];
  return { STOPS };
})();

// from src/routes/demos.tsx
const demos = (() => {
const TITLE = "Dashboards";
const LEDE = "Four places that run Community Hub, with a link to each.";
// One screen each: the live demo, who uses it, how to read it, what it changed, how to get one.
const STOPS = [
  { id: "page", label: TITLE },
  { id: "who", label: "Who uses it" },
  { id: "read", label: "How to read it" },
  { id: "changed", label: "Results" },
  { id: "bring", label: "Bring one to your town" },
] as const;
  return { TITLE, LEDE, STOPS };
})();

// from src/routes/pricing.tsx
const pricing = (() => {
const STOPS = [
  { id: "pricing", label: "Pricing" },
  { id: "services", label: "Design services" },
  { id: "questions", label: "Questions" },
] as const;
  return { STOPS };
})();

// from src/routes/resources.tsx
const resources = (() => {
const TITLE = "Resources";
const LEDE = "Explore research, teaching materials, implementation guidance and examples of Community Hub in use.";
const ITEMS = [
  { name: "Story of the Dashboard", line: "A slide deck on how Dashboard began and what it is for.", href: "/story", label: "View the deck" },
  { name: "Research", line: "Papers on why live feedback changes behavior.", href: "/research", label: "Read the research" },
  { name: "Teacher toolkit", line: "35 free lessons and units built on live building data.", href: "/toolkit", label: "Browse the lessons" },
  { name: "Implementation guide", line: "Bringing Environmental Dashboard to Your Community: approach, technology and implementation.", href: "https://environmentaldashboard.org/bring-dashboard-to-your-community", label: "Read the guide" },
  { name: "Press & Media", line: "Coverage of Environmental Dashboard, including its appearance in the film 2040.", href: "https://environmentaldashboard.org/press-page", label: "Explore coverage" },
  { name: "Dashboards", line: "Client dashboards running now, with real data.", href: "/demos", label: "Visit our dashboards" },
];
const STOPS = [{ id: "media", label: TITLE }];
  return { TITLE, LEDE, ITEMS, STOPS };
})();

// from src/routes/digital-signage.tsx
const digitalSignage = (() => {
const OBERLIN: SlideFrame[] = [
  {
    src: "/assets/oberlin-aerial.jpg",
    alt: "Aerial view of Oberlin, Ohio",
    title: placeTitle("City of Oberlin", "Aerial view"),
    caption:
      `24 interactive screens run in ${SCHOOLS_NAME}, the public library, a food pantry, downtown businesses, City Hall, the Fire Station, a retirement community and churches.`,
  },
  {
    src: "/assets/cafe-window-sign.jpg",
    alt: "A Community Hub screen in the window of Slow Train Cafe, downtown Oberlin",
    title: placeTitle("City of Oberlin", "Slow Train Cafe"),
    caption: "A Community Hub screen in the window of Slow Train Cafe, downtown Oberlin.",
  },
];
const CAMPUS: SlideFrame[] = [
  {
    src: "/assets/glsc-exhibit.jpg",
    alt: "A screen and touch kiosk at the Great Lakes Science Center, Cleveland",
    title: placeTitle("Great Lakes Science Center", "Exhibit"),
    caption: "A screen and touch kiosk at the Great Lakes Science Center, Cleveland.",
  },
  {
    src: "/assets/glsc-workshop.jpg",
    alt: "Students and staff in front of a dashboard screen and a touch tablet",
    title: placeTitle("Great Lakes Science Center", "Workshop"),
    caption: "Students and staff in front of a dashboard screen and a touch tablet.",
  },
  {
    src: "/assets/photos/oc-students-2025/oc-students-2025-01.jpg",
    alt: "Oberlin College students",
    title: placeTitle("Oberlin College", "Campus signs"),
    caption: "Oberlin College has 12 signs on campus.",
  },
];
const LABELS = [
  "Digital Signage",
  "What the screen shows",
  "Dave's Market",
  "How phone control works",
  "Use your phone",
  "Try the phone",
  "Oberlin",
  "Cleveland and campus",
  "Keep exploring",
];
  return { OBERLIN, CAMPUS, LABELS };
})();

// from src/routes/products.tsx
const products = (() => {
const GROUPS: { kicker: string; items: { id: string; title: string; blurb: string; href: string }[] }[] = [
  {
    kicker: "Engage",
    items: [
      {
        id: "signage",
        title: "Digital Signage",
        blurb: "Screens in public places. Your phone chooses what they show",
        href: "/digital-signage",
      },
      {
        id: "phone",
        title: "Phone App",
        blurb: "Viewers can access content that interests them on their phone, and can also control the digital sign nearest to them",
        href: "/phone-app",
      },
      {
        id: "embed",
        title: "Web Embeddables",
        blurb: "A calendar, a chart, or a dashboard, on a partner's own website",
        href: "/web-embeddables",
      },
    ],
  },
  {
    kicker: "Educate",
    items: [
      {
        id: "building",
        title: "Building Dashboard",
        blurb: "Electricity and water for one building",
        href: "/dashboard-builder",
      },
      {
        id: "city",
        title: "Citywide Dashboard",
        blurb: "Power, drinking water, and the weather, for the whole town",
        href: "/citywide-dashboard",
      },
      {
        id: "hub",
        title: "Data Hub",
        blurb: "Collect, manage and visualize resource data",
        href: "/data-hub",
      },
      {
        id: "stories",
        title: "Stories",
        blurb: "How local systems work, one chapter at a time",
        href: "/stories",
      },
    ],
  },
  {
    kicker: "Motivate and Empower",
    items: [
      {
        id: "calendar",
        title: "Community Calendar",
        blurb: "Neighbors and organizations post events",
        href: "/community-calendar",
      },
      {
        id: "voices",
        title: "Community Voices",
        blurb: "Images, ideas and actions shared by community members",
        href: "/community-voices",
      },
    ],
  },
];
const LEDE = "Choose a product to see how it works.";
  return { GROUPS, LEDE };
})();

// from src/routes/research.tsx
const research = (() => {
const TITLE = "Research and publications";
const LEDE =
  "Environmental Dashboard began as research at Oberlin College on feedback: what people do when they can see the energy and water they use. These are our papers.";
  return { TITLE, LEDE };
})();

// from src/routes/story.tsx
const story = (() => {
const STOPS = [
  { id: "story", label: "Story of the Dashboard" },
];
  return { STOPS };
})();

// from src/routes/toolkit.tsx
const toolkit = (() => {
const TITLE = "Teacher toolkit";
const CREDIT_URL = "https://environmentaldashboard.org/edresources";
const LEDE = "{count} free lessons and units that use the dashboards in the classroom. Each opens on the Environmental Dashboard site.";
  return { TITLE, CREDIT_URL, LEDE };
})();

// from src/routes/who.tsx
const who = (() => {
const TITLE = "Who it’s for";
const STOPS = [
  { id: "who", label: TITLE },
  { id: "example", label: "An example" },
] as const;
  return { TITLE, STOPS };
})();

// from src/routes/work.tsx
const work = (() => {
const TITLE = "Where it runs";
const LEDE =
  "Explore Community Hub in communities, schools and organizations.";
const CASES = [
  {
    id: "oberlin",
    name: "City of Oberlin",
    tag: "City",
    line: "Citywide water and electricity data, community events and public displays.",
    poster: "/media/embed-city-of-oberlin.webp",
    alt: "Preview of the City of Oberlin dashboard",
    live: "https://oberlin.communityhub.cloud/dh-public/city-of-oberlin",
  },
  {
    id: "midtown",
    name: "MidTown Cleveland",
    tag: "Neighborhood",
    line: "Neighborhood partners sharing a calendar and dashboard, from shops to community centers.",
    poster: "/media/embed-calendar.webp",
    alt: "Preview of the MidTown Cleveland calendar",
    live: "https://cleveland.communityhub.cloud/calendar/?embed=1&show-menu-bar=1",
  },
  {
    id: "glsc",
    name: "Great Lakes Science Center",
    tag: "Science center",
    line: "Live air and Lake Erie data powering an interactive environmental exhibit in Cleveland.",
    poster: "/media/embed-great-lakes-science-center.webp",
    alt: "Preview of the Great Lakes Science Center dashboard",
    live: "https://cleveland.communityhub.cloud/dh-public/glsc-embed",
  },
  {
    id: "college",
    name: "Oberlin College",
    tag: "College",
    line: "Campus resource dashboards, conservation competitions and Carbon Neutral Stories.",
    poster: "/media/embed-campus.webp",
    alt: "Preview of the Oberlin College dashboard",
    live: "https://oberlin.communityhub.cloud/dh-public/oc-embed",
  },
  {
    id: "schools",
    name: SCHOOLS_NAME,
    tag: "School district",
    line: "Every building in the district on one dashboard, plus Ecolympics competitions that cut water and electricity use.",
    poster: "/media/embed-oberlin-city-schools.webp",
    alt: `Preview of the ${SCHOOLS_NAME} dashboard`,
    live: "https://oberlin.communityhub.cloud/dh-public/ops-embed",
  },
];
/** Three cleared MidTown-area quotes, credited to the organization only. */
const VOICES = [
  {
    org: "Dave’s Market",
    quote: "The MidTown Cleveland Dashboard above our checkout counter helps us to communicate that we are locally owned, locally operated and locally involved!",
  },
  {
    org: "Oberlin Business Partnership",
    quote: "Community Hub’s events calendar has made our work easier. People in the community are participating — it’s simple, but transformative.",
  },
  {
    org: "Palmer Conservation Consulting",
    quote: "For a decade we have looked to the Community Hub team as key partners in translating our energy conservation services into community engagement.",
  },
];
  return { TITLE, LEDE, CASES, VOICES };
})();

// from src/components/chapters.tsx
const chapters = (() => {
const PROBLEM =
  "Communities are full of people doing good work. They lack the ability to easily share information with each other, and miss resources and connections they need.";
  return { PROBLEM };
})();

// from src/components/not-found.tsx
const notFound = (() => {
const LINKS = [
  { href: "/", label: "Home", note: "The story, from the voices to the footer" },
  { href: "/products", label: "All products", note: "Signs, embeds, dashboards, calendar, voices and stories" },
  { href: "/demos", label: "Dashboards", note: "Four places that run Community Hub" },
  { href: "/work", label: "Where it runs", note: "The city, the college, the schools, Cleveland and MidTown" },
  { href: "/story", label: "Story of the Dashboard", note: "How it started and where it goes" },
];
  return { LINKS };
})();

// from src/components/site-footer.tsx
const siteFooter = (() => {
const FOOTER: { title: string; links: { href: string; label: string; hideOnPhone?: boolean }[] }[] = [
  {
    title: "Products",
    links: [
      { href: "/digital-signage", label: "Digital Signage" },
      { href: "/phone-app", label: "Phone App" },
      { href: "/web-embeddables", label: "Web Embeddables" },
      { href: "/dashboard-builder", label: "Building Dashboard" },
      { href: "/citywide-dashboard", label: "Citywide Dashboard" },
      { href: "/data-hub", label: "Data Hub" },
      { href: "/stories", label: "Stories" },
      { href: "/community-voices", label: "Community Voices" },
      { href: "/community-calendar", label: "Community Calendar" },
      { href: ORB_HREF, label: "Environmental Orb" },
    ],
  },
  {
    title: "Where it runs",
    links: [
      { href: "/work", label: "Overview" },
      { href: "/work#oberlin", label: "City of Oberlin" },
      { href: "/work#college", label: "Oberlin College" },
      { href: "/work#schools", label: SCHOOLS_NAME },
      { href: "/work#midtown", label: "MidTown Cleveland" },
      { href: "/work#glsc", label: "Great Lakes Science Center" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/toolkit", label: "Teacher toolkit" },
      { href: "/research", label: "Research" },
      { href: "/resources", label: "Resources" },
      { href: "/story", label: "Story of the Dashboard" },
      { href: "/about", label: "About" },
      { get href() { return site.contactHref; }, label: "Contact us", hideOnPhone: true },
    ],
  },
];
const DOORS = [
  { href: WHO_HREF, label: "Who it\u2019s for" },
  { href: PRICING_HREF, label: "Pricing" },
  { href: BRING_HREF, label: "Bring one" },
] as const;
  return { FOOTER, DOORS };
})();

// from src/components/site-header.tsx
const siteHeader = (() => {
const NAV = [
  { to: "/products", label: "Products" },
  { to: "/demos", label: "Dashboards" },
  { to: "/story", label: "Story" },
  { to: "/research", label: "Research" },
  { to: "/about", label: "About" },
] as const;
  return { NAV };
})();

// Browser tab titles and the search-engine descriptions (read by each route's head()).
const meta = {
  home: { title: "Community Hub" },
  ogDescription: { text: "Community Hub is a community-centered communication platform that connects people with local information, resources and each other." },
  about: { title: "About — Community Hub" },
  demos: { title: "Dashboards — Community Hub" },
  pricing: { title: "Pricing — Community Hub", description: "Three Community Hub bundles, each quoted for your site." },
  products: { title: "Products and Services — Community Hub" },
  story: { title: "Story of the Dashboard — Community Hub", description: "The Story of the Dashboard presentation, and its original slides." },
  work: { title: "Where it runs — Community Hub" },
  digitalSignage: { title: "Digital Signage — Community Hub" },
  resources: { title: "Resources — Community Hub" },
  research: { title: "Research — Community Hub" },
  toolkit: { title: "Teacher toolkit — Community Hub" },
  who: { title: "Who it’s for — Community Hub" },
};

export const pc = { meta, about, demos, pricing, resources, digitalSignage, products, research, story, toolkit, who, work, chapters, notFound, siteFooter, siteHeader };
