/**
 * The CMS operations the admin calls: read the state, save a text / link / picture, change
 * a list, hide a section, view history, revert. Everything is validated here, so the
 * server functions are thin and the same rules run in unit tests.
 */
import type { Sql } from "../db.ts";
import {
  defaultIndex,
  EMPTY_STATE,
  fingerprint,
  isDefaultToken,
  itemFields,
  listKey,
  sectionKey,
  type CmsState,
  type ContentIndex,
  type ItemField,
  type ListState,
  type Slot,
} from "./core.ts";
import { createCmsStore, type Revision, type Write } from "./store.ts";
import { checkValue, CmsError, isToken, lengthWarning, MAX_LIST_ITEMS } from "./validate.ts";

export interface AdminSlot extends Slot {
  value: string;
  changed?: { by: string; at: string };
  warning?: string | null;
  /** An edit exists but was made against older wording in the code, so it is not showing. Save again to keep it. */
  stale?: boolean;
}

export interface AdminList {
  path: string;
  label: string;
  page: string;
  changed?: { by: string; at: string };
  /** The list's saved order was made against an older list in the code, so it is not showing. */
  stale?: boolean;
  /** Items in display order. `data` is present for added items only. */
  items: { token: string; label: string; added: boolean; data?: unknown }[];
  /** Default items, to put back removed ones. */
  defaults: { token: string; label: string }[];
  fields: ItemField[];
}

export interface AdminSection {
  path: string;
  id: string;
  label: string;
  page: string;
  hidden: boolean;
  changed?: { by: string; at: string };
}

export interface Overview {
  slots: AdminSlot[];
  lists: AdminList[];
  sections: AdminSection[];
}

