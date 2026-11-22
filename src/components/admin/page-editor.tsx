import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import type { AdminSlot, Overview } from "@/lib/cms/service";
import type { CmsState } from "@/lib/cms/core";
import { canonical, isFormatted, numberOf, plainOf, runsOfStored, storedOf, stripInvisible, stripMarks, TAG, tagOf, type Run } from "@/lib/cms/marks";
import { lengthWarning } from "@/lib/cms/validate";
import { siteIndex } from "@/lib/site-registry";
import { errorText, get, post } from "./api";

/**
 * Editing on the page (the owner, 21 Nov 2026: the editor should look like the site itself, "so that they will know
 * what they are editing and how it will look like on the actual page").
 *
 * On the editor's own address a signed-in editor opens the site's real pages. This draws a small bar at the bottom of
 * the screen and, in "Edit text" mode, lets them click any wording to change it where it sits. Nothing here is loaded
 * by the public site.
 *
 * How a click finds what to save. The editor already lists every editable wording (the same list as "Words and
 * links"). Here, in this browser only, each of those wordings gets an invisible tag at its end saying which entry it
 * is, and the page redraws once. A piece of text on the page that carries a tag is that entry, exactly: the heading
 * "Pricing" and a menu item that also says "Pricing" are told apart. After a save, only the text carrying that tag
 * changes. Text the site's code reshapes before showing it loses its tag; that falls back to matching what it says,
 * and when the same words are used in more than one place the likeliest is offered and the others can be chosen.
 *
 * Bold and italic (John Petersen, 22 Nov 2026). The card shows the wording as it will look, with a B and an I button:
 * select some words and press one, or press one with nothing selected to change the whole wording. What is saved is
 * the text with <b> and <i> around those words (src/lib/cms/marks.ts), and the page draws it as real bold and italic.
 * A wording with bold in the middle is drawn in several pieces; its tag is still at its end, so a click anywhere in
 * it finds the next tag after the click.
 */

// The tag (src/lib/cms/marks.ts): an invisible separator, the entry's number in binary, the separator again.
const untagged = (text: string) => stripMarks(text.replace(TAG, ""));
const norm = (text: string) => untagged(text).replace(/\s+/g, " ").trim();
/** What a wording says, as the page shows it: no tags, no bold or italic. */
const said = (slot: AdminSlot) => norm(plainOf(slot.value));

const SKIP = "[data-cms-ui], script, style, noscript, textarea, input, select, option, iframe, svg, [contenteditable='true']";
/** One run of reading: a paragraph, a heading, a list item. A wording drawn in several pieces (a link in the middle) stays inside one. */
const BLOCK = "p, li, h1, h2, h3, h4, h5, h6, blockquote, figcaption, dd, dt, td, th, caption, summary, label";
const REDRAW = "cms:redraw";

/** The saved edits as this browser knows them: what the page loaded with, plus every save made here since. */
let known: CmsState | null = null;
const knownState = (): CmsState => (known ??= structuredClone((window as Window & { __CMS_STATE__?: CmsState }).__CMS_STATE__ ?? { v: {}, l: {}, h: [] }));

/** An entry's number for its tag: given once per page load and never reused. */
const numbers = new Map<string, number>();
const keys: string[] = [];
const numberFor = (key: string) => {
  let n = numbers.get(key);
  if (n === undefined) {
    n = keys.push(key) - 1;
    numbers.set(key, n);
  }
  return n;
};

/** Put every wording, with its tag, into the page's own content. The page shows them the next time it draws. */
function applyTagged(texts: AdminSlot[]) {
  const state = knownState();
  const v = { ...state.v };
  // An email address is also put into links (mailto:), so it carries no tag and is found by what it says.
  for (const slot of texts) if (slot.kind === "text") v[slot.key] = slot.value + tagOf(numberFor(slot.key));
  // No fingerprints: these are what the editor's own list says the site shows now, so none of them is out of date.
  siteIndex.apply({ v, l: state.l, h: state.h });
}

