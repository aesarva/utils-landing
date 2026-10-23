# Сайт утилит CyberTech team — дизайн

Дата: 2026-10-24. Статус: утверждён в обсуждении, ждёт ревью спека.

## Цель

Публичный сайт `https://utils.cyber-tech.online` для macOS-утилит CyberTech team: общая
страница-хаб со всеми продуктами и отдельная страница на каждый продукт. Сейчас продуктов три —
Ochre (`../ochre`), Subus (`../subus`), Lidless (`../lidless`), будут добавляться ещё.

Успех:

- новый продукт добавляется записью данных, картинками и папкой мира, без правки хаба и маршрутов;
- push в `develop` собирает и выкладывает сайт, CI подтверждает, что сайт отдаёт этот коммит;
- новый релиз продукта на GitHub попадает на сайт сам, в течение часа, без коммита в этот репозиторий;
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
| Версии и ссылки на DMG | Из GitHub API при сборке (latest release), снимок в репо как запасной; CI пересобирает раз в час |

## Ограничения контента

- Не выдумывать: отзывы, прессу, счётчики загрузок и пользователей, рейтинги, сравнения
  с конкурентами. Это прямо записано в `PRODUCT.md` продуктов.
- Скриншоты — только реальные рендеры приложений из `docs/images` репозиториев продуктов
  (и `ochre/site/img`). Ассеты, созданные по компу, допустимы для декора мира, но не выдаются
  за интерфейс приложения.
- Логотипы сторонних сервисов (например, в Subus) не используются.
- Факты продукта берутся из `PRODUCT.md`, `DESIGN.md`, `CHANGELOG.md` и README (ru/en) продукта.
  При расхождении верны README, CHANGELOG и GitHub. Факты берутся с ветки `develop` продукта
  на момент работы над его миром, а не со снимка этого спека: все три продукта сейчас выпускают
  автообновления, и тексты про сеть и настройки меняются. Устаревшие PRODUCT.md уже исправлены
  в `develop` продуктов: Ochre — `785cb0d` (открытый код MIT, релизы, 0.5% CPU и 14 МБ,
  единственный сетевой запрос — ежедневная проверка обновлений), Subus — `0a2038b` (попадёт
  в `develop` с релизом 1.0.0). В `main` Ochre старый PRODUCT.md остаётся до следующего релиза:
  читать `develop`.

  Репозитории продуктов в этой задаче не правятся.
- Тексты страниц не называют номер текущей версии: он приходит из данных релиза (раздел 3)
  и выводится оболочкой мира рядом с кнопкой скачивания.

## 1. Маршруты

`trailingSlash: 'always'`, `build.format: 'directory'`.

```
/                 хаб, ru            /en/              хаб, en
/ochre/           Ochre, ru          /en/ochre/        Ochre, en
/subus/           Subus, ru          /en/subus/        Subus, en
/lidless/         Lidless, ru        /en/lidless/      Lidless, en
/404.html  /robots.txt  /sitemap.xml  /release.txt (пишет сервер)
```

- Адрес продукта — его публичное имя, `id` записи.
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
  data/releases.json              снимок последних релизов (пишет fetch-releases, коммитится)
  i18n/ru.ts, i18n/en.ts          строки оболочки: футер, «скачать», «скоро», «исходники», ярлыки языка
  lib/routes.ts                   построение путей и пар hreflang
  lib/products.ts                 загрузка, сортировка, слияние с releases.json, released/soon
  lib/releases.ts                 разбор ответа GitHub API в запись релиза (чистые функции)
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
scripts/fetch-releases.ts         обновляет src/data/releases.json из GitHub API
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
repo: aesarva/lidless       # публичный репозиторий: исходники и релизы
dmg: Lidless                # ассет релиза называется <dmg>-<версия>.dmg
license: GPL-3.0            # строка, показывается как есть
requires:
  macos: "14"               # минимальная версия
  arch: universal           # universal | apple-silicon
icon: icon.png              # путь внутри src/assets/products/<id>/
tagline:
  ru: "…"                   # для карточки в хабе и <meta name="description">
  en: "…"
