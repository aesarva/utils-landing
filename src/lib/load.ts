// Загрузка продуктов с релизами: коллекция + снимок releases.json.
import { getCollection } from 'astro:content';
import snapshot from '../data/releases.json';
import { releasesFileSchema } from './schema';
import { withReleases, type ProductView } from './products';

export async function loadProducts(): Promise<ProductView[]> {
  const entries = await getCollection('products');
  return withReleases(
    entries.map((e) => e.data),
    releasesFileSchema.parse(snapshot),
  );
}
