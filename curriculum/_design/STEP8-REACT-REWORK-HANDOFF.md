# 작업 핸드오프 — Step 8 React 재편 + 눈누 폰트 스킬 분리

> **이 문서는 다음 클라우드 세션을 위한 인수인계서**다. 새 세션은 `hw5511/ai-agent-web` + `hw5511/vibe-web` 두 레포를 스코프로 잡고 시작한다. 이 문서만 읽으면 맥락 없이도 이어서 작업할 수 있도록 작성했다.
>
> 작성: 2026-06-24 (이전 세션) · 정본 위치: `curriculum/_design/STEP8-REACT-REWORK-HANDOFF.md`

---

## 0. 한 줄 목표
**Part 1의 8주차(Step 8)를 "SPARK + 배포" 수업에서 "React 수업"으로 바꾸고, 거기서 쓰던 눈누(noonnu) 무료폰트 CLI는 별도 독립 스킬로 분리해 1~3주(디자인 단계)에서만 공유한다.**

---

## 1. 배경 — 왜 바꾸나
- `ai-agent-web` 은 **16주 "AI 에이전트 웹" 강의 커리큘럼** 레포다(`curriculum/`).
- 학생 프로파일: HTML/CSS/JS·React 모두 zero, 단 **Claude Code·하네스·프롬프트 엔지니어링은 능숙**("AI 도구 능숙한 zero").
- 원래 커리큘럼은 **의도적으로 "React zero"**(노코드·단일 HTML 기조)였고, 본격 React는 별도 "다음 갈래(406 바이브코딩)"로 분리돼 있었다. → **이번에 이 방침을 바꿔 Step 8에 React를 도입**하기로 CEO(강사)가 결정.
- 동기: 강사가 React 실무/수업으로 방향을 넓히려 함. (별도 본인 프로젝트 `moltroom-studio` 가 있으나 이번 작업 범위에서는 **무시**.)

### 현재 16주 구조 (변경 전)
```
PART 1 (1~8주) — 통제 가능한 랜딩페이지 + 배포  [vanilla, 단일 HTML]
 1 청사진 · 2 HTML · 3 CSS · 4 JS · 5 GSAP · 6 마우스 · 7 라이브러리 · 8 SPARK+배포
 → 도달점: 공개 URL 가진 내 랜딩페이지
PART 2 (9~16주) — 데이터·도메인·결제  [여전히 vanilla + Claude 주도]
 9 API · 10 저장 · 11 Supabase · 12 Auth · 13 도메인 · 14 Vercel · 15 AI · 16 결제
```

---

## 2. 핵심 결정 & 미결정
- ✅ **결정**: Step 8 = React 수업. 눈누 CLI는 별도 스킬로 추출(`/skill-creator` 방식). spark **디자인 본문은 Step 8 수업에서 폐기**(스킬 자체는 레포에 그대로 남김 — 연구/실무용).
- ⚠️ **미결정(새 세션에서 확정 필요) — React 도입 범위 시나리오**:
  | | 구성 | 배포 | 비고 |
  |---|---|---|---|
  | **B (이전 세션 추천)** | 8주 = React 첫 앱을 **만들어서 배포**(Vite→Pages/Vercel) | 8주 유지 | Part 1 배포 클라이맥스 살림 + React 진입. 9~16주는 일단 그대로 |
  | A | 8주 = React 개념 맛보기만 | 7주로 이동 | 변경 최소지만 React가 고립(한 주 배우고 안 씀) |
  | C | 8주 React 입문 + **9~16주도 React 기반 전면 재편** | 8주 | 실무 스택 일관·"다음 갈래"와 통합되나 8개 세션 재작성(대공사) |
  - **권고: B로 시작, C는 추후 판단.** 단 최종 결정은 강사 몫 — 새 세션은 먼저 이 선택을 확인할 것.

### React 도입 시 반드시 고려 (이전 세션 분석)
1. **배포 클라이맥스 보존**: Step 8의 진짜 핵심은 "내 사이트가 인터넷에 산다"(GitHub Pages). React로 바꿔도 **"React로 만든 첫 앱을 배포"** 형태로 이 감동을 남겨야 함.
2. **React 고립 주의**: 1~7주가 vanilla인데 8주만 React면, 9주부터 다시 vanilla로 돌아가 8주가 붕 뜬다. (시나리오 C가 이를 해소하나 대공사.)
3. **난이도**: Vite·컴포넌트·JSX·npm이 한꺼번에 들어옴. "AI 도구 능숙" 학생이라도 점프가 크니, Claude Code 주도로 개념 최소화 + 1개념 원칙 유지.

---

## 3. vibe-web 활용 (새 세션 스코프에 포함됨)
- `hw5511/vibe-web` = **Vite로 빌드된 React 앱의 "보관 배포본"**(루트 `index.html` + `/vibe-web/assets/index-<hash>.js`, `<div id="root">`, base path `/vibe-web/`). 스택: **React + Vite + Tailwind**.
- ⚠️ **소스(src·컴포넌트)는 vibe-web main에 없다** — 빌드 결과물만. 원본 소스는 private **`wi-archived-lectures/46-바이브코딩`** 에 있다(OVERVIEW 기록). 컴포넌트/Tailwind 패턴을 제대로 참고하려면 그 private 레포도 스코프에 넣어야 할 수 있음.
- 용도: Step 8(및 향후 11~14주)의 **"참고 React 사례"**. "AI로 만든 React 강의 웹앱"이 실제로 어떤 구조인지 본보기.
- 이전 세션 제약: 이 세션은 `ai-agent-web` 스코프뿐이라 vibe-web을 git clone(프록시 403)·MCP(스코프 거부)로 열지 못했다. **새 세션은 vibe-web 스코프가 있으니 MCP로 직접 트리/소스를 읽을 것.**

