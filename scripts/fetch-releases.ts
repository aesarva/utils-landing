// Обновляет src/data/releases.json из GitHub API. Всегда выходит с кодом 0:
// при любой ошибке остаётся снимок, сборка не должна падать из-за GitHub.
// RELEASES_OFFLINE=1: запросов нет, но снимок всё равно сводится к списку продуктов —
// новый продукт без записи получает soon, и офлайн-сборка проходит валидатор.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeReleases, parseLatestRelease, serializeReleases, type FetchOutcome } from '../src/lib/releases';
import { productSchema, type Releases } from '../src/lib/schema';
import { readProducts } from './load-products';
import { readSnapshot } from './read-snapshot';

export interface RunOptions {
  /** Корень проекта: из него читаются продукты и пишется src/data/releases.json. */
  root: string;
  offline: boolean;
  /** Подменяется в тестах; по умолчанию глобальный fetch. */
  fetchImpl?: typeof fetch;
  token?: string;
  /** Куда печатать предупреждения и сообщения; по умолчанию stderr/stdout. */
  warn?: (line: string) => void;
  log?: (line: string) => void;
}

async function fetchOutcome(
  product: { repo: string; dmg: string },
  fetchImpl: typeof fetch,
  token: string | undefined,
): Promise<FetchOutcome> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'utils-landing',
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetchImpl(`https://api.github.com/repos/${product.repo}/releases/latest`, {
      headers,
      signal: AbortSignal.timeout(10_000),
    });
    const body: unknown = await res.json().catch(() => null);
    return parseLatestRelease(product, { status: res.status, body });
  } catch (e) {
    return { kind: 'error', message: `${product.repo}: ${e instanceof Error ? e.message : String(e)}` };
  }
}

/** Один прогон: читает снимок и продукты, сводит релизы, пишет файл только при изменении. */
export async function run(opts: RunOptions): Promise<{ written: boolean; warnings: string[] }> {
  const warn = opts.warn ?? ((line: string) => console.error(`предупреждение: ${line}`));
  const log = opts.log ?? ((line: string) => console.log(line));
  const file = join(opts.root, 'src/data/releases.json');

  const { releases: snapshot, warning } = readSnapshot(file);
  const warnings: string[] = warning ? [warning] : [];
  const products = readProducts(opts.root).map((p) => productSchema.parse(p.data));
  const ids = products.map((p) => p.id);

  let releases: Releases;
  if (opts.offline) {
    log('RELEASES_OFFLINE=1: запросы пропущены, снимок сводится к списку продуктов');
    ({ releases } = mergeReleases(ids, snapshot, {}));
    for (const id of ids) {
      if (!Object.hasOwn(snapshot, id)) warnings.push(`офлайн: «${id}» нет в снимке, записан soon`);
    }
  } else {
    const fetchImpl = opts.fetchImpl ?? fetch;
    const outcomes: Record<string, FetchOutcome> = {};
    await Promise.all(
      products
        .filter((p) => !p.hold)
        .map(async (p) => {
          outcomes[p.id] = await fetchOutcome(p, fetchImpl, opts.token);
        }),
    );
    for (const p of products) if (p.hold) outcomes[p.id] = { kind: 'ok', release: { status: 'soon' } };
    const merged = mergeReleases(ids, snapshot, outcomes);
    releases = merged.releases;
    warnings.push(...merged.warnings);
  }

  // hold: релиз скрыт и офлайн — запись из снимка не должна показать ссылку на скачивание.
  for (const p of products) if (p.hold) releases[p.id] = { status: 'soon' };

  // Файл переписывается, только если содержимое изменилось: офлайн-сборка не трогает git-дерево зря.
  const text = serializeReleases(releases);
  const before = existsSync(file) ? readFileSync(file, 'utf8') : undefined;
  const written = before !== text;
  if (written) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, text);
  }
  for (const w of warnings) warn(w);
  return { written, warnings };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // Корень можно передать аргументом (как у validate.ts): `tsx scripts/fetch-releases.ts [корень]`.
  const root = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), '..');
  await run({
    root,
    offline: process.env.RELEASES_OFFLINE === '1',
    token: process.env.GITHUB_TOKEN,
  }).catch((e: unknown) => {
    console.error(`предупреждение: ${e instanceof Error ? e.message : String(e)}`);
  });
}
