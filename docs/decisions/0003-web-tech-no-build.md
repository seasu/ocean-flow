# 0003 純 JavaScript ES modules、自寫 WebGL、不加建置步驟

- 日期：2026-10-13
- 狀態：已確認（2026-11-06 起重新評估中，見 [0014](0014-tech-reevaluation.md)）
- 來源：Prototype 開始時的技術選擇

## 決定

- 遊戲是手機網頁：`index.html` + `src/*.js`（ES modules），直接用瀏覽器跑，不需要建置、沒有執行期相依套件。
- 3D 方塊世界用自寫 WebGL 渲染器（`src/gl.js`），不用 three.js。
- 存檔在瀏覽器 `localStorage`（`of-*` 與 `oceanflow.*` 鍵），目前沒有帳號與後端。

## 理由

雲端開發環境連不到 npm 與各家 CDN，自寫、無建置才能讓 AI 在雲端直接跑遊戲、截圖、驗證。

## 影響

- 加入建置步驟、框架、TypeScript、後端，都屬於重大架構變更，要 Product Owner 批准。
- 可以在不加建置的前提下用 JSDoc + `// @ts-check` 做型別檢查。
