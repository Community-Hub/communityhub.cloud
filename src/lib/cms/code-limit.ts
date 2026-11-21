/**
 * How many sign-in codes one address may be emailed. Anyone who knows an editor's address can ask for a code, so
 * without a cap a stranger could fill that person's inbox; the per-IP limit alone does not stop someone with many
 * addresses of their own. Counted in the sign-in library's own rate-limit table under a key it never uses.
 */
import { randomUUID } from "node:crypto";
import type { Sql } from "../db.ts";

export const CODE_MAIL_MAX = 5;
export const CODE_MAIL_WINDOW_MS = 15 * 60_000;

/** True when this address may be sent another code now (and counts it); false when it has had its share for the window. */
export async function takeCodeSlot(sql: Sql, email: string, now: number = Date.now()): Promise<boolean> {
  const key = `code-mail:${email.trim().toLowerCase()}`;
  const cutoff = now - CODE_MAIL_WINDOW_MS;
  const rows = (await sql`
    insert into cms_rate_limit ("id", "key", "count", "lastRequest")
    values (${randomUUID()}, ${key}, 1, ${now}::bigint)
    on conflict ("key") do update set
      "count" = case when cms_rate_limit."lastRequest" < ${cutoff}::bigint then 1 else cms_rate_limit."count" + 1 end,
      "lastRequest" = case when cms_rate_limit."lastRequest" < ${cutoff}::bigint then ${now}::bigint else cms_rate_limit."lastRequest" end
    returning "count"
  `) as { count: number | string }[];
  return Number(rows[0]?.count ?? CODE_MAIL_MAX + 1) <= CODE_MAIL_MAX;
}
