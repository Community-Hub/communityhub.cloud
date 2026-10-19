/**
 * CMS core: finds every editable thing in the site's content objects and applies
 * stored overrides to them IN PLACE.
 *
 * Pure TypeScript with no imports, so it runs in the browser, on the server and under
 * `node --test`.
 *
 * Keys. Every editable value has a stable key made from the root name and the path to it
 * in the code default, for example `orbBeats.0.frames.1.caption`. Indexes are positions in
 * the code default, so a list the editors reorder keeps its keys. Other keys:
 *   `section:<path>#<id>`  value "hidden"            hide a whole section of a page
 *   `list:<listPath>`      value JSON (ListState)    add / remove / reorder items of a list
 *
 * Merge. `apply(state)` first puts every previously changed slot back to its default, then
 * writes the new overrides, then rebuilds the list arrays. Because the objects are patched
 * in place, every module that imported them sees the new text with no further wiring.
 */

export type SlotKind = "text" | "alt" | "link" | "email" | "image";

export interface Slot {
  key: string;
  kind: SlotKind;
  /** Page the editor groups it under, for example "Pricing". */
  page: string;
  /** Nearest title-like text above it, to tell similar strings apart. */
  context: string;
  /** Last path segment, humanised ("Caption"). */
  label: string;
  /** The text in the code. */
  def: string;
  /** Image slots: the key of the alt text in the same object, when there is one. */
  altKey?: string;
  /** Alt slots that belong to an image are edited with the image, not listed on their own. */
  ownedByImage?: boolean;
  /** Path inside the root, for example `frames.1.caption`. */
  path: string;
}

export interface RootSpec {
  name: string;
  page: string;
  value: unknown;
  /** Only these leaf names are editable (used for data files that mix text and filter values). */
  only?: readonly string[];
  /** Full keys that must not be editable. */
  skip?: RegExp;
  /** Context for the editor, by path inside the root, when the nearest title is not enough. */
  context?: (path: string) => string | undefined;
}

export interface ListSpec {
  /** Key path of the array, for example `bundles` or `orbBeats.0.frames`. */
  path: string;
  label: string;
  page: string;
  /** Short name for an item in the editor. */
  itemLabel: (item: any) => string;
}

export interface SectionSpec {
  /** Pathname, for example `/pricing`. */
  path: string;
  id: string;
  label: string;
  page: string;
}

export interface ListState {
  /** Item tokens in display order: `d3` is the default item at index 3, `nabc` an added item. */
  order: string[];
  /** Full data of the added items. */
  added: Record<string, unknown>;
  /** Identity of each default item when this was saved (its `id`, else a hash of its content), to survive edits to the code list. */
  ds?: string[];
}

export interface CmsState {
  /** Slot overrides: key to value. */
  v: Record<string, string>;
  /** List overrides: list path to state. */
  l: Record<string, ListState>;
  /** Hidden sections: `path#id`. */
  h: string[];
  /** Fingerprint of the code default each override in `v` was made against (and of `list:` rows is in ListState.ds). */
  d?: Record<string, string>;
}

