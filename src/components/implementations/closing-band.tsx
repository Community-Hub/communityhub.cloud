import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { copy } from "@/lib/copy";
import { DEMO_HREF } from "@/lib/links";
import { site } from "@/lib/site";

/**
 * The pine band that closes a page, in the form of the site's ContactBand (src/components/contact-band.tsx): Contact us,
 * Book a demo, then a quiet row of links and the email address. For pages that need their own words in it: the
 * implementations index (the guide, as the live page words it) and the guide itself (which must not link to itself).
 */
export function ClosingBand({
  id,
  title,
  children,
  link,
}: {
  id: string;
  title: string;
  /** The words under the heading. */
  children?: ReactNode;
  /** One page to go on to, shown in the quiet row under the buttons. */
  link: { href: string; label: string };
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="home-contact">
      <div className="panel bg-pine text-white">
        <div className="wrap grid items-center gap-10 py-[clamp(3.5rem,7vw,6rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <h2 id={`${id}-title`} className="t-h2 text-white">
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
            <p className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] text-white/75">
              <AppLink
                href={link.href}
                className="inline-flex items-center gap-1.5 font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                {link.label}
                <ArrowRight className="size-4" aria-hidden />
              </AppLink>
              <span>
                Or write to{" "}
                <a
                  href={site.mailtoHref}
                  className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                >
                  {site.contactEmail}
                </a>
              </span>
            </p>
          </div>
          <img
            src="/assets/live-contact-workshop.jpg"
            alt="Community Hub workshop with community partners in front of a dashboard display"
            width={960}
            height={724}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full rounded-[1.25rem] object-cover"
          />
        </div>
      </div>
    </section>
  );
}
