import { describe, expect, it } from 'vitest';
import { productIcon } from '../../src/lib/icons';

describe('productIcon', () => {
  it('берёт файл из поля icon записи, а не всегда icon.png', () => {
    const plain = productIcon({ id: 'ochre', icon: 'icon.png' });
    const big = productIcon({ id: 'ochre', icon: 'icon-256.png' });
    expect(plain.width).toBeGreaterThan(0);
    expect(big.width).toBe(256);
    expect(big.src).not.toBe(plain.src);
  });

  it('иконка не png (jpg) тоже находится', () => {
    const jpg = productIcon({ id: 'ochre', icon: 'hero.jpg' });
    expect(jpg.format).toBe('jpg');
  });

  it('нет файла — понятная ошибка с путём', () => {
    expect(() => productIcon({ id: 'ochre', icon: 'logo.webp' })).toThrow(
      'нет иконки продукта ochre: src/assets/products/ochre/logo.webp',
    );
  });
});
