# Сайт утилит CyberTech team — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Публичный сайт `https://utils.cyber-tech.online`: хаб CyberTech team и страница на каждый продукт (Ochre, Lidless, Subus), ru/en. Версии и ссылки на DMG берутся из GitHub Releases, выкладка — через CI на VPS атласа.

**Architecture:** Astro 7, статическая сборка. Продукты — YAML-коллекция; релизы — снимок `src/data/releases.json`, который `scripts/fetch-releases.ts` обновляет из GitHub API перед каждой сборкой. Общая оболочка (`Shell.astro`: head, переключатель языка, ссылка в хаб, футер) берёт цвета и шрифт из CSS-переменных мира. Каждый продукт рендерится своим компонентом мира из `src/worlds/<id>/`. Сначала строится и выкладывается каркас на мирах-заглушках (индексация выключена), потом миры по очереди проектируются через impeccable, и последняя задача включает индексацию.

**Tech Stack:** Node 24.21.0, Astro ^7.3.8, TypeScript ^6, Zod (`astro/zod`), yaml ^2.6, tsx, Vitest ^5, Playwright ^1.64 + @axe-core/playwright, bash, nginx 1.28, acme.sh, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-24-utils-landing-design.md`

## Global Constraints

- Домен `utils.cyber-tech.online`; сервер `185.36.144.150`, доступ `root` по ключу `~/.ssh/serverspace`.
- Маршруты: `/`, `/en/`, `/<id>/`, `/en/<id>/`; `trailingSlash: 'always'`, `build.format: 'directory'`. `x-default` → русская версия.
- Язык определяется только маршрутом: без автоопределения и редиректов.
- Тексты ru и en обязательны везде, где есть текст.
- Не выдумывать отзывы, прессу, счётчики, рейтинги, сравнения с конкурентами. Скриншоты — только реальные из репо продуктов. Логотипы сторонних сервисов не использовать.
- Номер версии в текстах миров не пишется: он приходит из `releases.json`.
- Факты продукта — из `develop` его репо (`../ochre`, `../lidless`, `../subus`): README ru/en, CHANGELOG, PRODUCT.md, DESIGN.md. При расхождении верны README, CHANGELOG и GitHub.
- Лицензии: Ochre — MIT, Lidless и Subus — GPL-3.0.
- Ассет релиза: тег `v<X.Y.Z>`, файл `<dmg>-<X.Y.Z>.dmg`, релиз не draft и не prerelease.
- Сборка не должна падать из-за GitHub API: при любой ошибке остаётся снимок.
- В собранном HTML нет инлайновых `<script>` без `src`: CSP `script-src 'self'`.
- Каждый мир (и хаб) определяет `--shell-ink`, `--shell-ground`, `--shell-accent`, `--shell-font`.
- Комментарии в коде и сообщения валидатора — по-русски, как в hollow-haven-atlas. Коммиты — conventional, по-английски.
- Работа в ветках от `develop`, вливание `git merge --no-ff`.

## Review Focus

1. **Новый продукт без записи в снимке, сборка офлайн или API лежит.** Ожидание: продукт становится `soon` с предупреждением, сборка не падает. Тест — Task 3, `mergeReleases`.
2. **Размер DMG в разных языках.** Ожидание: `7,1 МБ` в ru и `7.1 MB` в en, без `NaN` при отсутствии размера. Тест — Task 4, `formatSize`.
3. **Адрес без слэша (`/ochre`).** Ожидание: 301 на `/ochre/` без порта 8443 в `Location`. Проверка — Task 10, `smoke.sh`.
4. **Живой `releases.json` недоступен при часовом запуске** (первый деплой, 404, таймаут). Ожидание: считается, что изменилось, деплой идёт. Тест — Task 10, `releasesChanged`.
5. **`id` продукта с заглавными или пробелами.** Ожидание: валидатор отвергает, а не строит битый маршрут. Тест — Task 2, схема.

---

## Структура файлов

```
.nvmrc  package.json  astro.config.mjs  tsconfig.json  vitest.config.ts  playwright.config.ts
src/
  content.config.ts            коллекция products (только подключение)
  content/products/{ochre,lidless,subus}.yaml
  data/releases.json           снимок релизов
  lib/schema.ts                Zod-схемы продукта и релизов (без astro:*)
  lib/releases.ts              разбор ответа GitHub API, слияние со снимком (чистые функции)
  lib/routes.ts                языки, пути, alternates
  lib/products.ts              ProductView: слияние продукта с релизом, сортировка, formatSize
  lib/site.ts                  SITE, INDEXABLE, ORG
  lib/validate.ts              правила валидатора (чистая функция)
  i18n/ru.ts  i18n/en.ts  i18n/index.ts
  layouts/Shell.astro
  components/shell/{TopBar,LangSwitch,HubLink,Footer}.astro
  views/{HubPage,ProductPage}.astro
  worlds/registry.ts
  worlds/hub/HubWorld.astro
  worlds/{ochre,lidless,subus}/World.astro
  pages/index.astro  pages/en/index.astro
  pages/[product]/index.astro  pages/en/[product]/index.astro
  pages/404.astro  pages/sitemap.xml.ts  pages/robots.txt.ts  pages/releases.json.ts
