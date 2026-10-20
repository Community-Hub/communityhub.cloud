import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
const source=ts.createSourceFile('base.ts',readFileSync('src/scripts/base.ts','utf8'),ts.ScriptTarget.Latest,true);
const functions=[];
(function visit(n){if(ts.isFunctionDeclaration(n)&&['slowWait','clearWait'].includes(n.name?.text))functions.push(n.getText(source));ts.forEachChild(n,visit)})(source);
const code=ts.transpileModule(functions.join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
function setup(){
 const classes=new Set();
 function node(cls=''){return{className:cls,children:[],style:{},textContent:'',attrs:{},setAttribute(n,v){this.attrs[n]=v},removeAttribute(n){delete this.attrs[n]},replaceChildren(...xs){this.children=xs},appendChild(x){x.parent=this;this.children.push(x)},remove(){this.removed=true;if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this)}}}
 const fig=node(),body=node('lf-body'),frame=node('iframe'),wait=node('lf-wait'),retry=node('lf-load');frame.style.opacity='0';
 fig.classList={add:x=>classes.add(x),remove:x=>classes.delete(x)};fig.querySelector=()=>retry;body.closest=()=>fig;body.after=x=>fig.appendChild(x);fig.appendChild(body);body.appendChild(wait);body.appendChild(frame);
 const $=(selector,root)=>selector==='iframe'?frame:root.children.find(x=>!x.removed&&x.className===selector.slice(1))||null;
 const ctx={doc:{createElement:()=>node()},$};runInNewContext(code,ctx);return{...ctx,fig,body,frame,wait,retry,classes};
}
test('slow loading reveals remote content and keeps status outside the app viewport',()=>{
 const x=setup();x.slowWait(x.body,'https://example.org/public');assert.equal(x.frame.style.opacity,'1');assert.equal(x.wait.removed,true);const notice=x.fig.children.find(n=>n.className==='lf-notice');assert.ok(notice);assert.equal(notice.parent,x.fig);assert.equal(x.body.children.includes(notice),false);assert.equal(notice.style.zIndex,undefined);assert.equal(notice.children[0].href,'https://example.org/public');assert.equal(x.retry.disabled,false);
});
test('a later load clears the slow notice and retry state',()=>{
 const x=setup();x.slowWait(x.body,'https://example.org/public');x.clearWait(x.body);assert.ok(!x.fig.children.some(n=>n.className==='lf-notice'));assert.equal(x.classes.has('needs-retry'),false);
});
