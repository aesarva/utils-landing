// Чтение записей продуктов для скриптов и тестов (без Astro).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

/** Все `src/content/products/*.yaml` проекта `root`, по имени файла. */
export function readProducts(root: string): { path: string; data: unknown }[] {
  const dir = join(root, 'src/content/products');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .sort()
    .map((f) => {
      const path = join(dir, f);
      return { path, data: parse(readFileSync(path, 'utf8')) as unknown };
    });
}
