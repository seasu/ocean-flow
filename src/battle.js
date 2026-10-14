// 淨化之戰：開啟獸靈門前，擋在門前的「濁流」異象（流的失衡）要先被淨化
// 四座門各一種玩法，呼應各自的特質：象門數獨（記憶）、虎門連點（爆發）、豹門畫符（敏捷）、獅門三消（威勢）
// 這支檔案是共用的外框：濁流、淨化度、光彈、粒子、開場說明與重來；玩法本身在 src/games/
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { sudoku } from './games/sudoku.js';
import { taphero } from './games/taphero.js';
import { sigil } from './games/sigil.js';
import { match3 } from './games/match3.js';

const GAMES = { elephant: sudoku, tiger: taphero, leopard: sigil, lion: match3 };
// 測試用：?game=sudoku|taphero|sigil|match3 讓每一門都用同一種玩法
const FORCE = { sudoku, taphero, sigil, match3 }[new URLSearchParams(location.search).get('game')];
const gameOf = node => FORCE || GAMES[node.id] || match3;

// 方塊元素：海、山、花、陽、石（顏色之外再用形狀區分），數獨與三消共用
export const TILE = [['#3d8bff', 'wave'], ['#45b36b', 'tri'], ['#ff7aa8', 'flower'], ['#ffc93c', 'sun'], ['#b9c6d6', 'square']];

const el = document.createElement('div');
el.id = 'battle';
el.innerHTML = `<canvas></canvas>
  <header><b></b><div class="bar"><i></i></div><span class="hp"></span></header>
  <div class="msg"><h3></h3><p></p><button></button></div>`;
document.body.appendChild(el);
const cv = el.querySelector('canvas'), g = cv.getContext('2d');
const bar = el.querySelector('.bar i'), hpEl = el.querySelector('.hp');
const msg = el.querySelector('.msg'), msgH = msg.querySelector('h3'), msgP = msg.querySelector('p'), msgB = msg.querySelector('button');

let S = null, raf = 0, last = 0;
const tries = {};

// lv：走路修行的境界（每一境讓這一戰從容一點）；realm：境界名稱
export function battle(node, lv = 0, realm = '') {
  return new Promise(resolve => {
    tries[node.id] = tries[node.id] || 0;
    el.classList.add('show');
    el.querySelector('header b').textContent = `${node.icon} ${node.name}`;
    start(node, lv, resolve);
    const make = gameOf(node);
    const note = lv ? '\n' + t('realm_' + make.key, { realm, n: make.bonus(lv) }) : '';
    showMsg(t('battleTitle', { name: node.name }), t('battleTip_' + node.id) + note + '\n' + t('how_' + make.key), t('battleGo'), () => { S.run = true; });
    cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(tick);
  });
}

function start(node, lv, done) {
  S = { node, lv, done, run: false, t: 0, pur: 0, fx: [], shots: [], hitT: 0, shake: 0, win: 0, lay: null, game: null };
  size();
  S.game = gameOf(node)(api, { lv, ease: Math.min(2, tries[node.id] || 0) });
  bar.style.width = '0%';
}

function showMsg(h, p, btn, fn) {
  msgH.textContent = h; msgP.textContent = p; msgB.textContent = btn; msg.classList.add('show');
  msgB.onclick = e => { e.stopPropagation(); msg.classList.remove('show'); fn(); };
}

// 給玩法用的工具
const api = {
  g, sfx, t, TILE,
  get lay() { return S.lay; },
  get run() { return S.run; },
  get time() { return S.t; },
  get pur() { return S.pur; },
  node: () => S.node,
  add(n) { S.pur += n; },
  info(s) { hpEl.textContent = s; },
  shoot(x, y, col) { S.shots.push({ x, y, x0: x, y0: y, t: 0, d: 0.35 + Math.random() * 0.2, col }); },
  burst(x, y, col, n = 14, sp = 160) {
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = sp * (0.3 + Math.random()); S.fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5 + Math.random() * 0.4, col }); }
  },
  hurt() { S.shake = 0.3; sfx.hurt(); try { navigator.vibrate && navigator.vibrate([30, 40, 30]); } catch { } },
  shake(s = 0.3) { S.shake = s; },
  buzz(ms = 12) { try { navigator.vibrate && navigator.vibrate(ms); } catch { } },
  lose() { lose(); },
  tile, rr,
};

// ---------- 版面：上方濁流、中間玩法區、下方守護獸 ----------
function size() {
  const dpr = Math.min(2, devicePixelRatio || 1), w = innerWidth, h = innerHeight;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const top = 56, enemyH = Math.max(120, Math.min(240, h * 0.26)), bottom = 76;
  const aw = Math.min(w, 460) - 32;
  S.lay = { w, h, ex: w / 2, ey: top + enemyH * 0.48, er: enemyH * 0.36, gy: h - 44,
    area: { x: (w - aw) / 2, y: top + enemyH, w: aw, h: h - top - enemyH - bottom } };
  return S.lay;
}

