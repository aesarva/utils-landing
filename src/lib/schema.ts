// Схемы контента без зависимостей от виртуальных модулей Astro:
// модуль можно импортировать из скриптов под tsx (загрузчик продуктов, валидатор).
import { z } from 'astro/zod';

export const LANGS = ['ru', 'en'] as const;
export type Lang = (typeof LANGS)[number];

/** Текст на обоих языках: пустая строка и отсутствие языка запрещены. */
export const localizedSchema = z.object({ ru: z.string().min(1), en: z.string().min(1) });

/**
 * Имена, которые нельзя брать в id: `/en/` — английский хаб, `hub` — ключ мира хаба
 * (src/worlds/hub, data-world="hub"), `/fonts/` — общая папка шрифтов.
 */
export const RESERVED_IDS = ['en', 'hub', 'fonts'] as const;

/** Пиктограммы фактов, которые умеет рисовать хаб. */
export const FACT_ICONS = ['chip', 'heat', 'gauge', 'bell', 'laptop', 'battery', 'moon', 'power', 'coins', 'calendar', 'lock', 'menubar'] as const;

export const productSchema = z.object({
  /** kebab-case: идёт в URL `/<id>/` */
  id: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    .refine((id) => !(RESERVED_IDS as readonly string[]).includes(id), {
      error: (issue) =>
        `id «${String(issue.input)}» зарезервирован (${RESERVED_IDS.join(', ')}): занят маршрутом или служебной папкой`,
    }),
  name: z.string().min(1),
  order: z.number().int().min(1),
  /** `владелец/репозиторий` на GitHub */
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
  /** базовое имя dmg-ассета: `<dmg>-<X.Y.Z>.dmg` */
  dmg: z.string().min(1),
  license: z.string().min(1),
  requires: z.object({
    /** только мажорная версия: «14», а не «14.0» */
    macos: z.string().regex(/^\d+$/),
    arch: z.enum(['universal', 'apple-silicon']),
  }),
  icon: z.string().min(1),
  tagline: localizedSchema,
  /** Релиз скрыт: сайт показывает «скоро» и не даёт ссылку на скачивание, даже если релиз в GitHub есть. */
  hold: z.boolean().optional(),
  /** Короткие факты из README продукта для полосы хаба, с пиктограммой из набора хаба. */
  facts: z
    .array(z.object({ icon: z.enum(FACT_ICONS), text: localizedSchema }))
    .min(1)
    .max(4),
});
export type Product = z.infer<typeof productSchema>;

/** Состояние релиза продукта: снимок releases.json. */
export const releaseSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('released'),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    url: z.string().url(),
    size: z.number().int().min(0),
    publishedAt: z.string(),
  }),
  z.object({ status: z.literal('soon') }),
]);
export type Release = z.infer<typeof releaseSchema>;

/** releases.json: id продукта → релиз. */
export const releasesFileSchema = z.record(z.string(), releaseSchema);
export type Releases = z.infer<typeof releasesFileSchema>;
