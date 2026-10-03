import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'vite';
import vm from 'node:vm';
test('public embeds need no extra activation button and are keyboard reachable',async()=>{
 const result=await build({configFile:false,logLevel:'silent',build:{write:false,minify:false,lib:{entry:'src/scripts/pages_zzzzz_shield.ts',formats:['es']}}});
 const code=(Array.isArray(result)?result[0]:result).output[0].code;
 const classes=new Set(['ch-embed-shield']);let event;
 const frame={hasAttribute:()=>false,classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)},tabIndex:-1,dispatchEvent:e=>event=e};
 const main={querySelectorAll:()=>[frame]};
 const context={document:{getElementById:()=>main},MutationObserver:class{observe(){}},CustomEvent:class{constructor(type){this.type=type}}};
 vm.runInNewContext(code,context);
 assert.equal(frame.tabIndex,0);assert.ok(classes.has('ch-live'));assert.ok(!classes.has('ch-embed-shield'));assert.equal(event.type,'ch:embed-interact');
 assert.doesNotMatch(code,/createElement\(["']button|Use live controls/);
});

test('passive homepage previews are not silently promoted to interactive frames',async()=>{
 const result=await build({configFile:false,logLevel:'silent',build:{write:false,minify:false,lib:{entry:'src/scripts/pages_zzzzz_shield.ts',formats:['es']}}});
 const code=(Array.isArray(result)?result[0]:result).output[0].code;
 const frame={hasAttribute:key=>key==='data-passive-preview',tabIndex:-1};
 vm.runInNewContext(code,{document:{getElementById:()=>({querySelectorAll:()=>[frame]})},MutationObserver:class{observe(){}}});
 assert.equal(frame.tabIndex,-1);
});
