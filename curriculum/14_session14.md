# Session 14 — Vercel — DB·API 연동 환경 만들기

## 회차 개요

- **시간**: 2시간
- **트랙**: 심화 / Part 2
- **1개념**: **Vercel 환경으로 옮기기**
- **목표**: GitHub Pages → Vercel로 마이그레이션하고 Vercel 함수·환경변수로 "API 키 안전하게 숨기는 환경"을 만든다.
- **누적 위치**: 13주(내 도메인) + 14주(Vercel 환경) = 15주 AI 기능·16주 결제의 베이스.
- **회차 끝 학생 상태**: Vercel에 도메인 연결된 사이트 + API 키 안전하게 숨겨진 상태

---

## 슬라이드 8장

| # | 파일 | 유형 | goal |
|---|------|------|------|
| 01 | `01_오늘의_목표.svg` | 인트로 | 14회차 목표(Vercel 환경 만들기) |
| 02 | `02_GitHub_Pages_한계.svg` | 개념 | 정적만 가능 / API 키 숨길 곳 없음 |
| 03 | `03_Vercel이란.svg` | 개념 | GitHub 푸시 → 자동 배포 + 함수 + 환경변수 |
| 04 | `04_실습1_Vercel_연결.svg` | 실습 | vercel.com 가입 → GitHub 연동 → 첫 배포 |
| 05 | `05_Vercel_함수란.svg` | 개념 | "Vercel에서 도는 함수" / 한 파일이 한 API |
| 06 | `06_실습2_첫_함수.svg` | 실습 | api/hello.js 만들어서 호출 |
| 07 | `07_실습3_환경변수_+_도메인.svg` | 실습 | API 키를 환경변수에 저장 / 13주 도메인을 Vercel로 이전 |
| 08 | `08_정리.svg` | 정리 | "이제 진짜 키 숨길 수 있다" + 다음 주 AI 기능 예고 |

### 슬라이드별 topics

- **02 GitHub Pages 한계**: 정적 파일만 / JS 코드는 다 노출 / API 키 박으면 누구나 훔침
- **03 Vercel**: GitHub 자동 연동 / 푸시할 때마다 배포 / Vercel 함수 = "API 키 안전한 곳" / Hobby 무료
- **04 Vercel 연결**: vercel.com Github 로그인 / 레포 import / 30초만에 첫 배포 URL
- **05 함수**: api/ 폴더 / 한 파일 = 한 주소 / 서버에서 도니까 키 노출 X
- **06 첫 함수**: api/hello.js 작성 / fetch('/api/hello')로 호출 / 결과 화면 표시
- **07 환경변수**: Vercel 대시보드 Settings → Environment Variables / process.env.MY_KEY / 코드에 박지 말기 / 13주 도메인을 Vercel에 추가

### 실습 프롬프트

| 실습 | 프롬프트 |
|------|---------|
| 04 Vercel 연결 | (학생 직접 진행) — vercel.com 가입 → 내 GitHub 레포 import → Deploy |
| 06 첫 함수 | api/hello.js 파일을 만들어서 "안녕하세요 [이름]" 응답하는 Vercel 함수 작성하고, 페이지에서 fetch로 호출해줘. |
| 07 환경변수 | Vercel 환경변수에 OPENWEATHER_KEY 추가했어. api/weather.js 함수를 만들어서 그 키로 날씨 조회해줘. 클라이언트엔 키 노출 X. |

---

## 사용 에셋·라이브러리·CDN

- **슬라이드 에셋**: `assets/basic/step14/`
- **외부 서비스**: Vercel (Hobby 무료)

---

## 표현 가이드 ⚠️

- "백엔드" 금지 → **"Vercel 함수" / "Vercel을 활용한 API 연동"**
- "서버리스" 가능 (필요 시 "Vercel이 알아서 도는 함수"로 풀이)
- "API 라우트" 금지 → "Vercel 함수 주소"
- "프로덕션 배포" 금지 → "진짜 사이트로 배포"

---

## 구조 평가·개선 메모

_TBD_
