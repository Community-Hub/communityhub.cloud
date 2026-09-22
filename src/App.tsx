import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CampusStage, SignatureStage } from "./scene/Stages";
import {
  BUILDING_COPY,
  signatureStats,
  type BuildingKind,
  type Resource,
} from "./signature";

const AASHE_DAY = Date.UTC(2026, 9, 4);

const PRODUCTS = [
  {
    kicker: "Understand",
    name: "Data Hub",
    line: "One place for all your campus energy and water data — turned into charts anyone can read.",
    points: [
      "Pulls data from buildings, meters, and public sources",
      "Color charts that show when and where use is highest",
      "Build dashboards for your website or lobby screens",
      "Reports to EPA Portfolio Manager for compliance",
    ],
  },
  {
    kicker: "Understand",
    name: "Building Dashboard",
    line: "Show real-time electricity and water use for a single building — where students and staff will actually see it.",
    points: [
      "Live updates as the building uses power and water",
      "Easy-to-read patterns, no engineering degree required",
      "Helps tie conservation to goals your campus can celebrate",
    ],
  },
  {
    kicker: "Understand",
    name: "Citywide Dashboard",
    line: "See electricity, water, and weather across your whole campus or city in one view.",
    points: [
      "Animated maps that show how resources flow through your community",
      "Helps residents see their role in the bigger picture",
      "Works on lobby screens, websites, and phones",
    ],
  },
  {
    kicker: "Connect",
    name: "Digital Signage",
    line: "Turn hallway screens into a shared bulletin board for sustainability and campus life.",
    points: [
      "Department updates and community-wide messages on the same screens",
      "Many people can post — no TV studio required",
      "Update the nearest screen from your phone",
    ],
  },
  {
    kicker: "Connect",
    name: "Community Calendar",
    line: "A shared calendar for events, volunteer opportunities, job postings, and campus news.",
    points: [
      "Anyone can submit an event; your team approves what goes live",
      "Filter by type, location, or sponsor",
      "Shows up on the web, in the app, and on lobby screens",
    ],
  },
  {
    kicker: "Connect",
    name: "Community Voices",
    line: "Collect stories and photos from across campus and turn them into messages people stop to read.",
    points: [
      "Stories from students, staff, and neighbors",
      "Curated and published to screens, phones, and websites",
      "Built for climate and sustainability outreach that feels human",
    ],
  },
] as const;

const VOICES = [
  {
    quote:
      "I really feel that I am a part of the resource use graphs displayed on the dashboards. This feeling motivates me to be more thoughtful when consuming water and electricity.",
    name: "Grace Gao",
    role: "Oberlin College student",
  },
  {
    quote:
      "Oberlin is helping us translate water and energy use in 44 school buildings into teaching and learning in the classroom.",
    name: "Bob Mendenhall",
    role: "Curriculum Director, Toledo",
  },
  {
    quote:
      "Community Hub’s events calendar has made our work easier. People in the community are participating — it’s simple, but transformative.",
    name: "Janet Haar",
    role: "Executive Director, Oberlin Business Partnership",
  },
  {
    quote:
      "The dashboard signage is stitching together the work of Cleveland organizations to make the team effort apparent.",
    name: "Scott Volmer",
    role: "VP STEM Learning, Great Lakes Science Center",
  },
  {
    quote:
      "Community Hub's Digital Signage is central to our community's climate resilience communication strategy.",
    name: "Linda Arbogast",
    role: "Sustainability Coordinator, City of Oberlin",
  },
  {
    quote:
      "For a decade we have looked to the Community Hub team as key partners in translating our energy conservation services into community engagement.",
    name: "Geoff Hunter",
    role: "President, Palmer Conservation Consulting",
  },
];

const KINDS: BuildingKind[] = ["residence", "lab", "dining", "library"];

function daysUntil(from: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(from);
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const today = Date.UTC(read("year"), read("month") - 1, read("day"));
  return Math.max(0, Math.round((AASHE_DAY - today) / 86_400_000));
}

