# Round 14 — v7-lean (외부 SEED 강제배정 + lean) 4주제 병렬

전환: 금지→외부 무작위 SEED CARD(MACRO/VISUAL/PERSONA/WILD) 강제배정+락인 + iterative differentiation. 130줄(v6.2 698→1/5).

## 배정된 SEED (하네스 무작위) → 결과
| 주제 | MACRO | VISUAL | PERSONA | 결과(락인 확인) |
|------|-------|--------|---------|----------------|
| observatory | 중앙 대칭 집중 | 그리드·셀 디스토션 | 인디 음반 일러스트 | 중앙 수렴 원근그리드 + 골드 夷安 ✅ |
| nocturne | 그리드 파편화 | 듀오톤+인터랙티브 마스크 | 영화 타이틀 디자이너 | 모듈러 그리드 + 듀오톤 패널 + NOC/TURNE ✅ |
| ceramic | 그리드 파편화 | 그리드·셀 디스토션 | 데이터 저널리스트 | 그리드 기반 ✅ |
| bookstore | 중앙 거대 오브젝트 + 위성 | 3D 원근 | 데이터 저널리스트 | 3D 떠있는 책 + 보케 심도 위성카드 ✅ |

## 결과 — 성공 (수렴 타파 + 성능 + lean)
- **기법·구조 다양성 회복**: wave/particle 4/4 = 0. 4개가 서로 다른 macro·mechanism(중앙대칭/모듈러그리드/중앙3D, 그리드디스토션/듀오톤마스크/3D원근). v6.2의 "전부 좌측 타이포" 완전 탈출.
- **성능 해결**: 4개 전부 FPS 59~61 (v6.2 observatory 35→정상). FLOOR "마우스 backdrop-filter 추종 금지"가 실효.
- **lean 효과**: 130줄로도 품질·floor 대부분 유지. 모델이 SEED를 실제 락인(디폴트로 안 도망침).
- **가독성**: 4개 다 또렷(observatory 어두움 재발 없음). bookstore 3D 책이 특히 distinctive.

## 잔여 (honest)
- SEED 무작위 충돌: 2개가 그리드 macro, 2개가 데이터저널리스트 persona 중복 배정 → 하네스에서 *주제간 dedup 추첨* 필요.
- floor 자기검수 불완전: ceramic em-dash 3, nocturne backdrop-filter 1(단 fps 정상=정적). → 하네스측 floor 자동검증 추가 필요(자기보고 한계).

## 판정
**v7-lean = 수렴 타파 성공.** 금지→외부배정 전환이 데이터로 입증(다양성·성능·lean 동시). 잔여 2건은 하네스 보강으로 처리.

> 스크린샷은 라이브로 대체(샌드박스 CDN 차단으로 모션 미표시). 라이브: https://hw5511.github.io/ai-agent-web/demo/spark-research/v7/
