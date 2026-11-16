import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, type MouseEvent, type RefObject } from "react";
import { AppLink } from "@/components/app-link";
import { ContactBand } from "@/components/contact-band";
import { EmbedLoading, useEmbedReady, useEmbedShield } from "@/components/guarded-embed";
import { SiteFooter } from "@/components/site-footer";
import { imageSize } from "@/lib/image-dimensions";
import {
  findImplementation,
  findImplementationCase,
  implementationCopy,
  implementations,
  type Implementation,
  type ImplementationCase,
  type ImplementationPhoto,
} from "@/lib/implementations";
import { cn } from "@/lib/utils";

type View = "story" | "live";
type CaseSearch = { view?: "live" };

export const Route = createFileRoute("/implementations/$slug")({
  // `?view=live` opens the live dashboard (or calendar); anything else is the story.
  validateSearch: (search: Record<string, unknown>): CaseSearch => (search.view === "live" ? { view: "live" } : {}),
  loader: ({ params }) => {
    if (!findImplementation(params.slug) || !findImplementationCase(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const place = findImplementation(params.slug);
    return {
      meta: place
        ? [
            { title: `${place.name} ${implementationCopy.meta.caseTitle}` },
            { name: "description", content: place.summary },
          ]
        : [{ title: implementationCopy.meta.title }],
    };
  },
  component: CasePage,
});

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A link inside running text. */
const inlineLink =
  "font-semibold text-leaf underline decoration-leaf/40 underline-offset-[0.22em] transition-colors duration-150 hover:text-pine hover:decoration-current";

/** MidTown's lead photo is a tall sign; keep its screen and QR poster in the crop. */
const PHOTO_POSITION: Record<string, string> = { "/assets/eng-sign-daves-full.jpg": "center 30%" };

function CasePage() {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const view: View = search.view === "live" ? "live" : "story";
  const place = findImplementation(slug);
  const item = findImplementationCase(slug);
  const viewsRef = useRef<HTMLElement>(null);
  const bringViewsUp = useRef(false);

  // Asking for the live view from this page brings the frame up under the header, so it fills the screen.
  useEffect(() => {
    if (view !== "live" || !bringViewsUp.current) return;
    bringViewsUp.current = false;
    requestAnimationFrame(() =>
      viewsRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" }),
    );
  }, [view, slug]);

  // The loader answers an unknown place with the not-found page, so this only guards the types.
  if (!place || !item) return null;
  // Only a plain click changes this page; a click that opens a new tab leaves it where it is.
  const onLive = (event: MouseEvent) => {
    if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) bringViewsUp.current = true;
  };

  return (
    <>
      <main id="main" className="pt-(--header-h)">
        <div className="wrap pt-[clamp(1.25rem,3.5vw,2.75rem)]">
          <AppLink href="/implementations" className="link t-small">
            <ArrowLeft className="size-4" aria-hidden />
            {implementationCopy.nav.all}
          </AppLink>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <h1 className="t-h1">{place.name}</h1>
            <p className="text-lg font-medium text-ink/65">{place.kind}</p>
          </div>
          <p className="mt-4 max-w-3xl t-lede">{place.summary}</p>
          <ViewTabs place={place} view={view} onLive={onLive} navRef={viewsRef} />
        </div>

        {view === "live" ? <LiveView item={item} /> : <StoryView place={place} item={item} onLive={onLive} />}

        <PlacePager place={place} view={view} />
        <ContactBand />
      </main>
      <SiteFooter />
    </>
  );
}

/** Story and live view: two links on one underline bar. The address carries the choice, so either can be shared. */
function ViewTabs({
  place,
  view,
  onLive,
  navRef,
}: {
  place: Implementation;
  view: View;
  onLive: (event: MouseEvent) => void;
  navRef: RefObject<HTMLElement | null>;
}) {
  const tab = (active: boolean) =>
    cn(
      "relative inline-flex min-h-12 items-center text-[1.0625rem] font-semibold transition-colors duration-150",
      active
        ? "text-pine after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-pine"
        : "text-ink/65 hover:text-pine",
    );
  const exact = { exact: true, includeSearch: true };
  return (
    <nav
      ref={navRef}
      aria-label={`${place.name}: views`}
      className="mt-8 flex scroll-mt-[calc(var(--header-h)+1rem)] gap-x-8 border-b border-line md:mt-10"
    >
      <Link
        to="/implementations/$slug"
        params={{ slug: place.slug }}
        search={{}}
        resetScroll={false}
        activeOptions={exact}
        className={tab(view === "story")}
      >
        {implementationCopy.nav.story}
      </Link>
      <Link
        to="/implementations/$slug"
        params={{ slug: place.slug }}
        search={{ view: "live" }}
        resetScroll={false}
        activeOptions={exact}
        onClick={onLive}
        className={tab(view === "live")}
      >
        {place.liveLabel}
      </Link>
    </nav>
  );
}

function CasePhoto({ photo, variant }: { photo: ImplementationPhoto; variant: "lead" | "half" | "wide" }) {
  const size = imageSize(photo.src);
  return (
    <figure className="min-w-0">
      <img
        src={photo.src}
        alt={photo.alt}
        width={size?.width}
        height={size?.height}
        loading={variant === "lead" ? "eager" : "lazy"}
        decoding="async"
        style={{ objectPosition: PHOTO_POSITION[photo.src] }}
        className={cn(
          "block w-full bg-field object-cover",
          variant === "lead" && "max-h-[34rem] rounded-[var(--radius-panel)]",
          variant === "half" && "aspect-[4/3] rounded-2xl",
          variant === "wide" && "aspect-[16/9] rounded-2xl",
        )}
      />
      <figcaption className="mt-2.5 t-small text-ink/65">{photo.caption}</figcaption>
    </figure>
  );
}

function StoryView({ place, item, onLive }: { place: Implementation; item: ImplementationCase; onLive: (event: MouseEvent) => void }) {
  const t = implementationCopy.story;
  const [lead, ...more] = item.photos;
  const host = new URL(item.live.embed).host;
  // Wide screens: the story and its links on the left, the photos on the right. One column (phone, tablet): the lead
  // photo, the story, the other photos, then the links, so the links close the story.
  return (
    <div className="wrap mt-8 flex flex-col gap-y-10 md:mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-[clamp(2.5rem,5vw,5rem)]">
      <div className="contents lg:col-span-5 lg:block">
        <div className="order-2 min-w-0 max-w-[38rem] lg:order-none">
          <div className="space-y-5">
            {item.story.map((text, n) => (
              <p key={n} className={n === 0 ? "t-lede text-ink" : "t-body text-ink/80"}>
                {text}
              </p>
            ))}
          </div>
          <figure className="mt-10">
            <blockquote className="text-[clamp(1.25rem,2vw,1.5rem)] leading-[1.38] font-medium tracking-[-0.012em] text-pine">
              “{item.quote.text}”
            </blockquote>
            <figcaption className="mt-4 text-[0.9375rem] leading-snug">
              <span className="block font-semibold text-ink">{item.quote.speaker ?? item.quote.org}</span>
              {item.quote.speaker && item.quote.role && <span className="block text-ink/70">{item.quote.role}</span>}
            </figcaption>
          </figure>
        </div>

        <div className="order-4 min-w-0 max-w-[38rem] lg:order-none lg:mt-10">
          <div className="border-t border-line pt-6 t-body">
            <p>
              <span className="font-semibold text-ink">{t.inUse}</span>{" "}
              {item.products.map((product, n) => (
                <span key={product.href}>
                  {n > 0 && ", "}
                  <AppLink href={product.href} className={inlineLink}>
                    {product.label}
                  </AppLink>
                </span>
              ))}
            </p>
            {item.related?.map((link) => (
              <p key={link.href} className="mt-3 text-ink/80">
                <AppLink href={link.href} className={inlineLink}>
                  {link.label}
                </AppLink>
                : {link.note}
              </p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              to="/implementations/$slug"
              params={{ slug: place.slug }}
              search={{ view: "live" }}
              resetScroll={false}
              onClick={onLive}
              className="btn-secondary"
            >
              {t.seeThe} {place.liveLabel.toLowerCase()}
            </Link>
            {item.visit && (
              <a href={item.visit.href} target="_blank" rel="noopener" className="link">
                {item.visit.label}
                <ArrowUpRight className="size-4" aria-hidden />
                <span className="sr-only"> {t.newTab}</span>
              </a>
            )}
          </div>
          <p className="mt-4 t-small text-ink/65">
            {t.runsAt} {host}
          </p>
        </div>
      </div>

      <div className="contents lg:col-span-7 lg:block">
        {lead && (
          <div className="order-1 min-w-0 lg:order-none">
            <CasePhoto photo={lead} variant="lead" />
          </div>
        )}
        {more.length > 0 && (
          <div
            className={cn(
              "order-3 grid min-w-0 gap-x-4 gap-y-6 md:gap-x-6 lg:order-none lg:mt-6",
              more.length > 1 && "grid-cols-2",
            )}
          >
            {more.map((photo) => (
              <CasePhoto key={photo.src} photo={photo} variant={more.length > 1 ? "half" : "wide"} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** The place's own live page, full size in a rounded frame, so its menu and every view inside it work. */
function LiveView({ item }: { item: ImplementationCase }) {
  const t = implementationCopy.live;
  const [ready, setReady] = useEmbedReady();
  const { boxProps } = useEmbedShield();
  const host = new URL(item.live.embed).host;
  return (
    <div className="wrap mt-5">
      <div className="flex flex-wrap items-center justify-between gap-x-6">
        <p className="t-small text-ink/75">
          {t.whole} {item.live.noun}
          {t.liveFrom} <b className="font-semibold text-ink">{host}</b>
          {t.scroll}
          {item.live.noun === "dashboard" && <span className="block sm:hidden"> {t.phoneMenu}</span>}
        </p>
        <a href={item.live.embed} target="_blank" rel="noopener" className="link t-small">
          {t.open}
          <span className="sr-only">: {item.live.title}</span>
          <ArrowUpRight className="size-4" aria-hidden />
        </a>
      </div>
      <div
        {...boxProps}
        data-live-frame
        aria-busy={!ready}
        className="relative mt-2 h-[calc(100dvh-var(--header-h)-12.5rem)] min-h-[28rem] overflow-hidden rounded-[var(--radius-panel)] border border-line bg-paper shadow-[0_1px_2px_rgb(18_58_41/0.06),0_24px_48px_-30px_rgb(18_58_41/0.4)] max-md:h-[72dvh]"
      >
        {/* A finger landing just above the frame is snapped into it by the browser; this strip keeps that touch on the page. */}
        <span aria-hidden className="absolute inset-x-0 top-0 z-10 hidden h-3 pointer-coarse:block" />
        <EmbedLoading ready={ready} />
        <iframe
          key={item.live.embed}
          src={item.live.embed}
          title={item.live.title}
          onLoad={setReady}
          className="absolute inset-0 size-full border-0"
        />
      </div>
    </div>
  );
}

/** The places before and after this one, in the index's order, in the same view. */
function PlacePager({ place, view }: { place: Implementation; view: View }) {
  const at = implementations.findIndex((p) => p.slug === place.slug);
  const count = implementations.length;
  if (at < 0 || count < 2) return null;
  const prev = implementations[(at - 1 + count) % count];
  const next = implementations[(at + 1) % count];
  const search: CaseSearch = view === "live" ? { view: "live" } : {};
  const t = implementationCopy.nav;
  // Under the live frame the divider shows in the strip left below it, a sign that the page goes on.
  return (
    <nav
      aria-label="Implementations"
      className={cn("wrap pb-[clamp(3.5rem,7vw,5rem)]", view === "live" ? "pt-8" : "pt-[clamp(4rem,8vw,6rem)]")}
    >
      <div className="border-t border-line pt-6 sm:pt-8">
        {/* The links' own padding is their hover area; the negative margin lines their pictures up with the page. */}
        <div className="-mx-2 grid gap-2 sm:-mx-3 sm:grid-cols-2 sm:gap-8">
          <PagerLink place={prev} search={search} label={t.previous} dir="prev" />
          <PagerLink place={next} search={search} label={t.next} dir="next" />
        </div>
      </div>
    </nav>
  );
}

function PagerLink({
  place,
  search,
  label,
  dir,
}: {
  place: Implementation;
  search: CaseSearch;
  label: string;
  dir: "prev" | "next";
}) {
  const size = imageSize(place.image);
  const Arrow = dir === "prev" ? ArrowLeft : ArrowRight;
  return (
    <Link
      to="/implementations/$slug"
      params={{ slug: place.slug }}
      search={search}
      className={cn(
        "group flex items-center gap-4 rounded-2xl p-2 transition-colors duration-150 hover:bg-field sm:gap-5 sm:p-3",
        dir === "next" && "sm:flex-row-reverse sm:text-right",
      )}
    >
      <img
        src={place.image}
        alt=""
        width={size?.width}
        height={size?.height}
        loading="lazy"
        decoding="async"
        className="size-20 shrink-0 rounded-xl object-cover sm:size-24"
      />
      <span className="min-w-0">
        <span className={cn("flex items-center gap-1.5 text-sm font-medium text-ink/65", dir === "next" && "sm:justify-end")}>
          {dir === "prev" && <Arrow className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden />}
          {label}
          {dir === "next" && <Arrow className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />}
        </span>
        <span className="mt-1 block text-lg leading-snug font-semibold text-ink transition-colors duration-150 group-hover:text-pine">
          {place.name}
        </span>
        <span className="block text-sm text-ink/65">{place.kind}</span>
      </span>
    </Link>
  );
}
