import { test, expect } from "@playwright/test";
import { PUBLIC_ROUTES } from "../src/lib/legacy-redirects";

/** An uncaught error whose stack runs only through another site's scripts (an embedded dashboard) is not ours. */
function fromAnEmbed(err: Error) {
  const sites = (err.stack ?? "").split("\n").filter((line) => /https?:\/\//.test(line));
  return sites.length > 0 && sites.every((line) => !line.includes("127.0.0.1"));
}


// Every public route (the same list the sitemap and the smoke build use).
const routes = [...PUBLIC_ROUTES];

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
      // An embed's own scripts can report with no location at all (a dashboard whose data fetch is refused,
      // say), so only errors that name this site count.
      const url = msg.location().url;
      if (!url || !url.startsWith("http://127.0.0.1")) return;
      errors.push(msg.text());
    });
    page.on("pageerror", (err) => {
      if (!fromAnEmbed(err)) errors.push(err.message);
    });

    const res = await page.goto(path, { waitUntil: "load" });
    expect(res?.status(), `HTTP status for ${path}`).toBe(200);
    await expect(page.locator("body")).not.toBeEmpty();
    await page.waitForTimeout(500);

    expect(errors).toEqual([]);
  });
}
