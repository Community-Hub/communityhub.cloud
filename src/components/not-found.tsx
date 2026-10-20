import { Page } from "@/components/page";
import { AppLink } from "@/components/app-link";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
const LINKS = pc.notFound.LINKS;

export function NotFound() {
  return (
    <Page title={copy.notFound.NotFound.Page_title1} lede={copy.notFound.NotFound.Page_lede1}>
      <ul className="grid gap-x-10 gap-y-3 text-lg md:grid-cols-2">
        {LINKS.map((link) => (
          <li key={link.href}>
            <AppLink href={link.href} className="font-bold text-pine underline decoration-2 underline-offset-4">
              {link.label}
            </AppLink>
            <p className="text-base text-ink/70">{link.note}</p>
          </li>
        ))}
      </ul>
    </Page>
  );
}
