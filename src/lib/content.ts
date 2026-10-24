import { getEmbed } from "@/data/embeds";
import voicesFilters from "@/data/voices-filters.json";
import { SCHOOLS_NAME } from "@/lib/names";

export { SCHOOLS_NAME };

export const CHAPTERS = [
  "Voices",
  "Who we are",
  "Engage",
  "Educate",
  "Motivate and Empower",
  "Environmental Orb",
  "Footer",
] as const;


export type Go = { href: string; label: string };

export const stories: {
  img: string;
  alt: string;
  quote: string;
  /** The organization the quote is credited to. Never a person's name. Empty when no organization is sourced. */
  org: string;
  links: Go[];
}[] = [
  {
    img: "/assets/live-home-story-01.jpeg",
    org: "Oberlin College",
    alt: "Participants examining illuminated bulbs during an energy demonstration",
    quote:
      "I really feel that I am a part of the resource use graphs displayed on the dashboards. This feeling motivates me to be more thoughtful when consuming water and electricity.",
    links: [{ href: "/dashboard-builder", label: "Building Dashboard" }],
  },
  {
    img: "/assets/live-home-story-02.jpeg",
    org: "",
    alt: "Children and a teacher gathered around a dashboard screen in a school hallway",
    quote:
      "When you talk about 21st-century skills — gathering and interpreting data — the Dashboard will be a very important tool.",
    links: [
      { href: "/demos#schools", label: `${SCHOOLS_NAME} dashboard` },
      { href: "/toolkit", label: "Teacher toolkit" },
    ],
  },
  {
    img: "/assets/live-home-story-03.png",
    org: "Great Lakes Science Center",
    alt: "A group at the dashboard exhibit in the Great Lakes Science Center",
    quote:
      "The dashboard signage is stitching together the work of Cleveland organizations to make the team effort apparent.",
    links: [{ href: "/digital-signage", label: "Digital Signage" }],
  },
  {
    img: "/assets/live-home-story-04.jpeg",
    org: SCHOOLS_NAME,
    alt: "Students using laptops that show the citywide dashboard",
    quote:
      "Oberlin is helping us translate water and energy use in 44 school buildings into teaching and learning in the classroom.",
    links: [
      { href: "/data-hub", label: "Data Hub" },
      { href: "/toolkit", label: "Teacher toolkit" },
    ],
  },
  {
    img: "/assets/live-home-story-05.jpeg",
    org: "Oberlin Business Partnership",
    alt: "A shop owner outside the Oberlin Business Partnership on Main Street",
    quote:
      "Environmental Dashboard enables residents to understand their electricity and water consumption, which in turn helps prevent overuse.",
    links: [{ href: "/demos#oberlin", label: "Citywide Dashboard" }],
  },
  {
    img: "/assets/sign-farmers-market.jpg",
    org: "City of Oberlin",
    alt: "A digital sign showing the Oberlin Farmers Market event",
    quote:
      "Community Hub’s digital signage is central to our community’s climate resilience communication strategy.",
    links: [{ href: "/work#oberlin", label: "Oberlin case" }],
  },
  {
    img: "/assets/live-home-story-07.jpeg",
    org: "Oberlin Business Partnership",
    alt: "Shoppers and vendors at an indoor market",
    quote:
      "Community Hub’s events calendar has made our work easier. People in the community are participating — it’s simple, but transformative.",
    links: [{ href: "/community-calendar", label: "Community Calendar" }],
  },
  {
    img: "/assets/live-home-story-08.jpeg",
    org: "Palmer Conservation Consulting",
    alt: "A speaker addressing a crowd at College and Main in Oberlin",
    quote:
      "For a decade we have looked to the Community Hub team as key partners in translating our energy conservation services into community engagement.",
    links: [{ href: "/community-voices", label: "Community Voices" }],
  },
];

/** Display title for a placed slide: "Place \u2013 Sublocation" (en dash, no colon). */
export const placeTitle = (place: PrimaryPlace, sublocation: string): string => `${place} \u2013 ${sublocation}`;

