import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readSnapshot } from '../../scripts/read-snapshot';
import { mergeReleases, parseLatestRelease, serializeReleases } from '../../src/lib/releases';
import type { Releases } from '../../src/lib/schema';

const fx = (n: string): unknown =>
  JSON.parse(readFileSync(new URL(`./fixtures/github/${n}.json`, import.meta.url), 'utf8'));
const ochre = { repo: 'aesarva/ochre', dmg: 'Ochre' };
const lidless = { repo: 'aesarva/lidless', dmg: 'Lidless' };

describe('parseLatestRelease', () => {
  it('релиз Ochre → released', () => {
    const body = fx('ochre-latest') as { tag_name: string };
    const r = parseLatestRelease(ochre, { status: 200, body });
    expect(r.kind).toBe('ok');
    if (r.kind !== 'ok' || r.release.status !== 'released') throw new Error('ожидался released');
    const version = body.tag_name.replace(/^v/, '');
    expect(r.release.version).toBe(version);
    expect(r.release.url.endsWith(`/Ochre-${version}.dmg`)).toBe(true);
    expect(r.release.size).toBeGreaterThan(0);
  });

  it('404 → soon', () => {
    expect(parseLatestRelease(ochre, { status: 404, body: {} })).toEqual({
      kind: 'ok',
      release: { status: 'soon' },
    });
  });

  it.each(['no-asset', 'mismatch', 'bad-tag'])('%s → error', (n) => {
    expect(parseLatestRelease(ochre, { status: 200, body: fx(n) }).kind).toBe('error');
  });

  it('403 и мусор → error', () => {
    expect(parseLatestRelease(ochre, { status: 403, body: {} }).kind).toBe('error');
    expect(parseLatestRelease(ochre, { status: 200, body: 'garbage' }).kind).toBe('error');
  });

  it('соседние ассеты (appcast.xml, Lidless.dmg) не мешают', () => {
    const body = fx('lidless-latest') as { assets: unknown[] };
    body.assets.unshift(
      { name: 'appcast.xml', size: 10, browser_download_url: 'https://x/appcast.xml' },
      { name: 'Lidless.dmg', size: 20, browser_download_url: 'https://x/Lidless.dmg' },
    );
    const r = parseLatestRelease(lidless, { status: 200, body });
    if (r.kind !== 'ok' || r.release.status !== 'released') throw new Error('ожидался released');
    expect(r.release.url.endsWith('/Lidless-0.3.0.dmg')).toBe(true);
    expect(r.release.size).toBeGreaterThan(20);
  });

  it('url ассета не из репозитория продукта (репо переименован) → error, снимок остаётся', () => {
    const body = fx('lidless-latest');
    const r = parseLatestRelease({ repo: 'aesarva/renamed', dmg: 'Lidless' }, { status: 200, body });
    expect(r.kind).toBe('error');
    if (r.kind === 'error') expect(r.message).toContain('https://github.com/aesarva/renamed/releases/download/');
  });

  it('url ассета с префиксом репозитория-однофамильца → error', () => {
    const body = fx('lidless-latest') as { assets: { name: string; browser_download_url: string }[] };
    const asset = body.assets.find((a) => a.name === 'Lidless-0.3.0.dmg')!;
    asset.browser_download_url = 'https://github.com/aesarva/lidless-fork/releases/download/v0.3.0/Lidless-0.3.0.dmg';
    expect(parseLatestRelease(lidless, { status: 200, body }).kind).toBe('error');
  });

  it('draft и prerelease → error', () => {
    const base = fx('ochre-latest') as object;
    expect(parseLatestRelease(ochre, { status: 200, body: { ...base, draft: true } }).kind).toBe('error');
    expect(parseLatestRelease(ochre, { status: 200, body: { ...base, prerelease: true } }).kind).toBe('error');
  });
});

describe('mergeReleases', () => {
  const old = { status: 'released', version: '1.0.0', url: 'https://x/a.dmg', size: 1, publishedAt: 'x' } as const;

  it('error с записью в снимке: остаётся снимок и предупреждение', () => {
    const { releases, warnings } = mergeReleases(['a'], { a: old }, { a: { kind: 'error', message: 'boom' } });
    expect(releases).toEqual({ a: old });
    expect(warnings).toHaveLength(1);
  });

  it('error без записи → soon и предупреждение', () => {
    const { releases, warnings } = mergeReleases(['a'], {}, { a: { kind: 'error', message: 'boom' } });
    expect(releases).toEqual({ a: { status: 'soon' } });
    expect(warnings).toHaveLength(1);
  });

  it('id constructor: унаследованные свойства снимка и результатов не берутся', () => {
    const error = { kind: 'error', message: 'boom' } as const;
    expect(mergeReleases(['constructor'], {}, { constructor: error }).releases).toEqual({ constructor: { status: 'soon' } });
    const { releases, warnings } = mergeReleases(['constructor', 'toString'], {}, {});
    expect(releases).toEqual({ constructor: { status: 'soon' }, toString: { status: 'soon' } });
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toContain('нет результата запроса');
  });

  it('ok заменяет запись; лишние id выпадают; ключи отсортированы', () => {
    const { releases, warnings } = mergeReleases(
      ['b', 'a'],
      { a: old, gone: old },
      { a: { kind: 'ok', release: { status: 'soon' } }, b: { kind: 'ok', release: old } },
    );
    expect(Object.keys(releases)).toEqual(['a', 'b']);
    expect(releases.a).toEqual({ status: 'soon' });
    expect(warnings).toEqual([]);
  });
});

describe('serializeReleases', () => {
  const rel = { status: 'released', version: '1.0.0', url: 'https://x/A-1.0.0.dmg', size: 5, publishedAt: 'T' } as const;

  it('стабилен при разном порядке ключей', () => {
    const a: Releases = { a: rel, b: { status: 'soon' } };
    const b = { b: { status: 'soon' }, a: { url: rel.url, version: rel.version, status: rel.status, size: 5, publishedAt: 'T' } } as Releases;
    expect(serializeReleases(a)).toBe(serializeReleases(b));
  });

  it('точный формат: отступ 2, ключи отсортированы, перевод строки в конце', () => {
    const input: Releases = { b: { status: 'soon' }, a: rel };
    const expected = `{
  "a": {
    "publishedAt": "T",
    "size": 5,
    "status": "released",
    "url": "https://x/A-1.0.0.dmg",
    "version": "1.0.0"
  },
  "b": {
    "status": "soon"
  }
}
`;
    const out = serializeReleases(input);
    expect(out).toBe(expected);
    expect(JSON.parse(out)).toEqual(input);
  });
});

describe('readSnapshot', () => {
  const dir = mkdtempSync(join(tmpdir(), 'snap-'));

  it('отсутствующий файл → предупреждение', () => {
    const r = readSnapshot(join(dir, 'нет.json'));
    expect(r.releases).toEqual({});
    expect(r.warning).toMatch(/отсутствует/);
  });

  it('битый файл → предупреждение', () => {
    const p = join(dir, 'bad.json');
    writeFileSync(p, '{oops');
    expect(readSnapshot(p).warning).toMatch(/не читается/);
  });

  it('валидный файл → без предупреждения', () => {
    const p = join(dir, 'ok.json');
    writeFileSync(p, '{"a":{"status":"soon"}}');
    expect(readSnapshot(p)).toEqual({ releases: { a: { status: 'soon' } } });
  });
});
