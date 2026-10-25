// Вытисненные в картоне иконки продуктов (плиты мира хаба). Плита обязательна для каждого продукта:
// assets/plates/icon-<id>.png плюс строка импорта ниже; валидатор проверяет и то, и другое.
import type { ImageMetadata } from 'astro';
import type { ProductView } from '../../lib/products';
import ochre from '../../../assets/plates/icon-ochre.png';
import lidless from '../../../assets/plates/icon-lidless.png';
import subus from '../../../assets/plates/icon-subus.png';

const plates: Record<string, ImageMetadata> = { ochre, lidless, subus };

export function embossedIcon(p: ProductView): ImageMetadata {
  if (!Object.hasOwn(plates, p.id)) throw new Error(`нет вытисненной иконки для ${p.id}: assets/plates/icon-${p.id}.png и строка в src/worlds/hub/emboss.ts`);
  return plates[p.id];
}
