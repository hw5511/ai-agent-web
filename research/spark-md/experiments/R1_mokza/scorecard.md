# Round 1 채점표 — MOKZA 랜딩 (base vs SPARK v1)

- 프롬프트: `prompts/mokza.txt` · 모델: sonnet · 격리: `/tmp/spark-lab/R*`
- A = base(맨손, CLAUDE.md 없음) / B = v1(현행 SPARK.md)
- 산출물: A 1003줄·32.5KB / B 848줄·28.3KB

## 자동 측정 결과

| 항목 | base (A) | v1 (B) | 판정 |
|------|----------|--------|------|
| **NO_EMOJI** | FAIL — 그림이모지 5개 (☕🌱⚖️📍☕) | PASS — 진짜 이모지 0개 (장식 화살표 → 2개) | **v1 압승** |
| **FONT 규칙** | system/var serif, 웹폰트 로드 없음 (FONT JUDGMENT 흔적 없음) | Playfair(googleapis)+Pretendard(cdnjs), `--serif-ko/--serif-en` 변수 (FONT JUDGMENT 적용) | **v1 우위** |
| **SURPRISE/모션** | 라이브러리 0, canvas 0, will-change 0 | GSAP+Lenis+ScrollTrigger, will-change×11, cubic-bezier | **v1 우위** |
| **LAYOUT** | 중앙정렬 Hero→Section→Footer + **골드 그라디언트 히어로(SPARK 금지)** | 좌측정렬 거대 세리프 + 세로 사이드 텍스트 = 에디토리얼 비대칭 | **v1 우위** |
| **A11Y** | aria-label 1·alt 0·focus-visible 0·reduced-motion 0 | aria-label 0·alt 5·focus-visible 0·reduced-motion 0 | **둘 다 약함 (FAIL)** |
| **TYPO 마감** | …/곡선따옴표/tabular-nums/text-wrap 모두 0 | 모두 0 | **둘 다 없음 (FAIL)** |
| **JS_SCOPE** | var 0·scrollIntoView 0 | var 0·scrollIntoView 0 | 둘 다 PASS |
| **PREDICTABILITY** (낮을수록↑) | ~7 (전형적 AI 템플릿) | ~3 (에디토리얼) | **v1 우위** |

## 결론
- **가설 입증**: SPARK v1은 맨손 대비 **이모지 제거 · 폰트 규칙 · SURPRISE/모션 · 레이아웃 공식 탈피**에서 명확한 우위.
- **v1의 공백 = v2 타깃 확정**:
  1. **접근성**(focus-visible / prefers-reduced-motion / 아이콘 aria-label)이 v1에도 전무.
  2. **타이포 마감**(…·곡선따옴표·tabular-nums·text-wrap balance)이 v1에도 전무.
- 즉 v2는 *"v1의 강점(미감·모션)은 유지하면서 접근성·타이포 마감 게이트를 추가"* 하는 방향이 근거에 부합.

## 스크린샷
- `A_base_top.png` / `A_base_full.png` — 중앙 히어로 + 골드 그라디언트, 이모지 아이콘
- `B_v1_top.png` / `B_v1_full.png` — 다크 에디토리얼, 비대칭, 영문 인용 타이포
