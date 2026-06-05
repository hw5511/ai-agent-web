# SPARK.md 반영 후보 지식 로그 (순차 누적)

> skills.sh 조사에서 발견한 **새롭고 유용한 지식**을 시간순으로 누적한다.
> 각 항목: `[분야] 지식 — 출처 — SPARK.md 반영 포인트 — (상태: 후보/검증중/반영)`.

## 이미 SPARK.md(v1/v2)에 반영된 것 (기준선)
- 이모지 금지 / FONT JUDGMENT(폰트 weight 규칙) / 60fps transform·opacity / Lenis·GSAP / 스타일 카탈로그 17종 /
  Self-Audit / Purpose Archaeology / Cliche Audit / (v2) 접근성 게이트 · 타이포 마감 · 다이얼 · seeded 배경.

## 신규 후보 (조사 누적)

### sweep 1 (2026-06-03) — 신규 유용 지식 15건

**A. 검증 가능한 정량 규칙 (SPARK Self-Audit 정성→정량)**
1. `[frontend]` **기계적 카운트 체크** — em-dash 0 / eyebrow ≤ ceil(섹션수/3) / zigzag(image+text split) 연속 ≤2 / 레이아웃 패밀리 ≥4 / 액센트 1개 Color Lock(채도<80%) / 동일 3 피처카드 0. — taste-skill — Self-Audit에 카운트 게이트 추가 — (후보)
2. `[design]` **색 60/30/10 + 타입스케일 1.25 또는 1.333 + body 16~18px** — Automattic design-systems — PHASE 3 Color&Font 정량화 — (후보)
3. `[frontend/motion]` **정량 모션 밴드** — 마이크로 150~300ms·복합 ≤400ms·UI <300ms·exit=enter의 60~70%(−20%) — UI/UX Pro Max · web-animation-design — PHASE 2에 duration 토큰 — (후보)
4. `[frontend]` **접근성 정량** — 대비 4.5:1(큰텍스트 3:1)·터치타깃 44×44/48×48+간격8·포커스링 2~4px·색만으로 의미전달 금지 — UI/UX Pro Max — A11Y FLOOR 강화 — (후보)

**B. 새 메커니즘/프로세스**
5. `[design]` **Variance/Dial 메커니즘** — Design Variance/Motion/Density 0–10 + 3 vibe×3 layout — taste-skill — v2-full 다이얼과 합치(검증중)
6. `[planning]` **이진 품질 게이트 + 신뢰도 점수**(spec-qa) — READY/NOT READY + 블로커 + confidence — maryeliz-design — Self-Audit 최종 포맷 — (후보)
7. `[planning]` **No-go 패턴 스캔** — TBD/TODO/placeholder/모호어/미정의 참조 = 게이트 불가 — writing-plans — Self-Audit 명문화 — (후보)
8. `[planning]` **Readiness Gate(메타 게이트) + CI 강제 계약** — 다음 단계 적기 확인 + 죽은참조/일관성 머신검증 — Triple Diamond — PHASE 전이 — (후보)
9. `[planning]` **Mom Test 안티패턴 표 + Caveat injection** — 유도/가설/예아니오 질문 ❌→⭕, 약한 증거 경고 자동 — discovery-interview-prep — Purpose Archaeology 질문 품질 — (후보)
10. `[motion]` **seeded generative + 90/10** — randomSeed/noiseSeed + 시드 내비, process-over-product — algorithmic-art — SURPRISE 정식화(v2-full에 일부 반영)

**C. 기존 규칙을 실측치로 구체화**
11. `[design]` **구체 미감 수치** — 여백 py-24~40 / 1px 회색보더·거친 drop shadow 금지 / 아이콘 ultra-light(Phosphor·Remix Line) / Double-Bezel(ring+inset) — high-end — 스타일 카탈로그 정밀화 — (후보)
12. `[frontend]` **Premium-Consumer 팔레트 금지 + 회전 풀** — beige+brass+oxblood+espresso 금지 → cold luxury/forest/cobalt+cream — taste-skill — BANNED_CLICHE 구체화 — (후보)
13. `[motion]` **GSAP 60fps 구체** — will-change 남발 금지·quickTo(고빈도)·read/write 배칭·autoAlpha(클릭차단 방지) — gsap-performance/core — PHASE 2 강화 — (후보)
14. `[design]` **다크모드 "반전 금지·전용 패스" + `color-scheme:dark`+`<meta theme-color>`** — Automattic · Vercel — 다크모드 규칙 신설 — (후보)

**D. 실험 버그를 막는 규칙 (Round 2 직결)**
15. `[motion]` **reduced-motion 전면 차단 + 최종 가시상태 복원** — 전 모션 스킬 공통("opacity/color도 예외 없음"). Round 2의 v2-full 콘텐츠 은닉 버그를 직접 방지 — web-animation-design 외 — **v2-final 필수 반영(검증중→반영예정)**

