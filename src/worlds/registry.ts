// Реестр миров: id продукта → компонент мира.
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import ochre from './ochre/World.astro';
import lidless from './lidless/World.astro';
import subus from './subus/World.astro';

export const worlds: Record<string, AstroComponentFactory> = { ochre, lidless, subus };
