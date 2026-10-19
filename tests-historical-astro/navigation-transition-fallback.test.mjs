import{test}from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
test('ordinary document navigation does not opt into unsupported cross-document transitions',()=>{assert.doesNotMatch(readFileSync('src/styles/pages_zzz_polish.css','utf8'),/@view-transition\s*\{navigation:auto\}/);});
