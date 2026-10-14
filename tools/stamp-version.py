# 部署時給所有 JS 模組加上版本號（commit sha），避免手機快取到「新 HTML＋舊 JS」混在一起而整頁失靈
import json, os, pathlib, sys
v = (sys.argv[1] if len(sys.argv) > 1 else os.environ.get('GITHUB_SHA', 'dev'))[:7]
root = pathlib.Path(__file__).resolve().parent.parent
mods = sorted(p.relative_to(root).as_posix() for p in (root / 'src').rglob('*.js'))
imap = {'imports': {f'./{m}': f'./{m}?v={v}' for m in mods}}
html = root / 'index.html'
s = html.read_text()
tag = f'<script type="importmap">{json.dumps(imap)}</script>\n'
assert '<script type="module" src="src/main.js"></script>' in s
s = s.replace('<script type="module" src="src/main.js"></script>', tag + f'<script type="module" src="src/main.js?v={v}"></script>')
html.write_text(s)
print('stamped', v, len(mods), 'modules')
