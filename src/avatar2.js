// 優化版阿流與阿汐：照「洋流 Ocean Currents」設定圖重做比例與細節（同一套方塊，換調色盤）
// 比例接近 Roblox R6：大方頭、寬肩、方袖；白外套開襟＋黑內搭＋深藍帽兜、袖口與褲管的浪花、指南針掛飾、耳機、厚底鞋
import { M, hex } from './math.js';

const pal = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, hex(v)]));
export const LIU2 = pal({
  skin: '#f4d8bf', hair: '#e9edf2', hairSh: '#c7d0dc', hairTip: '#7db6e6',
  jacket: '#f3f5f8', jacketSh: '#dce3ec', navy: '#1e2b52', navyDk: '#121a33', inner: '#17191f',
  wave: '#4f9fe0', waveLt: '#a9d9f6', waveDk: '#2c66ad', white: '#ffffff', silver: '#c9d2dd',
  pants: '#1b2648', sole: '#eef1f5', eye: '#2d6cc0', strap: '#8fcaf0',
  // 穿戴物品用的顏色
  brick: '#b5452f', mortar: '#e9d9c4', wood: '#9b6a3c', woodLt: '#c58a4a', red: '#d6453a', barrel: '#a8662f', band: '#6d7480',
  gog: '#2f6fb0', gogLens: '#9fe6ff', cyan: '#7fe8ff',
  // 阿流這幾個部位沿用深藍；阿汐換成橘色
  shoe: '#1e2b52', cuff: '#1e2b52', phone: '#1e2b52', pwave: '#1b2648', pwaveLt: '#1b2648',
});
// 五分埔新衣：青綠外套配金色浪花
// 阿汐：白外套橘浪袖、黑帽兜黑內搭、淺灰褲配橘黃火浪、橘白耳機、琥珀色眼睛、橘色髮夾
export const XI2 = { ...LIU2, ...pal({
  hairTip: '#ff8a1f', jacketSh: '#e6e2dc', navy: '#202024', navyDk: '#141417', inner: '#18181b',
  wave: '#ff7a1a', waveLt: '#ffc53d', waveDk: '#d9480f', pants: '#e4e5e8', eye: '#c46a12', strap: '#ffb020',
  shoe: '#e8601c', cuff: '#f08a24', phone: '#ef6c1a', pwave: '#ff8a1f', pwaveLt: '#ffcf4a',
}) };
export const LIU2_OUTFIT = { ...LIU2, ...pal({ jacket: '#1f8f86', jacketSh: '#17706a', wave: '#ffcf5a', waveLt: '#ffe9a8', strap: '#ffd27a' }) };

// [cx, cy, cz, w, h, d, 顏色鍵, 自發光]；sym() 會補上左右對稱的另一半
const sym = list => list.flatMap(p => p[0] ? [p, [-p[0], ...p.slice(1)]] : [p]);

