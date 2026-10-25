import type { Lang } from '../lib/schema';
import { en } from './en';
import { ru, type Dict } from './ru';

export type { Dict };

/** Словарь по языку. */
export function t(lang: Lang): Dict {
  return lang === 'ru' ? ru : en;
}
