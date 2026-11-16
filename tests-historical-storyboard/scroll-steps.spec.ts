import { test, expect, type Page } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

/** The page listens for gestures once it has hydrated, which `load` does not wait for. */
async function open(page: Page, route: string) {
  await page.goto(route, { waitUntil: "load" });
  await page.waitForTimeout(900);
}

const selected = (page: Page) => page.locator("section:not([inert]) [role=tab][aria-selected=true]").first().innerText();

test("desktop Pricing ignores hidden bundle tabs when swiping to services", async ({ page }) => {
  await open(page, "/pricing");
  await page.mouse.move(120, 140);
  await page.mouse.wheel(0, 120);
  await expect(page).toHaveURL(/#services$/);
});

test("phone Pricing still steps its visible bundle tabs", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/pricing");
  await page.mouse.move(15, 110);
  await page.mouse.wheel(0, 120);
  await expect(page.locator("[data-bundle]")).toHaveAttribute("data-bundle", "data");
});

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
  await page.getByRole('button',{name:/^Next:/,exact:true}).click();
  await expect(page).toHaveURL(/#try-the-phone$/);
});

/**
 * Dispatches one synthetic trackpad swipe (finger ramp + momentum decay, logical timestamps) at the visible chapter.
 * Logical time advances 1000ms between calls so each call starts from silence inside the classifier,
 * while strokes inside one call stay as close together as `gaps` says — the fast-repeat case.
 */
async function swipe(page: Page, gaps: number[], dirs: (1 | -1)[] = [1, 1, 1]) {
  // One evaluate per stroke, with a real task boundary between them: a browser delivers fast
  // strokes across frames and React renders the new beat in between, which the inner-step
  // handler reads. The logical timestamps still keep the strokes `gap` ms apart.
  for (let i = 0; i < gaps.length; i++) {
    await page.evaluate(
      ({ gap, dir, first, last }) => {
        const w = window as unknown as { __swipeT?: number };
        const start = first ? (w.__swipeT = (w.__swipeT ?? performance.now()) + 1000) : w.__swipeT!;
        const mags = [0.07, 0.18, 0.38, 0.68, 1].map((f) => Math.max(1, Math.round(42 * f)));
        for (let k = 1; k < 26; k++) mags.push(Math.max(1, Math.round(42 * 0.82 * Math.exp(-k / 6))));
        const target = document.querySelector("section:not([inert])")!;
        mags.forEach((m, k) => {
          const t = start + k * 12;
          if (!last && t >= start + gap) return; // the next finger stroke cuts this momentum tail
          const ev = new WheelEvent("wheel", { deltaY: m * dir, bubbles: true, cancelable: true });
          Object.defineProperty(ev, "timeStamp", { value: t });
          target.dispatchEvent(ev);
        });
        w.__swipeT = start + gap;
      },
      { gap: gaps[i], dir: dirs[i], first: i === 0, last: i === gaps.length - 1 },
    );
    await page.waitForTimeout(50);
  }
}

test("home Educate: fast repeated swipes walk the examples one per swipe, and back", async ({ page }) => {
  await open(page, "/#educate/building");
  await expect(page).toHaveURL(/#educate\/building$/);
  // Two deliberate strokes 140ms apart (inside the old 200ms lock): building -> city -> hub, no skip, no drop.
  await swipe(page, [140, 10_000]);
  await expect(page).toHaveURL(/#educate\/hub$/, { timeout: 5000 });
  // One swipe with its full momentum tail moves exactly one more beat.
  await swipe(page, [10_000]);
  await expect(page).toHaveURL(/#educate\/stories$/, { timeout: 5000 });
  // Fast reversal strokes walk back one per swipe.
  await swipe(page, [140, 10_000], [-1, -1]);
  await expect(page).toHaveURL(/#educate\/city$/, { timeout: 5000 });
});

test("home Educate: two fast touch flicks each step once", async ({ page }) => {
  await open(page, "/#educate/building");
  await expect(page).toHaveURL(/#educate\/building$/);
  // Flick 1 ends at base+80, flick 2 at base+210: ends 130ms apart in logical time (inside the
  // old lock). Separate evaluates put a real render between them, as separate frames would.
  for (const offset of [0, 130]) {
    await page.evaluate((offset) => {
      const w = window as unknown as { __touchBase?: number };
      const t0 = (w.__touchBase ??= performance.now() + 1000) + offset;
      const target = document.querySelector("section:not([inert])")!;
      const fire = (type: string, y: number, t: number, active: boolean) => {
        const touchObj = new Touch({ identifier: 1, target, clientX: 300, clientY: y });
        const ev = new TouchEvent(type, {
          bubbles: true,
          cancelable: true,
          touches: active ? [touchObj] : [],
          changedTouches: [touchObj],
        });
        Object.defineProperty(ev, "timeStamp", { value: t });
        target.dispatchEvent(ev);
      };
      fire("touchstart", 600, t0, true);
      fire("touchmove", 560, t0 + 40, true);
      fire("touchmove", 520, t0 + 70, true);
      fire("touchend", 520, t0 + 80, false);
    }, offset);
    await page.waitForTimeout(50);
  }
  await expect(page).toHaveURL(/#educate\/hub$/, { timeout: 5000 });
});

test("fast swipes cross an outer boundary without leaving the selected scene in motion", async ({ page }) => {
  await open(page, "/#educate/stories");
  await swipe(page, [140, 10_000]);
  await expect(page).toHaveURL(/#motivate\/voices$/);
  const active = page.locator("section:not([inert])");
  await expect(active).toHaveCount(1);
  const position = await active.evaluate((section) => ({
    top: section.getBoundingClientRect().top,
    transition: getComputedStyle(section.parentElement!).transitionDuration,
  }));
  expect(Math.abs(position.top)).toBeLessThan(1);
  expect(position.transition).toBe("0s");
  await swipe(page, [140, 10_000], [-1, -1]);
  await expect(page).toHaveURL(/#educate\/stories$/);
});

test("one sustained swipe changes only one scene despite continued acceleration", async ({ page }) => {
  await open(page, "/#who");
  for (let k = 0; k < 35; k++) {
    await page.evaluate((k) => {
      const event = new WheelEvent("wheel", { deltaY: 4 + k * 3, bubbles: true, cancelable: true });
      Object.defineProperty(event, "timeStamp", { value: 1000 + k * 16 });
      document.querySelector("section:not([inert])")!.dispatchEvent(event);
    }, k);
    await page.waitForTimeout(16);
  }
  await expect(page).toHaveURL(/#engage\/signage$/);
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
