import { createFileRoute } from "@tanstack/react-router";
import { PUBLIC_ROUTES } from "@/lib/legacy-redirects";

/** Sitemap for the current public routes (the old site served /sitemap.xml). */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(
          '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
            [...PUBLIC_ROUTES].sort().map((p) => `<url><loc>https://www.communityhub.cloud${p === "/" ? "/" : p}</loc></url>`).join("") +
            "</urlset>\n",
          { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } },
        ),
    },
  },
});
