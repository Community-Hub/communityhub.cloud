import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const ast = ts.createSourceFile('pages_home6.ts', readFileSync('src/scripts/pages_home6.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const functions = [];
let ownerFunction;
let releaseRegistration;
(function visit(node) {
  if (ts.isFunctionDeclaration(node) && ['handleFrameScroll', 'releaseFrameScroll'].includes(node.name?.text)) functions.push(node.getText(ast));
  if (ts.isFunctionDeclaration(node) && node.name?.text === 'iframeOwnsScroll') ownerFunction = node.getText(ast);
  if (ts.isExpressionStatement(node) && node.getText(ast).includes('.forEach(event =>') && node.getText(ast).includes('window.addEventListener(event, releaseFrameScroll')) releaseRegistration = node.getText(ast);
  ts.forEachChild(node, visit);
})(ast);
assert.equal(functions.length, 2);
const compile = source => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
const gesture = compile(readFileSync('src/scripts/ui/wheel-gesture.ts', 'utf8').replace(/export /g, ''));

function controller(start = 0) {
  let now = 1000;
  const cuts = [];
  const steps = [];
  const stops = [0, 720, 1440, 2160].map(y => ({ y }));
  const context = {
    performance: { now: () => now }, window: { scrollY: start }, stops,
    activeFrame: stops.find(frame => frame.y === start),
    frameScroll: null, frameScrollBypassUntil: 0,
    dirty: false, initialHashPending: false,
    blocked: () => false, iframeOwnsScroll: () => true,
    cutTo(y) { context.window.scrollY = y; context.activeFrame = stops.find(frame => frame.y === y); cuts.push(y); },
    go(direction) {
      const index = stops.findIndex(frame => frame.y === context.window.scrollY);
      const target = stops[index + direction];
      if (!target) return false;
      steps.push(direction); context.cutTo(target.y); return true;
    },
  };
  runInNewContext(`${gesture}\nconst frameWheelGesture = new WheelGesture();\n${compile(functions.join('\n'))}\nthis.handle = handleFrameScroll; this.release = releaseFrameScroll;`, context);
  return {
    context, cuts, steps,
    move(delta, delay = 0) { now += delay; context.window.scrollY += delta; return context.handle(); },
    advance(ms) { now += ms; },
  };
}

test('document movement from an iframe cuts on its first sample and does not recurse', () => {
  const c = controller();
  assert.equal(c.move(4), true);
  assert.equal(c.context.window.scrollY, 720);
  assert.deepEqual(c.steps, [1]);
  assert.equal(c.context.handle(), false, 'the scroll event from our instant cut is not another gesture');
});

test('chained native momentum holds one destination, with a fresh stroke after a quiet gap', () => {
  const c = controller(); c.move(4);
  for (const delta of [55, 30, 12, 4, 1.5]) c.move(delta, 70);
  assert.equal(c.context.window.scrollY, 720);
  assert.deepEqual(c.steps, [1]);
  c.move(4, 400);
  assert.equal(c.context.window.scrollY, 1440);
  assert.deepEqual(c.steps, [1, 1]);
});

test('a deliberate reversal exits in the opposite direction and boundaries do not trap it', () => {
  const c = controller(1440);
  c.move(4);
  assert.equal(c.context.window.scrollY, 2160);
  c.move(-90, 100);
  assert.equal(c.context.window.scrollY, 1440);
  assert.deepEqual(c.steps, [1, -1]);
});

test('inner iframe or parent-region scrolling leaves the document and scene untouched', () => {
  const c = controller(720);
  assert.equal(c.context.handle(), false);
  assert.deepEqual(c.cuts, []);
});

test('unowned direct scrolling and exact stop destinations keep their chosen positions', () => {
  const c = controller();
  c.context.iframeOwnsScroll = () => false;
  assert.equal(c.move(140), false);
  assert.equal(c.context.window.scrollY, 140);
  c.context.iframeOwnsScroll = () => true;
  c.context.window.scrollY = 1440;
  assert.equal(c.context.handle(), false);
  assert.deepEqual(c.cuts, []);
});

test('browser navigation, explicit parent input and resize release old frame momentum', () => {
  for (const type of ['pointerdown', 'keydown', 'wheel', 'touchstart', 'hashchange', 'popstate', 'resize']) {
    const c = controller(); c.move(4);
    c.context.release({ type });
    assert.equal(c.move(140, 10), false, type);
    assert.equal(c.context.window.scrollY, 860, type);
  }
});

test('pending startup anchors, layout and overlays preserve their existing owners', () => {
  for (const flag of ['dirty', 'initialHashPending', 'blocked']) {
    const c = controller();
    c.context[flag] = flag === 'blocked' ? () => true : true;
    assert.equal(c.move(80), false, flag);
    assert.deepEqual(c.cuts, []);
  }
});

test('an asynchronous content refit cannot release the iframe gesture into a sliding page', () => {
  const c = controller(); c.move(4);
  const listeners = new Map();
  c.context.window.addEventListener = (type, callback) => listeners.set(type, callback);
  runInNewContext(compile(releaseRegistration), c.context);
  c.advance(70);
  listeners.get('ch:fit')?.();
  assert.equal(c.context.frameScrollBypassUntil, 0);
  assert.equal(c.move(65), true);
  assert.equal(c.context.window.scrollY, 720);
  assert.deepEqual(c.steps, [1]);
  assert.ok(listeners.has('resize') && listeners.has('popstate'), 'explicit browser navigation retains its release handlers');
});

test('hover or iframe focus establishes ownership only inside the visible active scene', () => {
  class Frame { closest() { return this.hidden ? {} : null; } }
  const frame = new Frame();
  let hovered = frame;
  let contained = true;
  const context = {
    HTMLIFrameElement: Frame, allowFrameFocus: true,
    main: { querySelector: () => hovered },
    document: { activeElement: null },
    activeFrame: { els: [{ contains: () => contained }] },
  };
  runInNewContext(`${compile(ownerFunction)}\nthis.owns = iframeOwnsScroll;`, context);
  assert.equal(context.owns(), true, 'hover works even when BODY retains focus');
  hovered = null;
  assert.equal(context.owns(), false, 'a coordinate-only tool scroll supplies no ownership signal');
  context.document.activeElement = frame;
  assert.equal(context.owns(), true);
  context.allowFrameFocus = false;
  assert.equal(context.owns(), false, 'parent direct input can release stale frame focus');
  context.allowFrameFocus = true;
  contained = false;
  assert.equal(context.owns(), false, 'a prior scene cannot start another cut');
  contained = true; frame.hidden = true;
  assert.equal(context.owns(), false);
});
