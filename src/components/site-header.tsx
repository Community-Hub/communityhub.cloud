import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { educateBeats, empowerBeats, engageBeats } from "@/lib/content";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
const NAV = pc.siteHeader.NAV;
const GROUPS = pc.products.GROUPS;
const BEATS = [...engageBeats, ...educateBeats, ...empowerBeats];

const PRODUCT_PATHS = new Set([
  "/products",
  "/digital-signage",
  "/phone-app",
  "/web-embeddables",
  "/dashboard-builder",
  "/building-dashboard",
  "/citywide-dashboard",
  "/data-hub",
  "/stories",
  "/community-calendar",
  "/community-voices",
  "/services",
]);

function iconFor(id: string) {
  return BEATS.find((item) => item.id === id)?.icon ?? "";
}

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProductsMenuOpen(false);
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!open && !productsMenuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setProductsMenuOpen(false);
      }
    };
    const onClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProductsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, [open, productsMenuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-pine/15 bg-paper text-pine md:border-pine/40 md:bg-pine md:text-paper">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <a href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img src={copy.siteHeader.SiteHeader.img_src1} alt="" className="size-8 rounded-full object-contain md:bg-paper" />
          <span className="font-display text-lg tracking-tight">{copy.siteHeader.SiteHeader.span1}{" "}<span className="text-leaf md:text-paper">{copy.siteHeader.SiteHeader.span2}</span>
          </span>
        </a>
        <nav className="ml-auto hidden items-center md:flex md:gap-3 md:text-xs md:font-bold lg:gap-5 lg:text-sm">
          {NAV.map((item) => {
            const isProducts = item.to === "/products";
            const active = isProducts ? PRODUCT_PATHS.has(path) : path === item.to;

            if (isProducts) {
              return (
                <div
                  key={item.to}
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={() => setProductsMenuOpen(true)}
                  onMouseLeave={() => setProductsMenuOpen(false)}
                >
                  <div className="inline-flex min-h-11 items-center gap-0.5">
                    <Link
                      to={item.to}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-flex min-h-11 items-center rounded-sm px-0.5 transition-colors duration-150 hover:text-lime focus-visible:outline-lime motion-reduce:transition-none",
                        active && "text-lime",
                      )}
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      aria-label="Toggle Products menu"
                      aria-expanded={productsMenuOpen}
                      onClick={() => setProductsMenuOpen((v) => !v)}
                      className={cn(
                        "inline-flex size-7 items-center justify-center rounded-sm transition-colors duration-150 hover:text-lime focus-visible:outline-lime",
                        active && "text-lime",
                      )}
                    >
                      <ChevronDown className={cn("size-4 transition-transform duration-150", productsMenuOpen && "rotate-180")} />
                    </button>
                  </div>

                  {productsMenuOpen && (
                    <div
                      data-products-dropdown
                      className="fixed inset-x-4 top-16 z-50 mx-auto w-auto max-w-[42rem] pt-1.5"
                    >
                      <div className="rounded-xl border border-pine/20 bg-paper p-5 text-ink shadow-xl">
                        <div className="grid grid-cols-3 gap-5 lg:gap-6">
                          {GROUPS.map((group) => (
                            <div key={group.kicker}>
                              <p className="border-b border-pine/20 pb-1.5 font-display text-sm font-bold text-pine">
                                {group.kicker}
                              </p>
                              <ul className="mt-2 space-y-1">
                                {group.items.map((prod) => {
                                  const prodActive = path === prod.href;
                                  return (
                                    <li key={prod.id}>
                                      <Link
                                        to={prod.href}
                                        onClick={() => setProductsMenuOpen(false)}
                                        className={cn(
                                          "flex min-h-10 items-center gap-2.5 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-field",
                                          prodActive && "bg-field font-bold text-pine",
                                        )}
                                      >
                                        <img src={iconFor(prod.id)} alt="" className="size-6 shrink-0 object-contain" />
                                        <span className="leading-snug font-bold text-ink">{prod.title}</span>
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-pine/15 pt-3 text-xs">
                          <span className="font-normal text-ink/70">Explore all Community Hub display, analytics, and engagement tools</span>
                          <Link
                            to="/products"
                            onClick={() => setProductsMenuOpen(false)}
                            className="font-bold text-pine underline underline-offset-4 hover:text-leaf"
                          >
                            View all products →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn("inline-flex min-h-11 items-center rounded-sm px-0.5 transition-colors duration-150 hover:text-lime focus-visible:outline-lime motion-reduce:transition-none", active && "text-lime")}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href={site.contactHref}
            className="inline-flex min-h-9 items-center rounded-md border border-paper/45 bg-transparent px-3 text-xs text-paper transition-colors duration-150 hover:border-lime hover:bg-paper/15 hover:text-lime focus-visible:outline-lime motion-reduce:transition-none"
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
        <nav className="relative z-50 flex max-h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto overscroll-contain border-t border-pine/15 bg-paper px-4 py-3 text-pine md:hidden">
          {NAV.map((item) => {
            const isProducts = item.to === "/products";
            const active = isProducts ? PRODUCT_PATHS.has(path) : path === item.to;
            if (isProducts) {
              return (
                <div key={item.to} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex-1 rounded-md px-2 py-3 text-base font-bold",
                        active && "bg-field underline decoration-leaf decoration-2 underline-offset-4",
                      )}
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      aria-label="Toggle mobile Products list"
                      aria-expanded={mobileProductsOpen}
                      onClick={() => setMobileProductsOpen((v) => !v)}
                      className="grid size-11 place-items-center rounded-md text-pine hover:bg-field"
                    >
                      <ChevronDown className={cn("size-5 transition-transform duration-150", mobileProductsOpen && "rotate-180")} />
                    </button>
                  </div>
                  {mobileProductsOpen && (
                    <div className="mb-2 ml-2 space-y-3 rounded-lg border border-pine/15 bg-field/60 p-3">
                      {GROUPS.map((group) => (
                        <div key={group.kicker}>
                          <p className="font-display text-xs font-bold tracking-wide uppercase text-pine/80">
                            {group.kicker}
                          </p>
                          <ul className="mt-1 space-y-0.5">
                            {group.items.map((prod) => (
                              <li key={prod.id}>
                                <Link
                                  to={prod.href}
                                  onClick={() => setOpen(false)}
                                  className={cn(
                                    "flex min-h-10 items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-bold text-ink hover:bg-paper",
                                    path === prod.href && "bg-paper text-pine underline decoration-leaf underline-offset-4",
                                  )}
                                >
                                  <img src={iconFor(prod.id)} alt="" className="size-5 shrink-0 object-contain" />
                                  <span>{prod.title}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn("rounded-md px-2 py-3 text-base font-bold", active && "bg-field underline decoration-leaf decoration-2 underline-offset-4")}
              >
                {item.label}
              </Link>
            );
          })}
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
