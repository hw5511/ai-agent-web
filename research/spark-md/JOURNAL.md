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

- **정체성 진단**: 현 SPARK는 **고퀄 단일 랜딩/브랜드 페이지 생성기**(단일 index.html·인라인·≤1500줄·GSAP/Lenis/Three).
- **CEO 결정**:
  1. **SaaS 앱/대시보드/제품 UI 범용화는 폐기**(오버스코프). SPARK는 **랜딩/브랜드/포트폴리오 페이지**에 계속 집중.
  2. 단 **"규모 확장"은 채택(v3 방향)**: **글자수 제한 해제 + CSS/JS/HTML 별도 파일 작성 후 링크** 방식 시도.
     → 목적은 SaaS가 아니라, 단일 1500줄 인라인 제약을 풀어 **더 크고 정교한 멀티섹션 사이트**까지 한 도구로 커버하는 것.
  3. **순서**: v2 먼저 마무리(Round 4 + 최종 리포트 + v2-final 확정) → 그 다음 위 구조 변경을 v3 실험으로.
- **추가 결정 (2026-06-03, CEO): "디자이너에 더 비중"**
  - v2가 접근성·reduced-motion·JS 스코프 등 **프론트 엔지니어링 쪽으로 무게중심이 기운** 점 교정.
  - 원칙: **엔지니어링 항목(접근성·reduced-motion·성능)은 통과해야 할 "바닥선(floor)"으로 조용히** 두고,
    **헤드라인·주역은 디자인 판단(아트 디렉션·구성·색·타이포·미감 큐레이션)** 으로 끌어올린다.
  - 실험서 나온 버그 픽스(reduced-motion 가시복원, 텍스트 PE)는 **유지하되 "안전장치" 섹션으로 격하 배치**, 문서 상단/정체성·SPARK 본질은 디자이너 시선으로 재서술.
  - 적용 시점: v2-final 정체성·구조 재배치(이번 라운드 채점 후) 및 v3 설계 전반.
  - 반영할 디자인-축 지식(sweep): high-end 미감 수치/Double-Bezel, minimalist 토큰, taste-skill 미감 카운트, 60/30/10·타입스케일, canvas-design "의도를 드러내지 말라", distill/quieter/bolder 미감 변환.
- **v3 실험 설계 메모(예정)**: 동일 프롬프트로 (a) v2-final(단일 인라인) vs (b) v2-final + "멀티파일·무제한" 변형을 비교 — 산출물 규모/품질/유지보수성/링크 정합성. 멀티파일은 harness가 index.html 외 css/js도 생성·수거하도록 확장 필요.

---

## Round 4 — v2-final 검증  [완료 2026-06-03]
- R4a(mokza, v1/v2-full/v2-final) + R4b(plain, v2-core/v2-final). 상세: `experiments/R4_verify/scorecard.md`.
- **결과**:
  - em-dash 게이트 작동: v1=8 → v2-final=0.
  - reduced-motion 안전: v2-final은 mokza·plain 양쪽에서 콘텐츠 완전 표시. 반면 **v2-core는 plain에서 헤드라인 또 증발**(버그 재발) → v2-final이 progressive-enhancement+가시복원으로 차단.
  - 접근성(aria/focus) 확보, JS 전용 빈 텍스트 0.
- **판정: v2-final 채택 권장.** v1의 미감 유지 + v2-core/full의 비결정적 버그 제거 + 정량 게이트.
- **남은 작업**: v2-final을 "디자이너 우위"로 재서술(엔지니어링=floor) → v2 최종 확정 → v3(멀티파일·무제한) 실험.

---

## Round 5 — v3 멀티파일 검증 (v2-final 단일 vs v3)  [완료 2026-06-03]
- 멀티섹션 주제(NOCTURNE 향수). 상세: `experiments/R5_nocturne/scorecard.md`.
- **결과**:
  - v3가 `index.html`(439L) + `styles.css`(1376L) + `script.js`(418L)로 **진짜 분리·링크, 깨진 링크 0**, styles.css 실제 적용 렌더.
  - 글자수 천장 제거 → v2-final(단일 1283L, 옛 1500 상한 근접) 대비 **상한 없이 확장**.
  - reduced-motion 안전(h1 정상), 디자인 강화 반영(비대칭 분할 헤드라인 "NOC/TURNE").
- **판정: v3 채택 가능.** v2-final 강점 승계 + 규모 천장 제거. (외부 CDN 미로드는 샌드박스 탓, v3 결함 아님)

---

## 연구 종합 (v1 → v3)
- v1(미감) → v2-final(접근성 floor·reduced-motion·정량게이트·다이얼·디자이너 우위) → v3(멀티파일·무제한·디자인 강화).
- 라이브 `SPARK.md` 반영은 **CEO 확인 후**. 권장: 단일 페이지=v2-final, 규모 큰 사이트=v3.
- 후속: 더 큰 사이트/다주제 반복, 인트로 과지연 가드, 비-시각축(성능예산·SEO·전환카피)은 별도 트랙.

---

