# 片尾配樂：純 numpy 合成（太鼓、低音重擊、銅管和弦、合唱長音、鈸聲漸強、殘響），輸出 44.1k 立體聲 wav
import numpy as np, wave, sys
SR = 44100
HIT = float(sys.argv[1]) if len(sys.argv) > 1 else 4.0     # 片名重擊在配樂中的秒數
LEN = float(sys.argv[2]) if len(sys.argv) > 2 else 15.0
N = int(SR*LEN); L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(3)
t_all = np.arange(N)/SR
def add(sig, at, pan=0.0, g=1.0):
    i = int(at*SR); sig = sig[:max(0, N-i)]
    L[i:i+len(sig)] += sig*g*np.sqrt((1-pan)/2); R[i:i+len(sig)] += sig*g*np.sqrt((1+pan)/2)
def lp(x, a):          # 單極低通（向量化不了，用累積近似：多次移動平均）
    k = max(1, int(a))
    c = np.cumsum(np.concatenate([[0], x])); y = (c[k:] - c[:-k]) / k
    return np.concatenate([y, np.zeros(k-1)])
def taiko(amp=1.0, f0=110, f1=48, dec=0.55):
    d = 1.6; t = np.arange(int(SR*d))/SR
    f = f1 + (f0-f1)*np.exp(-t*18); ph = 2*np.pi*np.cumsum(f)/SR
    body = np.sin(ph)*np.exp(-t/dec) + 0.35*np.sin(ph*1.6)*np.exp(-t/(dec*.5))
    skin = lp(rng.standard_normal(len(t)), 6)*np.exp(-t*40)*0.6
    return np.tanh((body+skin)*1.4)*amp
def boom():
    d = 4.5; t = np.arange(int(SR*d))/SR
    f = 30 + 40*np.exp(-t*6); s = np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/1.6)
    return np.tanh(s*2.2)*0.9
def note(freq, dur, att, rel, bright, voices=3, det=0.006, formant=None, vib=0.0):
    t = np.arange(int(SR*dur))/SR
    env = np.minimum(1, t/att) * np.clip((dur - t)/rel, 0, 1)
    out = np.zeros(len(t))
    for v in range(voices):
        fv = freq*(1 + det*(v-(voices-1)/2)) * (1 + vib*np.sin(2*np.pi*5.2*t + v))
        ph = 2*np.pi*np.cumsum(fv)/SR + rng.uniform(0, 6.28)
        for n in range(1, 28):
            if n*freq > 9000: break
            a = (1/n)*np.exp(-n/bright(t))
            if formant: a = a*sum(g*np.exp(-((n*freq-fc)/bw)**2) for fc, bw, g in formant)
            out += a*np.sin(n*ph)
    return out*env/voices
def hz(m): return 440*2**((m-69)/12)
AH = [(730, 160, 1.0), (1090, 200, .55), (2440, 300, .25), (300, 200, .4)]
# 1) 鈸聲漸強進入重擊
d = HIT; t = np.arange(int(SR*d))/SR
nz = rng.standard_normal(len(t)); hi = nz - lp(nz, 3)
for pan in (-0.3, 0.3):
    nz = rng.standard_normal(len(t)); sh = lp(nz - lp(nz, 3), 2)       # 柔一點的鈸／風聲
    add(sh*(t/d)**4*0.13, 0, pan)
# 2) 重擊前的太鼓滾奏（越來越密）
for k, x in enumerate(np.cumsum([0.5, 0.45, 0.4, 0.33, 0.27, 0.22, 0.18, 0.15, 0.12, 0.1])):
    at = HIT - 2.6 + x*0.95
    if at < HIT - 0.05: add(taiko(0.25 + 0.05*k, 140, 70, 0.25), at, (-1)**k*0.3)
# 3) 重擊：低音 boom + 大太鼓 + 銅管和弦 + 合唱
add(boom(), HIT); add(taiko(1.0), HIT, -0.2); add(taiko(0.9, 95, 42, 0.8), HIT+0.02, 0.2)
CH = [  # (開始, 長度, 和弦 midi, 亮度)
    (HIT,      2.6, [38, 45, 50, 53, 57], 7),     # Dm
    (HIT+2.6,  2.4, [34, 41, 46, 50, 53], 8),     # Bb
    (HIT+5.0,  2.3, [36, 43, 48, 52, 55], 9),     # C
    (HIT+7.3,  LEN-HIT-7.3, [38, 45, 50, 54, 57, 62], 11),  # D 大三和弦收尾
]
for at, dur, ms, b in CH:
    for j, m in enumerate(ms):
        bright = lambda tt, b=b: b*(0.5 + 0.5*np.minimum(1, tt/0.6))
        add(note(hz(m), dur+1.6, 0.08 if at == HIT else 0.35, 1.6, bright), at, (j/len(ms)-.5)*0.6, 0.32)
        if m >= 50: add(note(hz(m), dur+1.8, 0.5, 1.8, lambda tt: 18, voices=4, det=0.009, formant=AH, vib=0.004), at, -(j/len(ms)-.5)*0.8, 0.9)
# 4) 和弦換位時的太鼓
for at in [HIT+2.6, HIT+5.0, HIT+6.4, HIT+6.8, HIT+7.3]:
    add(taiko(0.75), at, 0.15)
add(boom()*0.8, HIT+7.3)
# 5) 殘響（合成 IR 的 FFT 卷積）
ir_t = np.arange(int(SR*2.8))/SR
def irr(): return rng.standard_normal(len(ir_t))*np.exp(-ir_t/0.7)*0.02
def conv(x, h):
    n = 1 << int(np.ceil(np.log2(len(x)+len(h))))
    return np.fft.irfft(np.fft.rfft(x, n)*np.fft.rfft(h, n), n)[:len(x)]
L2 = L*0.8 + conv(L, irr())*0.9; R2 = R*0.8 + conv(R, irr())*0.9
# 結尾淡出
fade = np.clip((LEN - t_all)/2.0, 0, 1); L2 *= fade; R2 *= fade
pk = max(np.abs(L2).max(), np.abs(R2).max()); L2, R2 = L2/pk*0.89, R2/pk*0.89
st = (np.stack([L2, R2], 1)*32767).astype('<i2')
w = wave.open("score.wav", "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes()); w.close()
print("ok", LEN)
