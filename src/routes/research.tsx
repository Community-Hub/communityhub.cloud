import { createFileRoute } from "@tanstack/react-router";
import { DocSection, DocShell } from "@/components/doc";
import publicationsData from "@/data/publications.json";
import { paginate, range, useFitPages } from "@/lib/fit-pages";
import { site } from "@/lib/site";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
type Paper = {
  id: string;
  title: string;
  authors: string;
  year: number | null;
  venue: string;
  finding: string | null;
  figure: { src: string; alt: string; width: number; height: number } | null;
  drive_url: string | null;
  featured: boolean;
  url: string | null;
};

const PAPERS = publicationsData as Paper[];
/** Papers and citations per screen on a large screen, before the page is measured; the real split comes from `useFitPages`. */
const SPLITS = [2, 4, 4];
const CITE_SPLITS = [8];

const when = (p: Paper) => (p.year ? String(p.year) : "in press");
/** url first, then the Drive PDF, then an emailed request. */
function linkFor(p: Paper) {
  if (p.url) return { href: p.url, text: "Read the paper", external: true };
  if (p.drive_url) return { href: p.drive_url, text: "PDF (Drive)", external: true };
  return { href: `mailto:${site.contactEmail}?subject=${encodeURIComponent(`Paper request: ${p.title}`)}`, text: "Request the paper", external: false };
}

export const Route = createFileRoute("/research")({
  component: Research,
  head: () => ({
    meta: [
      { title: pc.meta.research.title },
      { name: "description", content: pc.research.LEDE },
    ],
  }),
});

function LinkOut({ paper, inline = false }: { paper: Paper; inline?: boolean }) {
  const l = linkFor(paper);
  return (
    <a href={l.href} className={inline ? "link inline! min-h-0 font-bold" : "link inline-flex min-h-11 items-center font-bold"} {...(l.external ? { target: "_blank", rel: "noopener" } : {})}>
      {l.text}
      {l.external && <span aria-hidden="true">{copy.research.LinkOut.span1}</span>}
      <span className="sr-only">
        : {paper.title} ({l.external ? "opens in a new tab" : "opens your email app"})
      </span>
    </a>
  );
}

function PaperCard({ paper }: { paper: Paper }) {
  return (
    <li className="flex min-w-0 flex-col gap-1 rounded-md border border-line bg-paper p-3 md:p-4" data-paper>
      {paper.figure && (
        <img
          src={`/assets/${paper.figure.src.replace("assets/research/", "")}`}
          alt={paper.figure.alt}
          width={paper.figure.width}
          height={paper.figure.height}
          loading="lazy"
          decoding="async"
          className="mb-1 block h-auto max-h-32 max-md:max-h-24 w-auto max-w-full self-start rounded-md border border-line"
        />
      )}
      <p className="t-small text-ink/70">
        {paper.authors} ({when(paper)}), {paper.venue}
      </p>
      <h3 className="text-[1.0625rem] font-bold leading-snug">{paper.title}</h3>
      {paper.finding && <p className="t-small">{paper.finding}</p>}
      <div className="mt-auto">
        <LinkOut paper={paper} />
      </div>
    </li>
  );
}

function Research() {
  const FEATURED = PAPERS.filter((p) => p.featured);
  const OTHERS = PAPERS.filter((p) => !p.featured);
  const featSizes = useFitPages("featured", FEATURED.length, SPLITS);
  const citeSizes = useFitPages("citations", OTHERS.length, CITE_SPLITS);
  const feat = paginate(FEATURED, featSizes).map((page, n) => ({
    ...page,
    id: n === 0 ? "featured" : `featured-from-${page.from}`,
    label: n === 0 ? "Research" : `Featured papers ${range(page.from, page.to)}`,
  }));
  const cites = paginate(OTHERS, citeSizes).map((page, n) => ({
    ...page,
    id: n === 0 ? "more" : `more-from-${page.from}`,
    label: n === 0 ? "More publications" : `More publications ${range(page.from, page.to)}`,
  }));
  return (
    <DocShell stops={[...feat, ...cites].map(({ id, label }) => ({ id, label }))}>
      {feat.map((page, n) => (
        <DocSection key={page.id} label={page.label} title={n === 0 ? pc.research.TITLE : page.label} as={n === 0 ? "h1" : "h2"} lede={n === 0 ? pc.research.LEDE : undefined} cut={n === 0 ? 6 : 0}>
          {/* Kept (but unseen) on a screen with no paper yet, so the measured room does not change with the split. */}
          {n === 0 && (
            <h2 className={`t-h3 mb-3 ${page.items.length === 0 ? "invisible" : ""}`} aria-hidden={page.items.length === 0 || undefined}>{copy.research.Research.h21}</h2>
          )}
          <ul data-fit="featured" aria-hidden={page.items.length === 0 || undefined} className="grid gap-2 md:grid-cols-2 md:gap-3">
            {page.items.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </ul>
        </DocSection>
      ))}
      {cites.map((page) => (
        <DocSection key={page.id} label={page.label} title={page.label}>
          <ul data-fit="citations" className="grid max-w-4xl gap-2 t-small leading-snug">
            {page.items.map((paper) => (
              <li key={paper.id} data-citation>
                {paper.authors} ({when(paper)}). {paper.title}. {paper.venue}. <LinkOut paper={paper} inline />
              </li>
            ))}
          </ul>
        </DocSection>
      ))}
    </DocShell>
  );
}
