import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const code = ts.transpileModule(readFileSync('src/scripts/ui/wheel-gesture.ts', 'utf8').replace(/export /g, ''),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
const ctx = {};
runInNewContext(`${code}\nthis.WheelGesture = WheelGesture;`, ctx);

/** A trackpad stroke: fast rise, peak, long exponential inertia tail (events every ~16ms). */
function stroke(start, { peak = 70, tailMs = 1500, rise = 6 } = {}) {
  const events = [];
  for (let i = 0; i < rise; i++) events.push([start + i * 16, Math.max(2, (peak * (i + 1)) / rise)]);
  const tailStart = start + rise * 16;
  for (let t = 0; t < tailMs; t += 16) events.push([tailStart + t, Math.max(1.2, peak * Math.exp(-t / 260))]);
  return events;
}
/** The OS reports one stream: strokes overlapping in time add up on the 16ms grid. */
function sum(...streams) {
  const bins = new Map();
  for (const [t, m] of streams.flat()) bins.set(Math.round(t / 16), (bins.get(Math.round(t / 16)) || 0) + m);
  return [...bins].map(([k, m]) => [k * 16, m]);
}
function run(events, sign = 1) {
  const g = new ctx.WheelGesture();
  let steps = 0, natives = 0;
  for (const [time, mag] of events.sort((a, b) => a[0] - b[0])) {
    const d = g.next(sign * mag, time, false);
    if (d.kind === 'step') steps++;
    if (d.kind === 'native') natives++;
  }
  return { steps, natives };
}

test('one swipe with a 1.5s inertia tail advances exactly one scene', () => {
  assert.equal(run(stroke(1000)).steps, 1);
  assert.equal(run(stroke(1000, { peak: 140, tailMs: 2000 })).steps, 1);
  assert.equal(run(stroke(1000), -1).steps, 1);
});

test('a second swipe starting inside the first swipe tail is recognised', () => {
  const first = stroke(1000), second = stroke(1600);
  assert.ok(first.some(([t]) => t > 1600), 'the first tail overlaps the second stroke');
  assert.equal(run(sum(first, second)).steps, 2);
});

test('three quick swipes 600ms apart give three steps', () => {
  assert.equal(run(sum(stroke(1000), stroke(1600), stroke(2200))).steps, 3);
});

test('a tail with jitter never counts as a new swipe', () => {
  const events = stroke(1000).map(([t, m], i) => [t, m + (i % 3 === 0 ? 3 : 0)]);
  assert.equal(run(events).steps, 1);
});

test('mouse wheel notches: one step per notch burst, new burst after a quiet gap', () => {
  const burst = start => [0, 40, 80, 120, 160, 200, 240].map(t => [start + t, 100]);
  assert.equal(run(burst(1000)).steps, 1);
  assert.equal(run([...burst(1000), ...burst(1700)]).steps, 2);
  // slow single notches: one step each
  assert.equal(run([[1000, 100], [1700, 100], [2400, 100]]).steps, 3);
});

test('a notch every 120ms stays one burst', () => {
  const events = Array.from({ length: 8 }, (_, i) => [1000 + i * 120, 100]);
  assert.equal(run(events).steps, 1);
});

test('a deliberate reversal still cancels the tail', () => {
  const g = new ctx.WheelGesture();
  let steps = 0;
  for (const [t, m] of stroke(1000, { tailMs: 400 })) if (g.next(m, t, false).kind === 'step') steps++;
  for (let i = 0; i < 6; i++) { if (g.next(-60, 1500 + i * 16, false).kind === 'step') steps++; }
  assert.equal(steps, 2);
});
