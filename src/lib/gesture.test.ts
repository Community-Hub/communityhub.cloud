import assert from "node:assert/strict";
import { test } from "node:test";
import {
  keyAction,
  normalizeWheelDelta,
  scrollerCanMove,
  StepLock,
  swipeStep,
  TouchGesture,
  WheelGesture,
} from "./gesture.ts";

/** Feeds a decaying trackpad flick (about 1.1s) and returns every step it produced. */
function flick(g: WheelGesture, start: number, peak: number, dir: 1 | -1 = 1) {
  const steps: number[] = [];
  for (let k = 0; k < 70; k++) {
    const d = Math.max(1, Math.round(peak * Math.exp(-k / 18)));
    const r = g.next(d * dir, start + k * 16, false);
    if (r.kind === "step") steps.push(r.direction);
  }
  return steps;
}

test("one mouse notch steps once at any viewport", () => {
  for (const delta of [30, 53, 100, 120]) {
    const g = new WheelGesture();
    const r = g.next(delta, 1000, false);
    // 30px is above the 28px intent gate, so even the smallest notch moves one stop.
    assert.deepEqual(r, { kind: "step", direction: 1 }, `delta ${delta}`);
  }
});

test("sub-intent jitter does nothing", () => {
  const g = new WheelGesture();
  for (let k = 0; k < 3; k++) assert.equal(g.next(8, 1000 + k * 10, false).kind, "consume");
});

test("slow drag accumulates to one step", () => {
  const g = new WheelGesture();
  let steps = 0;
  for (let k = 0; k < 45; k++) if (g.next(6, 1000 + k * 16, false).kind === "step") steps++;
  assert.equal(steps, 1);
});

test("an inertial flick moves exactly one stop, in both directions", () => {
  assert.deepEqual(flick(new WheelGesture(), 0, 120), [1]);
  assert.deepEqual(flick(new WheelGesture(), 0, 30), [1]);
  assert.deepEqual(flick(new WheelGesture(), 0, 120, -1), [-1]);
});

test("a tail longer than 260ms from the step does not re-fire", () => {
  const g = new WheelGesture();
  const steps: number[] = [];
  // 2.4s of slowly decaying events, each a few px, never silent for 260ms
  for (let k = 0; k < 150; k++) {
    const d = Math.max(2, Math.round(80 * Math.exp(-k / 40)));
    if (g.next(d, k * 16, false).kind === "step") steps.push(1);
  }
  assert.equal(steps.length, 1);
});

test("two flicks separated by silence are two gestures", () => {
  const g = new WheelGesture();
  const first = flick(g, 0, 100);
  const second = flick(g, 2000, 100);
  assert.deepEqual([first.length, second.length], [1, 1]);
});

test("a deliberate counter-swipe cancels the old burst", () => {
  const g = new WheelGesture();
  assert.equal(g.next(100, 0, false).kind, "step");
  // opposite stroke 100ms later, still inside the 260ms window
  const r = [g.next(-60, 100, false), g.next(-60, 116, false)];
  assert.ok(r.some((x) => x.kind === "step" && x.direction === -1));
});

test("a fresh swipe inside the inertia tail starts a new gesture", () => {
  const g = new WheelGesture();
  let steps = 0;
  for (let k = 0; k < 40; k++) {
    // tail decaying from 40 to about 4
    const d = Math.max(2, Math.round(40 * Math.exp(-k / 12)));
    if (g.next(d, k * 16, false).kind === "step") steps++;
  }
  // deliberate second swipe at 640ms, well above the tail floor
  const t = 40 * 16;
  if (g.next(110, t, false).kind === "step") steps++;
  assert.equal(steps, 2);
});

/** One physical trackpad swipe: finger ramp (5 events) then momentum decay, events every 12ms. */
function swipeEvents(start: number, peak = 42, dir: 1 | -1 = 1) {
  const mags = [0.07, 0.18, 0.38, 0.68, 1].map((f) => Math.max(1, Math.round(peak * f)));
  for (let k = 1; k < 26; k++) mags.push(Math.max(1, Math.round(peak * 0.82 * Math.exp(-k / 6))));
  return mags.map((m, i) => ({ d: m * dir, t: start + i * 12 }));
}

/** Swipes back to back: a new finger stroke cuts the previous momentum tail at `gap` ms. Returns [time, dir] per step. */
function fastSwipes(gaps: number[], peak = 42, dirs: (1 | -1)[] = [1, 1, 1]) {
  const g = new WheelGesture();
  const events: { d: number; t: number }[] = [];
  let start = 0;
  gaps.forEach((gap, i) => {
    events.push(...swipeEvents(start, peak, dirs[i]).filter((e) => e.t < start + gap || i === gaps.length - 1));
    start += gap;
  });
  const steps: [number, number][] = [];
  for (const e of events.sort((a, b) => a.t - b.t)) {
    const r = g.next(e.d, e.t, false);
    if (r.kind === "step") steps.push([e.t, r.direction]);
  }
  return steps;
}

