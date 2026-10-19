import { useEffect, useRef, useState } from "react";
import { usePreviewRotation } from "@/lib/use-preview-rotation";

const examples = [
  { src: "/assets/sign-farmers-market.jpg", label: "Community Calendar", alt: "Oberlin Farmers Market event on a digital sign" },
  { src: "/assets/cv-slideshow-shot.jpg", label: "Community Voices", alt: "Community Voices message from Mike Cariglio of Lorenzo’s Pizza" },
  { src: "/assets/originals/kahn-dashboard-slide68.jpg", label: "Building Dashboard", alt: "Kahn Hall whole-building water use visualization" },
  { src: "/assets/cwd-thumb.jpg", label: "Citywide Dashboard", alt: "Oberlin citywide electricity, water and environmental conditions" },
  { src: "/assets/source-previews/oberlin-stories-heating-original.png", label: "Stories: campus heating", alt: "Oberlin College heating and cooling story" },
  { src: "/assets/source-previews/glsc-stories-climate-original.png", label: "Stories: climate", alt: "Great Lakes Science Center story explaining the greenhouse effect" },
];

export function SignageContentGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(3);
  const [position, setPosition] = useState(0);
  usePreviewRotation(ref, () => setPosition(p => p + 1), examples.length > visible, position, undefined, false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setVisible(entry.contentRect.width >= 720 ? 3 : entry.contentRect.width >= 440 ? 2 : 1);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} data-signage-content-gallery className="mt-3 border-t border-pine/20 pt-4">
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="t-h3">What the screen shows</h2>

    </div>
    <div className="overflow-hidden">
      <div className="flex motion-reduce:transition-none" style={{ transform: `translateX(-${position * 100 / visible}%)`, transition: position === 0 ? "none" : "transform 600ms ease" }} onTransitionEnd={() => { if (position >= examples.length) setPosition(0); }}>
        {[...examples, ...examples.slice(0, visible)].map((example, i) => <figure key={`${example.src}-${i}`} aria-hidden={i < position || i >= position + visible} className="min-w-0 shrink-0 px-2" style={{width: `${100 / visible}%`}}>
          <img src={example.src} alt={example.alt} className="h-36 w-full rounded object-contain object-left md:h-[clamp(7rem,18dvh,12rem)]" />
          <figcaption className="mt-2 t-small font-semibold">{example.label}</figcaption>
        </figure>)}
      </div>
    </div>
  </div>;
}