// Each place: the live card (embed or picture), a note under it, then the lines, photo and quote for the "Who uses it" screen.
export const demos = [
  {
    id: "glsc",
    visit: { href: "https://greatscience.com/explore/exhibits/environmental-dashboard", label: "Visit Great Lakes Science Center" },
    name: "Great Lakes Science Center",
    title: placeTitle("Great Lakes Science Center", "Citywide Dashboard"),
    image: "/assets/live-home-story-03.png",
    embed: "https://cleveland.communityhub.cloud/dh-public/glsc-embed",
    alt: "Visitors at the dashboard exhibit at the Great Lakes Science Center, with a wall screen and a touch kiosk",
    note: "Cleveland’s dashboard, fed by the center’s own monitoring equipment, Lake Erie (USGS) and an EPA air quality station.",
    photo: { src: "/assets/live-home-story-03.png", alt: "Visitors at the exhibit at the Great Lakes Science Center" },
    facts: [
      "The Great Lakes Science Center is one of Community Hub’s ongoing implementations.",
      "Its data comes from the center’s own monitoring equipment, Lake Erie (USGS) and an EPA air quality station in Cleveland.",
      "The exhibit has a screen and a touch kiosk.",
      "Cleveland’s version of the Citywide Dashboard runs there.",
    ],
    quote: {
      text: "The dashboard signage is stitching together the work of Cleveland organizations to make the team effort apparent",
      org: "Great Lakes Science Center",
    },
  },
  {
    id: "midtown",
    visit: { href: "https://www.midtowncleveland.org/events", label: "Visit MidTown Cleveland" },
    name: "MidTown Cleveland",
    title: placeTitle("MidTown Cleveland", "Events page"),
    image: "/assets/eng-midtown-events.jpg",
    alt: "MidTown Cleveland’s events page, with the MidTown header and menu above the embedded Community Hub calendar",
    note: "MidTown’s own header and menu stay on top, with the Community Hub calendar embedded below.",
    photo: { src: "/assets/eng-sign-daves.jpg", alt: "The MidTown screen above the checkout at Dave’s Market, with a QR poster to control it by phone" },
    facts: [
      "MidTown Cleveland Inc and Community Hub manage the MidTown Community Dashboard.",
      "It combines interactive signs in organizations and businesses, a phone app, and a calendar and jobs board that sites can embed.",
      "The original four signs are at Dave’s MidTown Market, MidTown Inc’s office, Fatima Family Center and Willson Tower Apartments.",
      "Partnerships began in 2021, and the pilot ran from 2022 to 2024. MidTown reached 10 partner locations in January 2026.",
    ],
    quote: {
      text: "The MidTown Cleveland Dashboard above our checkout counter helps us to communicate that we are locally owned, locally operated and locally involved!",
      org: "Dave’s Market",
    },
  },
  {
    id: "schools",
    visit: { href: "https://oberlin.communityhub.cloud/dh-public/ops-embed", label: "Open live dashboard" },
    name: SCHOOLS_NAME,
    title: placeTitle(SCHOOLS_NAME, "Environmental dashboard"),
    image: "/assets/ops-embed-shot.jpg",
    embed: "https://oberlin.communityhub.cloud/dh-public/ops-embed",
    alt: `The ${SCHOOLS_NAME} dashboard embed, with the district’s logo and menu`,
    note: "Metered school buildings with a live dashboard; lessons are in the teacher toolkit.",
    photo: { src: "/assets/kids-citywide-screen.jpg", alt: "Elementary students at a Citywide Dashboard screen in an Oberlin school hallway" },
    facts: [
      "Every Oberlin public school has sensors and a hallway screen.",
      "The data dashboard gives students live data to interpret.",
      "Each screen also carries its own content, such as the principals’ announcements.",
      "Teachers can download free lessons that use the same data.",
    ],
    quote: {
      text: "When you talk about 21st century skills ... the Dashboard will be a very important tool",
    },
  },
  {
    id: "oberlin",
    visit: { href: "https://oberlin.communityhub.cloud/dh-public/city-of-oberlin", label: "Open live dashboard" },
    name: "City of Oberlin",
    title: placeTitle("City of Oberlin", "Citywide Dashboard"),
    image: "/assets/cwd-poster.jpg",
    embed: "https://oberlin.communityhub.cloud/dh-public/city-of-oberlin",
    alt: "Oberlin’s Citywide Dashboard, a drawing of the town with live gauges beside it",
    note: "Whole-community electricity, drinking water, wastewater and Plum Creek.",
    photo: { src: "/assets/cwd-poster.jpg", alt: "Drawing of Oberlin’s Citywide Dashboard with live gauges" },
    facts: [
      "Environmental Dashboard connects Oberlin residents with their community and local resource use.",
      "Data arrives each minute from Oberlin Municipal Light and Power and the water and wastewater plants.",
      `Signs sit in ${SCHOOLS_NAME}, the library, a food pantry, businesses, City Hall, the Fire Station, a retirement community, churches and more.`,
      "Community Hub serves as the City’s communication platform and promotes its Climate Action Plan.",
    ],
    quote: {
      text: "Environmental Dashboard enables residents to understand their electricity and water consumption, which in turn helps prevent overuse.",
      org: "Oberlin Business Partnership",
    },
  },
];

