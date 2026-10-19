import { createFileRoute } from "@tanstack/react-router";

/** Editor sign-in and sign-up (better-auth). Only reachable on the editor host. */
export const Route = createFileRoute("/api/cms-auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => handle(request),
      POST: async ({ request }) => handle(request),
    },
  },
});

async function handle(request: Request): Promise<Response> {
  const [{ isAdminHost }, { getCmsAuth, json }] = await Promise.all([import("@/lib/cms/env"), import("@/lib/cms/server")]);
  if (!isAdminHost(request)) return json({ error: "Not found" }, 404);
  if (request.method !== "GET") {
    const { adminOrigin } = await import("@/lib/cms/env");
    if (request.headers.get("origin") !== adminOrigin(request)) return json({ error: "Request blocked (origin)." }, 403);
  }
  return getCmsAuth(request).handler(request);
}
