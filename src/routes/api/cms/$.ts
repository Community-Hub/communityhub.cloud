import { createFileRoute } from "@tanstack/react-router";

/**
 * The editor's data API. Every call needs a signed-in editor on the editor host; writes also need a same-origin request.
 *   GET  session | overview | history
 *   POST save | reset | section | list | revert | upload
 */
export const Route = createFileRoute("/api/cms/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => run(request, params._splat ?? ""),
      POST: async ({ request, params }) => run(request, params._splat ?? ""),
    },
  },
});

async function run(request: Request, action: string): Promise<Response> {
  const { fail, json } = await import("@/lib/cms/server");
  try {
    const { handleApi } = await import("@/lib/cms/api.server");
    return (await handleApi(request, action)) ?? json({ error: "Not found" }, 404);
  } catch (err) {
    return fail(err);
  }
}
