import { createFileRoute } from "@tanstack/react-router";
import { DocSection, DocShell } from "@/components/doc";
import publicationsData from "@/data/publications.json";
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
    <li className="flex min-w-0 flex-col gap-1.5 rounded-md border border-line bg-paper p-4 md:p-5" data-paper>
      {paper.figure && (
        <img
          src={`/assets/${paper.figure.src.replace("assets/research/", "")}`}
          alt={paper.figure.alt}
          width={paper.figure.width}
          height={paper.figure.height}
          loading="lazy"
          decoding="async"
          className="mb-1.5 block h-auto max-h-36 max-md:max-h-28 w-auto max-w-full self-start rounded-md border border-line"
        />
      )}
      <p className="t-small text-ink/70">
        {paper.authors} ({when(paper)}), {paper.venue}
      </p>
      <h3 className="text-[1.0625rem] font-bold leading-snug">{paper.title}</h3>
      {paper.finding && <p className="t-small">{paper.finding}</p>}
      <div className="mt-auto pt-1">
        <LinkOut paper={paper} />
      </div>
    </li>
  );
}

function Research() {
  const FEATURED = PAPERS.filter((p) => p.featured);
  const OTHERS = PAPERS.filter((p) => !p.featured);
  const stops = [
    { id: "featured", label: "Research" },
    { id: "more", label: "More publications" },
  ];
  return (
    <DocShell stops={stops}>
      <DocSection label="Research" title={pc.research.TITLE} as="h1" lede={pc.research.LEDE}>
        <h2 className="t-h3 mb-4">{copy.research.Research.h21}</h2>
        <ul data-fit="featured" className="grid gap-4 md:grid-cols-2">
          {FEATURED.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </ul>
      </DocSection>
      <DocSection label="More publications" title="More publications">
        <ul data-fit="citations" className="grid max-w-4xl gap-2.5 t-small leading-snug">
          {OTHERS.map((paper) => (
            <li key={paper.id} data-citation>
              {paper.authors} ({when(paper)}). {paper.title}. {paper.venue}. <LinkOut paper={paper} inline />
            </li>
          ))}
        </ul>
      </DocSection>
    </DocShell>
  );
}
