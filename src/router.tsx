import { createRouter } from "@tanstack/react-router";
import { NotFound } from "@/components/not-found";
import { AppErrorComponent } from "@/lib/error-component";
import type { CmsState } from "@/lib/cms/core";
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
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: NotFound,
    rewrite: { input: ({ url }) => rewriteLegacyUrl(url) },
  });
}
