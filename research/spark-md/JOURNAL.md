# SPARK.md 개선 연구일지

> 최신 라운드가 위로 온다. 각 라운드는 가설 → 실험 → 결과 → 결론 순으로 기록한다.

---

## 배경 / 참고 자료 (2026-06-03)

skills.sh 등에서 반응 좋은 프론트 디자인 스킬을 조사해 SPARK.md 개선 매트릭스를 도출했다.

| 영역 | 개선 방향 | 출처 |
|------|----------|------|
| 톤 다이얼 | `DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY` 3축 도입 | taste-skill |
| 규칙 분기 | "SURPRISE 의무 ↔ minimalist spectacle 금지" 충돌을 다이얼로 분기 | minimalist-ui / high-end |
| 접근성 게이트 | Self-Audit에 a11y(aria/focus-visible/reduced-motion/터치) 추가 | Vercel Web Interface Guidelines |
| 모션 디테일 | reduced-motion + 커스텀 cubic-bezier 명문화 | high-end / Vercel |
| 타이포 마감 | …·곡선따옴표·tabular-nums·text-wrap + 영문 폰트 페어링 | Vercel / high-end |
| SURPRISE 고급화 | seeded 생성배경 개념(라이브러리 제약 내) | algorithmic-art |
| DB 동기화 | SPARK 본문 폰트표 ↔ fonts.json(영문 4종 누락) 일치 | 내부 점검 |

참고 스킬: design-taste-frontend, minimalist-ui, high-end-visual-design (leonxlnx/taste-skill) ·
Anthropic frontend-design · algorithmic-art · Vercel web-design-guidelines / web-interface-guidelines ·
obra/superpowers brainstorming · UI/UX Pro Max.

---

## Round 1 — v1 검증 (base vs SPARK v1)  [완료 2026-06-03]

- **가설**: SPARK.md v1(=CLAUDE.md)을 주입하면 맨손 대비 (1) 이모지 제거 (2) 폰트 규칙 준수
  (3) SURPRISE 요소 (4) 레이아웃 공식 탈피에서 우위를 보인다. 단 접근성·타이포 마감은 v1에도 빈다.
- **세팅**: 프롬프트 `prompts/mokza.txt`, 모델 sonnet, `--dangerously-skip-permissions` + `IS_SANDBOX=1`,
  격리 경로 `/tmp/spark-lab/`. variant: `A=base(맨손)`, `B=v1(SPARK.md)`.
- **결과 요약** (상세: `experiments/R1_mokza/scorecard.md`):

| 항목 | base(A) | v1(B) |
|------|---------|-------|
| NO_EMOJI | ✗ 이모지 5개 | ✓ 0개 |
| FONT_RULE | ✗ FONT JUDGMENT 흔적 없음 | ✓ Playfair+Pretendard 변수 |
| SURPRISE | ✗ 라이브러리/모션 없음 | ✓ GSAP+Lenis+ScrollTrigger |
| LAYOUT | ✗ 중앙 공식 + 골드 그라디언트(금지) | ✓ 에디토리얼 비대칭 |
| A11Y | ✗ | ✗ (focus-visible/reduced-motion 둘 다 0) |
| TYPO_FINISH | ✗ | ✗ (…/곡선따옴표/tabular/balance 둘 다 0) |
| JS_SCOPE | ✓ | ✓ |
| PREDICTABILITY(낮을수록↑) | ~7 | ~3 |

- **결론**:
  - 가설 입증 — v1은 미감·이모지·폰트·모션·레이아웃에서 맨손을 확실히 앞선다.
  - **v1의 사각지대 = v2 타깃 확정**: ① 접근성(focus-visible/reduced-motion/aria) ② 타이포 마감(…·곡선따옴표·tabular-nums·text-wrap).
  - → v2 방향: *v1의 강점은 보존 + 접근성·타이포 마감 게이트 추가*. (다이얼/규칙분기는 별도 변형으로 비교)

---

## Round 2 — v2 변형 격리실험 (base vs v1 vs v2-core vs v2-full)  [완료 2026-06-03]

- **세팅**: `prompts/mokza.txt`, sonnet, 4-variant. 상세: `experiments/R2_mokza/scorecard.md`.
- **자동 게이트 결과** (focus-visible / reduced-motion / aria-label / tabular / text-wrap):
  base·v1 = 전부 0 → **v2-core(5/2/16/2/15), v2-full(4/3/12/1/7)** 로 사각지대 메움 입증.
