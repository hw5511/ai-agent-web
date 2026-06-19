# SPARK 스킬

웹 디자인 작업에서 결과물이 평범·클리셰에 빠지지 않도록, 랜덤 영감 씨드와 모험적 디자인 원칙·60fps 성능 규칙을 주입하는 Claude Code Agent Skill. 더불어 **눈누(noonnu.cc) 상업용 무료 한글 폰트**를 검색·비교·적용하는 CLI를 포함한다.

## 구조
```
spark/
├── SKILL.md                      # 스킬 본문(워크플로·규칙). /spark 로 호출
├── references/
│   └── lightbulb.md              # 120 ideas + 30 pinches + 10 fonts 씨드 데이터
├── scripts/
│   ├── pick.py                   # 4축 씨드 무작위 추출(셸 RNG 강제배정)
│   ├── forced_connection.py      # "더 모험적" 요청 시: 무관 명사 RNG → 강제연결 중심은유
│   └── noonnu.cjs                # 눈누 무료폰트 CLI (검색·대조표·웹폰트·샘플)
└── data/
    └── noonnu-fonts.json         # 눈누 무료폰트 카탈로그 캐시(약 1,120종)
```

## 설치
스킬 디렉토리를 아래 둘 중 한 곳에 복사한다.

- **전역(모든 프로젝트)**: `~/.claude/skills/spark/`
- **프로젝트 한정**: `<repo>/.claude/skills/spark/`

```bash
# 예: 전역 설치
cp -r skills/spark ~/.claude/skills/
ls ~/.claude/skills/spark/SKILL.md   # 확인
```
설치 후 Claude Code에서 `/spark` 로 호출(또는 `/skills` 로 목록 확인). description 매칭 시 자동 발동도 된다.

## 의존성 (스킬은 의존성을 자동 설치하지 않는다)
| 기능 | 필요 |
|---|---|
| 씨드 추출(pick.py / forced_connection.py) | `python3` |
| 눈누 조회(search/category/info/webfont) — **캐시 있으면** | `node` 만 |
| 눈누 `build-cache` / `sample` / `contact` / `--live` | `node` + Playwright(헤드리스 크로미움) |

```bash
# Playwright (눈누 캐시 생성·샘플 렌더·대조표에 필요)
npm install playwright && npx playwright install chromium
```
> `data/noonnu-fonts.json` 캐시가 동봉돼 있으면 검색·웹폰트·샘플은 **네트워크/Playwright 없이** 동작한다(샘플 렌더만 Playwright 필요).

## 사용
1. **기본**: `/spark` → `pick.py` 가 4축 씨드(LAYOUT/INTERACTION/VISUAL/PINCH)를 셸 RNG로 강제 배정 → 선언 후 생성.
2. **더 모험적으로**: 사용자가 "더 과감/뻔하지 않게"를 요청하면 `forced_connection.py` 로 무관 명사를 뽑아 **강제연결 중심 은유(CENTER_METAPHOR)** 를 만들고 도메인 1차 연상을 자가 금지한다.
3. **폰트**: 텍스트 메타만 보고 고르지 말 것. `noonnu.cjs contact` 로 후보 대조표 PNG를 만들어 **글자 생김새를 보고 셀렉**한 뒤 `webfont` CSS를 styles.css에 삽입.

```bash
cd ~/.claude/skills/spark
node scripts/noonnu.cjs category 명조 --limit 12
node scripts/noonnu.cjs contact --category 명조 --limit 8 --text "GROOVE 회현" --out cmp.png
node scripts/noonnu.cjs info 694
node scripts/noonnu.cjs webfont 694
```

## 눈누 폰트 캐시 — 범위와 업데이트
- **범위**: `data/noonnu-fonts.json` 은 눈누 **무료 폰트 목록 전체**(크롤 시점 `total_count` = 약 1,120종, 유료/마켓 폰트 제외)를 담는다. 각 폰트의 이름·제작자·형태·**라이선스·허용범위표**·전체 굵기 @font-face CSS 포함.
- **주의**: "무료"라도 허용 범위(인쇄/웹/영상/임베딩/BI 등)는 폰트마다 다르다. 사용 전 `info` 의 허용 범위를 확인할 것. 글꼴 단독 판매는 대개 금지.
- **새 폰트가 추가됐을 때 갱신**:
  ```bash
  node scripts/noonnu.cjs build-cache --incremental   # 권장: 라이브 목록과 비교해 신규 폰트만 크롤·병합(수 분)
  node scripts/noonnu.cjs build-cache                 # 전체 재크롤(~25분) — 기존 폰트 메타까지 최신화하고 싶을 때
  ```
  `--incremental` 은 목록만 먼저 비교해 신규가 없으면 즉시 종료(캐시 보존)한다. 폰트 목록은 자주 바뀌지 않으므로 가끔 `--incremental` 로 확인하면 충분하다. 갱신 후 `data/noonnu-fonts.json` 을 커밋해 두면 팀이 공유한다. (완전 자동화는 cron/CI에서 위 명령을 주기 실행하면 된다.)