// "How to read it": one card per thing a visitor meets on a screen. Each has a picture from the deck or the site.
export const demoReads = [
  {
    id: "citywide",
    name: "Citywide Dashboard",
    image: "/assets/deck/h82.jpg",
    alt: "The Oberlin Citywide Dashboard, with tabs for Electricity, Water, Stream and Weather and side gauges",
    lines: [
      "Tabs switch between Electricity, Water, Stream and Weather.",
      "Gauges show current conditions: use, water quality and weather. A dot and line under each one compares now with the average, high and low.",
      "Animated flows match the current rate of use.",
      "Click a location for more detail. Flash the Energy Squirrel and Wally Walleye give facts and tips.",
    ],
  },
  {
    id: "gauges",
    name: "Gauges",
    image: "/assets/rs-empathetic-gauges.jpg",
    alt: "Wally Walleye and Flash the Energy Squirrel at high and low use, beside non-character gauges",
    lines: [
      "A needle gauge reads like a speedometer. It shows the current value.",
      "An odometer gauge shows the value built up over a period.",
      "A character gauge is an animated character. Its expression and behavior show how much is being used.",
      "Flash reacts when electricity use is high, typical or low.",
    ],
  },
  {
    id: "orbs",
    name: "Orbs",
    image: "/assets/deck/h55.jpg",
    alt: "The Environmental Orbs slide: squirrels from red to green for electricity, fish from pink to pale blue for water, and a glowing orb",
    lines: [
      "The Environmental Orb glows in a building lobby, such as a dorm energy orb sign at Oberlin College.",
      "Its color compares use now with typical use.",
      "Electricity, shown by squirrels, runs red to bright green. Go bright green.",
      "Water, shown by fish, runs pink to light blue. Go light blue.",
    ],
  },
  {
    id: "voices",
    name: "Community Voices",
    image: "/assets/cv-slideshow-shot.jpg",
    alt: "A Community Voices slide with a photo, a quote, a name and a colored bar reading Our Downtown",
    lines: [
      "Each slide has a photo, a quote, a name and a colored bar for its category.",
      "A location can choose a category to show more often. A school might choose Next Generation, a business Our Downtown.",
    ],
  },
  {
    id: "phone",
    name: "Phone controller",
    image: "/assets/eng-ctl-midtown.jpg",
    alt: "MidTown’s phone screen controller",
    lines: [
      "Scan the QR code on the sign.",
      "Choose content or take control.",
      "See it on the sign. Tap MORE to stay on the phone.",
    ],
  },
];

// "What it changed": outcomes, each with the lines that carry the number and a picture or quote.
export const demoChanges = [
  {
    id: "dorms",
    name: "Dorms",
    image: "/assets/originals/oberlin-dorm-competition-2006-2009.svg",
    alt: "Chart of average whole-dorm electricity (kW) for 2006-07, 2007-08 and 2008-09",
    lines: [
      "The first electricity and water reduction competition was in 2006.",
      "The chart compares electricity use before, during and after the 2006–2009 competitions.",
      "Web hits rise during competitions, then drop. Feedback plus competition leads to conservation.",
    ],
  },
  {
    id: "schools",
    name: "Schools",
    image: "/assets/deck/h86.jpg",
    alt: "Prospect Elementary heat map labelled Before, Competition and After",
    lines: [
      "Ecolympics is a yearly three-week competition between Oberlin schools.",
      "Prospect Elementary cut electricity by more than 30% in both 2014 and 2015.",
      `In 2024, ${SCHOOLS_NAME} made the biggest water cut of any group: 2,570 gallons.`,
    ],
  },
  {
    id: "town",
    name: "The town",
    image: "/assets/ecolympics-2024-kwh.jpg",
    alt: "Ecolympics 2024 slide: Oberlin met its community-wide electricity reduction goal and saved 10,050 kilowatt-hours",
    lines: [
      "In 2024 Oberlin met its community-wide electricity reduction goal and saved 10,050 kWh.",
      "The goal was 10,000 kWh.",
      "Four groups compete on the biggest percentage cut against a pre-competition baseline.",
      "The 2026 community goal was 20,000 kWh and 15,000 gallons.",
    ],
  },
  {
    id: "research",
    name: "Research",
    lines: [
      "A decade of peer-reviewed research indicates the Environmental Dashboard’s impact.",
      "Surveys before the signs (174) and two years after (133) found shifts in community and environmental norms (Frantz & Petersen, 2024).",
    ],
    quote: {
      text: "Psychology and marketing teach us that what we believe other community members are doing powerfully influences our own behavior; Community Voices encourages pro-environmental and pro-community behavior",
      org: "Oberlin College",
    },
  },
] as {
  id: string;
  name: string;
  image?: string;
  alt?: string;
  lines: string[];
  quote?: { text: string; org?: string };
}[];

