/**
 * POST /api/contact: checks a contact-form message or a demo request and emails it to the form inbox
 * (`site.formInbox`). Server only.
 *
 * Body (JSON):
 *   message  { kind?: "message", name, email, organization, topic, message, website }
 *   demo     { kind: "demo", name, email, organization, phone, interest, date, window, timeZone, meeting, notes, website }
 *
 * Answers (JSON, never cached), which the forms in src/routes/contact.tsx read:
 *   200 { ok: true }                     sent (also the quiet answer when the hidden "website" field is filled in)
 *   400 { ok: false, fields: {...} }     a field needs fixing; the messages are shown under the fields
 *   400 { ok: false, error }             not JSON, not an object, or an unknown kind
 *   403 / 415 { ok: false, error }       not sent by this site's own page
 *   413 { ok: false, error }             far longer than anything the forms allow
 *   429 { ok: false, error }             too many messages and requests from one address in a short time
 *   503 { ok: false, error }             RESEND_API_KEY is not set, or the form inbox is not an email address
 *   502 { ok: false, error }             Resend did not accept the email
 * The forms show the email address (and ways to send from the visitor's own email) for every answer
 * except 200, 400-with-fields and 429.
 */
import { randomUUID } from "node:crypto";
import { site } from "../site.ts";
import { checkDemo, demoSubject, demoText, readDemo } from "./demo.ts";
import { demoCalendar } from "./ics.ts";
import { canSendMail, MailError, sendFormMail, type FormMail } from "./mail.server.ts";
import { checkContact, cleanText, contactSubject, contactText, isEmailAddress, readContact } from "./validate.ts";

/** Comfortably above the longest message the forms allow (5,000 characters plus the other fields, in UTF-8). */
const MAX_BODY_BYTES = 64 * 1024;
/** At most this many messages and requests, together, from one address in the window. */
const RATE_MAX = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });

/**
 * Only this site's own page sends here: the form posts JSON with fetch from the same origin. A browser on another
 * site cannot post JSON here without a CORS preflight, which this route never grants, and modern browsers say where
 * a request came from in Sec-Fetch-Site.
 */
function refuseForeign(request: Request): Response | null {
  const from = request.headers.get("sec-fetch-site");
  if (from && from !== "same-origin") return json({ ok: false, error: "Messages can only be sent from the contact page." }, 403);
  const type = request.headers.get("content-type") ?? "";
  if (!/^application\/json\b/i.test(type)) return json({ ok: false, error: "Send the message as JSON." }, 415);
  return null;
}

async function readBody(request: Request): Promise<{ body: unknown } | { response: Response }> {
  const tooLong = () => ({ response: json({ ok: false, error: "That message is too long to send." }, 413) });
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return tooLong();
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return tooLong();
  try {
    return { body: JSON.parse(text) };
  } catch {
    return { response: json({ ok: false, error: "The message could not be read." }, 400) };
  }
}

/** The address a request came from, as the host's proxy reports it (Vercel sets x-forwarded-for). */
function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

const g = globalThis as typeof globalThis & { __contactSends__?: Map<string, number[]> };

/**
 * Counts a message or request from `address` and says whether it may go. Kept in this server process, so it slows a
 * person or script that sends again and again; it is not a guarantee across many servers.
 */
function takeSendSlot(address: string, now = Date.now()): boolean {
  const sends = (g.__contactSends__ ??= new Map<string, number[]>());
  const recent = (sends.get(address) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    sends.set(address, recent);
    return false;
  }
  recent.push(now);
  sends.set(address, recent);
  if (sends.size > 2000) {
    for (const [key, times] of sends) if (!times.some((t) => now - t < RATE_WINDOW_MS)) sends.delete(key);
  }
  return true;
}

/**
 * Where messages and requests are delivered: `site.formInbox`, with the editor's saved changes applied first.
 * Null when that is not an email address. Uses the built-in values when the saved changes cannot be loaded quickly.
 */
async function formInbox(): Promise<string | null> {
  try {
    const { getCms } = await import("../cms/service.server.ts");
    await Promise.race([
      getCms().then((cms) => cms.publicState(1000)),
      new Promise((resolve) => setTimeout(resolve, 1500).unref?.()),
    ]);
  } catch (err) {
    console.error("[contact] could not load the saved form inbox, using the built-in one:", err instanceof Error ? err.message : err);
  }
  const inbox = site.formInbox.trim();
  return isEmailAddress(inbox) ? inbox : null;
}

const toBase64 = (text: string) => Buffer.from(text, "utf8").toString("base64");

/** The email for a body, or the field problems that stop it. */
function compose(kind: "message" | "demo", body: unknown): { mail: Omit<FormMail, "to"> } | { fields: Record<string, string> } {
  if (kind === "message") {
    const input = readContact(body);
    const fields = checkContact(input);
    if (Object.keys(fields).length) return { fields };
    return { mail: { replyTo: input.email, subject: contactSubject(input), text: contactText(input) } };
  }
  const input = readDemo(body);
  const fields = checkDemo(input);
  if (Object.keys(fields).length) return { fields };
  const calendar = demoCalendar(input, { uid: `${randomUUID()}@communityhub.cloud`, now: new Date() });
  return {
    mail: {
      replyTo: input.email,
      subject: demoSubject(input),
      text: [
        "Demo request from the Community Hub website.",
        "",
        demoText(input),
        "",
        "The requested time is in the attached calendar file, demo-request.ics. Reply to this email to confirm a time.",
      ].join("\n"),
      attachments: [{ filename: "demo-request.ics", content: toBase64(calendar) }],
    },
  };
}

export async function handleContact(request: Request): Promise<Response> {
  const foreign = refuseForeign(request);
  if (foreign) return foreign;

  const read = await readBody(request);
  if ("response" in read) return read.response;
  const body = read.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ ok: false, error: "The message could not be read." }, 400);

  const rawKind = (body as { kind?: unknown }).kind;
  const kind = rawKind === undefined || rawKind === "message" ? "message" : rawKind === "demo" ? "demo" : null;
  if (!kind) return json({ ok: false, error: "The message could not be read." }, 400);

  // The hidden "website" field is invisible to people; only automated senders fill it in. They are told it
  // worked, so they have no reason to try again, and nothing is sent.
  if (cleanText((body as { website?: unknown }).website)) {
    console.info(`[contact] dropped a ${kind === "demo" ? "demo request" : "message"} that filled in the hidden field`);
    return json({ ok: true });
  }

  const composed = compose(kind, body);
  if ("fields" in composed) return json({ ok: false, fields: composed.fields }, 400);

  if (!canSendMail()) {
    console.error("[contact] RESEND_API_KEY is not set, so nothing was sent. The visitor was shown the email address instead.");
    return json({ ok: false, error: "The website cannot send email right now." }, 503);
  }
  const to = await formInbox();
  if (!to) {
    console.error("[contact] site.formInbox is not an email address, so nothing was sent. Fix it in the editor.");
    return json({ ok: false, error: "The website cannot send email right now." }, 503);
  }
  if (!takeSendSlot(clientAddress(request))) {
    return json({ ok: false, error: "Too many messages from here in a few minutes. Try again later." }, 429, {
      "retry-after": String(RATE_WINDOW_MS / 1000),
    });
  }

  try {
    await sendFormMail({ to, ...composed.mail });
  } catch (err) {
    // Log why, never what the visitor wrote.
    console.error(`[contact] the ${kind === "demo" ? "demo request" : "message"} was not sent:`, err instanceof MailError ? err.message : err);
    return json({ ok: false, error: "The message could not be sent." }, 502);
  }
  return json({ ok: true });
}
