# SPARK.md 개선 연구일지

> 라운드는 아래로 누적된다(최신이 맨 끝). 각 라운드는 가설 → 실험 → 결과 → 결론 순.

## 현재 상태 (TL;DR, ~R19 기준)
- **현행 버전**: `versions/v7-lean.md` — ① 외부 SEED CARD(MACRO/VISUAL/PERSONA/WILD) 무작위 강제배정+락인 ② 자기 디폴트 회피 ③ 성능을 단일 원리(THE LAW: 매프레임=transform/opacity / THE TRAP: 무거운 레이어 이동 금지)로 ④ lean(금지목록 삭감).
- **표준 생성 워크플로**: `harness/run-v7-fast.sh` = `--effort low`(사고 1패스) + `--disallowedTools Bash`(자가검증 루프 차단) → `perfcheck.sh` 정적검사 → FAIL이면 `--resume`(low)로 그 항목만 교정. **R17 39.8분 → ~10분(-75%), perfcheck 0 FAIL.** (effort max/high는 타임아웃/과부하 → 금지)
- **검증된 목표**: 같은 프롬프트→매번 다른 산출(R16) · 다도메인 커버(R6/R19) · 클리셰 수렴 탈출(R14) · 렉 없는 코드(R17) · 빠른 생성(R18~19).
- **라이브 데모**: `demo/spark-research/` (v2~v7.2, v7-fast). **라이브 SPARK.md(curriculum) 반영은 미정** — 연구 버전에만 적용 중.
- **archive/**: 구 버전(v2~v6)·구 러너·구 리포트는 `archive/`로 이동(재현용). 신규 작업은 위 현행만 사용.

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

---

## Round 8 — LIGHTBULB Ablation  [완료 2026-06-04]
- v4 vs v4-noLB × 2주제(mokza/plain), stream-json. 상세: `experiments/R8_ablation/`.
- 대조군 정상: v4=curl 실행, noLB=curl 0.
- **결과: LIGHTBULB 효과 = 낮음(표면 장식).** mokza v4≈noLB 거의 동일(레이아웃·타이포·구조·톤 같음), 차이는 표면 입자/온기뿐. plain도 동일.
- **결론**: 결과는 domain+다이얼+디자이너 규칙이 결정. LIGHTBULB는 선택적 폴리시. → LB가 의미 있으려면 *구조/컨셉 주도*(v5-B)로 격상하거나, "양념"으로 인정. (CEO 의심 입증)

## Round 9 — 창의성 돌파축 A/B/C/D  [완료 2026-06-04]
- 열린 주제(천문대 "이안", 섹션 미지정)로 v5-A/B/C/D. 상세: `experiments/R9_breakthrough/`.
- **A 장르발산** ✗약함(여전히 스크롤+별자리 액센트) / **B 영감→구조** ✗약함(표준 히어로) / **C 컨셉우선** △(은유 전면 침투, 가장 몰입적이나 포맷은 스크롤) / **D 인터랙션=매체** ✓(전체화면 인터랙티브 캔버스=경험, 유일하게 "사이트" 탈피. 단 정적 폴백 빈 화면=접근성 공백).
- **핵심**: 선언적 규칙(A·B)만으론 모델의 "안전한 수직스크롤" 기본값을 못 깸. **매체 자체를 바꾸는 강제(D)**가 가장 효과적. C는 "다른 인상"을 가장 잘 냄.
- **v5 방향 가설**: 전형성 돌파 = **D(인터랙션=매체) + C(중심 은유)** 결합("컨셉 기반 경험") + D의 접근성 공백 보완(정적 폴백 강제).

---

## ★ CEO 피드백 — 돌파축 산출물 (2026-06-04, 천문대 "이안")
- **B (영감→구조)**: 자동 게이트상 "전형성 약함"으로 판정했으나, **마우스 호버 별자리 인터랙션이 CEO 마음에 듦**. → 구조는 표준이어도 *인터랙션 디테일*은 호평. (인터랙션 품질과 구조 파괴는 별개 축임을 시사)
- **D (인터랙션=매체)**: **"창의성" 방향성 좋음 — 기존 구조를 깸**. CEO가 전형성 탈피를 긍정 평가. → v5의 핵심 방향으로 채택 가치.
- **종합 신호 (v5 설계 반영)**:
  1. **D의 "구조 파괴(인터랙션=매체)"를 v5 메인 축으로.**
  2. 단 D의 약점(정적 폴백 빈약·접근성)은 보완하되, **B식 "정교한 마우스 인터랙션 디테일"을 곁들이면** 구조 파괴 + 디테일 둘 다 잡을 수 있음.
  3. → v5 가설 갱신: **D(인터랙션=매체, 구조 파괴) + C(중심 은유) + B의 인터랙션 디테일 품질** + 정적 폴백 강제.

---

## ★ v5 방향 확정 (2026-06-04, CEO) — "균형(2번)"
- **결정**: 히어로에 창의성(D식 인터랙션=매체, 구조 파괴) + 그 아래 정상 콘텐츠.
- **v5 설계 원칙**:
  - **HERO = 경험 구역**: 중심 은유(C)를 *행위로 경험*하게 하는 인터랙티브 히어로(D). 마우스 인터랙션 디테일(B 호버 별자리류)로 손맛.
  - **본문 = 콘텐츠 구역**: 히어로 아래는 그 은유로 엮인 *읽을 수 있는* 정상 섹션. 검색·스크린리더 OK.
  - **floor 유지**: 히어로 경험에도 정적 폴백(키보드/reduced-motion/JS-off에서 핵심 메시지·CTA 보임). 본문 텍스트는 항상 DOM에.
  - v4 자산 전부 승계(자기검수·Lenis가드·다이얼·멀티파일·LIGHTBULB 자가활성).
- 다음: v5 작성 → 검증(천문대 등 동일 주제로 D vs v5 비교, 히어로 파격 + 본문 접근성 동시 충족 확인).

---

## Round 10 — v5 검증 (EXPERIENCE-HERO + CONTENT-BODY)  [완료 2026-06-04]
- 2주제(천문대/향수), 상세: `experiments/R10_v5/`.
- **성공**: 둘 다 캔버스 인터랙티브 히어로 + 다수 읽기 섹션(observatory 4섹션/nocturne 5섹션).
- observatory(=D 동일주제) 직접비교: 히어로=별자리 캔버스+"커서를 움직여 별자리를 찾으세요"(B식). reduced-motion서 h1+본문 715자 정상(D의 빈화면 해결). 본문="고요함이 곧 선명함이다"+데이터(tabular) 완전 읽기 가능.
- **판정: v5 = 창의성(경험 히어로) + 접근성(본문/폴백) 균형 달성.** D의 약점 보완. 다음 체크포인트 후보.

---

## ★ v5 통과 + 새 딜레마 (2026-06-04, CEO) — 컨셉 수렴(클리셰)
- **v5 통과(체크포인트 후보).** 단 새 문제: 천문대도 향수도 **"별자리" 모티프로 수렴** → 컨셉 단계의 창의성 약화.
- **진단**: 모델이 도메인의 *첫 번째 뻔한 연상*(천문대→별, 향수→밤→별)에 닻을 내리고, LIGHTBULB는 그 뻔한 컨셉에 *장식으로* 붙음. = 시각 클리셰가 아니라 **컨셉 클리셰**.
- **v6 가설**: LIGHTBULB를 *발상 엔진*으로 승격 + 창의적 발상법(forced connection / SCAMPER / 의도적 낯설게하기 / random-entry) 도입.
  - 핵심: **LIGHTBULB 랜덤 spark = 강제연결 씨앗.** "도메인 × 무관한 spark"의 억지 조합에서 비(非)자명 컨셉 도출.
  - 컨셉 단계에 "뻔한 첫 연상 금지(BANNED_OBVIOUS)" + 후보 N개 발산 후 가장 비자명한 것 선택.
- **다음**: skills.sh sweep 3(발상법/브레인스토밍/컨셉팅 집중, dedup) → v6 설계. (sweep1에 obra/superpowers brainstorming 기보유)

---

## Round 11 — v6 검증 (Concept Divergence)  [완료 2026-06-04]
- 수렴났던 천문대/향수 재실행. 상세: `experiments/R11_v6/`.
- **★ 별자리 클리셰 탈출 성공**: 천문대→**보케/초점**("빛이 닿지 않는 곳에서 비로소 보이는 것들"), 향수→**공기의 진동/파동·향의 부재(SIT Subtraction)**("밤은 향기로 기억된다"). 둘 다 index.html에 별/star 언급 0.
- BANNED_OBVIOUS 작동(향수: 별빛·밤하늘·어둠·촛불 금지 자가적발). 발산법 실사용(Bisociation/SIT).
- 균형(v5) 유지: 경험 히어로+본문(4/5섹션), reduced-motion 정상.
- **판정: v6 성공 — 컨셉 수렴 해결 + 균형 유지. 현재 최상위 후보.**

---

## Round 12 — v6.1 검증 (히어로 가독성/임팩트 회복)  [완료 2026-06-04]
- R11 피드백 교정. 상세: `experiments/R12_v61/`.
- **성공**: 천문대→**가시광 스펙트럼/파장**(VISUAL_IMPACT=9, 거대 볼드 "이안"+프리즘 커서), 향수→**밤을 향으로 증류**(거대 볼드 NOCTURNE+골드 CTA+노트 피라미드 내비). 둘 다 별/star 0.
- VISUAL_IMPACT_SCORE 게이트 작동(저투명 색값 v6=2→v6.1=1, nocturne 0). 별자리 회귀 없음 + 히어로 또렷·강렬 회복.
- **판정: v6.1 성공 — 비자명 컨셉 + v5급 시각 임팩트 양립. 현재 최상위 후보.**
- (운영) 다음 라운드부터 run-par.sh 병렬 적용.

---

## ★ R12 후속 발견 (2026-06-04, CEO) — 클리셰의 "층 이동" (기법 수렴)
- **증상**: v6.1 천문대·향수 둘 다 "출렁이는 파동선/줄 튕김" 캔버스로 수렴(컨셉은 스펙트럼 vs 증류로 달랐는데도).
- **원인 (코드 증거)**: observatory `wave×15·amplitude·sin/cos`, nocturne `line×21·spring×6·wave`. LIGHTBULB은 서로 다름(obs lb-191/179, noc lb-006 스프링) → 영감 탓 아님.
  - ① 모델의 "강렬한 인터랙티브 캔버스" 레퍼토리가 좁음 → 디폴트가 `sin()` 파동선/파티클.
  - ② v6.1 VISUAL_IMPACT 압력이 그 안전한 디폴트로 밀어냄.
  - ③ 하필 두 컨셉(파장=wave, 스프링=탄성)이 둘 다 파동친화적.
- **핵심 통찰**: 클리셰는 *층층*이다. v6에서 **컨셉 클리셰(별자리)**를 막자, v6.1에서 **기법 클리셰(파동선)**가 그 자리를 채움. 발산을 컨셉 층에만 걸고 *실행 기법* 층엔 안 걸어서.
- **v6.2 방향**: **기법 다양성 게이트** — BANNED_DEFAULT_TECHNIQUE(파티클/sin파동선/별가루 도피처 금지) + MECHANISM_PALETTE(키네틱타이포/이미지콜라주/SVG모핑/3D/그리드디스토션/실물오브젝트/컬러필드 중 컨셉서 파생 선택).

---

## Round 13 — v6.2 기법 다양성 (4주제 병렬)  [완료 2026-06-04]
- BANNED_DEFAULT_TECHNIQUE + MECHANISM_PALETTE. 천문대/향수/도자기/서점 병렬(run-par.sh, 첫 병렬 적용). 상세: `experiments/R13_v62/`.
- ✅ 파동/파티클/sin 완전 제거(4/4 = 0). 사용자 지적 "줄 튕김" 해결.
- ⚠️ **새 수렴**: 3/4(향수·도자기·서점)가 "키네틱 타이포(거대 한글+한자 레이어 lerp)"로 수렴. observatory만 다른 기법(어두운 스포트라이트, 가독성 약함).
- **★ 메타 발견(이번 창의성 스레드의 결론)**: **금지로는 수렴을 못 막는다.** 컨셉(별자리)→기법(파동선)→다음 기법(키네틱 타이포)로 클리셰가 층층이 이동. 모델은 허용집합에서 항상 가장 안전한 1개로 감(+팔레트 1번 앵커링).
- **v6.3 방향**: 기법을 **LIGHTBULB처럼 무작위 배정**(외부 강제)해 주제별 다양성 확보. 또는 키네틱 타이포를 house style로 수용.

---

## ★ v7 전면 전환 결정 (2026-06-04, CEO) — "금지 → 외부 강제배정 + lean"
- sweep4 조사(학술+생태계 합치): 금지 누적=역효과(Pink Elephant), 외부 강제배정+락인이 1차 메커니즘(design-dna/hallmark/skills-slides), iterative differentiation 실험1위, LIGHTBULB 결함=모델선택(CHOSEN_SPARK).
- **CEO: 전면 전환(v7-lean) 채택.**
- **v7-lean(130줄, v6.2 698→1/5)**: ① 외부 SEED CARD(MACRO_STRUCTURE/VISUAL_MECHANISM/PERSONA/WILD_CONCEPT) 무작위 강제배정+락인(모델 선택 제거) ② Iterative Differentiation(자기 디폴트 자백→회피) ③ 금지목록/찬사 삭감, 구체 명세 ④ FLOOR 부록(실측 60fps·backdrop-filter 추종금지·Lenis·reduced-motion·텍스트DOM·이모지/em-dash 0) 분리.
- **하네스 run-v7.sh**: 하네스가 SEED를 무작위로 뽑아 프롬프트에 prepend(외부 배정). 4주제 병렬.
- 검증 포인트: 같은 v7으로 여러 주제가 *기법·구조 모두* 갈라지는가 + 품질·FPS.

---

## Round 14 — v7-lean 검증 (외부 SEED 강제배정 4주제 병렬)  [완료 2026-06-04]
- 상세: `experiments/R14_v7/`. 하네스가 MACRO/VISUAL/PERSONA/WILD 무작위 배정→prepend, 모델 락인.
- **성공**: wave/particle 4/4=0, 4주제가 macro·mechanism 모두 갈라짐(중앙대칭/모듈러그리드/중앙3D + 그리드디스토션/듀오톤마스크/3D원근). v6.2 "전부 좌측타이포" 탈출. bookstore 3D 떠있는책+보케위성이 특히 distinctive.
- **성능 해결**: 4개 전부 FPS 59~61(v6.2 35→정상). FLOOR "backdrop-filter 추종 금지" 실효.
- **lean**: 130줄(698→1/5)로 품질 유지. 모델이 SEED 락인(디폴트 회귀 안 함).
- **메타 검증**: "금지→외부 강제배정+lean" 전환이 데이터로 입증. 이번 창의성 스레드 해결.
- 잔여: SEED 무작위 충돌(주제간 dedup 필요), floor 자기검수 일부 누락(ceramic em-dash 3 → 하네스 floor 자동검증 추가).

---

## Round 16 — 동일 프롬프트 ×5 반복 (목표1: 매번 다른가)  [완료 2026-06-04]
- 도자기(토림) 동일 프롬프트를 독립 백그라운드 태스크 5개로 병렬 생성. 상세: `experiments/R16_repeat/`.
- **★ 목표1 달성**: MACRO 구조 5개 전부 다름 → 결과 시각적으로 확연히 다름(밝은 중앙형/분할 스위스/여백/그리드/콜라주). 동일 프롬프트 수렴 깸. wave/particle 0 + 진짜 사진(img 11~18, 이미지 수정 반영).
- 잔여: 개별 축 충돌(VISUAL 콜라주·컬러필드 중복, PERSONA 영화타이틀 중복) — 카탈로그 각 10개 한계. → 카탈로그 확장(각 30+)+배치 dedup로 제거 가능.
- 결론: **외부 SEED 무작위 배정이 run-to-run 다양성을 실제로 만든다(목표1 입증).**

---

## Round 17 — v7.2 성능 원리(THE LAW) 검증  [완료 2026-06-04]
- 발견: run4 렉 원인 = 커서 추종 70vw `blur(90px)` 블롭(transform 이동이라도 매프레임 re-paint). CPU6x서 22fps. rAF FPS는 59로 못 잡음.
- 조치: sweep5(web.dev/Chrome/csstriggers) → 성능 FLOOR를 캡목록→**단일 원리**로 재설계(THE LAW: 매프레임=composite-only / THE TRAP: 무거운 레이어 이동 금지). + 정적 탐지기 perfcheck.sh(하네스 통합).
- **검증(R17, v7.2 4주제)**: perfcheck 4/4 FAIL=0. 특히 noc가 **컬러필드(run4와 동일 위험기법)** 배정받았으나 blur≥40px=0(정적 그라디언트로 구현) → **CPU6x 60fps**(run4 22→60). 원리가 위험 시드에서도 렉 코드를 차단.
- perfcheck 자체검증: run4(렉) FAIL=2 적발, run5/run1(정상) 통과. rAF FPS 사각 보완.
- 교훈: 성능도 클리셰처럼 "개별 캡"이 아니라 **단일 원리 + 정적 검증**이 본질. (캡은 다음 무거운 패턴으로 도망감)

---

## Round 18 — 생성 속도 분해 + 최적화 (run당 30분 원인 규명)  [완료 2026-06-05]
- 질문(CEO): "run당 claude -p가 30분 넘는데, 이게 그만큼의 코딩 분량인가?" → **아니다.**
- **분해(R17 stream usage)**: 벽시계의 99.9%가 모델 추론(api_ms≈duration_ms). 하네스/verbose/병렬경합은 무의미. 시간 ∝ output_tokens.
  - 실제 코드(~1,600줄 ≈ 20k토큰)는 5~6분 분량. 나머지는 ① thinking ② 재작성 ③ Bash 자가검증 에이전트 루프.
  - obs 18.0분/72k/think610/9turn/Bash3 · noc 39.8분/156k/think1386/**13turn/Bash9**.
- **최적화 2레버 → `harness/run-v7-fast.sh`**: `--effort medium`(thinking 예산↓) + `--disallowedTools Bash`(자가검증 루프 차단, self_check 머릿속 1패스).
- **A/B 실측(동일 시드·NOCTURNE)**: ctrl는 API 과부하(api_retry 10)로 out_tok 0·파일 0개 **무효**. fast는 정상: 24.9분/103k/4turn/**Bash 0·Write3 Edit0**/perfcheck **FAIL 0**.
  - fast vs R17 noc 베이스라인: 39.8→24.9분(**-37%**), 156k→103k(-34%), 13→4turn, **Bash 9→0**, 품질 0 FAIL 유지. 메커니즘 입증.
