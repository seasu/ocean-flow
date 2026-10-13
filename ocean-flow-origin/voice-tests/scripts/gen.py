import json, os, sys, base64, urllib.request, subprocess, re
OUT = sys.argv[1]; lang = sys.argv[2]; voice = sys.argv[3]
rate = float(sys.argv[4]); pitch = float(sys.argv[5])
os.makedirs(OUT, exist_ok=True)
ZH = [
 (0,  "我們一直以為，世界只有眼睛看見的樣子。"),
 (6,  "城市、山脈、海洋、人群，各自存在，彼此分離。"),
 (12, "直到有一天，"),
 (15, "有人在山中聽見不存在的鐘聲，有人在海邊看見逆光流動的痕跡，有人在夢裡，走進同一座從未見過的山門。"),
 (26, "我們開始明白，這個世界，從來不只一層。"),
 (34, "山有脈，海有流，人，亦有自己的道。"),
 (42, "那些被古人稱為氣、脈、道的存在，也許從未消失。只是人類，曾經失去感知它的能力。"),
 (50, "而現在，台灣，成為第一個重新啟流的地方。"),
 (58, "山脈甦醒，海流共鳴，城市之中，也出現靈界的回聲。"),
 (67, "有人開始修行，有人尋找宗門，有人踏上現世的路，只為了在靈界中，找到自己的機緣。"),
 (76, "這不是結束，而是一切的開始。這裡，是起源。"),
 (84, "洋流，起源。走出去，遇見你的機緣。"),
]
EN = [
 (0,  "We always believed the world was only what our eyes could see."),
 (6,  "Cities, mountains, oceans, people... each on its own, each apart."),
 (12, "Until one day..."),
 (15, "Someone heard a bell in the mountains that did not exist. Someone saw light flowing against the tide. Someone dreamed of a mountain gate they had never seen."),
 (26, "And we began to understand: this world was never just one layer."),
 (34, "Mountains have veins. Seas have currents. And every person has a path of their own."),
 (42, "What the ancients called qi, veins, and the Way never truly vanished. We simply lost the power to sense it."),
 (50, "And now, Taiwan becomes the first place where the flow awakens again."),
 (58, "Mountains wake. Currents answer. Even in the city, the spirit realm echoes."),
 (67, "Some begin to cultivate. Some seek a sect. Some walk the roads of this world, to find their destiny in the other."),
 (76, "This is not the end. It is the beginning of everything. This... is the origin."),
 (84, "Ocean Flow: Origin. Step out, and meet your destiny."),
]
lines = ZH if lang.startswith("cmn") else EN
key = os.environ["GOOGLE_API_KEY"]
chirp = "Chirp" in voice
def ssml(t):
    if lang.startswith("cmn"):
        t = re.sub(r"([。])", r'\1<break time="650ms"/>', t)
        t = re.sub(r"([，、])", r'\1<break time="280ms"/>', t)
    else:
        t = t.replace("...", '<break time="600ms"/>')
        t = re.sub(r"([.:])(\s)", r'\1<break time="800ms"/>\2', t)
        t = re.sub(r"(,)(\s)", r'\1<break time="350ms"/>\2', t)
    return "<speak>" + t + "</speak>"
for i, (start, text) in enumerate(lines, 1):
    inp = {"text": text} if chirp else {"ssml": ssml(text)}
    ac = {"audioEncoding": "LINEAR16", "sampleRateHertz": 24000, "speakingRate": rate}
    if not chirp: ac["pitch"] = pitch
    body = {"input": inp, "voice": {"languageCode": lang, "name": voice}, "audioConfig": ac}
    req = urllib.request.Request(f"https://texttospeech.googleapis.com/v1/text:synthesize?key={key}",
        data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    try:
        r = json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        print(e.read().decode()); raise
    p = f"{OUT}/s{i:02d}.wav"
    open(p, "wb").write(base64.b64decode(r["audioContent"]))
    d = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]))
    print(f"{i:02d} start={start} dur={d:.2f}")
json.dump([s for s,_ in lines], open(f"{OUT}/starts.json","w"))
