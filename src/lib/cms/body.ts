import { CmsError } from "./validate.ts";

/** Reads the body while counting, and stops as soon as it passes `max` bytes (Content-Length can be missing or wrong). */
export async function readBodyLimited(request: Request, max: number, tooBig: string): Promise<Uint8Array> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > max) throw new CmsError(tooBig, 413);
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel().catch(() => {});
      throw new CmsError(tooBig, 413);
    }
    chunks.push(value);
  }
  const all = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) {
    all.set(c, at);
    at += c.byteLength;
  }
  return all;
}
