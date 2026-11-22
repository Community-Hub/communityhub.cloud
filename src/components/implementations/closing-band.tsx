import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { OBERLIN_AERIAL, type BackCoverPhoto } from "@/components/contact-band";
import { copy } from "@/lib/copy";
import { DEMO_HREF } from "@/lib/links";
import { site } from "@/lib/site";
import { txt } from "@/lib/page-text/implementationsClosingBand";

/**
 * The closing page in the form of the site's ContactBand (src/components/contact-band.tsx): a full-bleed photo with
 * Contact us, Book a demo, then a quiet row of links and the email address. For pages that need their own words in
 * it: the implementations index (the guide, as the live page words it) and the guide itself (which must not link to
 * itself).
 */
export function ClosingBand({
  id,
  title,
  children,
  link,
  photo = OBERLIN_AERIAL,
}: {
  id: string;
  title: string;
  /** The words under the heading. */
  children?: ReactNode;
  /** One page to go on to, shown in the quiet row under the buttons. */
  link: { href: string; label: string };
  /** A page that already shows the default photo passes another. */
  photo?: BackCoverPhoto;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="home-contact page">
      <div className="home-contact-panel panel">
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          sizes="100vw"
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          className="home-contact-photo"
          style={photo.focus ? { objectPosition: photo.focus } : undefined}
        />
        <div aria-hidden className="home-contact-scrim" />
        <div className="home-contact-copy wrap">
          <h2 id={`${id}-title`} className="home-contact-title">
            {title}
          </h2>
          {children}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <AppLink href={site.contactHref} className="btn-primary">
              {copy.siteFooter.FooterChapter.a1}
            </AppLink>
            <AppLink href={DEMO_HREF} className="btn-on-dark">
              {copy.siteHeader.SiteHeader.a2}
            </AppLink>
          </div>
          <p className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] text-white/80">
            <AppLink
              href={link.href}
              className="inline-flex items-center gap-1.5 font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
            >
              {link.label}
              <ArrowRight className="size-4" aria-hidden />
            </AppLink>
            <span>
              {txt.span1}{" "}
              <a
                href={site.mailtoHref}
                className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                {site.contactEmail}
              </a>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
