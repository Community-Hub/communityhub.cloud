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
import { txt } from "@/lib/page-text/studios";

export const Route = createFileRoute("/studios")({
  component: Studios,
  head: () => ({
    meta: [
      { title: txt.title1 },
      {
        name: "description",
        content:
          txt.content1,
      },
    ],
  }),
});

const show = (slug: string) => STUDIO_SHOWS.find((work) => work.slug === slug)!;
const map = (slug: string) => STUDIO_MAPS.find((work) => work.slug === slug)!;

/** The published work below plays live from Studios, inside this page. */
const HERO_FRAMES: SlideFrame[] = [{ get title() { return txt.title2; }, caption: "", embed: show("oberlin-home-loop").src, presentation: true }];

const WAYS = [
  {
    get kind() { return txt.wayKind1; },
    get body() { return txt.body1; },
  },
  {
    get kind() { return txt.wayKind2; },
    get body() { return txt.body2; },
  },
  {
    get kind() { return txt.wayKind3; },
    get body() { return txt.body3; },
  },
] as const;

const WAY_FRAMES: SlideFrame[] = [
  { get title() { return txt.title3; }, caption: "", embed: map("cleveland").src, presentation: true },
  { get title() { return txt.title4; }, caption: "", embed: show("oberlin-geothermal").src, presentation: true },
  { get title() { return txt.title5; }, caption: "", embed: show("cleveland-air-loop").src, presentation: true },
];

const STEPS = [
  { get title() { return txt.title6; }, get body() { return txt.body4; } },
  { get title() { return txt.title7; }, get body() { return txt.body5; } },
  { get title() { return txt.title8; }, get body() { return txt.body6; } },
] as const;

/** The editor itself runs only on studios.communityhb.tech, so this one link opens there, in a new tab. */
function OpenStudio({ className = "btn-primary" }: { className?: string }) {
  return (
    <a href={OPEN_STUDIO} target="_blank" rel="noopener" className={className}>
      {txt.a1}<ArrowUpRight className="size-4" aria-hidden />
      <span className="sr-only"> {" "}{txt.span1}</span>
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
                  {txt.h11}</h1>
                <p className="mt-5 max-w-xl t-lede">
                  {txt.p1}</p>
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
                    {txt.a2}</a>
                </p>
              </div>
              <div className="product-detail-media min-w-0">
                <FrameSlider frames={HERO_FRAMES} heading={txt.heading1} />
              </div>
            </div>
          </div>
        </section>

        <section id="three-ways" aria-labelledby="three-ways-title" className="product-section page page-center">
          <div className="wrap page-body">
            <div className="product-detail-layout product-detail-split">
              <div className="min-w-0">
                <h2 id="three-ways-title" className="t-h2">
                  {txt.h21}</h2>
                <p className="mt-4 max-w-xl t-body text-ink/80">
                  {txt.p2}</p>
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
                <FrameSlider frames={WAY_FRAMES} heading={txt.heading2} />
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" aria-labelledby="how-title" className="product-section page page-center">
          <div className="wrap page-body">
            <h2 id="how-title" className="t-h2 max-w-3xl">
              {txt.h22}</h2>
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
                  {txt.h23}</h2>
                <p className="mt-3 max-w-2xl t-body text-ink/78">{txt.p3}</p>
              </div>
            </div>
            <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <div>
                <h3 className="font-semibold text-ink">{txt.h31}</h3>
                <ul className="mt-3 grid gap-2.5">
                  {STUDIO_SHOWS.map((work) => (
                    <WorkCard key={work.slug} work={work} />
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-ink">{txt.h32}</h3>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {STUDIO_MAPS.map((work) => (
                    <WorkCard key={work.slug} work={work} />
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-6 max-w-4xl text-[0.8125rem] leading-relaxed text-ink/60">
              {txt.p4}</p>
          </div>
        </section>

        <RelatedProducts page="/studios" />
        <ContactBand />
      </main>
      <SiteFooter />
    </div>
  );
}
