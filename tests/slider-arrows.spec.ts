import { test, expect } from "@playwright/test";

// Shared controls retain accessible hit targets; testimonial arrows follow the supplied side-arrow reference.
const ROUTES = ["/", "/story", "/about", "/who", "/pricing", "/products", "/citywide-dashboard", "/community-calendar", "/community-voices", "/stories", "/data-hub", "/dashboard-builder", "/digital-signage", "/web-embeddables", "/demos", "/toolkit", "/research", "/resources", "/work"];

for (const route of ROUTES) {
  test(`${route}: every prev/next control is the shared SliderArrows`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route, { waitUntil: "load" });
    const report = await page.evaluate(() => {
      const bad: string[] = [];
      const prev = [...document.querySelectorAll<HTMLElement>('[data-control="prev"]')];
      const arrows = [...document.querySelectorAll<HTMLElement>('button[aria-label^="Previous "], button[aria-label^="Next "]')].filter(
        (b) => !/section$/i.test(b.getAttribute("aria-label") ?? ""),
      );
      for (const b of new Set([...prev, ...arrows])) {
        const label = b.getAttribute("aria-label") ?? b.textContent ?? "?";
        const group = b.closest("[data-slider-arrows]");
        if (!group) {
          bad.push(`${label}: not inside [data-slider-arrows]`);
          continue;
        }
        const cs = getComputedStyle(b);
        if (b.getAttribute("data-control") !== "prev" && b.getAttribute("data-control") !== "next") bad.push(`${label}: missing data-control`);
        if (cs.width !== "44px" || cs.height !== "44px") bad.push(`${label}: ${cs.width} x ${cs.height}, not 44px`);
        if (cs.borderTopWidth !== "0px") bad.push(`${label}: unwanted border`);
        if (parseFloat(cs.borderTopLeftRadius) !== 4) bad.push(`${label}: inconsistent corner radius`);
      }
      return { bad, count: prev.length };
    });
    expect(report.bad).toEqual([]);
  });
}

test("the home quote slider controls are grouped inside the shared photo and quote frame", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "load" });
  const section = page.getByRole("region", { name: "Voices" });
  const header = section.locator("[data-feature-box] .home-feature-controls");
  await expect(header.locator("[data-slider-arrows]")).toHaveCount(1);
  await expect(section.locator("blockquote").locator("xpath=ancestor::div[1]").locator("[data-slider-arrows]")).toHaveCount(0);
});

for (const width of [390, 1440]) {
  test(`testimonial side arrows at ${width}`, async ({page}) => {
    await page.setViewportSize({width, height:900});
    await page.emulateMedia({reducedMotion:"reduce"});
    await page.goto('/#problem');
    const box=page.locator('[data-feature-box]');
    const prev=box.getByRole('button',{name:'Previous story'});
    const next=box.getByRole('button',{name:'Next story'});
    await expect(prev).toHaveCSS('border-top-width','0px');
    const a=await prev.boundingBox(), b=await next.boundingBox(), frame=await box.boundingBox();
    expect(a!.x).toBeLessThan(frame!.x+50);
    expect(b!.x).toBeGreaterThan(frame!.x+frame!.width-60);
    const target = width < 768 ? await box.locator('.home-feature-image').boundingBox() : frame;
    expect(Math.abs(a!.y + a!.height/2 - (target!.y+target!.height/2))).toBeLessThan(2);
    expect(Math.abs(a!.y-b!.y)).toBeLessThan(1);
    await box.hover();
    await next.click();
    await expect(box).toHaveAttribute('data-index','1');
    await prev.click();
    await expect(box).toHaveAttribute('data-index','0');
    await page.screenshot({path:`screenshots/testimonial-side-arrows-${width}.png`});
  });
}

test('testimonial controls reveal on hover and keyboard focus', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#problem');
  const box=page.locator('[data-feature-box]');
  const next=box.getByRole('button',{name:'Next story'});
  const pause=box.locator('[data-control="playpause"]');
  await page.mouse.move(0,0);
  await expect(next).toHaveCSS('opacity','0');
  await expect(pause).toHaveCSS('opacity','0');
  await box.hover();
  await expect(next).toHaveCSS('opacity','1');
  await expect(pause).toHaveCSS('opacity','1');
  await expect(next.locator('svg')).toHaveCSS('stroke-width','2.25px');
  await pause.click();
  await expect(pause.locator('svg path')).toHaveAttribute('d','M8 5v14M16 5v14');
  await page.screenshot({path:'screenshots/testimonial-hover-controls.png'});
  await page.getByRole('link',{name:'CommunityHub',exact:true}).focus();
  await page.mouse.move(0,0);
  await expect(next).toHaveCSS('opacity','0');
  await next.focus();
  await expect(next).toHaveCSS('opacity','1');
  await next.press('Enter');
  await expect(box).toHaveAttribute('data-index','1');
});
