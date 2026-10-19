import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

let goSource, wheelSource, gestureSource, touchSources = {};
before(() => {
  // Parse the actual controller and compile its two decision boundaries in
  // memory. No browser, production build or generated runtime is needed.
  const source = ts.createSourceFile('pages_home6.ts', readFileSync('src/scripts/pages_home6.ts', 'utf8'), ts.ScriptTarget.Latest, true);
  let go, wheel;
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'go') go = node.getText(source);
    if (ts.isCallExpression(node) && node.expression.getText(source) === 'window.addEventListener' &&
        ts.isStringLiteral(node.arguments[0]) && node.arguments[0].text === 'wheel') wheel = node.arguments[1].getText(source);
    if (ts.isCallExpression(node) && node.expression.getText(source) === 'window.addEventListener' &&
        ts.isStringLiteral(node.arguments[0]) && ['touchstart','touchmove'].includes(node.arguments[0].text))
      touchSources[node.arguments[0].text] = node.arguments[1].getText(source);
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(go && wheel, 'The production navigation and wheel handlers must exist');
  const compile = text => ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
  gestureSource = compile(readFileSync("src/scripts/ui/wheel-gesture.ts", "utf8").replace(/export /g, ""));
  for (const key of Object.keys(touchSources)) touchSources[key] = compile(`this.${key} = ${touchSources[key]};`);
  goSource = compile(go);
  wheelSource = compile(`const handleWheel = ${wheel};`);
});

function controller() {
  let now = 1000;
  let stops = [0, 720, 1440, 2160].map((y, index) => ({ y, els: [{ id: `scene-${index}` }] }));
  let pendingMeasure = null;
  const cuts = [];
  const window = { scrollY: 0, innerHeight: 800, dispatchEvent() {} };
  const context = {
    window, performance: { now: () => now }, touch: null, controls: 'input', 
    home: null, NEAR: 24, publicRequest: null, initialHashPending: false,
    blocked: () => false, productBoundary: () => null,
    current: () => stops.reduce((best, frame) => Math.abs(frame.y - window.scrollY) < Math.abs(best.y - window.scrollY) ? frame : best),
    frames: () => { if (pendingMeasure) { const measure = pendingMeasure; pendingMeasure = null; measure(); } return stops; },
    // cutTo's side effect is the browser's instant position change. Decision
    // logic, coalescing and wheel ownership are the production functions above.
    cutTo: y => { window.scrollY = y; cuts.push(y); context.publicRequest = null; },
    cancel: () => { context.publicRequest = null; },
    eventElement: event => event.target,
    innerScroller: target => !!target?.canScroll,
    horizontalScroller: target => !!target?.canScrollX,
    headerHeight: 80,
  };
  runInNewContext(`${gestureSource}\nconst wheelGesture = new WheelGesture(); function resetGesture() { wheelGesture.reset(); }\n${goSource}\n${wheelSource}\n${touchSources.touchstart}\n${touchSources.touchmove}\nthis.go = go; this.wheel = handleWheel;`, context);
  return {
    window, context, cuts,
    go: (...args) => context.go(...args),
    advance: ms => { now += ms; },
    pendingLayout: (positions, relocatedY) => {
      pendingMeasure = () => {
        stops = positions.map((y, index) => ({ ...stops[index], y }));
        window.scrollY = relocatedY;
      };
    },
    wheel: ({ delay = 0, deltaY = 90, target = null, ...options } = {}) => {
      now += delay;
      const event = { timeStamp: now, deltaY, deltaX: 0, deltaMode: 0, target,
        defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...options };
      context.wheel(event);
      return event;
    },
  };
}

test('downward navigation uses the relocated scene position after pending layout', () => {
  const c = controller(); c.window.scrollY = 720;
  c.pendingLayout([0, 900, 1620, 2340], 900);
  c.go(1, true);
  assert.deepEqual(c.cuts, [1620], 'The gesture must leave the remeasured current scene, not land on it again');
});

test('upward navigation uses the relocated scene position after pending layout', () => {
  const c = controller(); c.window.scrollY = 1440;
  c.pendingLayout([0, 540, 1260, 1980], 1260);
  c.go(-1, true);
  assert.deepEqual(c.cuts, [540], 'A shorter earlier scene must not turn Back into a dead gesture');
});

test('a consumed wheel tail cannot begin scrolling a newly revealed nested control', () => {
  const c = controller();
  assert.equal(c.wheel().defaultPrevented, true);
  assert.equal(c.window.scrollY, 720);
  const tail = c.wheel({ delay: 40, deltaY: 50, target: { canScroll: true } });
  assert.equal(tail.defaultPrevented, true, 'The remainder of the page gesture still belongs to that page gesture');
  assert.deepEqual(c.cuts, [720]);
});

