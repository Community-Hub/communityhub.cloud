import type { ReactNode } from "react";
import { DocSection, DocShell } from "@/components/doc";

/** A one-screen page: the title, a lede, a body, then the footer. */
export function Page({ title, lede, children }: { title: string; lede: string; children: ReactNode }) {
  return (
    <DocShell stops={[{ id: "page", label: title }]}>
      <DocSection label={title} title={title} as="h1" lede={lede}>
        {children}
      </DocSection>
    </DocShell>
  );
}
