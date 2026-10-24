#!/usr/bin/env bash
# Смоук опубликованного сайта: scripts/smoke.sh <base-url> [корень-репозитория]
# Одна строка на проверку (ok/FAIL); код выхода 1, если что-то не прошло.
# Без npm: id продуктов читаются из src/content/products/*.yaml через grep/sed.
# Проверки 301 и сертификата — только для https:// (это поведение nginx, у preview их нет).
set -euo pipefail

base="${1:?Использование: smoke.sh <base-url> [корень-репозитория]}"
base="${base%/}"
root="${2:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
host="${base#*://}"
host="${host%%/*}"
host="${host%%:*}"

failed=0
ok() { printf 'ok   %s\n' "$1"; }
fail() { printf 'FAIL %s\n' "$1"; failed=1; }

# Код ответа без следования редиректам; 000, если соединиться не удалось.
status() { curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$base$1" || true; }

expect_status() {
  local path="$1" want="$2" got
  got="$(status "$path")"
  if [ "$got" = "$want" ]; then ok "$path -> $want"; else fail "$path -> $got (ждали $want)"; fi
}

ids=()
for f in "$root"/src/content/products/*.yaml; do
  [ -e "$f" ] || continue
  id="$(grep -m1 '^id:' "$f" | sed -e 's/^id:[[:space:]]*//' -e "s/[\"']//g" -e 's/[[:space:]]*$//')"
  [ -n "$id" ] && ids+=("$id")
done
if [ "${#ids[@]}" -eq 0 ]; then fail "в $root/src/content/products нет ни одного id"; fi

expect_status / 200
expect_status /en/ 200
for id in ${ids[@]+"${ids[@]}"}; do
  expect_status "/$id/" 200
  expect_status "/en/$id/" 200
done
expect_status /no-such-page/ 404

case "$base" in
  https://*)
    headers="$(curl -s -o /dev/null -D - --max-time 20 "$base/ochre" || true)"
    code="$(printf '%s' "$headers" | head -n1 | tr -d '\r' | awk '{print $2}')"
    loc="$(printf '%s\n' "$headers" | tr -d '\r' | awk 'tolower($1)=="location:" {print $2}')"
    if [ "$code" = "301" ] && [ "$loc" = "/ochre/" ]; then
      ok "/ochre -> 301 Location: /ochre/"
    else
      fail "/ochre -> $code Location: ${loc:-нет} (ждали 301 и /ochre/ без :8443)"
    fi

    cert="$(curl -sv -o /dev/null --max-time 20 "$base/" 2>&1 | grep -iE '^\*[[:space:]]+(subject|subjectAltName):' || true)"
    if printf '%s\n' "$cert" | grep -qF "$host"; then
      ok "сертификат содержит $host"
    else
      fail "сертификат не содержит $host: ${cert:-нет данных}"
    fi
    ;;
  *)
    echo "skip 301 и сертификат: адрес не https"
    ;;
esac

exit "$failed"
