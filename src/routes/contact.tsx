import { createFileRoute } from "@tanstack/react-router";
import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  type SelectHTMLAttributes,
} from "react";
import { ArrowRight, Check, ChevronDown, CircleAlert, Copy } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { SiteFooter } from "@/components/site-footer";
import { contactContent } from "@/lib/contact-content";
import {
  addDays,
  checkDemo,
  DEMO_FIELDS,
  DEMO_INTERESTS,
  DEMO_MAX_DAYS_AHEAD,
  DEMO_MEETINGS,
  DEMO_WINDOWS,
  demoSubject,
  demoText,
  formatDay,
  isTimeZone,
  isWeekend,
  readDemo,
  todayIn,
  weekdayName,
  type DemoField,
  type DemoInput,
} from "@/lib/contact/demo";
import {
  checkContact,
  CONTACT_FIELDS,
  CONTACT_TOPICS,
  contactSubject,
  contactText,
  isContactTopic,
  readContact,
  type ContactField,
  type ContactInput,
  type Sender,
} from "@/lib/contact/validate";
import { copy } from "@/lib/copy";
import { imageSize } from "@/lib/image-dimensions";
import { BRING_HREF, PRICING_HREF } from "@/lib/links";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type Mode = "message" | "demo";
const MODES: readonly Mode[] = ["message", "demo"];
type ContactSearch = { mode?: "demo"; topic?: string; message?: string };

export const Route = createFileRoute("/contact")({
  // /contact?mode=demo opens the booking form. A link can also choose the topic and start the message:
  // /contact?topic=Pricing&message=… (the live site's links) or /contact?topic=Quote%3A%20Data%20bundle (quoteHref in src/lib/links.ts).
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    ...(search.mode === "demo" ? { mode: "demo" as const } : {}),
    ...(typeof search.topic === "string" && search.topic.trim() && search.topic.length <= 200 ? { topic: search.topic.trim() } : {}),
    ...(typeof search.message === "string" && search.message.length <= 600 ? { message: search.message } : {}),
  }),
  head: ({ match }) => ({
    meta: [
      { title: `${match.search.mode === "demo" ? contactContent.modes.demo : contactContent.title} — Community Hub` },
      { name: "description", content: copy.siteFooter.FooterChapter.p2 },
    ],
  }),
  component: Contact,
});

/** "Data bundle" → "the Data bundle", "Design services" → "design services": the live site's quote sentence. */
function quoteRequest(what: string): string {
  const thing = /\bbundle$/i.test(what) ? `the ${what}` : /^[A-Z][a-z]*(?: [a-z]+)*$/.test(what) ? what[0].toLowerCase() + what.slice(1) : what;
  return `I would like a quote for ${thing}.`;
}

/** Where the message form starts: a listed topic is chosen, "Quote: …" asks about pricing, and any other topic starts the message. */
function prefill({ topic = "", message = "" }: ContactSearch): Partial<ContactInput> {
  if (!topic || isContactTopic(topic)) return { topic, message };
  const quote = /^quote:\s*(.+)$/i.exec(topic)?.[1]?.trim();
  if (quote) return { topic: "Pricing", message: message || quoteRequest(quote) };
  return { message: message ? `${topic}\n\n${message}` : `${topic}\n\n` };
}

/** A sentence from contact-content.ts with its {placeholders} filled in; a value can be an element (a bold address). */
function fill(template: string, values: Record<string, ReactNode>): ReactNode {
  return template.split(/\{(\w+)\}/).map((part, i) => (i % 2 ? <Fragment key={i}>{values[part] ?? `{${part}}`}</Fragment> : part));
}

const CARD = "rounded-(--radius-panel) border border-line bg-paper p-5 shadow-[0_1px_2px_rgb(18_58_41/0.04),0_24px_48px_-36px_rgb(18_58_41/0.22)] sm:p-8 lg:p-10";
/** Field edges dark enough to find at a glance (3:1 against white). */
const FIELD =
  "block w-full rounded-xl border border-ink/50 bg-white px-4 text-base text-ink transition-colors duration-150 hover:border-ink/70 focus-visible:border-leaf aria-[invalid=true]:border-[#b42318] motion-reduce:transition-none";
