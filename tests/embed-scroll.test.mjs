import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync('src/scripts/ui/embed-scroll.ts', 'utf8');
const code = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022}}).outputText;
const { reportedEmbedHeight, hasEmbedOverflow, fittedEmbedSize } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

test('only usable source heights permit transferring native iframe scrolling to its parent', () => {
  for (const value of [null, undefined, '', ' ', true, {}, [], 0, -1, NaN, Infinity, 'NaN', 100001])
    assert.equal(reportedEmbedHeight(value), null, String(value));
  assert.equal(reportedEmbedHeight('1234.2'), 1235);
  assert.equal(reportedEmbedHeight(8000), 8000);
  assert.equal(reportedEmbedHeight(12000), 12000, 'long pages remain reachable instead of truncating at the old limit');
});

test('fixed displays and hidden regions never claim to have parent scrolling', () => {
  assert.equal(hasEmbedOverflow(500, 500), false);
  assert.equal(hasEmbedOverflow(500, 499), false);
  assert.equal(hasEmbedOverflow(1000, 0), false);
  assert.equal(hasEmbedOverflow(1000, 400), true);
});

test('phone canvas height matches the visible scaled frame without blank overflow', () => {
  assert.deepEqual(fittedEmbedSize(286, 1100, 1500), {width: 1100, scale: .26, height: 390});
  assert.deepEqual(fittedEmbedSize(572, 1100, 1500), {width: 1100, scale: .52, height: 780});
  assert.deepEqual(fittedEmbedSize(1200, 1100, 1500), {width: 1200, scale: 1, height: 1500});
  assert.deepEqual(fittedEmbedSize(286, 0, 1500), {width: 286, scale: 1, height: 1500});
});

function liveFrameFixture({ zoom = true } = {}) {
  const properties = () => {
    const values = new Map(), priorities = new Map();
    return {
      getPropertyValue: name => values.get(name) || '',
      getPropertyPriority: name => priorities.get(name) || '',
      setProperty: (name, value, priority) => { values.set(name, value); priorities.set(name, priority); },
    };
  };
  const listeners = new Map();
  const attributes = new Map([['src', 'https://example.org/dashboard']]);
  const region = {clientWidth:286, clientHeight:400, style:properties(), classList:{add() {}}};
  const context = {session:'retained', scrollTop:123};
  const noMove = () => { throw new Error('A loaded frame must not be reparented or replaced'); };
  const frame = {
    contentWindow:context, parentElement:region, style:properties(), offsetWidth:1100,
    get src() { return attributes.get('src'); },
    set src(_value) { throw new Error('Resize must never navigate a loaded iframe'); },
    hasAttribute:name => attributes.has(name), getAttribute:name => attributes.get(name),
    setAttribute:(name, value) => attributes.set(name, value), closest:() => region,
    before:noMove, after:noMove, remove:noMove, replaceWith:noMove,
  };
  region.append = noMove;
  region.replaceChildren = noMove;
  let present = true;
  const main = {querySelectorAll:() => present ? [frame] : [], contains:() => present, addEventListener() {}};
  const sandbox = {
    exports:{}, URL, location:{href:'https://host.example/'},
    CSS:{supports:() => zoom},
    window:{addEventListener:(name, fn) => listeners.set(name, fn)},
    document:{getElementById:() => main, querySelectorAll() {}, createElement:noMove},
    requestAnimationFrame:() => 1,
    getComputedStyle:() => ({transform:'matrix(0.26, 0, 0, 0.26, 0, 0)'}),
    DOMMatrixReadOnly:class { a=.26; },
    ResizeObserver:class {observe() {}}, MutationObserver:class {observe() {}},
  };
  const runtime = ts.transpileModule(source, {compilerOptions:{target:ts.ScriptTarget.ES2022, module:ts.ModuleKind.CommonJS}}).outputText;
  runInNewContext(runtime, sandbox);
  sandbox.exports.initEmbedScroll();
  const report = (overrides={}) => listeners.get('message')({source:context, origin:'https://example.org', data:{messageType:'content-resize',height:1500}, ...overrides});
  return {frame, region, context, report, remove:() => {present=false;}};
}

test('authenticated resize retains iframe identity, source and browsing context without any DOM move', () => {
  const x = liveFrameFixture();
  x.report();
  assert.equal(x.frame.parentElement, x.region);
  assert.equal(x.frame.contentWindow, x.context);
  assert.equal(x.frame.contentWindow.session, 'retained');
  assert.equal(x.frame.contentWindow.scrollTop, 123);
  assert.equal(x.frame.getAttribute('src'), 'https://example.org/dashboard');
  assert.equal(x.frame.style.getPropertyValue('height'), '1500px');
  assert.equal(x.frame.style.getPropertyValue('zoom'), '0.26');
  assert.equal(x.frame.style.getPropertyValue('transform'), 'none');
  assert.equal(x.frame.getAttribute('scrolling'), 'no');
  x.report({data:{messageType:'content-resize',height:1800}});
  assert.equal(x.frame.style.getPropertyValue('height'), '1800px');
});

