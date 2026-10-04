import {before,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
let source;
before(()=>{
 const ast=ts.createSourceFile('pages_home6.ts',readFileSync('src/scripts/pages_home6.ts','utf8'),ts.ScriptTarget.Latest,true);
 let found;function visit(n){if(ts.isFunctionDeclaration(n)&&n.name?.text==='relocated')found=n.getText(ast);ts.forEachChild(n,visit);}visit(ast);assert.ok(found);
 source=ts.transpileModule(found,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
});
test('resize restores the selected product rather than its old narrow reading-part index',()=>{
 const panels=[0,1,2].map(()=>({closest(){return this;},contains(){return false;}}));
 const owner={querySelector:()=>({}),querySelectorAll:()=>panels,contains:()=>false};
 const frames=panels.map((_,i)=>({y:i*600,els:[owner],part:i}));
 const context={list:frames,document:{activeElement:null},HTMLElement:class{},getComputedStyle:()=>({position:'sticky'}),matchMedia:()=>({matches:true})};
 runInNewContext(`${source}\nthis.relocate=relocated;`,context);
 const restored=context.relocate({y:800,els:[owner],part:0,anchor:panels[2]});
 assert.equal(restored,frames[2]);
 assert.equal(restored.anchor,panels[2]);
});

test('a focused product tab cannot replace the selected product resize anchor',()=>{
 class Element {}
 const focused=new Element();focused.closest=()=>null;
 const panels=[0,1,2].map(()=>({closest(){return this;},contains(){return false;}}));
 const owner={querySelector:()=>({}),querySelectorAll:()=>panels,contains:()=>true};
 const frames=panels.map((_,i)=>({y:i*600,els:[owner],part:i}));
 const context={list:frames,document:{activeElement:focused},HTMLElement:Element,getComputedStyle:()=>({position:'sticky'}),matchMedia:()=>({matches:true})};
 runInNewContext(`${source}\nthis.relocate=relocated;`,context);
 const restored=context.relocate({y:800,els:[owner],part:0,anchor:panels[2]});
 assert.equal(restored,frames[2]);
});

let resizeSource;
before(() => {
 const ast=ts.createSourceFile('pages_home7_eng.ts',readFileSync('src/scripts/pages_home7_eng.ts','utf8'),ts.ScriptTarget.Latest,true);
 let found;function visit(n){if(ts.isFunctionDeclaration(n)&&n.name?.text==='resizeProduct')found=n.getText(ast);ts.forEachChild(n,visit);}visit(ast);assert.ok(found);
 resizeSource=ts.transpileModule(found,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
});

test('an inactive section cannot claim resize ownership from stale pixel stops',()=>{
 const section={}; const selected=[];
 const context={frame:0,layoutFrame:0,activeSection:false,shown:3,sec:section,panels:[{},{},{},{}],
  window:{scrollY:1200,chStory:{current:()=>({y:1200,els:[section],part:3})},dispatchEvent(){}},
  scheduleLayout(){},selectPanel:index=>selected.push(index),layoutPanel(){},CustomEvent:class {constructor(type,init){this.type=type;this.detail=init.detail;}}};
 runInNewContext(`${resizeSource}\nthis.resize=resizeProduct;`,context);
 context.resize();
 assert.deepEqual(selected,[], 'An offscreen Stories section must not take Calendar ownership after the browser clamps scrollY');
});

test('a collapsed product frame keeps its semantic panel for the next resize',()=>{
 const panel={closest(){return this;},contains(){return false;}};
 const owner={querySelector:()=>({}),querySelectorAll:()=>[{},panel],contains:()=>false};
 const frames=[{y:300,els:[owner],part:0}];
 const context={list:frames,document:{activeElement:null},HTMLElement:class{},getComputedStyle:()=>({position:'static'}),matchMedia:()=>({matches:false})};
 runInNewContext(`${source}\nthis.relocate=relocated;`,context);
 const restored=context.relocate({y:800,els:[owner],part:1,anchor:panel});
 assert.equal(restored,frames[0]);
 assert.equal(restored.anchor,panel,'The selected product must survive combined and split reading layouts');
});

let productFunctions;
before(() => {
 const ast=ts.createSourceFile('pages_home7_eng.ts',readFileSync('src/scripts/pages_home7_eng.ts','utf8'),ts.ScriptTarget.Latest,true);
 const names=new Set(['room','alignRail','settleRail','layoutPanel','scheduleLayout','show','update','selectPanel','resizeProduct']);
 const functions=[];
 function visit(n){if(ts.isFunctionDeclaration(n)&&names.has(n.name?.text))functions.push(n.getText(ast));ts.forEachChild(n,visit);}visit(ast);
 assert.equal(functions.length,names.size);
 productFunctions=ts.transpileModule(functions.join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
});

// Exercise the production selection, layout and resize functions together. The
// fixture supplies measured browser geometry, not a second navigation algorithm.
function productFixture({width=1361,height=916,count=3,index=1}={}) {
 const events=[];const pending=new Map();let nextFrame=0;
 class Element {
  constructor(){this.attrs=new Map();this.style={setProperty(){}};this.inert=false;this.classes=new Set();this.classList={add:(...names)=>names.forEach(n=>this.classes.add(n)),remove:(...names)=>names.forEach(n=>this.classes.delete(n)),toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};}
  setAttribute(name,value){this.attrs.set(name,String(value));}
  removeAttribute(name){this.attrs.delete(name);}
  toggleAttribute(name,on){if(on)this.setAttribute(name,'');else this.removeAttribute(name);if(name==='inert')this.inert=on;}
  contains(element){return element===this;}
  focus(){document.activeElement=this;}
 }
 const document={activeElement:null,documentElement:new Element()};
 const sec=new Element(),rail=new Element(),choice=new Element(),heading=new Element();heading.offsetHeight=80;
 const stage={matches:width>900&&height>=480};
 let context;
 rail.scrollLeft=0;rail.getBoundingClientRect=()=>({left:24});rail.scrollTo=({left})=>{rail.scrollLeft=left;};
 const panels=Array.from({length:count},()=>new Element()),tabs=panels.map(()=>new Element());
 panels.forEach((panel,i)=>{
  const copy=new Element(),media=new Element();copy.offsetHeight=280;media.offsetHeight=480;
  Object.defineProperty(panel,'offsetLeft',{get:()=>i*(context?.innerWidth||width)});
  panel.getBoundingClientRect=()=>({left:24+panel.offsetLeft-rail.scrollLeft});
  panel.querySelector=selector=>selector==='[data-eng-context]'?copy:media;
  panel.querySelectorAll=()=>[copy,media];panel.closest=()=>panel;
  panel.contains=element=>element===panel||element===copy||element===media;
  copy.closest=media.closest=()=>panel;
 });
 sec.querySelector=selector=>selector==='[data-story-rail]'?rail:selector==='.chapter-heading'?heading:null;
 sec.getBoundingClientRect=()=>({top:1000-window.scrollY});
 Object.defineProperty(sec,'offsetHeight',{get:()=>stage.matches?count*(context.innerHeight-80)-(count-1)*65:900});
 const window={innerHeight:height,scrollY:0,chStory:{current:()=>({y:window.scrollY,els:[sec],part:0})},
  scrollTo:({top})=>{window.scrollY=top;},dispatchEvent:event=>events.push(event)};
 context={sec,panels,tabs,choice,stage,window,document,innerWidth:width,innerHeight:height,shown:-1,frame:0,layoutFrame:0,railDriven:false,settlePending:false,settleTimer:0,clearTimeout(){},activeSection:true,
  getComputedStyle:()=>({getPropertyValue:()=>80,marginBottom:'0',paddingTop:'0',paddingBottom:'0',rowGap:'16'}),
  requestAnimationFrame:callback=>{pending.set(++nextFrame,callback);return nextFrame;},cancelAnimationFrame:id=>pending.delete(id),
  CustomEvent:class {constructor(type,init){this.type=type;this.detail=init.detail;}}};
 runInNewContext(`${productFunctions}\nthis.api={show,update,selectPanel,resizeProduct};`,context);
 context.api.show(index);context.api.selectPanel(index);
 function flush(){for(let attempts=0;pending.size&&attempts<10;attempts++){const work=[...pending];pending.clear();for(const [,callback] of work)callback();}assert.equal(pending.size,0);}
 flush();events.length=0;
 return {context,sec,panels,tabs,choice,window,events,flush,
  resize(nextWidth,nextHeight){context.innerWidth=nextWidth;context.innerHeight=window.innerHeight=nextHeight;stage.matches=nextWidth>900&&nextHeight>=480;context.api.resizeProduct();},
  assertSelected(expected){assert.equal(context.shown,expected);assert.equal(sec.attrs.get('data-i'),String(expected));assert.equal(choice.value,String(expected));tabs.forEach((tab,i)=>assert.equal(tab.attrs.get('aria-selected'),String(i===expected)));panels.forEach((panel,i)=>assert.equal(panel.inert,i!==expected));},
 };
}

test('desktop Calendar survives tablet resize with its panel, tab and destination owner aligned',()=>{
 const fixture=productFixture({count:2,index:1});
 fixture.resize(788,872);fixture.flush();fixture.assertSelected(1);
 assert.equal(fixture.events.at(-1).detail.anchor.anchor,fixture.panels[1]);
 assert.equal(fixture.events.at(-1).detail.anchor.els[0],fixture.sec);
});

test('phone product survives a return to the matching desktop stop',()=>{
 const fixture=productFixture({width:390,height:844,count:4,index:2});
 fixture.resize(1361,916);fixture.flush();fixture.context.api.update();fixture.assertSelected(2);
 assert.equal(fixture.events.find(event=>event.detail.anchor)?.detail.anchor.anchor,fixture.panels[2]);
});

test('portrait and landscape resizes retain each selected product at both rail widths',()=>{
 for(const count of [2,3,4])for(let index=0;index<count;index++){
  const fixture=productFixture({width:390,height:844,count,index});
  fixture.resize(844,390);fixture.flush();fixture.context.api.update();fixture.assertSelected(index);
  fixture.resize(390,844);fixture.flush();fixture.context.api.update();fixture.assertSelected(index);
 }
});

test('queued scroll work from before resize cannot reset the selected product',()=>{
 const fixture=productFixture({count:4,index:3});
 fixture.context.frame=fixture.context.requestAnimationFrame(()=>fixture.context.api.show(0));
 fixture.resize(788,872);fixture.flush();fixture.assertSelected(3);
});

test('new product navigation after resize is not rewound by remaining layout callbacks',()=>{
 const fixture=productFixture({count:3,index:1});
 fixture.resize(788,872);
 const fitCount=fixture.events.length;
 fixture.context.api.selectPanel(2);fixture.flush();fixture.assertSelected(2);
 assert.ok(fixture.events.slice(fitCount).every(event=>!event.detail.anchor),'Old resize anchors must not remain queued after a newer selection');
 fixture.context.api.selectPanel(1);fixture.flush();fixture.assertSelected(1);
 fixture.context.api.selectPanel(0);fixture.flush();fixture.assertSelected(0);
});

test('combined and split scene round trips restore every product in both directions',()=>{
 for(const count of [2,3,4])for(let index=0;index<count;index++){
  const panels=Array.from({length:count},()=>({closest(){return this;},contains(){return false;}}));
  const owner={querySelector:()=>({}),querySelectorAll:()=>panels,contains:()=>false};
  const desktop=panels.map((panel,i)=>({y:i*600,els:[owner],part:i,anchor:panel}));
  const narrow=[{y:300,els:[owner],part:0}];
  const context={list:narrow,document:{activeElement:null},HTMLElement:class{},getComputedStyle:()=>({position:'static'}),matchMedia:()=>({matches:false})};
  runInNewContext(`${source}\nthis.relocate=relocated;`,context);
  const collapsed=context.relocate(desktop[index]);
  context.list=desktop;context.getComputedStyle=()=>({position:'sticky'});context.matchMedia=()=>({matches:true});
  const restored=context.relocate(collapsed);
  assert.equal(restored,desktop[index]);assert.equal(restored.anchor,panels[index]);
 }
});

test('tablet sticky styling does not map a desktop product number onto a mobile reading-scene number',()=>{
 const panel={closest(){return this;},contains:scene=>scenes.includes(scene)};
 const scenes=[0,1].map(()=>({contains:()=>false}));
 const owner={querySelector:()=>({}),querySelectorAll:()=>[{},panel],contains:()=>false};
 const frames=scenes.map((scene,i)=>({y:1000+i*790,els:[owner],part:i,scene}));
 const context={list:frames,document:{activeElement:null},HTMLElement:class{},getComputedStyle:()=>({position:'sticky'}),matchMedia:()=>({matches:false})};
 runInNewContext(`${source}\nthis.relocate=relocated;`,context);
 assert.equal(context.relocate({y:3000,els:[owner],part:1,anchor:panel}),frames[0], 'Calendar index 1 is not permission to hide its copy and begin at mobile media scene 1');
});

test('natural-size measurement realigns the selected rail after browser scroll-snap resets it',()=>{
 const fixture=productFixture({count:2,index:1});
 const rail=fixture.sec.querySelector('[data-story-rail]');
 const media=fixture.panels[1].querySelector('[data-eng-view]');
 Object.defineProperty(media,'offsetHeight',{get(){rail.scrollLeft=0;return 480;}});
 fixture.resize(786,872);fixture.flush();
 assert.equal(fixture.panels[1].getBoundingClientRect().left,rail.getBoundingClientRect().left,'The selected Calendar panel must be inside the viewport after measuring its new height');
});

test('generic horizontal rail navigation skips product panels but still owns example rails',()=>{
 const ast=ts.createSourceFile('pages_home6.ts',readFileSync('src/scripts/pages_home6.ts','utf8'),ts.ScriptTarget.Latest,true);
 let callback;
 function visit(node){
  if(ts.isCallExpression(node)&&node.expression.getText(ast).endsWith('.forEach')&&node.arguments[0]?.getText(ast).startsWith('function (rail)'))callback=node.arguments[0].getText(ast);
  ts.forEachChild(node,visit);
 }
 visit(ast);assert.ok(callback);
 let inspected=0;
 const context={htmlChildren:()=>{inspected++;return [];}};
 runInNewContext(ts.transpileModule(`this.attachRail=${callback};`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,context);
 const rail=product=>({querySelector:()=>product?{}:null,classList:{contains:()=>false},hasAttribute:()=>false});
 context.attachRail(rail(true));
 assert.equal(inspected,0,'Horizontal arrow/keyboard handlers must not be installed on the product selector rail');
 context.attachRail(rail(false));
 assert.equal(inspected,1,'Ordinary horizontal example rails retain their controller');
});

test('restoring a dismissed menu retains the exact narrow media reading scene and part',()=>{
 const panel={closest(){return this;},contains:scene=>scenes.includes(scene)};
 const scenes=[0,1].map(()=>({closest:()=>panel,contains:()=>false}));
 const owner={querySelector:()=>({}),querySelectorAll:()=>[panel,{}],contains:()=>false};
 const frames=[{y:1000,els:[owner],part:0,scene:scenes[0],scenePart:0},
  {y:1400,els:[owner],part:1,scene:scenes[1],scenePart:0},
  {y:1700,els:[owner],part:2,scene:scenes[1],scenePart:1}];
 class Element{}
 const context={list:frames,document:{activeElement:new Element()},HTMLElement:Element,getComputedStyle:()=>({position:'sticky'}),matchMedia:()=>({matches:false})};
 runInNewContext(`${source}\nthis.relocate=relocated;`,context);
 for(const saved of frames.slice(1)){
  const restored=context.relocate({...saved,anchor:panel});
  assert.equal(restored,saved);assert.equal(restored.scene,scenes[1]);assert.equal(restored.scenePart,saved.scenePart);
 }
});
