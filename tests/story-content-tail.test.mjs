import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
const source=ts.createSourceFile('pages_home6.ts',readFileSync('src/scripts/pages_home6.ts','utf8'),ts.ScriptTarget.Latest,true);
let method;
function visit(node){if(ts.isFunctionDeclaration(node)&&node.name?.text==='splitAt')method=node.getText(source);ts.forEachChild(node,visit)}
visit(source);assert.ok(method);
const js=ts.transpileModule(method,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
function stops({bottom,ownerHeight=904,sticky=false,end=147,left=100,right=290}){
 const unit={top:bottom-24,offsetHeight:24,getClientRects:()=>[{}],getBoundingClientRect:()=>({left,right}),matches:()=>true};
 const owner={top:0,offsetHeight:ownerHeight,querySelectorAll:()=>[unit],querySelector:()=>sticky?{sticky:true}:null};
 const context={window:{innerHeight:757,innerWidth:390},NEXT_ROOM:60,UNITS:'p',BLOCKS:'article',absTop:el=>el.top,getComputedStyle:el=>({position:el.sticky?'sticky':'static'})};
 runInNewContext(js+';this.splitAt=splitAt;',context);
 return Array.from(context.splitAt(owner,0,end,680,77));
}
test('a real final directory tail remains reachable even below quarter-screen threshold',()=>{
 assert.deepEqual(stops({bottom:885}),[147]);
});
test('extra bottom padding does not create a continuation when actual content already fits',()=>{
 assert.deepEqual(stops({bottom:690}),[]);
});
test('intentional sticky tracks retain their small-stop suppression',()=>{
 assert.deepEqual(stops({bottom:885,sticky:true}),[]);
});
test('content that fits but sits under the next control gets a short tail stop that clears it',()=>{
 assert.deepEqual(stops({bottom:740,end:100}),[67]);
});
test('content that fits and sits beside the next control needs no tail',()=>{
 assert.deepEqual(stops({bottom:740,end:100,left:10,right:120}),[]);
});
