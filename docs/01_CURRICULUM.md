# 408 AI Agent Web — 수업 커리큘럼

## 포지션

- **대상**: 코딩 경험 전무 / 웹디자인+UXUI 병행 / 웹디자이너·퍼블리셔 지향
- **선수강**: 404(에이전트 기초) → **408** → 웹이론+HTML/CSS/JS(4개월) → 406(바이브코딩)
- **목표**: 웹디자인 흥미 유발 + HTML/CSS/JS 공부 필요성 자각
- **핵심 메시지**: "프롬프트는 디자인 브리핑이다"

---

## 4회차 구성 (각 4시간)

> 이론+개념 설명 ~60분 / 시연 10분 / 실습+수정 2h / 공유+발표 30분 / 버퍼 30분
> 예제 회차당 2~4개 / 강사 제공 프롬프트 템플릿 + 학생은 키워드만 수정

| 회차 | 주제 | ex1 | ex2 | ex3 | ex4 | 폴더 |
|------|------|-----|-----|-----|-----|------|
| **1회차** | 마우스 인터랙션 | 마그네틱 버튼+커서 | Flip Card | Spotlight | — | lesson1_ex1~3 |
| **2회차** | 스크롤+타이핑 | 수평 스크롤(GSAP) | 텍스트 컬러 Reveal | Typed.js | — | lesson2_ex1~3 |
| **3회차** | 외부 라이브러리 | tsParticles | Three.js 3D | VANTA.js | Canvas 2D | lesson3_ex1~4 |
| **4회차** | Awwwards 카피 | 강사 시연: 사이트 분석+AI 재현 | 학생 실습: 본인 사이트 분석 | 결과물 완성+배포 | — | lesson4_ex1~3 |

---

## 예제 상세 (폴더 기준)

### 1회차 — 마우스 인터랙션

| 예제 | 폴더 | 기술 | 상태 | Pages |
|------|------|------|------|-------|
| Magnetic Button + Custom Cursor | lesson1_ex1 | mousemove + lerp 보간 | PASS | [링크](https://hw5511.github.io/ai-agent-web/13_class_agent_v5/lesson1_ex1/) |
| Flip Cards (CSS 3D) | lesson1_ex2 | CSS perspective + rotateY | PASS | [링크](https://hw5511.github.io/ai-agent-web/13_class_agent_v5/lesson1_ex2/) |
| Spotlight Effect | lesson1_ex3 | mousemove + radial-gradient | PASS | [링크](https://hw5511.github.io/ai-agent-web/13_class_agent_v5/lesson1_ex3/) |

### 2회차 — 스크롤+타이핑

| 예제 | 폴더 | 기술 | 상태 | Pages |
|------|------|------|------|-------|
| 수평 스크롤 | lesson2_ex1 | GSAP ScrollTrigger pin | PASS | [링크](https://hw5511.github.io/ai-agent-web/13_class_agent_v5/lesson2_ex1/) |
| 텍스트 컬러 Reveal | lesson2_ex2 | GSAP ScrollTrigger scrub | PASS | [링크](https://hw5511.github.io/ai-agent-web/13_class_agent_v5/lesson2_ex2/) |
| Typed.js 타이핑 히어로 | lesson2_ex3 | Typed.js | PASS | [링크](https://hw5511.github.io/ai-agent-web/13_class_agent_v5/lesson2_ex3/) |

### 3회차 — 외부 라이브러리

| 예제 | 폴더 | 기술 | 상태 | Pages |
|------|------|------|------|-------|
| tsParticles 인터랙티브 파티클 | lesson3_ex1 | tsParticles v2 | PASS | [링크](https://hw5511.github.io/ai-agent-web/13_class_agent_v5/lesson3_ex1/) |
| Three.js GLTFLoader 3D | lesson3_ex2 | Three.js r161 + GLB + 모바일폴백 | PASS | [링크](https://hw5511.github.io/ai-agent-web/13_class_agent_v5/lesson3_ex2/) |
| VANTA.js WebGL 배경 | lesson3_ex3 | VANTA.BIRDS + Three.js | PASS | [링크](https://hw5511.github.io/ai-agent-web/13_class_agent_v5/lesson3_ex3/) |
| Canvas 2D 인터랙티브 드로잉 | lesson3_ex4 | HTML5 Canvas 2D | 미제작 | — |

### 4회차 — Awwwards 카피

| 예제 | 폴더 | 기술 | 상태 |
|------|------|------|------|
| 강사 시연: 사이트 분석+AI 재현 | lesson4_ex1 | 미정 | 미제작 |
| 학생 실습: 본인 사이트 분석 | lesson4_ex2 | 미정 | 미제작 |
| 결과물 완성+배포 | lesson4_ex3 | 미정 | 미제작 |

---

## 배포 방식

- GitHub 클래식 토큰 + Claude 배포 스킬 → "배포해줘" 한 마디로 GitHub Pages 링크 생성
- 1회차 사전과제: GitHub 계정 + 레포 생성 + 토큰 발급

---

## 에이전트 버전 (수업용 CLAUDE.md)

| 버전 | 특징 | 폴더 |
|------|------|------|
| v1 | 기준선. 다크 고정, 용어매핑, 60fps 원칙 | 09_class_agent |
| v2 | Huemint API 도입 (score 기준 → 흑백화 문제) | 10_class_agent_v2 |
| v3 | 채도 기준 정렬 + 에이전트 직접 선택 | 11_class_agent_v3 |
| v4 | 배경 해제 + luminance 텍스트 자동판단 | 12_class_agent_v4 |
| **v5** | **분위기 3단계 + 밝은배경 기본값 + 폰트자동판단 + Three.js/Canvas 보일러플레이트** | 13_class_agent_v5 |

현재 확정 버전: **v5**

---

## 남은 작업

- lesson3_ex4: Canvas 2D 인터랙티브 드로잉 예제 제작
- lesson4_ex1~3: Awwwards 카피 (우희 사마 자료 대기 중)
- 각 예제별 학생용 프롬프트 템플릿 정리
- GitHub 토큰 배포 스킬 파일 제작

---

_최종 업데이트: 2026-03-10_