test("fast repeated swipes each step once, well under the old 200ms lock", () => {
  for (const gap of [110, 140, 180]) {
    const steps = fastSwipes([gap, 10_000]);
    assert.equal(steps.length, 2, `gap ${gap}: ${JSON.stringify(steps)}`);
    // The second stroke must be answered promptly, not held to a fixed post-step deadline.
    assert.ok(steps[1][0] - steps[0][0] < 200, `gap ${gap}: second step at ${steps[1][0] - steps[0][0]}ms after first`);
    assert.ok(steps[1][0] - gap <= 72, `gap ${gap}: answered ${steps[1][0] - gap}ms after the second stroke began`);
  }
});

test("three fast swipes are three steps; the decaying tails add none", () => {
  assert.deepEqual(
    fastSwipes([140, 140, 10_000]).map(([, d]) => d),
    [1, 1, 1],
  );
});

test("a fast reversal steps back under 200ms", () => {
  for (const gap of [110, 140]) {
    const steps = fastSwipes([gap, 10_000], 42, [1, -1]);
    assert.deepEqual(steps.map(([, d]) => d), [1, -1], `gap ${gap}`);
    assert.ok(steps[1][0] - steps[0][0] < 200, `gap ${gap}`);
  }
});

test("one ramped swipe still steps exactly once (its post-step peak is not a fresh swipe)", () => {
  assert.equal(fastSwipes([10_000]).length, 1);
  assert.equal(fastSwipes([10_000], 90).length, 1);
  assert.equal(fastSwipes([10_000], 22).length, 1);
});

test("a small bump in the decaying tail does not re-fire", () => {
  const g = new WheelGesture();
  let steps = 0;
  const feed = (d: number, t: number) => {
    if (g.next(d, t, false).kind === "step") steps++;
  };
  for (const e of swipeEvents(0, 42).filter((e) => e.t < 300)) feed(e.d, e.t);
  // tail is down to a few px by now; a 12px wobble is momentum noise, not a stroke
  feed(12, 312);
  feed(9, 324);
  feed(5, 336);
  assert.equal(steps, 1);
});

test("discrete mouse notches 120ms apart are two gestures", () => {
  const g = new WheelGesture();
  assert.deepEqual(g.next(100, 0, false), { kind: "step", direction: 1 });
  assert.deepEqual(g.next(100, 120, false), { kind: "step", direction: 1 });
  assert.deepEqual(g.next(100, 240, false), { kind: "step", direction: 1 });
});

test("inner scroller owns the whole burst, then hands off only after silence", () => {
  const g = new WheelGesture();
  // pointer over a scroller with room: every event is native
  assert.equal(g.next(100, 0, true).kind, "native");
  assert.equal(g.next(100, 50, true).kind, "native");
  // scroller reaches its edge mid-burst: the page must not take the rest of the burst
  assert.equal(g.next(100, 100, false).kind, "consume");
  assert.equal(g.next(100, 150, false).kind, "consume");
  // 300ms of silence, then a new gesture at the edge steps the page once
  assert.deepEqual(g.next(100, 450, false), { kind: "step", direction: 1 });
});

test("a fresh stroke at a scroller's edge hands off to the page without waiting for silence", () => {
  const g = new WheelGesture();
  const steps: number[] = [];
  const feed = (d: number, t: number, can: boolean) => {
    const r = g.next(d, t, can);
    if (r.kind === "step") steps.push(t);
    return r;
  };
  // A scroller with a few px of travel owns the first stroke and reaches its edge almost at once.
  assert.equal(feed(30, 0, true).kind, "native");
  assert.equal(feed(40, 12, true).kind, "native");
  // The rest of that same burst at the edge is still consumed, never stepped.
  assert.equal(feed(35, 24, false).kind, "consume");
  // A deliberate second stroke 140ms in (ramp from the dead tail) steps the page once.
  feed(3, 140, false);
  feed(8, 152, false);
  feed(16, 164, false);
  feed(29, 176, false);
  feed(42, 188, false);
  feed(30, 200, false);
  feed(18, 212, false);
  assert.equal(steps.length, 1, JSON.stringify(steps));
  assert.ok(steps[0] <= 200, `stepped at ${steps[0]}`);
});

test("a discrete notch at a scroller's edge hands off; a scroller with room keeps every stroke", () => {
  const g = new WheelGesture();
  assert.equal(g.next(120, 0, true).kind, "native"); // scrolls the last few px to the edge
  assert.deepEqual(g.next(120, 120, false), { kind: "step", direction: 1 });

  const room = new WheelGesture();
  let steps = 0;
  for (const start of [0, 140]) {
    for (const e of swipeEvents(start, 42)) {
      if (e.t >= start + 140 && start === 0) break;
      const r = room.next(e.d, e.t, true);
      if (r.kind === "step") steps++;
      assert.equal(r.kind, "native");
    }
  }
  assert.equal(steps, 0);
});

