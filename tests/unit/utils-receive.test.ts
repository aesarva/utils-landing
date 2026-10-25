import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import {
  existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, readlinkSync, rmSync, statSync, writeFileSync,
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

type Member = { name: string; kind: 'file' | 'dir' | 'sym' | 'hard' | 'fifo' | 'chr' | 'sparse' | 'pax' | 'many'; link?: string; size?: number };

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
        if k == 'many':
            for i in range(m['size']):
                d = tarfile.TarInfo('d/%d' % i); d.type = tarfile.DIRTYPE; tf.addfile(d)
            continue
        if k == 'pax':
            ti.pax_headers = {'comment': 'x' * (8 << 20)}; ti.size = 1; tf.addfile(ti, io.BytesIO(b'0')); continue
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

/**
 * Архив из сырых байт tar (Python): сниппет собирает `raw` из готовых кусков и сжимается gzip целиком.
 * hdr — один ustar-заголовок, member — заголовок с данными и выравниванием, SITE — обязательные файлы,
 * END — два нулевых блока конца архива. Так получаются ровно те байты, которые не пишет ни один честный tar.
 */
function rawArchive(snippet: string): Buffer {
  const py = `
import gzip, sys, tarfile
def hdr(name, size=0, type=tarfile.REGTYPE):
    ti = tarfile.TarInfo(name); ti.size = size; ti.type = type
    return ti.tobuf(tarfile.USTAR_FORMAT, 'utf-8', 'surrogateescape')
def member(name, data=b'', type=tarfile.REGTYPE):
    return hdr(name, len(data), type) + data + b'\\0' * (-len(data) % 512)
SITE = member('index.html', b'X') + member('en/index.html', b'en') + member('404.html', b'404')
END = b'\\0' * 1024
${snippet}
sys.stdout.buffer.write(gzip.compress(raw))
`;
  const r = spawnSync('python3', ['-I', '-c', py], { maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(String(r.stderr));
  return r.stdout;
}

/** Все пути под каталогом (относительные, каталоги с «/» на конце), отсортированные. */
function walk(dir: string, prefix = ''): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(dir, prefix), { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(`${rel}/`, ...walk(dir, rel));
    else out.push(rel);
  }
  return out.sort();
}

/** Дерево, похожее на dist: вложенные каталоги, двоичные файлы, пустой файл и каталог, UTF-8 и длинные имена. */
function distLike(long: boolean): string {
  const dir = tmp('distlike-');
  const put = (rel: string, data: Buffer | string) => {
    mkdirSync(join(dir, rel, '..'), { recursive: true });
    writeFileSync(join(dir, rel), data);
  };
  put('index.html', '<!doctype html>ru');
  put('404.html', '404');
  put('en/index.html', 'en');
  put('_astro/app.Bx9c.css', 'a{}'.repeat(4000));
  put('_astro/fonts/inter.woff2', randomBytes(30_000));
  put('img/логотип.svg', '<svg/>');
  put('empty.txt', '');
  mkdirSync(join(dir, 'empty-dir'));
  // 130 символов: ustar кладёт такое имя в prefix + name.
  put(`${'a'.repeat(60)}/${'b'.repeat(60)}/file.txt`, 'deep');
  // Больше 255 символов: только pax и gnu (длинное имя отдельным заголовком).
  if (long) put(`${'c'.repeat(100)}/${'d'.repeat(100)}/${'e'.repeat(100)}.txt`, 'longer');
  return dir;
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
    const cases: [string, Member[], { unpacked?: number; message?: string }?][] = [
      ['симлинк на внешний файл', [{ name: 'release.txt', kind: 'sym', link: '' }]],
      ['симлинк на каталог', [{ name: 'pub', kind: 'sym', link: '' }]],
      ['хардлинк', [{ name: 'hl', kind: 'hard', link: '' }]],
      ['абсолютный путь', [{ name: '', kind: 'file' }]],
      ['компонент ..', [{ name: '../x', kind: 'file' }]],
      ['fifo', [{ name: 'ff', kind: 'fifo' }]],
      ['устройство', [{ name: 'dev', kind: 'chr' }]],
      ['sparse-член', [{ name: 'sp', kind: 'sparse' }]],
      ['огромные PAX-метаданные', [{ name: 'px', kind: 'pax' }]],
      ['слишком много членов', [{ name: 'm', kind: 'many', size: 20001 }], { unpacked: 100 * 1024 * 1024, message: 'слишком много членов' }],
      ['каталог release.txt', [{ name: 'release.txt', kind: 'dir' }]],
      ['файл ./release.txt', [{ name: './release.txt', kind: 'file' }]],
      ['логический размер больше лимита', [{ name: 'big', kind: 'file', size: 2 * 1024 * 1024 }]],
      ['обычный файл с именем на «/»', [{ name: 'pad/', kind: 'file' }]],
      ['повтор имени: второй index.html', [{ name: 'index.html', kind: 'file' }]],
      ['повтор имени: файл и ./файл', [{ name: 'x', kind: 'file' }, { name: './x', kind: 'file' }]],
      ['повтор имени: каталог, затем файл', [{ name: 'dup', kind: 'dir' }, { name: 'dup', kind: 'file' }]],
      ['повтор имени: каталог дважды', [{ name: 'dup', kind: 'dir' }, { name: 'dup/', kind: 'dir' }]],
      ['файл, затем путь сквозь него', [{ name: 'f', kind: 'file' }, { name: 'f/x', kind: 'file' }]],
      // Каждый размер честный, но сумма записанного (300 × 4 КиБ) больше лимита в 1 МиБ.
      ['много мелких файлов сверх лимита', Array.from({ length: 300 }, (_, i) => ({ name: `f/${i}`, kind: 'file' as const, size: 4096 })), { message: 'больше 1048576 байт' }],
    ];
    for (const [what, members, extra] of cases) {
      it(`${what}: код 4, current прежний, внешний файл цел`, () => {
        writeFileSync(sentinel(), 'keep');
        const fixed = members.map((m) => {
          if (what === 'абсолютный путь') return { ...m, name: sentinel() };
          if (m.kind === 'sym' || m.kind === 'hard') return { ...m, link: m.kind === 'hard' ? sentinel() : (what === 'симлинк на каталог' ? outside : sentinel()) };
          return m;
        });
        receive(A, archive('A'));
        const before = current();
        const r = receive(B, crafted(fixed), { UTILS_MAX_UNPACKED: String(extra?.unpacked ?? 1024 * 1024) });
        expect(r.status).toBe(4);
        // Отказ должен дать именно проверка до распаковки, а не случайный сбой tar.
        expect(String(r.stderr)).toContain('отклонён');
        if (extra?.message) expect(String(r.stderr)).toContain(extra.message);
        expect(current()).toBe(before);
        expect(served()).toBe('A');
        expect(releases()).toHaveLength(1);
        expect(readFileSync(sentinel(), 'utf8')).toBe('keep');
        expect(readdirSync(outside)).toEqual(['sentinel']);
        expect(leftovers()).toEqual([]);
      });
    }
  });

  describe('один разборщик: проверяется ровно то, что пишется на диск', () => {
    /** Отказ без следов: код 4, current прежний, лишних релизов и временных каталогов нет. */
    function rejected(input: Buffer, env: Record<string, string> = {}) {
      receive(A, archive('A'));
      const before = current();
      const r = receive(B, input, { UTILS_MAX_UNPACKED: String(1024 * 1024), ...env });
      expect(r.status, String(r.stderr)).toBe(4);
      expect(current()).toBe(before);
      expect(served()).toBe('A');
      expect(releases()).toHaveLength(1);
      expect(leftovers()).toEqual([]);
      return String(r.stderr);
    }

    it('обычный файл «pad/», в данных которого спрятан заголовок большого файла, — код 4', () => {
      // tarfile видит pad/ как файл в 512 байт и пропускает их; GNU tar и bsdtar видят каталог и читают
      // из этих байт заголовок big.bin на 4 МиБ, которого проверка никогда не видела.
      const input = rawArchive(`raw = SITE + member('pad/', hdr('big.bin', 4 << 20)) + b'\\0' * (4 << 20) + END`);
      expect(input.length).toBeLessThan(64 * 1024);
      expect(rejected(input)).toContain('отклонён');
      expect(walk(root).filter((p) => p.includes('big.bin') || p.includes('pad'))).toEqual([]);
    });

    it('битый заголовок посередине, за ним ещё члены, — код 4', () => {
      // tarfile считает битый заголовок концом архива, GNU tar пропускает его и распаковывает дальше.
      const input = rawArchive(`
bad = bytearray(member('hidden.html', b'H'))
bad[148:156] = b'0000000\\0'
raw = SITE + bytes(bad) + member('after.html', b'A') + END`);
      expect(rejected(input)).toContain('отклонён');
    });

    it('битый последний заголовок, за ним только нули, — код 4', () => {
      const input = rawArchive(`
bad = bytearray(member('hidden.html', b'H'))
bad[148:156] = b'0000000\\0'
raw = SITE + bytes(bad) + END`);
      expect(rejected(input)).toContain('отклонён');
    });

    for (const [what, raw] of [
      ['сразу после блоков конца', `SITE + END + b'garbage'`],
      ['после полной записи нулей', `SITE + b'\\0' * 10240 + b'\\1'`],
    ]) {
      it(`мусор ${what} — код 4`, () => {
        expect(rejected(rawArchive(`raw = ${raw}`))).toContain('после конца архива');
      });
    }

    it('архив обрывается посреди данных члена — код 4', () => {
      expect(rejected(rawArchive(`raw = SITE + hdr('cut.bin', 4096) + b'\\0' * 1000`))).toContain('отклонён');
    });

    it('каталог с ненулевым размером — код 4', () => {
      expect(rejected(rawArchive(`raw = SITE + hdr('d', 512, tarfile.DIRTYPE) + b'\\0' * 512 + END`))).toContain('отклонён');
    });

    it('нули после конца архива допустимы', () => {
      expect(receive(A, rawArchive(`raw = SITE + END + b'\\0' * 100000`)).status).toBe(0);
      expect(served()).toBe('X');
    });

    it('распаковка дольше UTILS_EXTRACT_TIMEOUT — код 4 по сроку, без остатков, замок свободен', () => {
      // 2000 файлов на глубине 2000 каталогов: каждый член проходит весь путь, это заведомо дольше секунды.
      const input = rawArchive(`
deep = 'a/' * 2000
parts = [SITE]
for i in range(2000):
    ti = tarfile.TarInfo(deep + 'f%d' % i); ti.size = 0
    parts.append(ti.tobuf(tarfile.PAX_FORMAT, 'utf-8', 'surrogateescape'))
raw = b''.join(parts) + END`);
      const started = Date.now();
      const stderr = rejected(input, { UTILS_EXTRACT_TIMEOUT: '1', UTILS_MAX_UNPACKED: String(100 * 1024 * 1024) });
      expect(stderr).toContain('распаковка не завершилась за 1 с');
      expect(Date.now() - started).toBeLessThan(15_000);
      expect(receive(B, archive('B')).status).toBe(0);
    }, 30_000);

    it('нецелый UTILS_EXTRACT_TIMEOUT — код 2', () => {
      expect(receive(A, archive('A'), { UTILS_EXTRACT_TIMEOUT: '1.5' }).status).toBe(2);
    });
  });

  describe('настоящие архивы tar выкладываются как есть', () => {
    const version = String(spawnSync('tar', ['--version']).stdout);
    const gnu = version.includes('GNU tar');
    // Имена форматов у GNU tar и bsdtar различаются; без флага — формат по умолчанию.
    const formats: [string, string[], boolean][] = [
      ['по умолчанию', [], true],
      ['ustar', ['--format=ustar'], false],
      ['pax', ['--format=pax'], true],
      [gnu ? 'gnu' : 'gnutar', [gnu ? '--format=gnu' : '--format=gnutar'], true],
    ];
    for (const [fmt, flags, long] of formats) {
      for (const style of ['./-имена', 'имена без ./'] as const) {
        it(`${version.split('\n')[0].split(' ').slice(0, 2).join(' ')}, формат ${fmt}, ${style}: код 0, дерево совпадает`, () => {
          const dir = distLike(long);
          const what = style === './-имена' ? ['.'] : readdirSync(dir);
          const t = spawnSync('tar', [...flags, '-czf', '-', '-C', dir, ...what], {
            env: { ...process.env, COPYFILE_DISABLE: '1' },
            maxBuffer: 1 << 26,
          });
          expect(t.status, String(t.stderr)).toBe(0);
          const r = receive(A, t.stdout);
          expect(r.status, String(r.stderr)).toBe(0);
          const rel = join(root, current());
          expect(walk(rel).filter((p) => p !== 'release.txt')).toEqual(walk(dir));
          for (const p of walk(dir).filter((x) => !x.endsWith('/'))) {
            expect(readFileSync(join(rel, p)).equals(readFileSync(join(dir, p))), p).toBe(true);
          }
          expect(leftovers()).toEqual([]);
        });
      }
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

  it('после замка чистит остатки убитого запуска', () => {
    mkdirSync(join(root, '.incoming-dead'));
    writeFileSync(join(root, '.incoming-dead/x'), 'x');
    writeFileSync(join(root, '.upload-dead'), 'x');
    writeFileSync(join(root, '.current-dead'), 'x');
    expect(receive(A, archive('A')).status).toBe(0);
    expect(leftovers()).toEqual([]);
  });

  it('загрузка без конца (stdin не закрывается) — код 7 по таймауту, без остатков, замок свободен', async () => {
    receive(A, archive('A'));
    const before = current();
    const child = spawn('bash', [SCRIPT, B], {
      env: { ...process.env, UTILS_ROOT: root, UTILS_UPLOAD_TIMEOUT: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stderr = '';
    child.stderr!.on('data', (d) => (stderr += d));
    // Клиент жив и прислал начало, но stdin так и не закрывает.
    child.stdin!.write(archive('B').subarray(0, 16));
    const started = Date.now();
    const code = await new Promise<number | null>((ok) => {
      const timer = setTimeout(() => {
        child.kill('SIGKILL');
        ok(null);
      }, 15_000);
      child.on('exit', (c) => {
        clearTimeout(timer);
        ok(c);
      });
    });
    child.stdin!.destroy();
    expect(code).toBe(7);
    expect(Date.now() - started).toBeLessThan(10_000);
    expect(stderr).toContain('загрузка не завершилась за 1 с');
    expect(current()).toBe(before);
    expect(releases()).toHaveLength(1);
    expect(leftovers()).toEqual([]);
    // Следующая выкладка не упирается в замок.
    const next = receive(B, archive('B2'));
    expect(next.status).toBe(0);
    expect(served()).toBe('B2');
  }, 30_000);

  it('права: releases/ и релиз 755, файлы 644 даже при umask 077', () => {
    const r = spawnSync('bash', ['-c', 'umask 077; exec bash "$0" "$1"', SCRIPT, A], {
      input: archive('A'),
      env: { ...process.env, UTILS_ROOT: root },
    });
    expect(r.status).toBe(0);
    const mode = (p: string) => (statSync(p).mode & 0o777).toString(8);
    const rel = join(root, current());
    expect(mode(join(root, 'releases'))).toBe('755');
    expect(mode(rel)).toBe('755');
    expect(mode(join(rel, 'en'))).toBe('755');
    expect(mode(join(rel, 'index.html'))).toBe('644');
    expect(mode(join(rel, 'en/index.html'))).toBe('644');
    expect(mode(join(rel, 'release.txt'))).toBe('644');
  });

  it('занятый замок — код 6, без изменений', async () => {
    receive(A, archive('A'));
    const before = current();
    const hasFlock = spawnSync('sh', ['-c', 'command -v flock']).status === 0;
    let holder: ReturnType<typeof spawn> | undefined;
    if (hasFlock) {
      holder = spawn('bash', ['-c', 'exec 9>"$1"; flock 9; echo held; exec sleep 30', 'x', join(root, '.lock')]);
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