const INLINE_LINK = "font-semibold text-leaf underline decoration-leaf/40 underline-offset-4 transition-colors duration-150 hover:text-pine hover:decoration-current";
const SMALL_BUTTON = "btn-secondary min-h-11! gap-1.5! px-4! text-[0.9375rem]!";

function Contact() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const mode: Mode = search.mode === "demo" ? "demo" : "message";
  // The address follows the form, so Back, a shared link and the "Book a demo" links elsewhere all agree with it.
  const setMode = (next: Mode) => {
    if (next === mode) return;
    void navigate({ search: (prev) => ({ ...prev, mode: next === "demo" ? "demo" : undefined }), replace: true, resetScroll: false });
  };
  const t = contactContent;
  const photo = imageSize(t.image);
  return (
    <>
      <main id="main" className="pt-(--header-h)">
        <div className="wrap pb-(--section-y) pt-[clamp(2.5rem,6vw,4.5rem)]">
          <div className="grid gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-12 xl:gap-x-24">
            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              <h1 className="t-h1">{t.title}</h1>
              <p className="mt-5 max-w-xl t-lede">{copy.siteFooter.FooterChapter.p2}</p>
            </div>

            <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <ContactCard mode={mode} onMode={setMode} initial={prefill(search)} />
            </div>

            <aside aria-label={t.otherWays} className="min-w-0 lg:col-start-1 lg:row-start-2">
              <h2 className="text-lg font-semibold text-ink">{t.emailHeading}</h2>
              <p className="mt-1 t-body">
                {t.emailLead}{" "}
                <a href={site.mailtoHref} className={cn(INLINE_LINK, "break-words")}>
                  {site.contactEmail}
                </a>
                .
              </p>
              <div className="mt-3">
                <CopyButton text={site.contactEmail} label={t.copyAddress} done={t.addressCopied} className={SMALL_BUTTON} />
              </div>
              <p className="mt-4 t-small text-ink/70">{t.address}</p>
              <ul className="mt-6 border-t border-line pt-3">
                <li>
                  <AppLink href={BRING_HREF} className="link">
                    {t.guideLink}
                    <ArrowRight className="size-4" aria-hidden />
                  </AppLink>
                </li>
                <li>
                  <AppLink href={PRICING_HREF} className="link">
                    {t.pricingLink}
                    <ArrowRight className="size-4" aria-hidden />
                  </AppLink>
                </li>
              </ul>
              <img
                src={t.image}
                alt={t.alt}
                width={photo?.width}
                height={photo?.height}
                loading="lazy"
                decoding="async"
                className="mt-10 aspect-[4/3] w-full rounded-(--radius-panel) bg-field object-cover"
              />
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

const NOBODY: Sender = { name: "", email: "", organization: "" };
const isSenderField = (field: string): field is keyof Sender => field === "name" || field === "email" || field === "organization";

/** The white card: the switch between the two forms, then the chosen form. Both stay mounted, so nothing typed is lost. */
function ContactCard({ mode, onMode, initial }: { mode: Mode; onMode: (next: Mode) => void; initial: Partial<ContactInput> }) {
  const base = useId();
  // Name, email and organization carry over from one form to the other.
  const [sender, setSender] = useState<Sender>(NOBODY);
  return (
    <div className={CARD}>
      <ModeSwitch base={base} mode={mode} onMode={onMode} />
      {MODES.map((m) => (
        <div key={m} role="tabpanel" id={`${base}-${m}`} aria-labelledby={`${base}-${m}-tab`} hidden={m !== mode} className="mt-8">
          {m === "message" ? (
            <MessageForm sender={sender} onSender={setSender} initial={initial} />
          ) : (
            <DemoForm sender={sender} onSender={setSender} />
          )}
        </div>
      ))}
    </div>
  );
}

/** "Send a message" | "Book a demo", as ARIA tabs: arrows, Home and End switch; only the chosen tab is in the tab order. */
function ModeSwitch({ base, mode, onMode }: { base: string; mode: Mode; onMode: (next: Mode) => void }) {
  const m = contactContent.modes;
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const at = MODES.indexOf(mode);
    const moves: Record<string, number> = { ArrowRight: at + 1, ArrowLeft: at - 1, Home: 0, End: MODES.length - 1 };
    const to = moves[event.key];
    if (to === undefined) return;
    event.preventDefault();
    const next = MODES[(to + MODES.length) % MODES.length];
    onMode(next);
    document.getElementById(`${base}-${next}-tab`)?.focus();
  };
  return (
    <div role="tablist" aria-label={m.label} onKeyDown={onKeyDown} className="grid grid-cols-2 gap-1 rounded-full bg-field p-1">
      {MODES.map((id) => {
        const on = id === mode;
        return (
          <button
            key={id}
            id={`${base}-${id}-tab`}
            type="button"
            role="tab"
            aria-selected={on}
            aria-controls={`${base}-${id}`}
            tabIndex={on ? 0 : -1}
            onClick={() => onMode(id)}
            className={cn(
              "min-h-11 rounded-full px-3 text-[0.9375rem] font-semibold transition-[color,background-color,box-shadow] duration-200 focus-visible:outline-offset-0 motion-reduce:transition-none",
              on ? "bg-paper text-pine shadow-[0_1px_3px_rgb(18_58_41/0.16),0_0_0_1px_rgb(18_58_41/0.05)]" : "text-ink/70 hover:text-pine",
            )}
          >
            {id === "message" ? m.message : m.demo}
          </button>
        );
      })}
    </div>
  );
}

