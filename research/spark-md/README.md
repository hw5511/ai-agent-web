# SPARK.md 개선 연구 (격리 연구 공간)

SPARK.md(우희표 커스텀 시스템 프롬프트)를 **버전을 올려가며 격리 실험**으로 검증하고,
그 과정을 연구일지(`JOURNAL.md`)에 누적 기록하는 공간이다.

## ★ 표준 생성 워크플로 (R19 확정 — 앞으로 이걸로 굳힘)

연구 라운드의 생성은 **`harness/run-v7-fast.sh`** 로 한다. 비싼 모델 자가검증을 3단계로 분해해
**품질 유지(perfcheck 0 FAIL) + 생성 시간 ~10분(R17 39.8분→-75%)** 을 동시에 잡은 파이프라인이다.

1. **생성** — `--effort low`(사고 1패스) + `--disallowedTools Bash`(쉘 자가검증 에이전트 루프 차단).
   `--effort max/high`는 사고 예산이 과대해 작성 전 타임아웃/지연(R19 실측) → **쓰지 않는다.**
2. **검사** — `harness/perfcheck.sh`(공짜·ms)가 성능(THE LAW/TRAP) + 마감(em-dash 주석제외·이모지·끊긴 링크)을 정적 적발.
3. **교정** — FAIL이면 같은 `session_id`를 `--resume`(`FIX_EFFORT=low`, **stream-json 필수**)해 적발 항목만 1턴(~10초) 수정. 재생성 안 함.

```bash
research/spark-md/harness/run-v7-fast.sh R20_<주제> \
  book:case1_bookstore.txt  fest:case2_festival.txt  dine:case4_dining.txt
# 인자: <라운드ID> <name>:<prompts/파일명> ...  (하네스가 SEED CARD를 무작위 강제배정)
# 조절: GEN_EFFORT(기본 low, high까지 안전·max 금지) / FIX_EFFORT(기본 low) / MAXPAR(기본 5)
```
- 결과물: `/tmp/spark-lab/<라운드ID>/<name>/{index.html,styles.css,script.js}`, 요약은 `_seeds.log`(시간·교정여부·perfcheck·배정시드).
- 근거·실측: `JOURNAL.md` Round 18~19. 라이브 예시: `demo/spark-research/v7-fast/`.
- (구버전 `run.sh`/`run-v4~v6` 등은 이력 보존용. 신규 라운드는 `run-v7-fast.sh` 사용.)

---

## 목적
- 동일 프롬프트로 **기본(맨손) / SPARK v1 / SPARK v2 변형들**을 생성해 결과 품질을 비교한다.
- "SPARK.md가 실제로 어디서 효과를 내고 어디가 비는지"를 근거(점수표/스크린샷)로 남긴다.
- 검증에서 우위가 확인된 버전만 정식 `curriculum/_assets/files/SPARK.md`에 반영한다.

## 격리 원칙
- 실제 `claude -p` 생성은 **레포 밖 격리 경로(`/tmp/spark-lab/...`)** 에서 수행한다. (유키 페르소나/라이브 자료로부터 격리)
- 레포에는 **재현 가능한 산출물만** 남긴다: 버전 초안 · 프롬프트 · 하네스 스크립트 · 점수표 · 스크린샷 · 일지.
- 생성된 원본 HTML 자체는 커밋하지 않는다(용량/노이즈). 필요한 경우 스크린샷과 요약으로 대체한다.

## ★ 실행 방침 — 병렬 격리 생성
- 한 라운드의 variant/케이스는 **격리 폴더가 독립**이므로 **병렬로 동시 생성**한다(`run-v7-fast.sh`가 내장, 동시상한 `MAXPAR` 기본 5).
- 순차 실행 금지(시간 낭비). 2개면 ~절반, 5개면 ~1/5로 단축.

## ★ 산출물 공유 방침 (항상 라이브 링크)
- **연구 라운드에서 결과물이 나오면 항상 GitHub Pages 라이브 랜딩 링크로 제공한다.** (스크린샷만으로 끝내지 않음)
- 배포 위치: `demo/spark-research/<라운드/주제>/`, 비교 랜딩 `index.html` 동봉. main 머지 시 Pages 자동 배포.
- 이유: 샌드박스 스크린샷은 외부 CDN(폰트·GSAP·캔버스)이 막혀 모션·인터랙션이 안 보임 → 실제 체감은 라이브에서만 가능.
- 기존 배포 허브: `/ai-agent-web/demo/spark-research/` (v2/v3 · v4 · creativity · 이후 버전 추가).

## 구조
```
research/spark-md/
├── README.md            이 문서
├── JOURNAL.md           연구일지 (라운드별 기록 — 상단에 현재상태 TL;DR)
├── versions/            현역 SPARK.md 버전
│   ├── v1.md            베이스라인 스냅샷 (최초 SPARK.md)
│   └── v7-lean.md       ★ 현행 (외부 SEED 강제배정 + 단일 성능원리 + lean)
├── prompts/             실험용 프롬프트 (주제별: case1~5, nocturne, observatory, mokza, plain)
├── harness/
│   ├── run-v7-fast.sh   ★ 표준 러너 (low 생성 + perfcheck + resume 교정)
│   └── perfcheck.sh     정적 검사기 (성능 THE LAW/TRAP + 마감 em-dash/이모지/링크)
├── experiments/         R{n}_<주제>/scorecard.md (라이브 링크 있는 라운드는 PNG 대신 링크)
└── archive/             이력 보존 (구 버전·구 러너·구 리포트) — 재현용, 신규 작업엔 미사용
```

## 실험 실행
표준 워크플로(상단 "★ 표준 생성 워크플로" 참조)로 실행한다:
```bash
research/spark-md/harness/run-v7-fast.sh R20_<주제> \
  book:case1_bookstore.txt  fest:case2_festival.txt
```
- 인자: `<라운드ID> <name>:<prompts/파일명> ...` (하네스가 SEED CARD 무작위 강제배정)
- 결과물: `/tmp/spark-lab/<라운드ID>/<name>/{index.html,styles.css,script.js}` + `_seeds.log`.
- 채점 요약은 `experiments/<라운드ID>/scorecard.md`, 결과물은 `demo/spark-research/`에 라이브 배포.

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
