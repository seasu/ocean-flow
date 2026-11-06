# 0010 用 Capacitor 做 iOS／Android App 並上架

- 日期：2026-10-17（App 化）、2026-11-06（上架）
- 狀態：已確認
- 來源：Seasu。上架的決定在專案 thread「建立洋流 AI 協作系統」回覆 D3

## 決定

- 用 Capacitor 包現有網頁遊戲，做 iOS 與 Android App（PR #127，說明在 `docs/app.md`）。網頁版繼續保留。
- 背景定位走路、自建熱更新（`@capgo/capacitor-updater` 手動模式）、Actions 建置。
- Seasu 已有 Apple 與 Google 開發者帳號，**要上架**。流程：先 TestFlight 與 Play 內部測試，Product Owner 在自己手機確認後再送審。

## 影響

- 簽章 secrets 由 Product Owner 自己在 GitHub 設定，AI 不經手憑證內容。
- 原生改動要提高 `app/native.json` 的 `minNative`。
- 若 0014 改變技術路線，本決策要一起重新檢視。
