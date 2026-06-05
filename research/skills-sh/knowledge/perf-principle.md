# 렌더링 성능 원리 (sweep 5, 2026-06-04)

문제: LLM 히어로가 실기기에서 렉(예: 커서 추종 70vw blur(90px) 블롭 3개, CPU 6x서 22fps). "캡 목록"이 아니라 **렉 코딩 자체를 막는 단일 원리**가 필요.

## ★ THE LAW (단일 원리)
**매 프레임 변하는 값은 Composite 단계만 건드려야 한다.** CSS animation/transition + JS rAF/scroll/mouse 핸들러가 바꾸는 모든 것은 오직 `transform`·`opacity`만. (web.dev: composite-only 속성은 이 둘뿐.) 그 외 = Layout/Paint 재실행 = 렉.

## ★ THE TRAP (transform이라도 안전 아님)
`filter:blur` / `backdrop-filter` / 큰 `box-shadow` / `mix-blend-mode`가 걸린 레이어는 transform 이동도 **매 프레임 텍스처 재계산(re-paint/re-blur)**. (Chrome "Animating a blur": "the texture itself is still unblurred and needs to be re-blurred every frame".) + paint area union으로 화면 전체 repaint 위험. → **큰 흐림은 정적**. 움직임 필요시 사전렌더 + opacity 크로스페이드.

## 파생(같은 법칙의 적용 — 외울 캡 아님)
1. 위치/추종 = transform 또는 `--x/--y` CSS 변수만 (top/left/width/height = Layout).
2. rAF/핸들러: read(getBoundingClientRect/offset*) 전부 → write 전부 (교차 = forced reflow). (web.dev layout thrashing)
3. `will-change`는 **last resort, JS로 켰다 끔, 손에 꼽게** (MDN: "not to anticipate, 과다 시 메모리 폭발·성능 악화"). → 현행 SPARK "will-change 필수"는 정설과 충돌, 수정.
4. 화면밖/독립영역 `contain`/`content-visibility:auto`로 layout·paint skip.

## csstriggers 분류 (검증 근거)
transform·opacity=Composite만 / top·left·width·height·margin=Layout연쇄 / box-shadow·background·filter·border-radius·clip-path=Paint. Lighthouse "non-composited animations"=Style/Layout/Paint 유발 애니=저사양폰서 janky.

## ★ 하네스 정적 렉 탐지 Top 5 (코드만으로, rAF FPS는 GPU렉에 눈멈)
1. **매 프레임 non-composite 변경**: @keyframes/transition 또는 rAF/scroll/mousemove 핸들러가 top|left|right|bottom|width|height|margin|padding|filter|box-shadow|clip-path|border-radius|background 변경 → FAIL.
2. **움직이는 무거운 레이어**(사례 킬러): filter:blur/backdrop-filter/큰 box-shadow/mix-blend 걸린 요소가 transform-애니/추종/scrub 대상 → FAIL.
3. **거대 blur 면적**: blur ≥40px인데 레이어 70vw/100vh급 → 경고(룰2 보조).
4. **layout thrashing**: 한 함수/rAF서 offset*/getBoundingClientRect/getComputedStyle 읽기 후 스타일 쓰기 → FAIL.
5. **레이어/승격 남용**: will-change 스타일시트 영구선언 / 승격 과다 / scrub:true → FAIL.

출처: web.dev/articles/rendering-performance · stick-to-compositor-only-properties · simplify-paint-complexity · avoid-large-complex-layouts-and-layout-thrashing · content-visibility · developer.chrome.com/blog/animated-blur · lighthouse non-composited-animations · MDN will-change · csstriggers.com
