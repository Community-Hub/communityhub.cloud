/** In-memory Postgres (PGlite) with the CMS migrations applied, for unit tests. */
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import type { Sql } from "../db.ts";

type Run = (text: string, params: unknown[]) => Promise<any[]>;

const wrap = (run: Run, transaction?: (fn: (run: Run) => Promise<any>) => Promise<any>): Sql => {
  const sql = (async (strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return run(text, values);
  }) as unknown as Sql;
  sql.query = ((text: string, params: unknown[] = []) => run(text, params)) as Sql["query"];
  if (transaction) sql.transaction = ((fn: (tx: Sql) => Promise<unknown>) => transaction((r) => fn(wrap(r)))) as Sql["transaction"];
  return sql;
};

/** `control.down = true` makes every query fail, `control.delayMs` makes each one slow (a database that is down or waking up). */
export interface TestDbControl {
  down: boolean;
  delayMs: number;
}

export async function testSql(control: TestDbControl = { down: false, delayMs: 0 }): Promise<Sql> {
  const pg = new PGlite({ parsers: { 20: Number } });
  await pg.waitReady;
  for (const f of ["0001_cms.sql", "0002_cms_def_hash.sql"]) {
    await pg.exec(readFileSync(new URL(`../../../migrations/${f}`, import.meta.url), "utf8"));
  }
  const gate = async () => {
    if (control.delayMs) await new Promise((r) => setTimeout(r, control.delayMs));
    if (control.down) throw new Error("connection refused (test)");
  };
  const run: Run = async (text, params) => {
    await gate();
    return (await pg.query(text, params)).rows;
  };
  return wrap(run, (fn) =>
    pg.transaction((tx) =>
      fn(async (text, params) => {
        await gate();
        return (await tx.query(text, params)).rows;
      }),
    ),
  );
}
