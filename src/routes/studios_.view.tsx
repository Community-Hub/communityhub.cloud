import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { findStudioWork } from "@/lib/studios";

type ViewSearch = { show?: string; map?: string };

export const Route = createFileRoute("/studios_/view")({
  validateSearch: (search: Record<string, unknown>): ViewSearch => ({
    show: typeof search.show === "string" ? search.show : undefined,
    map: typeof search.map === "string" ? search.map : undefined,
  }),
  component: StudioView,
  head: () => ({ meta: [{ title: "Studios — Community Hub" }] }),
});

/** A published map, story or loop from Studios, shown full screen inside communityhub.cloud. */
function StudioView() {
  const search = Route.useSearch();
  const work = findStudioWork(search);
  const [ready, setReady] = useState(false);
  return (
    <main id="main" className="lora-console">
      <div className="lora-console-bar wrap">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[0.9375rem] text-ink/65">
          <AppLink href="/studios" className="inline-flex min-h-11 items-center gap-1.5 font-medium text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-pine">
            <ArrowLeft className="size-4" aria-hidden />
            Studios
          </AppLink>
          <span aria-hidden className="text-ink/35">
            /
          </span>
          <span aria-current="page" className="truncate">
            {work ? work.title : "Not found"}
          </span>
        </nav>
        {work && <p className="hidden text-[0.9375rem] text-ink/70 sm:block">{work.meta}</p>}
      </div>
      <div className="lora-console-frame panel" aria-busy={work ? !ready : undefined}>
        {work ? (
          <>
            {!ready && (
              <p className="lora-console-loading" role="status">
                Opening {work.title}…
              </p>
            )}
            <iframe key={work.src} src={work.src} title={work.title} onLoad={() => setReady(true)} allowFullScreen className="absolute inset-0 size-full border-0" />
          </>
        ) : (
          <div className="lora-console-loading">
            <p className="text-center">
              We couldn’t find that map or story.{" "}
              <AppLink href="/studios#published-work" className="link">
                See the published work
              </AppLink>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
