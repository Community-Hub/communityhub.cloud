import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { ChevronDown } from "lucide-react";
import { CHAPTERS } from "@/lib/content";
import { CHAPTER_IDS } from "@/lib/links";
import { useHashStops, useWriteDetail } from "@/lib/use-hash-stops";
import { keyAction, normalizeWheelDelta, scrollerCanMove, StepLock, TouchGesture, WheelGesture } from "@/lib/gesture";
import { cn } from "@/lib/utils";

export type Dir = 1 | -1;
type DirHandler = (dir: Dir) => boolean;

type StoryApi = {
  index: number;
  go: (next: number, entryDir?: number) => void;
  next: () => void;
  /** Beat id from the URL hash ("#engage/web-embeddables"), or "". */
  hashBeat: string;
  /** Records the visible beat in the hash (replace, not push). */
  reportBeat: (chapter: number, beatId: string) => void;
  register: (chapter: number, fn: DirHandler | null) => void;
  /** Direction the visitor entered the current chapter: 1 from above, -1 from below, 0 for a jump. */
  entry: { current: number };
};

const Ctx = createContext<StoryApi | null>(null);

/** Sent on window before a scroll leaves a chapter; a listener inside `chapter` sets `handled` to keep it. */
export type InnerStep = { dir: Dir; chapter: Element; handled: boolean };

/** Lets an inner pager inside the visible chapter take scroll steps until it reaches its end. */
export function useInnerStep(ref: RefObject<Element | null>, take: (dir: Dir) => boolean) {
  const takeRef = useRef(take);
  takeRef.current = take;
  useEffect(() => {
    const on = (event: Event) => {
      const detail = (event as CustomEvent<InnerStep>).detail;
      const el = ref.current;
      if (detail.handled || !el || !detail.chapter.contains(el)) return;
      if (takeRef.current(detail.dir)) detail.handled = true;
    };
    window.addEventListener("ch:inner", on);
    return () => window.removeEventListener("ch:inner", on);
  }, [ref]);
}

export function useStory() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useStory outside storyboard");
  return value;
}

