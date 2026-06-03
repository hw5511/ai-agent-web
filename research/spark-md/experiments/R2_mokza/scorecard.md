# Round 2 채점표 — MOKZA 랜딩 (base / v1 / v2-core / v2-full)

- 프롬프트: `prompts/mokza.txt` · 모델: sonnet · 격리: `/tmp/spark-lab/R2_mokza`
- 산출물 크기: base 840줄 / v1 770줄 / v2-core 1148줄 / v2-full 1082줄

## 자동 측정 (접근성·타이포 게이트)

| 지표 | base | v1 | v2-core | v2-full |
|------|------|----|---------|---------|
| 이모지(진짜) | 0 | 0 | 0 | 0 |
| focus-visible | 0 | 0 | **5** | **4** |
| prefers-reduced-motion | 0 | 0 | **2** | **3** |
| aria-label | 1 | 0 | **16** | **12** |
| tabular-nums | 0 | 0 | **2** | **1** |
| text-wrap balance/pretty | 0 | 0 | **15** | **7** |
| GSAP/Lenis | 없음 | 있음 | 있음 | 있음 |

→ **v2-core/v2-full이 v1·base의 접근성·타이포 사각지대를 실제로 메움**(focus-visible·reduced-motion·aria·tabular·text-wrap 전부 등장). 자동 지표상 명확한 개선.

## 스크린샷 시각 판정

| variant | 판정 |
|---------|------|
| **base** | 이번엔 이모지 없음(런별 분산). 중앙 다크 그라디언트 히어로 — 무난하나 평범. |
| **v1** | 다크 에디토리얼, 거대 세리프 MOKZA + 텍스처 배경. 미감 우수하나 접근성·타이포 마감 없음. |
| **v2-core** | 다크 에디토리얼 + 넘버링 섹션/영문 인용/시그니처 원두 정렬/ bento 정보카드/풋터까지 충실. **reduced-motion에서 콘텐츠 정상 표시(✅)**. 종합 최상. |
| **v2-full** | 히어로(거대 세리프 MOKZA on black)는 가장 정제됨. **그러나 `prefers-reduced-motion`에서 본문 섹션이 사라짐(❌ 회귀 버그)**. |

## ★ 핵심 발견 — v2-full reduced-motion 버그
- v2-core의 reduced-motion 블록: reveal 요소에 `opacity:1 !important; transform:none !important` **명시 복원** → 정상.
- v2-full의 reduced-motion 블록: `animation/transition-duration: 0.01ms`만 적용, **opacity 복원 누락** → reveal 요소가 opacity:0에 갇혀 본문이 숨겨짐.
- 원인 추정: v2-full은 다이얼·생성배경 등 지시가 많아져 모션 코드가 복잡해졌고, "reduced-motion = 애니메이션 끄기"로만 해석 → **"최종 가시 상태로 즉시 복원"** 규칙이 명문화되지 않은 탓.

## 결론 / 다음 액션
- **자동 게이트는 v2 양쪽 다 통과**, 시각·접근성 실효는 **v2-core 우위**(reduced-motion 정상).
- v2-full은 잠재력(다이얼 톤제어) 있으나 **reduced-motion 콘텐츠 복원 규칙을 spec에 명시**해야 안전.
  → v2-final 후보에 반영할 보강: *"reduced-motion 분기는 애니메이션 비활성뿐 아니라 모든 reveal 요소를 최종 가시 상태(opacity:1, transform:none)로 즉시 복원해야 한다."*
- Round 3(미니멀 주제 `plain`)에서 ① 버그 재현 여부 ② v2-full 다이얼 분기(MOTION 낮춤) 적절성 확인.
