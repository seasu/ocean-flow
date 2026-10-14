# 產生主畫面 icon：深海藍底、一道捲起的浪、浪頂一顆羅盤星（配色取自角色展板）
# 用法：python3 tools/make_icons.py  → icons/*.png
import math, os
from PIL import Image, ImageDraw, ImageFilter

S = 1024
OUT = os.path.join(os.path.dirname(__file__), '..', 'icons')
NAVY, DEEP = (10, 22, 46), (24, 58, 104)
BLUES = [(46, 110, 178), (92, 160, 220), (150, 205, 240), (228, 244, 255)]
GOLD = (255, 207, 90)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def base():
    im = Image.new('RGB', (S, S))
    px = im.load()
    for y in range(S):
        for x in range(S):
            d = math.hypot(x - S * 0.5, y - S * 0.38) / (S * 0.8)
            px[x, y] = lerp(DEEP, NAVY, min(1, d))
    return im


def wave_poly(cx, cy, r, turns, width, phase=0):
    # 一條往內捲的螺旋帶（浪頭），外側到內側逐漸變細
    outer, inner = [], []
    n = 160
    for i in range(n + 1):
        t = i / n
        a = phase + t * turns * 2 * math.pi
        rr = r * (1 - 0.82 * t)
        w = width * (1 - 0.85 * t)
        outer.append((cx + math.cos(a) * (rr + w / 2), cy + math.sin(a) * (rr + w / 2)))
        inner.append((cx + math.cos(a) * (rr - w / 2), cy + math.sin(a) * (rr - w / 2)))
    return outer + inner[::-1]


def star(d, cx, cy, R, r, col):
    pts = []
    for i in range(8):
        a = -math.pi / 2 + i * math.pi / 4
        rad = R if i % 2 == 0 else r
        pts.append((cx + math.cos(a) * rad, cy + math.sin(a) * rad))
    d.polygon(pts, fill=col)


def draw(pad):
    im = base()
    lay = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    k = 1 - pad * 2
    off = S * pad
    P = lambda v: off + v * S * k
    # 底下三層水流（由深到淺）
    for i, col in enumerate(BLUES[:3]):
        y0 = 0.70 + i * 0.07
        pts = [(P(0) - 40, S + 40)]
        for j in range(41):
            x = j / 40
            pts.append((P(x), P(y0 + 0.035 * math.sin(x * 2 * math.pi * 1.5 + i * 1.3))))
        pts.append((P(1) + 40, S + 40))
        d.polygon(pts, fill=col + (255,))
    # 主浪：大螺旋捲起
    d.polygon(wave_poly(P(0.5), P(0.5), 0.36 * S * k, 1.15, 0.2 * S * k, phase=math.pi * 0.85), fill=BLUES[1] + (255,))
    d.polygon(wave_poly(P(0.5), P(0.5), 0.33 * S * k, 1.1, 0.09 * S * k, phase=math.pi * 0.85), fill=BLUES[3] + (255,))
    # 浪花白點
    for (u, v, s) in [(0.2, 0.3, 0.018), (0.26, 0.22, 0.012), (0.82, 0.62, 0.014), (0.86, 0.54, 0.01)]:
        d.ellipse([P(u) - s * S, P(v) - s * S, P(u) + s * S, P(v) + s * S], fill=BLUES[3] + (255,))
    im.paste(lay, (0, 0), lay)
    # 羅盤星：先畫光暈再畫星
    glow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy = P(0.5), P(0.5)
    gd.ellipse([cx - 0.13 * S * k, cy - 0.13 * S * k, cx + 0.13 * S * k, cy + 0.13 * S * k], fill=GOLD + (150,))
    glow = glow.filter(ImageFilter.GaussianBlur(S * 0.05))
    im.paste(glow, (0, 0), glow)
    d2 = ImageDraw.Draw(im)
    star(d2, cx, cy, 0.12 * S * k, 0.035 * S * k, GOLD)
    star(d2, cx, cy, 0.05 * S * k, 0.016 * S * k, (255, 248, 225))
    return im


os.makedirs(OUT, exist_ok=True)
full = draw(0.0)      # iOS 會自己裁圓角，畫滿
safe = draw(0.1)      # maskable：主體留在安全區
for name, im, size in [('apple-touch-icon.png', full, 180), ('icon-192.png', full, 192), ('icon-512.png', full, 512),
                       ('icon-maskable-512.png', safe, 512), ('favicon-32.png', full, 32)]:
    im.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, name), optimize=True)
print('ok')
