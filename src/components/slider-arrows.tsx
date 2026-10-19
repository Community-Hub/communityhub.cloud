import { ChevronLeft, ChevronRight } from "lucide-react";

/** The one control: a single circle, 44px, that fills with pine on hover and focus. */
export const circleButton =
  "grid size-11 shrink-0 place-items-center rounded-full border-2 border-pine bg-paper text-pine transition-colors duration-150 hover:bg-pine hover:text-paper focus-visible:bg-pine focus-visible:text-paper";

/**
 * Shared rectangular arrows, centered inside the left and right edges of the content they control.
 */
export function SliderArrows({
  onPrev,
  onNext,
  labels,
}: {
  onPrev: () => void;
  onNext: () => void;
  labels: { prev: string; next: string };
}) {
  return (
    <div data-slider-controls data-slider-arrows className="flex shrink-0 gap-2">
      <button type="button" aria-label={labels.prev} data-control="prev" className="slider-arrow-button" onClick={onPrev}>
        <ChevronLeft className="size-5" strokeWidth={2.25} />
      </button>
      <button type="button" aria-label={labels.next} data-control="next" className="slider-arrow-button" onClick={onNext}>
        <ChevronRight className="size-5" strokeWidth={2.25} />
      </button>
    </div>
  );
}
