import json, subprocess, sys
d, out, shift = sys.argv[1], sys.argv[2], float(sys.argv[3])
starts = json.load(open(f"{d}/starts.json"))
dur = lambda p: float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]))
import os
fit = os.environ.get("FIT") == "1"  # 超出鏡頭的句子用 atempo 加速（不變調，上限 1.2 倍）
tempo = {}
if fit:
    for i, s in enumerate(starts, 1):
        slot = (starts[i] if i < len(starts) else 90) - s - 0.3
        dd = dur(f"{d}/s{i:02d}.wav")
        if dd > slot: tempo[i] = min(dd / slot, 1.2)
t_prev = 0; place = []
for i, s in enumerate(starts, 1):
    p = f"{d}/s{i:02d}.wav"; t = max(s, t_prev + 0.4 if i > 1 else s); dd = dur(p) / tempo.get(i, 1)
    place.append((i, s, t, dd)); t_prev = t + dd
cmd = ["ffmpeg","-y","-v","error"]
for i,*_ in place: cmd += ["-i", f"{d}/s{i:02d}.wav"]
f = "".join(f"[{k}]" + (f"atempo={tempo[i]:.4f}," if i in tempo else "") + f"adelay={int(t*1000)}:all=1[a{k}];" for k,(i,s,t,dd) in enumerate(place))
f += "".join(f"[a{k}]" for k in range(len(place))) + f"amix=inputs={len(place)}:normalize=0,apad=whole_dur=90,atrim=0:90,"
import os
plain = os.environ.get("PLAIN") == "1"
if not plain: f += f"asetrate=24000*{shift},aresample=24000,atempo={1/shift:.4f},"
f += ("highpass=f=55," + ("" if plain else "lowshelf=f=140:g=5,") + "equalizer=f=400:t=q:w=1:g=-2,equalizer=f=2200:t=q:w=1.2:g=2.5,lowpass=f=9000,"
      "acompressor=threshold=-24dB:ratio=4:attack=5:release=150:makeup=4,"
      "asoftclip=type=tanh:threshold=0.6,"
      "loudnorm=I=-16:TP=-1.5:LRA=9")
cmd += ["-filter_complex", f, "-ar","44100","-ac","2","-b:a","192k", out]
subprocess.check_call(cmd)
for i,s,t,dd in place:
    flag = ("  (晚 %.1fs)" % (t-s) if t-s > 0.05 else "") + ("  (加速 %.2fx)" % tempo[i] if i in tempo else "")
    print(f"Shot {i:02d}: {int(t//60)}:{t%60:05.2f}–{int((t+dd)//60)}:{(t+dd)%60:05.2f}{flag}")
