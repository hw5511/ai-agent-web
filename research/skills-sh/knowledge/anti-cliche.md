# 안티-클리셰 / LLM 다양성 연구 (sweep 4, 2026-06-04)

문제: sonnet 웹 히어로가 계속 수렴(별자리→파동선→좌측 타이포). "금지로는 못 막는다"를 실험 확인.
조사: 일반 웹·오픈소스·논문에서 **검증된 클리셰 타파 기법**.

## ★ 두 가설 판정 (학술 근거)
- **가설① 외부 무작위 주입(LIGHTBULB식)** = 지지. 단 **결정적 결함**: 현재 LIGHTBULB는 4개 주입 후 *모델이 1개 선택(CHOSEN_SPARK)* → 그 선택이 무작위성을 도로 전형으로 붕괴. **선택권을 외부 스크립트로 옮겨 강제 배정해야** 작동. (효과크기 중간: 엔트로피 5~10%)
- **가설② 린(규칙 덜어내기)** = 강하게 지지. 부정 지시 역효과 + 프롬프트 블로트 + 키워드 수프 역효과 모두 일치.

## 핵심 기법 (강→약)

### 1. Iterative Differentiation — 실험 1위 (arxiv 2602.20408)
- 메커니즘: 모델이 **자기 디폴트(뻔한 안)를 먼저 명시**하게 하고, "그것과 다르게" 생성. 추상 "다양하게"·temperature보다 우위.
- 왜 우월: "클리셰 피하라"는 추상적이지만, *모델이 방금 적은 자기 디폴트*는 구체적 회피 anchor. 우리가 본 수렴 연쇄를 직접 겨냥.
- 이식: 1패스 "이 브리프에 너라면 만들 가장 뻔한 Hero를 layout/interaction/visual 3축으로 묘사(생성 말고)" → 2패스 "3축 모두 다르게 구현".

### 2. Verbalized Sampling (arxiv 2510.01171) — 다양성 1.6~2.1배
- 메커니즘: "답 1개" 대신 **"응답 5개를 각각 흔함 확률과 함께"** → 분포의 꼬리에서 선택. mode collapse 근본원인 = typicality bias(인간이 전형적 텍스트 선호 → 정렬이 최빈값으로 수렴).
- 이식: "이 도메인 Hero 방향 5개 + 흔함 확률 → 확률 최저 2개에서 결정." BANNED_CLICHE 나열 대체.

### 3. Random Concept Injection (arxiv 2601.18053) — LIGHTBULB 직접 근거
- 무관 무작위 단어 주입 → 분포 이동. 고유응답 30~50%↑. **1회면 충분(개수 늘려도 무익), 무관/적당관련 효과 동일** → 정교 큐레이션 불필요.

### 4. Pink Elephant — "금지는 구조적으로 약하다" (arxiv 2503.22395, 2404.15154)
- 어텐션이 부정 처리 못 함. "X 하지 마"는 X를 표상시켜 **활성화↑**(Ironic Process). "모델은 의도가 아니라 *언급한 것*을 증폭." → BANNED_CLICHE 5개 나열이 오히려 그 클리셰를 박아넣음. Anthropic 공식도 "하지 말 것 대신 할 것을".

### 5. 프롬프트 블로트 역효과 (promptlayer/mlops, arxiv 2502.14255)
- 길수록 지시 누락·추론 저하. 권고 **전역 규칙 200~800토큰**, 나머지는 그때그때. → SPARK 700줄은 과적재. 클리셰 로직을 짧은 별도 패스로 분리, 금지목록 삭감.

### 6. Ordinary Persona Randomization (Cambridge design-science, arxiv 2505.17390)
- **무작위 "평범" 페르소나가 큐레이션 "창의적"(잡스류)보다 다양성↑**. parallel(각 독립) > collective. → SPARK PHASE1 "도메인 전문가 렌즈"가 함정에 가까움; 무작위 비전형 디자이너 페르소나 외부 주입.

### 7. 이미지 커뮤니티 노하우 (midjourney)
- **키워드 수프("8k masterpiece stunning")는 평균(클리셰)으로 끌어당겨 품질↓.** 구체성+예상밖 병치가 신선함. → SPARK "Awwwards급/놀라게" 같은 평균지향 찬사 빼고 구체 명세.

### 8. anti-slop 레포 현황 (stop-slop 5k★ 등)
- 거의 다 **금지 기반**(우리가 한계 확인한 그 방식) = 차별화 기회. 단 다축 채점 루브릭(5축, 임계 미만 재작성)은 PREDICTABILITY 다축화에 참고.

## 메타 결론
**"무작위 주입 + 자기 디폴트 회피(iterative diff) + 강제 배정(선택권 제거) + lean(금지 최소)"** 조합이 최강.
**단일 최대 결함 = LIGHTBULB의 'CHOSEN_SPARK 모델 선택' 단계** — 무작위성을 도로 전형으로 무너뜨림.

출처: arxiv 2510.01171 / 2602.20408 / 2601.18053 / 2503.22395 / 2404.15154 / 2502.14255 / 2505.17390 ·
promptlayer·mlops 블로트 · cambridge multi-persona · gadlet positive prompting · github stop-slop · pxz.ai midjourney.

---

## 스킬 생태계 조사 (sweep 4-B) — 학술과 동일 처방으로 수렴
skills.sh 상위엔 diversity/anti-slop 신규 없음. GitHub 신규 3종 모두 **"금지"가 아니라 "외부 배정+락인"**:

- **design-dna (zanwei)** — 외부 레퍼런스를 정량 JSON("Design DNA")으로 추출→생성 구속. 명시 진단: "정량화가 학습분포 디폴트 회귀를 막는다". = 가설(a) 최강 근거. github.com/zanwei/design-dna
- **hallmark (Nutlope)** — 레이아웃 매크로구조+20테마를 **브리프마다 강제 배정**(같은 입력도 다른 골격) + 57 slop게이트 + emit직전 self-critique. → "좌측 타이포+빈배경"을 N개 중 1개로 격하. github.com/Nutlope/hallmark
- **skills-slides (nghiahsgs)** — 토큰 라이브러리(50k 조합), 생성 직전 "Lock in: aesthetic/palette/font/layout ID"로 **동결**. github.com/nghiahsgs/skills-slides
- 순수 금지·검출형(stop-slop, anti-slop-skill 등)=우리가 한계 본 그 부류, 신규 메커니즘 없음.

**생태계 결론**: 검증된 1차 메커니즘은 일관되게 **"외부 스펙 1세트를 생성 전 강제 배정 → 락인"**. 금지는 보조 게이트일 뿐.
**빈 틈(SPARK 차별점)**: design-dna식 외부구속 + oblique식 *진짜 무작위* 배정을 합친 "무작위 기법카드 락인"은 아직 없음.

## ★★ 최종 종합 (학술+생태계 합치)
1. **금지 추가 = 역효과** (Pink Elephant + 생태계). BANNED_CLICHE 누적 중단.
2. **외부 강제 배정 + 생성 전 락인** = 1차 메커니즘 (design-dna/hallmark/skills-slides + Random Concept Injection).
3. **Iterative Differentiation**(자기 디폴트 먼저 묘사→회피) = 단일 최강 기법 (실험 1위).
4. **Verbalized Sampling**(N개+흔함확률→꼬리) = 보조.
5. **LIGHTBULB 치명결함 = CHOSEN_SPARK 모델선택** → 외부 강제배정으로 전환.
6. **lean** = 금지 증식을 "외부배정 절차 1개"로 대체.
