#!/usr/bin/env node
/**
 * Smoke test for the production build: build the Nitro node-server output,
 * start `.output/server/index.mjs` with NO database configured, and check
 * that all public routes, /healthz, legacy redirects, genuine 404s and the
 * editor-off gate answer correctly and the process stays up. Playwright
 * only runs `vite dev`, so without this the built server is never exercised
 * (a missing PGLite data file once killed it at startup).
 *
 * This checks this server's own responses only. It does NOT certify that
 * third-party iframes/embeds referenced by pages are reachable.
 *
 *   npm run test:smoke            (set SMOKE_SKIP_BUILD=1 to reuse the existing build)
 */
import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const PORT = process.env.SMOKE_PORT || "4191";
// All 21 public routes; must match PUBLIC_ROUTES in src/lib/legacy-redirects.ts
// (cross-checked below against /sitemap.xml, which is generated from it).
const PAGES = [
  "/", "/about", "/citywide-dashboard", "/community-calendar", "/community-voices",
  "/dashboard-builder", "/data-hub", "/demos", "/digital-signage", "/phone-app",
  "/pricing", "/products", "/research", "/resources", "/services", "/stories",
  "/story", "/toolkit", "/web-embeddables", "/who", "/work",
];
// Genuine-404 paths: the old error page, an unknown page, missing assets.
const NOT_FOUND = ["/404.html", "/not-a-page", "/assets/definitely-missing-smoke.jpg", "/missing-smoke.js", "/assets/deck/definitely-missing-smoke.png"];
const REDIRECTS = JSON.parse(readFileSync(new URL("../deployment/legacy-redirects.json", import.meta.url), "utf8"));
const env = { ...process.env };
for (const key of ["DATABASE_URL", "POSTGRES_URL", "POSTGRES_URL_NON_POOLING", "ADMIN_HOST", "ADMIN_EMAILS", "BETTER_AUTH_SECRET"]) delete env[key];
env.NODE_ENV = "production";
env.PORT = PORT;
env.HOST = "127.0.0.1";

const fail = (msg) => {
  console.error(`smoke: FAIL ${msg}`);
  process.exitCode = 1;
};

if (!process.env.SMOKE_SKIP_BUILD) {
  const build = spawnSync("npm", ["run", "build"], { env, stdio: "inherit" });
  if (build.status !== 0) {
    fail("build failed");
    process.exit(1);
  }
}

const server = spawn("node", [".output/server/index.mjs"], { env, stdio: ["ignore", "pipe", "pipe"] });
let output = "";
let exited = null;
for (const stream of [server.stdout, server.stderr]) stream.on("data", (d) => (output += d));
server.on("exit", (code) => (exited = code ?? "signal"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const req = async (path) => {
  try {
    return await fetch(`http://127.0.0.1:${PORT}${path}`, { redirect: "manual" });
  } catch {
    return null;
  }
};
const status = async (path) => (await req(path))?.status ?? 0;

try {
  for (let i = 0; i < 60 && exited === null && (await status("/healthz")) === 0; i += 1) await sleep(500);

  const noStore = (res) => /no-store/.test(res?.headers.get("cache-control") ?? "");

  const health = await req("/healthz");
  if (!health || health.status !== 200 || (await health.text()) !== "ok\n") fail("/healthz is not 200 'ok\\n'");
  else if (!noStore(health)) fail("/healthz is not no-store");

  for (const path of PAGES) {
    const res = await req(path);
    if (!res || res.status !== 200) fail(`${path} returned ${res?.status ?? 0}`);
    else await res.arrayBuffer();
  }

  // Sitemap lists exactly the public routes (ties PAGES to PUBLIC_ROUTES).
  const sitemap = await req("/sitemap.xml");
  if (!sitemap || sitemap.status !== 200) fail(`/sitemap.xml returned ${sitemap?.status ?? 0}`);
  else {
    const locs = [...(await sitemap.text()).matchAll(/<loc>https:\/\/www\.communityhub\.cloud([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
    if (JSON.stringify([...locs].sort()) !== JSON.stringify([...PAGES].sort())) {
      fail(`/sitemap.xml routes ${JSON.stringify(locs.sort())} != smoke PAGES`);
    }
  }

  if ("/404.html" in REDIRECTS) fail("/404.html must not be a legacy redirect");
  for (const [source, target] of Object.entries(REDIRECTS)) {
    const res = await req(`${source}?utm=smoke`);
    if (!res || res.status !== 301) { fail(`${source} returned ${res?.status ?? 0}, expected 301`); continue; }
    const loc = new URL(res.headers.get("location"), `http://127.0.0.1:${PORT}`);
    if (loc.pathname !== target.split("#")[0]) fail(`${source} -> ${loc.pathname}, expected ${target}`);
    if (loc.search !== "?utm=smoke") fail(`${source} lost its query string (${loc.search})`);
  }

  // True 404s: never a redirect, never a 200 page swallowing a missing
  // asset, and never cached.
  for (const path of NOT_FOUND) {
    const res = await req(path);
    if (!res || res.status !== 404) { fail(`${path} returned ${res?.status ?? 0}, expected 404`); continue; }
    if (res.headers.get("location")) fail(`${path} redirects to ${res.headers.get("location")}, expected a 404 body`);
    if (!noStore(res)) fail(`${path} 404 is not no-store (cache-control: ${res.headers.get("cache-control")})`);
    await res.arrayBuffer();
  }

  // The CMS editor stays off on the public host in production (no
  // ADMIN_HOST), and private/admin answers are never cached.
  for (const path of ["/admin", "/api/cms/overview"]) {
    const res = await req(path);
    if (!res || res.status !== 404) { fail(`${path} is not 404 on the public host`); continue; }
    if (!noStore(res)) fail(`${path} is not no-store (cache-control: ${res.headers.get("cache-control")})`);
    await res.arrayBuffer();
  }

  await sleep(3000); // a crash from an unhandled rejection lands a moment after the first requests
  if (exited !== null) fail(`server exited (${exited})`);
  if (/unhandled|ENOENT/i.test(output)) fail("server log mentions an unhandled error or ENOENT");
  for (const path of PAGES) if ((await status(path)) !== 200) fail(`${path} not 200 after the wait`);
} finally {
  server.kill("SIGTERM");
}
if (process.exitCode) console.error(output.split("\n").slice(-25).join("\n"));
else console.log(`smoke: ok (healthz no-store, ${PAGES.length} public routes + sitemap, ${Object.keys(REDIRECTS).length} legacy redirects, ${NOT_FOUND.length} true 404s no-store, editor off no-store; no DATABASE_URL; third-party embeds not certified)`);
