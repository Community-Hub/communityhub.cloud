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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper text-ink">
      <div className="mx-auto flex h-[4.5rem] max-w-[84rem] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img src={copy.siteHeader.SiteHeader.img_src1} alt="" className="size-8 rounded-full object-contain" />
          <span className="font-display text-[1.35rem] font-semibold tracking-[-0.03em] text-pine">
            {copy.siteHeader.SiteHeader.span1} <span>{copy.siteHeader.SiteHeader.span2}</span>
          </span>
        </a>
        <nav className="ml-auto hidden items-center gap-7 text-[0.9375rem] font-medium md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={path === item.to ? "page" : undefined}
              className={cn("inline-flex min-h-11 items-center transition-colors duration-150 hover:text-leaf focus-visible:outline-pine motion-reduce:transition-none", path === item.to && "font-semibold text-pine")}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={site.contactHref}
            className="inline-flex min-h-10 items-center rounded-[4px] bg-pine px-4 text-sm font-semibold text-paper transition-colors duration-150 hover:bg-ink focus-visible:outline-pine motion-reduce:transition-none"
          >{copy.siteHeader.SiteHeader.a1}</a>
        </nav>
        <button
          type="button"
          className="ml-auto grid size-11 place-items-center rounded-[4px] border border-line bg-paper text-pine md:hidden"
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
          className="fixed inset-0 top-[4.5rem] z-40 bg-ink/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      {open && (
        <nav className="relative z-50 flex flex-col gap-1 border-t border-line bg-paper px-4 py-4 text-ink md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              aria-current={path === item.to ? "page" : undefined}
              className={cn("rounded-[4px] px-3 py-3 text-base font-medium", path === item.to && "bg-field font-semibold text-pine")}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={site.contactHref}
            onClick={() => setOpen(false)}
            className="mt-2 grid min-h-11 place-items-center rounded-[4px] bg-pine px-4 py-3 text-base font-semibold text-paper"
          >{copy.siteHeader.SiteHeader.a1}</a>
        </nav>
      )}
    </header>
  );
}
