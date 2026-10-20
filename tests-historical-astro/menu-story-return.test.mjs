import {before,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
let source;
before(()=>{
 const ast=ts.createSourceFile('base.ts',readFileSync('src/scripts/base.ts','utf8'),ts.ScriptTarget.Latest,true);
 let found;function visit(n){if(ts.isFunctionDeclaration(n)&&n.name?.text==='setMenu')found=n.getText(ast);ts.forEachChild(n,visit);}visit(ast);assert.ok(found);
 source=ts.transpileModule(found,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
});
test('closing the drawer restores the story captured before its layout mutation',()=>{
 class Element {inert=false;contains(){return false;}focus(){}setAttribute(){}}
 const main=new Element(),hdr=new Element(),mb=new Element(),mnav=new Element();mnav.hidden=true;
 const original={y:2770,els:[main],part:0},different={y:2391,els:[{}],part:1};let current=original;
 const calls=[];
 const doc={body:{children:[main,hdr,mnav],style:{overflow:''}}};
 const context={mb,mnav,hdr,doc,HTMLElement:Element,priorOverflow:'',menuStory:null,menuBackground:new Map(),
  $:()=>null,closeDD(){},menuControls:()=>[mb,new Element()],
  window:{chStory:{current:()=>current},dispatchEvent:event=>calls.push(event)},
  CustomEvent:class {constructor(type,options){this.type=type;this.detail=options.detail;}}};
 runInNewContext(`${source}\nthis.setMenu=setMenu;`,context);
 context.setMenu(true);current=different;context.setMenu(false);
 assert.equal(calls.at(-1)?.type,'ch:fit');assert.equal(calls.at(-1)?.detail.anchor,original);
 assert.equal(main.inert,false);assert.equal(doc.body.style.overflow,'');
});
