# Сайт утилит CyberTech team — дизайн

Дата: 2026-10-24. Статус: утверждён в обсуждении, ждёт ревью спека.

## Цель

Публичный сайт `https://utils.cyber-tech.online` для macOS-утилит CyberTech team: общая
страница-хаб со всеми продуктами и отдельная страница на каждый продукт. Сейчас продуктов три —
Ochre (`../ochre`), Subus (`../subus`), Lidless (`../wakeup`), будут добавляться ещё.

Успех:

- новый продукт добавляется записью данных, картинками и папкой мира, без правки хаба и маршрутов;
- push в `develop` собирает и выкладывает сайт, CI подтверждает, что сайт отдаёт этот коммит;
- каждая страница продукта — свой визуальный мир, при этом навигация (язык, возврат в хаб, футер)
  везде на одном месте и работает одинаково.

## Решения, принятые в обсуждении

| Вопрос | Решение |
|---|---|
| Адрес | `utils.cyber-tech.online` (A-запись уже указывает на `185.36.144.150`) |
| Визуальная связь страниц | Каждая страница — свой мир; хаб — нейтральная витрина |
| Существующий `ochre/site/` | Переделываем с нуля; старый сайт — только источник контента и картинок |
| Имя на хабе | CyberTech team |
| Стек | Astro, статическая сборка (как hollow-haven-atlas) |
| Языки | Русский по умолчанию в корне, английский под `/en/`, переключатель |
| Дизайн | Через impeccable, отдельный цикл new-work на хаб и каждый мир |
| Хостинг | Тот же VPS, что у атласа; отдельный пользователь выкладки, nginx за xray |

## Ограничения контента

- Не выдумывать: отзывы, прессу, счётчики загрузок и пользователей, рейтинги, сравнения
  с конкурентами. Это прямо записано в `PRODUCT.md` продуктов.
- Скриншоты — только реальные рендеры приложений из `docs/images` репозиториев продуктов
  (и `ochre/site/img`). Ассеты, созданные по компу, допустимы для декора мира, но не выдаются
  за интерфейс приложения.
- Логотипы сторонних сервисов (например, в Subus) не используются.
- Факты продукта берутся из `PRODUCT.md` и README (ru/en) продукта. При расхождении верен
  README и GitHub: `ochre/PRODUCT.md` говорит «закрытый код, DMG не выпущен», а репозиторий
  публичный и есть релиз v1.0.0 — на странице Ochre есть ссылка на исходники и скачивание v1.0.0.
  Сам `ochre/PRODUCT.md` в этой задаче не правится.

## 1. Маршруты

`trailingSlash: 'always'`, `build.format: 'directory'`.

```
/                 хаб, ru            /en/              хаб, en
/ochre/           Ochre, ru          /en/ochre/        Ochre, en
/subus/           Subus, ru          /en/subus/        Subus, en
/lidless/         Lidless, ru        /en/lidless/      Lidless, en
/404.html  /robots.txt  /sitemap.xml  /release.txt (пишет сервер)
```

- Адрес продукта — его публичное имя (`lidless`, а не `wakeup`).
- Язык определяется только маршрутом: без автоопределения и редиректов.
- Переключатель ведёт на ту же страницу на другом языке.
- В `<head>` каждой страницы: `<link rel="alternate" hreflang="ru|en|x-default">` и
  `<link rel="canonical">`. `x-default` указывает на русскую версию.
- `404.html` двуязычная (одна страница, оба текста), в мире хаба.

## 2. Структура репозитория

