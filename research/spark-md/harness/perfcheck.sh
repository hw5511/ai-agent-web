#!/usr/bin/env bash
# 정적 렉 탐지 (rAF FPS는 GPU렉에 눈멈). 휴리스틱이라 과탐 가능 — 놓침<과탐.
d="${1:?폴더}"; css="$d/styles.css"; js="$d/script.js"; html="$d/index.html"
[ -f "$css" ] || css="$html"; [ -f "$js" ] || js="$html"
fail=0; warn=0; hit(){ echo "  ❌ $1"; fail=$((fail+1)); }; wrn(){ echo "  ⚠️  $1"; warn=$((warn+1)); }
cnt(){ grep -ciE "$1" "$2" 2>/dev/null || echo 0; }

heavy=$(cnt 'filter: ?blur|backdrop-filter|mix-blend-mode' "$css")
moving=$(cnt 'mousemove|pointermove|requestAnimationFrame' "$js")
bigblur=$(grep -oiE 'blur\(([4-9][0-9]|[0-9]{3})px\)' "$css" 2>/dev/null | wc -l | tr -d ' ')
bigvw=$(cnt '[3-9][0-9]vw|[3-9][0-9]vh|100vmax' "$css")
[ "$bigblur" -gt 0 ] && [ "$bigvw" -gt 0 ] && hit "거대 blur(≥40px)+viewport급 레이어 → paint 폭발(THE TRAP 핵심)"
[ "$heavy" -gt 0 ] && [ "$moving" -gt 0 ] && [ "$bigblur" -gt 0 ] && hit "큰 흐림 레이어 + 매프레임 핸들러 공존 → 움직이는 흐림 의심"
nc=$(cnt '\.style\.(top|left|right|bottom|width|height|margin|filter|boxShadow|clipPath|background)=' "$js")
[ "$nc" -gt 0 ] && hit "JS가 non-composite 속성 직접 변경(${nc})"
grep -qiE 'scrub: ?true' "$js" "$css" 2>/dev/null && hit "scrub:true(무제한 추종)"
[ "$(cnt 'will-change' "$css")" -gt 4 ] && wrn "will-change 다수(영구승격 의심)"
echo "PERFCHECK $(basename $d): FAIL=$fail WARN=$warn"
