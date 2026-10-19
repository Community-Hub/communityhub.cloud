import { createFileRoute } from "@tanstack/react-router";
import { ProductPager } from "@/components/product-pager";
import { productPages } from "@/lib/product-pages";

export const Route = createFileRoute("/data-hub")({
  component: function DataHub() {
    return <ProductPager slides={productPages.hub.slides} page="/data-hub" />;
  },
  head: () => ({ meta: [{ title: productPages.hub.title }] }),
});
