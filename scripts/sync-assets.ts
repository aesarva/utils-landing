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

/** Пути картинок (только blob-ы) в `dir` на `ref`. Нет папки в ref: пустой список. */
export function listImages(repo: string, ref: string, dir: string): string[] {
  const out = git(repo, ['ls-tree', '-z', ref, `${dir}/`]).toString('utf8');
  const paths: string[] = [];
  for (const rec of out.split('\0')) {
    // формат записи: "<mode> <type> <sha>\t<path>"
    const tab = rec.indexOf('\t');
    if (tab < 0) continue;
    const [, type] = rec.slice(0, tab).split(' ');
    const path = rec.slice(tab + 1);
    if (type === 'blob' && IMAGE_EXT.has(extname(path).toLowerCase())) paths.push(path);
  }
  return paths;
}

export interface SyncResult {
  copied: number;
  removed: string[];
  /** Пропущенные дубликаты имён (побеждает более ранняя папка). */
  skipped: string[];
}

export function syncProduct(id: string, opts: { projectsRoot: string; ref: string; destRoot: string }): SyncResult {
  if (!PRODUCTS.includes(id) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) throw new Error(`неизвестный продукт: ${id}`);
  checkRef(opts.ref);
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
  if (chosen.size === 0) throw new Error(`${id}: в ${opts.ref} нет картинок в ${dirs.join(', ')}, целевая папка не тронута`);
  // Сначала читаем все байты: ошибка git не оставит папку наполовину обновлённой.
  const data = [...chosen].map(([name, path]) => [name, git(repo, ['show', `${opts.ref}:${path}`])] as const);
  const target = resolve(opts.destRoot, id);
  if (dirname(target) !== resolve(opts.destRoot)) throw new Error(`целевая папка вне ${opts.destRoot}: ${target}`);
  mkdirSync(target, { recursive: true });
  for (const [name, bytes] of data) writeFileSync(join(target, name), bytes);
  const removed = readdirSync(target, { withFileTypes: true })
    .filter((e) => e.isFile() && !chosen.has(e.name))
    .map((e) => e.name);
  for (const f of removed) rmSync(join(target, f));
  return { copied: chosen.size, removed, skipped };
}

function checkRef(ref: string): void {
  if (!ref || ref.startsWith('-')) throw new Error(`недопустимый ref: "${ref}"`);
}

function main(argv: string[]): void {
  let ref = 'develop';
  const ids: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--ref') {
      ref = argv[++i] ?? '';
      checkRef(ref);
    }
    else ids.push(argv[i]);
  }
  const here = dirname(fileURLToPath(import.meta.url));
  const projectsRoot = resolve(here, '../..');
  const destRoot = resolve(here, '../src/assets/products');
  for (const id of ids) if (!PRODUCTS.includes(id)) throw new Error(`неизвестный продукт: ${id}`);
  for (const id of ids.length ? ids : PRODUCTS) {
    const r = syncProduct(id, { projectsRoot, ref, destRoot });
    console.log(`${id} (${ref}): скопировано ${r.copied}, удалено ${r.removed.length}`);
    for (const f of r.removed) console.log(`  удалён ${f}`);
    for (const f of r.skipped) console.log(`  дубликат пропущен ${f}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
