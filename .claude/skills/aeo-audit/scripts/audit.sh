#!/usr/bin/env bash
# GEO/AEO 점수 측정 — geo-optimizer-skill(MIT)을 임시 venv에 설치해 URL별 점수와 감점 항목을 요약한다.
# 사용: bash audit.sh [URL ...]   (인자 없으면 이력서 한/영 페이지)
set -euo pipefail
URLS=("$@"); [ ${#URLS[@]} -eq 0 ] && URLS=(https://jungrok5.github.io/resume/ https://jungrok5.github.io/resume/en/)
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
python3 -m venv "$T/v" && "$T/v/bin/pip" install -q geo-optimizer-skill
for u in "${URLS[@]}"; do
  "$T/v/bin/geo" audit --url "$u" --format json 2>/dev/null | python3 -I -c '
import json,sys
d=json.load(sys.stdin)
print("\n== %s\n   점수 %s/100 (%s)" % (sys.argv[1], d.get("score"), d.get("band")))
print("   항목:", ", ".join("%s=%s" % kv for kv in (d.get("score_breakdown") or {}).items()))
for r in d.get("recommendations") or []: print("   -", r[:140])' "$u"
done
