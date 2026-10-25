import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import { t } from '../../src/i18n';
import { worlds } from '../../src/worlds/registry';
import { productSchema } from '../../src/lib/schema';

// Ветка `soon` в сборке не встречается (все продукты выпущены): проверяем её рендером миров.
const base = productSchema.parse(
  parseYaml(readFileSync('src/content/products/ochre.yaml', 'utf8')),
);

describe('миры со статусом soon', () => {
  for (const [id, World] of Object.entries(worlds)) {
    for (const lang of ['ru', 'en'] as const) {
      it(`${id} (${lang}): нет ссылки на dmg, есть «скоро»`, async () => {
        const container = await AstroContainer.create();
        // Тип мира — свой контракт (WorldComponent); контейнеру нужен его тип компонента.
        const html = await container.renderToString(World as Parameters<typeof container.renderToString>[0], {
          props: { lang, product: { ...base, id, release: { status: 'soon' } } },
        });
        expect(html).not.toMatch(/\.dmg/i);
        expect(html).not.toContain('data-download');
        expect(html).toContain(t(lang).comingSoon);
        expect(html).toContain(base.license);
      });
    }
  }
});
