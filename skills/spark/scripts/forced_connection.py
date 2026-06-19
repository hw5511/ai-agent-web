#!/usr/bin/env python3
"""SPARK 강제연결(forced connection) 키워드 추출기.

브리프와 무관한 명사를 셸 난수로 뽑아, 디자인의 "중심 은유" 축을 외부에서 강제한다.
LIGHTBULB 4축(LAYOUT/INTERACTION/VISUAL/PINCH)이 못 거는 *컨셉/은유* 층의 수렴
(레코드샵 → 매번 LP 원반 + "바늘/소리" 카피)을 깨기 위한 장치.

왜 셸 RNG인가: LLM에게 "아무 단어나 생각나는대로 줘"라고 하면 typicality bias로
의미적으로 수렴한다(연구일지 R6/R20). 무작위성은 반드시 셸이 굴려야 발산한다.
LLM의 역할은 "랜덤 생성"이 아니라 "주어진 단어로 연상"이다.

사용:
  python3 scripts/forced_connection.py                 # 1세트(2단어)
  python3 scripts/forced_connection.py --sets 5        # 5세트(배치 내 비복원추출, 중복 0)
  python3 scripts/forced_connection.py --sets 5 --per 2
  SPARK_SEED=42 python3 scripts/forced_connection.py   # 재현용 고정 시드
"""
import argparse
import os
import random

# 도메인 무관·구체적·시각/촉각 연상이 풍부한 명사 풀(범용). 어떤 브리프와도 강제연결 가능.
WORDBANK = [
    "등대", "빙하", "우표", "효모", "자석", "나침반", "벌집", "그물", "도르래", "모래시계",
    "양초", "거울", "화석", "이끼", "톱니바퀴", "해파리", "우산", "나선계단", "자전거", "종이학",
    "실타래", "깃털", "조개껍데기", "자물쇠", "열쇠", "부표", "닻", "풍차", "우물", "사다리",
    "망원경", "현미경", "주판", "팽이", "연", "부채", "호루라기", "성냥", "분필", "압정",
    "클립", "못", "망치", "대패", "줄자", "수평계", "깔때기", "체", "절구", "맷돌",
    "항아리", "소쿠리", "시루", "가마솥", "화로", "풀무", "다리미", "빗자루", "옷걸이", "저울",
    "컴퍼스", "각도기", "삼각자", "비커", "플라스크", "스포이드", "핀셋", "메스", "붕대", "목발",
    "안경", "보청기", "고드름", "서리", "안개", "무지개", "번개", "우박", "회오리", "노을",
    "별똥별", "오로라", "일식", "조수", "산호", "미역", "따개비", "불가사리", "소금", "누룩",
    "식초", "메주", "누에고치", "거미줄", "개미집", "둥지", "비늘", "지느러미", "발굽", "더듬이",
    "물갈퀴", "솔방울", "도토리", "밤송이", "민들레홀씨", "넝쿨", "뿌리", "새싹", "단풍", "버섯",
    "고사리", "대나무", "갈대", "억새", "연꽃", "부레옥잠", "선인장", "분재", "이정표", "징검다리",
    "두레박", "물레", "베틀", "북(셔틀)", "물레방아", "굴뚝", "처마", "기와", "주춧돌", "대들보",
    "온돌", "발(blind)", "병풍", "족자", "낙관", "벼루", "먹", "한지", "부싯돌", "윷",
    "팽이", "제기", "연자방아", "지게", "키(곡식)", "삿갓", "도롱이", "꽹과리", "장구", "북",
    "거문고", "가야금", "대금", "단소", "소라고둥", "방패연", "팔랑개비", "물수제비", "그림자놀이", "실뜨기",
    "만화경", "프리즘", "추(진자)", "용수철", "톱", "쐐기", "지렛대", "바퀴살", "베어링", "기어",
    "용암", "간헐천", "종유석", "사구(모래언덕)", "협곡", "여울", "소용돌이", "물보라", "이슬", "성에",
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sets", type=int, default=1, help="뽑을 세트 수")
    ap.add_argument("--per", type=int, default=2, help="세트당 키워드 수")
    args = ap.parse_args()

    seed = os.environ.get("SPARK_SEED")
    rng = random.Random(int(seed)) if seed else random.SystemRandom()

    need = args.sets * args.per
    pool = WORDBANK[:]
    rng.shuffle(pool)
    # 배치 내 비복원추출: 가능한 만큼 중복 없이, 모자라면 순환
    picks = []
    while len(picks) < need:
        if not pool:
            pool = WORDBANK[:]
            rng.shuffle(pool)
        picks.append(pool.pop())

    print("=== SPARK 강제연결 키워드 (브리프 앵커 × 아래 단어 = 비자명 중심 은유) ===")
    for i in range(args.sets):
        words = picks[i * args.per:(i + 1) * args.per]
        label = chr(ord("a") + i) if args.sets > 1 else "-"
        print(f"[{label}] FORCED_WORDS: {' · '.join(words)}")
    print("=== 사용법: 브리프 핵심 명사(앵커) + 위 단어들을 보고 연상되는 *비자명한* 중심 컨셉/은유를")
    print("    도출해 CENTER_METAPHOR로 락인. 도메인 1차 연상(예: 레코드샵→LP원반/바늘)은 자가 금지. ===")


if __name__ == "__main__":
    main()
