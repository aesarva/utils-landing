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
});
