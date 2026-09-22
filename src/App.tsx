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
    kicker: "See",
    name: "Data Hub",
    line: "The instrument. Live feeds become heat maps, load profiles, and dashboards a campus can publish.",
    points: [
      "Building systems, sensors, and public feeds in one place",
      "Single- and multi-variable heat maps and load profiles",
      "Derived variables, then a dashboard for a sign or a website",
      "Already written through to EPA Portfolio Manager",
    ],
  },
  {
    kicker: "See",
    name: "Building Dashboard",
    line: "One building, in public. Resource use that a student can feel, not only a facilities login.",
    points: [
      "Electricity and water, as the building is using them",
      "Patterns readable without a mechanical-room tour",
      "Conservation tied to a benefit the campus can name",
    ],
  },
  {
    kicker: "See",
    name: "Citywide Dashboard",
    line: "The whole place, flowing. Electricity, water, and conditions as one picture of a community.",
    points: [
      "Animated flows for a city or a campus district",
      "A resident can see themselves inside the larger system",
      "Built to live on a sign, a site, and a phone",
    ],
  },
  {
    kicker: "Gather",
    name: "Digital Signage",
    line: "The hallway is a channel. Many people update one network of screens.",
    points: [
      "Organization-specific and community-wide on the same wall",
      "Stakeholders post without a broadcast desk",
      "The nearest sign can be steered from the phone app",
    ],
  },
  {
    kicker: "Gather",
    name: "Community Calendar",
    line: "The week, crowdsourced. Events, announcements, volunteer calls, and jobs.",
    points: [
      "Anyone can submit. A designated person approves",
      "Filter by type, place, and sponsor",
      "Web, phone, a weekly note, and the sign down the hall",
    ],
  },
  {
    kicker: "Gather",
    name: "Community Voices",
    line: "The campus, in its own words. Images and lines shaped into messages people actually stop for.",
    points: [
      "Drawn from the full range of a community",
      "Organized, then placed on signs, phones, and sites",
      "A social-marketing tool for resilience, not a slideshow",
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
      note || "I'd like a conversation at AASHE.",
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
          <a href="#signature">Signatures</a>
          <a href="#products">Products</a>
          <a href="#field">In the field</a>
          <a href="#aashe">AASHE</a>
        </nav>
        <a className="nav-cta" href="#contact">
          {days > 0 ? `Baltimore in ${days} days` : "We’re in Baltimore"}
        </a>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow">AASHE 2026 · Baltimore · October 4–6</p>
            <h1>
              Make resource use <em>impossible</em> to ignore.
            </h1>
            <p className="lede">
              Community Hub turns live electricity, water, and climate data into the
              things a campus already looks at — a sign in the lobby, a week on the
              calendar, a graph a class can argue with.
            </p>
            <div className="hero-actions">
              <a className="btn solid" href="#contact">
                Book a conversation
              </a>
              <a className="btn ghost" href="#signature">
                Drag the signature
              </a>
            </div>
            <p className="hero-note">
              Illustrated campus. The orb is the hub: buildings send their pulse in,
              and the story goes back out to signs, phones, and class.
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
          <p className="index">01 — The job</p>
          <h2>Distance got easier. Place got harder.</h2>
          <p>
            Communication tools reach across continents and leave the block, the
            dorm, and the plant room strangely quiet. Community Hub is the local
            layer: acquisition, display, and a way for a community to talk about
            what it is using while it is using it.
          </p>
          <ol>
            <li>
              <strong>Facilities</strong>
              <span>A week of load, readable before the complaint arrives.</span>
            </li>
            <li>
              <strong>Sustainability</strong>
              <span>A public picture that makes a plan feel inhabited.</span>
            </li>
            <li>
              <strong>Faculty</strong>
              <span>Data with no answer key. Students gather it and interpret it.</span>
            </li>
          </ol>
        </section>

        <section className="signature" id="signature">
          <div className="signature-copy">
            <p className="index">02 — The demo</p>
            <h2>A building has a signature.</h2>
            <p>
              Residence halls peak after dark. Labs hold a midday plateau. Dining
              rings three times a day. At AASHE, this is the assignment: read a week
              of resource use and say what the building is for.
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
                  {item}
                </button>
              ))}
            </div>
            <dl className="stats">
              <div>
                <dt>Peak</dt>
                <dd>{stats.peakHour}</dd>
              </div>
              <div>
                <dt>Baseload</dt>
                <dd>{stats.baseload}</dd>
              </div>
              <div>
                <dt>Weekend</dt>
                <dd>{stats.weekend}</dd>
              </div>
            </dl>
            <p className="fine">
              Example profiles, not a live meter. Drag to orbit. Hours run left to
              right. Days run front to back, Monday through Sunday.
            </p>
          </div>
          <div className="signature-stage">
            <SignatureStage kind={kind} resource={resource} />
            <p className="stage-caption">
              {resource === "electricity" ? "Electricity" : "Water"} ·{" "}
              {BUILDING_COPY[kind].label.toLowerCase()} · seven days
            </p>
          </div>
        </section>

        <section className="products" id="products">
          <div className="products-head">
            <p className="index">03 — The suite</p>
            <h2>One platform. Six ways a campus meets it.</h2>
            <p>
              Communications and data ship together or apart. A sign without a true
              number is a poster. A dashboard nobody walks past is a login.
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
              <p>Signage, calendar, and voices. The campus starts talking in public.</p>
            </div>
            <div>
              <h3>Data</h3>
              <p>Data Hub with building and citywide views. The numbers get a face.</p>
            </div>
            <div>
              <h3>Campus</h3>
              <p>Both, plus design support when the first screens have to look inevitable.</p>
            </div>
          </div>
          <p className="fine bundles-note">
            The phone app carries the same content and can steer the nearest sign. Web
            embeds drop a calendar or a live dashboard into a partner’s own site.
            Pricing is scoped to the campus. Ask, and you get a number — not a maze.
          </p>
        </section>

        <section className="field" id="field">
          <div className="field-head">
            <p className="index">04 — In the field</p>
            <h2>A decade in Oberlin. A pilot at Hamilton. A district in Toledo.</h2>
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
                College and city share the Environmental Dashboard: building use,
                citywide flows, signs, a calendar, and voices. The software grew up
                in public, on the street it describes.
              </p>
            </article>
            <article>
              <h3>Hamilton</h3>
              <p>
                Building-system data is moving into Data Hub. Hamilton and Oberlin
                are bringing the resource-use signature into the AASHE program.
              </p>
            </article>
            <article>
              <h3>The classroom</h3>
              <p>
                Toledo teachers turned water and energy in dozens of school buildings
                into lessons. The same graphs hang where residents already stand.
              </p>
            </article>
          </div>
        </section>

        <section className="aashe" id="aashe">
          <p className="index">05 — October 4–6</p>
          <h2>Fifteen minutes in Baltimore.</h2>
          <ol>
            <li>
              <strong>Read a signature.</strong>
              <span>Orbit a week. Name the building from its shape.</span>
            </li>
            <li>
              <strong>Put it on a wall.</strong>
              <span>The same picture, on a sign a student will walk past tonight.</span>
            </li>
            <li>
              <strong>Hand it to a class.</strong>
              <span>An assignment with a live campus instead of a textbook table.</span>
            </li>
          </ol>
          <p>
            Hilton Baltimore Inner Harbor. If you are in a session with Hamilton and
            Oberlin, come find the people who built the picture.
          </p>
          <a className="btn solid dark" href="#contact">
            Hold a time
          </a>
        </section>

        <section className="contact" id="contact">
          <div>
            <p className="index">06 — Talk</p>
            <h2>Tell us the campus. We’ll bring the picture.</h2>
            <p>
              Write to{" "}
              <a href="mailto:connect@communityhub.cloud">connect@communityhub.cloud</a>.
              Say AASHE if you want this found in Baltimore rather than in an inbox
              on the 7th.
            </p>
            <p className="fine">Oberlin, Ohio. Community Hub.</p>
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
              You want
              <select name="interest" defaultValue="A conversation at AASHE">
                <option>A conversation at AASHE</option>
                <option>The campus bundle</option>
                <option>Data Hub</option>
                <option>Signage and calendar</option>
                <option>A classroom pilot</option>
              </select>
            </label>
            <label>
              Note
              <textarea name="note" rows={4} placeholder="Buildings, meters, or the session you’re in." />
            </label>
            <button className="btn solid" type="submit">
              Open the email
            </button>
            {sent ? (
              <p className="fine" role="status">
                Your mail app should be open. If it isn’t, write connect@communityhub.cloud
                directly.
              </p>
            ) : null}
          </form>
        </section>
      </main>

      <footer>
        <span>Community Hub</span>
        <a href="mailto:connect@communityhub.cloud">connect@communityhub.cloud</a>
        <a href="https://www.aashe.org/conference/">AASHE 2026</a>
      </footer>
    </>
  );
}
