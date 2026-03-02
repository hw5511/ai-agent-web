# 408 AI Agent Web - Current Status

## Current Status
- **Phase**: Active
- **Date**: 2026-03-03

## Infrastructure
- **GitHub repo**: https://github.com/hw5511/ai-agent-web (public)
- **GitHub Pages**: https://hw5511.github.io/ai-agent-web/
- **QA 방식**: Pages URL로 직접 확인 (로컬 서버 불필요)

## Completed Samples
- `01_scroll_gallery`: GSAP Card Stack Scroll Gallery (PASS)
  - Pages URL: https://hw5511.github.io/ai-agent-web/01_scroll_gallery/
- `02_word_by_word`: Word by Word 텍스트 등장 애니메이션 (PASS)
  - Pages URL: https://hw5511.github.io/ai-agent-web/02_word_by_word/
  - tutorial005 재현, IntersectionObserver + stagger
- `03_card_shuffle`: Card Shuffle FAN 배열 (PASS)
  - Pages URL: https://hw5511.github.io/ai-agent-web/03_card_shuffle/
  - tutorial003 재현, 6장 부채꼴 + parallax lerp
- `04_stacking_images`: Infinite Stacking Images (PASS)
  - Pages URL: https://hw5511.github.io/ai-agent-web/04_stacking_images/
  - tutorial014 재현, 600vh 스크롤 구간 매핑
- `05_infinite_grid`: Infinite Grid 드래그 타일링 (PASS)
  - Pages URL: https://hw5511.github.io/ai-agent-web/05_infinite_grid/
  - tutorial026 재현, buildWrappers + modulo 무한 루프

## Next Steps
- 추가 웹 샘플 주제 기획
- GitHub Actions 자동 배포 스킬 추가 (유키 COO 대기 중)

## Notes
- Sonnet은 추상적 지시보다 구체적 수식을 더 정확하게 따름
- 각 샘플 폴더에 .claude/CLAUDE.md 세팅 후 에이전트 방식으로 실행
- push 후 Pages 반영까지 약 30초 소요
