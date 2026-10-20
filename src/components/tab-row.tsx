import { SliderArrows } from "@/components/slider-arrows";
import { useInnerStep } from "@/components/storyboard";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Props for the one panel a TabRow controls (WAI-ARIA tabs): spread onto the element that shows the chosen item. */
export const tabPanel = (idBase: string, itemId: string) =>
  ({ role: "tabpanel", id: `${idBase}-panel`, "aria-labelledby": `${idBase}-tab-${itemId}` }) as const;

/** A link row of items with a < > pager. The green arrow marks a link; the chosen item is dark and underlined. On a phone the row wraps so every tab shows; on wider screens it scrolls the chosen item into view. */
export function TabRow({
  idBase,
  label,
  noun,
  items,
  at,
  onPick,
  arrows = false,
}: {
  /** Unique on the page; ties each tab to the panel from `tabPanel`. */
  idBase: string;
  label: string;
  noun: string;
  items: readonly { id: string; name: string }[];
  at: number;
  onPick: (next: number) => void;
  /** The < > pair beside the row. Off where another pager sits right under the tabs, so the two are not mistaken for each other. */
  arrows?: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // Scroll walks the items first and hands the page on at either end (no wrap).
  useInnerStep(rootRef, (dir) => {
    const next = at + dir;
    if (next < 0 || next >= items.length) return false;
    onPick(next);
    return true;
  });
  useEffect(() => {
    const row = rowRef.current;
    const tab = row?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (row && tab) row.scrollTo({ left: row.scrollLeft + tab.getBoundingClientRect().left - row.getBoundingClientRect().left, behavior: "smooth" });
    // Wheel, keys and swipe step the tabs too: if focus is in the row it follows the chosen tab, so the change is announced.
    if (row && tab && row.contains(document.activeElement) && document.activeElement !== tab) tab.focus({ preventScroll: true });
  }, [at]);
  const onKeyDown = (event: React.KeyboardEvent) => {
    const to = { ArrowRight: at + 1, ArrowLeft: at - 1, Home: 0, End: items.length - 1 }[event.key];
    if (to === undefined) return;
    event.preventDefault();
    onPick(to);
  };
  return (
    <div ref={rootRef} className="flex items-center border-b border-pine/25">
      <div ref={rowRef} role="tablist" aria-label={label} onKeyDown={onKeyDown} style={{ touchAction: "pan-x" }} className="flex min-w-0 flex-1 gap-x-6 [scrollbar-width:none] max-md:flex-wrap max-md:gap-x-4 md:overflow-x-auto">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${idBase}-tab-${item.id}`}
            aria-controls={`${idBase}-panel`}
            aria-selected={i === at}
            tabIndex={i === at ? 0 : -1}
            onClick={() => onPick(i)}
            className={cn("flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap t-body transition-colors duration-150 motion-reduce:transition-none short:min-h-10", i === at ? "font-bold text-ink" : "text-ink/70 hover:text-ink")}
          >
            <span aria-hidden="true" className="text-pine">
              →
            </span>
            <span className={cn("py-0.5", i === at && "border-b-2 border-ink")}>{item.name}</span>
          </button>
        ))}
      </div>
      {/* On a phone every tab is on screen (the row wraps), so the pair of arrows is not needed there. */}
      {arrows && <div className="max-md:hidden">
        <SliderArrows onPrev={() => onPick(at - 1)} onNext={() => onPick(at + 1)} labels={{ prev: `Previous ${noun}`, next: `Next ${noun}` }} />
      </div>}
    </div>
  );
}

/** The pager mounts inside its content card and flanks it with side controls. */
export function TabPager({noun, at, onPick}: {noun: string; at: number; onPick: (next: number) => void}) {
  return <div data-tab-pager>
    <SliderArrows onPrev={() => onPick(at - 1)} onNext={() => onPick(at + 1)} labels={{prev: `Previous ${noun}`, next: `Next ${noun}`}} />
  </div>;
}
