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
  { id: "team", label: "Our team" },
  { id: "supporters", label: "Supporters" },
];
  return { STOPS };
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
  { name: "Implementation guide", line: "Bringing Environmental Dashboard to Your Community: approach, technology and implementation.", href: "/bring-dashboard-to-your-community", label: "Read the guide" },
  { name: "Press & Media", line: "Coverage of Environmental Dashboard, including its appearance in the film 2040.", href: "https://environmentaldashboard.org/press-page", label: "Explore coverage" },
  { name: "Dashboards", line: "Client dashboards running now, with real data.", href: "/implementations", label: "Visit our dashboards" },
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
    src: "/assets/live-home-story-03.png",
    alt: "A screen and touch kiosk at the Great Lakes Science Center, Cleveland",
    title: placeTitle("Great Lakes Science Center", "Exhibit"),
    caption: "A screen and touch kiosk at the Great Lakes Science Center, Cleveland.",
  },
  {
    src: "/assets/glsc-exhibit.jpg",
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
        blurb: "Electricity and water for buildings and groups of buildings",
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
      {
        id: "lorawan",
        title: "LoRaWAN",
        blurb: "Private sensor networks for schools and campuses",
        href: "/lorawan",
      },
      {
        id: "studios",
        title: "Studios",
        blurb: "Maps, stories and signage loops made from live data",
        href: "/studios",
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



// from src/components/chapters.tsx
const chapters = (() => {
const PROBLEM =
  "Communities are full of people doing good work. They lack the ability to easily share information with each other, and miss resources and connections they need.";
  return { PROBLEM };
})();

// from src/components/not-found.tsx
const notFound = (() => {
const LINKS = [
  { href: "/", label: "Home", note: "The film, the products and what people say" },
  { href: "/products", label: "All products", note: "Signs, embeds, dashboards, calendar, voices and stories" },
  { href: "/implementations", label: "Implementations", note: "The city, the college, the schools, MidTown Cleveland and the Science Center" },
  { href: "/contact", label: "Contact us", note: "Ask about Community Hub for your community" },
  { href: "/story", label: "Story of the Dashboard", note: "How it started and where it goes" },
];
  return { LINKS };
})();

// from src/components/site-footer.tsx
const siteFooter = (() => {
const DOORS = [
  { href: WHO_HREF, label: "Who It\u2019s For" },
  { href: PRICING_HREF, label: "Pricing" },
] as const;
  return { DOORS };
})();

// from src/components/site-header.tsx
const siteHeader = (() => {
// The menu John and Maddie settled on in their review of 19 Nov 2026 (52:03-54:17): "home, products, implementations,
// bring dashboard to your community, resources, about us ... and then contact us". Pricing sits under Bring Dashboard to
// Your Community ("having pricing on the top just feels so crass"), Story is "Story of the Dashboard" under About Us, and
// every item with pages under it opens a menu. The footer and the breadcrumbs are built from this same list.
type NavChild = { href: string; label: string };
type NavItem = { to: string; label: string; children?: NavChild[] };
const NAV: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  {
    to: "/implementations",
    label: "Implementations",
    children: [
      { href: "/implementations", label: "All implementations" },
      { href: "/implementations/city-of-oberlin", label: "City of Oberlin" },
      { href: "/implementations/midtown-cleveland", label: "MidTown Cleveland" },
      { href: "/implementations/oberlin-public-schools", label: SCHOOLS_NAME },
      { href: "/implementations/oberlin-college", label: "Oberlin College" },
      { href: "/implementations/great-lakes-science-center", label: "Great Lakes Science Center" },
    ],
  },
  {
    to: BRING_HREF,
    label: "Bring Dashboard to Your Community",
    children: [
      { href: "/communities", label: "Communities" },
      { href: BRING_HREF, label: "Implementation guide" },
      { href: PRICING_HREF, label: "Pricing" },
    ],
  },
  {
    to: "/resources",
    label: "Resources",
    children: [
      { href: "/resources", label: "All resources" },
      { href: "/toolkit", label: "Teacher toolkit" },
    ],
  },
  {
    to: "/about",
    label: "About Us",
    children: [
      { href: "/about", label: "Our mission" },
      { href: "/about#team", label: "Our team" },
      { href: "/story", label: "Story of the Dashboard" },
      { href: "/research", label: "Research" },
    ],
  },
  { to: "/contact", label: "Contact us" },
];
  return { NAV };
})();

// Browser tab titles and the search-engine descriptions (read by each route's head()).
// from src/routes/communities.tsx
const communities = {
  lede: "The kinds of communities that use Community Hub. Each card opens a place where it runs today.",
};

const meta = {
  home: { title: "Community Hub" },
  ogDescription: { text: "Community Hub is a community-centered communication platform that connects people with local information, resources and each other." },
  about: { title: "About — Community Hub" },
  communities: { title: "Communities — Community Hub", description: "Cities, neighborhoods, schools, campuses and museums using Community Hub, each with its real place." },
  pricing: { title: "Pricing — Community Hub", description: "Three Community Hub bundles, each quoted for your site." },
  products: { title: "Products and Services — Community Hub" },
  story: { title: "Story of the Dashboard — Community Hub", description: "The Story of the Dashboard presentation, and its original slides." },
  digitalSignage: { title: "Digital Signage — Community Hub" },
  resources: { title: "Resources — Community Hub" },
  research: { title: "Research — Community Hub" },
  toolkit: { title: "Teacher toolkit — Community Hub" },
};

export const pc = { meta, about, communities, pricing, resources, digitalSignage, products, research, story, toolkit, chapters, notFound, siteFooter, siteHeader };
