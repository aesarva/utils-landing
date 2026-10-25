// Чистые функции для релизов из GitHub API: без сети и файловой системы.
import { releaseSchema, type Product, type Release, type Releases } from './schema';

export type FetchOutcome = { kind: 'ok'; release: Release } | { kind: 'error'; message: string };

const err = (message: string): FetchOutcome => ({ kind: 'error', message });

/** Разбор ответа `releases/latest`: 404 — релиза ещё нет, остальные сбои — error. */
export function parseLatestRelease(
  product: Pick<Product, 'repo' | 'dmg'>,
  response: { status: number; body: unknown },
): FetchOutcome {
  const { repo, dmg } = product;
  if (response.status === 404) return { kind: 'ok', release: { status: 'soon' } };
  if (response.status !== 200) return err(`${repo}: GitHub ответил ${response.status}`);

  const body = response.body as Record<string, unknown> | null;
  if (typeof body !== 'object' || body === null) return err(`${repo}: ответ не объект`);
  if (body.draft === true || body.prerelease === true) return err(`${repo}: релиз draft или prerelease`);

  const tag = body.tag_name;
  const m = typeof tag === 'string' ? /^v(\d+\.\d+\.\d+)$/.exec(tag) : null;
  if (!m) return err(`${repo}: тег ${JSON.stringify(tag)} не вида vX.Y.Z`);
  const version = m[1];

  const wanted = `${dmg}-${version}.dmg`;
  const assets = Array.isArray(body.assets) ? (body.assets as Record<string, unknown>[]) : [];
  const asset = assets.find((a) => a?.name === wanted);
  if (!asset) return err(`${repo}: в релизе ${tag} нет ассета ${wanted}`);
  // Ссылка должна вести в репозиторий продукта: у переименованного или перенесённого репо она другая,
  // и валидатор отверг бы запись. Это ошибка запроса — остаётся снимок, сборка не падает.
  const prefix = `https://github.com/${repo}/releases/download/`;
  const url = asset.browser_download_url;
  if (typeof url !== 'string' || !url.startsWith(prefix)) {
    return err(`${repo}: ссылка ${JSON.stringify(url)} не начинается с ${prefix}`);
  }

  const parsed = releaseSchema.safeParse({
    status: 'released',
    version,
    url,
    size: asset.size,
    publishedAt: body.published_at,
  });
  return parsed.success ? { kind: 'ok', release: parsed.data } : err(`${repo}: ${parsed.error.message}`);
}

/** Результат ровно по `ids`; при ошибке остаётся запись снимка, а без неё — soon. */
export function mergeReleases(
  ids: string[],
  snapshot: Releases,
  outcomes: Record<string, FetchOutcome>,
): { releases: Releases; warnings: string[] } {
  const releases: Releases = {};
  const warnings: string[] = [];
  for (const id of [...ids].sort()) {
    // hasOwn: id вроде `constructor` не должен находить унаследованные свойства объектов
    const o = Object.hasOwn(outcomes, id) ? outcomes[id] : undefined;
    if (o?.kind === 'ok') {
      releases[id] = o.release;
      continue;
    }
    const kept = Object.hasOwn(snapshot, id) ? snapshot[id] : undefined;
    releases[id] = kept ?? { status: 'soon' };
    warnings.push(
      `${id}: ${o?.kind === 'error' ? o.message : 'нет результата запроса'}; ${kept ? 'оставлен снимок' : 'soon'}`,
    );
  }
  return { releases, warnings };
}

/** JSON с отступом 2, отсортированными ключами и переводом строки в конце. */
export function serializeReleases(r: Releases): string {
  const sortKeys = (v: unknown): unknown =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
          Object.entries(v)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .map(([k, x]) => [k, sortKeys(x)]),
        )
      : v;
  return JSON.stringify(sortKeys(r), null, 2) + '\n';
}
