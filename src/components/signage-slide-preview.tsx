import { useEffect, useRef, useState } from "react";
import { usePreviewRotation } from "@/lib/use-preview-rotation";

const slides = [
  { src: "/assets/signage-live/citywide.png", label: "Citywide Dashboard", location: "Oberlin", alt: "Oberlin Citywide Dashboard captured from the school digital sign" },
  { src: "/assets/signage-live/story-content.png", label: "Story Content", location: "Energy Use", alt: "Energy Use story playing on the school digital sign" },
  { src: "/assets/signage-live/events-calendar.png", label: "Events Calendar", location: "Oberlin community events", alt: "Community event playing on the school digital sign" },
  { src: "/assets/signage-live/community-voices.png", label: "Community Voices", location: "Oberlin community members", alt: "Community Voices slide playing on the school digital sign" },
  { src: "/assets/signage-live/live-data.png", label: "Live Data", location: "Oberlin Elementary — electricity use", alt: "Electricity-use graph captured from the school digital sign" },
  { src: "/assets/signage-live/ops-elementary.png?v=2", label: "OPS Elementary", location: "School-specific content", alt: "Oberlin Elementary school-specific slide from its digital sign" },
];

export function SignageSlidePreview() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(3);
  const [position, setPosition] = useState(0);
  usePreviewRotation(ref, () => setPosition(p => p + 1), slides.length > visible, position, undefined, false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setVisible(entry.contentRect.width >= 720 ? 3 : entry.contentRect.width >= 440 ? 2 : 1);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} data-signage-slide-preview className="mt-3 shrink-0 border-t border-pine/20 pt-4">
    <h3 className="t-h3">Examples of content on the screen</h3>
    <p className="mt-1 mb-3 t-small text-ink/70">Examples captured from Oberlin Elementary’s digital sign, using each controller selection.</p>
    <div className="overflow-hidden">
      <div className="flex" style={{ transform: `translateX(-${position * 100 / visible}%)`, transition: position === 0 ? "none" : "transform 600ms ease" }} onTransitionEnd={() => { if (position >= slides.length) setPosition(0); }}>
        {[...slides, ...slides.slice(0, visible)].map((slide, i) => <figure key={`${slide.src}-${i}`} aria-hidden={i < position || i >= position + visible} className="min-w-0 shrink-0 px-2" style={{ width: `${100 / visible}%` }}>
          <img src={slide.src} alt={slide.alt} className="h-36 w-full rounded object-contain object-left md:h-[clamp(7rem,18dvh,12rem)]" />
          <figcaption className="mt-2 t-small font-semibold">{slide.label}<span className="mt-1 block font-normal text-ink/70">{slide.location}</span></figcaption>
        </figure>)}
      </div>
    </div>
  </div>;
}
