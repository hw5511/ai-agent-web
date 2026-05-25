# Session 5 — 라이브러리 + 3D 확장

## 1. 회차 개요

- **시간**: 2시간
- **트랙**: Basic
- **목표**: CDN 라이브러리 활용법을 익히고 tsParticles·Typed.js·Three.js로 풍부한 시각 효과를 구현한다.
- **핵심 topics**:
  - CDN script 태그 한 줄 추가
  - tsParticles — 파티클 배경 효과
  - Typed.js — 타이핑 히어로 섹션
  - Three.js 3요소 (Scene/Camera/Renderer)
  - 3D 큐브 회전 인터랙션
- **실습 요약**: tsParticles 파티클 배경, Typed.js 타이핑 효과, Three.js 회전 큐브를 각각 구현한다.
- **누적 위치**: 라이브러리 3종으로 시각 효과 다층화.

---

## 2. 슬라이드 8장

| # | 파일 | 유형 | goal |
|---|------|------|------|
| 01 | `01_오늘의_목표.svg` | 인트로 | 5회차 목표와 수업 흐름을 안내한다 |
| 02 | `02_CDN_라이브러리_활용법.svg` | 개념 | CDN 라이브러리의 개념과 활용법을 이해한다 |
| 03 | `03_실습1_tsParticles_파티클.svg` | 실습 | tsParticles 파티클 배경을 구현한다 |
| 04 | `04_타이핑_애니메이션_원리.svg` | 개념 | Typed.js의 동작 원리와 주요 설정을 이해한다 |
| 05 | `05_실습2_Typedjs_타이핑.svg` | 실습 | Typed.js 타이핑 효과를 구현한다 |
| 06 | `06_3D_웹의_세계.svg` | 개념 | Three.js의 3요소(Scene/Camera/Renderer)와 활용 사례를 이해한다 |
| 07 | `07_실습3_Threejs_회전큐브.svg` | 실습 | Three.js 회전 큐브를 구현한다 |
| 08 | `08_핵심_정리.svg` | 정리 | 5회차 핵심 3가지를 정리하고 6회차를 예고한다 |

### 슬라이드별 topics

- **02 CDN 라이브러리**: script 태그 1줄 = 수천 줄 기능 / 이름만 알면 Claude가 CDN 링크 작성 / 주요 3종 소개
- **03 tsParticles**: 파티클 수·색상·반응 거리 설정 / 마우스 반응 옵션 / 다크 배경에서 효과적
- **04 Typed.js 원리**: 문자열 배열 → 타이핑 → 삭제 반복 / typeSpeed/backSpeed/loop / 포트폴리오 직함에 활용
- **05 Typed.js 구현**: span#typed 위치 / CDN + 초기화 / 나만의 직함 배열
- **06 Three.js 3요소**: Scene(3D 공간·무대) / Camera(시점·눈) / Renderer(Canvas에 출력)
- **07 Three.js 큐브**: BoxGeometry + MeshBasicMaterial / requestAnimationFrame으로 회전 / 형태·색·움직임 지시
- **08 정리**: CDN(이름이 곧 열쇠) / 파티클+타이핑(숫자로 느낌 조절) / Three.js(말로 설명)

### 실습 프롬프트

| 실습 | 프롬프트 |
|------|---------|
| 03 tsParticles | 히어로 섹션 배경에 tsParticles 파티클 효과를 추가해줘. 작은 흰 점들이 천천히 움직이고 마우스 근처로 반응하도록. |
| 05 Typed.js | 히어로 섹션의 직함 부분에 Typed.js를 적용해줘. "웹 개발자", "UI 디자이너", "Claude 전문가"가 순서대로 타이핑되도록. |
| 07 Three.js | 히어로 섹션 오른쪽에 Three.js로 만든 3D 큐브를 추가해줘. 네온 파란색 와이어프레임 큐브가 천천히 회전하도록. |

---

## 3. 사용 에셋·라이브러리·CDN

- **슬라이드 에셋**: `assets/basic/step05/`
- **외부 라이브러리**: tsParticles (v2 계열), Typed.js, Three.js (r161 권장)
- **CDN**: tsParticles · Typed.js · Three.js 각 공식 CDN

---

## 4. 학생 결과물 예시 (추정 매핑)

루트의 `lesson5_A.html`, `lesson5_B.html`, `lesson5_C.html` ← **매핑 확정 필요**.

---

## 5. 구조 평가·개선 메모

_TBD — 정립 단계에서 추가_
