import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { readProducts } from '../../scripts/load-products';
import { t } from '../../src/i18n';
import { pagePath } from '../../src/lib/routes';

const ROOT = process.cwd();
const ids = readProducts(ROOT).map((p) => (p.data as { id: string }).id);
const releases: Record<string, { status: string; url?: string }> = JSON.parse(
  readFileSync(join(ROOT, 'src/data/releases.json'), 'utf8'),
);

// Сайт должен работать без JavaScript.
test.use({ javaScriptEnabled: false });

for (const lang of ['ru', 'en'] as const) {
  test(`хаб (${lang}) без JS: ссылки на все продукты`, async ({ page }) => {
    await page.goto(pagePath(lang));
    for (const id of ids) {
      await expect(page.locator(`main a[href="${pagePath(lang, id)}"]`).first()).toBeVisible();
    }
  });

  for (const id of ids) {
    test(`${id} (${lang}) без JS: кнопка скачивания или «Скоро»`, async ({ page }) => {
      await page.goto(pagePath(lang, id));
      const rel = releases[id];
      if (rel.status === 'released') {
        await expect(page.locator(`a[href="${rel.url}"]`).first()).toBeVisible();
      } else {
        await expect(page.getByText(t(lang).comingSoon).first()).toBeVisible();
      }
    });
  }
}
