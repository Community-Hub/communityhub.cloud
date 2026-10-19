import { before,test } from 'node:test';import assert from 'node:assert/strict';import { build } from 'vite';
let choose;
before(async()=>{const result=await build({configFile:false,logLevel:'silent',build:{write:false,minify:false,lib:{entry:'src/lib/image-metadata.ts',formats:['es']}}});const output=(Array.isArray(result)?result[0]:result).output[0].code;({responsiveCandidates:choose}=await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`))});
test('responsive widths follow uploaded pixels, not obsolete filename suffixes',()=>{assert.deepEqual(choose([['photo-800.jpg',800],['photo-1600.jpg',1600]],{'assets/photo-800.jpg':[800,533],'assets/photo-1600.jpg':[960,640]}),[['photo-800.jpg',800],['photo-1600.jpg',960]])});
test('duplicate width candidates are collapsed and missing candidates excluded',()=>{assert.deepEqual(choose([['a.jpg',800],['b.jpg',1600],['missing.jpg',2000]],{'assets/a.jpg':[960,640],'assets/b.jpg':[960,640]}),[['a.jpg',960]])});
