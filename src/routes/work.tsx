import { createFileRoute } from "@tanstack/react-router";
import { DocSection, DocShell, Shot, Split } from "@/components/doc";
import { FrameSlider } from "@/components/product-section";
import { WORK_CASE_FRAMES, type SlideFrame } from "@/lib/content";
import { SCHOOLS_NAME } from "@/lib/names";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
const CASES = pc.work.CASES;
const VOICES = pc.work.VOICES;

export const Route = createFileRoute("/work")({
  component: Work,
  head: () => ({
    meta: [
      { title: pc.meta.work.title },
      { name: "description", content: pc.work.LEDE },
    ],
  }),
});

function CaseMedia({ item }: { item: (typeof CASES)[number] }) {
  const more = WORK_CASE_FRAMES[item.id];
  if (!more) return <Shot src={item.poster} alt={item.alt} className="max-md:w-full md:w-auto" />;
  const first: SlideFrame = { title: item.name, caption: "", src: item.poster, alt: item.alt, fit: "contain" };
  return (
    <div className="[--card-media-h:max(8rem,calc(var(--shot-h)-3.5rem))] sm:[--card-media-h:max(8rem,calc(var(--shot-h)-5rem))] short:md:[--card-media-h:max(6rem,calc(var(--shot-h)-5rem))]">
      <FrameSlider frames={[first, ...more]} />
    </div>
  );
}

function Work() {
  const STOPS = [...CASES.map((c) => ({ id: c.id, label: c.name })), { id: "voices", label: "Voices" }];
  return (
    <DocShell stops={STOPS}>
      {CASES.map((item, n) => (
        <DocSection
          key={item.id}
          label={item.name}
          title={n === 0 ? pc.work.TITLE : item.name}
          as={n === 0 ? "h1" : "h2"}
          lede={n === 0 ? pc.work.LEDE : undefined}
          cut={n === 0 ? 18 : 11}
          minShot={8}
        >
          <Split stacked={!WORK_CASE_FRAMES[item.id]} media={<CaseMedia item={item} />}>
            <p className="t-small font-bold text-ink/70">{item.tag}</p>
            {n === 0 && <h2 className="t-h3">{item.name}</h2>}
            <p>{item.line}</p>
            <a href={item.live} target="_blank" rel="noopener" className="link inline-flex min-h-11 items-center font-bold" data-live-link>{copy.work.Work.a1}<span aria-hidden="true">{copy.work.Work.span1}</span>
              <span className="sr-only"> {item.name}{" "}{copy.work.Work.span2}</span>
            </a>
          </Split>
        </DocSection>
      ))}
      <DocSection label={copy.work.Work.DocSection_label1} title={copy.work.Work.DocSection_title1}>
        <ul className="grid gap-2 md:grid-cols-3 md:gap-3">
          {VOICES.map((v) => (
            <li key={v.org} className="min-w-0 rounded-md border border-line bg-paper p-3 md:p-4">
              <figure className="flex h-full flex-col gap-2 md:gap-3">
                <blockquote className="t-body max-md:t-small">“{v.quote}”</blockquote>
                <figcaption className="mt-auto font-bold">{v.org}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </DocSection>
    </DocShell>
  );
}
