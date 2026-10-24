import voicesFilters from "@/data/voices-filters.json";
import { getEmbed } from "@/data/embeds";
import { educateBeats, engageBeats, empowerBeats, orbBeats, stories, placeTitle, type ProductBeat } from "@/lib/content";

// Homepage-only source selection. Keep product pages and CMS-owned source copy intact.
// John: Oct 1 16:57-17:01 (Harkness), Oct 7 16:24-16:30 (actual, wider dashboards).
export function homeEducateBeats(): ProductBeat[] {
  return educateBeats.map((item) => {
    if (item.id === "building") {
      return { ...item, frames: [{
        title: placeTitle("Oberlin College", "Harkness Co-op"),
        place: "Oberlin College",
        sublocation: "Harkness Co-op",
        embed: "https://oberlin.communityhub.cloud/dh-public/oc/dashboard/815",
        nativeSize: true,
        caption: "Explore Harkness Co-op’s building dashboard. Scroll inside the dashboard to see its charts.",
      }, {
        title: placeTitle("Oberlin Public Schools", "Oberlin Elementary School"),
        place: "Oberlin Public Schools", sublocation: "Oberlin Elementary School",
        embed: "https://oberlin.communityhub.cloud/dh-public/ops/dashboard/529", nativeSize: true,
        caption: "Oberlin Elementary School’s published resource-use dashboard. Scroll inside to see its charts.",
      }, {
        title: "Great Lakes Science Center", place: "Great Lakes Science Center",
        embed: "https://cleveland.communityhub.cloud/dh-public/glsc/dashboard/953", nativeSize: true,
        caption: "The Science Center Building dashboard. Scroll inside to see its charts.",
      }] };
    }
    if (item.id === "city") {
      return { ...item, frames: [{
        title: placeTitle("City of Oberlin", "Citywide Dashboard"),
        place: "City of Oberlin",
        sublocation: "Citywide Dashboard",
        embed: getEmbed("datahub", "citywide").src,
        caption: "Oberlin’s Citywide Dashboard, with its own resource controls and gauges.",
      }, ...item.frames] };
    }
    if (item.id === "hub") return { ...item, frames: [
      { ...item.frames[0], title: "Data Hub – Variables and visualization settings", caption: "Recorded interface: Variables, Customize, Curve Smoothing / Rolling Average and Style." },
      { title: placeTitle("City of Oberlin", "Whole City Electricity Use"), embed: getEmbed("datahub", "heat-map").src, caption: "Whole City Electricity Use – heat map" },
    ] };
    if (item.id === "stories") return { ...item,
      frames: [{ title: placeTitle("Oberlin College", "Heating & Cooling"),
        embed: "https://docs.google.com/presentation/d/1Wa8Gp961gxbfIDkMCCQL0MKcQSpjpU74D8lO0HezmiY/embed?start=true&loop=true&delayms=4000",
        caption: "SIP Geothermal Heating and Cooling Story", presentation: true,
        aliases: ["oberlin-college-carbon-neutral-stories"],
      }, {
        title: placeTitle("City of Oberlin", "Climate Action Plan"),
        embed: "https://docs.google.com/presentation/d/1QFoq6mtnCp7EWP0b8p506PQu8pQBBsbo7gH6C-R6Bcs/embed?start=true&loop=true&delayms=4000",
        caption: "Oberlin CAP Presentation", presentation: true,
      }, {
        title: placeTitle("Oberlin Public Schools", "Energy Use"),
        embed: "https://docs.google.com/presentation/d/17K42YFGB2TmlJNjSh-Cm9iHRsUb9O5taN6F07zECXBQ/embed?start=true&loop=true&delayms=4000",
        caption: "OCSD Energy Use Story", presentation: true,
      }, {
        title: placeTitle("Great Lakes Science Center", "Climate"),
        src: "/assets/source-previews/glsc-stories-climate-original.png",
        alt: "Great Lakes Science Center climate story: The greenhouse effect controls climate",
        caption: "Original climate-story frame; recorded preview.", fit: "contain",
      }],
    };
    return item;
  });
}

