import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'parse5';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readProducts } from '../../scripts/load-products';
import { otherLang, pagePath } from '../../src/lib/routes';

const ROOT = process.cwd();
type Release = { status: 'released'; version: string; url: string } | { status: 'soon' };
// Снимок релизов — тот же, из которого собирается сайт.
const releases: Record<string, Release> = JSON.parse(
  readFileSync(join(ROOT, 'src/data/releases.json'), 'utf8'),
);
const ids = readProducts(ROOT).map((p) => (p.data as { id: string }).id);

const pages = (['ru', 'en'] as const).flatMap((lang) => [
  { lang, id: undefined as string | undefined },
  ...ids.map((id) => ({ lang, id })),
]);

for (const { lang, id } of pages) {
  const path = pagePath(lang, id);
  test.describe(path, () => {
    test('200, без горизонтального скролла, картинки, ссылки', async ({ page, request }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);

      // Ленивые картинки: прокручиваем каждую в зону видимости и ждём загрузки.
      const imgs = page.locator('img');
      const count = await imgs.count();
      if (id) expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) await imgs.nth(i).scrollIntoViewIfNeeded();
      await expect
        .poll(
          () =>
            page.evaluate(() =>
              [...document.images].filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.src),
            ),
          { timeout: 10_000 },
        )
        .toEqual([]);

      // Внутренние ссылки без дублей и #фрагментов.
      const hrefs = await page.$$eval('a[href^="/"]', (as) =>
        as.map((a) => a.getAttribute('href')!.split('#')[0]),
      );
      const unique = new Set(hrefs.filter(Boolean));
      expect(unique.size).toBeGreaterThan(0);
      for (const href of unique) {
        const r = await request.get(href);
        expect(r.status(), href).toBe(200);
      }
    });

    test('переключатель языка ведёт на другую версию', async ({ page }) => {
      await page.goto(path);
      const sw = page.locator('header a[hreflang]');
      await expect(sw).toHaveCount(1);
      await expect(sw).toHaveAttribute('href', pagePath(otherLang(lang), id));
    });

    if (id) {
      test('ссылка на скачивание соответствует снимку релиза', async ({ page }) => {
        await page.goto(path);
        const rel = releases[id];
        if (rel.status === 'released') {
          const block = page.locator('[data-download]');
          await expect(block).toHaveCount(1);
          await expect(block.locator(`a[href="${rel.url}"]`)).toBeVisible();
          await expect(block).toContainText(rel.version);
        } else {
          await expect(page.locator('a[href$=".dmg"]')).toHaveCount(0);
        }
      });
    }

    test('axe: нет serious/critical', async ({ page }) => {
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).analyze();
      const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    });
  });
}

test('/no-such-page/ — 404, текст на обоих языках', async ({ page }) => {
  const res = await page.goto('/no-such-page/');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Страница не найдена' })).toBeVisible();
  await expect(page.locator('[lang="en"]').getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

// CSP `script-src 'self'`: инлайновых скриптов в сборке быть не должно.
test('в dist нет инлайновых <script> без src', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'проверка файловая, один раз');
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
    });
  const files = walk(join(ROOT, 'dist'));
  expect(files.length).toBeGreaterThan(0);
  type Node = { nodeName: string; attrs?: { name: string; value: string }[]; childNodes?: Node[]; content?: Node };
  const inline = (node: Node): boolean =>
    (node.nodeName === 'script' && !node.attrs?.some((a) => a.name === 'src')) ||
    [...(node.childNodes ?? []), ...(node.content ? [node.content] : [])].some(inline);
  const offenders = files.filter((f) => inline(parse(readFileSync(f, 'utf8')) as unknown as Node));
  expect(offenders).toEqual([]);
});
