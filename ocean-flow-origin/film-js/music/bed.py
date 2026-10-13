# 前段背景音樂（0–104 秒）：低音長音、空靈和弦、古箏般撥弦、風聲，隨劇情慢慢變厚，最後交給片尾配樂
import numpy as np, wave
SR = 44100; LEN = 105.0; N = int(SR*LEN)
L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(11)
def add(sig, at, pan=0.0, g=1.0):
    i = int(at*SR); sig = sig[:max(0, N-i)]
    L[i:i+len(sig)] += sig*g*np.sqrt((1-pan)/2); R[i:i+len(sig)] += sig*g*np.sqrt((1+pan)/2)
def lp(x, k):
    c = np.cumsum(np.concatenate([[0], x])); y = (c[k:] - c[:-k]) / k
    return np.concatenate([y, np.zeros(k-1)])
hz = lambda m: 440*2**((m-69)/12)
def pad(m, dur, att=3.0, rel=3.5, bright=4.0, voices=4, det=0.004):
    t = np.arange(int(SR*dur))/SR
    env = np.minimum(1, t/att)**1.5 * np.clip((dur-t)/rel, 0, 1)**1.5
    f = hz(m); out = np.zeros(len(t))
    for v in range(voices):
        fv = f*(1+det*(v-(voices-1)/2))*(1+0.0015*np.sin(2*np.pi*(0.15+0.07*v)*t))
        ph = 2*np.pi*np.cumsum(fv)/SR + rng.uniform(0, 6.28)
        for n in range(1, 12):
            if n*f > 6000: break
            out += np.exp(-n/bright)/n*np.sin(n*ph)*(0.6+0.4*np.sin(2*np.pi*0.11*t*n+v))
    return out*env/voices
def pluck(m, dur=3.0, bright=0.5):          # Karplus–Strong，像古箏
    f = hz(m); P = int(SR/f); n = int(SR*dur)
    buf = rng.uniform(-1, 1, P); buf = lp(np.concatenate([buf, buf]), 2)[:P]
    out = np.zeros(n); d = 0.996 if f < 400 else 0.993
    for i in range(n):
        j = i % P; out[i] = buf[j]; buf[j] = d*(bright*buf[j] + (1-bright)*buf[j-1])
    t = np.arange(n)/SR
    return out*np.minimum(1, t/0.003)*np.clip((dur-t)/0.3, 0, 1)
def swell(dur, peak=0.6):                     # 柔和的鈸／風聲漸強
    t = np.arange(int(SR*dur))/SR; nz = rng.standard_normal(len(t)); s = lp(nz - lp(nz, 4), 3)
    return s*(t/dur)**3*peak
def heart(amp):                               # 很輕的低鼓
    t = np.arange(int(SR*1.2))/SR; f = 45 + 50*np.exp(-t*20)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/0.35)*amp
# 1) 貫穿全片的 D 低音長音（兩層交疊，永遠不斷）
for at in np.arange(-4, LEN, 14):
    add(pad(26, 18, 4, 4, 2.5, 3, 0.002), max(0, at), 0, 0.55)
    add(pad(38, 18, 4, 4, 3.0, 3, 0.003), max(0, at+7), 0, 0.25)
# 2) 和弦（前後重疊 3 秒，接得很平順）
CH = [(0, [50, 53, 57, 64]), (9.5, [46, 50, 53, 57]), (19.5, [51, 55, 58, 62]),      # Dm9 · Bb · Eb（異象、帶一點不安）
      (27, [50, 53, 57, 64]), (35.8, [46, 50, 57, 62]), (42.8, [43, 50, 55, 58]),      # Dm · Bbmaj7 · Gm
      (50.4, [45, 52, 55, 62]), (58, [46, 53, 57, 60]),                                # Asus · Bb(add)
      (65.3, [50, 57, 62, 65, 69]), (73.6, [46, 53, 58, 62, 65]), (82.8, [48, 55, 60, 64, 67]),  # Dm · Bb · C（啟流後變厚）
      (89.5, [45, 52, 57, 61, 64]), (95.3, [50, 57, 62, 65]), ]                         # A · Dm（交給片尾）
