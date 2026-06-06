# SPARK.md 개선 연구 — v2 최종 리포트

작성 2026-06-03 · 선임연구원(메인 에이전트) · 격리 실증실험(claude -p, sonnet) + skills.sh 지식조사 종합

## 1. 결론 (권장)
**v2-final 채택을 권장한다.** v1의 미감·모션 강점을 유지하면서, 격리실험에서 드러난 비결정적 버그(콘텐츠 증발)를 제거하고, 정성 규칙을 검증 가능한 정량 게이트로 격상했다. 정체성은 **디자이너 우위**로 재서술했다.

## 2. 실험 요약 (4 라운드 / 14 생성물)
| 라운드 | 구성 | 핵심 결과 |
|--------|------|-----------|
| R1 mokza | base vs v1 | v1이 이모지/폰트/모션/레이아웃 우위. v1 공백=접근성·타이포 |
| R2 mokza | base/v1/v2-core/v2-full | v2가 접근성·타이포 게이트 통과. **v2-full reduced-motion 콘텐츠 은닉 버그 발견** |
| R3 plain | base/v1/v2-core/v2-full | **다이얼 분기 작동**(v2-full 미니멀 톤 자동선택). reduced-motion 버그 v2-core로 **역전**(비결정적). v1은 reduced-motion 전체 백지 |
| R4 mokza+plain | v1/v2-full/v2-core/v2-final | **v2-final 검증 통과**: em-dash 0, reduced-motion 콘텐츠 완전표시(양 주제), 버그 차단 |

## 3. 버전 계보와 근거
- **v1**(382줄): 현행. 미감 강하나 접근성·타이포 부재, "무조건 SURPRISE"가 미니멀 톤과 충돌.
- **v2-core**(418줄): +접근성 게이트 +타이포 마감 +fonts.json 동기화.
- **v2-full**(450줄): +CONFIG DIALS(Variance/Motion/Density) +다이얼 규칙분기 +seeded 배경.
- **v2-final**(492줄) ★권장: v2-full + 실험도출 강제규칙 + 정량 게이트 + 디자이너 우위 재서술.

## 4. v2-final이 더한 핵심
1. **reduced-motion 가시복원 강제** — 모든 reveal 요소를 최종 가시상태로 즉시 복원. (R2/R3 콘텐츠 증발 버그 직격)
2. **텍스트 progressive enhancement** — 핵심 텍스트는 DOM에 완성형 존재, JS(타이핑/split)는 enhancement만. (헤드라인 증발 차단)
3. **정량 카운트 게이트** — em-dash 0 / eyebrow ≤ ceil(섹션/3) / zigzag ≤2 / 레이아웃 패밀리 ≥4 / Color Lock / palette ban / motion band(150~300ms·exit −20%) / 대비 4.5:1 / 터치 44px.
4. **다이얼 톤 제어** — 주제에 맞게 강도 자동 선택(미니멀=spectacle 금지).
5. **디자이너 우위 재서술** — 정체성을 아트 디렉터/디자이너 우선으로, 엔지니어링은 바닥선(floor).

## 5. 검증된 효과 (R4 자동지표)
- em-dash: v1=8 → v2-final=0.  aria-label: v1=0 → 14.  focus-visible: 0 → 3.
- reduced-motion 본문: v2-final mokza 791자·plain 헤드라인 정상 / v2-core plain 헤드라인 0(증발).

## 6. 한계 / 후속(v3)
- v2-final 일반화면 인트로가 콘텐츠를 잠깐 가림 → "인트로 과지연 금지" 가드 후보.
- **v3 방향(확정)**: 글자수 제한 해제 + CSS/JS/HTML 분리·링크로 더 크고 정교한 멀티섹션 사이트 커버(SaaS 아님).
- **v3 디자인 강화 후보**(skills.sh): high-end 미감 수치/Double-Bezel, 60/30/10·타입스케일, distill/quieter/bolder 미감 변환, canvas-design "의도를 드러내지 말라". 비-시각축(성능예산·SEO·전환카피)은 별도 트랙.

## 7. 정식 반영 제안
- `curriculum/_assets/files/SPARK.md`(라이브)는 **CEO 확인 후** v2-final로 교체 제안. (현재 미반영, 연구 폴더에만 존재)
- 교체 시 LIGHTBULB URL·fonts.json 동기화 유지 확인 필요.