type Status<S> = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; as: S } | { kind: "busy" } | { kind: "unavailable" };
type Problems<F extends string> = Partial<Record<F, string>>;

/** The field messages in a 400 answer, known fields only. */
function pickProblems<F extends string>(raw: unknown, order: readonly F[]): Problems<F> {
  const found: Problems<F> = {};
  if (!raw || typeof raw !== "object") return found;
  for (const field of order) {
    const text = (raw as Record<string, unknown>)[field];
    if (typeof text === "string" && text) found[field] = text;
  }
  return found;
}

/**
 * The sending half of a form: the messages under its fields, where it stands, and where focus goes next.
 * When the name, email or organization change in the other form (`sender`), the messages shown here follow (`recheck`).
 */
function useSender<F extends string, S>(base: string, order: readonly F[], sender: Sender, recheck: () => Problems<F>) {
  const resultRef = useRef<HTMLHeadingElement>(null);
  const [errors, setErrors] = useState<Problems<F>>({});
  const [status, setStatus] = useState<Status<S>>({ kind: "idle" });
  // Focus moves once React has drawn the change, so a field already carries its message and a result is on the page.
  const [focusOn, setFocusOn] = useState<{ target: F | "result" } | null>(null);
  const [seen, setSeen] = useState(sender);
  if (seen !== sender) {
    setSeen(sender);
    if (Object.keys(errors).length) setErrors(recheck());
  }
  useEffect(() => {
    if (!focusOn) return;
    if (focusOn.target === "result") resultRef.current?.focus();
    else document.getElementById(`${base}-${focusOn.target}`)?.focus();
  }, [focusOn, base]);

  return {
    resultRef,
    errors,
    status,
    describe: (field: F) => (errors[field] ? `${base}-${field}-error` : undefined),
    /** After a change: if any of these fields is flagged, check again, so a message goes as soon as it is fixed. */
    changed(fields: F[], now: () => Problems<F>) {
      if (fields.some((field) => errors[field])) setErrors(now());
    },
    /** Shows the problems, or sends `body` and shows how it went. `as` is kept for the thank-you note. */
    async send(found: Problems<F>, body: Record<string, unknown>, as: S) {
      if (status.kind === "sending") return;
      setErrors(found);
      const first = order.find((field) => found[field]);
      if (first) {
        setFocusOn({ target: first });
        return;
      }
      setStatus({ kind: "sending" });
      let next: Status<S> = { kind: "unavailable" };
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        const reply: unknown = await res.json().catch(() => null);
        if (res.ok && (reply as { ok?: unknown } | null)?.ok === true) next = { kind: "sent", as };
        else if (res.status === 429) next = { kind: "busy" };
        else if (res.status === 400) {
          const fields = pickProblems((reply as { fields?: unknown } | null)?.fields, order);
          const flagged = order.find((field) => fields[field]);
          if (flagged) {
            setErrors(fields);
            setStatus({ kind: "idle" });
            setFocusOn({ target: flagged });
            return;
          }
        }
      } catch {
        next = { kind: "unavailable" };
      }
      setStatus(next);
      setFocusOn({ target: "result" });
    },
    /** Back to an empty form after a thank-you note. */
    again(focus: F) {
      setErrors({});
      setStatus({ kind: "idle" });
      setFocusOn({ target: focus });
    },
  };
}

