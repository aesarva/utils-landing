// Обновляет src/data/releases.json из GitHub API. Всегда выходит с кодом 0:
// при любой ошибке остаётся снимок, сборка не должна падать из-за GitHub.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeReleases, parseLatestRelease, serializeReleases, type FetchOutcome } from '../src/lib/releases';
import { productSchema, releasesFileSchema, type Releases } from '../src/lib/schema';
import { readProducts } from './load-products';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, 'src/data/releases.json');

function readSnapshot(): Releases {
  if (!existsSync(file)) return {};
  const parsed = releasesFileSchema.safeParse(JSON.parse(readFileSync(file, 'utf8')));
  if (!parsed.success) throw new Error(`снимок releases.json не читается: ${parsed.error.message}`);
  return parsed.data;
}

async function fetchOutcome(product: { repo: string; dmg: string }): Promise<FetchOutcome> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'utils-landing',
    };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com/repos/${product.repo}/releases/latest`, {
      headers,
      signal: AbortSignal.timeout(10_000),
    });
    const body: unknown = await res.json().catch(() => null);
    return parseLatestRelease(product, { status: res.status, body });
  } catch (e) {
    return { kind: 'error', message: `${product.repo}: ${e instanceof Error ? e.message : String(e)}` };
  }
}

async function main(): Promise<void> {
  const snapshot = readSnapshot();
  if (process.env.RELEASES_OFFLINE === '1') {
    console.log('RELEASES_OFFLINE=1: запросы пропущены, снимок читается');
    return;
  }
  const products = readProducts(root).map((p) => productSchema.parse(p.data));
  const outcomes: Record<string, FetchOutcome> = {};
  await Promise.all(
    products.map(async (p) => {
      outcomes[p.id] = await fetchOutcome(p);
    }),
  );
  const { releases, warnings } = mergeReleases(
    products.map((p) => p.id),
    snapshot,
    outcomes,
  );
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, serializeReleases(releases));
  for (const w of warnings) console.error(`предупреждение: ${w}`);
}

main().catch((e) => {
  console.error(`предупреждение: ${e instanceof Error ? e.message : String(e)}`);
});
