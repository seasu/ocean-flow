// 過關的全畫面動畫：一隻隻（或一盞盞）落地，接著一起發出聲響——點一下或約 8 秒後收起
// 第一階 四獸共鳴：象、虎、豹、獅齊吼；第二階 七個故事歸來：七盞故事燈依序亮起；第三階 三流歸一：龍、龜、熊齊吼
import { sfx } from './audio.js';
import { t } from './i18n.js';

const el = document.createElement('div');
el.id = 'roar'; el.hidden = true;
document.body.appendChild(el);

const BELLS = [146.8, 196, 220, 174.6, 246.9, 293.7, 329.6];
// opts: { title, sub, beasts: ['elephant', ...] 或 lamps: ['五分埔', ...], kind: 'four'|'tales'|'flows' }
export function roar(sub, opts = {}) {
  const beasts = opts.beasts || (opts.lamps ? null : ['elephant', 'tiger', 'leopard', 'lion']);
  const items = beasts || opts.lamps, n = items.length;
  const beastImg = { city: 'dragon', sea: 'turtle', peak: 'bear' };
  el.className = opts.kind || 'four';
  el.innerHTML = `<div class="rays"></div><div class="wave"></div><div class="wave w2"></div><div class="wave w3"></div>
  <div class="pack n${n}">${items.map((k, i) => beasts
    ? `<div class="beast b${i}"><img src="img/beasts/${beastImg[k] || k}.png" alt=""><b>${t('beast_' + k)}</b></div>`
    : `<div class="lamp b${i}"><i></i><b>${k}</b></div>`).join('')}</div>
  <div class="txt"><h2>${opts.title || t('resonance')}</h2><p>${sub}</p></div><small class="tap">${t('tapNext')}</small>`;
  // 每一個登場的間隔；全部到齊後齊鳴
  const step = beasts ? 330 : 240, hitAt = 250 + n * step + 300;
  el.style.setProperty('--hit', hitAt + 'ms');
  el.querySelectorAll('.pack > div').forEach((d, i) => d.style.setProperty('--d', (250 + i * step) + 'ms'));
  return new Promise(res => {
    el.hidden = false; el.classList.remove('go', 'out'); void el.offsetWidth; el.classList.add('go');
    const ts = items.map((_, i) => setTimeout(() => sfx.bell(BELLS[i % BELLS.length] * (beasts ? 1 : 2)), 250 + i * step));
    ts.push(setTimeout(() => {
      if (beasts) sfx.roar(); else [293.7, 370, 440, 587.3].forEach((f, i) => setTimeout(() => sfx.bell(f), i * 90));
      try { navigator.vibrate && navigator.vibrate(beasts ? [90, 40, 220] : [40, 40, 40, 40, 120]); } catch { }
    }, hitAt));
    let done = false;
    const close = () => {
      if (done) return; done = true; ts.forEach(clearTimeout); clearTimeout(auto);
      el.classList.add('out'); setTimeout(() => { el.hidden = true; el.classList.remove('go', 'out'); res(); }, 450);
    };
    const auto = setTimeout(close, hitAt + 6000);
    const t0 = performance.now();
    el.onclick = e => { e.stopPropagation(); if (performance.now() - t0 > 1200) close(); };
  });
}
