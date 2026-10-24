// Сравнение собранного releases.json с живым на сайте: нужно ли выкладывать заново по расписанию.
// Любая неопределённость (сбой запроса, не-JSON) считается «изменилось»: лучше лишняя выкладка, чем пропуск.
import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Канонический вид: ключи по алфавиту на всех уровнях, чтобы порядок и пробелы не влияли.
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return `{${Object.keys(obj)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(obj[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export async function releasesChanged(built: string, fetchLive: () => Promise<string>): Promise<boolean> {
  try {
    const live = await fetchLive();
    return canonical(JSON.parse(built)) !== canonical(JSON.parse(live));
  } catch {
    return true;
  }
}

async function fetchUrl(url: string): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000), headers: { 'cache-control': 'no-cache' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function main(): Promise<void> {
  const [file, url] = process.argv.slice(2);
  if (!file || !url) {
    console.error('Использование: tsx scripts/releases-changed.ts <dist/releases.json> <url>');
    process.exit(2);
  }
  const changed = await releasesChanged(readFileSync(file, 'utf8'), () => fetchUrl(url));
  const line = `changed=${changed}`;
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${line}\n`);
  else console.log(line);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