/** Draws a wording in the card's box, bold and italic as they will show. */
function fillBox(box: HTMLElement, stored: string) {
  box.replaceChildren(
    ...runsOfStored(stored).map((run) => {
      let node: Node = document.createTextNode(run.text);
      if (run.italic) {
        const i = document.createElement("i");
        i.append(node);
        node = i;
      }
      if (run.bold) {
        const b = document.createElement("b");
        b.append(node);
        node = b;
      }
      return node;
    }),
  );
}

/** Reads the card's box back as a wording to save. Whatever the browser used to make words bold or italic counts. */
function readBox(box: HTMLElement): string {
  const runs: Run[] = [];
  const visit = (node: Node, bold: boolean, italic: boolean) => {
    if (node.nodeType === Node.TEXT_NODE) return void runs.push({ text: (node as Text).data, bold, italic });
    if (!(node instanceof HTMLElement)) return;
    const tag = node.tagName;
    if (tag === "BR") return void runs.push({ text: "\n", bold, italic });
    if (tag === "B" || tag === "STRONG") bold = true;
    if (tag === "I" || tag === "EM") italic = true;
    const weight = node.style.fontWeight;
    if (weight) bold = weight === "bold" || weight === "bolder" || Number(weight) >= 600;
    const style = node.style.fontStyle;
    if (style) italic = style === "italic" || style === "oblique";
    if ((tag === "DIV" || tag === "P") && runs.length) runs.push({ text: "\n", bold: false, italic: false });
    for (const child of node.childNodes) visit(child, bold, italic);
  };
  for (const child of box.childNodes) visit(child, false, false);
  return canonical(stripInvisible(storedOf(runs)));
}

type Found = { slot: AdminSlot; exact: boolean };
type Target = { element: HTMLElement; node: Text; candidates: AdminSlot[]; exact: boolean };

/** The words of a page label that say where a wording sits ("Home: Educate" -> home, educate). */
const words = (text: string) => text.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);

/** For text without a tag, the likeliest entry first: the header's own wording inside the header, and so on. */
function rank(candidates: AdminSlot[], element: HTMLElement, path: string): AdminSlot[] {
  const inHeader = Boolean(element.closest("header"));
  const inFooter = Boolean(element.closest("footer"));
  const here = new Set([...words(path), ...words(untagged(document.title)), ...(path === "/" ? ["home"] : [])]);
  const score = (slot: AdminSlot) => {
    const page = slot.page.toLowerCase();
    let s = 0;
    if (inHeader && page.startsWith("header")) s += 10;
    if (inFooter && page.startsWith("footer")) s += 10;
    if (!inHeader && !inFooter && (page.startsWith("header") || page.startsWith("footer"))) s -= 3;
    for (const w of words(slot.page)) if (here.has(w)) s += 2;
    return s;
  };
  return [...candidates].sort((a, b) => score(b) - score(a));
}

