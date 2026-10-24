import type { ReactNode } from "react";
import { AppLink } from "@/components/app-link";
import { SiteFooter } from "@/components/site-footer";
import { legal } from "@/lib/legal";

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
  return (
    <main className="min-h-dvh bg-field text-ink">
      <div className="border-b border-pine/15 bg-paper">
        <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-24 md:px-6 md:pb-10 md:pt-28">
          <nav aria-label="Breadcrumb" className="t-small font-bold text-pine">
            <AppLink href="/" className="underline decoration-2 underline-offset-4">Community Hub</AppLink>
            <span aria-hidden="true" className="px-2 text-ink/50">/</span>
            <span className="text-ink/70">Legal</span>
          </nav>
          <h1 className="mt-4 max-w-3xl t-h1">{title}</h1>
          <p className="mt-3 max-w-2xl t-lede">{intro}</p>
          <dl className="mt-6 grid gap-x-8 gap-y-2 border-t border-line pt-4 t-small sm:grid-cols-3">
            <div>
              <dt className="font-bold text-pine">Effective</dt>
              <dd>{legal.effectiveDate}</dd>
            </div>
            <div>
              <dt className="font-bold text-pine">Last updated</dt>
              <dd>{legal.lastUpdated}</dd>
            </div>
            <div>
              <dt className="font-bold text-pine">Applies to</dt>
              <dd>communityhub.cloud and the Community Hub products</dd>
            </div>
          </dl>
          <p className="sr-only">{description}</p>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-10 md:grid-cols-[15rem_minmax(0,1fr)] md:px-6 md:py-14">
        <aside className="hidden md:block" aria-label="On this page">
          <div className="sticky top-24">
            <p className="eyebrow">On this page</p>
            <ol className="mt-3 space-y-2 border-l border-line pl-4 t-small">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="hover:text-pine">{section.title}</a>
                </li>
              ))}
              <li><a href="#contact" className="hover:text-pine">Contact us</a></li>
            </ol>
            <div className="mt-8 rounded-md border border-line bg-paper p-3">
              <p className="t-small font-bold text-pine">Questions?</p>
              <p className="mt-1 t-small">Write to</p>
              <a href={`mailto:${legal.privacyEmail}`} className="mt-0.5 block break-words text-[0.8125rem] underline decoration-2 underline-offset-2">
                {legal.privacyEmail}
              </a>
            </div>
          </div>
        </aside>

        <article className="min-w-0 max-w-[46rem]">
          <details className="mb-6 rounded-md border border-line bg-paper p-3 md:hidden">
            <summary className="cursor-pointer font-bold text-pine">On this page</summary>
            <ol className="mt-2 grid gap-1 t-small">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="hover:text-pine">{section.title}</a>
                </li>
              ))}
              <li><a href="#contact" className="hover:text-pine">Contact us</a></li>
            </ol>
          </details>

          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className={`scroll-mt-24 ${index === 0 ? "" : "mt-10 border-t border-line/80 pt-8"}`}
            >
              <h2 id={`${section.id}-title`} className="font-display text-[1.45rem] leading-tight text-pine md:text-[1.6rem]">
                {section.title}
              </h2>
              <div className="legal-prose mt-3">{section.body}</div>
            </section>
          ))}

          <section id="contact" aria-labelledby="contact-title" className="mt-10 scroll-mt-24 border-t border-line/80 pt-8">
            <h2 id="contact-title" className="font-display text-[1.45rem] leading-tight text-pine md:text-[1.6rem]">
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

      <div className="border-t border-line bg-paper">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6">
          <SiteFooter />
        </div>
      </div>
    </main>
  );
}
