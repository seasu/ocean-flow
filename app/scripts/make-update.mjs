// 熱更新包：把 build-www.mjs 做好的 www 壓成 zip，並寫 version.json 讓 App 檢查
// 用法：node scripts/make-update.mjs <www 資料夾> <輸出資料夾> <網址前綴>
// .github/workflows/pages.yml 每次部署都會跑，輸出到 GitHub Pages 的 app-update/
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [www, out, base] = process.argv.slice(2).map((a, i) => i < 2 ? resolve(a) : a);
if (!www || !out || !base) throw new Error('用法：make-update.mjs <www> <out> <url>');

const bundle = JSON.parse(readFileSync(join(www, 'bundle.json'), 'utf8'));
const { minNative } = JSON.parse(readFileSync(join(app, 'native.json'), 'utf8'));
mkdirSync(out, { recursive: true });
const name = `bundle-${bundle.version}.zip`, zip = join(out, name);
execFileSync('zip', ['-qrX', zip, '.'], { cwd: www });
const sha256 = createHash('sha256').update(readFileSync(zip)).digest('hex');
const feed = { ...bundle, minNative, url: base.replace(/\/?$/, '/') + name, sha256 };
writeFileSync(join(out, 'version.json'), JSON.stringify(feed, null, 2) + '\n');
console.log('update ready', feed);
