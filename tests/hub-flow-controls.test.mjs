import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { build } from 'vite';

let renderer, script;
before(async()=>{
  const compile=async(entry,format)=>{const result=await build({configFile:false,logLevel:'silent',build:{write:false,minify:false,lib:{entry,formats:[format],name:'HubFlow'}}});return(Array.isArray(result)?result[0]:result).output[0].code;};
  const html=await compile('src/content/hub-flow.ts','es');renderer=await import(`data:text/javascript;base64,${Buffer.from(html).toString('base64')}`);
  script=await compile('src/scripts/hub_flow.ts','iife');
});

function hub({reduced=false,noObserver=false}={}){
  let now=0,id=0,observer;const jobs=new Map(),microtasks=[],navigation=[];
  class Element{
    dataset={};hidden=false;inert=false;disabled=false;events=new Map();attrs=new Map();children=[];innerHTML='';tag='DIV';scrollTop=0;scrollHeight=0;clientHeight=0;
    classList={values:new Set(),add(...names){names.forEach(name=>this.values.add(name));},toggle(name,on){if(on)this.values.add(name);else this.values.delete(name);}};
    get textContent(){return this._text||'';}set textContent(value){this._text=value;this.innerHTML=value;}
    querySelector(selector){return this.queries?.[selector]||null;}querySelectorAll(selector){return this.lists?.[selector]||[];}closest(){return this.parent;}
    contains(el){return el===this||this.children.some(child=>child.contains(el));}matches(selector){return selector==='li'&&this.tag==='LI';}
    addEventListener(type,callback){const handlers=this.events.get(type)||[];handlers.push(callback);this.events.set(type,handlers);}
    emit(type,event={}){for(const handler of this.events.get(type)||[])handler(event);flush();}
    setAttribute(name,value){this.attrs.set(name,String(value));}getAttribute(name){return this.attrs.get(name)||null;}
    getBoundingClientRect(){return{top:Number(this.dataset.hfStep||0)*60};}
  }
  const section=new Element(),root=new Element(),say=new Element(),controls=new Element(),back=new Element(),next=new Element(),count=new Element(),data=new Element(),grid=new Element();
  const captions=JSON.parse(renderer.hub_flow('how','How the Dashboard Platform Works').match(/data-hf-steps>(.*?)<\/script>/s)[1]);
  const parts=Array.from({length:8},(_,i)=>{const p=new Element();p.tag='LI';p.dataset.hfStep=String(i+1);return p;});
  data.textContent=JSON.stringify(captions);back.innerHTML=next.innerHTML='<svg viewBox="0 0 24 24"><path/></svg>';
  root.parent=section;section.children=[root];root.children=[grid,controls];controls.children=[back,next];grid.children=parts;
  root.queries={'[data-hf-say]':say,'[data-hf-controls]':controls,'[data-hf-back]':back,'[data-hf-next]':next,'[data-hf-count]':count,'[data-hf-steps]':data,'.hf-grid':grid};root.lists={'[data-hf-step]':parts};
  const document=new Element();document.hidden=false;document.activeElement=null;document.lists={'[data-hub-flow]':[root]};
  const media=new Element();media.matches=reduced;
  function flush(){while(microtasks.length)microtasks.shift()();}
  const setTimeout=(callback,delay)=>{const key=++id;jobs.set(key,{at:now+delay,callback});return key;};
  const setInterval=(callback,delay)=>{const key=++id;jobs.set(key,{at:now+delay,callback,interval:delay});return key;};
  const clearTimer=key=>jobs.delete(key);
  class IntersectionObserver{constructor(callback){this.callback=callback;observer=this;}observe(){}disconnect(){this.disconnected=true;}}
  const window={setTimeout,clearTimeout:clearTimer,setInterval,clearInterval:clearTimer,matchMedia:()=>media,dispatchEvent:event=>navigation.push(event)};
  if(!noObserver)window.IntersectionObserver=IntersectionObserver;
  const context={document,window,performance:{now:()=>now},matchMedia:()=>media,IntersectionObserver,queueMicrotask:callback=>microtasks.push(callback)};
  runInNewContext(script,context);flush();
  function visible(on){if(observer&&!observer.disconnected)observer.callback([{target:root,isIntersecting:on,intersectionRatio:on?1:0}],observer);flush();}
  function advance(ms){const end=now+ms;while(true){const next=[...jobs].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;now=next[1].at;jobs.delete(next[0]);if(next[1].interval)jobs.set(next[0],{...next[1],at:now+next[1].interval});next[1].callback();flush();}now=end;}
  return{root,section,say,controls,back,next,grid,parts,document,media,captions,visible,advance,navigation,enhanceAgain:()=>runInNewContext('HubFlow.enhanceHubFlows();',context)};
}

