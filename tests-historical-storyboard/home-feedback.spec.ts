import { test, expect } from "@playwright/test";

for (const viewport of [{width: 390, height: 844}, {width: 1440, height: 900}]) {
  test(`homepage readable copy and media at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    // External app availability is verified separately; this checks our composition and interaction.
    await page.route("**/*", route => {
      const u = new URL(route.request().url());
      if (!["127.0.0.1", "localhost"].includes(u.hostname) && !u.hostname.endsWith("googleapis.com") && !u.hostname.endsWith("gstatic.com")) return route.abort();
      return route.continue();
    });
    await page.goto('/#engage/signage');
    const section = page.getByRole('region', { name: 'Engage' });
    await expect(page.getByRole('region', { name: 'Voices', includeHidden: true })).toHaveAttribute('inert');
    await expect(section).not.toHaveAttribute('inert');
    const text = section.locator('[data-product-copy] > p');
    await expect(text).toHaveCSS('-webkit-line-clamp', 'none');
    await expect(section.locator('figcaption')).toHaveClass('sr-only');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await section.getByRole('tab', {name:'Phone App & Touchpad',exact:true}).click();
    await expect(section.getByText('Great Lakes Science Center', {exact:true})).toBeVisible();
    await expect(section.getByRole('img', {name:'A visitor uses her phone beside a digital sign and a mounted touchpad at Great Lakes Science Center',exact:true})).toBeVisible();
    await page.screenshot({ path:`screenshots/john-home-${viewport.width}.png` });
    await page.getByRole('button', {name:'Educate',exact:true}).click();
    const educate = page.getByRole('region',{name:'Educate'});
    await expect(educate).not.toHaveAttribute('inert');
    await expect(educate.locator('iframe')).toHaveAttribute('src', /\/oc\/dashboard\/815/);
    if (viewport.width > 768) {
      const copy = await educate.locator('[data-product-copy]').boundingBox();
      const media = await educate.locator('[data-product-media]').boundingBox();
      expect(copy!.x + copy!.width).toBeLessThan(media!.x);
      expect(media!.width).toBeGreaterThan(copy!.width);
    }
    await educate.getByRole('tab',{name:'Citywide Dashboard',exact:true}).click();
    await expect(educate.locator('iframe')).toHaveAttribute('src', /environmentaldashboard.org\/cwd-files/);
    await page.getByRole('button',{name:'Who we are',exact:true}).click();
    await expect(page.locator('[data-problem]')).toBeVisible();
    const identity = await page.locator('.home-identity').boundingBox();
    const mission = await page.locator('.home-mission').first().boundingBox();
    expect(identity!.y + identity!.height).toBeLessThan(mission!.y);
    await expect(page.locator('.home-identity-center')).toHaveAttribute('src','/assets/v1/CH.png');
    await page.screenshot({path:`screenshots/who-original-${viewport.width}.png`});
  });
}
