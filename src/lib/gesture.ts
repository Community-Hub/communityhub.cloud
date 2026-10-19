/**
 * Input rules for the home storyboard. Plain TypeScript with no imports so `node --test` can run it.
 * Ported from the refined site's WheelGesture; the design is one gesture, one stop.
 */

export type WheelDecision = { kind: "native" | "consume" } | { kind: "step"; direction: 1 | -1 };

/** Wheel events carry no start or end signal, so a burst stays owned until 260ms of silence. */
export class WheelGesture {
  private last = -Infinity;
  private owner: "page" | "native" | null = null;
  private direction = 0;
  private intent = 0;
  private reversed = 0;
  private started = -Infinity;
  /** Recent magnitudes of the page-owned burst: the decaying inertia tail. */
  private recent: [number, number][] = [];
  /** Largest magnitude since the step was taken: a valley far below it marks where momentum died. */
  private peak = 0;

  reset() {
    this.recent = [];
    this.peak = 0;
    this.last = -Infinity;
    this.owner = null;
    this.direction = 0;
    this.intent = this.reversed = 0;
    this.started = -Infinity;
  }

  /**
   * @param delta  vertical delta in pixels (see normalizeWheelDelta)
   * @param time   event timestamp in ms
   * @param canScroll true when the pointer is over an inner scroller that can still move this way
   */
  next(delta: number, time: number, canScroll: boolean): WheelDecision {
    if (!Number.isFinite(delta) || !Number.isFinite(time)) return { kind: "consume" };
    if (time - this.last > 260 || time < this.last) this.reset();
    this.last = time;
    const direction = Math.sign(delta);
    const magnitude = Math.abs(delta);

    if (this.owner === "page" && direction === this.direction && this.freshSwipe(magnitude, time)) {
      // A second deliberate swipe began inside the first one's inertia tail: hand ownership back.
      this.owner = null;
      this.intent = 0;
      this.reversed = 0;
      this.recent = [];
      this.peak = 0;
    }

    if (magnitude < 1) {
      if (this.owner !== "page" && canScroll) {
        if (!this.owner) {
          this.owner = "native";
          this.direction = direction;
          this.started = time;
        }
        return { kind: "native" };
      }
      return { kind: "consume" };
    }

    if (this.owner && direction !== this.direction) {
      // Sign jitter is not a new intention; a meaningful opposite stroke cancels the old burst.
      if (magnitude >= 4) this.reversed += magnitude;
      if (this.reversed >= 40 && time - this.started >= 70) {
        this.owner = null;
        this.direction = direction;
        this.intent = this.reversed;
        this.reversed = 0;
      } else {
        return { kind: this.owner === "native" && canScroll ? "native" : "consume" };
      }
    } else {
      this.reversed = 0;
    }

    if (this.owner === "page") return { kind: "consume" };
    if (this.owner === "native") return { kind: canScroll ? "native" : "consume" };
    if (canScroll) {
      this.owner = "native";
      this.direction = direction;
      this.started = time;
      this.intent = 0;
      return { kind: "native" };
    }
    if (direction !== this.direction) {
      this.direction = direction;
      this.intent = 0;
    }
    this.intent += magnitude;
    if (this.intent < 28) return { kind: "consume" };
    this.owner = "page";
    this.started = time;
    this.intent = 0;
    this.recent = [];
    this.peak = 0;
    return { kind: "step", direction: direction > 0 ? 1 : -1 };
  }

  /**
   * Momentum only decays, so re-acceleration far above the recent floor is a new stroke.
   * Early on (before 160ms) the rise counts only after a real valley: the tail first fell
   * to at most 55% of its post-step peak. That keeps a single stroke whose peak arrives
   * just after the step from being read as a second swipe, while a fast repeat — whose
   * ramp starts from the dead tail — is answered as soon as it is recognisable.
   * No tail events for 150ms means momentum is over: a lone full-size event is a new
   * notch or stroke, never inertia restarting from silence.
   */
  private freshSwipe(magnitude: number, time: number) {
    this.recent = this.recent.filter(([t]) => time - t <= 150);
    const quiet = this.recent.length === 0;
    const floor = quiet ? Infinity : Math.min(...this.recent.map(([, m]) => m));
    const peakBefore = this.peak;
    if (magnitude >= 1) {
      this.recent.push([time, magnitude]);
      if (magnitude > this.peak) this.peak = magnitude;
    }
    if (magnitude < 14) return false;
    const since = time - this.started;
    if (quiet) return since >= 70 && magnitude >= 28;
    if (magnitude < floor * 1.6 + 6) return false;
    if (since >= 160) return true;
    return since >= 70 && floor <= peakBefore * 0.55;
  }
}

