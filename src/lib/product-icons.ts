import { educateBeats, empowerBeats, engageBeats } from "@/lib/content";

const BEATS = [...engageBeats, ...educateBeats, ...empowerBeats];

/** Products with a page of their own but no example on the home page, so no beat carries their icon. */
const EXTRA_ICONS: Record<string, string> = {
  lorawan: "/assets/icon-lorawan.svg",
  studios: "/assets/icon-studios.svg",
};

/** A product's round icon, for the Products menu, the products page and "More in …". */
export function productIcon(id: string): string {
  return BEATS.find((item) => item.id === id)?.icon ?? EXTRA_ICONS[id] ?? "";
}
