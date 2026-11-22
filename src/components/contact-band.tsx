import { AppLink } from "@/components/app-link";
import { copy } from "@/lib/copy";
import { ArrowRight } from "lucide-react";
import { BRING_HREF, DEMO_HREF } from "@/lib/links";
import { site } from "@/lib/site";
import { txt } from "@/lib/page-text/contactBand";

export type BackCoverPhoto = { src: string; srcSet?: string; alt: string; focus?: string };

/** Downtown Oberlin from the air in autumn. The 2048px file is an upscale of the 960px original. */
export const OBERLIN_AERIAL: BackCoverPhoto = {
  src: "/assets/oberlin-aerial-2048.jpg",
  srcSet: "/assets/oberlin-aerial-1280.jpg 1280w, /assets/oberlin-aerial-2048.jpg 2048w",
  get alt() { return txt.alt1; },
  focus: "62% 50%",
};

/** Families chalk-drawing on a downtown Oberlin sidewalk (Chalk Walk 2022), for pages that already show the aerial. */
export const DOWNTOWN_CHALK_WALK: BackCoverPhoto = {
  src: "/assets/photos/chalk-walk-2022/chalk-walk-2022-14.jpg",
  get alt() { return txt.alt2; },
  focus: "40% 50%",
};

/**
 * The closing page on every page, the back cover to the film on the home: a full-bleed photo of a town with
 * Bring Dashboard to Your Community, Contact us and Book a demo. A page that already shows the default photo
 * passes another, so no picture appears twice on one page.
 */
export function ContactBand({ photo = OBERLIN_AERIAL }: { photo?: BackCoverPhoto }) {
  const t = copy.siteFooter.FooterChapter;
  return (
    <section id="contact" aria-labelledby="contact-title" className="home-contact page">
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
          <h2 id="contact-title" className="home-contact-title">
            {t.h21}
          </h2>
          <p className="mt-4 text-xl font-semibold text-lime">{t.p1}</p>
          <p className="mt-3 max-w-xl t-body text-white/85">{t.p2}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <AppLink href={site.contactHref} className="btn-primary">
              {t.a1}
            </AppLink>
            <AppLink href={DEMO_HREF} className="btn-on-dark">
              {copy.siteHeader.SiteHeader.a2}
            </AppLink>
          </div>
          <p className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] text-white/80">
            <AppLink href={BRING_HREF} className="inline-flex items-center gap-1.5 font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
              {copy.home.Contact.AppLink1}
              <ArrowRight className="size-4" aria-hidden />
            </AppLink>
            <span>
              {txt.span1}{" "}
              <a href={site.mailtoHref} className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
                {site.contactEmail}
              </a>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
