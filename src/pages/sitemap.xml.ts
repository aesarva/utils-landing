// sitemap.xml: все страницы с hreflang-альтернативами.
import { getCollection } from 'astro:content';
import { alternates, pagePath } from '../lib/routes';
import { SITE } from '../lib/site';
import { LANGS } from '../lib/schema';

export async function GET() {
  // Продукт со скрытым релизом (hold) в карту сайта не попадает: ссылок на него на сайте нет.
  const ids = (await getCollection('products')).filter((e) => !e.data.hold).map((e) => e.data.id);
  const keys: (string | undefined)[] = [undefined, ...ids];
  const urls = keys.flatMap((id) =>
    LANGS.map((lang) => {
      const links = alternates(id)
        .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`)
        .join('\n');
      return `  <url>\n    <loc>${SITE}${pagePath(lang, id)}</loc>\n${links}\n  </url>`;
    }),
  );
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    `${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
