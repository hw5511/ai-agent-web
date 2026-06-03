# Round 4 채점표 — v2-final 검증

## R4a — MOKZA (v1 / v2-full / v2-final)
프롬프트 `mokza.txt` · sonnet · `/tmp/spark-lab/R4_mokza`

| 지표 | v1 | v2-full | v2-final |
|------|----|---------|----------|
| 이모지 | 0 | 0 | 0 |
| **em-dash(—)** | **8** | 2 | **0** ✅ |
| focus-visible | 0 | 5 | 3 |
| reduced-motion 블록 | 0 | 2 | 2 |
| aria-label | 0 | 9 | 14 |
| RM 내 opacity 복원 | no | yes | **yes** |
| JS 전용 빈 텍스트 컨테이너 | 0 | 0 | **0** |

**핵심 검증 결과**
- **em-dash 게이트 작동**: v1은 8개(전형적 AI tell), v2-final은 **0개**. 새 COUNT_EMDASH 게이트가 실효.
- **reduced-motion 안전성**: v2-final reduced-motion 상태에서 본문 **791자 정상 렌더**, 히어로(MOKZA + 부제) 완전 표시. → R2/R3의 콘텐츠 증발 버그 **v2-final에서 해결**.
- **텍스트 progressive enhancement**: JS 전용 빈 컨테이너 0 → 텍스트가 DOM에 존재.
- 디자인: 다크 에디토리얼, 대형 산세리프 MOKZA — v1/v2-full과 동급 미감.
- 관찰(경미): v2-final 일반 상태 첫 화면이 인트로(검은 화면)로 잠시 가려짐 → 디자이너-우위 재서술 시 "인트로가 콘텐츠를 과하게 지연시키지 말 것" 가드 추가 고려.

스크린샷: `mokza_v1.png`, `mokza_v2-final_normal_intro.png`, `mokza_v2-final_reducedmotion_OK.png`

## R4b — PLAIN (v2-core vs v2-final)  [진행중]
- 목적: R3에서 v2-core가 reduced-motion에 히어로 타이핑 증발 버그를 냈음 → v2-final이 같은 미니멀 주제에서 이를 막는지 대조.
- 결과: _(생성 후 기입)_
