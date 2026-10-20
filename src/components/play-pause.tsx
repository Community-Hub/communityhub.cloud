import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { circleButton } from "@/components/slider-arrows";

/**
 * Whether something that moves on its own is running. It starts paused when the visitor asks for reduced motion
 * (and follows the setting if it changes); the visitor can still press Play.
 */
export function useAutoplay() {
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (q.matches) setPlaying(false);
    const sync = () => setPlaying(!q.matches);
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);
  return [playing, setPlaying] as const;
}

/** The one Pause / Play control for anything that advances on its own. The label says what pressing it does. */
export function PlayPauseButton({
  playing,
  onToggle,
  labels,
  className,
}: {
  playing: boolean;
  onToggle: () => void;
  labels: { pause: string; play: string };
  className?: string;
}) {
  const label = playing ? labels.pause : labels.play;
  return (
    <button type="button" aria-label={label} title={label} data-control="playpause" data-playing={playing} className={className ?? circleButton} onClick={onToggle}>
      {playing ? <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" aria-hidden><path d="M8 5v14M16 5v14" /></svg> : <Play className="size-5" strokeWidth={2.25} aria-hidden />}
    </button>
  );
}