```

- Длинные тексты продукта живут в его `World.astro` (композиция у каждого мира своя), а не в YAML.
- Версии и ссылки на скачивание в YAML нет: они приходят из `src/data/releases.json`.
- Начальные записи: Ochre (`aesarva/ochre`, `Ochre`, macOS 26), Lidless (`aesarva/lidless`,
  `Lidless`, macOS 14), Subus (`aesarva/subus`, `Subus`, macOS 14). Лицензии: Ochre — MIT,
  Lidless и Subus — GPL-3.0. Все три — universal.

### Релизы

`scripts/fetch-releases.ts` (запускается первым шагом `npm run build`):

- Для каждого продукта — `GET https://api.github.com/repos/<repo>/releases/latest`
  (последний опубликованный, не draft и не prerelease). С `GITHUB_TOKEN`, если он задан (в CI задан),
  иначе без авторизации.
- Тег `v<X.Y.Z>` → версия; ассет `<dmg>-<X.Y.Z>.dmg` → ссылка `browser_download_url`, размер,
  дата публикации.
- Результат по продукту:
  - `released` — тег разобран и ассет с той же версией найден;
  - `soon` — ответ 404 (у репозитория нет релизов);
  - ошибка — сеть, лимит, ответ не по схеме, ассета нет, версии тега и ассета не совпали.
    Тогда остаётся запись из снимка, а скрипт печатает предупреждение. Сборка не падает:
    устаревшая на час ссылка лучше упавшего сайта.
- Пишет `src/data/releases.json`: `{ <id>: { status, version?, url?, size?, publishedAt? } }`,
  ключи отсортированы, чтобы diff был стабильным.
- `npm run build -- --offline` (и `RELEASES_OFFLINE=1`) пропускает запросы и собирает по снимку.
- Снимок коммитится: локальная сборка без сети и первый деплой работают сразу. CI свежие данные
  обратно не коммитит.

Отображение:

- `released` — кнопка «Скачать» на `url`, рядом версия, размер и «macOS <requires.macos>+».
- `soon` — продукт виден в хабе и имеет страницу; вместо кнопки — «Скоро» / «Coming soon» без ссылки.
  Утром 2026-10-24 это был Subus; его 1.0.0 (тег `v1.0.0`, `Subus-1.0.0.dmg`) выходит в тот же
  день и сам переключится в `released` при следующей сборке.
- Сборка копирует снимок в `dist/releases.json`: по нему CI понимает, что изменилось (раздел 4).

### Синхронизация картинок

`npm run sync:assets -- <id>` копирует из `../<id>/docs/images/` (и для Ochre из
`../ochre/site/img/`) в `src/assets/products/<id>/`. По умолчанию папка репо — `../<id>`;
исключения задаются в самом скрипте. Картинки коммитятся в этот репозиторий: CI не зависит от
соседних репо. Astro оптимизирует их при сборке и проставляет размеры.

### Добавление продукта

1. YAML-запись в `src/content/products/`, затем `npm run fetch:releases`, чтобы добавить продукт
   в снимок.
2. `npm run sync:assets -- <id>` (исключение в скрипте — только если папка репо не `../<id>`).
3. Папка `src/worlds/<id>/` с `World.astro` (цикл impeccable, раздел 6) и строка в `worlds/registry.ts`.

Хаб, маршруты и sitemap подхватывают запись сами. Если чего-то не хватает, сборку
останавливает валидатор с понятной ошибкой.

## 4. Деплой и сервер

Повторяет схему hollow-haven-atlas, но изолированно от неё.

### Репозиторий и ветки

`git init` в `utils-landing`, ветки `main` и `develop`. Работа ведётся в ветках, они вливаются
в `develop` через `merge --no-ff`. Remote — новый приватный `aesarva/utils-landing`
(создаётся после утверждения плана). Ветка по умолчанию на GitHub — `develop`: расписание
GitHub Actions запускается только с ветки по умолчанию.

### CI — `.github/workflows/publish.yml`

Запуск: push в `develop`, расписание `17 * * * *` (раз в час) и `workflow_dispatch`.
`concurrency: publish` без отмены, токену GitHub — только чтение.

- `build`: checkout `develop` без сохранения учётных данных, Node из `.nvmrc`, `npm ci`, `npm test`,
  `npm run build` с `GITHUB_TOKEN` (fetch-releases), `tar -C dist -czf site.tar.gz .`,
  артефакт на 1 день. Ключа выкладки здесь нет.
  - Только для расписания: шаг сравнивает `dist/releases.json` с
    `https://utils.cyber-tech.online/releases.json`. Совпали — выход `changed=false`, и `deploy`
    пропускается. Не удалось получить живой файл — считается, что изменилось.
