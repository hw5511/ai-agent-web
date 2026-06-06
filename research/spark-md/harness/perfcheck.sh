#!/usr/bin/env bash
# 정적 렉 탐지 (rAF FPS는 GPU렉에 눈멈). 휴리스틱이라 과탐 가능 — 놓침<과탐.
d="${1:?폴더}"; css="$d/styles.css"; js="$d/script.js"; html="$d/index.html"
[ -f "$css" ] || css="$html"; [ -f "$js" ] || js="$html"
fail=0; warn=0; hit(){ echo "  ❌ $1"; fail=$((fail+1)); }; wrn(){ echo "  ⚠️  $1"; warn=$((warn+1)); }
cnt(){ local n; n=$(grep -ciE "$1" "$2" 2>/dev/null); echo "${n:-0}"; }

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

# --- 마감(FLOOR) 정적 검사: 모델의 Bash 자가검증 루프를 대체 (밀리초·공짜) ---
# 주석(HTML <!-- -->, CSS/JS /* */, JS //)은 렌더링 안 되므로 제외하고, 실제 보이는 텍스트만 검사.
# em-dash 0: title/alt/본문 등 사용자에게 보이는 곳만 — 금지.
emrep=$(python3 - "$html" "$css" "$js" <<'PY' 2>/dev/null
import re,sys
hits=[]
for p in sys.argv[1:]:
    try: t=open(p,encoding='utf-8').read()
    except: continue
    if p.endswith('.html'): t=re.sub(r'<!--.*?-->','',t,flags=re.S)
    else: t=re.sub(r'/\*.*?\*/','',t,flags=re.S); t=re.sub(r'(?m)//.*$','',t)
    for i,ln in enumerate(t.splitlines(),1):
        if '—' in ln: hits.append(f"      {p}:{i}: {ln.strip()[:90]}")
print(len(hits)); print('\n'.join(hits))
PY
)
emdash=$(echo "$emrep" | head -1)
[ "${emdash:-0}" -gt 0 ] 2>/dev/null && { hit "em-dash(—) ${emdash}개 (FLOOR: 0, 주석 제외 렌더 텍스트). 위치:"; echo "$emrep" | tail -n +2; }
# 이모지 0(아이콘은 인라인 SVG): 주요 이모지 유니코드 블록 탐지.
emoji=$(grep -aoP '[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}\x{FE00}-\x{FE0F}]' "$html" 2>/dev/null | wc -l | tr -d ' ')
[ "${emoji:-0}" -gt 0 ] && hit "이모지 의심 ${emoji}개 (FLOOR: 0, 아이콘은 인라인 SVG)"
# 링크 연결: index.html이 참조하는 .css/.js가 실제 파일로 존재하나(경로 오타·미연결=FAIL).
if [ -f "$html" ]; then
  for ref in $(grep -oE '(href|src)="[^"]+\.(css|js)"' "$html" 2>/dev/null | grep -oE '[^"]+\.(css|js)'); do
    case "$ref" in http*|//*) continue;; esac   # CDN 제외
    [ -f "$d/$ref" ] || hit "링크 끊김: index.html이 '$ref' 참조하나 파일 없음"
  done
fi
echo "PERFCHECK $(basename $d): FAIL=$fail WARN=$warn"
