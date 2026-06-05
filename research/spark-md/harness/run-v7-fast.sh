#!/usr/bin/env bash
# v7-fast 러너 — run-v7.sh와 동일한 SEED CARD 강제배정, 단 생성 속도 최적화.
# 분석(R17 stream usage): 벽시계 시간의 ~99.9%가 모델 추론(api_ms≈duration_ms).
#   하네스/verbose 오버헤드는 무의미. 시간 ∝ output_tokens(사고토큰+코드+자기검증 반복).
#   느린 run(noc 40분)은 thinking 1386청크 + Bash 9회 자가검증 + 13턴의 과잉작업이 원인.
# 최적화 레버 2개:
#   1) --effort medium : 사고(thinking) 예산 축소 → 숨은 output 토큰 절반↓
#   2) --disallowedTools Bash : 모델이 쉘로 자기 결과를 검사/미리보기하는 에이전트 루프 차단
#      (산출물은 Write/Edit로만. self_check는 머릿속 1패스.)
# 로그도 stream-json/verbose 끄고 평문만 저장(1MB JSONL → 수KB).
set -u
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
V="$REPO/research/spark-md/versions/v7-lean.md"
PDIR="$REPO/research/spark-md/prompts"
IDEAS="$REPO/skills/lightbulb/ideas.json"
MODEL="sonnet"; MAXPAR="${MAXPAR:-5}"; EFFORT="${EFFORT:-medium}"

MACRO=(
"중앙 대칭 집중형 (한 점으로 시선 수렴)"
"비대칭 좌측 정렬 (거대 타이포)"
"풀블리드 이미지/캔버스 위 최소 텍스트"
"분할 화면 (좌우 또는 상하 대비 2분할)"
"그리드 파편화 / 모듈러 셀 배치"
"가로 스크롤 / 패럴랙스 띠"
"중앙 거대 단일 오브젝트 + 주변 위성 배치"
"대각선·회전축 구성 (기울어진 그리드)"
"콘텐츠가 가장자리로 밀려난 극단적 여백 중심"
"전체화면 인터랙티브 무대 (UI는 모서리로)"
)
VISUAL=(
"키네틱 타이포그래피 (글자가 주인공)"
"이미지 콜라주 / 몽타주 / 마스킹"
"SVG 도형 모핑 / 경로 드로잉"
"3D 원근·공간 (CSS transform, perspective)"
"그리드·셀 디스토션 / 픽셀 정렬"
"실물 오브젝트 메타포 (다이얼·필름·카드·렌즈·계기판)"
"컬러필드 / 그라디언트 상태 전이"
"타입·이미지 스크램블 / 셔플"
"컷아웃 / 레이어 시차 깊이 (parallax depth)"
"듀오톤 이미지 + 인터랙티브 마스크"
)
PERSONA=(
"1970년대 스위스 활자 조판공"
"일본 전위 그래픽 디자이너"
"브루탈리즘 잡지 아트디렉터"
"인디 음반 커버 일러스트레이터"
"건축 도면 제도사"
"보태니컬 세밀화가"
"영화 타이틀 시퀀스 디자이너"
"리소그래프 인쇄 장인"
"데이터 시각화 저널리스트"
"빈티지 여행 포스터 화가"
)
pick(){ local arr=("$@"); echo "${arr[$((RANDOM % ${#arr[@]}))]}"; }
wild(){ python3 -c "import json,random;d=json.load(open('$IDEAS'))['ideas'];print(random.choice(d)['title'])" 2>/dev/null || echo "메아리"; }

L="/tmp/spark-lab/$1"; shift; rm -rf "$L"; mkdir -p "$L"
gen(){
  local name="$1" pf="$2"; local dir="$L/$name"; mkdir -p "$dir"; cp "$V" "$dir/CLAUDE.md"
  local m=$(pick "${MACRO[@]}") v=$(pick "${VISUAL[@]}") p=$(pick "${PERSONA[@]}") w=$(wild)
  cat > "$L/$name.seed.txt" <<EOF
<seed_card>
MACRO_STRUCTURE: $m
VISUAL_MECHANISM: $v
PERSONA: $p
WILD_CONCEPT: $w
</seed_card>
EOF
  local prompt="$(cat "$L/$name.seed.txt")

$(cat "$PDIR/$pf")

[작업 규칙] index.html·styles.css·script.js를 Write로 작성하고 끝내라. 결과를 확인하려고 쉘 명령(미리보기·grep·테스트)을 돌리지 마라. self_check는 머릿속 1패스로 하고 필요한 1회 수정만 Edit하라."
  local t0=$(date +%s)
  ( cd "$dir" && unset CLAUDECODE && export IS_SANDBOX=1 && \
    claude -p --dangerously-skip-permissions --model "$MODEL" --effort "$EFFORT" \
      --disallowedTools "Bash" "$prompt" \
    > "$L/$name.out.txt" 2> "$L/$name.err" )
  local t1=$(date +%s)
  echo "$name DONE ${EFFORT} $((t1-t0))s [$m | $v | $p | $w]" >> "$L/_seeds.log"
}
echo "=== v7-fast 병렬 (동시 $MAXPAR, effort=$EFFORT, Bash 차단) ==="
run=0
for spec in "$@"; do IFS=':' read -r name pf <<< "$spec"; echo "  launch $name"; gen "$name" "$pf" & run=$((run+1)); [ "$run" -ge "$MAXPAR" ] && { wait -n 2>/dev/null||wait; run=$((run-1)); }; done
wait
echo "=== 결과(시간 포함) ==="; cat "$L/_seeds.log"
for spec in "$@"; do IFS=':' read -r name pf <<< "$spec"; d="$L/$name"; f=""; for ef in index.html styles.css script.js; do [ -f "$d/$ef" ]&&f="$f $ef"; done; echo "  [$name]${f:- 없음}"; done
echo "결과: $L"
