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
import { allProducts, sectionFor, SERVICES } from "@/lib/site-map";

import { txt } from "@/lib/page-text/siteHeader";

function iconFor(id: string) {
  return productIcon(id);
}

type NavItem = (typeof pc.siteHeader.NAV)[number];
const menuId = (item: NavItem) => (item.to === "/products" ? "products-menu" : `menu-${item.to.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`);
const opensMenu = (item: NavItem) => item.to === "/products" || Boolean(item.children?.length);

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

/**
 * Every product in one plain list. It is not divided under Engage, Educate, Motivate and Empower (John, 19 Nov 2026: that
 * "is not headings for our products ... LoRaWAN under educate, it makes no sense").
 */
function ProductsPanel({ onPick }: { onPick: () => void }) {
  return (
    <div className="wrap grid gap-x-10 gap-y-8 py-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,0.85fr)]">
      <ul className="grid min-w-0 gap-x-6 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-3">
        {allProducts().map((prod) => (
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
      <div className="flex flex-col gap-1 border-line max-lg:border-t max-lg:pt-6 lg:border-l lg:pl-8">
        <AppLink href="/products" onClick={onPick} className="link">
          {txt.AppLink1}{" "}<ArrowRight className="size-4" aria-hidden />
        </AppLink>
        <AppLink href={SERVICES.href} onClick={onPick} className="link">
          {SERVICES.label}
        </AppLink>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname.replace(/\/+$/, "") || "/" });
  const [open, setOpen] = useState(false);
  /** The menu that is open on a wide screen, by its item's address. */
  const [menu, setMenu] = useState<string | null>(null);
  /** The section that is expanded in the phone menu. */
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const here = sectionFor(path)?.to;

  useEffect(() => {
    setMenu(null);
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!open && !menu) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        window.clearTimeout(hoverTimer.current);
        setOpen(false);
        setMenu(null);
      }
    };
    const onDown = (event: MouseEvent) => {
      if (zoneRef.current && !zoneRef.current.contains(event.target as Node)) setMenu(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open, menu]);

  // The phone menu covers the page; the page underneath does not scroll.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // A menu opens on a click (and Enter or Space); resting the pointer on its item opens it too, after a moment.
  const hover = (next: string | null) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setMenu(next), next ? 60 : 180);
  };
  const toggle = (to: string) => {
    window.clearTimeout(hoverTimer.current);
    setMenu((current) => (current === to ? null : to));
  };
  const productsOpen = menu === "/products";

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-paper text-ink">
      <div ref={zoneRef} onMouseLeave={() => hover(null)}>
        <div className="wrap flex h-(--header-h) items-center gap-4">
          <Link to="/" aria-label="Community Hub home" className="-m-1.5 rounded-lg p-1.5" onClick={() => setOpen(false)}>
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="ml-auto hidden items-center nav:flex">
            {pc.siteHeader.NAV.map((item, position) => {
              const active = here === item.to;
              if (!opensMenu(item)) {
                return (
                  <div key={item.to} className="flex" onMouseEnter={() => hover(null)}>
                    <AppLink href={item.to} aria-current={path === item.to ? "page" : undefined} data-active={active || undefined} className="site-nav-item">
                      {item.label}
                    </AppLink>
                  </div>
                );
              }
              const expanded = menu === item.to;
              return (
                <div key={item.to} className="relative flex items-center" onMouseEnter={() => hover(item.to)}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={menuId(item)}
                    data-active={active || undefined}
                    data-open={expanded || undefined}
                    onClick={() => toggle(item.to)}
                    className="site-nav-item"
                  >
                    {item.label}
                    <ChevronDown className={cn("size-4 shrink-0 transition-transform duration-200", expanded && "rotate-180")} aria-hidden />
                  </button>
                  {expanded && item.children && (
                    <div id={menuId(item)} className="site-nav-menu" data-side={position >= pc.siteHeader.NAV.length - 3 ? "end" : undefined}>
                      <ul>
                        {item.children.map((child) => (
                          <li key={child.href + child.label}>
                            <AppLink href={child.href} onClick={() => setMenu(null)} aria-current={path === child.href ? "page" : undefined} className="site-nav-menu-link">
                              {child.label}
                            </AppLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <button
            type="button"
            className="-mr-2 ml-auto grid size-11 place-items-center rounded-full text-pine transition-colors hover:bg-field nav:hidden"
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
            onMouseEnter={() => hover("/products")}
            className="absolute inset-x-0 top-full hidden border-b border-line bg-paper shadow-[0_28px_48px_-28px_rgb(18_58_41/0.22)] nav:block"
          >
            <ProductsPanel onPick={() => setMenu(null)} />
          </div>
        )}
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="fixed inset-x-0 top-(--header-h) bottom-0 overflow-y-auto overscroll-contain bg-paper nav:hidden"
        >
          <div className="wrap flex min-h-full flex-col pt-2 pb-8">
            <ul className="divide-y divide-line">
              {pc.siteHeader.NAV.filter((item) => item.to !== site.contactHref).map((item) => {
                const active = here === item.to;
                if (!opensMenu(item)) {
                  return (
                    <li key={item.to}>
                      <AppLink
                        href={item.to}
                        onClick={() => setOpen(false)}
                        aria-current={path === item.to ? "page" : undefined}
                        className={cn("flex min-h-14 items-center text-xl font-semibold", active ? "text-pine underline decoration-2 underline-offset-8" : "text-ink")}
                      >
                        {item.label}
                      </AppLink>
                    </li>
                  );
                }
                const expanded = mobileSection === item.to;
                return (
                  <li key={item.to}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setMobileSection((current) => (current === item.to ? null : item.to))}
                      className={cn("flex min-h-14 w-full items-center justify-between gap-4 text-left text-xl font-semibold", active ? "text-pine" : "text-ink")}
                    >
                      <span className={cn(active && "underline decoration-2 underline-offset-8")}>{item.label}</span>
                      <ChevronDown className={cn("size-5 shrink-0 transition-transform duration-200", expanded && "rotate-180")} aria-hidden />
                    </button>
                    {expanded && item.to === "/products" && (
                      <div className="pb-5">
                        <ul>
                          {allProducts().map((prod) => (
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
                        <AppLink href="/products" onClick={() => setOpen(false)} className="link mt-3">
                          {txt.AppLink2}{" "}<ArrowRight className="size-4" aria-hidden />
                        </AppLink>
                      </div>
                    )}
                    {expanded && item.children && (
                      <ul className="pb-4">
                        {item.children.map((child) => (
                          <li key={child.href + child.label}>
                            <AppLink
                              href={child.href}
                              onClick={() => setOpen(false)}
                              aria-current={path === child.href ? "page" : undefined}
                              className={cn("flex min-h-11 items-center text-base font-medium", path === child.href ? "text-pine underline decoration-2 underline-offset-4" : "text-ink")}
                            >
                              {child.label}
                            </AppLink>
                          </li>
                        ))}
                      </ul>
                    )}
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
                {txt.p1}{" "}
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