## R5 후속 — Lenis 휠 먹통 버그 → v3 규칙화 (2026-06-03)
- **증상**: 배포한 v3(NOCTURNE) 휠 스크롤이 끊겨 스크롤바 수동 드래그해야 함.
- **원인**: `styles.css` `html { scroll-behavior: smooth }` ↔ Lenis(JS 부드러운 스크롤, 휠 preventDefault) **이중 부드러움 충돌**. 네이티브 smooth가 Lenis의 프레임별 scrollTo를 재애니메이션 → 먹통. 스크롤바 드래그는 Lenis 휠핸들러 우회라 동작.
- **부차**: Lenis 권장 CSS 리셋 부재.
- **조치(규칙화)**: v3에 `LENIS CSS 충돌 가드` 추가 — html `scroll-behavior:smooth` 금지 + Lenis CSS 리셋 강제 + Self-Audit `LENIS_GUARD`/`PERF_CHECK` 점검. (변경점 ⑬)
- **교훈**: "라이브러리 강제(Lenis 필수)"는 그 라이브러리의 알려진 gotcha 가드까지 동봉해야 안전.

---

## Round 6 — v4 5케이스 (LIGHTBULB 자가활성 + 자기검수·정제)  [완료 2026-06-03]
- 5케이스(서점/페스티벌/도자기/다이닝/아트전시), sonnet, stream-json 캡처. 상세: `experiments/R6_v4/scorecard.md`.
- **LIGHTBULB 자가활성 ✅**: 5케이스 전부 모델이 STEP0에서 직접 curl(ideas+pinches) 실행·인용·적용. 자가 활성 강제 성공.
- **❌ 결정론 버그**: 모델이 curl에 `random.seed(42)` 추가 → 5케이스 영감 전부 동일(lb-006/103/140/p-021). LIGHTBULB "매번 새 영감" 가치 상실. (다이얼+도메인이 톤은 차별화했으나 영감 다양성 0)
  - **조치**: v4 STEP0에 "LIGHTBULB 픽 random.seed 고정 금지(seeded 생성배경과 구분)" NEVER 추가.
- **PHASE 5 자기검수·정제 ✅**: case1에서 em-dash 7개 자가 수정. Lenis 가드 5케이스 전부 리셋 포함→R5 휠먹통 재발 안 함. reduced-motion 정상.
  - 경미: 모델이 "scroll-behavior:smooth 없음" 보고했으나 실제론 존재(리셋이 무력화→런타임 안전). 점검 문구 정밀화 여지.
- **판정**: v4 두 핵심(자가활성·자기검수) 작동. seed 금지 수정 후 재확인 필요(Round 7 후보).

---

## Round 7 — v4 seed 수정본 재검증  [완료 2026-06-03]
- 5케이스 재실행(seed 금지 규칙 적용). 상세: `experiments/R7_v4_seedfix/`.
- **★ seed 버그 해결 확인**:
  - LIGHTBULB curl에 random.seed 없음 = 5/5 ✅ (case5의 'random.seed' 1회는 모델이 *규칙을 이해하고 언급한 추론 문장*이었음 — curl 2개 모두 seed 無).
  - id가 케이스마다 전부 고유: case1 lb-022/163/189 · case2 lb-019/051/055… · case3 lb-139/185/190 · case4 lb-160/181/194 · case5 lb-103/175/182. (R6: 전부 lb-006/103/140 동일 → 해결)
- **floor 유지**: Lenis 리셋 5/5, reduced-motion 5/5, 멀티파일 5/5.
- **판정: v4 확정 가능.** LIGHTBULB 자가활성+다양성 ✅, 자기검수·정제 ✅, 멀티파일·Lenis가드·reduced-motion ✅.

---

## ★ v4 체크포인트 + 피드백 (2026-06-03, CEO)
- **v4를 안정 체크포인트로 확정.** (LIGHTBULB 자가활성+다양성, PHASE5 자기검수·정제, 멀티파일·Lenis가드·reduced-motion 검증 완료)
- **CEO 피드백**:
  1. 이미지 사용 시 퀄리티↑는 확인. 그러나 **5케이스 모두 "전형적 웹사이트"의 한계를 못 넘음**(hero→섹션→footer, 수직스크롤, 다크 에디토리얼 틀).
  2. **LIGHTBULB가 실제로 결과에 얼마나 영향을 줬는지** 측정 필요(현재는 표면 장식 수준 의심).
  3. **창의성을 더 끌어올릴 방법** 분석 필요.
- **열린 연구질문 (다음 논의/실험 대상)**:
  - Q1. LIGHTBULB 효과 측정 — *ablation*: 동일 프롬프트 v4(LIGHTBULB) vs v4-노라이트벌브, 그리고 R6(영감동일) vs R7(영감상이) 출력 유사도 비교.
  - Q2. "전형성" 천장의 원인 — 프롬프트가 "섹션 나열형 사이트"를 요구 + SPARK 사고가 섹션 기반 + 모델 기본값이 안전한 수직스크롤. LIGHTBULB는 *표면 효과*만 주입하고 *구조/장르*는 못 바꿈.
  - Q3. 돌파 방향 후보 — ① 구조/내비 혁신 강제(비선형·공간·캔버스 주도) ② LIGHTBULB가 표면이 아닌 *컨셉/구조*를 주도하게 ③ "장르 발산"(이게 꼭 스크롤 사이트여야 하나?) ④ 인터랙션 자체가 매체(페이지=도구/경험).
