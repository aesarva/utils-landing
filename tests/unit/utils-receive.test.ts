import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, readlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

const SCRIPT = join(process.cwd(), 'server/bin/utils-receive');
const A = 'a'.repeat(40);
const B = 'b'.repeat(40);

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'utils-receive-'));
});

/** Архив сборки: index.html и en/index.html (если не сказано иначе) с меткой внутри. */
function archive(label: string, opts: { notFound?: boolean; extra?: Buffer } = {}): Buffer {
  const dir = mkdtempSync(join(tmpdir(), 'dist-'));
  writeFileSync(join(dir, 'index.html'), label);
  mkdirSync(join(dir, 'en'));
  writeFileSync(join(dir, 'en/index.html'), 'en');
  if (opts.notFound !== false) writeFileSync(join(dir, '404.html'), '404');
  if (opts.extra) writeFileSync(join(dir, 'noise.bin'), opts.extra);
  return spawnSync('tar', ['-czf', '-', '-C', dir, '.']).stdout;
}

function receive(sha: string, input: Buffer | string, env: Record<string, string> = {}) {
  return spawnSync('bash', [SCRIPT, sha], { input, env: { ...process.env, UTILS_ROOT: root, ...env } });
}

const current = () => readlinkSync(join(root, 'current'));
const served = () => readFileSync(join(root, 'current/index.html'), 'utf8');
const releases = () => readdirSync(join(root, 'releases'));

describe('utils-receive', () => {
  it('выкладывает релиз, пишет release.txt и переключает current', () => {
    expect(receive(A, archive('A')).status).toBe(0);
    expect(current()).toBe(`releases/${A}`);
    expect(served()).toBe('A');
    expect(readFileSync(join(root, 'current/release.txt'), 'utf8')).toMatch(new RegExp(`^${A} \\d{4}-`));
  });

  it('отвергает sha не из 40 hex', () => {
    expect(receive('xyz', archive('A')).status).toBe(2);
  });

  it('без 404.html релиз не принимается, current прежний', () => {
    receive(A, archive('A'));
    expect(receive(B, archive('B', { notFound: false })).status).toBe(5);
    expect(served()).toBe('A');
    expect(releases()).toEqual([A]);
  });

  it('битый архив — код 4, current прежний, временных каталогов нет', () => {
    receive(A, archive('A'));
    expect(receive(B, Buffer.from('not a gzip at all')).status).toBe(4);
    expect(served()).toBe('A');
    expect(releases()).toEqual([A]);
  });

  it('архив больше лимита — код 4', () => {
    expect(receive(A, archive('A', { extra: randomBytes(4096) }), { UTILS_MAX_BYTES: '100' }).status).toBe(4);
    expect(existsSync(join(root, 'current'))).toBe(false);
  });

  it('архив, распаковка которого больше лимита, — код 4, current прежний', () => {
    receive(A, archive('A'));
    const bomb = archive('B', { extra: Buffer.alloc(2 * 1024 * 1024) });
    expect(bomb.length).toBeLessThan(64 * 1024);
    expect(receive(B, bomb, { UTILS_MAX_UNPACKED: String(1024 * 1024) }).status).toBe(4);
    expect(served()).toBe('A');
    expect(releases()).toEqual([A]);
  });

  it('повтор того же sha заменяет содержимое', () => {
    receive(A, archive('A1'));
    expect(receive(A, archive('A2')).status).toBe(0);
    expect(served()).toBe('A2');
    expect(releases()).toEqual([A]);
  });

  it('пустой stdin: нет релиза — код 3, есть — откат на него', () => {
    expect(receive(B, '').status).toBe(3);
    receive(A, archive('A'));
    receive(B, archive('B'));
    expect(served()).toBe('B');
    expect(receive(A, '').status).toBe(0);
    expect(current()).toBe(`releases/${A}`);
    expect(served()).toBe('A');
  });

  it('хранит 5 последних релизов, текущий среди них', () => {
    const shas = Array.from({ length: 7 }, (_, i) => String(i).repeat(40));
    for (const sha of shas) expect(receive(sha, archive(sha)).status).toBe(0);
    expect(releases().sort()).toEqual(shas.slice(2).sort());
    expect(current()).toBe(`releases/${shas[6]}`);
  });
});