// "Bring one to your town": the six steps, in order.
export const demoSteps = [
  "Talk with us and set goals.",
  "Map your data sources, including how Community Hub connects to your utility.",
  "Choose where people will see it.",
  "Build the first content.",
  "Run a pilot and a baseline assessment.",
  "Grow with partners and sponsors.",
];

export const demoBringNotes = [
  "Oberlin’s citywide dashboard takes data each minute from the utility and the water and wastewater plants.",
  "Start small. MidTown’s pilot started at four sites and reached 10 locations by January 2026.",
];

/** John's primary places (7 Oct). The schools name comes from SCHOOLS_NAME (src/lib/names.ts), pending his confirmation. */
export const PRIMARY_PLACES = [
  "City of Oberlin",
  "Oberlin College",
  "MidTown Cleveland",
  "Great Lakes Science Center",
  SCHOOLS_NAME,
] as const;
export type PrimaryPlace = (typeof PRIMARY_PLACES)[number];

export type SlideFrame = {
  /** Shown above the slide. For a placed slide this is placeTitle(place, sublocation). */
  title: string;
  caption: string;
  /** Previous example hashes retained when a visible title changes. */
  aliases?: string[];
  place?: PrimaryPlace;
  sublocation?: string;
  /** Legend line under the slide (source, link label). */
  legend?: string;
  /** The live Community Voices player (src/data/voices-filters.json). It rotates filters; its title is "Place \u2013 Filter". */
  voices?: boolean;
  src?: string;
  alt?: string;
  fit?: "cover" | "contain";
  embed?: string;
  /** Let responsive dashboard text render at its real size, with native inner scrolling. */
  nativeSize?: boolean;
  presentation?: boolean;
  phoneWalkthrough?: boolean;
  phoneScan?: boolean;
  images?: { src: string; alt: string; label?: string }[];
  /** A community logo shown to the left of the example name. */
  logo?: string;
};

/** Case studies: pictures that join each case's dashboard preview in its slider, keyed by the case id in src/routes/work.tsx. */
export const WORK_CASE_FRAMES: Record<string, SlideFrame[]> = {
  oberlin: [
    {
      title: "Oberlin in winter",
      caption: "",
      src: "/assets/cs-oberlin-snow.jpg",
      alt: "A snowy Oberlin park at dusk, with bare trees and a brick building in the distance",
    },
  ],
  midtown: [
    {
      title: "MidTown dashboard",
      caption: "",
      src: "/assets/tile-midtown.jpg",
      alt: "A MidTown Cleveland dashboard tile: an illustrated town beside air temperature and air quality readings",
      fit: "contain",
    },
  ],
  glsc: [
    {
      title: "Cleveland",
      caption: "",
      src: "/assets/cs-illo-cleveland.png",
      alt: "An illustrated city skyline beside a lake",
      fit: "contain",
    },
  ],
  college: [
    {
      title: "Campus building",
      caption: "",
      src: "/assets/cs-illo-ajlc.png",
      alt: "An illustrated two-story building with a glass front and a green lawn",
      fit: "contain",
    },
  ],
};

/** Digital Signage, Use your phone: the menu on the phone, the exhibit case controls, and the screen it drives. */
export const PHONE_FRAMES: SlideFrame[] = [
  {
    title: "Choose a story",
    caption: "The phone menu, and the screen next to it.",
    src: "/assets/art-choose-story.jpg",
    alt: "A hand holding the phone story menu, with a live chart on a screen",
  },
  {
    title: "Pick a story",
    caption: "",
    src: "/assets/phone-workflow/carbon-neutral-controller.png",
    alt: "The Carbon Neutral Stories phone list: Heating & Cooling, Energy, Water, Climate, Transportation, Food, Land, Material and AJLC",
    fit: "contain",
  },
  {
    title: "Exhibit case features",
    caption: "",
    src: "/assets/eng-ctl-exhibit.jpg",
    alt: "A phone list titled Select an Exhibit Case Feature: incandescent, compact fluorescent and LED lights, lava lamp, hair dryer, mini-fridge, meters and data system, geothermal model",
    fit: "contain",
  },
  {
    title: "A story on the phone",
    caption: "",
    src: "/assets/eng-ctl-story.jpg",
    alt: "A drawing of two hands holding a phone that shows the Carbon Neutral Stories list",
    fit: "contain",
  },
  {
    title: "Gross electricity use",
    caption: "A recorded screen capture, not current readings.",
    src: "/assets/phone-workflow/ajlc-electricity-recorded.png",
    alt: "A Gross Electricity Use chart for the Adam Joseph Lewis Center, with a cartoon animal beside it",
    fit: "contain",
  },
];

