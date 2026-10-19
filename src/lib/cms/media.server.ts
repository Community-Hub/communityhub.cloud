/**
 * Where uploaded pictures live.
 * - BLOB_READ_WRITE_TOKEN set: Vercel Blob (production).
 * - Otherwise a local folder (CMS_MEDIA_DIR, default .cms-media), served at /cms-media/<name>. Dev and tests only.
 * Uploads are never deleted, so an earlier picture stays available as a revert target.
 */
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { checkImage, IMAGE_MIME, mediaName, type ImageType } from "./image.ts";
import { CmsError, MEDIA_LOCAL } from "./validate.ts";
import { isProduction } from "./env.ts";

const blobToken = () => process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
const mediaDir = () => resolve(process.env.CMS_MEDIA_DIR?.trim() || ".cms-media");

export function mediaBackend(): "blob" | "files" | "none" {
  if (blobToken()) return "blob";
  return isProduction() ? "none" : "files";
}

/** Verify and store a picture. Returns the URL to save as the picture's value. */
export async function storeUpload(bytes: Uint8Array): Promise<string> {
  const type = checkImage(bytes); // throws ImageRejected for size or type problems
  const name = mediaName(type, randomBytes(8));
  const backend = mediaBackend();
  if (backend === "blob") {
    const { put } = await import("@vercel/blob");
    const res = await put(`cms/${name}`, Buffer.from(bytes), {
      access: "public",
      contentType: IMAGE_MIME[type],
      addRandomSuffix: false,
      token: blobToken(),
    });
    return res.url;
  }
  if (backend === "files") {
    const dir = mediaDir();
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, name), bytes);
    return `/cms-media/${name}`;
  }
  throw new CmsError("Picture uploads are not set up yet. Add a Vercel Blob store to this project (see CMS.md).", 503);
}

/** Read a locally stored picture for the /cms-media route. Null when missing or the name is not one we made. */
export async function readLocalMedia(name: string): Promise<{ body: Buffer; type: ImageType } | null> {
  if (!MEDIA_LOCAL.test(`/cms-media/${name}`)) return null;
  const ext = name.slice(name.lastIndexOf(".") + 1) as ImageType;
  try {
    return { body: await readFile(join(mediaDir(), name)), type: ext };
  } catch {
    return null;
  }
}
