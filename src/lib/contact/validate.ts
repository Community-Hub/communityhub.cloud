/**
 * The contact form's fields and rules, shared by the form (src/routes/contact.tsx) and POST /api/contact
 * so the browser and the server always agree. Rebuilt from the live site's build (November 2026):
 * same fields, limits, messages, subject line and email text. Demo requests are in demo.ts.
 */

/** The topics a message can carry. The form sends these exact values; the labels people see are in contact-content.ts. */
export const CONTACT_TOPICS = ["Bringing Dashboard to my community", "A specific product", "Pricing", "Research", "Something else"] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const CONTACT_LIMITS = { name: 120, email: 200, organization: 160, message: 5000 } as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmailAddress = (value: string) => EMAIL.test(value);

/** Trimmed text, or "" for anything that is not text. */
export const cleanText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** Who is writing: the fields messages and demo requests share. */
export type Sender = { name: string; email: string; organization: string };
export type SenderField = keyof Sender;

/** What the form sends. `website` is the hidden field only automated senders fill in. */
export type ContactInput = Sender & {
  topic: string;
  message: string;
  website: string;
};
export type ContactField = SenderField | "topic" | "message";
export type ContactErrors = Partial<Record<ContactField, string>>;

/** The visible fields, in the order they appear (the first one with a problem gets the focus). */
export const CONTACT_FIELDS: readonly ContactField[] = ["name", "email", "organization", "topic", "message"];

/** Any value (a request body, the form's state) as trimmed text fields. */
export function readContact(raw: unknown): ContactInput {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    name: cleanText(r.name),
    email: cleanText(r.email),
    organization: cleanText(r.organization),
    topic: cleanText(r.topic),
    message: cleanText(r.message),
    website: cleanText(r.website),
  };
}

export const isContactTopic = (value: string): value is ContactTopic => (CONTACT_TOPICS as readonly string[]).includes(value);

/** Problems with the name, email and organization. */
export function checkSender(input: Sender): Partial<Record<SenderField, string>> {
  const errors: Partial<Record<SenderField, string>> = {};
  if (!input.name) errors.name = "Enter your name.";
  else if (input.name.length > CONTACT_LIMITS.name) errors.name = `Use ${CONTACT_LIMITS.name} characters or fewer.`;

  if (!input.email) errors.email = "Enter your email address so we can reply.";
  else if (input.email.length > CONTACT_LIMITS.email || !isEmailAddress(input.email)) errors.email = "Enter an email address like name@example.org.";

  if (input.organization.length > CONTACT_LIMITS.organization) errors.organization = `Use ${CONTACT_LIMITS.organization} characters or fewer.`;
  return errors;
}

/** Problems with a message, by field. Empty when it can be sent. */
export function checkContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = checkSender(input);
  if (input.topic && !isContactTopic(input.topic)) errors.topic = "Choose one of the listed topics.";

  if (!input.message) errors.message = "Write a short message.";
  else if (input.message.length > CONTACT_LIMITS.message) errors.message = `Keep the message under ${CONTACT_LIMITS.message} characters.`;
  return errors;
}

/** The email's subject line. */
export const contactSubject = (input: ContactInput) =>
  `Website inquiry from ${input.name}${input.organization ? ` (${input.organization})` : ""}`;

/** The email's text: who wrote, then their message. Also the body of the "write from your own email" fallbacks. */
export function contactText(input: ContactInput): string {
  const lines = [`Name: ${input.name}`, `Email: ${input.email}`];
  if (input.organization) lines.push(`Organization: ${input.organization}`);
  if (input.topic) lines.push(`Topic: ${input.topic}`);
  lines.push("", input.message);
  return lines.join("\n");
}
