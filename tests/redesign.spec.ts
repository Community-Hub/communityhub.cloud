import { expect, test, type Page } from "@playwright/test";

// The 2026 redesign: the presentation-style home, the shared header, the product tabs, the quotes,
// demo booking links, the LoRaWAN and Studios pages, and no sideways overflow on a phone.

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

  test("reads like a presentation: every page is present, in order, one screen each, with no side dots", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const ids = await page.locator("main.brochure .page").evaluateAll((els) => els.map((el) => el.id));
    expect(ids).toEqual(HOME_PAGES);
    await expect(page.getByRole("navigation", { name: "Pages" })).toHaveCount(0);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType)).toContain("mandatory");
  });

  test("Who it's for scrolls sideways with its arrows", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const section = page.locator("#audiences");
    await section.scrollIntoViewIfNeeded();
    const row = section.locator(".home-audiences");
    await expect(section.getByRole("button", { name: "Previous places" })).toBeDisabled();
    await section.getByRole("button", { name: "Next places" }).click();
    await expect.poll(() => row.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
    await expect(section.getByRole("button", { name: "Previous places" })).toBeEnabled();
  });

  test("no picture shows twice on the home", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const srcs = await page.locator("main img").evaluateAll((imgs) =>
      imgs
        .map((img) => new URL((img as HTMLImageElement).currentSrc || (img as HTMLImageElement).src, location.href).pathname)
        .filter((path) => !/\/assets\/(icon-|v1\/)/.test(path)),
    );
    const repeats = srcs.filter((src, i) => srcs.indexOf(src) !== i);
    expect(repeats, `repeated: ${repeats.join(", ")}`).toEqual([]);
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

test.describe("LoRaWAN and Studios", () => {
  test("LoRaWAN is an Educate product and never says Fieldline", async ({ page }) => {
    await page.goto("/lorawan");
    await ready(page);
    await expect(page.getByRole("heading", { level: 1, name: "LoRaWAN" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "More in Educate" })).toBeVisible();
    expect(await page.locator("body").innerText()).not.toMatch(/fieldline/i);
  });

  test("Studios plays its published work and opens the studio", async ({ page }) => {
    await page.goto("/studios");
    await ready(page);
    await expect(page.getByRole("heading", { level: 1, name: "Studios" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open Studio/ }).first()).toHaveAttribute("href", "https://studios.communityhb.tech/studio");
    await expect(page.locator("iframe[src*='studios.communityhb.tech']").first()).toBeAttached();
  });

  test("the Products menu lists both under Educate", async ({ page }) => {
    await page.goto("/pricing");
    await ready(page);
    await page.getByRole("button", { name: "Products" }).click();
    const menu = page.locator("#products-menu");
    await expect(menu.getByRole("link", { name: /LoRaWAN/ })).toHaveAttribute("href", "/lorawan");
    await expect(menu.getByRole("link", { name: /Studios/ })).toHaveAttribute("href", "/studios");
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  for (const path of ["/", "/pricing", "/products", "/digital-signage", "/phone-app", "/about", "/contact", "/implementations", "/lorawan", "/studios"]) {
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
