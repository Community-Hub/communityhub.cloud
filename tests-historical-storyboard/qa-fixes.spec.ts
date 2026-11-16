import { test, expect } from "@playwright/test";

// Fixes from the visual QA pass (QA-SENSE-261008).
test("the 404 page keeps its own address when stepping with the keyboard", async ({ page }) => {
  await page.goto("/nope-404", { waitUntil: "domcontentloaded" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(600);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(600);
  expect(new URL(page.url()).pathname).toBe("/nope-404");
});

test("home product tabs follow the ARIA pattern: arrows move focus and selection", async ({ page }) => {
  await page.goto("/#educate/building", { waitUntil: "domcontentloaded" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[inert]").first()).toBeAttached();
  const tabs = page.getByRole("region", { name: "Educate" }).getByRole("tab");
  const first = tabs.nth(0);
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("tabindex", "0");
  await expect(tabs.nth(0)).toHaveAttribute("tabindex", "-1");
});

test("the hero film has no Pause or Skip button; the chevron opens the stories", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[inert]").first()).toBeAttached();
  await expect(page.getByRole("button", { name: /skip the film|pause film|play film/i })).toHaveCount(0);
  await page.getByRole("button", { name: "Next: Voices", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pause stories" })).toBeVisible();
  await page.locator("[data-feature-box]").hover();
  await page.getByRole("button", { name: "Pause stories" }).click();
  await expect(page.getByRole("button", { name: "Play stories" })).toBeVisible();
});

test("the citywide page links to the live dashboard", async ({ page }) => {
  await page.goto("/citywide-dashboard", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: "Open live dashboard" })).toHaveAttribute("href", /environmentaldashboard\.org\/cwd-files\/dashboard\.php/);
});

test("the old /building-dashboard address opens the Building Dashboard page and keeps its hash", async ({ page }) => {
  await page.goto("/building-dashboard#kahn-hall", { waitUntil: "domcontentloaded" });
  expect(new URL(page.url()).pathname).toBe("/dashboard-builder");
  await expect(page.getByRole("heading", { level: 1, name: "Building Dashboard" })).toBeVisible();
});
