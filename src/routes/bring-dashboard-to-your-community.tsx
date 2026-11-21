import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs, SectionLinks } from "@/components/breadcrumbs";
import { ArrowUp, ArrowUpRight, ChevronDown } from "lucide-react";
import { Fragment, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode, type RefObject } from "react";
import { AppLink } from "@/components/app-link";
import { ClosingBand } from "@/components/implementations/closing-band";
import { SiteFooter } from "@/components/site-footer";
import { bringGuide, bringGuideCopy, type GuideBlock, type GuideFigure, type GuideSection } from "@/lib/bring-guide";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bring-dashboard-to-your-community")({
  // The guide is long, so its text travels with this page only. The browser tab title and the search description
  // come from it too, through the loader, so they always match the text.
  loader: async () => {
    const guide = await import("@/lib/bring-guide");
    return { title: guide.bringGuide.title, description: guide.bringGuideSummary() };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `${loaderData.title} — Community Hub` }, { name: "description", content: loaderData.description }]
      : [],
  }),
  component: BringGuidePage,
});

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scroll an element into view and put the keyboard there, as a jump inside the page should. */
function jumpTo(el: HTMLElement, block: ScrollLogicalPosition = "start") {
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block });
  el.focus({ preventScroll: true });
}

/** A plain left click, which the page handles itself; anything else (new tab, new window) is the browser's. */
const plainClick = (event: MouseEvent) =>
  !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

const textLink =
  "font-medium text-leaf underline decoration-leaf/35 underline-offset-[0.2em] transition-colors duration-150 hover:text-pine hover:decoration-current";

/* ------------------------------------------------------------------ Text */

