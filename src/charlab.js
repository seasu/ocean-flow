// 角色預覽：個人資訊裡打開，看優化版阿流走路、跑步、跳、揮手、游泳；可以切換「目前版本」對照
// 用自己的 WebGL 畫布，只有打開時才跑；遊戲裡的角色不受影響
import { Renderer } from './gl.js';
import { M, hex, lerp } from './math.js';
import { drawAvatar, BLUE } from './avatar.js';
import { drawAvatar2, LIU2 } from './avatar2.js';

const el = document.querySelector('#charLab'), cv = el.querySelector('canvas');
let r = null, raf = 0, last = 0;
const S = { t: 0, phase: 0, move: 0, act: 'walk', hd: true, yaw: 0.55, drag: null, scroll: 0, jumpT: 0 };
const SPEED = { idle: 0, walk: 0.55, run: 1, jump: 0, wave: 0, swim: 0 };
const TILE = [hex('#2a5b8f'), hex('#3a78b0'), hex('#e9f1f8')];

function env(t) {
  const l = [0.45, 0.8, 0.5], n = Math.hypot(...l);
  return { time: t, spirit: 0, sense: 0, fog: hex('#0d1a2e'), skyTop: hex('#183a66'), fogR: [40, 90], light: l.map(v => v / n),
    sun: [0.66, 0.63, 0.58], amb: [0.55, 0.6, 0.7], glow: [1, 0.85, 0.5], pulse: [0, 0, 0, 0], horizon: -0.2 };
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  S.t += dt;
  const sp = SPEED[S.act];
  S.move = lerp(S.move, sp, 1 - Math.exp(-dt * 8));
  S.phase += dt * (4 + 6 * S.move) * (S.move > 0.02 ? 1 : 0);
  S.scroll = (S.scroll + dt * S.move * 7) % 2;
  if (!S.drag) S.yaw += dt * (S.act === 'idle' ? 0.25 : 0.08);
  // 跳：每 1.1 秒跳一次
  let y = 0, air = false;
  if (S.act === 'jump') { S.jumpT = (S.jumpT + dt) % 1.1; const k = S.jumpT / 0.7; if (k < 1) { y = Math.sin(k * Math.PI) * 1.1; air = true; } }
  const swim = S.act === 'swim';
  if (swim) y = -0.9 + Math.sin(S.t * 2) * 0.05;

  const asp = r.resize(), tgt = [0, 1.2, 0], dist = 7.4, pitch = 0.16;
  const eye = [Math.sin(S.yaw) * Math.cos(pitch) * dist, tgt[1] + Math.sin(pitch) * dist, Math.cos(S.yaw) * Math.cos(pitch) * dist];
  const vp = M.mul(M.persp(0.62, asp, 0.1, 100), M.lookAt(eye, tgt, [0, 1, 0]));
  r.begin(vp, eye, env(S.t)); r.blend(0);
  // 圓形方塊舞台：走路、跑步時地板往後捲，像在原地前進
  for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) {
    if (i * i + j * j > 18) continue;
    const z = j - S.scroll, k = ((i + j + 400) % 2 + (Math.floor(S.scroll) % 2)) % 2;
    const rim = i * i + j * j > 12;
    r.box(i, -0.25 - (swim ? 1.5 : 0), z, 0.98, 0.5, 0.98, rim ? TILE[2] : TILE[k]);
  }
  const a = { phase: S.phase, move: swim ? 0.3 : S.move, air, swim, t: S.t, wave: S.act === 'wave' };
  if (S.hd) drawAvatar2(r, LIU2, 0, y, 0, 0, a); else drawAvatar(r, BLUE, 0, y, 0, 0, a);
  if (swim) { r.blend(1); r.box(0, 0.05, 0, 9, 1.8, 9, hex('#3a8fd0'), 0.15, 0.42); r.blend(0); }
  raf = requestAnimationFrame(frame);
}

function setAct(k) {
  S.act = k; S.jumpT = 0;
  el.querySelectorAll('.acts button').forEach(b => b.classList.toggle('on', b.dataset.act === k));
}
function setHd(on) {
  S.hd = on;
  el.querySelectorAll('.vsw button').forEach(b => b.classList.toggle('on', (b.dataset.v === 'hd') === on));
}

export function openCharLab() {
  if (!r) { try { r = new Renderer(cv); } catch { return; } }
  el.hidden = false; setAct('walk'); setHd(true);
  last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
}
function close() { el.hidden = true; cancelAnimationFrame(raf); }

el.addEventListener('click', e => {
  if (e.target.closest('.xbtn')) return close();
  const b = e.target.closest('.acts button'); if (b) return setAct(b.dataset.act);
  const v = e.target.closest('.vsw button'); if (v) return setHd(v.dataset.v === 'hd');
});
// 左右拖曳轉角色
cv.addEventListener('pointerdown', e => { S.drag = { x: e.clientX, yaw: S.yaw }; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove', e => { if (S.drag) S.yaw = S.drag.yaw - (e.clientX - S.drag.x) * 0.012; });
cv.addEventListener('pointerup', () => { S.drag = null; });
cv.addEventListener('pointercancel', () => { S.drag = null; });
