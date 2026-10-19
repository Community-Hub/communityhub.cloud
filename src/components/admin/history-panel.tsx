import { useCallback, useEffect, useState } from "react";
import type { Revision } from "@/lib/cms/store";
import { errorText, get, post } from "./api";
import { btn, btnGhost, isPicture, Notice, short, when } from "./ui";

function Value({ keyName, value }: { keyName: string; value: string | null }) {
  if (keyName.startsWith("section:")) return <>{value === "hidden" ? "hidden" : "showing (original)"}</>;
  if (keyName.startsWith("list:")) {
    if (value === null) return <>(original list)</>;
    try {
      const ls = JSON.parse(value) as { order: string[]; added: Record<string, unknown> };
      return <>{ls.order.length} items, {Object.keys(ls.added).length} added</>;
    } catch {
      return <>(list)</>;
    }
  }
  if (isPicture(value)) return <img src={value as string} alt="" className="inline-block h-10 rounded border border-line align-middle" />;
  return <span className="break-words">{short(value)}</span>;
}

const actionName = { edit: "Edited", revert: "Put back", reset: "Reset to original" } as const;

/** Who changed what and when, with a way back. For one item (keyName) or everything. */
export function HistoryPanel({ keyName, labelOf, onClose, reload }: { keyName: string | null; labelOf: (key: string) => string; onClose?: () => void; reload: () => Promise<void> }) {
  const [rows, setRows] = useState<Revision[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const q = keyName ? `?key=${encodeURIComponent(keyName)}` : "";
      const res = await get<{ revisions: Revision[] }>(`/api/cms/history${q}`);
      setRows(res.revisions);
      setErr(null);
    } catch (e) {
      setErr(errorText(e));
    }
  }, [keyName]);
  useEffect(() => {
    void load();
  }, [load]);

  async function revert(id: number) {
    setBusy(id);
    setDone(null);
    try {
      await post("/api/cms/revert", { revisionId: id });
      await reload();
      await load();
      setDone("Put back. It shows on the site within about a minute.");
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(null);
    }
  }
  async function resetKey() {
    if (!keyName) return;
    setBusy(-1);
    try {
      await post("/api/cms/reset", { key: keyName });
      await reload();
      await load();
      setDone("Put back to the original.");
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section aria-label="History" className="rounded-lg border border-line bg-white p-4" data-testid="history-panel">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl text-pine">{keyName ? `History: ${labelOf(keyName)}` : "Recent changes"}</h2>
        <div className="flex gap-2">
          {keyName ? (
            <button type="button" className={btnGhost} disabled={busy !== null} onClick={resetKey}>
              Reset to original
            </button>
          ) : null}
          {onClose ? (
            <button type="button" className={btnGhost} onClick={onClose}>
              Close
            </button>
          ) : null}
        </div>
      </div>
      {err ? <Notice kind="error">{err}</Notice> : null}
      {done ? <Notice kind="ok">{done}</Notice> : null}
      {rows === null && !err ? <p className="text-sm text-ink/60">Loading...</p> : null}
      {rows && rows.length === 0 ? <p className="text-sm text-ink/60">No changes yet. Everything is the original.</p> : null}
      <ol className="grid gap-2">
        {rows?.map((r) => (
          <li key={r.id} className="rounded-md bg-field p-3 text-sm" data-testid="history-row">
            <p className="text-xs text-ink/60">
              {actionName[r.action]} by {r.actor_email} on {when(r.created_at)}
              {keyName ? "" : ` - ${labelOf(r.key)}`}
            </p>
            <p className="mt-1 text-ink/70">
              Before: <Value keyName={r.key} value={r.old_value} />
            </p>
            <p className="text-ink">
              After: <Value keyName={r.key} value={r.new_value} />
            </p>
            <div className="mt-2">
              <button type="button" className={btn} disabled={busy !== null} data-testid="history-restore" onClick={() => revert(r.id)}>
                Put this version back
              </button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
