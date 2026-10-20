import { useEffect, useRef, useState, type RefObject } from "react";
import { useAutoplay } from "@/components/play-pause";

// Shared homepage gallery interval requested during the live review.
export const PREVIEW_INTERVAL = 8000;

/** Automatic examples never interrupt reading, keyboard use, or an active embedded dashboard. */
export function usePreviewRotation(ref: RefObject<HTMLElement | null>, advance: () => void, enabled: boolean, resetKey: string | number, interval: number | null = PREVIEW_INTERVAL, pauseOnInteraction = true) {
  const [playing, setPlaying] = useAutoplay();
  const [engaged, setEngaged] = useState(false);
  const [visible, setVisible] = useState(false);
  const [background, setBackground] = useState(false);
  const action = useRef(advance);
  action.current = advance;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let hovering = false;
    let focusing = false;
    const sync = () => setEngaged(hovering || focusing);
    const enter = (e: PointerEvent) => { if (e.pointerType === "mouse") { hovering = true; sync(); } };
    const leave = () => {
      hovering = false;
      const active = document.activeElement;
      focusing = active instanceof Element && el.contains(active) && active.matches(":focus-visible");
      sync();
    };
    // Pointer focus must not latch the hover pause after the mouse leaves.
    // Keyboard focus still pauses the preview for reading and operating controls.
    const focus = (event: FocusEvent) => {
      focusing = event.target instanceof Element && event.target.matches(":focus-visible");
      sync();
    };
    const pointer = () => { focusing = false; sync(); };
    const blur = (e: FocusEvent) => { focusing = e.relatedTarget instanceof Element && el.contains(e.relatedTarget) && e.relatedTarget.matches(":focus-visible"); sync(); };
    const hidden = () => setBackground(document.hidden);
    const io = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), { threshold: 0.4 });
    io.observe(el);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focusin", focus);
    el.addEventListener("pointerdown", pointer);
    el.addEventListener("focusout", blur);
    document.addEventListener("visibilitychange", hidden);
    return () => { io.disconnect(); el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave); el.removeEventListener("focusin", focus); el.removeEventListener("pointerdown", pointer); el.removeEventListener("focusout", blur); document.removeEventListener("visibilitychange", hidden); };
  }, [ref, enabled]);
  const interactionPaused = pauseOnInteraction && engaged;
  useEffect(() => {
    if (!enabled || !visible || interactionPaused || !playing || background || interval === null) return;
    const timer = window.setTimeout(() => action.current(), interval);
    return () => window.clearTimeout(timer);
  }, [enabled, visible, interactionPaused, playing, background, resetKey, interval]);
  return { playing, running: enabled && visible && !interactionPaused && playing && !background, toggle: () => setPlaying(p => !p) };
}
