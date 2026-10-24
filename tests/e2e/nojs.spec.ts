import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { readProducts } from '../../scripts/load-products';
import { pagePath } from '../../src/lib/routes';

const ROOT = process.cwd();
const ids = readProducts(ROOT).map((p) => (p.data as { id: string }).id);
const releases: Record<string, { status: string; url?: string }> = JSON.parse(
  readFileSync(join(ROOT, 'src/data/releases.json'), 'utf8'),
);

// Сайт должен работать без JavaScript.
test.use({ javaScriptEnabled: false });

test('хаб без JS: ссылки на все продукты', async ({ page }) => {
  await page.goto('/');
  for (const id of ids) {
    await expect(page.locator(`main a[href="${pagePath('ru', id)}"]`).first()).toBeVisible();
  }
});

for (const id of ids) {
  test(`${id} без JS: кнопка скачивания или «Скоро»`, async ({ page }) => {
    await page.goto(pagePath('ru', id));
    const rel = releases[id];
    if (rel.status === 'released') {
      await expect(page.locator(`a[href="${rel.url}"]`).first()).toBeVisible();
    } else {
      await expect(page.getByText('Скоро').first()).toBeVisible();
    }
  });
}
