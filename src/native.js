// App 版入口（iOS／Android，Capacitor）：網頁版直接載入 main.js，不會用到這支
// 載入順序：先接上原生背景定位 → 跑遊戲本體 → 遊戲沒出錯才告訴熱更新「這版能用」，
// 否則 20 秒後自動退回上一版（見 app/capacitor.config.json）
import './native-geo.js';
import './main.js';

const U = window.Capacitor.registerPlugin('CapacitorUpdater');
// 更新包由 .github/workflows/pages.yml 每次部署時產生
const FEED = 'https://seasu.github.io/ocean-flow/app-update/version.json';

U.notifyAppReady().catch(() => { });

const newer = (a, b) => {   // a 的版本號是否大於等於 b（1.34.0 這種格式）
  const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0);
  return true;
};

// 背景下載新版，下次打開 App（或從背景回來）時才換上，不打斷正在玩的人
async function checkUpdate() {
  const me = await (await fetch('bundle.json', { cache: 'no-store' })).json();
  const r = await fetch(FEED, { cache: 'no-store' });
  if (!r.ok) return;
  const v = await r.json();
  if (!(v.seq > me.seq)) return;
  const cur = await U.current();
  if (!newer(cur.native, v.minNative)) return;   // 原生部分改過，要從商店更新 App
  const { bundles = [] } = await U.list();
  let b = bundles.find(x => x.version === v.version);
  if (b?.status === 'error') return;   // 這版之前跑壞過、被退回，就不再試
  if (!b) b = await U.download({ url: v.url, version: v.version, checksum: v.sha256 });
  await U.next({ id: b.id });
}
setTimeout(() => checkUpdate().catch(e => console.warn('update check failed', e)), 5000);