type OnField = (field: string) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;

function MessageForm({ sender, onSender, initial }: { sender: Sender; onSender: (next: Sender) => void; initial: Partial<ContactInput> }) {
  const t = contactContent.form;
  const base = useId();
  const id = (field: keyof ContactInput) => `${base}-${field}`;
  const [own, setOwn] = useState({ topic: initial.topic ?? "", message: initial.message ?? "", website: "" });
  const values: ContactInput = { ...sender, ...own };
  const form = useSender<ContactField, ContactInput>(base, CONTACT_FIELDS, sender, () => checkContact(readContact(values)));

  const set: OnField = (field) => (event) => {
    const value = event.target.value;
    const next: ContactInput = { ...values, [field]: value };
    if (isSenderField(field)) onSender({ name: next.name, email: next.email, organization: next.organization });
    else setOwn((o) => ({ ...o, [field]: value }));
    if (field !== "website") form.changed([field as ContactField], () => checkContact(readContact(next)));
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = readContact(values);
    await form.send(checkContact(input), { kind: "message", ...input }, input);
  }

  if (form.status.kind === "sent") {
    const sent = form.status.as;
    const s = contactContent.sent;
    return (
      <SentNote
        headingRef={form.resultRef}
        heading={fill(s.heading, { name: sent.name })}
        again={s.again}
        onAgain={() => {
          setOwn({ topic: "", message: "", website: "" });
          form.again("message");
        }}
      >
        {fill(s.body, { email: <strong className="font-semibold break-words text-ink">{sent.email}</strong> })}
      </SentNote>
    );
  }

  const sending = form.status.kind === "sending";
  const n = contactContent.notSent;
  const input = readContact(values);
  return (
    <>
      {(form.status.kind === "busy" || form.status.kind === "unavailable") && (
        <NotSent
          headingRef={form.resultRef}
          heading={form.status.kind === "busy" ? n.busyHeading : n.heading}
          body={n.body}
          subject={contactSubject(input)}
          text={contactText(input)}
          copyLabels={{ label: n.copyMessage, done: n.messageCopied, announce: n.messageCopiedAnnouncement }}
        />
      )}
      {/* POST, so a press of Send before the page has finished loading never puts the message in the address bar. */}
      <form noValidate method="post" onSubmit={submit} aria-busy={sending} className="grid gap-6">
        <SenderRow id={id} sender={sender} errors={form.errors} describe={form.describe} onChange={set} />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id={id("organization")} label={t.organization} hint={t.optional} error={form.errors.organization}>
            <input
              id={id("organization")}
              name="organization"
              autoComplete="organization"
              value={sender.organization}
              onChange={set("organization")}
              aria-invalid={!!form.errors.organization}
              aria-describedby={form.describe("organization")}
              className={cn(FIELD, "h-12")}
            />
          </Field>
          <Field id={id("topic")} label={t.topic} hint={t.optional} error={form.errors.topic}>
            <Select
              id={id("topic")}
              name="topic"
              value={own.topic}
              onChange={set("topic")}
              placeholder={t.chooseTopic}
              options={CONTACT_TOPICS.map((topic, i) => [topic, t.topicLabels[i] || topic] as const)}
              aria-invalid={!!form.errors.topic}
              aria-describedby={form.describe("topic")}
            />
          </Field>
        </div>
        <Field id={id("message")} label={t.message} error={form.errors.message}>
          <textarea
            id={id("message")}
            name="message"
            rows={7}
            value={own.message}
            onChange={set("message")}
            aria-required="true"
            aria-invalid={!!form.errors.message}
            aria-describedby={form.describe("message")}
            className={cn(FIELD, "min-h-44 resize-y py-3 leading-relaxed")}
          />
        </Field>
        <HiddenField id={id("website")} value={own.website} onChange={set("website")} />
        <SubmitRow sending={sending} label={t.send} sendingLabel={t.sending} />
      </form>
    </>
  );
}

