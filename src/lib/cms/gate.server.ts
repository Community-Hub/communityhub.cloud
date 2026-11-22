/**
 * Host routing for the editor. Runs first on every request (see src/start.ts).
 *
 * - The editor host (ADMIN_HOST) serves the editor, and the site's own pages to a browser that carries the editor's
 *   session cookie, so an editor can change the words where they sit ("edit on the page"). Without that cookie `/`
 *   goes to `/admin` and every other page is 404, as before. The cookie is only looked for here, not checked: the
 *   pages are public anyway, and every read or write of editor data checks the session itself.
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

/** better-auth's session cookie for the editor (prefix "cms"; "__Secure-" when on https). Presence only. */
const SESSION_COOKIE = /(?:^|;\s*)(?:__Secure-)?cms\.session_token=[^;]+/;
export const hasEditorCookie = (request: Request) => SESSION_COOKIE.test(request.headers.get("cookie") ?? "");

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
    if (isEditorPath(path) || isAssetPath(path)) return null;
    if (hasEditorCookie(request)) return null; // the site's own page, to edit in place
    if (normalizePath(path) === "/") return new Response(null, { status: 302, headers: { location: "/admin", "cache-control": "no-store" } });
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

/**
 * Content Security Policy for the site's own pages when an editor has them open on the editor host. They are the
 * public pages, so they need what the public pages show (live dashboards, slide stories and players in frames,
 * pictures and film); scripts still come only from this host, and the page still cannot be framed by anyone.
 */
export function sitePageOnEditorCsp(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    "frame-src https:",
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
  const editorPath = isEditorPath(path);
  // Nothing on the editor host may sit in a shared cache: a page drawn for a signed-in editor must never be handed
  // to the next visitor, who would get it without passing the gate. On Vercel the site-wide page rule
  // (vite.config.ts routeRules, "s-maxage=60") is applied at the edge and replaces this response's Cache-Control, so
  // the CDN's own headers say it too: Vercel obeys them before Cache-Control and no route rule sets them.
  if (editorHost || editorPath) {
    response.headers.set("cache-control", "no-store");
    response.headers.set("cdn-cache-control", "no-store");
    response.headers.set("vercel-cdn-cache-control", "no-store");
  }
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("content-security-policy", editorHost && !editorPath ? sitePageOnEditorCsp() : editorCsp());
  response.headers.set("x-robots-tag", "noindex, nofollow");
  response.headers.set("referrer-policy", "same-origin");
  return response;
}