- `deploy` (если push, ручной запуск или `changed=true`): скачивает артефакт,
  `ssh -i key utils-deploy@185.36.144.150 "$GITHUB_SHA" < site.tar.gz`, затем до 6 попыток
  с паузой 5 с проверяет, что `release.txt` начинается с `$GITHUB_SHA` и что живой
  `releases.json` совпадает с собранным. Повторная выкладка того же коммита со свежими релизами
  штатна: приёмник заменяет релиз с тем же sha.
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
    `release.txt` и `releases.json` — `expires -1`.
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
- У каждого продукта есть запись в `src/data/releases.json`, и в снимке нет лишних id.
- `released` → есть `version` и `url`, а `url` начинается с
  `https://github.com/<repo>/releases/download/`.
- Для каждого `id` есть запись в `worlds/registry.ts` и файл `worlds/<id>/World.astro`,
  а в реестре нет лишних id.
- Каждый мир (и хаб) задаёт `--shell-ink`, `--shell-ground`, `--shell-accent`, `--shell-font`
  (поиск в стилях мира).
- `icon` и прочие пути из записи существуют в `src/assets/products/<id>/`.
- У каждого `tagline` есть `ru` и `en`; у словарей `i18n/ru.ts` и `i18n/en.ts` одинаковые ключи.

### Unit-тесты (vitest)

Схема, `lib/routes.ts` (пути, пары hreflang, canonical), `lib/products.ts` (сортировка,
слияние со снимком), валидатор на сломанных фикстурах (каждое правило — отдельный случай).
`lib/releases.ts` на записанных ответах GitHub API: нормальный релиз, 404 → `soon`, нет ассета,
версии тега и ассета не совпали, тег не по схеме, ошибка сети или лимит → остаётся снимок.

### E2E (Playwright по собранному `dist/` через `astro preview`)

Экраны: телефон 390×844, планшет 1180×820, десктоп 1440×900. Для каждой страницы на обоих языках:

- статус 200, нет горизонтального скролла;
- нет битых внутренних ссылок и картинок;
- переключатель языка ведёт на ту же страницу на другом языке;
- кнопка скачивания ведёт на `url` из снимка релизов, рядом его версия; у `soon` кнопки нет;
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

E2E и unit-тесты работают по снимку (`RELEASES_OFFLINE=1`) и сети не требуют. Живой GitHub
трогает только `fetch-releases` в сборке.

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

`PRODUCT.md`, `DESIGN.md` (UI приложения), `CHANGELOG.md` и README ru/en продукта, реальные
скриншоты, иконка. Визуальный язык приложения — свидетельство, а не готовый ответ: мир страницы
может его развить, но не противоречит ему. Миры приложений по их DESIGN.md на 2026-10-24:

- Ochre — табло отправлений для чипа: ядра и подписи как split-flap-флажки; графит и бумага,
  тёплый цвет (горчица → янтарь → угли → красный) только там, где нагрузка или главное действие.
- Lidless — дверь радиостудии: табличка ON AIR горит ровно пока Mac не спит; красный только
  для «в эфире», оранжевый — единственный второй цвет (внимание); студийный чёрный и кремовый.
- Subus — схема транспортной линии: ближайшие списания едут по одной линии, сегодня — станция,
  где ты стоишь; оранжевый акцент и плитки категорий.

### Контракт оболочки

Общие для всех миров только `LangSwitch`, `HubLink` и `Footer`. У них нет своего цвета и
шрифта: они берут переменные мира `--shell-ink`, `--shell-ground`, `--shell-accent`,
`--shell-font`. Положение навигации одинаково на всех страницах: верх страницы — возврат в хаб
и переключатель языка, низ — футер (CyberTech team, ссылка на GitHub `aesarva`, год).

## Вне рамок

- Аналитика, cookies, формы, рассылка.
- Блог, changelog и документация продуктов на сайте (ссылки на README в GitHub достаточно).
- Мгновенная реакция на релиз продукта (webhook или `repository_dispatch` из репо продукта):
  хватает часового расписания и ручного запуска.
- Правка репозиториев продуктов.
- Перевод на другие языки, кроме ru и en.