export function Storyboard({
  children,
  labels = CHAPTERS,
  ids = CHAPTER_IDS,
  lead,
}: {
  children: ReactNode;
  /** Names of the stops (dots and screen readers). Defaults to the home page. */
  labels?: readonly string[];
  /** Hash ids of the stops, same order as `labels`. */
  ids?: readonly string[];
  /**
   * Name of a stop that sits before the first chapter, inside it: the full-screen film that folds into the first chapter.
   * It gets the first dot; the chapter answers the "ch:hero" event ("film" brings it back, "stories" folds it away).
   */
  lead?: string;
}) {
  const [index, setIndex] = useState(0);
  const [film, setFilm] = useState(false);
  const count = labels.length;
  const indexRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const handler = useRef(new Map<number, DirHandler>());
  const entry = useRef(0);
  const lock = useRef(new StepLock(200));
  const placed = useRef(false);

  /** Single writer of the position. `entryDir` is the direction of travel (0 for a jump). */
  const go = useCallback((next: number, entryDir = 0) => {
    const clamped = Math.max(0, Math.min(count - 1, next));
    entry.current = clamped === indexRef.current ? entry.current : entryDir;
    indexRef.current = clamped;
    setIndex(clamped);
  }, [count]);

  // A resize or rotation can leave fewer stops than the position; land on the last one (the hash follows).
  useEffect(() => {
    if (indexRef.current > count - 1) go(count - 1);
  }, [count, go]);

  const hashBeat = useHashStops({ ids, index, go });
  const writeDetail = useWriteDetail();
  const reportBeat = useCallback(
    (chapter: number, beatId: string) => {
      if (chapter === indexRef.current) writeDetail(ids[chapter], beatId);
    },
    [writeDetail, ids],
  );

  const step = useCallback(
    (dir: Dir, inner = true) => {
      if (document.body.dataset.dialog === "open") return;
      if (handler.current.get(indexRef.current)?.(dir)) return;
      // Scrolling walks a chapter's inner items (examples, products) before leaving it.
      const chapter = trackRef.current?.children[indexRef.current];
      if (inner && chapter) {
        const detail: InnerStep = { dir, chapter, handled: false };
        window.dispatchEvent(new CustomEvent("ch:inner", { detail }));
        if (detail.handled) return;
      }
      const next = indexRef.current + dir;
      if (next < 0 || next >= count) return;
      go(next, dir);
    },
    [go, count],
  );

  /**
   * Keys and the Next button go through the lock, so an accidental double press can't skip a stop.
   * Classified gestures (below) skip it: WheelGesture already emits at most one step per gesture
   * and TouchGesture one per touch, so the lock only ever dropped deliberate fast repeats —
   * and because the classifier had already claimed that burst, the rest of the swipe was eaten too.
   */
  const commit = useCallback(
    (dir: Dir, inner = true) => {
      if (!lock.current.take(performance.now())) return;
      step(dir, inner);
    },
    [step],
  );

  /** Wheel and touch steps: independently classified, one per gesture, so no lock. */
  const commitGesture = useCallback((dir: Dir) => step(dir), [step]);

  const register = useCallback((chapter: number, fn: DirHandler | null) => {
    if (fn) handler.current.set(chapter, fn);
    else handler.current.delete(chapter);
  }, []);

  // A layout effect, so the listener is on before the chapter's first (passive-effect) announcement.
  useLayoutEffect(() => {
    const onFilm = (event: Event) => setFilm(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener("ch:film", onFilm);
    return () => window.removeEventListener("ch:film", onFilm);
  }, []);

  // Position: one writer, a CSS transform. No live drag, so reduced motion has nothing to jolt.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.style.transition = reduce || !placed.current ? "none" : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)";
    track.style.transform = `translate3d(0, calc(${index} * -100dvh), 0)`;
    placed.current = true;
    // Off-screen chapters can't take focus, so Tab and find-in-page never desync the view.
    Array.from(track.children).forEach((el, i) => el.toggleAttribute("inert", i !== index));
  }, [index, count]);

  useEffect(() => {
    const root = document.documentElement;
    const previous = [document.body.style.overflow, root.style.overscrollBehavior, document.body.style.overscrollBehavior];
    document.body.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";
    const dialogOpen = () => document.body.dataset.dialog === "open";
    // Any inner region that scrolls (not only [data-allow-scroll]) moves first; the page steps only at its edge.
    const innerCanMove = (target: EventTarget | null, dir: number) => {
      for (let el = target instanceof Element ? target : null; el && el !== document.body; el = el.parentElement) {
        if (el.scrollHeight <= el.clientHeight + 2) continue;
        const overflow = getComputedStyle(el).overflowY;
        if ((overflow === "auto" || overflow === "scroll") && scrollerCanMove(el, dir)) return true;
      }
      return false;
    };

    const wheel = new WheelGesture();
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || dialogOpen()) return; // pinch-zoom and modal dialogs keep their own wheel
      // A wheel over a live embed belongs to it, even when the browser hands it here while the embed is still loading.
      if (event.target instanceof HTMLIFrameElement) {
        event.preventDefault();
        return;
      }
      const delta = normalizeWheelDelta(event.deltaY, event.deltaMode, window.innerHeight);
      const canScroll = innerCanMove(event.target, Math.sign(delta));
      const decision = wheel.next(delta, event.timeStamp, canScroll);
      if (decision.kind === "native") return;
      event.preventDefault();
      if (decision.kind === "step") commitGesture(decision.direction);
    };

    // Touch: one finger, vertical lock, one step per touch; a scroller that can still move owns the touch.
    const touch = new TouchGesture();
    let nativeTouch = false;
    let decided = false;
    let touchTarget: EventTarget | null = null;
    const onTouchStart = (event: TouchEvent) => {
      if (dialogOpen()) return;
      if (event.touches.length > 1 || event.target instanceof HTMLIFrameElement) {
        touch.cancel();
        return;
      }
      touch.cancel(); // a lone fresh finger always replaces a stale gesture
      const t = event.changedTouches[0];
      touch.start(t.identifier, t.clientX, t.clientY, event.timeStamp);
      nativeTouch = false;
      decided = false;
      touchTarget = event.target;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (!touch.active) return;
      const t = Array.from(event.changedTouches).find((c) => c.identifier === touch.touchId);
      if (!t) return;
      const axis = touch.move(t.identifier, t.clientX, t.clientY);
      if (axis !== "vertical") return;
      if (!decided) {
        decided = true;
        nativeTouch = innerCanMove(touchTarget, touch.directionAt(t.clientY));
      }
      if (!nativeTouch && event.cancelable) event.preventDefault();
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (!touch.active) return;
      const t = Array.from(event.changedTouches).find((c) => c.identifier === touch.touchId);
      if (!t) return;
      const dir = touch.end(t.identifier, t.clientY, event.timeStamp);
      if (dir && !nativeTouch) commitGesture(dir);
    };
    const onTouchCancel = () => touch.cancel();

    const onKey = (event: KeyboardEvent) => {
      // A widget that took the key (the tab row's arrows, Home and End) keeps it.
      if (dialogOpen() || event.defaultPrevented) return;
      const el = event.target as HTMLElement | null;
      const tag = el?.tagName ?? "";
      const editable = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || Boolean(el?.isContentEditable);
      const role = el?.getAttribute?.("role") ?? "";
      const activator = tag === "BUTTON" || tag === "A" || tag === "SUMMARY" || role === "button" || role === "tab" || role === "link";
      const action = keyAction(event, { editable, activator });
      if (!action) return;
      event.preventDefault();
      if (action === "first" || action === "last") {
        if (!lock.current.take(performance.now())) return;
        go(action === "first" ? 0 : count - 1, 0);
        if (action === "first" && lead) window.dispatchEvent(new CustomEvent("ch:hero", { detail: "film" }));
        return;
      }
      const dir: Dir = action === "next" ? 1 : -1;
      // The visible chapter's own scroller moves first, then the page hands off.
      const active = trackRef.current?.children[indexRef.current] as HTMLElement | undefined;
      const scroller = active?.querySelector<HTMLElement>("[data-allow-scroll]");
      if (scroller && scrollerCanMove(scroller, dir)) {
        scroller.scrollBy({ top: dir * scroller.clientHeight * 0.8, behavior: "smooth" });
        return;
      }
      commit(dir);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous[0];
      root.style.overscrollBehavior = previous[1];
      document.body.style.overscrollBehavior = previous[2];
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
      window.removeEventListener("keydown", onKey);
    };
  }, [commit, commitGesture, go, count, lead]);

  const stops = lead ? [lead, ...labels] : labels;
  const activeStop = lead ? (index === 0 ? (film ? 0 : 1) : index + 1) : index;
  const pickStop = (stop: number) => {
    if (!lead) return go(stop, 0);
    go(Math.max(0, stop - 1), 0);
    if (stop <= 1) window.dispatchEvent(new CustomEvent("ch:hero", { detail: stop === 0 ? "film" : "stories" }));
  };

  return (
    <Ctx.Provider value={{ index, go, next: () => commit(1), hashBeat, reportBeat, register, entry }}>
      <div>
        <div
          className="h-dvh overflow-hidden bg-field"
          onScroll={(event) => {
            // Anything that scrolls the clip (focus, find-in-page) snaps back to the active chapter.
            event.currentTarget.scrollTop = 0;
          }}
        >
          <div ref={trackRef}>{children}</div>
        </div>
        {index < count - 1 && (
          <button
            type="button"
            aria-label={film && index === 0 ? "Show the stories" : "Next section"}
            onClick={() => commit(1, false)}
            className="fixed right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 grid size-11 place-items-center rounded-full border border-pine/70 bg-paper text-pine shadow-[0_2px_10px_rgba(36,75,56,0.22)] transition-[background-color,color,transform] duration-150 hover:bg-pine hover:text-paper focus-visible:bg-pine focus-visible:text-paper active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100 md:right-auto md:bottom-5 md:left-1/2 md:-translate-x-1/2"
          >
            <ChevronDown className="size-5" strokeWidth={2.25} />
          </button>
        )}
        <ol className="fixed right-0 top-16 bottom-0 z-30 flex flex-col justify-center max-md:pb-16 md:right-1">
          {stops.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                data-testid="stop-dot"
                aria-label={label}
                aria-current={i === activeStop ? "true" : undefined}
                onClick={() => pickStop(i)}
                className="grid h-9 w-8 place-items-center md:h-11 md:w-9"
                // Long lists of stops share the height they have, so the dots never run into the header (the Next button sits in the middle, the dots at the edge).
                style={{ maxHeight: `max(1.5rem, calc((100dvh - 5rem) / ${stops.length}))` }}
              >
                <span
                  className={cn(
                    "block rounded-full transition-[width,height,background-color] duration-150 motion-reduce:transition-none",
                    i === activeStop ? "size-3 bg-leaf" : film && index === 0 ? "size-2.5 bg-paper/70" : "size-2.5 bg-pine/35",
                  )}
                />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </Ctx.Provider>
  );
}

export function Chapter({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={label} className={cn("group relative h-dvh w-full overflow-hidden", className)}>
      {children}
    </section>
  );
}
