# Round 6 채점표 — v4 5케이스 (LIGHTBULB 자가활성 + 자기검수·정제)

프롬프트 5종(서점/페스티벌/도자기/다이닝/아트전시) · sonnet · `/tmp/spark-lab/R6_v4` · stream-json 캡처

## LIGHTBULB 자가 활용 — ✅ 작동 (단 결정론 버그)
| 케이스 | curl 실행 | ignition | 사용 id | 멀티파일 |
|--------|----------|----------|---------|----------|
| 5개 전부 | **2회(ideas+pinches) ✅** | ✅ | lb-006/lb-103/lb-140 + p-021 | index+styles+script ✅ |

- ✅ 모델이 **STEP 0에서 스스로 curl로 LIGHTBULB를 받아옴**(사용자 붙여넣기 없이). 자가 활성 강제 성공.
- ✅ 받은 영감을 실제로 적용·인용(예: case1 "lb-140 개념미술의 UI 투영 → '여백'을 개념으로", "p-021 침묵하는 대리석 → fractalNoise 종이질감").
- ❌ **결정론 버그**: 모델이 curl에 **`random.seed(42)`를 스스로 추가** → 5개 프로젝트가 **전부 동일한 영감**(lb-006/103/140/p-021). LIGHTBULB의 "매번 새 영감" 가치 상실. (v3 "seeded 생성배경" 철학을 LIGHTBULB 픽에 잘못 전이한 것으로 추정)
- 완화: 영감이 같아도 **CONFIG_DIALS + 도메인**이 톤을 차별화 → 서점(차분 세리프)/페스티벌(네온 맥시멀)/아트전시(시안 실험)로 확연히 다름. 그러나 같은 주제 재생성 시 동일 결과가 나오는 문제는 남음.

## PHASE 5 자기검수·정제 — ✅ 작동
- **self-critique 실효**: case1에서 **HTML em-dash 7개를 직접 잡아 제거** 보고(`<self_critique>` + 완료 요약에 수정 내역 명시).
- **Lenis 가드 작동**: 5케이스 전부 **Lenis CSS 리셋(4행) 포함** → `.lenis.lenis-smooth{scroll-behavior:auto!important}`가 html smooth를 무력화. **R5 NOCTURNE 휠 먹통 버그가 v4에선 재발 안 함**(case5는 smooth 자체 제거).
- reduced-motion: 5케이스 전부 블록 존재 + h1 정상 표시(잔상/PULSE 등).
- **경미한 자기보고 부정확**: 모델은 "scroll-behavior:smooth 없음"이라 보고했으나 실제론 html에 남아있음(리셋이 무력화하므로 런타임 안전). 자기검수가 "효과적으로 안전"은 맞췄으나 "존재 여부" 서술은 부정확 → self-critique 점검 문구를 "효과적으로 무력화됐는가"로 다듬을 여지.

## 디자인 (3샷)
- case2 페스티벌: 네온 그린 + 거대 산세리프, 강렬(맥시멀). case5 아트전시: 다크 시안 글로우 + 殘像 워터마크, 실험적. case1 서점: 차분 세리프, 챕터(I~V) 구조. → **톤 차별화 양호.**

## 판정
- **v4 핵심 기능 둘 다 작동**: LIGHTBULB 자가활성 ✅, 자기검수·정제 ✅(실제 버그 자가 수정).
- **수정 필요 1건**: LIGHTBULB 픽의 `random.seed` 고정 금지 → 영감이 매번 새롭도록. (v4 STEP 0에 NEVER 추가)
- 후속: self-critique의 scroll-behavior 점검 문구 정밀화.

> 스크린샷은 라이브로 대체(샌드박스 CDN 차단으로 모션 미표시). 라이브: https://hw5511.github.io/ai-agent-web/demo/spark-research/v4-cases/
