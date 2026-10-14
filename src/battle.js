// 淨化之戰（三消）：開啟獸靈門前，擋在門前的「濁流」異象（流的失衡）要先被淨化
// 交換相鄰兩格，連成三個以上就消除，消掉的元素化成光打向濁流；連四個會留下「流眼」，消掉時清空整排整列
// 濁流每隔幾步會把格子染成濁塊，在旁邊消除就能洗掉；步數用完就重來（下一次步數更多）
import { sfx } from './audio.js';
import { t } from './i18n.js';

const C = 6, R = 6, KINDS = 5, MURK = -1;
// 海、山、花、陽、石：顏色之外再用形狀區分
const TILE = [['#3d8bff', 'wave'], ['#45b36b', 'tri'], ['#ff7aa8', 'flower'], ['#ffc93c', 'sun'], ['#b9c6d6', 'square']];

// 每座門的玩法呼應它的特質
const STYLE = {
  elephant: { moves: 14, gain: 2.2, murkEvery: 0, murkN: 0, eyes: 0, chain: 0.25 }, // 穩定：沒有濁塊，好上手
  tiger: { moves: 12, gain: 1.7, murkEvery: 4, murkN: 2, eyes: 0, chain: 0.6 },     // 爆發：連鎖加成最大
  leopard: { moves: 12, gain: 1.6, murkEvery: 3, murkN: 2, eyes: 3, chain: 0.25 },  // 敏捷：開場就有三個流眼
  lion: { moves: 12, gain: 1.6, murkEvery: 2, murkN: 2, eyes: 0, chain: 0.3 },     // 威勢：最後一戰，濁塊最多
};

const el = document.createElement('div');
el.id = 'battle';
el.innerHTML = `<canvas></canvas>
  <header><b></b><div class="bar"><i></i></div><span class="hp"></span></header>
  <div class="msg"><h3></h3><p></p><button></button></div>`;
document.body.appendChild(el);
const cv = el.querySelector('canvas'), g = cv.getContext('2d');
const bar = el.querySelector('.bar i'), hpEl = el.querySelector('.hp');
const msg = el.querySelector('.msg'), msgH = msg.querySelector('h3'), msgP = msg.querySelector('p'), msgB = msg.querySelector('button');

let B = null, raf = 0, last = 0, uid = 0, bonus = 0;
const tries = {};

// extra：走路修行的境界加成步數；note：開場說明多一行
export function battle(node, extra = 0, note = '') {
  return new Promise(resolve => {
    bonus = extra;
    tries[node.id] = tries[node.id] || 0;
    el.classList.add('show');
    el.querySelector('header b').textContent = `${node.icon} ${node.name}`;
    B = fresh(node); B.done = resolve; setHud();
    showMsg(t('battleTitle', { name: node.name }), t('battleTip_' + node.id) + (note ? '\n' + note : '') + '\n' + t('battleHow'), t('battleGo'), () => { B.run = true; });
    cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(tick);
  });
}

function fresh(node) {
  const ease = Math.min(2, tries[node.id] || 0), st = { ...STYLE[node.id] };
  // 輸過一次：步數多三步、每次淨化多一點
  st.moves += ease * 3 + bonus; st.gain *= 1 + ease * 0.15;
  const b = { node, st, run: false, t: 0, pur: 0, moves: st.moves, turn: 0, grid: [], phase: 'idle', timer: 0, chain: 0, sel: -1, swapA: -1, swapB: -1,
    fx: [], shots: [], hitT: 0, win: 0, shake: 0, lay: null, done: null };
  B = b;
  do { fill(); } while (!hasMove());
  for (let k = 0; k < st.eyes; k++) b.grid[(Math.random() * C * R) | 0].s = 1;
  return b;
}
const cell = k => ({ k, s: 0, id: uid++, ox: 0, oy: 0, sc: 1, die: 0 });
function fill() {
  B.grid = [];
  for (let i = 0; i < C * R; i++) {
    let k; const r = (i / C) | 0, c = i % C;
    do { k = (Math.random() * KINDS) | 0; } while ((c >= 2 && B.grid[i - 1].k === k && B.grid[i - 2].k === k) || (r >= 2 && B.grid[i - C].k === k && B.grid[i - 2 * C].k === k));
    B.grid.push(cell(k));
  }
}

