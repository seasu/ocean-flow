// 從「臺北旅遊網 Open API」抓遊戲用得到的景點介紹與照片，存成 data/taipei-travel.json 與 data/photos/
// 執行：node tools/fetch-taipei-travel.mjs（需要能連到 www.travel.taipei；這個 repo 用 GitHub Actions 跑）
import { mkdir, writeFile, rm } from 'node:fs/promises';

const API = 'https://www.travel.taipei/open-api/zh-tw/Attractions/All';
// 遊戲裡的 id → 名稱關鍵字（依序比對，越前面越優先）
const WANT = {
  elephant: ['象山'], tiger: ['虎山'], leopard: ['豹山'], lion: ['獅山'], shoushan: ['四獸山'],
  huashan: ['華山1914'], shandao: ['善導寺'], controlyuan: ['監察院'], jinan: ['濟南教會', '濟南基督長老教會'],
  qidong: ['臺灣文學基地', '台灣文學基地', '齊東詩舍'], guanghua: ['光華數位新天地', '光華商場'],
  station: ['臺北車站', '台北車站'], '101': ['臺北101', '台北101'],
};
const MAX_PHOTOS = 3;

async function getJSON(url) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'ocean-flow-prototype' } });
      if (r.ok) return await r.json();
      console.warn(url, r.status);
    } catch (e) { console.warn(url, e.message); }
    await new Promise(res => setTimeout(res, 1500 * (i + 1)));
  }
  throw new Error('無法取得 ' + url);
}

const all = [];
for (let page = 1; page < 60; page++) {
  const j = await getJSON(`${API}?page=${page}`);
  if (!j.data || !j.data.length) break;
  all.push(...j.data);
  if (all.length >= (j.total || Infinity)) break;
}
console.log('attractions', all.length);
if (process.env.DEBUG) {
  const near = all.filter(a => /豹|獅|四獸|善導|監察|濟南|光華|象山|虎山/.test(a.name)).map(a => ({ id: a.id, name: a.name, images: a.images }));
  const sample = Object.fromEntries(Object.entries(all.find(a => a.name.includes('象山')) || all[0]).map(([k, v]) => [k, typeof v === 'string' ? v.slice(0, 80) : v]));
  await mkdir('data', { recursive: true });
  await writeFile('data/debug.json', JSON.stringify({ near, sample }, null, 2));
}

const pick = keys => {
  for (const k of keys) {
    const hits = all.filter(a => (a.name || '').includes(k));
    if (hits.length) return hits.sort((a, b) => (b.images?.length || 0) - (a.images?.length || 0) || a.name.length - b.name.length)[0];
  }
  return null;
};

await rm('data/photos', { recursive: true, force: true });
await mkdir('data/photos', { recursive: true });
const spots = {};
for (const [id, keys] of Object.entries(WANT)) {
  const a = pick(keys);
  if (!a) { console.log('沒找到', id, keys.join('/')); continue; }
  const images = [];
  for (const im of (a.images || []).slice(0, MAX_PHOTOS)) {
    try {
      const r = await fetch(im.src);
      if (!r.ok) continue;
      const ext = (im.ext || '.jpg').replace(/[^.a-z]/gi, '') || '.jpg';
      const file = `data/photos/${id}-${images.length + 1}${ext}`;
      await writeFile(file, Buffer.from(await r.arrayBuffer()));
      images.push({ file, subject: im.subject || '', src: im.src });
    } catch (e) { console.warn('photo', im.src, e.message); }
  }
  spots[id] = { name: a.name, introduction: (a.introduction || '').trim(), address: a.address || '', url: a.url || '', modified: a.modified || '', images };
  console.log(id, '→', a.name, images.length, '張照片');
}

await writeFile('data/taipei-travel.json', JSON.stringify({
  source: '臺北旅遊網 Open API（臺北市政府觀光傳播局）',
  sourceUrl: 'https://www.travel.taipei/open-api',
  license: '依臺北市政府資料開放授權條款使用，需標示出處；使用前請再確認最新條款',
  fetchedAt: new Date().toISOString(),
  spots,
}, null, 2) + '\n');
