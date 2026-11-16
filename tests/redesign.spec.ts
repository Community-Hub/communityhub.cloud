import { expect, test, type Page } from "@playwright/test";

// The 2026 redesign: the brochure home, the shared header, the product tabs, the quotes,
// demo booking links, and no sideways overflow on a phone.

/** Waits until React has taken over the server-rendered page. */
async function ready(page: Page) {
  await page.locator("html[data-hydrated='true']").waitFor({ state: "attached" });
}

const HOME_PAGES = ["top", "audiences", "platform", "engage", "educate", "motivate", "voices", "results", "pricing", "contact"];

async function noSidewaysOverflow(page: Page) {
  const widths = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, view: document.documentElement.clientWidth }));
  expect(widths.doc, `page is ${widths.doc}px wide in a ${widths.view}px viewport`).toBeLessThanOrEqual(widths.view + 1);
}

test.describe("home", () => {
  test("opens on the film with Contact us and Book a demo", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const hero = page.locator("#top");
    await expect(hero.getByRole("heading", { level: 1 })).toContainText("act locally");
    await expect(hero.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/contact");
    await expect(hero.getByRole("link", { name: "Book a demo" })).toHaveAttribute("href", /\/contact\?mode=demo/);
    await expect(hero.getByRole("button", { name: /film/i })).toBeVisible();
  });

  test("is a brochure: every page is present, in order, with a dot each", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const ids = await page.locator("main.brochure .page").evaluateAll((els) => els.map((el) => el.id));
    expect(ids).toEqual(HOME_PAGES);
    await expect(page.getByRole("navigation", { name: "Pages" }).getByRole("button")).toHaveCount(HOME_PAGES.length);
  });

  test("a page dot jumps to its page", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    await page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name: "What people say" }).click();
    await expect.poll(async () => page.evaluate(() => Math.abs(document.getElementById("voices")!.getBoundingClientRect().top))).toBeLessThan(80);
  });

  test("category tabs switch the product and its example", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const engage = page.locator("#engage");
    await engage.getByRole("tab", { name: "Phone App" }).click();
    await expect(engage.getByRole("tab", { name: "Phone App" })).toHaveAttribute("aria-selected", "true");
    await expect(engage.getByRole("tabpanel").getByRole("heading", { name: "Phone App" })).toBeVisible();
    await engage.getByRole("tab", { name: "Phone App" }).press("ArrowRight");
    await expect(engage.getByRole("tab", { name: "Web Embeddables" })).toHaveAttribute("aria-selected", "true");
  });

  test("an old storyboard link still opens its product", async ({ page }) => {
    await page.goto("/#educate/stories");
    await ready(page);
    await expect(page.locator("#educate").getByRole("tab", { name: "Stories" })).toHaveAttribute("aria-selected", "true");
  });

  test("quotes: arrows on both sides, dots and Pause below", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const voices = page.locator("#voices");
    await voices.scrollIntoViewIfNeeded();
    const first = await voices.locator("blockquote").innerText();
    await voices.getByRole("button", { name: "Next quote" }).first().click();
    await expect(voices.locator("blockquote")).not.toHaveText(first);
    await expect(voices.locator(".home-dot[aria-current='true']")).toHaveCount(1);
    const pause = voices.getByRole("button", { name: /quotes$/ });
    const label = await pause.getAttribute("aria-label");
    await pause.click();
    await expect(pause).not.toHaveAttribute("aria-label", label ?? "");
  });

  test("the identity row assembles when it comes into view", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const row = page.locator(".home-identity-row");
    await expect(row).toHaveAttribute("data-state", "pending");
    await page.locator("#platform").scrollIntoViewIfNeeded();
    await expect(row).toHaveAttribute("data-state", "in");
  });

  test("a photo that does not fill its box paints no box of its own", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const frame = page.locator("#engage [data-box-frame]").first();
    await frame.scrollIntoViewIfNeeded();
    expect(await frame.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  });
});

test.describe("header", () => {
  test("Products opens the product menu and Escape closes it", async ({ page }) => {
    await page.goto("/pricing");
    await ready(page);
    await page.getByRole("button", { name: "Products" }).click();
    const menu = page.locator("#products-menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: /Digital Signage/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("a skip link reaches the main content", async ({ page }) => {
    await page.goto("/about");
    await ready(page);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  });
});

test.describe("product pages", () => {
  test("lead with Contact us and Book a demo, and list the other products in the group", async ({ page }) => {
    await page.goto("/citywide-dashboard");
    await ready(page);
    await expect(page.getByRole("heading", { level: 1, name: "Citywide Dashboard" })).toBeVisible();
    const main = page.locator("main");
    await expect(main.getByRole("link", { name: "Contact us" }).first()).toHaveAttribute("href", "/contact");
    await expect(main.getByRole("link", { name: "Book a demo" }).first()).toHaveAttribute("href", /mode=demo/);
    await expect(page.getByRole("heading", { name: "More in Educate" })).toBeVisible();
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  for (const path of ["/", "/pricing", "/products", "/digital-signage", "/phone-app", "/about", "/contact", "/implementations"]) {
    test(`${path} has no sideways overflow`, async ({ page }) => {
      await page.goto(path);
    await ready(page);
      await page.waitForTimeout(400);
      await noSidewaysOverflow(page);
    });
  }

  test("the menu opens full screen with Contact us and Book a demo", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: "Contact us" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Book a demo" })).toBeVisible();
  });
});
