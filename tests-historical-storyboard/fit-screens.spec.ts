import { expect, test, type Page } from "@playwright/test";

/**
 * Every paged screen fits its viewport: at each size, step through every stop (and every tab on it)
 * and check that nothing inside the active section scrolls or is cut off.
 */
const SIZES = [
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1366, height: 650 },
  { width: 1280, height: 720 },
];
const ROUTES = [
  "/", "/story", "/about", "/who", "/pricing", "/products", "/citywide-dashboard",
  "/community-calendar", "/community-voices", "/stories", "/data-hub", "/dashboard-builder", "/web-embeddables",
  "/demos", "/toolkit", "/research", "/resources", "/work",
];

const ACTIVE = "section:not([inert])";

/** React has attached to the page, fonts are in, and the stop count (toolkit and research split by measuring) has stopped changing. */
async function settle(page: Page) {
  const dots = page.getByTestId("stop-dot");
  const seen: number[] = [];
  await expect
    .poll(async () => {
      const ready = await page.evaluate(
        () =>
          document.fonts.status === "loaded" &&
          [...document.querySelectorAll("button, a")].some((el) => Object.keys(el).some((k) => k.startsWith("__reactProps"))),
      );
      if (!ready) return false;
      // Two frames: the measured split re-runs after fonts and hydration.
      await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
      seen.push(await dots.count());
      return seen.length >= 3 && seen.slice(-3).every((n) => n === seen.at(-1));
    }, { intervals: [120], timeout: 10_000 })
    .toBe(true);
  return dots.count();
}

/** The active section has come to rest at the top of the viewport (and the home film, if any, has finished folding or unfolding). */
const atRest = async (page: Page) => {
  await expect
    .poll(async () => Math.abs((await page.locator(ACTIVE).first().boundingBox())?.y ?? 999), { intervals: [60] })
    .toBeLessThanOrEqual(1);
  const film = page.locator(`${ACTIVE} [data-hero-film]`);
  if (!(await film.count())) return;
  let last = -1;
  await expect
    .poll(async () => {
      const h = (await film.boundingBox())?.height ?? 0;
      const still = h === last;
      last = h;
      return still;
    }, { intervals: [150] })
    .toBe(true);
};

/** Pixels of overflow for every visible scroll container that has more content than room. */
const overflow = (page: Page) =>
  page.evaluate(() => {
    const out: number[] = [];
    for (const el of document.querySelectorAll("*")) {
      if (el.closest("[inert]") || el.clientHeight < 50) continue;
      if (el.scrollHeight <= el.clientHeight + 2) continue;
      const y = getComputedStyle(el).overflowY;
      if ((y === "auto" || y === "scroll") && !el.matches("[data-allow-scroll]")) out.push(el.scrollHeight - el.clientHeight);
    }
    return out;
  });

/** Text, links, buttons and pictures in the active section that sit outside the screen or inside a box that cuts them off. */
const clipped = (page: Page) =>
  page.evaluate((active) => {
    const out: string[] = [];
    const vh = window.innerHeight;
    const section = document.querySelector(active);
    if (!section) return out;
    for (const el of section.querySelectorAll<HTMLElement>("a, button, img, h1, h2, h3, p, li, b, dt, dd, figcaption, summary")) {
      if (el.closest("[aria-hidden=true], .sr-only, .invisible, [data-allow-clip], iframe") || el.getClientRects().length === 0) continue;
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.opacity === "0") continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const own = el.tagName === "IMG" || [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim());
      if (!own && el.tagName !== "BUTTON") continue;
      const name = `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("alt") || "").trim().slice(0, 30)}"`;
      const scroller = el.closest("[data-allow-scroll]");
      if (!scroller && r.bottom > vh + 2) out.push(`${name} runs ${Math.round(r.bottom - vh)}px below the screen`);
      for (let a = el.parentElement; a && a !== section.parentElement; a = a.parentElement) {
        if (a === scroller) break;
        const o = getComputedStyle(a);
        if (o.overflowY !== "hidden" && o.overflowY !== "clip") continue;
        const box = a.getBoundingClientRect();
        if (r.bottom > box.bottom + 2 || r.top < box.top - 2) {
          out.push(`${name} is cut off by ${a.tagName.toLowerCase()}.${String(a.className).split(" ")[0]}`);
          break;
        }
      }
    }
    return out;
  }, ACTIVE);

const problems = async (page: Page) => [
  ...(await overflow(page)).map((px) => `scrolls ${px}px`),
  ...(await clipped(page)),
  ...(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1) ? ["horizontal page overflow"] : []),
];

for (const size of SIZES) {
  test.describe(`${size.width}x${size.height}`, () => {
    test.use({ viewport: size });
    for (const route of ROUTES) {
      test(`${route} has no inaccessible clipping or horizontal overflow`, async ({ page }) => {
        test.setTimeout(120_000);
        await page.goto(route, { waitUntil: "load" });
        const dots = page.getByTestId("stop-dot");
        const stops = await settle(page);
        const bad: string[] = [];
        for (let i = 0; i < Math.max(stops, 1); i++) {
          if (stops) {
            // A real click, retried until the page has hydrated and the stop is current.
            await expect(async () => {
              await dots.nth(i).click({ timeout: 1000 });
              await expect(dots.nth(i)).toHaveAttribute("aria-current", "true", { timeout: 500 });
            }).toPass({ timeout: 10_000 });
            await atRest(page);
          }
          for (const p of await problems(page)) bad.push(`stop ${i}: ${p}`);
          const tabs = page.locator(`${ACTIVE} [role=tab]:visible`);
          const count = await tabs.count();
          for (let t = 0; t < count; t++) {
            await tabs.nth(t).click();
            await expect(tabs.nth(t)).toHaveAttribute("aria-selected", "true");
            for (const p of await problems(page)) bad.push(`stop ${i} tab ${t}: ${p}`);
          }
        }
        expect(bad, `${route} at ${size.width}x${size.height}`).toEqual([]);
      });
    }
  });
}

test.describe("controls", () => {
  test("stop dots remain usable beside the scrollable toolkit", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/toolkit", { waitUntil: "load" });
    const dots = page.getByTestId("stop-dot");
    await settle(page);
    expect(await dots.count()).toBeGreaterThanOrEqual(2);
    for (const box of await dots.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))) expect(box).toBeGreaterThanOrEqual(23.9);
  });

  test("tabs follow the WAI-ARIA pattern: arrow keys move focus and selection, and each tab names its panel", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/who", { waitUntil: "load" });
    await settle(page);
    const tabs = page.locator(`${ACTIVE} [role=tab]`);
    await expect(async () => {
      await tabs.first().focus();
      await page.keyboard.press("ArrowRight");
      await expect(tabs.nth(1)).toBeFocused({ timeout: 500 });
    }).toPass({ timeout: 10_000 });
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(tabs.nth(1)).toHaveAttribute("tabindex", "0");
    await expect(tabs.first()).toHaveAttribute("tabindex", "-1");
    const panel = await tabs.nth(1).getAttribute("aria-controls");
    await expect(page.locator(`[role=tabpanel]#${panel}`)).toHaveAttribute("aria-labelledby", (await tabs.nth(1).getAttribute("id"))!);
    await page.keyboard.press("End");
    await expect(tabs.last()).toBeFocused();
    await page.keyboard.press("Home");
    await expect(tabs.first()).toBeFocused();
  });
});
