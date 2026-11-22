import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import type { AdminSlot, Overview } from "@/lib/cms/service";
import type { CmsState } from "@/lib/cms/core";
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
 */

// The tag: an invisible separator, the entry's number in binary as two zero-width characters, the separator again.
// None of the three lets a line break at it (a zero-width space would, and a headline then wraps in a new place).
const EDGE = "\u2063";
const ZERO = "\u2060";
const ONE = "\u200C";
const TAG = new RegExp(`${EDGE}([${ZERO}${ONE}]+)${EDGE}`, "g");
const tagOf = (n: number) => EDGE + [...n.toString(2)].map((bit) => (bit === "1" ? ONE : ZERO)).join("") + EDGE;
const numberOf = (bits: string) => parseInt([...bits].map((c) => (c === ONE ? "1" : "0")).join(""), 2);
const untagged = (text: string) => text.replace(TAG, "");
const norm = (text: string) => untagged(text).replace(/\s+/g, " ").trim();

const SKIP = "[data-cms-ui], script, style, noscript, textarea, input, select, option, iframe, svg, [contenteditable='true']";
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
  for (const slot of texts) v[slot.key] = slot.value + tagOf(numberFor(slot.key));
  // No fingerprints: these are what the editor's own list says the site shows now, so none of them is out of date.
  siteIndex.apply({ v, l: state.l, h: state.h });
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
  const box = useRef<HTMLTextAreaElement>(null);
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
    const texts = overview.slots.filter((s) => s.kind === "text");
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
      const text = norm(slot.value);
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
      if (!here.length) continue;
      nodes.current.set(node, here);
      parent.setAttribute("data-cms-edit", "");
      found += 1;
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
      setDraft(candidates[0].value);
      setMsg(null);
      window.setTimeout(() => box.current?.focus(), 30);
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
      event.preventDefault();
      event.stopPropagation();
      open(marked, under ?? mine[0], under ? caret!.startOffset : null);
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

  /**
   * After a save: every piece of text on the page that carries this entry's tag now says the new wording. If one of
   * them was reshaped by the page's code (so the old wording is not there to swap), or nothing carries the tag, the
   * page draws itself again from its content instead, which is always right.
   */
  const show = useCallback((changed: AdminSlot, before: string) => {
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
      const fresh = await get<Overview>("/api/cms/overview").then((o) => o.slots.filter((s) => s.kind === "text"));
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
        setDraft(now.value);
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
                  setDraft(next.value);
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
          <textarea
            ref={box}
            aria-label={`${slot.label} (${slot.page})`}
            data-testid="page-edit-input"
            className="min-h-20 w-full rounded-xl border border-ink/40 bg-white px-3 py-2 text-base text-ink focus:border-leaf focus:outline-2 focus:outline-leaf"
            rows={Math.min(8, Math.max(2, Math.ceil(draft.length / 60)))}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
            }}
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
            <button type="submit" className={`${pill} bg-lime text-pine hover:bg-lime-deep disabled:opacity-50`} disabled={busy || draft === slot.value} data-testid="page-edit-save">
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
