export type BuildingKind = "residence" | "lab" | "dining" | "library";
export type Resource = "electricity" | "water";

const gauss = (hour: number, center: number, width: number) =>
  Math.exp(-((hour - center) ** 2) / (2 * width * width));

/** Illustrative week-long load shape. Not a live campus feed. */
export function sample(
  hour: number,
  day: number,
  kind: BuildingKind,
  resource: Resource,
): number {
  const weekend = day >= 5 ? 1 : 0;
  let value = 0.2;

  if (kind === "residence") {
    value =
      0.22 +
      gauss(hour, 7.4, 1.3) * 0.26 +
      gauss(hour, 20.2, 2.1) * 0.64 +
      weekend * 0.07;
  } else if (kind === "lab") {
    value = 0.6 + gauss(hour, 13.2, 3.1) * 0.32 - weekend * 0.18;
  } else if (kind === "dining") {
    value =
      0.1 +
      gauss(hour, 8, 0.65) * 0.32 +
      gauss(hour, 12.2, 0.85) * 0.8 +
      gauss(hour, 18.1, 0.85) * 0.62;
    if (weekend) value *= 0.7;
  } else {
    value =
      0.15 +
      gauss(hour, 14.5, 3.2) * 0.46 +
      gauss(hour, 20.5, 1.5) * 0.2 -
      weekend * 0.06;
  }

  if (resource === "water") {
    value = 0.16 + (value - 0.16) * 0.45;
    value += gauss(hour, 7.1, 1.05) * 0.38 + gauss(hour, 21.2, 1.2) * 0.3;
    if (kind === "dining") value += gauss(hour, 12.2, 0.7) * 0.22;
  }

  return Math.min(1, Math.max(0.05, value));
}

export function signatureStats(kind: BuildingKind, resource: Resource) {
  let peak = 0;
  let peakHour = 0;
  let trough = 1;
  let weekday = 0;
  let weekend = 0;

  for (let day = 0; day < 7; day += 1) {
    for (let hour = 0; hour < 24; hour += 1) {
      const value = sample(hour, day, kind, resource);
      if (value > peak) {
        peak = value;
        peakHour = hour;
      }
      trough = Math.min(trough, value);
      if (day >= 5) weekend += value;
      else weekday += value;
    }
  }

  weekday /= 5 * 24;
  weekend /= 2 * 24;
  const shift = Math.round(((weekend - weekday) / weekday) * 100);
  const hourLabel = `${peakHour % 12 === 0 ? 12 : peakHour % 12}${peakHour < 12 ? "a" : "p"}`;

  return {
    peakHour: hourLabel,
    baseload: `${Math.round(trough * 100)}%`,
    weekend: `${shift > 0 ? "+" : ""}${shift}%`,
  };
}

export const BUILDING_COPY: Record<
  BuildingKind,
  { label: string; line: string }
> = {
  residence: {
    label: "Residence",
    line: "Halls wake twice. A morning shoulder, then the real peak after dark, when everyone is back.",
  },
  lab: {
    label: "Lab",
    line: "Labs barely sleep. The signature is a high baseload with a midday plateau, and a weekend that finally exhales.",
  },
  dining: {
    label: "Dining",
    line: "Three pulses a day. Breakfast, the noon rush, dinner. The building tells you when the campus eats.",
  },
  library: {
    label: "Library",
    line: "A long afternoon held open into the evening. Weekend use drops, but it does not go quiet.",
  },
};
