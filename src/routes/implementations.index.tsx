import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { ClosingBand } from "@/components/implementations/closing-band";
import { SiteFooter } from "@/components/site-footer";
import { imageSize } from "@/lib/image-dimensions";
import {
  implementationCopy,
  implementationGroups,
  implementationIntro,
  implementations,
  type Implementation,
  type ImplementationGroup,
} from "@/lib/implementations";
import { BRING_HREF } from "@/lib/links";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/implementations/")({
  component: ImplementationsIndex,
  head: () => ({
    meta: [
      { title: implementationCopy.meta.title },
      { name: "description", content: implementationCopy.meta.description },
    ],
  }),
});

/** MidTown's photo is tall: a wide crop keeps the sign's QR poster and the person holding the phone controller. */
const PHOTO_POSITION: Record<string, string> = { "midtown-cleveland": "center 72%" };

function PlacePhoto({ place, eager = false, className }: { place: Implementation; eager?: boolean; className?: string }) {
  const size = imageSize(place.image);
  return (
    <div className="group/photo relative overflow-hidden rounded-[var(--radius-panel)] bg-field">
      <img
        src={place.image}
        alt={place.alt}
        width={size?.width}
        height={size?.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={{ objectPosition: PHOTO_POSITION[place.slug] }}
        className={cn(
          "block w-full object-cover transition-transform duration-700 ease-out-expo group-hover/photo:scale-[1.03] motion-reduce:transition-none",
          className,
        )}
      />
      {/* The photo opens the story too. Keyboards and screen readers use the name below, which goes to the same place. */}
      <Link to="/implementations/$slug" params={{ slug: place.slug }} tabIndex={-1} aria-hidden className="absolute inset-0" />
    </div>
  );
}

/** The name with its kind beside it, the summary, then the story and the live view. */
function PlaceText({ place }: { place: Implementation }) {
  const t = implementationCopy.index;
  return (
    <>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h3 className="t-h3">
          <Link
            to="/implementations/$slug"
            params={{ slug: place.slug }}
            className="rounded-sm transition-colors duration-150 hover:text-pine"
          >
            {place.name}
          </Link>
        </h3>
        <span className="text-[0.9375rem] text-ink/65">{place.kind}</span>
      </div>
      <p className="mt-2 t-body text-ink/78">{place.summary}</p>
      <p className="mt-2 flex flex-wrap gap-x-6">
        <Link to="/implementations/$slug" params={{ slug: place.slug }} className="link">
          {t.readStory}
          <span className="sr-only">: {place.name}</span>
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link to="/implementations/$slug" params={{ slug: place.slug }} search={{ view: "live" }} className="link">
          {place.liveLabel}
          <span className="sr-only">: {place.name}</span>
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </p>
    </>
  );
}

// Every group sits on one twelve-column grid with one gutter, so its right half starts where the other groups'
// photos and descriptions start.

/** A group with several places: its heading and description across the top, the places side by side. */
function GroupWithPlaces({ group, places, eager }: { group: ImplementationGroup; places: Implementation[]; eager: boolean }) {
  return (
    <section aria-labelledby={`group-${group.id}`} className="border-t border-line pt-[clamp(2rem,4vw,3rem)]">
      <div className="grid gap-x-8 gap-y-4 lg:grid-cols-12">
        <h2 id={`group-${group.id}`} className="t-h2 lg:col-span-6 lg:pr-8">
          {group.title}
        </h2>
        <p className="max-w-[40rem] t-body text-ink/75 lg:col-span-6 lg:col-start-7 lg:pt-2">{group.description}</p>
      </div>
      <ul className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:mt-12">
        {places.map((place) => (
          <li key={place.slug} className="min-w-0">
            <PlacePhoto place={place} eager={eager} className="aspect-[4/3] lg:aspect-[16/10]" />
            <div className="mt-5">
              <PlaceText place={place} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** A group with one place: the heading, description and place on the left, its photo large on the right. */
function GroupWithPlace({ group, place, eager }: { group: ImplementationGroup; place: Implementation; eager: boolean }) {
  return (
    <section aria-labelledby={`group-${group.id}`} className="border-t border-line pt-[clamp(2rem,4vw,3rem)]">
      <div className="grid gap-x-8 gap-y-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
        <div className="lg:col-span-6 lg:pr-8">
          <h2 id={`group-${group.id}`} className="t-h2">
            {group.title}
          </h2>
          <p className="mt-4 max-w-[40rem] t-body text-ink/75">{group.description}</p>
        </div>
        <div className="min-w-0 lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1">
          <PlacePhoto place={place} eager={eager} className="aspect-[4/3] lg:aspect-[16/10]" />
        </div>
        <div className="min-w-0 lg:col-span-6 lg:self-end lg:pr-8">
          <PlaceText place={place} />
        </div>
      </div>
    </section>
  );
}

function ImplementationsIndex() {
  const t = implementationCopy.index;
  return (
    <>
      <main id="main" className="pt-(--header-h)">
        <div className="wrap pt-[clamp(2.5rem,6vw,5rem)]">
          <h1 className="t-h1">{implementationIntro.title}</h1>
          <p className="mt-5 max-w-3xl t-lede">{implementationIntro.lede}</p>
        </div>

        <div className="wrap mt-[clamp(3rem,6vw,4.5rem)] space-y-[clamp(4rem,8vw,6.5rem)] pb-(--section-y)">
          {implementationGroups.map((group, n) => {
            const places = implementations.filter((place) => place.group === group.id);
            if (places.length === 0) return null;
            // The first group's photos are on the first screen, so they load at once.
            const eager = n === 0;
            return places.length === 1 ? (
              <GroupWithPlace key={group.id} group={group} place={places[0]} eager={eager} />
            ) : (
              <GroupWithPlaces key={group.id} group={group} places={places} eager={eager} />
            );
          })}
        </div>

        <ClosingBand id="bring" title={t.bringTitle} link={{ href: BRING_HREF, label: t.readGuide }}>
          <p className="mt-5 max-w-xl t-lede text-white/85">
            {t.bringBefore}{" "}
            <AppLink
              href={BRING_HREF}
              className="font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
            >
              {t.bringLink}
            </AppLink>
            {t.bringAfter}
          </p>
        </ClosingBand>
      </main>
      <SiteFooter />
    </>
  );
}
