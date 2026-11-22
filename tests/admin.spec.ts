import { test as base, expect, type Page } from "@playwright/test";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * The editor, end to end, on local pglite. It lives on its own host (admin.localhost), the public site on
 * 127.0.0.1. Every change is put back at the end so the rest of the suite sees the original site.
 */
const port = Number(process.env.CMS_TEST_PORT ?? 8080);
const ADMIN = `http://admin.localhost:${port}`;
const PUBLIC = `http://127.0.0.1:${port}`;
const EDITOR = "editor@example.test";
// The test server writes each sign-in code to this folder instead of emailing it (playwright.config.ts).
const OUTBOX = join(tmpdir(), `cms-test-otp-${port}`);
const codeFile = (email: string) => join(OUTBOX, `${email}.txt`);

/** The code the server just "emailed" to this address. */
async function codeFor(email: string): Promise<string> {
  await expect.poll(() => existsSync(codeFile(email)), { timeout: 15_000 }).toBe(true);
  return readFileSync(codeFile(email), "utf8").trim();
}

// 1x1 transparent png.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

// Asking for a code and using one are each limited to 5 a minute, so the editor signs in once and every test reuses that session.
let shared: Page;
const test = base.extend<{ page: Page }>({
  page: async ({}, use) => {
    await use(shared);
  },
});
test.describe.configure({ mode: "serial" });
test.beforeAll(async ({ browser }) => {
  shared = await (await browser.newContext()).newPage();
  await signIn(shared);
});
test.afterAll(async () => {
  await shared?.context().close();
});

/** Back at the start of the editor, still signed in. */
async function openEditor(page: Page) {
  await page.goto(`${ADMIN}/admin`);
  await expect(page.getByTestId("whoami")).toHaveText(EDITOR);
}

/** No password: type the address, get a code "by email", type the code. The first time also creates the account. */
async function signIn(page: Page) {
  rmSync(codeFile(EDITOR), { force: true });
  await page.goto(`${ADMIN}/admin`);
  await page.getByTestId("login-email").waitFor();
  await expect(page.locator("input[type=password]")).toHaveCount(0);
  await page.getByTestId("login-email").fill(EDITOR);
  await page.getByTestId("login-submit").click();
  const code = await codeFor(EDITOR);
  expect(code).toMatch(/^\d{6}$/);
  // A wrong code is refused and leaves the right one usable.
  await page.getByTestId("login-otp").fill(code === "000000" ? "111111" : "000000");
  await page.getByTestId("login-submit").click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByTestId("whoami")).toHaveCount(0);
  await page.getByTestId("login-otp").fill(code);
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("whoami")).toHaveText(EDITOR);
}

async function overview(page: Page) {
  const res = await page.request.get(`${ADMIN}/api/cms/overview`);
  expect(res.status()).toBe(200);
  return (await res.json()) as {
    slots: { key: string; kind: string; def: string; value: string; page: string; altKey?: string }[];
    lists: { path: string; items: unknown[] }[];
    sections: { path: string; id: string; hidden: boolean }[];
  };
}

async function csrfPost(page: Page, path: string, data: unknown) {
  return page.request.post(`${ADMIN}${path}`, { data, headers: { origin: ADMIN } });
}

test("host split: the public host has no editor, the editor host has no site", async ({ request }) => {
  for (const path of ["/admin", "/api/cms/overview", "/api/cms-auth/sign-in/email"]) {
    expect((await request.get(`${PUBLIC}${path}`)).status(), `public ${path}`).toBe(404);
  }
  const home = await request.get(`${ADMIN}/`, { maxRedirects: 0 });
  expect(home.status()).toBe(302);
  expect(home.headers().location).toContain("/admin");
  expect((await request.get(`${ADMIN}/pricing`)).status()).toBe(404);
});

test("the session lasts a week", async () => {
  const cookie = (await shared.context().cookies(ADMIN)).find((c) => c.name.includes("session_token"));
  expect(cookie, "session cookie").toBeTruthy();
  const days = (cookie!.expires - Date.now() / 1000) / 86_400;
  expect(days).toBeGreaterThan(6.9);
  expect(days).toBeLessThan(7.1);
  expect(cookie!.httpOnly).toBe(true);
  expect(cookie!.sameSite).toBe("Strict");
});

/** What a person reads: the on-page editor's invisible tags taken out. */
const seen = (text: string | null) => (text ?? "").replace(/[\u2063\u2060\u200C]/g, "").replace(/\s+/g, " ").trim();

