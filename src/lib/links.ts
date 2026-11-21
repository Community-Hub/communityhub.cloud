// One place for every shared destination so a label never points two ways.
export const WHO_HREF = "/communities";
export const PRICING_HREF = "/pricing";
/** The contact page opened on its Book a demo form. */
export const DEMO_HREF = "/contact?mode=demo";
/** Contact us with a subject that names what is being quoted, e.g. "Quote: Data bundle". */
export const quoteHref = (what: string) => `/contact?topic=${encodeURIComponent(`Quote: ${what}`)}`;
export const BRING_HREF = "/bring-dashboard-to-your-community";
export const ORB_HREF = "/#orb";

export const CHAPTER_IDS = ["problem", "who", "engage", "educate", "motivate", "orb", "footer"] as const;

export type ParsedHref =
  | { kind: "internal"; to: string; hash?: string; search?: Record<string, string> }
  | { kind: "external"; href: string };

export function parseHref(href: string): ParsedHref {
  if (!href.startsWith("/") || href.startsWith("//")) return { kind: "external", href };
  const at = href.indexOf("#");
  const beforeHash = at === -1 ? href : href.slice(0, at);
  const hash = at === -1 ? undefined : href.slice(at + 1) || undefined;
  const q = beforeHash.indexOf("?");
  const to = (q === -1 ? beforeHash : beforeHash.slice(0, q)) || "/";
  const search = q === -1 ? undefined : Object.fromEntries(new URLSearchParams(beforeHash.slice(q + 1)));
  return { kind: "internal", to, hash, search };
}
