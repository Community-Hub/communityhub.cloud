import { useEffect, useState } from "react";
import { EmbedLoading, useEmbedReady, useEmbedShield } from "@/components/guarded-embed";
import { useAutoplay } from "@/components/play-pause";
import voicesFilters from "@/data/voices-filters.json";

/** Seconds per filter come from the data file (16 s: four 4-second slides of the player). */
const FILTER_MS = (voicesFilters.rotation.secondsPerFilter ?? 16) * 1000;

/** True while the pointer (mouse only), keyboard focus or the viewport says "leave it alone". */
function useEngagement(el: HTMLElement | null) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!el) {
      setVisible(false);
      return;
    }
    const enter = (e: PointerEvent) => e.pointerType === "mouse" && setHover(true);
    const leave = () => setHover(false);
    const fin = () => setFocus(true);
    const fout = (e: FocusEvent) => setFocus(el.contains(e.relatedTarget as Node | null));
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focusin", fin);
    el.addEventListener("focusout", fout);
    const io = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), { threshold: 0.4 });
    io.observe(el);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", fin);
      el.removeEventListener("focusout", fout);
      io.disconnect();
    };
  }, [el]);
  return hover || focus || !visible;
}

/**
 * The Community Voices filters, one after another: the player's address changes every 16 s.
 * Rotation stops on hover, on focus, off screen, when `enabled` is false and when the visitor pauses it (it starts paused under reduced motion).
 * `ref` goes on the element whose hover, focus and visibility count.
 */
export function useVoicesRotation(enabled = true) {
  const [n, setN] = useState(0);
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [playing, setPlaying] = useAutoplay();
  const engaged = useEngagement(el);
  const filters = voicesFilters.filters;
  useEffect(() => {
    if (!enabled || engaged || !playing) return;
    const t = window.setTimeout(() => setN((x) => (x + 1) % filters.length), FILTER_MS);
    return () => window.clearTimeout(t);
  }, [enabled, engaged, playing, n, filters.length]);
  return { filter: filters[n % filters.length], ref: setEl, playing, toggle: () => setPlaying((p) => !p) };
}

/** The real Community Voices player, used as is: it has its own arrows. */
export function VoicesPane({ src, title }: { src: string; title: string }) {
  const [ready, setReady] = useEmbedReady();
  const { shield, boxProps } = useEmbedShield();
  return (
    <div aria-busy={!ready} {...boxProps} className="absolute inset-0 bg-paper">
      <EmbedLoading ready={ready} />
      {shield}
      <iframe src={src} title={title} loading="lazy" allow="autoplay" onLoad={setReady} className="absolute inset-0 size-full border-0" />
    </div>
  );
}
