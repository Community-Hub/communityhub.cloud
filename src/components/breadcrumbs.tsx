import { useRouterState } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { cleanPath, sectionFor, trailFor } from "@/lib/site-map";
import { cn } from "@/lib/utils";

const linkCls = "font-medium text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-pine hover:decoration-current";

/**
 * Where this page sits, from Home down, at the top of every page but the home (Maddie, 19 Nov 2026: "we need breadcrumbs
 * on this website ... I can always go back to the page that I was before"). It follows the site's structure, not the
 * visitor's clicks; the page itself comes last and is not a link. On a phone, where a full trail would wrap, it is one
 * link back up to the page above.
 */
export function Breadcrumbs({ current, className }: { current?: string; className?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const trail = trailFor(path, current);
  if (trail.length < 2) return null;
  const parent = [...trail].reverse().find((crumb) => crumb.href);
  return (
    <nav aria-label="Breadcrumb" data-breadcrumbs className={cn("text-[0.9375rem] text-ink/70", className)}>
      <ol className="hidden flex-wrap items-center gap-x-1.5 gap-y-1 sm:flex">
        {trail.map((crumb, i) => (
          // The arrow trails its crumb, so a trail that wraps in a narrow column never starts a line with an arrow.
          <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
            {crumb.href ? (
              <AppLink href={crumb.href} className={linkCls}>
                {crumb.label}
              </AppLink>
            ) : (
              <span aria-current="page" className="font-medium text-ink">
                {crumb.label}
              </span>
            )}
            {i < trail.length - 1 && <ChevronRight className="size-3.5 shrink-0 text-ink/40" aria-hidden />}
          </li>
        ))}
      </ol>
      {parent?.href && (
        <AppLink href={parent.href} className={cn(linkCls, "inline-flex min-h-11 items-center gap-1 sm:hidden")}>
          <ChevronLeft className="size-4 shrink-0" aria-hidden />
          {parent.label}
        </AppLink>
      )}
    </nav>
  );
}

/**
 * The other pages of this page's section, for the page a section's name opens. "Bring Dashboard to Your Community"
 * opens the implementation guide, and Pricing and Communities name it as the page above them, so it leads on to both.
 */
export function SectionLinks({ className }: { className?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const section = sectionFor(path);
  const others = (section?.children ?? []).filter((child) => cleanPath(child.href.split("#")[0]) !== cleanPath(path));
  if (!section || others.length === 0) return null;
  return (
    <nav aria-label={`Also in ${section.label}`} className={cn("flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.9375rem]", className)}>
      <span className="text-ink/70">Also in this section</span>
      <ul className="flex flex-wrap gap-x-5 gap-y-1">
        {others.map((child) => (
          <li key={child.href}>
            <AppLink href={child.href} className={cn(linkCls, "inline-flex min-h-11 items-center gap-1")}>
              {child.label}
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </AppLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
