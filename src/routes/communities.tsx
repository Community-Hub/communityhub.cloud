import { createFileRoute } from "@tanstack/react-router";
import { Audiences, ContactBand } from "@/components/home";
import { SiteFooter } from "@/components/site-footer";
import { pc } from "@/lib/page-content";

// The kinds of community Community Hub serves. It sits under Bring Dashboard to Your Community with the implementation
// guide and Pricing (John and Maddie, 19 Nov 2026, 55:14-56:18); until then it was the home's "Who it's for" section.
const HERE = "/communities";
const label = () =>
  pc.siteHeader.NAV.flatMap((item) => item.children ?? []).find((child) => child.href === HERE)?.label ?? "Communities";

export const Route = createFileRoute("/communities")({
  component: Communities,
  head: () => ({
    meta: [
      { title: pc.meta.communities.title },
      { name: "description", content: pc.meta.communities.description },
    ],
  }),
});

function Communities() {
  return (
    <div className="bg-paper text-ink">
      <main id="main" className="deck">
        <Audiences title={label()} lede={pc.communities.lede} />
        <ContactBand />
      </main>
      <SiteFooter />
    </div>
  );
}
