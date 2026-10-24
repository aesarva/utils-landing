# Сервер utils.cyber-tech.online

Применяется один раз вручную, от `root@185.36.144.150` (ключ `~/.ssh/serverspace`). Существующие сайты
(`atlas.hollow-haven.com`, `cyber-tech.online`) и их конфиги не трогаются: только новые файлы и новые симлинки.
Конфиги лежат в `/etc/nginx/sites-available`, включаются симлинками в `sites-enabled`, сертификаты — в
`/etc/nginx/ssl/<домен>/`, webroot для acme — `/var/www/acme` (общий с атласом, уже есть).

**Проверка синтаксиса:** `nginx -t` на сервере — обязательный шаг перед каждым `reload`. Локально (docker не
запущен) конфиги не проверялись; при ошибке `nginx -t` reload не делать.

Порядок: http-конфиг → `nginx -t` и reload → сертификат → https-конфиг → `nginx -t` и reload →
пользователь, приёмник, ключ → секреты в GitHub → первый push в `develop`.

## 1. HTTP-конфиг (порт 80, нужен для выпуска сертификата)

```sh
scp -i ~/.ssh/serverspace server/nginx/utils-http.conf root@185.36.144.150:/etc/nginx/sites-available/utils-http.conf
ssh -i ~/.ssh/serverspace root@185.36.144.150 '
  ln -s /etc/nginx/sites-available/utils-http.conf /etc/nginx/sites-enabled/utils-http.conf &&
  nginx -t && systemctl reload nginx'
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
    --reloadcmd "systemctl reload nginx"'
```

Продление делает cron `acme.sh`, `--reloadcmd` перезагружает nginx сам.

## 3. HTTPS-конфиг (127.0.0.1:8443 за xray)

```sh
scp -i ~/.ssh/serverspace server/nginx/utils-https.conf root@185.36.144.150:/etc/nginx/sites-available/utils-https.conf
ssh -i ~/.ssh/serverspace root@185.36.144.150 '
  ln -s /etc/nginx/sites-available/utils-https.conf /etc/nginx/sites-enabled/utils-https.conf &&
  nginx -t && systemctl reload nginx'
```

До первой выкладки `/srv/utils/site/current` нет, и сайт отвечает 404: это нормально.

## 4. Пользователь, каталог, приёмник

```sh
scp -i ~/.ssh/serverspace server/bin/utils-receive root@185.36.144.150:/usr/local/bin/utils-receive
ssh -i ~/.ssh/serverspace root@185.36.144.150 '
  useradd --system --create-home --shell /bin/sh utils-deploy &&
  install -o utils-deploy -d /srv/utils /srv/utils/site &&
  chown root:root /usr/local/bin/utils-receive && chmod 755 /usr/local/bin/utils-receive'
```

`/srv/utils` создаётся от root, `/srv/utils/site` принадлежит `utils-deploy`; nginx читает релизы
(права `a+rX` приёмник выставляет сам).

## 5. Ключ CI

Отдельная пара ключей только для этого сайта (не ключ атласа):

```sh
ssh-keygen -t ed25519 -N '' -C utils-deploy-ci -f /tmp/utils-deploy-key
```

Публичную часть — в `authorized_keys` пользователя `utils-deploy` одной строкой:

```sh
PUB=$(cat /tmp/utils-deploy-key.pub)
ssh -i ~/.ssh/serverspace root@185.36.144.150 "
  install -o utils-deploy -m 700 -d /home/utils-deploy/.ssh &&
  echo 'restrict,command=\"/usr/local/bin/utils-receive\" $PUB' > /home/utils-deploy/.ssh/authorized_keys &&
  chown utils-deploy /home/utils-deploy/.ssh/authorized_keys && chmod 600 /home/utils-deploy/.ssh/authorized_keys"
```

Получившаяся строка: `restrict,command="/usr/local/bin/utils-receive" ssh-ed25519 AAAA… utils-deploy-ci`.

## 6. Секреты GitHub

В репозитории `aesarva/utils-landing`:

```sh
gh secret set UTILS_DEPLOY_KEY < /tmp/utils-deploy-key
ssh-keyscan -t ed25519 185.36.144.150 | gh secret set UTILS_KNOWN_HOSTS
shred -u /tmp/utils-deploy-key /tmp/utils-deploy-key.pub 2>/dev/null || rm -P /tmp/utils-deploy-key /tmp/utils-deploy-key.pub
```

## 7. Первая выкладка и проверка

Первый push в `develop` запускает `publish.yml`. Проверка:

```sh
curl -sI https://utils.cyber-tech.online/ | grep -iE 'HTTP|content-security|cache-control'
curl -s https://utils.cyber-tech.online/release.txt
```

## Откат

Переключить `current` на уже лежащий на сервере релиз (пустой stdin, хранятся 5 последних):

```sh
ssh -i /путь/к/ключу-ci utils-deploy@185.36.144.150 <sha> < /dev/null
```

Код 3 — такого релиза на сервере нет. Список лежащих релизов: `ls -1t /srv/utils/site/releases` (от root).

## Коды выхода приёмника

0 — готово; 2 — плохой sha; 3 — откат на отсутствующий релиз; 4 — архив больше лимита (50 МБ сжатого,
200 МБ распакованного) или битый; 5 — в сборке нет `index.html`, `en/index.html` или `404.html`.
