/** Picture upload rules: what is accepted, how big, and what to call the stored file. */

export const MAX_IMAGE_BYTES = 4_000_000; // Vercel functions accept bodies up to 4.5 MB
export type ImageType = "jpg" | "png" | "webp";
export const IMAGE_MIME: Record<ImageType, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

/** Identify the picture by its first bytes. The browser's declared type and file name are never trusted. */
export function sniffImage(b: Uint8Array): ImageType | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return "png";
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && // RIFF
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50 // WEBP
  ) return "webp";
  return null;
}

export class ImageRejected extends Error {}

/** Throws ImageRejected with a message for the editor, or returns the verified type. */
export function checkImage(bytes: Uint8Array): ImageType {
  if (bytes.length === 0) throw new ImageRejected("The file is empty.");
  if (bytes.length > MAX_IMAGE_BYTES) {
    throw new ImageRejected(`The picture is ${(bytes.length / 1e6).toFixed(1)} MB; the limit is ${MAX_IMAGE_BYTES / 1e6} MB. Save it smaller and try again.`);
  }
  const type = sniffImage(bytes);
  if (!type) throw new ImageRejected("Only jpg, png and webp pictures are accepted (no SVG or other types).");
  return type;
}

/** A safe stored name that does not come from the uploaded file. */
export function mediaName(type: ImageType, rand: Uint8Array): string {
  let id = "";
  for (const n of rand) id += n.toString(16).padStart(2, "0");
  return `${Date.now().toString(36)}-${id}.${type}`;
}
