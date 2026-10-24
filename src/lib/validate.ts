// Проверка сайта перед сборкой: чистая функция без чтения диска (диск читает scripts/validate.ts).
import { z } from 'astro/zod';
import { LANGS, productSchema, releasesFileSchema, type Lang } from './schema';

export interface SiteInput {
  products: { path: string; data: unknown }[];
  releases: unknown;
  /** Ключи `worlds` из src/worlds/registry.ts */
  registryIds: string[];
  /** Имена папок в src/worlds/ (включая hub) */
  worldDirs: string[];
  /** Склеенный текст `.astro` и `.css` мира; ключ `hub` для хаба */
  worldStyles: Record<string, string>;
  assetExists(id: string, file: string): boolean;
  dicts: Record<Lang, object>;
}

/** Русские тексты ошибок Zod: подключаются к каждому разбору отдельно, глобальные сообщения Astro не меняются. */
const ruError = z.locales.ru().localeError;

/** Ключи `worlds = { … }` из текста registry.ts: без комментариев и кавычек, с короткой записью `ochre,`. */
export function registryIds(source: string): string[] {
  const clean = stripComments(source);
  const body = /worlds[^=]*=\s*\{([^}]*)\}/.exec(clean)?.[1] ?? '';
  return body
    .split(',')
    .map((entry) => entry.split(':')[0].trim().replace(/^(['"])(.*)\1$/, '$2'))
    .filter(Boolean);
}

/** Убирает комментарии `/* *\/`, `<!-- -->` и строчные `//` (не после `:`, чтобы не задеть URL). */
export function stripComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const SHELL_VARS = ['--shell-ink', '--shell-ground', '--shell-accent', '--shell-font'];

/** Плоский список путей ключей словаря: `a`, `nested.b`. */
function flatKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    const inner = flatKeys(child, path);
    return inner.length > 0 ? inner : [path];
  });
}

const baseName = (path: string) => (path.split(/[\\/]/).pop() ?? path).replace(/\.yaml$/, '');

/** Список ошибок по-русски, каждая с путём файла. Пустой список — сайт корректен. */
export function validateSite(input: SiteInput): string[] {
  const errors: string[] = [];
  const ids: string[] = [];
  const repos = new Map<string, string>();
  const seenIds = new Set<string>();
  const seenOrders = new Set<number>();

  for (const { path, data } of input.products) {
    const parsed = productSchema.safeParse(data, { error: ruError });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path.map(String).join('.');
        errors.push(`${path}: ${field ? `${field}: ` : ''}${issue.message}`);
      }
      continue;
    }
    const product = parsed.data;
    if (product.id !== baseName(path)) {
      errors.push(`${path}: id «${product.id}» не совпадает с именем файла`);
    }
    if (seenIds.has(product.id)) errors.push(`${path}: повтор id «${product.id}»`);
    seenIds.add(product.id);
    if (seenOrders.has(product.order)) errors.push(`${path}: повтор order ${product.order}`);
    seenOrders.add(product.order);
    ids.push(product.id);
    repos.set(product.id, product.repo);

    if (!input.assetExists(product.id, product.icon)) {
      errors.push(`src/assets/products/${product.id}/${product.icon}: файл не найден (icon из ${path})`);
    }
  }

  // Снимок релизов: по записи на каждый продукт, без лишних.
  const releasesPath = 'src/data/releases.json';
  const releases = releasesFileSchema.safeParse(input.releases, { error: ruError });
  if (!releases.success) {
    for (const issue of releases.error.issues) {
      errors.push(`${releasesPath}: ${issue.path.map(String).join('.')}: ${issue.message}`);
    }
  } else {
    for (const id of ids) {
      const release = Object.hasOwn(releases.data, id) ? releases.data[id] : undefined;
      if (!release) {
        errors.push(`${releasesPath}: нет записи для «${id}»`);
      } else if (release.status === 'released') {
        const prefix = `https://github.com/${repos.get(id)}/releases/download/`;
        if (!release.url.startsWith(prefix)) {
          errors.push(`${releasesPath}: url «${id}» должен начинаться с ${prefix}`);
        }
      }
    }
    for (const id of Object.keys(releases.data)) {
      if (!seenIds.has(id)) errors.push(`${releasesPath}: лишний id «${id}»`);
    }
  }

  // Реестр миров и папки миров.
  const registryPath = 'src/worlds/registry.ts';
  for (const id of ids) {
    if (!input.registryIds.includes(id)) errors.push(`${registryPath}: нет мира для «${id}»`);
    if (!input.worldDirs.includes(id)) errors.push(`src/worlds/${id}: нет папки мира`);
  }
  for (const id of input.registryIds) {
    if (!seenIds.has(id)) errors.push(`${registryPath}: лишний id «${id}»`);
  }

  // Переменные оболочки: в каждом мире и в хабе.
  for (const key of [...ids, 'hub']) {
    const styles = Object.hasOwn(input.worldStyles, key) ? stripComments(input.worldStyles[key]) : undefined;
    if (styles === undefined) {
      // Для продукта о пропавшей папке уже сказано выше; хаб проверяем отдельно.
      if (key === 'hub') errors.push('src/worlds/hub: нет папки хаба');
      continue;
    }
    for (const name of SHELL_VARS) {
      if (!new RegExp(`${name}\\s*:`).test(styles)) errors.push(`src/worlds/${key}: нет ${name}`);
    }
  }

  // Словари: одинаковые ключи в обоих языках.
  const [first, ...rest] = LANGS;
  const base = new Set(flatKeys(input.dicts[first]));
  for (const lang of rest) {
    const other = new Set(flatKeys(input.dicts[lang]));
    for (const key of base) {
      if (!other.has(key)) errors.push(`src/i18n/${lang}.ts: нет ключа «${key}» (есть в ${first}.ts)`);
    }
    for (const key of other) {
      if (!base.has(key)) errors.push(`src/i18n/${first}.ts: нет ключа «${key}» (есть в ${lang}.ts)`);
    }
  }

  return errors;
}