> sweep 1 종료. 아래 sweep 2 누적.

### sweep 2 (2026-06-03) — 인접 비-시각 축에서 신규 5건 (시각축은 대체로 수렴)

> 핵심: 순수 미감(슬라이드/대시보드/이메일/illustration)은 sweep1과 **수렴(중복)**. 진짜 신규는 SPARK가
> 거의 안 다루던 **성능 예산 · SEO/head · 전환 카피/CRO · 데이터시각화** 축에서 나옴.

16. `[performance]` **로드 성능 예산(정량) + CWV 타깃** — 총<1.5MB / JS<300KB / 이미지(above-fold)<500KB / 폰트<100KB; LCP<2.5s·FCP<1.8s·TBT<200ms·TTFB<800ms; AVIF→WebP→SVG, font-display:swap, Brotli. — addyosmani/web-quality-skills — SPARK는 모션 성능만 다루고 **로드 예산 전무**(GSAP/Three.js 다용으로 무거워짐) → 최고 임팩트 — (후보)
17. `[content]` **전환 카피 규칙** — 헤드라인 "{성과} without {고통}"·"The {카테고리} for {대상}", CTA=[동사]+[얻는것]+[수식어], 금지어(Submit/Learn More/Click Here/streamline/느낌표), 혜택>기능·구체>모호. — coreyhaines31/marketingskills — SPARK는 시각 강박, **카피 규칙 없음** → 텍스트 설득력 보강 — (후보)
18. `[seo]` **`<head>`/SEO·OG·JSON-LD 시맨틱** — title 50~60자·desc 150~160자·단일 h1·`<html lang>`·self-canonical·JSON-LD(Organization/Article/Product/FAQ/Breadcrumb)·URL 하이픈/소문자. — addyosmani/web-quality-skills — SPARK 산출물 검색·공유 품질 직접 향상 — (후보)
19. `[content]` **CRO 7차원 + 신뢰신호/반론처리** — 가치제안 5초 이해, 신뢰신호를 CTA 근처·혜택 직후, 폼 마찰 축소, 페이지 구조(SocialProof→Problem→Solution→HowItWorks→Objection→FinalCTA). — coreyhaines31/marketingskills — 전환형 랜딩 구조 검증 — (후보)
20. `[dataviz]` **데이터시각화 3원칙** — "차트 제목=인사이트 진술"·"막대 항상 0 기준"·"적/녹 단독 인코딩 금지(색맹 8%)", 6개초과 pie·3D차트·dual-axis 금지. — Anthropic data-visualization — 메트릭/데이터형 랜딩 섹션 한정 전이 — (후보)

**중복(수렴)으로 등재 안 함**: slide-design/dashboard의 8pt·토큰·60-30-10·AI slop 회피(=sweep1 taste/web-design-guidelines와 중복), email-design(600px/Outlook/table은 모던 웹 비전이).

### sweep 2 deep-dive (2026-06-03) — 신규 5건 + GEO 영역

21. `[motion/3d]` **디바이스 등급별 3-tier 모션 강등 + 라이브러리 라우팅 + 예산** — Full 60fps / Reduced 30fps·spring off / Minimal static, 배터리≤20%→Minimal; on-demand 렌더(frameloop=demand) CPU 80~90%↓; **속성당 라이브러리 1개**; 코어<100KB·lazy 각<150KB·활성 tween<20; WebGL 미지원 시 SVG+CSS fallback. — freshtechbro/web3d-integration-patterns — SPARK 60fps/접근성을 *실행가능 의사결정*으로 격상 — (후보, 강력)
22. `[content/ux]` **상태별 마이크로-딜라이트 + 가드레일** — success/empty/loading/error + interactive 순간에 micro-interaction, character copy, 촉각 피드백; **이스터에그/축하는 skippable·코어 태스크 지연 금지**. — impeccable/delight — SPARK 미보유 — (후보)
23. `[process]` **사후 self-critique 루프** — 10차원(hierarchy/IA/typo/color/state/microcopy/affordance…) + **2회 독립 병렬 평가**(편향 제거) + AI-slop 텔 탐지 + 임팩트순 수정. — impeccable/critique — SPARK는 생성 위주, 검수 패스 없음 — (후보)
24. `[design/motion]` **구체 수치 토큰** — OKLCH 색공간, CWV(LCP<2.5s/INP<200ms/CLS<0.1), micro-interaction(press 0.95·hover 1.05~1.1·spring stiffness400/damping17), duration 150/250/400ms, focus 3px+2px offset, skeleton>spinner. — freshtechbro/modern-web-design — 일부 중복, 수치값은 신규 — (후보)
25. `[process]` **양방향 intensity 변환 어휘(distill/quieter/bolder)** — 생성 산출물을 *사후에* 한 단계 줄이거나(quieter: 채도↓·여백↑·모션 빈도↓) 키우는(bolder) 명령형 변환. SPARK 다이얼(생성 전)과 보완(생성 후). — impeccable — (후보)

