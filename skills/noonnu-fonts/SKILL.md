---
name: noonnu-fonts
description: 눈누(noonnu.cc) 상업용 무료 한글 폰트를 검색·비교(대조표 이미지)·웹폰트(@font-face) 추출·샘플 렌더하는 CLI 스킬. 무료 한글 폰트가 필요할 때(디자인·웹 작업) 호출. 약 1,120종 카탈로그 캐시 내장 — 캐시 우선 + 라이브 폴백. Use when you need a free commercial-use Korean font and its webfont CSS.
compatibility: Node 필요. 조회(search/category/info/webfont)는 캐시만 있으면 됨. build-cache/sample/contact/--live 는 Playwright(헤드리스 크로미움) 필요. 인터넷(갱신·라이브 시).
metadata:
  author: hw5511
  version: "1.0"
allowed-tools: Bash Read
---

# /noonnu-fonts — 눈누 무료 한글 폰트 CLI

눈누(noonnu.cc)의 **상업용 무료 한글 폰트**(약 1,120종)를 검색하고, 후보를 한눈에 비교하고, **그대로 붙여 넣는 웹폰트 @font-face CSS**와 분위기 확인용 **샘플 PNG**를 가져온다. 카탈로그가 `data/noonnu-fonts.json`에 캐시돼 있어 검색·웹폰트 추출은 네트워크 없이 즉시 동작한다.

## 명령
```bash
node scripts/noonnu.cjs search 손글씨            # 폰트/제작자 검색 (--limit N, --json)
node scripts/noonnu.cjs category 명조            # 형태별(고딕·명조(=바탕)·손글씨·장식·픽셀)
node scripts/noonnu.cjs contact --category 명조 --limit 8 --text "샘플 문구" --out cmp.png  # 후보 대조표 PNG
node scripts/noonnu.cjs info 694                 # 형태·라이선스·허용범위·굵기
node scripts/noonnu.cjs webfont 프리텐다드        # @font-face CSS(전체 굵기) → CSS에 그대로 삽입
node scripts/noonnu.cjs sample 694 --text "샘플" --out s.png   # 단일 폰트 렌더
node scripts/noonnu.cjs build-cache [--incremental]            # 카탈로그 갱신(신규 폰트)
```
- 폰트 식별: 숫자 = 폰트 id, 그 외 = 이름(부분일치/검색 첫 결과). 모든 명령에 `--json`.

## 폰트 고르는 법 (중요)
**텍스트 메타만 보고 고르지 마라** — 인기 폰트(마루부리·프리텐다드)로 쏠린다. 다음 순서로:
1. `category`/`search` 로 후보를 좁힌다.
2. `contact` 로 후보 6~8개를 한 장의 대조표 PNG로 렌더한 뒤 **그 이미지를 Read로 직접 보고** 글자 생김새가 작업 분위기와 맞는 것을 셀렉한다.
3. `info` 로 **허용 범위**(인쇄/웹/영상/임베딩/BI 등)를 확인한다. "무료"라도 용도 제한이 폰트마다 다르고 글꼴 단독 판매는 대개 금지.
4. `webfont` 로 @font-face CSS를 받아 `styles.css` 상단(또는 MUI 테마)에 그대로 삽입하고, 출력의 `font-family` 토큰을 사용한다. jsDelivr CDN이라 `<link>` 불필요.

## 캐시 & 갱신
- `data/noonnu-fonts.json` = 눈누 무료 폰트 목록 전체(크롤 시점 `total_count`, 라이선스·허용범위·전체 굵기 @font-face 포함).
- 새 폰트가 추가됐으면 `node scripts/noonnu.cjs build-cache --incremental`(신규만 크롤·병합, 없으면 즉시 종료). 전체 재크롤은 `build-cache`(~25분).

## 의존성
- 조회(search/category/info/webfont)는 **Node만** 있으면 캐시로 동작.
- `build-cache`/`sample`/`contact`/`--live` 는 Playwright: `npm install playwright && npx playwright install chromium`.
- Playwright APIRequestContext(ignoreHTTPSErrors)를 써서 인증서 가로채기(프록시) 환경에서도 동작.
