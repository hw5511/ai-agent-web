#!/usr/bin/env bash
set -u
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"; MODEL="sonnet"
L=/tmp/spark-lab/R12_v61; rm -rf "$L"; mkdir -p "$L"
gen(){ local n="$1" pf="$2"; local d="$L/$n"; mkdir -p "$d"; cp "$REPO/research/spark-md/versions/v6.1.md" "$d/CLAUDE.md"
  local p; p="$(cat "$REPO/research/spark-md/prompts/$pf")"
  echo "--- [$n] ($pf) ---"
  ( cd "$d" && unset CLAUDECODE && export IS_SANDBOX=1 && \
    claude -p --dangerously-skip-permissions --model "$MODEL" --output-format stream-json --verbose "$p" \
    > "$L/$n.stream.jsonl" 2> "$L/$n.err" )
  local files=""; for ef in index.html styles.css script.js; do [ -f "$d/$ef" ] && files="$files $ef"; done
  echo "    [$n] files:${files:- 없음}"
  # CHOSEN_CONCEPT / WHY_NOT_OBVIOUS 추출
  grep -oE "CHOSEN_CONCEPT[^\n]{0,120}|WHY_NOT_OBVIOUS[^\n]{0,120}|BANNED_OBVIOUS[^\n]{0,90}" "$L/$n.stream.jsonl" 2>/dev/null | head -6
}
gen observatory open_observatory.txt
gen nocturne    nocturne.txt
echo "=== 종료: $L ==="