test('interior model keeps all eight source captions and linked applications with icon-only arrows',()=>{
  const html=renderer.hub_flow('how','How the Dashboard Platform Works');
  const steps=JSON.parse(html.match(/data-hf-steps>(.*?)<\/script>/s)[1]);assert.equal(steps.length,8);
  const controls=html.match(/<div class="hf-controls"[\s\S]*?<\/div>/)[0];
  assert.equal((controls.match(/<button /g)||[]).length,2);assert.equal((controls.match(/<svg /g)||[]).length,2);
  assert.match(controls,/aria-label="Previous explanation step"/);assert.match(controls,/aria-label="Next explanation step"/);
  assert.doesNotMatch(controls,/>Back<|>Replay<|>Next step<|data-hf-count|of 8/);
  for(const href of ['building-dashboard.html','citywide-dashboard.html','community-calendar.html','community-voices.html','the-hub.html','digital-signage.html','web-embeddables.html','phone-app.html'])assert.ok(html.includes(`href="${href}"`));
});

test('autoplay waits for visibility, reveals all eight steps and holds without changing sections',()=>{
  const c=hub();c.advance(20000);assert.equal(c.root.dataset.step,'1');c.visible(true);
  for(let step=2;step<=8;step++){c.advance(4200);assert.equal(c.root.dataset.step,String(step));assert.equal(c.say.textContent,c.captions[step-1]);}
  c.advance(60000);assert.equal(c.root.dataset.step,'8');assert.equal(c.navigation.length,0);
});

test('whole-content hover and focus holds overlap and resume the exact unspent interval',()=>{
  const c=hub();c.visible(true);c.advance(1200);c.section.emit('mouseenter');c.document.activeElement=c.next;c.section.emit('focusin');
  c.advance(10000);c.section.emit('mouseleave');c.advance(10000);assert.equal(c.root.dataset.step,'1');
  c.document.activeElement=null;c.section.emit('focusout');c.advance(2999);assert.equal(c.root.dataset.step,'1');c.advance(1);assert.equal(c.root.dataset.step,'2');
});

test('offscreen and hidden-document pauses retain elapsed step time after first start',()=>{
  const c=hub();c.visible(true);c.advance(1000);c.visible(false);c.advance(10000);
  c.document.hidden=true;c.document.emit('visibilitychange');c.visible(true);c.advance(10000);assert.equal(c.root.dataset.step,'1');
  c.document.hidden=false;c.document.emit('visibilitychange');c.advance(3199);assert.equal(c.root.dataset.step,'1');c.advance(1);assert.equal(c.root.dataset.step,'2');
});

test('manual next/back gives stable inspection and never erases the button SVG',()=>{
  const c=hub();c.visible(true);c.advance(1000);c.next.emit('click');assert.equal(c.root.dataset.step,'2');
  c.advance(20000);assert.equal(c.root.dataset.step,'2');c.back.emit('click');assert.equal(c.root.dataset.step,'1');assert.equal(c.back.disabled,true);
  assert.match(c.next.innerHTML,/<svg /);assert.match(c.back.innerHTML,/<svg /);
});