test("after signing in the editor is on the site itself, with the editing bar", async ({ page }) => {
  // signIn() ran in beforeAll: it ends on the editor host's own copy of the home page, not on the lists.
  await page.goto(`${ADMIN}/`);
  await expect(page.getByTestId("page-edit-bar")).toBeVisible();
  await expect(page.getByTestId("page-edit-hint")).toHaveText("Click any wording to change it.");
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  expect(await page.locator("[data-cms-edit]").count()).toBeGreaterThan(20);
  // The site's pages on the editor host are never cacheable and may show the live examples in frames.
  const res = await page.request.get(`${ADMIN}/pricing`);
  expect(res.status()).toBe(200);
  expect(res.headers()["cache-control"]).toBe("no-store");
  expect(res.headers()["content-security-policy"]).toContain("frame-src https:");
  expect(res.headers()["x-robots-tag"]).toContain("noindex");
});

test("edit on the page: click a heading, save, and only that wording changes, here and on the public site", async ({ page, browser }) => {
  await page.goto(`${ADMIN}/pricing`);
  await expect(page.getByTestId("page-edit-hint")).toHaveText("Click any wording to change it.");
  const h1 = page.locator("main h1").first();
  const crumb = page.locator("[data-breadcrumbs] [aria-current=page]");
  await expect.poll(async () => seen(await h1.textContent())).toBe("Pricing");
  await expect(h1).toHaveAttribute("data-cms-edit", "");

  // The heading and the breadcrumb say the same word, and each opens its own entry.
  const card = page.getByTestId("page-edit-card");
  await crumb.click();
  await expect(card).toHaveAttribute("data-key", /^page\.siteHeader\.NAV\./);
  await card.getByRole("button", { name: "Close" }).click();
  await h1.click();
  await expect(card).toHaveAttribute("data-key", "copy.pricing.Pricing.DocSection_title1");
  await expect(page.getByTestId("page-edit-which")).toHaveCount(0);
  expect(page.url()).toBe(`${ADMIN}/pricing`);

  await page.getByTestId("page-edit-input").fill("Pricing and plans");
  await page.getByTestId("page-edit-save").click();
  await expect(card.getByRole("status")).toContainText("Saved.");
  await expect.poll(async () => seen(await h1.textContent())).toBe("Pricing and plans");
  expect(seen(await crumb.textContent())).toBe("Pricing");
  expect(seen(await page.getByRole("navigation", { name: "Main" }).textContent())).not.toContain("Pricing and plans");

  // A visitor to the public site sees it, with nothing of the editor on the page.
  const visitor = await (await browser.newContext()).newPage();
  await visitor.goto(`${PUBLIC}/pricing`);
  await expect(visitor.locator("main h1").first()).toHaveText("Pricing and plans");
  await expect(visitor.locator("[data-cms-ui]")).toHaveCount(0);
  expect(await visitor.evaluate(() => /[\u2063\u2060\u200C]/.test(document.documentElement.outerHTML))).toBe(false);

  // Put it back from the same card.
  await page.getByTestId("page-edit-reset").click();
  await expect(card.getByRole("status")).toContainText("original wording");
  await expect.poll(async () => seen(await h1.textContent())).toBe("Pricing");
  await visitor.reload();
  await expect(visitor.locator("main h1").first()).toHaveText("Pricing");
  await visitor.context().close();
});

test("edit on the page: in Edit text a link opens for editing; in Browse it is followed", async ({ page }) => {
  await page.goto(`${ADMIN}/pricing`);
  await expect(page.getByTestId("page-edit-hint")).toHaveText("Click any wording to change it.");
  const home = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Home" });
  await home.click();
  await expect(page.getByTestId("page-edit-card")).toBeVisible();
  expect(page.url()).toBe(`${ADMIN}/pricing`);
  await page.getByTestId("page-edit-mode-browse").click();
  await expect(page.getByTestId("page-edit-card")).toHaveCount(0);
  await home.click();
  await expect(page).toHaveURL(`${ADMIN}/`);
  // The lists are one click away, and they link back.
  await page.getByRole("link", { name: "Pictures, lists and history" }).click();
  await expect(page.getByTestId("edit-on-page")).toBeVisible();
});

