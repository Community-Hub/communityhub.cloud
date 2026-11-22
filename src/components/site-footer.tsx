import { AppLink } from "@/components/app-link";
import { Wordmark } from "@/components/site-header";
import { site } from "@/lib/site";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
import { allProducts, SERVICES } from "@/lib/site-map";
import { txt } from "@/lib/page-text/siteFooter";

/**
 * The footer mirrors the main menu, heading for heading (John, 19 Nov 2026: "this has story, this does not have story,
 * this has company ... it just feels super inconsistent"). It is read from the menu's own list each time it draws, so
 * the two cannot drift apart and an edit to a menu label shows in both.
 */
function footerColumns() {
  return [
    {
      title: txt.title1,
      links: [{ href: "/products", label: txt.label1 }, ...allProducts().map((item) => ({ href: item.href, label: item.title })), SERVICES],
    },
    ...pc.siteHeader.NAV.filter((item) => item.children).map((item) => ({
      title: item.label,
      links: item.children!.map((child) => ({ href: child.href, label: child.label })),
    })),
  ];
}

/** The menu's items that open no menu of their own (Home, Contact us): plain links beside the columns. */
const plainItems = () => pc.siteHeader.NAV.filter((item) => !item.children && item.to !== "/products");

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
            <ul className="mt-3 flex flex-wrap gap-x-5">
              {plainItems().map((item) => (
                <li key={item.to}>
                  <AppLink href={item.to} className="inline-flex min-h-8 items-center text-[0.9375rem] text-ink/72 transition-colors duration-150 hover:text-pine">
                    {item.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {footerColumns().map((col) => (
              <div key={col.title} className="min-w-0">
                <p className="eyebrow">{col.title}</p>
                <ul className="mt-3 space-y-0.5">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
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
            {copy.siteFooter.SiteFooter.p2} {" "}{txt.p1}</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-1">
            <AppLink href="/privacy-policy" className="inline-flex min-h-8 items-center hover:text-pine">
              {txt.AppLink1}</AppLink>
            <AppLink href="/terms-of-service" className="inline-flex min-h-8 items-center hover:text-pine">
              {txt.AppLink2}</AppLink>
          </nav>
        </div>
      </div>
    </footer>
  );
}
