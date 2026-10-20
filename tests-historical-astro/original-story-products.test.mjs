import {before,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {build} from 'vite';
let pages;
before(async()=>{const r=await build({configFile:false,logLevel:'silent',build:{write:false,minify:false,lib:{entry:'src/content/site.ts',formats:['es']}}});const code=(Array.isArray(r)?r[0]:r).output[0].code;pages=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);});
test('Products how shows the original Story of Dashboard rather than the reconstructed diagram',()=>{
 const html=pages.getPage('products').body;
 assert.match(html,/<section[^>]+id="how"[^>]+data-original-story/);
 assert.match(html,/Story of Dashboard/);
 assert.doesNotMatch(html,/data-hub-flow/);
});
test('the replacement preserves all original slide frames and accessible quiet navigation',()=>{
 const html=pages.getPage('products').body;
 assert.match(html,/data-sb-img[^>]+assets\/sod\/14.jpg/);
 const data=JSON.parse(html.match(/data-sb-data>(.*?)<\/script>/s)?.[1]||'[]');
 assert.equal(data.length,31);
 assert.match(html,/data-story-start="13"/);
 assert.match(html,/data-sb-prev/);assert.match(html,/data-sb-next/);
 assert.match(html,/https:\/\/environmentaldashboard.org\/story-of-dashboard/);
 assert.match(html,/data-sb-original/);
});
test('both platform explanation locations use the authentic diagram and preserve resource viewer',()=>{
 assert.match(pages.getPage('the-hub').body,/id="manager-platform"[^>]*data-original-story/);
 assert.doesNotMatch(pages.getPage('the-hub').body,/data-hub-flow|Slide 10 platform/);
 assert.match(pages.getPage('story-of-dashboard').body,/id="storyboard"/);
});
test('unavailable first and last arrows retain a clear quiet endpoint state',()=>{
 const css=readFileSync('src/styles/original_story.css','utf8');
 assert.match(css,/\.sb-nav button:disabled\{opacity:\.35;cursor:default\}/);
});
test('original slides use their reserved stage instead of the generic pager image cap',()=>{
 const css=readFileSync('src/styles/original_story.css','utf8');
 assert.match(css,/\.sb-slide img\{[^}]*max-height:none/);
});
