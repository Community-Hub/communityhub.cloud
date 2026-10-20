import { expect, test, type Page } from "@playwright/test";

// Going down past the first section must never be a one-way trip: wheel, dot and keys all lead back to it.

const PAGES = ["/about", "/who", "/story", "/work", "/pricing", "/products", "/demos", "/research", "/toolkit", "/digital-signage", "/citywide-dashboard", "/data-hub", "/community-voices", "/community-calendar", "/web-embeddables", "/building-dashboard", "/dashboard-builder"];

const dots = (page: Page) => page.getByTestId("stop-dot");
const current = (page: Page) => page.evaluate(() => [...document.querySelectorAll("[data-testid=stop-dot]")].findIndex((d) => d.getAttribute("aria-current") === "true"));

async function leaveStart(page: Page) {
  // the first click can land before the page has hydrated (dev server compiles on demand), so retry it
  await expect(async () => {
    await dots(page).nth(1).click();
    expect(await current(page)).toBe(1);
  }).toPass({ timeout: 10_000 });
  await page.waitForTimeout(300); // the slide settles (220 ms) before a person's next key
}

for (const path of PAGES) {
  test(`${path}: section 1 can be reached again by wheel, dot and keys`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path, { waitUntil: "load" });
    test.skip((await dots(page).count()) < 2, "a single-section page");
    await page.mouse.move(8, 450);

    await leaveStart(page);
    await page.mouse.wheel(0, -400);
    await expect.poll(() => current(page)).toBe(0);

    await leaveStart(page);
    await dots(page).first().click();
    await expect.poll(() => current(page)).toBe(0);

    for (const key of ["ArrowUp", "PageUp", "Home"]) {
      await leaveStart(page);
      await page.keyboard.press(key);
      await expect.poll(() => current(page), { message: key }).toBe(0);
    }
  });
}

// The home page opens on a full-screen film that folds into the first chapter (Voices). The film is its own first stop and first dot.
const HERO = 0;
const VOICES = 1;
const WHO = 2;
const hero = (page: Page) => page.locator("[data-hero-film]");
const heroHeight = async (page: Page) => ((await hero(page).boundingBox())?.height ?? 0) / (page.viewportSize()?.height ?? 1);
/** The film fills the screen below the header and is the current stop. */
const expectFilm = async (page: Page) => {
  await expect.poll(() => current(page), { message: "the first dot is current" }).toBe(HERO);
  await expect.poll(() => heroHeight(page), { message: "the film is full height" }).toBeGreaterThan(0.85);
  await expect(hero(page)).toHaveAttribute("data-hero-film", "film");
};
async function toDot(page: Page, n: number) {
  // The first click can land before the page has hydrated, so retry it.
  await expect(async () => {
    await dots(page).nth(n).click();
    expect(await current(page)).toBe(n);
  }).toPass({ timeout: 10_000 });
  await page.waitForTimeout(300);
}
async function openHome(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "load" });
  await page.mouse.move(8, 450);
  await toDot(page, VOICES);
  await expect(hero(page)).toHaveAttribute("data-hero-film", "banner");
  await expect.poll(() => heroHeight(page)).toBeLessThan(0.4); // the film is now a banner above the stories
}

test("/: the rail starts with a dot for the film, named by its heading", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "load" });
  await expect(dots(page)).toHaveCount(8);
  await expect(dots(page).first()).toHaveAttribute("aria-label", /It has never been more important to act locally while thinking globally/);
  await expect(dots(page).nth(VOICES)).toHaveAttribute("aria-label", "Voices");
});

test("/: from Voices, the wheel brings the full-screen film back", async ({ page }) => {
  await openHome(page);
  await page.mouse.wheel(0, -400);
  await expectFilm(page);
});

test("/: from Voices, the first dot brings the full-screen film back", async ({ page }) => {
  await openHome(page);
  await dots(page).first().click();
  await expectFilm(page);
});

for (const key of ["ArrowUp", "PageUp", "Home"]) {
  test(`/: from Voices, ${key} brings the full-screen film back`, async ({ page }) => {
    await openHome(page);
    await page.keyboard.press(key);
    await expectFilm(page);
  });
}

test("/: from further down, Home, the first dot and two steps up all lead back to the film", async ({ page }) => {
  await openHome(page);
  await toDot(page, WHO);
  await page.keyboard.press("Home");
  await expectFilm(page);

  await openHome(page);
  await toDot(page, WHO);
  await dots(page).first().click();
  await expectFilm(page);

  await openHome(page);
  await toDot(page, WHO);
  await page.mouse.wheel(0, -400);
  await expect.poll(() => current(page)).toBe(VOICES);
  await page.waitForTimeout(500);
  await page.mouse.wheel(0, -400);
  await expectFilm(page);
});

test("/: the film leads on again, and back, with the keys", async ({ page }) => {
  await openHome(page);
  await page.keyboard.press("Home");
  await expectFilm(page);
  await page.waitForTimeout(300);
  await page.keyboard.press("ArrowDown");
  await expect.poll(() => current(page)).toBe(VOICES);
  await expect(hero(page)).toHaveAttribute("data-hero-film", "banner");
});

test("/: the wheel still leads back while the pointer rests on the identity graphic", async ({ page }) => {
  await openHome(page);
  await toDot(page, WHO);
  const deck = page.locator(".home-identity");
  await expect(deck).toBeVisible();
  const box = (await deck.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, -400);
  await expect.poll(() => current(page)).toBe(VOICES);
});

for (const source of ["/#who", "/products"]) {
  test(`${source}: brand link returns to the home opening film`, async ({ page }) => {
    await page.goto(source);
    await page.getByRole("link", { name: "CommunityHub", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expectFilm(page);
  });
}