test('fresh input over a nested control remains native after the page latch expires', () => {
  const c = controller(); c.wheel();
  const fresh = c.wheel({ delay: 600, target: { canScroll: true } });
  assert.equal(fresh.defaultPrevented, false);
  assert.deepEqual(c.cuts, [720]);
});

test('a nested gesture retains its tail at the boundary then hands a fresh gesture to the page', () => {
  const c = controller();
  assert.equal(c.wheel({ target: { canScroll: true } }).defaultPrevented, false);
  assert.equal(c.wheel({ delay: 40, target: { canScroll: false } }).defaultPrevented, true);
  assert.deepEqual(c.cuts, []);
  assert.equal(c.wheel({ delay: 600, target: { canScroll: false } }).defaultPrevented, true);
  assert.deepEqual(c.cuts, [720]);
});

test('long inertia and small direction noise still yield one cut per gesture', () => {
  const c = controller();
  for (const [delay, deltaY] of [[0, 90], [80, 60], [160, 40], [120, 10], [100, -2], [100, 30]]) {
    assert.equal(c.wheel({ delay, deltaY }).defaultPrevented, true);
  }
  assert.deepEqual(c.cuts, [720]);
  c.wheel({ delay: 600, deltaY: -90 });
  assert.deepEqual(c.cuts, [720, 0]);
});

test('zoom, pure horizontal wheel and already handled input keep their native ownership', () => {
  const c = controller();
  for (const options of [{ ctrlKey: true }, { deltaX: 120, deltaY: 0 }, { shiftKey: true }]) {
    assert.equal(c.wheel(options).defaultPrevented, false);
  }
  c.wheel({ defaultPrevented: true });
  assert.deepEqual(c.cuts, []);
});

test('diagonal trackpad gestures over ordinary content cut instead of smoothly drifting', () => {
  const c = controller();
  assert.equal(c.wheel({ deltaX: 120, deltaY: 90 }).defaultPrevented, true);
  assert.deepEqual(c.cuts, [720]);
  assert.equal(c.wheel({ delay: 300, deltaX: -120, deltaY: -90 }).defaultPrevented, true);
  assert.deepEqual(c.cuts, [720, 0]);
});

test('a horizontal rail retains a horizontal-dominant diagonal gesture', () => {
  const c = controller();
  const event = c.wheel({ deltaX: 120, deltaY: 90, target: { canScrollX: true } });
  assert.equal(event.defaultPrevented, false);
  assert.deepEqual(c.cuts, []);
});

test('diagonal gestures still scroll an overflowing embedded region natively', () => {
  const c = controller();
  const event = c.wheel({ deltaX: 120, deltaY: 90, target: { canScroll: true } });
  assert.equal(event.defaultPrevented, false);
  assert.deepEqual(c.cuts, []);
});

test('public duplicate requests coalesce while intentional later gestures can continue', () => {
  const c = controller();
  c.go(1); c.advance(100); c.go(1);
  assert.deepEqual(c.cuts, [720]);
  c.go(1, true);
  assert.deepEqual(c.cuts, [720, 1440]);
});

test('a public scene advance releases any older pending startup hash', () => {
  const c = controller(); c.context.initialHashPending = true;
  c.go(1);
  assert.equal(c.context.initialHashPending, false);
  assert.deepEqual(c.cuts, [720]);
});

test('a blocked navigation request does not consume startup ownership', () => {
  const c = controller(); c.context.initialHashPending = true; c.context.blocked = () => true;
  assert.equal(c.go(1), false);
  assert.equal(c.context.initialHashPending, true);
  assert.deepEqual(c.cuts, []);
});


test('a strong deliberate reversal works without waiting for the old hold', () => {
  const c = controller(); c.wheel();
  c.wheel({ delay: 107, deltaY: -90 });
  assert.deepEqual(c.cuts, [720, 0]);
});

test('a fresh same-direction swipe after quiet input has no extra hold', () => {
  const c = controller(); c.wheel();
  c.wheel({ delay: 300, deltaY: 90 });
  assert.deepEqual(c.cuts, [720, 1440]);
});

test('an outward attempt at the final boundary never delays returning', () => {
  const c = controller(); c.window.scrollY = 2160;
  c.wheel(); c.wheel({ delay: 107, deltaY: -90 });
  assert.deepEqual(c.cuts, [1440]);
});