function showMsg(h, p, btn, fn) {
  msgH.textContent = h; msgP.textContent = p; msgB.textContent = btn; msg.classList.add('show');
  msgB.onclick = e => { e.stopPropagation(); msg.classList.remove('show'); fn(); };
}
function setHud() { hpEl.textContent = t('battleMoves', { n: B.moves }); bar.style.width = Math.min(100, B.pur).toFixed(1) + '%'; }

// ---------- 版面 ----------
function size() {
  const dpr = Math.min(2, devicePixelRatio || 1), w = innerWidth, h = innerHeight;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const top = 56, enemyH = Math.max(120, Math.min(240, h * 0.28));
  const s = Math.floor(Math.min((Math.min(w, 460) - 32) / C, (h - top - enemyH - 70) / R));
  const bw = s * C, bx = (w - bw) / 2, by = top + enemyH;
  B.lay = { w, h, s, bx, by, ex: w / 2, ey: top + enemyH * 0.48, er: enemyH * 0.36, gy: Math.min(h - 36, by + s * R + 44) };
  return B.lay;
}
const pos = i => { const L = B.lay; return [L.bx + (i % C + 0.5) * L.s, L.by + (((i / C) | 0) + 0.5) * L.s]; };
function at(x, y) {
  const L = B.lay, c = Math.floor((x - L.bx) / L.s), r = Math.floor((y - L.by) / L.s);
  return c >= 0 && c < C && r >= 0 && r < R ? r * C + c : -1;
}
const adj = (a, b) => (Math.abs(a - b) === 1 && ((a / C) | 0) === ((b / C) | 0)) || Math.abs(a - b) === C;

// ---------- 規則 ----------
const kindAt = (gr, i) => gr[i] ? gr[i].k : MURK;
function runs(gr = B.grid) {
  const out = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C;) {
    const k = kindAt(gr, r * C + c); let e = c + 1;
    while (e < C && k !== MURK && kindAt(gr, r * C + e) === k) e++;
    if (k !== MURK && e - c >= 3) out.push(Array.from({ length: e - c }, (_, j) => r * C + c + j));
    c = e;
  }
  for (let c = 0; c < C; c++) for (let r = 0; r < R;) {
    const k = kindAt(gr, r * C + c); let e = r + 1;
    while (e < R && k !== MURK && kindAt(gr, e * C + c) === k) e++;
    if (k !== MURK && e - r >= 3) out.push(Array.from({ length: e - r }, (_, j) => (r + j) * C + c));
    r = e;
  }
  return out;
}
function swapped(a, b) { const gr = B.grid.slice(); [gr[a], gr[b]] = [gr[b], gr[a]]; return gr; }
function canSwap(a, b) { return B.grid[a].k !== MURK && B.grid[b].k !== MURK; }
function hasMove() {
  for (let i = 0; i < C * R; i++) for (const j of [i + 1, i + C]) {
    if (j >= C * R || (j === i + 1 && j % C === 0) || !canSwap(i, j)) continue;
    if (runs(swapped(i, j)).length) return true;
  }
  return false;
}

function trySwap(a, b) {
  if (B.phase !== 'idle' || !B.run || !adj(a, b) || !canSwap(a, b)) return;
  doSwap(a, b); B.swapA = a; B.swapB = b; B.phase = 'swap'; B.chain = 0; B.sel = -1;
}
function doSwap(a, b) {
  const gr = B.grid, s = B.lay.s, [ac, ar] = [a % C, (a / C) | 0], [bc, br] = [b % C, (b / C) | 0];
  [gr[a], gr[b]] = [gr[b], gr[a]];
  gr[a].ox = (bc - ac) * s; gr[a].oy = (br - ar) * s; gr[b].ox = (ac - bc) * s; gr[b].oy = (ar - br) * s;
}

