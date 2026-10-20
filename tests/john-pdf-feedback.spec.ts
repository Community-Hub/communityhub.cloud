import { test, expect } from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.route('**/*', route => {
    const host = new URL(route.request().url()).hostname;
    return ['localhost','127.0.0.1'].includes(host) || /googleapis.com|gstatic.com/.test(host) ? route.continue() : route.abort();
  });
});

test('PDF: product examples auto-advance, stop on focus and explicit pause, and use arrow keys', async ({page}) => {
  await page.clock.install();
  await page.goto('/#engage/signage');
  const section = page.getByRole('region',{name:'Engage',exact:true});
  await expect(page.getByRole('region',{name:'Voices',includeHidden:true})).toHaveAttribute('inert');
  const box = section.locator('[data-slider-box]');
  await expect(box).toHaveAttribute('data-index','0');
  await expect(box).toHaveAttribute('data-rotating','true');
  await page.clock.runFor(13000);
  await expect(box).toHaveAttribute('data-index','1');
  await box.focus();
  await page.clock.runFor(24000);
  await expect(box).toHaveAttribute('data-index','1');
  await box.press('ArrowRight');
  await expect(box).toHaveAttribute('data-index','2');
  await section.getByRole('button',{name:'Pause examples'}).click();
  await page.getByRole('link',{name:'CommunityHub',exact:true}).focus();
  await page.mouse.move(0,0);
  await page.clock.runFor(24000);
  await expect(box).toHaveAttribute('data-index','2');
  await expect(section.getByRole('button',{name:'Play examples'})).toBeVisible();
});

test('PDF: feature keyboard changes one coherent story and corrects Toledo attribution', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const box = page.locator('[data-feature-box]');
  await expect(box).toBeVisible();
  await box.focus();
  await box.press('ArrowRight');
  await box.press('ArrowRight');
  await box.press('ArrowRight');
  const current = box.locator('.home-feature-content:not([aria-hidden])');
  await expect(current.getByText('Bob Mendenhall',{exact:true})).toBeVisible();
  await expect(current.getByText('Curriculum Director, Toledo',{exact:true})).toBeVisible();
  await expect(current.locator('img')).toHaveAttribute('src','/assets/live-home-story-04.jpeg.webp');
  await expect(box.getByRole('button',{name:'Play stories'})).toBeVisible();
  await page.screenshot({path:'screenshots/john-pdf-features.png'});
});

for (const viewport of [{width:390,height:844},{width:1440,height:900}]) {
  test(`PDF: source previews and complete mobile headings at ${viewport.width}`, async ({page}) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize(viewport);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/#engage/signage');
    await expect(page.getByRole('region',{name:'Voices',includeHidden:true})).toHaveAttribute('inert');
    const engage = page.getByRole('region',{name:'Engage',exact:true});
    await expect(engage.getByRole('heading',{name:'Digital Signage',exact:true})).toBeVisible();
    await page.screenshot({path:`screenshots/john-pdf-engage-${viewport.width}.png`});
    await page.getByRole('button',{name:'Educate',exact:true}).click();
    const educate = page.getByRole('region',{name:'Educate',exact:true});
    await educate.getByRole('tab',{name:'Stories',exact:true}).click();
    await expect(educate.locator('iframe')).toHaveAttribute('src', /1Wa8Gp961gxbfIDkMCCQL0MKcQSpjpU74D8lO0HezmiY\/embed\?start=false/);
    await expect(educate.locator('iframe')).toHaveCount(1); // no phone controller
    await page.getByRole('button',{name:'Motivate and Empower',exact:true}).click();
    const motivate = page.getByRole('region',{name:'Motivate and Empower',exact:true});
    await expect(motivate.locator('iframe')).toHaveAttribute('src','https://cleveland.communityhub.cloud/calendar/?show-menu=0');
    await motivate.getByRole('tab',{name:'Community Voices',exact:true}).click();
    await expect(motivate.locator('iframe')).toHaveAttribute('src', /cv-public\/embeddable\?image_tags=36&categories=12/);
    await expect(motivate.locator('[data-slider-box] img')).toHaveCount(0); // no duplicate outside logo
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