/** deltaMode 1 is lines, 2 is pages. */
export function normalizeWheelDelta(deltaY: number, deltaMode: number, pageHeight: number) {
  if (deltaMode === 1) return deltaY * 16;
  if (deltaMode === 2) return deltaY * pageHeight;
  return deltaY;
}

/** True when an inner scroller can still move in `dir` (+1 down, -1 up). 2px tolerance for fractional sizes. */
export function scrollerCanMove(
  m: { scrollTop: number; scrollHeight: number; clientHeight: number },
  dir: number,
) {
  if (m.scrollHeight <= m.clientHeight + 2) return false;
  const atTop = m.scrollTop <= 0;
  const atBottom = m.scrollTop + m.clientHeight >= m.scrollHeight - 2;
  return (dir > 0 && !atBottom) || (dir < 0 && !atTop);
}

export type KeyAction = "next" | "prev" | "first" | "last";

/**
 * Maps a keydown to a stop move. Returns null when the page must leave the key alone:
 * modifiers, held keys, text fields, and Space on a control that Space activates.
 */
export function keyAction(
  e: { key: string; shiftKey: boolean; ctrlKey: boolean; metaKey: boolean; altKey: boolean; repeat: boolean },
  focus: { editable: boolean; activator: boolean },
): KeyAction | null {
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || focus.editable) return null;
  switch (e.key) {
    case "ArrowDown":
    case "PageDown":
      return "next";
    case "ArrowUp":
    case "PageUp":
      return "prev";
    case " ":
    case "Spacebar":
      if (focus.activator) return null;
      return e.shiftKey ? "prev" : "next";
    case "Home":
      return "first";
    case "End":
      return "last";
    default:
      return null;
  }
}

/** Refuses a second step until `ms` after the last accepted one (keys, Next button). */
export class StepLock {
  private until = -Infinity;
  private ms: number;
  constructor(ms = 200) {
    this.ms = ms;
  }
  take(now: number) {
    if (now < this.until) return false;
    this.until = now + this.ms;
    return true;
  }
  reset() {
    this.until = -Infinity;
  }
}

export type TouchPhase = "pending" | "vertical" | "horizontal" | "done";

/**
 * One finger, one decision. Tracks a single touch identifier, locks to the vertical axis
 * once movement is clear, and steps at most once per touch.
 */
export class TouchGesture {
  private id: number | null = null;
  private x0 = 0;
  private y0 = 0;
  private t0 = 0;
  private phase: TouchPhase = "done";

  get active() {
    return this.id !== null;
  }
  get axis(): TouchPhase {
    return this.phase;
  }
  get touchId() {
    return this.id;
  }
  /** +1 when the finger has moved up (page goes down), -1 when down. */
  directionAt(y: number): 1 | -1 {
    return this.y0 - y >= 0 ? 1 : -1;
  }

  start(id: number, x: number, y: number, t: number) {
    if (this.id !== null) return; // a second finger never restarts the gesture
    this.id = id;
    this.x0 = x;
    this.y0 = y;
    this.t0 = t;
    this.phase = "pending";
  }

  /** Returns the axis lock. Moves from other fingers are ignored. */
  move(id: number, x: number, y: number): TouchPhase {
    if (id !== this.id) return this.phase;
    if (this.phase === "pending") {
      const dx = Math.abs(x - this.x0);
      const dy = Math.abs(y - this.y0);
      if (Math.max(dx, dy) >= 8) this.phase = dy > dx ? "vertical" : "horizontal";
    }
    return this.phase;
  }

  /** Direction to step (+1 swipe up, -1 swipe down) or 0. Always ends the gesture. */
  end(id: number, y: number, t: number): 1 | -1 | 0 {
    if (id !== this.id) return 0;
    const dy = this.y0 - y;
    const dt = Math.max(1, t - this.t0);
    const wasVertical = this.phase === "vertical";
    this.cancel();
    if (!wasVertical) return 0;
    const distance = Math.abs(dy);
    const fast = distance >= 12 && distance / dt >= 0.35;
    if (distance < 32 && !fast) return 0;
    return dy > 0 ? 1 : -1;
  }

  cancel() {
    this.id = null;
    this.phase = "done";
  }
}

/**
 * Horizontal swipe on a card (examples, products). Returns +1 for a swipe left (next), -1 for right (prev), else 0.
 * Needs a mostly horizontal stroke of 40px, or a quick 14px flick.
 */
export function swipeStep(dx: number, dy: number, dtMs: number): 1 | -1 | 0 {
  const ax = Math.abs(dx);
  if (ax < 14 || ax < Math.abs(dy) * 1.5) return 0;
  const fast = ax / Math.max(1, dtMs) >= 0.35;
  if (ax < 40 && !fast) return 0;
  return dx < 0 ? 1 : -1;
}
