// Вытисненные в картоне иконки продуктов (плиты мира хаба). Продукт без своей плиты
// показывает обычную иконку — хаб от этого не ломается; плиту можно добавить строкой ниже.
import type { ImageMetadata } from 'astro';
import { productIcon } from '../../lib/icons';
import type { ProductView } from '../../lib/products';
import ochre from '../../../assets/plates/icon-ochre.png';
import lidless from '../../../assets/plates/icon-lidless.png';
import subus from '../../../assets/plates/icon-subus.png';

const plates: Record<string, ImageMetadata> = { ochre, lidless, subus };

export function embossedIcon(p: ProductView): ImageMetadata {
  return Object.hasOwn(plates, p.id) ? plates[p.id] : productIcon(p);
}
