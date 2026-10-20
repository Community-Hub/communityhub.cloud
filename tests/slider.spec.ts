import { test, expect } from "@playwright/test";
import voicesFilters from "../src/data/voices-filters.json" with { type: "json" };

// The slider box on /digital-signage (Oberlin examples).
const box = (page: import("@playwright/test").Page) => page.locator("#oberlin [data-slider-box]");

test.describe("slider box", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/digital-signage#oberlin", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-demo-controller] iframe")).toBeAttached();
    await box(page).scrollIntoViewIfNeeded();
    await box(page).hover();
  });

  test("one box with fixed side controls in the same place on every slide", async ({ page }) => {
    const b = box(page);
    await expect(b.locator("[data-control]")).toHaveCount(2);
    const before = await b.locator('[data-control="next"]').boundingBox();
    await b.locator('[data-control="next"]').click();
    await expect(b).toHaveAttribute("data-index", "1");
    const after = await b.locator('[data-control="next"]').boundingBox();
    expect(after?.x).toBeCloseTo(before!.x, 0);
    expect(after?.y).toBeCloseTo(before!.y, 0);
    const btn = await b.locator('[data-control="next"]').boundingBox();
    expect(btn!.width).toBeGreaterThanOrEqual(40);
    expect(btn!.height).toBeGreaterThanOrEqual(40);
  });

  test("next and previous move a real slide sideways", async ({ page }) => {
    const b = box(page);
    await b.locator('[data-control="next"]').click();
    const name = await b.locator('[data-slide="1"]').evaluate((el) => getComputedStyle(el).animationName);
    expect(name).toBe("sb-in-from-right");
    await expect(b).toHaveAttribute("data-index", "1");
    await b.locator('[data-control="prev"]').click();
    await expect(b).toHaveAttribute("data-index", "0");
    const back = await b.locator('[data-slide="0"]').evaluate((el) => getComputedStyle(el).animationName);
    expect(back).toBe("sb-in-from-left");
  });

  test("Left and Right keys step the slider", async ({ page }) => {
    const b = box(page);
    await b.focus();
    await page.keyboard.press("ArrowRight");
    await expect(b).toHaveAttribute("data-index", "1");
    await page.keyboard.press("ArrowLeft");
    await expect(b).toHaveAttribute("data-index", "0");
  });

  test("reduced motion cuts: no animation and the old slide is gone", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const b = box(page);
    await b.locator('[data-control="next"]').click();
    await expect(b).toHaveAttribute("data-index", "1");
    const name = await b.locator('[data-slide="1"]').evaluate((el) => getComputedStyle(el).animationName);
    expect(name).toBe("none");
    await expect(b.locator('[data-slide="0"]')).toBeHidden();
  });
});

test.describe("Community Voices player", () => {
  const first = voicesFilters.filters[0];
  const second = voicesFilters.filters[1];

  test("shows the real player with a Place - Filter title", async ({ page }) => {
    await page.goto("/community-voices");
    const frame = page.locator('iframe[title^="Community Voices"]').first();
    await expect(frame).toHaveAttribute("src", first.url);
    await expect(page.getByText(first.title, { exact: true }).first()).toBeVisible();
  });

  test("moves to the next filter after 16 s, and stays put on hover", async ({ page }) => {
    await page.clock.install();
    await page.goto("/community-voices");
    const frame = page.locator('iframe[title^="Community Voices"]').first();
    await frame.scrollIntoViewIfNeeded();
    await expect(frame).toHaveAttribute("src", first.url);
    await page.mouse.move(2, 2);
    await page.clock.runFor(16_500);
    await expect(frame).toHaveAttribute("src", second.url);
    await page.locator("[data-slider-box]").first().hover(); // the pointer rests on the clear shield over the player
    await page.clock.runFor(40_000);
    await expect(frame).toHaveAttribute("src", second.url);
  });
});
