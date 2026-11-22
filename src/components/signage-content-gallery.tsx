import { useEffect, useRef, useState } from "react";
import { usePreviewRotation } from "@/lib/use-preview-rotation";
import { txt } from "@/lib/page-text/signageContentGallery";

const examples = [
  { src: "/assets/sign-farmers-market.jpg", get label() { return txt.label1; }, get alt() { return txt.alt1; } },
  { src: "/assets/cv-slideshow-shot.jpg", get label() { return txt.label2; }, get alt() { return txt.alt2; } },
  { src: "/assets/originals/kahn-dashboard-slide68.jpg", get label() { return txt.label3; }, get alt() { return txt.alt3; } },
  { src: "/assets/cwd-thumb.jpg", get label() { return txt.label4; }, get alt() { return txt.alt4; } },
  { src: "/assets/source-previews/oberlin-stories-heating-original.png", get label() { return txt.label5; }, get alt() { return txt.alt5; } },
  { src: "/assets/source-previews/glsc-stories-climate-original.png", get label() { return txt.label6; }, get alt() { return txt.alt6; } },
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
      <h2 className="t-h3">{txt.h21}</h2>

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