```
src/
  content.config.ts               схема коллекции products (Zod)
  content/products/<id>.yaml      данные продукта
  i18n/ru.ts, i18n/en.ts          строки оболочки: футер, «скачать», «скоро», «исходники», ярлыки языка
  lib/routes.ts                   построение путей и пар hreflang
  lib/products.ts                 загрузка, сортировка, производные поля (активная кнопка и т. п.)
  layouts/Shell.astro             <html lang>, <head>, мета, hreflang, canonical, слот мира
  components/shell/               LangSwitch, HubLink, Footer — без своего цвета и шрифта
  pages/index.astro               хаб, ru
  pages/en/index.astro            хаб, en
  pages/[product]/index.astro     страница продукта, ru
  pages/en/[product]/index.astro  страница продукта, en
  pages/404.astro
  worlds/hub/                     мир хаба (компоненты, стили)
  worlds/<id>/World.astro         мир продукта: вёрстка, стили, тексты ru/en
  worlds/<id>/DESIGN.md           система мира (пишет impeccable-documenter)
  worlds/registry.ts              id → компонент мира (явная таблица, проверяется валидатором)
src/assets/products/<id>/         картинки продукта, синхронизированные из его репо
public/fonts/<world>/             self-hosted шрифты мира, лицензии OFL рядом
scripts/validate.ts               валидатор (см. раздел 5)
scripts/sync-assets.ts            копирует иконку и docs/images/* из репо продукта
server/                           серверная часть (раздел 4)
.github/workflows/publish.yml     CI
PRODUCT.md, DESIGN.md             контекст impeccable: сайт целиком и мир хаба + контракт оболочки
```

Страницы ru и en — тонкие обёртки: берут язык из пути и рендерят один и тот же мир с `lang`.

## 3. Модель продукта

`src/content/products/<id>.yaml`:

```yaml
id: lidless                 # = адрес страницы и ключ в worlds/registry.ts
name: Lidless
order: 3                    # порядок в хабе, по возрастанию
status: released            # released | soon
version: 0.2.0              # обязательно при released
download: https://github.com/aesarva/lidless/releases/download/v0.2.0/Lidless-0.2.0.dmg  # обязательно при released
repo: aesarva/lidless       # ссылка на исходники; необязательно
license: GPL-3.0            # строка, показывается как есть; «free» — бесплатно с закрытым кодом
requires:
  macos: "14"               # минимальная версия
  arch: universal           # universal | apple-silicon
icon: icon.png              # путь внутри src/assets/products/<id>/
tagline:
  ru: "…"                   # для карточки в хабе и <meta name="description">
  en: "…"
```

- Длинные тексты продукта живут в его `World.astro` (композиция у каждого мира своя), а не в YAML.
- `status: soon` — продукт виден в хабе и имеет страницу, но вместо кнопки скачивания — «Скоро» /
  «Coming soon» без ссылки. Сейчас это Subus (релиза нет).
- Начальные значения: Ochre — `released`, v1.0.0, `Ochre-1.0.0.dmg`, macOS 26; Lidless —
  `released`, v0.2.0, `Lidless-0.2.0.dmg`, macOS 14; Subus — `soon`, macOS 14.

### Синхронизация картинок

`npm run sync:assets -- <id>` копирует из `../<repo-dir>/docs/images/` (и для Ochre из
`../ochre/site/img/`) в `src/assets/products/<id>/`. Соответствие id → папка репо лежит в самом
скрипте (`lidless → ../wakeup`). Картинки коммитятся в этот репозиторий: CI не зависит от
соседних репо. Astro оптимизирует их при сборке и проставляет размеры.

### Добавление продукта

1. YAML-запись в `src/content/products/`.
2. Строка соответствия в `scripts/sync-assets.ts`, затем `npm run sync:assets -- <id>`.
3. Папка `src/worlds/<id>/` с `World.astro` (цикл impeccable, раздел 6) и строка в `worlds/registry.ts`.

Хаб, маршруты и sitemap подхватывают запись сами. Если чего-то не хватает, сборку
останавливает валидатор с понятной ошибкой.

## 4. Деплой и сервер

Повторяет схему hollow-haven-atlas, но изолированно от неё.

### Репозиторий и ветки

`git init` в `utils-landing`, ветки `main` и `develop`. Работа ведётся в ветках, они вливаются
в `develop` через `merge --no-ff`. Remote — новый приватный `aesarva/utils-landing`
(создаётся после утверждения плана).

### CI — `.github/workflows/publish.yml`

Запуск по push в `develop`, `concurrency: publish`, токену GitHub — только чтение.

- `build`: checkout без сохранения учётных данных, Node из `.nvmrc`, `npm ci`, `npm test`,
  `npm run build`, `tar -C dist -czf site.tar.gz .`, артефакт на 1 день. Ключа выкладки здесь нет.
