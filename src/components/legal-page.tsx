import { useEffect, type ReactNode } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { legal } from "@/lib/legal";
import { consumeNavigationTarget } from "@/lib/use-hash-stops";
import { txt } from "@/lib/page-text/legalPage";

export type LegalSection = {
  id: string;
  title: string;
  body: ReactNode;
};

/**
 * A quiet, readable document page for the policies Google reviews. Unlike the product pages this
 * is one continuous page, not a storyboard: reviewers and readers need to scan it, link to a
 * section and print it. It keeps the site header, type and footer.
 */
export function LegalPage({
  title,
  description,
  intro,
  sections,
}: {
  title: string;
  description: string;
  intro: string;
  sections: LegalSection[];
}) {
  useEffect(() => {
    const target = consumeNavigationTarget();
    if (target) {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);
  return (
    <>
    <main id="main" className="bg-paper text-ink">
      <div className="border-b border-line">
        <div className="mx-auto w-full max-w-5xl px-(--gutter) pb-10 pt-[calc(var(--header-h)+clamp(2.5rem,6vw,4.5rem))] md:pb-12">
          <Breadcrumbs current={title} />
          <h1 className="mt-6 max-w-3xl t-h1">{title}</h1>
          <p className="mt-5 max-w-2xl t-lede">{intro}</p>
          <dl className="mt-8 grid gap-x-8 gap-y-3 border-t border-line pt-5 t-small sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-ink">{txt.dt1}</dt>
              <dd>{legal.effectiveDate}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">{txt.dt2}</dt>
              <dd>{legal.lastUpdated}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">{txt.dt3}</dt>
              <dd>{txt.dd1}</dd>
            </div>
          </dl>
          <p className="sr-only">{description}</p>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-12 px-(--gutter) py-12 md:grid-cols-[15rem_minmax(0,1fr)] md:py-16">
        <aside className="hidden md:block" aria-label="On this page">
          <div className="sticky top-24">
            <p className="eyebrow">{txt.p1}</p>
            <ol className="mt-3 space-y-2 border-l border-line pl-4 t-small">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="text-left hover:text-pine"
                  >
                    {section.title}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="text-left hover:text-pine"
                >
                  {txt.button1}</button>
              </li>
            </ol>
            <div className="mt-8 rounded-2xl border border-line bg-field p-4">
              <p className="t-small font-semibold text-ink">{txt.p2}</p>
              <p className="mt-1 t-small">{txt.p3}</p>
              <a href={`mailto:${legal.privacyEmail}`} className="mt-0.5 block break-words text-[0.8125rem] underline decoration-2 underline-offset-2">
                {legal.privacyEmail}
              </a>
            </div>
          </div>
        </aside>

        <article
          className="min-w-0 max-w-[46rem]"
          onClick={(e) => {
            const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
            if (!anchor) return;
            const id = anchor.getAttribute("href")?.slice(1);
            if (!id) return;
            e.preventDefault();
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <details className="mb-8 rounded-2xl border border-line bg-field p-4 md:hidden">
            <summary className="cursor-pointer font-semibold text-ink">{txt.summary1}</summary>
            <ol className="mt-2 grid gap-1 t-small">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="text-left hover:text-pine"
                  >
                    {section.title}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="text-left hover:text-pine"
                >
                  {txt.button2}</button>
              </li>
            </ol>
          </details>

          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className={`scroll-mt-24 ${index === 0 ? "" : "mt-10 border-t border-line/80 pt-8"}`}
            >
              <h2 id={`${section.id}-title`} className="t-h3 text-pine">
                {section.title}
              </h2>
              <div className="legal-prose mt-3">{section.body}</div>
            </section>
          ))}

          <section id="contact" aria-labelledby="contact-title" className="mt-10 scroll-mt-24 border-t border-line/80 pt-8">
            <h2 id="contact-title" className="t-h3 text-pine">
              {txt.h21}</h2>
            <div className="legal-prose mt-3">
              <p>
                <strong>{legal.entity}</strong>
                <br />
                {legal.address}
              </p>
              <p>
                {txt.p4}{" "}
                <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>
                <br />
                {txt.p5}{" "}
                <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>
              </p>
              <p>
                {txt.p6}</p>
            </div>
          </section>

          <p className="mt-10 border-t border-line pt-4 t-small text-ink/70">
            {legal.entity} · {legal.address} {" "}{txt.p7}{" "}{legal.effectiveDate}
          </p>
        </article>
      </div>
    </main>
    <SiteFooter />
    </>
  );
}