// Distinct installation contexts: family center, school and housing. Similar wall-screen portraits stay in the asset library.
const signagePartners: ProductBeat["frames"] = [
  { title: placeTitle("MidTown Cleveland", "Fatima Family Center"), place: "MidTown Cleveland", sublocation: "Fatima Family Center", src: "/assets/signage-partners/fatima-family-center.jpg", alt: "Two people beside the Fatima Family Center digital sign and phone-control QR poster", caption: "Fatima Family Center", fit: "contain" },
  { title: placeTitle("MidTown Cleveland", "Learning to Grow Child Enrichment"), place: "MidTown Cleveland", sublocation: "Learning to Grow Child Enrichment", src: "/assets/signage-partners/learning-to-grow.jpg", alt: "A person beside the Learning to Grow digital sign showing Cleveland Dashboard partners", caption: "Learning to Grow Child Enrichment", fit: "contain" },
  { title: placeTitle("MidTown Cleveland", "Foundry Lofts"), place: "MidTown Cleveland", sublocation: "Foundry Lofts", src: "/assets/signage-partners/foundry-lofts.jpg", alt: "A person below the Foundry Lofts digital sign showing the phone-controller instructions", caption: "Foundry Lofts", fit: "contain" },
];

export const phoneProductFrames: ProductBeat["frames"] = [{
      title: "Great Lakes Science Center",
      aliases: ["control-a-sign", "use-a-phone-or-touchpad", "great-lakes-science-center-use-a-phone-or-touchpad"],
      src: "/assets/phone-person-water-display.jpg",
      alt: "A visitor uses her phone beside a digital sign and a mounted touchpad at Great Lakes Science Center",
      fit: "contain",
      caption: "A visitor with a phone beside the digital sign and touchpad.",
    }, {
      title: "Oberlin – Phone and Touchpad Controllers",
      images: [
        {src: "/assets/phone-workflow/science-center-controller-live.jpg", alt: "Oberlin College Science Center: Carbon Neutral Stories controller"},
        {src: "/assets/phone-workflow/elementary-controller-live.jpg", alt: "Oberlin Public Schools: Elementary touchpad controller"},
      ],
      caption: "Actual Science Center and elementary school controller interfaces captured October 9, 2026.",
    }, {
      title: "MidTown Phone Controller Navigation",
      aliases: ["from-qr-code-to-digital-sign"],
      phoneWalkthrough: true,
      caption: "Scan the QR code, select content, and view it on the digital sign.",
    }];

// Oct 1 17:17 and Oct 7 16:12: lead with an actual person using the phone.
export function homeEngageBeats(): ProductBeat[] {
  return engageBeats.map((item) => item.id === "signage" ? { ...item, frames: [...item.frames.filter(frame => frame.src !== "/assets/hotel-oberlin-sign.jpg" && frame.src !== "/assets/eng-sign-daves-full.jpg").map(frame =>
    frame.src === "/assets/platform-explanation/interactive-signage.jpg" || frame.src === "/assets/hotel-oberlin-sign.jpg"
      ? { ...frame, title: placeTitle("City of Oberlin", "Hotel at Oberlin"), place: "City of Oberlin" as const, sublocation: "Hotel at Oberlin", aliases: [...(frame.aliases ?? []), "oberlin-hotel-at-oberlin"] } : frame), ...signagePartners] }
    : item.id === "embed" ? { ...item, frames: [{ title: "MidTown Cleveland – Events website", embed: getEmbed("calendar", "midtown-calendar").src, caption: "Live community calendar embedded on MidTown Cleveland’s events website." }, ...item.frames.map(frame => frame.embed === getEmbed("dashboards", "oberlin-city-schools").src ? {
      ...frame,
      embed: "https://oberlin.communityhub.cloud/dh-public/ops/dashboard/529",
      title: placeTitle("Oberlin Public Schools", "Oberlin Elementary School"),
      aliases: ["oberlin-public-schools-environmental-dashboard"],
      caption: "Oberlin Elementary School’s live dashboard, without the surrounding site navigation.",
    } : frame),
      { title: placeTitle("Oberlin College", "Environmental dashboard"), embed: "https://oberlin.communityhub.cloud/dh-public/oc-embed", caption: "Oberlin College’s published web embeddable." },
      { title: placeTitle("Great Lakes Science Center", "Environmental dashboard"), embed: getEmbed("dashboards", "great-lakes-science-center").src, caption: "Great Lakes Science Center’s published web embeddable." },
    ] } : item.id === "phone" ? {
    ...item,
    title: "Phone App",
    href: "/phone-app",
    body: "Our phone application is easily customized to meet the communication goals of each community. Viewers can directly access content that interests them on their phone and can also control current content displayed on the digital sign nearest to them. Touchpads provide access to the digital sign without requiring a personal phone.",
    frames: phoneProductFrames.slice(0, 1),
  } : item);
}

