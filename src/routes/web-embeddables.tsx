import { createFileRoute } from "@tanstack/react-router";
import { ProductPager } from "@/components/product-pager";
import { productPages } from "@/lib/product-pages";

export const Route = createFileRoute("/web-embeddables")({
  component: function WebEmbeddables() {
    return <ProductPager slides={productPages.embed.slides} page="/web-embeddables" />;
  },
  head: () => ({ meta: [{ title: productPages.embed.title }] }),
});
