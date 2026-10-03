import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Exercise the actual isolated Oberlin-now controller, using a fake network and
// clock only. Extract by its stable component boundaries rather than copy logic.
const source = await readFile('src/scripts/base.ts', 'utf8');
const component = source.slice(source.indexOf('  /* ------ Oberlin now: hero strip ------ */'), source.indexOf('  /* ------ persistent dock visibility ------ */'));
const script = ts.transpileModule(component, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const order = [1021, 1019, 1033, 1030];
const flush = () => new Promise(resolve => setImmediate(resolve));
async function readings(initial = {}) {
  const element = () => ({ textContent: '', hidden: false, style: {}, attrs: new Map(), classList: { add() {}, remove() {}, toggle() {} }, setAttribute(n, v) { this.attrs.set(n, v); }, getAttribute(n) { return this.attrs.get(n); }, removeAttribute(n) { this.attrs.delete(n); } });
  const cells = order.map(id => { const c = element(); c.setAttribute('data-g', String(id)); c.number = element(); c.unit = element(); c.bar = element(); return c; });
  const now = element(), say = element(), time = element(), mood = element();
  let network = initial, clock = 0, sequence = 0;
  const tasks = new Map();
  function schedule(fn, delay, repeat = false) { const id = ++sequence; tasks.set(id, { at: clock + delay, fn, delay, repeat }); return id; }
  const $ = (selector, parent) => {
    if (parent && cells.includes(parent)) return selector === '[data-num]' ? parent.number : selector === '.cell-bar i' ? parent.bar : selector === 'small' ? parent.unit : null;
    return ({ '[data-now]': now, '[data-now-say]': say, '[data-now-time]': time, '[data-mood-word]': mood })[selector] || null;
  };
  runInNewContext(script, {
    $, $$: selector => selector === '.cell' ? cells : [], required: value => { assert.ok(value); return value; }, safe: fn => fn,
    doc: { hidden: false }, reduce: false, isPresent: value => value != null,
    GAUGE_API: 'gauge/', getText: url => network[Number(url.slice(6))] ? Promise.resolve(network[Number(url.slice(6))]) : Promise.reject(new Error('Unavailable')),
    parseGauge: value => value, moodOf: pos => pos < .4 ? 'happy' : pos < .7 ? 'neutral' : 'angry', MOOD_WORD: { happy: 'Happy', neutral: 'Calm', angry: 'Upset' }, setRing() {}, restart() {}, clock: () => '12:34',
    countTo: (target, _from, _to, value) => { target.textContent = value; },
    window: { setTimeout: (fn, delay) => schedule(fn, delay), setInterval: (fn, delay) => schedule(fn, delay, true), clearInterval: id => tasks.delete(id) },
  });
  async function advance(ms) {
    const end = clock + ms;
    while (true) {
      const next = [...tasks].sort((a, b) => a[1].at - b[1].at)[0];
      if (!next || next[1].at > end) break;
      clock = next[1].at; tasks.delete(next[0]);
      if (next[1].repeat) tasks.set(next[0], { ...next[1], at: clock + next[1].delay });
      next[1].fn(); await flush();
    }
    clock = end; await flush();
  }
  await flush();
  return { cells, say, time, mood, advance, setNetwork: value => { network = value; } };
}
const reading = (value, pos = .5) => ({ title: 'Test meter', value: String(value), num: value, pos, ok: true });

test('partial live recovery never relabels the other saved readings as current', async () => {
  const r = await readings(); assert.match(r.time.textContent, /Saved reading/);
  r.setNetwork({ 1033: reading(70) }); await r.advance(60000);
  assert.deepEqual(r.cells.map(c => c.number.textContent), ['Unavailable', 'Unavailable', '70', 'Unavailable']);
  assert.deepEqual(r.cells.map(c => c.unit.hidden), [true, true, false, true]);
  assert.match(r.say.textContent, /70/);
  await r.advance(4200); assert.match(r.say.textContent, /70/); assert.doesNotMatch(r.say.textContent, /12,963|354|61|32/);
});

test('subsequent partial response removes formerly live IDs that did not refresh', async () => {
  const r = await readings({ 1021: reading(100), 1033: reading(70) });
  r.setNetwork({ 1033: reading(71) }); await r.advance(60000);
  assert.equal(r.cells[0].number.textContent, 'Unavailable');
  assert.equal(r.mood.textContent, 'Unavailable');
  await r.advance(8400); assert.match(r.say.textContent, /71/); assert.doesNotMatch(r.say.textContent, /100/);
});

test('all-unreachable refresh returns to clearly dated snapshot without rotation', async () => {
  const r = await readings({ 1021: reading(100) }); r.setNetwork({}); await r.advance(60000);
  assert.match(r.time.textContent, /Saved reading, 23 Sep 2026/);
  assert.match(r.say.textContent, /saved reading from 23 September 2026/);
  const label = r.say.textContent; await r.advance(8400); assert.equal(r.say.textContent, label);
});
