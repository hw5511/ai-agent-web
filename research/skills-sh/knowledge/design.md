# 지식 노트 — 비주얼/미감/디자인시스템 (sweep 1, 2026-06-03)

출처: skills.sh `topic/design`, 각 SKILL.md, bergside/awesome-design-skills(67종), Vercel Web Interface Guidelines 원문.

## 조사 스킬 요약

### frontend-design (anthropics) — https://www.skills.sh/anthropics/skills/frontend-design
- 안티-슬롭 공식 레퍼런스. 금지폰트(Arial/Inter/Roboto/Space Grotesk/system), purple-on-white 금지, 솔리드 배경 금지(gradient mesh/noise/grain), 비대칭·오버랩·대각, 여백은 "generous OR controlled density(중간 금지)", CSS-only 모션 + animation-delay 스태거드 로드 1회.
- 신규: **여백 이분 원칙**, 배경 깊이 툴킷.

### high-end-visual-design (leonxlnx/taste-skill) — https://www.skills.sh/leonxlnx/taste-skill/high-end-visual-design (88.3K installs)
- 금지폰트→Geist/Clash Display/PP Editorial New/Plus Jakarta Sans. 아이콘 ultra-light(Phosphor/Remix Line). 1px 회색보더·거친 drop shadow 금지. edge-to-edge sticky navbar·대칭 3컬럼 금지. 여백 `py-24~py-40`. 모션 `linear`/`ease-in-out` 금지→커스텀 cubic-bezier+IntersectionObserver 스태거. Double-Bezel 중첩 카드. Variance Engine(3 vibe×3 layout).
- 신규(고가치): **구체 수치**(py-24~40, 768px), 아이콘 stroke 규칙, Double-Bezel, Variance Engine.

### design-taste-frontend (leonxlnx/taste-skill) — https://www.skills.sh/leonxlnx/taste-skill/design-taste-frontend (104.3K installs)
- 수치 다이얼(Design Variance 8 / Motion 6 / Density 4). em-dash·generic serif·beige+brass·동일 3-card 금지. 디자인시스템 6종(Material/Carbon/Fluent/Polaris/Primer/GOV.UK) 매핑. 코딩 전 브리프 추론. 50+ pre-flight 체크리스트.
- 신규: **정량 다이얼**, 디자인시스템 매핑, 브리프 추론 단계.

### web-design-guidelines (vercel-labs) — https://www.skills.sh/vercel-labs/agent-skills/web-design-guidelines (362.1K installs · 최다)
- 타이포: `…`/curly quotes/`&nbsp;`/`tabular-nums`/`text-wrap:balance·pretty`. 모션: prefers-reduced-motion, transform/opacity, `transition:all` 금지. 다크: `color-scheme:dark`+`<meta theme-color>`, native select 색 명시. 포커스 `:focus-visible`. 이미지 width/height. 터치 `touch-action`/`overscroll-behavior`. 로케일 Intl.*.
- 신규(고가치): **검증 가능한 출력 규칙** 다수 → SPARK 품질게이트 직행.

### emil-design-eng (emilkowalski) — https://www.skills.sh/emilkowalski/skill/emil-design-eng (77.9K)
- 애니메이션 4기준(frequency/purpose/easing/duration). 드래그 momentum/boundary damping/friction(하드스톱 금지). origin-aware popover, tooltip delay, clip-path reveal, press 피드백. reduced-motion.
- 신규: 드래그 물리, origin-aware popover, 애니메이션 4기준.

### canvas-design (anthropics) — https://www.skills.sh/anthropics/skills/canvas-design
- "90% 비주얼/10% 텍스트", 의도를 노골적으로 드러내지 말 것(subtle conceptual reference), 갤러리급 품질.
- 신규: **"의도를 announce 하지 말라"** 안티-슬롭 원칙.

### ui-ux-pro-max (nextlevelbuilder) — https://www.skills.sh/nextlevelbuilder/ui-ux-pro-max-skill/ui-ux-pro-max (197.4K)
- 검색형 DB: 50+ 스타일/161 팔레트/57 폰트페어/99 UX 가이드/161 패턴. 플랫폼별(HIG/Material/RN).
- 신규: 큐레이션 데이터셋 참조 발상(LIGHTBULB DB 확장 벤치마크).

### impeccable 세트 (pbakaus) — https://www.skills.sh/pbakaus/impeccable/polish (85.9K)
- 미감 "동사" 모듈(polish/critique/distill/quieter/bolder/delight). 디자인시스템 발견→드리프트 식별→상태(hover/focus/loading/error) 점검. MVP vs flagship 품질바 triage.
- 신규: 미감을 단일 동사 변환으로 분해, 품질바 triage.

### awesome-design-skills / typeui.sh (bergside) — https://github.com/bergside/awesome-design-skills
- 67종 비주얼 스타일 카탈로그(Glassmorphism/Brutalism/Neumorphism/Editorial/Neobrutalism…). 시맨틱 토큰 우선.
- 신규: 스타일별 명명 토큰 세트, 스타일 어휘 67종.

### design-systems (Automattic) — https://github.com/Automattic/wordpress-agent-skills/.../design-systems/SKILL.md
- **색 60/30/10**, 타입스케일 1.25 또는 1.333, body 16~18px. 금지색 purple-on-white/`#007bff`. 다크모드는 반전 아닌 전용 패스.
- 신규(고가치): **60/30/10 비율, 타입스케일 비율, body 16~18px, 다크 전용 패스**.

## 이 분야 신규 Top 5
1. Vercel 타이포·다크모드 마이크로 규칙(검증가능) — SPARK 품질게이트 직행.
2. 정량 토큰: 60/30/10 + 타입스케일 1.25/1.333 + body 16~18px.
3. Variance/Dial 메커니즘(0–10 다이얼 + 3 vibe×3 layout)로 슬롭 수렴 방지.
4. 구체 미감 수치·금지선(py-24~40, 1px보더 금지, 아이콘 ultra-light, Double-Bezel).
5. 다크 "반전 금지·전용 패스" + 모션 물리(momentum/damping/friction), 애니메이션 4기준.
