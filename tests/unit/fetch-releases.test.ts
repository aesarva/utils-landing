import { spawnSync } from 'node:child_process';
import { copyFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { run } from '../../scripts/fetch-releases';

const REPO = process.cwd();
const tsx = join(REPO, 'node_modules/.bin/tsx');

/**
 * Временный корень: копия продуктов, снимка, миров и иконок проекта плюс новый продукт `newtool`,
 * у которого есть всё (YAML, иконка, мир, строка реестра), кроме записи в снимке.
 */
function projectWithNewProduct(): string {
  const root = mkdtempSync(join(tmpdir(), 'fetch-releases-'));
  for (const dir of ['src/content/products', 'src/data', 'src/worlds']) {
    cpSync(join(REPO, dir), join(root, dir), { recursive: true });
  }
  for (const id of ['ochre', 'lidless', 'subus']) {
    mkdirSync(join(root, 'src/assets/products', id), { recursive: true });
    copyFileSync(join(REPO, 'src/assets/products', id, 'icon.png'), join(root, 'src/assets/products', id, 'icon.png'));
  }
  const yaml = readFileSync(join(REPO, 'src/content/products/subus.yaml'), 'utf8')
    .replace(/^id: .*$/m, 'id: newtool')
    .replace(/^name: .*$/m, 'name: Newtool')
    .replace(/^order: .*$/m, 'order: 99')
    .replace(/^repo: .*$/m, 'repo: aesarva/newtool')
    .replace(/^dmg: .*$/m, 'dmg: Newtool');
  writeFileSync(join(root, 'src/content/products/newtool.yaml'), yaml);
  mkdirSync(join(root, 'src/assets/products/newtool'), { recursive: true });
  copyFileSync(join(REPO, 'src/assets/products/subus/icon.png'), join(root, 'src/assets/products/newtool/icon.png'));
  mkdirSync(join(root, 'src/worlds/newtool'));
  const world = readFileSync(join(REPO, 'src/worlds/subus/World.astro'), 'utf8').replaceAll('"subus"', '"newtool"');
  writeFileSync(join(root, 'src/worlds/newtool/World.astro'), world);
  const registry = join(root, 'src/worlds/registry.ts');
  writeFileSync(
    registry,
    readFileSync(registry, 'utf8')
      .replace(/(import subus from .*\n)/, "$1import newtool from './newtool/World.astro';\n")
      .replace(/\{ ochre, lidless, subus \}/, '{ ochre, lidless, subus, newtool }'),
  );
  return root;
}

describe('fetch-releases офлайн', () => {
  let root: string;
  beforeEach(() => {
    root = projectWithNewProduct();
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  const snapshotFile = () => join(root, 'src/data/releases.json');
  const validate = () => spawnSync(tsx, [join(REPO, 'scripts/validate.ts'), root], { encoding: 'utf8' });

  it('без снимка нового продукта валидатор падает (исходное состояние теста)', () => {
    const r = validate();
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('нет записи для «newtool»');
  });

  it('новый продукт получает soon с предупреждением «офлайн», остальные записи не меняются, валидатор проходит', async () => {
    const before = JSON.parse(readFileSync(snapshotFile(), 'utf8'));
    const warnings: string[] = [];
    const res = await run({ root, offline: true, warn: (l) => warnings.push(l), log: () => {} });
    const after = JSON.parse(readFileSync(snapshotFile(), 'utf8'));
    expect(res.written).toBe(true);
    expect(after).toEqual({ ...before, newtool: { status: 'soon' } });
    expect(warnings).toEqual(['офлайн: «newtool» нет в снимке, записан soon']);
    const r = validate();
    expect(r.stderr).toBe('');
    expect(r.status).toBe(0);
  });

  it('снимок без изменений не переписывается', async () => {
    await run({ root, offline: true, warn: () => {}, log: () => {} });
    const mtime = statSync(snapshotFile()).mtimeMs;
    const res = await run({ root, offline: true, warn: () => {}, log: () => {} });
    expect(res.written).toBe(false);
    expect(statSync(snapshotFile()).mtimeMs).toBe(mtime);
  });

  it('офлайн не обращается к сети', async () => {
    const fetchImpl = (() => {
      throw new Error('сеть в офлайн-режиме');
    }) as unknown as typeof fetch;
    await expect(run({ root, offline: true, fetchImpl, warn: () => {}, log: () => {} })).resolves.toBeDefined();
  });

  it('CLI с RELEASES_OFFLINE=1 даёт тот же результат и код 0', () => {
    const r = spawnSync(tsx, [join(REPO, 'scripts/fetch-releases.ts'), root], {
      encoding: 'utf8',
      cwd: REPO,
      env: { ...process.env, RELEASES_OFFLINE: '1' },
    });
    expect(r.status).toBe(0);
    expect(r.stderr).toContain('офлайн: «newtool» нет в снимке, записан soon');
    expect(JSON.parse(readFileSync(snapshotFile(), 'utf8')).newtool).toEqual({ status: 'soon' });
  });
});

describe('fetch-releases онлайн (подменённый fetch)', () => {
  let root: string;
  beforeEach(() => {
    root = projectWithNewProduct();
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it('ошибка API: записи снимка остаются, новый продукт — soon', async () => {
    const before = JSON.parse(readFileSync(join(root, 'src/data/releases.json'), 'utf8'));
    const fetchImpl = (async () => new Response('{}', { status: 500 })) as typeof fetch;
    const warnings: string[] = [];
    await run({ root, offline: false, fetchImpl, warn: (l) => warnings.push(l), log: () => {} });
    const after = JSON.parse(readFileSync(join(root, 'src/data/releases.json'), 'utf8'));
    expect(after).toEqual({ ...before, newtool: { status: 'soon' } });
    expect(warnings).toHaveLength(4);
  });
});
