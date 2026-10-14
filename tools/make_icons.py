# 主畫面 icon：把一張正方形原圖縮成各尺寸 → icons/*.png
# 用法：python3 tools/make_icons.py /mnt/project-files/ocean-flow-origin/icons/icon-source.png
import os, sys
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', 'icons')
im = Image.open(sys.argv[1]).convert('RGB')
w, h = im.size; s = min(w, h)
im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
for name, size in [('apple-touch-icon.png', 180), ('icon-192.png', 192), ('icon-512.png', 512),
                   ('icon-maskable-512.png', 512), ('favicon-32.png', 32)]:
    im.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, name), optimize=True)
print('ok')
