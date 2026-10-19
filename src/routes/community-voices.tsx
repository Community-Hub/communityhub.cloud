import { createFileRoute } from "@tanstack/react-router";
import { ProductPager } from "@/components/product-pager";
import { productPages } from "@/lib/product-pages";

export const Route = createFileRoute("/community-voices")({
  component: function CommunityVoices() {
    return <ProductPager slides={productPages.voices.slides} page="/community-voices" />;
  },
  head: () => ({ meta: [{ title: productPages.voices.title }] }),
});
