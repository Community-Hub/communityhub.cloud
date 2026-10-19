import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
const source=await readFile('src/scripts/pages_zprod_b.ts','utf8');
const start=source.indexOf('    function apply(key:');
const end=source.indexOf('    tabs.addEventListener',start);
const code=ts.transpileModule(source.slice(start,end),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
function setup(){
 const keys=['climate','serving','natural','generation','neighbors','downtown','climate','neighbors'];
 const cards=keys.map((key,index)=>({index,hidden:false,getAttribute:()=>key}));
 const rows=[0,1].map(i=>({children:cards.slice(i*4,i*4+4),hidden:false,style:{setProperty(n,v){this[n]=v}},appendChild(card){rows.forEach(r=>r.children=r.children.filter(c=>c!==card));this.children.push(card)}}));
 const empty={hidden:true},events=[];const first={scene:rows[0]};
 const ctx={cards,rows,empty,buttons:[],window:{chStory:{frames:()=>[first]},dispatchEvent:e=>events.push(e)},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}}};
 runInNewContext(code,ctx);return{...ctx,apply:ctx.apply,events,first};
}
test('two matching community quotations from different original rows appear together',()=>{
 const x=setup();x.apply('climate',true);assert.deepEqual(x.rows[0].children.filter(c=>!c.hidden).map(c=>c.index),[0,6]);assert.equal(x.rows[1].hidden,true);assert.equal(x.rows[0].style['--voices-columns'],'2');assert.equal(x.events.at(-1).detail.anchor,x.first);
});
test('restoring all quotations restores the original order and both complete rows',()=>{
 const x=setup();x.apply('neighbors');x.apply('all');assert.deepEqual(x.rows.flatMap(r=>r.children).map(c=>c.index),[0,1,2,3,4,5,6,7]);assert.ok(x.rows.every(r=>!r.hidden));assert.ok(x.cards.every(c=>!c.hidden));
});
test('an empty filter shows its explicit recovery instead of empty card slots',()=>{
 const x=setup();x.apply('absent');assert.equal(x.empty.hidden,false);assert.ok(x.rows.every(r=>r.hidden));
});

test('initial wall preparation does not jump away from the page introduction',()=>{
 const x=setup();x.apply('all');assert.equal(x.events.length,0);assert.ok(x.rows.every(r=>!r.hidden));
});
