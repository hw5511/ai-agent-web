# 408 AI Agent Web - Overview

## Project Purpose
`claude -p` (Sonnet) 모델에게 웹 페이지 생성을 요청하여 결과물의 퀄리티를 평가하고, 다양한 웹 샘플을 축적하는 프로젝트.

## Workspace
- **woohee_dev**: `C:/woohee_dev/408_ai_agent_web/`
- **claude_hub**: `C:/claude_hub/4f-education/agent-web/`

## Workflow
1. 하위 폴더 생성 (테스트 주제별 구분, `NN_주제명/`)
2. 폴더 안에 `prompt.md`로 사용할 프롬프트 기록
3. 해당 프롬프트로 `claude -p` 호출 -> 같은 폴더에 웹 결과물 생성
4. autosurf(MCP)로 스크롤/인터랙션 자동 검증
5. 퀄리티 체크 및 평가

## Folder Structure
```
408_ai_agent_web/
  docs/
    00_OVERVIEW.md
    98_CURRENT.md
  README.md
  01_scroll_gallery/    <- 완료된 샘플
  NN_주제명/            <- 추가 샘플들
    prompt.md
    index.html
    ...
```

## Rules
- `prompt.md`에는 순수 프롬프트 내용만 기록
- 실행 디렉토리: `C:\claude_hub\playground` (유키 페르소나 격리)
- 프롬프트 첫 줄에 결과물 절대경로 명시
- QA: autosurf + http.server 8899 + 스크린샷 검증