- `deploy`: скачивает артефакт, `ssh -i key utils-deploy@185.36.144.150 "$GITHUB_SHA" < site.tar.gz`,
  затем до 6 попыток с паузой 5 с проверяет, что `https://utils.cyber-tech.online/release.txt`
  начинается с `$GITHUB_SHA`.
- Секреты: `UTILS_DEPLOY_KEY` (приватный ключ), `UTILS_KNOWN_HOSTS` (`ssh-keyscan` сервера).

### Сервер

Состояние на 2026-10-24: Ubuntu, nginx 1.28 слушает `:80` и `127.0.0.1:8443`, xray держит `:443`
и отдаёт в nginx соединения с чужим SNI (так уже работают `atlas.hollow-haven.com` и
`cyber-tech.online`), `acme.sh` в `/root/.acme.sh` с cron, сертификаты в `/etc/nginx/ssl/<домен>/`.
Доступ: `root@185.36.144.150`, ключ `~/.ssh/serverspace`.

Файлы в `server/` этого репозитория, применяются один раз по `server/README.md`:

- Пользователь `utils-deploy` (системный, без пароля), `authorized_keys`:
  `restrict,command="/usr/local/bin/utils-receive" <публичный ключ CI>`. Свой ключ, а не ключ
  атласа: утечка одного не затрагивает другой сайт.
- `server/bin/utils-receive` — копия `atlas-receive` с параметрами:
  - корень `/srv/utils/site` (`releases/<sha>`, атомарная ссылка `current`), хранить 5 релизов;
  - лимиты: 50 МБ сжатого, 200 МБ распакованного;
  - обязательные файлы сборки: `index.html`, `en/index.html`, `404.html`;
  - пустой stdin — откат на уже лежащий релиз;
  - пишет `release.txt` (`<sha> <время UTC>`);
  - коды выхода как у атласа (0, 2, 3, 4, 5).
- `server/nginx/utils-http.conf` — `:80`, `/.well-known/acme-challenge/` из `/var/www/acme`,
  остальное 301 на https.
