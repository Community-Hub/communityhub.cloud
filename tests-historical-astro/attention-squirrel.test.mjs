import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const code = ts.transpileModule(readFileSync('src/scripts/ui/attention-squirrel.ts', 'utf8').replace(/export /g, ''),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
const ctx = {};
runInNewContext(`${code}\nthis.S = { visibleRatio, isEligible, rankTargets, pickTarget, idleReady, decide, markDone, parseDone, serializeDone, refreshScrollVisits, startsScrolling, sideOrder, anchorsFor, cueBox, roomFor, insideViewport, EDGE_GAP, EDGE_MARGIN, CLEARANCE, SHOW_RATIO, HIDE_RATIO, IDLE_MS };`, ctx);
const S = ctx.S;

const T = (id, o = {}) => ({ id, text: 'x', side: 'right', ratio: 1, visible: true, centerDist: 0, order: 0, ...o });
const none = new Set();

test('visibleRatio: share of the target inside the viewport below the header', () => {
  assert.equal(S.visibleRatio({ x: 0, y: 100, w: 100, h: 100 }, 800, 600, 64), 1);
  assert.equal(S.visibleRatio({ x: 0, y: 500, w: 100, h: 200 }, 800, 600, 64), 0.5);
  assert.equal(S.visibleRatio({ x: 0, y: 14, w: 100, h: 100 }, 800, 600, 64), 0.5);
  assert.equal(S.visibleRatio({ x: 0, y: 700, w: 100, h: 100 }, 800, 600, 64), 0);
  assert.equal(S.visibleRatio({ x: 0, y: 0, w: 0, h: 10 }, 800, 600), 0);
});

test('eligibility: needs 60% in view, visible and not done; a shown cue tolerates 45%', () => {
  assert.equal(S.isEligible(T('a', { ratio: 0.59 }), none), false);
  assert.equal(S.isEligible(T('a', { ratio: 0.6 }), none), true);
  assert.equal(S.isEligible(T('a', { ratio: 1, visible: false }), none), false);
  assert.equal(S.isEligible(T('a'), new Set(['a'])), false);
  assert.equal(S.isEligible(T('a', { ratio: 0.5 }), none, true), true);
  assert.equal(S.isEligible(T('a', { ratio: 0.4 }), none, true), false);
});

test('target selection: most in view, then nearest the middle, then document order', () => {
  const ts = [T('far', { ratio: 1, centerDist: 300, order: 0 }), T('near', { ratio: 1, centerDist: 50, order: 1 }), T('part', { ratio: 0.7, centerDist: 0, order: 2 })];
  assert.equal(S.pickTarget(ts, none).id, 'near');
  assert.deepEqual(S.rankTargets(ts, none).map(t => t.id), ['near', 'far', 'part']);
  assert.equal(S.pickTarget([T('a', { order: 3 }), T('b', { order: 1 })], none).id, 'b');
  assert.equal(S.pickTarget([T('a', { ratio: 0.2 })], none), null);
  assert.equal(S.pickTarget(ts, new Set(['near', 'far', 'part'])), null);
});

test('done-marking: markDone is pure, persists via serialize/parse, survives junk', () => {
  const a = new Set(['a']);
  const b = S.markDone(a, 'b');
  assert.equal(a.has('b'), false);
  assert.deepEqual([...b].sort(), ['a', 'b']);
  assert.deepEqual([...S.parseDone(S.serializeDone(b))].sort(), ['a', 'b']);
  assert.equal(S.parseDone('not json').size, 0);
  assert.equal(S.parseDone('{"a":1}').size, 0);
  assert.equal(S.parseDone(null).size, 0);
  assert.deepEqual([...S.parseDone('["a",3,null]')], ['a']);
  assert.equal(S.pickTarget([T('a')], b), null);
});

test('idle gating: shows only after one second without activity', () => {
  assert.equal(S.idleReady(1999, 1000), false);
  assert.equal(S.idleReady(2000, 1000), true);
  const ts = [T('a')];
  assert.deepEqual({ ...S.decide(null, ts, none, 1500, 1000) }, { kind: 'none' });
  assert.deepEqual({ ...S.decide(null, ts, none, 2000, 1000) }, { kind: 'show', id: 'a' });
});

test('one squirrel at a time: a shown cue is kept, hidden when done or out of view, never swapped', () => {
  const ts = [T('a', { order: 0 }), T('b', { order: 1 })];
  assert.equal(S.decide('a', ts, none, 5000, 0).kind, 'keep');
  assert.equal(S.decide('a', ts, new Set(['a']), 5000, 0).kind, 'hide');
  assert.equal(S.decide('a', [T('a', { ratio: 0.3 }), T('b')], none, 5000, 0).kind, 'hide');
  assert.equal(S.decide('a', [T('b')], none, 5000, 0).kind, 'hide');
  assert.equal(S.decide('a', [T('a', { visible: false })], none, 5000, 0).kind, 'hide');
});

test('a target that left view may show again later unless done', () => {
  assert.equal(S.decide(null, [T('a')], none, 9000, 0).kind, 'show');
  assert.equal(S.decide(null, [T('a')], new Set(['a']), 9000, 0).kind, 'none');
});

test('scroll completion belongs to one embed and resets when that embed is left', () => {
  const completed = new Set(['dashboard']);
  const here = [T('dashboard', { text: 'Scroll here' }), T('voices', { text: 'Scroll here' })];
  let visit = S.refreshScrollVisits(completed, here);
  assert.equal(S.pickTarget(here, visit).id, 'voices');
  visit = S.refreshScrollVisits(visit, [T('dashboard', { visible: false }), T('voices')]);
  assert.equal(visit.has('dashboard'), false);
  assert.equal(S.pickTarget([T('dashboard')], visit).id, 'dashboard');
  assert.equal(completed.has('dashboard'), true, 'visit refresh does not mutate the prior state');
});

test('scroll completion survives minor viewport movement but not leaving the target', () => {
  const completed = new Set(['a']);
  assert.equal(S.refreshScrollVisits(completed, [T('a', { ratio: 0.5 })]).has('a'), true);
  assert.equal(S.refreshScrollVisits(completed, [T('a', { ratio: 0.4 })]).has('a'), false);
  assert.equal(S.refreshScrollVisits(completed, []).size, 0);
});

test('scroll cues dismiss on movement, not clicking, focus, touching down or tabbing', () => {
  for (const type of ['pointerdown', 'click', 'focusin', 'touchstart']) assert.equal(S.startsScrolling({ type }), false, type);
  assert.equal(S.startsScrolling({ type: 'keydown', key: 'Tab' }), false);
  assert.equal(S.startsScrolling({ type: 'keydown', key: 'Enter' }), false);
  assert.equal(S.startsScrolling({ type: 'wheel', deltaY: 0 }), false);
  assert.equal(S.startsScrolling({ type: 'wheel', deltaY: 1 }), true);
  assert.equal(S.startsScrolling({ type: 'wheel', deltaY: -1 }), true);
  assert.equal(S.startsScrolling({ type: 'touchmove' }), true);
  for (const key of ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']) assert.equal(S.startsScrolling({ type: 'keydown', key }), true, key);
});

test('zoom, native controls and text editing do not consume scroll guidance', () => {
  assert.equal(S.startsScrolling({ type: 'wheel', deltaY: 100, ctrlKey: true }), false);
  assert.equal(S.startsScrolling({ type: 'keydown', key: 'ArrowDown', control: true }), false);
  assert.equal(S.startsScrolling({ type: 'keydown', key: ' ', control: true }), false);
  assert.equal(S.startsScrolling({ type: 'keydown', key: 'Home', metaKey: true }), false);
});

test('targets with no room are skipped for the next best', () => {
  const ts = [T('a', { order: 0 }), T('b', { order: 1 })];
  const d = S.decide(null, ts, none, 5000, 0, id => id !== 'a');
  assert.equal(d.kind, 'show');
  assert.equal(d.id, 'b');
  assert.equal(S.decide(null, ts, none, 5000, 0, () => false).kind, 'none');
});

test('placement: right/left sit outside the target; top stands on its edge; preferred side first', () => {
  const t = { x: 100, y: 200, w: 300, h: 400 }, m = { sw: 84, sh: 119, bw: 115, bh: 47 };
  const r = S.cueBox('right', t, m, 'c');
  assert.ok(r.x >= t.x + t.w);
  const l = S.cueBox('left', t, m, 'c');
  assert.ok(l.x + l.w <= t.x);
  const top = S.cueBox('top', t, m, 'c');
  assert.ok(top.y + top.h <= t.y);
  assert.deepEqual([...S.sideOrder('left')], ['left', 'right', 'top', 'bottom']);
  assert.deepEqual([...S.sideOrder(undefined)], ['right', 'left', 'top', 'bottom']);
  assert.equal(S.roomFor('right', t, 500) < 100, true);
  const bot = S.cueBox('bottom', t, m, 'c');
  assert.ok(bot.y >= t.y + t.h + S.EDGE_GAP);
  assert.ok(S.EDGE_GAP >= 8 && S.EDGE_MARGIN >= 10 && S.CLEARANCE >= 8);
  assert.equal(S.insideViewport({ x: 10, y: 80, w: 50, h: 50 }, 400, 600, 64), true);
  assert.equal(S.insideViewport({ x: 10, y: 60, w: 50, h: 50 }, 400, 600, 64), false);
  assert.equal(S.insideViewport({ x: 380, y: 100, w: 50, h: 50 }, 400, 600, 64), false);
});

test('placement: above or below a row can also sit flush with a screen margin; sideways cannot', () => {
  const t = { x: 100, y: 200, w: 300, h: 40 }, m = { sw: 62, sh: 88, bw: 78, bh: 41 };
  assert.deepEqual([...S.anchorsFor('top')], ['c', 's', 'e', 'r', 'l']);
  assert.deepEqual([...S.anchorsFor('bottom')], ['c', 's', 'e', 'r', 'l']);
  assert.deepEqual([...S.anchorsFor('right')], ['c', 's', 'e']);
  const l = S.cueBox('bottom', t, m, 'l', 390), r = S.cueBox('bottom', t, m, 'r', 390);
  assert.equal(l.x, S.EDGE_MARGIN);
  assert.equal(r.x + r.w, 390 - S.EDGE_MARGIN);
});
