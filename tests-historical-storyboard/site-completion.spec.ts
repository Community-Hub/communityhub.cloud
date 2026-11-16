import {test, expect} from '@playwright/test';

test('homepage explains the platform and retains original problem and solution', async ({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#who');
  await expect(page.getByRole('heading',{name:'Community Hub is a community-centered communication platform.'})).toBeVisible();
  await expect(page.locator('[data-problem]')).toContainText('Communication innovations');
  await expect(page.locator('.home-mission').last()).toContainText('organizations, neighborhoods, and cities');
  await page.screenshot({path:'screenshots/homepage-definition-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'screenshots/homepage-definition-mobile.png'});
});

test('toolkit searches source lessons and combines filters, clears empty results', async ({page})=>{
  await page.goto('/toolkit');
  await expect(page.locator('[data-lesson]')).toHaveCount(35);
  await page.getByRole('searchbox',{name:'Search lessons'}).fill('water');
  await expect(page.getByRole('status')).not.toHaveText('35 of 35 lessons');
  expect(await page.locator('[data-lesson]').count()).toBeGreaterThan(0);
  await page.getByRole('combobox',{name:'Grade level',exact:true}).selectOption('Grade 4');
  const cards=await page.locator('[data-lesson]').allTextContents();
  expect(cards.every(c=>/water/i.test(c))).toBe(true);
  await page.getByRole('searchbox').fill('zzznomatchinglesson');
  await expect(page.getByRole('status')).toHaveText('0 of 35 lessons');
  await expect(page.getByText('No lessons match these filters.',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Clear filters'}).click();
  await expect(page.locator('[data-lesson]')).toHaveCount(35);
});

test('short phone retains the full About mission and the last toolkit lesson is reachable',async({page})=>{
  await page.setViewportSize({width:375,height:667});
  await page.goto('/about');
  const clients=page.getByText('Community Hub clients include',{exact:false});
  await expect(clients).toContainText('foster positive initiative');
  await page.goto('/toolkit');
  const last=page.locator('[data-lesson]').last().getByRole('link');
  await last.scrollIntoViewIfNeeded();
  await expect(last).toBeInViewport();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
