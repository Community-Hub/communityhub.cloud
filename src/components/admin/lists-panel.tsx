import { useEffect, useMemo, useState } from "react";
import type { AdminList } from "@/lib/cms/service";
import { errorText, post, upload } from "./api";
import { btn, btnGhost, inputCls, Notice, when } from "./ui";

type Item = AdminList["items"][number];
const token = () => `n${Math.random().toString(36).slice(2, 10).padEnd(6, "x")}`;

/** Build a nested object from dotted paths such as `frames.0.title`. */
function setPath(target: Record<string, unknown>, path: string, value: string) {
  const parts = path.split(".");
  let cur: any = target;
  parts.forEach((part, i) => {
    const last = i === parts.length - 1;
    const next = parts[i + 1];
    if (last) cur[part] = value;
    else cur = cur[part] ??= /^\d+$/.test(next) ? [] : {};
  });
}

export function ListCard({ list, reload, openHistory }: { list: AdminList; reload: () => Promise<void>; openHistory: (key: string) => void }) {
  const [items, setItems] = useState<Item[]>(list.items);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [adding, setAdding] = useState(false);
  useEffect(() => setItems(list.items), [list.items]);

  const dirty = useMemo(() => items.map((i) => i.token).join() !== list.items.map((i) => i.token).join(), [items, list.items]);
  const removedDefaults = list.defaults.filter((d) => !items.some((i) => i.token === d.token));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = items.slice();
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    setItems(next);
  };

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const added: Record<string, unknown> = {};
      for (const it of items) if (it.added) added[it.token] = it.data;
      await post("/api/cms/list", { path: list.path, list: { order: items.map((i) => i.token), added } });
      await reload();
      setMsg({ kind: "ok", text: "Saved. It shows on the site within about a minute." });
    } catch (e) {
      setMsg({ kind: "error", text: errorText(e) });
    } finally {
      setBusy(false);
    }
  }
  async function resetList() {
    setBusy(true);
    setMsg(null);
    try {
      await post("/api/cms/reset", { key: `list:${list.path}` });
      await reload();
      setMsg({ kind: "ok", text: "Put back to the original list." });
    } catch (e) {
      setMsg({ kind: "error", text: errorText(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-lg border border-line bg-white p-4" data-testid="list-card" data-path={list.path}>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-pine">{list.label}</p>
          <p className="text-xs text-ink/60">
            {list.page} - {items.length} {items.length === 1 ? "item" : "items"}
            {list.changed ? ` - changed by ${list.changed.by} on ${when(list.changed.at)}` : ""}
          </p>
          {list.stale ? <p role="status" className="text-xs font-bold text-red-700">Out of date: this list changed on the site after you edited it, so the original list is showing. Make your changes again to save them.</p> : null}
        </div>
      </div>
      <ol className="grid gap-1">
        {items.map((it, n) => (
          <li key={it.token} className="flex items-center gap-2 rounded-md bg-field px-2 py-1.5 text-sm" data-testid="list-item">
            <span className="w-6 text-right text-xs text-ink/60">{n + 1}</span>
            <span className="min-w-0 flex-1 truncate" title={it.label}>
              {it.label || "(untitled)"}
              {it.added ? <span className="ml-2 rounded bg-lime/40 px-1.5 text-xs">new</span> : null}
            </span>
            <button type="button" className={btnGhost} aria-label={`Move ${it.label} up`} disabled={busy || n === 0} onClick={() => move(n, n - 1)}>
              Up
            </button>
            <button type="button" className={btnGhost} aria-label={`Move ${it.label} down`} disabled={busy || n === items.length - 1} onClick={() => move(n, n + 1)}>
              Down
            </button>
            <button
              type="button"
              className={btnGhost}
              aria-label={`Remove ${it.label}`}
              disabled={busy || items.length <= 1}
              data-testid="list-remove"
              onClick={() => setItems(items.filter((x) => x.token !== it.token))}
            >
              Remove
            </button>
          </li>
        ))}
      </ol>
      {removedDefaults.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-ink/70">Removed from the original:</span>
          {removedDefaults.map((d) => (
            <button key={d.token} type="button" className={btnGhost} onClick={() => setItems([...items, { token: d.token, label: d.label, added: false }])}>
              Put back "{d.label}"
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className={btn} disabled={busy || !dirty} data-testid="list-save" onClick={save}>
          Save list
        </button>
        <button type="button" className={btnGhost} disabled={busy || !dirty} onClick={() => setItems(list.items)}>
          Discard changes
        </button>
        <button type="button" className={btnGhost} disabled={busy} onClick={() => setAdding(!adding)} data-testid="list-add-toggle">
          {adding ? "Close the form" : "Add an item"}
        </button>
        <button type="button" className={btnGhost} disabled={busy || !list.changed} onClick={resetList}>
          Reset to original list
        </button>
        <button type="button" className={btnGhost} onClick={() => openHistory(`list:${list.path}`)}>
          History
        </button>
      </div>
      {adding ? <AddItem list={list} onAdd={(it) => { setItems([...items, it]); setAdding(false); setMsg({ kind: "ok", text: "Added to the list below. Press Save list to publish it." }); }} /> : null}
      {msg ? <div className="mt-2"><Notice kind={msg.kind}>{msg.text}</Notice></div> : null}
    </li>
  );
}

function AddItem({ list, onAdd }: { list: AdminList; onAdd: (item: Item) => void }) {
  const fields = list.fields.filter((f) => !f.ownedByImage);
  const [vals, setVals] = useState<Record<string, string>>(() => Object.fromEntries(list.fields.map((f) => [f.path, f.kind === "text" || f.kind === "alt" ? "" : f.value])));
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (path: string, v: string) => setVals((p) => ({ ...p, [path]: v }));

  async function pick(field: (typeof fields)[number], file: File | null) {
    if (!file) return;
    setErr(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setErr("Only jpg, png and webp pictures are accepted.");
    if (file.size > 4_000_000) return setErr("That picture is larger than 4 MB.");
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const { url } = await upload(form);
      set(field.path, url);
    } catch (e) {
      setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  function submit() {
    setErr(null);
    for (const f of fields) {
      if (f.kind !== "image" && !vals[f.path]?.trim()) return setErr(`Fill in "${f.label}".`);
      if (f.kind === "image" && f.altPath && !vals[f.altPath]?.trim()) return setErr("Describe the picture (alt text is required).");
    }
    const data: Record<string, unknown> = {};
    for (const f of list.fields) setPath(data, f.path, vals[f.path] ?? f.value);
    const first = fields.find((f) => f.kind === "text") ?? fields[0];
    onAdd({ token: token(), label: (first && vals[first.path]) || "New item", added: true, data });
  }

  return (
    <div className="mt-3 grid gap-3 rounded-md border border-leaf/50 bg-water p-3" data-testid="list-add-form">
      <p className="text-sm text-ink/80">
        The new item copies the layout of the first item. Fill in each part. Items you add can be moved or removed; change their words by removing and adding again.
      </p>
      {fields.map((f) => (
        <div key={f.path} className="grid gap-1">
          <label className="grid gap-1 text-sm font-bold text-pine">
            {f.label} {f.altPath ? "(picture)" : f.kind === "link" ? "(link)" : ""}
            {f.kind === "image" ? (
              <input type="file" accept="image/jpeg,image/png,image/webp" className="text-sm font-normal text-ink" onChange={(e) => pick(f, e.target.files?.[0] ?? null)} />
            ) : (
              <input type="text" className={inputCls} value={vals[f.path] ?? ""} placeholder={f.value} onChange={(e) => set(f.path, e.target.value)} data-testid={`add-${f.path}`} />
            )}
          </label>
          {f.kind === "image" ? <p className="text-xs text-ink/60">{vals[f.path] === f.value ? "Using the first item's picture until you upload one." : "Picture ready."}</p> : null}
          {f.altPath ? (
            <label className="grid gap-1 text-sm font-bold text-pine">
              Describe the picture (required)
              <input type="text" className={inputCls} value={vals[f.altPath] ?? ""} onChange={(e) => set(f.altPath!, e.target.value)} />
            </label>
          ) : null}
        </div>
      ))}
      {err ? <Notice kind="error">{err}</Notice> : null}
      <div>
        <button type="button" className={btn} disabled={busy} onClick={submit} data-testid="list-add-confirm">
          Add to list
        </button>
      </div>
    </div>
  );
}
