# 수업용 웹 제작 에이전트 설계 문서

> 작성일: 2026-03-03
> 목적: 4회차 수업을 위한 범용 웹 제작 에이전트 CLAUDE.md 설계

---

## 수업 구조

```
1회차 ─── 클릭 인터랙션     → 눌렀을 때 뭔가 바뀌는 웹
2회차 ─── 스크롤 인터랙션   → 내리면 나타나거나 움직이는 웹
3회차 ─── 드래그 인터랙션   → 끌어서 움직이거나 조작하는 웹
4회차 ─── AI 미디어 + 인터랙션 → AI 생성 이미지/영상 배경 + 인터랙션 조합
```

수강생: 웹 완전 초보. 수업에서 배우는 용어는 박스/테두리/그림자/배경/폰트/스크롤/클릭/드래그.

---

## 에이전트 설계 방향

### 핵심 목표
범용 웹 제작 에이전트. 단일 CLAUDE.md.
초보 학생의 자연어를 받아 전문가 수준의 인터랙티브 웹으로 변환.
학생이 말하지 않은 것은 에이전트가 전문가 기준으로 결정.

### 사고 프로세스 (항상 이 순서)
1. 요청 해석 — 핵심 인터랙션 타입 파악 (scroll/click/drag/hover)
2. 스타일 결정 — 기본 다크 스타일 적용 또는 요청에 따라 변형
3. 라이브러리 선택 — 인터랙션 타입별 자동 선택 기준표 참조
4. 생성 — 단일 index.html 완성

---

## 기본 스타일 (Default Dark Style)

현재 01~05 샘플에서 정착된 "쿨한 다크" 스타일을 기본값으로 사용.

```
배경: #0d0d0d ~ #111
텍스트: 흰색, letter-spacing 넓게
폰트: Space Mono (모노스페이스) + Inter 또는 Bebas Neue
포인트 컬러: 네온 계열 또는 흰색 위주
인터랙션: subtle hover, 부드러운 transition
여백: 충분히 (미니멀)
```

**스타일 트리거 (이 키워드가 나오면 한 번만 확인):**
"밝게", "화사하게", "파스텔", "귀엽게", "따뜻하게",
"화이트 배경", "컬러풀", "밝은 배경"
→ "밝은 톤으로 갈까요, 기본 다크로 할까요?" 확인 후 생성

---

## 용어 매핑 사전

| 학생 용어 | 기술 구현 |
|---------|---------|
| 박스 | div + padding + border-radius 8~16px |
| 테두리 | border: 2px solid |
| 그림자 | box-shadow: 0 4px 20px rgba(0,0,0,0.3) |
| 배경 | 색상→background-color / 이미지→background-image + cover |
| 폰트 | Google Fonts 자동 선택 (주제에 맞는 한글+영문 조합) |
| 스크롤하면 나타나게 | IntersectionObserver + opacity/translateY transition |
| 스크롤 따라 움직이게 | scroll event + requestAnimationFrame |
| 클릭하면 바뀌게 | addEventListener('click') + class 토글 |
| 드래그 | mousedown/mousemove/mouseup + touch 이벤트 세트 |
| 둥글게 | border-radius: 50%(원) 또는 12~24px |
| 떠다니다 / 둥둥 | CSS keyframes animation |
| 천천히 | transition 0.6~1.0s ease |
| 빠르게 | transition 0.2~0.3s ease |
| 가득 차게 | width: 100%, height: 100vh, object-fit: cover |
| 가운데 | display: flex, align-items: center, justify-content: center |
| 나란히 | display: flex, gap: 적절한 값 |
| 마우스 따라 | mousemove event + lerp 보간 |

---

## 라이브러리 자동 선택 기준 (테스트 후 확정 예정)

| 인터랙션 타입 | 선택 라이브러리 | 이유 |
|------------|-------------|------|
| 스크롤 등장 효과 | AOS | data-aos 속성만으로 동작, 코드 최소화 |
| 정밀한 스크롤 연동 | GSAP + ScrollTrigger | 수치 제어 정밀, 결과물 퀄리티 최상 |
| 슬라이더 / 터치 드래그 | Swiper.js | 완성도 높은 드래그, 터치 지원 |
| 타이핑 효과 | Typed.js | 한 줄로 구현 |
| 텍스트 단어 분리 애니메이션 | Splitting.js | word-by-word 쉽게 |
| 단순 CSS 전환 | 라이브러리 없이 | transition으로 충분 |
| 파티클/Canvas | 순수 JS | 라이브러리 의존 불필요 |

---

## 기본 품질 기준 (학생이 말 안 해도 항상 적용)

- Google Fonts 한글+영문 조합 자동 적용
- 모든 인터랙션에 transition 0.3s 이상
- 모바일 반응형 (max-width + padding 자동)
- 이미지 미지정 시 loremflickr.com/{width}/{height}/{keyword} 사용
- cursor: pointer + hover 피드백 (인터랙티브 요소 필수)
- 스크롤 페이지는 진행 바 자동 포함

---

## 이미지 규칙

- 기본: `loremflickr.com/400/300/{키워드}` (키워드 검색 가능)
- 고정 이미지: `picsum.photos/seed/{N}/400/300`
- AI 생성 이미지 (4회차): 로컬 파일 경로 참조 (`./bg.jpg` 방식)
- Unsplash Source API 사용 금지 (deprecated)

---

## 금지 사항

- 다중 파일 분리 금지 (항상 index.html 단일 파일)
- 에러 유발 로컬 이미지 경로 금지 (1~3회차)
- jQuery 사용 금지
- 빈 화면 결과물 금지 (반드시 시각적 내용 포함)
- 구현 불가 기능 시 조용히 빈 코드 생성 금지 → 대안 제시

---

## 라이브러리 테스트 현황

| 라이브러리 | 테스트 | 결과 | 허용 여부 |
|-----------|--------|------|---------|
| GSAP + ScrollTrigger | 완료 (06_test_gsap) | 히어로 fade-in + 그리드 stagger + scrub 텍스트 슬라이드 정상 | **허용** |
| Swiper.js | 완료 (07_test_swiper) | Coverflow 슬라이더 + freeMode 트랙 리스트 완벽 동작 | **허용** |
| AOS | 완료 (08_test_aos) | fade/flip/zoom 다방향 효과 + 포인트 컬러 정상 | **허용** |
| Typed.js | 미정 | - | 추후 테스트 |
| Splitting.js | 미정 | - | 추후 테스트 |

---

## 미결 사항

- [ ] 라이브러리 테스트 3종 완료 후 허용 목록 확정
- [ ] 수업용 CLAUDE.md 초안 작성
- [ ] 4회차 AI 미디어 소스 처리 규칙 구체화
