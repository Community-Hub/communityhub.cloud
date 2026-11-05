import { useEffect, useState } from "react";

let pendingTarget = "";
let activeDetail = "";
const detailListeners = new Set<() => void>();

function setDetailInternal(next: string) {
  if (activeDetail === next) return;
  activeDetail = next;
  detailListeners.forEach((fn) => fn());
}

/**
 * Records an in-page navigation target (chapter, tab, or section id) in memory
 * so internal navigation never dirties the browser URL with a `#fragment`.
 */
export function setNavigationTarget(target: string) {
  const cleaned = target.replace(/^#/, "");
  pendingTarget = cleaned;
  if (typeof window !== "undefined" && cleaned) {
    window.dispatchEvent(new CustomEvent("ch:target", { detail: cleaned }));
  }
}

/**
 * Reads and clears any pending navigation target (or strips an initial URL `#hash`
 * from the address bar and returns its value).
 */
export function consumeNavigationTarget(): string {
  let target = pendingTarget;
  pendingTarget = "";
  if (typeof window !== "undefined" && window.location.hash) {
    const rawHash = window.location.hash.replace(/^#/, "");
    if (!target) target = rawHash;
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + window.location.search,
    );
  }
  return target;
}

/**
 * Stops that hold a run of items are named by their first item ("lessons-from-19"; the first stop is just "lessons"),
 * so a link survives a different split. A name the current split lacks resolves to the stop holding that item.
 */
export function stopIndex(ids: readonly string[], stop: string) {
  const exact = ids.indexOf(stop);
  if (exact >= 0) return exact;
  const m = /^(.+)-from-(\d+)$/.exec(stop);
  if (!m) return -1;
  const [, base, n] = m;
  let best = -1;
  let bestFrom = 0;
  ids.forEach((id, i) => {
    const from = id === base ? 1 : id.startsWith(`${base}-from-`) ? Number(id.slice(base.length + 6)) : 0;
    if (from > 0 && from <= Number(n) && from >= bestFrom) {
      best = i;
      bestFrom = from;
    }
  });
  return best;
}

export function useHashStops({ ids, index, go }: { ids: readonly string[]; index: number; go: (i: number) => void }) {
  const [detail, setDetail] = useState(activeDetail);

  useEffect(() => {
    const sync = () => setDetail(activeDetail);
    detailListeners.add(sync);
    return () => {
      detailListeners.delete(sync);
    };
  }, []);

  useEffect(() => {
    const applyTarget = (raw: string) => {
      if (!raw) return;
      const normalized = raw.startsWith("orb") && ids.includes("educate") ? "educate/building" : raw;
      const [stop, ...rest] = normalized.split("/");
      const nextDetail = rest.join("/");
      const i = stopIndex(ids, stop);
      if (i >= 0) {
        if (i !== index) go(i);
        setDetailInternal(nextDetail);
      } else if (stop) {
        setDetailInternal(normalized);
      }
    };

    const initial = consumeNavigationTarget();
    if (initial) applyTarget(initial);

    const onTarget = (event: Event) => {
      const target = (event as CustomEvent<string>).detail;
      consumeNavigationTarget();
      if (target) applyTarget(target);
    };
    const onHashChange = () => {
      const hashTarget = consumeNavigationTarget();
      if (hashTarget) applyTarget(hashTarget);
    };

    window.addEventListener("ch:target", onTarget);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("ch:target", onTarget);
      window.removeEventListener("hashchange", onHashChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join("|")]);

  return detail;
}

/** Updates the active beat/detail in memory without writing a `#` hash to the browser URL. */
export function useWriteDetail() {
  return (_stop: string, detail: string) => {
    setDetailInternal(detail);
  };
}

export function useOpenId(_ids: readonly string[]) {
  const [detail, setDetail] = useState(activeDetail);
  useEffect(() => {
    const sync = () => setDetail(activeDetail);
    detailListeners.add(sync);
    return () => {
      detailListeners.delete(sync);
    };
  }, []);
  return detail;
}
