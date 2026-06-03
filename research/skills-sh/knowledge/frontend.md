# 지식 노트 — 프론트엔드/UI 구현 (sweep 1, 2026-06-03)

SPARK는 이미 성숙(60fps 하드제약, 이모지금지, 폰트 weight, 클리셰 감사, 17 카탈로그). 아래는 **SPARK에 없는 신규** 우선.

## 조사 스킬 요약

### Anthropic frontend-design — github.com/anthropics/skills/.../frontend-design
- 톤 1개 의무 선택, **구현 복잡도를 미감에 매칭**(맥시멀=정교, 미니멀=절제), Space Grotesk 수렴 경계.
- 대부분 기존. 신규: "Space Grotesk 수렴 경계"(낮음).

### taste-skill 계열 (Leonxlnx) — github.com/Leonxlnx/taste-skill ★ 최고 수확
**기계적 pre-flight 카운트 체크(거의 전부 SPARK 신규):**
- **Zigzag 교대 ≤2 연속**(3번째 image+text split 금지).
- **레이아웃 패밀리 다양성**: 8섹션이면 ≥4 패밀리, 패밀리 재사용 금지.
- **Eyebrow 상한 = ceil(섹션수/3)** (모든 섹션 소문자 라벨 = AI tell).
- **One Accent Max, 채도<80% + Color Lock**(전 페이지 동일 액센트, 7번째에서 갑툭 파란 CTA 금지).
- **Premium-Consumer 팔레트 금지**: beige+brass+oxblood+espresso(LLM 럭셔리 디폴트) → cold luxury/forest/cobalt+cream/terracotta+slate 회전.
- 금지: 동일 3 피처카드, 중앙정렬 히어로 디폴트, div 가짜 스크린샷/대시보드, `00/INDEX` 섹션번호, "Scroll ↓" 큐, **em-dash 전면 0개**.
- Hero: pt-24 상한, 텍스트요소 ≤4, CTA 폴드 내, nav 1줄(높이 ≤80px).
- 모션: `addEventListener("scroll")` 금지→IO/ScrollTrigger/CSS scroll-driven, 마퀴 페이지당 ≤1.

**minimalist-skill 정밀 토큰:**
- 텍스트 순수검정 금지 `#111111`/`#2F3437`, 보조 `#787774`. 보더 `1px solid #EAEAEA`. 카드 radius 8~12, 버튼 4~6. 그림자 ≤`0 2px 8px rgba(0,0,0,.04)`. 스크롤 진입 `600ms cubic-bezier(.16,1,.3,1)`, `translateY(12px)+opacity0`, stagger `index*80ms`.

**high-end-visual-design:**
- easing `cubic-bezier(.32,.72,0,1)`, 진입 800ms+. **Double-Bezel**: outer `ring-1 ring-black/5` + inner `shadow-[inset_0_1px_1px_rgba(255,255,255,.15)]`. 버튼 `active:scale-[.98]`, 아이콘 `group-hover:translate-x-1`. blur는 fixed/sticky만.

### Vercel web-design-guidelines — github.com/vercel-labs/agent-skills + command.md
- 접근성(aria-label/aria-hidden/aria-live/skip link), 모션(reduced-motion·`transition:all` 금지·입력으로 중단 가능), 폼(htmlFor·spellcheck off·paste 허용·첫 에러 포커스·placeholder `…`), 타이포(`…`/곡선따옴표/tabular-nums/text-wrap:balance/nbsp), 터치/포커스(`touch-action`·`overscroll-behavior`·`:focus-visible`), 성능(>50 가상화·font preload+swap).
- 신규(높음): SPARK 접근성·폼·키보드 공백 보완.

### Vercel react-best-practices / composition-patterns — github.com/vercel-labs/agent-skills
- waterfall 제거/번들/re-render; compound component, boolean props 금지.
- SPARK 단일 index.html 전제라 **범위 밖**(낮음).

### UI/UX Pro Max (nextlevelbuilder) — github.com/nextlevelbuilder/ui-ux-pro-max-skill
- **정량 가드레일**: 4pt/8dp 간격(16/24/32/48), 대비 4.5:1(큰텍스트 3:1, 다크 보조≥3:1, 색만으로 의미 금지), 터치 44×44/48×48+간격8, 포커스링 2~4px, **마이크로 150~300ms·복합 ≤400ms·>500ms 금지·exit=enter의 60~70%**, 모바일 본문16px·line-height 1.5~1.75·65~75자, raw hex 금지(semantic token).
- 신규(중): 대비비/터치타깃/애니메이션 duration 밴드/line-height.

### 기타
- **Impeccable**(impeccable.style): 41개 결정론적(비-LLM) 안티패턴 탐지(gradient-text/side-stripe/ai-palette 차단), 슬래시 커맨드, 반복당 3변형.
- **AccessLint**: WCAG 대비비 MCP 프로그래밍 계산.
- **Bencium UX**: innovative vs controlled 2변형, reduction.
- **Vercel React Native**: FlashList, transform/opacity만.

## 이 분야 신규 Top 5
1. **기계적 pre-flight 카운트 체크**(taste-skill): em-dash 0 / eyebrow ≤ceil(섹션/3) / zigzag ≤2 / 레이아웃 패밀리 ≥4 / 액센트 1개 Color Lock(채도<80%) / 동일 3카드 0. → Self-Audit 정성→정량.
2. **접근성·모션 안전 가드레일**(Vercel): reduced-motion 필수·aria-label·transition:all 금지·focus-visible·중단가능.
3. **정량 모션/대비/타깃 밴드**(UI/UX Pro Max): 150~300ms·exit 60~70%·>500ms 금지·대비4.5:1·터치44.
4. **Premium-Consumer 팔레트 금지 + 액센트 회전 풀**(taste-skill).
5. **Double-Bezel 광학 깊이**(high-end): harsh shadow 대신 ring+inset.
