import { createFileRoute } from "@tanstack/react-router";

/** Pictures uploaded during local development and tests (production pictures live in Vercel Blob). */
export const Route = createFileRoute("/cms-media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { readLocalMedia } = await import("@/lib/cms/media.server");
        const file = await readLocalMedia(params._splat ?? "");
        if (!file) return new Response("Not found", { status: 404 });
        const { IMAGE_MIME } = await import("@/lib/cms/image");
        return new Response(new Uint8Array(file.body), {
          headers: {
            "content-type": IMAGE_MIME[file.type],
            "cache-control": "public, max-age=31536000, immutable",
            "x-content-type-options": "nosniff",
            "content-security-policy": "default-src 'none'",
          },
        });
      },
    },
  },
});