- `server/nginx/utils-https.conf` — `listen 127.0.0.1:8443 ssl`, `http2 on`,
  `server_name utils.cyber-tech.online`, сертификат из `/etc/nginx/ssl/utils.cyber-tech.online/`,
  `root /srv/utils/site/current`, `absolute_redirect off`, `error_page 404 /404.html`,
  `try_files $uri $uri/ =404`. Без входа и без `noindex`.
  - Кэш: `/_astro/` и `/fonts/` — `max-age=31536000, immutable`; HTML — `no-cache`;
    `release.txt` — `expires -1`.
  - Заголовки: `Content-Security-Policy` (`default-src 'self'`; `img-src 'self' data:`;
    `style-src 'self' 'unsafe-inline'`, так как Astro инлайнит стили; `script-src 'self'`;
    `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`,
    `Referrer-Policy: strict-origin-when-cross-origin`.
  - Ссылки скачивания ведут на github.com — это навигация, CSP её не ограничивает.
- Сертификат: `acme.sh --issue -d utils.cyber-tech.online -w /var/www/acme`,
  `--install-cert` в `/etc/nginx/ssl/utils.cyber-tech.online/` с `--reloadcmd "systemctl reload nginx"`.

Порядок применения: http-конфиг → `nginx -t` и reload → выпуск сертификата → https-конфиг →
`nginx -t` и reload → пользователь, приёмник, ключ → секреты в GitHub → первый push в `develop`.

## 5. Проверки

### Валидатор — `scripts/validate.ts` (перед `astro build`)

- Каждая запись продукта проходит схему; `id` уникальны; `order` уникальны.
- `status: released` → есть `version` и `download` (https-URL).
- Для каждого `id` есть запись в `worlds/registry.ts` и файл `worlds/<id>/World.astro`,
  а в реестре нет лишних id.
- Каждый мир (и хаб) задаёт `--shell-ink`, `--shell-ground`, `--shell-accent`, `--shell-font`
  (поиск в стилях мира).
- `icon` и прочие пути из записи существуют в `src/assets/products/<id>/`.
- У каждого `tagline` есть `ru` и `en`; у словарей `i18n/ru.ts` и `i18n/en.ts` одинаковые ключи.

### Unit-тесты (vitest)

Схема, `lib/routes.ts` (пути, пары hreflang, canonical), `lib/products.ts` (сортировка,
released/soon), валидатор на сломанных фикстурах (каждое правило — отдельный случай).

### E2E (Playwright по собранному `dist/` через `astro preview`)

Экраны: телефон 390×844, планшет 1180×820, десктоп 1440×900. Для каждой страницы на обоих языках:

- статус 200, нет горизонтального скролла;
- нет битых внутренних ссылок и картинок;
- переключатель языка ведёт на ту же страницу на другом языке;
- кнопка скачивания ведёт на `download` из записи; у `soon` её нет;
- `@axe-core/playwright` — без нарушений serious и critical;
- страница читается и навигируется без JavaScript.

### Сервер

`server/test/utils-receive.test.sh` — локальный прогон приёмника с `UTILS_ROOT` во временной
папке: хороший архив, повторная выкладка того же sha, пустой stdin (откат), отсутствующий
релиз при откате, плохой sha, слишком большой архив, битый архив, архив без обязательных файлов.

### После выкладки

CI сверяет `release.txt`. Смоук-скрипт `scripts/smoke.sh`: 200 на `/`, `/en/` и каждую страницу
продукта на обоих языках, 404 на несуществующий путь, сертификат действителен для
`utils.cyber-tech.online`.

`npm run check:links` — ручная проверка доступности внешних ссылок (`download`, `repo`); в CI не
запускается, чтобы сборка не зависела от сети.

## 6. Процесс дизайна (impeccable)

### Контекст сайта

`impeccable init` создаёт `PRODUCT.md` в корне: платформа web, автор CyberTech team, аудитория —
пользователи Mac из ru и en, режим Persuade, доказательства на руках и запреты из раздела
«Ограничения контента».

### Миры

Порядок: хаб → Ochre → Lidless → Subus. Каждый — отдельная ветка и полный цикл new-work:

1. Вопросы impeccable по поверхности: кто действует, во что должен поверить, какие есть доказательства.
2. Направление и комп. Мир утверждает пользователь, без этого вёрстка не начинается.
3. Вёрстка в `src/worlds/<id>/`, проверка в браузере на трёх экранах; светлая и тёмная тема,
   если мир их поддерживает.
4. `impeccable-finish-reviewer` против направления и компа, правки.
5. `impeccable-documenter`: корневой `DESIGN.md` (мир хаба и контракт оболочки) или
   `src/worlds/<id>/DESIGN.md`. Surface briefs — в `.impeccable/`, как ими управляет impeccable.

Хаб идёт первым, потому что фиксирует контракт оболочки: дальше каждый мир только задаёт свои
переменные `--shell-*`.

### Исходные материалы мира

`PRODUCT.md`, `DESIGN.md` (UI приложения) и README ru/en продукта, реальные скриншоты, иконка.
Визуальный язык приложения — свидетельство, а не готовый ответ: мир страницы может его развить,
но не противоречит ему. Например, у Ochre цвет всегда означает нагрузку; у Lidless фирменный
символ — табличка ON AIR и пульс.

### Контракт оболочки

Общие для всех миров только `LangSwitch`, `HubLink` и `Footer`. У них нет своего цвета и
шрифта: они берут переменные мира `--shell-ink`, `--shell-ground`, `--shell-accent`,
`--shell-font`. Положение навигации одинаково на всех страницах: верх страницы — возврат в хаб
и переключатель языка, низ — футер (CyberTech team, ссылка на GitHub `aesarva`, год).

## Вне рамок

- Аналитика, cookies, формы, рассылка.
- Блог, changelog и документация продуктов на сайте (ссылки на README в GitHub достаточно).
- Автоматическое обновление версий из GitHub Releases (версия правится в YAML вручную).
- Правка репозиториев продуктов, включая устаревший `ochre/PRODUCT.md`.
- Перевод на другие языки, кроме ru и en.
