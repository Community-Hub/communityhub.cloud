// One place for every shared destination so a label never points two ways.
import { site } from "@/lib/site";
export const WHO_HREF = "/who";
export const PRICING_HREF = "/pricing";
/** Contact us with a subject that names what is being quoted, e.g. "Quote: Data bundle". */
export const quoteHref = (what: string) =>
  `mailto:${site.contactEmail}?subject=${encodeURIComponent(`Quote: ${what}`)}&body=${encodeURIComponent("Name\nOrganization\nWhat we want to do\n")}`;
export const BRING_HREF = "/demos#bring";
export const ORB_HREF = "/#orb";

export const CHAPTER_IDS = ["problem", "who", "engage", "educate", "motivate", "orb", "footer"] as const;

export type ParsedHref =
  | { kind: "internal"; to: string; hash?: string }
  | { kind: "external"; href: string };

export function parseHref(href: string): ParsedHref {
  if (!href.startsWith("/") || href.startsWith("//")) return { kind: "external", href };
  const at = href.indexOf("#");
  const to = (at === -1 ? href : href.slice(0, at)) || "/";
  const hash = at === -1 ? undefined : href.slice(at + 1) || undefined;
  return { kind: "internal", to, hash };
}
