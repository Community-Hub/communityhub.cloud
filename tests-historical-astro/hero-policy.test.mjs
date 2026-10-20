import {before,test} from 'node:test';import assert from 'node:assert/strict';import {build} from 'vite';
let mayAdvance;
before(async()=>{const r=await build({configFile:false,logLevel:'silent',build:{write:false,minify:false,lib:{entry:'src/scripts/ui/hero-policy.ts',formats:['es']}}});const code=(Array.isArray(r)?r[0]:r).output[0].code;({mayAutoAdvanceHero:mayAdvance}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`))});
test('completed hero advances when still visible on any viewport size',()=>{assert.equal(mayAdvance({hidden:false,away:false,scrollY:0,scheduledY:0,top:119}),true)});
test('completion never steals navigation after leaving or changing position',()=>{const s={hidden:false,away:false,scrollY:0,scheduledY:0,top:119};assert.equal(mayAdvance({...s,away:true}),false);assert.equal(mayAdvance({...s,hidden:true}),false);assert.equal(mayAdvance({...s,scrollY:200}),false);assert.equal(mayAdvance({...s,top:-100}),false)});
