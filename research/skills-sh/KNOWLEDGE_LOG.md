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

> 다음 sweep(2)에서 후보 큐(개별 pm 하위스킬, gsap 나머지, skills.sh animation/3d/a11y 토픽) 탐색 예정.
