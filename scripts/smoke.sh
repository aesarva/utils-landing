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

# Все запросы с таймаутами; сбой передачи (обрыв тела, таймаут) — это провал, даже если статус успел прийти.
CURL=(curl -s --connect-timeout 10 --max-time 30)

expect_status() {
  local path="$1" want="$2" got rc=0
  got="$("${CURL[@]}" -o /dev/null -w '%{http_code}' "$base$path")" || rc=$?
  if [ "$rc" -eq 0 ] && [ "$got" = "$want" ]; then
    ok "$path -> $want"
  else
    fail "$path -> ${got:-нет ответа}, curl rc=$rc (ждали $want и rc=0)"
  fi
}

ids=()
for f in "$root"/src/content/products/*.yaml; do
  [ -e "$f" ] || continue
  id="$(grep -m1 '^id:' "$f" | sed -e 's/^id:[[:space:]]*//' -e 's/[[:space:]]#.*$//' -e "s/[\"']//g" -e 's/[[:space:]]*$//')"
  [ -n "$id" ] && ids+=("$id")
done
if [ "${#ids[@]}" -eq 0 ]; then fail "в $root/src/content/products нет ни одного id"; fi

expect_status / 200
expect_status /en/ 200
for id in ${ids[@]+"${ids[@]}"}; do
  expect_status "/$id/" 200
  expect_status "/en/$id/" 200
done
expect_status /releases.json 200
expect_status /robots.txt 200
expect_status /no-such-page/ 404

case "$base" in
  https://*)
    # Адрес без слэша — на первом продукте из записей, а не на захардкоженном id.
    if [ "${#ids[@]}" -gt 0 ]; then
      first="${ids[0]}"
      rc=0
      headers="$("${CURL[@]}" -o /dev/null -D - "$base/$first")" || rc=$?
      code="$(printf '%s' "$headers" | head -n1 | tr -d '\r' | awk '{print $2}')"
      loc="$(printf '%s\n' "$headers" | tr -d '\r' | awk 'tolower($1)=="location:" {print $2}')"
      if [ "$rc" -eq 0 ] && [ "$code" = "301" ] && [ "$loc" = "/$first/" ]; then
        ok "/$first -> 301 Location: /$first/"
      else
        fail "/$first -> $code Location: ${loc:-нет}, curl rc=$rc (ждали 301 и /$first/ без :8443)"
      fi
    fi

    # Обычная проверка curl без -k: rc=0 значит, что цепочка валидна и имя хоста совпало с сертификатом.
    rc=0
    verbose="$("${CURL[@]}" -v -o /dev/null "$base/" 2>&1)" || rc=$?
    info="$(printf '%s\n' "$verbose" | grep -iE '^\*[[:space:]]+(subject|subjectAltName):' || true)"
    if [ "$rc" -eq 0 ]; then
      ok "сертификат принят для $host${info:+ ($(printf '%s' "$info" | tr -s ' *\n' ' '))}"
    else
      fail "сертификат не принят для $host: curl rc=$rc ${info}"
    fi
    ;;
  *)
    echo "skip 301 и сертификат: адрес не https"
    ;;
esac

exit "$failed"
