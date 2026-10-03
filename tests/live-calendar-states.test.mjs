import {before,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
let source;
before(()=>{
 const ast=ts.createSourceFile('base.ts',readFileSync('src/scripts/base.ts','utf8'),ts.ScriptTarget.Latest,true);
 const pieces=[];
 function visit(node){
  if(ts.isVariableDeclaration(node)&&node.name.getText(ast)==='CITIES')pieces.push('const '+node.getText(ast)+';');
  if(ts.isFunctionDeclaration(node)&&['monthKey','loadEvents'].includes(node.name?.text))pieces.push(node.getText(ast));
  ts.forEachChild(node,visit);
 }
 visit(ast);assert.equal(pieces.length,3);
 source=ts.transpileModule(pieces.join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
});
async function render(result,fail=false,passive=false){
 const fallback={textContent:'Loading…',innerHTML:''};
 const box={innerHTML:'',getAttribute:key=>key==='data-city'?'cleveland':key==='data-count'?'3':key==='data-event-preview'&&passive?'':null};
 const context={getJSON:()=>fail?Promise.reject(new Error('unavailable')):Promise.resolve(result),
  calendarData:value=>{if(!Array.isArray(value.sessions))throw Error('invalid');return value;},
  $:()=>fallback,TZ:{timeZone:'America/New_York'},clock:()=> '2:00 PM',
  esc:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),box};
 runInNewContext(`${source}\nloadEvents(box);`,context);
 await new Promise(resolve=>setImmediate(resolve));
 return {box,fallback};
}
test('loaded Cleveland events retain their real destination and source context',async()=>{
 const now=Date.now()/1000;
 const {box}=await render({sessions:[{postId:123,postName:'Community event',start:now+86400,end:now+90000}]});
 assert.match(box.innerHTML,/https:\/\/cleveland.communityhub.cloud\/calendar\/post\/123/);
 assert.match(box.innerHTML,/Community event/);assert.match(box.innerHTML,/Cleveland/);
});
test('a valid empty calendar gives a truthful empty state instead of a loading failure',async()=>{
 const {fallback}=await render({sessions:[]});
 assert.match(fallback.textContent,/No upcoming Cleveland events/);
 assert.doesNotMatch(fallback.textContent,/couldn.t load/);
});
test('unavailable calendar gives a conditional direct source recovery link',async()=>{
 const {fallback}=await render(null,true);
 assert.match(fallback.innerHTML,/couldn.t load/);
 assert.match(fallback.innerHTML,/https:\/\/cleveland.communityhub.cloud\/calendar\//);
});

test('homepage calendar previews preserve content without competing clickable event links',async()=>{const now=Date.now()/1000;const {box}=await render({sessions:[{postId:123,postName:'Community event',start:now+86400,end:now+90000}]},false,true);assert.match(box.innerHTML,/Community event/);assert.match(box.innerHTML,/event-preview-row/);assert.doesNotMatch(box.innerHTML,/<a /);});
