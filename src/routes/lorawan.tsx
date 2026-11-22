import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ArrowRight, BarChart3, Building2, RadioTower } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { ContactBand } from "@/components/contact-band";
import { RelatedProducts } from "@/components/product-pager";
import { SiteFooter } from "@/components/site-footer";
import { copy } from "@/lib/copy";
import { DEMO_HREF } from "@/lib/links";
import { productIcon } from "@/lib/product-icons";
import { site } from "@/lib/site";
import { txt } from "@/lib/page-text/lorawan";

export const Route = createFileRoute("/lorawan")({
  component: LoRaWAN,
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

/** The live console, where an organization signs in to its own network. It opens inside communityhub.cloud. */
const CONSOLE_HREF = "/lorawan/console";

/** From the radio to the people who use the data: the three stages a reading passes through. */
const PATH = [
  {
    icon: RadioTower,
    get title() { return txt.title2; },
    get body() { return txt.body1; },
  },
  {
    icon: Building2,
    get title() { return txt.title3; },
    get body() { return txt.body2; },
  },
  {
    icon: BarChart3,
    get title() { return txt.title4; },
    get body() { return txt.body3; },
  },
] as const;

const FEATURES = [
  {
    get title() { return txt.title5; },
    get body() { return txt.body4; },
  },
  {
    get title() { return txt.title6; },
    get body() { return txt.body5; },
  },
  {
    get title() { return txt.title7; },
    get body() { return txt.body6; },
  },
] as const;

const STEPS = [
  { get title() { return txt.title8; }, get body() { return txt.body7; } },
  { get title() { return txt.title9; }, get body() { return txt.body8; } },
  { get title() { return txt.title10; }, get body() { return txt.body9; } },
] as const;

/** Device families the console already knows, with their decoders; anything else can be added as a custom type. */
const DEVICES = [
  { get name() { return txt.name1; }, get kind() { return txt.deviceKind1; } },
  { get name() { return txt.name2; }, get kind() { return txt.deviceKind2; } },
  { get name() { return txt.name3; }, get kind() { return txt.deviceKind3; } },
  { get name() { return txt.name4; }, get kind() { return txt.deviceKind4; } },
  { get name() { return txt.name5; }, get kind() { return txt.deviceKind5; } },
] as const;

const PRIVATE = [
  {
    get title() { return txt.title11; },
    get body() { return txt.body10; },
  },
  {
    get title() { return txt.title12; },
    get body() { return txt.body11; },
  },
  {
    get title() { return txt.title13; },
    get body() { return txt.body12; },
  },
] as const;


/** The path a reading takes, drawn in the site's own colours: radio waves leave the sensor and reach your data. */
function SignalPath() {
  return (
    <figure className="lora-path panel" aria-label="How a reading travels from sensors and gateways, through your private network, to Data Hub and other systems">
      <div aria-hidden className="lora-waves">
        <span />
        <span />
        <span />
      </div>
      <ol className="lora-stages">
        {PATH.map((stage, n) => (
          <li key={stage.title} className="lora-stage">
            <span className="lora-stage-icon">
              <stage.icon className="size-6" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="lora-stage-step" data-numbers>
              {n + 1}
            </span>
            <h2 className="lora-stage-title">{stage.title}</h2>
            <p className="lora-stage-body">{stage.body}</p>
          </li>
        ))}
      </ol>
    </figure>
  );
}

function LoRaWAN() {
  return (
    <div className="bg-paper text-ink">
      <main id="main" className="product-main deck">
        <section id="lorawan" aria-labelledby="lorawan-title" className="product-section page page-first page-center">
          <div className="wrap page-body">
            <Breadcrumbs className="mb-6" />
            <div className="product-detail-layout product-detail-split">
              <div className="min-w-0">
                <img src={productIcon("lorawan")} alt="" width={56} height={56} className="mb-5 size-14 object-contain" />
                <h1 id="lorawan-title" className="t-h1">
                  {txt.h11}</h1>
                <p className="mt-5 max-w-xl t-lede">
                  {txt.p1}</p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <AppLink href={site.contactHref} className="btn-primary">
                    {copy.siteHeader.SiteHeader.a1}
                  </AppLink>
                  <AppLink href={DEMO_HREF} className="btn-secondary">
                    {copy.siteHeader.SiteHeader.a2}
                  </AppLink>
                </div>
                <p className="mt-5">
                  <AppLink href={CONSOLE_HREF} className="link">
                    {txt.AppLink1}<ArrowRight className="size-4" aria-hidden />
                  </AppLink>
                </p>
              </div>
              <div className="min-w-0">
                <SignalPath />
              </div>
            </div>
            <ul className="product-detail-features">
              {FEATURES.map((feature) => (
                <li key={feature.title}>
                  <h2 className="text-lg font-semibold text-pine">{feature.title}</h2>
                  <p className="mt-2 t-body text-ink/78">{feature.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="campus-network" aria-labelledby="campus-network-title" className="product-section page page-center">
          <div className="wrap page-body">
            <div className="product-detail-layout product-detail-split">
              <div className="min-w-0">
                <h2 id="campus-network-title" className="t-h2">
                  {txt.h21}</h2>
                <p className="mt-5 max-w-xl t-body text-ink/80">
                  {txt.p2}</p>
                <ol className="mt-8 space-y-5">
                  {STEPS.map((step, n) => (
                    <li key={step.title} className="flex gap-4 t-body">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-lime-pale text-sm font-semibold text-pine" data-numbers>
                        {n + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-ink">{step.title}</p>
                        <p className="mt-1 text-ink/80">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="min-w-0">
                <div className="lora-devices">
                  <h3 className="t-h3">{txt.h31}</h3>
                  <p className="mt-2 t-small text-ink/70">{txt.p3}</p>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {DEVICES.map((device) => (
                      <li key={device.name} className="lora-device">
                        <span className="font-semibold text-ink">{device.name}</span>
                        <span className="t-small text-ink/65">{device.kind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="privacy-and-security" aria-labelledby="private-title" className="product-section page page-center">
          <div className="wrap page-body">
            <h2 id="private-title" className="t-h2 max-w-3xl">
              {txt.h22}</h2>
            <p className="mt-5 max-w-2xl t-lede">{txt.p4}</p>
            <ul className="mt-[clamp(1.5rem,5vh,3rem)] grid gap-8 md:grid-cols-3">
              {PRIVATE.map((item) => (
                <li key={item.title} className="lora-private">
                  <h3 className="text-lg font-semibold text-pine">{item.title}</h3>
                  <p className="mt-2 t-body text-ink/78">{item.body}</p>
                </li>
              ))}
            </ul>
            <div className="mt-[clamp(1.5rem,5vh,3rem)] border-t border-line pt-[clamp(1.25rem,3.5vh,2rem)]">
              <p className="font-semibold text-ink">{txt.p5}</p>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {txt.destinations.map((name) => (
                  <li key={name} className="lora-chip">
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <RelatedProducts page="/lorawan" />
        <ContactBand />
      </main>
      <SiteFooter />
    </div>
  );
}