test('untrusted, detached and unsupported frames retain native scrolling', () => {
  const x = liveFrameFixture();
  x.report({origin:'https://unrelated.example'});
  x.report({source:{}});
  assert.equal(x.frame.hasAttribute('scrolling'), false);
  x.remove();
  x.report();
  assert.equal(x.frame.hasAttribute('scrolling'), false);
  const older = liveFrameFixture({zoom:false});
  older.report();
  assert.equal(older.frame.hasAttribute('scrolling'), false);
  assert.equal(older.frame.hasAttribute('data-embed-measured-frame'), false);
});

test('a scaled frame crossing the overflow threshold settles without reclaiming its gutter', () => {
  const attributes = () => {
    const values = new Map();
    return {
      hasAttribute: name => values.has(name), getAttribute: name => values.get(name),
      setAttribute: (name, value) => values.set(name, value),
      toggleAttribute: (name, force) => force ? values.set(name, '') : values.delete(name),
    };
  };
  const classList = () => {
    const names = new Set();
    return {add: name => names.add(name), contains: name => names.has(name),
      toggle: (name, force) => force ? names.add(name) : names.delete(name)};
  };
  const style = () => {
    const values = new Map();
    return {getPropertyValue: name => values.get(name) || '', getPropertyPriority: () => 'important',
      setProperty: (name, value) => values.set(name, value)};
  };
  const parent = {...attributes(), classList:classList()};
  const region = {
    ...attributes(), classList:classList(), style:style(), parentElement:parent,
    get clientWidth() { return this.hasAttribute('data-embed-scroll-reserved') ? 676 : 800; },
    clientHeight:470,
    get scrollHeight() {
      const height = Number.parseFloat(frame.style.getPropertyValue('height')) || 800;
      const zoom = Number(frame.style.getPropertyValue('zoom')) || this.clientWidth / 1280;
      return Math.max(this.clientHeight, Math.ceil(height * zoom));
    },
    querySelector: () => frame, closest: () => null,
  };
  const frame = {...attributes(), style:style(), offsetWidth:1280, title:'Live dashboard',
    contentWindow:{}, closest:() => region, parentElement:region};
  frame.setAttribute('src', 'https://example.org/dashboard');
  region.children = [frame]; parent.children = [region];
  const main = {
    querySelectorAll: selector => selector.includes(' iframe') ? [frame] : [region],
    contains: () => true, addEventListener() {},
  };
  const listeners = new Map(), events = [], pending = new Map();
  let next = 0, resize, observerOptions;
  const sandbox = {
    exports:{}, URL, Event, location:{href:'https://host.example/'}, CSS:{supports:() => true},
    window:{addEventListener:(name, fn) => listeners.set(name, fn), dispatchEvent:event => events.push(event.type)},
    document:{getElementById:() => main, querySelectorAll() {}, createElement() {}},
    requestAnimationFrame:fn => {pending.set(++next, fn); return next;},
    getComputedStyle:() => ({transform:'matrix(0.625, 0, 0, 0.625, 0, 0)', overflowY:'auto'}),
    DOMMatrixReadOnly:class {a=.625;},
    ResizeObserver:class {constructor(callback) {resize=callback;} observe() {}},
    MutationObserver:class {observe(_target, options) {observerOptions=options;}},
  };
  const runtime = ts.transpileModule(source, {compilerOptions:{target:ts.ScriptTarget.ES2022, module:ts.ModuleKind.CommonJS}}).outputText;
  runInNewContext(runtime, sandbox);
  sandbox.exports.initEmbedScroll();
  listeners.get('message')({source:frame.contentWindow, origin:'https://example.org',
    data:{messageType:'content-resize',height:800}});
  const widths = [];
  // A ResizeObserver delivery follows each layout pass. Before the fix this
  // geometry alternates 800/676 forever (500px tall / 423px tall in a 470px box).
  for (let pass=0; pass<8; pass++) {
    const callbacks = [...pending.values()]; pending.clear();
    callbacks.forEach(callback => callback());
    widths.push(region.clientWidth);
    resize();
  }
  assert.deepEqual(widths, Array(8).fill(676));
  assert.equal(region.hasAttribute('data-embed-scroll-reserved'), true);
  assert.equal(parent.classList.contains('embed-scroll-shell'), true);
  assert.equal(region.classList.contains('embed-scroll-region'), true);
  assert.equal(region.hasAttribute('data-embed-scroll'), false, 'active scrolling tracks real overflow separately');
  assert.equal(region.scrollHeight, region.clientHeight, 'no artificial overflow is introduced to justify the gutter');
  assert.equal(events.filter(name => name === 'ch:embed-scrollchange').length, 2, 'activation and actual-fit updates settle');
  assert.deepEqual(Array.from(observerOptions.attributeFilter), ['hidden', 'inert', 'src']);
});
