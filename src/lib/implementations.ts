// The five places that run Community Hub, as the live site's /implementations page lists them (November 2026).
// One source for the home page, the implementations index and the five case pages. Registered with the CMS.
import { getEmbed } from "@/data/embeds";
import { SCHOOLS_NAME } from "@/lib/names";

export type ImplementationGroup = {
  id: "cities" | "schools" | "campuses" | "museums";
  title: string;
  description: string;
};

export type Implementation = {
  slug: string;
  name: string;
  /** What kind of place it is, shown after the name. */
  kind: string;
  group: ImplementationGroup["id"];
  /** The audience on the home page that this place answers (an id in src/lib/who.ts). */
  audience: "cities" | "neighborhoods" | "schools" | "campuses" | "museums";
  summary: string;
  image: string;
  alt: string;
  /** The label of the link to the live view. */
  liveLabel: string;
};

export const implementationIntro = {
  title: "Implementations",
  lede: "Explore Community Hub in communities, schools and organizations. Each place has its story and its whole live dashboard.",
};

export const implementationGroups: ImplementationGroup[] = [
  {
    id: "cities",
    title: "Cities and Neighborhoods",
    description:
      "Citywide dashboards, a community calendar and public screens that show live electricity, water and air data. In neighborhoods, a shared calendar, jobs board and public screens keep shops, clinics, pantries and housing connected.",
  },
  {
    id: "schools",
    title: "K–12 Schools",
    description: "Hallway screens, animated stories and 35 free lessons that let students see how their school uses water and electricity.",
  },
  {
    id: "campuses",
    title: "Colleges and Universities",
    description: "Dorm competitions, orb maps and animated stories that make the campus a teaching tool.",
  },
  {
    id: "museums",
    title: "Museums",
    description: "Live regional data and animated stories that turn exhibits on energy, water and air into real-time learning.",
  },
];

export const implementations: Implementation[] = [
  {
    slug: "city-of-oberlin",
    name: "City of Oberlin",
    kind: "City",
    group: "cities",
    audience: "cities",
    summary: "Citywide water and electricity data, community events and public displays.",
    image: "/assets/live-home-story-08.jpeg",
    alt: "A speaker addressing a crowd at College and Main in Oberlin",
    liveLabel: "Live dashboard",
  },
  {
    slug: "midtown-cleveland",
    name: "MidTown Cleveland",
    kind: "Neighborhood",
    group: "cities",
    audience: "neighborhoods",
    summary: "Neighborhood partners sharing a calendar and dashboard, from shops to community centers.",
    image: "/assets/eng-sign-daves-full.jpg",
    alt: "The full Dave’s Market installation, with a MidTown screen, QR instructions, and a person holding the phone controller",
    liveLabel: "Live calendar",
  },
  {
    slug: "oberlin-public-schools",
    name: "Oberlin Public Schools",
    kind: "School district",
    group: "schools",
    audience: "schools",
    summary: "Every building in the district on one dashboard, plus Ecolympics competitions that cut water and electricity use.",
    image: "/assets/live-home-story-02.jpeg",
    alt: "Children and a teacher gathered around a dashboard screen in a school hallway",
    liveLabel: "Live dashboard",
  },
  {
    slug: "oberlin-college",
    name: "Oberlin College",
    kind: "College",
    group: "campuses",
    audience: "campuses",
    summary: "Campus resource dashboards, conservation competitions and Carbon Neutral Stories.",
    image: "/assets/live-home-story-01.jpeg",
    alt: "Participants examining illuminated bulbs during an energy demonstration",
    liveLabel: "Live dashboard",
  },
  {
    slug: "great-lakes-science-center",
    name: "Great Lakes Science Center",
    kind: "Science center",
    group: "museums",
    audience: "museums",
    summary: "Live air and Lake Erie data powering an interactive environmental exhibit in Cleveland.",
    image: "/assets/live-home-story-03.png",
    alt: "A group at the dashboard exhibit in the Great Lakes Science Center",
    liveLabel: "Live dashboard",
  },
];

export const implementationHref = (slug: string) => `/implementations/${slug}`;

/* ------------------------------------------------------------------ The case pages */
// Each place's story, quote, photos and live view, word for word from the live case pages
// (communityhub.cloud/implementations/<slug>, November 2026).

export type ImplementationPhoto = { src: string; alt: string; caption: string };

/** A quote from a person (speaker, role) or from an organization (org). */
export type ImplementationQuote = { text: string; speaker?: string; role?: string; org?: string };

export type ImplementationLink = { href: string; label: string };

export type ImplementationCase = {
  slug: string;
  /** The story, in order. The first paragraph leads. */
  story: string[];
  quote: ImplementationQuote;
  /** The first photo leads; the others sit below it. */
  photos: ImplementationPhoto[];
  /** The products in use here. */
  products: ImplementationLink[];
  /** More to read, with a line about it. */
  related?: (ImplementationLink & { note: string })[];
  /** The live view: what it is, the address it frames and the frame's title. */
  live: { noun: "dashboard" | "calendar"; embed: string; title: string };
  /** The place's own page about it, outside this site. */
  visit?: ImplementationLink;
};

