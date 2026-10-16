// 突破境界的全畫面動畫：阿流盤腿打坐、靈光往上飄 → 背後忽然爆出四色宏光（橘、綠、粉、紫）→ 出現「突破」→ 亮出新境界的圖示與名稱
// 每一段都有音效（audio.js sfx.ascend）
// 用自己的 WebGL 畫布，只在播放時跑；點一下或約 7 秒後收起
import { Renderer } from './gl.js';
import { M, hex, clamp } from './math.js';
import { drawAvatar2, liuPal } from './avatar2.js';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { realmVox, REALM_COL } from './realmicon.js';

const FOUR = ['#ffa53a', '#8fd14f', '#ff8fbf', '#a98bff'].map(hex);
const HIT = 1.5, WORD = 2.3, ICON = 3.5;   // 第幾秒：爆光、出現「突破」、亮出境界圖示

const el = document.createElement('div');
el.id = 'ascend'; el.hidden = true;
el.innerHTML = `<canvas></canvas><div class="flash"></div><div class="txt"><small></small><h2></h2><div class="badge"><i></i><p></p></div></div><small class="tap"></small>`;
document.body.appendChild(el);
const cv = el.querySelector('canvas');
let r = null, raf = 0;

function env(time) {
  const l = [0.3, 0.8, 0.6], n = Math.hypot(...l);
  return { time, spirit: 0, sense: 0, fog: hex('#060b16'), skyTop: hex('#101a33'), fogR: [30, 80], light: l.map(v => v / n),
    sun: [0.7, 0.68, 0.65], amb: [0.45, 0.48, 0.6], glow: [1, 0.85, 0.5], pulse: [0, 0, 0, 0], horizon: -0.3 };
}
const ease = k => 1 - Math.pow(1 - clamp(k, 0, 1), 3);

// i：突破後的境界；look：目前的穿搭（和遊戲裡一樣）
export function ascend(i, look = {}) {
  const realm = t('realms')[i];
  if (!r) { try { r = new Renderer(cv); } catch { return Promise.resolve(); } }
  el.querySelector('.txt small').textContent = t('ascendTop');
  el.querySelector('h2').textContent = t('ascendTitle');
  el.querySelector('.txt p').textContent = t('ascendRealm', { realm });
  const ic = el.querySelector('.badge i'); ic.innerHTML = realmVox(i); ic.style.setProperty('--c', REALM_COL[i] || REALM_COL[0]);
  el.querySelector('.tap').textContent = t('tapNext');
  look = { ...look, realm: i }; const pal = liuPal(look);   // 突破後直接換上新境界的衣服
  // 往上飄的小靈光
  const motes = Array.from({ length: 40 }, (_, i) => ({ a: Math.random() * 6.28, r: 0.8 + Math.random() * 2.2, s: 0.4 + Math.random() * 0.8, o: Math.random() * 4, c: FOUR[i % 4] }));
  return new Promise(res => {
    el.hidden = false; el.classList.remove('hit', 'word', 'icon', 'out'); void el.offsetWidth;
    const t0 = performance.now(); let hit = false, done = false;
    const timers = [setTimeout(() => sfx.ascend('sit'), 100),
      setTimeout(() => { el.classList.add('word'); sfx.ascend('word'); }, WORD * 1000),
      setTimeout(() => { el.classList.add('icon'); sfx.ascend('icon'); try { navigator.vibrate && navigator.vibrate(30); } catch { } }, ICON * 1000)];
    const finish = () => {
      if (done) return; done = true; timers.forEach(clearTimeout);
      el.classList.add('out');
      setTimeout(() => { el.hidden = true; cancelAnimationFrame(raf); res(); }, 450);
    };
    el.onclick = () => { if ((performance.now() - t0) / 1000 > ICON + 0.8) finish(); };
    timers.push(setTimeout(finish, 9000));
    const frame = now => {
      const T = (now - t0) / 1000, k = ease((T - HIT) / 0.8);
      if (!hit && T >= HIT) {
        hit = true; el.classList.add('hit');
        sfx.ascend('burst');
        try { navigator.vibrate && navigator.vibrate([40, 30, 120]); } catch { }
      }
      const asp = r.resize(), tgt = [0, asp < 0.8 ? -0.5 : 0.8, 0], yaw = Math.sin(T * 0.4) * 0.18, dist = (asp < 0.8 ? 14 : 9) - Math.min(T, HIT) * 0.8, pitch = 0.16;
      const eye = [Math.sin(yaw) * Math.cos(pitch) * dist, tgt[1] + Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist];
      const vp = M.mul(M.persp(0.62, asp, 0.1, 100), M.lookAt(eye, tgt, [0, 1, 0]));
      r.begin(vp, eye, env(T)); r.blend(0);
      // 腳下一圈方塊，爆光後依序亮成四色
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * Math.PI * 2, c = FOUR[i % 4], on = hit ? clamp((T - HIT) * 6 - i * 0.25, 0, 1) : 0;
        r.box(Math.sin(a) * 1.7, -0.22, Math.cos(a) * 1.7, 0.3, 0.12, 0.3, on ? c : hex('#26324a'), on * 0.9);
      }
      r.box(0, -0.25, 0, 2.4, 0.12, 2.4, hex('#1a2540'));
      const float = hit ? Math.sin((T - HIT) * 2) * 0.05 + 0.12 * k : Math.sin(T * 2) * 0.02;
      drawAvatar2(r, pal, 0, -0.56 + float, 0, 0, { phase: 0, move: 0, air: false, swim: false, t: T, sit: true }, hit ? 0.35 * (1 - k * 0.5) : 0, look);
      // 宏光：背後一圈四色光柱轉動、往外長
      r.blend(2);
      const n = 24, L = 0.4 + 7.5 * k;
      if (hit) for (let i = 0; i < n; i++) {
        const m = M.ident(); M.translate(m, 0, 1.35, -0.7); M.rotZ(m, i / n * Math.PI * 2 + (T - HIT) * 0.35);
        M.translate(m, 0, L / 2 + 0.5, 0); M.scale(m, i % 2 ? 0.1 : 0.22, L, 0.02);
        r.draw(r.cube, m, FOUR[i % 4], 1, 0.55 * (1 - 0.35 * k));
      }
      // 光環：一圈方塊，爆光時從背後擴散
      if (hit) for (let i = 0; i < 32; i++) {
        const a = i / 32 * Math.PI * 2, R = 1.1 + 4 * ease((T - HIT) / 1.4);
        const m = M.ident(); M.translate(m, Math.sin(a) * R, 1.35 + Math.cos(a) * R, -0.8); M.rotZ(m, -a); M.scale(m, 0.18, 0.18, 0.18);
        r.draw(r.cube, m, FOUR[i % 4], 1, clamp(1.6 - (T - HIT), 0, 1));
      }
      for (const p of motes) {
        const y = ((T * p.s + p.o) % 4) - 0.2, a = p.a + T * 0.3;
        const m = M.ident(); M.translate(m, Math.sin(a) * p.r, y, Math.cos(a) * p.r * 0.6); M.scale(m, 0.07, 0.07, 0.07);
        r.draw(r.cube, m, p.c, 1, (hit ? 0.9 : 0.5) * Math.sin(y / 3.8 * Math.PI));
      }
      r.blend(0);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  });
}
