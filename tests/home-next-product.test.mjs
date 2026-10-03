import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
test('homepage down arrow advances one reading/product stop and never skips the category',()=>{
 const source=readFileSync('src/scripts/pages_home_next.ts','utf8').split('/* The same arrow')[0];
 const buttons=[];let calls=0;
 const section={querySelector:()=>null,appendChild:b=>buttons.push(b)};
 const doc={querySelector:()=>({}),getElementById:()=>section,createElement:()=>({setAttribute(){},addEventListener(t,f){this.click=f;}})};
 const window={chStory:{go(){calls++;return true;},current(){return {els:[section]};}}};
 runInNewContext(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,{document:doc,window});
 buttons[0].click();assert.equal(calls,1);
});
test('down arrows do not relocate to unrelated side corners',()=>{const source=readFileSync('src/scripts/pages_home_next.ts','utf8');assert.doesNotMatch(source,/classList\.add\("at-side"\)/);assert.doesNotMatch(source,/for \(const target of \[cx, /);});
test('the circle asks the story engine whether a next screen exists, so product tabs and the footer count',()=>{
 const source=readFileSync('src/scripts/pages_home_next.ts','utf8');
 assert.match(source,/return story\.hasNext\(\)/);
 assert.doesNotMatch(source,/story\.frames\(\)/);
});
