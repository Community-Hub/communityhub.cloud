import { expect, test } from "@playwright/test";

/**
 * Regression checks for the three old PR4 findings, as they apply to this site:
 * 1. The Great Lakes Science Center exhibit caption must show the exhibit scene
 *    (live-home-story-03.png), not the posed group photo; the workshop caption
 *    keeps the group photo (its high-resolution file).
 * 2. Photos rendered at natural aspect carry width/height that match the file,
 *    so the browser reserves the right box before load.
 * 3. Pressing the storyboard Next button must not move its center (the old
 *    :active transform erased the centering translate).
 */

test("GLSC exhibit captions show the exhibit scene, workshop shows the group photo", async ({ page }) => {
  // Rendered pairing on /demos (Shot photo + demo image both carry exhibit captions).
  await page.goto("/demos");
  const demoPhoto = page.locator('img[alt="Visitors at the exhibit at the Great Lakes Science Center"]');
  await expect(demoPhoto.first()).toHaveAttribute("src", "/assets/live-home-story-03.png");

  // The digital-signage and who frames render inside sliders that only mount
  // nearby layers, so pair their captions to files at the data level: every
  // exhibit-captioned GLSC frame names the exhibit scene, and the one
  // remaining glsc-exhibit.jpg reference is the workshop (group) frame.
  const { readFileSync } = await import("node:fs");
  const pageContent = readFileSync("src/lib/page-content.ts", "utf8");
  expect(pageContent).toContain('src: "/assets/live-home-story-03.png",\n    alt: "A screen and touch kiosk at the Great Lakes Science Center, Cleveland"');
  expect(pageContent).toContain('src: "/assets/glsc-exhibit.jpg",\n    alt: "Students and staff in front of a dashboard screen and a touch tablet"');
  const who = readFileSync("src/lib/who.ts", "utf8");
  expect(who).toContain('src: "/assets/live-home-story-03.png"');
  expect(who).not.toContain("glsc-exhibit.jpg");
  const content = readFileSync("src/lib/content.ts", "utf8");
  expect(content).not.toContain("glsc-exhibit.jpg");
});

test("natural-aspect photos carry intrinsic width/height matching the loaded file", async ({ page }) => {
  await page.goto("/demos");
  const photo = page.locator('img[alt="Visitors at the exhibit at the Great Lakes Science Center"]').first();
  await expect(photo).toHaveAttribute("width", "1077");
  await expect(photo).toHaveAttribute("height", "857");
  const natural = await photo.evaluate((img: HTMLImageElement) => ({ w: img.naturalWidth, h: img.naturalHeight }));
  expect(natural).toEqual({ w: 1077, h: 857 });
});

async function nextButtonCenter(page: import("@playwright/test").Page) {
  const box = await page.getByRole("button", { name: /^Next:/ }).boundingBox();
  expect(box).not.toBeNull();
  return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2, width: box!.width };
}

test("Next button keeps its center while pressed (desktop, mobile, reduced motion)", async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 780 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const before = await nextButtonCenter(page);
    await page.mouse.move(before.x, before.y);
    await page.mouse.down();
    // Hold beyond the 200ms transition so a delayed centering shift is observable.
    await page.waitForTimeout(250);
    const pressed = await nextButtonCenter(page);
    expect(Math.abs(pressed.x - before.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(pressed.y - before.y)).toBeLessThanOrEqual(1);
    await page.mouse.up();
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const before = await nextButtonCenter(page);
  await page.mouse.move(before.x, before.y);
  await page.mouse.down();
  await page.waitForTimeout(250);
  const pressed = await nextButtonCenter(page);
  expect(Math.abs(pressed.x - before.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(pressed.y - before.y)).toBeLessThanOrEqual(1);
  await page.mouse.up();
});