src/assets/products/<id>/      картинки из репо продуктов
scripts/
  load-products.ts             чтение YAML под tsx (для fetch-releases и validate)
  fetch-releases.ts  validate.ts  sync-assets.ts  releases-changed.ts  smoke.sh
server/
  bin/utils-receive  nginx/utils-http.conf  nginx/utils-https.conf  README.md
tests/unit/*.test.ts  tests/unit/fixtures/  tests/e2e/*.spec.ts
.github/workflows/publish.yml
```

---

### Task 1: Каркас проекта

**Files:**
- Create: `.nvmrc`, `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `src/pages/index.astro` (временная), `tests/unit/smoke.test.ts`
- Commit also: `.claude/`, `.agents/`, `.codex/`, `.impeccable/` (установка impeccable; `*.local.json` уже в `.gitignore`)

**Interfaces:**
- Produces: скрипты npm `dev`, `build`, `build:offline`, `preview`, `check`, `test`, `e2e`, `fetch:releases`, `sync:assets`. На этом шаге `build` — просто `astro build`; Task 3 и Task 6 добавляют шаги перед ним.

- [ ] **Step 1:** Создать ветку `git checkout -b develop && git checkout -b chore/scaffold`.
- [ ] **Step 2:** `.nvmrc` = `24.21.0`. `package.json`: `"type": "module"`, `"private": true`, `engines.node >=24.21.0`, зависимости как в `../hollow-haven-atlas/package.json` (astro ^7.3.8, yaml ^2.6.1; dev: @astrojs/check, typescript ^6.0.3, tsx, vitest ^5.0.4, @playwright/test ^1.64.0, @types/node) плюс `@axe-core/playwright`. `npm install`.
- [ ] **Step 3:** `astro.config.mjs`: `site: 'https://utils.cyber-tech.online'`, `trailingSlash: 'always'`, `build: { format: 'directory' }`, `vite: { build: { assetsInlineLimit: 0 } }`. `vitest.config.ts` и `playwright.config.ts` — копии атласа. В Playwright проекты заменить на `phone` 390×844 (`hasTouch`), `tablet` 1180×820, `desktop` 1440×900, порт 4329.
- [ ] **Step 4:** Написать `tests/unit/smoke.test.ts`: `expect(1 + 1).toBe(2)`. Временная `src/pages/index.astro` с `<h1>utils</h1>`.
- [ ] **Step 5:** Проверить: `npm test` → 1 passed; `npm run build` → `dist/index.html` существует; `npx astro check` → 0 errors.
- [ ] **Step 6:** Коммит: `git add -A && git commit -m "chore: Astro scaffold, test runners, impeccable install"`.

---

### Task 2: Схемы и данные продуктов

**Files:**
- Create: `src/lib/schema.ts`, `src/content.config.ts`, `src/content/products/{ochre,lidless,subus}.yaml`, `scripts/load-products.ts`
- Test: `tests/unit/schema.test.ts`

**Interfaces:**
- Produces (`src/lib/schema.ts`, импорт `z` из `astro/zod`):
  - `LANGS = ['ru', 'en'] as const`, `type Lang = (typeof LANGS)[number]`
  - `localizedSchema = z.object({ ru: z.string().min(1), en: z.string().min(1) })`
  - `productSchema`: `{ id: /^[a-z0-9]+(-[a-z0-9]+)*$/, name, order: int ≥ 1, repo: /^[\w.-]+\/[\w.-]+$/, dmg: string, license: string, requires: { macos: /^\d+$/, arch: 'universal' | 'apple-silicon' }, icon: string, tagline: localizedSchema }`, `type Product = z.infer<…>`
  - `releaseSchema = z.discriminatedUnion('status', [ { status: 'released', version: /^\d+\.\d+\.\d+$/, url: z.string().url(), size: int ≥ 0, publishedAt: z.string() }, { status: 'soon' } ])`, `type Release`
  - `releasesFileSchema = z.record(z.string(), releaseSchema)`, `type Releases`
- Produces (`scripts/load-products.ts`): `readProducts(root: string): { path: string; data: unknown }[]` — все `src/content/products/*.yaml`, отсортированные по имени файла.

- [ ] **Step 1: Тесты схемы** (`tests/unit/schema.test.ts`):
  - `productSchema` принимает каждую из трёх YAML-записей (прочитать через `readProducts(process.cwd())`).
  - Отвергает `id: 'Ochre'`, `id: 'my app'` и `id: '-x'` (Review Focus 5).
  - Отвергает `tagline` без `en`; `requires.macos: '14.0'`; `repo: 'ochre'`.
  - `releaseSchema` принимает `{ status: 'soon' }`; отвергает `released` без `url`; отвергает `version: 'v1.0.0'`.
- [ ] **Step 2:** `npm test -- schema` → FAIL (модуля нет).
- [ ] **Step 3:** Реализовать `schema.ts` и `load-products.ts` (через `yaml.parse`). `content.config.ts`: коллекция `products`, `glob({ pattern: '*.yaml', base: './src/content/products' })`, `schema: productSchema`. YAML-записи:
  - `ochre`: order 1, repo `aesarva/ochre`, dmg `Ochre`, license `MIT`, macos `"26"`, universal, icon `icon.png`;
  - `lidless`: order 2, `aesarva/lidless`, `Lidless`, `GPL-3.0`, `"14"`, universal;
  - `subus`: order 3, `aesarva/subus`, `Subus`, `GPL-3.0`, `"14"`, universal.
  - `tagline` ru/en — первая строка-подзаголовок из README продукта (`README.ru.md` / `README.md`, ветка `develop`).
- [ ] **Step 4:** `npm test -- schema` → PASS.
- [ ] **Step 5:** Коммит `feat(data): product schema and the three product records`.

---

### Task 3: Релизы из GitHub API

**Files:**
- Create: `src/lib/releases.ts`, `scripts/fetch-releases.ts`, `src/data/releases.json`
- Modify: `package.json` (`fetch:releases`, `build`, `build:offline`)
- Test: `tests/unit/releases.test.ts`, `tests/unit/fixtures/github/*.json` (записанные ответы)

**Interfaces:**
- Consumes: `Product`, `Release`, `Releases`, `releaseSchema` из Task 2; `readProducts`.
- Produces (`src/lib/releases.ts`):
  - `type FetchOutcome = { kind: 'ok'; release: Release } | { kind: 'error'; message: string }`
  - `parseLatestRelease(product: Pick<Product, 'repo' | 'dmg'>, response: { status: number; body: unknown }): FetchOutcome`
  - `mergeReleases(ids: string[], snapshot: Releases, outcomes: Record<string, FetchOutcome>): { releases: Releases; warnings: string[] }` — результат содержит ровно `ids`, ключи отсортированы.
  - `serializeReleases(r: Releases): string` — JSON с отступом 2, отсортированные ключи, перевод строки в конце.

- [ ] **Step 1: Записать фикстуры:** `gh api repos/aesarva/ochre/releases/latest > tests/unit/fixtures/github/ochre-latest.json`, то же для `lidless`. Остальные случаи — правкой копии: `no-asset.json` (без DMG), `mismatch.json` (тег v1.1.3, ассет `Ochre-1.1.2.dmg`), `bad-tag.json` (тег `1.1.3`).
- [ ] **Step 2: Тесты** (`releases.test.ts`):
  - `parseLatestRelease` на `ochre-latest.json` → `ok`, `status: 'released'`, `version` равна тегу без `v`, `url` оканчивается на `/Ochre-<version>.dmg`, `size > 0`.
  - `{ status: 404 }` → `ok` с `{ status: 'soon' }`.
  - `no-asset`, `mismatch`, `bad-tag`, `{ status: 403 }`, `{ status: 200, body: 'garbage' }` → `error`.
  - Ассет `appcast.xml` и `Lidless.dmg` рядом с `Lidless-0.3.0.dmg` не мешают выбору.
  - `mergeReleases`: при `error` и записи в снимке остаётся запись снимка плюс 1 предупреждение; при `error` без записи → `{ status: 'soon' }` плюс предупреждение (Review Focus 1); id из снимка, которых нет в `ids`, выпадают.
  - `serializeReleases` стабилен: два вызова с разным порядком ключей дают одну строку.
- [ ] **Step 3:** `npm test -- releases` → FAIL.
- [ ] **Step 4:** Реализовать `releases.ts`. `scripts/fetch-releases.ts`:
  - читает продукты и снимок;
  - при `RELEASES_OFFLINE=1` ничего не запрашивает, только проверяет, что снимок читается;
  - иначе для каждого продукта `fetch('https://api.github.com/repos/<repo>/releases/latest', { headers: Accept application/vnd.github+json, User-Agent utils-landing, Authorization Bearer $GITHUB_TOKEN если задан, signal: AbortSignal.timeout(10_000) })`; исключение fetch → `error`;
  - пишет файл через `serializeReleases`, печатает предупреждения в stderr, всегда выходит с кодом 0.
- [ ] **Step 5:** `package.json`: `"fetch:releases": "tsx scripts/fetch-releases.ts"`, `"build": "npm run fetch:releases && astro build"`, `"build:offline": "RELEASES_OFFLINE=1 npm run build"`.
- [ ] **Step 6:** `npm test -- releases` → PASS. `npm run fetch:releases` → в `src/data/releases.json` Ochre и Lidless `released`, Subus `released` или `soon` в зависимости от того, вышел ли 1.0.0.
- [ ] **Step 7:** Коммит `feat(releases): latest releases from GitHub API with snapshot fallback`.

---

### Task 4: Маршруты, представление продукта, словари

**Files:**
- Create: `src/lib/site.ts`, `src/lib/routes.ts`, `src/lib/products.ts`, `src/i18n/{ru,en,index}.ts`
- Test: `tests/unit/routes.test.ts`, `tests/unit/products.test.ts`

**Interfaces:**
- Produces (`site.ts`): `SITE = 'https://utils.cyber-tech.online'`, `INDEXABLE = false`, `ORG = { name: 'CyberTech team', github: 'https://github.com/aesarva' }`.
- Produces (`routes.ts`):
  - `pagePath(lang: Lang, productId?: string): string` → `/`, `/en/`, `/ochre/`, `/en/ochre/`
  - `otherLang(lang: Lang): Lang`
  - `alternates(productId?: string): { hreflang: 'ru' | 'en' | 'x-default'; href: string }[]` — абсолютные URL; `x-default` = ru.
- Produces (`products.ts`):
  - `type ProductView = Product & { release: Release }`
  - `withReleases(products: Product[], releases: Releases): ProductView[]` — сортировка по `order`; если записи нет, бросает `Error('нет записи релиза для <id>')`.
  - `formatSize(bytes: number | undefined, lang: Lang): string` — МБ/MB (1 МБ = 1 048 576 байт) с одним знаком (`7,1 МБ` / `7.1 MB`), целые без `,0`; `undefined` → `''`.
- Produces (`i18n/index.ts`): `t(lang: Lang): Dict`. Ключи `Dict`: `download`, `comingSoon`, `source`, `requires(macos: string): string`, `universal`, `appleSilicon`, `hub`, `langLabel`, `langName`, `footerOrg`, `notFoundTitle`, `notFoundBody`, `hubTitle`, `hubDescription`.

- [ ] **Step 1: Тесты:**
  - `pagePath('ru')==='/'`, `pagePath('en','ochre')==='/en/ochre/'`.
  - `alternates('lidless')` содержит `x-default` → `https://utils.cyber-tech.online/lidless/`.
  - `withReleases` сортирует по `order` и бросает на отсутствующую запись.
  - `formatSize(7_340_032,'ru')==='7 МБ'`, `formatSize(7_444_889,'en')==='7.1 MB'`, `formatSize(7_444_889,'ru')==='7,1 МБ'`, `formatSize(undefined,'en')===''` (Review Focus 2).
  - Словари ru и en имеют одинаковый набор ключей.
- [ ] **Step 2:** `npm test -- routes products` → FAIL.
- [ ] **Step 3:** Реализовать. Тексты словарей — нейтральные рабочие. Финальный тон задаёт мир хаба в Task 13.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Коммит `feat: routes, product view, shell dictionaries`.

---

### Task 5: Оболочка, страницы, миры-заглушки

**Files:**
- Create: `src/layouts/Shell.astro`, `src/components/shell/{TopBar,LangSwitch,HubLink,Footer}.astro`, `src/views/{HubPage,ProductPage}.astro`, `src/worlds/registry.ts`, `src/worlds/hub/HubWorld.astro`, `src/worlds/{ochre,lidless,subus}/World.astro`, `src/pages/{index,en/index,[product]/index,en/[product]/index,404}.astro`, `src/pages/{sitemap.xml,robots.txt,releases.json}.ts`
- Delete: временная `src/pages/index.astro` из Task 1 (заменяется)

**Interfaces:**
- Consumes: Task 2 (`getCollection('products')`), Task 3 (`src/data/releases.json`), Task 4.
- Produces:
  - `Shell.astro` props: `{ lang: Lang; title: string; description: string; productId?: string; isHub?: boolean }`. Рендерит `<html lang>`, `<title>`, `meta description`, `canonical`, `alternates`, `meta robots noindex` при `!INDEXABLE`, favicon, затем `<TopBar>` (на хабе без `HubLink`), `<slot/>`, `<Footer>`. У оболочки нет своих цветов: только `var(--shell-*)`.
  - `registry.ts`: `export const worlds: Record<string, AstroComponentFactory> = { ochre, lidless, subus }`.
  - Props мира продукта: `{ lang: Lang; product: ProductView }`. Props мира хаба: `{ lang: Lang; products: ProductView[] }`.
  - `ProductPage.astro` props `{ lang, productId }`: находит продукт и мир; при отсутствии мира бросает ошибку.

- [ ] **Step 1:** Оболочка и представления по Interfaces. `LangSwitch` — обычная ссылка на `pagePath(otherLang(lang), productId)` с `hreflang` и `lang`, без JS.
- [ ] **Step 2:** Миры-заглушки, один на продукт, одинаковые по устройству:
  - задают четыре `--shell-*` нейтральными значениями;
  - показывают иконку, `name`, `tagline[lang]`;
  - блок скачивания: при `released` — ссылка на `release.url`, версия, `formatSize`, `t.requires(product.requires.macos)`; при `soon` — `t.comingSoon` без ссылки;
  - ссылка на исходники `https://github.com/<repo>`.
  `HubWorld` — список карточек со ссылками на `pagePath(lang, id)`.
- [ ] **Step 3:** Страницы. `[product]/index.astro` и `en/[product]/index.astro` — `getStaticPaths` из коллекции. `404.astro` — оба текста (`t('ru')` и `t('en')`), ссылки на `/` и `/en/`, мир хаба.
- [ ] **Step 4:** Эндпоинты:
  - `releases.json.ts` отдаёт `serializeReleases(snapshot)`;
  - `sitemap.xml.ts` перечисляет все 8 страниц с `xhtml:link` alternates;
  - `robots.txt.ts`: при `INDEXABLE` — `Allow: /` и строка `Sitemap:`, иначе `Disallow: /`.
- [ ] **Step 5:** Проверить:
  - `npm run build:offline` → в `dist/` есть `index.html`, `en/index.html`, `{ochre,lidless,subus}/index.html`, `en/*/index.html`, `404.html`, `sitemap.xml`, `robots.txt`, `releases.json`;
  - `grep -L 'noindex' dist/**/*.html` пусто;
  - `grep -l '<script>' -r dist` (инлайн без `src`) пусто;
  - `npx astro check` → 0 errors.
- [ ] **Step 6:** Коммит `feat: shell, pages, endpoints and stub worlds`.

---

### Task 6: Валидатор

**Files:**
- Create: `src/lib/validate.ts`, `scripts/validate.ts`
- Modify: `package.json` (`build`: `npm run fetch:releases && tsx scripts/validate.ts && astro build`)
- Test: `tests/unit/validate.test.ts`

**Interfaces:**
- Consumes: схемы Task 2, `LANGS`, словари Task 4.
- Produces: `validateSite(input: SiteInput): string[]` — список ошибок по-русски, каждая с путём файла. Поля `SiteInput`:
  - `products: { path: string; data: unknown }[]`
  - `releases: unknown`
  - `registryIds: string[]`
  - `worldDirs: string[]`
  - `worldStyles: Record<string, string>` — склеенный текст `.astro` и `.css` мира, ключ `hub` для хаба
  - `assetExists(id: string, file: string): boolean`
  - `dicts: Record<Lang, object>`
- `scripts/validate.ts` собирает `SiteInput` с диска (`registryIds` — разбором ключей `worlds = {…}` в `registry.ts` регуляркой), печатает ошибки и выходит с кодом 1, если они есть.

- [ ] **Step 1: Тесты** — по случаю на каждое правило спека (раздел 5):
  - запись не по схеме;
  - повтор `id`;
  - повтор `order`;
  - нет записи в `releases`;
  - лишний id в `releases`;
  - `released` с `url` не из `https://github.com/<repo>/releases/download/`;
  - id без записи в реестре;
  - лишний id в реестре;
  - нет папки мира;
  - мир без `--shell-accent:`;
  - хаб без `--shell-font:`;
  - отсутствует `icon`;
  - ключи словарей ru и en различаются.
  Плюс: корректный вход → `[]`.
