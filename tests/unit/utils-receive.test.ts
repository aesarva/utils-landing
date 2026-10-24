import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import {
  existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, readlinkSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const SCRIPT = join(process.cwd(), 'server/bin/utils-receive');
const A = 'a'.repeat(40);
const B = 'b'.repeat(40);

let root: string;
let outside: string;
const cleanup: string[] = [];

function tmp(prefix: string): string {
  const d = mkdtempSync(join(tmpdir(), prefix));
  cleanup.push(d);
  return d;
}

beforeEach(() => {
  root = tmp('utils-receive-');
  outside = tmp('utils-outside-');
});

afterEach(() => {
  for (const d of cleanup.splice(0)) rmSync(d, { recursive: true, force: true });
});

/** Архив сборки: index.html, en/index.html и 404.html (если не сказано иначе) с меткой внутри. */
function archive(label: string, opts: { notFound?: boolean; en?: boolean; extra?: Buffer } = {}): Buffer {
  const dir = tmp('dist-');
  writeFileSync(join(dir, 'index.html'), label);
  if (opts.en !== false) {
    mkdirSync(join(dir, 'en'));
    writeFileSync(join(dir, 'en/index.html'), 'en');
  }
  if (opts.notFound !== false) writeFileSync(join(dir, '404.html'), '404');
  if (opts.extra) writeFileSync(join(dir, 'noise.bin'), opts.extra);
  return spawnSync('tar', ['-czf', '-', '-C', dir, '.']).stdout;
}

type Member = { name: string; kind: 'file' | 'dir' | 'sym' | 'hard' | 'fifo' | 'chr' | 'sparse'; link?: string; size?: number };

/** Архив с точными типами членов (Python tarfile): обычная сборка плюс переданные члены. */
function crafted(members: Member[]): Buffer {
  const py = `
import io, json, sys, tarfile
spec = json.loads(sys.argv[1])
buf = io.BytesIO()
with tarfile.open(fileobj=buf, mode='w:gz') as tf:
    for n, data in (('index.html', b'X'), ('en/index.html', b'en'), ('404.html', b'404')):
        ti = tarfile.TarInfo(n); ti.size = len(data); tf.addfile(ti, io.BytesIO(data))
    for m in spec:
        ti = tarfile.TarInfo(m['name'])
        k = m['kind']
        if k == 'file':
            ti.size = m.get('size', 1); tf.addfile(ti, io.BytesIO(b'\\0' * ti.size)); continue
        ti.type = {'dir': tarfile.DIRTYPE, 'sym': tarfile.SYMTYPE, 'hard': tarfile.LNKTYPE,
                   'fifo': tarfile.FIFOTYPE, 'chr': tarfile.CHRTYPE, 'sparse': tarfile.GNUTYPE_SPARSE}[k]
        ti.linkname = m.get('link', '')
        tf.addfile(ti)
sys.stdout.buffer.write(buf.getvalue())
`;
  const r = spawnSync('python3', ['-I', '-c', py, JSON.stringify(members)], { maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(String(r.stderr));
  return r.stdout;
}

function receive(sha: string, input: Buffer | string, env: Record<string, string> = {}) {
  return spawnSync('bash', [SCRIPT, sha], { input, env: { ...process.env, UTILS_ROOT: root, ...env } });
}

const current = () => readlinkSync(join(root, 'current'));
const served = () => readFileSync(join(root, 'current/index.html'), 'utf8');
const releases = () => readdirSync(join(root, 'releases'));
const leftovers = () => readdirSync(root).filter((n) => /^\.(upload|incoming|current)-/.test(n) || n === '.lock.d');

describe('utils-receive', () => {
  it('выкладывает релиз, пишет release.txt и переключает current', () => {
    expect(receive(A, archive('A')).status).toBe(0);
    expect(current()).toMatch(new RegExp(`^releases/${A}\\.`));
    expect(served()).toBe('A');
    expect(readFileSync(join(root, 'current/release.txt'), 'utf8')).toMatch(new RegExp(`^${A} \\d{4}-`));
    expect(leftovers()).toEqual([]);
  });

  it('отвергает sha не из 40 hex', () => {
    expect(receive('xyz', archive('A')).status).toBe(2);
  });

  for (const [what, opts] of [
    ['404.html', { notFound: false }],
    ['en/index.html', { en: false }],
  ] as const) {
    it(`без ${what} релиз не принимается, current прежний`, () => {
      receive(A, archive('A'));
      const before = current();
      expect(receive(B, archive('B', opts)).status).toBe(5);
      expect(current()).toBe(before);
      expect(served()).toBe('A');
      expect(releases()).toHaveLength(1);
      expect(leftovers()).toEqual([]);
    });
  }

  it('битый архив — код 4, current прежний, временных каталогов нет', () => {
    receive(A, archive('A'));
    const before = current();
    expect(receive(B, Buffer.from('not a gzip at all')).status).toBe(4);
    expect(current()).toBe(before);
    expect(releases()).toHaveLength(1);
    expect(leftovers()).toEqual([]);
  });

  it('архив больше лимита — код 4', () => {
    expect(receive(A, archive('A', { extra: randomBytes(4096) }), { UTILS_MAX_BYTES: '100' }).status).toBe(4);
    expect(existsSync(join(root, 'current'))).toBe(false);
    expect(leftovers()).toEqual([]);
  });

  it('архив, распаковка которого больше лимита, — код 4, current прежний', () => {
    receive(A, archive('A'));
    const before = current();
    const bomb = archive('B', { extra: Buffer.alloc(2 * 1024 * 1024) });
    expect(bomb.length).toBeLessThan(64 * 1024);
    expect(receive(B, bomb, { UTILS_MAX_UNPACKED: String(1024 * 1024) }).status).toBe(4);
    expect(current()).toBe(before);
    expect(releases()).toHaveLength(1);
    expect(leftovers()).toEqual([]);
  });

  describe('небезопасные архивы', () => {
    const sentinel = () => join(outside, 'sentinel');
    const cases: [string, Member[]][] = [
      ['симлинк на внешний файл', [{ name: 'release.txt', kind: 'sym', link: '' }]],
      ['симлинк на каталог', [{ name: 'pub', kind: 'sym', link: '' }]],
      ['хардлинк', [{ name: 'hl', kind: 'hard', link: '' }]],
      ['абсолютный путь', [{ name: '', kind: 'file' }]],
      ['компонент ..', [{ name: '../x', kind: 'file' }]],
      ['fifo', [{ name: 'ff', kind: 'fifo' }]],
      ['устройство', [{ name: 'dev', kind: 'chr' }]],
      ['sparse-член', [{ name: 'sp', kind: 'sparse' }]],
      ['логический размер больше лимита', [{ name: 'big', kind: 'file', size: 2 * 1024 * 1024 }]],
    ];
    for (const [what, members] of cases) {
      it(`${what}: код 4, current прежний, внешний файл цел`, () => {
        writeFileSync(sentinel(), 'keep');
        const fixed = members.map((m) => {
          if (what === 'абсолютный путь') return { ...m, name: sentinel() };
          if (m.kind === 'sym' || m.kind === 'hard') return { ...m, link: m.kind === 'hard' ? sentinel() : (what === 'симлинк на каталог' ? outside : sentinel()) };
          return m;
        });
        receive(A, archive('A'));
        const before = current();
        const r = receive(B, crafted(fixed), { UTILS_MAX_UNPACKED: String(1024 * 1024) });
        expect(r.status).toBe(4);
        expect(current()).toBe(before);
        expect(served()).toBe('A');
        expect(releases()).toHaveLength(1);
        expect(readFileSync(sentinel(), 'utf8')).toBe('keep');
        expect(readdirSync(outside)).toEqual(['sentinel']);
        expect(leftovers()).toEqual([]);
      });
    }
  });

  it('повтор того же sha заменяет содержимое, current не висит', () => {
    receive(A, archive('A1'));
    const first = current();
    expect(receive(A, archive('A2')).status).toBe(0);
    expect(current()).not.toBe(first);
    expect(current()).toMatch(new RegExp(`^releases/${A}\\.`));
    expect(served()).toBe('A2');
  });

  it('пустой stdin: нет релиза — код 3, есть — откат на новейший его каталог', () => {
    expect(receive(B, '').status).toBe(3);
    receive(A, archive('A1'));
    receive(A, archive('A2'));
    receive(B, archive('B'));
    expect(served()).toBe('B');
    expect(receive(A, '').status).toBe(0);
    expect(current()).toMatch(new RegExp(`^releases/${A}\\.`));
    expect(served()).toBe('A2');
  });

  it('хранит 5 последних релизов, текущий среди них', () => {
    const shas = Array.from({ length: 7 }, (_, i) => String(i).repeat(40));
    for (const sha of shas) expect(receive(sha, archive(sha)).status).toBe(0);
    expect(releases().map((n) => n.split('.')[0]).sort()).toEqual(shas.slice(2).sort());
    expect(current()).toMatch(new RegExp(`^releases/${shas[6]}\\.`));
  });

  it('откат на старый релиз не удаляет его при чистке', () => {
    const shas = Array.from({ length: 6 }, (_, i) => String(i).repeat(40));
    for (const sha of shas) receive(sha, archive(sha));
    expect(receive(shas[1], '').status).toBe(0);
    expect(served()).toBe(shas[1]);
    expect(releases()).toHaveLength(5);
  });

  it('занятый замок — код 6, без изменений', async () => {
    receive(A, archive('A'));
    const before = current();
    const hasFlock = spawnSync('sh', ['-c', 'command -v flock']).status === 0;
    let holder: ReturnType<typeof spawn> | undefined;
    if (hasFlock) {
      holder = spawn('bash', ['-c', 'exec 9>"$1"; flock 9; echo held; sleep 30', 'x', join(root, '.lock')]);
      await new Promise<void>((ok) => holder!.stdout!.once('data', () => ok()));
    } else {
      mkdirSync(join(root, '.lock.d'));
    }
    try {
      expect(receive(B, archive('B')).status).toBe(6);
      expect(current()).toBe(before);
      expect(releases()).toHaveLength(1);
    } finally {
      holder?.kill();
      rmSync(join(root, '.lock.d'), { recursive: true, force: true });
    }
  });
});
