import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync('src/scripts/meeting_embeds.ts','utf8');
test('switching community keeps every built view instead of replacing it',()=>{
 assert.match(src,/const views = new Map</);
 assert.match(src,/v\.view\.hidden=i!==index/);
 assert.doesNotMatch(src,/mount\.replaceChildren\(\);\s*heading/);
});
test('a category click swaps to a kept frame rather than reloading the single frame',()=>{
 assert.doesNotMatch(src,/f\.src=url\.href/);
 assert.match(src,/if\(fr\.dataset\.ready\)swap\(fr\)/);
 assert.match(src,/is-front/);
});
test('categories begin loading on hover, focus or press, before the click lands',()=>{
 assert.match(src,/\['pointerenter','focus','pointerdown','touchstart'\]/);
});
test('background loading is skipped when the visitor asked to save data',()=>{
 assert.match(src,/saveData/);
 assert.match(src,/!lean\(\)/);
});