const LEG = [
  [0, -0.33, 0, 0.46, 0.66, 0.46, 'pants'],
  // 阿汐褲子下半的火浪（阿流同褲色，看不出來）
  [0, -0.43, 0, 0.466, 0.12, 0.466, 'pwave'],
  [0.08, -0.35, 0.234, 0.2, 0.06, 0.01, 'pwave'], [-0.12, -0.38, 0.234, 0.12, 0.05, 0.01, 'pwaveLt'], [0.234, -0.35, 0.05, 0.01, 0.06, 0.2, 'pwaveLt'],
  // 褲管浪花：一圈淺藍，前面和外側有浪頭
  [0, -0.555, 0, 0.47, 0.11, 0.47, 'wave'],
  [-0.1, -0.49, 0.236, 0.18, 0.07, 0.01, 'waveLt'], [0.1, -0.47, 0.236, 0.12, 0.06, 0.01, 'white'], [0.14, -0.51, 0.237, 0.1, 0.04, 0.01, 'waveLt'],
  [0.236, -0.49, -0.06, 0.01, 0.07, 0.22, 'waveLt'], [-0.236, -0.48, 0.08, 0.01, 0.06, 0.16, 'waveLt'],
  [0, -0.64, 0, 0.48, 0.05, 0.48, 'white'],
  // 厚底鞋：深藍鞋身、白鞋頭、藍色拼塊、白色厚底
  [0, -0.74, 0.03, 0.48, 0.15, 0.54, 'shoe'],
  [0, -0.765, 0.235, 0.46, 0.1, 0.12, 'white'],
  [0.1, -0.72, 0.1, 0.18, 0.07, 0.2, 'wave'], [-0.12, -0.73, -0.14, 0.16, 0.06, 0.14, 'waveLt'],
  [0, -0.84, 0.03, 0.51, 0.06, 0.57, 'sole'],
];
const ARM = [
  [0, -0.24, 0, 0.46, 0.48, 0.46, 'jacket'],
  [0, -0.37, 0, 0.47, 0.11, 0.47, 'wave'],
  [0, -0.31, 0, 0.472, 0.035, 0.472, 'waveLt'],
  [0.12, -0.28, 0.236, 0.14, 0.06, 0.01, 'white'],
  [0, -0.5, 0, 0.48, 0.12, 0.48, 'cuff'],
  [0, -0.57, 0, 0.485, 0.025, 0.485, 'white'],
  [0, -0.7, 0, 0.42, 0.24, 0.42, 'skin'],
];
const TORSO = sym([
  [0, 1.25, 0, 0.92, 0.8, 0.46, 'jacket'],
  [0, 1.25, 0.232, 0.34, 0.79, 0.01, 'inner'],
  [0.185, 1.25, 0.236, 0.035, 0.79, 0.012, 'navy'],
  [0, 1.37, 0.239, 0.1, 0.12, 0.005, 'wave', 0.2],
  // 帽兜：脖子後面一圈深藍，兩條白色抽繩
  [0, 1.62, -0.19, 0.72, 0.16, 0.14, 'navy'],
  [0.3, 1.6, 0.03, 0.12, 0.14, 0.42, 'navy'],
  [0.075, 1.47, 0.24, 0.02, 0.17, 0.01, 'white'],
  // 外套下擺浪花、下擺深藍、皮帶
  [0.33, 0.99, 0.235, 0.24, 0.08, 0.01, 'wave'], [0.3, 1.04, 0.236, 0.14, 0.04, 0.01, 'waveLt'],
  [0, 0.885, 0, 0.93, 0.05, 0.47, 'navy'],
  [0, 0.87, 0, 0.94, 0.06, 0.48, 'navyDk'],
  [0, 0.87, 0.246, 0.1, 0.06, 0.01, 'silver'],
  // 肩上的背帶與銀扣
  [0.28, 1.36, 0.236, 0.06, 0.5, 0.012, 'navy'],
  [0.28, 1.49, 0.243, 0.08, 0.05, 0.01, 'silver'],
  // 背後的指南針浪花圖
  [0, 1.32, -0.236, 0.26, 0.26, 0.01, 'wave'], [0, 1.32, -0.241, 0.16, 0.16, 0.01, 'waveLt'],
  [0, 1.1, -0.236, 0.9, 0.08, 0.01, 'wave'],
]).concat([
  // 胸前指南針掛飾（只在右邊）與發光的牌子
  [0.28, 1.2, 0.25, 0.13, 0.03, 0.012, 'silver', 0.2], [0.28, 1.2, 0.25, 0.03, 0.13, 0.012, 'silver', 0.2],
  [0.28, 1.07, 0.25, 0.05, 0.11, 0.012, 'wave', 0.5],
  // 腰間的另一個掛飾
  [0.33, 0.78, 0.25, 0.11, 0.025, 0.012, 'silver', 0.2], [0.33, 0.78, 0.25, 0.025, 0.11, 0.012, 'silver', 0.2],
  [0.33, 0.67, 0.25, 0.045, 0.1, 0.012, 'wave', 0.5],
]);
const HEAD = sym([
  [0, 0.32, 0, 0.62, 0.62, 0.62, 'skin'],
  // 大眼睛：藍色、上眼線、亮點；小小的微笑
  [0.13, 0.29, 0.311, 0.11, 0.14, 0.01, 'eye'],
  [0.13, 0.37, 0.312, 0.13, 0.025, 0.006, 'navyDk'],
  // 頭髮：蓋住頭頂，後腦與兩側，瀏海一撮撮垂下來
  [0, 0.66, 0, 0.68, 0.12, 0.68, 'hair'],
  [0, 0.42, -0.3, 0.68, 0.5, 0.12, 'hair'],
  [0.325, 0.5, -0.05, 0.07, 0.32, 0.56, 'hair'],
  [0.325, 0.36, 0.12, 0.06, 0.12, 0.14, 'hairSh'],
  // 耳機：頭頂深藍頭帶，兩邊白色大耳罩＋藍色指南針
  [0.35, 0.6, 0.02, 0.05, 0.26, 0.12, 'phone'],
  [0.37, 0.33, 0.02, 0.1, 0.34, 0.34, 'white'],
  [0.42, 0.33, 0.02, 0.02, 0.28, 0.28, 'phone'],
  [0.43, 0.33, 0.02, 0.012, 0.21, 0.21, 'wave', 0.35],
  [0.437, 0.33, 0.02, 0.006, 0.15, 0.03, 'white', 0.4], [0.437, 0.33, 0.02, 0.006, 0.03, 0.15, 'white', 0.4],
]).concat([
  [0.17, 0.33, 0.314, 0.035, 0.045, 0.005, 'white'], [-0.09, 0.33, 0.314, 0.035, 0.045, 0.005, 'white'],
  [0.03, 0.15, 0.311, 0.09, 0.016, 0.005, 'navyDk'],
  [-0.22, 0.54, 0.325, 0.16, 0.17, 0.06, 'hair'], [-0.07, 0.5, 0.33, 0.12, 0.25, 0.05, 'hair'],
  [0.07, 0.53, 0.328, 0.14, 0.19, 0.05, 'hairSh'], [0.21, 0.55, 0.325, 0.14, 0.15, 0.06, 'hair'],
  [0.23, 0.47, 0.335, 0.06, 0.08, 0.03, 'hairTip'], [-0.26, 0.45, 0.33, 0.05, 0.07, 0.03, 'hairTip'],
  [0.21, 0.61, 0.342, 0.11, 0.03, 0.012, 'waveDk'], [0.21, 0.61, 0.346, 0.04, 0.03, 0.006, 'white'],
  // 亂翹的頭頂與呆毛
  [-0.16, 0.75, 0.04, 0.2, 0.1, 0.24, 'hair'], [0.13, 0.77, -0.08, 0.22, 0.12, 0.22, 'hair'],
  [0.02, 0.79, 0.15, 0.14, 0.09, 0.14, 'hairSh'], [-0.04, 0.73, -0.24, 0.3, 0.1, 0.16, 'hair'],
  [0.06, 0.9, 0.06, 0.05, 0.14, 0.05, 'hair'], [0.09, 0.97, 0.06, 0.05, 0.05, 0.05, 'hairTip'],
  [0, 0.735, 0.02, 0.74, 0.07, 0.12, 'phone'],
]);

