# Sprint 01 地基

- 目標：讓任何新的 session 只讀 repo 就能接手，並建立 Developer／QA 分工。不改遊戲程式。
- 分支：`claude/project-thread-hq2oow`
- PR：https://github.com/seasu/ocean-flow/pull/128
- 狀態：待驗收
- 計畫文件：https://claude.ai/artifact/RV4DkrdrsK9iZkLx54bhiC

## 任務

| # | 任務 | 擁有的檔案 | 驗收條件 | 狀態 | QA |
|---|---|---|---|---|---|
| S1-1 | 決策紀錄，回填既有決策與 2026-11-06 的決定 | `docs/decisions/` | 每份有日期、狀態、來源、決定、影響；索引列出全部；含獨立 IP、八章、技術、部署、版本號、README 同步、UI 規範、核心玩法、階段、App、IP 歸屬、AI 協作、主文件體系；技術路線重新評估標「待定」 | 完成 | 見 PR |
| S1-4 | CLAUDE.md 與兩個 Agent | `CLAUDE.md`、`.claude/agents/`、`.claude/settings.json` | 只讀 repo 就能答出怎麼跑、怎麼測、版本規則、哪些要批准；QA Agent 工具不含 Edit、Write；settings.json 是合法 JSON 並禁止 force push 與直接 push main | 完成 | 見 PR |
| S1-5 | 看板與 PR 範本 | `docs/sprints/`、`.github/pull_request_template.md` | 看板有 Roadmap 與本 Sprint 任務；PR 範本含驗收條件、QA 報告、截圖、相關決策 | 完成 | 見 PR |

測試基線（原 S1-3）與 Foundation／GDD（原 S1-2）移到 Sprint 02；處理 PR #127 移到 Sprint 04。

## 需要 Product Owner 的事

- 決定技術路線（決策 0014）。
- 審閱 `docs/decisions/`：內容正確就合併本 PR，合併即代表這些決策「已確認」。
