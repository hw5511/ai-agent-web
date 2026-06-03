# 지식 노트 — 모션/애니메이션/인터랙션/생성예술 (sweep 1, 2026-06-03)

## 조사 스킬 요약

### algorithmic-art (Anthropic) — github.com/anthropics/skills/.../algorithmic-art
- 2단계(철학 .md → p5.js), **시드 필수**(`randomSeed/noiseSeed` + prev/next/random/jump UI), **90/10**(생성 90·파라미터 10), 파라미터=시스템의 질 조절. 단일 self-contained .html.
- 신규: **SURPRISE를 seeded generative로 정식화**(재현+변주), process-over-product.

### gsap-core (GreenSock) — github.com/greensock/gsap-skills
- 기본 ease `power1.out`, **`autoAlpha`>`opacity`**(클릭차단 버그 방지), transform 별칭(x/y/scale/rotation/xPercent), stagger `{amount,from:"center|random"}`, `gsap.matchMedia()`로 reduced-motion 분기(`duration:0`).
- 신규: autoAlpha, easing 프리셋, matchMedia reduced-motion.

### gsap-performance (GreenSock)
- compositor: `x,y,scale,rotation,opacity`만. **will-change는 active 요소에만**(남발 금지·오버헤드). read→write 분리. **`gsap.quickTo()`**(고빈도/마우스팔로워). 오프스크린 kill/pause.
- 신규(핵심): will-change 남용 경고, quickTo, read/write 배칭.

### gsap-scrolltrigger (GreenSock)
- scrub `1`(catch-up), **pin된 요소 자체 애니 금지·자식만**, start/end 구문, **`ScrollTrigger.batch()`**(카드 떼 등장), cleanup `getAll().kill()`.
- 신규: batch 리빌, pin 자식 규칙.

### gsap-plugins (SplitText/Flip/Draggable/CustomEase)
- **Flip**: `getState→DOM변경→from`(layout 변화를 compositor-safe transform 보간). SplitText per-char 리빌. Draggable inertia/edgeResistance. CustomEase.
- 신규: **FLIP 기법**(레이아웃 전환 표준), SplitText SURPRISE 후보.

### web-animation-design (Vercel Labs open-agents) ★ 최대 수확 — github.com/vercel-labs/open-agents/.../web-animation-design
- **Duration**: 마이크로 100–150 / 표준 150–250 / 모달 200–300ms, "UI는 <300ms", exit ≈ entrance −20%, 거리 비례.
- **Easing 카탈로그**: user-initiated→ease-out `cubic-bezier(.215,.61,.355,1)`; on-screen→ease-in-out `cubic-bezier(.645,.045,.355,1)`; linear=마퀴/프로그레스 전용; ease-in 회피.
- Spring bounce 0.1–0.3. compositor: transform/opacity만, blur>20px 회피.
- **빈도 임계**: 하루 100회+/키보드/잦은 hover엔 애니 금지·최소화.
- **reduced-motion 전면 차단**: `animation:none` "opacity/color도 예외 없음".
- **Paired elements**: 함께 움직이면 동일 easing·duration. 마이크로: `:active scale(.97)`, 등장 `scale(.95)`(0 아님), `@media (hover:hover) and (pointer:fine)`.
- 신규(최우선): 정량 easing/duration 토큰표, 빈도 억제, paired-elements.

### Lenis (darkroom.engineering) — github.com/darkroomengineering/lenis
- 기본 `lerp:0.1`,`duration:1.2`. **GSAP 단일 RAF 통합**: `lenis.on('scroll',ScrollTrigger.update); gsap.ticker.add(t=>lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0)`. reduced-motion 시 미초기화(네이티브).
- 신규: 단일 RAF 통합으로 중복/jank 방지.

### threejs/webgpu/shader (CloudAI-X / dgreenheck / MiniMax-AI)
- **pixelRatio ≤2 캡**, ShaderMaterial `uniforms{uTime,uColor}`, **dispose 정리**, instancing/frustum culling, RAF 단일.
- 신규: pixelRatio 캡 + dispose + uTime 시드(셰이더 노이즈 ↔ seeded 결합).

## 이 분야 신규 Top 5
1. **정량 모션 토큰**(web-animation-design): duration 100–300ms 구간 + ease-out/in-out cubic-bezier 카탈로그 + exit −20%.
2. **빈도 기반 애니 억제 + paired-elements 동일 easing/duration**(web-animation-design).
3. **seeded generative**(algorithmic-art): randomSeed/noiseSeed + 시드 내비, 90/10.
4. **GSAP 60fps 구체**: will-change 남발 금지, quickTo, read/write 배칭, autoAlpha.
5. **Lenis×GSAP 단일 RAF + FLIP**: RAF 중복 제거, layout 변화 compositor-safe 보간.

## ★ 전 분야 공통 합의 (강한 신호)
모든 모션 스킬이 **reduced-motion = 전면 차단(opacity/color도 예외 없음)** 을 명시 — Round 2에서 발견한 v2-full 버그(콘텐츠 은닉)와 직결. SPARK reduced-motion은 "애니 비활성 + **모든 reveal을 최종 가시 상태로 즉시 복원**"으로 못박아야 함.