test("a non-listed email is sent no code and cannot sign in", async ({ browser }) => {
  const page = await (await browser.newContext()).newPage();
  const stranger = "stranger@example.test";
  const headers = { origin: ADMIN };
  const send = await page.request.post(`${ADMIN}/api/cms-auth/email-otp/send-verification-otp`, { data: { email: stranger, type: "sign-in" }, headers });
  expect(send.status()).toBe(403);
  expect(existsSync(codeFile(stranger))).toBe(false);
  const inn = await page.request.post(`${ADMIN}/api/cms-auth/sign-in/email-otp`, { data: { email: stranger, otp: "123456" }, headers });
  expect(inn.status()).toBe(403);
  // And the UI shows an error, not the code step or the editor.
  await page.goto(`${ADMIN}/admin`);
  await page.getByTestId("login-email").fill(stranger);
  await page.getByTestId("login-submit").click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByTestId("login-otp")).toHaveCount(0);
  await expect(page.getByTestId("whoami")).toHaveCount(0);
  await page.context().close();
});

test("passwords and everything else the sign-in library offers are shut", async ({ request }) => {
  const headers = { origin: ADMIN };
  const tries: [string, unknown][] = [
    ["/sign-up/email", { email: EDITOR, password: "a long test password 1234", name: "x" }],
    ["/sign-in/email", { email: EDITOR, password: "a long test password 1234" }],
    ["/email-otp/request-password-reset", { email: EDITOR }],
    ["/email-otp/verify-email", { email: EDITOR, otp: "123456" }],
    ["/email-otp/check-verification-otp", { email: EDITOR, type: "sign-in", otp: "123456" }],
  ];
  for (const [path, data] of tries) {
    const res = await request.post(`${ADMIN}/api/cms-auth${path}`, { data, headers });
    expect(res.status(), path).toBe(404);
  }
  // A code is only ever for signing in.
  const other = await request.post(`${ADMIN}/api/cms-auth/email-otp/send-verification-otp`, { data: { email: EDITOR, type: "forget-password" }, headers });
  expect(other.status()).toBe(403);
});

test("signed-out calls and calls without a matching origin are refused", async ({ page, request }) => {
  expect((await request.get(`${ADMIN}/api/cms/overview`)).status()).toBe(401);
  const bad = await page.request.post(`${ADMIN}/api/cms/save`, { data: { key: "x", value: "y" }, headers: { origin: "http://evil.example" } });
  expect(bad.status()).toBe(403);
});

test("edit a string, see it on the public page, escaped, then revert", async ({ page, request }) => {
  await openEditor(page);
  await page.getByTestId("search").fill("That page is not here");
  const row = page.getByTestId("slot-row").first();
  await expect(row).toBeVisible();
  const input = row.getByTestId("slot-input");
  await input.fill("<b>Gone fishing</b> & back soon");
  await expect(row.getByTestId("slot-preview")).toHaveText("<b>Gone fishing</b> & back soon");
  await row.getByTestId("slot-save").click();
  await expect(row.getByText(/Saved/)).toBeVisible();

  // The public page shows it with no old text first, and nothing was turned into markup.
  const html = await (await request.get(`${PUBLIC}/no-such-page`)).text();
  expect(html).toContain("&lt;b&gt;Gone fishing&lt;/b&gt; &amp; back soon");
  expect(html).not.toContain("<b>Gone fishing</b>");
  expect(html).not.toContain("That page is not here");

  // History lists it; reverting to the original puts the default back.
  await page.getByTestId("tab-history").click();
  await expect(page.getByTestId("history-row").first()).toContainText(EDITOR);
  await page.getByTestId("tab-texts").click();
  await page.getByTestId("search").fill("Gone fishing");
  await page.getByTestId("slot-row").first().getByTestId("slot-reset").click();
  await expect.poll(async () => (await (await request.get(`${PUBLIC}/no-such-page`)).text()).includes("That page is not here")).toBe(true);
});

test("an edited public page hydrates in a real browser with no mismatch", async ({ page }) => {
  await openEditor(page);
  const { slots } = await overview(page);
  const slot = slots.find((s) => s.kind === "text" && s.def === "That page is not here")!;
  expect((await csrfPost(page, "/api/cms/save", { key: slot.key, value: "Hydration check text" })).status()).toBe(200);
  const visitor = await page.context().newPage();
  const problems: string[] = [];
  visitor.on("pageerror", (e) => problems.push(e.message));
  visitor.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") problems.push(m.text());
  });
  await expect
    .poll(async () => {
      await visitor.goto(`${PUBLIC}/no-such-page`, { waitUntil: "networkidle" });
      return (await visitor.content()).includes("Hydration check text");
    })
    .toBe(true);
  await visitor.waitForTimeout(500);
  expect(problems.filter((p) => /hydrat|did not match|didn't match|#418|#423|#425/i.test(p))).toEqual([]);
  await visitor.close();
  expect((await csrfPost(page, "/api/cms/reset", { key: slot.key })).status()).toBe(200);
});

