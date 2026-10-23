// Представление продукта: запись продукта + его релиз.
import type { Lang, Product, Release, Releases } from './schema';

export type ProductView = Product & { release: Release };

/** Склеивает продукты с релизами и сортирует по `order`. */
export function withReleases(products: Product[], releases: Releases): ProductView[] {
  return [...products]
    .sort((a, b) => a.order - b.order)
    .map((p) => {
      const release = releases[p.id];
      if (!release) throw new Error(`нет записи релиза для ${p.id}`);
      return { ...p, release };
    });
}

/** Размер в МБ (1 МБ = 1 048 576 байт), одна цифра, целые без «,0». */
export function formatSize(bytes: number | undefined, lang: Lang): string {
  if (bytes === undefined) return '';
  const mb = Math.round((bytes / 1_048_576) * 10) / 10;
  const num = String(mb);
  return lang === 'ru' ? `${num.replace('.', ',')} МБ` : `${num} MB`;
}
