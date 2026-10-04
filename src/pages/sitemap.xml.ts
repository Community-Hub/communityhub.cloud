import type { APIRoute } from 'astro';
import { pages } from '../content/site';

export const GET: APIRoute = () => new Response(
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
  pages.map(page => page.canonical).sort().map(url => `<url><loc>${url}</loc></url>`).join('') + '</urlset>\n',
  { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
);
