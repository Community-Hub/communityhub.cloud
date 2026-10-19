import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLink } from "@/components/app-link";
import { DocSection, DocShell, Shot, Split } from "@/components/doc";
import { ChevronDown } from "lucide-react";
import { GuardedEmbed } from "@/components/guarded-embed";
import { TabRow, TabPager, tabPanel } from "@/components/tab-row";
import { demoBringNotes, demoChanges, demoReads, demoSteps, demos } from "@/lib/content";
import { site } from "@/lib/site";
import { useSwipe } from "@/lib/use-swipe";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
const STOPS = pc.demos.STOPS;

export const Route = createFileRoute("/demos")({
  component: Demos,
  head: () => ({
    meta: [{ title: pc.meta.demos.title }],
  }),
});

type Quote = { text: string; org?: string };

/** A quote on its own: no name, no portrait. The credit names the organization only. */
function Quoted({ quote }: { quote: Quote }) {
  return (
    <figure className="border-l-2 border-line pl-3">
      <blockquote className="t-small">“{quote.text}”</blockquote>
      {quote.org && <figcaption className="mt-1 t-small font-bold text-ink/80">{quote.org}</figcaption>}
    </figure>
  );
}

/** A short list of concrete lines. On a phone only the first `phone` show, so the screen fits above the Next button. */
function Lines({ lines, phone = lines.length }: { lines: readonly string[]; phone?: number }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {lines.map((line, i) => (
        <li key={line} >
          {line}
        </li>
      ))}
    </ul>
  );
}

