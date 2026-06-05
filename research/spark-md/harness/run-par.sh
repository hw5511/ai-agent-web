#!/usr/bin/env bash
# 병렬 격리 실험 러너 (range/케이스를 동시에 생성)
# 사용: run-par.sh <라운드ID> <variant>:<버전파일>:<프롬프트파일> [...]
#   예: run-par.sh R13 \
#         obs_v5:v5.md:open_observatory.txt \
#         obs_v61:v6.1.md:open_observatory.txt
# 각 작업은 백그라운드로 동시에 돌고, 모두 끝나면 요약을 출력한다.
set -u
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
VDIR="$REPO/research/spark-md/versions"
PDIR="$REPO/research/spark-md/prompts"
MODEL="sonnet"
MAXPAR="${MAXPAR:-5}"   # 동시 실행 상한(레이트리밋 보호)

ROUND="${1:?라운드ID 필요}"; shift
[ "$#" -ge 1 ] || { echo "variant 1개 이상 필요 (name:version:prompt)"; exit 1; }
LAB="/tmp/spark-lab/$ROUND"; rm -rf "$LAB"; mkdir -p "$LAB"

gen_one() {
  local name="$1" ver="$2" pf="$3"
  local dir="$LAB/$name"; mkdir -p "$dir"
  cp "$VDIR/$ver" "$dir/CLAUDE.md"
  local prompt; prompt="$(cat "$PDIR/$pf")"
  ( cd "$dir" && unset CLAUDECODE && export IS_SANDBOX=1 && \
    claude -p --dangerously-skip-permissions --model "$MODEL" \
      --output-format stream-json --verbose "$prompt" \
      > "$LAB/$name.stream.jsonl" 2> "$LAB/$name.err" )
  echo "$name DONE rc=$?" >> "$LAB/_progress.log"
}

echo "=== $ROUND 병렬 생성 시작 (동시상한 $MAXPAR) ==="
running=0
for spec in "$@"; do
  IFS=':' read -r name ver pf <<< "$spec"
  echo "  launch [$name] ver=$ver prompt=$pf"
  gen_one "$name" "$ver" "$pf" &
  running=$((running+1))
  if [ "$running" -ge "$MAXPAR" ]; then wait -n 2>/dev/null || wait; running=$((running-1)); fi
done
wait
echo "=== $ROUND 완료 — 요약 ==="
for spec in "$@"; do
  IFS=':' read -r name ver pf <<< "$spec"
  d="$LAB/$name"; files=""
  for ef in index.html styles.css script.js; do [ -f "$d/$ef" ] && files="$files $ef"; done
  ids=$(grep -oE "lb-[0-9]{3}" "$LAB/$name.stream.jsonl" 2>/dev/null | sort -u | tr '\n' ',')
  echo "  [$name] files:${files:- 없음} | lb:${ids:-none}"
done
echo "결과: $LAB"