function clearStep(rs) {
  const gr = B.grid, kill = new Set(rs.flat()), keep = new Set();
  // 連四以上：留下一顆流眼（優先留在剛交換的位置）
  for (const run of rs) if (run.length >= 4) {
    const k = run.find(i => i === B.swapA || i === B.swapB) ?? run[run.length >> 1];
    if (!gr[k].s) keep.add(k);
  }
  // 流眼被消：清空整排整列（可連鎖）
  const queue = [...kill].filter(i => gr[i].s && !keep.has(i));
  while (queue.length) {
    const i = queue.pop(), r = (i / C) | 0, c = i % C;
    burstLine(i);
    for (let j = 0; j < C; j++) { const x = r * C + j; if (!kill.has(x)) { kill.add(x); if (gr[x].s) queue.push(x); } }
    for (let j = 0; j < R; j++) { const x = j * C + c; if (!kill.has(x)) { kill.add(x); if (gr[x].s) queue.push(x); } }
  }
  for (const k of keep) kill.delete(k);
  // 旁邊有消除的濁塊一起洗掉
  for (const i of [...kill]) for (const j of [i - C, i + C, i % C ? i - 1 : -1, (i + 1) % C ? i + 1 : -1]) if (j >= 0 && j < C * R && gr[j].k === MURK) kill.add(j);
  let n = 0;
  for (const i of kill) { gr[i].die = 0.001; n++; const [x, y] = pos(i); shoot(x, y, gr[i].k === MURK ? '#b9a6d6' : TILE[gr[i].k][0]); }
  for (const k of keep) { gr[k].s = 1; gr[k].sc = 1.4; }
  const mult = 1 + B.chain * B.st.chain;
  B.pur += n * B.st.gain * mult;
  sfx.hit(B.chain * 2 + Math.min(3, n - 3));
  try { navigator.vibrate && navigator.vibrate(10 + B.chain * 8); } catch { }
  B.phase = 'clear'; B.timer = 0.22;
}
function gravity() {
  const gr = B.grid, s = B.lay.s;
  for (let c = 0; c < C; c++) {
    const col = [];
    for (let r = R - 1; r >= 0; r--) { const x = gr[r * C + c]; if (!x.die) col.push([x, r]); }
    const fresh = R - col.length;
    for (let r = R - 1, j = 0; r >= 0; r--, j++) {
      if (j < col.length) { const [x, from] = col[j]; x.oy = (from - r) * s; gr[r * C + c] = x; }
      else { const x = cell((Math.random() * KINDS) | 0); x.oy = -fresh * s; gr[r * C + c] = x; }
    }
  }
}
function endTurn() {
  B.moves--; B.turn++;
  if (B.pur >= 100) return win();
  if (B.st.murkEvery && B.turn % B.st.murkEvery === 0) enemyTurn();
  if (B.moves <= 0) return lose();
  if (!hasMove()) { do { for (const x of B.grid) if (x.k !== MURK) x.k = (Math.random() * KINDS) | 0; } while (runs().length || !hasMove()); }
  B.phase = 'idle'; setHud();
}
// 濁流反擊：把幾格染成濁塊
function enemyTurn() {
  const free = B.grid.map((x, i) => x.k !== MURK && !x.s ? i : -1).filter(i => i >= 0);
  for (let n = 0; n < B.st.murkN && free.length; n++) {
    const i = free.splice((Math.random() * free.length) | 0, 1)[0];
    B.grid[i].k = MURK; B.grid[i].sc = 1.5;
    const [x, y] = pos(i); burst(x, y, '#5a4e6e', 10, 120);
  }
  B.shake = 0.3; sfx.hurt();
}

function shoot(x, y, col) { B.shots.push({ x, y, x0: x, y0: y, t: 0, d: 0.35 + Math.random() * 0.2, col }); }
function burst(x, y, col, n = 14, sp = 160) {
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = sp * (0.3 + Math.random()); B.fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5 + Math.random() * 0.4, col }); }
}
function burstLine(i) { const [x, y] = pos(i); burst(x, y, '#7fe8ff', 24, 260); sfx.dispel(); }

// ---------- 操作：拖曳交換，或先點一格再點相鄰的一格 ----------
let down = null;
cv.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (!B || !B.run || B.phase !== 'idle') return;
  const i = at(e.clientX, e.clientY); if (i < 0) return;
  down = { i, x: e.clientX, y: e.clientY, moved: false };
});
cv.addEventListener('pointermove', e => {
  if (!down || down.moved) return;
  const dx = e.clientX - down.x, dy = e.clientY - down.y;
  if (Math.hypot(dx, dy) < B.lay.s * 0.35) return;
  down.moved = true;
  const i = down.i, c = i % C, r = (i / C) | 0;
  const j = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? (c < C - 1 ? i + 1 : -1) : (c > 0 ? i - 1 : -1)) : (dy > 0 ? (r < R - 1 ? i + C : -1) : (r > 0 ? i - C : -1));
  if (j >= 0) trySwap(i, j);
});
addEventListener('pointerup', () => {
  if (!down) return;
  const i = down.i, moved = down.moved; down = null;
  if (moved || !B || B.phase !== 'idle') return;
  if (B.sel >= 0 && adj(B.sel, i)) trySwap(B.sel, i);
  else { B.sel = B.sel === i ? -1 : i; sfx.dispel(); }
});

