import { test, expect } from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('**/*', route => {
    const host=new URL(route.request().url()).hostname;
    return ['localhost','127.0.0.1'].includes(host)||/googleapis.com|gstatic.com/.test(host) ? route.continue():route.abort();
  });
});

test('Oct 8: homepage Voices is landscape, passive and paused under reduced motion', async ({page}) => {
  await page.goto('/#motivate/voices');
  const section=page.getByRole('region',{name:'Motivate and Empower',exact:true});
  // Hydrated navigation resolves the canonical beat independently of initial scroll placement.
  await expect(section).not.toHaveAttribute('inert');
  await section.getByRole('tab',{name:'Community Voices',exact:true}).click();
  const frame=section.locator('iframe');
  await expect(frame).toHaveAttribute('src',/portrait-mode=0/);
  await expect(frame).toHaveAttribute('src',/remove-controls=1/);
  await expect(frame).toHaveAttribute('src',/autoplay=0/);
  await expect(frame).toHaveAttribute('tabindex','-1');
  await expect(section.locator('[data-passive-preview]')).toHaveCount(1);
  await section.locator('[data-slider-box]').hover();
  await section.getByRole('button',{name:'Play examples'}).click();
  await expect(frame).toHaveAttribute('src',/autoplay=1/);
});

test('Platform summary omits the duplicate Story of Dashboard link', async ({page}) => {
  await page.goto('/#who');
  const section=page.getByRole('region',{name:'Who we are',exact:true});
  await expect(section).not.toHaveAttribute('inert');
  await expect(section.getByRole('link',{name:'Story of Dashboard',exact:true})).toHaveCount(0);
  await expect(section.locator('iframe')).toHaveCount(0);
});
