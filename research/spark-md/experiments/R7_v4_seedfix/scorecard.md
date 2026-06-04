# Round 7 — v4 seed 수정본 재검증

## seed 버그 해결 (핵심)
| 케이스 | R6(버그) id | R7(수정) id | random.seed in curl |
|--------|-------------|-------------|---------------------|
| case1 서점 | lb-006/103/140 | lb-022/163/189 | 없음 ✅ |
| case2 페스티벌 | lb-006/103/140 | lb-019/051/055… | 없음 ✅ |
| case3 도자기 | lb-006/103/140 | lb-139/185/190 | 없음 ✅ |
| case4 다이닝 | lb-006/103/140 | lb-160/181/194 | 없음 ✅ |
| case5 아트전시 | — | lb-103/175/182 | 없음 ✅ (stream의 'random.seed'는 모델 추론문장) |

→ 영감이 케이스마다 고유 = LIGHTBULB "매번 새 영감" 정상 작동. seed 금지 규칙 실효.

## floor 게이트 (5/5)
Lenis CSS 리셋 5/5, reduced-motion 5/5, 멀티파일(index+styles+script) 5/5, css 링크 정합.

## 판정
v4 확정 가능: LIGHTBULB 자가활성+다양성 ✅ / PHASE5 자기검수·정제 ✅ / 멀티파일·Lenis가드·reduced-motion ✅.
