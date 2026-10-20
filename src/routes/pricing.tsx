import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLink } from "@/components/app-link";
import { DocSection, DocShell } from "@/components/doc";
import { TabRow, TabPager, tabPanel } from "@/components/tab-row";
import { quoteHref } from "@/lib/links";
import { site } from "@/lib/site";
import { bundles, faq, services } from "@/lib/pricing";
import { useSwipe } from "@/lib/use-swipe";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
const STOPS = pc.pricing.STOPS;

export const Route = createFileRoute("/pricing")({
  component: Pricing,
  head: () => ({
    meta: [
      { title: pc.meta.pricing.title },
      { name: "description", content: pc.meta.pricing.description },
    ],
  }),
});

function BundleCard({ bundle }: { bundle: (typeof bundles)[number] }) {
  return (
    <>
      <h2 className="t-h3 short:text-xl">{`${bundle.name} bundle`}</h2>
      <ul className="mt-2 list-disc space-y-0.5 pl-5 t-body md:space-y-1 short:t-small short:md:space-y-0">
        {bundle.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {bundle.note && <p className="mt-2 t-small text-ink/80">{bundle.note}</p>}
      <p className="mt-2 font-bold md:mt-4 short:md:mt-2">{copy.pricing.Pricing.p1}</p>
      <p className="mt-0 md:mt-2 short:md:mt-0">
        <AppLink href={quoteHref(`${bundle.name} bundle`)} className="link">{copy.pricing.Pricing.AppLink1}<span className="sr-only">{` about the ${bundle.name} bundle`}</span>
        </AppLink>
      </p>
    </>
  );
}

function Pricing() {
  const [id, setId] = useState(bundles[0].id);
  // A link like /pricing#data opens that bundle, on load and when the hash changes in the page.
  useEffect(() => {
    const read = () => {
      const hash = window.location.hash.replace("#", "");
      if (bundles.some((bundle) => bundle.id === hash)) setId(hash);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  const at = Math.max(0, bundles.findIndex((bundle) => bundle.id === id));
  const bundle = bundles[at];
  const pick = (next: number) => {
    const item = bundles[(next + bundles.length) % bundles.length];
    setId(item.id);
    history.replaceState(null, "", `#${item.id}`);
  };
  const pickRef = useRef(pick);
  pickRef.current = pick;
  const atRef = useRef(at);
  atRef.current = at;
  const cardRef = useRef<HTMLDivElement>(null);
  useSwipe(cardRef, (dir) => pickRef.current(atRef.current + dir));

  return (
    <DocShell stops={STOPS}>
      <DocSection label={STOPS[0].label} title={copy.pricing.Pricing.DocSection_title1} as="h1" titleClassName="t-h2" ledeClassName="t-body" lede={site.pricingLede}>
        {/* A phone shows one bundle at a time behind tabs; a wider screen shows all three side by side to compare. */}
        <div className="md:hidden">
          <TabRow idBase="bundles" label={copy.pricing.Pricing.TabRow_label1} noun="bundle" items={bundles} at={at} onPick={pick} />
          <div
            ref={cardRef}
            {...tabPanel("bundles", bundle.id)}
            data-swipe-own
            data-bundle={bundle.id}
            style={{ touchAction: "pan-y pinch-zoom" }}
            className="mt-2 rounded-md border border-line bg-paper p-3"
          >
            <BundleCard bundle={bundle} />
            <TabPager noun="bundle" at={at} onPick={pick} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 items-start gap-3 max-md:hidden" data-bundles>
          {bundles.map((item) => (
            <div key={item.id} data-bundle-card={item.id} className="h-full rounded-md border border-line bg-paper p-4 lg:p-6 short:p-3">
              <BundleCard bundle={item} />
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection label={STOPS[1].label} title={copy.pricing.Pricing.DocSection_title2}>
        <p className="max-w-3xl t-body">Connect your data and explain what makes your community unique. Design services complement the CommunityHub products you choose.</p>
        <ul className="mt-5 grid max-w-4xl gap-6 md:grid-cols-2 t-body" data-services>
          {services.map((service) => (
            <li key={service.id} className="border-t border-pine/30 pt-4">
              <h3 className="t-h3">{service.name}</h3><p className="mt-2">{service.line}</p>
              <AppLink href={`/services#${service.id}`} className="link mt-3">Explore {service.name.toLowerCase()}</AppLink>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          <AppLink href={quoteHref("Design services")} className="link">{copy.pricing.Pricing.AppLink2}<span className="sr-only">{" "}{copy.pricing.Pricing.span1}</span>
          </AppLink>
        </p>
      </DocSection>

      <DocSection label={STOPS[2].label} title={copy.pricing.Pricing.DocSection_title3}>
        <div className="max-w-3xl" data-faq>
          {faq.map((item) => (
            <details key={item.q} className="border-b border-line">
              <summary className="flex min-h-11 cursor-pointer items-center py-2 font-bold t-body">{item.q}</summary>
              <p className="pb-3 t-body">{item.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-4">
          <AppLink href={site.contactHref} className="link">{copy.pricing.Pricing.AppLink3}</AppLink>
        </p>
      </DocSection>
    </DocShell>
  );
}