- [ ] **Step 2:** `npm test -- validate` → FAIL.
- [ ] **Step 3:** Реализовать `validateSite` и `scripts/validate.ts`. Подключить в `build`.
- [ ] **Step 4:** `npm test` → PASS. `npm run build:offline` → проходит. Временно удалить `--shell-ink` из мира `subus` → сборка падает с сообщением `src/worlds/subus: нет --shell-ink`; вернуть.
- [ ] **Step 5:** Коммит `feat: site validator before build`.

---

### Task 7: Синхронизация картинок

**Files:**
- Create: `scripts/sync-assets.ts`, `src/assets/products/{ochre,lidless,subus}/*`
- Modify: `package.json` (`"sync:assets": "tsx scripts/sync-assets.ts"`), миры-заглушки (иконка через `astro:assets` `<Image>`)
- Test: `tests/unit/sync-assets.test.ts`

**Interfaces:**
- Produces:
  - `sourceDirs(id: string, projectsRoot: string): string[]` — `[<root>/<id>/docs/images]` плюс `EXTRA[id]`, где `EXTRA = { ochre: ['site/img'] }`, а папка репо по умолчанию `<root>/<id>` (`REPO_DIR` для исключений, сейчас пустой).
  - CLI: `npm run sync:assets -- <id>…` (без аргументов — все продукты). Копирует `*.{png,jpg,jpeg,webp}` в `src/assets/products/<id>/`, печатает число файлов, удаляет файлы, которых нет в источнике.

