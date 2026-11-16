/**
 * Sends contact-form messages and demo requests through Resend. Server only.
 *
 *   RESEND_API_KEY  the Resend API key. Without it nothing is sent and the form offers the email address instead.
 *   MAIL_FROM       the sender (default website@communityhub.cloud, whose domain must be verified in Resend).
 *
 * The visitor's address goes in Reply-To, so answering the email answers them. Nothing is ever sent to the visitor.
 */
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
        text: mail.text,
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
