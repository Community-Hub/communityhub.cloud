/** DOM helpers retain nullable queries and narrow nodes at browser event boundaries. */
export function $<K extends keyof HTMLElementTagNameMap>(
  selector: K,
  root?: ParentNode | null,
): HTMLElementTagNameMap[K] | null;
export function $(
  selector: string,
  root?: ParentNode | null,
): HTMLElement | null;
export function $<T extends Element = HTMLElement>(
  selector: string,
  root?: ParentNode | null,
): T | null;
export function $(
  selector: string,
  root: ParentNode | null = document,
): Element | null {
  return (root || document).querySelector(selector);
}
export function $$<K extends keyof HTMLElementTagNameMap>(
  selector: K,
  root?: ParentNode | null,
): HTMLElementTagNameMap[K][];
export function $$(selector: string, root?: ParentNode | null): HTMLElement[];
export function $$<T extends Element = HTMLElement>(
  selector: string,
  root?: ParentNode | null,
): T[];
export function $$(
  selector: string,
  root: ParentNode | null = document,
): Element[] {
  return Array.from((root || document).querySelectorAll(selector));
}
export function isPresent<T>(value: T | null | undefined): value is T {
  return value != null;
}
export function required<T>(value: T | null | undefined): T {
  if (value == null)
    throw new Error("Required Community Hub component element is missing");
  return value;
}
export function eventElement(event: Event): Element | null {
  const target = event.target;
  return target instanceof Element
    ? target
    : target instanceof Node
      ? target.parentElement
      : null;
}
export function formValue(form: HTMLFormElement, name: string): string {
  const field = form.elements.namedItem(name);
  return field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement ||
    field instanceof HTMLSelectElement
    ? field.value
    : "";
}
export function htmlChildren(parent: Element): HTMLElement[] {
  return Array.from(parent.children).filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );
}
