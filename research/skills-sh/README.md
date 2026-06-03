# skills.sh 지식 연구 (SPARK.md 개선용 외부 지식 베이스)

skills.sh 등에서 **프론트엔드 · 디자인 · 기획/PM · 모션/창의코딩 · UX** 관련 스킬을 폭넓게 조사하고,
거기서 길어 올린 **새롭고 유용한 지식**을 분야별로 정리해 SPARK.md 개선 실험에 공급하는 공간이다.

## 역할 분담
- **선임연구원(메인 에이전트)**: 전체 조율 + 실증 연구(`claude -p` 격리 실험, `research/spark-md/`).
- **조사 서브에이전트**: skills.sh 분야별 서베이 → 구조화 보고 → 본 폴더에 기록.

## 구조
```
research/skills-sh/
├── README.md          이 문서
├── INDEX.md           조사된 스킬 마스터 인덱스 (카테고리/저자/URL/한줄/인기도)
├── KNOWLEDGE_LOG.md   ★ SPARK.md 반영 후보 — '새롭고 유용한 지식' 누적 일지(순차)
└── knowledge/         분야별 심화 지식 노트
    ├── frontend.md    프론트엔드/UI 구현·디자인 스킬
    ├── design.md      비주얼/미감/디자인시스템 스킬
    ├── planning.md    기획/PM/제품/콘텐츠/브레인스토밍 스킬
    └── motion.md      모션/애니메이션/창의코딩/생성예술 스킬
```

## 운영 원칙
- 각 지식 항목은 **출처(스킬명+URL)** 와 **SPARK.md 반영 포인트**를 함께 적는다.
- 이미 SPARK.md(또는 v2)에 있는 것은 "기존"으로 표시, **새로운 것만 KNOWLEDGE_LOG에 별도 강조**.
- 조사 → 지식화 → (실증 실험에서 검증) → SPARK.md 반영, 의 순환.
