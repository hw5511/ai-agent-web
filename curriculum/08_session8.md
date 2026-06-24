# Session 8 — React로 내 포트폴리오 만들기 (Part 1 클라이맥스)

## 회차 개요

- **시간**: 2시간
- **트랙**: Basic / Part 1 (마무리)
- **1개념**: **컴포넌트로 내 포트폴리오를 만들고 인터넷에 띄운다**
- **목표**: React·MUI 개념을 이해하고, 통합 프롬프트(CLAUDE.md)를 세팅한 뒤 MUI 기반 포트폴리오 사이트를 만들어 GitHub Pages에 배포한다.
- **누적 위치**: **Part 1 클라이맥스**. "React로 만든 내 포트폴리오가 인터넷에 살아있다"는 첫 경험.
- **회차 끝 학생 상태**: GitHub Pages에 배포된 React + MUI 포트폴리오 (공개 URL 보유)

---

## 슬라이드 13장

| # | 파일 | 유형 | goal |
|---|------|------|------|
| 01 | `01_표지_React_포트폴리오.svg` | 표지 | Part 1 클라이맥스 선언, 오늘 React 포트폴리오 만든다 |
| 02 | `02_오늘의_목표.svg` | 학습목표 | React 개념 → UI 라이브러리 → 통합 프롬프트 → 만들기 → 배포 |
| 03 | `03_React가_뭔가.svg` | 개념 | 컴포넌트 = 레고 블록. JSX = HTML처럼 생긴 JS |
| 04 | `04_React_UI_라이브러리.svg` | 개념 | MUI·shadcn/ui·Chakra UI — "이미 만들어진 레고" |
| 05 | `05_우리_스택_MUI.svg` | 개념 | MUI 선택 이유 + vibe-web 실제 사례 |
| 06 | `06_통합_프롬프트_세팅.svg` | 실습 | CLAUDE.md + design-system.md + new_project.md 세팅 |
| 07 | `07_실습A_프로젝트_세팅.svg` | 실습 | "portfolio 프로젝트 세팅해줘" |
| 08 | `08_포트폴리오_구조.svg` | 개념 | Hero / About / Projects / Contact 섹션 설계 |
| 09 | `09_실습B_포트폴리오_만들기.svg` | 실습 | 프롬프트 한 줄로 전체 구조 생성 |
| 10 | `10_실습B_섹션_채우기.svg` | 실습 | 내 정보로 채우기 (이름·소개·프로젝트) |
| 11 | `11_GitHub_보관함.svg` | 개념 | GitHub = 내 작품 온라인 창고 |
| 12 | `12_GitHub_Pages_배포.svg` | 실습 | "배포해줘" → GitHub Actions → 공개 URL |
| 13 | `13_공개_회고_예고.svg` | 정리 | URL 공유 + Part 1 회고 + Part 2 예고 |

### 슬라이드별 topics

- **03 React가 뭔가**:
  - 1~7주 방식: HTML/CSS/JS 한 파일에 다 넣기
  - React 방식: **컴포넌트**로 쪼개서 조립
  - 컴포넌트 = 재사용 가능한 UI 조각 (Hero, Card, Button…)
  - JSX = HTML처럼 생겼지만 JS 파일 안에서 쓴다
  - "직접 코드 안 써도 됨 — Claude가 다 짜줌. 컴포넌트 = 레고 블록만 기억"

- **04 React UI 라이브러리**:
  - UI 라이브러리 = 이미 만들어진 컴포넌트 세트 ("이미 만들어진 레고")
  - **MUI (Material UI)**: Google Material Design 기반. 완성도 높음. 대기업 프로덕트 느낌. ⭐ 오늘 선택
  - **shadcn/ui**: 코드 복사 방식. 커스터마이징 자유도 최고. 최신 트렌드
  - **Chakra UI**: 심플·초보자 친화·가독성 좋음

- **05 우리 스택 MUI**:
  - vibe-web = 이 강의 웹앱. React + Vite + MUI로 만들어 배포 중 (실제 사례)
  - 오늘 포트폴리오도 같은 스택
  - Vite = 빠른 개발 서버 (`npm run dev` 즉시 뜸)

