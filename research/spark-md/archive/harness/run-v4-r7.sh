#!/usr/bin/env bash
# v4 5-케이스 테스트 러너 — LIGHTBULB 자가활성 + 멀티파일 + self-critique 검증
# stream-json으로 tool 호출(curl)까지 캡처해 LIGHTBULB 실제 사용 여부를 잡는다.
set -u
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
V4="$REPO/research/spark-md/versions/v4.md"
LAB="/tmp/spark-lab/R7_v4_seedfix"
MODEL="sonnet"
rm -rf "$LAB"; mkdir -p "$LAB"

cases=(case1_bookstore case2_festival case3_ceramic case4_dining case5_artshow)
echo "=== Round 6 — v4 5케이스 (모델 $MODEL) ==="
for c in "${cases[@]}"; do
  dir="$LAB/$c"; mkdir -p "$dir"
  cp "$V4" "$dir/CLAUDE.md"
  prompt="$(cat "$REPO/research/spark-md/prompts/$c.txt")"
  echo "--- [$c] 생성 시작 ---"
  ( cd "$dir" && unset CLAUDECODE && export IS_SANDBOX=1 && \
    claude -p --dangerously-skip-permissions --model "$MODEL" \
      --output-format stream-json --verbose "$prompt" \
    > "$LAB/$c.stream.jsonl" 2> "$LAB/$c.err" )
  rc=$?
  # LIGHTBULB 사용 흔적: curl로 lightbulb 받았나 + ignition/lb-id 흔적
  lb_fetch=$(grep -c "skills/lightbulb/ideas.json\|skills/lightbulb/pinches.json" "$LAB/$c.stream.jsonl" 2>/dev/null)
  lb_id=$(grep -oE "lb-[0-9]{3}" "$LAB/$c.stream.jsonl" 2>/dev/null | sort -u | tr '\n' ',')
  ign=$(grep -c "lightbulb_ignition" "$LAB/$c.stream.jsonl" 2>/dev/null)
  # 산출물 구조
  files=""; for ef in index.html styles.css script.js; do [ -f "$dir/$ef" ] && files="$files $ef"; done
  echo "    [$c] rc=$rc | files:${files:- 없음} | LIGHTBULB[curl:$lb_fetch ignition:$ign id:${lb_id:-none}]"
done
echo "=== 종료: $LAB ==="
