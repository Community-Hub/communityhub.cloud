import { createRouter } from "@tanstack/react-router";
import { NotFound } from "@/components/not-found";
import { AppErrorComponent } from "@/lib/error-component";
import type { CmsState } from "@/lib/cms/core";
import { stripMarks } from "@/lib/cms/marks";
import { rewriteLegacyUrl } from "@/lib/legacy-redirects";
import { siteIndex } from "@/lib/site-registry";
import { routeTree } from "./routeTree.gen";

// Legacy paths are rewritten from the one canonical map in
// `src/lib/legacy-redirects.ts` (the same map the server 301s use),
// including the fragment-dependent `data-dashboard.html#orbs` -> `/#orb`
// case, which arrives here as `/dashboard-builder#orbs` after the 301.

export function getRouter() {
  // In the browser, put the saved edits on the content before the first render (the server did the same).
  const saved = typeof window !== "undefined" ? (window as unknown as { __CMS_STATE__?: CmsState }).__CMS_STATE__ : undefined;
  if (saved) siteIndex.apply(saved);
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    // A short cross-fade between pages where the browser supports view transitions.
    defaultViewTransition: true,
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: NotFound,
    rewrite: { input: ({ url }) => rewriteLegacyUrl(url) },
  });
  // A heading an editor made bold or italic can also be a page's tab title or its description for search engines.
  // Those are plain text, and the router draws them itself, so the marks are taken out of what each page hands it.
  for (const route of Object.values(router.routesById) as { options: { head?: (ctx: unknown) => unknown } }[]) {
    const head = route.options.head;
    if (!head) continue;
    route.options.head = (ctx) => {
      const out = head(ctx);
      return out instanceof Promise ? out.then(plainHead) : plainHead(out);
    };
  }
  return router;
}

/** A page's title and descriptions with no bold or italic marks in them. */
function plainHead<T>(head: T): T {
  const meta = (head as { meta?: unknown } | null | undefined)?.meta;
  if (!Array.isArray(meta)) return head;
  const clean = meta.map((tag: unknown) =>
    tag && typeof tag === "object" ? Object.fromEntries(Object.entries(tag).map(([k, v]) => [k, typeof v === "string" ? stripMarks(v) : v])) : tag,
  );
  return { ...head, meta: clean };
}
