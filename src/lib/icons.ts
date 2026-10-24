// Иконки продуктов из src/assets/products/<id>/icon.png (обрабатываются astro:assets).
import type { ImageMetadata } from 'astro';

const icons = import.meta.glob<{ default: ImageMetadata }>('../assets/products/*/icon.png', { eager: true });

export function productIcon(id: string): ImageMetadata {
  const mod = icons[`../assets/products/${id}/icon.png`];
  if (!mod) throw new Error(`нет иконки продукта ${id}`);
  return mod.default;
}
