import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const ast = ts.createSourceFile('base.ts', readFileSync('src/scripts/base.ts', 'utf8'), ts.ScriptTarget.Latest, true);
let loader;
(function visit(node) {
  if (ts.isFunctionDeclaration(node) && node.name?.text === 'frame') loader = node.getText(ast);
  ts.forEachChild(node, visit);
})(ast);
assert.ok(loader, 'the tabbed live-frame loader exists');
const code = ts.transpileModule(loader, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;

function setup() {
  const timers = new Map();
  let sequence = 0;
  let now = 0;
  const state = { retry: false, warnings: 0, loaded: false, clearCount: 0 };
  const body = {
    children: [],
    contains(node) { return this.children.includes(node); },
    replaceChildren(...children) { this.children = children; },
  };
  const doc = {
    createElement(tagName) {
      const listeners = new Map();
      return {
        tagName, style: {}, attrs: {},
        setAttribute(name, value) { this.attrs[name] = value; },
        addEventListener(type, callback) { listeners.set(type, callback); },
        emit(type) { listeners.get(type)?.(); },
        set src(value) {
          assert.ok(listeners.has('load') && listeners.has('error'), 'handlers precede navigation');
          this.url = value;
        },
      };
    },
  };
  const context = {
    doc, body, loaded: false, frameTimeout: undefined, freshDocumentUrl: source => source,
    current: { getAttribute: () => 'https://example.org/partner', textContent: 'Partner page' },
    clearWait() { state.retry = false; state.clearCount++; body.children = body.children.filter(node => node.tagName !== 'span'); },
    slowWait() { state.retry = true; state.warnings++; },
    window: {
      setTimeout(callback, delay) { const id = ++sequence; timers.set(id, { callback, at: now + delay }); return id; },
      clearTimeout(id) { timers.delete(id); },
    },
  };
  runInNewContext(`${code}\nthis.loadFrame = frame;`, context);
  function advance(ms) {
    now += ms;
    for (const [id, job] of timers) if (job.at <= now) { timers.delete(id); job.callback(); }
  }
  function load() { context.loadFrame(); return body.children.find(node => node.tagName === 'iframe'); }
  return { load, advance, state, timers, body };
}

test('a successfully loaded tabbed frame stays live after the old timeout deadline', () => {
  const x = setup();
  const frame = x.load();
  assert.equal(frame.loading, 'eager');
  frame.emit('load');
  x.advance(15000);
  assert.equal(x.state.retry, false);
  assert.equal(x.state.warnings, 0);
  assert.equal(x.timers.size, 0);
});

test('a genuinely slow frame can recover when its load finally arrives', () => {
  const x = setup();
  const frame = x.load();
  x.advance(12000);
  assert.equal(x.state.retry, true);
  frame.emit('load');
  assert.equal(x.state.retry, false);
});

test('switching tabs cancels the old wait and an old load cannot clear the new wait', () => {
  const x = setup();
  const first = x.load();
  x.advance(6000);
  x.load();
  assert.equal(x.timers.size, 1);
  const clears = x.state.clearCount;
  first.emit('load');
  assert.equal(x.state.clearCount, clears);
  x.advance(6000);
  assert.equal(x.state.warnings, 0);
  x.advance(6000);
  assert.equal(x.state.warnings, 1);
});

test('retry clears the fallback immediately and an error cancels its pending timeout', () => {
  const x = setup();
  x.load().emit('error');
  assert.equal(x.state.retry, true);
  assert.equal(x.timers.size, 0);
  x.load();
  assert.equal(x.state.retry, false);
  assert.equal(x.timers.size, 1);
});
