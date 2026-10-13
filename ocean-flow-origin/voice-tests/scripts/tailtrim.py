# 去掉 Gemini 句尾的「呲」：中文音節不會以擦音結尾，所以一句話講完後、下一個有聲音節前 0.4 秒內都沒有母音的高頻氣音，都是多餘的。
# 1) 每段結尾：最後一個有聲音節自然衰減後直接切掉，再補 0.25 秒靜音
# 2) 段內停頓：同樣條件的氣音靜音（前後 10ms 淡入淡出）
import sys, os, wave, struct, math
MS = 10
def frames(x, sr):
    win = int(sr*MS/1000); F = []
    for i in range(0, len(x)-win, win):
        s = x[i:i+win]; rms = math.sqrt(sum(v*v for v in s)/len(s))
        zc = sum(1 for a,b in zip(s,s[1:]) if (a<0)!=(b<0))/len(s)*sr/2
        F.append((i, 20*math.log10(rms/32768+1e-9), zc))
    return F, win
voiced = lambda f: f[1] > -32 and f[2] < 2500
src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
for fn in sorted(os.listdir(src)):
    p = f"{src}/{fn}"
    if fn.endswith(".json"): open(f"{dst}/{fn}","w").write(open(p).read())
    if not fn.endswith(".wav"): continue
    w = wave.open(p); sr = w.getframerate(); n = w.getnframes(); x = list(struct.unpack('<%dh'%n, w.readframes(n)))
    F, win = frames(x, sr)
    # 段內：找有聲 → 停頓中的氣音
    muted = 0; k = 0; last_v = None
    while k < len(F):
        if voiced(F[k]): last_v = k; k += 1; continue
        if F[k][2] > 3500 and F[k][1] > -45 and last_v is not None:
            j = k
            while j+1 < len(F) and F[j+1][2] > 3000 and not voiced(F[j+1]): j += 1
            nxt = next((m for m in range(j+1, len(F)) if voiced(F[m])), None)
            if nxt is not None and (nxt - j) * MS / 1000 > 0.4:
                a, b = F[k][0], F[j][0] + win; r = int(sr*0.01)
                for i in range(max(0,a-r), min(n,b+r)):
                    g = 0 if a <= i < b else (a-i)/r if i < a else (i-b)/r
                    x[i] = int(x[i]*g)
                muted += 1
            k = j + 1; continue
        k += 1
    # 結尾
    last = max(k for k,f in enumerate(F) if voiced(f)); k = last
    while k+1 < len(F) and F[k+1][1] > -50 and F[k+1][2] < 3000: k += 1
    end = min(n, F[k][0] + win + int(sr*0.03)); r = int(sr*0.03)
    for i in range(end - r, end): x[i] = int(x[i] * (end - i) / r)
    x = x[:end] + [0]*int(sr*0.25)
    o = wave.open(f"{dst}/{fn}", "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr)
    o.writeframes(struct.pack('<%dh'%len(x), *x)); o.close()
    print(f"{fn}: {n/sr:.2f}s → {len(x)/sr:.2f}s，段內靜音 {muted} 處")
