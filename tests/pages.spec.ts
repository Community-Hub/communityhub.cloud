import { test, expect } from "@playwright/test";

test.describe("/who", () => {
  test("has five audience tabs and opens one from the hash", async ({ page }) => {
    await page.goto("/who");
    const tabs = page.getByRole("tablist", { name: "Audiences" }).first().getByRole("tab");
    await expect(tabs).toHaveCount(5);
    await expect(page.locator("[data-who-stop]")).toHaveAttribute("data-who-stop", "neighborhoods");
    await page.goto("/who#schools");
    await expect(page.locator("[data-who-stop]")).toHaveAttribute("data-who-stop", "schools");
    await expect(page.getByRole("tab", { name: "Schools" }).first()).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("People are always learning from buildings because of our technology.")).toBeVisible();
  });

  test("shows a live example and a Contact us link", async ({ page }) => {
    await page.goto("/who#cities");
    await expect(page.locator("[data-slider-box]").first()).toBeVisible();
    await expect(page.locator("[data-slider-box] iframe").first()).toBeAttached();
    await page.getByRole("button", { name: "Next section" }).click();
    await expect(page.locator("[data-who-example]")).toBeVisible();
    await expect(page.getByText("How to take part")).toBeVisible();
    await expect(page.getByRole("link", { name: "Contact us" }).last()).toHaveAttribute("href", /^mailto:/);
  });

  test("schools has no take-part block", async ({ page }) => {
    await page.goto("/who#schools");
    await page.getByRole("button", { name: "Next section" }).click();
    await expect(page.locator("[data-who-example]")).toBeVisible();
    await expect(page.locator("[data-who-involve]")).toHaveCount(0);
  });
});

test.describe("/pricing", () => {
  test("on a phone: three bundle tabs, no dollar prices and a quote link", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/pricing");
    await expect(page.getByRole("tablist", { name: "Bundles" }).first().getByRole("tab")).toHaveCount(3);
    await expect(page.locator("[data-bundle]").getByText("Pricing on request")).toBeVisible();
    expect(await page.locator("body").innerText()).not.toMatch(/\$\s?\d/);
    const href = await page.locator("[data-bundle] a", { hasText: "Contact us" }).getAttribute("href");
    expect(decodeURIComponent(href ?? "")).toContain("subject=Quote: Communications bundle");
    await page.goto("/pricing#pro");
    await expect(page.locator("[data-bundle]")).toHaveAttribute("data-bundle", "pro");
  });

  test("on a wide screen: all three bundles side by side, no tabs", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pricing");
    const cards = page.locator("[data-bundle-card]");
    await expect(cards).toHaveCount(3);
    const boxes = await cards.evaluateAll((els) => els.map((el) => el.getBoundingClientRect()));
    expect(new Set(boxes.map((b) => Math.round(b.top))).size).toBe(1);
    expect(boxes[2].right).toBeLessThanOrEqual(1440);
    await expect(page.getByRole("tab")).toHaveCount(0);
    expect(await page.locator("body").innerText()).not.toMatch(/\$\s?\d/);
  });

  test("lists services and five questions", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("[data-services] li")).toHaveCount(2);
    await expect(page.locator("[data-faq] details")).toHaveCount(5);
  });
});

test.describe("links to the new pages", () => {
  test("footer doors point to /who and /pricing", async ({ page }) => {
    await page.goto("/#footer");
    const doors = page.locator("[data-footer-doors]");
    await expect(doors.getByRole("link", { name: "Who it’s for" })).toHaveAttribute("href", "/who");
    await expect(doors.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
  });

  test("Keep exploring on a product page offers Who it's for and Pricing", async ({ page }) => {
    await page.goto("/dashboard-builder");
    const more = page.locator("[data-keep-exploring-more]");
    await expect(more.getByRole("link", { name: "Who it’s for" })).toHaveAttribute("href", "/who");
    await expect(more.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
  });
});
