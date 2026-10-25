import { describe, expect, it } from 'vitest';
import { formatSize, withReleases } from '../../src/lib/products';
import type { Product, Releases } from '../../src/lib/schema';

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
