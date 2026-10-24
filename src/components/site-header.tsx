import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
const NAV = pc.siteHeader.NAV;

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-pine/15 bg-paper text-pine md:border-pine/40 md:bg-pine md:text-paper">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <a href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img src={copy.siteHeader.SiteHeader.img_src1} alt="" className="size-8 rounded-full object-contain md:bg-paper" />
          <span className="font-display text-lg tracking-tight">{copy.siteHeader.SiteHeader.span1}{" "}<span className="text-leaf md:text-paper">{copy.siteHeader.SiteHeader.span2}</span>
          </span>
        </a>
        <nav className="ml-auto hidden items-center gap-5 text-sm font-bold md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={path === item.to ? "page" : undefined}
              className={cn("inline-flex min-h-11 items-center rounded-sm px-0.5 transition-colors duration-150 hover:text-lime focus-visible:outline-lime motion-reduce:transition-none", path === item.to && "text-lime")}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={site.contactHref}
            className="inline-flex min-h-9 items-center rounded-md bg-paper px-3 text-xs text-pine transition-colors duration-150 hover:bg-lime focus-visible:outline-lime motion-reduce:transition-none"
          >{copy.siteHeader.SiteHeader.a1}</a>
        </nav>
        <button
          type="button"
          className="ml-auto grid size-11 place-items-center rounded-md border border-pine/30 bg-paper md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <button
          type="button"
          aria-label={copy.siteHeader.SiteHeader.button_aria_label1}
          className="fixed inset-0 top-16 z-40 bg-ink/25 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      {open && (
        <nav className="relative z-50 flex flex-col gap-1 border-t border-pine/15 bg-paper px-4 py-3 text-pine md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              aria-current={path === item.to ? "page" : undefined}
              className={cn("rounded-md px-2 py-3 text-base font-bold", path === item.to && "bg-field underline decoration-leaf decoration-2 underline-offset-4")}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={site.contactHref}
            onClick={() => setOpen(false)}
            className="mt-2 grid min-h-11 place-items-center rounded-md bg-pine px-4 py-3 text-base font-bold text-paper"
          >{copy.siteHeader.SiteHeader.a1}</a>
        </nav>
      )}
    </header>
  );
}
