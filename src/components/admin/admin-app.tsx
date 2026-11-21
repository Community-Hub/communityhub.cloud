import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Overview } from "@/lib/cms/service";
import { errorText, get, post } from "./api";
import { HistoryPanel } from "./history-panel";
import { ListCard } from "./lists-panel";
import { PictureRow, SectionRow, TextRow } from "./panels";
import { btn, btnGhost, inputCls, Notice } from "./ui";

type Tab = "texts" | "pictures" | "lists" | "sections" | "history";
const TABS: { id: Tab; label: string }[] = [
  { id: "texts", label: "Words and links" },
  { id: "pictures", label: "Pictures" },
  { id: "lists", label: "Lists" },
  { id: "sections", label: "Show or hide" },
  { id: "history", label: "History" },
];
const PAGE_SIZE = 40;

interface Session {
  user: { email: string; name: string } | null;
}

export function AdminApp() {
  const [session, setSession] = useState<Session | "loading">("loading");
  const refreshSession = useCallback(async () => {
    try {
      setSession(await get<Session>("/api/cms/session"));
    } catch {
      setSession({ user: null });
    }
  }, []);
  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  if (session === "loading") return <p className="p-8 text-ink/70">Loading...</p>;
  if (!session.user) return <SignIn onDone={refreshSession} />;
  return <Editor email={session.user.email} onSignOut={refreshSession} />;
}

/**
 * Signing in has no password: type your address, get a 6-digit code by email, type the code. The browser then stays
 * signed in for a week.
 */