test("a revision can be restored from history", async ({ page, request }) => {
  await openEditor(page);
  const { slots } = await overview(page);
  const slot = slots.find((s) => s.kind === "text" && s.def === "That page is not here")!;
  for (const v of ["First version", "Second version"]) {
    expect((await csrfPost(page, "/api/cms/save", { key: slot.key, value: v })).status()).toBe(200);
  }
  await page.reload(); // the editor loaded before these API saves
  await page.getByTestId("search").fill("Second version");
  await page.getByTestId("slot-row").first().getByRole("button", { name: "History" }).click();
  const panel = page.getByTestId("history-panel");
  await expect(panel.getByTestId("history-row").first()).toContainText("Second version");
  // Newest first: the last row that mentions "First version" is the one that wrote it.
  await panel.getByTestId("history-row").filter({ hasText: "First version" }).last().getByTestId("history-restore").click();
  await expect.poll(async () => (await (await request.get(`${PUBLIC}/no-such-page`)).text()).includes("First version")).toBe(true);
  expect((await csrfPost(page, "/api/cms/reset", { key: slot.key })).status()).toBe(200);
});

test("text edits are validated: empty, too long, control characters, bad links", async ({ page }) => {
  await openEditor(page);
  const { slots } = await overview(page);
  const text = slots.find((s) => s.kind === "text")!;
  const link = slots.find((s) => s.kind === "link")!;
  for (const value of ["   ", "x".repeat(2001), "a\u0000b"]) {
    expect((await csrfPost(page, "/api/cms/save", { key: text.key, value })).status(), JSON.stringify(value.slice(0, 8))).toBe(400);
  }
  expect((await csrfPost(page, "/api/cms/save", { key: link.key, value: "javascript:alert(1)" })).status()).toBe(400);
  expect((await csrfPost(page, "/api/cms/save", { key: "nope.not.a.key", value: "x" })).status()).toBe(404);
});

