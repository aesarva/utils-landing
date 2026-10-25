import { describe, expect, it } from 'vitest';
import { catalogNumber, formatReleaseDate, formatSize, newestReleaseId, withReleases, type ProductView } from '../../src/lib/products';
import type { Product, Release, Releases } from '../../src/lib/schema';

const mk = (id: string, order: number): Product => ({
  id,
  name: id,
  order,
  repo: `aesarva/${id}`,
  dmg: id,
  license: 'MIT',
  requires: { macos: '14', arch: 'universal' },
  icon: `${id}.png`,
  tagline: { ru: 'р', en: 'e' },
  facts: [],
}) as Product;

describe('withReleases', () => {
  const released = {
    status: 'released',
    version: '1.2.3',
    url: 'https://example.com/a-1.2.3.dmg',
    size: 1234,
    publishedAt: '2026-01-01T00:00:00Z',
  } as const;
  const releases: Releases = { a: released, b: { status: 'soon' } };
  it('сортирует по order и отдаёт каждому его релиз', () => {
    const r = withReleases([mk('b', 2), mk('a', 1)], releases);
    expect(r.map((p) => p.id)).toEqual(['a', 'b']);
    expect(r[0].release).toEqual(released);
    expect(r[1].release).toEqual({ status: 'soon' });
  });
  it('бросает при отсутствии записи релиза', () => {
    expect(() => withReleases([mk('zzz', 1)], releases)).toThrow('нет записи релиза для zzz');
  });
  it('не берёт унаследованные свойства (id constructor)', () => {
    expect(() => withReleases([mk('constructor', 1)], {})).toThrow(
      'нет записи релиза для constructor',
    );
  });
});

describe('formatSize', () => {
  it('целые без дробной части', () => {
    expect(formatSize(7_340_032, 'ru')).toBe('7 МБ');
  });
  it('одна цифра после запятой/точки', () => {
    expect(formatSize(7_444_889, 'en')).toBe('7.1 MB');
    expect(formatSize(7_444_889, 'ru')).toBe('7,1 МБ');
  });
  it('undefined → пустая строка', () => {
    expect(formatSize(undefined, 'en')).toBe('');
  });
});

describe('каталог хаба', () => {
  it('catalogNumber даёт CT и две цифры', () => {
    expect(catalogNumber(1)).toBe('CT 01');
    expect(catalogNumber(12)).toBe('CT 12');
  });

  it('formatReleaseDate пишет день, короткий месяц и год в UTC', () => {
    expect(formatReleaseDate('2026-10-25T11:59:43Z', 'en')).toBe('25 Oct 2026');
    expect(formatReleaseDate('2026-10-25T11:59:43Z', 'ru')).toBe('25 окт 2026');
    expect(formatReleaseDate('2026-03-01T00:30:00Z', 'ru')).toBe('1 мар 2026');
  });

  it('newestReleaseId выбирает самый поздний вышедший релиз и игнорирует soon', () => {
    const view = (id: string, release: Release) => ({ id, release }) as ProductView;
    const rel = (publishedAt: string): Release => ({ status: 'released', version: '1.0.0', url: 'https://x', size: 1, publishedAt });
    expect(
      newestReleaseId([view('a', rel('2026-10-23T10:00:00Z')), view('b', rel('2026-10-25T10:00:00Z')), view('c', { status: 'soon' })]),
    ).toBe('b');
    expect(newestReleaseId([view('c', { status: 'soon' })])).toBeUndefined();
  });
});