// ---------- 操作：交給玩法 ----------
let down = false;
cv.addEventListener('pointerdown', e => { e.preventDefault(); if (!S || !S.run) return; down = true; S.game.down?.(e.clientX, e.clientY); });
cv.addEventListener('pointermove', e => { if (!S || !S.run || !down) return; S.game.move?.(e.clientX, e.clientY); });
addEventListener('pointerup', e => { if (!down) return; down = false; if (S && S.run) S.game.up?.(e.clientX, e.clientY); });

function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!S) return;
  const L = size();
  S.t += dt;
  if (S.run) S.game.tick(dt);
  if (S.run && S.pur >= 100 && !S.game.busy?.()) win();
  for (const s of S.shots) {
    s.t += dt; const k = Math.min(1, s.t / s.d), e = k * k;
    s.x = s.x0 + (L.ex - s.x0) * e + Math.sin(k * 3.14) * (s.x0 < L.ex ? -30 : 30); s.y = s.y0 + (L.ey - s.y0) * e;
    if (k >= 1) { s.hit = true; S.hitT = 0.25; api.burst(L.ex + (Math.random() - 0.5) * L.er, L.ey + (Math.random() - 0.5) * L.er * 0.6, s.col, 4, 120); }
  }
  S.shots = S.shots.filter(s => !s.hit);
  S.hitT = Math.max(0, S.hitT - dt); S.shake = Math.max(0, S.shake - dt);
  if (S.win) S.win += dt;
  for (const p of S.fx) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94; p.life -= dt; }
  S.fx = S.fx.filter(p => p.life > 0);
  bar.style.width = Math.min(100, S.pur).toFixed(1) + '%';
  draw(L);
  if (el.classList.contains('show')) raf = requestAnimationFrame(tick);
}

function win() {
  S.run = false; S.win = 0.001; S.pur = 100;
  const L = S.lay; api.burst(L.ex, L.ey, '#ffcf5a', 60, 320); api.burst(L.ex, L.ey, '#7fe8ff', 40, 240);
  sfx.purify();
  const done = S.done;
  setTimeout(() => { el.classList.remove('show'); S = null; done && done(); }, 1800);
}
function lose() {
  if (!S.run) return;
  S.run = false; sfx.deny();
  const { node, lv, done } = S; tries[node.id]++;
  showMsg(t('battleLose'), t('lose_' + gameOf(node).key), t('battleRetry'), () => { start(node, lv, done); S.run = true; });
}

// ---------- 繪製 ----------
function draw(L) {
  const { w, h } = L, p = Math.min(1, S.pur / 100), win = S.win ? Math.min(1, S.win / 1.2) : 0, T = S.t;
  g.clearRect(0, 0, w, h);
  const bg = g.createRadialGradient(L.ex, L.ey, 10, w / 2, h * 0.45, Math.max(w, h) * 0.8);
  bg.addColorStop(0, `rgba(${lerp(40, 60, p)},${lerp(30, 120, p)},${lerp(70, 150, p)},.94)`);
  bg.addColorStop(1, 'rgba(5,10,22,.97)');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.save();
  if (S.shake) g.translate((Math.random() - 0.5) * 12 * S.shake, (Math.random() - 0.5) * 12 * S.shake);
  // 濁流：一團旋轉的方塊，淨化越多越小、越亮；被打中時抖一下、閃白
  const jx = S.hitT ? (Math.random() - 0.5) * 8 : 0, n = 22, rad = L.er * (1 - p * 0.45) * (1 - win);
  for (let i = 0; i < n; i++) {
    const a = i / n * 6.283 + T * (0.6 + (i % 3) * 0.25), r = rad * (0.35 + ((i * 37) % 10) / 14) + Math.sin(T * 2 + i) * 4;
    const x = L.ex + jx + Math.cos(a) * r, y = L.ey + Math.sin(a) * r * 0.7, sz = 8 + (i % 4) * 4 + Math.sin(T * 3 + i) * 2;
    g.save(); g.translate(x, y); g.rotate(a + T);
    const m = (i % 5) / 5;
    g.fillStyle = S.hitT > 0.15 ? '#ffffff' : mix([58 + m * 30, 50 + m * 20, 86 + m * 30], [127, 232, 255], p * 0.8 + win);
    g.globalAlpha = 0.85 * (1 - win); g.fillRect(-sz / 2, -sz / 2, sz, sz); g.restore();
  }
  g.globalAlpha = 1 - win;
  g.fillStyle = mix([20, 14, 34], [255, 207, 90], p); g.beginPath(); g.arc(L.ex + jx, L.ey, rad * 0.32 + 4, 0, 6.283); g.fill();
  g.globalAlpha = 1;
  g.save(); S.game.draw(); g.restore();
  // 守護獸
  const glow = g.createRadialGradient(w / 2, L.gy, 4, w / 2, L.gy, 34 + win * 80);
  glow.addColorStop(0, `rgba(255,207,90,${0.5 + win * 0.4})`); glow.addColorStop(1, 'rgba(255,207,90,0)');
  g.fillStyle = glow; g.beginPath(); g.arc(w / 2, L.gy, 34 + win * 80, 0, 6.283); g.fill();
  g.font = '30px system-ui, "Apple Color Emoji", "Segoe UI Emoji"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(S.node.icon, w / 2, L.gy - win * 16);
  for (const q of S.shots) { g.fillStyle = q.col; g.globalAlpha = 0.9; g.fillRect(q.x - 4, q.y - 4, 8, 8); }
  for (const q of S.fx) { g.globalAlpha = Math.min(1, q.life * 2); g.fillStyle = q.col; g.fillRect(q.x - 3, q.y - 3, 6, 6); }
  g.globalAlpha = 1;
  g.restore();
}

