import { describe, expect, it } from 'vitest';
import { validateSite, type SiteInput } from '../../src/lib/validate';

const product = (id: string, order: number, over: Record<string, unknown> = {}) => ({
  path: `src/content/products/${id}.yaml`,
  data: {
    id,
    name: id,
    order,
    repo: `aesarva/${id}`,
    dmg: id,
    license: 'MIT',
    requires: { macos: '26', arch: 'universal' },
    icon: 'icon.png',
    tagline: { ru: 'Текст', en: 'Text' },
    ...over,
  },
});

const released = (id: string) => ({
  status: 'released',
  version: '1.0.0',
  url: `https://github.com/aesarva/${id}/releases/download/v1.0.0/${id}-1.0.0.dmg`,
  size: 1,
  publishedAt: '2026-01-01T00:00:00Z',
});

const styles = '--shell-ink: #000; --shell-ground: #fff; --shell-accent: #00f; --shell-font: serif;';

/** Корректный вход: два продукта, миры, хаб, словари. */
function base(): SiteInput {
  return {
    products: [product('aa', 1), product('bb', 2)],
    releases: { aa: released('aa'), bb: { status: 'soon' } },
    registryIds: ['aa', 'bb'],
    worldDirs: ['aa', 'bb'],
    worldStyles: { aa: styles, bb: styles, hub: styles },
    assetExists: () => true,
    dicts: { ru: { a: 'x', nested: { b: 'y' } }, en: { a: 'x', nested: { b: 'y' } } },
  };
}

const has = (errors: string[], part: string) => errors.some((e) => e.includes(part));

describe('validateSite', () => {
  it('корректный вход даёт пустой список', () => {
    expect(validateSite(base())).toEqual([]);
  });

  it('запись не по схеме', () => {
    const input = base();
    input.products[0] = product('aa', 1, { repo: 'плохо' });
    const errors = validateSite(input);
    expect(has(errors, 'src/content/products/aa.yaml')).toBe(true);
    expect(has(errors, 'repo')).toBe(true);
  });

  it('id не совпадает с именем файла', () => {
    const input = base();
    input.products[0] = { ...product('aa', 1), path: 'src/content/products/zz.yaml' };
    expect(has(validateSite(input), 'src/content/products/zz.yaml: id «aa» не совпадает с именем файла')).toBe(true);
  });

  it('повтор id', () => {
    const input = base();
    input.products[1] = { ...product('aa', 2), path: 'src/content/products/bb.yaml' };
    expect(has(validateSite(input), 'повтор id «aa»')).toBe(true);
  });

  it('повтор order', () => {
    const input = base();
    input.products[1] = product('bb', 1);
    expect(has(validateSite(input), 'повтор order 1')).toBe(true);
  });

  it('нет записи в releases', () => {
    const input = base();
    input.releases = { aa: released('aa') };
    expect(has(validateSite(input), 'src/data/releases.json: нет записи для «bb»')).toBe(true);
  });

  it('лишний id в releases', () => {
    const input = base();
    input.releases = { ...(input.releases as object), cc: { status: 'soon' } };
    expect(has(validateSite(input), 'src/data/releases.json: лишний id «cc»')).toBe(true);
  });

  it('url релиза не из репозитория продукта', () => {
    const input = base();
    input.releases = { aa: { ...released('aa'), url: 'https://example.com/aa.dmg' }, bb: { status: 'soon' } };
    expect(has(validateSite(input), 'https://github.com/aesarva/aa/releases/download/')).toBe(true);
  });

  it('id без записи в реестре', () => {
    const input = base();
    input.registryIds = ['aa'];
    expect(has(validateSite(input), 'src/worlds/registry.ts: нет мира для «bb»')).toBe(true);
  });

  it('лишний id в реестре', () => {
    const input = base();
    input.registryIds = ['aa', 'bb', 'cc'];
    expect(has(validateSite(input), 'src/worlds/registry.ts: лишний id «cc»')).toBe(true);
  });

  it('нет папки мира', () => {
    const input = base();
    input.worldDirs = ['aa'];
    expect(has(validateSite(input), 'src/worlds/bb: нет папки мира')).toBe(true);
  });

  it('мир без --shell-accent', () => {
    const input = base();
    input.worldStyles.aa = styles.replace('--shell-accent: #00f;', '');
    expect(validateSite(input)).toContain('src/worlds/aa: нет --shell-accent');
  });

  it('хаб без --shell-font', () => {
    const input = base();
    input.worldStyles.hub = styles.replace('--shell-font: serif;', '');
    expect(validateSite(input)).toContain('src/worlds/hub: нет --shell-font');
  });

  it('отсутствует icon', () => {
    const input = base();
    input.assetExists = (id, file) => !(id === 'bb' && file === 'icon.png');
    expect(has(validateSite(input), 'src/assets/products/bb/icon.png: файл не найден')).toBe(true);
  });

  it('ключи словарей ru и en различаются', () => {
    const input = base();
    input.dicts = { ru: { a: 'x', nested: { b: 'y' } }, en: { a: 'x', nested: { c: 'y' } } };
    const errors = validateSite(input);
    expect(has(errors, 'nested.b')).toBe(true);
    expect(has(errors, 'nested.c')).toBe(true);
  });
});
