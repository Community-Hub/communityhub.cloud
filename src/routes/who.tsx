import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AppLink } from "@/components/app-link";
import { cn } from "@/lib/utils";
import { DocSection, DocShell, Shot, Split } from "@/components/doc";
import { FrameSlider } from "@/components/product-section";
import { TabRow, tabPanel } from "@/components/tab-row";
import { site } from "@/lib/site";
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

/** True on a short phone, where the text alone fills a screen and the pictures need one of their own. */
const SHORT_PHONE = "(max-width: 767px) and (max-height: 700px)";
function useShortPhone() {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(SHORT_PHONE);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(SHORT_PHONE).matches,
    () => false,
  );
}

function Who() {
  const short = useShortPhone();
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

  const stops = short ? [STOPS[0], { id: "pictures", label: "Pictures" }, STOPS[1]] : STOPS;
  // The example screen shows the last photograph of this audience's slider (a live embed has none).
  const examplePhoto = [...stop.frames].reverse().find((f) => f.src && !f.embed);
  const media = <FrameSlider key={stop.id} frames={stop.frames} />;
  const text = (
    <>
      {stop.opening && <p className="font-bold max-md:t-small max-md:font-bold short:t-small">{stop.opening}</p>}
      <p data-who-problem className="max-md:t-small short:t-small">{stop.problem}</p>
      <ul className="divide-y divide-pine/15 border-y border-pine/15" aria-label={copy.who.Who.ul_aria_label1}>
        {stop.products.map((p) => (
          <li key={`${p.href}-${p.name}`} className="relative py-1.5 short:py-1">
            <AppLink href={p.href} className="link max-md:min-h-0 max-md:after:absolute max-md:after:inset-0 short:min-h-0 short:after:absolute short:after:inset-0">
              {p.name}
            </AppLink>
            <p className="t-small text-ink/80 max-md:leading-snug">{p.line}</p>
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <DocShell stops={stops}>
      <DocSection label={STOPS[0].label} title={pc.who.TITLE} as="h1" cut={15} minShot={10}>
        {tabs("who-story")}
        <div ref={cardRef} {...tabPanel("who-story", stop.id)} data-swipe-own style={{ touchAction: "pan-y pinch-zoom" }} data-who-stop={stop.id} className="mt-2 max-md:[--card-media-h:7rem] md:mt-3 md:[--card-media-h:clamp(8rem,calc(100dvh-26rem),30rem)]">
          {short ? <div className="space-y-3 t-body">{text}</div> : <Split media={media}>{text}</Split>}
        </div>
      </DocSection>

      {short && (
        <DocSection label={copy.who.Who.DocSection_label1} title={copy.who.Who.DocSection_title1}>
          {tabs("who-pictures")}
          <div {...tabPanel("who-pictures", stop.id)} className="mt-3 [--card-media-h:20rem]">{media}</div>
        </DocSection>
      )}

      <DocSection label={STOPS[1].label} title={STOPS[1].label} lede={stop.description}>
        {tabs("who-example")}
        <div {...tabPanel("who-example", stop.id)} className={cn("mt-3 md:items-start md:gap-8", examplePhoto && "md:grid md:grid-cols-[minmax(0,18rem)_minmax(0,48rem)] short:md:block")}>
          <div className="max-w-3xl md:order-last space-y-3 t-body short:space-y-2 short:t-small">
          <p data-who-example>{stop.example}</p>
          {stop.involve && (
            <>
              <p className="font-bold">{copy.who.Who.p1}</p>
              <p data-who-involve>{stop.involve}</p>
            </>
          )}
          <p>{stop.cta}</p>
          <p>
            <AppLink href={site.contactHref} className="link">{copy.who.Who.AppLink1}</AppLink>
          </p>
          </div>
          {examplePhoto && <Shot src={examplePhoto.src!} alt={examplePhoto.alt ?? ""} className="max-md:hidden short:hidden" />}
        </div>
      </DocSection>
    </DocShell>
  );
}
