# 408 AI Agent Web - Current Status

## Current Status
- **Phase**: Active
- **Date**: 2026-03-08

## Infrastructure
- **GitHub repo**: https://github.com/hw5511/ai-agent-web (public)
- **GitHub Pages**: https://hw5511.github.io/ai-agent-web/
- **QA 방식**: autosurf curl 5단계 (list→start→navigate→screenshot→stop)

---

## Completed Samples (v2)
- `01_scroll_gallery`: GSAP Card Stack Scroll Gallery (PASS v2)
- `02_word_by_word`: Word by Word 텍스트 등장 애니메이션 (PASS v2)
- `03_card_shuffle`: Card Shuffle FAN 배열 (PASS v2)
- `04_stacking_images`: Infinite Stacking Images (PASS v2)
- `05_infinite_grid`: Infinite Grid 드래그 타일링 (PASS v2)

## Library Tests (06~08)
- `06_test_gsap`: GSAP + ScrollTrigger — PASS
- `07_test_swiper`: Swiper.js Coverflow — PASS
- `08_test_aos`: AOS 다방향 등장 — PASS

---

## 수업용 에이전트 CLAUDE.md 진화 이력

### v1 — 09_class_agent (기준선)
- 단일 CLAUDE.md, 기본 다크 스타일 (#0d0d0d) 고정
- 포인트 컬러 #00ff9d 고정
- 용어 매핑 사전 + 라이브러리 허용 목록 (GSAP/Swiper/AOS)
- 60fps 유지 원칙 (requestAnimationFrame)
- **결과**: 5단어 요청도 완성도 있는 결과, 전 케이스 일관성 ✅

### v2 — 10_class_agent_v2 (Huemint 도입)
- Huemint API (POST https://api.huemint.com/color) 연동
- score 기준 최상위 팔레트 자동 선택
- 배경 #0d0d0d 고정 유지
- **결과**: test_D만 골드 선택, test_A~C 전부 회색 → 흑백화 ❌
- **원인**: huemint score 기준이 안정적 배색(회색)을 선호

### v3 — 11_class_agent_v3 (채도 기준 + 에이전트 직접 선택)
- score 기준 → **채도(saturation) 기준** 정렬로 변경
- temperature 1.2 → **1.6~1.8** / adjacency 65 → **80~85**
- 후보 5개 출력 후 에이전트가 주제 맞춰 직접 선택
- 1color / 2color / 3color 팔레트 규모 자동 판단 추가
- 배경 #0d0d0d 여전히 고정
- **결과**: test_A #3a75be, test_B #00b6fc+#fed300, test_C #ff5932+#00e1af, test_D #e53c69+#f2e400 ✅
- **생성 소요 시간**: 평균 109초 (huemint API 포함)

### v4 — 12_class_agent_v4 (배경도 자유 + 텍스트 luminance 대응)
- **배경 고정 해제**: 다크 키워드일 때만 #0d0d0d 권장, 나머지는 palette[0]="-"
- **텍스트 컬러 자동 판단**: BG luminance < 0.3 → #fff / >= 0.3 → #111
- 전체 조화 기준 추가 (팔레트 내 색상 간 어울림)
- **결과**:
  - test_A ("내 소개"): 핫핑크 배경 #f95079 + 민트 accent, 텍스트 #111 자동 적용 ✅
  - test_B (음악, 다크 키워드): #0d0d0d 유지 + 블루+골드 ✅
  - test_C (어둡게 키워드): #0d0d0d 유지 + 그린+옐로우 ✅
  - test_D (검정 명시): #0d0d0d 고정 + 블루+라임 ✅
- **문제점**: 불명확 분위기("내 소개") → 핫핑크 등 예측 불가 배경 발생

### v5 — 13_class_agent_v5 (분위기 3단계 + 밝은 배경 기본값 + 폰트 자동 판단)
- **분위기 3단계 감지**: 다크(#0d0d0d 고정) / 밝음명확(luminance>0.3 우선) / 기본불명확(밝은계열 기본)
- **luminance 기반 팔레트 필터**: 비다크 분위기에서 어두운 후보 자동 제외
- **폴백 프리셋 7종**: API 실패 또는 적합 후보 없을 시 분위기별 하드코딩 적용
- **dry-run 구조 요약 출력**: 생성 전 주제/분위기/팔레트규모/섹션/폰트 한 줄 요약
- **폰트 자동 판단**: 영문+한글 20+ 카테고리 매핑 테이블, Google Fonts CDN
- **결과** (7종 테스트 전원 PASS):
  - test_A (내 소개/불명확) → 밝은 흰/라벤더 배경 ✅ (v4 핫핑크 문제 해소)
  - test_B (음악/다크) → #0d0d0d + 민트 포인트 ✅
  - test_C (친구 소개/어둡게 명시) → 다크 + 핑크 그라데이션 ✅
  - test_D (포트폴리오/검정 명시) → 다크 + 민트/레드 ✅
  - test_E (카페 블로그) → 따뜻한 카페 분위기 (크림/브라운) ✅
  - test_F (여행 갤러리) → 밝은 연노랑/파랑 상쾌한 배경 ✅
  - test_G (강아지/귀엽게) → 파스텔 핑크 배경 ✅

---

## Huemint API 핵심 정리

- **엔드포인트**: POST https://api.huemint.com/color
- **인증**: 없음 (비상업적 무료, 업타임 비보장)
- **핵심 파라미터**:
  - `palette`: 고정값 or `"-"` (AI 선택)
  - `adjacency`: n×n 대비 매트릭스 (80~85 = 선명한 대비)
  - `temperature`: 창의성 (1.6~1.8 권장)
  - `num_results`: 후보 수 (10개 받아서 채도 순 정렬)
- **선택 전략**: score 기준 ❌ → **채도 기준 정렬 후 에이전트 주제 맞춰 선택** ✅
- **키워드 → 태그 없음**: 수치 파라미터만 존재, 주제 해석은 에이전트가 담당

---

## 학생 수준별 자연어 요청 테스트 결과 (v1~v5 공통)

| 레벨 | 예시 | 결과 |
|------|------|------|
| test_A | "내 소개 페이지 만들어줘" (5단어) | 완성도 있는 히어로 페이지 생성 |
| test_B | "음악 취미 소개 + 스크롤" (2문장) | 주제 정확 파악, 한국어 소개 자동 생성 |
| test_C | "친구 소개 + 드래그 + 어둡게" (3문장) | 페르소나 추론, 3섹션 구성 |
| test_D | "포트폴리오 4섹션 구조 명시" (구체) | 지시 충실 반영, 레이아웃 최고 완성도 |
| test_E | "카페 블로그 따뜻하게" (신규) | 크림/브라운 카페 분위기 |
| test_F | "여행 사진 + 밝고 상쾌하게" (신규) | 연노랑/파랑 여행 감성 |
| test_G | "강아지 취미 파스텔 귀엽게" (신규) | 파스텔 핑크 귀여움 |

---

## 수업 커리큘럼 구성안 (408 에이전트 웹)

### 포지션
- 대상: 코딩 경험 전무 / 웹디자인+UXUI 병행 / 웹디자이너·퍼블리셔 지향
- 위치: 404(에이전트 기초) 선수강 → 408 → 웹이론+HTML/CSS/JS(4개월) → 406(바이브코딩)
- 목표: 웹디자인 흥미 유발 + HTML/CSS/JS 공부 필요성 자각
- 핵심 메시지: "프롬프트는 디자인 브리핑이다"

### 4회차 구성 (각 4시간)
이론+개념 설명 ~60분 / 시연 10분 / 실습+수정 2h / 공유+발표 30분 / 버퍼 30분
예제 회차당 2~3개 / 강사 제공 프롬프트 템플릿 + 학생은 키워드만 수정

| 회차 | 주제 | 예제1 | 예제2 | 예제3 |
|------|------|-------|-------|-------|
| 1회차 | 마우스 인터랙션 | 마그네틱 버튼+커서 | 카드 뒤집기(Flip) | Spotlight 효과 |
| 2회차 | 특수 라이브러리 | Typed.js 타이핑 | tsParticles 파티클 | Three.js 3D |
| 3회차 | 스크롤+특수UI | 수평 스크롤(GSAP) | Time Wheel Picker | 텍스트 컬러reveal |
| 4회차 | 소개 페이지 | 히어로 섹션 | 히어로+3섹션 | 내버전 완성+배포 |

### 배포 방식
GitHub 클래식 토큰 + Claude 배포 스킬 → "배포해줘" 한 마디로 GitHub Pages 링크 생성
1회차 사전과제: GitHub 계정 + 레포 생성 + 토큰 발급

### 기존 01~08 예제와 비중복
01~08: Card Stack / Word by Word / Card Shuffle / Stacking Images / Infinite Grid / GSAP / Swiper / AOS
수업 예제: 마그네틱 / Flip Card / Spotlight / Typed.js / tsParticles / Three.js / 수평스크롤 / TimeWheelPicker / 텍스트Reveal

## 버그 수정 이력 (2026-03-09)
- lesson2_ex3: html/body overflow:hidden 제거 → 스크롤 정상 (PASS)
- lesson3_ex2: DrumPicker momentum 150→60, max steps 5→3 → 스냅 정확도 개선 (PASS)

## Next Steps
- 수업 예제 12개 v5 에이전트로 사전 제작 (완료: lesson1~3 9개, lesson4 3개 미완)
- 각 예제별 학생용 프롬프트 템플릿 정리
- GitHub 토큰 배포 스킬 파일 제작
- v5를 수업용 최종 CLAUDE.md 기준으로 확정
- GitHub Actions 자동 배포 스킬 추가 (유키 COO 대기 중)

## Notes
- Sonnet은 추상적 지시보다 구체적 수식을 더 정확하게 따름
- push 후 Pages 반영까지 약 60초 소요
- 병렬 에이전트 7개 동시 실행 확인 (v5 테스트)
- 불명확 분위기: temperature 낮출수록 (1.4) 안전한 밝은 배경 선택 경향
- 폰트 자동 선택이 컬러만큼 분위기에 기여 (카페=Playfair, 귀여움=Quicksand/Jua)
