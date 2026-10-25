// robots.txt: при выключенной индексации закрываем сайт целиком.
import { INDEXABLE, SITE } from '../lib/site';

export function GET() {
  const body = INDEXABLE
    ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
