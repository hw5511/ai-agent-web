# SPARK.md 개선 연구 — v3 최종 리포트

작성 2026-06-03 · 격리 실증실험(claude -p, sonnet) + skills.sh 지식조사 종합

## 1. 결론
**v3(멀티파일·무제한 + 디자인 강화)까지 검증 완료.** v2-final의 검증된 강점을 그대로 승계하면서 단일 파일 글자수 천장을 제거해, 더 크고 정교한 멀티섹션 랜딩/브랜드 사이트를 커버한다.
- **권장 사용**: 단순 단일 페이지 = **v2-final**, 규모 있는 멀티섹션 사이트 = **v3**.
- 범위는 의도대로 **랜딩/브랜드/포트폴리오 사이트**에 한정(SaaS 앱 UI 아님).

## 2. 버전 진화 한 줄 요약
| 버전 | 추가 | 검증 |
|------|------|------|
| v1 | (현행) 미감·모션·폰트·이모지금지·LIGHTBULB | R1: 맨손 압도 |
| v2-core | 접근성 게이트·타이포 마감·fonts.json | R2/R3: 게이트 통과(단 reduced-motion 버그) |
| v2-full | CONFIG DIALS·규칙분기·seeded배경 | R3: 다이얼 분기 작동 |
| **v2-final** | reduced-motion 가시복원·텍스트 PE·정량게이트·디자이너 우위 | R4: 버그 해결·em-dash 0 |
| **v3** | 멀티파일(무제한)·디자인 강화 | R5: 분리·링크 정합·확장성·디자인 |

## 3. v3 핵심 변경
- **멀티파일 구조**: `index.html`/`styles.css`/`script.js` 분리·링크, 라인 상한 해제, 링크 정합성 = FAIL 게이트.
- **디자인 강화**: 60/30/10 색비율·Color Lock, 타입스케일 1.25/1.333·본문 16~18px, harsh shadow 대신 이중 베젤, 비대칭 우선, "의도를 announce 하지 말 것", 사후 미감 변환(distill/quieter/bolder).
- **승계**: v2-final의 접근성 floor·reduced-motion·텍스트 PE·정량 게이트·디자이너 우위 전부 유지.

## 4. R5 검증 (NOCTURNE)
- v3 = index.html 439L + styles.css 1376L + script.js 418L, **깨진 링크 0**, styles.css 적용 렌더 확인.
- v2-final = 단일 1283L(옛 1500 상한 근접) → v3는 상한 없이 확장.
- reduced-motion h1 정상, 비대칭 분할 헤드라인 "NOC/TURNE"로 디자인 강화 반영.

## 5. 산출물 위치
- 버전: `research/spark-md/versions/{v1,v2-core,v2-full,v2-final,v3}.md`
- 실험: `research/spark-md/experiments/R1~R5/` (scorecard + 스크린샷)
- 일지: `research/spark-md/JOURNAL.md` / 리포트: `FINAL_REPORT_v2.md`, `FINAL_REPORT_v3.md`
- 외부 지식: `research/skills-sh/` (sweep 1·2, 신규 지식 25건)

## 6. 정식 반영 제안 (CEO 확인 필요 — 미반영 상태)
- 라이브 `curriculum/_assets/files/SPARK.md`는 현재 v1. 교체는 **CEO 승인 후**.
- 옵션 A: 단일 파일 유지가 중요하면 → v2-final로 교체.
- 옵션 B: 규모 확장을 본격 채택 → v3로 교체(단, 커리큘럼/데모가 "단일 index.html" 전제인 부분 동반 점검 필요).
- 어느 쪽이든 LIGHTBULB URL·fonts.json 동기화 유지 확인.

## 7. 후속 과제 (v4 후보)
- 더 큰 사이트·다주제 반복 검증, 인트로 과지연 가드.
- 디자인 추가 수확(Double-Bezel 코드 토큰, distill/quieter/bolder를 별도 "리파인 패스" 스킬화).
- 비-시각축(로드 성능 예산·SEO/JSON-LD·전환 카피·CRO)은 SPARK 본문이 아닌 **별도 보조 체크리스트**로 분리 검토.