const TTL_MS = 5000;
const batchId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function createCmsService(opts: { sql: Sql; index: ContentIndex; /** Called after every change, e.g. to purge the CDN. */ onChange?: () => void }) {
  const { index } = opts;
  const store = createCmsStore(opts.sql);
  let cache: { at: number; state: Promise<CmsState> } | null = null;
  /** The state the shared content objects were last patched with. Sent to browsers when the database cannot be reached. */
  let lastGood: CmsState = EMPTY_STATE;

  /**
   * Overrides from the database, applied to the site content. Cached a few seconds.
   * Note: applying patches objects shared by every request in this process, so a page that is mid-render when a
   * newer state lands can show newer text than the state it ships to the browser. The browser then redraws that
   * page once (a hydration warning, nothing is lost) and it is correct on the next load.
   */
  function state(): Promise<CmsState> {
    const now = Date.now();
    if (cache && now - cache.at < TTL_MS) return cache.state;
    const p = store.loadState().then((raw) => {
      const { state: s } = index.resolve(raw);
      index.apply(s);
      lastGood = s;
      return s;
    });
    cache = { at: now, state: p };
    p.catch(() => {
      if (cache?.state === p) cache = null; // a failed load must not stick
    });
    return p;
  }
  const invalidate = () => {
    cache = null;
    try {
      opts.onChange?.();
    } catch {
      /* a failed purge must not fail the save */
    }
  };

  /** What public pages ship: the saved edits, or the last good state when the database is slow or down. Never throws. */
  async function publicState(timeoutMs = 1000): Promise<CmsState> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        state(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error(`no answer from the database in ${timeoutMs} ms`)), timeoutMs);
        }),
      ]);
    } catch (err) {
      console.error("[cms] could not load edits, using the last good state:", err instanceof Error ? err.message : err);
      return lastGood;
    } finally {
      clearTimeout(timer);
    }
  }

  const keyKind = (key: string): "slot" | "list" | "section" | null => {
    if (index.slot(key)) return "slot";
    if (key.startsWith("list:") && index.list(key.slice(5))) return "list";
    if (key.startsWith("section:") && index.sections.some((s) => sectionKey(s.path, s.id) === key)) return "section";
    return null;
  };

  /** Group a slot with the slots that must change with it (a picture with its alt text). */
  const groupOf = (key: string): string[] => {
    const s = index.slot(key);
    return s?.kind === "image" && s.altKey ? [key, s.altKey] : [key];
  };

  async function overview(): Promise<Overview> {
    const [raw, changed] = await Promise.all([store.loadState(), store.changedKeys()]);
    const { state: st, stale } = index.resolve(raw);
    const staleSet = new Set(stale);
    const slots: AdminSlot[] = index.slots.map((s) => {
      const value = st.v[s.key] ?? s.def;
      return { ...s, value, changed: changed[s.key], stale: staleSet.has(s.key) || undefined, warning: value === s.def ? null : lengthWarning(s.def, value) };
    });
    const lists: AdminList[] = index.lists.map((spec) => {
      const info = index.list(spec.path)!;
      const ls = st.l[spec.path];
      const order = ls ? ls.order : info.defaults.map((_, i) => `d${i}`);
      const items = order.flatMap((token) => {
        if (isDefaultToken(token)) {
          const d = info.defaults[defaultIndex(token)];
          return d === undefined ? [] : [{ token, label: spec.itemLabel(d), added: false }];
        }
        const data = ls?.added[token];
        return data === undefined ? [] : [{ token, label: spec.itemLabel(data), added: true, data }];
      });
      return {
        path: spec.path,
        label: spec.label,
        page: spec.page,
        changed: changed[listKey(spec.path)],
        stale: staleSet.has(listKey(spec.path)) || undefined,
        items,
        defaults: info.defaults.map((d, i) => ({ token: `d${i}`, label: spec.itemLabel(d) })),
        fields: itemFields(info.defaults[0], info.only),
      };
    });
    const hidden = new Set(st.h);
    const sections: AdminSection[] = index.sections.map((s) => ({
      ...s,
      hidden: hidden.has(`${s.path}#${s.id}`),
      changed: changed[sectionKey(s.path, s.id)],
    }));
    return { slots, lists, sections };
  }

  /** Save a text, link, email or alt text. Saving the original text clears the override. */
  async function saveSlot(key: string, raw: unknown, actor: string): Promise<{ warning: string | null }> {
    const slot = index.slot(key);
    if (!slot) throw new CmsError("That text is not on the site any more.", 404);
    if (slot.kind === "image") throw new CmsError("Use the picture uploader for pictures.");
    const value = checkValue(slot.kind, raw, slot.def);
    await store.write({ key, value: value === slot.def ? null : value, defHash: fingerprint(slot.def) }, actor, "edit");
    invalidate();
    return { warning: lengthWarning(slot.def, value) };
  }

  /** Check the alt text for a picture before anything is stored. Null when the picture has no alt slot. */
  function checkAlt(key: string, alt: unknown): string | null {
    const slot = index.slot(key);
    if (!slot || slot.kind !== "image") throw new CmsError("That picture is not on the site any more.", 404);
    if (!slot.altKey) return null;
    const altSlot = index.slot(slot.altKey)!;
    if (typeof alt !== "string" || !alt.trim()) throw new CmsError("Describe the picture for screen readers (alt text is required).");
    return checkValue("alt", alt, altSlot.def === "" ? "x" : altSlot.def);
  }

  /** Replace a picture. The alt text is required and saved together with it. */
  async function saveImage(key: string, url: unknown, alt: unknown, actor: string): Promise<void> {
    const slot = index.slot(key);
    if (!slot || slot.kind !== "image") throw new CmsError("That picture is not on the site any more.", 404);
    const src = checkValue("image", url, slot.def);
    const writes: Write[] = [{ key, value: src === slot.def ? null : src, defHash: fingerprint(slot.def) }];
    const a = checkAlt(key, alt);
    if (a !== null && slot.altKey) {
      const altDef = index.slot(slot.altKey)!.def;
      writes.push({ key: slot.altKey, value: a === altDef ? null : a, defHash: fingerprint(altDef) });
    }
    await store.writeMany(writes, actor, "edit", batchId());
    invalidate();
  }

  /** Change only the description of a picture that is already in place. */
  async function saveAlt(key: string, alt: unknown, actor: string): Promise<void> {
    const slot = index.slot(key);
    if (!slot || slot.kind !== "image") throw new CmsError("That picture is not on the site any more.", 404);
    const st = index.resolve(await store.loadState()).state;
    await saveImage(key, st.v[key] ?? slot.def, alt, actor);
  }

  /** Put a text or picture (or list, or section) back to what the code says. */
  async function reset(key: string, actor: string): Promise<void> {
    const kind = keyKind(key);
    if (!kind) throw new CmsError("Unknown item.", 404);
    const keys = kind === "slot" ? groupOf(key) : [key];
    await store.writeMany(keys.map((k) => ({ key: k, value: null })), actor, "reset", batchId());
    invalidate();
  }

  async function setSection(path: string, id: string, hidden: boolean, actor: string): Promise<void> {
    if (!index.sections.some((s) => s.path === path && s.id === id)) throw new CmsError("Unknown section.", 404);
    await store.write({ key: sectionKey(path, id), value: hidden ? "hidden" : null }, actor, hidden ? "edit" : "reset");
    invalidate();
  }

  /** Validate a list as submitted and return what to store (null = same as the code). */
  /** `keepDs`: identities the list was saved against (a revert keeps them, so an old order is flagged if the code moved on). */
  function sanitizeList(path: string, input: unknown, keepDs?: string[]): ListState | null {
    const info = index.list(path);
    if (!info) throw new CmsError("Unknown list.", 404);
    const i = input as Partial<ListState> | null;
    if (!i || !Array.isArray(i.order)) throw new CmsError("Bad list.");
    const order = i.order as unknown[];
    if (order.length < 1) throw new CmsError("A list needs at least one item.");
    if (order.length > MAX_LIST_ITEMS) throw new CmsError(`A list can hold at most ${MAX_LIST_ITEMS} items.`);
    const seen = new Set<string>();
    const added: Record<string, unknown> = {};
    const addedIn = (i.added && typeof i.added === "object" ? i.added : {}) as Record<string, unknown>;
    for (const t of order) {
      if (!isToken(t) || seen.has(t)) throw new CmsError("Bad list.");
      seen.add(t);
      if (isDefaultToken(t)) {
        if (defaultIndex(t) >= (keepDs?.length ?? info.defaults.length)) throw new CmsError("Bad list.");
      } else {
        if (!(t in addedIn)) throw new CmsError("Bad list.");
        added[t] = index.buildItem(path, addedIn[t], t, (kind, value, def) => checkValue(kind, value, def));
      }
    }
    const now = index.listIdentities(path);
    const ds = keepDs ?? now;
    const sameDefaults = ds.length === now.length && ds.every((x, n) => x === now[n]);
    const same = sameDefaults && Object.keys(added).length === 0 && order.length === info.defaults.length && order.every((t, n) => t === `d${n}`);
    return same ? null : { order: order as string[], added, ds };
  }

  async function saveList(path: string, input: unknown, actor: string): Promise<void> {
    const ls = sanitizeList(path, input);
    await store.write({ key: listKey(path), value: ls ? JSON.stringify(ls) : null }, actor, ls ? "edit" : "reset");
    invalidate();
  }

  /** Is this stored value still valid for the key? Used before restoring an old revision. */
  function checkStored(key: string, value: string | null): string | null {
    if (value === null) return null;
    const kind = keyKind(key);
    if (kind === "slot") {
      const s = index.slot(key)!;
      const v = checkValue(s.kind, value, s.def);
      return v === s.def ? null : v;
    }
    if (kind === "section") return value === "hidden" ? value : null;
    if (kind === "list") {
      const parsed = JSON.parse(value) as { ds?: unknown };
      const kept = Array.isArray(parsed.ds) && parsed.ds.every((x) => typeof x === "string") ? (parsed.ds as string[]) : undefined;
      const ls = sanitizeList(key.slice(5), parsed, kept);
      return ls ? JSON.stringify(ls) : null;
    }
    throw new CmsError("That item is not on the site any more.", 404);
  }

  /** Restore the version a revision produced (a picture and its alt text come back together). */
  async function revert(revisionId: number, actor: string): Promise<void> {
    const r = await store.revision(revisionId);
    if (!r) throw new CmsError("Unknown revision.", 404);
    const rows = r.batch ? await store.batchOf(r.batch) : [r];
    const latest = new Map<string, Revision>();
    for (const row of rows) latest.set(row.key, row);
    const writes: Write[] = [];
    for (const row of latest.values()) {
      const slot = index.slot(row.key);
      writes.push({ key: row.key, value: checkStored(row.key, row.new_value), defHash: slot ? fingerprint(slot.def) : undefined });
    }
    await store.writeMany(writes, actor, "revert", batchId(), r.id);
    invalidate();
  }

  async function history(key: string | null, limit?: number, before?: number): Promise<Revision[]> {
    if (key !== null && !keyKind(key)) {
      // keep history readable for keys the code dropped
      if (typeof key !== "string" || key.length > 300) throw new CmsError("Bad key.");
    }
    return store.history(key, limit, before);
  }

  return { state, publicState, invalidate, overview, saveSlot, saveImage, saveAlt, checkAlt, reset, setSection, saveList, revert, history, store };
}

export type CmsService = ReturnType<typeof createCmsService>;