export function App() {
  const [stuck, setStuck] = useState(false);
  const [kind, setKind] = useState<BuildingKind>("residence");
  const [resource, setResource] = useState<Resource>("electricity");
  const [sent, setSent] = useState(false);
  const [now] = useState(() => new Date());
  const days = daysUntil(now);
  const stats = useMemo(() => signatureStats(kind, resource), [kind, resource]);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const institution = String(data.get("institution") || "").trim();
    const role = String(data.get("role") || "").trim();
    const interest = String(data.get("interest") || "").trim();
    const note = String(data.get("note") || "").trim();
    const body = [
      `Name: ${name}`,
      `Institution: ${institution}`,
      `Role: ${role}`,
      `Interest: ${interest}`,
      "",
      note || "I would like to schedule a meeting at AASHE.",
    ].join("\n");
    const href = `mailto:connect@communityhub.cloud?subject=${encodeURIComponent(
      `AASHE — ${institution || "campus conversation"}`,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setSent(true);
  }

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className={stuck ? "nav stuck" : "nav"}>
        <a className="mark" href="#top">
          <span className="mark-orb" aria-hidden="true" />
          Community Hub
        </a>
        <nav>
          <a href="#signature">Demo</a>
          <a href="#products">Platform</a>
          <a href="#field">Stories</a>
          <a href="#aashe">AASHE</a>
        </nav>
        <a className="nav-cta" href="#contact">
          {days > 0 ? `AASHE in ${days} days` : "Meet us at AASHE"}
        </a>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow">AASHE 2026 · Baltimore · October 4–6</p>
            <h1>
              Help your campus <em>see</em> what it uses.
            </h1>
            <p className="lede">
              Community Hub shows live electricity and water use on the screens,
              websites, and phones your community already checks. When people can
              see it, they can care about it — and change it.
            </p>
            <div className="hero-actions">
              <a className="btn solid" href="#contact">
                Schedule a call
              </a>
              <a className="btn ghost" href="#signature">
                Try the demo
              </a>
            </div>
            <p className="hero-note">
              Watch four campus buildings share data through one hub — residence
              halls, labs, dining, and the library. What your campus uses becomes
              what everyone can see and act on.
            </p>
          </div>
          <div className="hero-stage" aria-hidden="true">
            <CampusStage />
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div>
            {Array.from({ length: 2 }, (_, copy) => (
              <p key={copy}>
                <span>Oberlin College</span>
                <span>City of Oberlin</span>
                <span>Hamilton College</span>
                <span>Toledo Public Schools</span>
                <span>Great Lakes Science Center</span>
                <span>Oberlin Business Partnership</span>
              </p>
            ))}
          </div>
        </div>

        <section className="thesis">
          <div className="shell thesis-grid">
            <p className="index">01 — Why it matters</p>
            <h2>Your campus uses energy every day. Most people never see it.</h2>
            <p>
              Community Hub brings electricity and water use out of the basement and
              into daily life — on lobby screens, calendars, and phones. When use is
              visible, conservation becomes something everyone can take part in.
            </p>
            <ol>
              <li>
                <strong>Facilities</strong>
                <span>Catch problems early, before they turn into emergencies.</span>
              </li>
              <li>
                <strong>Sustainability</strong>
                <span>Show progress on goals in a way the whole campus understands.</span>
              </li>
              <li>
                <strong>Faculty</strong>
                <span>Turn live campus data into lessons students actually care about.</span>
              </li>
            </ol>
          </div>
        </section>

        <section className="signature" id="signature">
          <div className="shell signature-layout">
          <div className="signature-copy">
            <p className="index">02 — Try it</p>
            <h2>Every building has a pattern.</h2>
            <p>
              Dorms spike at night. Labs run steady through the day. Dining halls
              peak at mealtimes. Pick a building below and explore a week of
              electricity or water use.
            </p>
            <p className="signature-line">{BUILDING_COPY[kind].line}</p>
            <div className="chips" role="group" aria-label="Building type">
              {KINDS.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={kind === item}
                  onClick={() => setKind(item)}
                >
                  {BUILDING_COPY[item].label}
                </button>
              ))}
            </div>
            <div className="chips resource" role="group" aria-label="Resource">
              {(["electricity", "water"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={resource === item}
                  onClick={() => setResource(item)}
                >
                  {item === "electricity" ? "Electricity" : "Water"}
                </button>
              ))}
            </div>
            <dl className="stats">
              <div>
                <dt>Peak hour</dt>
                <dd>{stats.peakHour}</dd>
              </div>
              <div>
                <dt>Lowest use</dt>
                <dd>{stats.baseload}</dd>
              </div>
              <div>
                <dt>Weekends</dt>
                <dd>{stats.weekend}</dd>
              </div>
            </dl>
            <p className="fine">
              Sample data for demo purposes. Click and drag the chart to rotate it.
              Hours run left to right; days run front to back, Monday through Sunday.
            </p>
          </div>
          <div className="signature-stage">
            <SignatureStage kind={kind} resource={resource} />
            <p className="stage-caption">
              {resource === "electricity" ? "Electricity" : "Water"} ·{" "}
              {BUILDING_COPY[kind].label.toLowerCase()} · seven days
            </p>
          </div>
          </div>
        </section>

        <section className="products" id="products">
          <div className="shell">
          <div className="products-head">
            <p className="index">03 — The platform</p>
            <h2>One platform. Six ways to reach your campus.</h2>
            <p>
              Use the data tools, the communication tools, or both. A sustainability
              poster without real numbers is just decoration. A dashboard behind a
              login is a dashboard nobody sees.
            </p>
          </div>
          <div className="product-list">
            {PRODUCTS.map((product, index) => (
              <article key={product.name}>
                <p>
                  0{index + 1}
                  <span>{product.kicker}</span>
                </p>
                <h3>{product.name}</h3>
                <p>{product.line}</p>
                <ul>
                  {product.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="bundles">
            <div>
              <h3>Communications</h3>
              <p>Signage, calendar, and community stories. Get your campus talking in public.</p>
            </div>
            <div>
              <h3>Data</h3>
              <p>Data Hub with building and campus-wide views. Give your numbers a public face.</p>
            </div>
            <div>
              <h3>Full campus</h3>
              <p>Everything above, plus design help to make your first screens look great.</p>
            </div>
          </div>
          <p className="fine bundles-note">
            The phone app shows the same content and can update the nearest lobby screen.
            Embed a live dashboard or calendar on any partner website. Pricing is tailored
            to your campus — ask us for a quote.
          </p>
          </div>
        </section>

        <section className="field" id="field">
          <div className="shell">
          <div className="field-head">
            <p className="index">04 — Who uses it</p>
            <h2>Trusted on campuses and in communities for over a decade.</h2>
          </div>
          <div className="quotes">
            {VOICES.map((voice) => (
              <figure key={voice.name}>
                <blockquote>“{voice.quote}”</blockquote>
                <figcaption>
                  <strong>{voice.name}</strong>
                  {voice.role}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="proof-grid">
            <article>
              <h3>Oberlin</h3>
              <p>
                The college and city share one Environmental Dashboard — building use,
                citywide flows, lobby screens, a community calendar, and resident
                stories. The software grew up in public, on the streets it describes.
              </p>
            </article>
            <article>
              <h3>Hamilton</h3>
              <p>
                Building data is moving into Data Hub. Hamilton and Oberlin are
                bringing the resource-use demo to AASHE 2026 together.
              </p>
            </article>
            <article>
              <h3>Toledo schools</h3>
              <p>
                Teachers turned water and energy data from 44 school buildings into
                classroom lessons — using the same charts that hang in public spaces.
              </p>
            </article>
          </div>
          </div>
        </section>

        <section className="aashe" id="aashe">
          <div className="shell aashe-grid">
          <p className="index">05 — AASHE 2026 · October 4–6</p>
          <h2>See it live in Baltimore.</h2>
          <ol>
            <li>
              <strong>Explore a building’s pattern.</strong>
              <span>Spin the chart and guess the building type from its shape.</span>
            </li>
            <li>
              <strong>Put it on a lobby screen.</strong>
              <span>The same live chart, where students walk past it every day.</span>
            </li>
            <li>
              <strong>Bring it to class.</strong>
              <span>A real assignment using your campus — not a textbook example.</span>
            </li>
          </ol>
          <p>
            Hilton Baltimore Inner Harbor. Join us at the Hamilton and Oberlin session,
            or reach out to schedule a walk-through.
          </p>
          <a className="btn solid dark" href="#contact">
            Schedule a meeting
          </a>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="shell contact-grid">
          <div>
            <p className="index">06 — Get in touch</p>
            <h2>Tell us about your campus. We’ll show you what’s possible.</h2>
            <p>
              Email us at{" "}
              <a href="mailto:connect@communityhub.cloud">connect@communityhub.cloud</a>.
              Mention AASHE if you would like to meet in Baltimore.
            </p>
            <p className="fine">Based in Oberlin, Ohio.</p>
          </div>
          <form onSubmit={onSubmit}>
            <label>
              Name
              <input name="name" required autoComplete="name" />
            </label>
            <label>
              Institution
              <input name="institution" required autoComplete="organization" />
            </label>
            <label>
              Role
              <select name="role" defaultValue="Sustainability">
                <option>Sustainability</option>
                <option>Facilities</option>
                <option>Faculty</option>
                <option>Student</option>
                <option>City or district</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              I am interested in
              <select name="interest" defaultValue="A meeting at AASHE">
                <option>A meeting at AASHE</option>
                <option>The full campus package</option>
                <option>Data Hub</option>
                <option>Signage and calendar</option>
                <option>A classroom pilot</option>
              </select>
            </label>
            <label>
              Message
              <textarea name="note" rows={4} placeholder="Tell us about your buildings, meters, or what you hope to accomplish." />
            </label>
            <button className="btn solid" type="submit">
              Send message
            </button>
            {sent ? (
              <p className="fine" role="status">
                Your email app should open with a draft. If it does not, write to
                connect@communityhub.cloud directly.
              </p>
            ) : null}
          </form>
          </div>
        </section>
      </main>

      <footer>
        <div className="shell footer-inner">
          <span>Community Hub</span>
          <a href="mailto:connect@communityhub.cloud">connect@communityhub.cloud</a>
          <a href="https://www.aashe.org/conference/">AASHE 2026</a>
        </div>
      </footer>
    </>
  );
}
