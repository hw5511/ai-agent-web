# Session 8 — v12 프롬프트 완전 이해 (파이널)

## 1. 회차 개요

- **시간**: 2시간 (파이널)
- **트랙**: Basic
- **목표**: v12 프롬프트 3개 레이어 구조를 이해하고 1회차 결과물과 v12 결과물을 나란히 비교한다.
- **핵심 topics**:
  - **3-SPARK**: Layout/Interaction/Visual 방향 설정
  - **AESTHETIC_PINCH**: 미감 핀치 레이어 (텍스처/공간감/디테일)
  - **FONT JUDGMENT**: 가독성/분위기/조합/한글 기준
  - v12로 1회차 랜딩페이지 재생성
  - 파이널 포트폴리오 완성
- **실습 요약**: v12 프롬프트로 1회차 랜딩페이지를 재생성하고 처음 결과물과 나란히 비교한다.
- **누적 위치**: **파이널.** 1회차에 만든 첫 랜딩페이지를 v12 시스템으로 재생성, before/after 비교로 학습 여정 마무리.

---

## 2. 슬라이드 11장 (파이널 확장형)

| # | 파일 | 유형 | goal |
|---|------|------|------|
| 01 | `01_오늘의_목표.svg` | 인트로 | 8회차 목표와 수업 흐름을 안내한다 |
| 02 | `02_3SPARK_구조.svg` | 개념 | 3-SPARK의 개념과 3가지 SPARK 카테고리를 이해한다 |
| 03 | `03_AESTHETIC_PINCH_레이어.svg` | 개념 | AESTHETIC_PINCH 레이어의 개념과 적용 방법을 이해한다 |
| 04 | `04_실습1_SPARK_적용.svg` | 실습 | 3-SPARK를 정의하고 프롬프트에 적용한다 |
| 05 | `05_FONT_JUDGMENT.svg` | 개념 | FONT JUDGMENT 4가지 기준(가독성/분위기/조합/한글)을 이해한다 |
| 06 | `06_실습2_폰트_JUDGMENT_적용.svg` | 실습 | FONT JUDGMENT 기준으로 최적 폰트 조합을 선택하고 적용한다 |
| 07 | `07_v12_전체_구조.svg` | 개념 | v12 프롬프트 전체 구조(3레이어)를 이해한다 |
| 08 | `08_실습3_1회차_v12_재생성.svg` | 실습 | v12 프롬프트로 1회차 랜딩페이지를 재생성한다 |
| 09 | `09_Before_After_비교.svg` | 정리 | 1회차 결과물과 v12 결과물을 나란히 비교한다 |
| 10 | `10_실습4_나만의_포트폴리오.svg` | 실습 | 최종 포트폴리오를 완성한다 |
| 11 | `11_파이널_핵심_정리.svg` | 정리 | 8회차 전체 여정을 정리하고 파이널을 축하한다 |

### 슬라이드별 topics

- **02 3-SPARK**: SPARK = 시각적 핵심 아이디어 / Layout·Interaction·Visual SPARK / SPARK 없으면 Claude가 임의 결정
- **03 AESTHETIC_PINCH**: PINCH = 미적 감각의 언어화 / 텍스처·공간감·디테일·분위기 / 프롬프트에 PINCH 명시
- **04 SPARK 적용**: Layout·Interaction·Visual 각 1개 선택 / SPARK 3개 프롬프트 작성 / 방향성 있는 결과
- **05 FONT JUDGMENT**: bold_readability 등급 / vibe_tag로 분위기 매칭 / pairing 조합법
- **06 폰트 적용**: 다크 테크(Inter + Noto Sans KR) / 고급 감성(Playfair + Noto Serif) / 적용 체크리스트
- **07 v12 전체 구조**: Layer 1 = 3-SPARK(방향성) / Layer 2 = AESTHETIC_PINCH(분위기) / Layer 3 = FONT JUDGMENT(타이포)
- **08 v12 재생성**: 3레이어 통합 프롬프트 / SPARK + PINCH + FONT 한번에 / 1회차 결과물과 비교 준비
- **09 Before/After**: HTML 구조 동일 / CSS/스타일 완전히 다름 / v12 = 결과 재현 가능
- **10 최종 포트폴리오**: 8회차 체크리스트 확인 / SPARK/PINCH/FONT 모두 적용 / 나만의 콘텐츠 완성
- **11 파이널 정리**: 1~8회차 여정 요약 / v12 시스템 습득 / AI Agent Web 개발자 완성

### 실습 프롬프트

| 실습 | 프롬프트 |
|------|---------|
| 04 SPARK 적용 | SPARK-1: [선택], SPARK-2: [선택], SPARK-3: [선택]. 이 3가지를 중심으로 포트폴리오 페이지를 제작해줘. |
| 06 FONT JUDGMENT | FONT JUDGMENT 기준으로 폰트를 적용해줘. 사이트 분위기: 다크 테크 / 헤드라인: Inter / 본문: Noto Sans KR. |
| 08 v12 재생성 | [SPARK-1] 전면 다크 배경 + 네온 포인트 / [SPARK-2] 마그네틱 CTA 버튼 / [SPARK-3] 스크롤 페이드인 / [AESTHETIC_PINCH] noisy-gradient + cinematic-spacing / [FONT] Inter(헤드) + Noto Sans KR(본문) — 위 설정으로 포트폴리오 랜딩페이지를 제작해줘. |

---

## 3. 사용 에셋·라이브러리·CDN

- **슬라이드 에셋**: `assets/basic/step08/` (11장)
- **외부 라이브러리**: 1~6회차에서 배운 모든 것 통합
- **CDN**: 통합 사용
- **v12 시스템**: 별도 프롬프트 시스템 (위치·문서화 TBD — 현재 폴더 `09~13_class_agent_*` 는 v1~v5까지만 존재. v6~v12 진화 이력 문서화 필요)

---

## 4. 학생 결과물 예시 (추정 매핑)

루트의 `lesson8_A.html`, `lesson8_B.html`, `lesson8_C.html` ← **매핑 확정 필요**.

루트 `bench_v12_A.html` ~ `bench_v12_E.html` 가 v12 시스템 벤치마크 결과로 추정 → 파이널 회차 시연 자료일 가능성.

---

## 5. 구조 평가·개선 메모

_TBD — 정립 단계에서 추가_
