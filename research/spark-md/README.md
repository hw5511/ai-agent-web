# SPARK.md 개선 연구 (격리 연구 공간)

SPARK.md(우희표 커스텀 시스템 프롬프트)를 **버전을 올려가며 격리 실험**으로 검증하고,
그 과정을 연구일지(`JOURNAL.md`)에 누적 기록하는 공간이다.

## 목적
- 동일 프롬프트로 **기본(맨손) / SPARK v1 / SPARK v2 변형들**을 생성해 결과 품질을 비교한다.
- "SPARK.md가 실제로 어디서 효과를 내고 어디가 비는지"를 근거(점수표/스크린샷)로 남긴다.
- 검증에서 우위가 확인된 버전만 정식 `curriculum/_assets/files/SPARK.md`에 반영한다.

## 격리 원칙
- 실제 `claude -p` 생성은 **레포 밖 격리 경로(`/tmp/spark-lab/...`)** 에서 수행한다. (유키 페르소나/라이브 자료로부터 격리)
- 레포에는 **재현 가능한 산출물만** 남긴다: 버전 초안 · 프롬프트 · 하네스 스크립트 · 점수표 · 스크린샷 · 일지.
- 생성된 원본 HTML 자체는 커밋하지 않는다(용량/노이즈). 필요한 경우 스크린샷과 요약으로 대체한다.

## ★ 산출물 공유 방침 (항상 라이브 링크)
- **연구 라운드에서 결과물이 나오면 항상 GitHub Pages 라이브 랜딩 링크로 제공한다.** (스크린샷만으로 끝내지 않음)
- 배포 위치: `demo/spark-research/<라운드/주제>/`, 비교 랜딩 `index.html` 동봉. main 머지 시 Pages 자동 배포.
- 이유: 샌드박스 스크린샷은 외부 CDN(폰트·GSAP·캔버스)이 막혀 모션·인터랙션이 안 보임 → 실제 체감은 라이브에서만 가능.
- 기존 배포 허브: `/ai-agent-web/demo/spark-research/` (v2/v3 · v4 · creativity · 이후 버전 추가).

## 구조
```
research/spark-md/
├── README.md            이 문서
├── JOURNAL.md           연구일지 (라운드별 기록 — 최신이 위로)
├── versions/            SPARK.md 후보 버전들
│   ├── v1.md            (현행 SPARK.md 스냅샷)
│   ├── v2-core.md       (핵심 3~4개 개선본)
│   └── v2-full.md       (매트릭스 전체 반영본)
├── prompts/             실험용 프롬프트 (주제별)
├── harness/
│   └── run.sh           격리 러너 (레포 버전 → /tmp 랩 구성 → claude -p)
└── experiments/
    └── R{n}_<주제>/     라운드별 결과 (scorecard.md, *.png)
```

## 실험 실행
```bash
research/spark-md/harness/run.sh R1_mokza research/spark-md/prompts/mokza.txt \
  base:none \
  v1:curriculum/_assets/files/SPARK.md \
  v2-core:research/spark-md/versions/v2-core.md
```
- 인자: `<라운드ID> <프롬프트파일> <variant>:<CLAUDE.md경로|none> ...`
- 결과물은 `/tmp/spark-lab/<라운드ID>/<variant>/index.html` 에 생성된다.
- 채점/스크린샷은 `experiments/<라운드ID>/` 에 정리한다.

## 채점 기준 (SPARK 준수도 + 품질)
| 항목 | 설명 |
|------|------|
| NO_EMOJI | 이모지 0개 (1개라도 있으면 FAIL) |
| FONT_RULE | 한글 폰트 weight 규칙 준수 (poor/medium에 700+ 금지) |
| SURPRISE | 방문자를 놀라게 할 기술 요소 1개 이상 |
| A11Y | aria-label / focus-visible / prefers-reduced-motion / 시맨틱 |
| MOTION_PERF | transform·opacity만 / transition:all 금지 / reduced-motion |
| TYPO_FINISH | …·곡선따옴표·tabular-nums·text-wrap |
| JS_SCOPE | var 없음 / 변수 중복 없음 / scrollIntoView 없음 |
| LAYOUT | Hero-Section-Footer 공식 탈피 여부 |
| PREDICTABILITY | 1~10 (낮을수록 좋음) |
