// 產生 iOS／Android 原生專案並補上洋流需要的設定
// 用法：node scripts/make-native.mjs android|ios   （先跑過 npm run build）
// 原生專案不進 git，每次在 GitHub Actions 重新產生；要改權限、版本號就改這支
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const platform = process.argv[2];
if (!['android', 'ios'].includes(platform)) throw new Error('用法：make-native.mjs android|ios');
const run = c => { console.log('$', c); execSync(c, { cwd: app, stdio: 'inherit' }); };
const edit = (f, fn) => { const p = join(app, f), s = readFileSync(p, 'utf8'), t = fn(s); if (t === s) throw new Error('沒有改到 ' + f); writeFileSync(p, t); };

const version = readFileSync(join(app, '../src/version.js'), 'utf8').match(/VERSION = '([^']+)'/)[1];
const build = String(process.env.OF_BUILD || 1);

if (!existsSync(join(app, platform))) run(`npx cap add ${platform}`);
run(`npx @capacitor/assets generate --${platform} --iconBackgroundColor "#0a1018" --iconBackgroundColorDark "#0a1018" --splashBackgroundColor "#0a1018" --splashBackgroundColorDark "#0a1018"`);

const LOC = {
  NSLocationWhenInUseUsageDescription: '洋流用你的位置判斷你走到哪個景點，並把真實走的路換成修為。',
  NSLocationAlwaysAndWhenInUseUsageDescription: '手機收起來時也繼續記錄你走的路，回到遊戲就能拿到修為。',
  NSLocationAlwaysUsageDescription: '手機收起來時也繼續記錄你走的路，回到遊戲就能拿到修為。',
  NSCameraUsageDescription: '拍一張照片當作你的頭像。',
  NSPhotoLibraryUsageDescription: '從相簿選一張照片當作你的頭像。',
};

if (platform === 'android') {
  edit('android/app/src/main/AndroidManifest.xml', s => s.replace('</manifest>', [
    '    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />',
    '    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />',
    '    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />',
    '    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />',
    '    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />',
    '    <uses-feature android:name="android.hardware.location.gps" android:required="false" />',
    '</manifest>'].join('\n')));
  edit('android/app/build.gradle', s => s
    .replace(/versionCode \d+/, `versionCode ${build}`)
    .replace(/versionName "[^"]*"/, `versionName "${version}"`)
    // 正式版簽章：有 OF_KEYSTORE 環境變數（GitHub Secrets 解出來的檔案）才簽
    + `
android {
    signingConfigs {
        release {
            if (System.getenv("OF_KEYSTORE")) {
                storeFile file(System.getenv("OF_KEYSTORE"))
                storePassword System.getenv("OF_KEYSTORE_PASSWORD")
                keyAlias System.getenv("OF_KEY_ALIAS")
                keyPassword System.getenv("OF_KEY_PASSWORD")
            }
        }
    }
    buildTypes { release { if (System.getenv("OF_KEYSTORE")) signingConfig signingConfigs.release } }
}
`);
  // 背景記錄走路時，通知列上的常駐通知
  edit('android/app/src/main/res/values/strings.xml', s => s.replace(/(<string name="app_name">)[^<]*/, '$1洋流').replace('</resources>',
    '    <string name="capacitor_background_geolocation_notification_channel_name">走路修行</string>\n</resources>'));
}

if (platform === 'ios') {
  const kv = Object.entries(LOC).map(([k, v]) => `\t<key>${k}</key>\n\t<string>${v}</string>`).join('\n');
  edit('ios/App/App/Info.plist', s => s
    .replace(/<key>CFBundleDisplayName<\/key>\s*<string>[^<]*<\/string>/, '<key>CFBundleDisplayName</key>\n\t<string>洋流</string>')
    .replace(/<\/dict>\s*<\/plist>\s*$/, `${kv}
\t<key>UIBackgroundModes</key>
\t<array>
\t\t<string>location</string>
\t</array>
\t<key>ITSAppUsesNonExemptEncryption</key>
\t<false/>
</dict>
</plist>
`));
  edit('ios/App/App.xcodeproj/project.pbxproj', s => s
    .replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`)
    .replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${build};`));
}

run(`npx cap sync ${platform}`);
console.log(platform, 'ready', version, build);
