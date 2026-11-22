/**
 * Draws bold and italic. Every piece of the site's own page code passes through here when it makes an element (see
 * jsx-runtime.ts and the `jsxImportSource` setting in vite.config.ts), so no page has to do anything to show an
 * editor's formatting: wherever a wording reaches the screen as text, its marks become <strong> and <em>.
 *
 * Wording with no marks, which is all of it until an editor makes something bold or italic, is handed on untouched.
 * This file keeps nothing between calls, so it does not matter how many copies of it the build makes.
 */
import { createElement, Fragment, type ReactNode } from "react";
import { hasMarks, runsOfMarked, stripMarks } from "../cms/marks.ts";

/** Elements whose content can only be text. */
const TEXT_ONLY = new Set(["title", "option", "textarea", "script", "style", "noscript"]);
/** Attributes that are read, not drawn: a description for a screen reader, a hint in a field. Marks are taken out. */
const TEXT_PROPS = ["alt", "title", "aria-label", "aria-description", "aria-valuetext", "aria-roledescription", "aria-placeholder", "placeholder", "content", "label", "summary", "value", "defaultValue"];

/** One marked wording as elements. */
export function richNode(marked: string, key?: string): ReactNode {
  const pieces = runsOfMarked(marked).map((run) => {
    if (!run.bold && !run.italic) return run.text;
    const inner = run.italic ? createElement("em", null, run.text) : run.text;
    return run.bold ? createElement("strong", null, inner) : inner;
  });
  return createElement(Fragment, key === undefined ? null : { key }, ...pieces);
}

function fixChildren(children: unknown, textOnly: boolean): unknown {
  if (typeof children === "string") return hasMarks(children) ? (textOnly ? stripMarks(children) : richNode(children)) : children;
  if (!Array.isArray(children)) return children;
  let out: unknown[] | null = null;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    let next = child;
    if (typeof child === "string") {
      if (hasMarks(child)) next = textOnly ? stripMarks(child) : richNode(child, `rich-${i}`);
    } else if (Array.isArray(child)) {
      next = fixChildren(child, textOnly);
    }
    if (next !== child) (out ??= children.slice())[i] = next;
  }
  return out ?? children;
}

/** The props an element is really made with: marked text among its children drawn, marked text in its attributes cleaned. */
export function fix<P>(type: unknown, props: P): P {
  if (props === null || typeof props !== "object") return props;
  const given = props as Record<string, unknown>;
  const host = typeof type === "string";
  let next = given;
  const children = given.children;
  if (typeof children === "string" || Array.isArray(children)) {
    const fixed = fixChildren(children, host && TEXT_ONLY.has(type as string));
    if (fixed !== children) next = { ...given, children: fixed };
  }
  if (host) {
    for (const name of TEXT_PROPS) {
      const value = given[name];
      if (typeof value !== "string" || !hasMarks(value)) continue;
      if (next === given) next = { ...given };
      next[name] = stripMarks(value);
    }
  }
  return next as P;
}
