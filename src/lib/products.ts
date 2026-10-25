// Представление продукта: запись продукта + его релиз.
import type { Lang, Product, Release, Releases } from './schema';

export type ProductView = Product & { release: Release };

/** Склеивает продукты с релизами и сортирует по `order`. */
export function withReleases(products: Product[], releases: Releases): ProductView[] {
  return [...products]
    .sort((a, b) => a.order - b.order)
    .map((p) => {
      // hasOwn: чтобы id вроде `constructor` не находил унаследованные свойства
      if (!Object.hasOwn(releases, p.id)) throw new Error(`нет записи релиза для ${p.id}`);
      return { ...p, release: releases[p.id] };
    });
}

/** Размер в МБ (1 МБ = 1 048 576 байт), одна цифра, целые без «,0». */
export function formatSize(bytes: number | undefined, lang: Lang): string {
  if (bytes === undefined) return '';
  const mb = Math.round((bytes / 1_048_576) * 10) / 10;
  const num = String(mb);
  return lang === 'ru' ? `${num.replace('.', ',')} МБ` : `${num} MB`;
}

/** Номер каталога лейбла: CT и порядковый номер двумя цифрами. */
export function catalogNumber(order: number): string {
  return `CT ${String(order).padStart(2, '0')}`;
}

const MONTHS: Record<Lang, string[]> = {
  ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/** Дата релиза в UTC: «25 окт 2026» / «25 Oct 2026». */
export function formatReleaseDate(iso: string, lang: Lang): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[lang][d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** id самого позднего вышедшего релиза; undefined, если вышедших нет. */
export function newestReleaseId(products: ProductView[]): string | undefined {
  let best: { id: string; at: string } | undefined;
  for (const p of products) {
    if (p.release.status !== 'released') continue;
    if (!best || p.release.publishedAt > best.at) best = { id: p.id, at: p.release.publishedAt };
  }
  return best?.id;
}
