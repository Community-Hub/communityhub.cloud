import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { build } from 'vite';

const mission = 'Community Hub is a community-centered communication platform, with tools to gather data and put it on display. With them, organizations, neighborhoods and cities engage, educate, motivate and empower their communities, building connection and resilience in a rapidly changing environment.';
let renderer, controller, domScript;
before(async () => {
  const load = async (entry, format = 'es') => {
    const result = await build({ configFile: false, logLevel: 'silent', build: { write: false, minify: false, lib: { entry, formats: [format], name: 'Identity' } } });
    return (Array.isArray(result) ? result[0] : result).output[0].code;
  };
  const [html, runtime] = await Promise.all(['src/content/platform_explanation.ts','src/scripts/platform_explanation.ts'].map(entry => load(entry)));
  renderer = await import(`data:text/javascript;base64,${Buffer.from(html).toString('base64')}`);
  controller = await import(`data:text/javascript;base64,${Buffer.from(runtime).toString('base64')}`);
  domScript = await load('src/scripts/platform_explanation.ts','iife');
});

function time() {
  let now = 0, id = 0;
  const jobs = new Map();
  const clock = { now: () => now, setTimeout(callback,delay) { const key = ++id; jobs.set(key,{at:now+delay,callback}); return key; }, clearTimeout(key) { jobs.delete(key); } };
  const advance = (ms, flush = () => {}) => {
    const end = now + ms;
    while (true) {
      const next = [...jobs].sort((a,b) => a[1].at-b[1].at)[0];
      if (!next || next[1].at > end) break;
      now=next[1].at; jobs.delete(next[0]); next[1].callback(); flush();
    }
    now=end;
  };
  return { clock,advance,jobs };
}
function sequence() {
  assert.equal(typeof controller.createIdentitySequence,'function');
  const t=time(), phases=[], completions=[];
  const flow=controller.createIdentitySequence({clock:t.clock,onPhase:p=>phases.push(p),onComplete:()=>completions.push(true)});
  return {...t,flow,phases,completions};
}

