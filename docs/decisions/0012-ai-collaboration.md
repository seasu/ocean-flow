# 0012 AI 協作治理：角色、批准關卡、檔案擁有權

- 日期：2026-11-06
- 狀態：已確認
- 來源：Seasu，專案 thread「建立洋流 AI 協作系統」

## 決定

### 角色

| 角色 | 由誰擔任 | 職責 |
|---|---|---|
| Product Owner | Seasu | 決定方向、批准、驗收 |
| 單一入口 | Claude 專案聊天 | 收需求、整理成任務卡、開 thread |
| Lead Orchestrator | 每個 Sprint 一個 thread 的 Claude Code session | 拆任務、派 Agent、統整成果、開 PR、向 Product Owner 交付 |
| Developer Agent | `.claude/agents/developer.md` | 在分支上實作、跑測試 |
| QA / Reviewer Agent | `.claude/agents/qa-reviewer.md` | 只看驗收條件與 diff，獨立驗證；沒有編輯權 |

### 規則

- 一個 Sprint 一個 thread、一條分支；Sprint 要小。
- 每個需求都要有明確的驗收條件；沒有就先問 Product Owner。
- 每次提交都要通過對應測試；QA 驗證沒過不交付。
- 同一時間一個檔案只由一個 Agent 修改。任務卡要列出擁有的檔案；`src/main.js`、`index.html`、`README.md` 是高衝突檔，同時只能有一個任務碰。
- AI Agent 的建議不得自行改變已確認的方向（見 [README](README.md) 規則）。

### 需要 Product Owner 批准

重大架構變更（建置步驟、框架、語言、後端）、任何付費、合併到 `main`（等於發佈）、App 送審與上架、新增或修改 secrets、刪除檔案或資料、force push、對外發送訊息。

## 影響

規則寫在 `CLAUDE.md`，每個 session 自動讀取。進度在 `docs/sprints/`，決策在本資料夾。
