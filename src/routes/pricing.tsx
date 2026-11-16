import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Check, Plus } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { DocSection, DocShell } from "@/components/doc";
import { quoteHref } from "@/lib/links";
import { site } from "@/lib/site";
import { bundles, faq, services } from "@/lib/pricing";

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
      <h2 className="t-h3">{`${bundle.name} bundle`}</h2>
      <ul className="mt-5 space-y-2.5">
        {bundle.items.map((item) => (
          <li key={item} className="flex gap-3 t-body">
            <Check className="mt-1 size-4 shrink-0 text-leaf" strokeWidth={2.5} aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {bundle.note && <p className="mt-4 text-sm text-ink/65">{bundle.note}</p>}
      <div className="mt-auto pt-8">
        <p className="text-sm font-semibold text-ink/70">{copy.pricing.Pricing.p1}</p>
        <AppLink href={quoteHref(`${bundle.name} bundle`)} className="btn-secondary mt-3">
          {copy.pricing.Pricing.AppLink1}
          <span className="sr-only">{` about the ${bundle.name} bundle`}</span>
        </AppLink>
      </div>
    </>
  );
}

import { consumeNavigationTarget } from "@/lib/use-hash-stops";

function Pricing() {
  // A link that names a bundle (/pricing#data) brings that bundle into view.
  useEffect(() => {
    const show = (target: string) => {
      if (!bundles.some((bundle) => bundle.id === target)) return;
      document.querySelector(`[data-bundle-card="${target}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    const initial = consumeNavigationTarget();
    if (initial) requestAnimationFrame(() => show(initial));
    const onTarget = (event: Event) => {
      const target = (event as CustomEvent<string>).detail;
      consumeNavigationTarget();
      if (target) show(target);
    };
    window.addEventListener("ch:target", onTarget);
    return () => window.removeEventListener("ch:target", onTarget);
  }, []);

  return (
    <DocShell stops={STOPS}>
      <DocSection label={STOPS[0].label} title={copy.pricing.Pricing.DocSection_title1} as="h1" lede={site.pricingLede}>
        <ul className="home-bundles" data-bundles>
          {bundles.map((item) => (
            <li key={item.id} data-bundle-card={item.id} className="home-bundle scroll-mt-24">
              <BundleCard bundle={item} />
            </li>
          ))}
        </ul>
      </DocSection>

      <DocSection label={STOPS[1].label} title={copy.pricing.Pricing.DocSection_title2} lede="Connect your data and explain what makes your community unique. Design services complement the Community Hub products you choose.">
        <ul className="grid max-w-5xl gap-8 md:grid-cols-2 md:gap-12" data-services>
          {services.map((service) => (
            <li key={service.id} className="border-t border-line pt-6">
              <h3 className="t-h3">{service.name}</h3>
              <p className="mt-3 t-body text-ink/80">{service.line}</p>
              <AppLink href={`/services#${service.id}`} className="link mt-3">
                Explore {service.name.toLowerCase()} <ArrowRight className="size-4" aria-hidden />
              </AppLink>
            </li>
          ))}
        </ul>
        <p className="mt-8">
          <AppLink href={quoteHref("Design services")} className="btn-secondary">
            {copy.pricing.Pricing.AppLink2}
            <span className="sr-only"> {copy.pricing.Pricing.span1}</span>
          </AppLink>
        </p>
      </DocSection>

      <DocSection label={STOPS[2].label} title={copy.pricing.Pricing.DocSection_title3}>
        <div className="max-w-3xl border-t border-line" data-faq>
          {faq.map((item) => (
            <details key={item.q} className="group border-b border-line">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 text-lg font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus className="size-5 shrink-0 text-leaf transition-transform duration-200 group-open:rotate-45" aria-hidden />
              </summary>
              <p className="max-w-2xl pb-6 t-body text-ink/80">{item.a}</p>
            </details>
          ))}
        </div>
      </DocSection>
    </DocShell>
  );
}