**보너스 신규 영역(미정독, 존재 확인)**: SEO/GEO/structured-data(JSON-LD Organization/Article/Product/FAQ/Breadcrumb + AI봇 접근 + 생성형엔진최적화) — addyosmani·aaron-he-zhu·huifer. SPARK 완전 미보유.

**중복(수렴)**: gsap-timeline/utils/frameworks(코드 헬퍼·라이프사이클, 시스템프롬프트 가치 낮음), gsap-react(React 한정), locomotive-scroll(=Lenis 중복), bolder 절반(폰트/대비 기존 보유), animejs/lottie/pixi/spline/rive 등 라이브러리 래퍼.

> **sweep 2 종료. 수렴 신호**: 순수 미감·라이브러리 래퍼는 거의 중복. 신규 가치는 *비-시각축*(성능예산·SEO/GEO·전환카피/CRO·데이터시각화)과 *메타 의사결정*(3D 디바이스 등급·self-critique·상태별 delight)에 집중. sweep 3는 신규성 빈약 예상 → 빈도 낮춤.

### sweep 3 (2026-06-04) — 발상법/창의 컨셉팅 (v6용)
26. `[ideation]` **Random Entry/Forced Connection (de Bono)** — 무관 자극을 강제 주입해 1차 연상 우회. LIGHTBULB가 이미 이 계열 → spark를 "도메인 우회 다리"로 재사용. — debonogroup
27. `[ideation]` **Bisociation/메타포 전이** — 먼 두 프레임 충돌(거리 멀수록 신규성↑). 도메인을 1차 명사 대신 "먼 영역 메커니즘"으로 번역. — Koestler/conceptual blending
28. `[ideation]` **SIT Subtraction + Worst-Flip** — 필수처럼 보이는 요소 제거(워크맨식) / 최악 클리셰의 정반대. BANNED_CLICHE를 능동 발산엔진으로. — SIT wiki, IxDF
29. `[skill]` **creative-director-skill (smixs)** ★ — 20+ 발상법 코드화. 차용: ①structural×associative×disruptive 3군 강제 로테이션 ②saturation cap(흔한 메커니즘 originality 패널티)→PREDICTABILITY 강화 ③tension test. — github.com/smixs/creative-director-skill
30. `[skill]` **oblique-skill (jakedahn)** — Oblique Strategies 113카드 랜덤4→1택. SPARK의 CHOSEN_SPARK 4→1 패턴 검증. — github.com/jakedahn/oblique-skill

> 결론: skills.sh 상위엔 발상 신규 없음(brainstorming 유일). GitHub creative-director-skill이 핵심 신규. → v6 PHASE 0.5(Concept Divergence)로 흡수.

### sweep 4 (2026-06-04) — 안티-클리셰 / LLM 다양성 (웹·논문) [상세: knowledge/anti-cliche.md]
31. `[diversity]` **Iterative Differentiation** — 자기 디폴트(뻔한 안) 먼저 명시→그것과 다르게. 개입 비교 실험 1위. (arxiv 2602.20408) — 우리 수렴연쇄 직격 — (최우선 후보)
32. `[diversity]` **Verbalized Sampling** — N개 응답+흔함확률→꼬리 선택, 다양성 1.6~2.1배. (arxiv 2510.01171) — BANNED_CLICHE 대체
33. `[diversity]` **Random Concept Injection** — 무관 단어 1회 주입(분포 이동). LIGHTBULB 직접 근거. 단 큐레이션 불필요. (arxiv 2601.18053)
34. `[diversity]` **Pink Elephant** — 부정 지시 역효과(언급=증폭). 금지 누적이 클리셰를 박아넣음. (arxiv 2503.22395) — BANNED_CLICHE를 positive로 재작성
35. `[diversity]` **프롬프트 블로트 역효과** — 길수록 추론저하·지시누락. 전역 200~800토큰. (promptlayer/mlops) — SPARK 700줄 lean화
36. `[diversity]` **Ordinary Persona Randomization** — 무작위 평범 페르소나 > 큐레이션 창의 페르소나. (Cambridge design-science)
37. `[diversity]` **키워드 수프 역효과** — "Awwwards급/8k/masterpiece" = 평균(클리셰) 견인. 구체+예상밖 병치로 대체. (midjourney)

> ★ 판정: 두 가설(외부 무작위 주입 / lean) 모두 학술 지지. **단일 최대 결함 = LIGHTBULB의 CHOSEN_SPARK '모델 선택' 단계**(무작위→전형 붕괴). 선택권을 외부 강제 배정으로.
