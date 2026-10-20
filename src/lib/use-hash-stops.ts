import { useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

/**
 * Keeps a pager's current stop and the URL hash in step.
 * - the hash opens its stop on load, on Link navigation and on Back/Forward
 * - settling on a stop rewrites the hash with replace, so Back leaves the page instead of walking stops
 * Hash form: "#stop" or "#stop/detail".
 */
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
  const router = useRouter();
  const hash = useRouterState({ select: (s) => s.location.hash });
  const pending = useRef<number | null>(null);
  const [stop, detail = ""] = hash.split("/");

  useEffect(() => {
    const i = stopIndex(ids, stop);
    if (i >= 0 && i !== index) {
      pending.current = i;
      go(i);
    }
    // Also re-read when the stops themselves change (a split that settles after a deep link was read).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop, ids.join("|")]);

  useEffect(() => {
    if (pending.current !== null) {
      if (pending.current !== index) return;
      pending.current = null;
    }
    if (!ids[index]) return; // the position is past the stops; the pager is about to clamp it
    const current = router.state.location.hash.split("/")[0];
    if (current === ids[index] || (index === 0 && !current)) return;
    // "/demos#glsc" names something inside the first stop; leave it for that stop to read.
    if (index === 0 && stopIndex(ids, current) < 0) return;
    void router.navigate({
      // The current path, not ".": on a page that matches no route "." resolves to the home page.
      to: router.state.location.pathname,
      hash: ids[index],
      replace: true,
      hashScrollIntoView: false,
      resetScroll: false,
    } as never);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, ids[index]]);

  return detail;
}

/** Writes "#stop/detail" without moving the stop. */
export function useWriteDetail() {
  const router = useRouter();
  return (stop: string, detail: string) => {
    if (router.state.location.hash === `${stop}/${detail}`) return;
    void router.navigate({
      // The current path, not ".": on a page that matches no route "." resolves to the home page.
      to: router.state.location.pathname,
      hash: `${stop}/${detail}`,
      replace: true,
      hashScrollIntoView: false,
      resetScroll: false,
    } as never);
  };
}

/**
 * The example or tab the address names: "#stop/detail", or a bare "#detail" that is not a stop
 * (older links such as "/demos#glsc" and "/building-dashboard#kahn-hall").
 */
export function useOpenId(ids: readonly string[]) {
  const hash = useRouterState({ select: (s) => s.location.hash });
  const [stop, detail = ""] = hash.split("/");
  return detail || (stop && !ids.includes(stop) ? stop : "");
}
