#!/usr/bin/env bash
set -u
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
VDIR="$REPO/research/spark-md/versions"; MODEL="sonnet"
L=/tmp/spark-lab/R10_v5; rm -rf "$L"; mkdir -p "$L"
gen(){ local name="$1" pf="$2"; local dir="$L/$name"; mkdir -p "$dir"; cp "$VDIR/v5.md" "$dir/CLAUDE.md"
  local p; p="$(cat "$REPO/research/spark-md/prompts/$pf")"
  echo "--- [$name] ($pf) ---"
  ( cd "$dir" && unset CLAUDECODE && export IS_SANDBOX=1 && \
    claude -p --dangerously-skip-permissions --model "$MODEL" --output-format stream-json --verbose "$p" \
    > "$L/$name.stream.jsonl" 2> "$L/$name.err" )
  local files=""; for ef in index.html styles.css script.js; do [ -f "$dir/$ef" ] && files="$files $ef"; done
  local lb; lb=$(grep -oE "lb-[0-9]{3}" "$L/$name.stream.jsonl" 2>/dev/null | sort -u | tr '\n' ',')
  echo "    [$name] files:${files:- 없음} | lb:${lb:-none}"
}
gen observatory open_observatory.txt
gen nocturne    nocturne.txt
echo "=== 종료: $L ==="
