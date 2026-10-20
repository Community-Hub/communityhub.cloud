/** SQL for the CMS: current overrides and the append-only revision history. */
import type { Sql } from "../db.ts";
import { EMPTY_STATE, LIST_PREFIX, SECTION_PREFIX, type CmsState, type ListState } from "./core.ts";

export interface Revision {
  id: number;
  key: string;
  old_value: string | null;
  new_value: string | null;
  action: "edit" | "revert" | "reset";
  actor_email: string;
  reverted_from: number | null;
  batch: string | null;
  created_at: string;
}

export interface Write {
  key: string;
  /** null resets the key to the code default. */
  value: string | null;
  /** Fingerprint of the code default this value was made against (slots only), so a later change to the code is noticed. */
  defHash?: string;
}

export function createCmsStore(sql: Sql) {
  /** Every stored override, folded into the shape `apply` takes. */
  async function loadState(): Promise<CmsState> {
    const rows = await sql<{ key: string; value: string; def_hash: string | null }>`select key, value, def_hash from cms_content`;
    const state: CmsState = { v: {}, l: {}, h: [], d: {} };
    for (const { key, value, def_hash } of rows) {
      if (key.startsWith(SECTION_PREFIX)) {
        if (value === "hidden") state.h.push(key.slice(SECTION_PREFIX.length));
      } else if (key.startsWith(LIST_PREFIX)) {
        try {
          const ls = JSON.parse(value) as ListState;
          if (Array.isArray(ls.order) && ls.added && typeof ls.added === "object") state.l[key.slice(LIST_PREFIX.length)] = ls;
        } catch {
          /* a damaged row is ignored; the default list shows */
        }
      } else {
        state.v[key] = value;
        if (def_hash) state.d![key] = def_hash;
      }
    }
    return state.h.length || Object.keys(state.v).length || Object.keys(state.l).length ? state : { ...EMPTY_STATE, v: {}, l: {}, h: [] };
  }

  /** Current stored value of a key, or null when the code default shows. */
  async function getValue(key: string): Promise<string | null> {
    const rows = await sql<{ value: string }>`select value from cms_content where key = ${key}`;
    return rows[0]?.value ?? null;
  }

  /**
   * Change one key and record the revision in the same statement, so a change never exists
   * without its history. Returns the revision id, or null when nothing changed.
   */
  async function write(
    w: Write,
    actor: string,
    action: Revision["action"] = "edit",
    opts: { revertedFrom?: number; batch?: string } = {},
  ): Promise<number | null> {
    const params = [w.key, w.value, actor, action, opts.revertedFrom ?? null, opts.batch ?? null, w.defHash ?? null];
    if (w.value === null) {
      const delParams = [w.key, actor, action, opts.revertedFrom ?? null, opts.batch ?? null];
      const rows = await sql.query<{ id: number }>(
        `with old as (delete from cms_content where key = $1::text returning value)
         insert into cms_revisions (key, old_value, new_value, action, actor_email, reverted_from, batch)
         select $1::text, old.value, null, $3::text, $2::text, $4::bigint, $5::text from old
         returning id`,
        delParams,
      );
      return rows[0]?.id ?? null;
    }
    const cur = (await sql<{ value: string; def_hash: string | null }>`select value, def_hash from cms_content where key = ${w.key}`)[0];
    if (cur?.value === w.value) {
      // Same words, but they may now be confirmed against the current code default: remember that, no new revision.
      if (w.defHash && cur.def_hash !== w.defHash) await sql`update cms_content set def_hash = ${w.defHash} where key = ${w.key}`;
      return null;
    }
    const rows = await sql.query<{ id: number }>(
      `with old as (select value from cms_content where key = $1::text),
            up as (
              insert into cms_content (key, value, updated_by, updated_at, def_hash)
              values ($1::text, $2::text, $3::text, now(), $7::text)
              on conflict (key) do update
                set value = excluded.value, updated_by = excluded.updated_by, updated_at = now(), def_hash = excluded.def_hash
              returning 1
            )
       insert into cms_revisions (key, old_value, new_value, action, actor_email, reverted_from, batch)
       select $1::text, (select value from old), $2::text, $4::text, $3::text, $5::bigint, $6::text from up
       returning id`,
      params,
    );
    return rows[0]?.id ?? null;
  }

  /** Several keys as one logical change (they share a batch id and are reverted together). */
  async function writeMany(ws: Write[], actor: string, action: Revision["action"], batch: string, revertedFrom?: number) {
    // One transaction, so a picture and its alt text (or a revert) is saved whole or not at all.
    const run = async (db: Sql) => {
      const ids: number[] = [];
      for (const w of ws) {
        const id = await createCmsStore(db).write(w, actor, action, { batch, revertedFrom });
        if (id !== null) ids.push(id);
      }
      return ids;
    };
    return sql.transaction ? sql.transaction(run) : run(sql);
  }

  async function history(key: string | null, limit = 50, before?: number): Promise<Revision[]> {
    const lim = Math.min(Math.max(Math.trunc(limit) || 50, 1), 200);
    const b = before ?? 9007199254740991;
    return key === null
      ? sql<Revision>`select * from cms_revisions where id < ${b} order by id desc limit ${lim}`
      : sql<Revision>`select * from cms_revisions where key = ${key} and id < ${b} order by id desc limit ${lim}`;
  }

  async function revision(id: number): Promise<Revision | null> {
    return (await sql<Revision>`select * from cms_revisions where id = ${id}`)[0] ?? null;
  }

  async function batchOf(batch: string): Promise<Revision[]> {
    return sql<Revision>`select * from cms_revisions where batch = ${batch} order by id`;
  }

  /** Keys that currently hold an override, for the editor's "changed" markers. */
  async function changedKeys(): Promise<Record<string, { by: string; at: string }>> {
    const rows = await sql<{ key: string; updated_by: string; updated_at: string }>`select key, updated_by, updated_at::text as updated_at from cms_content`;
    return Object.fromEntries(rows.map((r) => [r.key, { by: r.updated_by, at: r.updated_at }]));
  }

  return { loadState, getValue, write, writeMany, history, revision, batchOf, changedKeys };
}

export type CmsStore = ReturnType<typeof createCmsStore>;