// ---------- 穿戴：用拿到的物品搭配外觀 ----------
const GOGGLES = sym([
  [0.335, 0.5, 0, 0.02, 0.07, 0.6, 'gog'],
  [0.13, 0.52, 0.335, 0.2, 0.14, 0.05, 'gog'],
  [0.13, 0.52, 0.36, 0.15, 0.09, 0.01, 'gogLens', 0.5],
]).concat([[0, 0.53, 0.335, 0.08, 0.05, 0.04, 'gog']]);
const PHONES = sym([
  [0.435, 0.485, 0.02, 0.02, 0.025, 0.3, 'cyan', 1], [0.435, 0.175, 0.02, 0.02, 0.025, 0.3, 'cyan', 1],
  [0.435, 0.33, 0.175, 0.02, 0.3, 0.025, 'cyan', 1], [0.435, 0.33, -0.135, 0.02, 0.3, 0.025, 'cyan', 1],
  [0.35, 0.6, 0.085, 0.052, 0.24, 0.02, 'cyan', 0.8],
]);
const BRACER = [[0, -0.6, 0, 0.5, 0.12, 0.5, 'brick'], [0, -0.6, 0.251, 0.5, 0.015, 0.01, 'mortar'], [0.1, -0.63, 0.252, 0.015, 0.06, 0.01, 'mortar'], [-0.12, -0.57, 0.252, 0.015, 0.06, 0.01, 'mortar']];
const BARREL = [[0, 0, 0, 0.62, 0.72, 0.14, 'barrel'], [0, -0.2, -0.005, 0.64, 0.06, 0.15, 'band'], [0, 0.2, -0.005, 0.64, 0.06, 0.15, 'band'], [0, 0, -0.08, 0.06, 0.6, 0.02, 'woodLt']];
const PADDLE = [[0, 0.15, 0, 0.07, 1.5, 0.07, 'wood'], [0, -0.75, 0, 0.24, 0.5, 0.05, 'woodLt'], [0, -0.62, 0.003, 0.24, 0.06, 0.05, 'red'], [0, 0.92, 0, 0.16, 0.06, 0.1, 'wood']];

