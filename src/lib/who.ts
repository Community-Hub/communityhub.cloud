// The five "Who it's for" stops. Copy comes from the rebuild's who.ts, which follows sources/COPY-R6.md with the CEO's
// 7 Oct edits. The one opening line for schools and campuses is from FLOW.md section 3 (V). The descriptions and the
// "about 10%" figure still need John's sign-off (STORY-PLAN-GLADE.md).
import { getEmbed } from "@/data/embeds";
import { educateBeats, empowerBeats, engageBeats, placeTitle, type SlideFrame } from "@/lib/content";
import { SCHOOLS_NAME } from "@/lib/names";

const BEATS = [...engageBeats, ...educateBeats, ...empowerBeats];

/** A product row: the product's own name and page, so one product never has two spellings. */
function product(id: string, line: string, name?: string) {
  const beat = BEATS.find((b) => b.id === id);
  if (!beat) throw new Error(`no product ${id}`);
  return { name: name ?? beat.title, href: beat.href, line };
}

type EmbedRef = Parameters<typeof getEmbed>;

function embedFrame(...ref: EmbedRef): SlideFrame {
  const e = getEmbed(...ref);
  return {
    title: e.place && e.sublocation ? `${e.place} – ${e.sublocation}` : e.title,
    caption: `${e.name}, live.`,
    embed: e.src,
  };
}

export type WhoStop = {
  id: string;
  name: string;
  /** Opening line for campuses and schools (FLOW.md section 3). */
  opening?: string;
  description: string;
  problem: string;
  products: { name: string; href: string; line: string }[];
  example: string;
  /** How to take part: cities and neighborhoods only. */
  involve?: string;
  /** The CTA line before Contact us, without the "Book a demo" half. */
  cta: string;
  frames: SlideFrame[];
};

const LEARN = "People are always learning from buildings because of our technology.";

