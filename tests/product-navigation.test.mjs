import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
let api;
before(() => {
  const source=readFileSync('src/scripts/ui/product-navigation.ts','utf8').replace(/export /g,'');
  const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
  api=runInNewContext(`${code}\n({registerProductNavigation, productBoundary, productHasMore})`);
});
function rail(count, initial=0) {
  const section={}; let index=initial, enabled=true;
  api.registerProductNavigation(section,{enabled:()=>enabled,count:()=>count,current:()=>index,select:i=>{index=i;}});
  return {section, index:()=>index, disable:()=>{enabled=false;}};
}
test('narrow product boundaries traverse all products before leaving the category',()=>{
  const engage=rail(3), educate=rail(4); let result;
  result=api.productBoundary(engage.section,educate.section,1);
  assert.equal(engage.index(),1); assert.equal(result.section,engage.section); assert.equal(result.direction,1);
  result=api.productBoundary(engage.section,educate.section,1);
  assert.equal(engage.index(),2); assert.equal(result.section,engage.section);
  result=api.productBoundary(engage.section,educate.section,1);
  assert.equal(result.section,educate.section); assert.equal(educate.index(),0);
});
test('reverse traversal enters the last product and returns through the exact order',()=>{
  const engage=rail(3),educate=rail(4);
  let result=api.productBoundary(educate.section,engage.section,-1);
  assert.equal(result.section,engage.section); assert.equal(engage.index(),2); assert.equal(result.direction,-1);
  api.productBoundary(engage.section,{},-1); assert.equal(engage.index(),1);
  api.productBoundary(engage.section,{},-1); assert.equal(engage.index(),0);
  assert.equal(api.productBoundary(engage.section,{},-1),null);
});
test('reading stops within the selected product do not change that product',()=>{
  const r=rail(3); assert.equal(api.productBoundary(r.section,r.section,1),null); assert.equal(r.index(),0);
});
test('explicit tab selection defines the next product and desktop keeps existing stops',()=>{
  const r=rail(3,1); api.productBoundary(r.section,{},1); assert.equal(r.index(),2);
  r.disable(); assert.equal(api.productBoundary(r.section,{},-1),null); assert.equal(r.index(),2);
});
test('a new forward visit starts at the first product and backward visit at the last',()=>{
  const r=rail(4,2);
  api.productBoundary({},r.section,1); assert.equal(r.index(),0);
  api.productBoundary({},r.section,-1); assert.equal(r.index(),3);
});
test('productHasMore reads the rail without moving it',()=>{
  const rails=rail(3,1);
  assert.equal(api.productHasMore(rails.section,1),true);
  assert.equal(api.productHasMore(rails.section,-1),true);
  assert.equal(rails.index(),1);
  const end=rail(2,1);
  assert.equal(api.productHasMore(end.section,1),false);
  end.disable();
  assert.equal(api.productHasMore(end.section,-1),false);
  assert.equal(api.productHasMore(undefined,1),false);
});