function parts(r, base, list, c, glow) {
  for (const [x, y, z, w, h, d, k, e = 0] of list) {
    const m = M.copy(base); M.translate(m, x, y, z); M.scale(m, w, h, d);
    r.draw(r.cube, m, c[k], e + glow);
  }
}

// a：{ phase, move(0..1), air, swim, t, wave, dance, sit }，和舊版 drawAvatar 一樣，之後可以直接替換
// look：{ head: 'goggles'|'phones', wrist: 'bracer', back: 'paddle'|'barrel' }（衣服用調色盤 c 換）
export function drawAvatar2(r, c, x, y, z, yaw, a, glow = 0, look = {}) {
  const root = M.ident(); M.translate(root, x, y, z); M.rotY(root, yaw);
  if (a.dance) M.rotZ(root, Math.sin(a.t * 6) * 0.14);
  const sw = a.swim ? 0 : Math.sin(a.phase) * 0.8 * a.move;
  const bob = a.air || a.swim ? 0 : Math.abs(Math.sin(a.phase)) * 0.06 * a.move;   // 走路時身體上下起伏
  const breathe = Math.sin(a.t * 2) * 0.012;
  for (const s of [-1, 1]) {
    const m = M.copy(root); M.translate(m, s * 0.235, 0.86 + bob, 0);
    if (a.sit) { M.rotY(m, s * 0.45); M.rotX(m, -1.5); }   // 打坐：腿往前盤
    else if (a.dance) M.rotX(m, s * Math.sin(a.t * 12) * 0.35);
    else M.rotX(m, a.air ? (s * 0.3 - 0.25) : a.swim ? Math.sin(a.t * 6 + s * 1.5) * 0.4 + 0.3 : s * sw);
    parts(r, m, LEG, c, glow);
  }
  const body = M.copy(root); M.translate(body, 0, breathe + bob, 0);
  if (a.move > 0.6 && !a.air) M.rotX(body, 0.08 * a.move);   // 跑起來身體往前傾
  parts(r, body, TORSO, c, glow);
  if (look.back) {
    const m = M.copy(body); M.translate(m, 0, 1.22, -0.31);
    if (look.back === 'paddle') { M.rotZ(m, 0.55); parts(r, m, PADDLE, c, glow); } else parts(r, m, BARREL, c, glow);
  }
  for (const s of [-1, 1]) {
    const m = M.copy(body); M.translate(m, s * 0.69, 1.62, 0);
    if (a.sit) { M.rotX(m, -0.55); M.rotZ(m, -s * 0.22); }   // 打坐：雙手放在膝上
    else if (a.dance) M.rotZ(m, s * (2.5 + Math.sin(a.t * 12 + (s > 0 ? 0 : Math.PI)) * 0.45));
    else if (a.wave && s === 1) { M.rotZ(m, 2.6 + Math.sin(a.t * 8) * 0.3); }
    else if (a.air) { M.rotZ(m, s * 1.7); M.rotX(m, -0.3); }
    else if (a.swim) M.rotX(m, a.t * 5 + (s > 0 ? Math.PI : 0));
    else { M.rotX(m, -s * sw * 1.1); M.rotZ(m, s * 0.04); }
    parts(r, m, ARM, c, glow);
    if (look.wrist === 'bracer') parts(r, m, BRACER, c, glow);
  }
  const h = M.copy(body); M.translate(h, 0, 1.65, 0); M.rotY(h, Math.sin(a.t * 0.7) * 0.08);
  parts(r, h, HEAD, c, glow);
  if (look.head === 'goggles') parts(r, h, GOGGLES, c, glow);
  if (look.head === 'phones') parts(r, h, PHONES, c, glow);
  // 腰間兩條淺藍飄帶：兩段，越跑越往後飄
  for (const s of [-1, 1]) {
    const m = M.copy(body); M.translate(m, s * 0.4, 0.86, -0.1);
    M.rotX(m, 0.2 + a.move * 0.8 + Math.sin(a.t * 5 + s) * 0.15);
    const seg = M.copy(m); M.translate(seg, 0, -0.22, 0); M.scale(seg, 0.08, 0.44, 0.02); r.draw(r.cube, seg, c.strap, 0.25 + glow);
    M.translate(m, 0, -0.44, 0); M.rotX(m, 0.25 + a.move * 0.4 + Math.sin(a.t * 5 + s + 1) * 0.25);
    M.translate(m, 0, -0.18, 0); M.scale(m, 0.07, 0.36, 0.02); r.draw(r.cube, m, c.strap, 0.3 + glow);
  }
}
