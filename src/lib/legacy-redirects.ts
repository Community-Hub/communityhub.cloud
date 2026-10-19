/**
 * Legacy URL compatibility for communityhub.cloud.
 *
 * Single source of truth for redirects from the retired Astro `.html` pages
 * and the older WordPress paths to current public routes. Used by the request
 * middleware in `src/start.ts` (server 301s, before any rendering), by the
 * client router rewrite in `src/router.tsx` (`rewriteLegacyUrl`, same map),
 * and kept in sync with `deployment/legacy-redirects.json` (checked by the
 * unit test). Do not add a second copy of this map anywhere.
 *
 * Query strings are preserved. Fragments never reach the server; where a
 * mapping carries its own `#fragment`, the browser re-attaches the original
 * fragment to the redirect target per RFC 7231 when the target has none.
 */

/** Exact legacy paths (no trailing slash) -> new public path (optionally with #fragment). */
export const LEGACY_REDIRECTS: Readonly<Record<string, string>> = {
  // WordPress-era paths (previously handled by deployment/nginx.conf).
  "/home": "/",
  "/team": "/about",
  "/contact-us": "/about",
  "/products-and-services": "/products",
  "/products-and-services/data-manager": "/data-hub",
  "/products-and-services/dashboard-creator": "/dashboard-builder",
  "/products-and-services/citywide-dashboard": "/citywide-dashboard",
  "/products-and-services/community-calendar": "/community-calendar",
  "/products-and-services/community-voices": "/community-voices",
  "/products-and-services/digital-signage-software": "/digital-signage",
  "/products-and-services/story-maker": "/stories",
  "/products-and-services/phone-app": "/phone-app",

  // Retired Astro `.html` pages (old canonical URLs).
  "/index.html": "/",
  "/products.html": "/products",
  "/about.html": "/about",
  "/pricing.html": "/pricing",
  "/research.html": "/research",
  "/resources.html": "/resources",
  "/stories.html": "/stories",
  "/story-of-dashboard.html": "/story",
  "/the-hub.html": "/data-hub",
  "/data-hub.html": "/data-hub",
  "/data-dashboard.html": "/dashboard-builder",
  "/building-dashboard.html": "/dashboard-builder",
  "/building-dashboard": "/dashboard-builder",
  "/citywide-dashboard.html": "/citywide-dashboard",
  "/community-calendar.html": "/community-calendar",
  "/community-voices.html": "/community-voices",
  "/digital-signage.html": "/digital-signage",
  "/phone-app.html": "/phone-app",
  "/web-embeddables.html": "/web-embeddables",
  "/environmental-dashboard.html": "/",
  "/environmental-dashboard": "/",
  "/contact.html": "/about",
  "/dashboards.html": "/demos",
  "/examples.html": "/demos",
  "/see-it-live.html": "/demos",
  "/bring-a-dashboard.html": "/demos",
  "/education.html": "/toolkit",
  "/media.html": "/resources",
  "/who-its-for.html": "/who",
  "/great-lakes-science-center.html": "/work#glsc",
  "/midtown-cleveland.html": "/work#midtown",
  "/oberlin-college.html": "/work#college",
  "/city-of-oberlin.html": "/work#oberlin",
  "/hamilton-college.html": "/work",
  "/schools.html": "/work#schools",
  "/campuses.html": "/who",
  "/cities.html": "/who",
  "/museums.html": "/who",
  "/neighborhoods.html": "/who",
  // `/404.html` is deliberately absent: it (and every other unknown path)
  // must answer a genuine 404, never a redirect home.
};

/** Current public routes a legacy target may point at (kept honest by tests). */
export const PUBLIC_ROUTES: readonly string[] = [
  "/",
  "/about",
  "/citywide-dashboard",
  "/community-calendar",
  "/community-voices",
  "/dashboard-builder",
  "/data-hub",
  "/demos",
  "/digital-signage",
  "/phone-app",
  "/pricing",
  "/products",
  "/research",
  "/resources",
  "/services",
  "/stories",
  "/story",
  "/toolkit",
  "/web-embeddables",
  "/who",
  "/work",
];

/**
 * The 301 for a legacy request, or null to serve normally.
 * Matches the path case-insensitively with or without a trailing slash,
 * preserves the query string, and only redirects safe methods.
 */
export function legacyRedirect(request: Request): Response | null {
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") return null;
  const url = new URL(request.url);
  const key = legacyKey(url.pathname);
  const target = key ? LEGACY_REDIRECTS[key] : undefined;
  if (!target) return null;
  const [targetPath, fragment] = target.split("#");
  const location = `${targetPath}${url.search}${fragment ? `#${fragment}` : ""}`;
  return new Response(null, {
    status: 301,
    headers: { location, "cache-control": "public, max-age=3600" },
  });
}

/** The normalized map key for a path (decoded, no trailing slash, lower case), or null. */
function legacyKey(pathname: string): string | null {
  let path = pathname;
  try {
    path = decodeURIComponent(path);
  } catch {
    return null;
  }
  return (path.length > 1 ? path.replace(/\/+$/, "") : path).toLowerCase();
}

/**
 * Client-side twin of the server 301s, for the router's input rewrite
 * (`src/router.tsx`). Same canonical map, same normalization; the query
 * string rides along untouched because only pathname/hash are mutated.
 *
 * Fragment-dependent case: `data-dashboard.html#orbs` names the orb story,
 * which lives on the home page. The server 301 cannot see `#orbs`; the
 * browser re-attaches it to the redirect target, so by the time the router
 * sees the URL it is `/dashboard-builder#orbs`. The special case therefore
 * matches both the legacy source paths (direct client navigation) and the
 * post-redirect target, and resolves to `/#orb`.
 */
export function rewriteLegacyUrl(url: URL): URL {
  const key = legacyKey(url.pathname);
  if (!key) return url;
  if (url.hash === "#orbs") {
    const mapped = LEGACY_REDIRECTS[key]?.split("#")[0];
    if (mapped === "/dashboard-builder" || key === "/dashboard-builder") {
      url.pathname = "/";
      url.hash = "#orb";
      return url;
    }
  }
  const target = LEGACY_REDIRECTS[key];
  if (!target) return url;
  const [path, fragment] = target.split("#");
  url.pathname = path;
  // A mapped fragment (e.g. /work#glsc) wins, as with the server Location;
  // otherwise keep the visitor's own fragment.
  if (fragment) url.hash = `#${fragment}`;
  return url;
}

/** Liveness endpoint required by the deployment contract (`ch.production.json`). */
export function healthResponse(request: Request): Response | null {
  const { pathname } = new URL(request.url);
  if (pathname !== "/healthz") return null;
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
  }
  return new Response(method === "HEAD" ? null : "ok\n", {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}
