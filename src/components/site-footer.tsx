import { AppLink } from "@/components/app-link";
import { Wordmark } from "@/components/site-header";
import { site } from "@/lib/site";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
export const FOOTER = pc.siteFooter.FOOTER;

/** The one footer, at the end of every page. */
export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-field text-ink">
      <div className="wrap py-14 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.6fr)] lg:gap-16">
          <div className="max-w-sm">
            <AppLink href="/" className="inline-flex rounded-lg">
              <Wordmark />
            </AppLink>
            <p className="mt-5 t-small text-ink/75">{copy.siteFooter.SiteFooter.p1}</p>
            <p className="mt-4">
              <a href={site.mailtoHref} className="text-[0.9375rem] font-semibold text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-pine hover:decoration-current">
                {site.contactEmail}
              </a>
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {FOOTER.map((col) => (
              <div key={col.title} className="min-w-0">
                <p className="eyebrow">{col.title}</p>
                <ul className="mt-3 space-y-0.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <AppLink href={link.href} className="inline-flex min-h-8 items-center text-[0.9375rem] text-ink/72 transition-colors duration-150 hover:text-pine">
                        {link.label}
                      </AppLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-sm text-ink/70 md:flex-row md:items-center md:justify-between">
          <p>
            {copy.siteFooter.SiteFooter.p2} Community Hub Inc, Oberlin, Ohio.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-1">
            <AppLink href="/privacy-policy" className="inline-flex min-h-8 items-center hover:text-pine">
              Privacy Policy
            </AppLink>
            <AppLink href="/terms-of-service" className="inline-flex min-h-8 items-center hover:text-pine">
              Terms of Service
            </AppLink>
          </nav>
        </div>
      </div>
    </footer>
  );
}
