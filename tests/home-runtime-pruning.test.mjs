import{test}from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
test('retired Calendar/Jobs homepage controller and CSS are absent from production entries',()=>{assert.doesNotMatch(readFileSync('src/scripts/index.ts','utf8'),/import "\.\/pages_home8_cal"/);assert.doesNotMatch(readFileSync('src/styles/index.css','utf8'),/pages_home8_cal\.css/);});
