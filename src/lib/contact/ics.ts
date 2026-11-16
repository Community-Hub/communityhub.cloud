/**
 * The calendar file attached to a demo request (demo-request.ics): one tentative event for the requested day and
 * time window. Times are written in UTC, converted from the visitor's time zone, so every calendar app places it
 * correctly without a time zone table in the file.
 */
import { demoText, demoWindow, meetingName, type DemoInput } from "./demo.ts";

const pad = (n: number) => String(n).padStart(2, "0");
/** 20261201T140000Z */
const utcStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

/** How far a time zone's clocks are ahead of UTC at an instant, in minutes. */
function offsetMinutes(at: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(at);
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const wall = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"), part("second"));
  return Math.round((wall - Math.floor(at.getTime() / 1000) * 1000) / 60000);
}

/** The instant a clock in `timeZone` shows `hour`:00 on `day` (YYYY-MM-DD). */
export function zonedInstant(day: string, hour: number, timeZone: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  const wall = Date.UTC(y, m - 1, d, hour);
  // Twice, so a day when the clocks change still lands on the right hour.
  let at = wall - offsetMinutes(new Date(wall), timeZone) * 60000;
  at = wall - offsetMinutes(new Date(at), timeZone) * 60000;
  return new Date(at);
}

/** Text value escaping (RFC 5545 3.3.11). */
const escapeText = (text: string) => text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r\n|\r|\n/g, "\\n");

const encoder = new TextEncoder();
/** Lines of at most 75 bytes, continued on the next line after a space (RFC 5545 3.1). */
function fold(line: string): string {
  if (encoder.encode(line).length <= 75) return line;
  const out: string[] = [];
  let current = "";
  let limit = 75;
  for (const char of line) {
    if (encoder.encode(current + char).length > limit) {
      out.push(current);
      current = char;
      limit = 74; // the leading space of a continued line counts
    } else current += char;
  }
  out.push(current);
  return out.join("\r\n ");
}

/** The calendar file for a checked demo request. */
export function demoCalendar(input: DemoInput, { uid, now }: { uid: string; now: Date }): string {
  const w = demoWindow(input.window);
  if (!w) throw new Error(`Unknown time window: ${input.window}`);
  const who = input.organization ? `${input.name} (${input.organization})` : input.name;
  const place = input.meeting === "phone" && input.phone ? `${meetingName(input.meeting)}: ${input.phone}` : meetingName(input.meeting);
  const description = `Requested on the Community Hub contact page. Reply to ${input.email} to confirm the time.\n\n${demoText(input)}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Community Hub//Contact page//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${utcStamp(zonedInstant(input.date, w.start, input.timeZone))}`,
    `DTEND:${utcStamp(zonedInstant(input.date, w.end, input.timeZone))}`,
    `SUMMARY:${escapeText(`Community Hub demo: ${who}`)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(place)}`,
    "STATUS:TENTATIVE",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
