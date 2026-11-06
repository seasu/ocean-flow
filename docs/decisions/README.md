# 決策紀錄（Decisions）

《洋流》已確認的產品與技術決策。**Git 是唯一事實來源**：專案記憶、聊天、PR 討論裡的結論，確認後都要寫進這裡才算數。

## 規則

- 一個決策一個檔案：`NNNN-短標題.md`，編號遞增、不重用。
- 狀態只有三種：**已確認**（Product Owner 同意）、**待定**（已提出、等 Product Owner 決定）、**已取代**（寫明被哪一份取代）。
- 只有 Product Owner（Seasu）能把決策標成「已確認」。AI Agent 可以新增「待定」的提案，但**不得自行改變已確認的方向**；要改，就新增一份提案並標「待定」，等 Product Owner 決定。
- 已確認的決策不改寫內容；方向改了就新增一份，舊的改成「已取代」並連到新的。
- 每份寫：日期、狀態、來源（誰在哪裡決定）、決定內容、影響。

## 範本

```md
# NNNN 標題

- 日期：YYYY-MM-DD
- 狀態：待定 | 已確認 | 已取代（→ NNNN）
- 來源：

## 決定

## 理由

## 影響
```

## 索引

| # | 決策 | 狀態 |
|---|---|---|
| [0001](0001-independent-ip.md) | 獨立 IP，不把候選人、政黨、競選寫進故事 | 已確認 |
| [0002](0002-eight-chapters.md) | 世界觀採八章架構 | 已確認 |
| [0003](0003-web-tech-no-build.md) | 純 JavaScript ES modules、自寫 WebGL、不加建置步驟 | 已確認（重新評估中，見 0014） |
| [0004](0004-deploy-github-actions.md) | 部署全部走 GitHub Actions | 已確認 |
| [0005](0005-versioning.md) | 對外語意版本號規則 | 已確認 |
| [0006](0006-readme-sync.md) | 企劃改動同一個 PR 更新 README | 已確認 |
| [0007](0007-ui-rules.md) | UI 改動先過設計規範與設計原則 | 已確認 |
| [0008](0008-core-gameplay.md) | 核心玩法：走路修行、靈光與機緣、四門小遊戲 | 已確認 |
| [0009](0009-stages-taipei-gongliao.md) | 第一階段台北《靈脈初醒》、之後貢寮《山海初行》；四門改回真實四獸山 | 已確認 |
| [0010](0010-capacitor-app-release.md) | 用 Capacitor 做 iOS／Android App 並上架 | 已確認 |
| [0011](0011-ip-ownership-partnership.md) | 智慧財產權歸團隊、合作以補助為優先 | 已確認 |
| [0012](0012-ai-collaboration.md) | AI 協作治理：角色、批准關卡、檔案擁有權 | 已確認 |
| [0013](0013-source-documents.md) | 主文件體系：Foundation、GDD、World Bible、Decisions | 已確認 |
| [0014](0014-tech-reevaluation.md) | 技術路線重新評估（網頁 + Capacitor／Flutter／遊戲引擎） | 待定 |
