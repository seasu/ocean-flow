// 四獸共鳴：四座靈門都開了，象、虎、豹、獅一隻隻落地，接著一起仰天怒吼——全畫面短動畫，點一下或約 8 秒後收起
import { sfx } from './audio.js';
import { t } from './i18n.js';

const BEASTS = ['elephant', 'tiger', 'leopard', 'lion'];
const el = document.createElement('div');
el.id = 'roar'; el.hidden = true;
el.innerHTML = `<div class="rays"></div><div class="wave"></div><div class="wave w2"></div><div class="wave w3"></div>
  <div class="pack">${BEASTS.map((k, i) => `<div class="beast b${i}"><img src="img/beasts/${k}.png" alt=""><b></b></div>`).join('')}</div>
  <div class="txt"><h2></h2><p></p></div><small class="tap"></small>`;
document.body.appendChild(el);

export function roar(sub) {
  return new Promise(res => {
    el.querySelector('h2').textContent = t('resonance');
    el.querySelector('p').textContent = sub;
    el.querySelector('.tap').textContent = t('tapNext');
    el.querySelectorAll('.beast b').forEach((b, i) => b.textContent = t('beast_' + BEASTS[i]));
    el.hidden = false; el.classList.remove('go', 'out'); void el.offsetWidth; el.classList.add('go');
    // 一隻隻落地：鐘聲各一響；1.9 秒齊吼：吼聲、震動、震波
    BEASTS.forEach((_, i) => setTimeout(() => sfx.bell([146.8, 196, 220, 174.6][i]), 250 + i * 330));
    const hit = setTimeout(() => { sfx.roar(); try { navigator.vibrate && navigator.vibrate([90, 40, 220]); } catch { } }, 1900);
    let done = false;
    const close = () => {
      if (done) return; done = true; clearTimeout(hit); clearTimeout(auto);
      el.classList.add('out'); setTimeout(() => { el.hidden = true; el.classList.remove('go', 'out'); res(); }, 450);
    };
    const auto = setTimeout(close, 8000);
    el.onclick = e => { e.stopPropagation(); if (performance.now() - t0 > 1200) close(); };
    const t0 = performance.now();
  });
}
