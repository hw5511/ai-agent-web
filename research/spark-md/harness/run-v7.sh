#!/usr/bin/env bash
# v7-lean 러너 — 외부 무작위 SEED CARD 강제 배정 + 락인 + 병렬
# 하네스가 MACRO/VISUAL/PERSONA/WILD를 무작위로 뽑아 프롬프트에 prepend한다(모델은 선택 못 함).
# 사용: run-v7.sh <라운드ID> <name>:<prompt> [...]
set -u
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
V="$REPO/research/spark-md/versions/v7-lean.md"
PDIR="$REPO/research/spark-md/prompts"
IDEAS="$REPO/skills/lightbulb/ideas.json"
MODEL="sonnet"; MAXPAR="${MAXPAR:-5}"

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

$(cat "$PDIR/$pf")"
  ( cd "$dir" && unset CLAUDECODE && export IS_SANDBOX=1 && \
    claude -p --dangerously-skip-permissions --model "$MODEL" --output-format stream-json --verbose "$prompt" \
    > "$L/$name.stream.jsonl" 2> "$L/$name.err" )
  echo "$name DONE [$m | $v | $p | $w]" >> "$L/_seeds.log"
}
echo "=== v7 병렬 (동시 $MAXPAR) ==="
run=0
for spec in "$@"; do IFS=':' read -r name pf <<< "$spec"; echo "  launch $name (seed 무작위)"; gen "$name" "$pf" & run=$((run+1)); [ "$run" -ge "$MAXPAR" ] && { wait -n 2>/dev/null||wait; run=$((run-1)); }; done
wait
echo "=== 배정된 SEED ==="; cat "$L/_seeds.log"
echo "=== 산출물 ==="
for spec in "$@"; do IFS=':' read -r name pf <<< "$spec"; d="$L/$name"; f=""; for ef in index.html styles.css script.js; do [ -f "$d/$ef" ]&&f="$f $ef"; done; echo "  [$name]${f:- 없음}"; done
echo "결과: $L"