- [ ] **Step 1: Тест** `sourceDirs`:
  - `sourceDirs('ochre','/p')` → `['/p/ochre/docs/images','/p/ochre/site/img']`;
  - `sourceDirs('subus','/p')` → `['/p/subus/docs/images']`;
  - копирование во временную папку удаляет лишний файл.
- [ ] **Step 2:** FAIL → реализовать → PASS.
- [ ] **Step 3:** Перед синхронизацией убедиться, что в `../ochre`, `../lidless` и `../subus` checked out `develop` (`git -C ../<id> branch --show-current`). Если нет — синхронизировать из `git -C ../<id> worktree` или спросить пользователя, чужую ветку не переключать. Затем `npm run sync:assets`, `npm run build:offline` → иконки в заглушках видны.
- [ ] **Step 4:** Коммит `feat(assets): sync product images from product repos`.

---

### Task 8: E2E

**Files:**
- Create: `tests/e2e/pages.spec.ts`, `tests/e2e/nojs.spec.ts`

**Interfaces:**
- Consumes: список страниц строится в спеке из `readProducts` и `src/data/releases.json` (Node API), без Astro.

- [ ] **Step 1: `pages.spec.ts`** — для каждой из 8 страниц:
  - ответ 200;
  - `document.documentElement.scrollWidth <= innerWidth`;
  - все `img` загружены (`naturalWidth > 0`);
  - каждая внутренняя ссылка (`a[href^="/"]`) отвечает 200 через `request.get`;
  - ссылка переключателя (`a[hreflang]`) ведёт на `pagePath(otherLang, id)`;
  - на странице продукта при `released` есть ссылка с `href === release.url` и текстом версии, при `soon` ссылки на `.dmg` нет;
  - `new AxeBuilder({ page }).analyze()` → нет нарушений с `impact` serious или critical.
  Отдельно: `/no-such-page/` → 404 и текст на обоих языках. И тест без браузера: ни один `dist/**/*.html` не содержит `<script` без атрибута `src` (CSP `script-src 'self'`).
