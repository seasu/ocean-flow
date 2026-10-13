# 原始輸出：照鏡頭起點排，不加速、不做任何音效處理、不裁到 90 秒
import json, subprocess, sys
d, out = sys.argv[1], sys.argv[2]
starts = json.load(open(f"{d}/starts.json"))
dur = lambda p: float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]))
t_prev = 0; place = []
for i, s in enumerate(starts, 1):
    p = f"{d}/s{i:02d}.wav"; t = max(s, t_prev + 0.4 if i > 1 else s); dd = dur(p)
    place.append((i, s, t, dd)); t_prev = t + dd
cmd = ["ffmpeg","-y","-v","error"]
for i,*_ in place: cmd += ["-i", f"{d}/s{i:02d}.wav"]
f = "".join(f"[{k}]adelay={int(t*1000)}:all=1[a{k}];" for k,(i,s,t,dd) in enumerate(place))
f += "".join(f"[a{k}]" for k in range(len(place))) + f"amix=inputs={len(place)}:normalize=0"
subprocess.check_call(cmd + ["-filter_complex", f, "-b:a","192k", out])
for i,s,t,dd in place:
    flag = "  (晚 %.1fs)" % (t-s) if t-s > 0.05 else ""
    print(f"Shot {i:02d}: {int(t//60)}:{t%60:05.2f}–{int((t+dd)//60)}:{(t+dd)%60:05.2f}{flag}")
