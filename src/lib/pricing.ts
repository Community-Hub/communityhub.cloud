// /pricing copy. Source: the rebuild's pricing.astro (CH/site/src/pages/pricing.astro) and the live site's pricing page
// (sources/live-site-repo/src/content/products-a.ts). There are no prices. The lede, the FAQ and the funder claim need
// John's sign-off (STORY-PLAN-GLADE.md). Item names are the v1 site's product names (V1-COPY-261008.md); Phone App and Building Dashboard sit in
// Communications and Web Embeddables in Data (founder, 7 Oct, FLOW.md).


export type Bundle = { id: string; name: string; items: string[]; note?: string };

export const bundles: Bundle[] = [
  {
    id: "communications",
    name: "Communications",
    items: ["Digital Signage", "Phone App", "Community Calendar", "Community Voices", "Story Maker", "Building Dashboard"],
    note: "Story Maker is in development.",
  },
  { id: "data", name: "Data", items: ["Data Hub", "Web Embeddables"] },
  {
    id: "pro",
    name: "Pro",
    items: ["Everything in the Communications bundle", "Everything in the Data bundle"],
    note: "Both bundles together.",
  },
];

export const services = [
  { id: "data-design", name: "Data design", line: "Data system design and data integration." },
  {
    id: "graphic-design",
    name: "Graphic design",
    line: "Custom illustration of your campus or town, stories that explain local systems, and posters, QR signage and outreach material.",
  },
];

export const faq = [
  {
    q: "How is Community Hub priced?",
    a: "It is cloud-hosted, with an annual fee. The price depends on what you connect and how many screens you run, so we quote each bundle for your site.",
  },
  {
    q: "What are the data and graphic design services?",
    a: "They are extras on any bundle. Data design is data system design and data integration. Graphic design is custom illustration of your campus or town, stories that explain local systems, and posters, QR signage and outreach material.",
  },
  {
    q: "Do we need to buy new meters?",
    a: "The Data bundle reads utility meters, data loggers and building automation systems. Tell us what you already have and we'll tell you what, if anything, you'd need to add.",
  },
  {
    q: "Do you provide the screens?",
    a: "Screen setup depends on the site. Tell us what's already in the room and we'll help you take it from there.",
  },
  {
    q: "Can you help us find funding?",
    a: "Environmental Dashboard work has been funded by the U.S. EPA, the Great Lakes Protection Fund, the Cleveland Foundation and, through the Great Lakes Colleges Association, the Andrew W. Mellon Foundation. We're glad to talk through funding sources with you.",
  },
];
