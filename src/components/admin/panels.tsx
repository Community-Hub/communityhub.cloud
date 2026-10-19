import { useEffect, useState } from "react";
import type { AdminSection, AdminSlot } from "@/lib/cms/service";
import { lengthWarning } from "@/lib/cms/validate";
import { errorText, post, upload } from "./api";
import { btn, btnGhost, inputCls, Notice, when } from "./ui";

interface RowProps {
  reload: () => Promise<void>;
  openHistory: (key: string) => void;
}

const origin = (s: AdminSlot) => (s.value !== s.def || s.changed ? "Edited" : "Original");

/** One piece of text, link or email address. */
export function TextRow({ slot, reload, openHistory }: RowProps & { slot: AdminSlot }) {
  const [draft, setDraft] = useState(slot.value);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  useEffect(() => setDraft(slot.value), [slot.value]);
  const dirty = draft !== slot.value;
  const warning = draft !== slot.def ? lengthWarning(slot.def, draft.trim()) : null;
  const multi = slot.kind === "text" && (slot.def.length > 70 || draft.length > 70 || draft.includes("\n"));

  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      await reload();
      setMsg({ kind: "ok", text: ok });
    } catch (e) {
      setMsg({ kind: "error", text: errorText(e) });
    } finally {
      setBusy(false);
    }
  }

  const kindName = slot.kind === "link" ? "Link" : slot.kind === "email" ? "Email address" : slot.kind === "alt" ? "Picture description" : "Text";
  return (
    <li className="rounded-lg border border-line bg-white p-4" data-testid="slot-row" data-key={slot.key}>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-pine">
            {slot.label} <span className="font-normal text-ink/60">({kindName})</span>
          </p>
          {slot.context ? <p className="text-xs text-ink/60">Near: {slot.context}</p> : null}
        </div>
        <p className="text-xs text-ink/60">
          {origin(slot)}
          {slot.changed ? ` by ${slot.changed.by} on ${when(slot.changed.at)}` : ""}
        </p>
        {slot.stale ? (
          <p role="status" className="text-xs font-bold text-red-700">
            Out of date: the wording on the site changed after this was edited, so the original is showing. Save again to keep your version.
          </p>
        ) : null}
      </div>
      {multi ? (
        <textarea
          aria-label={`${slot.label} (${slot.page})`}
          data-testid="slot-input"
          className={`${inputCls} min-h-24`}
          rows={Math.min(8, Math.max(3, Math.ceil(draft.length / 80)))}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      ) : (
        <input
          aria-label={`${slot.label} (${slot.page})`}
          data-testid="slot-input"
          className={inputCls}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      )}
      <p className="mt-1 text-xs text-ink/60">
        {draft.length} characters. Original: {slot.def.length}. Plain text only; nothing you type is treated as code.
      </p>
      {warning ? <div className="mt-2"><Notice kind="warn">{warning}</Notice></div> : null}
      {dirty ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2" aria-label="Preview">
          <div className="rounded-md bg-field p-3">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/60">On the site now</p>
            <p className="whitespace-pre-wrap break-words text-sm text-ink">{slot.value || "(empty)"}</p>
          </div>
          <div className="rounded-md bg-water p-3">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/60">Your version</p>
            <p className="whitespace-pre-wrap break-words text-sm text-ink" data-testid="slot-preview">{draft || "(empty)"}</p>
          </div>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className={btn} disabled={busy || !dirty} data-testid="slot-save" onClick={() => run(() => post("/api/cms/save", { key: slot.key, value: draft }), "Saved. It shows on the site within about a minute.")}>
          Save
        </button>
        <button type="button" className={btnGhost} disabled={busy || !dirty} onClick={() => setDraft(slot.value)}>
          Discard changes
        </button>
        <button type="button" className={btnGhost} disabled={busy || slot.value === slot.def} data-testid="slot-reset" onClick={() => run(() => post("/api/cms/reset", { key: slot.key }), "Put back to the original.")}>
          Reset to original
        </button>
        <button type="button" className={btnGhost} onClick={() => openHistory(slot.key)}>
          History
        </button>
      </div>
      {msg ? <div className="mt-2"><Notice kind={msg.kind}>{msg.text}</Notice></div> : null}
    </li>
  );
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 4_000_000;

/** One picture: replace it, and describe it. */
export function PictureRow({ slot, alt, reload, openHistory }: RowProps & { slot: AdminSlot; alt?: AdminSlot }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [desc, setDesc] = useState(alt?.value ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  useEffect(() => setDesc(alt?.value ?? ""), [alt?.value]);
  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const needsAlt = !!slot.altKey;
  const descDirty = needsAlt && desc !== (alt?.value ?? "");

  function choose(f: File | null) {
    setMsg(null);
    if (f && !ALLOWED.includes(f.type)) {
      setMsg({ kind: "error", text: "Only jpg, png and webp pictures are accepted (no SVG or other types)." });
      return setFile(null);
    }
    if (f && f.size > MAX_BYTES) {
      setMsg({ kind: "error", text: `That picture is ${(f.size / 1e6).toFixed(1)} MB; the limit is 4 MB. Save it smaller and try again.` });
      return setFile(null);
    }
    setFile(f);
  }

  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      await reload();
      setFile(null);
      setMsg({ kind: "ok", text: ok });
    } catch (e) {
      setMsg({ kind: "error", text: errorText(e) });
    } finally {
      setBusy(false);
    }
  }

  const replace = () => {
    const form = new FormData();
    form.set("key", slot.key);
    form.set("alt", desc);
    form.set("file", file as File);
    return upload(form);
  };
  const altMissing = needsAlt && !desc.trim();
  return (
    <li className="rounded-lg border border-line bg-white p-4" data-testid="picture-row" data-key={slot.key}>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-pine">{slot.label}</p>
          {slot.context ? <p className="text-xs text-ink/60">Near: {slot.context}</p> : null}
          {slot.stale ? <p role="status" className="text-xs font-bold text-red-700">Out of date: the picture on the site changed after this was replaced, so the original is showing. Upload again to keep yours.</p> : null}
        </div>
        <p className="text-xs text-ink/60">{slot.value !== slot.def ? `Replaced${slot.changed ? ` by ${slot.changed.by} on ${when(slot.changed.at)}` : ""}` : "Original picture"}</p>
      </div>
      <div className="flex flex-wrap gap-4">
        <figure className="w-40">
          <img src={slot.value} alt="" className="h-28 w-40 rounded-md border border-line bg-field object-contain" data-testid="picture-current" />
          <figcaption className="mt-1 text-xs text-ink/60">On the site now</figcaption>
        </figure>
        {preview ? (
          <figure className="w-40">
            <img src={preview} alt="" className="h-28 w-40 rounded-md border border-leaf bg-field object-contain" />
            <figcaption className="mt-1 text-xs text-ink/60">Your new picture</figcaption>
          </figure>
        ) : null}
        {slot.value !== slot.def ? (
          <figure className="w-40">
            <img src={slot.def} alt="" className="h-28 w-40 rounded-md border border-line bg-field object-contain" />
            <figcaption className="mt-1 text-xs text-ink/60">The original</figcaption>
          </figure>
        ) : null}
      </div>
      <div className="mt-3 grid gap-3">
        <label className="grid gap-1 text-sm font-bold text-pine">
          New picture (jpg, png or webp, up to 4 MB)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            data-testid="picture-file"
            className="text-sm font-normal text-ink"
            onChange={(e) => choose(e.target.files?.[0] ?? null)}
          />
        </label>
        {needsAlt ? (
          <label className="grid gap-1 text-sm font-bold text-pine">
            Describe the picture for people who cannot see it (required)
            <input
              type="text"
              className={inputCls}
              data-testid="picture-alt"
              value={desc}
              maxLength={300}
              onChange={(e) => setDesc(e.target.value)}
              aria-required="true"
            />
          </label>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className={btn} disabled={busy || !file || altMissing} data-testid="picture-save" onClick={() => run(replace, "Picture replaced. It shows on the site within about a minute.")}>
          Replace picture
        </button>
        {needsAlt ? (
          <button type="button" className={btnGhost} disabled={busy || !descDirty || altMissing || !!file} onClick={() => run(() => post("/api/cms/alt", { key: slot.key, alt: desc }), "Description saved.")}>
            Save description only
          </button>
        ) : null}
        <button type="button" className={btnGhost} disabled={busy || (slot.value === slot.def && !descDirty && alt?.value === alt?.def)} onClick={() => run(() => post("/api/cms/reset", { key: slot.key }), "Put back to the original picture.")}>
          Use the original
        </button>
        <button type="button" className={btnGhost} onClick={() => openHistory(slot.key)}>
          History
        </button>
      </div>
      {altMissing && file ? <div className="mt-2"><Notice kind="warn">Add a description before saving.</Notice></div> : null}
      {msg ? <div className="mt-2"><Notice kind={msg.kind}>{msg.text}</Notice></div> : null}
    </li>
  );
}

/** Show or hide a whole section of a page. */
export function SectionRow({ section, reload, openHistory }: RowProps & { section: AdminSection }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function toggle() {
    setBusy(true);
    setMsg(null);
    try {
      await post("/api/cms/section", { path: section.path, id: section.id, hidden: !section.hidden });
      await reload();
    } catch (e) {
      setMsg(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-white p-4" data-testid="section-row" data-key={`${section.path}#${section.id}`}>
      <div>
        <p className="text-sm font-bold text-pine">{section.label}</p>
        <p className="text-xs text-ink/60">
          {section.page} ({section.path}) - {section.hidden ? "Hidden" : "Showing"}
          {section.changed ? ` - changed by ${section.changed.by} on ${when(section.changed.at)}` : ""}
        </p>
        {msg ? <Notice kind="error">{msg}</Notice> : null}
      </div>
      <div className="flex gap-2">
        <button type="button" className={section.hidden ? btn : btnGhost} disabled={busy} data-testid="section-toggle" onClick={toggle}>
          {section.hidden ? "Show this section" : "Hide this section"}
        </button>
        <button type="button" className={btnGhost} onClick={() => openHistory(`section:${section.path}#${section.id}`)}>
          History
        </button>
      </div>
    </li>
  );
}