test('Who We Are is one centered source identity with exact mission and About destination', () => {
  const html=renderer.renderPlatformExplanation();
  assert.match(html,/data-identity-explanation/);
  assert.match(html,/data-identity-content/);
  assert.match(html,/data-stable-start/);
  assert.match(html,/<h2[^>]*>Who we are<\/h2>/);
  assert.ok(html.includes(`<p>${mission}</p>`));
  assert.match(html,/href="about.html"/);
  assert.equal((html.match(/data-roll/g)||[]).length,1);
  assert.deepEqual([...html.matchAll(/src="assets\/([^"]+)"/g)].map(m=>m[1]),['ro-cv.png','ro-cwd.png','ro-ch.png','ro-bd.png','ro-cal.png']);
  for (const [,asset] of html.matchAll(/src="assets\/([^"]+)"/g)) assert.ok(existsSync(`public/assets/${asset}`));
  assert.doesNotMatch(html,/data-platform-panel|data-platform-replay|data-conn|Data sources|pex-caption|<figure|<button/);
});

test('one identity sequence includes reading time and completes only once', () => {
  const c=sequence(); c.advance(30000); assert.equal(c.flow.phase,'ready');
  c.flow.resume('offscreen'); c.advance(2399); assert.equal(c.flow.phase,'identity');
  c.advance(1); assert.equal(c.flow.phase,'reading');
  c.advance(6599); assert.equal(c.flow.phase,'reading');
  c.advance(1); assert.equal(c.flow.phase,'complete');
  c.advance(120000); assert.equal(c.completions.length,1); assert.equal(c.jobs.size,0);
  assert.deepEqual(c.phases,['ready','identity','reading','complete']);
});

test('overlapping hover and focus gates preserve exact remaining time', () => {
  const c=sequence(); c.flow.resume('offscreen'); c.advance(1000);
  c.flow.pause('hover'); c.flow.pause('focus'); c.advance(20000); c.flow.resume('hover');
  c.advance(10000); assert.equal(c.flow.phase,'identity');
  c.flow.resume('focus'); c.advance(1399); assert.equal(c.flow.phase,'identity');
  c.advance(1); assert.equal(c.flow.phase,'reading');
});

test('hidden and offscreen pauses do not restart or complete the identity', () => {
  const c=sequence(); c.flow.resume('offscreen'); c.advance(3500);
  c.flow.pause('document'); c.flow.pause('offscreen'); c.advance(20000);
  c.flow.resume('document'); c.advance(10000); assert.equal(c.flow.phase,'reading');
  c.flow.resume('offscreen'); c.advance(5499); assert.equal(c.flow.phase,'reading');
  c.advance(1); assert.equal(c.completions.length,1);
});

test('settling reduced motion is readable without asking for an automatic advance', () => {
  const c=sequence(); c.flow.settle(); c.flow.resume('offscreen'); c.advance(30000);
  assert.equal(c.flow.phase,'complete'); assert.equal(c.completions.length,0);
});

function domIdentity({reduced=false, noObserver=false, noStory=false}={}) {
  const t=time(), microtasks=[], animations=[], navigation=[];
  let intersect;
  class Element {
    dataset={}; events=new Map(); attrs=new Map(); children=[]; style={getPropertyValue:()=> '0'};
    classList={add(){},remove(){}};
    querySelector(selector){return this.queries?.[selector]||null;}
    querySelectorAll(selector){return this.lists?.[selector]||[];}
    contains(el){return el===this||this.children.some(child=>child.contains(el));}
    addEventListener(type,callback){const callbacks=this.events.get(type)||[];callbacks.push(callback);this.events.set(type,callbacks);}
    emit(type,event={}){for(const callback of this.events.get(type)||[])callback(event);flush();}
    animate(frames,options){const a={frames,options,playState:'running',pause(){this.playState='paused';},play(){this.playState='running';},cancel(){this.playState='idle';}};animations.push(a);return a;}
  }
  const section=new Element(), content=new Element(), roll=new Element(), about=new Element(), nextSection=new Element(), beforeSection=new Element();
  section.queries={'[data-identity-content]':content,'[data-roll]':roll}; section.children=[content];content.children=[roll,about];
  roll.lists={img:Array.from({length:5},()=>new Element())};
  const document=new Element(); document.hidden=false;document.activeElement=null;document.lists={'[data-identity-explanation]':[section]};
  const media=new Element();media.matches=reduced;
  const window=new Element();Object.assign(window,{setTimeout:t.clock.setTimeout,clearTimeout:t.clock.clearTimeout,scrollY:0});
  const before={els:[beforeSection],y:0}, current={els:[section],scene:content,y:1000,scenePart:0}, tail={els:[section],scene:content,y:1180,scenePart:1}, next={els:[nextSection],y:1800};
  let owner=before;
  if(!noStory)window.chStory={frames:()=>[before,current,tail,next],current:()=>owner};
  window.dispatchEvent=event=>{navigation.push(event);if(event.type==='ch:fit'){owner=event.detail.anchor;window.scrollY=owner.y;window.emit('ch:storychange',{detail:{els:owner.els,moving:false}});}return true;};
  class CustomEvent{constructor(type,init){this.type=type;this.detail=init?.detail;}}
  class IntersectionObserver{constructor(callback){intersect=callback;}observe(){}}
  if(!noObserver)window.IntersectionObserver=IntersectionObserver;
  function flush(){while(microtasks.length)microtasks.shift()();}
  const context={document,window,CustomEvent,IntersectionObserver,performance:{now:t.clock.now},matchMedia:query=>query.includes('reduced-motion')?media:{matches:true},queueMicrotask:callback=>microtasks.push(callback)};
  runInNewContext(`${domScript};Identity.enhanceIdentityExplanation();`,context);flush();
  function visible(on){intersect?.([{target:content,isIntersecting:on,intersectionRatio:on?1:0}]);flush();}
  function enter(){owner=current;window.scrollY=current.y;window.emit('ch:storychange',{detail:{els:owner.els,moving:false}});visible(true);}
  function leave(){owner=next;window.scrollY=next.y;window.emit('ch:storychange',{detail:{els:owner.els,moving:false}});visible(false);}
  return {section,content,roll,about,document,window,media,navigation,animations,current,next,enter,leave,visible,advance:ms=>t.advance(ms,flush),enhanceAgain:()=>runInNewContext('Identity.enhanceIdentityExplanation();',context),setOwner:frame=>{owner=frame;}};
}

test('first completion advances through the existing owner to the next section, skipping Who We Are tails',()=>{
  const c=domIdentity();c.enter();c.advance(8999);assert.equal(c.navigation.length,0);
  c.advance(1);assert.equal(c.navigation.length,1);assert.equal(c.navigation[0].type,'ch:fit');assert.equal(c.navigation[0].detail.anchor,c.next);
  c.advance(60000);assert.equal(c.navigation.length,1);
});

test('motif hover and About focus pause pixels and automatic advance until both release',()=>{
  const c=domIdentity();c.enter();c.advance(1000);c.roll.emit('mouseenter');
  assert.ok(c.animations.every(a=>a.playState==='paused'));
  c.document.activeElement=c.about;c.content.emit('focusin');c.advance(20000);c.roll.emit('mouseleave');c.advance(10000);
  assert.equal(c.navigation.length,0);assert.equal(c.section.dataset.sequencePhase,'identity');
  c.document.activeElement=null;c.content.emit('focusout');c.advance(7999);assert.equal(c.navigation.length,0);c.advance(1);assert.equal(c.navigation.length,1);
});

test('hidden tab preserves remaining time and never advances while hidden',()=>{
  const c=domIdentity();c.enter();c.advance(3000);c.document.hidden=true;c.document.emit('visibilitychange');c.advance(30000);
  assert.equal(c.navigation.length,0);c.document.hidden=false;c.document.emit('visibilitychange');c.advance(5999);assert.equal(c.navigation.length,0);c.advance(1);assert.equal(c.navigation.length,1);
});

test('manual departure pauses the animation and disarms any surprise auto-advance on revisit',()=>{
  const c=domIdentity();c.enter();c.advance(1000);c.leave();c.advance(30000);
  assert.equal(c.section.dataset.sequencePhase,'identity');assert.equal(c.navigation.length,0);
  c.enter();c.advance(8000);assert.equal(c.section.dataset.sequencePhase,'complete');assert.equal(c.navigation.length,0);
  c.leave();c.enter();c.advance(60000);assert.equal(c.navigation.length,0);
});

for(const [type,event] of [['wheel',{}],['touchmove',{}],['keydown',{key:'PageDown'}]])test(`manual ${type} navigation cancels pending automatic progression`,()=>{
  const c=domIdentity();c.enter();c.advance(1000);c.window.emit(type,event);c.advance(8000);
  assert.equal(c.section.dataset.sequencePhase,'complete');assert.equal(c.navigation.length,0);
});

test('completion does not move a newer scene even before visibility callbacks catch up',()=>{
  const c=domIdentity();c.enter();c.advance(8999);c.setOwner(c.next);c.advance(1);assert.equal(c.navigation.length,0);
});

test('reduced motion and missing observation keep source content settled without automatic navigation',()=>{
  for(const options of [{reduced:true},{noObserver:true}]){const c=domIdentity(options);c.enter();c.advance(30000);assert.equal(c.section.dataset.sequencePhase,'complete');assert.equal(c.animations.length,0);assert.equal(c.navigation.length,0);}
});

test('changing reduced motion during playback cancels animation and pending automatic progression',()=>{
  const c=domIdentity();c.enter();c.advance(1000);c.media.matches=true;c.media.emit('change');c.advance(30000);
  assert.equal(c.section.dataset.sequencePhase,'complete');assert.equal(c.navigation.length,0);assert.ok(c.animations.every(a=>a.playState==='idle'));
});

test('source identity is visible before its first animation paint and enhances only once',()=>{
  const c=domIdentity();c.enter();c.document.hidden=true;c.document.emit('visibilitychange');
  assert.equal(c.animations.length,5);for(const a of c.animations)assert.equal(Number(a.frames[0].opacity??1),1);
  c.enhanceAgain();assert.equal(c.roll.events.get('mouseenter').length,1);
});

test('centering and enlargement stay scoped to Who We Are and preserve left-aligned mission reading',()=>{
  const css=readFileSync('src/styles/platform_explanation.css','utf8');
  assert.match(css,/\[data-identity-explanation\]/);assert.match(css,/grid-template-columns:1fr/);
  assert.match(css,/\.why-copy p\{[^}]*text-align:left/);assert.match(css,/prefers-reduced-motion/);
  assert.doesNotMatch(css,/pex-|\.hv|#engage|infinite/);
});
