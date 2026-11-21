// Where every page sits in the site, read from the main menu (pc.siteHeader.NAV), the product list and the
// implementations. The header's "you are here" mark, the breadcrumbs and the footer all follow this one structure
// (John and Maddie's review of 19 Nov 2026: "I don't know where I am, and I don't know how to get back").
import { implementations } from "@/lib/implementations";
import { pc } from "@/lib/page-content";

export type Crumb = { label: string; href?: string };

export const cleanPath = (path: string) => path.replace(/\/+$/, "") || "/";

/** Every product, in menu order, without the Engage / Educate / Motivate and Empower headings. */
export const allProducts = () => pc.products.GROUPS.flatMap((group) => group.items);

/** Design services: listed with the products, but not one of them. */
export const SERVICES = { href: "/services", label: "Data and graphic design services" };

export function isProductPath(path: string) {
  const p = cleanPath(path);
  if (p === "/products" || p === SERVICES.href || p === "/building-dashboard") return true;
  return allProducts().some((item) => p === item.href || p.startsWith(`${item.href}/`));
}

/** The main-menu item a page belongs to, or undefined (the legal pages belong to none). */
export function sectionFor(path: string) {
  const p = cleanPath(path);
  const nav = pc.siteHeader.NAV;
  if (p === "/") return nav.find((item) => item.to === "/");
  if (isProductPath(p)) return nav.find((item) => item.to === "/products");
  return nav.find(
    (item) =>
      item.to !== "/" &&
      (p === item.to || p.startsWith(`${item.to}/`) || Boolean(item.children?.some((child) => p === child.href || p.startsWith(`${child.href}/`)))),
  );
}

/**
 * The trail from Home to this page, following the site's structure (not the visitor's clicks). The last crumb is the
 * page itself and has no link. `current` names the page when the menu does not (a legal page, a console).
 */
export function trailFor(path: string, current?: string): Crumb[] {
  const p = cleanPath(path);
  if (p === "/") return [];
  const nav = pc.siteHeader.NAV;
  const home: Crumb = { label: nav.find((item) => item.to === "/")?.label ?? "Home", href: "/" };
  const section = sectionFor(p);
  if (!section || section.to === "/") return [home, { label: current ?? "" }].filter((crumb) => crumb.label);

  if (section.to === "/products") {
    if (p === "/products") return [home, { label: section.label }];
    const product = allProducts().find((item) => p === item.href || p.startsWith(`${item.href}/`));
    const trail: Crumb[] = [home, { label: section.label, href: "/products" }];
    if (p === SERVICES.href) return [...trail, { label: current ?? SERVICES.label }];
    if (product && p !== product.href) return [...trail, { label: product.title, href: product.href }, { label: current ?? "" }].filter((c) => c.label);
    return [...trail, { label: current ?? product?.title ?? "" }].filter((crumb) => crumb.label);
  }

  if (p === section.to) return [home, { label: section.label }];
  const trail: Crumb[] = [home, { label: section.label, href: section.to }];
  const child = section.children?.find((entry) => p === entry.href);
  if (child) return [...trail, { label: current ?? child.label }];
  if (section.to === "/implementations") {
    const place = implementations.find((entry) => p === `/implementations/${entry.slug}`);
    return [...trail, { label: current ?? place?.name ?? "" }].filter((crumb) => crumb.label);
  }
  return [...trail, { label: current ?? "" }].filter((crumb) => crumb.label);
}
