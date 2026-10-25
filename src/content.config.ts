import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { productSchema } from './lib/schema';

// Схемы живут в src/lib/schema.ts (без astro:*), здесь — только коллекции.
export * from './lib/schema';

const products = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/products' }),
  schema: productSchema,
});

export const collections = { products };
