import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLink } from "@/components/app-link";
import { cn } from "@/lib/utils";
import { DocSection, DocShell, Shot, Split } from "@/components/doc";
import { FrameSlider } from "@/components/product-section";
import { TabRow, tabPanel } from "@/components/tab-row";
import { whoStops } from "@/lib/who";
import { useSwipe } from "@/lib/use-swipe";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
const STOPS = pc.who.STOPS;

export const Route = createFileRoute("/who")({
  component: Who,
  head: () => ({
    meta: [{ title: pc.meta.who.title }],
  }),
});

function Who() {
  const [id, setId] = useState(whoStops[0].id);
  // A link like /who#schools opens that audience, on load and when the hash changes in the page.
  useEffect(() => {
    const read = () => {
      const hash = window.location.hash.replace("#", "");
      if (whoStops.some((stop) => stop.id === hash)) setId(hash);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  const at = Math.max(0, whoStops.findIndex((stop) => stop.id === id));
  const stop = whoStops[at];
  const pick = (next: number) => {
    const item = whoStops[(next + whoStops.length) % whoStops.length];
    setId(item.id);
    history.replaceState(null, "", `#${item.id}`);
  };
  const pickRef = useRef(pick);
  pickRef.current = pick;
  const atRef = useRef(at);
  atRef.current = at;
  const cardRef = useRef<HTMLDivElement>(null);
  useSwipe(cardRef, (dir) => pickRef.current(atRef.current + dir));

  const tabs = (idBase: string) => <TabRow idBase={idBase} label={copy.who.Who.TabRow_label1} noun="audience" items={whoStops} at={at} onPick={pick} arrows={false} />;

  // The example screen shows the last photograph of this audience's slider (a live embed has none).
  const examplePhoto = [...stop.frames].reverse().find((f) => f.src && !f.embed);
  const media = <FrameSlider key={stop.id} frames={stop.frames} />;
  const text = (
    <>
      {stop.opening && <p className="font-bold">{stop.opening}</p>}
      <p data-who-problem>{stop.problem}</p>
      <ul className="divide-y divide-pine/15 border-y border-pine/15" aria-label={copy.who.Who.ul_aria_label1}>
        {stop.products.map((p) => (
          <li key={`${p.href}-${p.name}`} className="relative py-2">
            <AppLink href={p.href} className="link">
              {p.name}
            </AppLink>
            <p className="t-small text-ink/80">{p.line}</p>
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <DocShell stops={STOPS}>
      <DocSection label={STOPS[0].label} title={pc.who.TITLE} as="h1" cut={15} minShot={10}>
        {tabs("who-story")}
        <div ref={cardRef} {...tabPanel("who-story", stop.id)} data-swipe-own style={{ touchAction: "pan-y pinch-zoom" }} data-who-stop={stop.id} className="mt-4 [--card-media-h:24rem]">
          <Split media={media}>{text}</Split>
        </div>
      </DocSection>

      <DocSection label={STOPS[1].label} title={STOPS[1].label} lede={stop.description}>
        {tabs("who-example")}
        <div {...tabPanel("who-example", stop.id)} className={cn("mt-4 grid gap-6 md:items-start md:gap-8", examplePhoto && "md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]")}>
          <div className="max-w-3xl space-y-3 t-body">
            <p data-who-example>{stop.example}</p>
            {stop.involve && (
              <>
                <p className="font-bold">{copy.who.Who.p1}</p>
                <p data-who-involve>{stop.involve}</p>
              </>
            )}
            <p>{stop.cta}</p>
          </div>
          {examplePhoto && <Shot src={examplePhoto.src!} alt={examplePhoto.alt ?? ""} />}
        </div>
      </DocSection>
    </DocShell>
  );
}
