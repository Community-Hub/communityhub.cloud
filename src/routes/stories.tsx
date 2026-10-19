import { createFileRoute } from "@tanstack/react-router";
import { ProductPager } from "@/components/product-pager";
import { productPages } from "@/lib/product-pages";

export const Route = createFileRoute("/stories")({
  component: function Stories() {
    return <ProductPager slides={productPages.stories.slides} page="/stories" />;
  },
  head: () => ({ meta: [{ title: productPages.stories.title }] }),
});
