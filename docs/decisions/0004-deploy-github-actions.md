# 0004 部署全部走 GitHub Actions

- 日期：2026-10-13（網頁）、2026-10-17（App）
- 狀態：已確認
- 來源：Seasu

## 決定

- 網頁：合併到 `main` 時，`.github/workflows/pages.yml` 蓋上版本與 build sha 後發佈到 GitHub Pages（https://seasu.github.io/ocean-flow/）。
- 開放資料：`taipei-data.yml`（臺北旅遊網）、`commons-data.yml`（Wikimedia Commons）在 Actions 抓資料後提交回分支。
- App：建置、簽章、上架都在 GitHub Actions 完成，不靠本機 Mac。

## 影響

- **合併到 `main` 就等於發佈正式網址**，所以合併一律由 Product Owner 決定。
- 雲端開發環境連不到的服務（npm、maven、臺北旅遊網等）一律放到 Actions 處理。