/** About, Where it began: the town, the "Feedback Power" slide from the deck, and the dorm competition chart. */
export const ABOUT_ORIGIN_FRAMES: SlideFrame[] = [
  {
    title: "Oberlin, Ohio",
    caption: "",
    src: "/assets/oberlin-aerial.jpg",
    alt: "Aerial view of downtown Oberlin in autumn, with a main street, brick buildings and trees in fall color.",
  },
  {
    title: "Feedback Power",
    caption: "",
    src: "/assets/deck/h04.jpg",
    alt: "Slide titled Feedback Power: a house, a stream and a tap lead to Information, which empowers people and strengthens community",
    fit: "contain",
  },
  {
    title: "Dorm competition",
    caption: "",
    src: "/assets/originals/oberlin-dorm-competition-2006-2009.svg",
    alt: "Bar chart of average whole-dorm electricity in kilowatts for 2006-07, 2007-08 and 2008-09, before fall break, after fall break, before spring break, during the competition and after it",
    fit: "contain",
  },
];

export type ProductBeat = {
  id: string;
  title: string;
  icon: string;
  href: string;
  body: string;
  frames: SlideFrame[];
};

export const engageBeats: ProductBeat[] = [
  {
    id: "signage",
    title: "Digital Signage",
    icon: "/assets/icon-signage.png",
    href: "/digital-signage",
    body: "Easy to use interactive digital signage makes it simple for multiple stakeholders to post and update content that connects community members with both organization and location-specific and community-wide information and events.",
    frames: [
      {
        src: "/assets/platform-explanation/interactive-signage.jpg",
        alt: "A signage screen on a wood-panelled lobby wall, with Community Voices, Building Dashboard and Citywide Dashboard choices",
        title: "Interactive signage",
        caption: "A lobby screen where visitors pick Community Voices, the building or the city.",
        fit: "contain",
      },
      {
        src: "/assets/hotel-oberlin-sign.jpg",
        alt: "A Community Hub screen in the Hotel at Oberlin lobby",
        title: "Hotel at Oberlin",
        caption: "Hotel at Oberlin lobby.",
      },
      {
        src: "/assets/eng-sign-daves-full.jpg",
        alt: "The full Dave’s Market installation, with a MidTown screen, QR instructions, and a person holding the phone controller",
        title: placeTitle("MidTown Cleveland", "Dave’s Market"),
        place: "MidTown Cleveland",
        sublocation: "Dave’s Market",
        caption: "Above the checkout at Dave’s MidTown Market.",
        fit: "contain",
      },
    ],
  },
  {
    id: "phone",
    title: "Phone App",
    icon: "/assets/icon-phone.png",
    href: "/phone-app",
    body: "Our phone application is easily customized to meet the communication goals of each community. Viewers can directly access content that interests them on their phone and can also control current content displayed on the digital sign nearest to them.",
    frames: [
      {
        src: "/assets/phone-workflow/oberlin-hub-menu.png",
        alt: "The Oberlin Hub phone menu: Screen controller, Calendar, Community Voices and Citywide Dashboard, with a button to subscribe to the events newsletter",
        title: "The phone app",
        caption: "Content for one community, on a phone.",
        fit: "contain",
      },
      {
        src: "/assets/phone-workflow/carbon-neutral-controller.png",
        alt: "The Carbon Neutral Stories phone list: Heating & Cooling, Energy, Water, Climate, Transportation, Food, Land, Material and AJLC",
        title: "Pick a story",
        caption: "Choose content or take control.",
        fit: "contain",
      },
      {
        src: "/assets/phone-person-water-display.jpg",
        alt: "A person using a phone to choose water content on a display",
        title: "Control a sign",
        caption: "Choose what the nearest sign shows.",
      },
      {
        src: "/assets/eng-ctl-sip.jpg",
        alt: "OC Story Dashboard topics on a phone",
        title: placeTitle("Oberlin College", "Story topics"),
        place: "Oberlin College",
        sublocation: "Story topics",
        caption: "The story topics on a phone are heating and cooling, energy, water, climate, transportation, and food and land.",
        fit: "contain",
      },
    ],
  },
  {
    id: "embed",
    title: "Web Embeddables",
    icon: "/assets/icon-embed.png",
    href: "/web-embeddables",
    body: "CH content, such as community calendars, real-time data visualizations, and navigable dashboards can be easily customized and embedded into the websites of any partner organization.",
    frames: [
      {
        title: placeTitle(SCHOOLS_NAME, "Environmental dashboard"),
        place: SCHOOLS_NAME,
        sublocation: "Environmental dashboard",
        legend: getEmbed("dashboards", "oberlin-city-schools").name,
        caption: `The ${SCHOOLS_NAME} dashboard, embedded, so you can explore the buildings.`,
        embed: getEmbed("dashboards", "oberlin-city-schools").src,
      },
    ],
  },
];