// ---------- 主迴圈 ----------
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!B) return;
  const L = size();
  B.t += dt;
  // 動畫：位移收斂、縮放、消失
  let moving = false;
  const v = L.s * 14 * dt;
  for (const x of B.grid) {
    if (x.ox) { x.ox = Math.abs(x.ox) <= v ? 0 : x.ox - Math.sign(x.ox) * v; moving = true; }
    if (x.oy) { x.oy = Math.abs(x.oy) <= v ? 0 : x.oy - Math.sign(x.oy) * v; moving = true; }
    if (x.die) x.die += dt;
    x.sc += (1 - x.sc) * Math.min(1, dt * 10);
  }
  if (B.phase === 'swap' && !moving) {
    const rs = runs();
    if (rs.length) clearStep(rs);
    else { doSwap(B.swapA, B.swapB); B.phase = 'unswap'; sfx.deny(); }
  } else if (B.phase === 'unswap' && !moving) B.phase = 'idle';
  else if (B.phase === 'clear' && (B.timer -= dt) <= 0) { gravity(); B.phase = 'fall'; }
  else if (B.phase === 'fall' && !moving) {
    const rs = runs(); B.swapA = B.swapB = -1;
    if (rs.length) { B.chain++; clearStep(rs); } else endTurn();
  }
  // 光彈飛向濁流
  for (const s of B.shots) {
    s.t += dt; const k = Math.min(1, s.t / s.d), e = k * k;
    s.x = s.x0 + (L.ex - s.x0) * e + Math.sin(k * 3.14) * (s.x0 < L.ex ? -30 : 30); s.y = s.y0 + (L.ey - s.y0) * e;
    if (k >= 1) { s.hit = true; B.hitT = 0.25; burst(L.ex + (Math.random() - 0.5) * L.er, L.ey + (Math.random() - 0.5) * L.er * 0.6, s.col, 4, 120); }
  }
  B.shots = B.shots.filter(s => !s.hit);
  B.hitT = Math.max(0, B.hitT - dt); B.shake = Math.max(0, B.shake - dt);
  if (B.win) B.win += dt;
  for (const p of B.fx) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94; p.life -= dt; }
  B.fx = B.fx.filter(p => p.life > 0);
  bar.style.width = Math.min(100, B.pur).toFixed(1) + '%';
  draw(L);
  if (el.classList.contains('show')) raf = requestAnimationFrame(tick);
}

function win() {
  B.run = false; B.win = 0.001; B.pur = 100; B.phase = 'done'; setHud();
  const L = B.lay; burst(L.ex, L.ey, '#ffcf5a', 60, 320); burst(L.ex, L.ey, '#7fe8ff', 40, 240);
  sfx.purify();
  const done = B.done;
  setTimeout(() => { el.classList.remove('show'); B = null; done && done(); }, 1800);
}
function lose() {
  B.run = false; B.phase = 'done'; setHud(); sfx.deny();
  const node = B.node, done = B.done; tries[node.id]++;
  showMsg(t('battleLose'), t('battleLoseTip'), t('battleRetry'), () => { fresh(node); B.done = done; B.run = true; setHud(); });
}

