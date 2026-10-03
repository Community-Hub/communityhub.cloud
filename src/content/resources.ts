import { communicationNetwork } from "./communication-network";
import lessonLinks from "./lesson-links.json";
/** Resource, research, Story of Dashboard, About, Contact, and 404 page content.
 * Facts and source URLs are preserved from the reviewed September 30 prototype.
 * Shared document structure and presentation helpers live in the Astro shell.
 */
import { renderButton, renderField, renderStatus } from "../lib/ui";
import type { SiteContext } from "../lib/site";

type Paper = readonly [
  author: string,
  title: string,
  finding: string,
  graphic: string,
  href: string,
  context?: string,
];

// The original research diagrams round exact half values to the nearest even integer.
function roundHalfEven(value: number): number {
  const lower = Math.floor(value);
  return value - lower === 0.5
    ? lower % 2 === 0
      ? lower
      : lower + 1
    : Math.round(value);
}

const CHECK =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>';
const LESSONS = [
  [
    "Who Cares What's Trending? Curve Fitting with Environmental Dashboard and Desmos",
    "",
    "Grades 8 to 12",
    "Lesson",
    "m h",
  ] as const,
  [
    "Problem Solving for Conservation with BuildingOS",
    "",
    "Grade 9 to college",
    "Lesson",
    "h c",
  ] as const,
  [
    "Electricity and Water Use Signature Assignment",
    "",
    "Grade 5 to college",
    "Unit",
    "e m h c",
  ] as const,
  [
    "Photography and Community Voices Content",
    "",
    "Grade 7 to college",
    "Lesson",
    "m h c",
  ] as const,
  [
    "Oberlin Dashboard: Introducing Electricity",
    "",
    "Grades 10 to 12",
    "Lesson",
    "h",
  ] as const,
  ["Our Role in the Energy System", "", "", "Lesson", ""] as const,
  ["What is a System?", "", "", "Lesson", ""] as const,
  ["Thinking in Systems", "", "", "Unit", ""] as const,
  [
    "Natural Resource Economics",
    "Christine Hohman",
    "Grades 3 to 4",
    "",
    "e",
  ] as const,
  [
    "Bioregional Dashboard Water Systems Field Trip",
    "Joy Harrison",
    "Grades 3 to 5",
    "",
    "e",
  ] as const,
  ["Water Flow Introduction", "Joy Harrison", "", "", ""] as const,
  ["Water Systems", "Joy Harrison", "", "Unit", ""] as const,
  [
    "Kill-A-Watt",
    "Shane Clark and Danny Rosenberg",
    "Grades 4 to 5",
    "",
    "e",
  ] as const,
  ["4th Grade Electricity Circuits Unit", "", "Grade 4", "Unit", "e"] as const,
  ["Systems Thinking and Electricity", "", "", "Unit", ""] as const,
  [
    "Dashboard Scavenger Hunt",
    "Jennifer Smillie",
    "Grades 9 to 12",
    "",
    "h",
  ] as const,
  [
    "How Do Resources Meet Our Needs?",
    "Courtney Dendorfer and Kristi Walter",
    "Grade 1",
    "",
    "e",
  ] as const,
  [
    "Creating an Energy Budget",
    "Felicia Christian",
    "Grades 3 to 4",
    "",
    "e",
  ] as const,
  [
    "Monitoring Our Energy Use to Inspire Better Choices",
    "Felicia Christian",
    "",
    "",
    "",
  ] as const,
  ["How Much is Energy Use Costing?", "Felicia Christian", "", "", ""] as const,
  [
    "Understanding How Energy is Measured",
    "Felicia Christian",
    "",
    "",
    "",
  ] as const,
  [
    "Understanding Resource Units and Choices, Consequences, and Budgets",
    "Felicia Christian",
    "",
    "Unit",
    "",
  ] as const,
  [
    "The Electricity System Continued",
    "Shane Clark and Danny Rosenberg",
    "Grades 7 to 10",
    "",
    "m h",
  ] as const,
  ["Systems Thinking and Energy", "", "", "", ""] as const,
  ["What's Wrong with this Graph?", "Jennifer Smillie", "", "", ""] as const,
  ["Can We Change Our Habits?", "Jennifer Smillie", "", "Unit", ""] as const,
  [
    "Storytelling with Dashboard and Excel",
    "Jennifer Smillie",
    "",
    "",
    "",
  ] as const,
  [
    "Interpreting Graphs, Big Data, and the Five Number Summary",
    "",
    "",
    "",
    "",
  ] as const,
  ["What's Big Data? and Interpreting Graphs", "", "", "", ""] as const,
  ["Big Data and the Five Number Summary", "", "", "Unit", ""] as const,
  ["Can We Learn from Ecolympics?", "Jennifer Smillie", "", "", ""] as const,
  ["Spending Energy to Save Energy", "Jennifer Smillie", "", "", ""] as const,
  [
    "Graphing Electricity",
    "Shane Clark and Danny Rosenberg",
    "",
    "",
    "",
  ] as const,
  [
    "Introduction to the Dashboard (Electricity, 2017)",
    "",
    "",
    "",
    "",
  ] as const,
  ["Introduction to the Dashboard", "", "", "", ""] as const,
];
const PRESS = [
  [
    "Council Leader magazine, Australia",
    "Smart Cities with Urban Dashboards: Giving the Community Feedback About Their City",
    "var(--peri)",
  ] as const,
  [
    "Grist",
    "This online dashboard shows you a city's water and electric usage in real time",
    "var(--water)",
  ] as const,
  [
    "Living on Earth",
    "Oberlin Environmental Dashboard",
    "var(--leaf-deep)",
  ] as const,
  [
    "Oberlin College news",
    "Environmental Studies Students Key Players in Cleveland Foundation Grant",
    "var(--amber)",
  ] as const,
  [
    "DePauw University",
    "Grant Will Bolster Sustainability Initiatives at DePauw and 4 Other GLCA Colleges",
    "var(--violet)",
  ] as const,
  [
    "Fondriest Environmental Monitor",
    "Environmental Dashboard makes citywide energy and water impacts clear",
    "var(--sky-deep)",
  ] as const,
  [
    "Green City Blue Lake, Cleveland Museum of Natural History",
    "Oberlin Dashboard animation makes acting for climate fun",
    "var(--clay)",
  ] as const,
  [
    "KQED Science",
    "Tracking Your Own Footprints: Digital Tools to Inspire Conservation",
    "var(--red)",
  ] as const,
];
const VIDEOS = [
  [
    "YSXFKSvN75o",
    "Climate Change: Global Temperatures",
    "Trends in global temperature over the past decade.",
  ] as const,
  [
    "ZFVBPEpA4RA",
    "Technology for Change",
    "How Environmental Dashboard sets out to engage, educate, motivate and empower a new generation.",
  ] as const,
  [
    "2fCQ3qdJnh0",
    "Resources Explained: Carbon Neutrality",
    "How much of Oberlin's electricity comes from carbon neutral sources.",
  ] as const,
  [
    "VEUDNRkChXs",
    "Resources Explained: Drinking Water",
    "Where Oberlin gets its drinking water.",
  ] as const,
  [
    "3zge8P0GtPM",
    "Resources Explained: Renewable Energy",
    "What the solar array adds to Oberlin's renewable energy.",
  ] as const,
];
const TEAM = [
  ["live-team-01.jpg", "John Petersen", "Director"] as const,
  ["live-team-02.jpg", "Ethan Woodfill", "Project Manager"] as const,
  ["live-team-03.jpg", "Madeleine Faubert", "Design and Media"] as const,
  ["live-team-04.jpg", "Gaurav Bora", "Software Engineer"] as const,
  ["live-team-05.jpg", "Pratyush Bharti", "Software Engineer"] as const,
  ["live-team-06.jpg", "Hitesh Jangid", "Software Engineer"] as const,
];
const PARTNERS = [
  [
    "icon-cities.png",
    "City of Oberlin",
    "Working with the dashboard team since 2008. 24 interactive signs run around town.",
  ] as const,
  [
    "icon-campuses.png",
    "Oberlin College",
    "More than 700 metered points in 85 buildings, plus 34 Environmental Orbs and nine C-Neutral Stories.",
  ] as const,
  [
    "icon-schools.png",
    "Oberlin City Schools",
    "Hallway screens in every school, a district dashboard and Ecolympics.",
  ] as const,
  [
    "icon-museums.png",
    "Great Lakes Science Center",
    "The Cleveland Environmental Dashboard and a live museum exhibit.",
  ] as const,
  [
    "icon-neighborhoods.png",
    "MidTown Cleveland",
    "A neighborhood dashboard with 10 partner locations by January 2026.",
  ] as const,
  [
    "icon-campuses.png",
    "Hamilton College",
    "A campus dashboard pilot, running from May 2026 to spring 2027.",
  ] as const,
];
export function register(H: SiteContext): void {
  const e = H.e;
  const ARR = H.ARR;
  function simple_hero(
    label: string,
    h1: string,
    lede: string,
    media: string,
    ctas: string | null = null,
  ): string {
    return H.hero(
      H.crumbs([null, label] as const),
      label,
      h1,
      lede,
      media,
      ctas,
    );
  }
  function sec_label(
    label: string,
    h2: string,
    intro: string = "",
    hid: string | null = null,
  ): string {
    const idattr = hid ? ` id="${hid}"` : "";
    const p = intro
      ? `<p class="lede" style="margin-top:10px">${intro}</p>`
      : "";
    return `<div><p class="fig">${label}</p><h2 class="h2"${idattr} style="margin-top:8px">${h2}</h2>${p}</div>`;
  }
  function quote_by(who: string, testimonials: boolean = true): string {
    const pool = testimonials ? H.TESTIMONIALS : [];
    for (const t of pool) {
      if (t["who"] === who) {
        return H.quote(t["quote"], t["who"], t["role"]);
      }
    }
    return "";
  }
  function cv_quote_by(who: string): string {
    for (const [_img, _alt, q, w, role, _c, _cat] of H.CV_SLIDES) {
      if (w === who) {
        return H.quote(q, w, role);
      }
    }
    return "";
  }
  function education(): void {
    const n = LESSONS.length;
    let items = "";
    for (const [t, a, g, ty, lv] of LESSONS) {
      const pdf = (lessonLinks as Record<string, string>)[t];
      if (!pdf) throw new Error(`Missing verified lesson PDF: ${t}`);
      const meta = [a, g]
        .filter((x) => x)
        .map((x) => x)
        .join(" and ");
      items +=
        `<li data-level="${e(lv)}"><div><b><a href="${e(pdf)}" target="_blank" rel="noopener noreferrer" aria-label="Open PDF: ${e(t)}">${e(t)}</a></b>` +
        (meta ? `<br><span>${e(meta)}</span>` : "") +
        "</div>" +
        (ty ? `<span class="rs-tag">${e(ty)}</span>` : "") +
        "</li>";
    }
    const hero = simple_hero(
      "Resources",
      "Teacher toolkit",
      "Educators from a variety of schools have creatively employed Environmental Dashboard to teach a variety of concepts, subjects and levels.",
      "",
    );
    const library_help = sec_label("Lesson library", "Teacher Resources", "Search by title or author, or filter by grade. The lessons are free PDFs on environmentaldashboard.org.");
    const who_what = `<section class="sec-pad education-guide"><div class="wrap resource-evidence" data-story-scene="desktop">
  <div class="education-evidence-visual" data-story-scene="short-phone">
    ${H.postcard("classroom-2040.jpg", "Elementary students in a classroom watch the Citywide Dashboard on a smartboard while their teacher points to it")}
    <div class="education-evidence-heading">${library_help}</div>
  </div>
  <div class="education-evidence-help" data-story-scene="short-phone">${H.feat_list([["Can I use this?", "Yes. Every lesson is a free PDF, and most link to the live dashboard they use."] as const, ["How?", "Pick a lesson by grade band in the lesson library, or search by title and author, then open its PDF."] as const])}
  <p><a class="btn-ink btn-big" href="#library">Browse the lesson library ${ARR}</a></p></div>
</div></section>`;
    const who = `<section class="sec-pad" style="padding-top:0"><div class="wrap" data-story-scene="all">
  ${sec_label("Who it's for", "Why are Dashboard educational tools unique?", "Subjects include science, math, social studies, language arts and integrated STEM.")}
  <div class="rs-stanza-2" style="margin-top:24px">
    <div class="stanza" style="background:var(--amber-tint)"><h3>K to 12 teachers</h3><p>Lessons cover standard, honors, AP and special needs classes, aligned to Ohio Learning Standards, Common Core and IB.</p></div>
    <div class="stanza" style="background:var(--leaf-tint)"><h3>College faculty</h3><p>Courses that use campus building data span environmental studies, data science, geology, biology, psychology, computer science and public health.</p></div>
  </div>
</div></section>`;
    const library = `<section class="sec-pad resource-opening resource-library" id="library" data-stable-start><div class="wrap resource-scene library-layout" data-story-scene="all"><div class="library-intro">${hero}</div><div class="library-tools">
  <h2 class="education-short-heading">Lesson library</h2>
  <div class="rs-lib">
    <div class="rs-lib-tools"><label class="rs-sr" for="lesson-q">Search lessons</label>
      <input id="lesson-q" type="search" placeholder="Search by title, author or grade">
      <div class="rs-seg" id="lesson-level" role="group" aria-label="Grade level">
        <button type="button" data-level="all" aria-pressed="true">All</button>
        <button type="button" data-level="e" aria-pressed="false">1 to 5</button>
        <button type="button" data-level="m" aria-pressed="false">6 to 8</button>
        <button type="button" data-level="h" aria-pressed="false">9 to 12</button>
        <button type="button" data-level="c" aria-pressed="false">College</button>
      </div></div>
    <p class="fig" id="lesson-count" aria-live="polite" style="margin:14px 0 10px"></p>
    <ul class="rs-lessons" id="lessons" data-scroll-owner tabindex="0" aria-label="Matching lessons">${items}</ul>
    <p class="rs-lessons-empty" id="lessons-empty" hidden>No lessons match. Try a different word or grade.</p>
  </div>
  <p style="margin-top:22px"><a class="hand-link" href="https://environmentaldashboard.org/edresources/searchedresources" target="_blank" rel="noopener"><svg class="hand-arrow" viewBox="0 0 70 44" aria-hidden="true"><path d="M4 8 C 18 34, 40 38, 62 26"/></svg>Open the lesson search on environmentaldashboard.org</a></p>
</div></div></section>`;
    const eco = `<section class="sec-pad education-ecolympics"><div class="wrap education-eco-layout" data-story-scene="desktop">
  <div class="education-eco-context" data-story-scene="short-phone">
  ${sec_label("Ecolympics", "Oberlin Ecolympics", "Oberlin buildings compete each spring to cut use against their own baseline. Four groups compete at once: city schools, community buildings, Oberlin College residence halls and other college buildings.")}
    <div class="stanza" style="background:var(--amber)"><h3>About 10%</h3><p style="color:#fff">Less dorm electricity at Oberlin College during Ecolympics, a drop that holds after the competition ends.</p></div>
  </div>
  <div class="education-eco-results" data-story-scene="short-phone">
    <h2 class="education-short-heading">Ecolympics results</h2>
    <div class="stanza" style="background:var(--leaf-deep)"><h3>10,050 kWh</h3><p style="color:#fff">Saved community wide in 2024, meeting Oberlin's 10,000 kilowatt hour goal.</p></div>
    <div class="stanza" style="background:var(--leaf-deep)"><h3>2,570 gal</h3><p style="color:#fff">Saved by Oberlin City Schools in 2024, the biggest water cut of any group that year.</p></div>
  </div>
</div></section>`;
    const q = quote_by("Bob Mendenhall");
    const body =
      library +
      who_what +
      who +
      eco +
      q +
      H.cta_band();
    H.write_page(
      "education",
      H.page(
        "education",
        "Teacher toolkit",
        `Free lesson plans and units, ${n} in all, that use live electricity and water data from Environmental Dashboard, for grade 1 through college.`,
        body,
        { current: "education" },
      ),
    );
  }
  function bring_a_dashboard(): void {
    function flow_node(
      icon_img: string,
      title: string,
      text: string,
      big: boolean = false,
    ): string {
      const ic =
        icon_img !== "ch"
          ? `<img src="assets/${icon_img}" alt="" loading="lazy">`
          : '<svg class="rs-flow-mark" aria-hidden="true"><use href="#ch-mark"/></svg>';
      const cls = big ? " rs-flow-hub" : "";
      return `<div class="rs-flow-node${cls}">${ic}<b>${title}</b><span>${text}</span></div>`;
    }
    function flow_connector(): string {
      return '<span class="rs-flow-connector" aria-hidden="true"></span>';
    }

    const flow = `<div class="rs-flow" aria-label="Data flows from the utility to Data Hub to screens, phones and websites">
  ${flow_node("story-watertreatment.png", "Utility and treatment plants", "Measure electricity, drinking water and wastewater for the whole town")}
  ${flow_connector()}
  ${flow_node("ch", "Data Hub", "Collects the readings. In Oberlin, a new one arrives every minute.", true)}
  ${flow_connector()}
  ${flow_node("icon-cwd.png", "Screens, phones and web", "The Citywide Dashboard and its gauges show the numbers")}
</div>`;
    const STEPS = [
      [
        "Talk with us and set goals",
        "A first call about your community, your partners and your first locations.",
      ] as const,
      [
        "Map your data sources",
        "List the utility feeds, meters, building systems and monitors you already have.",
      ] as const,
      [
        "Choose where people will see it",
        "Screens in shared spaces, a phone remote for each one, and web pages.",
      ] as const,
      [
        "Build the first content",
        "Community Voices interviews, the calendar, stories and each site's own notices.",
      ] as const,
      [
        "Run a pilot and a baseline",
        "Start at a few sites, and measure where things stand before launch.",
      ] as const,
      [
        "Grow with partners and sponsors",
        "Add locations, partners and funding once the pilot is running.",
      ] as const,
    ];
    const steps_html = STEPS.map(
      ([t, d], i) =>
        `<li><span class="rs-step-n">${i + 1}</span><div><h3>${t}</h3><p>${d}</p></div></li>`,
    );
    const hero = simple_hero(
      "Resources",
      "Bring Dashboard to Your Community",
      "This document is intended for communities, organizations and individuals who are interested in employing all or parts of Environmental Dashboard to promote sustainability, resilience and systems thinking.",
      "",
    );
    const steps_sec = `<section class="sec-pad resource-opening bring-process"><div class="resource-scene">
  <div data-story-scene="desktop"><div class="bring-intro-scene" data-story-scene>${hero}</div><div class="wrap" data-story-scene>
    ${sec_label("The steps", "From first call to a live screen")}
    <ol class="rs-steps" style="margin-top:24px">${steps_html.slice(0, 2).join("")}</ol>
  </div></div>
</div><div class="wrap resource-scene" data-story-scene="desktop">
  <div data-story-scene><ol class="rs-steps" start="3">${steps_html.slice(2, 4).join("")}</ol></div>
  <div data-story-scene><ol class="rs-steps" start="5">${steps_html.slice(4).join("")}</ol></div>
  <div class="bring-flow" data-story-scene>${flow}</div>
</div></section>`;
    const take_part = `<section class="sec-pad bring-participation"><div class="wrap" data-story-scene="all">
  ${sec_label("For organizations", "Ways to take part")}
  <div class="stanza-row c3" style="margin-top:24px">
    <div class="stanza" style="background:var(--leaf-deep)"><h3>Post events or jobs</h3><p style="color:#fff">Free, public posts reach the screens, the website and the weekly email within hours.</p></div>
    <div class="stanza" style="background:var(--amber)"><h3>Host a screen</h3><p style="color:#fff">You install the hardware and cover baseline software and content costs for a two year trial.</p></div>
    <div class="stanza" style="background:var(--violet)"><h3>Sponsor the dashboard</h3><p style="color:#fff">Being an official sponsor of the project (and getting featured for doing so)</p></div>
  </div>
</div></section>`;
    const q = cv_quote_by("Kelley Singleton");
    const faq = [
      [
        "Do we need to install new meters?",
        "Not always. Oberlin's Citywide Dashboard runs on readings its utility and treatment plants already collect. Hamilton College's pilot uses its existing building system.",
      ] as const,
      [
        "How does Community Hub connect to a utility?",
        "The utility shares whole system readings and Data Hub collects them. In Oberlin, a new reading arrives every minute.",
      ] as const,
      [
        "Who keeps the content up to date?",
        "The work is shared. Anyone can post a public event or job through a short form, and each site adds its own notices, the way Oberlin's school principals post their own announcements.",
      ] as const,
      [
        "Can we start with a few sites?",
        "Yes. MidTown's pilot started at four sites and grew to 10 locations by January 2026.",
      ] as const,
    ];
    const faq_html = faq
      .map(
        ([q_, a]) => `<details><summary>${q_}</summary><p>${a}</p></details>`,
      )
      .join("");
    const faq_sec = `<section class="sec-pad" style="padding-top:0"><div class="wrap">
  ${sec_label("Questions", "Questions about starting a dashboard")}
  <div class="rs-faq" style="margin-top:20px">${faq_html}</div>
</div></section>`;
    const jsonld = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "Bring a community dashboard to your town or neighborhood",
      step: STEPS.map(([t, d], i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: t,
        text: d,
      })),
    };
    const body =
      steps_sec +
      take_part +
      q +
      faq_sec +
      H.cta_band();
    H.write_page(
      "bring-a-dashboard",
      H.page(
        "bring-a-dashboard",
        "Bring a dashboard to your community",
        "How a town, neighborhood, campus or school district gets a Community Hub dashboard: goals, data sources, screens, first content and a pilot.",
        body,
        { current: "bring-a-dashboard", jsonld: jsonld },
      ),
    );
  }
  function research(): void {
    const hero = simple_hero(
      "Resources",
      "Research and publications",
      "Environmental Dashboard began as our research at Oberlin College on feedback: what people do when they can see the energy and water they use. This page lists our papers on the dashboards, each with its main finding, and the results measured in Oberlin.",
      H.postcard(
        "rs-empathetic-gauges.jpg",
        "Empathetic gauges from the 2016 Environmental Dashboard guide: Flash the energy squirrel and Wally the walleye react to high and low use",
      ),
    ).replace('<header class="page-intro">', '<header class="page-intro" data-story-scene>');
    function bars(
      rows: readonly (readonly [string, number, string])[],
      mx: number,
    ): string {
      const out: string[] = [];
      let y = 4;
      for (const [label, v, col] of rows) {
        const w = roundHalfEven((150 * v) / mx);
        out.push(
          `<text x="0" y="${y + 11}" class="va-t">${label}</text><rect x="112" y="${y}" width="${w}" height="14" rx="3" fill="${col}"/><text x="${116 + w}" y="${y + 11}" class="va-n">${v}%</text>`,
        );
        y += 19;
      }
      const summary = rows
        .map(([label, v, _col]) => `${label}: ${v} percent`)
        .join(", ");
      return `<svg class="va" viewBox="0 0 300 ${y + 4}" role="img" aria-label="${e(summary)}">${out.join("")}</svg>`;
    }
    const doi = (suffix: string) => "https://doi.org/" + suffix;
    // These ten papers were checked against John’s CV. The accepted gauges paper
    // retains its request link until an authorized public manuscript is available.
    const feedback_papers = [
      [
        "Petersen and Frantz, Sustainability (accepted)",
        "Translating data into feelings",
        "In three studies (261 people), character gauges were more engaging than ordinary gauges, new viewers read their feelings correctly, and viewers felt more connected to nature.",
        `<div class="gauge-faces" role="img" aria-label="Flash the squirrel taps his foot when electricity use is high, stands calmly when it is typical and blows kisses when it is low. Wally the walleye frowns when water use is high, looks neutral when typical and beams when low.">${(["high", "typical", "low"] as const).map((lv) => `<figure><img src="assets/gauge-flash-${lv}.png" alt="" width="120" height="120" loading="lazy"><img src="assets/gauge-wally-${lv}.png" alt="" width="120" height="120" loading="lazy"><figcaption>${lv === "high" ? "High use" : lv === "typical" ? "Typical" : "Low use"}</figcaption></figure>`).join("")}</div>`,
        "",
      ] as const,
      [
        "Petersen et al. (2015), PLOS ONE",
        "Saving in national dormitory competitions",
        "In 2010, dorms cut electricity 4% and water 6%; the top tenth cut 28% and 36%. Saving tracked dashboard visits.",
        bars(
          [
            ["Electricity", 4, "var(--leaf)"] as const,
            ["Water", 6, "var(--water)"] as const,
            ["Top 10%, elec.", 28, "var(--leaf)"] as const,
            ["Top 10%, water", 36, "var(--water)"] as const,
          ],
          40,
        ),
        doi("10.1371/journal.pone.0144070"),
      ] as const,
      [
        "Petersen et al. (2007), IJSHE",
        "Dorms cut electricity with live feedback",
        "Electricity fell 32%. Dorms with live feedback cut 55%, against 31% with weekly readings.",
        bars(
          [
            ["All dorms", 32, "var(--leaf)"] as const,
            ["Live feedback", 55, "var(--leaf)"] as const,
            ["Weekly", 31, "var(--water)"] as const,
          ],
          60,
        ),
        doi("10.1108/14676370710717562"),
      ] as const,
      [
        "Petersen et al. (2017), Springer",
        "Environmental Dashboards: feedback for green, connected towns",
        "Feedback at three scales: a building, a town's resource flows, and neighbors' words.",
        "",
        doi("10.1007/978-3-319-47895-1_10"),
      ] as const,
      [
        "Petersen et al. (2014), Solutions",
        "Using feedback to engage, educate, motivate and empower",
        "The framework behind every screen: get attention, explain, motivate, then make acting easy.",
        "",
        "https://environmentaldashboard.org/Dashboardtoyourcomm/Petersen2014UsingFeedbackToEngageEducateMotivateAndEmpower.pdf",
      ] as const,
    ];
    const voices_papers = [
      [
        "Petersen and Frantz (2024), Sustainability",
        "Changing culture through messages on digital signs",
        "After two years of screens in six places, people of color reported stronger green norms, residents felt more connected to their town and its nature, and more said they save electricity.",
        "",
        doi("10.3390/su16177312"),
        "Surveys of 174 people before and 133 after two years of signs.",
      ] as const,
      [
        "Petersen et al. (2018), SRBS",
        "Animated town resource flows build systems thinking",
        "Citywide Dashboard improved systems thinking for students initially less connected to nature. Brief exposure also widened adults' view of cause and effect.",
        "",
        doi("10.1002/sres.2514"),
      ] as const,
      [
        "Clark et al. (2017), PLOS ONE",
        "Teaching systems thinking to 4th and 5th graders",
        "Dashboard lessons improved content retention and systems thinking in six classes. Passive exposure alone had no measurable effect.",
        "",
        doi("10.1371/journal.pone.0176322"),
      ] as const,
      [
        "Frantz et al. (2021), PLOS ONE",
        "Community Voices shifts norms and motivation",
        "Community Voices raised concern, perceived norms and commitment to act. Children were no more persuasive than adults.",
        "",
        doi("10.1371/journal.pone.0255457"),
      ] as const,
      [
        "Kearney et al. (2025), Sustainability",
        "Overcoming pluralistic ignorance about climate action",
        "People underestimate how much others care. For 969 people, a short look at Community Voices made climate action feel normal.",
        "",
        doi("10.3390/su172210318"),
      ] as const,
    ];
    function cards(papers: readonly Paper[], intro: string, opening: string = ""): string {
      const articles = papers
        .map(
          ([who, title, find, svg, href, context]) =>
            `<article class="va-card" id="${title === "Translating data into feelings" ? "paper-empathetic-character-gauges" : `paper-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}" data-paper-format="${!svg ? "text" : svg.includes("gauge-faces") ? "figure" : "chart"}" data-reveal data-story-scene>${svg ? `<div class="va-fig">${svg}</div>` : ""}<div class="va-txt"><span class="rs-pub-who">${e(who)}</span><h3>${e(title)}</h3>` +
            (find ? `<p>${e(find)}</p>` : "") +
            (context ? `<p class="paper-context">${e(context)}</p>` : "") +
            (href
              ? `<a class="pc-a" href="${href}" target="_blank" rel="noopener">Read the paper ${ARR}</a>`
              : `<a class="pc-a" href="mailto:connect@communityhub.cloud?subject=Paper%20request%3A%20Translating%20data%20into%20feelings">Request the paper ${ARR}</a>`) +
            "</div></article>",
        );
      return opening.replace('data-story-scene', 'data-story-scene="all"') + `<div class="paper-group resource-scene" data-story-scene="desktop"><div class="wrap resource-paper-first" data-story-scene>${intro}${articles[0]}</div></div>` +
        [[1, 3], [3, papers.length]].map(([start, end]) => {
          const mode = papers.slice(start, end).some(paper => paper[3]) ? "desktop" : "all";
          return `<div class="wrap paper-group resource-scene" data-story-scene="${mode}">${articles.slice(start, end).join("")}</div>`;
        }).join("");
    }
    const papers_sec = `<section class="sec-pad resource-opening" id="papers-feedback">
  <div class="va-grid resource-paper-collection">${cards(feedback_papers, sec_label("Papers", "Feedback and feelings", "We spend 90% of our lives indoors, where energy and water use is out of sight. These papers test making it visible."), hero)}</div>
</section>
<section class="sec-pad" id="papers-voices">
  <div class="va-grid resource-paper-collection">${cards(voices_papers, sec_label("Papers", "What we know from prior work", "What changes when a town sees its resource flows and its neighbors' words on shared screens."))}</div>
</section>`;
    const findings = `<section class="sec-pad"><div class="wrap" data-story-scene="all">
  ${sec_label("Results in Oberlin", "Research on the Impact of Environmental Dashboard")}
  <div class="stanza-row c3" style="margin-top:24px">
    <div class="stanza" style="background:var(--leaf-deep)"><h3><b data-countup="10" data-decimals="0">10</b>%</h3><p style="color:#fff">Less dorm electricity at Oberlin College during Ecolympics, a drop that holds after the competition ends.</p></div>
    <div class="stanza" style="background:var(--amber)"><h3><b data-countup="30" data-decimals="0">30</b>%</h3><p style="color:#fff">Prospect Elementary in Oberlin cut its electricity use more than this in both 2014 and 2015.</p></div>
    <div class="stanza" style="background:var(--leaf-deep)"><h3><b data-countup="10050" data-decimals="0">10,050</b></h3><p style="color:#fff">Kilowatt hours Oberlin saved community wide in 2024, meeting its 10,000 kWh Ecolympics goal.</p></div>
  </div>

</div></section>`;
    const body =
      papers_sec +
      findings +
      H.cta_band();
    H.write_page(
      "research",
      H.page(
        "research",
        "Research and publications",
        "The research behind Environmental Dashboard: papers on feedback and systems thinking, and results measured in Oberlin.",
        body,
        { current: "research" },
      ),
    );
  }
  function media(): void {
    const ring =
      '<svg class="rs-ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="38" fill="none" stroke="var(--leaf)" stroke-width="16"/><circle cx="50" cy="50" r="38" fill="none" stroke="var(--leaf-deep)" stroke-width="2"/></svg>';
    const film = `<div class="rs-player" id="player-2040">
  <a class="rs-play" href="https://www.youtube.com/watch?v=p-rTQ443akE" data-yt="p-rTQ443akE" data-title="Environmental Dashboard in the film 2040" aria-label="Watch: Environmental Dashboard in the film 2040">
    <img src="assets/classroom-2040.jpg" alt="Elementary students in a classroom watch the Citywide Dashboard on a smartboard" loading="lazy">
    <span class="rs-watch">Watch on YouTube</span>
  </a>
</div>`;
    const hero = `<section class="sec-pad media-feature"><div class="wrap">
  ${H.crumbs([null, "Resources"] as const)}
  <div class="media-feature-grid" data-story-scene="all"><div class="media-feature-copy">
    <h1 class="h1">Media and press</h1>
    <p class="lede">Environmental Dashboard displays and its use in the classroom are featured in the film 2040.</p>
    <a class="btn-ink btn-big" data-yt="p-rTQ443akE" href="https://www.youtube.com/watch?v=p-rTQ443akE" data-for="player-2040">Watch the 2040 clip ${ARR}</a>
  </div>${film}</div>
</div></section>`;
    const book = `<div class="rs-book"><div class="rs-book-ring">${ring}</div><div><p class="fig">Book, Kate Raworth</p><h3 class="h3">Doughnut Economics</h3><p style="margin-top:8px;max-width:52ch">Kate Raworth's book Doughnut Economics features the Environmental Dashboard.</p></div></div>`;
    const press_html = PRESS.map(
      ([pub_, t, c]) =>
        `<li style="--c:${c}"><p class="rs-pub-who">${e(pub_)}</p><p>${e(t)}</p></li>`,
    );
    const press = `<section class="sec-pad"><div class="wrap resource-scene" data-story-scene="desktop"><div class="media-book-press" data-story-scene>${book}
  ${sec_label("Press", "Where it has been covered", "Each one is listed on the Environmental Dashboard press page, which links to the original.")}
  <ul class="rs-press" style="margin-top:22px">${press_html.slice(0, 2).join("")}</ul></div>
  <ul class="rs-press" data-story-scene>${press_html.slice(2, 4).join("")}</ul>
</div><div class="wrap resource-scene" data-story-scene="all"><ul class="rs-press">${press_html.slice(4).join("")}</ul>
  <p style="margin-top:20px"><a class="hand-link hand-link-light" href="https://environmentaldashboard.org/press-page" target="_blank" rel="noopener"><svg class="hand-arrow" viewBox="0 0 70 44" aria-hidden="true"><path d="M4 8 C 18 34, 40 38, 62 26"/></svg>Open the Environmental Dashboard press page</a></p>
</div></section>`;
    const vid_html = VIDEOS.map(
      ([
        yt,
        t,
        d,
      ]) => `<li data-story-scene><article class="rs-vid">
  <a class="rs-vid-th" href="https://www.youtube.com/watch?v=${yt}" data-yt="${yt}" data-title="${e(t)}" aria-label="Watch: ${e(t)}" target="_blank" rel="noopener">
    <span class="rs-video-fallback" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M11 6 26 16 11 26Z"/></svg></span>
    <img src="https://i.ytimg.com/vi/${yt}/hqdefault.jpg" alt="" decoding="async" hidden data-video-poster>
    <span class="rs-watch rs-watch-sm">Watch video</span>
  </a>
  <span><a class="rs-video-source" href="https://www.youtube.com/watch?v=${yt}" aria-label="Open ${e(t)} on YouTube" target="_blank" rel="noopener"><b>${e(t)}</b></a><small>${e(d)}</small></span>
</article></li>`,
    );
    const videos = `<section class="sec-pad" style="padding-top:0"><div class="wrap resource-scene" data-story-scene="desktop">
  ${sec_label("Videos", "Story of Dashboard", "Each one explains a piece of Oberlin's energy, water or climate story. A video loads from YouTube only when you choose to watch it.")}
  <ul class="rs-vids" style="margin-top:22px">${vid_html.slice(0, 3).join("")}</ul>
</div><div class="wrap resource-scene" data-story-scene="desktop"><ul class="rs-vids">${vid_html.slice(3).join("")}</ul>
</div></section>`;
    const body =
      hero +
      press +
      videos +
      H.cta_band();
    H.write_page(
      "media",
      H.page(
        "media",
        "Media and press",
        "Environmental Dashboard in the documentary 2040, in Kate Raworth's Doughnut Economics and in the press, plus five short videos.",
        body,
        { current: "media" },
      ),
    );
  }
  function environmental_dashboard(): void {
    const hero = simple_hero(
      "Environmental Dashboard",
      "Environmental Dashboard",
      "For the vast majority of human history, we’ve lived in intimate contact with nature, our actions guided by the rapid and direct feedback provided by the surrounding environment.",
      H.postcard("evidence/feedback-connections-diagram.jpg", "Original diagram of information feedback connecting people, resource use and the environment"),
    ).replace('<header class="page-intro">', '<header class="page-intro" data-story-scene="all">');
    const story = `<section class="sec-pad resource-opening feedback-story"><div class="resource-scene">${hero}
<div class="wrap feedback-copy-scene" data-story-scene="all"><div class="feedback-copy">
  <p class="lede">Fast forward to today, members of our industrialized societies spend most of their lives in cities and buildings, isolated from the environmental cues that once informed our decisions. The environmental and human costs of our resource use are out of sight and out of mind; The feedback system has broken down.</p>
  <p class="lede" style="margin-top:18px">How can information feedback be used to empower people and improve the environment?</p>
</div></div>
<div class="wrap feedback-copy-scene" data-story-scene="all"><div class="feedback-copy">
  <p class="lede">We believe that sustainability is best visualized when every level of a community is considered - its members, buildings, and city-wide resource flow.</p>
  <p style="margin-top:18px">The Environmental Dashboard is a product of that belief, intentionally designed to reintroduce the multifaceted, environmental feedback that’s been disrupted in recent human history - to reconnect people with each other and the natural world.</p>
</div></div>
<div class="wrap feedback-copy-scene" data-story-scene="all"><div class="feedback-copy">
  <p class="lede">CommunityHub's individual products and services, together, become a set of tools that give communities the power to build, share, examine and celebrate their own Environmental Dashboards, their unique, multi-scale stories.</p>
  <p style="margin-top:18px">The pilot implementation of Environmental Dashboard was initiated in Oberlin, Ohio in 2008. Since its launch, the project has extended throughout Northeast Ohio and beyond, with various communities and organizations using CommunityHub technology and services to develop and customize Environmental Dashboards of their own.</p>
</div></div></div></section>`;
    const now = H.now_strip("now-ed");
    const examples = `<div class="feedback-examples" data-story-scene="all">
  ${sec_label("Examples", "Three places Environmental Dashboard runs today")}
  <div class="stanza-row c3" style="margin-top:24px">
    <div class="stanza" style="background:var(--leaf-deep)"><h3>Watershed Stewardship Center</h3><p style="color:#fff">Water and stream data on public display, next to the Black River.</p></div>
    <div class="stanza" style="background:var(--amber)"><h3>City of Oberlin</h3><p style="color:#fff">Whole community electricity, drinking water and wastewater, on 24 signs around town.</p></div>
    <div class="stanza" style="background:var(--peri)"><h3>Great Lakes Science Center</h3><p style="color:#fff">A live museum exhibit on Lake Erie and Cleveland air data.</p></div>
  </div>
</div>`;
    const now_sec = `<section class="sec-pad feedback-today"><div class="wrap resource-scene"><div class="feedback-readings" data-story-scene="all">
  ${sec_label("Feedback, restored", "Modes of information delivery", "Oberlin's own numbers, read live from the same meters this page is describing.")}
  <div style="margin-top:22px">${now}</div>
  </div>${examples}
</div></section>`;
    const q = H.quote(
      "Environmental Dashboard enables residents to understand their electricity and water consumption, which in turn helps prevent overuse.",
      "Janet Haar",
      "Executive Director, Oberlin Business Partnership",
    );
    const body = story + now_sec + q + H.cta_band();
    H.write_page(
      "environmental-dashboard",
      H.page(
        "environmental-dashboard",
        "Environmental Dashboard",
        "Our feedback story and the 2008 Oberlin pilot: the Watershed Stewardship Center, the City of Oberlin and the Great Lakes Science Center.",
        body,
        { current: "environmental-dashboard" },
      ),
    );
  }
  // Original slide imagery and chapter notes remain distinct from the embedded deck.
  const SOD_DECK =
    "https://docs.google.com/presentation/d/e/2PACX-1vQfRVKa9JNw8GIXMMFZYf0XpjAwswzrJftYMBl7cBu-cJpzIgNcjBZo1X1jjMBrgofuabYMISCxdDLs";
  const SOD = [
    [
      "Feedback lost",
      [
        [
          "Environmental Dashboard",
          "A short slideshow on what the Dashboard is and where it runs.",
        ] as const,
        [
          "Survival based on feedback",
          "For almost all of human history, nature told us right away what our actions did.",
        ] as const,
        [
          "Breakdown in feedback",
          "Now we spend 90% of our lives indoors, cut off from those cues.",
        ] as const,
        [
          "Linear consumption",
          "Food comes from stores, power from outlets, waste goes to the dump. The costs stay out of sight.",
        ] as const,
      ],
    ] as const,
    [
      "Putting feedback back",
      [
        [
          "Reintroducing feedback",
          "Feedback links the parts of a system in a loop of cause and effect.",
        ] as const,
        [
          "Reintroducing feedback",
          "The Dashboard was built to bring that loop back.",
        ] as const,
        [
          "Living sustainably",
          "Sustainability means social, economic and environmental health, now and later.",
        ] as const,
        [
          "Living sustainably",
          "The three overlap. Each one depends on the others.",
        ] as const,
        [
          "Promoting systems thinking",
          "Systems thinking looks at relationships: our choices, their impact, the world that results.",
        ] as const,
        [
          "Systems thinking through feedback",
          "Information about impact improves choices, which improves the environment.",
        ] as const,
        [
          "Systems thinkers",
          "People start to see themselves as part of families, schools, towns and ecosystems.",
        ] as const,
      ],
    ] as const,
    [
      "The platform",
      [
        [
          "Motivating sustainable action",
          "Making resource flows visible reconnects people with the natural world.",
        ] as const,
        [
          "Our origins",
          "From the 2008 Great Lakes Protection Fund pilot in Oberlin to Community Hub today.",
        ] as const,
        [
          "How the platform works",
          "Building, city and social data feed apps that show up on signs, phones and websites.",
        ] as const,
        [
          "Building Dashboard",
          "Live electricity, water and emissions for a school, home or business.",
        ] as const,
        [
          "Citywide Dashboard",
          "A whole town's electricity, water and streams, animated as one picture.",
        ] as const,
      ],
    ] as const,
    [
      "Community Voices",
      [
        [
          "Next Generation",
          "Words and artwork from the community's children.",
        ] as const,
        [
          "Neighbors",
          "Neighbors whose everyday choices set an example.",
        ] as const,
        [
          "Heritage",
          "A town's history of stewardship and getting involved.",
        ] as const,
        [
          "Natural Oberlin",
          "The natural and planted beauty around town.",
        ] as const,
        [
          "Our Downtown",
          "Local businesses and what they do for their town.",
        ] as const,
        [
          "Serving Our Community",
          "Work by community groups, schools and city staff.",
        ] as const,
        [
          "Climate Action",
          "People building a safe, renewable, climate resilient future.",
        ] as const,
        [
          "Different in every town",
          "Each community's slides come from its own people.",
        ] as const,
      ],
    ] as const,
    [
      "Where it's working",
      [
        [
          "Schools are using Dashboard",
          "Teachers build lessons on it that meet curriculum standards.",
        ] as const,
        [
          "Oberlin Elementary",
          "Kids choose their own path through stories on a lobby touchscreen.",
        ] as const,
        [
          "Ecolympics",
          "Schools compete to cut electricity and water, checking the Dashboard as they go.",
        ] as const,
        [
          "Dashboard downtown",
          "Each screen downtown carries content about the place it hangs.",
        ] as const,
        [
          "Cleveland Environmental Dashboard",
          "Since 2018, a Great Lakes Science Center exhibit on resources and Lake Erie.",
        ] as const,
        [
          "MidTown Dashboard",
          "Since 2021, a neighborhood dashboard with MidTown Cleveland Inc.",
        ] as const,
        [
          "Building connections",
          "Feedback from nature helps communities grow stronger and more resilient.",
        ] as const,
      ],
    ] as const,
  ];
  function story_of_dashboard(): void {
    const flat = SOD.flatMap(([ch, items], ci) =>
      items.map(([t, d]) => [ci, ch, t, d] as const),
    );
    const total = flat.length;
    let strip = "";
    let n = 0;
    for (const [ci, [ch, items]] of SOD.entries()) {
      let thumbs = "";
      for (const [t, _d] of items) {
        n += 1;
        thumbs += `<li><button type="button" data-sb-go="${n - 1}" aria-label="Slide ${n}: ${H.e(t)}"${n === 1 ? ' aria-current="true"' : ""}><img src="assets/sod/t${String(n).padStart(2, "0")}.jpg" alt="" width="200" height="150" loading="lazy"><span>${n}</span></button></li>`;
      }
      strip += `<li class="sb-ch"><p>${ci + 1}. ${H.e(ch)}</p><ol>${thumbs}</ol></li>`;
    }
    const data = JSON.stringify(
      flat.map(([ci, ch, t, d]) => ({ c: `${ci + 1}. ${ch}`, t: t, d: d })),
    );
    const [c0, ch0, t0, d0] = flat[0];
    const board = `<section class="sb" id="storyboard" aria-labelledby="sb-h">
  <div class="wrap" data-story-scene="all">
    ${H.crumbs([null, "Resources"] as const, [null, "Story of Dashboard"] as const)}
    <h1 class="h1" id="sb-h">Story of Dashboard</h1>
    <div class="sb-view" data-sb tabindex="0" role="group" aria-roledescription="storyboard" aria-label="Story of Dashboard slides. Use the arrow keys to move through them.">
      <figure class="sb-slide"><img data-sb-img src="assets/sod/01.jpg" alt="Slide 1: ${H.e(t0)}" width="960" height="720"></figure>
      <div class="sb-note" aria-live="polite">
        <p class="fig" data-sb-ch>${c0 + 1}. ${H.e(ch0)}</p>
        <h2 class="sb-t" data-sb-t>${H.e(t0)}</h2>
        <p class="sb-d" data-sb-d>${H.e(d0)}</p>
        <p class="sb-original"><a class="pc-a" data-sb-original href="assets/sod/01.jpg" target="_blank" rel="noopener noreferrer">Open original slide ${ARR}</a></p>
        <div class="sb-nav"><button type="button" data-sb-prev aria-label="Previous slide">&larr;</button><span data-sb-n>1 of ${total}</span><button type="button" data-sb-next aria-label="Next slide">&rarr;</button></div>
      </div>
    </div>
    <ol class="sb-strip" aria-label="Every slide, by chapter">${strip}</ol>
    <script type="application/json" data-sb-data>${data}</script>
  </div>
</section>`;
    const deck = `<section class="sec-pad sb-deck" id="slideshow" aria-labelledby="sbd-h"><div class="wrap" data-story-scene="all">
  ${sec_label("The original", "The original slides", "John's original slides, with the explanations included in each frame.", "sbd-h")}
  <div class="sb-frame"><iframe data-defer-src="${SOD_DECK}/embed?start=false&amp;loop=false&amp;delayms=5000" title="Story of Dashboard, the Google Slides presentation" loading="lazy" allowfullscreen></iframe></div>
  <p style="margin-top:12px"><a class="hand-link" href="${SOD_DECK}/pub?start=false&amp;loop=false&amp;delayms=5000" target="_blank" rel="noopener">Open it in Google Slides</a></p>
</div></section>`;
    const collegeFrames = `<section class="sec-pad" id="college-heating" aria-labelledby="college-heating-h"><div class="wrap" data-story-scene="all"><h2 class="h2" id="college-heating-h">Original College heating and cooling story frames</h2>${H.story_player([["h44.jpg", "Chapter one: heating and cooling"] as const, ["h45.jpg", "The 1940s central plant behind Mudd Library"] as const, ["h46.jpg", "District heating carries heat through pipes below ground"] as const, ["h47.jpg", "1940 to 2014: a coal-fired boiler"] as const, ["h48.jpg", "2014: converted to natural gas"] as const, ["h49.jpg", "2024: geothermal becomes the primary source of campus heating and cooling"] as const], "Oberlin College's original heating and cooling story frames")}</div></section>`;
    const body = board + deck + collegeFrames + H.cta_band();
    H.write_page(
      "story-of-dashboard",
      H.page(
        "story-of-dashboard",
        "Story of Dashboard",
        "Story of Dashboard, slide by slide: why people lost feedback from nature, how Environmental Dashboard puts it back, and where it runs today.",
        body,
        { current: "story-of-dashboard" },
      ),
    );
  }
  function about(): void {
    const mission = `<section class="sec-pad about-mission" id="about-mission"><div class="wrap about-origin about-mission-grid" data-story-scene="all"><div class="about-origin-copy">
  ${H.crumbs([null, "About"] as const)}
  <h1 class="h1">About us</h1>
  <p class="lede" style="margin-top:18px">Community Hub creates software products that foster stronger, more sustainable, and more resilient connections among people and the natural systems upon which we depend. Our award-winning communications platform uses sophisticated data acquisition and visualization applications to simplify complexity and share the wisdom of community-focused solutions.</p>
  
</div>${H.postcard("glsc-exhibit.jpg", "Visitors at the Environmental Dashboard exhibit at the Great Lakes Science Center in Cleveland")}</div></section>`;
    const funders_html = H.FUNDERS.map((f) => `<span>${e(f)}</span>`).join(" ");
    // The whole story plays on one TV-style screen: the platform, then each year, then funders.
    const tv_slides = [
      communicationNetwork().replace(" data-story-scene", ""),
      ...H.TIMELINE.map(([y, t, d]) => `<div class="about-tv-year"><span class="about-tv-yr">${y}</span><h3>${t}</h3><p>${d}</p></div>`),
      `<div class="about-tv-year"><span class="about-tv-yr">Thank you</span><h3>Supported over the years by</h3><p class="rs-funders-list">${funders_html}</p></div>`,
    ];
    const timeline = `<section class="sec-pad about-story" id="history"><div class="wrap about-story-grid" data-story-scene="all"><div class="about-story-copy">
  ${sec_label("Our history", "Origin Story")}
  <p class="lede" style="margin-top:14px">From one building at Oberlin College in 2000 to a platform shared by whole communities.</p>
</div><div class="about-tv" data-tv-story data-interval="6500" aria-roledescription="carousel" aria-label="Community Hub story">
  <div class="native-tv-device"><div class="native-tv-screen about-tv-screen" aria-live="off">${tv_slides.map((h, i) => `<div class="about-tv-slide${i ? "" : " is-on"}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${tv_slides.length}"${i ? " hidden" : ""}>${h}</div>`).join("")}</div></div>
  <div class="about-tv-bar"><button type="button" class="about-tv-pause" data-tv-pause aria-label="Pause story">${"<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M8 5v14M16 5v14'/></svg>"}</button><div class="about-tv-dots">${tv_slides.map((_, i) => `<button type="button" data-tv-go="${i}" aria-label="Show slide ${i + 1}"${i ? "" : ' aria-current="true"'}></button>`).join("")}</div></div>
</div></div></section>`;
    const partners_html = PARTNERS.map(
      ([ic, n, d]) =>
        `<div><img class="rs-partner-ic" src="assets/${ic}" alt="" width="32" height="32" loading="lazy"><div><h3>${e(n)}</h3><p>${d}</p></div></div>`,
    );
    const partners = `<section class="sec-pad"><div class="wrap resource-scene resource-partners" data-story-scene="all">
  ${sec_label("Partners", "Who We Serve")}
  <p class="about-audiences-intro">Community Hub clients include organizations, businesses, and whole communities that are working to enhance understanding, embrace challenges, celebrate success, and foster positive initiative. We believe that it has never been more important to act locally while thinking globally.</p>
  <div class="rs-partners" style="margin-top:24px">${partners_html.slice(0, 3).join("")}</div>
  <div class="rs-partners">${partners_html.slice(3).join("")}</div>
</div></section>`;
    const team_html = TEAM.map(
      ([img, n, role], i) =>
        `<div class="rs-person" style="--r:${i % 2 === 0 ? -2 : 2}deg"><figure class="postcard" style="--r:${i % 2 === 0 ? -2 : 2}deg"><img src="assets/${img}" alt="${e(n)}" loading="lazy" style="aspect-ratio:auto;object-fit:contain"><figcaption class="postcard-cap">${e(n)}, ${e(role)}</figcaption></figure></div>`,
    );
    const team = `<section class="sec-pad about-team" style="padding-top:0"><div class="wrap resource-scene" data-story-scene="all">
  ${sec_label("Team", "Team")}
  <div class="rs-team team-all" data-reveal-group style="margin-top:26px">${team_html.join("")}</div>
  <p style="margin-top:22px"><a class="pc-a" href="https://www.communityhub.cloud/team/" target="_blank" rel="noopener">Original Software Engineer listing (December 2021) ${ARR}</a></p>
</div></section>`;
    const body =
      mission +
      timeline +
      partners +
      team +
      H.cta_band();
    H.write_page(
      "about",
      H.page(
        "about",
        "About",
        "Community Hub's story since 2000, the 2008 Oberlin pilot, its funders, partners and team.",
        body,
        { current: "about" },
      ),
    );
  }
  function contact(): void {
    const hero = `<div class="contact-intro">${H.crumbs([null, "Contact"] as const)}
  <h1 class="h1">Contact Us</h1>
  <p class="lede">We welcome inquiries about our software applications and pricing options for organizations and whole communities.</p>
  <p><a class="pc-a" href="mailto:connect@communityhub.cloud?subject=Community%20Hub%20demo">Email us ${ARR}</a></p>
</div>`;
    const helpful = [
      "Your organization and your role",
      "How many buildings, and what meters or building systems you have",
      "Where you would put screens, if you know",
      "Any timeline or grant you are working toward",
    ]
      .map((t) => `<li>${CHECK}<span>${t}</span></li>`)
      .join("");
    const form = `<section class="sec-pad resource-opening contact-compose"><div class="wrap resource-scene contact-opening-grid" data-story-scene="desktop">
  <div class="contact-primary" data-story-scene>${hero}
  <div class="contact-guidance"><h2 class="h2">Helpful to include</h2>
  <ul class="rs-check" style="margin-top:14px">${helpful}</ul>
  <p style="margin-top:18px">Or email <a class="hand-link" href="mailto:connect@communityhub.cloud">connect@communityhub.cloud<svg class="hand-arrow" viewBox="0 0 70 44" aria-hidden="true"><path d="M4 8 C 18 34, 40 38, 62 26"/></svg></a> directly.</p>
  </div>
</div><div class="contact-compose-form" data-story-scene>
  <form id="contact-form" class="rs-form" novalidate>
    ${renderField({ id: 'contact-name', name: 'name', label: 'Your name', autocomplete: 'name', required: true, maxLength: 120 })}
    ${renderField({ id: 'contact-org', name: 'org', label: 'Organization', autocomplete: 'organization', required: true, maxLength: 160 })}
    ${renderField({ id: 'contact-msg', name: 'msg', label: 'What you have in mind', kind: 'textarea', rows: 4, placeholder: 'Buildings, meters and where people gather', maxLength: 3000 })}
    ${renderButton({ type: 'submit', label: 'Prepare my email', disabled: true })}
    ${renderStatus({ id: 'contact-out', className: 'rs-out' })}
    <div class="ui-email-recovery" data-email-recovery></div>
    <noscript><p>To prepare an email, enable JavaScript or <a href="mailto:connect@communityhub.cloud">email connect@communityhub.cloud directly</a>.</p></noscript>
    <p class="rs-note">This opens your email app with the message filled in, addressed to connect@communityhub.cloud.</p>
  </form>
  </div>
</div></section>`;
    const context = `<section class="sec-pad"><div class="wrap contact-context" data-story-scene="all">
  ${H.postcard("live-contact-workshop.jpg", "Participants in an Environmental Dashboard workshop at the Great Lakes Science Center", "Environmental Dashboard workshop at the Great Lakes Science Center")}
</div></section>`;
    const body =
      form +
      context +
      H.cta_band("Live dashboards", "").replace('aria-label="Contact"', 'aria-label="Live dashboards"').replace('href="contact.html">Book a demo', 'href="dashboards.html">Open live dashboards');
    H.write_page(
      "contact",
      H.page(
        "contact",
        "Contact",
        "Book a demo of Community Hub, or email connect@communityhub.cloud.",
        body,
        { current: "contact" },
      ),
    );
  }
  function notfound(): void {
    const recovery = ["data-dashboard", "dashboards", "products"].map(slug => {
      const [href, , title, description] = H.NEXT[slug];
      return `<li><a class="ending-link" href="${href}"><strong>${title}</strong><span>${description}</span></a></li>`;
    }).join("");
    const body =
      `<section class="page-hero recovery-page page-ending"><div class="wrap page-ending-layout"><div class="recovery-copy">
  <p class="fig">Page not found</p>
  <h1 class="h1" style="margin-top:10px">This page doesn't exist or has moved</h1>
  <p class="lede" style="margin-top:18px">Try the product list or the case studies, or write to
  <a href="mailto:connect@communityhub.cloud">connect@communityhub.cloud</a>.</p>
  <div style="margin-top:26px;display:flex;gap:14px;flex-wrap:wrap">
    <a class="btn-ink btn-big" href="products.html">See the products ${ARR}</a>
    <a class="btn-ink btn-ghost btn-big" href="examples.html">Read the case studies</a>
  </div>
</div><nav class="ending-links" aria-label="Suggested destinations"><ul class="ending-actions">${recovery}</ul></nav></div></section>`;
    H.write_page(
      "404",
      H.page(
        "404",
        "Page not found",
        "This page doesn't exist or has moved.",
        body,
        { current: "404" },
      ),
    );
  }
  education();
  bring_a_dashboard();
  research();
  media();
  environmental_dashboard();
  story_of_dashboard();
  about();
  contact();
  notfound();
}
