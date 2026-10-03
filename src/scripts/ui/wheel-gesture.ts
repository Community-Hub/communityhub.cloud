/** Wheel events have no physical contact/end signal. Keep each directional
 * burst owned, but let a deliberate counter-swipe cancel it. Thresholds are
 * engineering heuristics, not a claim about any particular input device. */
export type WheelDecision = { kind: "native" | "consume" } | { kind: "step"; direction: number };
export class WheelGesture {
  private last = -Infinity;
  private owner: "page" | "native" | null = null;
  private direction = 0;
  private intent = 0;
  private reversed = 0;
  private started = -Infinity;
  /* Recent magnitudes of the page-owned burst: the decaying inertia tail. */
  private recent: [number, number][] = [];
  reset() {
    this.recent = [];
    this.last = -Infinity;
    this.owner = null;
    this.direction = 0;
    this.intent = this.reversed = 0;
    this.started = -Infinity;
  }
  next(delta: number, time: number, canScroll: boolean): WheelDecision {
    if (!Number.isFinite(delta) || !Number.isFinite(time))
      return { kind: "consume" };
    if (time - this.last > 260 || time < this.last) this.reset();
    this.last = time;
    const direction = Math.sign(delta), magnitude = Math.abs(delta);
    if (this.owner === "page" && direction === this.direction && this.freshSwipe(magnitude, time)) {
      // A second deliberate swipe started inside the first one's inertia tail:
      // the delta climbs well above the decaying tail. Hand ownership back so
      // it counts as its own gesture instead of waiting out the tail.
      this.owner = null;
      this.intent = 0;
      this.reversed = 0;
      this.recent = [];
    }
    if (magnitude < 1) {
      if (this.owner !== "page" && canScroll) {
        if (!this.owner) { this.owner = "native"; this.direction = direction; this.started = time; }
        return { kind: "native" };
      }
      return { kind: "consume" };
    }
    if (this.owner && direction !== this.direction) {
      // Tiny sign jitter is not a new intention. A meaningful opposite stroke
      // cancels the old directional burst instead of waiting out its inertia.
      if (magnitude >= 4) this.reversed += magnitude;
      if (this.reversed >= 40 && time - this.started >= 70) {
        this.owner = null;
        this.direction = direction;
        this.intent = this.reversed;
        this.reversed = 0;
      } else return { kind: this.owner === "native" && canScroll ? "native" : "consume" };
    } else this.reversed = 0;
    if (this.owner === "page") return { kind: "consume" };
    if (this.owner === "native") return { kind: canScroll ? "native" : "consume" };
    if (canScroll) {
      this.owner = "native";
      this.direction = direction;
      this.started = time;
      this.intent = 0;
      return { kind: "native" };
    }
    if (direction !== this.direction) { this.direction = direction; this.intent = 0; }
    this.intent += magnitude;
    if (this.intent < 28) return { kind: "consume" };
    this.owner = "page";
    this.started = time;
    this.intent = 0;
    this.recent = [];
    return { kind: "step", direction };
  }
  /* Momentum only decays. After the first stroke has had time to peak, a delta
     that is both large and far above the recent tail floor is a new stroke. */
  private freshSwipe(magnitude: number, time: number) {
    this.recent = this.recent.filter(([t]) => time - t <= 150);
    const floor = this.recent.length ? Math.min(...this.recent.map(([, m]) => m)) : Infinity;
    // Sub-pixel deltas are rounding noise, not tail evidence.
    if (magnitude >= 1) this.recent.push([time, magnitude]);
    return time - this.started >= 280 && magnitude >= 20 && magnitude >= floor * 2 + 8;
  }
}