- [ ] **Step 2: `nojs.spec.ts`** — `test.use({ javaScriptEnabled: false })`: на хабе видны ссылки на все три продукта, на странице продукта видна кнопка или «Скоро».
- [ ] **Step 3:** `npm run build:offline && npm run e2e` → всё зелёное на трёх проектах.
- [ ] **Step 4:** Коммит `test(e2e): pages, language switch, downloads, a11y, no-JS`.

---

### Task 9: Сервер — приёмник и nginx

**Files:**
- Create: `server/bin/utils-receive`, `server/nginx/utils-http.conf`, `server/nginx/utils-https.conf`, `server/README.md`
- Test: `tests/unit/utils-receive.test.ts`

**Interfaces:**
- Produces: `utils-receive <sha> < site.tar.gz` (через `SSH_ORIGINAL_COMMAND` или `$1`). Переменные: `UTILS_ROOT` (по умолчанию `/srv/utils/site`), `UTILS_MAX_BYTES` (52428800), `UTILS_MAX_UNPACKED` (209715200). Коды 0/2/3/4/5, как у `atlas-receive`. Обязательные файлы: `index.html`, `en/index.html`, `404.html`.

- [ ] **Step 1: Тест** — адаптировать `../hollow-haven-atlas/tests/unit/atlas-receive.test.ts`: заменить переменные и архив с обязательными файлами (вместо `login/index.html` — `en/index.html` и `404.html`). Случаи:
  - хороший архив;
  - повторная выкладка того же sha с новым содержимым заменяет релиз;
  - пустой stdin откатывает на лежащий релиз;
  - откат на отсутствующий → 3;
  - плохой sha → 2;
  - архив больше `UTILS_MAX_BYTES` → 4;
  - битый → 4;
  - без `404.html` → 5;
  - хранится не больше 5 релизов.
