#!/usr/bin/env bash
# aesthetic-gate.sh — 정적 미감 게이트 (perfcheck.sh를 보완하는 두 번째 게이트)
#
# 왜: deep research(2026) 결론 — 정적 linter(perfcheck)는 성능(THE LAW/TRAP)과 마감(em-dash/이모지/링크)만
#   측정하고 *미감·창의성은 0측정*이다(C). 두 페이지가 똑같이 perfcheck를 통과하면서 하나는 예쁘고 하나는 추할 수 있다.
# 어떻게: VLM 스크린샷 채점. 단 *절대점수는 비신뢰*(MLLM exact-match 35~38%) → **pairwise(기준 대비 win/lose)만** 쓴다.
#   pairwise는 인간 선호와 90~94% 일치(ArtifactsBench 94.4% vs WebDev Arena, UI-Bench). position bias는 A/B 순서를
#   바꿔 두 번 돌려 상쇄한다. 고정 baseline(최소 합격선=baseline/floor.png) 대비, **명백히 나쁜 것만 FAIL**시키는 coarse gate.
#   (pairwise는 품질차가 클 때만 ~93% 정확, 근소차는 ~50%라 신뢰 못 함 → 순위 매기지 말고 "확실히 나쁜 것"만 거른다.)
#
# 한계(정직히): 이 샌드박스는 외부 CDN(폰트·GSAP·캔버스)을 차단한다. 따라서 이 게이트는 **정적 구성**
#   (레이아웃 응집·타이포 위계·히어로 가독성/대비·여백 리듬·시각적 흥미)만 본다. 모션/인터랙션 품질은
#   여전히 라이브(GitHub Pages)에서 사람이 확인해야 한다. 그래도 "명백히 나쁜 출력"의 대부분은 정적 구성 실패라 유효하다.
#
# 사용: research/spark-md/harness/aesthetic-gate.sh /tmp/spark-lab/R20_x/book  [dir2 ...]
#   인자는 index.html을 담은 폴더(perfcheck와 동일). 결과는 폴더별 마지막 줄 `AESTHETIC <name>: PASS|FAIL|UNKNOWN ...`.
#   조절: BASELINE(기본 baseline/floor.png) / MODEL(기본 sonnet) / VIEWPORT(기본 1280,800) / WAIT(기본 2500ms)
# 의존: playwright(헤드리스 크로미움) + claude CLI. 브라우저 없으면 1회 `npx playwright install chromium` 안내.
set -u
HARNESS="$(cd "$(dirname "$0")" && pwd)"
BASELINE="${BASELINE:-$HARNESS/baseline/floor.png}"
MODEL="${MODEL:-sonnet}"
VIEWPORT="${VIEWPORT:-1280,800}"
WAIT="${WAIT:-2500}"
PWPATH="${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}"

[ -f "$BASELINE" ] || { echo "AESTHETIC: baseline 없음 ($BASELINE) — baseline/README.md 참고"; exit 2; }

# index.html을 헤드리스로 열어 첫 화면(히어로) 스크린샷. CDN 차단 환경이라 service worker도 막는다.
shot(){ # $1=index.html경로 $2=출력png
  PLAYWRIGHT_BROWSERS_PATH="$PWPATH" npx --yes playwright screenshot \
    --viewport-size="$VIEWPORT" --wait-for-timeout="$WAIT" --block-service-workers \
    "file://$1" "$2" >/dev/null 2>&1
}

# claude를 VLM pairwise 심판으로. winner 한 단어(A|B|TIE)만 stdout.
judge(){ # $1=imgA $2=imgB
  local out
  out="$( cd /tmp && unset CLAUDECODE && export IS_SANDBOX=1 && \
    claude -p --dangerously-skip-permissions --model "$MODEL" --effort low --allowedTools "Read" \
      "두 웹페이지의 첫 화면 스크린샷을 비교한다. A=$1 B=$2 를 Read로 열어 보라. \
판정 기준은 '의도적이고 유능한 비주얼 디자인': 레이아웃 응집, 타이포그래피 위계, 히어로 가독성/대비, \
여백 리듬, 시각적 흥미. 둘이 비슷하면 TIE. 설명은 짧게. \
반드시 마지막 줄에 JSON 한 줄만 출력하라: {\"winner\":\"A\"|\"B\"|\"TIE\",\"reason\":\"<25자 이내 한국어>\"}" \
    2>/dev/null )"
  echo "$out" | grep -oE '"winner" *: *"(A|B|TIE)"' | tail -1 | grep -oE '(A|B|TIE)' | tail -1
}

overall=0
for d in "$@"; do
  name="$(basename "$d")"; html="$d/index.html"
  if [ ! -f "$html" ]; then echo "AESTHETIC $name: UNKNOWN (index.html 없음)"; continue; fi
  cand="$d/_shot.png"
  if ! shot "$html" "$cand" || [ ! -s "$cand" ]; then
    echo "AESTHETIC $name: UNKNOWN (스크린샷 실패 — playwright/크로미움 확인: npx playwright install chromium)"; continue
  fi
  # 양방향(position bias 상쇄): 1) A=후보,B=floor  2) A=floor,B=후보
  w1="$(judge "$cand" "$BASELINE")"
  w2="$(judge "$BASELINE" "$cand")"
  # 각 순서에서 후보의 결과(win/loss/tie)로 환산
  r1=tie; case "$w1" in A) r1=win;; B) r1=loss;; esac
  r2=tie; case "$w2" in B) r2=win;; A) r2=loss;; esac
  if [ -z "$w1" ] || [ -z "$w2" ]; then
    echo "AESTHETIC $name: UNKNOWN (심판 응답 파싱 실패) [o1=${w1:-?} o2=${w2:-?}]"; continue
  fi
  losses=0; [ "$r1" = loss ] && losses=$((losses+1)); [ "$r2" = loss ] && losses=$((losses+1))
  # coarse: floor보다 *양방향 모두* 못하면(=확실히 나쁨) FAIL. 그 외(win/tie 섞임)는 PASS.
  if [ "$losses" -ge 2 ]; then verdict="FAIL"; overall=$((overall+1)); else verdict="PASS"; fi
  echo "AESTHETIC $name: $verdict (floor 대비 o1=$r1 o2=$r2)"
done
echo "AESTHETIC TOTAL: FAIL=$overall"
