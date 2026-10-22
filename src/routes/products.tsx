import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLink } from "@/components/app-link";
import { DocSection, DocShell, Shot, Split } from "@/components/doc";
import { educateBeats, empowerBeats, engageBeats } from "@/lib/content";
import { ORB_HREF, PRICING_HREF, WHO_HREF } from "@/lib/links";
import { site } from "@/lib/site";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
const BEATS = [...engageBeats, ...educateBeats, ...empowerBeats];
const GROUPS = pc.products.GROUPS;

function iconFor(id: string) {
  return BEATS.find((item) => item.id === id)?.icon ?? "";
}

function GroupBlock({ group, heading = true }: { group: (typeof GROUPS)[number]; heading?: boolean }) {
  return (
    <div className="product-directory-group">
      {heading && <h2 className="product-directory-heading border-b border-pine/30 pb-2 t-h3">{group.kicker}</h2>}
      <ul>
        {group.items.map((item) => (
          <li key={item.id} className="border-b border-pine/15">
            <AppLink href={item.href} className="flex min-h-11 items-center gap-3 py-3 short:py-1">
              <img src={iconFor(item.id)} alt="" className="size-12 shrink-0 object-contain short:size-10" />
              <span>
                <b className="block">{item.title}</b>
                <span className="block t-small text-ink/70">{item.blurb}</span>
              </span>
            </AppLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function KeepExploring() {
  return (
    <DocSection label={copy.products.KeepExploring.DocSection_label1} title={copy.products.KeepExploring.DocSection_title1} cut={5}>
      <Split media={<Shot src={copy.products.KeepExploring.Shot_src1} alt={copy.products.KeepExploring.Shot_alt1} />}>
        <ul className="space-y-3 max-md:space-y-1">
          <li><AppLink href="/services" className="link">Design services</AppLink><p className="t-small text-ink/70">Data integration, local illustrations, stories, and outreach materials.</p></li>
          <li className="relative">
            <AppLink href={ORB_HREF} className="link max-md:min-h-0 max-md:after:absolute max-md:after:inset-0">{copy.products.KeepExploring.AppLink1}</AppLink>
            <p className="t-small text-ink/70">{copy.products.KeepExploring.p1}</p>
          </li>
          <li className="relative">
            <AppLink href={copy.products.KeepExploring.AppLink_href1} className="link max-md:min-h-0 max-md:after:absolute max-md:after:inset-0">{copy.products.KeepExploring.AppLink2}</AppLink>
            <p className="t-small text-ink/70">{copy.products.KeepExploring.p2}</p>
          </li>
          <li className="relative">
            <AppLink href={WHO_HREF} className="link max-md:min-h-0 max-md:after:absolute max-md:after:inset-0">{copy.products.KeepExploring.AppLink3}</AppLink>
            <p className="t-small text-ink/70">{copy.products.KeepExploring.p3}</p>
          </li>
          <li className="relative">
            <AppLink href={PRICING_HREF} className="link max-md:min-h-0 max-md:after:absolute max-md:after:inset-0">{copy.products.KeepExploring.AppLink4}</AppLink>
            <p className="t-small text-ink/70">{copy.products.KeepExploring.p4}</p>
          </li>
          <li className="relative">
            <AppLink href={site.contactHref} className="link max-md:min-h-0 max-md:after:absolute max-md:after:inset-0">{copy.products.KeepExploring.AppLink5}</AppLink>
          </li>
        </ul>
      </Split>
    </DocSection>
  );
}

export const Route = createFileRoute("/products")({
  component: Products,
  head: () => ({
    meta: [{ title: pc.meta.products.title }],
  }),
});

function Products() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const apply = () => setPhone(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  // A phone gives each group its own screen; a laptop shows all three side by side.
  const stops = phone
    ? [
        { id: "products", label: "Products and Services" },
        ...GROUPS.slice(1).map((group) => ({ id: group.kicker.toLowerCase().replace(/\W+/g, "-"), label: group.kicker })),
        { id: "keep-exploring", label: "Keep exploring" },
      ]
    : [
        { id: "products", label: "Products and Services" },
        { id: "keep-exploring", label: "Keep exploring" },
      ];

  return (
    <DocShell stops={stops}>
      {phone ? (
        <>
          <DocSection label={copy.products.Products.DocSection_label1} title={copy.products.Products.DocSection_title1} as="h1" titleClassName="t-h2" ledeClassName="t-body" lede={pc.products.LEDE}>
            <h2 className="t-h3">{GROUPS[0].kicker}</h2>
            <GroupBlock group={GROUPS[0]} heading={false} />
            <p className="mt-4"><AppLink href="/services" className="link">Explore design services</AppLink></p>
          </DocSection>
          {GROUPS.slice(1).map((group) => (
            <DocSection key={group.kicker} label={group.kicker} title={group.kicker}>
              <GroupBlock group={group} heading={false} />
            </DocSection>
          ))}
        </>
      ) : (
        <DocSection label={copy.products.Products.DocSection_label2} title={copy.products.Products.DocSection_title2} as="h1" titleClassName="t-h2" ledeClassName="t-body" lede={pc.products.LEDE}>
          <div className="grid gap-8 md:grid-cols-3">
            {GROUPS.map((group) => (
              <GroupBlock key={group.kicker} group={group} />
            ))}
          </div>
          <p className="mt-4"><AppLink href="/services" className="link">Explore data and graphic design services</AppLink></p>
        </DocSection>
      )}
      <KeepExploring />
    </DocShell>
  );
}
