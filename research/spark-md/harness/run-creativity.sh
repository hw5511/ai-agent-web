#!/usr/bin/env bash
set -u
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
VDIR="$REPO/research/spark-md/versions"
MODEL="sonnet"

gen() { # round dir promptfile claudemd
  local lab="$1" name="$2" pf="$3" md="$4"
  local dir="$lab/$name"; mkdir -p "$dir"
  [ "$md" != "none" ] && cp "$VDIR/$md" "$dir/CLAUDE.md"
  local prompt; prompt="$(cat "$REPO/research/spark-md/prompts/$pf")"
  echo "--- [$name] ($md) ---"
  ( cd "$dir" && unset CLAUDECODE && export IS_SANDBOX=1 && \
    claude -p --dangerously-skip-permissions --model "$MODEL" \
      --output-format stream-json --verbose "$prompt" \
      > "$lab/$name.stream.jsonl" 2> "$lab/$name.err" )
  local rc=$? files="" lb
  for ef in index.html styles.css script.js; do [ -f "$dir/$ef" ] && files="$files $ef"; done
  lb=$(grep -c "skills/lightbulb/ideas.json\|skills/lightbulb/pinches.json" "$lab/$name.stream.jsonl" 2>/dev/null)
  local ids; ids=$(grep -oE "lb-[0-9]{3}" "$lab/$name.stream.jsonl" 2>/dev/null | sort -u | tr '\n' ',')
  echo "    [$name] rc=$rc | files:${files:- 없음} | LIGHTBULB curl:$lb ids:${ids:-none}"
}

# === 실험 1: LIGHTBULB ablation (2 주제 × {v4, v4-noLB}) ===
L1=/tmp/spark-lab/R8_ablation; rm -rf "$L1"; mkdir -p "$L1"
echo "=== EXP1 ablation (v4 vs v4-noLB, 2주제) ==="
gen "$L1" mokza_v4      mokza.txt v4.md
gen "$L1" mokza_noLB    mokza.txt v4-noLB.md
gen "$L1" plain_v4      plain.txt v4.md
gen "$L1" plain_noLB    plain.txt v4-noLB.md

# === 실험 2: 돌파축 A/B/C/D (열린 주제 1개) ===
L2=/tmp/spark-lab/R9_breakthrough; rm -rf "$L2"; mkdir -p "$L2"
echo "=== EXP2 A/B/C/D (open_observatory) ==="
gen "$L2" A_genre      open_observatory.txt v5-A.md
gen "$L2" B_structure  open_observatory.txt v5-B.md
gen "$L2" C_metaphor   open_observatory.txt v5-C.md
gen "$L2" D_medium     open_observatory.txt v5-D.md
echo "=== 종료: $L1 / $L2 ==="
