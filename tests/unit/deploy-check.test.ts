import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer, type IncomingHttpHeaders, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const script = new URL('../../scripts/deploy-check.sh', import.meta.url).pathname;
const HEAD = 'a'.repeat(40);
const OLD = 'b'.repeat(40);

let server: Server | undefined;
afterEach(() => {
  server?.closeAllConnections();
  server?.close();
});

type Reply = { status: number; body: string };
type Site = {
  releaseTxt?: Reply;
  releasesJson?: Reply;
  /** repo → ответ releases/latest */
  api?: Record<string, Reply>;
};

const json = (v: unknown, status = 200): Reply => ({ status, body: JSON.stringify(v) });
const released = (version: string) => ({
  status: 'released',
  version,
  url: `https://github.com/aesarva/x/releases/download/v${version}/X-${version}.dmg`,
  size: 1,
  publishedAt: 'T',
});

/** Сервер играет и сайт, и API GitHub; запоминает заголовки запросов к API. */
async function serve(site: Site): Promise<{ base: string; apiHeaders: IncomingHttpHeaders[] }> {
  const apiHeaders: IncomingHttpHeaders[] = [];
  server = createServer((req, res) => {
    const url = req.url ?? '';
    let reply: Reply | undefined;
    if (url === '/release.txt') reply = site.releaseTxt;
    else if (url === '/releases.json') reply = site.releasesJson;
    else {
      const m = /^\/api\/repos\/(.+)\/releases\/latest$/.exec(url);
      if (m) {
        apiHeaders.push(req.headers);
        reply = site.api?.[m[1]];
      }
    }
    reply ??= { status: 404, body: '{"message":"Not Found"}' };
    res.writeHead(reply.status).end(reply.body);
  }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  return { base: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, apiHeaders };
}

function fakeRoot(products: { id: string; repo: string; hold?: boolean }[]): string {
  const root = mkdtempSync(join(tmpdir(), 'deploy-check-'));
  mkdirSync(join(root, 'src/content/products'), { recursive: true });
  for (const p of products) {
    const hold = p.hold ? 'hold: true  # релиз скрыт\n' : '';
    writeFileSync(join(root, 'src/content/products', `${p.id}.yaml`), `id: ${p.id}\nname: X\nrepo: "${p.repo}"  # репо\n${hold}`);
  }
  return root;
}

function run(base: string, root: string, env: Record<string, string> = {}) {
  const out = join(mkdtempSync(join(tmpdir(), 'deploy-check-out-')), 'out');
  writeFileSync(out, '');
  return new Promise<{ status: number | null; stderr: string; output: Record<string, string> }>((resolve) => {
    const p = spawn('bash', [script, base, HEAD, root], {
      env: { ...process.env, GITHUB_API: `${base}/api`, GITHUB_OUTPUT: out, GITHUB_TOKEN: '', ...env },
    });
    let stderr = '';
    p.stderr.on('data', (d) => (stderr += d));
    p.on('close', (status) => {
      const output = Object.fromEntries(
        readFileSync(out, 'utf8')
          .split('\n')
          .filter(Boolean)
          .map((l) => l.split('=') as [string, string]),
      );
      resolve({ status, stderr, output });
    });
  });
}

const products = [
  { id: 'aa', repo: 'aesarva/aa' },
  { id: 'bb', repo: 'aesarva/bb' },
];
const healthy = (): Site => ({
  releaseTxt: { status: 200, body: `${HEAD} 2026-10-24T00:00:00Z\n` },
  releasesJson: json({ aa: released('1.2.3'), bb: { status: 'soon' } }),
  api: { 'aesarva/aa': json({ tag_name: 'v1.2.3' }), 'aesarva/bb': json({ message: 'Not Found' }, 404) },
});

describe('deploy-check.sh', () => {
  it('сайт на голове develop, версии совпадают → run=false', async () => {
    const { base } = await serve(healthy());
    const r = await run(base, fakeRoot(products));
    expect(r.status).toBe(0);
    expect(r.output).toEqual({ run: 'false', stale: 'false' });
  });

  it('на сайте старый коммит (отменённый или упавший push) → run=true, stale=true', async () => {
    const site = healthy();
    site.releaseTxt = { status: 200, body: `${OLD} 2026-10-24T00:00:00Z\n` };
    const { base } = await serve(site);
    const r = await run(base, fakeRoot(products));
    expect(r.output).toEqual({ run: 'true', stale: 'true' });
    expect(r.stderr).toContain(OLD);
  });

  it('в GitHub новая версия → run=true, stale=false', async () => {
    const site = healthy();
    site.api!['aesarva/aa'] = json({ tag_name: 'v1.3.0' });
    const { base } = await serve(site);
    const r = await run(base, fakeRoot(products));
    expect(r.output).toEqual({ run: 'true', stale: 'false' });
    expect(r.stderr).toContain('aa');
  });

  it('продукт вышел (был soon, теперь релиз) → run=true', async () => {
    const site = healthy();
    site.api!['aesarva/bb'] = json({ tag_name: 'v0.1.0' });
    const { base } = await serve(site);
    expect((await run(base, fakeRoot(products))).output.run).toBe('true');
  });

  it('hold: релиз в GitHub есть, на сайте soon → run=false, API не спрашиваем', async () => {
    const site = healthy();
    site.api!['aesarva/bb'] = json({ tag_name: 'v0.1.0' });
    const { base, apiHeaders } = await serve(site);
    const r = await run(base, fakeRoot([products[0], { ...products[1], hold: true }]));
    expect(r.output).toEqual({ run: 'false', stale: 'false' });
    expect(apiHeaders).toHaveLength(1);
  });

  it('hold снят, а на сайте всё ещё soon → run=true', async () => {
    const site = healthy();
    site.api!['aesarva/bb'] = json({ tag_name: 'v0.1.0' });
    const { base } = await serve(site);
    expect((await run(base, fakeRoot(products))).output.run).toBe('true');
  });

  it('нового продукта нет в живом releases.json → run=true', async () => {
    const { base } = await serve(healthy());
    const r = await run(base, fakeRoot([...products, { id: 'cc', repo: 'aesarva/cc' }]));
    expect(r.output.run).toBe('true');
  });

  it('release.txt недоступен → run=true, stale=true', async () => {
    const site = healthy();
    site.releaseTxt = { status: 500, body: 'oops' };
    const { base } = await serve(site);
    expect((await run(base, fakeRoot(products))).output).toEqual({ run: 'true', stale: 'true' });
  });

  it('releases.json не JSON → run=true', async () => {
    const site = healthy();
    site.releasesJson = { status: 200, body: '<html>' };
    const { base } = await serve(site);
    expect((await run(base, fakeRoot(products))).output.run).toBe('true');
  });

  it('сбой API GitHub → run=true (неопределённость — выкладываем)', async () => {
    const site = healthy();
    site.api!['aesarva/aa'] = { status: 500, body: '' };
    const { base } = await serve(site);
    const r = await run(base, fakeRoot(products));
    expect(r.output.run).toBe('true');
    expect(r.stderr).toContain('500');
  });

  it('токен уходит в Authorization, без токена заголовка нет', async () => {
    const a = await serve(healthy());
    await run(a.base, fakeRoot(products), { GITHUB_TOKEN: 'secret-token' });
    expect(a.apiHeaders.map((h) => h.authorization)).toEqual(['Bearer secret-token', 'Bearer secret-token']);
    server?.closeAllConnections();
    server?.close();
    const b = await serve(healthy());
    await run(b.base, fakeRoot(products));
    expect(b.apiHeaders.map((h) => h.authorization)).toEqual([undefined, undefined]);
  });

  it('без $GITHUB_OUTPUT печатает в stdout', async () => {
    const { base } = await serve(healthy());
    const stdout = await new Promise<string>((resolve) => {
      const p = spawn('bash', [script, base, HEAD, fakeRoot(products)], {
        env: { ...process.env, GITHUB_API: `${base}/api`, GITHUB_OUTPUT: '' },
      });
      let s = '';
      p.stdout.on('data', (d) => (s += d));
      p.on('close', () => resolve(s));
    });
    expect(stdout).toBe('run=false\nstale=false\n');
  });
});