export const educateBeats: ProductBeat[] = [
  {
    id: "building",
    title: "Building Dashboard",
    icon: "/assets/v1/bdash.png",
    href: "/dashboard-builder",
    body: "Building Dashboard tracks and communicates patterns of real-time resource use in buildings in ways that engage, are easy to understand and make connections between resource conservation and resulting environmental and community benefits.",
    frames: [
      {
        src: "/assets/v1/Buildingdash-e1639411178404.png",
        alt: "A building dashboard: a photo of a brick building with a flowering tree, a heat map, tiles for total cooling, electricity, heating and water, a natural gas chart, and a cooling and heating profile",
        title: "Building Dashboard",
        caption: "One building: its cooling, electricity, heating and water, with a natural gas chart and a heat map.",
        fit: "contain",
      },
      {
        src: "/assets/building-dashboard-original.png",
        alt: "Building dashboard showing electricity and water for one college building",
        title: placeTitle("Oberlin College", "Building Dashboard"),
        place: "Oberlin College",
        sublocation: "Building Dashboard",
        caption: "One college building, with electricity and water against what is usual for that hour.",
        fit: "contain",
      },
      {
        src: "/assets/classroom-dashboard.jpg",
        alt: "A classroom with the school building dashboard on screen",
        title: placeTitle(SCHOOLS_NAME, "Building Dashboard"),
        place: SCHOOLS_NAME,
        sublocation: "Building Dashboard",
        caption: "A school building, readable by students in the hallway and the classroom.",
      },
      {
        src: "/assets/originals/kahn-dashboard-slide66.jpg",
        alt: "Kahn Hall building dashboard",
        title: placeTitle("Oberlin College", "Kahn Hall"),
        place: "Oberlin College",
        sublocation: "Kahn Hall",
        caption: "Another Oberlin College building, on the same dashboard in a different hall.",
        fit: "contain",
      },
      {
        src: "/assets/originals/kahn-dashboard-slide70.jpg",
        alt: "A heat map for Kahn Hall: one row of colored cells for each day, from green to red",
        title: placeTitle("Oberlin College", "Kahn Hall heat map"),
        place: "Oberlin College",
        sublocation: "Kahn Hall heat map",
        legend: "Great dashboards, and the tools to build your own.",
        caption: "One of the views you can pick: a heat map.",
        fit: "contain",
      },
    ],
  },
  {
    id: "city",
    title: "Citywide Dashboard",
    icon: "/assets/icon-cwd.png",
    href: "/citywide-dashboard",
    body: "Citywide Dashboard is an animated visualization of whole-community flows of electricity, drinking water, and current environmental conditions. It is designed to enhance residents\u2019 understandings of how they are connected to a larger whole \u2014 a whole that is ultimately dependent on renewable resource flows and a healthy environment.",
    frames: [
      {
        embed: "https://cleveland.communityhub.cloud/citywide-dashboard/index?embed=1&show-menu=0",
        alt: "Cleveland citywide dashboard",
        title: placeTitle("Great Lakes Science Center", "Citywide Dashboard"),
        place: "Great Lakes Science Center",
        sublocation: "Citywide Dashboard",
        caption: "Cleveland’s citywide dashboard.",
        fit: "contain",
      },
    ],
  },
  {
    id: "hub",
    title: "Data Hub",
    icon: "/assets/icon-datahub.png",
    href: "/data-hub",
    body: "Data Hub is a powerful and intuitive package of online data visualization tools. Data Hub makes it easy for managers, educators, students and communicators to translate real-time data acquired from a variety of sources into compelling visualizations that are easily understood and can be shared on websites and digital signage to tell stories of impact and opportunity.",
    frames: [
      {
        src: "/assets/data-hub.png",
        alt: "Data Hub visualization tools",
        title: placeTitle("Oberlin College", "Data Hub"),
        place: "Oberlin College",
        sublocation: "Data Hub",
        caption: "The charts and comparisons that sit behind the public dashboards.",
        fit: "contain",
      },
    ],
  },
  {
    id: "stories",
    title: "Stories",
    icon: "/assets/icon-stories.png",
    href: "/stories",
    body: "Stories combine illustrations, animations and real-time data to explain resource use, environmental conditions and the choices that help build a healthy, resilient community.",
    frames: [
      {
        src: "/assets/source-previews/oberlin-stories-heating-original.png",
        alt: "Oberlin heating story",
        title: placeTitle("Oberlin College", "Heating & Cooling"),
        place: "Oberlin College",
        sublocation: "Heating & Cooling",
        caption: "One frame of a longer story, from the central plant to geothermal.",
        fit: "contain",
      },
    ],
  },
];

