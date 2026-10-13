# 生成三種可無縫循環的動態圖層（黑底，之後用 screen 疊上去）：fog 飄霧、motes 光點粒子、flow 流光。16 秒循環。
import numpy as np, subprocess, sys
W, H, FPS, T = 1920, 1080, 25, 16
N = FPS * T
rng = np.random.default_rng(7)
def enc(name):
    return subprocess.Popen(["ffmpeg","-y","-v","error","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r",str(FPS),"-i","-",
        "-c:v","libx264","-preset","medium","-crf","16","-pix_fmt","yuv444p",f"fx/{name}.mp4"], stdin=subprocess.PIPE)
def periodic_noise(h, w, scale):
    f = np.fft.fft2(rng.standard_normal((h, w)))
    ky = np.fft.fftfreq(h)[:,None]; kx = np.fft.fftfreq(w)[None,:]
    n = np.real(np.fft.ifft2(f * np.exp(-(kx**2+ky**2)*(scale**2))))
    return (n - n.min()) / (n.max() - n.min())
which = sys.argv[1:] or ["fog","motes","flow"]
if "fog" in which:
    TW = 3840
    a = periodic_noise(H//2, TW//2, 220); b = periodic_noise(H//2, TW//2, 90)
    up = lambda m: np.kron(m, np.ones((2,2)))
    a, b = up(a), up(b)
    vign = np.clip(1.2 - np.abs(np.linspace(-1,1,H))[:,None]*0.6, 0, 1)
    p = enc("fog")
    for f in range(N):
        s1 = int(TW * f / N); s2 = int(-2 * TW * f / N)      # 兩層不同速度，16 秒剛好繞一圈
        m = 0.65*np.roll(a, -s1, axis=1)[:, :W] + 0.35*np.roll(b, -s2, axis=1)[:, :W]
        m = np.clip((m - 0.35) / 0.5, 0, 1) ** 1.6 * vign
        p.stdin.write(np.repeat((m*235)[:,:,None], 3, 2).astype(np.uint8).tobytes())
    p.stdin.close(); p.wait()
if "motes" in which:
    n = 140
    x0 = rng.uniform(0, W, n); y0 = rng.uniform(0, H, n)
    k = rng.integers(1, 3, n)                   # 16 秒內往上飄 1–2 個畫面高
    sw = rng.uniform(10, 40, n); sp = rng.integers(1, 4, n); ph = rng.uniform(0, 2*np.pi, n)
    size = rng.uniform(1.8, 4.5, n); tw = rng.integers(1, 5, n)
    col = np.where(rng.random(n)[:,None] < 0.5, [1.0, 0.86, 0.6], [0.7, 0.9, 1.0])
    R = 16; yy, xx = np.mgrid[-R:R+1, -R:R+1]
    p = enc("motes")
    for f in range(N):
        t = f / N
        img = np.zeros((H+2*R, W+2*R, 3), np.float32)
        ys = (y0 - k*H*t) % H; xs = (x0 + sw*np.sin(2*np.pi*sp*t + ph)) % W
        br = 0.55 + 0.45*np.sin(2*np.pi*tw*t + ph)
        for i in range(n):
            g = np.exp(-(xx**2+yy**2)/(2*size[i]**2)) + 0.25*np.exp(-(xx**2+yy**2)/(2*(size[i]*3)**2))
            cy, cx = int(ys[i]), int(xs[i])
            img[cy:cy+2*R+1, cx:cx+2*R+1] += (g*br[i])[:,:,None]*col[i]
        p.stdin.write((np.clip(img[R:R+H, R:R+W], 0, 1)*255).astype(np.uint8).tobytes())
    p.stdin.close(); p.wait()
if "flow" in which:
    X = np.arange(W)[None,:]; Y = np.arange(H)[:,None].astype(np.float32)
    rib = [(rng.uniform(0.2,0.8)*H, rng.uniform(30,90), rng.uniform(0.6,1.4), rng.integers(1,2), rng.uniform(0,6.3),
            rng.uniform(2,6), [0.55,0.85,1.0] if i%3 else [1.0,0.85,0.55]) for i in range(4)]
    p = enc("flow")
    for f in range(N):
        t = f / N; img = np.zeros((H, W, 3), np.float32)
        for y0, A, kk, w, ph, wd, c in rib:
            yc = y0 + A*np.sin(2*np.pi*(kk*X/W - w*t) + ph) + 0.15*A*np.sin(2*np.pi*(1.7*kk*X/W + w*t) + ph*2)
            lo, hi = int(max(0, y0-A*1.4-60)), int(min(H, y0+A*1.4+60))
            d = (Y[lo:hi] - yc) / wd
            pulse = 0.5 + 0.5*np.sin(2*np.pi*(X/W*2 - 2*w*t) + ph)   # 光沿著線流動
            v = (np.exp(-d*d) + 0.3*np.exp(-d*d/16)) * (0.35 + 0.65*pulse)
            img[lo:hi] += v[:,:,None]*np.array(c, np.float32)
        p.stdin.write((np.clip(img, 0, 1)*255).astype(np.uint8).tobytes())
    p.stdin.close(); p.wait()
