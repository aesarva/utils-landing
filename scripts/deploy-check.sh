#!/usr/bin/env bash
# Нужна ли выкладка по расписанию: scripts/deploy-check.sh <site-url> <sha-головы-develop> [корень-репозитория]
# Пишет в $GITHUB_OUTPUT (без него — в stdout) две строки:
#   run=true|false   — запускать ли сборку;
#   stale=true|false — сайт отдаёт не голову develop (отменённый или упавший push): выкладывать в любом случае.
# Причины печатаются в stderr. Без npm: bash, curl, jq. Любая неопределённость (сбой запроса, не-JSON)
# считается расхождением: лучше лишняя сборка, чем сайт, навсегда застрявший на старом коммите.
# GITHUB_TOKEN (если задан) уходит в API GitHub; GITHUB_API подменяется в тестах.
set -euo pipefail

site="${1:?Использование: deploy-check.sh <site-url> <sha> [корень-репозитория]}"
site="${site%/}"
head_sha="${2:?Использование: deploy-check.sh <site-url> <sha> [корень-репозитория]}"
root="${3:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
api="${GITHUB_API:-https://api.github.com}"
api="${api%/}"

CURL=(curl -sS --connect-timeout 10 --max-time 20)
run=false
stale=false
why() { printf 'deploy-check: %s\n' "$1" >&2; }

# Значение поля верхнего уровня из YAML продукта (как в smoke.sh: без кавычек и комментария).
field() {
  grep -m1 "^$1:" "$2" | sed -e "s/^$1:[[:space:]]*//" -e 's/[[:space:]]#.*$//' -e "s/[\"']//g" -e 's/[[:space:]]*$//'
}

# 1. Какой коммит отдаёт сайт.
live_sha=""
if release_txt="$("${CURL[@]}" -f -H 'Cache-Control: no-cache' "$site/release.txt" 2> /dev/null)"; then
  live_sha="${release_txt%% *}"
fi
if [ "$live_sha" != "$head_sha" ]; then
  run=true
  stale=true
  why "сайт отдаёт коммит ${live_sha:-неизвестно}, голова develop $head_sha"
fi

# 2. Живой releases.json.
live_json='{}'
if body="$("${CURL[@]}" -f -H 'Cache-Control: no-cache' "$site/releases.json" 2> /dev/null)" \
  && jq -e 'type == "object"' > /dev/null 2>&1 <<< "$body"; then
  live_json="$body"
else
  run=true
  why "живой releases.json недоступен или не объект JSON"
fi

# 3. Последний релиз каждого продукта в GitHub против записи на сайте (статус и версия).
auth=()
if [ -n "${GITHUB_TOKEN:-}" ]; then auth=(-H "Authorization: Bearer $GITHUB_TOKEN"); fi
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
for f in "$root"/src/content/products/*.yaml; do
  [ -e "$f" ] || continue
  id="$(field id "$f")"
  repo="$(field repo "$f")"
  if [ -z "$id" ] || [ -z "$repo" ]; then
    run=true
    why "$f: нет id или repo"
    continue
  fi
  code="$("${CURL[@]}" -o "$tmp" -w '%{http_code}' -H 'Accept: application/vnd.github+json' \
    ${auth[@]+"${auth[@]}"} "$api/repos/$repo/releases/latest" 2> /dev/null)" || code="000"
  want=""
  case "$code" in
    404) want="soon" ;;
    200)
      tag="$(jq -r '.tag_name // empty' "$tmp" 2> /dev/null || true)"
      if [[ $tag =~ ^v([0-9]+\.[0-9]+\.[0-9]+)$ ]]; then want="released ${BASH_REMATCH[1]}"; fi
      ;;
  esac
  if [ -z "$want" ]; then
    run=true
    why "$id: GitHub ответил $code, релиз не разобран"
    continue
  fi
  have="$(jq -r --arg id "$id" \
    'if has($id) then .[$id].status + (if .[$id].version then " " + .[$id].version else "" end) else "нет записи" end' \
    <<< "$live_json")"
  if [ "$have" != "$want" ]; then
    run=true
    why "${id}: на сайте «${have}», в GitHub «${want}»"
  fi
done

lines="run=$run"$'\n'"stale=$stale"
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  printf '%s\n' "$lines" >> "$GITHUB_OUTPUT"
else
  printf '%s\n' "$lines"
fi
