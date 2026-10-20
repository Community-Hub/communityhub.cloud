import {test,expect} from '@playwright/test';
test('identity assembles on entry, settles, and replays on re-entry',async({page})=>{
  await page.goto('/#problem');
  await expect(page.locator('[data-feature-box]')).toBeVisible();
  await page.getByRole('button',{name:'Who we are',exact:true}).click();
  const graphic=page.locator('.home-identity');
  await expect(graphic).toHaveAttribute('data-animate','in');
  expect(await graphic.evaluate(el=>el.getAnimations({subtree:true}).some(a=>a.playState==='running'))).toBe(true);
  await page.screenshot({path:'screenshots/identity-motion-enter.png'});
  await expect.poll(()=>graphic.locator('img').evaluateAll(imgs=>imgs.every(img=>getComputedStyle(img).opacity==='1'))).toBe(true);
  await page.screenshot({path:'screenshots/identity-motion-settled.png'});
  await page.getByRole('button',{name:'Engage',exact:true}).click();
  await expect(graphic).toHaveAttribute('data-animate','out');
  await page.getByRole('button',{name:'Who we are',exact:true}).click();
  expect(await graphic.evaluate(el=>el.getAnimations({subtree:true}).some(a=>a.playState==='running'))).toBe(true);
});
test('reduced motion displays all five identity icons immediately',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#who');
  const graphic=page.locator('.home-identity');
  await expect(graphic).toHaveAttribute('data-animate','in');
  expect(await graphic.evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
  expect(await graphic.locator('img').evaluateAll(imgs=>imgs.length===5&&imgs.every(img=>getComputedStyle(img).opacity==='1'))).toBe(true);
});
