// Синхронизация картинок продуктов из git-репозиториев (читаем из ref, рабочие деревья не трогаем).
// Запуск: npm run sync:assets -- [--ref <ref>] [<id>…]
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PRODUCTS = ['ochre', 'lidless', 'subus'];
/** Папка репо, если она не совпадает с id продукта. */
const REPO_DIR: Record<string, string> = {};
/** Дополнительные папки с картинками (после docs/images). */
const EXTRA: Record<string, string[]> = { ochre: ['site/img'] };
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);

export function sourceDirs(id: string, projectsRoot: string): { repo: string; dirs: string[] } {
  return { repo: join(projectsRoot, REPO_DIR[id] ?? id), dirs: ['docs/images', ...(EXTRA[id] ?? [])] };
}

function git(repo: string, args: string[]): Buffer {
  const r = spawnSync('git', ['-C', repo, ...args], { encoding: 'buffer', maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} (${repo}): ${r.stderr.toString().trim()}`);
  return r.stdout;
}

/** Пути картинок в `dir` на `ref`. Нет папки в ref: пустой список. */
export function listImages(repo: string, ref: string, dir: string): string[] {
  const r = spawnSync('git', ['-C', repo, 'ls-tree', '--name-only', ref, `${dir}/`], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ls-tree ${ref} ${dir} (${repo}): ${r.stderr.trim()}`);
  return r.stdout.split('\n').filter((p) => IMAGE_EXT.has(extname(p).toLowerCase()));
}

export interface SyncResult {
  copied: number;
  removed: string[];
  /** Пропущенные дубликаты имён (побеждает более ранняя папка). */
  skipped: string[];
}

export function syncProduct(id: string, opts: { projectsRoot: string; ref: string; destRoot: string }): SyncResult {
  const { repo, dirs } = sourceDirs(id, opts.projectsRoot);
  const chosen = new Map<string, string>();
  const skipped: string[] = [];
  for (const dir of dirs) {
    for (const path of listImages(repo, opts.ref, dir)) {
      const name = basename(path);
      if (chosen.has(name)) skipped.push(path);
      else chosen.set(name, path);
    }
  }
  const target = join(opts.destRoot, id);
  mkdirSync(target, { recursive: true });
  for (const [name, path] of chosen) writeFileSync(join(target, name), git(repo, ['show', `${opts.ref}:${path}`]));
  const removed = readdirSync(target).filter((f) => !chosen.has(f));
  for (const f of removed) rmSync(join(target, f), { recursive: true, force: true });
  return { copied: chosen.size, removed, skipped };
}

function main(argv: string[]): void {
  let ref = 'develop';
  const ids: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--ref') ref = argv[++i] ?? ref;
    else ids.push(argv[i]);
  }
  const here = dirname(fileURLToPath(import.meta.url));
  const projectsRoot = resolve(here, '../..');
  const destRoot = resolve(here, '../src/assets/products');
  for (const id of ids.length ? ids : PRODUCTS) {
    const r = syncProduct(id, { projectsRoot, ref, destRoot });
    console.log(`${id} (${ref}): скопировано ${r.copied}, удалено ${r.removed.length}`);
    for (const f of r.removed) console.log(`  удалён ${f}`);
    for (const f of r.skipped) console.log(`  дубликат пропущен ${f}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