- [ ] **Step 2:** FAIL → скопировать `../hollow-haven-atlas/server/bin/atlas-receive`, заменить имена, переменные, лимиты и проверку файлов → PASS. `chmod +x`.
- [ ] **Step 3:** nginx-конфиги — по образцу `../hollow-haven-atlas/server/nginx/atlas-*.conf` без блоков входа, MinIO и pagefind, с кэшем и заголовками из спека (раздел 4), `add_header … always`. Внутри location с собственными `add_header` повторить заголовки безопасности (у nginx `add_header` в location заменяет серверные). Корень `/srv/utils/site/current`, `acme` — `/var/www/acme`.
- [ ] **Step 4:** `server/README.md` — порядок применения из спека (раздел 4) готовыми командами:
  - `useradd --system --create-home --shell /bin/sh utils-deploy`;
  - `install -o utils-deploy -d /srv/utils/site`;
  - установка приёмника в `/usr/local/bin`;
  - строка `authorized_keys`;
  - выпуск сертификата `acme.sh --issue … --install-cert … --reloadcmd`;
  - симлинки в `sites-enabled`, `nginx -t`, `systemctl reload nginx`;
  - откат: `ssh utils-deploy@… <sha> < /dev/null`.
- [ ] **Step 5:** Проверить синтаксис nginx без сервера: `docker run --rm -v $PWD/server/nginx:/etc/nginx/conf.d:ro nginx:1.28 nginx -t` с подложенными самоподписанными сертификатами по путям из конфига. Если docker недоступен, проверка переносится на сервер (Task 11, `nginx -t` до reload).
- [ ] **Step 6:** Коммит `feat(server): release receiver, nginx configs, runbook`.