export const empowerBeats: ProductBeat[] = [
  {
    id: "calendar",
    title: "Community Calendar",
    icon: "/assets/icon-calendar.png",
    href: "/community-calendar",
    body: "Engaged residents who can easily share information and are encouraged to participate are critical to community vibrancy and resilience. Our calendar application is a unique crowd-sourced venue that makes it easy for organizations and community members to share and promote events and announcements within organizations, neighborhoods, and whole cities.",
    frames: [
      {
        title: placeTitle("MidTown Cleveland", "Community Calendar"),
        place: "MidTown Cleveland",
        sublocation: "Community Calendar",
        legend: getEmbed("calendar", "midtown-calendar").name,
        caption: "The calendar MidTown Cleveland shows on its own events page.",
        embed: getEmbed("calendar", "midtown-calendar").src,
      },
      {
        embed: "https://cleveland.communityhub.cloud/calendar/jobs?show-menu-bar=1",
        title: placeTitle("MidTown Cleveland", "Jobs board"),
        place: "MidTown Cleveland",
        sublocation: "Jobs board",
        caption: "Jobs posted to the Cleveland jobs board, live.",
      },
      {
        src: "/assets/cal-partner-oberlin.jpg",
        alt: "Calendar embedded in a partner website",
        title: placeTitle("City of Oberlin", "Calendar on a partner site"),
        place: "City of Oberlin",
        sublocation: "Calendar on a partner site",
        caption: "The partner keeps the header and the calendar is the content.",
      },
    ],
  },
  {
    id: "voices",
    title: "Community Voices",
    icon: "/assets/icon-cv.png",
    href: "/community-voices",
    body: "Community Voices combines images and words drawn from the full diversity of a community to celebrate and cultivate thought and actions that advance ecological, economic, and social resilience. Community Hub\u2019s unique software makes it easy to build, manage, organize and customize content into powerful messages for display on digital signage, phone apps, and websites.",
    frames: [
      {
        embed: "https://cleveland.communityhub.cloud/cv-public/digital-signage?image_tags=36",
        title: placeTitle("MidTown Cleveland", "Community Voices"),
        place: "MidTown Cleveland",
        sublocation: "Community Voices",
        logo: "https://communityhubstorage.cloud/ch-community-voices/cleveland/community-voices/Midtown_White_edited.png",
        caption: "Community Voices from MidTown Cleveland, playing live.",
      },
      {
        title: voicesFilters.filters[0].title,
        logo: "https://environmentaldashboard.org/images/uploads/2015/07/ob-300x300.jpg",
        caption: "Community Voices from the City of Oberlin, playing live, with the filter changing every 16 seconds.",
        legend: "Community Voices, filtered by category",
        voices: true,
      },
    ],
  },
  {
    id: "results",
    title: "Results",
    icon: "/assets/icon-ch.png",
    href: "/research",
    body: "A decade of peer-reviewed research indicates the Environmental Dashboard’s impact.",
    frames: [
      {
        src: "/assets/originals/oberlin-dorm-competition-2006-2009.svg",
        alt: "Chart of average whole-dorm electricity (kW) for 2006-07, 2007-08 and 2008-09",
        title: placeTitle("Oberlin College", "Dorm competition"),
        place: "Oberlin College",
        sublocation: "Dorm competition",
        caption: "Average whole-dorm electricity during the 2006–2009 competition studies.",
        legend: "Average whole-dorm electricity, 2006-07 to 2008-09.",
        fit: "contain",
      },
      {
        src: "/assets/deck/h86.jpg",
        alt: "Prospect Elementary heat map labelled Before, Competition and After",
        title: placeTitle(SCHOOLS_NAME, "Ecolympics"),
        place: SCHOOLS_NAME,
        sublocation: "Ecolympics",
        caption: "Prospect Elementary cut electricity by more than 30% in both 2014 and 2015.",
        legend: `In 2024, ${SCHOOLS_NAME} made the biggest water cut of any group: 2,570 gallons.`,
        fit: "contain",
      },
      {
        src: "/assets/ecolympics-2024-kwh.jpg",
        alt: "Ecolympics 2024 slide: Oberlin met its community-wide electricity reduction goal and saved 10,050 kilowatt-hours",
        title: placeTitle("City of Oberlin", "Ecolympics 2024"),
        place: "City of Oberlin",
        sublocation: "Ecolympics 2024",
        caption: "In 2024 Oberlin met its community-wide electricity reduction goal and saved 10,050 kWh, against a goal of 10,000 kWh.",
        fit: "contain",
      },
      {
        src: "/assets/ecolympics-2024-water.jpg",
        alt: "Ecolympics 2024 slide: Oberlin City Schools achieved the greatest water reduction, saving 2,570 gallons",
        title: placeTitle(SCHOOLS_NAME, "Ecolympics 2024"),
        place: SCHOOLS_NAME,
        sublocation: "Ecolympics 2024",
        caption: `In 2024, ${SCHOOLS_NAME} made the biggest water cut of any group: 2,570 gallons.`,
        logo: "/assets/ecolympics-logo.svg",
        fit: "contain",
      },
      {
        src: "/assets/ecolympics-2026-standings.jpg",
        alt: "A table of Oberlin Ecolympics 2026 standings, with a bar for each group",
        title: placeTitle("City of Oberlin", "Ecolympics 2026 standings"),
        place: "City of Oberlin",
        sublocation: "Ecolympics 2026 standings",
        caption: "",
        logo: "/assets/ecolympics-logo.svg",
        fit: "contain",
      },
      {
        src: "/assets/rs-empathetic-gauges.jpg",
        alt: "Empathetic gauges from the Environmental Dashboard guide: Flash the energy squirrel and Wally the walleye react to high and low use",
        title: placeTitle("Oberlin College", "Character gauges"),
        place: "Oberlin College",
        sublocation: "Character gauges",
        caption: "In three studies (261 people), character gauges were more engaging than ordinary gauges.",
        legend: "Petersen & Frantz · Translating Data into Feelings, Sustainability (in press)",
        fit: "contain",
      },
    ],
  },
];

