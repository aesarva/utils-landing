import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { releasesChanged } from '../../scripts/releases-changed';

const built = '{"ochre":{"status":"released","version":"1.2.3"}}';

describe('releasesChanged', () => {
  it('то же содержимое с другими пробелами → false', async () => {
    const live = JSON.stringify(JSON.parse(built), null, 2) + '\n';
    expect(await releasesChanged(built, async () => live)).toBe(false);
  });

  it('другая версия → true', async () => {
    const live = '{"ochre":{"status":"released","version":"1.2.2"}}';
    expect(await releasesChanged(built, async () => live)).toBe(true);
  });

  it('fetchLive бросает (404, таймаут) → true', async () => {
    const fail = async (): Promise<string> => {
      throw new Error('HTTP 404');
    };
    expect(await releasesChanged(built, fail)).toBe(true);
  });

  it('живой файл — не JSON → true', async () => {
    expect(await releasesChanged(built, async () => '<html>')).toBe(true);
  });

  it('другой порядок ключей на верхнем и вложенном уровне → false', async () => {
    const a = '{"lidless":{"version":"1","status":"released"},"ochre":{"status":"soon"}}';
    const b = '{"ochre":{"status":"soon"},"lidless":{"status":"released","version":"1"}}';
    expect(await releasesChanged(a, async () => b)).toBe(false);
  });
});


function exec(cmd: string, args: string[], env?: NodeJS.ProcessEnv): Promise<{ status: number | null; stdout: string }> {
  // Асинхронно: spawnSync заблокировал бы цикл событий, и тестовый сервер не смог бы ответить.
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { env });
    let stdout = '';
    p.stdout.on('data', (d) => (stdout += d));
    p.on('close', (status) => resolve({ status, stdout }));
  });
}

describe('CLI releases-changed', () => {
  const cli = new URL('../../scripts/releases-changed.ts', import.meta.url).pathname;
  const tsx = new URL('../../node_modules/.bin/tsx', import.meta.url).pathname;

  async function run(liveBody: string, githubOutput?: string) {
    const dir = mkdtempSync(join(tmpdir(), 'rc-'));
    const file = join(dir, 'releases.json');
    writeFileSync(file, built);
    const server = createServer((_, res) => res.end(liveBody)).listen(0, '127.0.0.1');
    await once(server, 'listening');
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/releases.json`;
    const env = { ...process.env, GITHUB_OUTPUT: githubOutput ?? '' };
    const r = await exec(tsx, [cli, file, url], env);
    server.close();
    return r;
  }

  it('пишет changed=… в $GITHUB_OUTPUT', async () => {
    const out = join(mkdtempSync(join(tmpdir(), 'rc-')), 'out');
    writeFileSync(out, '');
    const r = await run(built, out);
    expect(r.status).toBe(0);
    expect(readFileSync(out, 'utf8')).toBe('changed=false\n');
    expect(r.stdout).toBe('');
  });

  it('без $GITHUB_OUTPUT печатает в stdout', async () => {
    const r = await run('{"ochre":{}}');
    expect(r.stdout.trim()).toBe('changed=true');
  });
});
