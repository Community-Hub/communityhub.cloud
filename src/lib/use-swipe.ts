import { useEffect, useRef, type RefObject } from "react";
import { WheelGesture, normalizeWheelDelta, swipeStep } from "@/lib/gesture";

/**
 * Horizontal swipe on a card: left = next, right = prev. One finger, one step per touch.
 * Vertical strokes are left alone so the page swipe (storyboard) still moves chapters.
 * Taps are untouched, so links and arrows inside the card keep working.
 * A sideways trackpad swipe does the same on a laptop: one step per gesture.
 */
export function useSwipe(ref: RefObject<HTMLElement | null>, onStep: (dir: 1 | -1) => void) {
  const cb = useRef(onStep);
  cb.current = onStep;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let id: number | null = null;
    let x0 = 0;
    let y0 = 0;
    let t0 = 0;
    const start = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        id = null;
        return;
      }
      const t = e.changedTouches[0];
      id = t.identifier;
      x0 = t.clientX;
      y0 = t.clientY;
      t0 = e.timeStamp;
    };
    const end = (e: TouchEvent) => {
      const t = Array.from(e.changedTouches).find((c) => c.identifier === id);
      if (!t) return;
      id = null;
      const dir = swipeStep(t.clientX - x0, t.clientY - y0, e.timeStamp - t0);
      if (dir) cb.current(dir);
    };
    const cancel = () => {
      id = null;
    };
    const wheel = new WheelGesture();
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      const decision = wheel.next(normalizeWheelDelta(e.deltaX, e.deltaMode, el.clientWidth), e.timeStamp, false);
      if (decision.kind === "native") return;
      e.preventDefault();
      if (decision.kind === "step") cb.current(decision.direction);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchend", end, { passive: true });
    el.addEventListener("touchcancel", cancel, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchend", end);
      el.removeEventListener("touchcancel", cancel);
    };
  }, [ref]);
}