// Oct 7 pp. 14-15: real filtered Voices and the calendar's native branded header/carousel.
export const homeCalendar = {
  title: placeTitle("MidTown Cleveland", "Community Calendar"),
  embed: "https://cleveland.communityhub.cloud/calendar/?show-menu=0",
  caption: "MidTown Cleveland – Community Calendar",
};
export function homeEmpowerBeats(): ProductBeat[] {
  return empowerBeats.map(item => item.id === "calendar" ? { ...item, frames: [homeCalendar, ...item.frames.slice(1)] }
    : item.id === "voices" ? { ...item, frames: [voicesFilters.fallback[0], voicesFilters.filters[0]].map(filter => ({
      title: filter.title, embed: filter.url, caption: filter.title,
    })) } : item);
}

// Restored verbatim from v1 homepage, accessed 8 October 2026. No new marketing prose.
export const homeMission = {
  problem: "Communication innovations have enhanced the capacity to connect across great distances. Yet, they often leave us less connected to local communities in which we live, shop, work, and play and the social and environmental resources on which we depend.",
  solution: "CommunityHub’s award-winning communication platform includes sophisticated data acquisition and display applications. Using our tools, organizations, neighborhoods, and cities are motivating and empowering community engagement, connection, and resilience in the face of a rapidly changing environment.",
};
const attribution = [
  ["Grace Gao", "Oberlin College Student"],
  ["Kim Koos", "Elementary Teacher"],
  ["Scott Volmer", "VP STEM Learning, Great Lakes Science Center"],
  ["Bob Mendenhall", "Curriculum Director, Toledo"],
  ["Janet Haar", "Executive Director, Oberlin Business Partnership"],
  ["Linda Arbogast", "City of Oberlin Sustainability Coordinator"],
  ["Janet Haar", "Executive Director, Oberlin Business Partnership"],
  ["Geoff Hunter", "President, Palmer Conservation Consulting"],
];
const sourceFeatureImages = ["live-home-story-01.jpeg", "live-home-story-02.jpeg", "live-home-story-03.png", "live-home-story-04.jpeg", "live-home-story-05.jpeg", "sign-farmers-market.jpg", "live-home-story-07.jpeg", "live-home-story-08.jpeg"];
export function homeFeatureStories() {
  return stories.map((story) => {
    const index = sourceFeatureImages.indexOf(story.img.split("/").at(-1) ?? "");
    return ({ ...story,
    img: index === 5 ? "/assets/live-home-story-06.jpeg" : story.img,
    alt: index === 5 ? "A group in a library viewing resource-use data on a dashboard screen" : story.alt,
    links: index === 5 ? [{ href: "/data-hub", label: "Data Hub" }] : story.links,
    org: index === 3 ? "Toledo" : story.org,
    quote: index === 5 ? "CommunityHub's Digital Signage is central to our community's climate resilience communication strategy"
      : index === 6 ? "Community Hub’s events calendar has made our work easier. People in the community are participating — it’s simple, but transformative!"
      : index === 7 ? "For a decade we have looked to the CommunityHub team as key partners in translating our energy conservation services into community engagement"
      : story.quote,
    speaker: attribution[index]?.[0] ?? "",
    sourceRole: attribution[index]?.[1] ?? "",
  }); });
}

// One color guide is sufficient on the homepage; named-building variants remain in the asset library.
export function homeOrbBeats(): ProductBeat[] {
  return orbBeats.map(item => {
    const frames = item.frames.filter(frame =>
      frame.src !== "/assets/orb-poster-noah.jpg" && frame.src !== "/assets/orb-poster-kahn.jpg");
    if (item.id !== "orb") return { ...item, frames };
    const photo = frames.filter(frame => frame.src?.includes("orb-map-oberlin"));
    return { ...item, frames: [...photo, ...frames.filter(frame => !photo.includes(frame))] };
  });
}
