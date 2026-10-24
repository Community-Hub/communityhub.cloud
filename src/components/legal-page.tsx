import { useEffect, useRef, useState, type ReactNode } from "react";
import { Ban, CalendarClock, Database, Mail, Plug, Printer, ShieldCheck, Unplug } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { SiteFooter } from "@/components/site-footer";
import { legal } from "@/lib/legal";

export type LegalSection = {
  id: string;
  title: string;
  body: ReactNode;
};

/**
 * The public policies Google reviews. One continuous page, not a storyboard: it must scan,
 * deep-link, print and stay readable. The shell gives it the same field/pine/leaf language as
 * the rest of the site, while the article stays deliberately quiet.
 */
export function LegalPage({
  title,
  description,
  intro,
  sections,
  kind = "privacy",
}: {
  title: string;
  description: string;
  intro: string;
  sections: LegalSection[];
  kind?: "privacy" | "terms";
}) {
  const terms = kind === "terms";
  const promises = terms
    ? [
        { icon: Database, lead: "You own your data.", text: "We host it only to run your dashboards." },
        { icon: Plug, lead: "Google is optional.", text: "Connect a Sheet only when you choose to." },
        { icon: CalendarClock, lead: "Leave when you need to.", text: "Thirty days' notice, and an export window." },
      ]
    : [
        { icon: ShieldCheck, lead: "Read-only.", text: "We never write to your Google Sheets." },
        { icon: Ban, lead: "No ads. No AI training.", text: "Your data is not a product." },
        { icon: Unplug, lead: "Delete anytime.", text: "Disconnect here or in your Google account." },
      ];
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const progress = useRef<HTMLSpanElement>(null);

  // Reading progress: a thin leaf rule under the header, updated off the scroll thread.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progress.current) progress.current.style.transform = `scaleX(${value})`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Which section is being read. The active marker makes the long page navigable.
  useEffect(() => {
    const nodes = sections.map((section) => document.getElementById(section.id)).filter((node): node is HTMLElement => !!node);
    if (!nodes.length || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: "-18% 0px -68% 0px", threshold: [0, 1] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections]);

  const toc = (
    <ol className="legal-toc-list">
      {sections.map((section) => (
        <li key={section.id}>
          <a href={`#${section.id}`} aria-current={active === section.id ? "location" : undefined} className="legal-toc-link">
            {section.title}
          </a>
        </li>
      ))}
      <li>
        <a href="#contact" aria-current={active === "contact" ? "location" : undefined} className="legal-toc-link">
          Contact us
        </a>
      </li>
    </ol>
  );

  return (
    <main id="top" className="legal-page">
      <span ref={progress} className="legal-progress" aria-hidden="true" />

      <header className="legal-hero">
        <div className="legal-wrap">
          <nav aria-label="Breadcrumb" className="legal-crumb">
            <AppLink href="/">Community Hub</AppLink>
            <span aria-hidden="true">/</span>
            <span>Legal</span>
          </nav>
          <div className="legal-hero-grid">
            <div className="legal-hero-copy">
              <h1>{title}</h1>
              <p className="legal-intro">{intro}</p>
            </div>
            <dl className="legal-facts">
              <div><dt>Effective</dt><dd>{legal.effectiveDate}</dd></div>
              <div><dt>Last updated</dt><dd>{legal.lastUpdated}</dd></div>
              <div><dt>Applies to</dt><dd>communityhub.cloud and the Community Hub products</dd></div>
            </dl>
          </div>
          <p className="sr-only">{description}</p>
        </div>
      </header>

      <section className="legal-promises" aria-label="Privacy commitments">
        <div className="legal-wrap legal-promise-grid">
          {promises.map((item) => {
            const Icon = item.icon;
            return (
              <p key={item.lead}>
                <Icon aria-hidden="true" strokeWidth={1.8} />
                <span><b>{item.lead}</b> {item.text}</span>
              </p>
            );
          })}
        </div>
      </section>

      <div className="legal-body">
        <div className="legal-wrap legal-grid">
          <aside className="legal-rail">
            <nav aria-label="On this page" className="legal-toc">
              <p className="legal-kicker">On this page</p>
              {toc}
              <div className="legal-toc-actions">
                <button type="button" onClick={() => window.print()} className="legal-utility">
                  <Printer aria-hidden="true" strokeWidth={1.8} /> Print / Save PDF
                </button>
                <a href="#top" className="legal-utility legal-utility-quiet">Back to top</a>
              </div>
            </nav>
          </aside>

          <article className="legal-article">
            <details className="legal-mobile-toc">
              <summary>On this page</summary>
              {toc}
            </details>

            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className={`legal-section${index === 0 ? " legal-section-first" : ""}`}
              >
                <h2 id={`${section.id}-title`}>
                  <a href={`#${section.id}`} className="legal-anchor" aria-label={`Link to ${section.title}`}>#</a>
                  {section.title}
                </h2>
                <div className="legal-prose">{section.body}</div>
              </section>
            ))}
          </article>
        </div>
      </div>

      <section id="contact" className="legal-contact" aria-labelledby="contact-title">
        <div className="legal-wrap legal-contact-grid">
          <div>
            <h2 id="contact-title">{terms ? "Questions about these terms?" : "Questions about your data?"}</h2>
            <p>
              {terms ? "Terms and account questions" : "Privacy requests"}:{" "}
              <a href={`mailto:${terms ? legal.supportEmail : legal.privacyEmail}`}>
                {terms ? legal.supportEmail : legal.privacyEmail}
              </a>
              <br />
              General support: <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>
            </p>
            <p className="legal-contact-fine">
              {legal.entity} · {legal.address} · We respond within 30 days.
            </p>
          </div>
          <a className="btn btn-primary" href={`mailto:${terms ? legal.supportEmail : legal.privacyEmail}?subject=${encodeURIComponent(terms ? "Terms question" : "Privacy request")}`}>
            <Mail aria-hidden="true" strokeWidth={1.8} /> {terms ? "Email Community Hub" : "Email the privacy team"}
          </a>
        </div>
      </section>

      <div className="legal-footer">
        <div className="legal-wrap">
          <SiteFooter />
        </div>
      </div>
    </main>
  );
}
