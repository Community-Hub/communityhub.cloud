import type { ProductSlide } from "@/components/product-pager";
import { getEmbed } from "@/data/embeds";
import voicesFilters from "@/data/voices-filters.json";
import { educateBeats, empowerBeats, engageBeats, placeTitle } from "@/lib/content";
import { SCHOOLS_NAME } from "@/lib/names";

/** The v1 description of a product, the same text its home tab shows. */
const v1 = (id: string): string =>
  [...engageBeats, ...educateBeats, ...empowerBeats].find((b) => b.id === id)?.body ?? "";

const more = (links: ProductSlide["links"]): ProductSlide => ({
  label: "Keep exploring",
  title: "Keep exploring",
  links,
});

export const productPages: Record<string, { title: string; slides: ProductSlide[] }> = {
  services: {
    title: "Design Services — Community Hub",
    slides: [
      {
        label: "Design services", title: "Design services",
        text: "CommunityHub offers data system design and integration alongside graphic design services. These services help connect an organization’s information with visual explanations that people can understand and use.",
        src: "/assets/student-data-hub.jpg",
        alt: "A student exploring resource-use information on a laptop",
        frameTitle: "Connecting information with people",
        caption: "Resource-use information in an educational setting.",
        features: [
          {title: "Data design", body: "Data system design and integration."},
          {title: "Graphic design", body: "Illustrations and stories about local places and systems."},
          {title: "Outreach materials", body: "Posters, QR signage, and materials for your audience."},
        ],
      },
      {
        label: "Data design", title: "Connect your data",
        text: "Data design services support data system design and integration. Start with the information your organization has and the resource-use questions you want to communicate. Data Hub provides the tools to turn that information into visualizations.",
        embed: getEmbed("datahub", "embeddable").src,
        frameTitle: "Oberlin — Electricity chart",
        caption: "A live public electricity visualization.",
        live: {href: "/data-hub", label: "Explore Data Hub"},
      },
      {
        label: "Graphic design", title: "Make local systems visible",
        text: "Graphic design services include custom illustrations of a campus or town, stories that explain local systems, and posters, QR signage, and outreach material. The design connects the information with the places and people it represents.",
        src: "/assets/art-campus-band.jpg", fit: "contain",
        frameTitle: "A campus and its energy system",
        alt: "An illustration of campus buildings, solar panels, and the underground connections between them",
        caption: "Campus buildings and their energy connections.",
        live: {href: "/stories", label: "Explore Stories"},
      },
      more([
        {href: "/data-hub", label: "Data Hub", note: "Manage, visualize, and share resource data."},
        {href: "/stories", label: "Stories", note: "Explain the local systems people depend on."},
        {href: "/pricing", label: "Bundles", note: "Discuss a combination of products and services for your site."},
      ]),
    ],
  },
  phone: {
    title: "Phone App — Community Hub",
    slides: [
      {
        label: "Phone App", title: "Phone App",
        text: v1("phone"),
        src: "/assets/phone-workflow/science-center-touchpad.jpg",
        alt: "People beside the Carbon Neutral Stories exhibit and its touchpad at Oberlin College Science Center",
        frameTitle: "Oberlin College — Science Center",
        caption: "Oberlin — Oberlin College Carbon Neutral Stories",
        captionAbove: true,
        features: [
          {title: "Control a sign", body: "Choose what appears on a nearby digital sign."},
          {title: "Open a story", body: "Scan a story’s QR code to view it directly on your phone."},
          {title: "Browse community content", body: "Explore community information in a view designed for your phone."},
        ],
      },
      {
        label: "Control a sign", title: "Your phone can control a screen",
        text: "Your phone can act as a controller for a nearby digital sign. You can scan the sign’s QR code to open its controller and choose what appears on the screen. The example below shows a visitor choosing MidTown’s Neighborhood Vision Plan.",
        phoneWalkthrough: true, wide: true,
        caption: "Illustrated example: MidTown’s Neighborhood Vision Plan.",
        live: {href: "/digital-signage#try-the-phone", label: "Control a screen on the Digital Signage page"},
      },
      {
        label: "Content on your phone", title: "Explore on your own screen",
        text: "A story’s QR code opens that story directly on your phone. You can explore its chapters on your own screen. The phone app also provides a mobile view of community content, so you can browse events, Community Voices, and dashboards without controlling a nearby sign.",
        src: "/assets/phone-workflow/stories-on-phone.png",
        alt: "Original illustration of Carbon Neutral Stories viewed directly on a landscape phone, with topic navigation",
        frameTitle: "Oberlin College — Stories on a phone",
        caption: "Illustration of Oberlin College stories viewed directly on a phone.",
        live: {href: getEmbed("stories", "stories").src, label: "Explore the stories"},
        features: [
          {title: "Stories", body: "Choose a local system and explore its chapters."},
          {title: "Events", body: "Find activities and announcements in your community."},
          {title: "Community information", body: "Browse shared messages and resource-use information."},
        ],
      },
      {
        label: "Controllers", title: "Controllers",
        text: "These controllers let visitors choose what appears on the digital sign in front of them. Open a sign’s controller on your phone, or use the touchpad beside the display. Each controller offers the content available at its location.",
        images: [
          {src: "/assets/phone-workflow/elementary-controller-live.jpg", alt: "Oberlin Elementary touchpad controller", label: "Oberlin Elementary"},
          {src: "/assets/phone-workflow/science-center-controller-live.jpg", alt: "Oberlin College Science Center story controller", label: "Oberlin College Science Center"},
        ],
        frameTitle: "Controllers for different locations",
        caption: "Recorded controller examples. Each controls the display at its own location.",
      },
      more([
        {href: "/digital-signage", label: "Digital Signage", note: "See what the shared screen can display."},
        {href: "/stories", label: "Stories", note: "Explore illustrated explanations of local systems."},
        {href: "/community-calendar", label: "Community Calendar", note: "Connect with events and announcements."},
      ]),
    ],
  },
  embed: {
    title: "Web Embeddables — Community Hub",
    slides: [
      {
        label: "Web Embeddables",
        icon: "/assets/icon-embed.png",
        title: "Web Embeddables",
        features: [{"title": "Calendars and announcements", "body": "Bring community events into a partner website."}, {"title": "Data and dashboards", "body": "Share live charts or a navigable dashboard."}, {"title": "Community messages", "body": "Choose Community Voices content for your audience."}],
        text: v1("embed"),
        frameTitle: placeTitle("City of Oberlin", "Community Calendar"),
        embed: "https://oberlin.communityhub.cloud/calendar/?embed=1&show-menu-bar=1",
        caption: "Oberlin's community calendar, live.",
      },
      {
        label: "School dashboard",
        title: "A dashboard on your website",
        frameTitle: placeTitle(SCHOOLS_NAME, "Environmental dashboard"),
        text: "Bring building data into the websites your community already uses. This live school dashboard keeps its own navigation, so visitors can explore the buildings without leaving the page.",
        wide: true,
        embed: getEmbed("dashboards", "oberlin-city-schools").src,
        caption: "",
      },
      {
        label: "Ecolympics",
        title: "Share progress as it happens",
        frameTitle: placeTitle("City of Oberlin", "Ecolympics standings"),
        text: "Partners can embed a focused view, such as the standings in a resource-conservation competition. The content comes from CommunityHub while the surrounding website stays their own.",
        wide: true,
        embed: "https://oberlin.communityhub.cloud/data-hub/embed/ecolympic-tab-contents/2026",
        caption: "",
      },
      {
        label: "Oberlin College page",
        title: "Part of a partner’s site",
        frameTitle: "Oberlin College — Environmental dashboard",
        text: "A partner can present CommunityHub content alongside its own information and navigation. This example shows the dashboard in the context of an organization’s web page.",
        src: "/assets/mini-oc-embed.jpg",
        alt: "A web page with a menu down the left side and the Oberlin College Environmental Dashboard in it",
        caption: "",
      },
      {
        label: "Voices slideshow",
        title: "Community Voices",
        frameTitle: voicesFilters.filters[0].title,
        text: "Community Voices brings community members’ images and words to partner websites. Categories let an organization choose the messages relevant to its audience.",
        voices: true,
        caption: "A slideshow a partner site can show full screen, filtered by category, live.",
      },
      more([
        { href: "/community-calendar", label: "Community Calendar", note: "The events list partners embed" },
        { href: "/dashboard-builder", label: "Building Dashboard", note: "One building, electricity and water" },
        { href: "/community-voices", label: "Community Voices", note: "Community images, ideas and actions" },
      ]),
    ],
  },
  building: {
    title: "Building Dashboard — Community Hub",
    slides: [
      {
        label: "Building Dashboard",
        icon: "/assets/v1/bdash.png",
        title: "Building Dashboard",
        features: [{"title": "See current use", "body": "Communicate electricity, water, and other resource data."}, {"title": "Put it in context", "body": "Compare patterns over time and with typical use."}, {"title": "Make it your own", "body": "Bring your organization’s data together in Dashboard Builder."}],
        text: "Building Dashboard tracks and communicates patterns of real-time resource use in buildings in ways that engage, are easy to understand and make connections between resource conservation and resulting environmental and community benefits.",
        frameTitle: placeTitle("Oberlin College", "Harkness Co-op"),
        embed: "https://oberlin.communityhub.cloud/dh-public/oc/dashboard/815",
        nativeSize: true,
        fit: "contain",
        alt: "A building dashboard: a photo of a brick building with a flowering tree, a heat map, tiles for total cooling, electricity, heating and water, a natural gas chart, and a cooling and heating profile",
        caption: "",
      },

      {
        label: "In a classroom",
        title: "Make resource use visible",
        frameTitle: placeTitle(SCHOOLS_NAME, "Building Dashboard"),
        text: "In a classroom, the school’s own resource data gives students a local example to explore. The dashboard connects the building they use every day with patterns of electricity and water use.",
        src: "/assets/classroom-dashboard.jpg",
        alt: "A classroom with the school building dashboard on screen",
        caption: `The same dashboard, on a screen students can read at ${SCHOOLS_NAME}.`,
      },
      {
        label: "Kahn Hall",
        title: "Understand patterns",
        frameTitle: "Oberlin College — Kahn Hall",
        text: "A time-series chart puts current use in context. This recorded Kahn Hall example compares electricity use over seven days with the building’s typical pattern.",
        src: "/assets/originals/kahn-dashboard-slide67.jpg",
        fit: "contain",
        alt: "Kahn Hall electricity over the last 7 days",
        caption: "Kahn Hall, an Oberlin College residence hall, with the last 7 days of electricity against typical use.",
      },

      {
        label: "Dashboard Builder",
        title: "Build your own dashboards",
        text: "Community Hub gives clients the tools to build their own dashboards. Dashboard Builder brings resource data and visualizations together in a dashboard for their organization.",
        embed: "https://oberlin.communityhub.cloud/dh-public/ops/dashboard/529",
        nativeSize: true,
        frameTitle: "Oberlin Elementary — Building Dashboard",
        caption: "An example of a finished dashboard for a school. Scroll inside to explore the resource data.",
      },
      more([
        { href: "/citywide-dashboard", label: "Citywide Dashboard", note: "The whole town, not one building" },
        { href: "/data-hub", label: "Data Hub", note: "Where these charts are made" },
        { href: "/web-embeddables", label: "Web Embeddables", note: "Put this dashboard on a school site" },
      ]),
    ],
  },
  city: {
    title: "Citywide Dashboard — Community Hub",
    slides: [
      {
        label: "Citywide Dashboard",
        icon: "/assets/icon-cwd.png",
        title: "Citywide Dashboard",
        frameTitle: placeTitle("City of Oberlin", "Citywide Dashboard"),
        features: [{"title": "Whole-community flows", "body": "See electricity and drinking water at the community scale."}, {"title": "Environmental conditions", "body": "Connect resource use with the surrounding environment."}, {"title": "A familiar place", "body": "Illustrate the town or campus people call home."}],
        text: v1("city"),
        live: { href: getEmbed("datahub", "citywide").src, label: "Open live dashboard" },
        embed: getEmbed("datahub", "citywide").src,
        fit: "contain",
        alt: "Illustrated citywide dashboard: the town with its power, water, and weather",
        caption: "The Oberlin citywide dashboard.",
      },
      {
        label: "Cleveland",
        title: "Your community, illustrated",
        frameTitle: placeTitle("Great Lakes Science Center", "Citywide Dashboard"),
        text: "Each Citywide Dashboard represents its own community. Cleveland’s illustrated landscape connects local places with electricity, water, and environmental conditions.",
        embed: "https://cleveland.communityhub.cloud/citywide-dashboard/index?embed=1&show-menu=0",
        alt: "Cleveland citywide dashboard",
        caption: "The same kind of picture for a different city, Cleveland.",
      },











      more([
        { href: "/dashboard-builder", label: "Building Dashboard", note: "One building, up close" },
        { href: "/stories", label: "Stories", note: "How the local systems work" },
        { href: "/digital-signage", label: "Digital Signage", note: "Where this picture plays in public" },
      ]),
    ],
  },
  hub: {
    title: "Data Hub — Community Hub",
    slides: [
      {
        label: "Data Hub",
        icon: "/assets/icon-datahub.png",
        title: "Data Hub",
        frameTitle: placeTitle("Oberlin College", "Data Hub"),
        features: [{"title": "Collect and manage", "body": "Bring measurements from different sources together."}, {"title": "Explore and visualize", "body": "Translate resource data into charts and comparisons."}, {"title": "Share the results", "body": "Publish visualizations on websites and digital signage."}],
        text: v1("hub"),
        src: "/assets/data-hub.png",
        alt: "The Data Hub interface: a variables table, an electricity chart for one Oberlin building, and chart options",
        caption: "Recorded Data Hub interface: variables, visualization settings and chart output.",
      },




      {
        label: "Compare over time", title: "Explore changes over time",
        text: "Time-series charts show how resource use changes through the day. This live electricity chart is one of the public visualizations that can be shared independently of a full dashboard.",
        embed: getEmbed("datahub", "embeddable").src,
        frameTitle: "Oberlin — Electricity use", wide: true,
        live: {href: getEmbed("datahub", "embeddable").src, label: "Open the live chart"},
      },
      {
        label: "Analytics heat map",
        title: "Find patterns in the data",
        frameTitle: placeTitle("City of Oberlin", "Whole City Electricity Use"),
        text: "A heat map makes patterns across hours and days visible. Explore this public electricity visualization to see one of the ways Data Hub turns measurements into information people can use.",
        wide: true,
        embed: getEmbed("datahub", "heat-map").src,
        fit: "contain",
        alt: "A heat map of resource use: each row is one day, colored from green to red",
        caption: "",
      },
      more([
        { href: "/dashboard-builder", label: "Building Dashboard", note: "What the public sees for one building" },
        { href: "/citywide-dashboard", label: "Citywide Dashboard", note: "What the public sees for the town" },
        { href: "/web-embeddables", label: "Web Embeddables", note: "Put a chart on another site" },
      ]),
    ],
  },
  stories: {
    title: "Stories — Community Hub",
    slides: [
      {
        label: "Stories",
        icon: "/assets/icon-stories.png",
        title: "Stories",
        frameTitle: placeTitle("Oberlin College", "Carbon Neutral Stories"),
        features: [{"title": "Local systems", "body": "Explain the water, energy, and other systems people depend on."}, {"title": "Visual explanations", "body": "Use illustrations and moving presentations to make connections."}, {"title": "Different settings", "body": "Share stories through screens, phones, and websites."}],
        text: "Illustrated stories of how local systems work. They play on screens, phones, and the web.",
        embed: "https://docs.google.com/presentation/d/1IQ-xVTkfJP4P3UY-FY8DltGmR8Lzo5r5TFJbf5RyfxI/embed?start=true&loop=true&delayms=8000",
        presentation: true,
        live: { href: getEmbed("stories", "stories").src, label: "Explore the stories" },
        alt: "Oberlin heating story",
        caption: "",
      },
      {
        label: "The lake",
        title: "Stories rooted in a place",
        frameTitle: placeTitle("Great Lakes Science Center", "Our Lake story"),
        text: "Local stories connect environmental systems with places people recognize. The Great Lakes Science Center’s stories invite visitors to explore Lake Erie and their relationship with it.",
        wide: true,
        embed: getEmbed("stories", "glsc-stories").src,
        alt: "Climate story for the Great Lakes Science Center",
        caption: "A story about Lake Erie, for the Great Lakes Science Center.",
      },

      {
        label: "The district energy system",
        title: "Explain local systems",
        frameTitle: "Oberlin College — District energy system",
        text: "Illustration makes systems that are usually out of sight visible. This story shows how geothermal wells and heat pumps provide heating and cooling across the campus.",
        src: "/assets/art-geothermal-full.jpg",
        alt: "An illustrated campus with geothermal wells underground and text about the district energy system",
        caption: "Oberlin's state-of-the-art district energy system combines green electricity and geothermal heat pump technology to produce carbon-free heating and cooling for the campus.",
      },












      {
        label: "The whole case",
        title: "From a story to an exhibit",
        frameTitle: "Oberlin College — Carbon Neutral Stories",
        text: "Stories can become part of a physical exhibit, bringing together a digital display, illustrations, and objects that help visitors explore the local system.",
        src: "/assets/originals/science-center-exhibit-complete.jpg",
        alt: "A display case titled Carbon Neutral Stories, with a screen in the middle, posters and objects",
        caption: "",
      },
      more([
        { href: "/digital-signage", label: "Digital Signage", note: "Screens that play these stories" },
        { href: "/citywide-dashboard", label: "Citywide Dashboard", note: "The town picture the stories sit next to" },
        { href: "/web-embeddables", label: "Web Embeddables", note: "A story chapter on a partner site" },
      ]),
    ],
  },
  calendar: {
    title: "Community Calendar — Community Hub",
    slides: [
      {
        label: "MidTown Cleveland",
        icon: "/assets/icon-calendar.png",
        title: "Community Calendar",
        frameTitle: placeTitle("MidTown Cleveland", "Community Calendar"),
        features: [{"title": "Community events", "body": "Give organizations and residents a place to share events."}, {"title": "Local announcements", "body": "Connect people with opportunities in their community."}, {"title": "Shared across sites", "body": "Bring the same calendar to partner websites and signs."}],
        text: v1("calendar"),
        embed: "https://cleveland.communityhub.cloud/calendar/?show-menu=0",
        caption: "The calendar MidTown Cleveland shows on its own events page.",
      },
      {
        label: "Oberlin",
        title: "Community Calendar",
        frameTitle: placeTitle("City of Oberlin", "Community Calendar"),
        text: "Each community has its own events and announcements. Explore Oberlin’s live calendar to see how local organizations and residents share what is happening around them.",
        wide: true,
        embed: "https://oberlin.communityhub.cloud/calendar/?show-menu=0",
        fit: "contain",
        alt: "Oberlin community calendar",
        caption: "",
      },

      {
        label: "On their site",
        title: "Community Calendar",
        frameTitle: placeTitle("City of Oberlin", "Calendar on a partner site"),
        text: "Organizations can embed the community calendar in their own websites, helping people find local events in places they already visit online. This recorded partner page shows how the calendar sits beside local information.",
        src: "/assets/cal-partner-oberlin-cal.jpg",
        fit: "contain",
        alt: "Calendar embedded in a partner website",
        caption: "A school or a shop can put the calendar on its own website, as on this partner page.",
      },
      more([
        { href: "/digital-signage", label: "Digital Signage", note: "Events, on the public screens" },
        { href: "/web-embeddables", label: "Web Embeddables", note: "The calendar inside another site" },
        { href: "/community-voices", label: "Community Voices", note: "What neighbors have to say" },
      ]),
    ],
  },
  voices: {
    title: "Community Voices — Community Hub",
    slides: [
      {
        label: "Community Voices",
        icon: "/assets/icon-cv.png",
        title: "Community Voices",
        frameTitle: voicesFilters.filters[0].title,
        features: [{"title": "Images and words", "body": "Keep a person’s image and message together."}, {"title": "Relevant categories", "body": "Organize messages around themes within the community."}, {"title": "Across the community", "body": "Share the messages on signs, phones, and websites."}],
        text: v1("voices"),
        voices: true,
        caption: "Live Community Voices messages, organized by category.",
      },
      {
        label: "Messages for your audience",
        title: "Messages that connect",
        text: "Community Voices combines a person’s image and words in one message. Organizations can build and organize a collection, then choose the categories that reflect their community and the people they want to reach.",
        embed: voicesFilters.filters[4].url,
        fit: "contain",
        alt: "A Community Voices message captured from the Oberlin Elementary digital sign",
        frameTitle: "Oberlin — Next Generation",
        caption: "Live messages in the Next Generation category. Each photo, message, and attribution remains together.",
      },
      more([
        { href: "/digital-signage", label: "Digital Signage", note: "Where these slides play in public" },
        { href: "/community-calendar", label: "Community Calendar", note: "Events, next to what people said" },
        { href: "/web-embeddables", label: "Web Embeddables", note: "The slideshow on a partner site" },
      ]),
    ],
  },
};