test("wheel deltaMode is normalised", () => {
  assert.equal(normalizeWheelDelta(3, 1, 900), 48);
  assert.equal(normalizeWheelDelta(1, 2, 900), 900);
  assert.equal(normalizeWheelDelta(77, 0, 900), 77);
  assert.equal(new WheelGesture().next(normalizeWheelDelta(3, 1, 900), 0, false).kind, "step");
});

test("scrollerCanMove respects edges and 2px tolerance", () => {
  const m = { scrollTop: 0, scrollHeight: 800, clientHeight: 400 };
  assert.equal(scrollerCanMove(m, 1), true);
  assert.equal(scrollerCanMove(m, -1), false);
  assert.equal(scrollerCanMove({ ...m, scrollTop: 400 }, 1), false);
  assert.equal(scrollerCanMove({ ...m, scrollTop: 400 }, -1), true);
  assert.equal(scrollerCanMove({ scrollTop: 0, scrollHeight: 401, clientHeight: 400 }, 1), false);
});

const key = (k: string, extra: Partial<Parameters<typeof keyAction>[0]> = {}) => ({
  key: k,
  shiftKey: false,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  repeat: false,
  ...extra,
});
const body = { editable: false, activator: false };

test("keyboard map", () => {
  assert.equal(keyAction(key("ArrowDown"), body), "next");
  assert.equal(keyAction(key("PageDown"), body), "next");
  assert.equal(keyAction(key(" "), body), "next");
  assert.equal(keyAction(key(" ", { shiftKey: true }), body), "prev");
  assert.equal(keyAction(key("ArrowUp"), body), "prev");
  assert.equal(keyAction(key("PageUp"), body), "prev");
  assert.equal(keyAction(key("Home"), body), "first");
  assert.equal(keyAction(key("End"), body), "last");
  assert.equal(keyAction(key("ArrowLeft"), body), null);
});

test("keyboard ignores modifiers, held keys, fields and Space on buttons", () => {
  assert.equal(keyAction(key("ArrowDown", { repeat: true }), body), null);
  assert.equal(keyAction(key("ArrowDown", { metaKey: true }), body), null);
  assert.equal(keyAction(key("ArrowDown", { altKey: true }), body), null);
  assert.equal(keyAction(key("ArrowDown"), { editable: true, activator: false }), null);
  assert.equal(keyAction(key(" "), { editable: false, activator: true }), null);
  assert.equal(keyAction(key("ArrowDown"), { editable: false, activator: true }), "next");
});

test("StepLock drops steps inside the window", () => {
  const lock = new StepLock(300);
  assert.equal(lock.take(1000), true);
  assert.equal(lock.take(1100), false);
  assert.equal(lock.take(1299), false);
  assert.equal(lock.take(1300), true);
});

test("touch: 60px swipe steps, 20px does not, 400px steps once", () => {
  const swipe = (dy: number, ms: number) => {
    const t = new TouchGesture();
    t.start(1, 100, 600, 0);
    t.move(1, 100, 600 - dy / 2);
    t.move(1, 100, 600 - dy);
    return t.end(1, 600 - dy, ms);
  };
  assert.equal(swipe(60, 200), 1);
  assert.equal(swipe(20, 500), 0);
  assert.equal(swipe(400, 200), 1);
  assert.equal(swipe(-150, 200), -1);
  assert.equal(swipe(20, 40), 1); // short but fast flick
});

test("touch: horizontal drags and second fingers are ignored; cancel resets", () => {
  const t = new TouchGesture();
  t.start(1, 100, 600, 0);
  t.start(2, 100, 100, 0); // second finger does not restart
  t.move(1, 160, 590);
  assert.equal(t.axis, "horizontal");
  assert.equal(t.end(1, 300, 100), 0);
  assert.equal(t.active, false);

  t.start(3, 100, 600, 0);
  t.move(3, 100, 500);
  t.cancel();
  assert.equal(t.active, false);
  assert.equal(t.end(3, 400, 100), 0);
  // a cancelled touch cannot leave the next one stuck
  t.start(4, 100, 600, 0);
  t.move(4, 100, 540);
  assert.equal(t.end(4, 540, 150), 1);
});

test("swipeStep: horizontal strokes only", () => {
  assert.equal(swipeStep(-80, 5, 300), 1);
  assert.equal(swipeStep(80, -5, 300), -1);
  assert.equal(swipeStep(-20, 0, 400), 0);
  assert.equal(swipeStep(-20, 0, 40), 1);
  assert.equal(swipeStep(-80, 90, 300), 0);
});
