/**
 * Host routing for the editor. Runs first on every request (see src/start.ts).
 *
 * - The editor host (ADMIN_HOST) serves only the editor: `/` goes to `/admin`, public pages are 404.
 * - The public host answers 404 for /admin and the editor APIs.
 * - With ADMIN_HOST unset: local development serves everything on one host; production serves no editor.
 */
import { isAdminHost, isDevOrTest, onDedicatedAdminHost } from "./env.ts";

const EDITOR_PATHS = [/^\/admin(\/|$)/, /^\/api\/cms(\/|-auth\/|$)/];
const ASSET_PATHS = [/^\/cms-media\//, /^\/_serverFn\//, /^\/assets\//, /^\/_build\//, /^\/@/, /^\/__/, /^\/node_modules\//, /^\/src\//, /^\/\.well-known\//];

/**
 * The path the router will act on: percent-decoded (repeatedly, so %2561 cannot hide an a), lower case,
 * backslashes as slashes, repeated slashes collapsed and dot segments resolved. A path that cannot be decoded
 * is treated as the editor so the public host answers 404.
 */
export function normalizePath(raw: string): string {
  let p = raw;
  try {
    for (let i = 0; i < 4 && /%[0-9a-f]{2}/i.test(p); i++) p = decodeURIComponent(p);
  } catch {
    return "/admin";
  }
  const out: string[] = [];
  for (const seg of p.toLowerCase().replace(/\\/g, "/").split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return "/" + out.join("/");
}

const isEditorPath = (p: string) => EDITOR_PATHS.some((r) => r.test(normalizePath(p)));
const isAssetPath = (p: string) => ASSET_PATHS.some((r) => r.test(normalizePath(p))) || (/\.[a-z0-9]{2,5}$/i.test(p) && !/\.html?$/i.test(p));

const notFound = () =>
  new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found</title><body style="font-family:system-ui,sans-serif;padding:3rem"><h1>Page not found</h1><p><a href="/">Back to the site</a></p>',
    { status: 404, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );

/** A response to send instead of rendering, or null to carry on. */
export function gate(request: Request): Response | null {
  const url = new URL(request.url);
  const path = url.pathname;
  if (onDedicatedAdminHost(request)) {
    if (normalizePath(path) === "/") return new Response(null, { status: 302, headers: { location: "/admin", "cache-control": "no-store" } });
    if (isEditorPath(path) || isAssetPath(path)) return null;
    return notFound();
  }
  if (isEditorPath(path) && !isAdminHost(request)) return notFound();
  return null;
}

/**
 * Content Security Policy for the editor host only (the public site and its embeds are untouched).
 * Scripts need 'unsafe-inline' because the app inlines its start-up data; everything else stays on this host,
 * apart from the Google font stylesheet and this site's pictures.
 */
export function editorCsp(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
    isDevOrTest() ? "connect-src 'self' ws: wss: http: https:" : "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

/** Headers for every editor response: never cached, never framed, never indexed. */
export function hardenEditorResponse(request: Request, response: Response): Response {
  const path = new URL(request.url).pathname;
  const editorHost = onDedicatedAdminHost(request);
  if (!editorHost && !isEditorPath(path)) return response;
  if (isEditorPath(path) || normalizePath(path) === "/") {
    response.headers.set("cache-control", "no-store");
  }
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("content-security-policy", editorCsp());
  response.headers.set("x-robots-tag", "noindex, nofollow");
  response.headers.set("referrer-policy", "same-origin");
  return response;
}
