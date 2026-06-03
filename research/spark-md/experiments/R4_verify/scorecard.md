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

## R4b — PLAIN 미니멀 (v2-core vs v2-final)  [완료]
프롬프트 `plain.txt` · sonnet · `/tmp/spark-lab/R4_plain`

| 지표 | v2-core | v2-final |
|------|---------|----------|
| em-dash | 4 | **0** ✅ |
| RM 내 opacity 복원 | yes | yes |
| **reduced-motion h1(헤드라인) 글자수** | **0 (증발 ❌)** | **5 "PLAIN" (정상 ✅)** |
| reduced-motion 본문 글자수 | 601 | 647 |

- **결정적 대조**: 동일 미니멀 주제에서 **v2-core는 헤드라인이 또 증발**(R3 타이핑 버그 재발), **v2-final은 헤드라인+부제+CTA 완전 표시**. → v2-final의 progressive-enhancement + reduced-motion 가시복원 규칙이 **고질 버그를 실제로 차단**.
- 디자인: v2-final은 라이트 미니멀, 거대 "PLAIN" + 절제된 부제 — 주제에 맞는 디자이너 퀄리티.

스크린샷: `plain_v2-core_reducedmotion_BUG.png`(헤드라인 공백), `plain_v2-final_reducedmotion_OK.png`(완전 표시)

## 종합 판정 (Round 4)
- **v2-final 채택 권장.** 에디토리얼(mokza)·미니멀(plain) 양 주제에서:
  - em-dash 0 (정량 게이트 작동), reduced-motion 콘텐츠 완전 표시(고질 버그 해결), aria/focus 확보, JS 전용 텍스트 없음.
  - v1 대비 접근성·견고성 우위, v2-core/v2-full의 비결정적 버그 제거.
- 다음: v2-final을 **디자이너-우위로 재서술**(엔지니어링=floor) 후 v2 최종 확정 → v3(멀티파일·무제한) 실험.
