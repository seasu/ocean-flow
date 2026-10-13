# 《洋流：起源》製作紀錄

整理自專案討論（2026-10-12 至 10-13），記錄每個決定和它的理由。

## 影片定位

- 《洋流》IP 第一支母影片：90 秒世界觀概念片，12 鏡，現世 → 啟流 → 靈界。
- 基準文件：[製作包 v1](production-package-v1.md)、[英文旁白 v1](narration-en-v1.md)。
- 動態分鏡板：https://claude.ai/artifact/5bj5wVYxkhh6yhc7JwHqtv

## 旁白聲線

| 時間 | 決定 |
|---|---|
| 10-12 | 想要滄桑老者、繁中。先用 Kokoro 離線模型試節奏（大陸口音，只當參考）。 |
| 10-12 | 改用 Google Cloud TTS：中文 cmn-TW Wavenet B/C，英文 Chirp3 Charon／Algenib。 |
| 10-12 | 要「像暗黑破壞神說故事」、**不要回音** → `*_diablo.mp3`。之後所有版本都不加殘響。 |
| 10-12 | 英文定案 `narration-90s_en_google-charon_diablo.mp3`。中文不要放慢、壓低、加低頻 → `*_wavenetB_natural.mp3`。 |
| 10-12 | 想要真正的老者聲 → 改 Gemini TTS，可用文字指定語氣。 |
| 10-12 | 「不要奇怪的調整，聽原始的」→ 原始輸出、不加速不 EQ。 |
| 10-12 | 不要台灣口音、要渾厚 → 標準普通話深沉老者（`scripts/gemini-deep-prompt.txt`）。 |
| 10-12 | **中文定案：Gemini Algenib** → `voice-tests/narration_zh_gemini-algenib_deep.mp3`。 |

技術備忘：Gemini 回傳的是完整 WAV（含檔頭與 C2PA 憑證），要只取 data 區塊，否則每句開頭會有爆音、結尾有雜音（`scripts/gem.py` 已處理）。

## 影片版本

| 版本 | 檔案 | 說明 |
|---|---|---|
| v1 靜態動態分鏡 | [films/ocean-flow-origin_zh_v1.mp4](../films/ocean-flow-origin_zh_v1.mp4) | 14 張 Gemini 生成關鍵畫面＋推拉運鏡＋交叉淡化，1:54、1080p（`film-v1/`）。 |
| v2 動態版 | [films/ocean-flow-origin_zh_v2_animated.mp4](../films/ocean-flow-origin_zh_v2_animated.mp4) | v1 疊加飄霧、光點、流光循環圖層（`film-v1/fx.py`）。 |
| 網頁動畫版 | https://claude.ai/artifact/WbWCJFnRApxgmA3zEiV1dY | 決定**不用 Gemini/Veo 做動畫**（估價 US$9–92 後選先不做），改用 JS 動畫：GSAP 時間軸＋canvas（`film-js/`）。 |

## 配樂

- 片尾要「氣勢滂薄」：`film-js/music/score.py` 純 numpy 合成（鈸、太鼓、重擊、銅管、合唱）。
- 「聲音沒有連續」、前段要輕柔神秘 → 全片配樂 `bed.py`＋`score.py`，`mix.sh` 混音並側鏈壓縮讓旁白清楚 → `narration_bgm.mp3`。

## 遊戲感／方塊風格（10-13）

- 討論影片要不要更有 Roblox 遊戲感 → 先做單鏡方塊樣片：https://claude.ai/artifact/Wpmp42DqDpUnPxYgpZSYRn（`blocky-sample/`）。
- 角色設定圖「洋流 Ocean Currents」藍色款／橘色款（`character-ref/`）：藍＝阿流（玩家），橘＝阿汐（夥伴），名字暫定。
- **選定混合版**：Shot 01–07 維持寫實圖，Shot 08「而現在，台灣」光爆起進入方塊世界（`film-js/world.js`，網頁動畫 v4）。整支改版尚未完成。
