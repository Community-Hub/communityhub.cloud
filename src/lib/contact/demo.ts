/**
 * Demo requests from /contact ("Book a demo"): fields, rules and email text, shared by the form and
 * POST /api/contact so the browser and the server agree. A request asks for a day and a time window; the team
 * replies by email to confirm, so nothing here is a booked slot.
 */
import { checkSender, cleanText, type Sender, type SenderField } from "./validate.ts";

/** The time windows a visitor can ask for, in their own time zone. The form sends the id. */
export const DEMO_WINDOWS = [
  { id: "morning", name: "Morning", start: 9, end: 12 },
  { id: "midday", name: "Midday", start: 12, end: 14 },
  { id: "afternoon", name: "Afternoon", start: 14, end: 17 },
] as const;
export type DemoWindow = (typeof DEMO_WINDOWS)[number];

/** How to meet. The form sends the id. */
export const DEMO_MEETINGS = [
  { id: "video", name: "Video call" },
  { id: "phone", name: "Phone call" },
  { id: "in-person", name: "In person in Oberlin" },
] as const;

/** What the visitor would like to see: the product groups, or everything. The form sends these exact values. */
export const DEMO_INTERESTS = [
  "The whole platform",
  "Engage: Digital Signage, Phone App, Web Embeddables",
  "Educate: Building Dashboard, Citywide Dashboard, Data Hub, Stories",
  "Motivate and Empower: Community Calendar, Community Voices",
] as const;

export const DEMO_LIMITS = { phone: 40, notes: 2000, timeZone: 64 } as const;
/** How far ahead a day can be asked for. */
export const DEMO_MAX_DAYS_AHEAD = 365;

export type DemoInput = Sender & {
  /** YYYY-MM-DD */
  date: string;
  /** An id from DEMO_WINDOWS. */
  window: string;
  /** IANA name, e.g. America/New_York. */
  timeZone: string;
  /** An id from DEMO_MEETINGS. */
  meeting: string;
  phone: string;
  interest: string;
  notes: string;
  /** The hidden field only automated senders fill in. */
  website: string;
};
export type DemoField = SenderField | "phone" | "interest" | "date" | "window" | "timeZone" | "meeting" | "notes";
export type DemoErrors = Partial<Record<DemoField, string>>;

/** The visible fields, in the order they appear (the first one with a problem gets the focus). */
export const DEMO_FIELDS: readonly DemoField[] = ["name", "email", "organization", "phone", "interest", "date", "window", "timeZone", "meeting", "notes"];

/** Any value (a request body, the form's state) as trimmed text fields. */
export function readDemo(raw: unknown): DemoInput {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    name: cleanText(r.name),
    email: cleanText(r.email),
    organization: cleanText(r.organization),
    date: cleanText(r.date),
    window: cleanText(r.window),
    timeZone: cleanText(r.timeZone),
    meeting: cleanText(r.meeting),
    phone: cleanText(r.phone),
    interest: cleanText(r.interest),
    notes: cleanText(r.notes),
    website: cleanText(r.website),
  };
}

export const demoWindow = (id: string): DemoWindow | undefined => DEMO_WINDOWS.find((w) => w.id === id);
export const meetingName = (id: string) => DEMO_MEETINGS.find((m) => m.id === id)?.name ?? id;
const isDemoInterest = (value: string) => (DEMO_INTERESTS as readonly string[]).includes(value);

/** True for a time zone name this engine knows (America/New_York, UTC, ...). */
export function isTimeZone(value: string): boolean {
  if (!value || value.length > DEMO_LIMITS.timeZone) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** Today's date (YYYY-MM-DD) in a time zone. */
export function todayIn(timeZone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A real calendar day (YYYY-MM-DD) as midnight UTC, or null. */
export function parseDay(value: string): Date | null {
  const m = DAY.exec(value);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d ? date : null;
}

/** The day `days` after a YYYY-MM-DD day. */
export function addDays(day: string, days: number): string {
  const date = parseDay(day);
  if (!date) return day;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export const isWeekend = (day: string) => {
  const weekday = parseDay(day)?.getUTCDay();
  return weekday === 0 || weekday === 6;
};

/** "Saturday" */
export const weekdayName = (day: string) => parseDay(day)?.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long" }) ?? "";

/** "Tuesday, December 1", or "Tuesday, December 1, 2026" with the year. */
export function formatDay(day: string, withYear = false): string {
  const date = parseDay(day);
  if (!date) return day;
  return date.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric", ...(withYear ? { year: "numeric" } : {}) });
}

const hour = (h: number) => (h === 12 ? "noon" : h < 12 ? `${h} am` : `${h - 12} pm`);
/** "9 am–noon" */
export const windowHours = (w: DemoWindow) => `${hour(w.start)}–${hour(w.end)}`;

const PHONE = /^\+?[\d\s().\-/]+(?:\s*(?:ext\.?|x)\s*\d{1,6})?$/i;
function isPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "").length;
  return value.length <= DEMO_LIMITS.phone && digits >= 7 && digits <= 20 && PHONE.test(value);
}

/** Problems with a demo request, by field. Empty when it can be sent. `now` is when it is checked. */
export function checkDemo(input: DemoInput, now = new Date()): DemoErrors {
  const errors: DemoErrors = checkSender(input);

  if (input.phone && !isPhone(input.phone)) errors.phone = "Enter a phone number like 440-555-0123.";
  else if (!input.phone && input.meeting === "phone") errors.phone = "Enter a phone number so we can call you.";

  if (input.interest && !isDemoInterest(input.interest)) errors.interest = "Choose one of the listed options.";

  const zoneKnown = isTimeZone(input.timeZone);
  if (!parseDay(input.date)) errors.date = "Choose a day for the demo.";
  else {
    // "Tomorrow" is the visitor's tomorrow, so the browser's earliest day and this check agree.
    const today = todayIn(zoneKnown ? input.timeZone : "UTC", now);
    if (input.date <= today) errors.date = "Choose a day from tomorrow on.";
    else if (input.date > addDays(today, DEMO_MAX_DAYS_AHEAD)) errors.date = "Choose a day in the next year.";
  }
  if (!demoWindow(input.window)) errors.window = "Choose a time of day.";
  if (!zoneKnown) errors.timeZone = "Choose your time zone.";
  if (!DEMO_MEETINGS.some((m) => m.id === input.meeting)) errors.meeting = "Choose how you would like to meet.";

  if (input.notes.length > DEMO_LIMITS.notes) errors.notes = `Keep the notes under ${DEMO_LIMITS.notes} characters.`;
  return errors;
}

/** The email's subject line. */
export const demoSubject = (input: DemoInput) => `Demo request from ${input.name}${input.organization ? ` (${input.organization})` : ""}`;

/** Every detail of a request, as plain text: the email body, the calendar file's description and the fallbacks' body. */
export function demoText(input: DemoInput): string {
  const w = demoWindow(input.window);
  const lines = [`Name: ${input.name}`, `Email: ${input.email}`];
  if (input.organization) lines.push(`Organization: ${input.organization}`);
  if (input.phone) lines.push(`Phone: ${input.phone}`);
  lines.push(
    "",
    `Day: ${formatDay(input.date, true)}`,
    `Time: ${w ? `${w.name}, ${windowHours(w)}` : input.window}`,
    `Time zone: ${input.timeZone}`,
    `How to meet: ${meetingName(input.meeting)}`,
  );
  if (input.interest) lines.push(`Interested in: ${input.interest}`);
  if (input.notes) lines.push("", "Notes:", input.notes);
  return lines.join("\n");
}
