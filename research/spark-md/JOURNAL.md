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

## Round 3 — 미니멀 주제 일반화 검증 (plain)  [진행중]

- **가설**: 실용·미니멀 주제(`PLAIN` 메모앱)에서 ① v2-full 다이얼 분기가 MOTION을 낮춰 과한 장치를 피하고
  ② v1은 "무조건 SURPRISE" 탓에 과잉 연출하거나 톤 부조화를 보일 수 있다. ③ reduced-motion 버그 재현 여부.
- **세팅**: `prompts/plain.txt`, sonnet, 4-variant.
- **결과**: _(생성 후 기입)_
