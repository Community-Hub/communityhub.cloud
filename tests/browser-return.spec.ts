import {test, expect} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.route('**/*', route => ['localhost','127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
});

test('Back restores the exact testimonial after following its link', async ({page}) => {
  await page.goto('/#problem');
  const box=page.locator('[data-feature-box]');
  await expect(box).toBeVisible();
  await box.hover();
  await box.getByRole('button',{name:'Next story'}).click();
  await expect(box).toHaveAttribute('data-index','1');
  const left=page.url();
  await box.getByRole('link',{name:'Teacher toolkit',exact:true}).click();
  await expect(page).toHaveURL(/\/toolkit/);
  await page.goBack();
  await expect(page).toHaveURL(left);
  await expect(box).toHaveAttribute('data-index','1');
  await expect(page.locator('[data-hero-film]')).toHaveAttribute('data-hero-film','banner');
  await expect(box.getByText('Kim Koos',{exact:true})).toBeVisible();
});

test('Back through the home logo restores the previous testimonial', async ({page}) => {
  await page.goto('/#problem/quote-3');
  await expect(page.locator('[data-feature-box]')).toHaveAttribute('data-index','3');
  await page.getByRole('link',{name:'CommunityHub',exact:true}).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goBack();
  await expect(page.locator('[data-feature-box]')).toHaveAttribute('data-index','3');
});

test('Back restores the product tab and inner scroll on mobile; Forward remains usable', async ({page}) => {
  await page.setViewportSize({width:390,height:700});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#engage/signage');
  const section=page.getByRole('region',{name:'Engage',exact:true});
  await expect(page.getByRole('region',{name:'Voices',includeHidden:true})).toHaveAttribute('inert');
  await expect(section).not.toHaveAttribute('inert');
  await section.getByRole('tab',{name:'Phone App & Touchpad',exact:true}).click();
  await expect(section.getByRole('tab',{name:'Phone App & Touchpad',exact:true})).toHaveAttribute('aria-selected','true');
  await section.locator('[data-slider-box]').hover();
  await expect(section.locator('[data-slider-box]')).toHaveAttribute('data-index','0');
  const scroll=section.locator('[data-home-product]');
  await scroll.evaluate(el=>{el.scrollTop=80;});
  await expect.poll(()=>scroll.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
  await section.getByRole('link',{name:'Learn more',exact:true}).scrollIntoViewIfNeeded();
  const y=await scroll.evaluate(el=>el.scrollTop);
  expect(y).toBeGreaterThan(0);
  const left=page.url();
  await section.getByRole('link',{name:'Learn more',exact:true}).click();
  await expect(page).toHaveURL(/\/digital-signage/);
  await page.goBack();
  await expect(page).toHaveURL(left);
  await expect(section).not.toHaveAttribute('inert');
  await expect(section.getByRole('tab',{name:'Phone App & Touchpad',exact:true})).toHaveAttribute('aria-selected','true');
  await expect(section.locator('[data-slider-box]')).toHaveAttribute('data-index','0');
  await expect.poll(()=>scroll.evaluate(el=>el.scrollTop)).toBeCloseTo(y,0);
  await page.goForward();
  await expect(page).toHaveURL(/\/digital-signage/);
});