---

### Task 10: CI и смоук

**Files:**
- Create: `.github/workflows/publish.yml`, `scripts/releases-changed.ts`, `scripts/smoke.sh`
- Test: `tests/unit/releases-changed.test.ts`

**Interfaces:**
- Produces:
  - `releasesChanged(built: string, fetchLive: () => Promise<string>): Promise<boolean>` — `true`, если живой файл отличается (после `JSON.parse`) или `fetchLive` бросает. CLI `tsx scripts/releases-changed.ts dist/releases.json <url>` печатает `changed=true|false` в `$GITHUB_OUTPUT`, если он задан, иначе в stdout.
  - `scripts/smoke.sh <base-url>` — код 0 или 1, по строке на проверку.

- [ ] **Step 1: Тест `releasesChanged`:**
  - одинаковое содержимое с разными пробелами → `false`;
  - другая версия → `true`;
  - `fetchLive` бросает (404/таймаут) → `true` (Review Focus 4).
- [ ] **Step 2:** FAIL → реализовать → PASS.
- [ ] **Step 3: `smoke.sh`** (curl):
  - 200 на `/`, `/en/` и `/<id>/`, `/en/<id>/` для id из `src/content/products/*.yaml`;
  - 404 на `/no-such-page/`;
  - `/ochre` → 301, `Location: /ochre/` и без `:8443` (Review Focus 3);
  - для https — `curl -sv` с `subject`/`subjectAltName`, где есть `utils.cyber-tech.online`.
  Проверки 301 и сертификата выполняются только для `https://`-адреса (это поведение nginx, не preview). Проверить скрипт против `npx astro preview --port 4329` → остальные проверки зелёные.
- [ ] **Step 4: `publish.yml`** — по разделу 4 спека:
  - `on: push develop`, `schedule '17 * * * *'`, `workflow_dispatch`;
  - `concurrency: { group: publish, cancel-in-progress: false }`, `permissions: contents: read`;
  - job `build`: `npm run build` с `GITHUB_TOKEN: ${{ github.token }}`; для `schedule` — шаг `releases-changed` с `id`, `outputs.changed`;
  - job `deploy`: `if: github.event_name != 'schedule' || needs.build.outputs.changed == 'true'`, SSH как у атласа, но `utils-deploy@185.36.144.150` и секреты `UTILS_DEPLOY_KEY` / `UTILS_KNOWN_HOSTS`;
  - проверка: `release.txt` начинается с `$GITHUB_SHA`, живой `releases.json` совпадает с артефактным (`releases-changed` → `false`), затем `scripts/smoke.sh https://utils.cyber-tech.online`.
  `tar` нужно распаковать в deploy-job, чтобы `releases.json` был на месте для сравнения.
- [ ] **Step 5:** `actionlint .github/workflows/publish.yml` (`brew install actionlint`, если нет) → без ошибок.
- [ ] **Step 6:** Коммит `ci: build, hourly release refresh, deploy and smoke`.

---

### Task 11: Выход в сеть (заглушки, без индексации)

Внешние действия: создание репозитория, секреты, изменения на сервере. **Перед Step 1 спросить пользователя явное «да».**

- [ ] **Step 1:** Влить `chore/scaffold` и последующие ветки в `develop` (`--no-ff`). `gh repo create aesarva/utils-landing --private --source . --remote origin`, затем `git push -u origin main develop`, `gh repo edit aesarva/utils-landing --default-branch develop`.
- [ ] **Step 2:** Ключ выкладки: `ssh-keygen -t ed25519 -N '' -C utils-deploy -f <scratchpad>/utils-deploy`.
  - `gh secret set UTILS_DEPLOY_KEY < <scratchpad>/utils-deploy`;
  - `ssh-keyscan -t ed25519 185.36.144.150 | gh secret set UTILS_KNOWN_HOSTS`;
  - после установки на сервер удалить приватный ключ из scratchpad.
- [ ] **Step 3:** Сервер (`ssh -i ~/.ssh/serverspace root@185.36.144.150`): выполнить `server/README.md` по шагам. Перед каждым `systemctl reload nginx` — `nginx -t`. Проверить, что `atlas.hollow-haven.com` и `cyber-tech.online` после reload отвечают как раньше (`curl -sI` до и после).
- [ ] **Step 4:** Проверить, что xray пропускает SNI `utils.cyber-tech.online` в nginx: `curl -sI https://utils.cyber-tech.online/` → ответ nginx (сертификат валиден). Если xray не отдаёт, остановиться и показать пользователю конфиг xray — не править его без согласия.
- [ ] **Step 5:** `gh workflow run publish.yml --ref develop`, `gh run watch` → обе задачи зелёные. `scripts/smoke.sh https://utils.cyber-tech.online` → 0. `curl -s https://utils.cyber-tech.online/robots.txt` → `Disallow: /`.
- [ ] **Step 6:** Записать в `server/README.md` фактическое состояние (дата, что применено), коммит `docs(server): applied on 2026-10-xx`, push.

