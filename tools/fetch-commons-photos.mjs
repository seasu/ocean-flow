// 臺北旅遊網沒有的景點，改從維基百科條目取 Wikimedia Commons 的自由授權照片，存成 data/commons.json 與 data/photos/c-*.jpg
// 執行：node tools/fetch-commons-photos.mjs（需要能連到 wikipedia／wikimedia；這個 repo 用 GitHub Actions 跑）
import { mkdir, writeFile, readdir, rm } from 'node:fs/promises';

// 遊戲裡的 id → 中文維基百科條目（依序嘗試）
const WANT = {
  leopard: ['豹山 (臺北市)', '四獸山'], lion: ['獅山 (臺北市)', '四獸山'],
  city: ['臺北府城', '北門 (臺北)'], sea: ['龜山島'], peak: ['玉山'],
  shandao: ['善導寺 (臺北市)', '善導寺 (台北市)'], controlyuan: ['監察院大樓', '監察院'], jinan: ['濟南基督長老教會'],
  guanghua: ['光華商場'],
  turtle: ['龜山島'], kuroshio: ['黑潮'], taroko: ['太魯閣峽谷', '太魯閣國家公園'], sunmoon: ['日月潭'],
  yushan: ['玉山'], alishan: ['阿里山神木', '阿里山國家森林遊樂區'], kenting: ['鵝鑾鼻燈塔'],
};
const MAX = 3, UA = 'ocean-flow-prototype/1.0 (https://github.com/seasu/ocean-flow)';
const SKIP = /logo|map|flag|icon|locator|location|seal|emblem|coat|diagram|chart|關係|位置|地圖|標誌|\.svg$|\.gif$/i;

async function api(host, params) {
  const u = `https://${host}/w/api.php?` + new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params });
  for (let i = 0; i < 4; i++) {
    try { const r = await fetch(u, { headers: { 'user-agent': UA } }); if (r.ok) return await r.json(); console.warn(u, r.status); }
    catch (e) { console.warn(u, e.message); }
    await new Promise(res => setTimeout(res, 1500 * (i + 1)));
  }
  throw new Error('無法取得 ' + u);
}
const strip = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

await mkdir('data/photos', { recursive: true });
for (const f of await readdir('data/photos')) if (f.startsWith('c-')) await rm('data/photos/' + f);
const spots = {};
for (const [id, titles] of Object.entries(WANT)) {
  let page = null;
  for (const title of titles) {
    const j = await api('zh.wikipedia.org', { action: 'query', titles: title, redirects: '1', prop: 'pageimages|images|info', piprop: 'name', imlimit: '60', inprop: 'url' });
    const p = j.query?.pages?.[0];
    if (p && !p.missing) { page = p; break; }
  }
  if (!page) { console.log('沒找到條目', id, titles.join('/')); continue; }
  const names = [...new Set([page.pageimage && 'File:' + page.pageimage, ...(page.images || []).map(i => i.title)].filter(Boolean))]
    .map(n => n.replace(/^(檔案|文件|Image):/, 'File:')).filter(n => !SKIP.test(n));
  const images = [];
  for (let k = 0; k < names.length && images.length < MAX; k += 20) {
    const j = await api('commons.wikimedia.org', { action: 'query', titles: names.slice(k, k + 20).join('|'), prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1280' });
    const byName = Object.fromEntries((j.query?.pages || []).map(p => [p.title, p]));
    for (const n of names.slice(k, k + 20)) {
      const ii = byName[n]?.imageinfo?.[0];
      if (!ii || ii.mime !== 'image/jpeg' || ii.width < 900 || ii.width < ii.height * 0.9) continue;
      const m = ii.extmetadata || {};
      try {
        const r = await fetch(ii.thumburl || ii.url, { headers: { 'user-agent': UA } });
        if (!r.ok) { console.warn('photo', n, r.status); continue; }
        const file = `data/photos/c-${id}-${images.length + 1}.jpg`;
        await writeFile(file, Buffer.from(await r.arrayBuffer()));
        images.push({ file, subject: strip(m.ObjectName?.value) || n.replace(/^File:|\.jpe?g$/gi, ''), author: strip(m.Artist?.value).slice(0, 80), license: strip(m.LicenseShortName?.value), page: ii.descriptionurl });
      } catch (e) { console.warn('photo', n, e.message); }
      if (images.length >= MAX) break;
    }
  }
  spots[id] = { src: 'commons', name: page.title, url: page.fullurl, images };
  console.log(id, '→', page.title, images.length, '張照片');
}

await writeFile('data/commons.json', JSON.stringify({
  source: 'Wikimedia Commons（照片取自中文維基百科條目）',
  sourceUrl: 'https://commons.wikimedia.org/',
  license: '各照片依其標示的自由授權使用（作者與授權見 images[].author / license）',
  fetchedAt: new Date().toISOString(),
  spots,
}, null, 2) + '\n');
