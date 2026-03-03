# 408 AI Agent Web - Current Status

## Current Status
- **Phase**: Active
- **Date**: 2026-03-03

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

## 학생 수준별 자연어 요청 테스트 결과 (v1~v4 공통)

| 레벨 | 예시 | 결과 |
|------|------|------|
| test_A | "내 소개 페이지 만들어줘" (5단어) | 완성도 있는 히어로 페이지 생성 |
| test_B | "음악 취미 소개 + 스크롤" (2문장) | 주제 정확 파악, 한국어 소개 자동 생성 |
| test_C | "친구 소개 + 드래그 + 어둡게" (3문장) | 페르소나 추론, 3섹션 구성 |
| test_D | "포트폴리오 4섹션 구조 명시" (구체) | 지시 충실 반영, 레이아웃 최고 완성도 |

---

## Next Steps
- Typed.js, Splitting.js 추가 테스트
- v4 기반으로 수업용 최종 CLAUDE.md 정리
- 4회차 AI 미디어 소스 처리 규칙 구체화
- GitHub Actions 자동 배포 스킬 추가 (유키 COO 대기 중)

## Notes
- Sonnet은 추상적 지시보다 구체적 수식을 더 정확하게 따름
- push 후 Pages 반영까지 약 30초 소요
- 병렬 에이전트 4개 동시 실행 가능, 평균 소요 109초
