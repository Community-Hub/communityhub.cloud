import { createFileRoute } from "@tanstack/react-router";
import { AppLink } from "@/components/app-link";
import { DocSection, DocShell } from "@/components/doc";
import { pc } from "@/lib/page-content";
const ITEMS = pc.resources.ITEMS;

export const Route = createFileRoute("/resources")({
  component: Resources,
  head: () => ({
    meta: [
      { title: pc.meta.resources.title },
      { name: "description", content: pc.resources.LEDE },
    ],
  }),
});
const STOPS = pc.resources.STOPS;

function Resources() {
  return (
    <DocShell stops={STOPS}>
      <DocSection label={pc.resources.TITLE} title={pc.resources.TITLE} as="h1" lede={pc.resources.LEDE}>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
          {ITEMS.map((item) => (
            <li key={item.name} className="relative flex min-w-0 flex-col gap-1 rounded-md border border-line bg-paper p-3 md:p-4">
              <h2 className="text-[1.0625rem] font-bold leading-snug md:text-xl">{item.name}</h2>
              <p className="t-small md:t-body">{item.line}</p>
              <AppLink href={item.href} className="link mt-auto inline-flex items-center font-bold max-md:min-h-0 max-md:pt-1 max-md:after:absolute max-md:after:inset-0 md:min-h-11">
                {item.label}
                <span className="sr-only">: {item.name}</span>
              </AppLink>
            </li>
          ))}
        </ul>
      </DocSection>
    </DocShell>
  );
}
