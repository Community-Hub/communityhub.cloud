import type { ReactNode } from "react";

export const btn =
  "inline-flex items-center justify-center rounded-md border border-pine bg-pine px-3 py-1.5 text-sm font-bold text-paper hover:bg-pine/90 disabled:cursor-not-allowed disabled:opacity-50";
export const btnGhost =
  "inline-flex items-center justify-center rounded-md border border-line bg-white px-3 py-1.5 text-sm font-bold text-ink hover:bg-field disabled:cursor-not-allowed disabled:opacity-50";
export const inputCls =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus-visible:outline-2 focus-visible:outline-sky";

export function Notice({ kind, children }: { kind: "ok" | "warn" | "error"; children: ReactNode }) {
  const tone =
    kind === "error" ? "border-red-300 bg-red-50 text-red-900" : kind === "warn" ? "border-amber-300 bg-amber-50 text-amber-900" : "border-leaf/50 bg-field text-pine";
  return (
    <p role={kind === "error" ? "alert" : "status"} className={`rounded-md border px-3 py-2 text-sm ${tone}`}>
      {children}
    </p>
  );
}

export function when(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export const short = (s: string | null, n = 90) => (s === null ? "(original)" : s.length > n ? `${s.slice(0, n)}...` : s);

export const isPicture = (v: string | null) => !!v && (/^\/cms-media\/[\w.-]+\.(jpg|png|webp)$/.test(v) || /^https:\/\/[\w-]+\.public\.blob\.vercel-storage\.com\//.test(v));
