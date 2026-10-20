import {test, expect} from '@playwright/test';

for (const [width,height] of [[390,844], [1366,768], [1440,900]]) test(`signage controller fits and links to the same session at ${width}`, async ({page}) => {
  await page.setViewportSize({width,height});
  await page.route('**/*', route => ['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  await page.goto('/digital-signage#try-the-phone');
  await expect(page.getByRole('heading',{name:'Try the phone controller',exact:true})).toBeVisible();
  await expect.poll(async () => (await page.getByRole('heading',{name:'Try the phone controller',exact:true}).boundingBox())!.y).toBeLessThan(150);
  const pairBounds = await page.locator('[data-controller-pair]').boundingBox();
  expect(pairBounds!.x + pairBounds!.width).toBeLessThanOrEqual(width);
  const display = page.locator('[data-demo-display]');
  const controller = page.locator('[data-demo-controller]');
  if(width >= 768) {
    await expect.poll(async () => {
      const a=await display.boundingBox(),b=await controller.boundingBox();
      return a && b ? Math.abs(a.height-b.height) : 999;
    }).toBeLessThan(1);
    const b = (await controller.boundingBox())!;
    expect(b.y+b.height).toBeLessThan(height);
  } else {
    await controller.scrollIntoViewIfNeeded();
    const b = (await controller.boundingBox())!;
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x+b.width).toBeLessThanOrEqual(width);
  }
  const frame = (await controller.locator('iframe').boundingBox())!;
  const shell = (await controller.boundingBox())!;
  expect(Math.abs(frame.width - (shell.width - 12))).toBeLessThan(1);
  expect(Math.abs(frame.height - (shell.height - 12))).toBeLessThan(1);
  const screenUrl=new URL((await display.locator('iframe').getAttribute('src'))!);
  const phoneUrl=new URL((await controller.locator('iframe').getAttribute('src'))!);
  expect(screenUrl.searchParams.get('webSesssionId')).toBeTruthy();
  expect(phoneUrl.searchParams.get('webSesssionId')).toBe(screenUrl.searchParams.get('webSesssionId'));
  await page.locator('[aria-label="Controller location"]').getByRole('button',{name:'Use your phone',exact:true}).click();
  await expect(controller.locator('iframe')).toHaveCount(0);
  await expect(page.locator('[data-open-controller]')).toHaveAttribute('href',phoneUrl.toString());
  await expect(page.locator('[data-controller-qr]').first()).toHaveAttribute('src',/^data:image\/png;base64,/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`screenshots/signage-controller-agreed-${width}.png`});
});

test('signage uses original media and agreed explanation without unsupported copy',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('**/*', route => ['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  await page.goto('/digital-signage');
  await expect(page.getByRole('heading',{level:1,name:'Digital Signage',exact:true})).toBeVisible();
  await expect(page.locator('img[src="/assets/eng-sign-daves-full.jpg"]')).toHaveCount(1);
  await expect(page.getByText("Screens in MidTown show the same things first. Dave's then adds its own. Only the screen in the store shows that.",{exact:true})).toHaveCount(0);
  await expect(page.getByText('Approve it',{exact:true})).toHaveCount(0);
  await expect(page.locator('img[src="/assets/art-choose-story.jpg.webp"]')).toHaveCount(0);
  await page.getByRole('button',{name:'How phone control works',exact:true}).click();
  await expect(page.locator('[data-phone-walkthrough]')).toBeVisible();
  await expect(page.getByRole('button',{name:'Play explanation',exact:true})).toBeVisible();
  await page.screenshot({path:'screenshots/signage-agreed-explanation.png'});
});
