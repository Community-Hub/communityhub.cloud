import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
const file=ts.createSourceFile('controller.ts',readFileSync('src/scripts/pages_home6.ts','utf8'),ts.ScriptTarget.Latest,true);
let eligibility,initialFrame;
(function visit(node){
 if(ts.isVariableDeclaration(node)&&node.name.getText(file)==='initialHashPending')eligibility=node.initializer.getText(file);
 if(ts.isFunctionDeclaration(node)&&node.name?.text==='initialHashFrame')initialFrame=node.getText(file);
 ts.forEachChild(node,visit);
})(file);
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const eligible=runInNewContext(compile(`(function(initialHash,navigationEntry){return ${eligibility}})`));
test('fresh navigation and refresh both retain an explicit hash target',()=>{
 assert.equal(eligible('#citywide',{type:'navigate'}),true);
 assert.equal(eligible('#citywide',{type:'reload'}),true);
 assert.equal(eligible('',{type:'reload'}),false);
});
test('history traversal keeps the browser restoration contract',()=>{
 assert.equal(eligible('#citywide',{type:'back_forward'}),false);
});
function state(){
 assert.ok(initialFrame,'Startup layout must have an explicit hash-frame resolver');
 const section={contains:e=>e===target},target={closest:()=>null};
 const frames=[{y:0,els:[{contains:()=>false}]},{y:680,els:[section]}];
 const ctx={initialHashPending:true,initialHash:'#citywide',location:{hash:'#citywide'},document:{getElementById:id=>id==='citywide'?target:null},main:{contains:e=>e===target},frameForElement:()=>frames[1]};
 runInNewContext(compile(initialFrame),ctx);return{ctx,frames,target};
}
test('startup remeasurement keeps the requested section instead of the old first frame',()=>{
 const {ctx,frames}=state();assert.equal(ctx.initialHashFrame(frames),frames[1]);
});
test('manual navigation or a changed hash releases the pending startup target',()=>{
 const {ctx,frames}=state();ctx.initialHashPending=false;assert.equal(ctx.initialHashFrame(frames),null);ctx.initialHashPending=true;ctx.location.hash='#orbs';assert.equal(ctx.initialHashFrame(frames),null);
});
test('a selected dashboard panel keeps its gallery controls in the first frame',()=>{
 const {ctx,frames,target}=state();target.closest=()=>target;assert.equal(ctx.initialHashFrame(frames),frames[1]);
});
