import {test,expect} from '@playwright/test';
for(const width of [390,1000,1440]) {
  test(`homepage media frame and overlay controls at ${width}`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/#engage/signage');
    await expect(page.getByRole('region',{name:'Voices',includeHidden:true})).toHaveAttribute('inert');
    const section=page.getByRole('region',{name:'Engage',exact:true});
    const box=section.locator('[data-slider-box]');
    await expect(box.getByText('City of Oberlin – Hotel at Oberlin',{exact:true})).toBeVisible();
    const frame=box.locator('[data-box-frame]');
    await frame.hover();
    const rect=await frame.boundingBox();
    if(width>=768) expect(rect!.height).toBeGreaterThan(400);
    for(const name of ['Previous example','Next example','Play examples']) {
      const control=frame.getByRole('button',{name,exact:true});
      await expect(control).toBeVisible();
      const r=await control.boundingBox();
      expect(r!.x).toBeGreaterThanOrEqual(rect!.x);
      expect(r!.x+r!.width).toBeLessThanOrEqual(rect!.x+rect!.width);
      expect(r!.y+r!.height).toBeLessThanOrEqual(rect!.y+rect!.height);
    }
    const prev = await frame.getByRole('button',{name:'Previous example',exact:true}).boundingBox();
    const next = await frame.getByRole('button',{name:'Next example',exact:true}).boundingBox();
    expect(Math.abs(prev!.y+prev!.height/2-(rect!.y+rect!.height/2))).toBeLessThan(2);
    expect(next!.x).toBeGreaterThan(rect!.x+rect!.width-60);
    expect((await box.locator('figcaption').boundingBox())!.height).toBeLessThan(2);
    await page.screenshot({path:`screenshots/product-media-${width}.png`});
    await frame.getByRole('button',{name:'Next example'}).click();
    await expect(box).toHaveAttribute('data-index','1');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
