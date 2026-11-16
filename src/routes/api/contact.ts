import { createFileRoute } from "@tanstack/react-router";

/**
 * The contact form's endpoint: checks the message and emails it to the Contact us address through Resend.
 * What it answers is described in src/lib/contact/api.server.ts.
 */
export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { handleContact } = await import("@/lib/contact/api.server");
          return await handleContact(request);
        } catch (err) {
          console.error("[contact]", err);
          return new Response(JSON.stringify({ ok: false, error: "Something went wrong. The message was not sent." }), {
            status: 500,
            headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
          });
        }
      },
    },
  },
});
