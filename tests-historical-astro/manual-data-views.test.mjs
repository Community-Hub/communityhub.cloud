import {before,test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {build} from 'vite';
let code;
before(async()=>{const result=await build({configFile:false,logLevel:'silent',build:{write:false,minify:false,lib:{entry:'src/scripts/pages_dataviews.ts',formats:['es']}}});code=(Array.isArray(result)?result[0]:result).output[0].code;});
function setup(){
 const node=()=>({events:{},attrs:{},addEventListener(name,fn){this.events[name]=fn},setAttribute(name,value){this.attrs[name]=value},focus(){this.focused=true}});
 const tabs=[node(),node()], helps=[node(),node()], notes=[node(),node()], charts=[node(),node()];
 const views=[0,1].map(i=>{const v=node(),classes=new Set();v.classList={toggle(n,on){on?classes.add(n):classes.delete(n)},contains:n=>classes.has(n)};v.querySelector=s=>s==='.dv-note'?notes[i]:s==='[data-dv-help]'?helps[i]:null;v.querySelectorAll=()=>[charts[i]];return v});
 const root=node();root.querySelectorAll=s=>s==='[role=tab]'?tabs:s==='.dv-view'?views:s==='[data-dv-help]'?helps:[];
 let timers=0;const context={document:{querySelectorAll:()=>[root]},window:{setTimeout(){timers++;return timers}},clearTimeout(){}};
 vm.runInNewContext(code,context);
 return {tabs,helps,notes,charts,views,timers:()=>timers};
}
test('data chart tabs stay on the readers selection without an automatic tour timer',()=>{const s=setup();assert.equal(s.timers(),0);assert.equal(s.tabs[0].attrs['aria-selected'],'true');s.tabs[1].events.click();assert.equal(s.tabs[1].attrs['aria-selected'],'true');assert.equal(s.timers(),0)});
test('opening chart help never disables the chart or hides its values',()=>{const s=setup();assert.equal(s.notes[0].hidden,true);s.helps[0].events.click();assert.equal(s.notes[0].hidden,false);assert.equal(s.charts[0].inert,false);assert.equal(s.helps[0].attrs['aria-expanded'],'true');s.helps[0].events.click();assert.equal(s.notes[0].hidden,true);assert.equal(s.charts[0].inert,false)});