for k, (at, ms) in enumerate(CH):
    end = CH[k+1][0] if k+1 < len(CH) else 104.5
    g = 0.10 if at < 35 else 0.13 if at < 65 else 0.17
    for j, m in enumerate(ms):
        add(pad(m, end-at+3.5, 3.0, 3.5, 3.5 if at < 65 else 5.0), max(0, at-1.5), (j/len(ms)-.5)*0.9, g)
    if at >= 19.5 and at < 35.8:   # 異象段：高音泛光
        for m in (74, 81): add(pad(m, end-at+3, 2.5, 3, 2.0, 3, 0.008), at, 0.5 if m == 74 else -0.5, 0.05)
# 3) 撥弦：D 小調五聲音階的零星樂句，越往後越密
PENT = [62, 65, 67, 69, 72, 74, 77, 79, 81]
phrases = [(3.5, [69, 72, 74]), (12, [74, 72, 69, 67]), (21, [81, 79, 74]), (27.5, [77, 74, 72]), (31.5, [69, 67, 62]),
           (38, [62, 65, 69, 74]), (45.5, [74, 72, 69]), (53, [67, 69, 72, 74, 77]), (61, [81, 77, 74]),
           (67, [62, 69, 74, 77, 81]), (72, [79, 77, 74, 72]), (76, [74, 77, 79, 81]), (80, [81, 79, 74]),
           (84, [69, 72, 74, 77]), (87.5, [74, 72, 69, 67]), (91, [69, 74, 77]), (96.5, [74, 69, 62])]
for at, ns in phrases:
    gap = 0.42 if at < 65 else 0.3
    for i, m in enumerate(ns):
        p = pluck(m, 3.2); pan = rng.uniform(-0.6, 0.6)
        add(p, at+i*gap, pan, 0.16)
        add(p*0.35, at+i*gap+0.55, -pan, 0.16)          # 輕輕的回聲
# 4) 風聲、啟流前的漸強、低鼓
t = np.arange(N)/SR; nz = rng.standard_normal(N); wind = lp(lp(nz, 40), 40)
wind *= (0.5+0.5*np.sin(2*np.pi*t/13))*0.9
L += wind*0.6; R += np.roll(wind, 3000)*0.6
add(swell(5.0, 0.35), 65.3-5.0, -0.2); add(swell(5.0, 0.35), 65.3-5.0, 0.2)
for x in np.arange(50.4, 65.3, 1.6): add(heart(0.18 + 0.12*(x-50.4)/15), x)
for x in np.arange(65.3, 95.3, 1.6): add(heart(0.32), x)
for x in np.arange(95.3, 100.8, 1.6): add(heart(0.22), x)
# 5) 殘響、片頭淡入、與片尾交接時淡出
ir_t = np.arange(int(SR*3.5))/SR
def conv(x):
    h = rng.standard_normal(len(ir_t))*np.exp(-ir_t/1.0)*0.02
    n = 1 << int(np.ceil(np.log2(len(x)+len(h)))); return np.fft.irfft(np.fft.rfft(x, n)*np.fft.rfft(h, n), n)[:len(x)]
L2 = L*0.7 + conv(L); R2 = R*0.7 + conv(R)
env = np.minimum(1, t/2.5) * np.clip((104.5 - t)/3.0, 0, 1)
L2 *= env; R2 *= env
pk = max(np.abs(L2).max(), np.abs(R2).max()); L2, R2 = L2/pk*0.89, R2/pk*0.89
w = wave.open("bed.wav", "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.stack([L2, R2], 1)*32767).astype('<i2').tobytes()); w.close(); print("ok")
