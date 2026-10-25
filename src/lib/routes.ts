// Маршруты: язык определяется только путём, без редиректов.
import type { Lang } from './schema';
import { SITE } from './site';

/** Путь страницы: `/`, `/en/`, `/ochre/`, `/en/ochre/`. */
export function pagePath(lang: Lang, productId?: string): string {
  const prefix = lang === 'en' ? '/en' : '';
  return productId ? `${prefix}/${productId}/` : `${prefix}/`;
}

export function otherLang(lang: Lang): Lang {
  return lang === 'ru' ? 'en' : 'ru';
}

/** hreflang-альтернативы с абсолютными URL; x-default — русская версия. */
export function alternates(
  productId?: string,
): { hreflang: 'ru' | 'en' | 'x-default'; href: string }[] {
  const abs = (lang: Lang) => `${SITE}${pagePath(lang, productId)}`;
  return [
    { hreflang: 'ru', href: abs('ru') },
    { hreflang: 'en', href: abs('en') },
    { hreflang: 'x-default', href: abs('ru') },
  ];
}
