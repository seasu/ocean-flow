// 方塊角色：依「洋流 Ocean Currents」設定圖（藍色款＝玩家阿流，橘色款＝夥伴阿汐）
import { M, hex } from './math.js';

const pal = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, hex(v)]));
export const BLUE = pal({ skin: '#f3d9bd', hair: '#e3e7ee', hairTip: '#8cc4f0', jacket: '#eef2f7', trim: '#1f4f9c', wave: '#58b0ea', inner: '#141b2a', pants: '#192236', pantWave: '#3f8fdc', shoe: '#eef3f8', shoeAcc: '#2b62b5', hp: '#f4f6fa', hpAcc: '#2f6fc0', ribbon: '#78c6f5', eye: '#2d6fd0', charm: '#cfe8ff' });
export const ORANGE = pal({ skin: '#f3d9bd', hair: '#ece9e4', hairTip: '#ffb347', jacket: '#f4f2ee', trim: '#e8641c', wave: '#ffb02e', inner: '#16120e', pants: '#2a2420', pantWave: '#f08a24', shoe: '#f6f2ec', shoeAcc: '#e8641c', hp: '#f7f4ef', hpAcc: '#e8641c', ribbon: '#ffaa32', eye: '#d9781b', charm: '#fff1c9' });

// 零件：[cx, cy, cz, w, h, d, 顏色鍵, 自發光]
const LEG = [
  [0, -0.36, 0, 0.4, 0.72, 0.4, 'pants'],
  [0, -0.6, 0, 0.42, 0.16, 0.42, 'pantWave'],
  [0, -0.73, 0.03, 0.44, 0.14, 0.48, 'shoe'],
  [0, -0.7, 0.03, 0.45, 0.04, 0.49, 'shoeAcc'],
];
const ARM = [
  [0, -0.3, 0, 0.4, 0.6, 0.4, 'jacket'],
  [0, -0.58, 0, 0.42, 0.1, 0.42, 'wave'],
  [0, -0.52, 0, 0.42, 0.03, 0.42, 'trim'],
  [0, -0.72, 0, 0.34, 0.18, 0.34, 'skin'],
];
const TORSO = [
  [0, 1.2, 0, 0.8, 0.8, 0.4, 'jacket'],
  [0, 1.2, 0.2, 0.3, 0.78, 0.03, 'inner'],
  [0, 0.86, 0, 0.82, 0.12, 0.42, 'wave'],
  [0, 0.93, 0, 0.82, 0.03, 0.42, 'trim'],
  [0.12, 1.1, 0.225, 0.09, 0.13, 0.03, 'charm', 0.9],
  [0, 1.56, -0.17, 0.62, 0.14, 0.14, 'inner'],
  [0.28, 1.3, 0.21, 0.04, 0.5, 0.02, 'trim'],
];
const HEAD = [
  [0, 0.25, 0, 0.5, 0.5, 0.5, 'skin'],
  [-0.11, 0.24, 0.252, 0.08, 0.11, 0.01, 'eye'],
  [0.11, 0.24, 0.252, 0.08, 0.11, 0.01, 'eye'],
  [0, 0.53, 0, 0.58, 0.14, 0.58, 'hair'],
  [0, 0.44, 0.24, 0.58, 0.1, 0.12, 'hair'],
  [-0.12, 0.38, 0.27, 0.12, 0.08, 0.06, 'hair'],
  [0.14, 0.39, 0.27, 0.1, 0.06, 0.06, 'hairTip'],
  [0, 0.33, -0.24, 0.58, 0.34, 0.12, 'hair'],
  [-0.15, 0.64, -0.05, 0.16, 0.12, 0.16, 'hair'],
  [0.12, 0.66, 0.08, 0.14, 0.14, 0.14, 'hairTip'],
  [0.05, 0.63, -0.18, 0.16, 0.1, 0.16, 'hair'],
  [-0.3, 0.25, 0, 0.1, 0.24, 0.26, 'hp'],
  [0.3, 0.25, 0, 0.1, 0.24, 0.26, 'hp'],
  [-0.355, 0.25, 0, 0.01, 0.16, 0.18, 'hpAcc', 0.4],
  [0.355, 0.25, 0, 0.01, 0.16, 0.18, 'hpAcc', 0.4],
  [0, 0.62, 0, 0.66, 0.06, 0.09, 'hp'],
];

function parts(r, base, list, c, glow) {
  for (const [x, y, z, w, h, d, k, e = 0] of list) {
    const m = M.copy(base); M.translate(m, x, y, z); M.scale(m, w, h, d);
    r.draw(r.cube, m, c[k], e + glow);
  }
}

// a：{ phase, move(0..1), air, swim, t, wave }
export function drawAvatar(r, c, x, y, z, yaw, a, glow = 0) {
  const root = M.ident(); M.translate(root, x, y, z); M.rotY(root, yaw);
  const sw = a.swim ? 0 : Math.sin(a.phase) * 0.75 * a.move;
  const breathe = Math.sin(a.t * 2) * 0.012;
  // 腿
  for (const s of [-1, 1]) {
    const m = M.copy(root); M.translate(m, s * 0.2, 0.8, 0);
    M.rotX(m, a.air ? (s * 0.25 - 0.2) : a.swim ? Math.sin(a.t * 6 + s * 1.5) * 0.4 + 0.3 : s * sw);
    parts(r, m, LEG, c, glow);
  }
  // 身體
  const body = M.copy(root); M.translate(body, 0, breathe, 0);
  parts(r, body, TORSO, c, glow);
  // 手臂
  for (const s of [-1, 1]) {
    const m = M.copy(body); M.translate(m, s * 0.6, 1.56, 0);
    if (a.wave && s === 1) { M.rotZ(m, 2.6 + Math.sin(a.t * 8) * 0.3); }
    else if (a.air) M.rotX(m, -2.8);
    else if (a.swim) M.rotX(m, a.t * 5 + (s > 0 ? Math.PI : 0));
    else M.rotX(m, -s * sw);
    parts(r, m, ARM, c, glow);
  }
  // 頭
  const h = M.copy(body); M.translate(h, 0, 1.6, 0); M.rotY(h, Math.sin(a.t * 0.7) * 0.08);
  parts(r, h, HEAD, c, glow);
  // 飄帶：往後飄，速度越快越平
  for (const s of [-1, 1]) {
    const m = M.copy(body); M.translate(m, s * 0.22, 0.95, -0.22);
    M.rotX(m, 0.25 + a.move * 0.9 + Math.sin(a.t * 5 + s) * 0.18);
    M.translate(m, 0, -0.32, 0); M.scale(m, 0.09, 0.64, 0.02);
    r.draw(r.cube, m, c.ribbon, 0.35 + glow);
  }
}