- 잔여: fast도 thinking 877청크로 여전히 무거움 → `--effort low` 추가 단축 여지(품질 검증 필요). ctrl 무효라 깨끗한 1:1 시간차는 재측정 필요.
- 결론: **30분은 코딩량이 아니라 사고+자가검증 에이전트 루프 비용.** Bash 차단이 가장 확실한 레버(루프 원천 제거, 품질 무손실).

---

## Round 19 — effort 스윕 + 검사·교정 파이프라인 확정  [완료 2026-06-05]
- 가설(CEO): "생성 effort를 **max**로 올려 사고를 충분히 끝낸 뒤 1패스에 위반 0개로 쓰게 하면?" → **실측으로 반증.**
- **effort 스윕(동일 시드: 분할화면/키네틱타이포/영화타이틀/시간의향, NOCTURNE)**:
  | effort | 시간 | thinking | 코드 | 결과 |
  |---|---|---|---|---|
  | **low** | **9.7분** | 166 | 1955줄 | 마감 위반 2(em-dash)→resume 교정 |
  | medium | 24.9분 | 877 | OK | 깨끗 |
  | high | (외부 과부하로 중단) | 329(=low의 2배) | **사고만 ~10분=low 전체** | 코드 진입 전 api_retry |
  | **max** | **46.6분** | 824+ | **0줄** | **단일 턴 "Request timed out" 실패** |
  - 핵심: effort는 "충분히"가 아니라 "**최대치까지**" 생각 → max는 작성 전 타임아웃, high도 사고만으로 low 전체와 맞먹음. **사고량으로 마감을 막는 접근은 비현실적.**
- **파이프라인 확정(`run-v7-fast.sh`)**: ① 생성 `GEN_EFFORT=low` + `--disallowedTools Bash` ② 정적검사 `perfcheck.sh`(성능+마감 em-dash/이모지/링크, ms) ③ FAIL이면 같은 `session_id`를 `--resume`(`FIX_EFFORT=low`, **stream-json 필수** — 평문이면 deferred-tool marker 에러) 1턴 교정(~10~18초). 재생성 안 함.
- **perfcheck 확장**: em-dash는 **주석 제외 렌더 텍스트만** 검사(comment의 — 오탐 제거 — v7.2 c1/noc 0 FAIL 유지, low의 title/alt 2건만 적발). 이모지 유니코드 블록, 끊긴 css/js 링크.
- **검증**: 확인 런 자동 루프(생성→FAIL→resume 교정)가 최종 perfcheck **FAIL=0**으로 완결.
- 결론: 비싼 모델 자가검증을 **"빠른 low 생성 + 공짜 정적검사 + 필요 시 짧은 targeted resume"** 으로 분해. R17 39.8분 → ~10분(-75%), 품질 결정론적 보장.
