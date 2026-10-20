import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { LEGACY_REDIRECTS, PUBLIC_ROUTES, healthResponse, legacyRedirect, rewriteLegacyUrl } from "./legacy-redirects.ts";

const req = (path: string, method = "GET") => new Request(`https://communityhub.cloud${path}`, { method });

test("healthz answers ok, text/plain, no-store", () => {
  const res = healthResponse(req("/healthz"))!;
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type")!, /text\/plain/);
  assert.match(res.headers.get("cache-control")!, /no-store/);
});

test("healthz rejects POST and ignores other paths", () => {
  assert.equal(healthResponse(req("/healthz", "POST"))!.status, 405);
  assert.equal(healthResponse(req("/about")), null);
});

test("every legacy path 301s, both slash forms, query preserved", () => {
  for (const [source, target] of Object.entries(LEGACY_REDIRECTS)) {
    for (const suffix of ["", "/"]) {
      const res = legacyRedirect(req(`${source}${suffix}?utm=migration&ref=old`))!;
      assert.equal(res.status, 301, source + suffix);
      const loc = new URL(res.headers.get("location")!, "https://communityhub.cloud");
      const [path, fragment] = target.split("#");
      assert.equal(loc.pathname, path, source);
      assert.equal(loc.search, "?utm=migration&ref=old", source);
      assert.equal(loc.hash, fragment ? `#${fragment}` : "", source);
    }
  }
});

test("every redirect target is a current public route", () => {
  for (const target of Object.values(LEGACY_REDIRECTS)) {
    assert.ok(PUBLIC_ROUTES.includes(target.split("#")[0]), target);
  }
});

test("deployment/legacy-redirects.json matches the runtime map", () => {
  const json = JSON.parse(readFileSync(new URL("../../deployment/legacy-redirects.json", import.meta.url), "utf8"));
  assert.deepEqual(json, { ...LEGACY_REDIRECTS });
});

test("current routes, assets and unknown paths are not redirected", () => {
  for (const path of [...PUBLIC_ROUTES, "/admin", "/api/cms/x", "/assets/og.jpg", "/not-a-page", "/sitemap.xml"]) {
    assert.equal(legacyRedirect(req(path)), null, path);
  }
  assert.equal(legacyRedirect(req("/products.html", "POST")), null);
});

test("/404.html is not redirected home (it must answer a genuine 404)", () => {
  assert.ok(!("/404.html" in LEGACY_REDIRECTS));
  assert.equal(legacyRedirect(req("/404.html")), null);
  assert.equal(legacyRedirect(req("/404.html/")), null);
  const url = rewriteLegacyUrl(new URL("https://communityhub.cloud/404.html?x=1"));
  assert.equal(url.pathname, "/404.html");
  assert.equal(url.search, "?x=1");
});

const rw = (path: string) => rewriteLegacyUrl(new URL(`https://communityhub.cloud${path}`));

test("client rewrite agrees with the server 301 for every legacy path, query preserved", () => {
  for (const [source, target] of Object.entries(LEGACY_REDIRECTS)) {
    for (const input of [source, `${source}/`, source.toUpperCase()]) {
      const url = rw(`${input}?utm=migration&ref=old`);
      const [path, fragment] = target.split("#");
      assert.equal(url.pathname, path, input);
      assert.equal(url.search, "?utm=migration&ref=old", input);
      assert.equal(url.hash, fragment ? `#${fragment}` : "", input);
    }
  }
  // The two mappings the old duplicate router map disagreed on:
  assert.equal(rw("/resources.html").pathname, "/resources");
  assert.equal(rw("/who-its-for.html").pathname, "/who");
});

test("client rewrite leaves current routes and unknown paths untouched", () => {
  for (const path of [...PUBLIC_ROUTES, "/not-a-page", "/assets/missing.jpg", "/admin"]) {
    const url = rw(`${path}?a=1`);
    assert.equal(url.pathname, path, path);
    assert.equal(url.search, "?a=1", path);
  }
});

test("data-dashboard.html#orbs reaches /#orb through the real 301 + fragment re-attachment", () => {
  // Direct client navigation (no server round trip):
  for (const source of ["/data-dashboard.html", "/building-dashboard", "/building-dashboard.html"]) {
    const url = rw(`${source}?utm=old#orbs`);
    assert.equal(url.pathname, "/", source);
    assert.equal(url.hash, "#orb", source);
    assert.equal(url.search, "?utm=old", source);
  }
  // Full browser chain: server 301 (fragment unseen), browser re-attaches
  // #orbs to the target, router rewrite sends it to the orb story.
  const res = legacyRedirect(req("/data-dashboard.html?utm=old"))!;
  assert.equal(res.status, 301);
  const afterRedirect = new URL(res.headers.get("location")!, "https://communityhub.cloud");
  assert.equal(afterRedirect.pathname, "/dashboard-builder");
  afterRedirect.hash = "#orbs"; // RFC 7231 fragment inheritance
  const landed = rewriteLegacyUrl(afterRedirect);
  assert.equal(landed.pathname, "/");
  assert.equal(landed.hash, "#orb");
  assert.equal(landed.search, "?utm=old");
  // #orbs on an unrelated path is not hijacked.
  const other = rw("/about#orbs");
  assert.equal(other.pathname, "/about");
  assert.equal(other.hash, "#orbs");
});

test("case-study anchors name real Work stops, and #orb a real home chapter", () => {
  // Work stops are the CASES ids (src/routes/work.tsx builds STOPS from
  // them; useHashStops resolves the hash against that id list).
  const pageContent = readFileSync(new URL("./page-content.ts", import.meta.url), "utf8");
  const cases = new Map<string, string>();
  for (const m of pageContent.matchAll(/id: "([a-z]+)",\s*\n\s*name: ("[^"]+"|SCHOOLS_NAME)/g)) {
    cases.set(m[1], m[2]);
  }
  const expected: Record<string, [string, string]> = {
    "/great-lakes-science-center.html": ["glsc", '"Great Lakes Science Center"'],
    "/midtown-cleveland.html": ["midtown", '"MidTown Cleveland"'],
    "/oberlin-college.html": ["college", '"Oberlin College"'],
    "/city-of-oberlin.html": ["oberlin", '"City of Oberlin"'],
    "/schools.html": ["schools", "SCHOOLS_NAME"],
  };
  for (const [source, [anchor, name]] of Object.entries(expected)) {
    assert.equal(LEGACY_REDIRECTS[source], `/work#${anchor}`, source);
    assert.equal(cases.get(anchor), name, `${source} -> #${anchor}`);
  }
  assert.equal(LEGACY_REDIRECTS["/hamilton-college.html"], "/work"); // no Hamilton case exists
  const links = readFileSync(new URL("./links.ts", import.meta.url), "utf8");
  assert.match(links, /CHAPTER_IDS = \[[^\]]*"orb"/);
});
