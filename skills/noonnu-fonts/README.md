# noonnu-fonts 스킬

눈누(noonnu.cc) 상업용 무료 한글 폰트를 검색·비교·웹폰트 추출·샘플 렌더하는 Claude Code CLI 스킬. (SPARK 스킬에서 분리한 독립 배포본.)

## 구조
```
noonnu-fonts/
├── SKILL.md                 # 스킬 본문. /noonnu-fonts 로 호출
├── scripts/noonnu.cjs       # CLI (search·category·contact·info·webfont·sample·build-cache)
└── data/noonnu-fonts.json   # 무료 폰트 카탈로그 캐시 (약 1,120종)
```

## 설치
스킬 디렉토리를 둘 중 한 곳에 복사한다.
- 전역(모든 프로젝트): `~/.claude/skills/noonnu-fonts/`
- 프로젝트 한정: `<repo>/.claude/skills/noonnu-fonts/`

```bash
cp -r skills/noonnu-fonts ~/.claude/skills/
```
또는 Claude Code에게 자연어로: *"github.com/hw5511/ai-agent-web 의 skills/noonnu-fonts 를 내 ~/.claude/skills/ 에 설치해줘."*

## 의존성
- **조회(search/category/info/webfont)**: Node만 있으면 동봉 캐시로 즉시 동작.
- **build-cache / sample / contact / --live**: `npm install playwright && npx playwright install chromium`.

## 사용
`SKILL.md` 참조. 핵심: **`contact` 대조표 PNG를 Read로 보고 폰트를 셀렉** → `info`로 라이선스 확인 → `webfont`로 @font-face 삽입.

## 캐시 갱신
```bash
node scripts/noonnu.cjs build-cache --incremental   # 신규 폰트만(권장)
node scripts/noonnu.cjs build-cache                 # 전체 재크롤(~25분)
```
갱신 후 `data/noonnu-fonts.json`을 커밋하면 팀이 공유한다.