test('reversing native scrolling at its boundary can leave in the intended direction', () => {
  const c = controller(); c.window.scrollY = 1440;
  c.wheel({ deltaY: 90, target: { canScroll: true } });
  c.wheel({ delay: 107, deltaY: -90, target: { canScroll: false } });
  assert.deepEqual(c.cuts, [720]);
});

test('the recorded239ms gap within a continuing wheel stream does not skip a scene', () => {
  const c=controller(); c.wheel(); c.wheel({delay:239}); c.wheel({delay:98});
  assert.deepEqual(c.cuts,[720]);
});
test('subpixel input remains native inside the current scroll owner', () => {
  const c=controller(); const event=c.wheel({deltaY:.5,target:{canScroll:true}});
  assert.equal(event.defaultPrevented,false); assert.deepEqual(c.cuts,[]);
});
test('subpixel momentum keeps its timestamp and cannot manufacture a quiet gap', () => {
  const c=controller();c.wheel();
  for(let i=0;i<8;i++)c.wheel({delay:80,deltaY:.5});
  c.wheel({delay:80,deltaY:90});assert.deepEqual(c.cuts,[720]);
});

test('repeated deliberate reversals remain symmetric without a cooldown queue', () => {
  const c=controller();
  for(const direction of [1,-1,1,-1,1,-1]) c.wheel({delay:107,deltaY:direction*90});
  assert.deepEqual(c.cuts,[720,0,720,0,720,0]);
});
test('an outward attempt at the first boundary never delays entering the page', () => {
  const c=controller(); c.wheel({deltaY:-90}); c.wheel({delay:107,deltaY:90});
  assert.deepEqual(c.cuts,[720]);
});
test('line and page wheel units use the same intention threshold in both directions', () => {
  const c=controller(); c.wheel({deltaY:2,deltaMode:1});
  c.wheel({delay:300,deltaY:-1,deltaMode:2});
  assert.deepEqual(c.cuts,[720,0]);
});
test('queued input timestamps cannot be mistaken for fresh dispatch-time gestures', () => {
  const c=controller(); c.wheel({timeStamp:1000}); c.advance(2000);
  c.wheel({timeStamp:1060,deltaY:60}); c.wheel({timeStamp:1090,deltaY:20});
  assert.deepEqual(c.cuts,[720]);
});
test('a deliberate reversal within the native scrollable area remains native', () => {
  const c=controller();c.wheel({target:{canScroll:true}});
  assert.equal(c.wheel({delay:107,deltaY:-90,target:{canScroll:true}}).defaultPrevented,false);
  assert.deepEqual(c.cuts,[]);
});


function touchEvent(c, type, y, { x=300, id=1, target={closest:()=>null}, ...options }={}) {
  const event={touches:[{identifier:id,clientX:x,clientY:y}],target,cancelable:true,
    defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...options};
  c.context[type](event);return event;
}
test('separate fast touch strokes advance and reverse without sharing a wheel latch',()=>{
 const c=controller();
 for(const direction of [1,1,-1]) {
   touchEvent(c,'touchstart',500);touchEvent(c,'touchmove',500-direction*70);c.advance(100);
 }
 assert.deepEqual(c.cuts,[720,1440,720]);
});
test('one touch contact cannot advance twice even after reversing its direction',()=>{
 const c=controller();touchEvent(c,'touchstart',500);
 touchEvent(c,'touchmove',430);touchEvent(c,'touchmove',350);touchEvent(c,'touchmove',600);
 assert.deepEqual(c.cuts,[720]);
});
test('horizontal and native scrolling touches keep their original ownership',()=>{
 const c=controller();touchEvent(c,'touchstart',500);
 assert.equal(touchEvent(c,'touchmove',498,{x:340}).defaultPrevented,false);
 touchEvent(c,'touchstart',500,{target:{closest:()=>null,canScroll:true}});
 assert.equal(touchEvent(c,'touchmove',430).defaultPrevented,false);
 assert.deepEqual(c.cuts,[]);
});
test('pinch, changed contact and zoomed touch never move the outer story',()=>{
 const c=controller();touchEvent(c,'touchstart',500);
 touchEvent(c,'touchmove',400,{id:2});
 touchEvent(c,'touchstart',500);touchEvent(c,'touchmove',400,{touches:[{},{}]});
 c.window.visualViewport={scale:2};touchEvent(c,'touchstart',500);touchEvent(c,'touchmove',400);
 assert.deepEqual(c.cuts,[]);
});
