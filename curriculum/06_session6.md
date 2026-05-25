# Session 6 — 마우스 인터랙션

## 회차 개요

- **시간**: 2시간
- **트랙**: Basic / Part 1
- **1개념**: **좌표 추적 — 마우스 인터랙션**
- **목표**: 마그네틱 버튼 / Flip Card / Spotlight Follow 3가지 마우스 인터랙션을 구현한다.
- **누적 위치**: 5주 스크롤 + 6주 마우스 = 인터랙션 양대 트리거 완성.
- **회차 끝 학생 상태**: wow 모먼트 가득한 마우스 반응 페이지

---

## 슬라이드 8장

| # | 파일 | 유형 | goal |
|---|------|------|------|
| 01 | `01_오늘의_목표.svg` | 인트로 | 6회차 목표(마우스 3종) 안내 |
| 02 | `02_마우스_인터랙션_종류.svg` | 개념 | hover/click/mousemove 3가지 트리거 비교 |
| 03 | `03_실습1_마그네틱_버튼.svg` | 실습 | 마우스가 가까이 오면 당겨지는 버튼 |
| 04 | `04_CSS_vs_JS_제어.svg` | 개념 | CSS Transform(hover) vs JS 동적 제어 차이 |
| 05 | `05_실습2_Flip_Card.svg` | 실습 | CSS rotateY로 3D 카드 뒤집기 |
| 06 | `06_좌표_추적_원리.svg` | 개념 | e.clientX·e.clientY로 마우스 좌표 |
| 07 | `07_실습3_Spotlight.svg` | 실습 | 마우스 따라다니는 빛(radial-gradient) |
| 08 | `08_정리.svg` | 정리 | 좌표 추적 패턴 + 다음 주 라이브러리 예고 |

### 슬라이드별 topics

- **02 마우스 트리거**: hover(색·확대) / click(펼침) / mousemove(자기·빛 추적)
- **03 마그네틱**: mousemove로 좌표 / 버튼까지 거리 계산 / transform으로 이동
- **04 CSS vs JS**: CSS(hover·rotateY·scale) / JS(실시간 좌표·물리) / 상황 판단
- **05 Flip Card**: rotateY(180deg) + perspective + backface-visibility / hover 트리거
- **06 좌표**: e.clientX·e.clientY / 화면 좌표계 / 요소 위치 계산
- **07 Spotlight**: radial-gradient 중심 이동 / 다크 배경에서 효과적

### 실습 프롬프트

| 실습 | 프롬프트 |
|------|---------|
| 03 마그네틱 | 연락하기 버튼에 마그네틱 효과 추가해줘. 마우스가 근처 오면 버튼이 마우스 방향으로 살짝 당겨지도록. |
| 05 Flip Card | 작품 카드를 Flip Card로 만들어줘. 앞면 이미지+제목, 뒷면 설명. hover로 뒤집기. |
| 07 Spotlight | 히어로 섹션에 마우스 따라다니는 빛 효과 추가해줘. 다크 배경에서 커서 주변만 밝아지도록. |

---

## 사용 에셋·라이브러리·CDN

- **슬라이드 에셋**: `assets/basic/step06/`
- **외부 라이브러리**: 없음 (CSS Transform + 순수 JS)
- **CDN**: 없음

---

## 구조 평가·개선 메모

_TBD_
