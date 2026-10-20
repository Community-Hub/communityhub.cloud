import {test, expect} from '@playwright/test';
import {readdirSync, mkdirSync} from 'node:fs';
const routes=readdirSync('src/routes').filter(f=>f.endsWith('.tsx')&&!f.startsWith('__')&&f!=='admin.tsx').map(f=>f==='index.tsx'?'/':`/${f.slice(0,-4)}`);
mkdirSync('screenshots/site-review',{recursive:true});
for(const width of [390,1440]) for(const path of routes) test(`visual review ${path} at ${width}`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(path,{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();
  await page.waitForTimeout(800);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  expect(errors).toEqual([]);
  await page.screenshot({path:`screenshots/site-review/${path==='/'?'home':path.slice(1)}-${width}.jpg`,quality:70});
});
