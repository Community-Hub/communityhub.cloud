/**
 * Sends contact-form messages and demo requests through Resend. Server only.
 *
 *   RESEND_API_KEY  the Resend API key. Without it nothing is sent and the form offers the email address instead.
 *   MAIL_FROM       the sender (default website@communityhub.cloud, whose domain must be verified in Resend).
 *
 * The visitor's address goes in Reply-To, so answering the email answers them. Nothing is ever sent to the visitor.
 */
import { randomUUID } from "node:crypto";

const RESEND_URL = "https://api.resend.com/emails";
export const DEFAULT_MAIL_FROM = "website@communityhub.cloud";
const SEND_TIMEOUT_MS = 10_000;

const read = (key: string) => process.env[key]?.trim() || undefined;

/** True when there is a Resend key to send with. */
export const canSendMail = () => !!read("RESEND_API_KEY");
export const mailFrom = () => read("MAIL_FROM") ?? DEFAULT_MAIL_FROM;

export type FormMail = {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  /** Files to attach; `content` is base64. */
  attachments?: { filename: string; content: string }[];
};

/** Sending failed. The message is for the server log, never for the visitor. */
export class MailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MailError";
  }
}

/** A header value on one line (a name with a line break in it cannot add headers). */
const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();

/** Where every notification says it came from, so the team (and a mail filter) can see it is the site's own form. */
const ORIGIN_LINE = "Sent from the contact form on communityhub.cloud.";

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/**
 * The HTML version of a plain-text notification: the same words, paragraph by paragraph, in a plain layout. Mail
 * with both a text and an HTML part is the normal shape of real mail; text-only mail from a young domain is more
 * often filed as spam.
 */
function htmlFor(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => `<p style="margin:0 0 16px">${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
  return [
    '<!doctype html><html><head><meta charset="utf-8"></head>',
    '<body style="margin:0;padding:24px;background:#ffffff;color:#152019;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5">',
    `<div style="max-width:600px">${paragraphs}`,
    `<p style="margin:24px 0 0;color:#5f6b63;font-size:13px">${escapeHtml(ORIGIN_LINE)}</p>`,
    "</div></body></html>",
  ].join("");
}

/** Email one checked message or request. Throws MailError when Resend is not set up or does not accept it. */
export async function sendFormMail(mail: FormMail): Promise<void> {
  const key = read("RESEND_API_KEY");
  if (!key) throw new MailError("RESEND_API_KEY is not set.");
  let res: Response;
  try {
    res = await fetch(RESEND_URL, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: mailFrom(),
        to: [mail.to],
        reply_to: mail.replyTo,
        subject: oneLine(mail.subject),
        text: `${mail.text}\n\n${ORIGIN_LINE}`,
        html: htmlFor(mail.text),
        // A distinct id on every notification, so Gmail lists each one on its own instead of folding them together.
        headers: { "X-Entity-Ref-ID": randomUUID() },
        ...(mail.attachments?.length ? { attachments: mail.attachments } : {}),
      }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
  } catch (err) {
    throw new MailError(`Resend could not be reached: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!res.ok) {
    // Resend explains itself in the body (an unverified sender domain, a bad key); it never echoes the message.
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    throw new MailError(`Resend answered ${res.status}${detail ? `: ${detail}` : ""}`);
  }
}
