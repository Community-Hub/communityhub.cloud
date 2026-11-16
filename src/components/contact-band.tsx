import { AppLink } from "@/components/app-link";
import { copy } from "@/lib/copy";
import { ArrowRight } from "lucide-react";
import { BRING_HREF, DEMO_HREF } from "@/lib/links";
import { site } from "@/lib/site";

/** The closing band on every page: Bring Dashboard to Your Community, with Contact us. */
export function ContactBand() {
  const t = copy.siteFooter.FooterChapter;
  return (
    <section id="contact" aria-labelledby="contact-title" className="home-contact page">
      <div className="panel bg-pine text-white">
        <div className="wrap grid items-center gap-10 py-[clamp(3.5rem,7vw,6rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <h2 id="contact-title" className="t-h2 text-white">
              {t.h21}
            </h2>
            <p className="mt-5 text-xl font-semibold text-lime">{t.p1}</p>
            <p className="mt-3 max-w-xl t-body text-white/82">{t.p2}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <AppLink href={site.contactHref} className="btn-primary">
                {t.a1}
              </AppLink>
              <AppLink href={DEMO_HREF} className="btn-on-dark">
                {copy.siteHeader.SiteHeader.a2}
              </AppLink>
            </div>
            <p className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] text-white/75">
              <AppLink href={BRING_HREF} className="inline-flex items-center gap-1.5 font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
                {copy.home.Contact.AppLink1}
                <ArrowRight className="size-4" aria-hidden />
              </AppLink>
              <span>
                Or write to{" "}
                <a href={site.mailtoHref} className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
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