- **시각 판정**: v2-core가 다크 에디토리얼 + 충실한 본문 + reduced-motion 정상으로 **종합 최상**.
  v2-full 히어로는 가장 정제됐으나 **reduced-motion에서 본문이 숨겨지는 회귀 버그**.
- **★ 핵심 발견**: v2-full의 reduced-motion 블록이 `*-duration:0.01ms`만 적용하고 reveal 요소의
  `opacity:1`/`transform:none` 복원을 누락 → 콘텐츠 은닉. v2-core는 명시 복원하여 정상.
- **결론**:
  - v2가 v1 대비 접근성·타이포에서 실효 개선 확인. 현재 **v2-core가 가장 안전·완성**.
  - v2-full spec 보강 필요: *"reduced-motion 분기 = 애니메이션 비활성 + 모든 reveal 요소를 최종 가시 상태로 즉시 복원"*.

---

## Round 3 — 미니멀 주제 일반화 검증 (plain)  [완료 2026-06-03]

- **세팅**: `prompts/plain.txt`, sonnet, 4-variant. 상세: `experiments/R3_plain/scorecard.md`.
- **발견 1 (다이얼 분기 작동)**: v2-full이 미니멀 주제에 DIALS를 스스로 낮춤(VARIANCE 3 / MOTION 3 "파티클·3D 금지" / DENSITY 2). 결과도 절제된 좌측정렬 헤드라인. → v1의 "무조건 SURPRISE"와 달리 톤 적합. **다이얼 채택 가치 확인.**
- **발견 2 (reduced-motion 비결정적 버그)**: 가시성 = **v2-full ✅ > v2-core ⚠️(헤드라인 누락) > base ✅ > v1 ❌(전체 백지)**.
  - v1: reduced-motion 미처리 → reveal 은닉으로 페이지 백지(정상화면은 멋지나 접근성 최악).
  - v2-core: 히어로가 JS 타이핑(빈 DOM)→ reduced-motion 시 텍스트 증발. **R2와 버그 주체 역전 → 비결정적.**
  - 근본원인: SPARK가 JS 텍스트효과를 권장하나 **DOM 완성텍스트(progressive enhancement)를 미강제**.
- **결론 / v2-final 필수**:
  1. reduced-motion = 애니 비활성 + **모든 reveal 최종 가시상태 즉시 복원**.
  2. **텍스트 progressive enhancement**(DOM에 완성 텍스트, JS는 enhancement만).
  3. v2-full 다이얼을 v2-final 기반으로 채택 + sweep1 정량 게이트 결합.

---

## ★ 연구 방향 결정 (2026-06-03, CEO)

- **정체성 진단**: 현 SPARK는 "범용"이 아니라 **고퀄 단일 랜딩/브랜드 페이지 생성기**(단일 index.html·인라인·≤1500줄·GSAP/Lenis/Three). SaaS 앱/대시보드/데이터 제품 UI는 구조상 커버 못 함.
- **CEO 결정**:
  1. 범위(랜딩 특화 vs 범용)는 **일단 관찰하며 유지** — 성급히 확정 안 함.
  2. **구조 실험 채택(v3 방향)**: **글자수 제한 해제 + CSS/JS/HTML 별도 파일 작성 후 링크** 방식 시도.
     → 단일 인라인 1500줄 제약이 "더 크고 복잡한(=범용에 가까운) 산출물"을 막는 핵심 병목. 이를 푸는 게 범용화의 1차 관문.
  3. **순서**: v2 먼저 마무리(Round 4 + 최종 리포트 + v2-final 확정) → 그 다음 위 구조 변경을 v3 실험으로.
- **v3 실험 설계 메모(예정)**: 동일 프롬프트로 (a) v2-final(단일 인라인) vs (b) v2-final + "멀티파일·무제한" 변형을 비교 — 산출물 규모/품질/유지보수성/링크 정합성. 멀티파일은 harness가 index.html 외 css/js도 생성·수거하도록 확장 필요.

---

## Round 4 — v2-final 검증  [진행중]
- v2-final(다이얼 + reduced-motion/텍스트 강제 + 정량 게이트) vs v1 vs v2-full. R4a=mokza, R4b=plain.