/** One outlined card that a sideways swipe pages, like the place card above. */
function Card({ onSwipe, panel, children }: { onSwipe: (dir: number) => void; panel: ReturnType<typeof tabPanel>; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const swipeRef = useRef(onSwipe);
  swipeRef.current = onSwipe;
  useSwipe(ref, (dir) => swipeRef.current(dir));
  return (
    <div ref={ref} {...panel} data-swipe-own style={{ touchAction: "pan-y pinch-zoom" }} className="mt-3 rounded-md border border-line bg-paper p-2.5 md:p-5">
      {children}
    </div>
  );
}

type Item = { id: string; name: string; image?: string; alt?: string; lines: readonly string[]; quote?: Quote };

/** A link row, one card and a < > pager over a list of items: lines left, picture (or the quote) right. */
function ItemCards({ label, noun, items }: { label: string; noun: string; items: readonly Item[] }) {
  const [at, setAt] = useState(0);
  const pick = (next: number) => setAt((next + items.length) % items.length);
  const item = items[at];
  return (
    <>
      <TabRow idBase={`items-${noun}`} label={label} noun={noun} items={items} at={at} onPick={pick} />
      <Card onSwipe={(dir) => pick(at + dir)} panel={tabPanel(`items-${noun}`, item.id)}>
        <Split
          mediaFirst
          media={item.image ? <Shot src={item.image} alt={item.alt ?? ""} className="mx-auto md:mx-0" /> : item.quote ? <Quoted quote={item.quote} /> : null}
        >
          <Lines lines={item.lines} phone={item.image ? 3 : 2} />
        </Split>
        <TabPager noun={noun} at={at} onPick={pick} />
      </Card>
    </>
  );
}

function Demos() {
  const [id, setId] = useState(demos[0].id);
  // A link like /demos#oberlin opens that place, on load and when the hash changes in the page.
  useEffect(() => {
    const read = () => {
      const hash = window.location.hash.replace("#", "");
      if (demos.some((demo) => demo.id === hash)) setId(hash);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  const at = Math.max(0, demos.findIndex((item) => item.id === id));
  const demo = demos[at];
  const pick = (next: number) => {
    const item = demos[(next + demos.length) % demos.length];
    setId(item.id);
    history.replaceState(null, "", `#${item.id}`);
  };
  // A sideways swipe on the card moves between places, like the other sliders.
  const figureRef = useRef<HTMLElement>(null);
  const pickRef = useRef(pick);
  pickRef.current = pick;
  const atRef = useRef(at);
  atRef.current = at;
  useSwipe(figureRef, (dir) => pickRef.current(atRef.current + dir));
  // The note names the toolkit; make that name a link to the page.
  const [before, after] = demo.note.split("teacher toolkit");

  return (
    <DocShell stops={STOPS}>
      <DocSection label={pc.demos.TITLE} title={pc.demos.TITLE} as="h1" lede={pc.demos.LEDE} cut={14} minShot={10}>
        <TabRow idBase="demo-places" label={copy.demos.Demos.TabRow_label1} noun="place" items={demos} at={at} onPick={pick} />
        <figure ref={figureRef} {...tabPanel("demo-places", demo.id)} data-swipe-own style={{ touchAction: "pan-y pinch-zoom" }} className="mt-3 overflow-hidden rounded-md border border-line bg-paper">
          <figcaption className="flex flex-wrap items-center justify-between gap-x-3 border-b border-line px-4 py-1">
            <b className="hidden md:inline">{demo.title}</b>
            <AppLink href={demo.visit.href} className="link">
              {demo.visit.label}
            </AppLink>
          </figcaption>
          {demo.embed ? (
            <GuardedEmbed
              key={demo.id}
              src={demo.embed}
              title={`${demo.name} live dashboard`}
              narrowBelow={640}
              wideWidth={1180}
              className="h-[max(10rem,calc(100dvh-29rem))] bg-paper md:h-(--shot-h)"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-paper via-paper/90 to-transparent pt-4 pb-1 text-xs font-bold text-pine"
              >
                <ChevronDown className="size-4" strokeWidth={2.5} />{" "}{copy.demos.Demos.span1}</span>
            </GuardedEmbed>
          ) : (
            <img loading="lazy" decoding="async" src={demo.image} alt={demo.alt} className="block h-[max(10rem,calc(100dvh-29rem))] w-full bg-paper object-contain md:h-(--shot-h)" />
          )}
          {/* On a phone the next screen, Who uses it, carries each place's facts, so the dashboard gets the room. */}
          <p className="mt-2 hidden border-t border-line px-4 py-2 t-small md:block md:py-4">
            {before}
            {after !== undefined && (
              <>
                <AppLink href={copy.demos.Demos.AppLink_href1} className="font-bold text-pine underline">{copy.demos.Demos.AppLink1}</AppLink>
                {after}
              </>
            )}
          </p>
          <TabPager noun="place" at={at} onPick={pick} />
        </figure>
      </DocSection>

      {/* Who uses it: the same four places, with a photo, a few lines and a partner quote. */}
      <DocSection label={STOPS[1].label} title={STOPS[1].label} cut={9}>
        <TabRow idBase="demo-who" label={copy.demos.Demos.TabRow_label2} noun="place" items={demos} at={at} onPick={pick} />
        <Card onSwipe={(dir) => pick(at + dir)} panel={tabPanel("demo-who", demo.id)}>
          <Split mediaFirst media={<Shot src={demo.photo.src} alt={demo.photo.alt} className="mx-auto max-md:hidden md:mx-0" />}>
            <Lines lines={demo.facts} phone={2} />
            <Quoted quote={demo.quote} />
          </Split>
          <TabPager noun="place" at={at} onPick={pick} />
        </Card>
      </DocSection>

      <DocSection label={STOPS[2].label} title={STOPS[2].label} cut={9}>
        <ItemCards label={copy.demos.Demos.ItemCards_label1} noun="item" items={demoReads} />
      </DocSection>

      <DocSection label={STOPS[3].label} title={STOPS[3].label} cut={9}>
        <ItemCards label={copy.demos.Demos.ItemCards_label2} noun="outcome" items={demoChanges} />
        <p className="mt-3 t-body">
          <AppLink href={copy.demos.Demos.AppLink_href2} className="link">{copy.demos.Demos.AppLink2}</AppLink>
        </p>
      </DocSection>

      <DocSection label={STOPS[4].label} title={STOPS[4].label} cut={6}>
        <Split media={<Shot src={copy.demos.Demos.Shot_src1} alt={copy.demos.Demos.Shot_alt1} className="max-md:hidden" />}>
          <p className="font-bold">{copy.demos.Demos.p1}</p>
          <ol className="list-decimal space-y-1 pl-5 short:space-y-0 short:leading-snug">
            {demoSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {demoBringNotes.map((note) => (
            <p key={note} className="short:leading-snug">{note}</p>
          ))}
          <p>
            <AppLink href={site.contactHref} className="link">{copy.demos.Demos.AppLink3}</AppLink>
          </p>
        </Split>
      </DocSection>
    </DocShell>
  );
}
