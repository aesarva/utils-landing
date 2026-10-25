# Сервер utils.cyber-tech.online

Применяется один раз вручную, от `root@185.36.144.150` (ключ `~/.ssh/serverspace`). Существующие сайты
(`atlas.hollow-haven.com`, `cyber-tech.online`) и их конфиги не трогаются: только новые файлы и новые симлинки.
Конфиги лежат в `/etc/nginx/sites-available`, включаются симлинками в `sites-enabled`, сертификаты — в
`/etc/nginx/ssl/<домен>/`, webroot для acme — `/var/www/acme` (общий с атласом, уже есть).

**Проверка синтаксиса:** `nginx -t` на сервере — обязательный шаг перед каждым `reload`. Локально (docker не
запущен) конфиги не проверялись; при ошибке `nginx -t` reload не делать.

Порядок: http-конфиг → `nginx -t` и reload → сертификат → https-конфиг → `nginx -t` и reload →
пользователь, приёмник, ключ → окружение `production` и его секреты в GitHub → первый push в `develop`.

## 1. HTTP-конфиг (порт 80, нужен для выпуска сертификата)

```sh
scp -i ~/.ssh/serverspace server/nginx/utils-http.conf root@185.36.144.150:/etc/nginx/sites-available/utils-http.conf
ssh -i ~/.ssh/serverspace root@185.36.144.150 '
  ln -s /etc/nginx/sites-available/utils-http.conf /etc/nginx/sites-enabled/utils-http.conf &&
  { nginx -t && systemctl reload nginx || { rm -f /etc/nginx/sites-enabled/utils-http.conf; false; }; }'
```

## 2. Сертификат

DNS: A-запись `utils.cyber-tech.online` → `185.36.144.150` должна уже резолвиться.

```sh
ssh -i ~/.ssh/serverspace root@185.36.144.150 '
  mkdir -p /etc/nginx/ssl/utils.cyber-tech.online &&
  /root/.acme.sh/acme.sh --issue -d utils.cyber-tech.online -w /var/www/acme &&
  /root/.acme.sh/acme.sh --install-cert -d utils.cyber-tech.online \
    --fullchain-file /etc/nginx/ssl/utils.cyber-tech.online/fullchain.pem \
    --key-file /etc/nginx/ssl/utils.cyber-tech.online/privkey.pem \
    --reloadcmd "nginx -t && systemctl reload nginx"'
```

Продление делает cron `acme.sh`, `--reloadcmd` проверяет конфиг и перезагружает nginx сам.

## 3. HTTPS-конфиг (127.0.0.1:8443 за xray)

```sh
scp -i ~/.ssh/serverspace server/nginx/utils-https.conf root@185.36.144.150:/etc/nginx/sites-available/utils-https.conf
ssh -i ~/.ssh/serverspace root@185.36.144.150 '
  ln -s /etc/nginx/sites-available/utils-https.conf /etc/nginx/sites-enabled/utils-https.conf &&
  { nginx -t && systemctl reload nginx || { rm -f /etc/nginx/sites-enabled/utils-https.conf; false; }; }'
```

До первой выкладки `/srv/utils/site/current` нет, и сайт отвечает 404: это нормально.

HSTS (`Strict-Transport-Security`) пока не включён: сначала сертификат должен быть проверен на живом
сайте (Task 11, шаг 4: `curl -sI https://utils.cyber-tech.online/` без `-k`). После этого заголовок
добавляется в `utils-https.conf` во все блоки с `add_header`, отдельным изменением.

## 4. Пользователь, каталог, приёмник

```sh
scp -i ~/.ssh/serverspace server/bin/utils-receive root@185.36.144.150:/usr/local/bin/utils-receive
ssh -i ~/.ssh/serverspace root@185.36.144.150 '
  useradd --system --create-home --shell /bin/sh utils-deploy &&
  install -o root -g root -m 755 -d /srv/utils &&
  install -o utils-deploy -d /srv/utils/site &&
  chown root:root /usr/local/bin/utils-receive && chmod 755 /usr/local/bin/utils-receive'
```

`/srv/utils` создаётся от root, `/srv/utils/site` принадлежит `utils-deploy`; nginx читает релизы
(права приёмник выставляет сам, не полагаясь на umask: `releases/` и каталоги релиза 755, файлы 644).

## 5. Ключ CI

Отдельная пара ключей только для этого сайта (не ключ атласа):

```sh
ssh-keygen -t ed25519 -N '' -C utils-deploy-ci -f /tmp/utils-deploy-key
```

Публичную часть — в `authorized_keys` одной строкой. Файл и каталог `.ssh` принадлежат root (группа
`utils-deploy` только читает; домашний каталог тоже `root:utils-deploy 750`, иначе владелец переименовал бы `.ssh`), поэтому приёмник, запущенный от `utils-deploy`, не может их переписать:

```sh
PUB=$(cat /tmp/utils-deploy-key.pub)
ssh -i ~/.ssh/serverspace root@185.36.144.150 "
  chown root:utils-deploy /home/utils-deploy && chmod 750 /home/utils-deploy &&
  install -o root -g utils-deploy -m 750 -d /home/utils-deploy/.ssh &&
  echo 'restrict,command=\"/usr/local/bin/utils-receive\" $PUB' > /home/utils-deploy/.ssh/authorized_keys &&
  chown root:utils-deploy /home/utils-deploy/.ssh/authorized_keys && chmod 640 /home/utils-deploy/.ssh/authorized_keys"
```

Получившаяся строка: `restrict,command="/usr/local/bin/utils-receive" ssh-ed25519 AAAA… utils-deploy-ci`.

## 6. Окружение и секреты GitHub

Секреты выкладки лежат в окружении `production` репозитория `aesarva/utils-landing`; выкладка в него
разрешена только из ветки `develop` (задача `deploy` в `publish.yml` объявляет `environment: production`):

```sh
gh api -X PUT repos/aesarva/utils-landing/environments/production \
  -F 'deployment_branch_policy[protected_branches]=false' -F 'deployment_branch_policy[custom_branch_policies]=true'
gh api -X POST repos/aesarva/utils-landing/environments/production/deployment-branch-policies -f name=develop -f type=branch
gh secret set UTILS_DEPLOY_KEY --env production --repo aesarva/utils-landing < /tmp/utils-deploy-key
```

`UTILS_KNOWN_HOSTS` — не из `ssh-keyscan` (ему нельзя доверять), а ключ хоста, полученный по уже
аутентифицированному админскому соединению:

```sh
KH=$(ssh -i ~/.ssh/serverspace root@185.36.144.150 cat /etc/ssh/ssh_host_ed25519_key.pub | awk '{print "185.36.144.150 " $1 " " $2}')
[ -n "$KH" ] || { echo "пустой ключ хоста" >&2; exit 1; }
printf '%s\n' "$KH" | gh secret set UTILS_KNOWN_HOSTS --env production --repo aesarva/utils-landing
```

```sh
shred -u /tmp/utils-deploy-key /tmp/utils-deploy-key.pub 2>/dev/null || rm -P /tmp/utils-deploy-key /tmp/utils-deploy-key.pub
```

## 7. Первая выкладка и проверка

Первый push в `develop` запускает `publish.yml` (сервер, окружение и секреты уже готовы). Проверка:

```sh
curl -sI https://utils.cyber-tech.online/ | grep -iE 'HTTP|content-security|cache-control'
curl -s https://utils.cyber-tech.online/release.txt
```

## Откат

Ключ CI после шага 6 уничтожен, поэтому откат выполняется от root (админский ключ), а приёмник
запускается от имени `utils-deploy`. Сначала посмотреть, что лежит на сервере и что отдаётся сейчас
(каждая выкладка — каталог `releases/<sha>.<метка>`, хранятся 5 последних, текущий не удаляется):

```sh
ssh -i ~/.ssh/serverspace root@185.36.144.150 \
  'ls -1t /srv/utils/site/releases; echo; cat /srv/utils/site/current/release.txt'
```

Переключить `current` на новейший из лежащих релизов нужного sha (пустой stdin — откат):

```sh
ssh -i ~/.ssh/serverspace root@185.36.144.150 \
  'runuser -u utils-deploy -- /usr/local/bin/utils-receive <sha> < /dev/null'
```

Код 3 — релиза с таким sha на сервере нет; 6 — идёт выкладка CI, повторить позже. Следующий push
в `develop` (или часовой запуск, если живой коммит отличается от головы `develop`) выложит голову снова.

## Коды выхода приёмника

0 — готово; 2 — плохой sha; 3 — откат на отсутствующий релиз; 4 — архив больше лимита (50 МБ сжатого,
200 МБ суммарного размера файлов), битый или небезопасный (симлинки, хардлинки, устройства, fifo, sparse,
абсолютные пути, `..`, член `release.txt`, больше 20000 членов, раздутые PAX-метаданные); 5 — в сборке нет `index.html`, `en/index.html` или `404.html`; 6 — идёт другая выкладка (занят замок `/srv/utils/site/.lock`), повторить позже;
7 — загрузка не завершилась за `UTILS_UPLOAD_TIMEOUT` секунд (по умолчанию 300): клиент держал stdin открытым,
приёмник вышел и освободил замок. CI повторяет только код 6; 7, как и остальные ненулевые коды, — сразу сбой.