type DemoOwn = Omit<DemoInput, keyof Sender>;
const NO_DEMO: DemoOwn = { date: "", window: "", timeZone: "", meeting: "video", phone: "", interest: "", notes: "", website: "" };

/** The visitor's time zone, or UTC when the browser does not say. */
function localTimeZone(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zone && isTimeZone(zone) ? zone : "UTC";
  } catch {
    return "UTC";
  }
}

/** Every time zone this browser knows, including the visitor's own and UTC. */
function timeZones(here: string): string[] {
  let all: string[] = [];
  try {
    all = Intl.supportedValuesOf("timeZone");
  } catch {
    // An older browser: the visitor's zone and UTC.
  }
  const list = all.includes(here) ? [...all] : [here, ...all];
  if (!list.includes("UTC")) list.push("UTC");
  return list;
}

const describedBy = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(" ") || undefined;

function DemoForm({ sender, onSender }: { sender: Sender; onSender: (next: Sender) => void }) {
  const t = contactContent.demo;
  const f = contactContent.form;
  const base = useId();
  const id = (field: keyof DemoInput) => `${base}-${field}`;
  const [own, setOwn] = useState<DemoOwn>(NO_DEMO);
  const [zones, setZones] = useState<string[]>([]);
  const values: DemoInput = { ...sender, ...own };
  const form = useSender<DemoField, DemoInput>(base, DEMO_FIELDS, sender, () => checkDemo(readDemo(values)));

  // The visitor's time zone is only known in the browser, so it is filled in once the page has loaded.
  useEffect(() => {
    const here = localTimeZone();
    setZones(timeZones(here));
    setOwn((o) => (o.timeZone ? o : { ...o, timeZone: here }));
  }, []);

  const set: OnField = (field) => (event) => {
    const value = event.target.value;
    const next: DemoInput = { ...values, [field]: value };
    if (isSenderField(field)) onSender({ name: next.name, email: next.email, organization: next.organization });
    else setOwn((o) => ({ ...o, [field]: value }));
    if (field === "website") return;
    // How to meet decides whether a phone number is needed; the time zone decides which day is tomorrow.
    const related: DemoField[] = field === "meeting" ? ["meeting", "phone"] : field === "timeZone" ? ["timeZone", "date"] : [field as DemoField];
    form.changed(related, () => checkDemo(readDemo(next)));
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = readDemo(values);
    await form.send(checkDemo(input), { kind: "demo", ...input }, input);
  }

  if (form.status.kind === "sent") {
    const sent = form.status.as;
    const s = contactContent.demoSent;
    const label = t.windows[DEMO_WINDOWS.findIndex((w) => w.id === sent.window)];
    const thisYear = sent.date.startsWith(String(new Date().getFullYear()));
    return (
      <SentNote
        headingRef={form.resultRef}
        heading={fill(s.heading, { name: sent.name })}
        again={s.again}
        onAgain={() => {
          setOwn((o) => ({ ...NO_DEMO, timeZone: o.timeZone }));
          form.again("date");
        }}
      >
        {fill(s.body, {
          day: formatDay(sent.date, !thisYear),
          time: label ? `${label.name}, ${label.hours}` : sent.window,
          email: <strong className="font-semibold break-words text-ink">{sent.email}</strong>,
        })}
      </SentNote>
    );
  }

  const today = own.timeZone && isTimeZone(own.timeZone) ? todayIn(own.timeZone) : "";
  const weekend = own.date && isWeekend(own.date) ? weekdayName(own.date) : "";
  const sending = form.status.kind === "sending";
  const n = contactContent.demoNotSent;
  const input = readDemo(values);
  return (
    <>
      {(form.status.kind === "busy" || form.status.kind === "unavailable") && (
        <NotSent
          headingRef={form.resultRef}
          heading={form.status.kind === "busy" ? n.busyHeading : n.heading}
          body={n.body}
          subject={demoSubject(input)}
          text={demoText(input)}
          copyLabels={{ label: n.copyRequest, done: n.requestCopied, announce: n.requestCopiedAnnouncement }}
        />
      )}
      <form noValidate method="post" onSubmit={submit} aria-busy={sending} className="grid gap-6">
        <p className="t-body text-ink/80">{t.intro}</p>
        <SenderRow id={id} sender={sender} errors={form.errors} describe={form.describe} onChange={set} />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id={id("organization")} label={f.organization} hint={f.optional} error={form.errors.organization}>
            <input
              id={id("organization")}
              name="organization"
              autoComplete="organization"
              value={sender.organization}
              onChange={set("organization")}
              aria-invalid={!!form.errors.organization}
              aria-describedby={form.describe("organization")}
              className={cn(FIELD, "h-12")}
            />
          </Field>
          <Field id={id("phone")} label={t.phone} hint={t.phoneHint} error={form.errors.phone}>
            <input
              id={id("phone")}
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={own.phone}
              onChange={set("phone")}
              aria-required={own.meeting === "phone" ? "true" : undefined}
              aria-invalid={!!form.errors.phone}
              aria-describedby={form.describe("phone")}
              className={cn(FIELD, "h-12")}
            />
          </Field>
        </div>

        <div className="grid gap-6 border-t border-line pt-6">
          <Field id={id("interest")} label={t.interest} hint={f.optional} error={form.errors.interest}>
            <Select
              id={id("interest")}
              name="interest"
              value={own.interest}
              onChange={set("interest")}
              placeholder={t.chooseInterest}
              options={DEMO_INTERESTS.map((value, i) => [value, t.interestLabels[i] || value] as const)}
              aria-invalid={!!form.errors.interest}
              aria-describedby={form.describe("interest")}
            />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id={id("date")} label={t.day} error={form.errors.date} note={weekend && fill(t.weekend, { weekday: weekend })}>
              <input
                id={id("date")}
                name="date"
                type="date"
                min={today ? addDays(today, 1) : undefined}
                max={today ? addDays(today, DEMO_MAX_DAYS_AHEAD) : undefined}
                value={own.date}
                onChange={set("date")}
                aria-required="true"
                aria-invalid={!!form.errors.date}
                aria-describedby={describedBy(form.describe("date"), weekend && `${id("date")}-note`)}
                className={cn(FIELD, "h-12 text-left [&::-webkit-date-and-time-value]:text-left")}
              />
            </Field>
            <Field id={id("window")} label={t.time} error={form.errors.window}>
              <Select
                id={id("window")}
                name="window"
                value={own.window}
                onChange={set("window")}
                placeholder={t.chooseTime}
                options={DEMO_WINDOWS.map((w, i) => [w.id, t.windows[i] ? `${t.windows[i].name} (${t.windows[i].hours})` : w.name] as const)}
                aria-required="true"
                aria-invalid={!!form.errors.window}
                aria-describedby={form.describe("window")}
              />
            </Field>
          </div>
          {/* Filled in once the page has loaded; the space is kept so nothing below moves. */}
          <div className="-mt-2 min-h-10">
            {zones.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <label htmlFor={id("timeZone")} className="text-sm font-semibold text-ink">
                  {t.timeZone}
                </label>
                <Select
                  id={id("timeZone")}
                  name="timeZone"
                  value={own.timeZone}
                  onChange={set("timeZone")}
                  options={zones.map((zone) => [zone, zone.replace(/_/g, " ")] as const)}
                  aria-invalid={!!form.errors.timeZone}
                  aria-describedby={form.describe("timeZone")}
                  wrapClassName="min-w-0 max-w-full max-sm:w-full"
                  className="h-10 w-auto max-w-full rounded-lg pr-10 pl-3 text-[0.9375rem] max-sm:h-12 max-sm:w-full max-sm:rounded-xl max-sm:px-4 max-sm:text-base"
                />
                <ErrorText id={id("timeZone")} error={form.errors.timeZone} className="mt-0 w-full" />
              </div>
            )}
          </div>
          <fieldset className="min-w-0" aria-describedby={form.describe("meeting")}>
            <legend className="text-sm font-semibold text-ink">{t.meeting}</legend>
            <div className="mt-2 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              {DEMO_MEETINGS.map((m, i) => (
                <label
                  key={m.id}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-ink/50 bg-white px-4 py-2.5 text-base text-ink transition-colors duration-150 hover:border-ink/70 has-checked:border-leaf has-checked:bg-lime-pale has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-leaf motion-reduce:transition-none"
                >
                  <input
                    id={i === 0 ? id("meeting") : undefined}
                    type="radio"
                    name="meeting"
                    value={m.id}
                    checked={own.meeting === m.id}
                    onChange={set("meeting")}
                    className="size-4.5 shrink-0 accent-leaf focus-visible:outline-none"
                  />
                  {t.meetingLabels[i] || m.name}
                </label>
              ))}
            </div>
            <ErrorText id={id("meeting")} error={form.errors.meeting} />
          </fieldset>
          <Field id={id("notes")} label={t.notes} hint={f.optional} error={form.errors.notes}>
            <textarea
              id={id("notes")}
              name="notes"
              rows={4}
              value={own.notes}
              onChange={set("notes")}
              aria-invalid={!!form.errors.notes}
              aria-describedby={form.describe("notes")}
              className={cn(FIELD, "min-h-28 resize-y py-3 leading-relaxed")}
            />
          </Field>
        </div>
        <HiddenField id={id("website")} value={own.website} onChange={set("website")} />
        <SubmitRow sending={sending} label={t.send} sendingLabel={t.sending} />
      </form>
    </>
  );
}

