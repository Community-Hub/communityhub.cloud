import { test, expect } from "@playwright/test";
import { readdirSync } from "node:fs";

// Every file in src/routes (except the root layout) is a page: index.tsx is "/".
const routes = readdirSync("src/routes")
  // admin.tsx is the editor: it only exists on the ADMIN_HOST (see admin.spec.ts) and 404s here.
  .filter((f) => f.endsWith(".tsx") && !f.startsWith("__") && f !== "admin.tsx")
  .map((f) => f.replace(/\.tsx$/, ""))
  .map((name) => (name === "index" ? "/" : `/${name}`));

test("route list is not empty", () => {
  expect(routes.length).toBeGreaterThan(10);
});

for (const path of routes) {
  test(`loads ${path} without console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      // Errors raised inside third-party embeds (e.g. the Community Hub signage
      // iframe) are not ours to fix; only fail on errors from this site.
      const url = msg.location().url;
      if (url && !url.startsWith("http://127.0.0.1")) return;
      errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));

    const res = await page.goto(path, { waitUntil: "load" });
    expect(res?.status(), `HTTP status for ${path}`).toBe(200);
    await expect(page.locator("body")).not.toBeEmpty();
    await page.waitForTimeout(500);

    expect(errors).toEqual([]);
  });
}
