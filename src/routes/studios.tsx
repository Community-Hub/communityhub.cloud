import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { ContactBand } from "@/components/contact-band";
import { RelatedProducts } from "@/components/product-pager";
import { FrameSlider } from "@/components/product-section";
import { SiteFooter } from "@/components/site-footer";
import type { SlideFrame } from "@/lib/content";
import { copy } from "@/lib/copy";
import { DEMO_HREF } from "@/lib/links";
import { productIcon } from "@/lib/product-icons";
import { OPEN_STUDIO, STUDIO_MAPS, STUDIO_SHOWS, studioWorkHref, type StudioWork } from "@/lib/studios";

export const Route = createFileRoute("/studios")({
  component: Studios,
  head: () => ({
    meta: [
      { title: "Studios — Community Hub" },
      {
        name: "description",
        content:
          "Studios makes it easy to tell the story behind a community’s data, as an interactive story, a map, or a loop for digital signage.",
      },
    ],
  }),
});

const show = (slug: string) => STUDIO_SHOWS.find((work) => work.slug === slug)!;
const map = (slug: string) => STUDIO_MAPS.find((work) => work.slug === slug)!;

/** The published work below plays live from Studios, inside this page. */
const HERO_FRAMES: SlideFrame[] = [{ title: "Oberlin · Carbon Neutral Stories", caption: "", embed: show("oberlin-home-loop").src, presentation: true }];

const WAYS = [
  {
    kind: "Map",
    body: "Orb maps place live readings where they happen, so people can compare buildings and sensors in a place they recognize.",
  },
  {
    kind: "Story",
    body: "Stories explain how a system works, with routes, pipes, text, maps, gauges and illustrations arranged on a freeform canvas.",
  },
  {
    kind: "Loop",
    body: "Loops play the same scenes as a hands-free display that stays easy to read from across a lobby.",
  },
] as const;

const WAY_FRAMES: SlideFrame[] = [
  { title: "Map · Air quality in Cleveland", caption: "", embed: map("cleveland").src, presentation: true },
  { title: "Story · Heating & Cooling at Oberlin", caption: "", embed: show("oberlin-geothermal").src, presentation: true },
  { title: "Loop · What’s in Cleveland’s air?", caption: "", embed: show("cleveland-air-loop").src, presentation: true },
];

const STEPS = [
  { title: "Start with a place", body: "Begin with a campus, a neighborhood, a building or a sensor network." },
  { title: "Draw and connect", body: "Draw the connections, link them to live readings, and arrange the story on the canvas." },
  { title: "Publish", body: "Share an interactive link, or run the same work as a hands-free loop on digital signage." },
] as const;

/** The editor itself runs only on studios.communityhb.tech, so this one link opens there, in a new tab. */
function OpenStudio({ className = "btn-primary" }: { className?: string }) {
  return (
    <a href={OPEN_STUDIO} target="_blank" rel="noopener" className={className}>
      Open Studio
      <ArrowUpRight className="size-4" aria-hidden />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function WorkCard({ work }: { work: StudioWork }) {
  return (
    <li>
      <AppLink href={studioWorkHref(work)} className="studio-card group">
        <span className="min-w-0">
          <span className="block font-semibold text-ink group-hover:text-pine">{work.title}</span>
          <span className="mt-0.5 block t-small text-ink/65">{work.meta}</span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-leaf transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
      </AppLink>
    </li>
  );
}

function Studios() {
  return (
    <div className="bg-paper text-ink">
      <main id="main" className="product-main deck">
        <section id="studios" aria-labelledby="studios-title" className="product-section page page-first page-center">
          <div className="wrap page-body">
            <Breadcrumbs className="mb-6" />
            <div className="product-detail-layout product-detail-split">
              <div className="min-w-0">
                <img src={productIcon("studios")} alt="" width={56} height={56} className="mb-5 size-14 object-contain" />
                <h1 id="studios-title" className="t-h1">
                  Studios
                </h1>
                <p className="mt-5 max-w-xl t-lede">
                  Studios makes it easy to tell the story behind a community’s data. Draw buildings, pipes and gauges on a canvas, connect
                  them to live readings, and publish the result as an interactive story, a map, or a loop for digital signage.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <OpenStudio />
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
                    See published examples
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
                  Maps, stories and loops
                </h2>
                <p className="mt-4 max-w-xl t-body text-ink/80">
                  Work made in Studios can be explored as a map, followed as a story, or played on a public screen.
                </p>
                <ul className="mt-6 space-y-5">
                  {WAYS.map((way) => (
                    <li key={way.kind} className="studio-way">
                      <span className="studio-way-kind">{way.kind}</span>
                      <span className="min-w-0 t-body text-ink/80">{way.body}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="product-detail-media min-w-0">
                <FrameSlider frames={WAY_FRAMES} heading="Maps, stories and loops" />
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" aria-labelledby="how-title" className="product-section page page-center">
          <div className="wrap page-body">
            <h2 id="how-title" className="t-h2 max-w-3xl">
              How Studios works
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
              <OpenStudio />
            </p>
          </div>
        </section>

        <section id="published-work" aria-labelledby="work-title" className="product-section page page-center">
          <div className="wrap page-body">
            <div className="page-head">
              <div>
                <h2 id="work-title" className="t-h2">
                  Published examples
                </h2>
                <p className="mt-3 max-w-2xl t-body text-ink/78">These maps, stories and loops are live. Open any of them to explore the published version.</p>
              </div>
            </div>
            <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <div>
                <h3 className="font-semibold text-ink">Stories and loops</h3>
                <ul className="mt-3 grid gap-2.5">
                  {STUDIO_SHOWS.map((work) => (
                    <WorkCard key={work.slug} work={work} />
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-ink">Orb maps</h3>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {STUDIO_MAPS.map((work) => (
                    <WorkCard key={work.slug} work={work} />
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
