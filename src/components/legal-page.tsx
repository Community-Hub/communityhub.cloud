import { useEffect, type ReactNode } from "react";
import { AppLink } from "@/components/app-link";
import { SiteFooter } from "@/components/site-footer";
import { legal } from "@/lib/legal";
import { consumeNavigationTarget } from "@/lib/use-hash-stops";

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
          <nav aria-label="Breadcrumb" className="text-[0.9375rem] text-ink/65">
            <AppLink href="/" className="font-medium text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-pine">Community Hub</AppLink>
            <span aria-hidden="true" className="px-2 text-ink/50">/</span>
            <span className="text-ink/70">Legal</span>
          </nav>
          <h1 className="mt-6 max-w-3xl t-h1">{title}</h1>
          <p className="mt-5 max-w-2xl t-lede">{intro}</p>
          <dl className="mt-8 grid gap-x-8 gap-y-3 border-t border-line pt-5 t-small sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-ink">Effective</dt>
              <dd>{legal.effectiveDate}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Last updated</dt>
              <dd>{legal.lastUpdated}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Applies to</dt>
              <dd>communityhub.cloud and the Community Hub products</dd>
            </div>
          </dl>
          <p className="sr-only">{description}</p>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-12 px-(--gutter) py-12 md:grid-cols-[15rem_minmax(0,1fr)] md:py-16">
        <aside className="hidden md:block" aria-label="On this page">
          <div className="sticky top-24">
            <p className="eyebrow">On this page</p>
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
                  Contact us
                </button>
              </li>
            </ol>
            <div className="mt-8 rounded-2xl border border-line bg-field p-4">
              <p className="t-small font-semibold text-ink">Questions?</p>
              <p className="mt-1 t-small">Write to</p>
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
            <summary className="cursor-pointer font-semibold text-ink">On this page</summary>
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
                  Contact us
                </button>
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
              Contact us
            </h2>
            <div className="legal-prose mt-3">
              <p>
                <strong>{legal.entity}</strong>
                <br />
                {legal.address}
              </p>
              <p>
                Privacy and data requests:{" "}
                <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>
                <br />
                General support:{" "}
                <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>
              </p>
              <p>
                We respond to privacy requests within 30 days. Include the organization and site
                name if your request concerns a Community Hub dashboard.
              </p>
            </div>
          </section>

          <p className="mt-10 border-t border-line pt-4 t-small text-ink/70">
            {legal.entity} · {legal.address} · Effective {legal.effectiveDate}
          </p>
        </article>
      </div>
    </main>
    <SiteFooter />
    </>
  );
}
