import { test, expect, type Page } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

/** The page listens for gestures once it has hydrated, which `load` does not wait for. */
async function open(page: Page, route: string) {
  await page.goto(route, { waitUntil: "load" });
  await page.waitForTimeout(900);
}

const selected = (page: Page) => page.locator("section:not([inert]) [role=tab][aria-selected=true]").first().innerText();

test("/demos: a wheel outside the embed steps the place tabs before the page moves on", async ({ page }) => {
  await open(page, "/demos");
  const first = await selected(page);
  // Over the heading, well away from the live dashboard.
  await page.mouse.move(120, 140);
  const seen = [first];
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(450);
    seen.push(await selected(page));
  }
  // Every wheel moved one tab: four different places, still on the first stop.
  expect(new Set(seen).size).toBe(4);
  expect(page.url()).not.toContain("#who");
  await expect(page.getByRole("heading", { level: 1, name: "Dashboards" })).toBeVisible();
  // At the last place the next wheel leaves for the next stop.
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(450);
  await expect(page).toHaveURL(/#who$/);
});

test("/demos: arrow keys step the place tabs too", async ({ page }) => {
  await open(page, "/demos");
  const first = await selected(page);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(450);
  expect(await selected(page)).not.toBe(first);
  expect(page.url()).not.toContain("#who");
});

test("/who: a wheel steps the tabs first", async ({ page }) => {
  for (const route of ["/who"]) {
    await open(page, route);
    const first = await selected(page);
    await page.mouse.move(120, 140);
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(450);
    expect(await selected(page), route).not.toBe(first);
  }
});

test("/digital-signage scrolls normally and can leave the controller in either direction", async ({ page }) => {
  await open(page, "/digital-signage#try-the-phone");
  await expect(page.getByRole('heading',{name:'Try the phone controller',exact:true})).toBeVisible();
  const start=await page.evaluate(()=>window.scrollY);
  await page.mouse.move(15,300);
  await page.mouse.wheel(0,400);
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(start+100);
  await page.mouse.wheel(0,-800);
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeLessThan(start);
  await page.getByRole('button',{name:'Try the phone',exact:true}).click();
  await page.getByRole('button',{name:'Previous section',exact:true}).click();
  await expect(page).toHaveURL(/#use-your-phone$/);
  await page.getByRole('button',{name:'Next section',exact:true}).click();
  await expect(page).toHaveURL(/#try-the-phone$/);
});

test("/demos: a wheel over the live embed does not step the tabs", async ({ page }) => {
  await open(page, "/demos");
  const first = await selected(page);
  const box = await page.locator("iframe").first().boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(450);
  expect(await selected(page)).toBe(first);
  expect(page.url()).not.toContain("#who");
});
