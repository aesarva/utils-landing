import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
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
    body.assets.push({ name: 'appcast.xml', size: 10, browser_download_url: 'https://x/appcast.xml' });
    const r = parseLatestRelease(lidless, { status: 200, body });
    expect(r.kind === 'ok' && r.release.status === 'released' && r.release.version).toBe('0.3.0');
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
  it('стабилен при разном порядке ключей', () => {
    const a: Releases = { a: { status: 'soon' }, b: { status: 'soon' } };
    const b: Releases = { b: { status: 'soon' }, a: { status: 'soon' } };
    expect(serializeReleases(a)).toBe(serializeReleases(b));
    expect(serializeReleases(a).endsWith('}\n')).toBe(true);
  });
});
