# Round 5 채점표 — NOCTURNE 향수 브랜드 (v2-final 단일 vs v3 멀티파일)

프롬프트 `nocturne.txt`(멀티섹션) · sonnet · `/tmp/spark-lab/R5_nocturne`

## 산출물 구조
| | v2-final (단일) | v3 (멀티파일) |
|--|----------------|---------------|
| index.html | 1283L / 40.8KB (인라인 CSS·JS) | 439L / 22KB (마크업만) |
| styles.css | — | **1376L / 28.6KB** |
| script.js | — | **418L / 15.4KB** |
| 총량 | 40.8KB | **~66KB (3파일)** |
| 링크 정합성 | n/a | **styles.css ✅ / script.js ✅ (깨진 링크 0)** |

## 검증 결과
- **v3 멀티파일 성공**: index.html이 마크업만 담고 styles.css·script.js를 분리·링크. **링크 전부 정합**(로컬 파일 요청 실패 0). styles.css가 실제 적용됨(렌더 배경 oklch 다크 확인).
- **글자수 천장 제거 효과**: v2-final은 단일 1283L로 옛 1500L 상한에 근접(멀티섹션이 더 커지면 압박). v3는 분리로 **상한 없이 확장** + 가독성 유지.
- **reduced-motion 안전 유지**: v3 reduced-motion h1=9자(헤드라인 정상). v2-final의 floor 규칙이 v3에도 승계됨.
- **디자인 품질(아트 디렉션)**: 둘 다 강함.
  - v2-final: "Noc"+이탤릭 골드 "turne" 2톤 세리프, 중앙 좌측.
  - v3: **비대칭 분할 거대 헤드라인 "NOC / TURNE"**(좌우 분리 배치) — 중앙정렬 탈피, 디자인 강화 디테일 반영.
- 환경 주의: 헤드리스 브라우저 외부망 차단으로 Google Fonts·GSAP·Lenis·이미지 CDN은 양쪽 모두 미로드(폰트/모션/이미지 미표시) — **v3 결함 아님**. 로컬 css/js는 정상.

스크린샷: `v2-final_single.png`, `v3_normal.png`, `v3_reducedmotion_OK.png`

## 판정
- **v3의 멀티파일·무제한 구조가 의도대로 작동.** 분리·링크 정합·확장성·디자인 강화 모두 확인.
- v2-final의 검증된 강점(접근성 floor·reduced-motion·정량 게이트·디자이너 우위)을 **그대로 승계**하면서 규모 천장만 제거.
- 한계: 단일 라운드(주제 1개). 더 큰 사이트/다주제 반복은 후속 과제.