export const implementationCases: ImplementationCase[] = [
  {
    slug: "city-of-oberlin",
    story: [
      "Environmental Dashboard connects Oberlin residents with their community and local resource use. Data arrives each minute from Oberlin Municipal Light and Power and the water and wastewater plants.",
      `Signs sit in ${SCHOOLS_NAME}, the library, a food pantry, businesses, City Hall, the Fire Station, a retirement community, churches and more. Community Hub serves as the City’s communication platform and promotes its Climate Action Plan.`,
    ],
    quote: {
      text: "Community Hub’s digital signage is central to our community’s climate resilience communication strategy.",
      speaker: "Linda Arbogast",
      role: "City of Oberlin Sustainability Coordinator",
    },
    photos: [
      {
        src: "/assets/live-home-story-08.jpeg",
        alt: "A speaker addressing a crowd at College and Main in Oberlin",
        caption: "A gathering at College and Main, downtown Oberlin",
      },
      {
        src: "/assets/hotel-oberlin-sign.jpg",
        alt: "A wall screen at the Hotel at Oberlin showing Community Voices, Building Dashboard and Citywide Dashboard",
        caption: "Hotel at Oberlin",
      },
      {
        src: "/assets/live-home-story-05.jpeg",
        alt: "A shop owner outside the Oberlin Business Partnership on Main Street",
        caption: "Oberlin Business Partnership, Main Street",
      },
    ],
    products: [
      { href: "/citywide-dashboard", label: "Citywide Dashboard" },
      { href: "/community-calendar", label: "Community Calendar" },
      { href: "/digital-signage", label: "Digital Signage" },
    ],
    live: {
      noun: "dashboard",
      embed: getEmbed("dashboards", "city-of-oberlin").src,
      title: "City of Oberlin’s community dashboard",
    },
  },
  {
    slug: "midtown-cleveland",
    story: [
      "MidTown Cleveland Inc and Community Hub manage the MidTown Community Dashboard. It combines interactive signs in organizations and businesses, a phone app, and a calendar and jobs board that sites can embed.",
      "The original four signs are at Dave’s MidTown Market, MidTown Inc’s office, Fatima Family Center and Willson Tower Apartments. Partnerships began in 2021, and the pilot ran from 2022 to 2024. MidTown reached 10 partner locations in January 2026.",
    ],
    quote: {
      text: "The MidTown Cleveland Dashboard above our checkout counter helps us to communicate that we are locally owned, locally operated and locally involved!",
      org: "Dave’s Market",
    },
    photos: [
      {
        src: "/assets/eng-sign-daves-full.jpg",
        alt: "A visitor holds up her phone beside the MidTown sign and its phone-control QR poster at Dave’s Market",
        caption: "Dave’s Market",
      },
      {
        src: "/assets/signage-partners/asian-town-center.jpg",
        alt: "Three young people in front of the digital sign at Asian Town Center",
        caption: "Asian Town Center",
      },
      {
        src: "/assets/signage-partners/fatima-family-center.jpg",
        alt: "Two people beside the Fatima Family Center digital sign and phone-control QR poster",
        caption: "Fatima Family Center",
      },
    ],
    products: [
      { href: "/community-calendar", label: "Community Calendar" },
      { href: "/digital-signage", label: "Digital Signage" },
      { href: "/phone-app", label: "Phone App" },
    ],
    live: {
      noun: "calendar",
      embed: getEmbed("calendar", "calendar").src,
      title: "The MidTown Cleveland community calendar",
    },
    visit: { href: "https://midtowncleveland.org/events/", label: "MidTown Cleveland’s events page" },
  },
  {
    slug: "oberlin-public-schools",
    story: [
      "Every Oberlin public school has sensors and a hallway screen. The data dashboard gives students live data to interpret, and each screen also carries its own content, such as the principals’ announcements.",
      "Teachers use live data in classrooms for math, science and social studies, and can download free lessons that use the same data.",
    ],
    quote: {
      text: "When you talk about 21st-century skills — gathering and interpreting data — the Dashboard will be a very important tool.",
      speaker: "Kim Koos",
      role: "Elementary Teacher",
    },
    photos: [
      {
        src: "/assets/live-home-story-02.jpeg",
        alt: "Children and a teacher gathered around a dashboard screen in a school hallway",
        caption: "A school hallway screen",
      },
      {
        src: "/assets/classroom-dashboard.jpg",
        alt: "A classroom with the school building dashboard on screen",
        caption: "The building dashboard in a classroom",
      },
      {
        src: "/assets/live-home-story-04.jpeg",
        alt: "Students using laptops that show the citywide dashboard",
        caption: "Students reading the dashboard on laptops",
      },
    ],
    products: [
      { href: "/dashboard-builder", label: "Building Dashboard" },
      { href: "/stories", label: "Stories" },
      { href: "/digital-signage", label: "Digital Signage" },
    ],
    related: [
      {
        href: "/toolkit",
        label: "Teacher toolkit",
        note: "35 free lesson plans and units, grade 1 through 12, all built on live school building data.",
      },
    ],
    live: {
      noun: "dashboard",
      embed: getEmbed("dashboards", "oberlin-city-schools").src,
      title: `${SCHOOLS_NAME}’ environmental dashboard`,
    },
  },
  {
    slug: "oberlin-college",
    story: [
      "Campus buildings are teaching tools: students can see heating, cooling, electricity and water systems at work. But most students never notice how much energy a dorm or lab uses, or think about the campus as a system.",
      "Oberlin College uses building dashboards and Ecolympics competitions to engage students in resource conservation. The first electricity and water reduction competition was in 2006, and the college has 12 signs on campus.",
    ],
    quote: {
      text: "I really feel that I am a part of the resource use graphs displayed on the dashboards. This feeling motivates me to be more thoughtful when consuming water and electricity.",
      speaker: "Grace Gao",
      role: "Oberlin College Student",
    },
    photos: [
      {
        src: "/assets/live-home-story-01.jpeg",
        alt: "Participants examining illuminated bulbs during an energy demonstration",
        caption: "An energy demonstration",
      },
      {
        src: "/assets/photos/oc-students-2025/oc-students-2025-01.jpg",
        alt: "Oberlin College students",
        caption: "Oberlin College students",
      },
    ],
    products: [
      { href: "/dashboard-builder", label: "Building Dashboard" },
      { href: "/stories", label: "Stories" },
      { href: "/phone-app", label: "Phone App" },
    ],
    live: {
      noun: "dashboard",
      // The college portal's front page. embeds.json lists only two of its inner dashboards (Harkness, whole campus).
      embed: "https://oberlin.communityhub.cloud/dh-public/oc-embed",
      title: "Oberlin College’s environmental dashboard",
    },
  },
  {
    slug: "great-lakes-science-center",
    story: [
      "The Great Lakes Science Center runs an interactive environmental dashboard exhibit with a screen and a touch kiosk. Visitors control the display and see real data from their region.",
      "Its data comes from the center’s own monitoring equipment, Lake Erie (USGS) and an EPA air quality station in Cleveland. Cleveland’s version of the Citywide Dashboard runs there.",
    ],
    quote: {
      text: "The dashboard signage is stitching together the work of Cleveland organizations to make the team effort apparent.",
      speaker: "Scott Volmer",
      role: "VP STEM Learning, Great Lakes Science Center",
    },
    photos: [
      {
        src: "/assets/live-home-story-03.png",
        alt: "A group at the dashboard exhibit in the Great Lakes Science Center",
        caption: "The dashboard exhibit",
      },
      {
        src: "/assets/phone-person-water-display.jpg",
        alt: "A visitor uses her phone beside a digital sign and a mounted touchpad at Great Lakes Science Center",
        caption: "A visitor with a phone beside the sign and touchpad",
      },
      {
        src: "/assets/glsc-exhibit.jpg",
        alt: "Students and staff in front of a dashboard screen and a touch tablet",
        caption: "Students and staff at the exhibit",
      },
    ],
    products: [
      { href: "/citywide-dashboard", label: "Citywide Dashboard" },
      { href: "/stories", label: "Stories" },
      { href: "/web-embeddables", label: "Web Embeddables" },
    ],
    live: {
      noun: "dashboard",
      embed: getEmbed("dashboards", "great-lakes-science-center").src,
      title: "Great Lakes Science Center’s environmental dashboard",
    },
    visit: {
      href: "https://greatscience.com/explore/exhibits/environmental-dashboard",
      label: "The exhibit on the Science Center’s site",
    },
  },
];

