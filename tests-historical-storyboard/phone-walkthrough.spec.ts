import { test, expect } from '@playwright/test';

test('phone walkthrough advances, shares pause, and stops when its chapter is hidden', async ({page}) => {
  await page.route('**/*', route => ['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  const clockStart = new Date("2026-10-08T12:00:00Z");
  await page.clock.install({time: clockStart});
  await page.clock.pauseAt(clockStart);
  await page.goto('/#engage/phone/from-qr-code-to-digital-sign');
  const section=page.getByRole('region',{name:'Engage',exact:true});
  const box=section.locator('[data-slider-box]');
  const demo=box.locator('[data-phone-walkthrough]');
  await expect(box).toHaveAttribute('data-rotating','true');
  await expect(demo).toHaveAttribute('data-step','0');
  await page.clock.runFor(4600);
  await expect(demo).toHaveAttribute('data-step','1');
  await page.clock.runFor(4600);
  await expect(demo).toHaveAttribute('data-step','2');
  await expect(demo.locator('[data-vision-screen]')).toHaveAttribute('data-visible','true');
  await page.clock.runFor(500);
  await box.hover();
  await box.getByRole('button',{name:'Pause animation'}).click();
  await page.mouse.move(0,0);
  await page.getByRole('link',{name:'CommunityHub',exact:true}).focus();
  await page.clock.runFor(30000);
  await expect(demo).toHaveAttribute('data-step','2');
  await expect(box).toHaveAttribute('data-index','2');
  await page.getByRole('button',{name:'Educate',exact:true}).click();
  await expect(section).toHaveAttribute('inert');
  await page.clock.runFor(10000);
  await expect(page.getByRole('region',{name:'Engage',exact:true,includeHidden:true}).locator('[data-slider-box]')).toHaveAttribute('data-rotating','false');
});

for(const width of [390,1440]) test(`phone walkthrough reduced-motion and manual steps at ${width}`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#engage/phone/from-qr-code-to-digital-sign');
  const section=page.getByRole('region',{name:'Engage',exact:true});
  const box=section.locator('[data-slider-box]');
  const demo=box.locator('[data-phone-walkthrough]');
  await expect(box).toHaveAttribute('data-rotating','false');
  await expect(demo.locator('.phone-howto-stage')).toHaveCount(3);
  await expect(box.getByText('MidTown Phone Controller Navigation',{exact:true})).toBeVisible();
  await expect(box.getByRole('button',{name:/^(Previous|Next) example$/})).toHaveCount(2);
  await expect(box.getByRole('button',{name:'Play animation'})).toHaveCount(1);
  for(let step=0;step<3;step++){
    await demo.getByRole('button',{name:new RegExp(`^Step ${step+1}:`)}).click();
    await expect(demo).toHaveAttribute('data-step',String(step));
    for(const img of await demo.locator('img').all()) await expect.poll(() => img.evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);
    await page.screenshot({path:`screenshots/phone-walkthrough-${width}-${step}.png`});
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});


test('the illustrated phone choice shows the actual Vision Plan screen without captions', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#engage/phone/midtown-phone-controller-navigation');
  const demo = page.locator('[data-phone-walkthrough]');
  await demo.getByRole('button', {name:'Choose Vision Plan on the phone'}).click();
  await expect(demo).toHaveAttribute('data-step','2');
  await expect(demo.locator('[data-vision-screen]')).toHaveAttribute('src','/assets/phone-workflow/vision-plan-screen-2.png.webp');
  await expect(demo.locator('[data-vision-screen]')).toHaveAttribute('data-visible','true');
  await expect(demo.locator('.phone-result-status, .phone-walkthrough-explanation')).toHaveCount(0);
});

test('phone animation loops after selection and while hovered or focused; Play resumes in place', async ({page}) => {
  await page.route('**/*', route => ['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  const start = new Date('2026-10-09T12:00:00Z');
  await page.clock.install({time:start});
  await page.clock.pauseAt(start);
  await page.goto('/#engage/phone/midtown-phone-controller-navigation');
  const box = page.getByRole('region',{name:'Engage',exact:true}).locator('[data-slider-box]');
  const demo = box.locator('[data-phone-walkthrough]');
  await box.hover();
  await demo.getByRole('button',{name:'Choose Vision Plan on the phone'}).click();
  await expect(demo).toHaveAttribute('data-running','true');
  await page.clock.runFor(7100);
  await expect(demo.locator('[data-vision-screen]')).toHaveAttribute('data-vision-screen','1');
  await page.clock.runFor(7100);
  await expect(demo).toHaveAttribute('data-step','0');
  await page.clock.runFor(4600);
  await expect(demo).toHaveAttribute('data-step','1');
  await box.getByRole('button',{name:'Pause animation'}).click();
  await page.clock.runFor(30000);
  await expect(demo).toHaveAttribute('data-step','1');
  await box.getByRole('button',{name:'Play animation'}).click();
  await expect(demo).toHaveAttribute('data-running','true');
  await page.clock.runFor(4600);
  await expect(demo).toHaveAttribute('data-step','2');
  await page.clock.runFor(7100);
  await expect(demo.locator('[data-vision-screen]')).toHaveAttribute('data-vision-screen','1');
  await page.clock.runFor(7100);
  await expect(box).toHaveAttribute('data-index','0');
});

for (const width of [390, 1440]) test(`real controller examples are readable and manually selected at ${width}`, async ({page}) => {
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('**/*', route => ['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  await page.goto('/#engage/phone');
  const box = page.getByRole('region',{name:'Engage',exact:true}).locator('[data-slider-box]');
  await expect(box.locator('[data-slide="0"] > img')).toHaveAttribute('src','/assets/phone-person-water-display.jpg');
  await expect(page.getByRole('region',{name:'Voices',includeHidden:true})).toHaveAttribute('inert');
  await box.hover();
  await box.getByRole('button',{name:'Next example',exact:true}).click();
  await expect(box).toHaveAttribute('data-index','1');
  const images = box.locator('[data-paired-examples] img');
  await expect(images).toHaveCount(2);
  for (const img of await images.all()) await expect.poll(() => img.evaluate((el:HTMLImageElement) => el.complete && el.naturalWidth>0)).toBe(true);
  await expect(box.getByRole('button',{name:'Play examples'})).toHaveCount(1);
  await expect(box).toHaveAttribute('data-rotating','false');
  await page.screenshot({path:`screenshots/controller-example-${width}.png`});
  await box.hover();
  await box.getByRole('button',{name:'Next example',exact:true}).click();
  await expect(box.locator('[data-phone-walkthrough]')).toBeVisible();
  await expect(box.getByRole('button',{name:'Play animation'})).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});


test('phone examples advance after five seconds and return only after two complete walkthrough loops', async ({page}) => {
  await page.route('**/*', route => ['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  const start = new Date('2026-10-09T12:00:00Z');
  await page.clock.install({time:start});
  await page.clock.pauseAt(start);
  await page.goto('/#engage/phone');
  const box = page.getByRole('region',{name:'Engage',exact:true}).locator('[data-slider-box]');
  await expect(box).toHaveAttribute('data-rotating','true');
  await expect(box.getByText('Great Lakes Science Center',{exact:true})).toBeVisible();
  await box.hover();
  await page.clock.runFor(4900);
  await expect(box).toHaveAttribute('data-index','0');
  await page.clock.runFor(200);
  await expect(box).toHaveAttribute('data-index','1');
  await expect(box.getByText('Oberlin – Phone and Touchpad Controllers',{exact:true})).toBeVisible();
  await box.getByRole('button',{name:'Pause examples'}).click();
  await page.clock.runFor(20000);
  await expect(box).toHaveAttribute('data-index','1');
  await box.getByRole('button',{name:'Play examples'}).click();
  await page.clock.runFor(5100);
  await expect(box).toHaveAttribute('data-index','2');
  const demo = box.locator('[data-phone-walkthrough]');
  for (let loop = 0; loop < 2; loop++) {
    await expect(demo).toHaveAttribute('data-step','0');
    await page.clock.runFor(4500);
    await expect(demo).toHaveAttribute('data-step','1');
    await page.clock.runFor(4500);
    await expect(demo).toHaveAttribute('data-step','2');
    await page.clock.runFor(7000);
    await expect(demo.locator('[data-vision-screen]')).toHaveAttribute('data-vision-screen','1');
    await page.clock.runFor(6800);
    await expect(box).toHaveAttribute('data-index','2');
    await page.clock.runFor(200);
  }
  await expect(box).toHaveAttribute('data-index','0');
  await page.clock.runFor(5100);
  await expect(box).toHaveAttribute('data-index','1');
});
