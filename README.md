# Web Playground

## 목적
`claude -p` (Sonnet 모델)에게 웹 페이지 생성을 요청했을 때, 결과물의 퀄리티를 평가하는 테스트 공간.

## 워크플로우
1. 하위 폴더 생성 (테스트 주제별 구분)
2. 폴더 안에 `prompt.md`로 사용할 프롬프트 기록
3. 해당 프롬프트로 `claude -p` 호출 → 같은 폴더에 웹 결과물 생성
4. 퀄리티 체크 및 평가

## 작업 규칙
- `prompt.md`에는 순수 프롬프트 내용만 기록 (호출 방법, 메타 정보 등 적지 말 것)
- 실행 디렉토리: `C:\claude_hub\playground` (woohee_dev 밖에서 실행하여 유키 페르소나로부터 격리)
- 프롬프트 첫 줄에 결과물 절대경로 명시: `C:/woohee_dev/02_ideas/web_playground/{폴더명}/index.html 경로에 ...`
- 호출 명령:
  ```bash
  cd /c/claude_hub/playground && unset CLAUDECODE && claude -p --dangerously-skip-permissions --model sonnet \
    "$(cat /c/woohee_dev/02_ideas/web_playground/{폴더명}/prompt.md)"
  ```

## QA 방법
- autosurf (MCP, port 3004)로 스크롤/인터랙션 자동 검증
- HTTP 서버 실행: 해당 폴더에서 `python -m http.server 8899`
- autosurf에서 `http://localhost:8899/` 로 접속 후 스크린샷

## 폴더 구조
```
web_playground/
├── README.md
├── 01_테스트주제/
│   ├── prompt.md        <- 사용한 프롬프트
│   ├── index.html       <- 생성된 결과물
│   └── ...
├── 02_테스트주제/
│   ├── prompt.md
│   └── ...
└── ...
```

## 테스트 기록

### 01_scroll_gallery - GSAP Card Stack 스크롤 갤러리
- **레퍼런스**: https://madewithgsap.com/effects/tutorial001
- **결과**: PASS (2회차)
- **프롬프트 반복**: 2회
  - 1회차: 스크롤 끝에서 카드가 완전히 빠져나가지 않음 (빈 화면 미충족)
  - 2회차: translateX 매핑 공식 명시 + body 500vh로 수정 -> 전 구간 PASS
- **핵심 발견**: Sonnet은 추상적 지시("빈 화면으로")보다 구체적 수식(progress 0->+100vw, 1->-scrollWidth)을 훨씬 정확하게 따름
- **구현 품질**: 네온 테두리, Bebas Neue 오버플로우 타이틀, lerp 보간, parallax 회전 등 디자인 요소 우수
