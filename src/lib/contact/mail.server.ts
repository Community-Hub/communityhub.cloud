/**
 * Sends contact-form messages and demo requests, and the editor's sign-in codes. Server only.
 *
 * Two services can carry the mail. Postmark is used when its token is set, because it is the service the organisation
 * already sends from communityhub.cloud with (mail@communityhub.cloud, the calendar and Data Hub notices), and that
 * mail reaches Oberlin inboxes. Resend is the fallback; its only verified domain is communityhb.tech, registered in
 * October 2026, and Oberlin's mail system removes mail from it after accepting it (found 21 Nov 2026: Resend said
 * "delivered", the mailbox held nothing, not even in spam).
 *
 *   POSTMARK_SERVER_TOKEN  a Postmark server token for an account where communityhub.cloud is verified. Preferred.
 *   POSTMARK_FROM          the Postmark sender (default "Community Hub <mail@communityhub.cloud>", the address that
 *                          account already sends from).
 *   RESEND_API_KEY         the Resend API key, used when there is no Postmark token.
 *   MAIL_FROM              the Resend sender (default website@communityhub.cloud, whose domain must be verified in Resend).
 *
 * With neither key nothing is sent: the form offers the email address instead, and nobody can sign in to the editor.
 *
 * The visitor's address goes in Reply-To, so answering the email answers them. Nothing is ever sent to the visitor.
 */
import { randomUUID } from "node:crypto";
import { stripInvisible } from "../cms/marks.ts";

const RESEND_URL = "https://api.resend.com/emails";
const POSTMARK_URL = "https://api.postmarkapp.com/email";
export const DEFAULT_MAIL_FROM = "website@communityhub.cloud";
export const DEFAULT_POSTMARK_FROM = "Community Hub <mail@communityhub.cloud>";
const SEND_TIMEOUT_MS = 10_000;

const read = (key: string) => process.env[key]?.trim() || undefined;

/** Which service carries the mail: Postmark when its token is set, else Resend, else nothing. */
export const mailProvider = (): "postmark" | "resend" | null => (read("POSTMARK_SERVER_TOKEN") ? "postmark" : read("RESEND_API_KEY") ? "resend" : null);
/** True when there is a key to send with. */
export const canSendMail = () => mailProvider() !== null;
export const mailFrom = () => (mailProvider() === "postmark" ? (read("POSTMARK_FROM") ?? DEFAULT_POSTMARK_FROM) : (read("MAIL_FROM") ?? DEFAULT_MAIL_FROM));

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
function htmlFor(text: string, footer: string = ORIGIN_LINE): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => `<p style="margin:0 0 16px">${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
  return [
    '<!doctype html><html><head><meta charset="utf-8"></head>',
    '<body style="margin:0;padding:24px;background:#ffffff;color:#152019;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5">',
    `<div style="max-width:600px">${paragraphs}`,
    `<p style="margin:24px 0 0;color:#5f6b63;font-size:13px">${escapeHtml(footer)}</p>`,
    "</div></body></html>",
  ].join("");
}

/** Email one checked message or request. Throws MailError when Resend is not set up or does not accept it. */
export async function sendFormMail(mail: FormMail): Promise<void> {
  await sendMail({ ...mail, footer: ORIGIN_LINE });
}

/** One plain email with a closing line saying where it came from. `replyTo` only when a person should be answered. */
export async function sendMail(mail: Omit<FormMail, "replyTo"> & { replyTo?: string; footer: string }): Promise<void> {
  const provider = mailProvider();
  if (!provider) throw new MailError("Neither POSTMARK_SERVER_TOKEN nor RESEND_API_KEY is set.");
  // A product or plan name the form quotes may carry an editor's bold or italic as invisible marks: mail is plain.
  const body = stripInvisible(mail.text);
  const subject = stripInvisible(oneLine(mail.subject));
  const text = `${body}\n\n${mail.footer}`;
  const html = htmlFor(body, mail.footer);
  // A distinct id on every notification, so Gmail lists each one on its own instead of folding them together.
  const ref = randomUUID();
  const name = provider === "postmark" ? "Postmark" : "Resend";
  const request: { url: string; headers: Record<string, string>; body: unknown } =
    provider === "postmark"
      ? {
          url: POSTMARK_URL,
          headers: { "x-postmark-server-token": read("POSTMARK_SERVER_TOKEN")!, accept: "application/json", "content-type": "application/json" },
          body: {
            From: mailFrom(),
            To: mail.to,
            ...(mail.replyTo ? { ReplyTo: mail.replyTo } : {}),
            Subject: subject,
            TextBody: text,
            HtmlBody: html,
            MessageStream: "outbound",
            Headers: [{ Name: "X-Entity-Ref-ID", Value: ref }],
            ...(mail.attachments?.length
              ? { Attachments: mail.attachments.map((file) => ({ Name: file.filename, Content: file.content, ContentType: contentTypeOf(file.filename) })) }
              : {}),
          },
        }
      : {
          url: RESEND_URL,
          headers: { authorization: `Bearer ${read("RESEND_API_KEY")!}`, "content-type": "application/json" },
          body: {
            from: mailFrom(),
            to: [mail.to],
            ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
            subject,
            text,
            html,
            headers: { "X-Entity-Ref-ID": ref },
            ...(mail.attachments?.length ? { attachments: mail.attachments } : {}),
          },
        };
  let res: Response;
  try {
    res = await fetch(request.url, { method: "POST", headers: request.headers, body: JSON.stringify(request.body), signal: AbortSignal.timeout(SEND_TIMEOUT_MS) });
  } catch (err) {
    throw new MailError(`${name} could not be reached: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!res.ok) {
    // The service explains itself in the body (an unverified sender, a bad key); it never echoes the message.
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    throw new MailError(`${name} answered ${res.status}${detail ? `: ${detail}` : ""}`);
  }
}

/** Postmark wants a type for each attachment; the site only ever attaches a calendar file. */
const contentTypeOf = (filename: string) => (/\.ics$/i.test(filename) ? "text/calendar" : "application/octet-stream");
