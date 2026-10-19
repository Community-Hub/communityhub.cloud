import {before,test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'vite';
let html;
before(async()=>{const r=await build({configFile:false,logLevel:'silent',build:{write:false,minify:false,lib:{entry:'src/content/site.ts',formats:['es']}}});const code=(Array.isArray(r)?r[0]:r).output[0].code;const pages=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);html=pages.getPage('index').body;});
test('only the Building Dashboard gets the homepage scroll-through wrapper',()=>{
 assert.equal((html.match(/class="native-scroll"/g)||[]).length,3);
 assert.match(html,/Oberlin College · Harkness/);
 // The squirrel says 'Scroll down to explore' by the scrollbar; no standing help line.
 assert.doesNotMatch(html,/Scroll within the dashboard/);
 assert.match(html,/data-squirrel="Scroll down to explore"/);
 assert.doesNotMatch(html,/Scroll through Cleveland community calendar/);
});
test('Web uses the real Cleveland feed with no iframe or local scroll trap',()=>{
 assert.match(html,/class="ev-mini calendar-brief" data-events data-city="cleveland" data-count="3"/);
 assert.match(html,/Cleveland · Community Calendar/);
 assert.doesNotMatch(html,/native-calendar-frame/);
});
