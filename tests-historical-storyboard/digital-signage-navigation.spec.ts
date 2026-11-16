import { test, expect } from '@playwright/test';

test('digital signage uses homepage section stepping and preserves deep links', async ({page}) => {
  await page.setViewportSize({width:1280,height:950});
  await page.goto('/digital-signage');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.mouse.move(25,450);
  await page.mouse.wheel(0,160);
  await expect(page).toHaveURL(/#community-and-local-content$/);
  await expect(page.getByRole('region',{name:'Digital Signage',exact:true,includeHidden:true})).toHaveAttribute('inert');
  await page.waitForTimeout(400);
  await page.mouse.wheel(0,-160);
  await expect(page).toHaveURL(/#digital-signage$/);
  await page.goto('/digital-signage#how-phone-control-works');
  await expect(page.getByRole('region',{name:'How phone control works',exact:true})).not.toHaveAttribute('inert');
});

test('touch swipe advances one section', async ({browser}) => {
  const context = await browser.newContext({viewport:{width:1280,height:950},hasTouch:true});
  const page = await context.newPage();
  await page.goto('http://localhost:8080/digital-signage');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:25,y:700}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:25,y:450}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect(page).toHaveURL(/#community-and-local-content$/);
  await context.close();
});
