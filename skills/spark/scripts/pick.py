#!/usr/bin/env python3
"""SPARK 씨드 무작위 추출기.

references/lightbulb.md를 파싱해 각 축(LAYOUT/INTERACTION/VISUAL/PINCHES)에서
실제 난수로 1개씩 뽑고, FONTS 표에서도 1개를 뽑는다.

LLM에게 "랜덤하게 고르라"고 텍스트로 지시하면 의미적으로 수렴(예: 매번
'바랜 기록' + 'Noto Serif KR')하는 문제를 차단하기 위해, 셸이 진짜 난수를
굴려 결과를 강제한다. 출력 줄을 그대로 spark_ignition 블록에 옮겨 적으면 된다.

사용:
  python3 scripts/pick.py            # 기본: references/lightbulb.md 자동 탐색
  python3 scripts/pick.py <path>     # lightbulb.md 경로 지정
  SPARK_SEED=42 python3 scripts/pick.py   # 재현 가능한 시드 고정
"""
import os
import random
import re
import sys


def find_ref(explicit):
    if explicit:
        return explicit
    here = os.path.dirname(os.path.abspath(__file__))
    cand = os.path.join(here, "..", "references", "lightbulb.md")
    return os.path.normpath(cand)


def parse(path):
    """## 헤더별로 '- [..]' 항목과 FONTS 표 행을 수집."""
    sections = {}
    fonts = []
    cur = None
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            m = re.match(r"^##\s+(.+?)\s*$", line)
            if m:
                head = m.group(1).upper()
                if head.startswith("LAYOUT"):
                    cur = "LAYOUT"
                elif head.startswith("INTERACTION"):
                    cur = "INTERACTION"
                elif head.startswith("VISUAL"):
                    cur = "VISUAL"
                elif head.startswith("PINCHES"):
                    cur = "PINCHES"
                elif head.startswith("FONTS"):
                    cur = "FONTS"
                else:
                    cur = None
                sections.setdefault(cur, [])
                continue
            if cur == "FONTS":
                # 표 행: | Pretendard | ... |  (헤더/구분선 제외)
                if line.startswith("|") and "---" not in line:
                    cells = [c.strip() for c in line.strip("|").split("|")]
                    if cells and cells[0] and cells[0] != "폰트":
                        fonts.append(cells)
            elif cur and line.startswith("- ["):
                sections[cur].append(line[2:].strip())  # strip "- "
    return sections, fonts


def main():
    path = find_ref(sys.argv[1] if len(sys.argv) > 1 else None)
    if not os.path.exists(path):
        sys.exit(f"ERROR: lightbulb.md not found at {path}")

    seed = os.environ.get("SPARK_SEED")
    rng = random.Random(int(seed)) if seed else random.SystemRandom()

    sections, fonts = parse(path)
    need = ["LAYOUT", "INTERACTION", "VISUAL", "PINCHES"]
    for k in need:
        if not sections.get(k):
            sys.exit(f"ERROR: section '{k}' empty — check lightbulb.md format")

    layout = rng.choice(sections["LAYOUT"])
    inter = rng.choice(sections["INTERACTION"])
    visual = rng.choice(sections["VISUAL"])
    pinch = rng.choice(sections["PINCHES"])
    # 폰트는 한글 본문용만 후보로:
    #  - 영문전용(Space Grotesk 등)은 페어링용이라 메인폰트 부적합
    #  - bold_readability poor(Black Han Sans/Jua)는 heading 전용이라 메인 부적합
    def font_ok(f):
        readability = f[2] if len(f) > 2 else ""
        return "영문전용" not in readability and "poor" not in readability
    kr_fonts = [f for f in fonts if font_ok(f)]
    font = rng.choice(kr_fonts) if kr_fonts else (rng.choice(fonts) if fonts else None)

    print("=== SPARK 강제 배정 씨드 (이 줄들을 그대로 spark_ignition에 옮겨 적어라) ===")
    print(f"LAYOUT_SPARK: {layout}")
    print(f"INTERACTION_SPARK: {inter}")
    print(f"VISUAL_SPARK: {visual}")
    print(f"AESTHETIC_PINCH: {pinch}")
    if font:
        name, mood = font[0], (font[1] if len(font) > 1 else "")
        readability = font[2] if len(font) > 2 else ""
        print(f"CHOSEN_FONT: {name} ({readability}; mood: {mood})")
    print("=== 끝. CHOSEN_FONT가 작업 분위기와 정면충돌하면 1회만 교체 허용. 나머지 4개는 강제. ===")


if __name__ == "__main__":
    main()
