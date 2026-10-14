// 淨化之戰：開啟獸靈門前，擋在門前的「濁流」異象（流的失衡）要先被淨化
// 單手點擊、約 20 秒；點亮流眼累積淨化度，點掉飛來的濁滴，被打中三次就退回重來（下一次會變簡單）
import { sfx } from './audio.js';
import { t } from './i18n.js';

// 每座門的玩法呼應它的特質
const STYLE = {
  elephant: { eye: 1.9, every: 1.0, cluster: 1, drift: 0, drop: 2.6, dropV: 0.16, gain: 11 }, // 穩定：慢、清楚
  tiger: { eye: 1.15, every: 1.5, cluster: 3, drift: 0, drop: 2.2, dropV: 0.2, gain: 8 },     // 爆發：一次冒三個，連擊
  leopard: { eye: 1.5, every: 0.85, cluster: 1, drift: 0.28, drop: 2.2, dropV: 0.2, gain: 9 }, // 敏捷：流眼會游動
  lion: { eye: 1.4, every: 0.8, cluster: 2, drift: 0.12, drop: 1.4, dropV: 0.22, gain: 7 },   // 威勢：最後一戰，濁滴最多
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

let B = null, raf = 0, last = 0;
const tries = {};

export function battle(node) {
  return new Promise(resolve => {
    tries[node.id] = tries[node.id] || 0;
    el.classList.add('show');
    el.querySelector('header b').textContent = `${node.icon} ${node.name}`;
    const intro = () => {
      showMsg(t('battleTitle', { name: node.name }), t('battleTip_' + node.id) + '\n' + t('battleHow'), t('battleGo'), () => begin(node, resolve));
    };
    intro();
    cancelAnimationFrame(raf); last = performance.now(); B = idle(node); raf = requestAnimationFrame(tick);
  });
}

function idle(node) { return { node, st: STYLE[node.id], run: false, t: 0, pur: 0, hp: 3, eyes: [], drops: [], fx: [], spawn: 0.4, dropT: 1.5, combo: 0, comboT: 0, shake: 0, win: 0, done: null }; }

function begin(node, resolve) {
  hideMsg();
  const ease = Math.min(2, tries[node.id]);
  B = idle(node); B.run = true; B.done = resolve; B.ease = ease;
  B.st = { ...STYLE[node.id] };
  // 輸過一次：流眼留久一點、濁滴慢一點少一點、每次淨化多一點
  B.st.eye *= 1 + ease * 0.3; B.st.drop *= 1 + ease * 0.5; B.st.dropV *= 1 - ease * 0.2; B.st.gain *= 1 + ease * 0.25;
  setHp();
}

function showMsg(h, p, btn, fn) {
  msgH.textContent = h; msgP.textContent = p; msgB.textContent = btn; msg.classList.add('show');
  msgB.onclick = e => { e.stopPropagation(); msg.classList.remove('show'); fn(); };
}
function hideMsg() { msg.classList.remove('show'); }
function setHp() { hpEl.textContent = '◆'.repeat(B.hp) + '◇'.repeat(3 - B.hp); }

function size() {
  const dpr = Math.min(2, devicePixelRatio || 1), w = innerWidth, h = innerHeight;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return [w, h];
}
// 濁流在畫面上半、守護獸在下方
const core = (w, h) => [w / 2, h * 0.36, Math.min(w, h) * 0.2];
const guard = (w, h) => [w / 2, h * 0.84];

function spawnEye(w, h) {
  const [cx, cy, R] = core(w, h);
  for (let i = 0; i < B.st.cluster; i++) {
    const a = Math.random() * 6.283, d = R * (0.55 + Math.random() * 0.9);
    const vx = (Math.random() - 0.5) * 2 * B.st.drift * w, vy = (Math.random() - 0.5) * 2 * B.st.drift * h * 0.5;
    B.eyes.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.8, vx, vy, t: 0, life: B.st.eye + i * 0.15 });
  }
}
function spawnDrop(w, h) {
  const [cx, cy, R] = core(w, h), a = Math.PI * (0.2 + Math.random() * 0.6);
  B.drops.push({ x: cx + Math.cos(a) * R * 0.8, y: cy + Math.sin(a) * R * 0.6, t: 0 });
}
function burst(x, y, col, n = 14, sp = 160) {
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = sp * (0.3 + Math.random()); B.fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5 + Math.random() * 0.4, col }); }
}

