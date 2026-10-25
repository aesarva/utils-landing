// Реестр миров: id продукта → компонент мира.
import type { Lang } from '../lib/schema';
import type { ProductView } from '../lib/products';
import ochre from './ochre/World.astro';
import lidless from './lidless/World.astro';
import subus from './subus/World.astro';

/** Props, которые оболочка передаёт каждому миру (контракт из Task 5). */
export interface WorldProps {
  lang: Lang;
  product: ProductView;
}

/** Компонент мира: публичный тип без внутренних модулей Astro; TypeScript проверяет props каждого мира. */
export type WorldComponent = (props: WorldProps) => unknown;

export const worlds: Record<string, WorldComponent> = { ochre, lidless, subus };