export const orbBeats: ProductBeat[] = [
  {
    id: "orb",
    title: "Your Environmental Orb",
    icon: "/assets/icon-orb.png",
    href: "/dashboard-builder",
    body: "Its colour compares use now with what is typical for that building, hour and day — red to green for electricity, pink to white for water. One glance tells a resident whether to act.",
    frames: [
      {
        src: "/assets/orb-poster-ajlc.jpg",
        alt: "Your Environmental Orb color scale: red to green for electricity, pink to white for water.",
        title: "How an orb works",
        caption:
          "Colors communicate electricity or water use in a building right now (this minute!) relative to typical consumption: red to green for electricity, pink to white for water.",
        legend: "Oberlin College Environmental Orb poster",
        fit: "contain",
      },
      {
        src: "/assets/orb-poster-key.jpg",
        alt: "What is an Environmental Orb and How Does it Work? Poster explaining the colors, the sequencing, where the data comes from and why.",
        title: "What is an orb and how does it work?",
        caption: "The Orb receives data over wifi telling it what colors to display.",
        legend: "Oberlin College Environmental Orb poster",
        fit: "contain",
      },
      {
        src: "/assets/orb-poster-noah.jpg",
        alt: "Poster: Your Environmental Orb. Its color compares resource use now to typical use. Go bright green for electricity, go light blue for water. Noah Orb, residential electricity use and whole building water use.",
        title: placeTitle("Oberlin College", "Noah Orb poster"),
        place: "Oberlin College",
        sublocation: "Noah Orb poster",
        caption: "Its color compares resource use now to typical use.",
        fit: "contain",
      },
      {
        src: "/assets/orb-poster-kahn.jpg",
        alt: "Poster: Your Environmental Orb. Its color compares resource use now to typical use. Go bright green for electricity, go light blue for water. Kahn Orb.",
        title: placeTitle("Oberlin College", "Kahn Orb poster"),
        place: "Oberlin College",
        sublocation: "Kahn Orb poster",
        caption: "Its color compares resource use now to typical use.",
        fit: "contain",
      },
      {
        src: "/assets/orb-dorm.jpg",
        alt: "An Environmental Orb glowing in a residence hall",
        title: placeTitle("Oberlin College", "Residence hall orb"),
        place: "Oberlin College",
        sublocation: "Residence hall orb",
        caption: "Sensors monitor electricity and water use in each building, and the orb shows it as color.",
      },
      {
        title: placeTitle("Oberlin College", "Orb map"),
        place: "Oberlin College",
        sublocation: "Orb map",
        caption: "The campus orb map replays yesterday’s measured electricity hour by hour, from lots of electricity to very little.",
        legend: "Oberlin College orb map, Campus Electricity Flows",
        // Still from the live map (dashboard 1081, Orb Map Visualization tab); embedded, the map sits below the fold.
        src: "/assets/orb-map-oberlin.jpg",
        alt: "Oberlin College campus map with building flows in yellow, a Relative Use color scale from lots of electricity to very little, and an hourly replay timeline.",
        fit: "contain",
      },
    ],
  },
];

export const DASHBOARD_STORY = Array.from({ length: 31 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return `/assets/sod/${n}.jpg`;
});
