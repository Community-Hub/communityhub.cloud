import { test, expect, type Page } from "@playwright/test";

// The home page is one storyboard of full-screen chapters. A hash like #educate/building opens a chapter and a tab.
const open = async (page: Page, hash: string) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`/${hash}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
};

test.describe("new tabs", () => {
  test("Educate has a Building Dashboard tab with the v1 text, its own icon and a real Harkness dashboard as its first example", async ({ page }) => {
    await open(page, "#educate/building");
    const section = page.getByRole("region", { name: "Educate" });
    const tab = section.getByRole("tab", { name: "Building Dashboard" });
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect(section.getByText("Building Dashboard tracks and communicates patterns of real-time resource use in buildings")).toBeVisible();
    await expect(section.locator('iframe[title="Oberlin College – Harkness Co-op"]')).toHaveAttribute("src", /\/oc\/dashboard\/815/);
    await expect(section.getByText("Example 1 of 2")).toHaveCount(1);
    await expect(section.getByRole("tab", { name: "Dashboard Builder" })).toHaveCount(0);
    await expect(section.getByRole("tab", { name: "Data dashboard" })).toHaveCount(0);
  });

  test("Motivate has a Results tab with six examples and a Learn more to /research", async ({ page }) => {
    await open(page, "#motivate/results");
    const section = page.getByRole("region", { name: "Motivate and Empower" });
    await expect(section.getByRole("tab", { name: "Results" })).toHaveAttribute("aria-selected", "true");
    await expect(section.getByText("Example 1 of 6")).toHaveCount(1);
    await expect(section.getByRole("link", { name: "Learn more" })).toHaveAttribute("href", "/research");
    await expect(section.getByRole("img", { name: /Chart of average whole-dorm electricity/ })).toBeVisible();
    await section.locator('[data-slider-box]').hover();
    await section.locator('[data-control="next"]').click();
    await expect(section.locator("[data-slider-box]")).toHaveAttribute("data-index", "1");
  });
});

test.describe("who chapter", () => {
  test("uses original mission text and keeps the full backstory off the homepage", async ({ page }) => {
    await open(page, "#who");
    const section = page.getByRole("region", { name: "Who we are" });
    await expect(section.getByRole("heading", { name: "Community Hub is a community-centered communication platform.", exact: true })).toBeVisible();
    await expect(section.getByText("Communication innovations have enhanced", { exact: false })).toBeVisible();
    await expect(section.getByText("CommunityHub’s award-winning communication platform", { exact: false })).toBeVisible();
    await expect(section.locator("iframe")).toHaveCount(0);
    await expect(section.getByRole("img", { name: "Community Hub", exact: true })).toBeVisible();
  });
});

test.describe("footer doors", () => {
  test("three doors and the one contact CTA", async ({ page }) => {
    await open(page, "#footer");
    const footer = page.getByRole("region", { name: "Footer" });
    await expect(footer.getByText("Community engagement is community building.")).toBeVisible();
    const doors = footer.locator("[data-footer-doors]");
    await expect(doors.getByRole("link")).toHaveText(["Who it’s for", "Pricing", "Bring one"]);
    await expect(doors.getByRole("link", { name: "Bring one" })).toHaveAttribute("href", "/demos#bring");
    await expect(footer.getByRole("link", { name: "Contact us" }).first()).toHaveAttribute("href", /^mailto:/);
  });
});

test.describe("problem chapter quotes", () => {
  test("credit sourced speaker and historical role", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#problem", { waitUntil: "domcontentloaded" });
    const section = page.getByRole("region", { name: "Voices" });
    const org = section.locator(".home-feature-content:not([aria-hidden]) [data-quote-org]");
    await expect(org).toHaveText("Oberlin College");
    await expect(section.getByText("Grace Gao", {exact:true})).toBeVisible();
    await expect(section.getByText("Role at time of testimonial", {exact:true})).toBeVisible();
    await expect(section.getByText("People already feel it")).toHaveCount(0);
    await section.locator("[data-feature-box]").hover();
    await section.getByRole("button", { name: "Next story" }).click();
    await section.locator("[data-feature-box]").hover();
    await section.getByRole("button", { name: "Next story" }).click();
    await expect(org).toHaveText("Great Lakes Science Center");
  });
});