---

## 4. 해야 할 작업 (제안 순서)
### A. 눈누 폰트 CLI를 독립 스킬로 추출 (`/skill-creator` 방식)
- 현재 위치: `skills/spark/scripts/noonnu.cjs` + `skills/spark/data/noonnu-fonts.json`(무료폰트 1,120종 캐시).
- 새 스킬 예: `skills/noonnu-fonts/` — `SKILL.md`(frontmatter `name: noonnu-fonts`) + `scripts/noonnu.cjs` + `data/noonnu-fonts.json` + `README.md`.
- `noonnu.cjs` 명령(이미 구현·검증됨): `search` / `category` / `info` / `webfont` / `sample` / `contact`(대조표 PNG) / `build-cache [--incremental]`. 캐시 우선 + 라이브 폴백. Playwright APIRequestContext(ignoreHTTPSErrors)로 인증서 가로채기 환경 대응.
- SKILL.md에 "폰트는 `contact` 대조표 이미지를 Read로 보고 셀렉"을 명시(텍스트 메타만 보면 인기 폰트로 쏠림).
- 추출 후 spark 스킬에서 눈누 부분은 남겨도/지워도 되지만, **수업 공유본은 noonnu-fonts 독립 스킬**로.

### B. Step 8 React 재작성 (시나리오 확정 후)
- 대상 파일:
  - `curriculum/08_session8.md` (개요·슬라이드표·실습 프롬프트)
  - `curriculum/_slides/08_session8_slides.md` (슬라이드 14장 명세)
  - `curriculum/_assets/basic/step08/*.svg` (학생이 실제 보는 슬라이드 **SVG 13장** — 텍스트 노드 편집 가능, `_design/SVG_*` 계약/스타일가이드 준수, playwright로 렌더 검증)
  - `demo/spark-ab/` (A 맨손 vs B 데모 — React 흐름이면 재구성 필요)
  - `curriculum/00_OVERVIEW.md` (16주 표·1개념표·React 처리 방침·Part 1 도달점)
- vibe-web을 참고해 "Claude Code로 React 앱 만들기 → 배포"의 1개념·실습 프롬프트를 설계.

### C. 연쇄 자료 갱신
- OVERVIEW의 "React 처리 방침"(현재 "zero, 메타만")을 새 방침으로 수정.
- Part 1 도달점 문구, 1개념표 8행, 슬라이드 구조.
- 시나리오 C라면 9~16주까지.

---

## 5. ⚠️ 주의 — 이전 세션이 방금 한 작업과 충돌 (되돌릴 것)
직전 세션에서 **Step 8을 (React가 아니라) `/spark` 스킬 방식으로 전환**해 이미 main에 배포해 둔 상태다. 이번 React 재편은 그 위에 덮어쓰는 셈이므로, 새 세션은 다음을 인지할 것:
- `08_session8.md`, `08_session8_slides.md`, `step08/*.svg`(8장), `00_OVERVIEW.md`, `curriculum/_assets/files/SPARK.md` 가 **현재 "/spark 스킬" 내용으로 바뀌어 있음** → React 내용으로 다시 작성.
- 즉 "SPARK.md→CLAUDE.md" 구버전도 아니고, "/spark 스킬"도 아닌 **React**가 최종 목표.

---

## 6. 파일 인덱스 (현재 상태)
| 항목 | 경로 |
|---|---|
| 16주 개요 | `curriculum/00_OVERVIEW.md` |
| Step 8 개요 | `curriculum/08_session8.md` |
| Step 8 슬라이드 명세 | `curriculum/_slides/08_session8_slides.md` |
| Step 8 SVG 13장 | `curriculum/_assets/basic/step08/*.svg` |
| SVG 작업 계약·스타일 | `curriculum/_design/SVG_GENERATION_TASK.md`, `SVG_REGEN_CONTRACT.md`, `svg_style_guide.md` |
| A/B 데모 | `demo/spark-ab/{a,b,index.html}` |
| spark 스킬(정본, main 머지됨 PR #23) | `skills/spark/` (SKILL.md·README·pick.py·forced_connection.py·noonnu.cjs·references/lightbulb.md·data/noonnu-fonts.json) |
| 눈누 CLI(추출 대상) | `skills/spark/scripts/noonnu.cjs` + `skills/spark/data/noonnu-fonts.json` |
| 학생 배포용 SPARK.md | `curriculum/_assets/files/SPARK.md` |
| SPARK 연구일지(R1~R23) | `research/spark-md/JOURNAL.md` |

## 7. 환경 메모 (이전 세션에서 확인)
- Playwright: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, `NODE_PATH=/opt/node22/lib/node_modules`, `require('/opt/node22/lib/node_modules/playwright')`. github.io 캡처 시 `ignoreHTTPSErrors:true` 필요(인증서 가로채기).
- 이 환경의 GitHub App은 **브랜치 push는 되지만 태그 push는 403**, **workflow 파일 추가도 권한 없음**. 배포는 클래식 GitHub Pages(main 루트 서빙)에 직접 커밋.
- 작업 브랜치: `claude/yuki-wi-xKZcl`. docs/curriculum 라이브 반영은 main에 직접 커밋해 옴.