export const whoStops: WhoStop[] = [
  {
    id: "neighborhoods",
    name: "Neighborhoods",
    description: "A shared calendar, jobs board and public screens that keep shops, clinics, pantries and housing connected.",
    problem:
      "Neighborhood organizations and businesses don't have an easy way to share what's happening or to keep each other connected. People miss events, jobs and news because there's no single place everyone looks.",
    products: [
      product("calendar", "One place to post events and jobs that reach all partner screens and websites."),
      product("signage", "Screens in shops, community centers and public spaces cycle through neighborhood news."),
      product("phone", "Residents and visitors control screens from their phones."),
    ],
    example:
      "MidTown Cleveland partners include shops and community centers. Residents post events and jobs that appear on screens and reach the whole neighborhood online.",
    involve: "Neighbors can post to the calendar or the jobs board, shops and clinics can host a screen, and local sponsors can help pay for one.",
    cta: "Neighborhoods grow stronger when people are connected.",
    frames: [
      embedFrame("calendar", "calendar"),
      { title: "Outdoor market", caption: "", src: "/assets/photos/ofm-2025/ofm-2025-10.jpg", alt: "Shoppers at a covered outdoor market stall with produce and jars" },
      { title: "Market tents", caption: "", src: "/assets/photos/ofm-2025/ofm-2025-16.jpg", alt: "Rows of canopy tents on a paved lot, with a brick building behind" },
      { title: "Summer festival", caption: "", src: "/assets/photos/juneteenth-2022/juneteenth-2022-11.jpg", alt: "People gathered under white and blue tents on a lawn beside a brick building, with small flags in the grass" },
      { title: "Information table", caption: "", src: "/assets/photos/juneteenth-2022/juneteenth-2022-37.jpg", alt: "Two people seated at a table with a printed cloth and brochures, under a tent on a lawn" },
    ],
  },
  {
    id: "cities",
    name: "Cities",
    description: "Citywide dashboards, a community calendar and public screens that show live electricity, water and air data.",
    problem:
      "City leaders know their electricity, water and air systems matter. But citizens rarely see real-time data about how much the city is using, or what it means.",
    products: [
      product("city", "Citywide dashboards show live electricity, water, wastewater and air quality."),
      product("calendar", "Events and jobs board for neighborhoods and the whole city."),
      product("signage", "Screens in public spaces that cycle through city news and live data."),
    ],
    example:
      "The City of Oberlin runs a citywide dashboard with live electricity, water and weather data. Public signs around town share community information and live readings.",
    involve: "Residents can post to the calendar or the jobs board, businesses can host a screen, and local sponsors can help pay for one.",
    cta: "Cities and towns engage when people see real data.",
    frames: [
      embedFrame("dashboards", "city-of-oberlin"),
      { title: "Street parade", caption: "", src: "/assets/photos/big-parade-2023/big-parade-2023-01.jpg", alt: "People walking down a street with a hand-pulled cart and streamers, in front of a stone building" },
      { title: "Parade crowd", caption: "", src: "/assets/photos/big-parade-2023/big-parade-2023-13.jpg", alt: "A crowd in colorful clothes in a street, with a stone building with a pointed tower and a decorated float behind" },
    ],
  },
  {
    id: "museums",
    name: "Museums",
    description: "Live regional data and animated stories that turn exhibits on energy, water and air into real-time learning.",
    problem:
      "Museum visitors want hands-on experiences that feel relevant and live. Static exhibits on energy or water systems feel abstract unless they connect to the real place and the real data right now.",
    products: [
      product("city", "Live regional data: electricity, water, air quality and weather."),
      product("stories", "Animated narratives that use live data to explain systems and science."),
      product("embed", "Dashboards embedded directly in your exhibit materials."),
    ],
    example:
      "Great Lakes Science Center runs an interactive environmental dashboard exhibit with live Cleveland air quality and Lake Erie data. Visitors control the display and see real data from their region.",
    cta: "Live data turns exhibits into learning experiences.",
    frames: [
      embedFrame("dashboards", "great-lakes-science-center"),
      {
        title: placeTitle("Great Lakes Science Center", "Exhibit"),
        caption: "Visitors at the exhibit at the Great Lakes Science Center.",
        src: "/assets/glsc-exhibit.jpg",
        alt: "Visitors at the exhibit at the Great Lakes Science Center",
      },
    ],
  },
  {
    id: "campuses",
    name: "Campuses",
    opening: LEARN,
    description: "Dorm competitions, orb maps and animated stories that make the campus a teaching tool.",
    problem:
      "Campus buildings are teaching tools: students can see heating, cooling, electricity and water systems at work. But most students never notice how much energy a dorm or lab uses, or think about the campus as a system.",
    products: [
      product("building", "Dorm competitions and orb maps let students see their campus at work."),
      product("stories", "Animated data stories explore campus geothermal, renewable energy and water systems."),
      product("phone", "Students and visitors control screens from their phones."),
    ],
    example:
      "Oberlin College uses building dashboards and Ecolympics competitions to engage students in resource conservation.",
    cta: "The campus is a teaching tool.",
    frames: [
      embedFrame("dashboards", "campus"),
      { title: "Outdoor gathering", caption: "", src: "/assets/photos/oc-students-2025/oc-students-2025-06.jpg", alt: "People seated at long tables on a brick patio under trees" },
      { title: "Posters on the lawn", caption: "", src: "/assets/photos/oc-students-2025/oc-students-2025-08.jpg", alt: "A person looking at poster boards with small photos and colored dots, set up on a lawn under a large tree" },
    ],
  },
  {
    id: "schools",
    name: "Schools",
    opening: LEARN,
    description: "Hallway screens, animated stories and 35 free lessons that let students see how their school uses water and electricity.",
    problem:
      "Students learn by seeing how things work. School buildings use water and electricity every day, but students rarely see, understand or care how much, or why it matters.",
    products: [
      product("building", "Hallway screens show real-time building energy and water use."),
      product("stories", "Classrooms use animated data stories to teach systems thinking and conservation."),
      {
        name: "Teacher toolkit",
        href: "/toolkit",
        line: "35 free lesson plans and units, grade 1 through 12, all built on live school building data.",
      },
    ],
    example: `${SCHOOLS_NAME} runs hallway screens in every building plus a district-wide dashboard. Teachers use live data in classrooms for math, science and social studies.`,
    cta: "Bring a dashboard to your school.",
    frames: [
      embedFrame("dashboards", "oberlin-city-schools"),
      {
        title: placeTitle(SCHOOLS_NAME, "Building Dashboard"),
        caption: "A classroom with the school building dashboard on screen.",
        src: "/assets/classroom-dashboard.jpg",
        alt: "A classroom with the school building dashboard on screen",
      },
    ],
  },
];
