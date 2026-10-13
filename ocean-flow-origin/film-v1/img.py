# 用 Gemini 圖像模型依分鏡 Prompt 生成 16:9 關鍵畫面：python3 img.py <key> "<prompt>"
import json, os, sys, base64, urllib.request, time
key, prompt = sys.argv[1], sys.argv[2]
model = os.environ.get("IMG_MODEL", "gemini-3-pro-image")
STYLE = ("16:9 cinematic film still for the world-building trailer 'Ocean Flow: Origin', set in modern Taiwan. "
         "High-end, ethereal, solemn, clean composition, photographic realism with subtle mystical light. "
         "No text, no captions, no watermark, no logos. Avoid: Chinese palace costume drama look, cartoon style, garish neon cyberpunk, tourism-ad look, political symbols.")
body = {"contents":[{"parts":[{"text": prompt + "\n\n" + STYLE}]}],
        "generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":"16:9","imageSize":"2K"}}}
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
for attempt in range(4):
    try:
        r = json.load(urllib.request.urlopen(urllib.request.Request(url, data=json.dumps(body).encode(),
            headers={"Content-Type":"application/json","x-goog-api-key":os.environ["GEMINI_API_KEY"]}), timeout=300)); break
    except urllib.error.HTTPError as e:
        print(key, e.code, e.read().decode()[:300])
        if e.code in (429,500,503): time.sleep(15); continue
        sys.exit(1)
for p in r["candidates"][0]["content"]["parts"]:
    if "inlineData" in p:
        ext = "png" if "png" in p["inlineData"]["mimeType"] else "jpg"
        open(f"frames/{key}.{ext}","wb").write(base64.b64decode(p["inlineData"]["data"])); print(key, "ok", ext); break
else: print(key, "no image", json.dumps(r)[:300])