/** Small stable hash (FNV-1a, 32 bit) so a stored edit can remember which default it was made against. */
export function fingerprint(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** Who a default list item is: its `id` when it has one, otherwise what it says. */
export const itemIdentity = (item: unknown): string => {
  const id = (item as { id?: unknown } | null)?.id;
  return typeof id === "string" && id ? `id:${id}` : `h:${fingerprint(JSON.stringify(item))}`;
};

export const EMPTY_STATE: CmsState = { v: {}, l: {}, h: [] };

export const SECTION_PREFIX = "section:";
export const LIST_PREFIX = "list:";
export const sectionKey = (path: string, id: string) => `${SECTION_PREFIX}${path}#${id}`;
export const listKey = (path: string) => `${LIST_PREFIX}${path}`;

const IMAGE_KEYS = new Set(["src", "icon", "image", "img", "logo", "poster"]);
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|svg|avif)(\?.*)?$/i;
const LINK_RE = /^(\/(?![\/\\])|#|https?:\/\/|mailto:|tel:)/i;
/** Leaf names that are identifiers, switches or iframe sources, never copy. */
const NEVER_TEXT = new Set([
  "id", "embed", "fit", "place", "sublocation", "url", "slug", "type", "className", "category",
  "categoryId", "filter", "status", "kind", "token", "to", "key",
]);
/** Data-file fields that are links, editable only when the root lists them in `only`. */
const LINK_LEAVES = new Set(["url", "drive_url"]);
/** Leaves that are always a link target (a case study's live address, a credit link). */
const ALWAYS_LINK = new Set(["live", "CREDIT_URL"]);
const CONTEXT_KEYS = ["title", "name", "label", "q", "heading", "id"];

export const humanize = (key: string) => {
  const spaced = key.replace(/(\D)\d+$/, "$1").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim();
  return spaced ? spaced[0].toUpperCase() + spaced.slice(1) : key;
};

const isPlain = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Accessor properties (getters) mirror other values, so they are never slots. */
const isData = (obj: object, prop: string) => {
  const d = Object.getOwnPropertyDescriptor(obj, prop);
  return !!d && "value" in d && d.writable !== false;
};

/** The copy module names attributes `Element_src1`; the part after the underscore says what the string is. */
const ATTR_RE = /_(alt|href|src|poster)\d*$/;
const attrOf = (leaf: string) => ATTR_RE.exec(leaf)?.[1] ?? leaf;
/** Key of the alt text that belongs to an image key. */
export const altKeyOf = (imageKey: string) => {
  const i = imageKey.lastIndexOf(".");
  const head = imageKey.slice(0, i + 1);
  const leaf = imageKey.slice(i + 1);
  const m = /^(.*)_(?:src|poster)(\d*)$/.exec(leaf);
  return m ? `${head}${m[1]}_alt${m[2]}` : `${head}alt`;
};

/** What kind of slot a string leaf is, or null when it is not editable. */
export function classify(rawLeaf: string, value: string, only?: readonly string[]): SlotKind | null {
  const leaf = attrOf(rawLeaf);
  if (ALWAYS_LINK.has(leaf) && !only) return LINK_RE.test(value) ? "link" : null;
  if (LINK_LEAVES.has(leaf) && only?.includes(leaf) && LINK_RE.test(value)) return "link";
  if (leaf === "alt") return only && !only.includes("alt") ? null : "alt";
  if (only && !only.includes(leaf)) return null;
  if (IMAGE_KEYS.has(leaf) && IMAGE_EXT.test(value)) return "image";
  if (leaf === "contactEmail") return "email";
  if (leaf === "href") return LINK_RE.test(value) ? "link" : null;
  if (NEVER_TEXT.has(leaf)) return null;
  if (IMAGE_KEYS.has(leaf)) return null; // a src that is not a picture (an iframe address, say)
  if (/^(\/|\.\/|https?:)/i.test(value)) return null;
  if (!/\p{L}/u.test(value)) return null;
  return "text";
}

interface Ref {
  obj: Record<string, unknown>;
  prop: string;
}

type Visit = (info: {
  path: string[];
  leaf: string;
  value: string;
  ref: Ref;
  ancestors: Record<string, unknown>[];
}) => void;

function walk(node: unknown, path: string[], ancestors: Record<string, unknown>[], visit: Visit): void {
  if (Array.isArray(node)) {
    node.forEach((child, i) => {
      // A list of plain strings ("items": ["Digital Signage", ...]) is named by the property that holds it.
      if (typeof child === "string") visit({ path: [...path, String(i)], leaf: path[path.length - 1] ?? "", value: child, ref: { obj: node as unknown as Record<string, unknown>, prop: String(i) }, ancestors });
      else walk(child, [...path, String(i)], ancestors, visit);
    });
    return;
  }
  if (!isPlain(node)) return;
  const next = [...ancestors, node];
  for (const prop of Object.keys(node)) {
    if (!isData(node, prop)) continue;
    const child = node[prop];
    if (typeof child === "string") visit({ path: [...path, prop], leaf: prop, value: child, ref: { obj: node, prop }, ancestors: next });
    else walk(child, [...path, prop], next, visit);
  }
}

function contextOf(ancestors: Record<string, unknown>[], self: Record<string, unknown>, leaf: string): string {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const a = ancestors[i];
    for (const k of CONTEXT_KEYS) {
      const v = a[k];
      if (typeof v === "string" && v && !(a === self && k === leaf) && /\p{L}/u.test(v)) return v.length > 70 ? `${v.slice(0, 67)}...` : v;
    }
  }
  return "";
}

