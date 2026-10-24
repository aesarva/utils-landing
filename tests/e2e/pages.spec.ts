import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
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

      const broken = await page.evaluate(() =>
        [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
      );
      expect(broken).toEqual([]);

      // Внутренние ссылки без дублей и #фрагментов.
      const hrefs = await page.$$eval('a[href^="/"]', (as) =>
        as.map((a) => a.getAttribute('href')!.split('#')[0]),
      );
      for (const href of new Set(hrefs.filter(Boolean))) {
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
          const link = page.locator(`a[href="${rel.url}"]`).first();
          await expect(link).toBeVisible();
          await expect(page.locator('body')).toContainText(rel.version);
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
  const offenders = files.filter((f) =>
    [...readFileSync(f, 'utf8').matchAll(/<script\b[^>]*>/gi)].some((m) => !/\ssrc\s*=/.test(m[0])),
  );
  expect(offenders).toEqual([]);
});