// ---------- 繪製 ----------
function draw(L) {
  const { w, h, s } = L, p = Math.min(1, B.pur / 100), win = B.win ? Math.min(1, B.win / 1.2) : 0, T = B.t;
  g.clearRect(0, 0, w, h);
  const bg = g.createRadialGradient(L.ex, L.ey, 10, w / 2, h * 0.45, Math.max(w, h) * 0.8);
  bg.addColorStop(0, `rgba(${lerp(40, 60, p)},${lerp(30, 120, p)},${lerp(70, 150, p)},.94)`);
  bg.addColorStop(1, 'rgba(5,10,22,.97)');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.save();
  if (B.shake) g.translate((Math.random() - 0.5) * 12 * B.shake, (Math.random() - 0.5) * 12 * B.shake);
  // 濁流：一團旋轉的方塊，淨化越多越小、越亮；被打中時抖一下、閃白
  const jx = B.hitT ? (Math.random() - 0.5) * 8 : 0, n = 22, rad = L.er * (1 - p * 0.45) * (1 - win);
  for (let i = 0; i < n; i++) {
    const a = i / n * 6.283 + T * (0.6 + (i % 3) * 0.25), rr = rad * (0.35 + ((i * 37) % 10) / 14) + Math.sin(T * 2 + i) * 4;
    const x = L.ex + jx + Math.cos(a) * rr, y = L.ey + Math.sin(a) * rr * 0.7, sz = 8 + (i % 4) * 4 + Math.sin(T * 3 + i) * 2;
    g.save(); g.translate(x, y); g.rotate(a + T);
    const m = (i % 5) / 5;
    g.fillStyle = B.hitT > 0.15 ? '#ffffff' : mix([58 + m * 30, 50 + m * 20, 86 + m * 30], [127, 232, 255], p * 0.8 + win);
    g.globalAlpha = 0.85 * (1 - win); g.fillRect(-sz / 2, -sz / 2, sz, sz); g.restore();
  }
  g.globalAlpha = 1 - win;
  g.fillStyle = mix([20, 14, 34], [255, 207, 90], p); g.beginPath(); g.arc(L.ex + jx, L.ey, rad * 0.32 + 4, 0, 6.283); g.fill();
  g.globalAlpha = 1;
  // 棋盤
  g.fillStyle = 'rgba(8,14,26,.55)'; rr(L.bx - 6, L.by - 6, s * C + 12, s * R + 12, 12); g.fill();
  g.save(); g.beginPath(); g.rect(L.bx - 6, L.by - 6, s * C + 12, s * R + 12); g.clip();
  for (let i = 0; i < C * R; i++) {
    const x = B.grid[i]; if (!x) continue;
    const [cx, cy] = pos(i), k = x.die ? Math.max(0, 1 - x.die / 0.2) : 1, z = s * 0.86 * x.sc * k;
    if (z <= 0) continue;
    drawTile(cx + x.ox, cy + x.oy, z, x, i === B.sel);
  }
  g.restore();
  // 守護獸
  const glow = g.createRadialGradient(w / 2, L.gy, 4, w / 2, L.gy, 34 + win * 80);
  glow.addColorStop(0, `rgba(255,207,90,${0.5 + win * 0.4})`); glow.addColorStop(1, 'rgba(255,207,90,0)');
  g.fillStyle = glow; g.beginPath(); g.arc(w / 2, L.gy, 34 + win * 80, 0, 6.283); g.fill();
  g.font = '30px system-ui, "Apple Color Emoji", "Segoe UI Emoji"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(B.node.icon, w / 2, L.gy - win * 16);
  for (const q of B.shots) { g.fillStyle = q.col; g.globalAlpha = 0.9; g.fillRect(q.x - 4, q.y - 4, 8, 8); }
  for (const q of B.fx) { g.globalAlpha = Math.min(1, q.life * 2); g.fillStyle = q.col; g.fillRect(q.x - 3, q.y - 3, 6, 6); }
  g.globalAlpha = 1;
  if (B.chain >= 1 && (B.phase === 'clear' || B.phase === 'fall')) { g.fillStyle = '#ffcf5a'; g.font = '900 18px system-ui'; g.fillText(t('battleCombo', { n: B.chain + 1 }), w / 2, L.by - 16); }
  g.restore();
}
function drawTile(x, y, z, c, sel) {
  const h = z / 2;
  if (c.k === MURK) {
    g.fillStyle = '#2b2440'; rr(x - h, y - h, z, z, z * 0.12); g.fill();
    g.strokeStyle = '#8e7bb5'; g.lineWidth = 2; g.stroke();
    g.fillStyle = 'rgba(142,123,181,.5)'; g.fillRect(x - h * 0.35, y - h * 0.35, h * 0.7, h * 0.7);
    return;
  }
  const [col, shape] = TILE[c.k];
  // 方塊：主色、上緣亮邊、下緣暗邊
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
  if (c.s) { // 流眼
    g.strokeStyle = '#7fe8ff'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, h * 0.92, B.t * 3, B.t * 3 + 4.6); g.stroke();
    g.strokeStyle = 'rgba(127,232,255,.4)'; g.beginPath(); g.arc(x, y, h * 1.02, 0, 6.283); g.stroke();
  }
  if (sel) { g.strokeStyle = '#ffffff'; g.lineWidth = 3; rr(x - h - 2, y - h - 2, z + 4, z + 4, z * 0.18); g.stroke(); }
}
function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const lerp = (a, b, k) => a + (b - a) * k;
const mix = (a, b, k) => { k = Math.max(0, Math.min(1, k)); return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`; };

// 測試用
window.__battle = { get: () => B, swap: trySwap, runs, swapped, C, R, MURK };
