import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, BarChart3, Building2, RadioTower } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { ContactBand } from "@/components/contact-band";
import { RelatedProducts } from "@/components/product-pager";
import { SiteFooter } from "@/components/site-footer";
import { copy } from "@/lib/copy";
import { DEMO_HREF } from "@/lib/links";
import { productIcon } from "@/lib/product-icons";
import { site } from "@/lib/site";

export const Route = createFileRoute("/lorawan")({
  component: LoRaWAN,
  head: () => ({
    meta: [
      { title: "LoRaWAN — Community Hub" },
      {
        name: "description",
        content:
          "Private LoRaWAN sensor networks for schools and campuses: connect gateways, add sensors with step-by-step guides, watch live readings and send the data to Data Hub.",
      },
    ],
  }),
});

/** The live product, where an organization signs in to its own network. */
const CONSOLE_HREF = "https://lorawan-sensors.communityhb.tech";

/** From the radio to the people who use the data: the three stages a reading passes through. */
const PATH = [
  {
    icon: RadioTower,
    title: "Sensors and gateways",
    body: "Air-quality and energy sensors report over long-range radio to a gateway on site.",
  },
  {
    icon: Building2,
    title: "Your own network",
    body: "Each organization gets a private workspace for its gateways, sensors, readings and alerts.",
  },
  {
    icon: BarChart3,
    title: "Data Hub and your systems",
    body: "Readings flow to Data Hub dashboards, and out by API, webhook or CSV.",
  },
] as const;

const FEATURES = [
  {
    title: "Setup that helps",
    body: "Pick the sensor model and follow the written steps for that device. The network key is made on the server.",
  },
  {
    title: "Alerts with no setup",
    body: "A sensor goes quiet, a gateway goes offline, a battery runs low: the console shows it.",
  },
  {
    title: "Your data, your way",
    body: "Charts and CSV export, a REST API with organization keys, and signed webhooks.",
  },
] as const;

const STEPS = [
  { title: "Connect a gateway", body: "Register it and get the exact settings to type into it." },
  { title: "Add sensors", body: "Choose the model; the guide covers activation and setup for that device." },
  { title: "Watch the readings", body: "Live readings, charts and alerts, for the people you choose." },
] as const;

/** Device families the console already knows, with their decoders; anything else can be added as a custom type. */
const DEVICES = [
  { name: "Milesight AM series", kind: "Indoor air quality" },
  { name: "Milesight EM series", kind: "Environment monitoring" },
  { name: "Milesight CT series", kind: "Electric current" },
  { name: "Milesight WS series", kind: "Smart buttons and switches" },
  { name: "Wio-E5, XBee LR, RFM95", kind: "Build your own" },
] as const;

const PRIVATE = [
  {
    title: "Its own workspace",
    body: "Sensors, gateways, readings, people, API keys and webhooks belong to one organization.",
  },
  {
    title: "Credentials stay on the server",
    body: "Network and integration credentials never reach the browser.",
  },
  {
    title: "Roles",
    body: "Decide who can manage the network and who can only view readings.",
  },
] as const;

const DESTINATIONS = ["Data Hub", "Webhooks", "MQTT", "AWS IoT Core", "Azure Event Grid", "ThingsBoard", "Datadog"] as const;

/** The path a reading takes, drawn in the site's own colours: radio waves leave the sensor and reach your data. */
function SignalPath() {
  return (
    <figure className="lora-path panel" aria-label="How a reading travels: sensors and gateways, your own network, Data Hub and your systems">
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
            <nav aria-label="Breadcrumb" className="mb-6 text-[0.9375rem] text-ink/65">
              <AppLink href="/products" className="font-medium text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-pine">
                Products
              </AppLink>
              <span aria-hidden className="px-2 text-ink/35">
                /
              </span>
              <span aria-current="page">LoRaWAN</span>
            </nav>
            <div className="product-detail-layout product-detail-split">
              <div className="min-w-0">
                <img src={productIcon("lorawan")} alt="" width={56} height={56} className="mb-5 size-14 object-contain" />
                <h1 id="lorawan-title" className="t-h1">
                  LoRaWAN
                </h1>
                <p className="mt-5 max-w-xl t-lede">
                  Private sensor networks for schools and campuses. Connect gateways, add sensors with step-by-step setup guides, watch
                  live readings, and send the data where it needs to go, including Data Hub.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <AppLink href={site.contactHref} className="btn-primary">
                    {copy.siteHeader.SiteHeader.a1}
                  </AppLink>
                  <AppLink href={DEMO_HREF} className="btn-secondary">
                    {copy.siteHeader.SiteHeader.a2}
                  </AppLink>
                </div>
                <p className="mt-5">
                  <a href={CONSOLE_HREF} target="_blank" rel="noopener" className="link">
                    Visit the LoRaWAN console
                    <ArrowUpRight className="size-4" aria-hidden />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
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
                  Built on a real campus network
                </h2>
                <p className="mt-5 max-w-xl t-body text-ink/80">
                  LoRaWAN was built and tested on a campus network at Oberlin College: a gateway on a roof, air-quality and energy
                  sensors, and readings flowing to a community dashboard.
                </p>
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
                  <h3 className="t-h3">Works with</h3>
                  <p className="mt-2 t-small text-ink/70">Sensor types the console sets up for you, with their decoders. Other hardware can be added as a custom type.</p>
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

        <section id="private-by-design" aria-labelledby="private-title" className="product-section page page-center">
          <div className="wrap page-body">
            <h2 id="private-title" className="t-h2 max-w-3xl">
              Private by design
            </h2>
            <p className="mt-5 max-w-2xl t-lede">Each organization’s network stays its own, and its data goes only where it chooses.</p>
            <ul className="mt-[clamp(1.5rem,5vh,3rem)] grid gap-8 md:grid-cols-3">
              {PRIVATE.map((item) => (
                <li key={item.title} className="lora-private">
                  <h3 className="text-lg font-semibold text-pine">{item.title}</h3>
                  <p className="mt-2 t-body text-ink/78">{item.body}</p>
                </li>
              ))}
            </ul>
            <div className="mt-[clamp(1.5rem,5vh,3rem)] border-t border-line pt-[clamp(1.25rem,3.5vh,2rem)]">
              <p className="font-semibold text-ink">Send readings to</p>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {DESTINATIONS.map((name) => (
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
