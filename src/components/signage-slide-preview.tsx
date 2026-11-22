import { useEffect, useRef, useState } from "react";
import { usePreviewRotation } from "@/lib/use-preview-rotation";
import { txt } from "@/lib/page-text/signageSlidePreview";

const slides = [
  { src: "/assets/signage-live/citywide.png", get label() { return txt.label1; }, location: "Oberlin", get alt() { return txt.alt1; } },
  { src: "/assets/signage-live/story-content.png", get label() { return txt.label2; }, get location() { return txt.location1; }, get alt() { return txt.alt2; } },
  { src: "/assets/signage-live/events-calendar.png", get label() { return txt.label3; }, get location() { return txt.location2; }, get alt() { return txt.alt3; } },
  { src: "/assets/signage-live/community-voices.png", get label() { return txt.label4; }, get location() { return txt.location3; }, get alt() { return txt.alt4; } },
  { src: "/assets/signage-live/live-data.png", get label() { return txt.label5; }, get location() { return txt.location4; }, get alt() { return txt.alt5; } },
  { src: "/assets/signage-live/ops-elementary.png?v=2", get label() { return txt.label6; }, get location() { return txt.location5; }, get alt() { return txt.alt6; } },
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
    <h3 className="t-h3">{txt.h31}</h3>
    <p className="mt-1 mb-3 t-small text-ink/70">{txt.p1}</p>
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
