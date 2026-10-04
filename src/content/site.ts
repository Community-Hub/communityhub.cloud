import { createSite } from '../lib/site';
import { register as home } from './home';
import { register as people } from './people';
import { register as products } from './products';
import { register as resources } from './resources';
import { register as productsA } from './products-a';
import { register as productsB } from './products-b';
import { register as directories } from './directories';

const context = createSite();
for (const register of [home, people, products, resources, productsA, productsB, directories]) register(context);
export const pages = [...context.pages.values()];
if (pages.length !== 35) throw new Error(`Expected 35 content pages, received ${pages.length}`);
export function getPage(slug: string) {
  const page = context.pages.get(slug);
  if (!page) throw new Error(`Unknown page ${slug}`);
  return page;
}
