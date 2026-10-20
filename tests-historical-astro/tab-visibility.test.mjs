import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const source=await readFile('src/scripts/ui/tab-visibility.ts','utf8');
const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {revealTabWithinList}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
function list(left=0){return{scrollWidth:780,clientWidth:348,scrollLeft:left,getBoundingClientRect:()=>({left:20})}}
test('a deep-linked final dashboard choice becomes visible inside its tab strip',()=>{const x=list();revealTabWithinList(x,{getBoundingClientRect:()=>({left:580,width:220})});assert.equal(x.scrollLeft,432)});
test('keyboard reversal reveals the first choice without a document scroll call',()=>{const x=list(432);revealTabWithinList(x,{getBoundingClientRect:()=>({left:20-432,width:140})});assert.equal(x.scrollLeft,0)});
test('a visible choice leaves the horizontal viewport untouched',()=>{const x=list(100);revealTabWithinList(x,{getBoundingClientRect:()=>({left:60,width:140})});assert.equal(x.scrollLeft,100)});