/** One editable thing found in a list item (used for the "add an item" form). */
export interface ItemField {
  path: string;
  kind: SlotKind;
  value: string;
  label: string;
  altPath?: string;
  ownedByImage?: boolean;
}

export function itemFields(item: unknown, only?: readonly string[]): ItemField[] {
  const out: ItemField[] = [];
  walk(item, [], [], ({ path, leaf, value, ancestors }) => {
    const kind = classify(leaf, value, only);
    if (!kind) return;
    const self = ancestors[ancestors.length - 1];
    const field: ItemField = { path: path.join("."), kind, value, label: humanize(leaf) };
    if (kind === "image" && typeof self.alt === "string") field.altPath = [...path.slice(0, -1), "alt"].join(".");
    out.push(field);
  });
  const owned = new Set(out.filter((f) => f.altPath).map((f) => f.altPath));
  // Empty alt text (a decorative image) is not found by the walk above; it still belongs to its image.
  for (const f of out) if (owned.has(f.path)) f.ownedByImage = true;
  return out;
}

export function getAtPath(root: unknown, path: string): unknown {
  let cur: any = root;
  if (path === "") return cur;
  for (const part of path.split(".")) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = cur[part];
  }
  return cur;
}

export function setAtPath(root: any, path: string, value: unknown): void {
  const parts = path.split(".");
  let cur = root;
  for (const part of parts.slice(0, -1)) cur = cur[part];
  cur[parts[parts.length - 1]] = value;
}

const DEFAULT_TOKEN = /^d(\d+)$/;
export const defaultToken = (i: number) => `d${i}`;
export const isDefaultToken = (t: string) => DEFAULT_TOKEN.test(t);
export const defaultIndex = (t: string) => Number(DEFAULT_TOKEN.exec(t)?.[1] ?? -1);

export interface ListInfo {
  spec: ListSpec;
  /** The array that the site renders; patched in place. */
  array: any[];
  /** The default items, in code order. */
  defaults: any[];
  /** The root's `only` filter, to classify fields of new items the same way. */
  only?: readonly string[];
  /** Identity of each default item, taken from a copy made before any edit is applied (edits patch the live objects in place). */
  identities: string[];
}

export interface ContentIndex {
  slots: Slot[];
  slot(key: string): Slot | undefined;
  lists: ListSpec[];
  sections: SectionSpec[];
  list(path: string): ListInfo | undefined;
  apply(state: CmsState): void;
  isHidden(path: string, id: string): boolean;
  /** What the site shows now for a slot. */
  current(key: string): string | undefined;
  /**
   * Drops overrides made against code that has since changed, and re-points list tokens when default items moved.
   * Returns the state that is safe to apply, and the keys that were set aside ("stale": the editor must look again).
   */
  resolve(state: CmsState): { state: CmsState; stale: string[] };
  /** Keys set aside as stale by the last apply. */
  staleKeys(): string[];
  /** Identity of each current default item of a list (stored with a list so later code changes are noticed). */
  listIdentities(path: string): string[];
  /** Fresh copy of an item of the list, shaped like the list's items, from user data. Throws on bad data. */
  buildItem(path: string, data: unknown, token: string, check: (kind: SlotKind, value: string, def: string) => string): any;
}

