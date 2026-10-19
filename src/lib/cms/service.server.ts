/**
 * The CMS content service, kept free of the editor sign-in (better-auth, its own database pool) so public page
 * loads on a cold start only pull in the database client and the content code.
 */
import { getSql } from "../db.ts";
import { siteIndex } from "../site-registry.ts";
import { createCmsService, type CmsService } from "./service.ts";

/**
 * Pages are cached by Vercel's CDN for minutes (tag "cms"). After a save, delete that cache so the next visitor sees the edit.
 * Only does anything when running on Vercel; locally and in tests it is a no-op.
 */
function purgeCdn(): void {
  if (!process.env.VERCEL) return;
  import("@vercel/functions")
    .then(({ dangerouslyDeleteByTag }) => dangerouslyDeleteByTag("cms"))
    .catch((err) => console.error("[cms] could not purge the page cache (edits show within 5 minutes anyway):", err instanceof Error ? err.message : err));
}

const g = globalThis as typeof globalThis & { __cmsService__?: Promise<CmsService> };

/** One service per process; a failed start is retried on the next request. */
export function getCms(): Promise<CmsService> {
  g.__cmsService__ ??= getSql()
    .then((sql) => createCmsService({ sql, index: siteIndex, onChange: purgeCdn }))
    .catch((err) => {
      g.__cmsService__ = undefined;
      throw err;
    });
  return g.__cmsService__;
}
