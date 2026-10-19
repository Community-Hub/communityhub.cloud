import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { adminEmails, isAdminEmail, adminOrigin, useSecureCookies, signupCode, authSecret, isAdminHost } from "./env.ts";
import { isOwnBlobUrl, checkValue } from "./validate.ts";
import { readBodyLimited } from "./body.ts";
import { gate, hardenEditorResponse } from "./gate.server.ts";

const KEYS = ["ADMIN_EMAILS", "ADMIN_HOST", "NODE_ENV", "ADMIN_SIGNUP_CODE", "BETTER_AUTH_SECRET", "BLOB_READ_WRITE_TOKEN"] as const;
const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
const set = (env: Partial<Record<(typeof KEYS)[number], string>>) => {
  for (const k of KEYS) delete process.env[k];
  Object.assign(process.env, env);
};
afterEach(() => {
  for (const k of KEYS) saved[k] === undefined ? delete process.env[k] : (process.env[k] = saved[k]);
});
const req = (host: string, path: string) => new Request(`http://${host}${path}`, { headers: { host } });

describe("allowlist", () => {
  it("reads a comma, space or semicolon list, ignoring case and blanks", () => {
    set({ ADMIN_EMAILS: " A@x.org, b@x.org ;C@x.org  " });
    assert.deepEqual(adminEmails(), ["a@x.org", "b@x.org", "c@x.org"]);
  });
  it("accepts listed emails in any case and nothing else", () => {
    set({ ADMIN_EMAILS: "maddie@x.org" });
    assert.equal(isAdminEmail("Maddie@X.org"), true);
    assert.equal(isAdminEmail("stranger@x.org"), false);
    assert.equal(isAdminEmail("maddie@x.org.evil.com"), false);
    assert.equal(isAdminEmail(""), false);
    assert.equal(isAdminEmail(undefined), false);
    assert.equal(isAdminEmail(["maddie@x.org"]), false);
  });
  it("an empty list lets nobody in", () => {
    set({});
    assert.equal(isAdminEmail("anyone@x.org"), false);
  });
});

