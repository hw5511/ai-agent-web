# 408 AI Agent Web - Current Status

## Current Status
- **Phase**: Active
- **Date**: 2026-03-03

## Infrastructure
- **GitHub repo**: https://github.com/hw5511/ai-agent-web (public)
- **GitHub Pages**: https://hw5511.github.io/ai-agent-web/
- **QA 방식**: Pages URL로 직접 확인 (로컬 서버 불필요)

## Completed Samples (v2)
- `01_scroll_gallery`: GSAP Card Stack Scroll Gallery (PASS v2)
  - Pages URL: https://hw5511.github.io/ai-agent-web/01_scroll_gallery/
  - v2 개선: 하단 진행 바 + SCROLL 힌트 pulse + 카드 hover scale
- `02_word_by_word`: Word by Word 텍스트 등장 애니메이션 (PASS v2)
  - Pages URL: https://hw5511.github.io/ai-agent-web/02_word_by_word/
  - v2 개선: 3섹션 구성 + 방향 교차 stagger + 우측 세로 진행 바
- `03_card_shuffle`: Card Shuffle FAN 배열 (PASS v2)
  - Pages URL: https://hw5511.github.io/ai-agent-web/03_card_shuffle/
  - v2 개선: picsum 이미지 오버레이 + CLICK TO SHUFFLE 힌트 + 카운터
- `04_stacking_images`: Infinite Stacking Images (PASS v2)
  - Pages URL: https://hw5511.github.io/ai-agent-web/04_stacking_images/
  - v2 개선: 이미지 번호 레이블 + mouse parallax + 하단 진행 바
- `05_infinite_grid`: Infinite Grid 드래그 타일링 (PASS v2)
  - Pages URL: https://hw5511.github.io/ai-agent-web/05_infinite_grid/
  - v2 개선: 타일 gap 추가 + hover scale + stagger fade-in + DRAG 힌트

## Class Agent Setup
- `09_class_agent`: 수업용 웹 제작 에이전트 초안 (2026-03-03)
  - `.claude/CLAUDE.md`: 단일 범용 에이전트 컨텍스트
  - 허용 라이브러리: GSAP+ScrollTrigger / Swiper.js / AOS (회차 구분 없이 적합하면 사용)
  - 60fps 유지 원칙 포함 (requestAnimationFrame, transform/opacity만 애니메이션)
  - 용어 매핑 사전 포함 (학생 자연어 → CSS/JS 자동 변환)
  - 기본 다크 스타일 고정값 (#0d0d0d, Bebas Neue + Space Mono)
  - 스타일 트리거 감지 시 확인 로직
  - 테스트 prompt.md: 카페 소개 페이지 (스크롤 등장 + 드래그 슬라이더)

## Next Steps
- 09_class_agent prompt.md로 에이전트 실행 테스트
- Typed.js, Splitting.js 추가 테스트
- 4회차 AI 미디어 소스 처리 규칙 구체화
- GitHub Actions 자동 배포 스킬 추가 (유키 COO 대기 중)

## Notes
- Sonnet은 추상적 지시보다 구체적 수식을 더 정확하게 따름
- 각 샘플 폴더에 .claude/CLAUDE.md 세팅 후 에이전트 방식으로 실행
- push 후 Pages 반영까지 약 30초 소요
