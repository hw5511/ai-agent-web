# Session 8 — v12 메타 시스템 + GitHub Pages 배포 (1부 클라이맥스)

## 회차 개요

- **시간**: 2시간
- **트랙**: Basic / Part 1 (마무리)
- **1개념**: **인터넷에 내 사이트 띄우기**
- **목표**: 우리가 1~7주에 만들어 온 v12 시스템을 DESIGN.md·Claude Design과 비교해 메타 인식을 정리한 뒤, GitHub Pages에 배포해 공개 URL을 받는다.
- **누적 위치**: **Part 1 클라이맥스**. 학생이 "내 사이트가 인터넷에 살아있다"는 첫 경험.
- **회차 끝 학생 상태**: `hw5511.github.io/{본인이름}` 형태의 공개 URL을 가진 본인 랜딩페이지

---

## 슬라이드 8장

| # | 파일 | 유형 | goal |
|---|------|------|------|
| 01 | `01_오늘의_목표.svg` | 인트로 | 8회차 목표(메타 정리 + 배포) 안내 |
| 02 | `02_1주차_Claude_Design_다시.svg` | 회상 | 1주차에 본 Claude Design 결과물과 지금 내 페이지 비교 |
| 03 | `03_메타_3종_비교.svg` | 메타 | v12 vs DESIGN.md vs Claude Design = 같은 발상 |
| 04 | `04_실습1_v12로_재생성.svg` | 실습 | v12 프롬프트로 본인 작품 재생성 후 비교 |
| 05 | `05_git_기초_5분.svg` | 개념 | git이 뭔지·왜 필요한지 5분 압축 |
| 06 | `06_GitHub_CLI_+_Pages.svg` | 개념 | gh CLI로 레포 생성 + GitHub Pages 활성화 |
| 07 | `07_실습2_배포해줘.svg` | 실습 | "배포해줘" 한 마디로 GitHub Pages 링크 받기 |
| 08 | `08_내_사이트_공유_+_Part2_예고.svg` | 정리 | 본인 사이트 링크 서로 공유 + 다음 8주 예고 |

### 슬라이드별 topics

- **02 회상**: 1주차에 Claude Design으로 1시간 만든 결과물 / 7주 동안 직접 만든 페이지 / 차이는?
- **03 메타 3종**:
  - **v12** (우리 시스템): 3-SPARK + AESTHETIC_PINCH + FONT JUDGMENT
  - **DESIGN.md** (Google Labs Code): YAML 토큰 + MD 본문 + 8섹션
  - **Claude Design** (Anthropic): DESIGN.md 워크플로우 제품화
  - → 셋 다 "토큰화 + 표준화 + AI 협업"
- **04 v12 재생성**: 1~7주 결과물을 v12 프롬프트로 다시 / 1회차 결과물(만약 있다면)과 Before/After
- **05 git 5분**: 변경 이력 / 협업 / 백업 — 단 5분만 (학생 부담 X)
- **06 gh + Pages**: gh repo create / git push / Pages 설정 자동화
- **07 배포 실습**: GitHub 토큰 준비 (사전과제로 부여) / "배포해줘" 한 줄로 끝
- **08 공유**: 학생끼리 링크 공유 / 다음 8주는 데이터·도메인·결제

### 실습 프롬프트

| 실습 | 프롬프트 |
|------|---------|
| 04 v12 재생성 | [SPARK-1] 전면 다크 + 네온 / [SPARK-2] 마그네틱 CTA / [SPARK-3] 스크롤 페이드인 / [AESTHETIC_PINCH] noisy-gradient + cinematic-spacing / [FONT] Inter(헤드) + Noto Sans KR(본문) — 위 설정으로 내 페이지를 재생성해줘. |
| 07 배포 | 이 페이지를 GitHub 레포 만들고 GitHub Pages로 배포해줘. 레포 이름은 my-portfolio. |

---

## 사용 에셋·라이브러리·CDN

- **슬라이드 에셋**: `assets/basic/step08/`
- **외부 도구**: GitHub CLI (gh) / GitHub 클래식 토큰
- **시연 자료**: `_assets/claude_design_demo/sbs/` (1회차 자료 재활용)

---

## 사전 과제 (학생)

- GitHub 계정 + 클래식 토큰 발급 (1회차에 안내)

---

## 구조 평가·개선 메모

_TBD_
