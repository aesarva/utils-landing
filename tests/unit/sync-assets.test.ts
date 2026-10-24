import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { sourceDirs, syncProduct } from '../../scripts/sync-assets';

describe('sourceDirs', () => {
  it('ochre: docs/images и site/img', () => {
    expect(sourceDirs('ochre', '/p')).toEqual({ repo: '/p/ochre', dirs: ['docs/images', 'site/img'] });
  });
  it('subus: только docs/images', () => {
    expect(sourceDirs('subus', '/p')).toEqual({ repo: '/p/subus', dirs: ['docs/images'] });
  });
});

describe('syncProduct (временный git-репозиторий)', () => {
  let root: string;
  let dest: string;
  const git = (...args: string[]) => execFileSync('git', ['-C', join(root, 'ochre'), ...args], { stdio: 'pipe' });

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'sync-assets-'));
    dest = join(root, 'dest');
    const repo = join(root, 'ochre');
    mkdirSync(join(repo, 'docs/images'), { recursive: true });
    mkdirSync(join(repo, 'site/img'), { recursive: true });
    git('init', '-q', '-b', 'develop');
    git('config', 'user.email', 't@t');
    git('config', 'user.name', 't');
    git('config', 'commit.gpgsign', 'false');
    writeFileSync(join(repo, 'docs/images/icon.png'), Buffer.from([0x89, 0x50, 0x00, 0xff, 0x0a, 0x0d]));
    writeFileSync(join(repo, 'docs/images/tab-cpu.jpg'), 'docs-version');
    writeFileSync(join(repo, 'docs/images/notes.txt'), 'не картинка');
    writeFileSync(join(repo, 'site/img/tab-cpu.jpg'), 'site-version');
    writeFileSync(join(repo, 'site/img/tab-disk.jpg'), 'disk');
    git('add', '-A');
    git('commit', '-q', '-m', 'init');
    mkdirSync(join(dest, 'ochre'), { recursive: true });
    writeFileSync(join(dest, 'ochre/stale.png'), 'old');
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it('копирует картинки байт в байт, docs/images побеждает, лишнее удаляет', () => {
    const res = syncProduct('ochre', { projectsRoot: root, ref: 'develop', destRoot: dest });
    expect(readdirSync(join(dest, 'ochre')).sort()).toEqual(['icon.png', 'tab-cpu.jpg', 'tab-disk.jpg']);
    expect(readFileSync(join(dest, 'ochre/icon.png'))).toEqual(Buffer.from([0x89, 0x50, 0x00, 0xff, 0x0a, 0x0d]));
    expect(readFileSync(join(dest, 'ochre/tab-cpu.jpg'), 'utf8')).toBe('docs-version');
    expect(existsSync(join(dest, 'ochre/stale.png'))).toBe(false);
    expect(res).toEqual({ copied: 3, removed: ['stale.png'], skipped: ['site/img/tab-cpu.jpg'] });
  });
});
