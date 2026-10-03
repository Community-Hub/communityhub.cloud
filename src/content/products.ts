/** Product overview: the products first, then how the platform works. */
import type { SiteContext } from "../lib/site";
import { originalStory } from "./original-story";

export function register(H: SiteContext): void {
  const groups = ["Engage", "Educate", "Motivate and empower"] as const;
  const card = (slug: string): string => {
    const p = H.PBY[slug];
    return `<li><a href="${slug}.html"><img src="assets/${p.icon}" alt="" width="44" height="44"><span><b>${p.name}</b><small>${p.short}</small></span></a></li>`;
  };
  const column = (title: string): string => {
    const slugs = H.PRODUCTS.filter((p) => p["group"] === title).map((p) => p["slug"]);
    return `<div class="product-category" data-story-scene><h2>${title}</h2><ul>${slugs.map(card).join("")}</ul></div>`;
  };
  const products = `<section class="product-directory" id="groups" aria-labelledby="prods-h"><div class="wrap">
    ${H.crumbs([null, "Products"] as const)}<h1 class="h1" id="prods-h">Products and Services</h1><p class="lede">Choose a product to see how it works.</p>
    <div class="product-directory-grid">${groups.map(column).join("")}</div>
    <a class="product-how-link" href="#how">Story of Dashboard ${H.ARR}</a>
  </div></section>`;
  const hub = originalStory();
  const body = products + hub + H.cta_band("Contact Us", "");
  H.write_page(
    "products",
    H.page(
      "products",
      "Products",
      "The products behind Community Hub, how data flows through the platform, and how they work together.",
      body,
      { current: "products", jsonld: H.ORG_LD },
    ),
  );
}
