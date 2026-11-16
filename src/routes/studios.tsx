import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { ContactBand } from "@/components/contact-band";
import { RelatedProducts } from "@/components/product-pager";
import { FrameSlider } from "@/components/product-section";
import { SiteFooter } from "@/components/site-footer";
import type { SlideFrame } from "@/lib/content";
import { copy } from "@/lib/copy";
import { DEMO_HREF } from "@/lib/links";
import { productIcon } from "@/lib/product-icons";

export const Route = createFileRoute("/studios")({
  component: Studios,
  head: () => ({
    meta: [
      { title: "Studios — Community Hub" },
      {
        name: "description",
        content: "Draw systems, connect live readings, and publish community data as interactive stories, orb maps and lobby loops.",
      },
    ],
  }),
});

/** Community Hub Studios, where the maps, stories and loops are made and published. */
const STUDIOS = "https://studios.communityhb.tech";
const OPEN_STUDIO = `${STUDIOS}/studio`;

/** The published work below plays live from Studios; each one opens there in full. */
const HERO_FRAMES: SlideFrame[] = [
  {
    title: "Oberlin · Carbon Neutral Stories",
    caption: "",
    embed: `${STUDIOS}/play.html?show=oberlin-home-loop&mode=kiosk`,
    presentation: true,
  },
];

const WAYS = [
  {
    kind: "Map",
    title: "Put every reading in its place.",
    body: "Place live data where it happens, compare buildings and sensors, and keep the geography recognizable.",
  },
  {
    kind: "Story",
    title: "Explain how the system works.",
    body: "Draw routes, bend pipes, edit text in place, and arrange maps, gauges and illustrations on a freeform canvas.",
  },
  {
    kind: "Loop",
    title: "Keep the story moving on public screens.",
    body: "Sequence the same canvas scenes into a hands-free display that stays clear from across a lobby.",
  },
] as const;

const WAY_FRAMES: SlideFrame[] = [
  { title: "Map · Air quality in Cleveland", caption: "", embed: `${STUDIOS}/viewer.html?map=cleveland`, presentation: true },
  { title: "Story · Heating & Cooling at Oberlin", caption: "", embed: `${STUDIOS}/play.html?show=oberlin-geothermal`, presentation: true },
  { title: "Loop · What’s in Cleveland’s air?", caption: "", embed: `${STUDIOS}/play.html?show=cleveland-air-loop&mode=kiosk`, presentation: true },
];

const STEPS = [
  { title: "Bring in the place", body: "Start with a campus, neighborhood, building, or sensor network." },
  { title: "Shape the meaning", body: "Draw the connections, bind live readings, and arrange the story on canvas." },
  { title: "Publish for the moment", body: "Share an interactive link or run the same work as a hands-free loop." },
] as const;

const SHOWS = [
  { title: "Heating & Cooling at Oberlin", meta: "Story · 12 slides", href: `${STUDIOS}/play.html?show=oberlin-geothermal` },
  { title: "Carbon Neutral Stories", meta: "Signage loop · 14 slides", href: `${STUDIOS}/play.html?show=oberlin-home-loop&mode=kiosk` },
  { title: "What’s in Cleveland’s air?", meta: "Signage loop · 6 slides", href: `${STUDIOS}/play.html?show=cleveland-air-loop&mode=kiosk` },
] as const;

const MAPS = [
  { title: "Air quality in Cleveland", meta: "41 sensors", map: "cleveland" },
  { title: "Air quality in Pittsburgh", meta: "14 sensors", map: "pittsburgh" },
  { title: "Air quality in Accra", meta: "15 sensors", map: "accra" },
  { title: "Resource flows in Oberlin College", meta: "37 buildings", map: "oberlin" },
  { title: "Resource flows at Hamilton College", meta: "28 buildings", map: "hamilton" },
  { title: "Woodland Hall, first floor", meta: "8 rooms", map: "woodland-f1" },
  { title: "Woodland Hall, second floor", meta: "8 rooms", map: "woodland-f2" },
  { title: "Woodland Hall, third floor", meta: "8 rooms", map: "woodland-f3" },
  { title: "Woodland Hall, fourth floor", meta: "8 rooms", map: "woodland-f4" },
] as const;