cv.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (!B || !B.run) return;
  const x = e.clientX, y = e.clientY, R = 44;
  let best = null, bd = R;
  for (const o of B.eyes) { const d = Math.hypot(o.x - x, o.y - y); if (d < bd) { bd = d; best = o; } }
  for (const o of B.drops) { const d = Math.hypot(o.x - x, o.y - y); if (d < bd) { bd = d; best = o; } }
  if (!best) return;
  if (B.eyes.includes(best)) {
    B.eyes.splice(B.eyes.indexOf(best), 1);
    B.combo = B.comboT > 0 ? B.combo + 1 : 0; B.comboT = 0.9;
    B.pur += B.st.gain * (1 + Math.min(B.combo, 4) * (B.node.id === 'tiger' ? 0.35 : 0.15));
    sfx.hit(B.combo); burst(best.x, best.y, '#7fe8ff');
    try { navigator.vibrate && navigator.vibrate(12); } catch { }
  } else {
    B.drops.splice(B.drops.indexOf(best), 1);
    B.pur += 2.5; sfx.dispel(); burst(best.x, best.y, '#b9a6d6', 8, 110);
  }
});

function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!B) return;
  const [w, h] = size();
  B.t += dt;
  if (B.run) {
    B.spawn -= dt; B.dropT -= dt; B.comboT -= dt;
    if (B.spawn <= 0) { spawnEye(w, h); B.spawn = B.st.every * (B.st.cluster > 1 ? 1.6 : 1); }
    if (B.dropT <= 0) { spawnDrop(w, h); B.dropT = B.st.drop * (0.7 + Math.random() * 0.6); }
    const [gx, gy] = guard(w, h);
    for (const o of B.eyes) { o.t += dt; o.x += o.vx * dt; o.y += o.vy * dt; if (o.x < 30 || o.x > w - 30) o.vx *= -1; if (o.y < h * 0.12 || o.y > h * 0.62) o.vy *= -1; }
    B.eyes = B.eyes.filter(o => o.t < o.life);
    for (const o of B.drops) {
      o.t += dt; const dx = gx - o.x, dy = gy - o.y, d = Math.hypot(dx, dy), v = B.st.dropV * h;
      o.x += dx / d * v * dt; o.y += dy / d * v * dt;
      if (d < 34) {
        o.hit = true; B.hp--; B.shake = 0.35; setHp(); sfx.hurt(); burst(gx, gy, '#5a4e6e', 16, 140);
        try { navigator.vibrate && navigator.vibrate([30, 40, 30]); } catch { }
      }
    }
    B.drops = B.drops.filter(o => !o.hit);
    if (B.pur >= 100) win(w, h);
    else if (B.hp <= 0) lose();
  }
  if (B.win) B.win += dt;
  B.shake = Math.max(0, B.shake - dt);
  for (const p of B.fx) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94; p.life -= dt; }
  B.fx = B.fx.filter(p => p.life > 0);
  bar.style.width = Math.min(100, B.pur).toFixed(1) + '%';
  draw(w, h);
  if (el.classList.contains('show')) raf = requestAnimationFrame(tick);
}

function win(w, h) {
  B.run = false; B.win = 0.001; B.pur = 100; B.eyes = []; B.drops = [];
  const [cx, cy] = core(w, h); burst(cx, cy, '#ffcf5a', 60, 320); burst(cx, cy, '#7fe8ff', 40, 240);
  sfx.purify();
  const done = B.done;
  setTimeout(() => { el.classList.remove('show'); B = null; done && done(); }, 1700);
}

function lose() {
  B.run = false; B.eyes = []; B.drops = []; sfx.deny();
  const node = B.node, done = B.done; tries[node.id]++;
  showMsg(t('battleLose'), t('battleLoseTip'), t('battleRetry'), () => begin(node, done));
}