export const findImplementation = (slug: string) => implementations.find((place) => place.slug === slug);
export const findImplementationCase = (slug: string) => implementationCases.find((item) => item.slug === slug);

/** The words around the implementations pages, as the live site has them. */
export const implementationCopy = {
  meta: {
    title: "Implementations — Community Hub",
    description:
      "Community Hub in cities and neighborhoods, K–12 schools, colleges and universities, and museums: each place’s story and its live dashboard.",
    /** After a place's name in its browser tab title. */
    caseTitle: "— Implementations — Community Hub",
  },
  index: {
    readStory: "Read the story",
    bringTitle: "Bring Dashboard to Your Community",
    bringBefore: "The implementation guide,",
    bringLink: "Bringing Environmental Dashboard to Your Community",
    bringAfter: ", covers the approach, technology and implementation.",
    readGuide: "Read the guide",
  },
  nav: {
    all: "All implementations",
    story: "Story",
    previous: "Previous",
    next: "Next",
  },
  story: {
    inUse: "In use here:",
    seeThe: "See the",
    newTab: "(opens in a new tab)",
    runsAt: "Runs at",
  },
  live: {
    whole: "The whole",
    liveFrom: ", live from",
    scroll: ". Scroll inside it to explore.",
    phoneMenu: "On a phone its menu opens first: tap ‹ to close it, or open it in a new tab.",
    open: "Open in a new tab",
  },
};
