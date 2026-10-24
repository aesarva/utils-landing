import { describe, expect, it } from 'vitest';
import { readProducts } from '../../scripts/load-products';
import { productSchema, releaseSchema } from '../../src/lib/schema';

const valid = {
  id: 'ochre',
  name: 'Ochre',
  order: 1,
  repo: 'aesarva/ochre',
  dmg: 'Ochre',
  license: 'MIT',
  requires: { macos: '26', arch: 'universal' },
  icon: 'icon.png',
  tagline: { ru: 'Текст', en: 'Text' },
};

describe('productSchema', () => {
  const products = readProducts(process.cwd());

  it('есть хотя бы одна запись продукта', () => {
    expect(products.length).toBeGreaterThanOrEqual(1);
  });

  // Сколько бы продуктов ни было: каждая запись проходит схему (новый продукт не ломает тест).
  for (const entry of products) {
    it(`принимает запись ${entry.path.split('/').pop()}`, () => {
      expect(productSchema.safeParse(entry.data).success).toBe(true);
    });
  }

  // Точечные проверки фактов из Global Constraints: лицензии продуктов.
  it.each([
    ['ochre', 'MIT'],
    ['lidless', 'GPL-3.0'],
    ['subus', 'GPL-3.0'],
  ])('%s: лицензия %s', (id, license) => {
    const entry = products.find((p) => p.path.endsWith(`/${id}.yaml`));
    expect((entry?.data as { license?: string } | undefined)?.license).toBe(license);
  });

  it('принимает эталонную запись', () => {
    expect(productSchema.safeParse(valid).success).toBe(true);
  });

  it.each(['Ochre', 'my app', '-x'])('отвергает id %j', (id) => {
    expect(productSchema.safeParse({ ...valid, id }).success).toBe(false);
  });

  it.each(['en', 'hub', 'fonts'])('отвергает зарезервированный id %j с понятным сообщением', (id) => {
    const r = productSchema.safeParse({ ...valid, id });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toContain('зарезервирован');
  });

  it('отвергает tagline без en', () => {
    expect(productSchema.safeParse({ ...valid, tagline: { ru: 'Текст' } }).success).toBe(false);
  });

  it('отвергает requires.macos: "14.0"', () => {
    const requires = { ...valid.requires, macos: '14.0' };
    expect(productSchema.safeParse({ ...valid, requires }).success).toBe(false);
  });

  it('отвергает repo без владельца', () => {
    expect(productSchema.safeParse({ ...valid, repo: 'ochre' }).success).toBe(false);
  });
});

describe('releaseSchema', () => {
  it('принимает soon', () => {
    expect(releaseSchema.safeParse({ status: 'soon' }).success).toBe(true);
  });

  it('принимает released', () => {
    const r = { status: 'released', version: '1.0.0', url: 'https://x.test/a.dmg', size: 10, publishedAt: '2026-01-01' };
    expect(releaseSchema.safeParse(r).success).toBe(true);
  });

  it('отвергает released без url', () => {
    const r = { status: 'released', version: '1.0.0', size: 10, publishedAt: '2026-01-01' };
    expect(releaseSchema.safeParse(r).success).toBe(false);
  });

  it('отвергает version: "v1.0.0"', () => {
    const r = { status: 'released', version: 'v1.0.0', url: 'https://x.test/a.dmg', size: 10, publishedAt: '2026-01-01' };
    expect(releaseSchema.safeParse(r).success).toBe(false);
  });
});
