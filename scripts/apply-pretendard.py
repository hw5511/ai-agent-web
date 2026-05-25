"""SVG 147장에 Pretendard 일괄 적용.

- font-family 속성에 Pretendard를 1순위로 추가
- <svg ...> 직후 <defs><style>@import ...</style></defs> 삽입
- 멱등: 이미 적용된 파일은 건너뜀
"""
import os, re, sys

ROOT = os.path.join(os.path.dirname(__file__), '..', 'curriculum', '_assets', 'basic')

OLD_FONTS = [
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif",
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
]
NEW_FONT = "'Pretendard',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif"

DEFS_BLOCK = (
    '<defs><style>'
    '@import url(&quot;https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.min.css&quot;);'
    '</style></defs>'
).replace('&quot;', '"')

PRETENDARD_MARKER = 'pretendard.min.css'

changed = 0
visited = 0
for step in sorted(os.listdir(ROOT)):
    step_path = os.path.join(ROOT, step)
    if not os.path.isdir(step_path):
        continue
    for fname in sorted(os.listdir(step_path)):
        if not fname.lower().endswith('.svg'):
            continue
        path = os.path.join(step_path, fname)
        visited += 1
        with open(path, 'r', encoding='utf-8') as fp:
            txt = fp.read()
        original = txt

        # 1) font-family 치환
        for old in OLD_FONTS:
            txt = txt.replace(f'"{old}"', f'"{NEW_FONT}"')

        # 2) defs/@import 삽입 (멱등)
        if PRETENDARD_MARKER not in txt:
            txt = re.sub(r'(<svg[^>]*>)', r'\1\n  ' + DEFS_BLOCK, txt, count=1)

        if txt != original:
            with open(path, 'w', encoding='utf-8') as fp:
                fp.write(txt)
            changed += 1

print(f'visited={visited} changed={changed}')