function SignIn({ onDone }: { onDone: () => Promise<void> }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const address = email.trim().toLowerCase();

  async function sendCode(again = false) {
    setErr(null);
    setNote(null);
    setBusy(true);
    try {
      await post("/api/cms-auth/email-otp/send-verification-otp", { email: address, type: "sign-in" });
      setCode("");
      setStep("code");
      if (again) setNote("A new code is on its way. The old one no longer works.");
    } catch (e2) {
      setErr(errorText(e2));
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (step === "email") return sendCode();
    setErr(null);
    setNote(null);
    setBusy(true);
    try {
      await post("/api/cms-auth/sign-in/email-otp", { email: address, otp: code.replace(/\D/g, "") });
      await onDone();
    } catch (e2) {
      const status = (e2 as { status?: number }).status;
      setErr(status === 429 ? "Too many tries. Wait a minute, then try again." : status === 403 ? errorText(e2) : "That code is not right, or it has run out. Check the email, or send a new code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-dvh max-w-md content-center gap-4 p-6">
      <h1 className="font-display text-3xl text-pine">Site editor</h1>
      <p className="text-sm text-ink/70">
        {step === "email"
          ? "Sign in to change the words, pictures and lists on the site. There is no password: we email you a 6-digit code."
          : `We sent a 6-digit code to ${address}. It works for 10 minutes. Check your junk folder if it is not in your inbox.`}
      </p>
      <form onSubmit={submit} className="grid gap-3 rounded-lg border border-line bg-white p-4">
        {step === "email" ? (
          <label className="grid gap-1 text-sm font-bold text-pine">
            Email
            <input className={inputCls} type="email" autoComplete="username" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-email" />
          </label>
        ) : (
          <label className="grid gap-1 text-sm font-bold text-pine">
            Code from the email
            <input
              className={`${inputCls} tracking-[0.3em]`}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]*"
              maxLength={7}
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              data-testid="login-otp"
            />
          </label>
        )}
        {err ? <Notice kind="error">{err}</Notice> : null}
        {note ? <p className="text-sm text-ink/70" role="status">{note}</p> : null}
        <button type="submit" className={btn} disabled={busy} data-testid="login-submit">
          {step === "email" ? "Email me a code" : "Sign in"}
        </button>
        {step === "code" ? <p className="text-sm text-ink/70">You stay signed in on this browser for a week.</p> : null}
      </form>
      {step === "code" ? (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <button type="button" className="text-left text-sm font-bold text-pine underline" disabled={busy} onClick={() => void sendCode(true)} data-testid="login-resend">
            Send a new code
          </button>
          <button type="button" className="text-left text-sm font-bold text-pine underline" onClick={() => { setStep("email"); setErr(null); setNote(null); }}>
            Use a different email
          </button>
        </div>
      ) : null}
    </main>
  );
}

function Editor({ email, onSignOut }: { email: string; onSignOut: () => Promise<void> }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("texts");
  const [page, setPage] = useState("");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [historyKey, setHistoryKey] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setOverview(await get<Overview>("/api/cms/overview"));
      setLoadErr(null);
    } catch (e) {
      setLoadErr(errorText(e));
      if ((e as { status?: number }).status === 401) await onSignOut();
    }
  }, [onSignOut]);
  useEffect(() => {
    void reload();
  }, [reload]);
  useEffect(() => setLimit(PAGE_SIZE), [tab, page, query]);

  const labelOf = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of overview?.slots ?? []) m.set(s.key, `${s.label} (${s.page})`);
    for (const l of overview?.lists ?? []) m.set(`list:${l.path}`, `List: ${l.label}`);
    for (const s of overview?.sections ?? []) m.set(`section:${s.path}#${s.id}`, `Section: ${s.label} (${s.page})`);
    return (key: string) => m.get(key) ?? key;
  }, [overview]);

  const altByKey = useMemo(() => new Map((overview?.slots ?? []).map((s) => [s.key, s])), [overview]);
  const q = query.trim().toLowerCase();
  const match = (...parts: (string | undefined)[]) => !q || parts.some((p) => p?.toLowerCase().includes(q));

  const textSlots = useMemo(() => (overview?.slots ?? []).filter((s) => s.kind !== "image" && !s.ownedByImage), [overview]);
  const pictureSlots = useMemo(() => (overview?.slots ?? []).filter((s) => s.kind === "image"), [overview]);

  const source = tab === "texts" ? textSlots : tab === "pictures" ? pictureSlots : tab === "lists" ? overview?.lists ?? [] : tab === "sections" ? overview?.sections ?? [] : [];
  const pages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const x of source as { page: string }[]) counts.set(x.page, (counts.get(x.page) ?? 0) + 1);
    return [...counts].sort((a, b) => a[0].localeCompare(b[0]));
  }, [source]);

  const inPage = (p: string) => !page || p === page;
  const texts = textSlots.filter((s) => inPage(s.page) && match(s.label, s.context, s.value, s.def, s.page, s.key));
  const pics = pictureSlots.filter((s) => inPage(s.page) && match(s.label, s.context, s.page, s.key, altByKey.get(s.altKey ?? "")?.value));
  const lists = (overview?.lists ?? []).filter((l) => inPage(l.page) && match(l.label, l.page, ...l.items.map((i) => i.label)));
  const sections = (overview?.sections ?? []).filter((s) => inPage(s.page) && match(s.label, s.page));

  const rowProps = { reload, openHistory: (k: string) => { setHistoryKey(k); window.scrollTo({ top: 0 }); } };

  async function signOut() {
    await post("/api/cms-auth/sign-out", {}).catch(() => undefined);
    await onSignOut();
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-pine">Site editor</h1>
          <p className="text-sm text-ink/70">
            Signed in as <span data-testid="whoami">{email}</span>. Changes appear on the site within about a minute. Everything can be undone from History.
          </p>
        </div>
        <button type="button" className={btnGhost} onClick={signOut} data-testid="signout">
          Sign out
        </button>
      </header>

      <nav aria-label="Editor sections" className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            className={tab === t.id ? btn : btnGhost}
            data-testid={`tab-${t.id}`}
            onClick={() => { setTab(t.id); setPage(""); setHistoryKey(null); }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {loadErr ? <Notice kind="error">{loadErr}</Notice> : null}
      {!overview && !loadErr ? <p className="text-ink/70">Loading the site's content...</p> : null}

      {historyKey ? (
        <div className="mb-4">
          <HistoryPanel keyName={historyKey} labelOf={labelOf} reload={reload} onClose={() => setHistoryKey(null)} />
        </div>
      ) : null}

      {overview && tab === "history" ? <HistoryPanel keyName={null} labelOf={labelOf} reload={reload} /> : null}

      {overview && tab !== "history" ? (
        <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
          <aside className="grid content-start gap-3">
            <label className="grid gap-1 text-sm font-bold text-pine">
              Search
              <input type="search" className={inputCls} placeholder="Find a word or heading" value={query} onChange={(e) => setQuery(e.target.value)} data-testid="search" />
            </label>
            <div>
              <label htmlFor="page-filter" className="text-sm font-bold text-pine">
                Page
              </label>
              <select id="page-filter" className={`${inputCls} mt-1`} value={page} onChange={(e) => setPage(e.target.value)} data-testid="page-filter">
                <option value="">All pages</option>
                {pages.map(([p, n]) => (
                  <option key={p} value={p}>
                    {p} ({n})
                  </option>
                ))}
              </select>
            </div>
          </aside>
          <div className="min-w-0">
            {tab === "texts" ? (
              <Results count={texts.length} limit={limit} more={() => setLimit(limit + PAGE_SIZE)}>
                {texts.slice(0, limit).map((s, i) => (
                  <Grouped key={s.key} prev={texts[i - 1]?.page} page={s.page}>
                    <TextRow slot={s} {...rowProps} />
                  </Grouped>
                ))}
              </Results>
            ) : null}
            {tab === "pictures" ? (
              <Results count={pics.length} limit={limit} more={() => setLimit(limit + PAGE_SIZE)}>
                {pics.slice(0, limit).map((s, i) => (
                  <Grouped key={s.key} prev={pics[i - 1]?.page} page={s.page}>
                    <PictureRow slot={s} alt={s.altKey ? altByKey.get(s.altKey) : undefined} {...rowProps} />
                  </Grouped>
                ))}
              </Results>
            ) : null}
            {tab === "lists" ? (
              <Results count={lists.length} limit={lists.length} more={() => undefined}>
                {lists.map((l, i) => (
                  <Grouped key={l.path} prev={lists[i - 1]?.page} page={l.page}>
                    <ListCard list={l} {...rowProps} />
                  </Grouped>
                ))}
              </Results>
            ) : null}
            {tab === "sections" ? (
              <Results count={sections.length} limit={sections.length} more={() => undefined}>
                <li className="text-sm text-ink/70">Hiding a section takes it off the page; the rest of the page keeps its layout. The first screen of a page, with its title, always shows.</li>
                {sections.map((s, i) => (
                  <Grouped key={`${s.path}#${s.id}`} prev={sections[i - 1]?.page} page={s.page}>
                    <SectionRow section={s} {...rowProps} />
                  </Grouped>
                ))}
              </Results>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Grouped({ prev, page, children }: { prev?: string; page: string; children: React.ReactNode }) {
  return (
    <>
      {prev !== page ? <li className="mt-3 list-none font-display text-xl text-pine first:mt-0" aria-hidden="true">{page}</li> : null}
      {children}
    </>
  );
}

function Results({ count, limit, more, children }: { count: number; limit: number; more: () => void; children: React.ReactNode }) {
  return (
    <>
      <p className="mb-2 text-sm text-ink/70" data-testid="result-count">
        {count} {count === 1 ? "item" : "items"}
      </p>
      {count === 0 ? <p className="text-sm text-ink/70">Nothing matches. Try a different word or page.</p> : null}
      <ul className="grid gap-3">{children}</ul>
      {count > limit ? (
        <div className="mt-4">
          <button type="button" className={btnGhost} onClick={more}>
            Show more ({count - limit} left)
          </button>
        </div>
      ) : null}
    </>
  );
}
