import { createFileRoute } from "@tanstack/react-router";
import { ProductPager } from "@/components/product-pager";
import { productPages } from "@/lib/product-pages";

export const Route = createFileRoute("/dashboard-builder")({
  component: function BuildingDashboard() {
    return <ProductPager slides={productPages.building.slides} page="/dashboard-builder" />;
  },
  head: () => ({ meta: [{ title: productPages.building.title }] }),
});