// 方塊元素；k = -1 是濁塊
function tile(x, y, z, k, o = {}) {
  const h = z / 2;
  if (k < 0) {
    g.fillStyle = '#2b2440'; rr(x - h, y - h, z, z, z * 0.12); g.fill();
    g.strokeStyle = '#8e7bb5'; g.lineWidth = 2; g.stroke();
    g.fillStyle = 'rgba(142,123,181,.5)'; g.fillRect(x - h * 0.35, y - h * 0.35, h * 0.7, h * 0.7);
    return;
  }
  const [col, shape] = TILE[k];
  g.globalAlpha = o.alpha ?? 1;
  g.fillStyle = col; rr(x - h, y - h, z, z, z * 0.16); g.fill();
  g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(x - h + z * 0.12, y - h + z * 0.06, z * 0.76, z * 0.1);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x - h + z * 0.12, y + h - z * 0.14, z * 0.76, z * 0.08);
  g.fillStyle = 'rgba(255,255,255,.92)'; g.strokeStyle = 'rgba(255,255,255,.92)'; g.lineWidth = Math.max(2, z * 0.07);
  const q = z * 0.22;
  g.beginPath();
  if (shape === 'wave') { g.moveTo(x - q * 1.2, y + q * 0.2); g.bezierCurveTo(x - q * 0.6, y - q, x, y + q, x + q * 1.2, y - q * 0.3); g.stroke(); }
  else if (shape === 'tri') { g.moveTo(x, y - q * 1.1); g.lineTo(x + q * 1.1, y + q * 0.8); g.lineTo(x - q * 1.1, y + q * 0.8); g.closePath(); g.fill(); }
  else if (shape === 'flower') { for (let a = 0; a < 5; a++) { const an = a / 5 * 6.283 + 0.3; g.moveTo(x, y); g.arc(x + Math.cos(an) * q * 0.6, y + Math.sin(an) * q * 0.6, q * 0.45, 0, 6.283); } g.fill(); }
  else if (shape === 'sun') { g.arc(x, y, q * 0.6, 0, 6.283); g.fill(); g.beginPath(); for (let a = 0; a < 8; a++) { const an = a / 8 * 6.283; g.moveTo(x + Math.cos(an) * q * 0.85, y + Math.sin(an) * q * 0.85); g.lineTo(x + Math.cos(an) * q * 1.25, y + Math.sin(an) * q * 1.25); } g.stroke(); }
  else { g.rect(x - q * 0.8, y - q * 0.8, q * 1.6, q * 1.6); g.fill(); }
  if (o.special) { // 流眼
    g.strokeStyle = '#7fe8ff'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, h * 0.92, S.t * 3, S.t * 3 + 4.6); g.stroke();
    g.strokeStyle = 'rgba(127,232,255,.4)'; g.beginPath(); g.arc(x, y, h * 1.02, 0, 6.283); g.stroke();
  }
  if (o.sel) { g.strokeStyle = '#ffffff'; g.lineWidth = 3; rr(x - h - 2, y - h - 2, z + 4, z + 4, z * 0.18); g.stroke(); }
  g.globalAlpha = 1;
}
function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const lerp = (a, b, k) => a + (b - a) * k;
const mix = (a, b, k) => { k = Math.max(0, Math.min(1, k)); return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`; };

// 測試用
window.__battle = { get: () => S && S.game, state: () => S };
