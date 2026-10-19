import { createFileRoute } from "@tanstack/react-router";
import { ProductPager } from "@/components/product-pager";
import { productPages } from "@/lib/product-pages";

export const Route = createFileRoute("/citywide-dashboard")({
  component: function CitywideDashboard() {
    return <ProductPager slides={productPages.city.slides} page="/citywide-dashboard" />;
  },
  head: () => ({ meta: [{ title: productPages.city.title }] }),
});
