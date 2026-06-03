#!/usr/bin/env bash
# SPARK.md 격리 실험 러너 (N-variant)
# 레포의 버전 파일을 /tmp 격리 랩으로 복사해 동일 프롬프트로 claude -p 생성한다.
#
# 사용:
#   run.sh <라운드ID> <프롬프트파일> <variant>:<CLAUDE.md경로|none> [<variant>:<path> ...]
# 예:
#   run.sh R1_mokza research/spark-md/prompts/mokza.txt \
#     base:none v1:curriculum/_assets/files/SPARK.md v2-core:research/spark-md/versions/v2-core.md
#
# 결과: /tmp/spark-lab/<라운드ID>/<variant>/index.html
set -u
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
MODEL="sonnet"

ROUND="${1:?라운드ID 필요}"; shift
PROMPT_FILE="${1:?프롬프트파일 필요}"; shift
[ "$#" -ge 1 ] || { echo "variant를 1개 이상 지정하세요 (예: base:none)"; exit 1; }

# 프롬프트 경로 정규화 (상대경로면 REPO 기준)
case "$PROMPT_FILE" in /*) : ;; *) PROMPT_FILE="$REPO/$PROMPT_FILE" ;; esac
[ -f "$PROMPT_FILE" ] || { echo "프롬프트 파일 없음: $PROMPT_FILE"; exit 1; }
PROMPT="$(cat "$PROMPT_FILE")"

LAB="/tmp/spark-lab/$ROUND"
rm -rf "$LAB"; mkdir -p "$LAB"
cp "$PROMPT_FILE" "$LAB/prompt.txt"

echo "=== 라운드 $ROUND | 모델 $MODEL | variant $# 개 ==="
for spec in "$@"; do
  name="${spec%%:*}"; src="${spec#*:}"
  dir="$LAB/$name"; mkdir -p "$dir"
  if [ "$src" != "none" ]; then
    case "$src" in /*) : ;; *) src="$REPO/$src" ;; esac
    [ -f "$src" ] || { echo "  [$name] CLAUDE.md 소스 없음: $src — 건너뜀"; continue; }
    cp "$src" "$dir/CLAUDE.md"
    note="CLAUDE.md=$(basename "$src")"
  else
    note="맨손(CLAUDE.md 없음)"
  fi
  echo "--- [$name] 생성 시작 ($note) ---"
  ( cd "$dir" && unset CLAUDECODE && export IS_SANDBOX=1 && \
    claude -p --dangerously-skip-permissions --model "$MODEL" "$PROMPT" \
    > "$LAB/$name.log" 2>&1 )
  rc=$?
  if [ -f "$dir/index.html" ]; then
    echo "    [$name] 완료 rc=$rc | $(wc -l <"$dir/index.html") lines, $(wc -c <"$dir/index.html") bytes"
  else
    echo "    [$name] index.html 미생성 rc=$rc (로그: $LAB/$name.log)"
  fi
done
echo "=== 라운드 $ROUND 종료 | 결과: $LAB ==="
