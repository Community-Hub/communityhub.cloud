import { createMiddleware, createStart } from "@tanstack/react-start";

/** Sends the editor to its own host and keeps it off the public one. */
const hostRouting = createMiddleware({ type: "request" }).server(async ({ request, next }) => {
  // Deployment contract first: /healthz and legacy .html / WordPress 301s
  // answer before the CMS host gate or any rendering (no database touched).
  const { healthResponse, legacyRedirect } = await import("@/lib/legacy-redirects");
  const health = healthResponse(request);
  if (health) return health;
  const legacy = legacyRedirect(request);
  if (legacy) return legacy;
  const { gate, hardenEditorResponse } = await import("@/lib/cms/gate.server");
  const early = gate(request);
  if (early) return early;
  const result = await next();
  try {
    hardenEditorResponse(request, result.response);
  } catch {
    // headers on this response are immutable; the editor routes set their own
  }
  // Errors (unknown paths, /404.html, missing assets) are never cached:
  // a shared cache must not store or reuse a 4xx/5xx page for this URL.
  if (result.response.status >= 400) {
    try {
      result.response.headers.set("cache-control", "no-store");
    } catch {
      // immutable headers; the gate's own 404s already send no-store
    }
  }
  return result;
});

export const startInstance = createStart(() => ({ requestMiddleware: [hostRouting] }));