// 濁流：一團旋轉的方塊（Roblox 方塊風格），淨化越多越小、越亮
function draw(w, h) {
  g.clearRect(0, 0, w, h);
  const p = Math.min(1, B.pur / 100), win = B.win ? Math.min(1, B.win / 1.2) : 0;
  const bg = g.createRadialGradient(w / 2, h * 0.38, 10, w / 2, h * 0.45, Math.max(w, h) * 0.75);
  bg.addColorStop(0, `rgba(${lerp(40, 60, p)},${lerp(30, 120, p)},${lerp(70, 150, p)},.92)`);
  bg.addColorStop(1, 'rgba(5,10,22,.96)');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.save();
  if (B.shake) g.translate((Math.random() - 0.5) * 12 * B.shake, (Math.random() - 0.5) * 12 * B.shake);
  const [cx, cy, R] = core(w, h), T = B.t;
  // 濁流本體
  const n = 26, rad = R * (1 - p * 0.45) * (1 - win);
  for (let i = 0; i < n; i++) {
    const a = i / n * 6.283 + T * (0.6 + (i % 3) * 0.25), rr = rad * (0.35 + ((i * 37) % 10) / 14) + Math.sin(T * 2 + i) * 6;
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.75, s = 10 + (i % 4) * 5 + Math.sin(T * 3 + i) * 2;
    g.save(); g.translate(x, y); g.rotate(a + T);
    const m = (i % 5) / 5;
    g.fillStyle = mix([58 + m * 30, 50 + m * 20, 86 + m * 30], [127, 232, 255], p * 0.8 + win);
    g.globalAlpha = 0.85 * (1 - win);
    g.fillRect(-s / 2, -s / 2, s, s);
    g.restore();
  }
  // 核心之眼
  g.globalAlpha = 1 - win;
  g.fillStyle = mix([20, 14, 34], [255, 207, 90], p); g.beginPath(); g.arc(cx, cy, rad * 0.32 + 4, 0, 6.283); g.fill();
  g.globalAlpha = 1;
  // 流眼（點這個）
  for (const o of B.eyes) {
    const k = o.t / o.life, a = k < 0.15 ? k / 0.15 : k > 0.8 ? (1 - k) / 0.2 : 1, r = 18 + Math.sin(T * 8 + o.x) * 2;
    g.globalAlpha = a;
    g.strokeStyle = '#7fe8ff'; g.lineWidth = 3; g.beginPath(); g.arc(o.x, o.y, r, 0, 6.283); g.stroke();
    g.strokeStyle = 'rgba(127,232,255,.35)'; g.beginPath(); g.arc(o.x, o.y, r + 7 + (1 - k) * 6, 0, 6.283 * (1 - k)); g.stroke();
    g.fillStyle = '#e8fbff'; g.beginPath(); g.arc(o.x, o.y, 6, 0, 6.283); g.fill();
  }
  g.globalAlpha = 1;
  // 濁滴（點掉，別讓它碰到守護獸）
  for (const o of B.drops) {
    g.save(); g.translate(o.x, o.y); g.rotate(T * 3);
    g.fillStyle = '#2b2440'; g.fillRect(-11, -11, 22, 22);
    g.strokeStyle = '#8e7bb5'; g.lineWidth = 2; g.strokeRect(-11, -11, 22, 22);
    g.restore();
  }
  // 守護獸
  const [gx, gy] = guard(w, h);
  const glow = g.createRadialGradient(gx, gy, 4, gx, gy, 52 + win * 80);
  glow.addColorStop(0, `rgba(255,207,90,${0.55 + win * 0.4})`); glow.addColorStop(1, 'rgba(255,207,90,0)');
  g.fillStyle = glow; g.beginPath(); g.arc(gx, gy, 52 + win * 80, 0, 6.283); g.fill();
  g.font = '40px system-ui, "Apple Color Emoji", "Segoe UI Emoji"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(B.node.icon, gx, gy - win * 20);
  for (const q of B.fx) { g.globalAlpha = Math.min(1, q.life * 2); g.fillStyle = q.col; g.fillRect(q.x - 3, q.y - 3, 6, 6); }
  g.globalAlpha = 1;
  if (B.run && B.combo >= 2 && B.comboT > 0) { g.fillStyle = '#ffcf5a'; g.font = '900 18px system-ui'; g.fillText(t('battleCombo', { n: B.combo + 1 }), w / 2, h * 0.66); }
  g.restore();
}
const lerp = (a, b, k) => a + (b - a) * k;
const mix = (a, b, k) => { k = Math.max(0, Math.min(1, k)); return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`; };
window.__battle = () => B; // 測試用