export function PageEditor() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState<string | null>(null);
  const [slots, setSlots] = useState<AdminSlot[] | null>(null);
  const [mode, setMode] = useState<"edit" | "browse">("edit");
  const [target, setTarget] = useState<Target | null>(null);
  const [key, setKey] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [count, setCount] = useState(0);
  const nodes = useRef(new WeakMap<Text, Found[]>());
  const box = useRef<HTMLDivElement>(null);
  /** Set when a card opens: the box takes the keyboard once it has been drawn. */
  const focusNext = useRef(false);
  /** Whether the B and I buttons show as on: for the selected words, or for the whole wording when none are. */
  const [pressed, setPressed] = useState({ bold: false, italic: false });
  const drawn = useRef(false);

  // Only a signed-in editor stays here; anyone else is sent to sign in.
  useEffect(() => {
    let live = true;
    get<{ user: { email: string } | null }>("/api/cms/session")
      .then((s) => {
        if (!live) return;
        if (s.user) setEmail(s.user.email);
        else window.location.assign("/admin");
      })
      .catch(() => window.location.assign("/admin"));
    return () => {
      live = false;
    };
  }, []);

  const load = useCallback(async () => {
    const overview = await get<Overview>("/api/cms/overview");
    const texts = overview.slots.filter((s) => s.kind === "text" || s.kind === "email");
    applyTagged(texts);
    setSlots(texts);
    return texts;
  }, []);
  useEffect(() => {
    if (!email) return;
    void load()
      .then(() => {
        // The first time, the page is already on screen without tags: draw it once more so it carries them.
        if (!drawn.current) {
          drawn.current = true;
          window.dispatchEvent(new Event(REDRAW));
        }
      })
      .catch((e) => setMsg({ kind: "error", text: errorText(e) }));
  }, [email, load]);

  const byKey = useMemo(() => new Map((slots ?? []).map((s) => [s.key, s])), [slots]);
  const byText = useMemo(() => {
    const map = new Map<string, AdminSlot[]>();
    for (const slot of slots ?? []) {
      const text = said(slot);
      if (text.length < 2) continue;
      const list = map.get(text);
      if (list) list.push(slot);
      else map.set(text, [slot]);
    }
    return map;
  }, [slots]);

  // Mark every piece of text on the page that is an editable wording: by its tag, or failing that by what it says.
  const scan = useCallback(() => {
    for (const el of document.querySelectorAll("[data-cms-edit]")) el.removeAttribute("data-cms-edit");
    nodes.current = new WeakMap();
    if (!byKey.size) return setCount(0);
    let found = 0;
    // Every piece of text of each run of reading, in the order it is read: its wording when it carries a tag.
    const runs = new Map<Element, { node: Text; parent: HTMLElement; slot: AdminSlot | null }[]>();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
      const parent = node.parentElement;
      if (!parent || parent.closest(SKIP)) continue;
      const tagged: Found[] = [];
      for (const m of node.data.matchAll(TAG)) {
        const slot = byKey.get(keys[numberOf(m[1])] ?? "");
        if (slot) tagged.push({ slot, exact: true });
      }
      const here = tagged.length ? tagged : (byText.get(norm(node.data)) ?? []).map((slot) => ({ slot, exact: false }));
      const block = parent.closest(BLOCK);
      // Words only a screen reader hears ("opens in a new tab") are their own wording, not part of the sentence.
      if (block && !parent.closest(".sr-only")) {
        const run = runs.get(block) ?? [];
        // Bold or italic words are a piece of the wording whose tag follows them, even when another entry says the same.
        const styled = parent.matches("em, strong");
        if (tagged.length || ((!here.length || styled) && norm(node.data).length >= 2)) run.push({ node, parent, slot: tagged.length ? tagged[tagged.length - 1].slot : null });
        runs.set(block, run);
      }
      if (!here.length) continue;
      nodes.current.set(node, here);
      parent.setAttribute("data-cms-edit", "");
      found += 1;
    }
    // A wording drawn in several pieces (a paragraph with a link in the middle, "Fig. 7:" set apart from its caption)
    // carries its tag on its last piece only. So within one run of reading, an untagged piece belongs to the next
    // tag after it, but only when that wording really contains those words. Text the page works out for itself (a
    // lesson's grade range, sitting before its subjects) is in no wording, and a click there opens nothing.
    for (const run of runs.values()) {
      let next: AdminSlot | null = null;
      for (let i = run.length - 1; i >= 0; i--) {
        const piece = run[i];
        if (piece.slot) {
          next = piece.slot;
          continue;
        }
        if (!next || !said(next).includes(norm(piece.node.data))) continue;
        if (!nodes.current.has(piece.node)) found += 1;
        nodes.current.set(piece.node, [{ slot: next, exact: true }]);
        // "part": the bold or italic words of a wording. They open it, and it is outlined as one, not piece by piece.
        piece.parent.setAttribute("data-cms-edit", piece.parent.matches("em, strong") ? "part" : "");
      }
    }
    setCount(found);
  }, [byKey, byText]);

  useEffect(() => {
    document.documentElement.dataset.cmsMode = mode;
    return () => {
      delete document.documentElement.dataset.cmsMode;
    };
  }, [mode]);

  // Scan now, and again whenever the page changes what it shows (a tab, a slide, another page).
  useEffect(() => {
    if (!slots) return;
    let timer = 0;
    const later = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(scan, 200);
    };
    later();
    const observer = new MutationObserver((changes) => {
      if (changes.every((c) => (c.target instanceof Element ? c.target : c.target.parentElement)?.closest("[data-cms-ui]"))) return;
      later();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [slots, scan, path]);

  const open = useCallback(
    (element: HTMLElement, node: Text, offset: number | null) => {
      const found = nodes.current.get(node) ?? [];
      if (!found.length) return;
      const exact = found[0].exact;
      let candidates = found.map((f) => f.slot);
      if (exact && found.length > 1 && offset !== null) {
        // Several tagged wordings in one piece of text: the one the pointer is in comes first.
        const ends = [...node.data.matchAll(TAG)].map((m) => m.index ?? 0);
        const at = ends.findIndex((end) => offset <= end);
        if (at > 0 && candidates[at]) candidates = [candidates[at], ...candidates.filter((_, i) => i !== at)];
      }
      if (!exact) candidates = rank(candidates, element, path);
      for (const el of document.querySelectorAll("[data-cms-active]")) el.removeAttribute("data-cms-active");
      element.setAttribute("data-cms-active", "");
      setTarget({ element, node, candidates, exact });
      setKey(candidates[0].key);
      setDraft(canonical(candidates[0].value));
      setMsg(null);
      focusNext.current = true;
    },
    [path],
  );

  const close = useCallback(() => {
    for (const el of document.querySelectorAll("[data-cms-active]")) el.removeAttribute("data-cms-active");
    setTarget(null);
  }, []);

  // In "Edit text" mode a click on editable wording opens it here instead of following the link or pressing the button.
  useEffect(() => {
    if (mode !== "edit" || !slots) return;
    const onClick = (event: MouseEvent) => {
      const el = event.target instanceof Element ? event.target : null;
      if (!el || el.closest("[data-cms-ui]")) return;
      const marked = el.closest<HTMLElement>("[data-cms-edit]");
      if (!marked) return;
      const mine = [...marked.childNodes].filter((n): n is Text => n.nodeType === Node.TEXT_NODE && nodes.current.has(n as Text));
      if (!mine.length) return;
      const caret = (document as Document & { caretRangeFromPoint?: (x: number, y: number) => Range | null }).caretRangeFromPoint?.(event.clientX, event.clientY);
      const under = caret && mine.includes(caret.startContainer as Text) ? (caret.startContainer as Text) : null;
      // A click on words drawn apart from the rest (bold in the middle of a sentence): the wording is the next one tagged after them.
      const after = !under && caret && marked.contains(caret.startContainer) ? mine.find((n) => caret.startContainer.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING) : undefined;
      // The whole wording is shown as chosen, not only its bold or italic words.
      const whole = marked.getAttribute("data-cms-edit") === "part" ? (marked.parentElement?.closest<HTMLElement>('[data-cms-edit=""]') ?? marked) : marked;
      event.preventDefault();
      event.stopPropagation();
      open(whole, under ?? after ?? mine[0], under ? caret!.startOffset : null);
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [mode, slots, open]);

  useEffect(() => {
    if (mode === "browse") close();
  }, [mode, close]);
  useEffect(() => close(), [path, close]);

  const slot = target?.candidates.find((c) => c.key === key) ?? null;
  const warning = slot && draft !== slot.def ? lengthWarning(slot.def, draft.trim()) : null;
  const dirty = Boolean(slot) && draft !== canonical(slot!.value);

  /** The B and I buttons: on for the selected words, or for the whole wording when nothing is selected. */
  const refresh = useCallback(() => {
    const el = box.current;
    if (!el) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed && el.contains(sel.anchorNode)) {
      return setPressed({ bold: document.queryCommandState("bold"), italic: document.queryCommandState("italic") });
    }
    const runs = runsOfStored(readBox(el)).filter((run) => run.text.trim());
    setPressed({ bold: runs.length > 0 && runs.every((run) => run.bold), italic: runs.length > 0 && runs.every((run) => run.italic) });
  }, []);

  // Draw the wording in the box when a card opens, when another entry is chosen in it, and after a save.
  const value = slot?.value;
  useEffect(() => {
    const el = box.current;
    if (!el || value === undefined) return;
    fillBox(el, value);
    if (focusNext.current) {
      focusNext.current = false;
      el.focus();
      const sel = window.getSelection();
      sel?.selectAllChildren(el);
      sel?.collapseToEnd();
    }
    refresh();
  }, [target, key, value, refresh]);

  useEffect(() => {
    if (!target) return;
    document.addEventListener("selectionchange", refresh);
    return () => document.removeEventListener("selectionchange", refresh);
  }, [target, refresh]);

  /** Makes the selected words bold or italic, or back to plain. With nothing selected, the whole wording. */
  const format = (command: "bold" | "italic") => {
    const el = box.current;
    const sel = window.getSelection();
    if (!el || !sel) return;
    el.focus();
    const all = sel.isCollapsed || !el.contains(sel.anchorNode);
    if (all) sel.selectAllChildren(el);
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(command);
    // Left selected, the next key pressed would replace the whole wording.
    if (all) sel.collapseToEnd();
    setDraft(readBox(el));
    refresh();
  };

  /**
   * After a save: every piece of text on the page that carries this entry's tag now says the new wording. If one of
   * them was reshaped by the page's code (so the old wording is not there to swap), or nothing carries the tag, the
   * page draws itself again from its content instead, which is always right.
   */
  const show = useCallback((changed: AdminSlot, before: string) => {
    // Bold and italic are drawn as elements, not as text that can be swapped where it sits.
    if (changed.kind !== "text" || isFormatted(before) || isFormatted(changed.value)) return void window.dispatchEvent(new Event(REDRAW));
    const tag = tagOf(numberFor(changed.key));
    let swapped = 0;
    let unsure = false;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
      const end = node.data.indexOf(tag);
      if (end < 0 || node.parentElement?.closest(SKIP)) continue;
      const head = node.data.slice(0, end);
      if (!head.endsWith(before)) {
        unsure = true;
        continue;
      }
      node.data = head.slice(0, head.length - before.length) + changed.value + node.data.slice(end);
      swapped += 1;
    }
    if (unsure || !swapped) window.dispatchEvent(new Event(REDRAW));
  }, []);

  async function run(action: "save" | "reset") {
    if (!slot) return;
    setBusy(true);
    setMsg(null);
    try {
      const before = slot.value;
      const res = action === "save" ? await post<{ ok: true; warning?: string | null }>("/api/cms/save", { key: slot.key, value: draft }) : await post("/api/cms/reset", { key: slot.key });
      // Keep this browser's own record of the saved edits in step, then tag and apply the fresh wordings.
      const state = knownState();
      const fresh = await get<Overview>("/api/cms/overview").then((o) => o.slots.filter((s) => s.kind === "text" || s.kind === "email"));
      const now = fresh.find((s) => s.key === slot.key);
      if (now) {
        const v = { ...state.v };
        if (now.value === now.def) delete v[now.key];
        else v[now.key] = now.value;
        known = { ...state, v };
      }
      applyTagged(fresh);
      setSlots(fresh);
      if (now) {
        setDraft(canonical(now.value));
        show(now, before);
      }
      setTarget((t) => (t ? { ...t, candidates: t.candidates.map((c) => fresh.find((s) => s.key === c.key) ?? c) } : t));
      const note = action === "save" ? "Saved. It shows on communityhub.cloud in about a minute." : "Back to the original wording.";
      const extra = (res as { warning?: string | null }).warning;
      setMsg({ kind: "ok", text: extra ? `${note} ${extra}` : note });
    } catch (e) {
      setMsg({ kind: "error", text: errorText(e) });
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await post("/api/cms-auth/sign-out", {}).catch(() => undefined);
    window.location.assign("/admin");
  }

  if (!email) return null;

  const pill = "inline-flex min-h-9 items-center rounded-full px-3 text-sm font-semibold transition-colors";
  const others = target ? target.candidates.length - 1 : 0;
  return (
    <div data-cms-ui className="pointer-events-none fixed inset-x-0 bottom-0 z-[1000] flex flex-col items-center gap-2 p-3 font-sans">
      <style>{`
        html[data-cms-mode="edit"] [data-cms-edit] { cursor: text; outline: 1px dashed transparent; outline-offset: 3px; border-radius: 3px; transition: outline-color 120ms ease, background-color 120ms ease; }
        html[data-cms-mode="edit"] [data-cms-edit]:hover { outline-color: #467d58; background-color: rgb(201 219 135 / 0.28); }
        html[data-cms-mode="edit"] [data-cms-edit="part"], html[data-cms-mode="edit"] [data-cms-edit="part"]:hover { outline: none; background-color: transparent; }
        html[data-cms-mode] [data-cms-active] { outline: 2px solid #123a29 !important; outline-offset: 3px; background-color: rgb(201 219 135 / 0.4) !important; }
        @media (prefers-reduced-motion: reduce) { html[data-cms-mode="edit"] [data-cms-edit] { transition: none; } }
      `}</style>

      {target && slot ? (
        <form
          className="pointer-events-auto grid w-full max-w-xl grid-cols-[minmax(0,1fr)] gap-3 rounded-2xl border border-line bg-white p-4 text-ink shadow-[0_18px_48px_-12px_rgb(10_30_20/0.45)]"
          data-testid="page-edit-card"
          data-key={slot.key}
          onSubmit={(e) => {
            e.preventDefault();
            void run("save");
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 text-sm font-bold text-pine">
              Change this wording <span className="font-normal text-ink/60">({slot.page})</span>
            </p>
            <button type="button" className="-m-1 rounded-full p-1 text-sm font-semibold text-ink/70 hover:text-pine" onClick={close}>
              Close
            </button>
          </div>
          {others > 0 ? (
            <label className="grid min-w-0 gap-1 text-xs font-semibold text-ink/70">
              {target.exact
                ? `This text is made of ${others + 1} wordings. You are changing:`
                : `The same words appear in ${others} other ${others === 1 ? "place" : "places"}. You are changing:`}
              <select
                className="min-h-10 w-full min-w-0 rounded-lg border border-ink/40 bg-white px-2 text-sm font-normal text-ink"
                value={key}
                data-testid="page-edit-which"
                onChange={(e) => {
                  const next = target.candidates.find((c) => c.key === e.target.value);
                  if (!next) return;
                  setKey(next.key);
                  setDraft(canonical(next.value));
                  setMsg(null);
                }}
              >
                {target.candidates.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.page}: {c.label}
                    {c.context ? ` (near ${c.context})` : ""}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {slot.kind === "text" ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div role="group" aria-label="Bold and italic" className="flex gap-1">
                {(["bold", "italic"] as const).map((command) => (
                  <button
                    key={command}
                    type="button"
                    aria-label={command === "bold" ? "Bold" : "Italic"}
                    aria-pressed={pressed[command]}
                    title={command === "bold" ? "Bold" : "Italic"}
                    data-testid={`page-edit-${command}`}
                    className={`inline-flex size-9 items-center justify-center rounded-lg border text-base transition-colors ${pressed[command] ? "border-pine bg-pine text-white" : "border-ink/30 bg-white text-ink hover:bg-field"}`}
                    // Keeps the words selected in the box while the button is pressed.
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => format(command)}
                  >
                    <span aria-hidden className={command === "bold" ? "font-extrabold" : "font-serif text-lg italic"}>
                      {command === "bold" ? "B" : "I"}
                    </span>
                  </button>
                ))}
              </div>
              <p className="min-w-0 flex-1 basis-56 text-xs text-ink/60">Select words to make them bold or italic. With nothing selected, the whole text changes.</p>
            </div>
          ) : null}
          <div
            ref={box}
            role="textbox"
            aria-multiline="true"
            aria-label={`${slot.label} (${slot.page})`}
            data-testid="page-edit-input"
            contentEditable
            suppressContentEditableWarning
            spellCheck
            className="max-h-[40vh] min-h-20 w-full overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-ink/40 bg-white px-3 py-2 text-base font-normal not-italic text-ink focus:border-leaf focus:outline-2 focus:outline-leaf"
            onInput={(e) => {
              setDraft(readBox(e.currentTarget));
              // "Saved." was about the wording before this change.
              setMsg(null);
              refresh();
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") return close();
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                // A plain line break, not the new paragraph element a browser would put in.
                e.preventDefault();
                document.execCommand("insertLineBreak");
              }
              // An email address has no bold or italic: the browser's own shortcuts for them do nothing here.
              if (slot.kind !== "text" && (e.metaKey || e.ctrlKey) && ["b", "i", "u"].includes(e.key.toLowerCase())) e.preventDefault();
            }}
            onPaste={(e) => {
              // Only the words: nothing of how they looked where they were copied from.
              e.preventDefault();
              document.execCommand("insertText", false, stripInvisible(e.clipboardData.getData("text/plain")).replace(/\r\n?/g, "\n"));
            }}
            onDrop={(e) => e.preventDefault()}
          />
          {slot.stale ? (
            <p role="status" className="text-xs font-bold text-red-700">
              Out of date: the wording on the site changed after this was edited, so the original is showing. Save again to keep your version.
            </p>
          ) : null}
          {warning ? (
            <p role="status" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {warning}
            </p>
          ) : null}
          {msg ? (
            <p role={msg.kind === "error" ? "alert" : "status"} className={`rounded-md border px-3 py-2 text-sm ${msg.kind === "error" ? "border-red-300 bg-red-50 text-red-900" : "border-leaf/50 bg-field text-pine"}`}>
              {msg.text}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" className={`${pill} bg-lime text-pine hover:bg-lime-deep disabled:opacity-50`} disabled={busy || !dirty} data-testid="page-edit-save">
              Save
            </button>
            <button type="button" className={`${pill} border border-pine/25 bg-white text-pine hover:bg-field`} onClick={close}>
              Cancel
            </button>
            {slot.value !== slot.def ? (
              <button type="button" className="ml-auto text-sm font-semibold text-pine underline disabled:opacity-50" disabled={busy} onClick={() => void run("reset")} data-testid="page-edit-reset">
                Use the original wording
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      <div
        className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-[1.5rem] border border-white/15 bg-pine px-3 py-2 text-white shadow-[0_12px_32px_-8px_rgb(10_30_20/0.55)] sm:rounded-full"
        data-testid="page-edit-bar"
      >
        <div role="group" aria-label="What a click does" className="flex rounded-full bg-white/10 p-0.5">
          <button type="button" aria-pressed={mode === "edit"} className={`${pill} ${mode === "edit" ? "bg-lime text-pine" : "text-white hover:bg-white/10"}`} onClick={() => setMode("edit")} data-testid="page-edit-mode-edit">
            Edit text
          </button>
          <button type="button" aria-pressed={mode === "browse"} className={`${pill} ${mode === "browse" ? "bg-lime text-pine" : "text-white hover:bg-white/10"}`} onClick={() => setMode("browse")} data-testid="page-edit-mode-browse">
            Browse
          </button>
        </div>
        <p className="text-sm text-white/85" role="status" data-testid="page-edit-hint">
          {!slots ? "Loading the words..." : mode === "edit" ? (count ? "Click any wording to change it." : "Nothing on this screen can be changed here.") : "Links work as usual. Switch to Edit text to change wording."}
        </p>
        <a href="/admin" className={`${pill} text-white underline decoration-white/40 underline-offset-4 hover:bg-white/10`}>
          Pictures, lists and history
        </a>
        <span className="hidden text-sm text-white/70 sm:inline" data-testid="whoami">
          {email}
        </span>
        <button type="button" className={`${pill} text-white hover:bg-white/10`} onClick={() => void signOut()}>
          Sign out
        </button>
      </div>
    </div>
  );
}
