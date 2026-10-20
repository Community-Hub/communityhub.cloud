import {test,expect} from '@playwright/test';
for(const width of [318,390]) {
  test(`testimonial uses readable full-width content at ${width}`,async({page})=>{
    await page.setViewportSize({width,height:820});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/#problem/quote-0');
    const box=page.locator('[data-feature-box]');
    await expect(box).toBeVisible();
    const quote=await box.locator('blockquote').boundingBox();
    expect(quote!.width).toBeGreaterThan(width-85);
    const photo=await box.locator('.home-feature-image').boundingBox();
    expect(quote!.y-(photo!.y+photo!.height)).toBeLessThan(20);
    const next=box.getByRole('button',{name:'Next story'});
    await next.scrollIntoViewIfNeeded();
    await expect(next).toHaveCSS('opacity','1');
    await page.screenshot({path:`screenshots/testimonial-mobile-${width}.png`});
    await next.click();
    await expect(box).toHaveAttribute('data-index','1');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