export function createContentIndex(input: { roots: RootSpec[]; lists?: ListSpec[]; sections?: SectionSpec[] }): ContentIndex {
  const slots: Slot[] = [];
  const bySlot = new Map<string, Slot>();
  const refs = new Map<string, Ref>();
  const rootByName = new Map<string, RootSpec>();

  // The same object can be reachable from two roots; it is editable once, under the first.
  const seen = new WeakMap<object, Set<string>>();
  const firstSight = (ref: Ref) => {
    let props = seen.get(ref.obj);
    if (!props) seen.set(ref.obj, (props = new Set()));
    if (props.has(ref.prop)) return false;
    props.add(ref.prop);
    return true;
  };
  for (const root of input.roots) {
    rootByName.set(root.name, root);
    walk(root.value, [], [], ({ path, leaf, value, ref, ancestors }) => {
      const kind = classify(leaf, value, root.only);
      if (!kind) return;
      if (!firstSight(ref)) return;
      const key = [root.name, ...path].join(".");
      if (path.some((p) => p.includes("."))) throw new Error(`cms: key part with a dot in ${key}`);
      if (root.skip?.test(key)) return;
      const self = ancestors[ancestors.length - 1];
      const slot: Slot = {
        key,
        kind,
        page: root.page,
        context: root.context?.(path.join(".")) ?? contextOf(ancestors, self, leaf),
        label: /^\d+$/.test(path[path.length - 1]) ? `${humanize(leaf)} ${Number(path[path.length - 1]) + 1}` : humanize(leaf),
        def: value,
        path: path.join("."),
      };
      if (bySlot.has(key)) throw new Error(`cms: duplicate key ${key}`);
      bySlot.set(key, slot);
      refs.set(key, ref);
      slots.push(slot);
    });
  }
  // An empty alt ("decorative") is not a text slot of its own, but its image can still be given one.
  for (const root of input.roots) {
    walk(root.value, [], [], ({ path, leaf, value, ref, ancestors }) => {
      if (attrOf(leaf) !== "alt" || value !== "") return;
      const key = [root.name, ...path].join(".");
      if (bySlot.has(key) || root.skip?.test(key)) return;
      if (root.only && !root.only.includes("alt")) return;
      const self = ancestors[ancestors.length - 1];
      const slot: Slot = { key, kind: "alt", page: root.page, context: contextOf(ancestors, self, leaf), label: "Alt", def: "", path: path.join("."), ownedByImage: true };
      bySlot.set(key, slot);
      refs.set(key, ref);
      slots.push(slot);
    });
  }
  // Pair every image with the alt text beside it.
  for (const s of slots) {
    if (s.kind !== "image") continue;
    const altKey = altKeyOf(s.key);
    const alt = bySlot.get(altKey);
    if (alt) {
      s.altKey = altKey;
      alt.ownedByImage = true;
    }
  }

  const listInfos = new Map<string, ListInfo>();
  for (const spec of input.lists ?? []) {
    // Root names can contain dots ("copy.about"), so match the longest root that prefixes the path.
    let root: RootSpec | undefined;
    for (const r of input.roots) {
      if ((spec.path === r.name || spec.path.startsWith(`${r.name}.`)) && (!root || r.name.length > root.name.length)) root = r;
    }
    if (!root) throw new Error(`cms: list ${spec.path} has no root`);
    const array = getAtPath(root.value, spec.path.slice(root.name.length + 1));
    if (!Array.isArray(array)) throw new Error(`cms: list ${spec.path} is not an array`);
    listInfos.set(spec.path, { spec, array, defaults: [...array], only: root.only, identities: structuredClone(array).map(itemIdentity) });
  }

  let applied = new Set<string>();
  let appliedLists = new Map<string, string>();
  let hidden = new Set<string>();

  const resolve = (state: CmsState): { state: CmsState; stale: string[] } => {
    const stale: string[] = [];
    const v: Record<string, string> = {};
    for (const [key, value] of Object.entries(state.v)) {
      const slot = bySlot.get(key);
      const made = state.d?.[key];
      if (slot && made !== undefined && made !== fingerprint(slot.def)) stale.push(key);
      else v[key] = value;
    }
    const l: Record<string, ListState> = {};
    for (const [path, ls] of Object.entries(state.l)) {
      const info = listInfos.get(path);
      if (!info || !ls.ds) {
        l[path] = ls;
        continue;
      }
      const now = info.identities;
      if (ls.ds.length === now.length && ls.ds.every((x, i) => x === now[i])) {
        l[path] = { order: ls.order, added: ls.added };
        continue;
      }
      // The code list changed. Items can be followed only when each one is still there exactly once.
      const unique = new Set(now).size === now.length && new Set(ls.ds).size === ls.ds.length;
      const sameSet = unique && ls.ds.length === now.length && ls.ds.every((x) => now.includes(x));
      if (!sameSet) {
        stale.push(listKey(path));
        continue;
      }
      const order = ls.order.map((t) => (isDefaultToken(t) ? defaultToken(now.indexOf(ls.ds![defaultIndex(t)])) : t));
      l[path] = { order, added: ls.added };
    }
    return { state: { v, l, h: state.h }, stale };
  };
  let lastStale: string[] = [];

  const apply = (input: CmsState) => {
    const { state, stale } = resolve(input);
    lastStale = stale;
    const next = new Set<string>();
    for (const [key, value] of Object.entries(state.v)) {
      const ref = refs.get(key);
      if (!ref) continue; // a key the code no longer has: ignored, kept in history
      ref.obj[ref.prop] = value;
      next.add(key);
    }
    for (const key of applied) {
      if (next.has(key)) continue;
      const ref = refs.get(key);
      if (ref) ref.obj[ref.prop] = bySlot.get(key)!.def;
    }
    applied = next;

    hidden = new Set(state.h);

    for (const [path, info] of listInfos) {
      const ls = state.l[path];
      const sig = ls ? JSON.stringify(ls) : "";
      if ((appliedLists.get(path) ?? "") === sig) continue;
      let items: any[];
      if (ls) {
        items = [];
        for (const token of ls.order) {
          if (isDefaultToken(token)) {
            const d = info.defaults[defaultIndex(token)];
            if (d !== undefined) items.push(d);
          } else if (ls.added[token] !== undefined) {
            items.push(structuredClone(ls.added[token]));
          }
        }
      } else {
        items = [...info.defaults];
      }
      info.array.splice(0, info.array.length, ...items);
      if (sig) appliedLists.set(path, sig);
      else appliedLists.delete(path);
    }
  };

  return {
    slots,
    slot: (key) => bySlot.get(key),
    lists: [...listInfos.values()].map((l) => l.spec),
    sections: input.sections ?? [],
    list: (path) => listInfos.get(path),
    apply,
    isHidden: (path, id) => hidden.has(`${path}#${id}`),
    current: (key) => {
      const ref = refs.get(key);
      return ref ? (ref.obj[ref.prop] as string) : undefined;
    },
    resolve,
    staleKeys: () => lastStale,
    listIdentities: (path) => listInfos.get(path)?.identities ?? [],
    buildItem: (path, data, token, check) => {
      const info = listInfos.get(path);
      if (!info || info.defaults.length === 0) throw new Error("unknown list");
      return conform(info.defaults[0], data, info.only, check, token);
    },
  };
}

/**
 * Copy `template`'s shape, taking editable string leaves from `data`. Non-editable leaves
 * (ids, iframe addresses, numbers) always come from the template, so an added item cannot
 * carry anything the site did not already allow. `check` validates each editable value.
 */
function conform(
  template: unknown,
  data: unknown,
  only: readonly string[] | undefined,
  check: (kind: SlotKind, value: string, def: string) => string,
  token: string,
  leaf = "",
): any {
  if (typeof template === "string") {
    if (leaf === "id") return `${template}-${token}`;
    const kind = classify(leaf, template, only) ?? (leaf === "alt" ? "alt" : null);
    if (!kind) return template;
    if (typeof data !== "string") return template;
    return check(kind, data, template);
  }
  if (Array.isArray(template)) {
    if (!Array.isArray(data)) return structuredClone(template);
    if (data.length > 200) throw new Error("too many entries");
    return data.map((d, i) => conform(template[Math.min(i, template.length - 1)], d, only, check, token, leaf));
  }
  if (isPlain(template)) {
    const d = isPlain(data) ? data : {};
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(template)) {
      if (!isData(template, k)) continue;
      out[k] = conform(template[k], d[k], only, check, token, k);
    }
    return out;
  }
  return template;
}
