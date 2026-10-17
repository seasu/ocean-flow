# 洋流 iOS／Android App

App 用 [Capacitor](https://capacitorjs.com/) 把現有的網頁遊戲包起來，遊戲程式只有一份，網頁版照常運作。建置、簽章、上架和熱更新全部在 GitHub Actions 完成，不需要在自己的電腦上建置。

## App 比網頁多了什麼

- **背景定位**：手機收起來、螢幕關掉也繼續記錄走的路，回到遊戲就換成修為（`src/native-geo.js`）。Android 會在通知列放一則「走路修行中」；iOS 會在狀態列顯示定位中。
- **不用加到主畫面**：直接從桌面圖示開，進去就是「啟程」主畫面。
- **熱更新**：改遊戲內容不用重新上架，見下面。

## 熱更新怎麼運作

1. 每次合併到 `main`，`.github/workflows/pages.yml` 除了部署網頁，也會把遊戲壓成更新包，放在 `https://seasu.github.io/ocean-flow/app-update/`（`version.json`＋`bundle-版本.zip`）。
2. App 啟動 5 秒後讀 `version.json`，有比較新的版本就在背景下載、驗證 SHA-256，下次打開 App 時換上新版，不打斷正在玩的人。
3. 新版啟動後如果遊戲本體出錯、沒跑起來，20 秒後自動退回上一版，而且之後不會再試這一版。
4. 原生部分（外掛、權限）有改時，把 `app/native.json` 的 `minNative` 改成新的版本號。比它舊的 App 不會收到熱更新，要從商店更新。

下載與切換用開源外掛 `@capgo/capacitor-updater` 的手動模式，更新來源是自己的 GitHub Pages，不用付費服務、也不回報資料給第三方。

## 建置（`.github/workflows/app.yml`）

推到 `main` 或 `claude/capacitor-app-*` 分支、改到遊戲或 `app/` 時自動建置，也可以在 Actions 頁面手動執行。

| | 沒設 Secrets | 設好 Secrets |
|---|---|---|
| Android | 產出測試版 APK（在 Actions 該次執行頁面下載，手機直接安裝） | 另外產出簽章 AAB；`main` 或手動勾「送商店測試」時送 Google Play 內部測試 |
| iOS | 在模擬器建置，確認能編譯 | `main` 或手動勾「送商店測試」時簽章並送 TestFlight |

原生專案（`app/android`、`app/ios`）不進 git，每次由 `app/scripts/make-native.mjs` 重新產生並補上權限、版本號。版本號用 `src/version.js`，建置編號用 Actions 的執行次數。

## Seasu 要自己做的事

這些需要你本人的帳號，Claude 沒辦法代做。做完把值填到 repo 的 **Settings → Secrets and variables → Actions**。

### iOS（TestFlight）

1. 加入 [Apple Developer Program](https://developer.apple.com/programs/)（每年 US$99）。
2. 在 [App Store Connect](https://appstoreconnect.apple.com/) 新增 App，Bundle ID 用 `io.github.seasu.oceanflow`（第一次可能要先到 Certificates, IDs & Profiles 註冊這個 ID）。
3. App Store Connect → 使用者與存取權限 → 整合 → App Store Connect API，產生一把「管理」權限的金鑰，下載 `.p8`。
4. 填 Secrets：
   - `APPLE_TEAM_ID`：開發者帳號的 Team ID
   - `ASC_KEY_ID`：金鑰 ID
   - `ASC_ISSUER_ID`：Issuer ID
   - `ASC_KEY_P8`：`.p8` 檔的整段內容

Xcode 會用這把金鑰自動管理憑證和描述檔，不用另外匯出憑證。

### Android（Google Play 內部測試）

1. 註冊 [Google Play Console](https://play.google.com/console)（一次 US$25）。
2. 產生上傳金鑰（任何有 Java 的電腦執行一次，密碼自己訂）：
   `keytool -genkeypair -v -keystore upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000`
3. 填 Secrets：
   - `ANDROID_KEYSTORE_BASE64`：`base64 -i upload.jks` 的輸出
   - `ANDROID_KEYSTORE_PASSWORD`、`ANDROID_KEY_ALIAS`（上面是 `upload`）、`ANDROID_KEY_PASSWORD`
4. Play Console 新增 App，套件名稱 `io.github.seasu.oceanflow`。**第一版 AAB 要手動上傳一次**（從 Actions 下載 `ocean-flow-android-release`），之後才能自動上傳。
5. Google Cloud 建一個服務帳戶並在 Play Console 授權「發布到測試軌道」，把 JSON 金鑰整段填到 `PLAY_SERVICE_ACCOUNT_JSON`。

### 上架前還要準備

- 隱私權政策網址（位置資料只在手機上判斷有沒有到景點，不上傳），兩個商店都要。
- 商店截圖、介紹文字。
- 背景定位要在審查說明裡寫清楚用途：記錄走路修行的距離。Google Play 對背景定位審查較嚴，目前用「前景服務＋常駐通知」的方式，只需要「使用 App 時」的定位權限。

## 還沒做、之後要評估

- 更新包目前是整包遊戲（約 55 MB，影片和照片占大部分），之後可以改成只下載有變的檔案。
- 手機內建計步器（Apple 健康、Google Fit）。
- 推播通知、帳號與雲端存檔。
