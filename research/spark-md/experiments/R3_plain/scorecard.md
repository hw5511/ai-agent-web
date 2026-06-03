# Round 3 채점표 — PLAIN 미니멀 메모앱 (base / v1 / v2-core / v2-full)

- 프롬프트: `prompts/plain.txt`(실용·미니멀 주제) · 모델 sonnet · `/tmp/spark-lab/R3_plain`
- 목적: ① 다이얼 분기(절제 톤) 작동 ② reduced-motion 버그 재현 여부 ③ 일반화

## 자동 게이트
| 지표 | base | v1 | v2-core | v2-full |
|------|------|----|---------|---------|
| 이모지 | 0 | 0 | 0 | 0 |
| focus-visible | 0 | 0 | 3 | 3 |
| reduced-motion | 0 | 0 | 2 | 2 |
| aria-label | 0 | 0 | 12 | 9 |
| tabular-nums | 0 | 0 | 3 | 2 |
| text-wrap | 0 | 0 | 10 | 16 |
→ R2와 동일하게 v2만 접근성·타이포 게이트 통과.

## ★ 발견 1 — 다이얼 분기 작동 (v2-full 핵심 가치 입증)
v2-full이 미니멀 주제에 대해 CONFIG DIALS를 **스스로 낮게** 선택:
```
DESIGN_VARIANCE 3 — 정교한 변주, 카오스 없음
MOTION_INTENSITY 3 — 절제 톤 (파티클·3D 금지)
VISUAL_DENSITY 2 — 미술관 여백, 한 화면 한 메시지
```
결과물도 좌측정렬 대형 헤드라인 "쓰는 것만 남긴다."의 **절제된 미니멀**(spectacle 없음).
→ v1의 "무조건 SURPRISE 1개" 강제와 달리, 주제에 맞게 과잉 연출을 회피. **다이얼 분기 실효 확인.**

## ★ 발견 2 — reduced-motion 콘텐츠 가시성 (역전 + 일반 패턴)
| variant | reduced-motion 렌더 | 비고 |
|---------|--------------------|------|
| base | ✅ 정상 | reveal 없음(정적) |
| **v1** | ❌ **전체 백지** | reduced-motion 미처리 + reveal opacity:0 은닉. 정상화면은 멋지나 접근성 최악 |
| v2-core | ⚠️ 헤드라인만 누락 | 히어로가 JS 타이핑(`<span id="sp_typed">` 빈 DOM)→ reduced-motion 시 텍스트 미복원. 나머지 본문은 정상 |
| v2-full | ✅ 정상 | reduced-motion 블록이 모든 reveal에 opacity:1 복원 |

- **R2와 역전**: R2는 v2-full 버그/v2-core 정상, R3는 v2-core 버그/v2-full 정상 → **버그가 비결정적**. 어느 버전도 안정적으로 보장 못 함.
- **일반화된 근본원인**: SPARK가 "JS 텍스트 효과(타이핑/스플릿)"를 권장하면서 **DOM에 최종 텍스트를 미리 넣는 progressive-enhancement를 강제하지 않음** → JS 효과가 유일한 텍스트 소스가 되어 reduced-motion/JS-off에서 콘텐츠 증발.

## v2-final 필수 반영 (이번 라운드 도출)
1. **reduced-motion 분기 = 애니 비활성 + 모든 reveal 요소를 최종 가시상태(opacity:1, transform:none)로 즉시 복원** (skills.sh sweep1 공통 합의와 일치).
2. **텍스트 progressive enhancement**: 헤드라인 등 텍스트는 **DOM에 완성형으로 존재**해야 하며 JS(타이핑/split)는 그 위 enhancement로만. JS 실패/reduced-motion에도 전체 텍스트가 보여야 함.
3. (유지) v2-full 다이얼 분기는 효과적 → v2-final의 기반으로 채택.

## 종합
- **다이얼(v2-full) 채택 가치 확인 + 두 버전 공통의 reduced-motion/텍스트 취약점 노출.**
- v2-final = v2-full(다이얼) 기반 + 위 1·2 강제 규칙 + sweep1 정량 게이트(em-dash 0/eyebrow 상한/Color Lock/duration 밴드/대비·터치 수치).
