import { expect, test, type Page } from "@playwright/test";

// The 2026 redesign: the presentation-style home, the shared header, the product tabs, the quotes,
// demo booking links, the LoRaWAN and Studios pages, and no sideways overflow on a phone.

/** Waits until React has taken over the server-rendered page. */
async function ready(page: Page) {
  await page.locator("html[data-hydrated='true']").waitFor({ state: "attached" });
}

// The order John and Maddie agreed on 19 Nov 2026: the problem, what Community Hub is, what it does, what people say,
// then Bring Dashboard to Your Community. Who it's for, What it changed and Pricing sit under the menu instead.
const HOME_PAGES = ["top", "platform", "engage", "educate", "motivate", "voices", "contact"];

async function noSidewaysOverflow(page: Page) {
  const widths = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, view: document.documentElement.clientWidth }));
  expect(widths.doc, `page is ${widths.doc}px wide in a ${widths.view}px viewport`).toBeLessThanOrEqual(widths.view + 1);
}

test.describe("home", () => {
  test("opens on the film, with no Contact us or Book a demo on it", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const hero = page.locator("#top");
    await expect(hero.getByRole("heading", { level: 1 })).toContainText("act locally");
    await expect(hero.getByRole("link")).toHaveCount(0);
    await expect(hero.getByRole("button", { name: /film/i })).toBeVisible();
    // Both are still one step away: Contact us in the menu, and both on the closing page.
    const closing = page.locator("#contact");
    await expect(closing.getByRole("link", { name: "Contact us" }).first()).toHaveAttribute("href", "/contact");
    await expect(closing.getByRole("link", { name: "Book a demo" }).first()).toHaveAttribute("href", /\/contact\?mode=demo/);
  });

  test("reads like a presentation: every page is present, in order, one screen each, with no side dots", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const ids = await page.locator("main.brochure .page").evaluateAll((els) => els.map((el) => el.id));
    expect(ids).toEqual(HOME_PAGES);
    await expect(page.getByRole("navigation", { name: "Pages" })).toHaveCount(0);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType)).toContain("mandatory");
  });

  test("Communities (who it's for) is its own page, and scrolls sideways with its arrows", async ({ page }) => {
    await page.goto("/communities");
    await ready(page);
    await expect(page.getByRole("heading", { level: 1, name: "Communities" })).toBeVisible();
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

// John and Maddie's review of 19 Nov 2026: "I don't know where I am, and I don't know how to get back."
test.describe("finding your way", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the menu is the agreed one, in order, with Home first and no Pricing on top", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const nav = page.getByRole("navigation", { name: "Main" });
    const labels = await nav.locator(".site-nav-item").evaluateAll((els) => els.map((el) => el.textContent?.trim()));
    expect(labels).toEqual(["Home", "Products", "Implementations", "Bring Dashboard to Your Community", "Resources", "About Us", "Contact us"]);
    await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    // Every item looks the same: Contact us is not a filled button.
    const contact = nav.getByRole("link", { name: "Contact us" });
    expect(await contact.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  });

  test("an item with pages under it opens a menu of them", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const nav = page.getByRole("navigation", { name: "Main" });
    const item = nav.getByRole("button", { name: "Bring Dashboard to Your Community" });
    await item.click();
    await expect(item).toHaveAttribute("aria-expanded", "true");
    const links = await nav.locator(".site-nav-menu a").evaluateAll((els) => els.map((el) => `${el.textContent?.trim()} ${el.getAttribute("href")}`));
    expect(links).toEqual(["Communities /communities", "Implementation guide /bring-dashboard-to-your-community", "Pricing /pricing"]);
    await nav.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(/\/pricing$/);
    await page.keyboard.press("Escape");
    for (const [name, child] of [["Implementations", "MidTown Cleveland"], ["Resources", "Teacher toolkit"], ["About Us", "Story of the Dashboard"]]) {
      await nav.getByRole("button", { name }).click();
      await expect(nav.locator(".site-nav-menu").getByRole("link", { name: child })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(nav.locator(".site-nav-menu")).toHaveCount(0);
    }
  });

  for (const [path, section, trail] of [
    ["/pricing", "Bring Dashboard to Your Community", ["Home", "Bring Dashboard to Your Community", "Pricing"]],
    ["/communities", "Bring Dashboard to Your Community", ["Home", "Bring Dashboard to Your Community", "Communities"]],
    ["/bring-dashboard-to-your-community", "Bring Dashboard to Your Community", ["Home", "Bring Dashboard to Your Community"]],
    ["/implementations/midtown-cleveland", "Implementations", ["Home", "Implementations", "MidTown Cleveland"]],
    ["/toolkit", "Resources", ["Home", "Resources", "Teacher toolkit"]],
    ["/story", "About Us", ["Home", "About Us", "Story of the Dashboard"]],
    ["/research", "About Us", ["Home", "About Us", "Research"]],
    ["/citywide-dashboard", "Products", ["Home", "Products", "Citywide Dashboard"]],
    ["/contact", "Contact us", ["Home", "Contact us"]],
  ] as const) {
    test(`${path} shows where you are: ${section} is marked, and the trail leads home`, async ({ page }) => {
      await page.goto(path);
      await ready(page);
      const nav = page.getByRole("navigation", { name: "Main" });
      const marked = await nav.locator(".site-nav-item[data-active]").evaluateAll((els) => els.map((el) => el.textContent?.trim()));
      expect(marked).toEqual([section]);
      // The mark is more than a heavier word: a bar under the item.
      const bar = await nav.locator(".site-nav-item[data-active]").evaluate((el) => {
        const after = getComputedStyle(el, "::after");
        return { height: parseFloat(after.height), color: after.backgroundColor };
      });
      expect(bar.height).toBeGreaterThanOrEqual(3);
      expect(bar.color).not.toBe("rgba(0, 0, 0, 0)");
      const crumbs = page.getByRole("navigation", { name: "Breadcrumb" }).first();
      const items = await crumbs.locator("ol li").evaluateAll((els) => els.map((el) => el.textContent?.trim()));
      expect(items).toEqual([...trail]);
      // The page itself is last and is not a link; Home is first and is one.
      await expect(crumbs.locator("ol li").last().getByRole("link")).toHaveCount(0);
      await crumbs.getByRole("link", { name: "Home" }).click();
      await expect(page).toHaveURL(/\/$/);
    });
  }

  test("the home has no trail, and Home is marked", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveCount(0);
    const nav = page.getByRole("navigation", { name: "Main" });
    expect(await nav.locator(".site-nav-item[data-active]").evaluateAll((els) => els.map((el) => el.textContent?.trim()))).toEqual(["Home"]);
  });

  test("the footer has the menu's sections, heading for heading", async ({ page }) => {
    await page.goto("/about");
    await ready(page);
    const footer = page.getByRole("navigation", { name: "Footer" });
    const headings = await footer.locator("p.eyebrow").evaluateAll((els) => els.map((el) => el.textContent?.trim()));
    expect(headings).toEqual(["Products", "Implementations", "Bring Dashboard to Your Community", "Resources", "About Us"]);
    await expect(footer.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
    await expect(footer.getByRole("link", { name: "Story of the Dashboard" })).toHaveAttribute("href", "/story");
  });

  test("What it changed is on Research, not the home", async ({ page }) => {
    await page.goto("/research");
    await ready(page);
    await expect(page.getByRole("heading", { name: "What it changed" })).toBeVisible();
    await page.goto("/");
    await ready(page);
    await expect(page.getByRole("heading", { name: "What it changed" })).toHaveCount(0);
    await expect(page.locator("main").getByRole("heading", { name: "Pricing" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Who it’s for" })).toHaveCount(0);
  });

  test("Our team is on About, and the menu opens About at it from another page", async ({ page }) => {
    await page.goto("/pricing");
    await ready(page);
    const nav = page.getByRole("navigation", { name: "Main" });
    await nav.getByRole("button", { name: "About Us" }).click();
    await nav.locator(".site-nav-menu").getByRole("link", { name: "Our team" }).click();
    await expect(page).toHaveURL(/\/about$/);
    const team = page.locator("#team");
    await expect(team.getByRole("heading", { name: "Our team" })).toBeInViewport();
    // The people, roles and photos of the original site's team page, nothing added.
    const people = await team.locator("li").evaluateAll((els) => els.map((el) => [...el.querySelectorAll("p")].map((p) => p.textContent?.trim()).join(", ")));
    expect(people).toEqual([
      "John Petersen, Director",
      "Ethan Woodfill, Project Manager",
      "Madeleine Faubert, Design and Media",
      "Gaurav Bora, Software Engineer",
      "Pratyush Bharti, Software Engineer",
      "Hitesh Jangid, Software Engineer",
    ]);
    // The photos load as the section comes into view.
    await expect.poll(() => team.locator("img").evaluateAll((els) => els.length === 6 && els.every((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0))).toBe(true);
    // Already on About: the same link scrolls there without a page change.
    await page.evaluate(() => window.scrollTo(0, 0));
    await nav.getByRole("button", { name: "About Us" }).click();
    await nav.locator(".site-nav-menu").getByRole("link", { name: "Our team" }).click();
    await expect(team.getByRole("heading", { name: "Our team" })).toBeInViewport();
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
    await expect(page.getByRole("heading", { name: "More products" })).toBeVisible();
  });
});

test.describe("LoRaWAN and Studios", () => {
  test("LoRaWAN is a product and never says Fieldline", async ({ page }) => {
    await page.goto("/lorawan");
    await ready(page);
    await expect(page.getByRole("heading", { level: 1, name: "LoRaWAN" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "More products" })).toBeVisible();
    expect(await page.locator("body").innerText()).not.toMatch(/fieldline/i);
  });

  test("Studios plays its published work and opens the studio", async ({ page }) => {
    await page.goto("/studios");
    await ready(page);
    await expect(page.getByRole("heading", { level: 1, name: "Studios" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open Studio/ }).first()).toHaveAttribute("href", "https://studios.communityhb.tech/studio");
    await expect(page.locator("iframe[src*='studios.communityhb.tech']").first()).toBeAttached();
  });

  test("the LoRaWAN console opens inside communityhub.cloud", async ({ page }) => {
    await page.goto("/lorawan");
    await ready(page);
    await page.getByRole("link", { name: "Sign in to the console" }).click();
    await expect(page).toHaveURL(/\/lorawan\/console$/);
    await expect(page.locator("iframe[src^='https://lorawan-sensors.communityhb.tech/']")).toBeAttached();
  });

  test("a Studios example opens inside communityhub.cloud", async ({ page }) => {
    await page.goto("/studios");
    await ready(page);
    await page.getByRole("link", { name: /Air quality in Pittsburgh/ }).click();
    await expect(page).toHaveURL(/\/studios\/view\?map=pittsburgh$/);
    await expect(page.locator("iframe[src*='viewer.html?map=pittsburgh']")).toBeAttached();
  });

  test("the Products menu lists both, with no Engage, Educate or Motivate headings", async ({ page }) => {
    await page.goto("/pricing");
    await ready(page);
    await page.getByRole("button", { name: "Products" }).click();
    const menu = page.locator("#products-menu");
    await expect(menu.getByRole("link", { name: /LoRaWAN/ })).toHaveAttribute("href", "/lorawan");
    await expect(menu.getByRole("link", { name: /Studios/ })).toHaveAttribute("href", "/studios");
    await expect(menu.getByText(/^(Engage|Educate|Motivate and Empower)$/)).toHaveCount(0);
  });
});

test.describe("live examples and the story deck", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  // John and Maddie, 19 Nov: a live dashboard sits still until Play, the wheel over it scrolls the dashboard itself,
  // and once it reaches its end the wheel carries on to the page.
  test("a live dashboard starts paused and offers Play", async ({ page }) => {
    await page.goto("/web-embeddables");
    await ready(page);
    const viewport = page.locator("[data-dashboard-scroll]").first();
    await expect(viewport).toHaveAttribute("data-running", "false");
    const figure = page.locator("[data-slider-box]").filter({ has: viewport }).first();
    await expect(figure.getByRole("button", { name: "Scroll through the dashboard" })).toBeVisible();
  });

  test("Play scrolls the dashboard and only Pause stops it, wherever the pointer rests", async ({ page }) => {
    await page.goto("/web-embeddables");
    await ready(page);
    const viewport = page.locator("[data-dashboard-scroll]").first();
    await viewport.scrollIntoViewIfNeeded();
    expect(await viewport.evaluate((el) => getComputedStyle(el).overflowY)).toBe("scroll");
    const figure = page.locator("[data-slider-box]").filter({ has: viewport }).first();
    const top = () => viewport.evaluate((el) => el.scrollTop);
    // Press Play and leave the pointer on it: the dashboard moves.
    await figure.getByRole("button", { name: "Scroll through the dashboard" }).click();
    await expect(viewport).toHaveAttribute("data-running", "true");
    await expect.poll(top, { timeout: 6000 }).toBeGreaterThan(20);
    // Resting the pointer on the dashboard does not pause it.
    const box = (await viewport.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const before = await top();
    await expect.poll(top, { timeout: 6000 }).toBeGreaterThan(before + 20);
    // Pause stops it.
    await figure.getByRole("button", { name: "Stop scrolling" }).click();
    await expect(viewport).toHaveAttribute("data-running", "false");
    const stopped = await top();
    await page.waitForTimeout(1500);
    expect(await top()).toBeLessThanOrEqual(stopped + 1);
  });

  test("the wheel over a live dashboard scrolls it, then the page", async ({ page }) => {
    await page.goto("/web-embeddables");
    await ready(page);
    const viewport = page.locator("[data-dashboard-scroll]").first();
    await viewport.scrollIntoViewIfNeeded();
    const startY = await page.evaluate(() => window.scrollY);
    const box = (await viewport.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 300);
    await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(100);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(startY + 40);
    // At the dashboard's end the wheel moves the page on: the box must not hold the wheel back. (Checked by hand in a
    // real Chrome window; the headless shell does not hand a wheel from an embedded page on to the outer document.)
    expect(await viewport.evaluate((el) => getComputedStyle(el).overscrollBehaviorY)).toBe("auto");
  });

  test("Story of the Dashboard fills its screen at the slides' own shape", async ({ page }) => {
    await page.goto("/story");
    await ready(page);
    const size = (await page.locator(".story-deck [data-box-frame]").boundingBox())!;
    expect(size.height).toBeGreaterThan(500);
    expect(size.width / size.height).toBeCloseTo(1360 / 1049, 1);
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  for (const path of ["/", "/pricing", "/products", "/digital-signage", "/phone-app", "/about", "/contact", "/implementations", "/lorawan", "/studios", "/communities", "/research"]) {
    test(`${path} has no sideways overflow`, async ({ page }) => {
      await page.goto(path);
    await ready(page);
      await page.waitForTimeout(400);
      await noSidewaysOverflow(page);
    });
  }

  test("on a short phone screen no home section runs into the next, and pages settle gently", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 553 });
    await page.goto("/");
    await ready(page);
    await page.waitForTimeout(600);
    const spills = await page.evaluate(() => {
      const out: string[] = [];
      for (const section of document.querySelectorAll<HTMLElement>(".deck .page")) {
        const bottom = section.getBoundingClientRect().bottom;
        for (const el of section.querySelectorAll<HTMLElement>("*")) {
          if (el.closest(".home-audiences, .strip, .home-tabs, [data-slide], .sr-only") || !el.checkVisibility()) continue;
          let clipped = false;
          for (let a = el.parentElement; a && a !== section; a = a.parentElement) {
            const o = getComputedStyle(a);
            if ((o.overflowY !== "visible" || o.overflowX !== "visible") && a.getBoundingClientRect().bottom <= bottom + 2) clipped = true;
          }
          if (!clipped && el.getBoundingClientRect().bottom > bottom + 2) out.push(`${section.id}: ${el.tagName.toLowerCase()}`);
        }
      }
      return out;
    });
    expect(spills, spills.join(", ")).toEqual([]);
    // "y proximity" is reported as "y" (proximity is the default); what matters is that it is not mandatory on a phone.
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType)).not.toContain("mandatory");
    const photo = await page.locator("#engage [data-box-frame]").first().boundingBox();
    expect(photo!.width, "the example keeps the screen's width").toBeGreaterThan(300);
  });

  test("the menu opens full screen with Contact us and Book a demo", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: "Contact us" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Book a demo" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    await menu.getByRole("button", { name: "Bring Dashboard to Your Community" }).click();
    await expect(menu.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
  });

  test("an inner page has one link back up to the page above", async ({ page }) => {
    await page.goto("/pricing");
    await ready(page);
    const crumbs = page.getByRole("navigation", { name: "Breadcrumb" }).first();
    await expect(crumbs.locator("ol")).toBeHidden();
    await expect(crumbs.getByRole("link", { name: "Bring Dashboard to Your Community" })).toBeVisible();
  });
});
