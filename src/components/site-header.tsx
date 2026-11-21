import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppLink } from "@/components/app-link";
import { productIcon } from "@/lib/product-icons";
import { site } from "@/lib/site";
import { DEMO_HREF } from "@/lib/links";
import { cn } from "@/lib/utils";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";


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
  "/lorawan",
  "/studios",
]);

function iconFor(id: string) {
  return productIcon(id);
}

function isActive(path: string, to: string) {
  if (to === "/products") return PRODUCT_PATHS.has(path) || path.startsWith("/lorawan/") || path.startsWith("/studios/");
  return path === to || path.startsWith(`${to}/`);
}

/** The mark and the wordmark. Comfortaa appears here and nowhere else. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <img src={copy.siteHeader.SiteHeader.img_src1} alt="" width={32} height={32} className="size-8 shrink-0 object-contain" />
      <span className="font-brand text-[1.1875rem] leading-none font-bold tracking-[-0.01em] text-pine">
        {copy.siteHeader.SiteHeader.span1} <span className="text-leaf">{copy.siteHeader.SiteHeader.span2}</span>
      </span>
    </span>
  );
}

function ProductsPanel({ onPick }: { onPick: () => void }) {
  return (
    <div className="wrap grid gap-x-10 gap-y-8 py-8 lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,0.85fr)]">
      {pc.products.GROUPS.map((group) => (
        <div key={group.kicker} className="min-w-0">
          <p className="px-3 text-sm font-semibold text-ink/55">{group.kicker}</p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((prod) => (
              <li key={prod.id}>
                <AppLink
                  href={prod.href}
                  onClick={onPick}
                  className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-field"
                >
                  <img src={iconFor(prod.id)} alt="" className="mt-0.5 size-8 shrink-0 object-contain" />
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink group-hover:text-pine">{prod.title}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-ink/65">{prod.blurb}</span>
                  </span>
                </AppLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="flex flex-col gap-1 border-line max-lg:border-t max-lg:pt-6 lg:border-l lg:pl-8">
        <AppLink href="/products" onClick={onPick} className="link">
          All products <ArrowRight className="size-4" aria-hidden />
        </AppLink>
        <AppLink href="/services" onClick={onPick} className="link">
          Data and graphic design services
        </AppLink>
        <AppLink href="/implementations" onClick={onPick} className="link">
          Implementations
        </AppLink>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname.replace(/\/+$/, "") || "/" });
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileProducts, setMobileProducts] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setProductsOpen(false);
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!open && !productsOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        window.clearTimeout(hoverTimer.current);
        setOpen(false);
        setProductsOpen(false);
      }
    };
    const onDown = (event: MouseEvent) => {
      if (zoneRef.current && !zoneRef.current.contains(event.target as Node)) setProductsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open, productsOpen]);

  // The phone menu covers the page; the page underneath does not scroll.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const hover = (next: boolean) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setProductsOpen(next), next ? 60 : 180);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-paper text-ink">
      <div ref={zoneRef} onMouseLeave={() => hover(false)}>
        <div className="wrap flex h-(--header-h) items-center gap-6">
          <Link to="/" aria-label="Community Hub home" className="-m-1.5 rounded-lg p-1.5" onClick={() => setOpen(false)}>
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="ml-auto hidden items-center gap-0.5 lg:flex">
            {pc.siteHeader.NAV.map((item) => {
              const active = isActive(path, item.to);
              if (item.to === "/products") {
                return (
                  <div key={item.to} className="flex items-center" onMouseEnter={() => hover(true)}>
                    <button
                      type="button"
                      aria-expanded={productsOpen}
                      aria-controls="products-menu"
                      onClick={() => {
                        window.clearTimeout(hoverTimer.current);
                        setProductsOpen((v) => !v);
                      }}
                      className={cn(
                        "inline-flex h-10 items-center gap-1 rounded-full px-3.5 text-[0.9375rem] font-medium transition-colors duration-150 hover:bg-field hover:text-pine",
                        active || productsOpen ? "text-pine" : "text-ink/75",
                        active && "font-semibold",
                      )}
                    >
                      {item.label}
                      <ChevronDown className={cn("size-4 transition-transform duration-200", productsOpen && "rotate-180")} aria-hidden />
                    </button>
                  </div>
                );
              }
              return (
                <div key={item.to} className="flex" onMouseEnter={() => hover(false)}>
                  <AppLink
                    href={item.to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-10 items-center rounded-full px-3.5 text-[0.9375rem] font-medium transition-colors duration-150 hover:bg-field hover:text-pine",
                      active ? "font-semibold text-pine" : "text-ink/75",
                    )}
                  >
                    {item.label}
                  </AppLink>
                </div>
              );
            })}
          </nav>
          {/* A menu item like the others, not a pill (John, 19 Nov: "I just think it's confusing for it to always be a
              different button than every other button"). */}
          <AppLink
            href={site.contactHref}
            aria-current={isActive(path, site.contactHref) ? "page" : undefined}
            className={cn(
              "hidden h-10 items-center rounded-full px-3.5 text-[0.9375rem] font-medium transition-colors duration-150 hover:bg-field hover:text-pine lg:inline-flex",
              isActive(path, site.contactHref) ? "font-semibold text-pine" : "text-ink/75",
            )}
          >
            {copy.siteHeader.SiteHeader.a1}
          </AppLink>

          <button
            type="button"
            className="-mr-2 ml-auto grid size-11 place-items-center rounded-full text-pine transition-colors hover:bg-field lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? copy.siteHeader.SiteHeader.button_aria_label1 : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        <div aria-hidden className="h-px bg-line" />

        {productsOpen && (
          <div
            id="products-menu"
            onMouseEnter={() => hover(true)}
            className="absolute inset-x-0 top-full hidden border-b border-line bg-paper shadow-[0_28px_48px_-28px_rgb(18_58_41/0.22)] lg:block"
          >
            <ProductsPanel onPick={() => setProductsOpen(false)} />
          </div>
        )}
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="fixed inset-x-0 top-(--header-h) bottom-0 overflow-y-auto overscroll-contain bg-paper lg:hidden"
        >
          <div className="wrap flex min-h-full flex-col pt-2 pb-8">
            <ul className="divide-y divide-line">
              {pc.siteHeader.NAV.map((item) => {
                const active = isActive(path, item.to);
                if (item.to === "/products") {
                  return (
                    <li key={item.to}>
                      <button
                        type="button"
                        aria-expanded={mobileProducts}
                        onClick={() => setMobileProducts((v) => !v)}
                        className={cn("flex min-h-14 w-full items-center justify-between text-left text-xl font-semibold", active ? "text-pine" : "text-ink")}
                      >
                        {item.label}
                        <ChevronDown className={cn("size-5 transition-transform duration-200", mobileProducts && "rotate-180")} aria-hidden />
                      </button>
                      {mobileProducts && (
                        <div className="space-y-5 pb-5">
                          {pc.products.GROUPS.map((group) => (
                            <div key={group.kicker}>
                              <p className="text-sm font-semibold text-ink/55">{group.kicker}</p>
                              <ul className="mt-1">
                                {group.items.map((prod) => (
                                  <li key={prod.id}>
                                    <AppLink
                                      href={prod.href}
                                      onClick={() => setOpen(false)}
                                      aria-current={path === prod.href ? "page" : undefined}
                                      className="flex min-h-11 items-center gap-3 text-base font-medium text-ink"
                                    >
                                      <img src={iconFor(prod.id)} alt="" className="size-7 shrink-0 object-contain" />
                                      {prod.title}
                                    </AppLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          <AppLink href="/products" onClick={() => setOpen(false)} className="link">
                            All products <ArrowRight className="size-4" aria-hidden />
                          </AppLink>
                        </div>
                      )}
                    </li>
                  );
                }
                return (
                  <li key={item.to}>
                    <AppLink
                      href={item.to}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn("flex min-h-14 items-center text-xl font-semibold", active ? "text-pine" : "text-ink")}
                    >
                      {item.label}
                    </AppLink>
                  </li>
                );
              })}
            </ul>
            <div className="mt-auto pt-8">
              <AppLink href={site.contactHref} onClick={() => setOpen(false)} className="btn-primary w-full">
                {copy.siteHeader.SiteHeader.a1}
              </AppLink>
              <AppLink href={DEMO_HREF} onClick={() => setOpen(false)} className="btn-secondary mt-3 w-full">
                {copy.siteHeader.SiteHeader.a2}
              </AppLink>
              <p className="mt-4 text-center text-sm text-ink/65">
                or write to{" "}
                <a href={site.mailtoHref} className="font-semibold text-leaf underline">
                  {site.contactEmail}
                </a>
              </p>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
