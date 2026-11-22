/**
 * Bold and italic in the site's wording (asked for by John Petersen, 22 Nov 2026: "to at least see how changing the
 * mission statement to italics looks").
 *
 * A wording has three shapes, and this file turns one into another. Pure TypeScript with no imports, so it runs in
 * the browser, on the server and under `node --test`.
 *
 *   Stored    What the editor saves and the database holds: the text, with `<b>...</b>` around bold words and
 *             `<i>...</i>` around italic ones. Readable in the editor's lists and in the history. Nothing else in
 *             angle brackets means anything; it is shown as typed.
 *   Runs      The same wording as pieces, each bold, italic, both or neither. What the code works with.
 *   Marked    What sits in the site's content objects while a page is drawn: the plain text with one invisible
 *             character where bold switches on or off and another where italic does. The page's own drawing code
 *             (src/lib/jsx) turns those into <strong> and <em>.
 *
 * Why the marked shape is invisible. The site's code passes wording around as plain strings: into headings, but also
 * into the browser tab title, into picture descriptions, into the address of a section, through code that cuts a
 * sentence in two. Wherever a string reaches the screen as text, the marks become real bold and italic; wherever it
 * goes anywhere else they are taken out or, at worst, show as nothing. A visible mark could turn up as stray symbols.
 */

/** Marked shape: italic switches on or off here. (U+2061 and U+2064 are invisible and never allow a line break.) */
export const ITALIC = "⁡";
/** Marked shape: bold switches on or off here. */
export const BOLD = "⁤";

const MARK = /[⁡⁤]/;
const MARKS = /[⁡⁤]/g;
export const hasMarks = (text: string): boolean => MARK.test(text);
export const stripMarks = (text: string): string => (MARK.test(text) ? text.replace(MARKS, "") : text);

/**
 * The on-page editor's tag: an invisible separator, an entry's number in binary as two zero-width characters, the
 * separator again. In the editor's browser only, each wording carries one at its end so a click can tell which
 * entry it is. None of the three lets a line break at it.
 */
export const EDGE = "⁣";
export const ZERO = "⁠";
export const ONE = "‌";
export const TAG = new RegExp(`${EDGE}([${ZERO}${ONE}]+)${EDGE}`, "g");
export const tagOf = (n: number): string => EDGE + [...n.toString(2)].map((bit) => (bit === "1" ? ONE : ZERO)).join("") + EDGE;
export const numberOf = (bits: string): number => parseInt([...bits].map((c) => (c === ONE ? "1" : "0")).join(""), 2);

/**
 * Takes the site's own invisible characters out of text that came from outside (typed, pasted, or copied off a page
 * of the editor, which carries the tags). They must never be saved.
 */
export const stripInvisible = (text: string): string => text.replace(TAG, "").replace(/[⁡⁣⁤]/g, "");

export interface Run {
  text: string;
  bold: boolean;
  italic: boolean;
}

/** `<b>`, `</b>`, `<i>`, `</i>`; `<strong>` and `<em>` are read as the same two. */
const TOKEN = /<(\/?)(b|i|strong|em)>/gi;

const add = (runs: Run[], text: string, bold: boolean, italic: boolean) => {
  if (!text) return;
  const last = runs[runs.length - 1];
  if (last && last.bold === bold && last.italic === italic) last.text += text;
  else runs.push({ text, bold, italic });
};

/** Joins neighbours that look the same and drops empty pieces. */
export function tidy(runs: readonly Run[]): Run[] {
  const out: Run[] = [];
  for (const run of runs) add(out, run.text, run.bold, run.italic);
  return out;
}

/** Stored wording as pieces. A closing tag with nothing open is dropped; one left open runs to the end. */
export function runsOfStored(stored: string): Run[] {
  const runs: Run[] = [];
  let bold = false;
  let italic = false;
  let last = 0;
  for (const m of stored.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    add(runs, stored.slice(last, at), bold, italic);
    last = at + m[0].length;
    const on = m[1] === "";
    if (/^(b|strong)$/i.test(m[2])) bold = on;
    else italic = on;
  }
  add(runs, stored.slice(last), bold, italic);
  return runs;
}

/** Pieces as stored wording, italic nested inside bold where both apply. */
export function storedOf(runs: readonly Run[]): string {
  let out = "";
  let bold = false;
  let italic = false;
  for (const run of tidy(runs)) {
    if (italic && (!run.italic || run.bold !== bold)) {
      out += "</i>";
      italic = false;
    }
    if (bold && !run.bold) {
      out += "</b>";
      bold = false;
    }
    if (!bold && run.bold) {
      out += "<b>";
      bold = true;
    }
    if (!italic && run.italic) {
      out += "<i>";
      italic = true;
    }
    out += run.text;
  }
  if (italic) out += "</i>";
  if (bold) out += "</b>";
  return out;
}

/** Marked wording (as it sits in the page's content) as pieces. */
export function runsOfMarked(marked: string): Run[] {
  const runs: Run[] = [];
  let bold = false;
  let italic = false;
  let start = 0;
  for (let i = 0; i < marked.length; i++) {
    const c = marked[i];
    if (c !== BOLD && c !== ITALIC) continue;
    add(runs, marked.slice(start, i), bold, italic);
    if (c === BOLD) bold = !bold;
    else italic = !italic;
    start = i + 1;
  }
  add(runs, marked.slice(start), bold, italic);
  return runs;
}

/** Stored wording as it sits in the page's content. Text with no bold or italic comes back as it was. */
export function toMarked(stored: string): string {
  if (!stored.includes("<")) return stored;
  let out = "";
  let bold = false;
  let italic = false;
  for (const run of runsOfStored(stored)) {
    if (run.bold !== bold) {
      out += BOLD;
      bold = run.bold;
    }
    if (run.italic !== italic) {
      out += ITALIC;
      italic = run.italic;
    }
    out += run.text;
  }
  // Switched off again at the end, so a sentence put together from two wordings does not carry one's bold into the other.
  if (bold) out += BOLD;
  if (italic) out += ITALIC;
  return out;
}

/** What a stored wording says, with no bold or italic. */
export const plainOf = (stored: string): string => (stored.includes("<") ? stored.replace(TOKEN, "") : stored);

/** True when a stored wording has bold or italic in it. */
export const isFormatted = (stored: string): boolean => runsOfStored(stored).some((run) => run.bold || run.italic);

/**
 * One spelling for each wording, so two that look the same are the same text: spaces and line breaks at either end
 * removed (also inside the first and last tag), `<strong>`/`<em>` and capitals written as `<b>`/`<i>`, tags that
 * change nothing dropped.
 */
export function canonical(stored: string): string {
  if (!stored.includes("<")) return stored.trim();
  const runs = runsOfStored(stored);
  while (runs.length && !runs[0].text.trimStart()) runs.shift();
  while (runs.length && !runs[runs.length - 1].text.trimEnd()) runs.pop();
  if (!runs.length) return "";
  runs[0].text = runs[0].text.trimStart();
  runs[runs.length - 1].text = runs[runs.length - 1].text.trimEnd();
  return storedOf(runs);
}
