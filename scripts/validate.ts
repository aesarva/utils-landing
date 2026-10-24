// Проверка сайта перед сборкой: `tsx scripts/validate.ts [корень]`.
// Печатает каждую ошибку отдельной строкой и завершается с кодом 1, если они есть.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { en } from '../src/i18n/en';
import { ru } from '../src/i18n/ru';
import { validateSite } from '../src/lib/validate';
import { readProducts } from './load-products';

const root = process.argv[2] ?? process.cwd();
const worldsDir = join(root, 'src/worlds');

/** Ключи объекта `worlds = { … }` из registry.ts. */
function registryIds(): string[] {
  const text = readFileSync(join(worldsDir, 'registry.ts'), 'utf8');
  const body = /worlds[^=]*=\s*\{([^}]*)\}/.exec(text)?.[1] ?? '';
  return body
    .split(',')
    .map((key) => key.split(':')[0].trim())
    .filter(Boolean);
}

/** Склеенный текст всех .astro и .css внутри папки мира. */
function readStyles(dir: string): string {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((f) => /\.(astro|css)$/.test(f))
    .map((f) => readFileSync(join(dir, f), 'utf8'))
    .join('\n');
}

const worldDirs = readdirSync(worldsDir).filter((f) => statSync(join(worldsDir, f)).isDirectory());
const worldStyles: Record<string, string> = {};
for (const dir of worldDirs) worldStyles[dir] = readStyles(join(worldsDir, dir));
// Хаб лежит в папке hub, ключ тот же.

const errors = validateSite({
  products: readProducts(root).map((p) => ({ ...p, path: relative(root, p.path) })),
  releases: JSON.parse(readFileSync(join(root, 'src/data/releases.json'), 'utf8')) as unknown,
  registryIds: registryIds(),
  worldDirs,
  worldStyles,
  assetExists: (id, file) => existsSync(join(root, 'src/assets/products', id, file)),
  dicts: { ru, en },
});

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  process.exit(1);
}
console.log('validate: 0 errors');
