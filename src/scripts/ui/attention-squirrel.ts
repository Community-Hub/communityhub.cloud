/* ================================================================
   ATTENTION SQUIRREL (Kwaku, 2026-10-03)
   When the site wants the visitor to do something to see more (scroll an
   inner region, try a phone controller), the squirrel pops out beside that
   target with a short speech bubble. As soon as the visitor starts doing it
   the squirrel pops back out of sight. Scroll cues return on the next visit;
   controller cues remain done for the session.

   The decision logic at the top is pure (no DOM) and unit-tested in
   tests/attention-squirrel.test.mjs; initAttentionSquirrel() below wires it
   to the page. No imports, so the test can load this file on its own.

   Opt in with markup: data-squirrel="Cue text" and optionally
   data-squirrel-side="left|right|top". Inner scroll regions and phone
   controllers are picked up automatically (see AUTO_TARGETS).
   ================================================================ */

export type Side = "left" | "right" | "top" | "bottom";
export interface Rect { x: number; y: number; w: number; h: number }
export interface CueTarget {
  id: string;
  text: string;
  side: Side;
  /** Share of the target that is on screen (below the header), 0..1. */
  ratio: number;
  /** False when inert, hidden, covered or not rendered. */
  visible: boolean;
  /** Distance from the target's centre to the viewport centre (smaller wins ties). */
  centerDist: number;
  /** Document order, the last tie-break. */
  order: number;
}

export const SHOW_RATIO = 0.6;
/** A shown squirrel stays until its target is clearly leaving (hysteresis). */
export const HIDE_RATIO = 0.45;
export const IDLE_MS = 1000;
/** A page shows at most this many hints, so the squirrel guides only where it is needed. */
export const MAX_PER_PAGE = 2;
/** Longest a cue stays on screen before it steps aside for good. */
export const MAX_SHOW_MS = 8000;
// Versioned: a change to when hints count as done starts every visitor fresh.
export const STORE_KEY = "ch-squirrel-done-3";

/** Share of the target rectangle that lies inside the viewport, below `topInset` (the sticky header). */
export function visibleRatio(r: Rect, vw: number, vh: number, topInset = 0): number {
  if (r.w <= 0 || r.h <= 0) return 0;
  const w = Math.min(r.x + r.w, vw) - Math.max(r.x, 0);
  const h = Math.min(r.y + r.h, vh) - Math.max(r.y, topInset);
  if (w <= 0 || h <= 0) return 0;
  return (w * h) / (r.w * r.h);
}

export function isEligible(t: CueTarget, done: ReadonlySet<string>, shown = false): boolean {
  return t.visible && !done.has(t.id) && t.ratio >= (shown ? HIDE_RATIO : SHOW_RATIO);
}

/** Eligible targets, most relevant first: more of it in view, then nearer the middle of the screen, then document order. */
export function rankTargets(ts: readonly CueTarget[], done: ReadonlySet<string>): CueTarget[] {
  return ts
    .filter(t => isEligible(t, done))
    .sort((a, b) => Math.round(b.ratio * 20) - Math.round(a.ratio * 20) || a.centerDist - b.centerDist || a.order - b.order);
}

export function pickTarget(ts: readonly CueTarget[], done: ReadonlySet<string>): CueTarget | null {
  return rankTargets(ts, done)[0] || null;
}

/** The visitor has touched nothing for IDLE_MS. */
export function idleReady(now: number, lastActivity: number, idleMs = IDLE_MS): boolean {
  return now - lastActivity >= idleMs;
}

export type Decision = { kind: "show"; id: string } | { kind: "hide" } | { kind: "keep" } | { kind: "none" };

/**
 * One squirrel at a time. While one is shown it stays until its target is done
 * or leaves view; a new one appears only after the visitor has been idle.
 * `placeable` lets the caller skip targets that have no room beside them.
 */
export function decide(
  shownId: string | null,
  ts: readonly CueTarget[],
  done: ReadonlySet<string>,
  now: number,
  lastActivity: number,
  placeable: (id: string) => boolean = () => true,
): Decision {
  if (shownId) {
    const cur = ts.find(t => t.id === shownId);
    return cur && isEligible(cur, done, true) ? { kind: "keep" } : { kind: "hide" };
  }
  if (!idleReady(now, lastActivity)) return { kind: "none" };
  const next = rankTargets(ts, done).find(t => placeable(t.id));
  return next ? { kind: "show", id: next.id } : { kind: "none" };
}

export function markDone(done: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(done);
  next.add(id);
  return next;
}

