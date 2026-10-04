/** Reveal only the horizontal tab strip; never scroll the surrounding story/page. */
export function revealTabWithinList(list: HTMLElement, tab: HTMLElement): void {
  if (list.scrollWidth <= list.clientWidth) return;
  const listRect = list.getBoundingClientRect();
  const tabRect = tab.getBoundingClientRect();
  const left = tabRect.left - listRect.left + list.scrollLeft;
  const right = left + tabRect.width;
  if (left < list.scrollLeft) list.scrollLeft = Math.max(0, left);
  else if (right > list.scrollLeft + list.clientWidth)
    list.scrollLeft = Math.min(list.scrollWidth - list.clientWidth, right - list.clientWidth);
}
