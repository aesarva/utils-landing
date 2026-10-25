// Иконки продуктов: файл из поля `icon` записи, src/assets/products/<id>/<icon> (обрабатывается astro:assets).
// Глоб охватывает все картинки продуктов, поэтому их оригиналы попадают в сборку (их всё равно используют миры).
import type { ImageMetadata } from 'astro';
import type { Product } from './schema';

const images = import.meta.glob<ImageMetadata>('../assets/products/*/*.{png,jpg,jpeg,webp,avif,gif,svg}', {
  import: 'default',
  eager: true,
});

export function productIcon(product: Pick<Product, 'id' | 'icon'>): ImageMetadata {
  const key = `../assets/products/${product.id}/${product.icon}`;
  if (!Object.hasOwn(images, key)) {
    throw new Error(`нет иконки продукта ${product.id}: src/assets/products/${product.id}/${product.icon}`);
  }
  return images[key];
}
