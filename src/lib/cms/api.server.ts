/** The editor API behind /api/cms/*. */
import { MAX_IMAGE_BYTES, ImageRejected } from "./image.ts";
import { storeUpload } from "./media.server.ts";
import { getCms, json, requireAdmin } from "./server.ts";
import { CmsError } from "./validate.ts";
import { readBodyLimited } from "./body.ts";

const MAX_BODY = 64_000;
const str = (v: unknown, max = 400) => {
  if (typeof v !== "string" || v.length > max) throw new CmsError("Bad request.");
  return v;
};

async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) throw new CmsError("Bad request.", 415);
  const text = new TextDecoder().decode(await readBodyLimited(request, MAX_BODY, "That is too much to save at once."));
  try {
    const body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body as Record<string, unknown>;
  } catch {
    throw new CmsError("Bad request.");
  }
}

/** Returns null for an unknown action (the route answers 404). */
export async function handleApi(request: Request, action: string): Promise<Response | null> {
  const method = request.method;
  if (action === "session" && method === "GET") {
    // Not an error when signed out: the page uses this to choose between the sign-in form and the editor.
    try {
      const admin = await requireAdmin(request);
      return json({ user: admin });
    } catch (err) {
      if (err instanceof Response && err.status === 401) return json({ user: null });
      throw err;
    }
  }

  const admin = await requireAdmin(request);
  const cms = await getCms();

  if (method === "GET") {
    const url = new URL(request.url);
    if (action === "overview") return json(await cms.overview());
    if (action === "history") {
      const key = url.searchParams.get("key");
      const limit = Math.min(Number(url.searchParams.get("limit") ?? 50) || 50, 200);
      const before = url.searchParams.get("before");
      return json({ revisions: await cms.history(key, limit, before ? Number(before) || undefined : undefined) });
    }
    return null;
  }
  if (method !== "POST") return null;

  if (action === "upload") {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) throw new CmsError("Bad request.", 415);
    const raw = await readBodyLimited(request, MAX_IMAGE_BYTES + 20_000, "The picture is too large (limit 4 MB).");
    const form = await new Response(raw as unknown as BodyInit, { headers: { "content-type": contentType } }).formData().catch(() => {
      throw new CmsError("Bad request.");
    });
    const rawKey = form.get("key");
    const key = rawKey === null ? null : str(rawKey);
    const alt = form.get("alt");
    const file = form.get("file");
    if (!(file instanceof File)) throw new CmsError("Choose a picture to upload.");
    if (key !== null) cms.checkAlt(key, alt); // alt text is checked before anything is stored
    let url: string;
    try {
      url = await storeUpload(new Uint8Array(await file.arrayBuffer()));
    } catch (err) {
      if (err instanceof ImageRejected) throw new CmsError(err.message, 400);
      throw err;
    }
    // Without a key the picture is only stored (for a new list item); it goes live when the list is saved.
    if (key !== null) await cms.saveImage(key, url, alt, admin.email);
    return json({ ok: true, url });
  }

  const body = await readJson(request);
  switch (action) {
    case "save": {
      const key = str(body.key);
      const { warning } = await cms.saveSlot(key, body.value, admin.email);
      return json({ ok: true, warning });
    }
    case "alt":
      await cms.saveAlt(str(body.key), body.alt, admin.email);
      return json({ ok: true });
    case "reset":
      await cms.reset(str(body.key), admin.email);
      return json({ ok: true });
    case "section":
      if (typeof body.hidden !== "boolean") throw new CmsError("Bad request.");
      await cms.setSection(str(body.path), str(body.id), body.hidden, admin.email);
      return json({ ok: true });
    case "list":
      await cms.saveList(str(body.path), body.list, admin.email);
      return json({ ok: true });
    case "revert": {
      const id = Number(body.revisionId);
      if (!Number.isSafeInteger(id) || id < 1) throw new CmsError("Bad request.");
      await cms.revert(id, admin.email);
      return json({ ok: true });
    }
    default:
      return null;
  }
}
