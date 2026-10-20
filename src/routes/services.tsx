import { createFileRoute } from "@tanstack/react-router";
import { ProductPager } from "@/components/product-pager";
import { productPages } from "@/lib/product-pages";

export const Route = createFileRoute("/services")({
  component: () => <ProductPager slides={productPages.services.slides} page="/services" />,
  head: () => ({ meta: [{ title: productPages.services.title }] }),
});