/** Name and email, side by side from small tablets up. Shared by both forms. */
function SenderRow({
  id,
  sender,
  errors,
  describe,
  onChange,
}: {
  id: (field: "name" | "email") => string;
  sender: Sender;
  errors: { name?: string; email?: string };
  describe: (field: "name" | "email") => string | undefined;
  onChange: OnField;
}) {
  const t = contactContent.form;
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Field id={id("name")} label={t.name} error={errors.name}>
        <input
          id={id("name")}
          name="name"
          autoComplete="name"
          value={sender.name}
          onChange={onChange("name")}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={describe("name")}
          className={cn(FIELD, "h-12")}
        />
      </Field>
      <Field id={id("email")} label={t.email} error={errors.email}>
        <input
          id={id("email")}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          value={sender.email}
          onChange={onChange("email")}
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={describe("email")}
          className={cn(FIELD, "h-12")}
        />
      </Field>
    </div>
  );
}

function Field({ id, label, hint, error, note, children }: { id: string; label: string; hint?: string; error?: string; note?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {hint && <span className="font-normal text-ink/65"> {hint}</span>}
      </label>
      <div className="mt-2">{children}</div>
      {note && (
        <p id={`${id}-note`} className="mt-2 text-sm text-ink/70">
          {note}
        </p>
      )}
      <ErrorText id={id} error={error} />
    </div>
  );
}

