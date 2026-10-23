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
  const releases: Releases = { a: { status: 'soon' }, b: { status: 'soon' } };
  it('сортирует по order', () => {
    const r = withReleases([mk('b', 2), mk('a', 1)], releases);
    expect(r.map((p) => p.id)).toEqual(['a', 'b']);
    expect(r[0].release.status).toBe('soon');
  });
  it('бросает при отсутствии записи релиза', () => {
    expect(() => withReleases([mk('zzz', 1)], releases)).toThrow('нет записи релиза для zzz');
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
