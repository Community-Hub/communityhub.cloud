import { useEffect, useLayoutEffect, useRef, useState } from "react";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const same = (a: number[], b: number[]) => a.length === b.length && a.every((n, i) => n === b[i]);

/**
 * How many items of a list go on each screen so that no screen needs to scroll.
 * Each screen's list is a `<ul data-fit="group">` inside a DocSection. Item heights, the room above and below the
 * list, and the grid columns are measured from the page itself, so it holds for any viewport and type size.
 * The first render (and the server) use `fallback`.
 */
export function useFitPages(group: string, total: number, fallback: number[]) {
  const [sizes, setSizes] = useState(fallback);
  const [tick, setTick] = useState(0);
  const runs = useRef({ tick: -1, n: 0 });

  useEffect(() => {
    // Resize fires many times a frame while a window is dragged; measure once per frame at most.
    let frame = 0;
    const bump = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setTick((n) => n + 1);
      });
    };
    window.addEventListener("resize", bump);
    void document.fonts?.ready.then(bump);
    return () => {
      window.removeEventListener("resize", bump);
      cancelAnimationFrame(frame);
    };
  }, []);

  useIsoLayoutEffect(() => {
    // A guard against two layouts that keep choosing each other: a few passes per trigger, then stop.
    if (runs.current.tick !== tick) runs.current = { tick, n: 0 };
    if (++runs.current.n > 6) return;
    const lists = [...document.querySelectorAll<HTMLElement>(`[data-fit="${group}"]`)];
    if (!lists.length) return;
    const lis = lists.flatMap((ul) => [...ul.children] as HTMLElement[]);
    // Natural height of every item, whichever row it sits in now.
    const saved = lis.map((li) => li.style.alignSelf);
    lis.forEach((li) => (li.style.alignSelf = "start"));
    const heights = lis.map((li) => li.getBoundingClientRect().height);
    lis.forEach((li, i) => (li.style.alignSelf = saved[i]));
    if (heights.length !== total) return;

    const room = (ul: HTMLElement) => {
      const scroller = ul.closest<HTMLElement>("[data-allow-scroll]");
      const wrap = ul.closest<HTMLElement>(".wrap");
      if (!scroller || !wrap) return 0;
      const u = ul.getBoundingClientRect();
      return scroller.clientHeight - (u.top - scroller.getBoundingClientRect().top) - (wrap.getBoundingClientRect().bottom - u.bottom) - 4;
    };
    const first = room(lists[0]);
    const rest = lists[1] ? room(lists[1]) : first;
    const style = getComputedStyle(lists[0]);
    const cols = Math.max(1, style.gridTemplateColumns.split(" ").length);
    const gap = parseFloat(style.rowGap) || 0;

    // Pages hold whole rows, so rows are the same on every page.
    const rows: number[] = [];
    for (let i = 0; i < total; i += cols) rows.push(Math.max(...heights.slice(i, i + cols)));
    const next: number[] = [];
    let r = 0;
    while (r < rows.length) {
      const limit = next.length === 0 ? first : rest;
      // The first screen may hold no items at all when its heading and lede leave no room for a row.
      if (next.length === 0 && rows[r] > limit) {
        next.push(0);
        continue;
      }
      let used = rows[r];
      let n = 1;
      while (r + n < rows.length && used + gap + rows[r + n] <= limit) {
        used += gap + rows[r + n];
        n++;
      }
      next.push(Math.min(n * cols, total - r * cols));
      r += n;
    }
    setSizes((cur) => (same(cur, next) ? cur : next));
  }, [group, total, sizes, tick]);

  return sizes;
}

/** "3" for one item, "3 to 5" for several. */
export const range = (from: number, to: number) => (from === to ? `${from}` : `${from} to ${to}`);

/** Cut a list into the page sizes from `useFitPages`. */
export function paginate<T>(items: readonly T[], sizes: number[]) {
  let at = 0;
  return sizes.map((size) => {
    const page = items.slice(at, at + size);
    const from = at + 1;
    at += size;
    return { from, to: at > items.length ? items.length : at, items: page };
  });
}