const LINK = /\[([^\]]+)\]\(((?:https?:|mailto:|#|\/)[^)\s]*)\)/g;

/** The last word of a link and its arrow stay on one line. */
function WithArrow({ label }: { label: string }) {
  const cut = label.lastIndexOf(" ") + 1;
  return (
    <>
      {label.slice(0, cut)}
      <span className="whitespace-nowrap">
        {label.slice(cut)}
        <ArrowUpRight className="ml-0.5 inline-block size-[0.85em] align-[-0.05em] opacity-70" aria-hidden />
      </span>
    </>
  );
}

/** Guide text with its links: citations jump to Literature Cited, other sites open in a new tab. */
function GuideText({ text, onCite }: { text: string; onCite?: (ref: string, from: HTMLElement) => void }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const at = match.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    const [whole, label, href] = match;
    if (href.startsWith("#")) {
      const ref = href.slice(1);
      parts.push(
        <a
          key={at}
          href={href}
          className={cn(textLink, "rounded-sm focus:bg-lime-pale")}
          onClick={(event) => {
            const target = document.getElementById(ref);
            if (!plainClick(event) || !target) return;
            event.preventDefault();
            onCite?.(ref, event.currentTarget);
            jumpTo(target, "center");
          }}
        >
          {label}
        </a>,
      );
    } else if (href.startsWith("mailto:")) {
      parts.push(
        <a key={at} href={href} className={textLink}>
          {label}
        </a>,
      );
    } else if (href.startsWith("/")) {
      parts.push(
        <AppLink key={at} href={href} className={textLink}>
          {label}
        </AppLink>,
      );
    } else {
      parts.push(
        <a key={at} href={href} target="_blank" rel="noopener" className={textLink}>
          <WithArrow label={label} />
          <span className="sr-only"> {bringGuideCopy.newTab}</span>
        </a>,
      );
    }
    last = at + whole.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

/* ------------------------------------------------------------------ Figures */

function Figure({ figure }: { figure: GuideFigure }) {
  const img = useRef<HTMLImageElement>(null);
  // Whether the page shows the figure smaller than it is, so the full-size file is worth a link.
  const [scaled, setScaled] = useState(figure.width > 680);
  useEffect(() => {
    const el = img.current;
    if (!el) return;
    const check = () => {
      if (el.clientWidth > 0) setScaled(el.clientWidth < figure.width * 0.9);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [figure.width]);
  const parts = /^(Fig\. \d+:?)\s+([\s\S]*)$/.exec(figure.caption);
  const name = parts ? parts[1].replace(/:$/, "") : "";
  const picture = (
    <img
      ref={img}
      src={figure.src}
      alt={figure.alt}
      width={figure.width}
      height={figure.height}
      loading="lazy"
      decoding="async"
      className="block h-auto max-w-full"
    />
  );
  // The figure at its own size (never enlarged), up to the full width of the column; the caption keeps the text's measure.
  return (
    <figure className="my-10 md:my-14">
      <div className="w-fit max-w-full overflow-hidden rounded-xl border border-line bg-paper">
        {scaled ? (
          <a href={figure.original} target="_blank" rel="noopener" tabIndex={-1} className="block cursor-zoom-in">
            {picture}
          </a>
        ) : (
          picture
        )}
      </div>
      <figcaption className="mt-3.5 max-w-[38.25rem] text-[0.9375rem] leading-relaxed text-ink/75">
        {parts ? (
          <>
            <span className="font-semibold text-ink">{parts[1]}</span> <GuideText text={parts[2]} />
          </>
        ) : (
          <GuideText text={figure.caption} />
        )}
        {scaled && (
          <a href={figure.original} target="_blank" rel="noopener" className={cn(textLink, "mt-1.5 block w-fit")}>
            <WithArrow label={bringGuideCopy.fullSize} />
            <span className="sr-only">
              {name ? `: ${name}` : ""} {bringGuideCopy.newTab}
            </span>
          </a>
        )}
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ Blocks and sections */

const para = "mt-5 max-w-[34em] first:mt-0";

/** Paragraphs and figures. Paragraphs that start "1. ", "2. " in a row are one numbered list. */
function Blocks({ blocks, onCite }: { blocks: GuideBlock[]; onCite: (ref: string, from: HTMLElement) => void }) {
  const out: ReactNode[] = [];
  let list: { n: number; text: string }[] = [];
  const flush = (key: string) => {
    if (list.length === 0) return;
    out.push(
      <ol
        key={key}
        start={list[0].n}
        className="mt-5 max-w-[34em] list-decimal space-y-3 pl-[1.6em] marker:font-semibold marker:text-pine/70 first:mt-0"
      >
        {list.map((item) => (
          <li key={item.n} className="pl-1">
            <GuideText text={item.text} onCite={onCite} />
          </li>
        ))}
      </ol>,
    );
    list = [];
  };
  blocks.forEach((block, i) => {
    if (block.type === "p") {
      const numbered = /^(\d+)\.\s+([\s\S]*)$/.exec(block.text);
      if (numbered) {
        list.push({ n: Number(numbered[1]), text: numbered[2] });
        return;
      }
      flush(`list-${i}`);
      out.push(
        <p key={i} className={para}>
          <GuideText text={block.text} onCite={onCite} />
        </p>,
      );
      return;
    }
    flush(`list-${i}`);
    out.push(<Figure key={i} figure={block} />);
  });
  flush("list-end");
  return <>{out}</>;
}

const HEADING: Record<GuideSection["level"], string> = {
  2: "mt-20 mb-6 text-[clamp(1.75rem,2.7vw,2.25rem)] leading-[1.15] text-pine md:mt-24",
  3: "mt-14 mb-4 text-[clamp(1.375rem,1.9vw,1.625rem)] leading-[1.22] text-pine md:mt-16",
  4: "mt-10 mb-3 text-[1.1875rem] leading-snug text-ink md:text-[1.25rem]",
};

function SectionHeading({ section }: { section: GuideSection }) {
  const Tag = `h${section.level}` as "h2" | "h3" | "h4";
  return (
    <Tag id={section.id} tabIndex={-1} className={cn("max-w-[40.5rem] scroll-mt-[calc(var(--header-h)+1.5rem)] focus:outline-none", HEADING[section.level])}>
      {section.number && (
        <span className="mr-[0.4em] font-medium tabular-nums text-pine/65">{section.number}</span>
      )}
      {section.title}
    </Tag>
  );
}

/* ------------------------------------------------------------------ Contents */

type Entry = { id: string; number: string | null; title: string; children: Entry[] };

/** The overview and the sections down to the third level; a fourth-level section counts as its parent. */
function buildContents() {
  const entries: Entry[] = [{ id: bringGuide.overview.id, number: null, title: bringGuide.overview.toc, children: [] }];
  const shownAs: Record<string, string> = { [bringGuide.overview.id]: bringGuide.overview.id };
  let top: Entry | undefined;
  let second: Entry | undefined;
  for (const section of bringGuide.sections) {
    const entry: Entry = { id: section.id, number: section.number, title: section.title, children: [] };
    if (section.level === 2) {
      entries.push(entry);
      top = entry;
      second = undefined;
      shownAs[section.id] = section.id;
    } else if (section.level === 3) {
      (top?.children ?? entries).push(entry);
      second = entry;
      shownAs[section.id] = section.id;
    } else {
      shownAs[section.id] = second?.id ?? top?.id ?? section.id;
    }
  }
  return { entries, shownAs };
}

const CONTENTS = buildContents();
const SECTION_IDS = [bringGuide.overview.id, ...bringGuide.sections.map((s) => s.id)];

/** The section being read: the last one whose heading has passed a line near the top of the screen. */
function useCurrentSection(ids: string[]) {
  const [current, setCurrent] = useState(ids[0]);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = Math.max(140, window.innerHeight * 0.3);
      let found = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) found = id;
        else break;
      }
      setCurrent(found);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ids]);
  return current;
}

function ContentsList({
  entries,
  current,
  roomy = false,
  nested = false,
}: {
  entries: Entry[];
  current?: string;
  /** Larger lines for a finger (the phone disclosure); the rail beside the text is compact so it fits a laptop screen. */
  roomy?: boolean;
  nested?: boolean;
}) {
  return (
    <ol className={nested ? "mt-0.5 mb-1 ml-3 border-l border-line pl-2" : "space-y-0.5"}>
      {entries.map((entry) => {
        const here = entry.id === current;
        return (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={here ? "location" : undefined}
              onClick={(event) => {
                const target = document.getElementById(entry.id);
                if (!plainClick(event) || !target) return;
                event.preventDefault();
                jumpTo(target);
              }}
              className={cn(
                "flex gap-2 rounded-lg px-2.5 text-ink/75 transition-colors duration-150 hover:bg-field hover:text-pine",
                roomy ? "min-h-11 items-center py-1.5 text-[0.9375rem] leading-snug" : "py-1 text-[0.875rem] leading-[1.35]",
                here && "bg-lime-pale font-semibold text-pine hover:bg-lime-pale",
              )}
            >
              {entry.number && <span className="shrink-0 font-medium tabular-nums text-ink/65">{entry.number}</span>}
              <span className="min-w-0">{entry.title}</span>
            </a>
            {entry.children.length > 0 && (
              <ContentsList entries={entry.children} current={current} roomy={roomy} nested />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Fades whichever end of a scrolling box has more beyond it. */
function useScrollFade(box: RefObject<HTMLElement | null>) {
  const [fade, setFade] = useState({ top: false, bottom: false });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const top = el.scrollTop > 2;
      const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
      setFade((was) => (was.top === top && was.bottom === bottom ? was : { top, bottom }));
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [box]);
  if (!fade.top && !fade.bottom) return undefined;
  const mask = `linear-gradient(to bottom, ${fade.top ? "transparent, black 2rem" : "black"}, ${fade.bottom ? "black calc(100% - 2.5rem), transparent" : "black"})`;
  return { maskImage: mask, WebkitMaskImage: mask } satisfies CSSProperties;
}

/** Beside the text on a wide screen: the contents stay in view and mark the section being read. */
function ContentsRail({ current }: { current: string }) {
  const box = useRef<HTMLDivElement>(null);
  const fade = useScrollFade(box);
  // Keep the marked line inside the rail when the rail is taller than the screen.
  useEffect(() => {
    const el = box.current;
    const mark = el?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!el || !mark || el.scrollHeight <= el.clientHeight) return;
    const outer = el.getBoundingClientRect();
    const inner = mark.getBoundingClientRect();
    if (inner.top < outer.top + 8 || inner.bottom > outer.bottom - 8) el.scrollTop += inner.top - outer.top - outer.height / 3;
  }, [current]);
  return (
    <nav aria-labelledby="guide-contents" className="sticky top-[calc(var(--header-h)+2rem)]">
      <a
        href={`#${bringGuide.overview.id}`}
        onClick={(event) => {
          const target = document.getElementById(bringGuide.overview.id);
          if (!plainClick(event) || !target) return;
          event.preventDefault();
          jumpTo(target);
        }}
        className="sr-only rounded-full bg-pine px-4 py-2 font-semibold text-white focus:not-sr-only focus:mb-3 focus:inline-block"
      >
        {bringGuideCopy.skipToText}
      </a>
      <h2 id="guide-contents" className="px-2.5 text-sm font-semibold tracking-normal text-ink/60">
        {bringGuideCopy.contents}
      </h2>
      <div ref={box} style={fade} className="scroll-visible mt-3 max-h-[calc(100dvh-var(--header-h)-6.5rem)] pr-1 pb-1">
        <ContentsList entries={CONTENTS.entries} current={current} />
      </div>
    </nav>
  );
}

/** Above the text on a phone or tablet: the contents behind one native disclosure. */
function ContentsDisclosure() {
  return (
    <details id="contents" className="group mb-10 scroll-mt-[calc(var(--header-h)+1rem)] rounded-2xl border border-line bg-paper lg:hidden">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 font-semibold text-pine [&::-webkit-details-marker]:hidden">
        {bringGuideCopy.contents}
        <ChevronDown
          className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden
        />
      </summary>
      <nav aria-label={bringGuideCopy.contents} className="border-t border-line px-2 pt-2 pb-3">
        <ContentsList entries={CONTENTS.entries} roomy />
      </nav>
    </details>
  );
}

/** On a phone or tablet, between sections: back up to the contents. */
function BackToContents() {
  return (
    <p className="mt-12 lg:hidden">
      <a
        href="#contents"
        onClick={(event) => {
          const details = document.getElementById("contents") as HTMLDetailsElement | null;
          if (!plainClick(event) || !details) return;
          event.preventDefault();
          details.open = true;
          details.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
          details.querySelector("summary")?.focus({ preventScroll: true });
        }}
        className="link t-small"
      >
        <ArrowUp className="size-4" aria-hidden />
        {bringGuideCopy.backToContents}
      </a>
    </p>
  );
}

/* ------------------------------------------------------------------ Page */

function BringGuidePage() {
  const g = bringGuide;
  const t = bringGuideCopy;
  const current = useCurrentSection(SECTION_IDS);
  // The citation the reader followed into Literature Cited, so they can go back to it.
  const [cited, setCited] = useState<{ ref: string; from: HTMLElement } | null>(null);
  const onCite = (ref: string, from: HTMLElement) => setCited({ ref, from });
  const contact = copy.siteFooter.FooterChapter;

  return (
    <>
      <main id="main" className="pt-(--header-h)">
        <div className="wrap pt-[clamp(2.5rem,3.6vw,3.25rem)]">
          <Breadcrumbs className="mb-6" />
          <h1 className="t-h1 max-w-[15em]">{g.title}</h1>
          {/* One line on a wide screen; on a phone each part takes its own line, with no stray separators. */}
          <p className="mt-6 flex flex-wrap items-center gap-x-2.5 t-body text-ink/70 max-sm:flex-col max-sm:items-start">
            <span>{g.byline}</span>
            <span aria-hidden className="text-ink/35 max-sm:hidden">
              ·
            </span>
            <span>{g.revised}</span>
            <span aria-hidden className="text-ink/35 max-sm:hidden">
              ·
            </span>
            <a href={g.pdf} target="_blank" rel="noopener" className="link max-sm:mt-1">
              {t.pdf}
              <ArrowUpRight className="size-4" aria-hidden />
              <span className="sr-only"> {t.newTab}</span>
            </a>
          </p>
          <SectionLinks className="mt-3" />
        </div>

        <div className="wrap mt-[clamp(2rem,5vw,4rem)] pb-(--section-y) lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[19rem_minmax(0,1fr)] xl:gap-16">
          <aside className="hidden lg:block">
            <ContentsRail current={current} />
          </aside>

          <article className="min-w-0 text-[1.0625rem] leading-[1.7] text-ink/90 md:text-[1.125rem]">
            <ContentsDisclosure />
            <div id={g.overview.id} tabIndex={-1} className="scroll-mt-[calc(var(--header-h)+2rem)] focus:outline-none">
              <Blocks blocks={g.overview.blocks} onCite={onCite} />
            </div>

            {g.sections.map((section, n) => {
              const before = n === 0 ? g.overview.blocks : g.sections[n - 1].blocks;
              const offerContents = section.level <= 3 && before.length > 0;
              return (
                <Fragment key={section.id}>
                  {offerContents && <BackToContents />}
                  <SectionHeading section={section} />
                  {section.id === "literature-cited" ? (
                    <ol className="mt-6 max-w-[42rem] space-y-2 text-[0.9375rem] leading-relaxed text-ink/80 md:text-base">
                      {g.literature.map((ref) => {
                        const from = cited?.ref === ref.id ? cited.from : null;
                        const followed = from !== null;
                        return (
                          <li
                            key={ref.id}
                            id={ref.id}
                            tabIndex={-1}
                            className={cn(
                              "-ml-2 scroll-mt-[calc(var(--header-h)+1.5rem)] rounded-xl py-1.5 pr-3 pl-8 -indent-6 transition-colors duration-500 focus:outline-none motion-reduce:transition-none",
                              followed && "bg-lime-pale",
                            )}
                          >
                            <GuideText text={ref.text} />
                            {from && (
                              <span className="mt-1 block indent-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCited(null);
                                    if (from.isConnected) jumpTo(from, "center");
                                  }}
                                  className="link"
                                >
                                  <ArrowUp className="size-4" aria-hidden />
                                  {t.backToText}
                                </button>
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <Blocks blocks={section.blocks} onCite={onCite} />
                  )}
                </Fragment>
              );
            })}
            <BackToContents />
          </article>
        </div>

        {/* The site's closing band, with All implementations where it would link back to this guide. */}
        <ClosingBand id="contact" title={contact.h21} link={{ href: "/implementations", label: copy.home.Audiences.AppLink1 }}>
          <p className="mt-5 text-xl font-semibold text-lime">{contact.p1}</p>
          <p className="mt-3 max-w-xl t-body text-white/82">{contact.p2}</p>
        </ClosingBand>
      </main>
      <SiteFooter />
    </>
  );
}
