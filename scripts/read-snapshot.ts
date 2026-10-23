// Чтение снимка releases.json: сбой не бросает исключение, а возвращается предупреждением.
import { existsSync, readFileSync } from 'node:fs';
import { releasesFileSchema, type Releases } from '../src/lib/schema';

export function readSnapshot(path: string): { releases: Releases; warning?: string } {
  if (!existsSync(path)) return { releases: {}, warning: `снимок ${path} отсутствует` };
  try {
    const parsed = releasesFileSchema.safeParse(JSON.parse(readFileSync(path, 'utf8')));
    if (!parsed.success) return { releases: {}, warning: `снимок ${path} не читается: ${parsed.error.message}` };
    return { releases: parsed.data };
  } catch (e) {
    return { releases: {}, warning: `снимок ${path} не читается: ${e instanceof Error ? e.message : String(e)}` };
  }
}
