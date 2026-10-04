/** Public feeds are untrusted JSON. Validate the fields that the UI consumes. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function number(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
export interface CalendarSession {
  postId: string | number;
  postName: string;
  start: number;
  end: number;
}
export interface CalendarData {
  sessions: CalendarSession[];
}
export function calendarData(value: unknown): CalendarData {
  if (!isRecord(value) || !Array.isArray(value.sessions))
    throw new Error("Invalid calendar response");
  return {
    sessions: value.sessions.filter(
      (session): session is CalendarSession =>
        isRecord(session) &&
        (typeof session.postId === "string" ||
          typeof session.postId === "number") &&
        typeof session.postName === "string" &&
        typeof session.start === "number" &&
        typeof session.end === "number",
    ),
  };
}
export interface JobPost {
  name: string;
  approved?: boolean;
  public?: boolean;
  isAnnouncement?: boolean;
  createdAt: number;
  sponsors: { name: string }[];
  employmentType: number;
}
export interface JobsData {
  count: number;
  limit: number;
  posts: JobPost[];
}
export interface DisplayJob {
  name: string;
  org: string;
  kind: string;
  at: number;
}
export function jobsData(value: unknown): JobsData {
  if (!isRecord(value) || !Array.isArray(value.posts))
    throw new Error("Invalid jobs response");
  const posts: JobPost[] = [];
  for (const post of value.posts) {
    if (!isRecord(post) || typeof post.name !== "string") continue;
    posts.push({
      name: post.name,
      approved: typeof post.approved === "boolean" ? post.approved : undefined,
      public: typeof post.public === "boolean" ? post.public : undefined,
      isAnnouncement: Boolean(post.isAnnouncement),
      createdAt: number(post.createdAt),
      employmentType: number(post.employmentType),
      sponsors: Array.isArray(post.sponsors)
        ? post.sponsors.filter(
            (sponsor): sponsor is { name: string } =>
              isRecord(sponsor) && typeof sponsor.name === "string",
          )
        : [],
    });
  }
  return { count: number(value.count), limit: number(value.limit, 10), posts };
}
export interface Orb {
  resource: string;
  building: string;
  color: string;
  status: string;
}
export function orbData(value: unknown): { orbs: Orb[] } {
  if (!isRecord(value) || !Array.isArray(value.orbs))
    throw new Error("Invalid orb response");
  return {
    orbs: value.orbs.filter(
      (orb): orb is Orb =>
        isRecord(orb) &&
        typeof orb.resource === "string" &&
        typeof orb.building === "string" &&
        typeof orb.color === "string" &&
        typeof orb.status === "string",
    ),
  };
}
export interface ChartPoint {
  timestamp: string;
  storageValue: number | null;
  typicalValue: number | null;
  binPosition: number | null;
}
export interface ChartData {
  data: { data: ChartPoint[] }[];
  bins: number[];
}
export function chartData(value: unknown): ChartData {
  if (!isRecord(value) || !Array.isArray(value.data))
    throw new Error("Invalid chart response");
  const data = value.data.map((series) => {
    if (!isRecord(series) || !Array.isArray(series.data))
      throw new Error("Invalid chart series");
    return {
      data: series.data
        .filter(
          (point): point is Record<string, unknown> & { timestamp: string } =>
            isRecord(point) && typeof point.timestamp === "string",
        )
        .map((point) => ({
          timestamp: point.timestamp,
          storageValue:
            typeof point.storageValue === "number" ? point.storageValue : null,
          typicalValue:
            typeof point.typicalValue === "number" ? point.typicalValue : null,
          binPosition:
            typeof point.binPosition === "number" ? point.binPosition : null,
        })),
    };
  });
  return {
    data,
    bins: Array.isArray(value.bins)
      ? value.bins.filter((bin): bin is number => typeof bin === "number")
      : [],
  };
}
export interface StorySlide {
  t: string;
  c: string;
  d: string;
}
export function storySlides(value: unknown): StorySlide[] {
  if (
    !Array.isArray(value) ||
    !value.every(
      (slide): slide is StorySlide =>
        isRecord(slide) &&
        typeof slide.t === "string" &&
        typeof slide.c === "string" &&
        typeof slide.d === "string",
    )
  )
    throw new Error("Invalid storyboard data");
  return value;
}
export interface EmbedPreset {
  key: string;
  name: string;
  site: string;
  host: string;
  menu: string[];
  page: string;
  tagline: string;
  head: string;
  tabs: string;
  list: string;
  scheme: string;
  font: string;
  body: string;
  radius: number;
  spacing: string;
  logo: string;
  v: {
    p: string;
    acc: string;
    bg: string;
    surf: string;
    text: string;
    muted: string;
    line: string;
    head: string;
  };
}
export interface EmbedData {
  presets: EmbedPreset[];
  fonts: Record<string, { label: string; stack: string }>;
  spacing: Record<string, number>;
}
function isPreset(value: unknown): value is EmbedPreset {
  return (
    isRecord(value) &&
    [
      "key",
      "name",
      "site",
      "host",
      "page",
      "tagline",
      "head",
      "tabs",
      "list",
      "scheme",
      "font",
      "body",
      "spacing",
      "logo",
    ].every((key) => typeof value[key] === "string") &&
    typeof value.radius === "number" &&
    Array.isArray(value.menu) &&
    value.menu.every((item) => typeof item === "string") &&
    isRecord(value.v) &&
    ["p", "acc", "bg", "surf", "text", "muted", "line", "head"].every(
      (key) => isRecord(value.v) && typeof value.v[key] === "string",
    )
  );
}
export function embedData(value: unknown): EmbedData {
  if (
    !isRecord(value) ||
    !Array.isArray(value.presets) ||
    !value.presets.every(isPreset) ||
    !isRecord(value.fonts) ||
    !isRecord(value.spacing)
  )
    throw new Error("Invalid embedded demo data");
  const fonts: EmbedData["fonts"] = {};
  for (const [key, font] of Object.entries(value.fonts)) {
    if (
      !isRecord(font) ||
      typeof font.label !== "string" ||
      typeof font.stack !== "string"
    )
      throw new Error("Invalid font definition");
    fonts[key] = { label: font.label, stack: font.stack };
  }
  const spacing: Record<string, number> = {};
  for (const [key, size] of Object.entries(value.spacing)) {
    if (typeof size !== "number") throw new Error("Invalid spacing definition");
    spacing[key] = size;
  }
  return { presets: value.presets, fonts, spacing };
}
