# 靜態關鍵畫面 + 緩慢運鏡 + 交叉淡化 + 旁白 → MP4。畫面切換跟著每鏡旁白實際開始的時間。
import json, subprocess, sys, os
from concurrent.futures import ThreadPoolExecutor
SH = "/mnt/project-files/ocean-flow-origin/voice-tests/gemini-algenib-shots"
NAR = "/mnt/project-files/ocean-flow-origin/voice-tests/narration_zh_gemini-algenib_deep.mp3"
OUT = sys.argv[1] if len(sys.argv) > 1 else "ocean-flow-origin_zh_v1.mp4"
FONT = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
T, FPS, TAIL = 0.8, 25, 3.5
# 每鏡疊的動態圖層與強度（screen 混合）；ANIM=0 時不疊
FX = {"01":{"fog":.22},"02":{"fog":.18},"03":{"fog":.3,"motes":.3},"04a":{"fog":.3,"motes":.6},"04b":{"motes":.45,"flow":.35},
      "04c":{"fog":.45,"motes":.3},"05":{"motes":.5,"flow":.45},"06":{"flow":.4,"motes":.45},"07":{"motes":.45},
      "08":{"fog":.25,"motes":.45},"09":{"fog":.3,"motes":.45},"10":{"motes":.4},"11":{"flow":.4,"motes":.45},"12":{"flow":.3,"motes":.35}}
ANIM = os.environ.get("ANIM", "1") == "1"
dur = lambda p: float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]))
starts = json.load(open(f"{SH}/starts.json"))
t_prev = 0; placed = []
for i, s in enumerate(starts, 1):            # 與 raw.py 相同的排法
    t = max(s, t_prev + 0.4 if i > 1 else s); placed.append(t); t_prev = t + dur(f"{SH}/s{i:02d}.wav")
end = t_prev + TAIL
cuts = []                                     # (圖, 開始, 結束)
for i, t in enumerate(placed):
    nxt = placed[i+1] if i+1 < len(placed) else end
    if i == 3:                                # Shot 04 三個異象平分
        third = (nxt - t) / 3
        cuts += [("04a", t, t+third), ("04b", t+third, t+2*third), ("04c", t+2*third, nxt)]
    else: cuts.append((f"{i+1:02d}", 0 if i == 0 else t, nxt))
os.makedirs("seg", exist_ok=True)
def seg(k):
    img, a, b = cuts[k]
    L = (b - a) + (T/2 if k > 0 else 0) + (T/2 if k < len(cuts)-1 else 0)
    n = int(round(L * FPS)); zin = k % 2 == 0   # 交替推近 / 拉遠
    z = f"1+0.08*on/{n}" if zin else f"1.08-0.08*on/{n}"
    pre = "crop=iw*0.78:ih*0.78," if img == "12" else ""   # 12 號圖自帶上下黑邊，裁掉
    vf = (pre + f"scale=3840:-2,zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s=1920x1080:fps={FPS}")
    vf = f"[0:v]{vf},format=gbrp[b0];"; ins = []; last = "b0"
    for j, (layer, op) in enumerate((FX.get(img, {}) if ANIM else {}).items(), 1):
        ins += ["-stream_loop","-1","-ss",str((k*3.7) % 16),"-i",f"fx/{layer}.mp4"]
        vf += f"[{j}:v]format=gbrp,trim=duration={L:.3f},setpts=PTS-STARTPTS[o{j}];[{last}][o{j}]blend=all_mode=screen:all_opacity={op}[b{j}];"
        last = f"b{j}"
    vf += f"[{last}]format=yuv420p"
    if img == "12":
        ta = 0.8
        vf += (f",drawtext=fontfile={FONT}:text='洋流：起源':fontsize=110:fontcolor=white:x=(w-tw)/2:y=h*0.40:alpha='min(1,max(0,(t-{ta})/1.5))'"
               f",drawtext=fontfile={FONT}:text='走出去，遇見你的機緣。':fontsize=48:fontcolor=0xD8E4F0:x=(w-tw)/2:y=h*0.56:alpha='min(1,max(0,(t-{ta+1.2})/1.5))'")
    if k == len(cuts)-1: vf += f",fade=t=out:st={L-1.5:.2f}:d=1.5"
    if k == 0: vf += ",fade=t=in:st=0:d=1"
    subprocess.check_call(["ffmpeg","-y","-v","error","-loop","1","-i",f"frames/{img}.jpg"] + ins + ["-filter_complex",vf,"-frames:v",str(n),
                           "-c:v","libx264","-preset","medium","-crf","18","-pix_fmt","yuv420p",f"seg/{k:02d}.mp4"])
    return L
with ThreadPoolExecutor(6) as ex: Ls = list(ex.map(seg, range(len(cuts))))
cmd = ["ffmpeg","-y","-v","error"]
for k in range(len(cuts)): cmd += ["-i", f"seg/{k:02d}.mp4"]
cmd += ["-i", NAR]
f = ""; prev = "[0:v]"
for k in range(1, len(cuts)):
    off = cuts[k][1] - T/2
    f += f"{prev}[{k}:v]xfade=transition=fade:duration={T}:offset={off:.3f}[x{k}];"; prev = f"[x{k}]"
f += f"[{len(cuts)}:a]apad=whole_dur={end:.3f},atrim=0:{end:.3f}[a]"
cmd += ["-filter_complex", f, "-map", prev, "-map", "[a]", "-c:v","libx264","-preset","medium","-crf","18","-pix_fmt","yuv420p",
        "-c:a","aac","-b:a","192k","-movflags","+faststart", OUT]
subprocess.check_call(cmd)
for img, a, b in cuts: print(f"{img}: {int(a//60)}:{a%60:05.2f}–{int(b//60)}:{b%60:05.2f}")
print("total", round(end, 2))