function ErrorText({ id, error, className }: { id: string; error?: string; className?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} className={cn("mt-2 flex items-start gap-1.5 text-sm font-medium text-[#b42318]", className)}>
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      {error}
    </p>
  );
}

/** A native select drawn like the other fields. Without a placeholder there is no empty choice. */
function Select({
  placeholder,
  options,
  value,
  className,
  wrapClassName,
  ...rest
}: {
  placeholder?: string;
  options: readonly (readonly [string, string])[];
  value: string;
  wrapClassName?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "children">) {
  return (
    <div className={cn("relative", wrapClassName)}>
      <select value={value} className={cn(FIELD, "h-12 appearance-none pr-11 [&>option]:text-ink", !value && "text-ink/65", className)} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4.5 -translate-y-1/2 text-ink/60" aria-hidden />
    </div>
  );
}

/** Hidden from people; only automated senders fill it in, and what they send is dropped. */
function HiddenField({ id, value, onChange }: { id: string; value: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={id}>{contactContent.form.hiddenField}</label>
      <input id={id} name="website" tabIndex={-1} autoComplete="off" data-1p-ignore="" data-lpignore="true" data-bwignore="" value={value} onChange={onChange} />
    </div>
  );
}

function SubmitRow({ sending, label, sendingLabel }: { sending: boolean; label: string; sendingLabel: string }) {
  const t = contactContent.form;
  return (
    <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:gap-6">
      <button type="submit" disabled={sending} className="btn-primary disabled:cursor-wait disabled:opacity-70 max-sm:w-full">
        {sending ? sendingLabel : label}
      </button>
      <p className="t-small text-ink/70">
        {t.privacy}{" "}
        <AppLink href="/privacy-policy" className={INLINE_LINK}>
          {t.privacyLink}
        </AppLink>
      </p>
    </div>
  );
}

/** Replaces a form once the website has sent it. */
function SentNote({
  headingRef,
  heading,
  again,
  onAgain,
  children,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  heading: ReactNode;
  again: string;
  onAgain: () => void;
  children: ReactNode;
}) {
  return (
    <div role="status">
      <span className="grid size-12 place-items-center rounded-full bg-lime-pale text-pine">
        <Check className="size-6" strokeWidth={2.25} aria-hidden />
      </span>
      <h2 ref={headingRef} tabIndex={-1} className="mt-6 t-h2 break-words outline-none">
        {heading}
      </h2>
      <p className="mt-4 max-w-lg t-body text-ink/80">{children}</p>
      <button type="button" className="link mt-5" onClick={onAgain}>
        {again}
      </button>
    </div>
  );
}

/** Shown above a form when the website could not send it: what was typed stays, with ways to send it from the visitor's own email. */
function NotSent({
  headingRef,
  heading,
  body,
  subject,
  text,
  copyLabels,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  heading: string;
  body: string;
  subject: string;
  text: string;
  copyLabels: { label: string; done: string; announce: string };
}) {
  const n = contactContent.notSent;
  // The fallback writes to the same inbox the form delivers to.
  const to = site.formInbox;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  return (
    <div role="alert" className="mb-8 rounded-2xl border border-[#f3cdc8] bg-[#fdf4f3] p-4 sm:p-6">
      <h2 ref={headingRef} tabIndex={-1} className="flex items-start gap-2.5 text-[1.0625rem] leading-snug font-semibold text-ink outline-none">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-[#b42318]" aria-hidden />
        {heading}
      </h2>
      <p className="mt-2 t-body text-ink/85">
        {fill(body, {
          address: (
            <a href={`mailto:${to}`} className="font-semibold break-words text-pine underline decoration-pine/40 underline-offset-4 hover:decoration-current">
              {to}
            </a>
          ),
        })}
      </p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <a href={gmail} target="_blank" rel="noopener" className={SMALL_BUTTON}>
          {n.gmail}
        </a>
        <a href={mailto} className={SMALL_BUTTON}>
          {n.mailApp}
        </a>
        <CopyButton
          text={`To: ${to}\nSubject: ${subject}\n\n${text}`}
          label={copyLabels.label}
          done={copyLabels.done}
          announce={copyLabels.announce}
          className={SMALL_BUTTON}
        />
      </div>
    </div>
  );
}

/** Copies text, says so for a moment, and tells screen readers (`announce`, or the new label). */
function CopyButton({ text, label, done, announce, className }: { text: string; label: string; done: string; announce?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copied]);
  const Icon = copied ? Check : Copy;
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          navigator.clipboard?.writeText(text).then(
            () => setCopied(true),
            () => setCopied(false),
          );
        }}
      >
        <Icon className="size-4" aria-hidden />
        <span aria-live={announce ? undefined : "polite"}>{copied ? done : label}</span>
      </button>
      {announce && (
        <span className="sr-only" aria-live="polite">
          {copied ? announce : ""}
        </span>
      )}
    </>
  );
}