- **06 통합 프롬프트 세팅**:
  - `curriculum/_assets/files/step08/` 의 파일 3개를 새 작업 폴더에 복사
  - `CLAUDE.md`: Claude 역할(로키) + MUI 규칙 + 배포 방침
  - `design-system.md`: MUI Grid·Typography·반응형 패턴
  - `new_project.md`: 프로젝트 세팅 가이드 (백업 템플릿 방식)
  - "3개 파일 넣고 Claude Code 열면 Claude가 MUI 방식으로 알아서 만들어줌"

- **07 실습 A: 프로젝트 세팅**:
  - 프롬프트: `portfolio 라는 이름으로 새로운 프로젝트 세팅해줘`
  - Claude가 `new_project.md` 대로 Vite + React + MUI 설치

- **08 포트폴리오 구조**:
  - **Hero**: 이름 + 한 줄 소개 + CTA 버튼 (첫인상)
  - **About**: 내 소개 2~3문장 (나는 누구)
  - **Projects**: 카드 3개 (내가 만든 것들)
  - **Contact**: 이메일·GitHub·링크

- **09 실습 B: 포트폴리오 만들기**:
  - 프롬프트: `MUI로 포트폴리오 사이트 만들어줘. Hero(이름·한 줄 소개·버튼), About 섹션, Projects 카드 3개, Contact 섹션으로 구성해줘.`

- **10 실습 B: 내 정보로 채우기**:
  - 프롬프트: `Hero 이름은 [본인이름], 소개는 [한 줄 소개]로 바꿔줘. Projects 카드는 [프로젝트1], [프로젝트2], [프로젝트3]으로 채워줘.`

- **11 GitHub 보관함**:
  - "사라지지 않음 / 이력 관리 / 공유 가능"
  - git 명령어 X — 개념만

- **12 GitHub Pages 배포**:
  - 프롬프트: `이 포트폴리오를 GitHub에 올리고 GitHub Pages로 배포해줘. 레포 이름은 portfolio.`
  - Claude가 CLAUDE.md 배포 규칙 읽고 GitHub Actions 워크플로우 자동 생성
  - 배포 URL: `https://내아이디.github.io/portfolio`

- **13 공개 + 회고 + 예고**:
  - 단톡방 URL 공유 타임 충분히
  - Part 1 회고: HTML·CSS·JS·라이브러리·React 8주
  - Part 2 예고: API·DB·회원·도메인·결제

### 실습 프롬프트

| 실습 | 프롬프트 |
|------|---------|
| A 세팅 | `portfolio 라는 이름으로 새로운 프로젝트 세팅해줘` |
| B 뼈대 | `MUI로 포트폴리오 사이트 만들어줘. Hero(이름·한 줄 소개·버튼), About 섹션, Projects 카드 3개, Contact 섹션으로 구성해줘.` |
| B 채우기 | `Hero 이름은 [본인이름], 소개는 [한 줄 소개]로 바꿔줘. Projects 카드는 [프로젝트1], [프로젝트2], [프로젝트3]으로 채워줘.` |
| 배포 | `이 포트폴리오를 GitHub에 올리고 GitHub Pages로 배포해줘. 레포 이름은 portfolio.` |

---

## 제공 에셋 (학생에게 제공)

- **통합 프롬프트 3파일**: `curriculum/_assets/files/step08/`
  - `CLAUDE.md` — Claude 역할·MUI 규칙·배포 방침 (vibe-web 기반)
  - `design-system.md` — MUI Grid·반응형·중앙정렬 패턴
  - `new_project.md` — 프로젝트 세팅 가이드

---

## 사전 과제 (학생)

- GitHub 계정 보유
- Node.js 설치 확인

---

## 구조 평가·개선 메모

- React zero 학생 기준 점프가 크니 "컴포넌트 = 레고 블록" 비유에 집중. 코드는 Claude가 다 짜줌.
- MUI 선택 이유: vibe-web이 실제 MUI 사례라 강사가 레퍼런스 직접 보여주기 쉬움.
- 배포 클라이맥스 보존: React로 만들어도 "내 사이트가 인터넷에 살아있다" 감동 유지.
- shadcn/ui·Chakra 소개는 "이런 것도 있다" 수준으로만. 오늘 만드는 건 MUI.
