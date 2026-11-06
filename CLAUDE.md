# 《洋流：起源》給 Claude 的工作規則

《洋流》是結合真實走路、被動修行、小遊戲挑戰與台灣實境探索的手機 RPG。Product Owner 是 Seasu。

## 開工前先讀

1. [docs/decisions/README.md](docs/decisions/README.md)：已確認的決策索引。**不得自行改變已確認的方向**；有疑義就停下來問 Product Owner，或新增一份「待定」提案。
2. 目前的 Sprint：`docs/sprints/` 裡編號最大的檔案。
3. 依任務需要讀主文件（衝突時，已確認的決策優先）：
   - Project Foundation（產品願景）：`docs/foundation.md`
   - GDD（遊戲規則）：`docs/gdd.md`
   - World Bible（世界觀）：`docs/world-bible-v1.md`、`docs/world-chapters.md`
   - 尚未建立的文件，暫以 `docs/product-spec.md` 與 README 為參考。

## 專案結構

- 純 JavaScript ES modules、自寫 WebGL、**沒有建置步驟、沒有執行期相依套件**（決策 0003）。
- `index.html`：版面、CSS、HUD。`src/main.js`：主迴圈、操作、任務流程、HUD（約 2,000 行，高衝突檔）。
- `src/games/`：六種小遊戲。`src/geo.js`：現世定位與機緣點。`src/stories.js`：台北城市故事。`src/i18n.js`：繁中／英文／日文。
- `data/`：臺北旅遊網與 Wikimedia Commons 資料（由 Actions 產生，不要手改）。
- `app/`（PR #127 合併後）：Capacitor App，說明在 `docs/app.md`。
- `ocean-flow-origin/`：概念片製作檔案，影片各版本都保留，不要覆蓋。

## 怎麼跑、怎麼測

```sh
python3 -m http.server 8080      # 開 http://localhost:8080
```

- 網址參數：`?play` 跳過片頭、`?nofilm`、`?demo=n` 跳階、`?awake=n`、`?realm=n`、`?at=…`、`?nobattle`、`?game=sudoku|taphero|sigil|match3`、`?sim` 模擬定位、`?calib` 校正座標。完整列表見 README「本機執行」。
- 雲端環境已預裝 Chromium 與 Playwright（`require('playwright')` 可直接用），驗證畫面用 390×844。
- 自動化測試在 Sprint 2 建立；在那之前，至少用 Playwright 開 `?play&nofilm`，確認沒有 `pageerror`。
- 雲端連不到 npm、maven、gradle、臺北旅遊網：需要這些的工作放到 GitHub Actions。

## 必守規則

- 預設繁體中文；稱呼 Product Owner 用「你」。
- 改到遊戲行為或畫面就更新 `src/version.js`（大改版第一位、新功能第二位、修正第三位），PR 標題以版本號開頭（決策 0005）。
- 玩法、內容、範圍有修改，同一個 PR 更新 README（決策 0006）。
- UI 改動先用 skill `ocean-flow-design-guideline` 檢視，對照 `docs/design-principles.md`，附 390×844 截圖（決策 0007）。
- 遊戲內不提候選人、政黨、競選（決策 0001）。

## 協作流程（決策 0012）

- 一個 Sprint 一個 thread、一條分支。Lead Orchestrator（該 thread 的主 session）把任務交給 `developer` Agent 實作，再交給 `qa-reviewer` Agent 獨立驗證；QA 沒過就退回，來回兩次還不過就回報 Product Owner。
- 每個任務要有驗收條件與「擁有的檔案」清單。同一時間一個檔案只由一個 Agent 修改；`src/main.js`、`index.html`、`README.md` 同時只能有一個任務碰。
- PR 照 `.github/pull_request_template.md` 填：驗收條件勾選、QA 報告、截圖、相關決策。
- Sprint 結束時更新 `docs/sprints/` 的看板；有新決策就新增 `docs/decisions/` 檔案（狀態「待定」，等 Product Owner 確認）。

## 必須先得到 Product Owner 批准

重大架構變更（建置步驟、框架、語言、後端）、任何付費、合併到 `main`（等於發佈 GitHub Pages）、App 送審與上架、新增或修改 secrets、刪除檔案或資料、force push、對外發送訊息。
