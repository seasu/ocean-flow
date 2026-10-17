// 把 repo 根目錄的網頁遊戲複製成 App 用的 www/
// 用法：node scripts/build-www.mjs [輸出資料夾]（預設 app/www）
// App 版和網頁版是同一份遊戲；只多做三件事：
//   1. 放進 capacitor.js（App 的原生橋接）
//   2. 入口改成 src/native.js（先接上背景定位，再載入 main.js，最後通知熱更新「這版能跑」）
//   3. 寫一份 bundle.json，記下這包遊戲的版本，熱更新用來比對新舊
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(app, '..');
const out = resolve(process.argv[2] || join(app, 'www'));

// 遊戲執行時會讀到的檔案；ocean-flow-origin/、docs/ 等製作資料不放進 App
const COPY = ['index.html', 'manifest.webmanifest', 'src', 'img', 'data', 'audio', 'video', 'icons'];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const p of COPY) cpSync(join(root, p), join(out, p), { recursive: true });

const core = join(app, 'node_modules/@capacitor/core/dist/capacitor.js');
if (!existsSync(core)) throw new Error('找不到 capacitor.js，先在 app/ 執行 npm install');
cpSync(core, join(out, 'capacitor.js'));

const MAIN = '<script type="module" src="src/main.js"></script>';
let html = readFileSync(join(out, 'index.html'), 'utf8');
if (!html.includes(MAIN)) throw new Error('index.html 找不到 main.js 的 script');
html = html.replace(MAIN, '<script type="module" src="src/native.js"></script>');
html = html.replace('<title>', '<script src="capacitor.js"></script>\n<title>');

const git = c => { try { return execSync(c, { cwd: root }).toString().trim(); } catch { return ''; } };
const ver = readFileSync(join(root, 'src/version.js'), 'utf8').match(/VERSION = '([^']+)'/)[1];
const sha = (process.env.GITHUB_SHA || git('git rev-parse HEAD') || 'dev').slice(0, 7);
const seq = Number(git('git log -1 --format=%ct')) || Math.floor(Date.now() / 1000);
const bundle = { version: `${ver}-${sha}`, name: ver, seq };
html = html.replace('__VERSION__', sha);
writeFileSync(join(out, 'index.html'), html);
writeFileSync(join(out, 'bundle.json'), JSON.stringify(bundle) + '\n');
console.log('www ready', out, bundle);