export function parseDone(raw: string | null | undefined): Set<string> {
  try {
    const v = JSON.parse(raw || "[]");
    return new Set(Array.isArray(v) ? v.filter(x => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

export function serializeDone(done: ReadonlySet<string>): string {
  return JSON.stringify([...done]);
}

/** Scrolling one embed never completes another, or a later visit to the same embed. */
export function refreshScrollVisits(done: ReadonlySet<string>, targets: readonly CueTarget[]): Set<string> {
  return new Set(targets.filter(t => t.visible && t.ratio >= HIDE_RATIO && done.has(t.id)).map(t => t.id));
}

export interface ScrollAction {
  type: string;
  key?: string;
  deltaY?: number;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  /** Native controls and editable content keep their own keyboard behavior. */
  control?: boolean;
}

/** A click, focus, touch-down or Tab is not evidence that a visitor started scrolling. */
export function startsScrolling(e: ScrollAction): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  if (e.type === "wheel") return Math.abs(e.deltaY || 0) > 0;
  if (e.type === "touchmove") return true;
  return e.type === "keydown" && !e.control && ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"].includes(e.key || "");
}

export function sideOrder(pref?: string | null): Side[] {
  const all: Side[] = ["right", "left", "top", "bottom"];
  const first = all.find(s => s === pref);
  return first ? [first, ...all.filter(s => s !== first)] : all;
}

/** Along the target: centred, at its start, at its end; above or below, also flush with the left or right screen margin, or ("b") flush with the target's right edge, where a scrollbar is. */
export type Anchor = "c" | "s" | "e" | "l" | "r" | "b" | "u" | "m";
export function anchorsFor(side: Side = "right"): Anchor[] {
  return side === "top" || side === "bottom" ? ["c", "s", "e", "r", "l"] : ["c", "s", "e"];
}

export interface CueSize { sw: number; sh: number; bw: number; bh: number }
/** Gap between the target edge and the figure; between squirrel and bubble. */
export const EDGE_GAP = 8;
export const FIG_GAP = 4;

/**
 * Rectangle the squirrel and its bubble occupy beside the target's visible rectangle `t`.
 * right/left: bubble stacked above the squirrel, in the space outside the target.
 * top: squirrel standing on the top edge, bubble to its right.
 * bottom: squirrel peeking up from below the bottom edge, bubble to its right.
 */
export function cueBox(side: Side, t: Rect, m: CueSize, anchor: Anchor, vw = 0): Rect {
  if (side === "top" || side === "bottom") {
    const w = m.sw + FIG_GAP + m.bw, h = Math.max(m.sh, m.bh);
    const x = anchor === "s" ? t.x + 12 : anchor === "e" ? t.x + t.w - w - 12 : anchor === "b" ? t.x + t.w - w
      : anchor === "l" ? EDGE_MARGIN : anchor === "r" ? vw - EDGE_MARGIN - w : t.x + (t.w - w) / 2;
    return { x, y: side === "top" ? t.y - EDGE_GAP - h : t.y + t.h + EDGE_GAP, w, h };
  }
  const w = Math.max(m.sw, m.bw), h = m.bh + FIG_GAP + m.sh;
  // "u": right under a small control in a narrow gutter, lined up with its outer edge.
  if (anchor === "u") return { x: side === "right" ? t.x : t.x + t.w - w, y: t.y + t.h + EDGE_GAP, w, h };
  // "m": beside a short control, squirrel and bubble in one row, standing on the control's baseline.
  if (anchor === "m") {
    const rw = m.sw + FIG_GAP + m.bw, rh = Math.max(m.sh, m.bh);
    return { x: side === "right" ? t.x + t.w + EDGE_GAP : t.x - EDGE_GAP - rw, y: t.y + t.h - rh, w: rw, h: rh };
  }
  const x = side === "right" ? t.x + t.w + EDGE_GAP : t.x - EDGE_GAP - w;
  const y = anchor === "s" ? t.y + 8 : anchor === "e" ? t.y + t.h - h - 8 : t.y + (t.h - h) / 2;
  return { x, y, w, h };
}

/** Room outside the target on this side, for the bubble's maximum width. */
export function roomFor(side: Side, t: Rect, vw: number, margin = 6): number {
  if (side === "right") return vw - (t.x + t.w + EDGE_GAP) - margin;
  if (side === "left") return t.x - EDGE_GAP - margin;
  return vw - 2 * margin; // top and bottom
}

/** A visitor should never see the cue touching the screen edge or the text beside it. */
export const EDGE_MARGIN = 10;
/** Furthest a cue may sit sideways from its target. */
export const NEAR_PX = 120;
export const CLEARANCE = 8;
export function insideViewport(b: Rect, vw: number, vh: number, topInset: number, margin = 4): boolean {
  return b.x >= margin && b.y >= topInset + margin && b.x + b.w <= vw - margin && b.y + b.h <= vh - margin;
}

/* ---------------------------------------------------------------- DOM */

interface Source {
  el: HTMLElement;
  id: string;
  text: string;
  side: Side;
  kind: "scroll" | "control";
  order: number;
  hint?: HTMLElement;
  /** Last scrollTop seen: a region holding a cross-origin frame reports its scrolling only this way. */
  top?: number;
  /** Where the current burst of scrolling began, and when its latest event came. */
  from?: number;
  scrollAt?: number;
}
interface AutoTarget { sel: string; text: string; side: Side; kind: "scroll" | "control"; scope?: string }

/**
 * Where the site asks the visitor to act before more appears. Anything else opts in with data-squirrel.
 * (Inner scroll regions are added separately from [data-scroll-owner] when they really overflow.)
 */
const AUTO_TARGETS: AutoTarget[] = [
  { sel: ".native-phone-device", text: "Try the controller", side: "right", kind: "control" },
  { sel: ".pw-phone", text: "Try the controller", side: "right", kind: "control" },
  { sel: ".native-choices", text: "Pick one to explore", side: "top", kind: "control" },
];
const SCROLL_TEXT = "Scroll here";
/** Short forms for phones, used only when the full cue has no room (a page can set data-squirrel-short). */
const SHORT_TEXT: Record<string, string> = { "Try the controller": "Try it", "Pick one to explore": "Pick one", "Scroll here": "Scroll" };
const MIN_OVERFLOW = 1;

interface Handle { destroy(): void }

export function initAttentionSquirrel(): Handle | undefined {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  // Not a real browser document (a stubbed DOM in unit tests): nothing to attach to.
  if (typeof document.createElement !== "function" || typeof document.querySelectorAll !== "function") return;
  const w = window as unknown as { __chSquirrel?: Handle & Record<string, unknown> };
  w.__chSquirrel?.destroy();

  const doc = document;
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const phone = matchMedia("(max-width: 700px)");
  const ANIMATED = "assets/squirrel-cue.webp";
  const STATIC = "assets/squirrel-cue-still.png";
  const SQ_W = () => (phone.matches ? 62 : 84);
  const SQ_H = () => Math.round(SQ_W() * (160 / 113));

  let done = new Set<string>();
  let scrollDone = new Set<string>();
  try { done = parseDone(sessionStorage.getItem(STORE_KEY)); } catch { /* storage may be blocked */ }
  function persist() { try { sessionStorage.setItem(STORE_KEY, serializeDone(done)); } catch { /* ignore */ } }
  function completed(s: Source) { return (s.kind === "scroll" ? scrollDone : done).has(s.id); }

  /* ---- the single cue element ---- */
  const cue = doc.createElement("div");
  cue.className = "sq-cue";
  cue.setAttribute("aria-hidden", "true");
  cue.hidden = true;
  cue.innerHTML = '<div class="sq-fig"><span class="sq-bubble"></span><img class="sq-img" alt="" width="113" height="160" decoding="async" draggable="false"></div>';
  const bubble = cue.querySelector(".sq-bubble") as HTMLElement;
  const img = cue.querySelector(".sq-img") as HTMLImageElement;
  img.src = STATIC;
  doc.body.appendChild(cue);
  const hints = doc.createElement("div");
  hints.className = "sq-sr";
  doc.body.appendChild(hints);

  /* ---- sources ---- */
  let sources: Source[] = [];
  const ids = new WeakMap<HTMLElement, string>();
  let hintSeq = 0;
  function idFor(el: HTMLElement, sig: string): string {
    let id = ids.get(el);
    if (id) return id;
    const same = Array.from(doc.querySelectorAll(sig));
    id = location.pathname + "|" + (el.dataset.squirrelId || sig + "#" + Math.max(0, same.indexOf(el)));
    ids.set(el, id);
    return id;
  }
  function sigOf(el: HTMLElement): string {
    if (el.id) return "#" + CSS.escape(el.id);
    const cls = Array.from(el.classList).find(c => !c.startsWith("is-") && !c.startsWith("sq-"));
    return el.tagName.toLowerCase() + (cls ? "." + CSS.escape(cls) : "");
  }
  function sideOf(el: HTMLElement, dflt: Side): Side {
    const s = el.getAttribute("data-squirrel-side");
    return s === "left" || s === "right" || s === "top" || s === "bottom" ? s : dflt;
  }
  function overflows(el: HTMLElement) { return el.scrollHeight - el.clientHeight > MIN_OVERFLOW; }

  /* Only a frame with an authenticated measured content height can safely hand scrolling to its parent.
     Estimated heights must retain native frame scrolling so real embedded content cannot be clipped. */
  function lockFrames() {
    doc.querySelectorAll<HTMLIFrameElement>("[data-scroll-owner] iframe[data-native-scroll-frame][data-native-scroll-height-confirmed]").forEach(f => {
      if (f.getAttribute("scrolling") !== "no") f.setAttribute("scrolling", "no");
    });
  }

  function collect() {
    lockFrames();
    const seen = new Set<HTMLElement>();
    const list: Source[] = [];
    function add(el: HTMLElement, text: string, side: Side, kind: Source["kind"]) {
      if (seen.has(el) || !text) return;
      seen.add(el);
      list.push({ el, id: idFor(el, sigOf(el)), text, side: sideOf(el, side), kind, order: list.length, top: el.scrollTop });
    }
    doc.querySelectorAll<HTMLElement>("[data-squirrel]").forEach(el => {
      const text = (el.getAttribute("data-squirrel") || "").trim();
      if (el.hasAttribute("data-squirrel-off")) return;
      add(el, text, "right", el.hasAttribute("data-scroll-owner") ? "scroll" : "control");
    });
    AUTO_TARGETS.forEach(a => doc.querySelectorAll<HTMLElement>(a.sel).forEach(el => {
      // Where a controller is the thing to try, the community tabs need no cue of their own.
      if (a.sel === ".native-choices" && el.closest("[data-native-contexts]")?.querySelector(".native-phone-device")) return;
      add(el, a.text, a.side, a.kind);
    }));
    doc.querySelectorAll<HTMLElement>("[data-scroll-owner]").forEach(el => {
      // data-squirrel-off: a region whose scrolling needs no cue of its own (another cue already guides the scene).
      if (overflows(el) && !el.hasAttribute("data-squirrel-off")) add(el, SCROLL_TEXT, "right", "scroll");
    });
    // Keep describedby in step: a hint on every live target, none on dropped ones.
    sources.forEach(s => { if (!seen.has(s.el)) unhint(s); });
    const prev = new Map(sources.map(s => [s.el, s]));
    sources = list.map(s => { const p = prev.get(s.el); if (p) { p.text = s.text; p.side = s.side; p.kind = s.kind; p.order = s.order; return p; } return s; });
    sources.forEach(s => { if (s.kind === "control" && done.has("text:" + s.text)) done = markDone(done, s.id); });
    sources.forEach(s => { if (completed(s)) unhint(s); else hint(s); });
  }
  function hint(s: Source) {
    if (!s.hint) {
      const span = doc.createElement("span");
      span.id = "sq-hint-" + ++hintSeq;
      hints.appendChild(span);
      s.hint = span;
    }
    s.hint.textContent = s.text;
    const cur = (s.el.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
    if (!cur.includes(s.hint.id)) s.el.setAttribute("aria-describedby", [...cur, s.hint.id].join(" "));
  }
  function unhint(s: Source) {
    if (!s.hint) return;
    const cur = (s.el.getAttribute("aria-describedby") || "").split(/\s+/).filter(x => x && x !== s.hint!.id);
    if (cur.length) s.el.setAttribute("aria-describedby", cur.join(" ")); else s.el.removeAttribute("aria-describedby");
    s.hint.remove();
    s.hint = undefined;
  }

  /* ---- geometry and visibility ---- */
  function headerInset() {
    const h = doc.querySelector<HTMLElement>(".hdr, header");
    if (!h) return 0;
    const pos = getComputedStyle(h).position;
    return pos === "fixed" || pos === "sticky" ? Math.max(0, h.getBoundingClientRect().bottom) : 0;
  }
  function rectOf(el: HTMLElement): Rect {
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }
  function measure(s: Source, inset: number): CueTarget {
    const r = rectOf(s.el);
    let visible = s.el.isConnected && !s.el.closest("[inert],[hidden]") && r.w >= 40 && r.h >= 40;
    if (visible) visible = (s.el as HTMLElement & { checkVisibility?: (o: object) => boolean }).checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) !== false;
    if (visible && s.kind === "scroll" && !overflows(s.el)) visible = false;
    const vw = innerWidth, vh = innerHeight;
    const ratio = visible ? visibleRatio(r, vw, vh, inset) : 0;
    if (visible && ratio > 0.1) {
      // Covered by a menu or overlay: the middle of the visible part must belong to the target.
      const cx = Math.min(Math.max(r.x + r.w / 2, 1), vw - 1), cy = Math.min(Math.max(r.y + r.h / 2, inset + 1), vh - 1);
      const top = doc.elementFromPoint(cx, cy);
      if (top && !s.el.contains(top) && !top.contains(s.el) && !top.closest(".sq-cue")) visible = false;
    }
    const cxr = r.x + r.w / 2 - vw / 2, cyr = r.y + r.h / 2 - vh / 2;
    return { id: s.id, text: s.text, side: s.side, ratio, visible, centerDist: Math.hypot(cxr, cyr), order: s.order };
  }

  /* ---- is a rectangle free of text, images and controls? ---- */
  const MEDIA = /^(IMG|VIDEO|CANVAS|IFRAME|PICTURE|INPUT|SELECT|TEXTAREA|BUTTON|A|SUMMARY|LABEL|OBJECT|EMBED)$/;
  function blocked(box: Rect, inset: number, target: HTMLElement): string {
    // Keep clear of text and controls around the cue too (the target's own content is not in the way).
    const b: Rect = { x: box.x - CLEARANCE, y: box.y - CLEARANCE, w: box.w + 2 * CLEARANCE, h: box.h + 2 * CLEARANCE };
    const textRects = new Map<Element, DOMRect[]>();
    const verdict = new Map<Element, boolean>();
    function own(el: Element): DOMRect[] {
      let rs = textRects.get(el);
      if (rs) return rs;
      rs = [];
      el.childNodes.forEach(n => {
        if (n.nodeType === 3 && (n.textContent || "").trim()) {
          const rg = doc.createRange();
          rg.selectNodeContents(n);
          rs!.push(...Array.from(rg.getClientRects()));
        }
      });
      textRects.set(el, rs);
      return rs;
    }
    function isContent(el: Element, x: number, y: number): boolean {
      if (el === doc.documentElement || el === doc.body || el.closest(".sq-cue") || target.contains(el)) return false;
      let v = verdict.get(el);
      if (v === undefined) {
        v = MEDIA.test(el.tagName) || el instanceof SVGElement || el.hasAttribute("role") && /^(button|link|tab|menuitem|slider|option|checkbox|radio|switch|combobox|listbox)$/.test(el.getAttribute("role") || "");
        if (!v) {
          const cs = getComputedStyle(el);
          if (cs.backgroundImage.includes("url(")) {
            const r = (el as HTMLElement).getBoundingClientRect();
            // A page-sized backdrop is not content; a picture-sized panel is.
            v = r.width * r.height < innerWidth * innerHeight * 0.5;
          }
        }
        verdict.set(el, v);
      }
      if (v) return true;
      return own(el).some(r => x >= r.left - 2 && x <= r.right + 2 && y >= r.top - 2 && y <= r.bottom + 2);
    }
    const STEP = 14;
    const xs: number[] = [], ys: number[] = [];
    for (let x = b.x + 2; x < b.x + b.w - 1; x += STEP) xs.push(x);
    xs.push(b.x + b.w - 2);
    for (let y = b.y + 2; y < b.y + b.h - 1; y += STEP) ys.push(y);
    ys.push(b.y + b.h - 2);
    for (const y of ys) for (const x of xs) {
      if (y < inset) return "header";
      for (const el of doc.elementsFromPoint(x, y)) if (isContent(el, x, y)) return el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.split(" ")[0] : "");
    }
    // Pictures and embeds that ignore the pointer are missed by hit-testing; look at them by rectangle too.
    const box2 = { l: b.x, t: Math.max(b.y, inset), r: b.x + b.w, b: b.y + b.h };
    for (const m of Array.from(doc.querySelectorAll("iframe,video,canvas,img,picture"))) {
      if (target.contains(m) || cue.contains(m)) continue;
      const r = m.getBoundingClientRect();
      if (r.width < 24 || r.height < 24 || r.width * r.height >= innerWidth * innerHeight * 0.5) continue;
      if (r.left >= box2.r || r.right <= box2.l || r.top >= box2.b || r.bottom <= box2.t) continue;
      if ((m as HTMLElement & { checkVisibility?: (o: object) => boolean }).checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) === false) continue;
      return m.tagName.toLowerCase();
    }
    return "";
  }

  /* ---- placement ---- */
  interface Placement { side: Side; anchor: Anchor; box: Rect; size: CueSize; text: string; flip?: boolean; row?: boolean }
  /** An inner scroll region: the squirrel goes where its scrollbar is, beside it, else under or over its end. */
  const SCROLL_SIDES: Side[] = ["right", "bottom", "top", "left"];
  function sizeBubble(text: string, maxW: number): { bw: number; bh: number } {
    bubble.textContent = text;
    bubble.style.maxWidth = Math.max(60, Math.min(text.length > 40 ? 300 : 170, Math.floor(maxW))) + "px";
    return { bw: bubble.offsetWidth, bh: bubble.offsetHeight };
  }
  function visibleTarget(el: HTMLElement, inset: number): Rect {
    const r = rectOf(el);
    const x = Math.max(r.x, 0), y = Math.max(r.y, inset);
    return { x, y, w: Math.min(r.x + r.w, innerWidth) - x, h: Math.min(r.y + r.h, innerHeight) - y };
  }
  /** Above or below a wide row, stand by the part that holds its items, not the middle of the empty rest. */
  function itemsExtent(el: HTMLElement, t: Rect): Rect {
    let x0 = Infinity, x1 = -Infinity;
    for (const c of Array.from(el.children)) {
      const r = c.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      x0 = Math.min(x0, r.left); x1 = Math.max(x1, r.right);
    }
    x0 = Math.max(x0, t.x); x1 = Math.min(x1, t.x + t.w);
    return x1 - x0 > 0 && x1 - x0 < t.w * 0.9 ? { x: x0, y: t.y, w: x1 - x0, h: t.h } : t;
  }
  let trace: string[] = [];
  function place(s: Source, inset: number): Placement | null {
    const full = visibleTarget(s.el, inset);
    trace = [s.id + " t=" + JSON.stringify(full)];
    // When the full cue finds no free space, a smaller squirrel with a short bubble can fit the gutter beside the target
    // (on phones always; elsewhere when the page gives a short form).
    const short = s.el.getAttribute("data-squirrel-short") || (s.kind === "scroll" ? "Scroll" : phone.matches ? SHORT_TEXT[s.text] || "" : "");
    const rounds = [{ text: s.text, sw: SQ_W(), sh: SQ_H() }];
    if (short && short !== s.text) rounds.push({ text: short, sw: 52, sh: Math.round(52 * 160 / 113) });
    cue.hidden = false;
    cue.style.visibility = "hidden";
    cue.dataset.measuring = "";
    let found: Placement | null = null;
    const scroll = s.kind === "scroll";
    const tries: { text: string; sw: number; sh: number; side: Side }[] = [];
    if (scroll) {
      // By the scrollbar first; a smaller squirrel there still beats the far side of the region.
      const compact = innerWidth <= 900;
      const small = { sw: 52, sh: Math.round(52 * 160 / 113) };
      const sizes = compact ? [small] : [{ sw: SQ_W(), sh: SQ_H() }, small];
      for (const z of sizes) for (const side of SCROLL_SIDES.slice(0, 3)) tries.push({ text: compact ? short : s.text, ...z, side });
      for (const r of rounds) for (const side of SCROLL_SIDES) tries.push({ ...r, side });
    } else for (const r of rounds) for (const side of sideOrder(s.side)) tries.push({ ...r, side });
    outer: for (const { text, sw, sh, side } of tries) {
      const horizontal = side === "top" || side === "bottom";
      // A wide, short row of items (a tab picker): stand by the items, whichever side. Devices and regions keep their own edges.
      const row = full.w >= full.h * 4;
      const t = horizontal || row ? itemsExtent(s.el, full) : full;
      const room = roomFor(side, t, innerWidth, EDGE_MARGIN);
      if (!horizontal && room < sw) continue;
      // Above or below, a one-line bubble first, then narrower two-line ones that fit tighter gaps.
      for (const cap of horizontal ? (text.length > 40 ? [300, 240, 200] : [170, 104, 84]) : [room, 110]) {
        const { bw, bh } = sizeBubble(text, horizontal ? Math.min(cap, innerWidth - 2 * EDGE_MARGIN - sw - FIG_GAP) : cap);
        const size = { sw, sh, bw, bh };
        for (const anchor of scroll && horizontal ? ["b" as Anchor] : horizontal ? anchorsFor(side) : [...anchorsFor(side), "u" as Anchor, "m" as Anchor]) {
          const box = cueBox(side, t, size, anchor, innerWidth);
          if (!insideViewport(box, innerWidth, innerHeight, inset, EDGE_MARGIN)) { trace.push(side + anchor + cap + " outside"); continue; }
          // A guide stays by its target: a cue lined up with a far screen edge points at nothing.
          if (box.x > t.x + t.w + NEAR_PX || box.x + box.w < t.x - NEAR_PX) { trace.push(side + anchor + cap + " too far"); continue; }
          const hit = blocked(box, inset, s.el);
          if (hit) { trace.push(side + anchor + cap + " blocked by " + hit); continue; }
          // By a scrollbar the squirrel stands at the bar's end with its bubble to its left.
          found = { side, anchor, box, size, text, flip: anchor === "b", row: anchor === "m" };
          break outer;
        }
      }
    }
    delete cue.dataset.measuring;
    cue.style.visibility = "";
    if (!shownId) cue.hidden = true;
    return found;
  }

  /* ---- show / hide ---- */
  const events: { t: number; what: string; id: string }[] = [];
  function log(what: string, id: string) { events.push({ t: Math.round(performance.now()), what, id }); if (events.length > 60) events.shift(); }
  let shownId: string | null = null;
  let shownSrc: Source | undefined;
  let shownAt = 0;
  let shownOnPage = { path: location.pathname, n: 0 };
  let placement: Placement | null = null;
  let hideTimer: number | undefined;
  const unplaceable = new Map<string, number>();

  function apply(p: Placement) {
    const { box, side, size, text } = p;
    cue.dataset.side = side;
    cue.toggleAttribute("data-flip", !!p.flip);
    cue.toggleAttribute("data-row", !!p.row);
    cue.style.cssText = `left:${Math.round(box.x)}px;top:${Math.round(box.y)}px;width:${Math.ceil(box.w)}px;height:${Math.ceil(box.h)}px;--sq-w:${size.sw}px;--sq-h:${size.sh}px`;
    bubble.textContent = text;
    bubble.style.maxWidth = Math.ceil(size.bw) + "px";
  }
  function show(s: Source, p: Placement) {
    clearTimeout(hideTimer);
    shownId = s.id;
    shownSrc = s;
    shownAt = performance.now();
    if (shownOnPage.path !== location.pathname) shownOnPage = { path: location.pathname, n: 0 };
    if (s.kind === "control") shownOnPage.n++;
    placement = p;
    img.src = still.matches ? STATIC : ANIMATED;
    cue.hidden = false;
    apply(p);
    cue.classList.remove("is-in");
    void cue.offsetWidth;
    cue.classList.add("is-in");
    lastRect = rectOf(s.el);
    log("show", s.id);
  }
  function hide(why: string, immediate = false) {
    if (!shownId) return;
    log("hide:" + why, shownId);
    shownId = null; shownSrc = undefined; placement = null;
    cue.classList.remove("is-in");
    clearTimeout(hideTimer);
    if (immediate) { cue.hidden = true; img.src = STATIC; return; }
    hideTimer = window.setTimeout(() => {
      if (shownId) return;
      cue.hidden = true;
      img.src = STATIC; // a stopped frame offscreen: no animation cost
    }, still.matches ? 160 : 340);
  }
  function finish(s: Source, why: string) {
    if (completed(s)) return;
    if (s.kind === "scroll") {
      scrollDone = markDone(scrollDone, s.id);
      unhint(s);
      if (shownId === s.id) hide(why, true);
      return;
    }
    done = markDone(done, s.id);
    // Controller instructions stay learned for the session; scroll guidance belongs to its region.
    done = markDone(done, "text:" + s.text);
    sources.forEach(o => { if (o.kind === "control" && o !== s && o.text === s.text && !done.has(o.id)) { done = markDone(done, o.id); unhint(o); } });
    persist();
    unhint(s);
    if (shownId === s.id) hide(why);
  }

  /* ---- the visitor starts doing it ---- */
  let lastActivity = performance.now();
  let lastScene = -1e9;
  const touchy = ["wheel", "touchstart", "pointerdown", "keydown", "scroll"];
  function noteActivity(e: Event) {
    if (!e.isTrusted) return;
    // Page scrolling counts; a region that scrolls itself (a ticker, a demo) does not.
    if (e.type === "scroll" && e.target !== doc) return;
    const target = e.target as Node | null;
    if (target && (cue as Node).contains(target)) return;
    lastActivity = performance.now();
  }
  function onDo(e: Event) {
    if (!e.isTrusted) return;
    const t = e.target as Node | null;
    if (!t || cue.contains(t)) return;
    const wheelLike = e.type === "wheel" || e.type === "touchmove";
    const eventTarget = t instanceof Element ? t : t.parentElement;
    const action = e as KeyboardEvent & WheelEvent;
    const scrollAction = startsScrolling({ type: e.type, key: action.key, deltaY: action.deltaY, ctrlKey: action.ctrlKey, metaKey: action.metaKey, altKey: action.altKey,
      control: !!eventTarget?.closest("input,textarea,select,button,a[href],[contenteditable]:not([contenteditable='false']),[role='slider'],[role='listbox'],[role='combobox']") });
    for (const s of sources) {
      if (completed(s) || !s.el.contains(t)) continue;
      if (s.kind === "scroll" && !scrollAction) continue;
      if (wheelLike && s.kind !== "scroll") continue;
      // Inertia from a scene swipe is not the visitor working this region.
      if (wheelLike && shownId !== s.id && performance.now() - lastScene < 1600) continue;
      finish(s, "did");
    }
  }
  const doEvents = ["wheel", "touchstart", "touchmove", "pointerdown", "keydown", "focusin"];
  doEvents.forEach(n => doc.addEventListener(n, onDo, { capture: true, passive: true }));
  touchy.forEach(n => window.addEventListener(n, noteActivity, { capture: true, passive: true }));
  /* A cross-origin frame (a controller, an embedded site) swallows the visitor's wheel, touch and key
     events, so the page cannot hear them. What it can see: the frame taking focus when tapped or
     clicked, and the region around the frame scrolling when the wheel or a swipe chains to it. */
  let lastFrame: Element | null = doc.activeElement && doc.activeElement.tagName === "IFRAME" ? doc.activeElement : null;
  function frameFocus() {
    const a = doc.activeElement;
    if (!a || a.tagName !== "IFRAME") { lastFrame = null; return; }
    if (a === lastFrame) return;
    lastFrame = a;
    for (const s of sources) if (s.kind === "control" && !completed(s) && s.el.contains(a)) finish(s, "did");
  }
  const onBlur = () => { setTimeout(frameFocus, 0); };
  window.addEventListener("blur", onBlur);
  function onRegionScroll(e: Event) {
    const el = e.target as HTMLElement | null;
    if (!el || el === (doc as unknown as HTMLElement) || !el.hasAttribute || !el.hasAttribute("data-scroll-owner")) return;
    const s = sources.find(x => x.el === el);
    if (!s) return;
    const now = performance.now();
    // A swipe or wheel notch arrives as many small scroll events. Measure the whole burst from where it began, so a slow first drag (1-3px an event) still counts.
    if (now - (s.scrollAt ?? -1e9) > 250 || s.from == null) s.from = s.top ?? el.scrollTop;
    s.scrollAt = now;
    s.top = el.scrollTop;
    if (el.hasAttribute("data-scroll-hinting")) { s.from = s.top; return; }
    if (!e.isTrusted || completed(s)) return;
    if (Math.abs(s.top - s.from) > 0) finish(s, "did");
  }
  window.addEventListener("scroll", onRegionScroll, { capture: true, passive: true });
  const onScene = () => { lastScene = lastActivity = performance.now(); schedule(); };
  window.addEventListener("ch:storychange", onScene);

  /* ---- a click on the squirrel does the thing, gently ---- */
  let demoTimer: number | undefined;
  let demoLive = false;
  img.addEventListener("pointerdown", e => e.preventDefault());
  img.addEventListener("click", () => {
    const s = shownSrc;
    if (!s) return;
    finish(s, "clicked");
    if (s.kind === "scroll") {
      const el = s.el, from = el.scrollTop, to = Math.min(el.scrollHeight - el.clientHeight, from + 110);
      // The demo hands the region back unless the visitor takes it over; the page may resize the content meanwhile, so it does not check where the demo ended.
      demoLive = true;
      const takeOver = () => { demoLive = false; };
      ["wheel", "touchstart", "pointerdown", "keydown"].forEach(n => el.addEventListener(n, takeOver, { once: true, passive: true }));
      // The page's preview players ignore scrolls on a region carrying this marker (the demo is not the visitor's own scroll).
      el.setAttribute("data-scroll-hinting", "");
      setTimeout(() => el.removeAttribute("data-scroll-hinting"), still.matches ? 400 : 2800);
      el.scrollTo({ top: to, behavior: still.matches ? "auto" : "smooth" });
      if (!still.matches) {
        clearTimeout(demoTimer);
        demoTimer = window.setTimeout(() => {
          if (demoLive) el.scrollTo({ top: from, behavior: "smooth" });
          demoLive = false;
        }, 1500);
      }
    } else {
      // Show which thing to try: a quiet ring on the target. No focus ring, no pressed state, nothing changes.
      s.el.classList.remove("sq-pulse");
      void s.el.offsetWidth;
      s.el.classList.add("sq-pulse");
      setTimeout(() => s.el.classList.remove("sq-pulse"), 2400);
    }
  });
  img.addEventListener("error", () => { if (img.src.endsWith("webp")) img.src = STATIC; });

  /* ---- scheduler ---- */
  let lastRect: Rect | null = null;
  /* A scroll hint is only done once the visitor has scrolled that region. After its time on screen it
     rests, and comes back the next time its region comes into view. */
  const rested = new Set<string>();
  let raf = 0;
  let timer: number | undefined;
  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; tick(); });
  }
  function tick() {
    if (doc.hidden) { if (shownId) hide("tab"); return; }
    frameFocus();
    if (!sources.length && !doc.querySelector("[data-squirrel],[data-scroll-owner],.native-story-pair")) return;
    const now = performance.now();
    const inset = headerInset();
    const measured = sources.map(s => measure(s, inset));
    const previousScrollDone = scrollDone;
    scrollDone = refreshScrollVisits(scrollDone, measured.filter((_, i) => sources[i].kind === "scroll"));
    sources.forEach(s => { if (s.kind === "scroll" && previousScrollDone.has(s.id) && !scrollDone.has(s.id)) hint(s); });
    const completedTargets = new Set(sources.filter(completed).map(s => s.id));
    if (doc.querySelector(".mnav:not([hidden])")) { if (shownId) hide("menu"); return; }
    // A timed cue (data-squirrel-for) in view goes first; the others wait for it to hand over.
    sources.forEach(s => { if (rested.has(s.id)) { const r = rectOf(s.el); if (r.y + r.h <= inset || r.y >= innerHeight) rested.delete(s.id); } });
    const lead = sources.find((s, i) => s.el.hasAttribute("data-squirrel-for") && isEligible(measured[i], completedTargets));
    const d = decide(shownId, measured, completedTargets, now, lastActivity, id => (unplaceable.get(id) || 0) <= now && (!lead || lead.id === id) && !rested.has(id)
      && (id === shownId || shownOnPage.path !== location.pathname || shownOnPage.n < MAX_PER_PAGE || sources.find(x => x.id === id)?.kind === "scroll"));
    if (d.kind === "hide") { hide("left-view"); return; }
    if (d.kind === "show") {
      const s = sources.find(x => x.id === d.id)!;
      const p = place(s, inset);
      if (p) show(s, p); else unplaceable.set(s.id, now + 1500);
      return;
    }
    if (d.kind === "keep" && shownSrc) {
      // A cue with data-squirrel-for (ms) hands over to the next one after that long on screen;
      // any other cue steps aside after MAX_SHOW_MS so it guides without nagging. A scroll cue
      // stays beside its region until the visitor scrolls it or the region leaves view.
      const forMs = Number(shownSrc.el.getAttribute("data-squirrel-for")) || (shownSrc.kind === "scroll" ? Infinity : MAX_SHOW_MS);
      if (now - shownAt >= forMs) {
        if (shownSrc.el.hasAttribute("data-squirrel-for")) lastActivity = now - IDLE_MS;
        if (shownSrc.kind === "scroll") { rested.add(shownSrc.id); hide("rest"); return; }
        finish(shownSrc, "timed"); return;
      }
      const r = rectOf(shownSrc.el);
      if (!lastRect || Math.abs(r.x - lastRect.x) > 1 || Math.abs(r.y - lastRect.y) > 1 || Math.abs(r.w - lastRect.w) > 1 || Math.abs(r.h - lastRect.h) > 1) {
        const p = place(shownSrc, inset);
        if (p) { placement = p; apply(p); lastRect = r; } else hide("no-room");
      }
    }
  }
  function rescan() { collect(); schedule(); }
  window.addEventListener("ch:embed-scrollchange", rescan);
  let mutT: number | undefined;
  const mo = typeof MutationObserver !== "undefined"
    ? new MutationObserver(list => {
        if (list.every(m => (m.target as Node) === hints || cue.contains(m.target) || hints.contains(m.target))) return;
        clearTimeout(mutT);
        mutT = window.setTimeout(rescan, 250);
      })
    : null;
  mo?.observe(doc.body, { childList: true, subtree: true });
  const onResize = () => { unplaceable.clear(); schedule(); };
  window.addEventListener("resize", onResize);
  window.addEventListener("scroll", schedule, { capture: true, passive: true });
  doc.addEventListener("visibilitychange", schedule);
  collect();
  timer = window.setInterval(() => { collect(); tick(); }, 300);

  const handle = {
    destroy() {
      clearInterval(timer); clearTimeout(hideTimer); clearTimeout(mutT); clearTimeout(demoTimer);
      cancelAnimationFrame(raf);
      mo?.disconnect();
      doEvents.forEach(n => doc.removeEventListener(n, onDo, true));
      touchy.forEach(n => window.removeEventListener(n, noteActivity, true));
      window.removeEventListener("ch:storychange", onScene);
      window.removeEventListener("ch:embed-scrollchange", rescan);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("scroll", onRegionScroll, true);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", schedule, true);
      doc.removeEventListener("visibilitychange", schedule);
      sources.forEach(unhint);
      cue.remove();
      hints.remove();
    },
    /** For checks and the dev console. */
    state() { return { shown: shownId, placement, done: [...done], scrollDone: [...scrollDone], sources: sources.map(s => ({ id: s.id, text: s.text, kind: s.kind })) }; },
    sources() { return sources.map(s => ({ id: s.id, text: s.text, side: s.side, kind: s.kind, el: s.el })); },
    reset() { done = new Set(); scrollDone = new Set(); persist(); unplaceable.clear(); collect(); schedule(); },
    trace() { return trace; },
    events() { return events.slice(); },
  };
  w.__chSquirrel = handle;
  return handle;
}