describe("host routing", () => {
  it("editor host: / goes to /admin, public pages are 404, editor and assets pass", () => {
    set({ ADMIN_HOST: "admin.example.org", NODE_ENV: "production" });
    assert.equal(gate(req("admin.example.org", "/"))?.status, 302);
    assert.equal(gate(req("admin.example.org", "/pricing"))?.status, 404);
    assert.equal(gate(req("admin.example.org", "/admin")), null);
    assert.equal(gate(req("admin.example.org", "/api/cms/overview")), null);
    assert.equal(gate(req("admin.example.org", "/api/cms-auth/sign-in/email")), null);
    assert.equal(gate(req("admin.example.org", "/assets/app.js")), null);
    assert.equal(gate(req("admin.example.org", "/cms-media/x.png")), null);
  });
  it("public host: no editor, no editor API, site untouched", () => {
    set({ ADMIN_HOST: "admin.example.org", NODE_ENV: "production" });
    for (const p of ["/admin", "/admin/x", "/api/cms/save", "/api/cms-auth/sign-up/email"]) {
      assert.equal(gate(req("www.example.org", p))?.status, 404, p);
    }
    assert.equal(gate(req("www.example.org", "/pricing")), null);
    assert.equal(gate(req("www.example.org", "/administrators")), null);
  });
  it("host matching is exact, not a prefix or suffix", () => {
    set({ ADMIN_HOST: "admin.example.org", NODE_ENV: "production" });
    assert.equal(gate(req("admin.example.org.evil.com", "/admin"))?.status, 404);
    assert.equal(gate(req("evil-admin.example.org", "/admin"))?.status, 404);
  });
  it("no ADMIN_HOST: production has no editor, development serves it", () => {
    set({ NODE_ENV: "production" });
    assert.equal(gate(req("www.example.org", "/admin"))?.status, 404);
    set({ NODE_ENV: "development" });
    assert.equal(gate(req("localhost:8080", "/admin")), null);
  });
  it("path case and percent-encoding cannot get round the gate", () => {
    set({ ADMIN_HOST: "admin.example.org", NODE_ENV: "production" });
    for (const p of ["/Admin", "/ADMIN/x", "/%61dmin", "/%2561dmin", "/admin%2F", "//admin", "/x/../admin", "/%5cadmin", "/Api/Cms/save", "/api/cms%2dauth/sign-in/email", "/%e0%a4%a"]) {
      assert.equal(gate(req("www.example.org", p))?.status, 404, p);
    }
    assert.equal(gate(req("admin.example.org", "/Admin")), null);
    assert.equal(gate(req("admin.example.org", "/%61dmin")), null);
    assert.equal(gate(req("www.example.org", "/administrators")), null);
  });
  it("outside development or test the editor is off and the secret is required", () => {
    set({});
    assert.equal(isAdminHost(req("localhost:8080", "/admin")), false);
    assert.throws(() => authSecret());
    set({ NODE_ENV: "staging" });
    assert.equal(isAdminHost(req("localhost:8080", "/admin")), false);
    assert.throws(() => authSecret());
    for (const env of ["development", "test"]) {
      set({ NODE_ENV: env });
      assert.equal(isAdminHost(req("localhost:8080", "/admin")), true);
      assert.ok(authSecret().length >= 32);
    }
  });
  it("the sign-up code needs 16 characters or sign-up is refused", () => {
    set({ ADMIN_SIGNUP_CODE: "x".repeat(15) });
    assert.equal(signupCode(), null);
    set({});
    assert.equal(signupCode(), null);
    set({ ADMIN_SIGNUP_CODE: "x".repeat(16) });
    assert.equal(signupCode(), "x".repeat(16));
  });
  it("links cannot start //, /\\ or /\\evil", () => {
    for (const bad of ["/\\evil.com", "//evil.com", "/\\/evil.com"]) {
      assert.throws(() => checkValue("link", bad, "/"), bad);
    }
    assert.equal(checkValue("link", "/pricing", "/"), "/pricing");
  });
  it("only this store's Blob host is accepted for pictures", () => {
    set({ BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_AbC123xyz_secretsecret" });
    assert.equal(isOwnBlobUrl("https://abc123xyz.public.blob.vercel-storage.com/a/b.png"), true);
    assert.equal(isOwnBlobUrl("https://other.public.blob.vercel-storage.com/a/b.png"), false);
    assert.equal(isOwnBlobUrl("https://abc123xyz.public.blob.vercel-storage.com.evil.com/b.png"), false);
    set({});
    assert.equal(isOwnBlobUrl("https://abc123xyz.public.blob.vercel-storage.com/a/b.png"), false);
  });
  it("uploads are cut off while streaming, with or without Content-Length", async () => {
    const chunk = new Uint8Array(1000);
    const stream = (n: number) =>
      new ReadableStream<Uint8Array>({
        start(c) {
          for (let i = 0; i < n; i++) c.enqueue(chunk);
          c.close();
        },
      });
    const mk = (n: number) => new Request("http://x/", { method: "POST", body: stream(n), duplex: "half" } as RequestInit);
    assert.equal((await readBodyLimited(mk(5), 5000, "big")).length, 5000);
    await assert.rejects(readBodyLimited(mk(6), 5000, "big"), { status: 413 });
  });
  it("editor responses are never cached, framed or indexed", () => {
    set({ ADMIN_HOST: "admin.example.org", NODE_ENV: "production" });
    const r = hardenEditorResponse(req("admin.example.org", "/admin"), new Response("x"));
    assert.equal(r.headers.get("cache-control"), "no-store");
    assert.equal(r.headers.get("x-frame-options"), "DENY");
    assert.match(r.headers.get("x-robots-tag") ?? "", /noindex/);
    assert.equal(r.headers.get("x-content-type-options"), "nosniff");
    assert.match(r.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
    const pub = hardenEditorResponse(req("www.example.org", "/pricing"), new Response("x"));
    assert.equal(pub.headers.get("x-frame-options"), null);
    assert.equal(pub.headers.get("content-security-policy"), null);
  });
  it("cookies are secure on https hosts only", () => {
    set({ ADMIN_HOST: "admin.example.org" });
    assert.equal(useSecureCookies(req("admin.example.org", "/admin")), true);
    set({ ADMIN_HOST: "admin.localhost:8080" });
    assert.equal(useSecureCookies(req("admin.localhost:8080", "/admin")), false);
    assert.equal(adminOrigin(req("admin.localhost:8080", "/admin")), "http://admin.localhost:8080");
  });
});
