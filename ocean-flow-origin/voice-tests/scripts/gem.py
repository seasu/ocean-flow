import json,os,sys,base64,urllib.request,time
model, voice, prompt, text, out = sys.argv[1:6]
body={"contents":[{"parts":[{"text":prompt+"\n\n"+text}]}],"generationConfig":{"responseModalities":["AUDIO"],"speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":voice}}}}}
url=f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
for attempt in range(4):
    try:
        r=json.load(urllib.request.urlopen(urllib.request.Request(url,data=json.dumps(body).encode(),headers={"Content-Type":"application/json","x-goog-api-key":os.environ["GEMINI_API_KEY"]}),timeout=180)); break
    except urllib.error.HTTPError as e:
        msg=e.read().decode(); print(e.code,msg[:300])
        if e.code in (429,500,503): time.sleep(10); continue
        sys.exit(1)
part=r["candidates"][0]["content"]["parts"][0]["inlineData"]
pcm=base64.b64decode(part["data"])
# 回傳的資料其實是一個完整 WAV（44 位元組檔頭＋data＋尾端 C2PA 內容憑證）。
# 之前當成純 PCM 播，檔頭會變成每句開頭的「茲」、憑證會變成結尾的「呲」。這裡只取 data 區塊。
if pcm[:4]==b"RIFF":
    import struct as _s
    i=12
    while i<len(pcm):
        cid,sz=pcm[i:i+4],_s.unpack("<I",pcm[i+4:i+8])[0]
        if cid==b"data": pcm=pcm[i+8:i+8+sz]; break
        i+=8+sz+(sz&1)
open(out+".pcm","wb").write(pcm)
os.system(f"ffmpeg -y -v error -f s16le -ar 24000 -ac 1 -i {out}.pcm {out}.wav && rm {out}.pcm")