test('last-step next is an accessible replay action whose chevron survives reset',()=>{
  const c=hub({reduced:true});assert.equal(c.root.dataset.step,'8');assert.equal(c.next.getAttribute('aria-label'),'Replay explanation');assert.match(c.next.innerHTML,/<svg /);
  c.next.emit('click');assert.equal(c.root.dataset.step,'1');assert.equal(c.next.getAttribute('aria-label'),'Next explanation step');assert.match(c.next.innerHTML,/<svg /);
  c.next.emit('click');c.next.emit('click');assert.equal(c.parts.filter(p=>p.classList.values.has('is-on')).length,3);
});

test('reduced motion stays complete automatically but all manual steps remain accessible',()=>{
  const c=hub({reduced:true});c.visible(true);c.advance(60000);assert.equal(c.root.dataset.step,'8');
  c.next.emit('click');c.advance(30000);assert.equal(c.root.dataset.step,'1');c.next.emit('click');assert.equal(c.root.dataset.step,'2');
  assert.equal(c.parts[1].inert,false);assert.equal(c.parts[2].inert,true);
});

test('changing motion preference settles the current model and cancels autoplay',()=>{
  const c=hub();c.visible(true);c.advance(5000);c.media.matches=true;c.media.emit('change');assert.equal(c.root.dataset.step,'8');
  c.advance(30000);assert.equal(c.root.dataset.step,'8');assert.match(c.next.innerHTML,/<svg /);
});

test('initialization is idempotent and unsupported observation keeps the full readable model',()=>{
  const c=hub();c.enhanceAgain();assert.equal(c.next.events.get('click').length,1);
  const fallback=hub({noObserver:true});assert.equal(fallback.root.dataset.step,'8');fallback.advance(30000);assert.equal(fallback.root.dataset.step,'8');
});

test('controls reveal from content hover/focus, remain touch reachable and reserve space without a sticky bar',()=>{
  const path='src/styles/hub_flow_controls.css';assert.ok(existsSync(path));const css=readFileSync(path,'utf8');
  assert.match(css,/\.hub-flow:hover/);assert.match(css,/\.hub-flow:focus-within/);assert.match(css,/hover:none/);assert.match(css,/min-height:44px/);assert.match(css,/position:static/);
  assert.doesNotMatch(css,/\.identity-explanation|#problem|\.hv/);
});

test('slide ten replaces the generic card model with individually sourced imagery and a visible Hub foundation',()=>{
  const html=renderer.hub_flow('how','How the Dashboard Platform Works');
  assert.match(html,/data-hf-model="slide-10"/);
  assert.match(html,/hf-source-hub[^>]*data-hf-step="0"/);
  for(const asset of ['building-sources.png','environmental-sources.png','social-sources.png','hub-collects.png','hub-hands.png','web-embeddables.jpg','interactive-signage.png','phone-workflow\/oberlin-hub-menu.png'])assert.ok(html.includes(asset),asset);
  assert.doesNotMatch(html,/deck\/h10|image58|<iframe/);
  assert.match(html,/Calendar &amp; Jobs Board/);assert.match(html,/Environmental &amp; Municipal Data/);
  assert.equal((html.match(/data-hf-until=/g)||[]).length,6);
  for(const src of [...html.matchAll(/src="(assets\/[^\"]+)"/g)].map(match=>match[1]))assert.ok(existsSync(`public/${src}`),src);
});

test('the source Hub processing cue is present and respects the same pause and reduced-motion state',()=>{
  const html=renderer.hub_flow('how','How the Dashboard Platform Works');
  assert.match(html,/data-hf-processing/);
  const css=readFileSync('src/styles/hub_flow_source.css','utf8');
  assert.match(css,/data-hf-paused="false"/);assert.match(css,/animation-play-state:paused/);assert.match(css,/prefers-reduced-motion/);
});

test('narrow model reserves the two-line caption and44px controls before assigning scrollable stage height',()=>{
  const css=readFileSync('src/styles/hub_flow_source.css','utf8');
  const narrow=css.match(/@media\(max-width:450px\)\{([\s\S]*?)\n\}/)?.[1];
  assert.ok(narrow);
  assert.match(narrow,/\.hf-source-model\{min-height:180px;max-height:calc\(100dvh - 374px\)\}/);
  assert.match(narrow,/\.hf-say\{min-height:3em\}/);
});