function External({ href, children, className = "link" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={className}>
      {children}
      <ArrowUpRight className="size-4" aria-hidden />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function WorkCard({ title, meta, href }: { title: string; meta: string; href: string }) {
  return (
    <li>
      <a href={href} target="_blank" rel="noopener" className="studio-card group">
        <span className="min-w-0">
          <span className="block font-semibold text-ink group-hover:text-pine">{title}</span>
          <span className="mt-0.5 block t-small text-ink/65">{meta}</span>
        </span>
        <ArrowUpRight className="size-4 shrink-0 text-leaf transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </li>
  );
}

function Studios() {
  return (
    <div className="bg-paper text-ink">
      <main id="main" className="product-main deck">
        <section id="studios" aria-labelledby="studios-title" className="product-section page page-first page-center">
          <div className="wrap page-body">
            <nav aria-label="Breadcrumb" className="mb-6 text-[0.9375rem] text-ink/65">
              <AppLink href="/products" className="font-medium text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-pine">
                Products
              </AppLink>
              <span aria-hidden className="px-2 text-ink/35">
                /
              </span>
              <span aria-current="page">Studios</span>
            </nav>
            <div className="product-detail-layout product-detail-split">
              <div className="min-w-0">
                <img src={productIcon("studios")} alt="" width={56} height={56} className="mb-5 size-14 object-contain" />
                <h1 id="studios-title" className="t-h1">
                  Studios
                </h1>
                <p className="mt-5 max-w-xl t-lede">
                  Build the story behind your community’s data. Draw the pipes, place the gauges and connect live readings, then publish
                  the same canvas as an interactive story or a lobby loop.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <External href={OPEN_STUDIO} className="btn-primary">
                    Open Studio
                  </External>
                  <AppLink href={DEMO_HREF} className="btn-secondary">
                    {copy.siteHeader.SiteHeader.a2}
                  </AppLink>
                </div>
                <p className="mt-5">
                  <a
                    href="#published-work"
                    onClick={(event) => {
                      const el = document.getElementById("published-work");
                      if (!el) return;
                      event.preventDefault();
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="link"
                  >
                    See published work
                  </a>
                </p>
              </div>
              <div className="product-detail-media min-w-0">
                <FrameSlider frames={HERO_FRAMES} heading="Studios" />
              </div>
            </div>
          </div>
        </section>

        <section id="three-ways" aria-labelledby="three-ways-title" className="product-section page page-center">
          <div className="wrap page-body">
            <div className="product-detail-layout product-detail-split">
              <div className="min-w-0">
                <h2 id="three-ways-title" className="t-h2">
                  One canvas, three ways to publish.
                </h2>
                <p className="mt-4 max-w-xl t-body text-ink/80">
                  Build once, then let people explore the place, follow the explanation, or watch it unfold on a public screen.
                </p>
                <ul className="mt-6 space-y-5">
                  {WAYS.map((way) => (
                    <li key={way.kind} className="studio-way">
                      <span className="studio-way-kind">{way.kind}</span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-ink">{way.title}</span>
                        <span className="mt-1 block t-small text-ink/72">{way.body}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="product-detail-media min-w-0">
                <FrameSlider frames={WAY_FRAMES} heading="One canvas, three ways to publish." />
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" aria-labelledby="how-title" className="product-section page page-center">
          <div className="wrap page-body">
            <h2 id="how-title" className="t-h2 max-w-3xl">
              Start with the place. End with something people understand.
            </h2>
            <ol className="mt-[clamp(1.75rem,6vh,3.5rem)] grid gap-8 md:grid-cols-3">
              {STEPS.map((step, n) => (
                <li key={step.title} className="studio-step">
                  <span className="studio-step-number" data-numbers>
                    {n + 1}
                  </span>
                  <h3 className="mt-4 t-h3">{step.title}</h3>
                  <p className="mt-2 t-body text-ink/78">{step.body}</p>
                </li>
              ))}
            </ol>
            <p className="mt-[clamp(1.75rem,6vh,3.5rem)]">
              <External href={OPEN_STUDIO} className="btn-primary">
                Open Studio
              </External>
            </p>
          </div>
        </section>

        <section id="published-work" aria-labelledby="work-title" className="product-section page page-center">
          <div className="wrap page-body">
            <div className="page-head">
              <div>
                <h2 id="work-title" className="t-h2">
                  See the real work.
                </h2>
                <p className="mt-3 max-w-2xl t-body text-ink/78">These are working maps, stories, and loops. Open any one to explore the published result.</p>
              </div>
            </div>
            <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <div>
                <h3 className="font-semibold text-ink">Stories and loops</h3>
                <ul className="mt-3 grid gap-2.5">
                  {SHOWS.map((show) => (
                    <WorkCard key={show.title} title={show.title} meta={show.meta} href={show.href} />
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-ink">Orb maps</h3>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {MAPS.map((map) => (
                    <WorkCard key={map.map} title={map.title} meta={map.meta} href={`${STUDIOS}/viewer.html?map=${map.map}`} />
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-6 max-w-4xl text-[0.8125rem] leading-relaxed text-ink/60">
              Illustrations by Maddie Faubert for Community Hub’s SIP signage. Map data © OpenStreetMap contributors (ODbL). Cleveland
              sensor sites from the City of Cleveland CLEANinCLE program. Readings are synthetic until each community’s live feed is
              connected.
            </p>
          </div>
        </section>

        <RelatedProducts page="/studios" />
        <ContactBand />
      </main>
      <SiteFooter />
    </div>
  );
}
