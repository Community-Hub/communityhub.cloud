import { createFileRoute } from "@tanstack/react-router";
import { ProductPager } from "@/components/product-pager";
import { productPages } from "@/lib/product-pages";

export const Route = createFileRoute("/community-calendar")({
  component: function CommunityCalendar() {
    return <ProductPager slides={productPages.calendar.slides} page="/community-calendar" />;
  },
  head: () => ({ meta: [{ title: productPages.calendar.title }] }),
});