test("replace a picture: alt text is required, type is checked, the original comes back", async ({ page, request }) => {
  await openEditor(page);
  const { slots } = await overview(page);
  // Find a picture whose default shows up in the HTML of a public page.
  let found: { slot: (typeof slots)[number]; route: string } | undefined;
  for (const route of ["/about", "/research", "/work", "/products", "/demos", "/"]) {
    const html = await (await request.get(`${PUBLIC}${route}`)).text();
    const slot = slots.find((s) => s.kind === "image" && s.altKey && s.def.startsWith("/") && html.includes(s.def));
    if (slot) { found = { slot, route }; break; }
  }
  expect(found, "a replaceable picture on a public page").toBeTruthy();
  const { slot, route } = found!;

  await page.getByTestId("tab-pictures").click();
  const row = page.locator(`[data-testid=picture-row][data-key="${slot.key}"]`);
  await row.scrollIntoViewIfNeeded().catch(() => undefined);
  if (!(await row.isVisible())) {
    await page.getByTestId("search").fill(slot.key.split(".").slice(-2).join(" "));
  }
  // The UI blocks saving until a picture is chosen and described.
  await expect(row.getByTestId("picture-save")).toBeDisabled();
  await row.getByTestId("picture-file").setInputFiles({ name: "new.png", mimeType: "image/png", buffer: PNG });
  await row.getByTestId("picture-alt").fill(""); // the current description is pre-filled; clearing it blocks saving
  await expect(row.getByTestId("picture-save")).toBeDisabled();
  await row.getByTestId("picture-alt").fill("A tiny test picture");
  await expect(row.getByTestId("picture-save")).toBeEnabled();
  await row.getByTestId("picture-save").click();
  await expect(row.getByText(/Picture replaced/)).toBeVisible();

  const html = await (await request.get(`${PUBLIC}${route}`)).text();
  expect(html).toMatch(/\/cms-media\/[A-Za-z0-9_-]+\.png/);
  expect(html).toContain("A tiny test picture");
  const url = html.match(/\/cms-media\/[A-Za-z0-9_-]+\.png/)![0];
  const media = await request.get(`${PUBLIC}${url}`);
  expect(media.status()).toBe(200);
  expect(media.headers()["content-type"]).toBe("image/png");

  // Wrong type and no description are refused by the server too.
  const mk = (name: string, mimeType: string, buffer: Buffer) => ({ multipart: { key: slot.key, alt: "x", file: { name, mimeType, buffer } }, headers: { origin: ADMIN } });
  const svg = await page.request.post(`${ADMIN}/api/cms/upload`, mk("a.svg", "image/svg+xml", Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>")));
  expect(svg.status()).toBe(400);
  const fake = await page.request.post(`${ADMIN}/api/cms/upload`, mk("a.png", "image/png", Buffer.from("not really a png at all")));
  expect(fake.status()).toBe(400);
  const noAlt = await page.request.post(`${ADMIN}/api/cms/upload`, { multipart: { key: slot.key, alt: "", file: { name: "a.png", mimeType: "image/png", buffer: PNG } }, headers: { origin: ADMIN } });
  expect(noAlt.status()).toBe(400);

  // Back to the original picture.
  expect((await csrfPost(page, "/api/cms/reset", { key: slot.key })).status()).toBe(200);
  await expect.poll(async () => (await (await request.get(`${PUBLIC}${route}`)).text()).includes(slot.def)).toBe(true);
});

test("lists: remove, reorder and add an item, then restore the original list", async ({ page, request }) => {
  await openEditor(page);
  await page.getByTestId("tab-lists").click();
  const card = page.locator('[data-testid=list-card][data-path="faq"]');
  await expect(card).toBeVisible();
  const before = await card.getByTestId("list-item").count();
  const firstQuestion = (await card.getByTestId("list-item").first().locator("span.truncate").innerText()).trim();

  // Remove the first question and save.
  await card.getByTestId("list-remove").first().click();
  await card.getByTestId("list-save").click();
  await expect(card.getByTestId("list-item")).toHaveCount(before - 1);
  const pricing = await (await request.get(`${PUBLIC}/pricing`)).text();
  expect(pricing).not.toContain(firstQuestion.replace(/&/g, "&amp;"));

  // Add a new one.
  await card.getByTestId("list-add-toggle").click();
  const form = card.getByTestId("list-add-form");
  const fields = form.locator('input[type=text]');
  const n = await fields.count();
  for (let i = 0; i < n; i++) await fields.nth(i).fill(i === 0 ? "Is this a <i>new</i> question?" : "Yes, added from the editor.");
  await form.getByTestId("list-add-confirm").click();
  await card.getByTestId("list-save").click();
  await expect(card.getByTestId("list-item")).toHaveCount(before);
  await expect.poll(async () => (await (await request.get(`${PUBLIC}/pricing`)).text()).includes("Is this a &lt;i&gt;new&lt;/i&gt; question?")).toBe(true);

  // Back to the original list.
  await card.getByRole("button", { name: "Reset to original list" }).click();
  await expect(card.getByTestId("list-item")).toHaveCount(before);
  await expect.poll(async () => (await (await request.get(`${PUBLIC}/pricing`)).text()).includes("Is this a")).toBe(false);
});

test("sections: hide one, it leaves the page, show it again", async ({ page, request }) => {
  await openEditor(page);
  const { sections } = await overview(page);
  const sec = sections.find((s) => s.path === "/pricing" && s.id === "questions")!;
  expect(sec).toBeTruthy();
  const faqLead = (await (await request.get(`${PUBLIC}/pricing`)).text()).includes('id="questions"');

  await page.getByTestId("tab-sections").click();
  const row = page.locator(`[data-testid=section-row][data-key="${sec.path}#${sec.id}"]`);
  await row.getByTestId("section-toggle").click();
  await expect(row).toContainText("Hidden");
  if (faqLead) await expect.poll(async () => (await (await request.get(`${PUBLIC}/pricing`)).text()).includes('id="questions"')).toBe(false);
  expect((await overview(page)).sections.find((s) => s.id === "questions" && s.path === "/pricing")!.hidden).toBe(true);

  await row.getByTestId("section-toggle").click();
  await expect(row).toContainText("Showing");
  expect((await overview(page)).sections.find((s) => s.id === "questions" && s.path === "/pricing")!.hidden).toBe(false);
});

test("links and the Contact us email are editable, bad targets are not", async ({ page }) => {
  await openEditor(page);
  const { slots } = await overview(page);
  const email = slots.find((s) => s.kind === "email")!;
  expect(email, "an email slot").toBeTruthy();
  expect((await csrfPost(page, "/api/cms/save", { key: email.key, value: "hello@example.org" })).status()).toBe(200);
  expect((await csrfPost(page, "/api/cms/save", { key: email.key, value: "not an email" })).status()).toBe(400);
  expect((await csrfPost(page, "/api/cms/reset", { key: email.key })).status()).toBe(200);
});

test("signing out ends the session", async ({ page }) => {
  await openEditor(page);
  await page.getByTestId("signout").click();
  await expect(page.getByTestId("login-email")).toBeVisible();
  expect((await page.request.get(`${ADMIN}/api/cms/overview`)).status()).toBe(401);
});
