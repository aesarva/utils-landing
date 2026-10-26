import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { readProducts } from '../../scripts/load-products';
import { t } from '../../src/i18n';
import { pagePath } from '../../src/lib/routes';

const ROOT = process.cwd();
const products = readProducts(ROOT).map((p) => p.data as { id: string; hold?: boolean });
const ids = products.map((p) => p.id);
const releases: Record<string, { status: string; url?: string }> = JSON.parse(
  readFileSync(join(ROOT, 'src/data/releases.json'), 'utf8'),
);

// Сайт должен работать без JavaScript.
test.use({ javaScriptEnabled: false });

for (const lang of ['ru', 'en'] as const) {
  test(`хаб (${lang}) без JS: ссылки на все продукты, у скрытых — штамп и без ссылки`, async ({ page }) => {
    await page.goto(pagePath(lang));
    for (const { id, hold } of products) {
      const link = page.locator(`a[href="${pagePath(lang, id)}"]`);
      if (hold) await expect(link).toHaveCount(0);
      else await expect(link.first()).toBeVisible();
    }
    const held = products.filter((p) => p.hold).length;
    await expect(page.getByText(t(lang).inProgress, { exact: true })).toHaveCount(held);
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
