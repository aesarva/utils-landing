import { spawn } from 'node:child_process';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { once } from 'node:events';

const smoke = new URL('../../scripts/smoke.sh', import.meta.url).pathname;
let server: Server | undefined;
afterEach(() => {
  server?.closeAllConnections();
  server?.close();
});

async function serve(handler: Parameters<typeof createServer>[1]): Promise<string> {
  server = createServer(handler).listen(0, '127.0.0.1');
  await once(server, 'listening');
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

function fakeRoot(yaml: string): string {
  const root = mkdtempSync(join(tmpdir(), 'smoke-'));
  mkdirSync(join(root, 'src/content/products'), { recursive: true });
  writeFileSync(join(root, 'src/content/products/a.yaml'), yaml);
  return root;
}

function exec(cmd: string, args: string[], env?: NodeJS.ProcessEnv): Promise<{ status: number | null; stdout: string }> {
  // Асинхронно: spawnSync заблокировал бы цикл событий, и тестовый сервер не смог бы ответить.
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { env });
    let stdout = '';
    p.stdout.on('data', (d) => (stdout += d));
    p.on('close', (status) => resolve({ status, stdout }));
  });
}

const run = (url: string, root: string) => exec('bash', [smoke, url, root]);

describe('smoke.sh', () => {
  it('здоровый сайт → код 0, id с кавычками и комментарием читается', async () => {
    const url = await serve((req, res) => {
      const ok = ['/', '/en/', '/a/', '/en/a/'].includes(req.url ?? '');
      res.writeHead(ok ? 200 : 404).end('x');
    });
    const r = await run(url, fakeRoot('id: "a"  # комментарий\nname: A\n'));
    expect(r.stdout).toContain('ok   /en/a/ -> 200');
    expect(r.status).toBe(0);
  });

  it('обрыв соединения посреди тела при статусе 200 → код 1', async () => {
    const url = await serve((req, res) => {
      if (req.url === '/no-such-page/') return void res.writeHead(404).end('x');
      res.writeHead(200, { 'content-length': '1000' });
      res.write('часть');
      setTimeout(() => res.socket?.destroy(), 20);
    });
    const r = await run(url, fakeRoot('id: a\n'));
    expect(r.stdout).toContain('FAIL /');
    expect(r.status).toBe(1);
  });
});
