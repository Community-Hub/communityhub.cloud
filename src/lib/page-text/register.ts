/**
 * Wording that is written for one page or one component, and so travels with that page's code instead of with every
 * page. Each file in this folder holds the wording of one source file and registers it with the editor here, so it is
 * listed, saved and applied like all other wording ("every text on the screen can be changed", the owner, 21 Nov 2026).
 *
 * The browser registers a file's wording when that page's code loads. The server registers all of it up front
 * (./all.ts, loaded with the content service), because the editor must list and check every entry.
 */
import { siteIndex } from "../site-registry.ts";

export function registerText<T extends Record<string, unknown>>(name: string, page: string, value: T): T {
  siteIndex.extend({ name: `text.${name}`, page, value });
  return value;
}
