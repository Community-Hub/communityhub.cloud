import {before, test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'vite';
let home;
before(async()=>{
 const result=await build({configFile:false,logLevel:'silent',build:{write:false,minify:false,lib:{entry:'src/content/site.ts',formats:['es']}}});
 const code=(Array.isArray(result)?result[0]:result).output[0].code;
 const site=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
 home=site.getPage('index').body;
});
test('final chapter headings omit To and connect to their related submenu',()=>{
 for(const label of ['Engage','Educate','Motivate and Empower']) assert.ok(home.includes(`>${label}</h2>`));
 assert.equal((home.match(/class="chapter-connector"/g)||[]).length,3);
});
test('each homepage product has one Learn more immediately under explanatory copy',()=>{
 const panels=[...home.matchAll(/<article class="eng-p"[\s\S]*?<\/article>/g)].map(x=>x[0]);
 assert.equal(panels.length,9);
 for(const panel of panels){
  assert.equal((panel.match(/class="pc-a"/g)||[]).length,1);
  assert.match(panel,/<p class="eng-go"><a class="pc-a" href="[^"]+">Learn more /);
  assert.doesNotMatch(panel,/>See |Open full size|Open .* full size/);
 }
});
test('every homepage product keeps its established icon beside its title',()=>{
 assert.equal((home.match(/class="product-identity"/g)||[]).length,9);
 assert.equal((home.match(/class="product-identity-icon"/g)||[]).length,9);
});
test('homepage Stories and Voices are passive previews without their product-page control banks',()=>{
 for(const name of ['Stories','Community Voices']){const panel=home.match(new RegExp(`<article class="eng-p"[^>]*aria-label="${name}">[\\s\\S]*?<\\/article>`))?.[0];assert.ok(panel);assert.doesNotMatch(panel,/data-native-choice|native-phone-device|native-categories|data-native-contexts/);assert.match(panel,/data-reading-preview/);}
});
test('Building contexts are college, school and city with standalone native routes and no Hamilton',()=>{const panel=home.match(/<article class="eng-p"[^>]*aria-label="Building Dashboard">[\s\S]*?<\/article>/)?.[0];assert.ok(panel);for(const id of [815,529,1001]) assert.ok(panel.includes(`/ops/dashboard/${id}`));assert.match(panel,/data-reading-interval="18000"/);assert.doesNotMatch(panel,/Hamilton|oc-embed/);});
test('narrow Community Voices photo crops clip to source photograph bounds, not SVG letterbox area',()=>{const panel=home.match(/<article class="eng-p"[^>]*aria-label="Community Voices">[\s\S]*?<\/article>/)?.[0];assert.ok(panel);assert.equal((panel.match(/<clipPath /g)||[]).length,4);assert.match(panel,/x="15" y="17" width="325" height="434"/);assert.equal((panel.match(/clip-path="url\(#voice-photo-/g)||[]).length,4);});
test('initial hero waits for reduced-motion policy before starting playback',()=>{const video=home.match(/<video[^>]+data-hv-vid[^>]*>/)?.[0];assert.ok(video);assert.doesNotMatch(video,/\bautoplay\b/);});
test('Stories catalog classification matches the final Educate homepage chapter',async()=>{const fs=await import('node:fs');const code=fs.readFileSync('src/content/catalog.ts','utf8');assert.match(code,/"slug": "stories",\s*"name": "Stories",\s*"group": "Educate"/);});
test('native Community Voices institution/category demo remains on its product page',async()=>{const result=await build({configFile:false,logLevel:'silent',build:{write:false,minify:false,lib:{entry:'src/content/site.ts',formats:['es']}}});const code=(Array.isArray(result)?result[0]:result).output[0].code;const site=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);const page=site.getPage('community-voices').body;assert.match(page,/id="live"/);assert.match(page,/data-native-contexts data-kind="voices"/);assert.match(page,/Choose voices community/);});
