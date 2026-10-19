/** Input rules for everything an editor can save. Pure, no imports beyond the core types. */
import type { SlotKind } from "./core.ts";

/** An error whose message is safe to show to the editor. */
export class CmsError extends Error {
  readonly status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "CmsError";
    this.status = status;
  }
}

export const MAX_TEXT = 2000;
export const MAX_ALT = 300;
export const MAX_LINK = 500;

/** Where uploaded pictures live: our own media route (dev/test) or this project's Vercel Blob. */
export const MEDIA_LOCAL = /^\/cms-media\/[a-z0-9][a-z0-9._-]{0,80}\.(jpg|png|webp)$/;
const MEDIA_BLOB_PATH = /^https:\/\/([a-z0-9]+\.public\.blob\.vercel-storage\.com)\/[A-Za-z0-9._\-/]{1,200}\.(jpg|png|webp)$/;
/**
 * Host of this site's public Blob store, from the store id inside BLOB_READ_WRITE_TOKEN
 * (vercel_blob_rw_<storeId>_<secret>). Null without a valid token. Read here, not via env.ts, because the browser bundle imports this file.
 */
export function blobHost(): string | null {
  const token = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.BLOB_READ_WRITE_TOKEN ?? "";
  const id = /^vercel_blob_rw_([A-Za-z0-9]+)_/.exec(token.trim())?.[1];
  return id ? `${id.toLowerCase()}.public.blob.vercel-storage.com` : null;
}
/** A picture URL on this site's own Blob store only. */
export const isOwnBlobUrl = (v: string): boolean => {
  const host = blobHost();
  return !!host && MEDIA_BLOB_PATH.exec(v)?.[1] === host;
};

// eslint-disable-next-line no-control-regex
const CONTROL = new RegExp("[\\x00-\\x08\\x0b\\x0c\\x0e-\\x1f\\x7f" + String.fromCharCode(0x2028, 0x2029) + "]");
const LINK_OK = /^(\/(?![\/\\])[^\s]*|#[^\s]*|https:\/\/[^\s/][^\s]*|http:\/\/[^\s/][^\s]*|mailto:[^\s]+|tel:[+0-9().\-\s]+)$/i;
const EMAIL_OK = /^[^\s@<>"',;()[\]\\]+@[^\s@<>"',;()[\]\\]+\.[^\s@<>"',;()[\]\\]{2,}$/;

/**
 * Warn when a text is much longer than the one in the code. The layout is fixed to one
 * screen per section, so a very long text can push things off the screen.
 */
export function lengthWarning(def: string, value: string): string | null {
  if (def.length === 0) return value.length > 120 ? "This is long for the space it sits in; check the preview." : null;
  const limit = Math.max(Math.ceil(def.length * 1.3) + 12, 24);
  if (value.length <= limit) return null;
  return `This is ${value.length} characters; the original is ${def.length}. A much longer text may not fit on the screen without scrolling. Check the preview.`;
}

/**
 * Normalise and validate one value. Returns the value to store; throws CmsError.
 * Text is plain text only: it is stored as typed and always escaped when drawn, but control
 * characters are refused. Angle brackets are allowed (shown literally).
 */
export function checkValue(kind: SlotKind, raw: unknown, def = ""): string {
  if (typeof raw !== "string") throw new CmsError("Value must be text.");
  const value = raw.replace(/\r\n?/g, "\n");
  if (CONTROL.test(value)) throw new CmsError("That text has characters that are not allowed.");
  switch (kind) {
    case "text": {
      const v = value.trim();
      if (!v) throw new CmsError("Text cannot be empty. Use Reset to go back to the original.");
      if (v.length > MAX_TEXT) throw new CmsError(`Text is too long (limit ${MAX_TEXT} characters).`);
      return v;
    }
    case "alt": {
      const v = value.trim();
      if (!v && def !== "") throw new CmsError("Describe the picture for screen readers (alt text is required).");
      if (v.length > MAX_ALT) throw new CmsError(`Alt text is too long (limit ${MAX_ALT} characters).`);
      return v;
    }
    case "link": {
      const v = value.trim();
      if (!v || v.length > MAX_LINK || !LINK_OK.test(v)) {
        throw new CmsError("Links must start with / (a page on this site), #, https://, mailto: or tel:.");
      }
      return v;
    }
    case "email": {
      const v = value.trim();
      if (v.length > 200 || !EMAIL_OK.test(v)) throw new CmsError("That does not look like an email address.");
      return v;
    }
    case "image": {
      const v = value.trim();
      if (v === def || MEDIA_LOCAL.test(v) || isOwnBlobUrl(v)) return v;
      throw new CmsError("Pictures must be uploaded here (jpg, png or webp).");
    }
  }
}

const TOKEN = /^(d\d{1,3}|n[a-z0-9]{6,16})$/;
export const isToken = (t: unknown): t is string => typeof t === "string" && TOKEN.test(t);
export const MAX_LIST_ITEMS = 60;
