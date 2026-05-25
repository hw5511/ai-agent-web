# Session 4 — 호버·클릭·드래그 트리거

## 1. 회차 개요

- **시간**: 2시간
- **트랙**: Basic
- **목표**: 마우스 인터랙션 트리거 유형을 이해하고 마그네틱 버튼·Flip Card·Spotlight를 구현한다.
- **핵심 topics**:
  - hover / click / mousemove 트리거
  - 마그네틱 버튼 (거리 계산 + transform)
  - CSS Transform vs JS 동적 제어
  - Flip Card (rotateY + backface-visibility)
  - Spotlight Follow (radial-gradient 이동)
- **실습 요약**: 마그네틱 버튼, Flip Card, Spotlight Follow를 순서대로 구현한다.
- **누적 위치**: 기존 랜딩페이지에 마우스 인터랙션 3종을 추가.

---

## 2. 슬라이드 8장

| # | 파일 | 유형 | goal |
|---|------|------|------|
| 01 | `01_오늘의_목표.svg` | 인트로 | 4회차 목표와 수업 흐름을 안내한다 |
| 02 | `02_마우스_인터랙션_종류.svg` | 개념 | hover/click/mousemove 3가지 트리거와 활용 예시를 이해한다 |
| 03 | `03_실습1_마그네틱_버튼.svg` | 실습 | 마그네틱 버튼 효과를 구현한다 |
| 04 | `04_CSS_Transform_vs_JS.svg` | 개념 | CSS Transform과 JS 동적 제어의 차이를 이해한다 |
| 05 | `05_실습2_Flip_Card.svg` | 실습 | Flip Card 효과를 구현한다 |
| 06 | `06_마우스_추적_원리.svg` | 개념 | Spotlight Follow의 원리(radial-gradient 이동)를 이해한다 |
| 07 | `07_실습3_Spotlight_Follow.svg` | 실습 | Spotlight Follow 효과를 구현한다 |
| 08 | `08_핵심_정리.svg` | 정리 | 4회차 핵심 3가지를 정리하고 5회차를 예고한다 |

### 슬라이드별 topics

- **02 트리거 종류**: hover(색상 변화·확대) / click(펼쳐지는 효과) / mousemove(자기 효과·빛 추적)
- **03 마그네틱**: mousemove로 커서 좌표 추적 / 버튼까지 거리 계산 / transform으로 버튼 이동
- **04 CSS vs JS**: CSS(hover 트리거, rotateY/scale) / JS(실시간 좌표 계산, 물리 효과) / 적합한 상황 판단법
- **05 Flip Card**: CSS rotateY(180deg) / perspective + backface-visibility / hover 트리거
- **06 Spotlight 원리**: e.clientX, e.clientY 좌표 / radial-gradient 중심 이동 / 다크 배경에서 효과적
- **07 Spotlight 구현**: 커서 위치에 빛 표시 / 다크 히어로에 적용 / 빛 크기·색상 조정
- **08 정리**: 마그네틱(커서가 당기는) / Flip Card(CSS 3D 뒤집기) / Spotlight(좌표로 빛 조종)

### 실습 프롬프트

| 실습 | 프롬프트 |
|------|---------|
| 03 마그네틱 | 연락하기 버튼에 마그네틱 효과를 추가해줘. 마우스가 버튼 근처에 오면 버튼이 마우스 방향으로 살짝 당겨지는 효과. |
| 05 Flip Card | 포트폴리오 카드를 Flip Card로 만들어줘. 앞면에 이미지와 제목, 뒷면에 프로젝트 설명이 보이도록. |
| 07 Spotlight | 히어로 섹션에 마우스를 따라다니는 빛 효과를 추가해줘. 다크 배경에서 커서 위치 주변만 밝아지는 spotlight 효과. |

---

## 3. 사용 에셋·라이브러리·CDN

- **슬라이드 에셋**: `assets/basic/step04/`
- **외부 라이브러리**: 없음 (순수 JS + CSS Transform)
- **CDN**: 없음

---

## 4. 학생 결과물 예시 (추정 매핑)

루트의 `lesson4_A.html`, `lesson4_B.html`, `lesson4_C.html` ← **매핑 확정 필요**.

---

## 5. 구조 평가·개선 메모

_TBD — 정립 단계에서 추가_