---

### Task 12: Контекст impeccable для сайта

Выполняется в главной сессии (нужны ответы пользователя), не субагентом.

- [ ] **Step 1:** Ветка `design/context`. `/impeccable init` по `reference/init.md`:
  - платформа web;
  - автор CyberTech team;
  - аудитория — пользователи Mac ru/en;
  - режим Persuade;
  - «Evidence on Hand» и запреты — из Global Constraints;
  - стек — Astro, миры в `src/worlds/<id>/`, контракт `--shell-*`.
- [ ] **Step 2:** Пользователь подтверждает `PRODUCT.md`. Коммит `docs: site PRODUCT.md for impeccable`, merge в `develop`.

---

### Tasks 13–16: Миры — хаб, Ochre, Lidless, Subus

Один и тот же цикл на каждый мир, строго по очереди: хаб → Ochre → Lidless → Subus. Выполняется в главной сессии: impeccable требует утверждения направления и компа пользователем. Каждый мир — ветка `design/<id>`.

**Files (на мир):** `src/worlds/<id>/**` (хаб: `src/worlds/hub/**`, плюс финальный тон словарей `src/i18n/*.ts`), `public/fonts/<id>/**` при необходимости, `src/worlds/<id>/DESIGN.md` (хаб: корневой `DESIGN.md`), `.impeccable/**`.

**Interfaces:** props мира и контракт `--shell-*` из Task 5 не меняются. Если мир требует изменить оболочку, это отдельный коммит в `src/components/shell/` с повторным прогоном e2e по всем страницам.

- [ ] **Step 1: Материалы.** Перечитать `develop` продукта: README ru/en, CHANGELOG, PRODUCT.md, DESIGN.md (`git -C ../<id> show develop:<file>`). Если с Task 7 картинки обновились — `npm run sync:assets -- <id>`.
- [ ] **Step 2: impeccable new-work** (`reference/new-work.md`): вопросы по поверхности → направление → комп. **Стоп до утверждения пользователем.**
- [ ] **Step 3: Вёрстка** мира вместо заглушки. Перед правками — `reference/craft-floor.md`. Использовать только факты и картинки из Step 1, без номера версии в тексте.
- [ ] **Step 4: Проверки:**
  - `npm test && npm run build:offline && npm run e2e` → зелёные;
  - просмотр в браузере (Playwright MCP) на 390, 1180 и 1440, оба языка, светлая и тёмная тема, если мир их поддерживает.
- [ ] **Step 5:** `impeccable-finish-reviewer` против направления и компа → исправить существенное.
- [ ] **Step 6:** `impeccable-documenter` → `DESIGN.md` мира (для хаба — корневой, с разделом «Контракт оболочки»).
- [ ] **Step 7:** Коммиты по ходу. В конце merge `design/<id>` → `develop`, push. CI выкладывает; `scripts/smoke.sh https://utils.cyber-tech.online` → 0. Показать пользователю живую страницу.

Особенности миров (из спека, раздел 6):
- **Хаб (Task 13):** нейтральная витрина CyberTech team, не повторяет ни один мир продукта. Задаёт финальные тексты оболочки и 404.
- **Ochre (Task 14):** табло отправлений, тёплый цвет только для нагрузки и главного действия. MIT; 0.5% CPU и 14 МБ; единственный сетевой запрос — ежедневная проверка обновлений. Старый `../ochre/site/` — только источник контента.
- **Lidless (Task 15):** радиостудия, ON AIR; красный только для «в эфире». Тексты про сеть и автообновления — по `develop` на момент работы (идёт 0.4.0).
- **Subus (Task 16):** схема транспортной линии. Логотипы сервисов на скриншотах — только те, что уже есть в официальных скриншотах репо.

---

### Task 17: Включить индексацию

- [ ] **Step 1:** Ветка `chore/indexing`. `INDEXABLE = true` в `src/lib/site.ts`.
- [ ] **Step 2:** `npm run build:offline` → `grep -rl 'noindex' dist` пусто; `dist/robots.txt` содержит `Sitemap: https://utils.cyber-tech.online/sitemap.xml`. `npm run e2e` → зелёные.
- [ ] **Step 3:** Коммит `feat: open the site for indexing`, merge в `develop`, push. После деплоя `curl -s https://utils.cyber-tech.online/robots.txt` → `Allow: /`; smoke → 0.
- [ ] **Step 4:** Влить `develop` в `main` (`--no-ff`), push.
