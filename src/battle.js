// 淨化之戰：開啟獸靈門前，擋在門前的「濁流」異象（流的失衡）要先被淨化
// 四座門各一種玩法，呼應各自的特質：象門數獨（記憶）、虎門連點（爆發）、豹門畫符（敏捷）、獅門三消（威勢）
// 這支檔案是共用的外框：濁流、淨化度、光彈、粒子、開場說明與重來；玩法本身在 src/games/
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { sudoku } from './games/sudoku.js';
import { taphero } from './games/taphero.js';
import { sigil } from './games/sigil.js';
import { match3 } from './games/match3.js';

// 第二階：城之回聲連點（城市的節奏）、海之流痕畫符（描出洋流）、山之鐘聲數獨（山的記憶）
const GAMES = { elephant: sudoku, tiger: taphero, leopard: sigil, lion: match3, city: taphero, sea: sigil, peak: sudoku };
// 測試用：?game=sudoku|taphero|sigil|match3 讓每一門都用同一種玩法
const FORCE = { sudoku, taphero, sigil, match3 }[new URLSearchParams(location.search).get('game')];
// 終極 BOSS 濁淵：四關連戰，依序是象（數獨）、虎（連點）、豹（畫符）、獅（三消）
export const BOSS_PHASES = ['elephant', 'tiger', 'leopard', 'lion'];
const gameOf = (node, ph = 0) => FORCE || GAMES[node.boss ? BOSS_PHASES[ph] : node.id] || match3;

// 方塊元素：海、山、花、陽、石（顏色之外再用形狀區分），數獨與三消共用
// 配色跟整體的夜海色調一致：飽和度降一點，像透光的寶石，不用糖果色
export const TILE = [['#4aa3d6', 'wave'], ['#45a884', 'tri'], ['#df86a6', 'flower'], ['#e3b452', 'sun'], ['#8fa3ba', 'square'], ['#8a7fd6', 'moon']];

const el = document.createElement('div');
el.id = 'battle';
el.innerHTML = `<canvas></canvas>
  <header><b></b><div class="bar"><i></i></div><span class="hp"></span></header>
  <div class="msg"><h3></h3><p></p><button></button></div>
  <div class="vic"><div class="vimg"><img class="vb" alt=""></div><h2></h2><p class="vs"></p>
    <div class="vstat"><span><b class="vt"></b><small></small></span><span><b class="vh"></b><small></small></span><span><b class="vr"></b><small></small></span></div>
    <div class="vrw"><small></small><ul></ul></div><button></button></div>
  <button class="xbtn quit" aria-label="leave"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`;
document.body.appendChild(el);
const cv = el.querySelector('canvas'), g = cv.getContext('2d');
const bar = el.querySelector('.bar i'), hpEl = el.querySelector('.hp');
const vic = el.querySelector('.vic');
const msg = el.querySelector('.msg'), msgH = msg.querySelector('h3'), msgP = msg.querySelector('p'), msgB = msg.querySelector('button');

let S = null, raf = 0, last = 0;
// 守門獸（設計圖：ocean-flow-origin/character-ref/beasts/）：被濁流纏住，淨化越多越露出原本的顏色
// 第三階三流：城＝廟口的龍、海＝黑潮的海龜、山＝台灣黑熊
const BEASTS = { elephant: 'elephant', tiger: 'tiger', leopard: 'leopard', lion: 'lion', city: 'dragon', sea: 'turtle', peak: 'bear', boss: 'boss' };
const SPR = {};
for (const [id, k] of Object.entries(BEASTS)) { const im = new Image(); im.src = `img/beasts/${k}.png`; SPR[id] = im; }
const tint = document.createElement('canvas'), tg = tint.getContext('2d');
// 下方是玩家自己的頭像
const me = new Image();
function loadMe() { let v = 'liu'; try { v = localStorage.getItem('of-avatar') || 'liu'; } catch { } me.src = v.startsWith('data:') ? v : `img/avatars/${v}.jpg`; }
// 隨時可以離開：門不會開，之後再回來挑戰
const quitB = el.querySelector('.quit');
quitB.addEventListener('click', e => {
  e.stopPropagation(); if (!S || S.win) return;
  const done = S.done; S = null; msg.classList.remove('show'); el.classList.remove('show'); cancelAnimationFrame(raf); sfx.deny(); done && done(false);
});
const tries = {};
// 這一場的結算：獎勵由呼叫的地方給（開門、靈光…），用時與受擊跨 BOSS 四關累計
let REWARD = [], TOTAL = { t: 0, hits: 0 };

// 星等（node.star）決定這一戰多難，每種玩法各自調整；lv：走路修行的境界，每一境淨化力 +20%；realm：境界名稱
export function battle(node, lv = 0, realm = '', reward = []) {
  return new Promise(resolve => {
    tries[node.id] = tries[node.id] || 0;
    REWARD = reward; TOTAL = { t: 0, hits: 0 }; vic.classList.remove('show');
    el.classList.add('show');
    loadMe();
    start(node, lv, resolve); quitB.setAttribute('aria-label', t('battleQuit'));
    const make = gameOf(node);
    const note = lv && make.key !== 'sudoku' && make.key !== 'sigil' ? '\n' + t('realmPower', { realm, p: lv * 20 }) : '';
    if (node.boss) showMsg(t('bossTitle', { name: node.name }), t('bossTip') + note + '\n\n' + t('bossPhase', { n: 1, m: BOSS_PHASES.length }) + '\n' + t('how_' + make.key), t('battleGo'), () => { S.run = true; });
    else if (node.wild) showMsg(t('wildTitle', { name: node.name }), t('wildTip') + note + '\n' + t('how_' + make.key), t('battleGo'), () => { S.run = true; });
    else showMsg(SPR[node.id] ? t('battleBeast', { beast: t('beast_' + node.id) }) : t('battleTitle', { name: node.name }), t('battleTip_' + node.id) + note + '\n' + t('how_' + make.key), t('battleGo'), () => { S.run = true; });
    cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(tick);
  });
}

function start(node, lv, done, ph = 0) {
  S = { node, lv, done, ph, run: false, t: 0, pur: 0, fx: [], shots: [], hitT: 0, hurt: 0, rings: [], blink: 2, shake: 0, win: 0, lay: null, game: null };
  size();
  el.querySelector('header b').textContent = `${node.name} ${'★'.repeat(node.star || 1)}` + (node.boss ? ` ${ph + 1}/${BOSS_PHASES.length}` : '');
  // BOSS 不會因為輸過而變簡單
  S.game = gameOf(node, ph)(api, { star: node.star || 1, ease: node.boss ? 0 : Math.min(2, tries[node.id] || 0) });
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
  // raw：數獨、畫符這種「做完才算完」的玩法不吃境界加成，不然會還沒解完就結束
  add(n, raw) { S.pur += raw ? n : n * (1 + 0.2 * S.lv); },
  info(s) { hpEl.textContent = s; },
  shoot(x, y, col) { S.shots.push({ x, y, x0: x, y0: y, t: 0, d: 0.35 + Math.random() * 0.2, col }); },
  burst(x, y, col, n = 14, sp = 160) {
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = sp * (0.3 + Math.random()); S.fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5 + Math.random() * 0.4, col }); }
  },
  hurt() { S.shake = 0.3; TOTAL.hits++; sfx.hurt(); try { navigator.vibrate && navigator.vibrate([30, 40, 30]); } catch { } },
  shake(s = 0.3) { S.shake = s; },
  buzz(ms = 12) { try { navigator.vibrate && navigator.vibrate(ms); } catch { } },
  lose() { lose(); },
  tile, rr,
};

// ---------- 版面：上方濁流、中間玩法區、下方守護獸 ----------
// 瀏海／圓角的安全區（px），橫拿時左右都可能有
const saProbe = document.createElement('div');
saProbe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
document.body.appendChild(saProbe);
const sa = k => parseFloat(getComputedStyle(saProbe)[{ t: 'paddingTop', r: 'paddingRight', b: 'paddingBottom', l: 'paddingLeft' }[k]]) || 0;
function size() {
  const dpr = Math.min(2, devicePixelRatio || 1), w = innerWidth, h = innerHeight;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const sl = sa('l'), sr = sa('r'), sb = sa('b');
  // 橫向：濁流與守護獸放左邊，玩法區占右邊整個高度
  if (w > h * 1.15) {
    const lw = Math.max(170, Math.min(w * 0.36, 320)), x0 = sl + lw, aw = Math.min(w - x0 - sr - 16, 560), top = 56;
    const er = Math.min(lw * 0.3, (h - top) * 0.24);
    S.lay = { w, h, ex: sl + lw / 2, ey: top + (h - top) * 0.36, er, gx: sl + lw / 2, gy: h - 40 - sb,
      area: { x: x0 + (w - x0 - sr - aw) / 2, y: top, w: aw, h: h - top - 12 - sb } };
    return S.lay;
  }
  const top = 56, enemyH = Math.max(120, Math.min(240, h * 0.26)), bottom = 76;
  const aw = Math.min(w, 460) - 32;
  S.lay = { w, h, ex: w / 2, ey: top + enemyH * 0.48, er: enemyH * 0.36, gx: w / 2, gy: h - 44,
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
  if (S.run) { S.game.tick(dt); TOTAL.t += dt; }
  if (S.party != null && (S.party -= dt) < 0) { S.party = 0.7; confetti(L); }
  if (S.run && S.pur >= 99.99 && !S.game.busy?.()) win();   // 留一點誤差：100/格數 加總可能差一點點才滿
  for (const s of S.shots) {
    s.t += dt; const k = Math.min(1, s.t / s.d), e = k * k;
    s.x = s.x0 + (L.ex - s.x0) * e + Math.sin(k * 3.14) * (s.x0 < L.ex ? -30 : 30); s.y = s.y0 + (L.ey - s.y0) * e;
    if (k >= 1) { s.hit = true; S.hitT = 0.25; S.hurt = 1; S.rings.push({ t: 0 }); api.burst(L.ex + (Math.random() - 0.5) * L.er, L.ey + (Math.random() - 0.5) * L.er * 0.6, s.col, 4, 120); }
  }
  S.shots = S.shots.filter(s => !s.hit);
  S.hitT = Math.max(0, S.hitT - dt); S.shake = Math.max(0, S.shake - dt);
  S.hurt = Math.max(0, S.hurt - dt / 0.5); S.blink -= dt; if (S.blink < -0.12) S.blink = 2 + Math.random() * 2.5;
  for (const r of S.rings) r.t += dt; S.rings = S.rings.filter(r => r.t < 0.5);
  if (S.win) S.win += dt;
  for (const p of S.fx) { p.x += p.vx * dt; p.y += p.vy * dt; if (!p.conf) { p.vx *= 0.94; p.vy *= 0.94; } p.life -= dt; }
  S.fx = S.fx.filter(p => p.life > 0);
  bar.style.width = Math.min(100, S.pur).toFixed(1) + '%';
  draw(L);
  if (el.classList.contains('show')) raf = requestAnimationFrame(tick);
}

function win() {
  S.run = false; S.win = 0.001; S.pur = 100;
  const L = S.lay; api.burst(L.ex, L.ey, '#ffcf5a', 60, 320); api.burst(L.ex, L.ey, '#7fe8ff', 40, 240);
  sfx.purify();
  const { done, node, lv, ph } = S;
  // BOSS 還有下一關：同一個畫面接著打，濁淵身上的濁色一關一關褪掉
  if (node.boss && ph < BOSS_PHASES.length - 1) {
    const nx = gameOf(node, ph + 1);
    setTimeout(() => { if (!S || S.node !== node) return; showMsg(t('bossNext', { n: ph + 1 }), t('bossPhase', { n: ph + 2, m: BOSS_PHASES.length }) + '\n' + t('how_' + nx.key), t('battleGo'), () => { start(node, lv, done, ph + 1); S.run = true; }); }, 1300);
    return;
  }
  setTimeout(() => { if (S && S.node === node) victory(node, done); }, 1300);
}
// 恭喜過關：守門獸恢復原本的樣子、用時／受擊／評價、這一場拿到的獎勵，按「收下獎勵」才回到世界
function victory(node, done) {
  const { t: sec, hits } = TOTAL, star = hits === 0 ? 3 : hits <= 2 ? 2 : 1;
  vic.querySelector('.vb').src = SPR[node.id]?.src || '';
  vic.querySelector('h2').textContent = t('vicTitle');
  vic.querySelector('.vs').textContent = node.boss ? t('vicBoss') : t('vicSub', { name: SPR[node.id] && !node.wild ? t('beast_' + node.id) : node.name });
  vic.querySelector('.vt').textContent = `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;
  vic.querySelector('.vh').textContent = hits;
  vic.querySelector('.vr').textContent = '★'.repeat(star) + '☆'.repeat(3 - star);
  const [l1, l2, l3] = t('vicStat'); const sm = vic.querySelectorAll('.vstat small'); sm[0].textContent = l1; sm[1].textContent = l2; sm[2].textContent = l3;
  vic.querySelector('.vrw small').textContent = t('vicReward');
  vic.querySelector('.vrw').hidden = !REWARD.length;
  vic.querySelector('ul').innerHTML = REWARD.map(r => `<li>${r}</li>`).join('');
  const b = vic.querySelector('button'); b.textContent = t(REWARD.length ? 'vicTake' : 'vicOk');
  vic.classList.add('show'); S.party = 0; sfx.victory();
  try { navigator.vibrate && navigator.vibrate([40, 50, 40, 50, 120]); } catch { }
  b.onclick = e => { e.stopPropagation(); vic.classList.remove('show'); el.classList.remove('show'); S = null; cancelAnimationFrame(raf); done && done(true); };
}
// 彩帶：金、青、粉的小方塊從上方灑下來
function confetti(L) {
  const cols = ['#ffcf5a', '#7fe8ff', '#df86a6', '#ffffff', '#45a884'];
  for (let i = 0; i < 26; i++) S.fx.push({ x: Math.random() * L.w, y: -10 - Math.random() * 40, vx: (Math.random() - 0.5) * 80, vy: 160 + Math.random() * 160, life: 2.2 + Math.random(), col: cols[i % cols.length], conf: 1 });
}
function lose() {
  if (!S.run) return;
  S.run = false; sfx.deny();
  const { node, lv, done } = S; tries[node.id]++;
  // 野外的濁影：輸了就結束（外面會扣靈光），不給重來
  if (node.boss) { showMsg(t('battleLose'), t('lose_' + gameOf(node, S.ph).key) + '\n' + t('bossLoseTip'), t('wildOk'), () => { S = null; el.classList.remove('show'); cancelAnimationFrame(raf); done(false); }); return; }
  if (node.wild) { showMsg(t('battleLose'), t('lose_' + gameOf(node).key), t('wildOk'), () => { S = null; el.classList.remove('show'); cancelAnimationFrame(raf); done(false); }); return; }
  showMsg(t('battleLose'), t('lose_' + gameOf(node).key) + '\n' + t('loseWalk'), t('battleRetry'), () => { start(node, lv, done); S.run = true; });
}

// ---------- 繪製 ----------
function draw(L) {
  const { w, h } = L, p = S.node.boss ? Math.min(1, (S.ph + S.pur / 100) / BOSS_PHASES.length) : Math.min(1, S.pur / 100), win = S.win ? Math.min(1, S.win / 1.2) : 0, T = S.t;
  g.clearRect(0, 0, w, h);
  const bg = g.createRadialGradient(L.ex, L.ey, 10, w / 2, h * 0.45, Math.max(w, h) * 0.8);
  bg.addColorStop(0, `rgba(${lerp(40, 60, p)},${lerp(30, 120, p)},${lerp(70, 150, p)},.94)`);
  bg.addColorStop(1, 'rgba(5,10,22,.97)');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.save();
  if (S.shake) g.translate((Math.random() - 0.5) * 12 * S.shake, (Math.random() - 0.5) * 12 * S.shake);
  const spr = SPR[S.node.id];
  if (spr && spr.complete && spr.naturalWidth) drawBeast(L, spr, p, win, T);
  else {
    // 濁流：一團旋轉的方塊，淨化越多越小、越亮；被打中時抖一下、閃白
    // 受擊：往後一縮、壓扁再彈回，方塊被震開，核心閃白、眼睛瞇起來
    const hu = S.hurt, kick = hu * hu, wob = Math.sin((1 - hu) * 14) * hu;
    const jx = S.hitT ? (Math.random() - 0.5) * 8 : 0, n = 22, rad = L.er * (1 - p * 0.45) * (1 - win), cy = L.ey - kick * 12;
    for (let i = 0; i < n; i++) {
      const a = i / n * 6.283 + T * (0.6 + (i % 3) * 0.25), r = (rad * (0.35 + ((i * 37) % 10) / 14) + Math.sin(T * 2 + i) * 4) * (1 + kick * 0.45);
      const x = L.ex + jx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.7, sz = 8 + (i % 4) * 4 + Math.sin(T * 3 + i) * 2;
      g.save(); g.translate(x, y); g.rotate(a + T);
      const m = (i % 5) / 5;
      g.fillStyle = S.hitT > 0.15 ? '#ffffff' : mix([58 + m * 30, 50 + m * 20, 86 + m * 30], [127, 232, 255], p * 0.8 + win);
      g.globalAlpha = 0.85 * (1 - win); g.fillRect(-sz / 2, -sz / 2, sz, sz); g.restore();
    }
    g.globalAlpha = 1 - win;
    const cr = rad * 0.32 + 4, cx = L.ex + jx;
    for (const q of S.rings) { g.globalAlpha = (1 - q.t / 0.5) * 0.7 * (1 - win); g.strokeStyle = '#bff4ff'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, cr + q.t * 160, (cr + q.t * 160) * 0.75, 0, 0, 6.283); g.stroke(); }
    g.globalAlpha = 1 - win;
    g.save(); g.translate(cx, cy); g.scale(1 + wob * 0.22, 1 - wob * 0.22);
    g.fillStyle = mix([20, 14, 34], [255, 207, 90], p); g.beginPath(); g.arc(0, 0, cr, 0, 6.283); g.fill();
    if (S.hitT > 0.1) { g.globalAlpha = (1 - win) * S.hitT * 3; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, 0, cr, 0, 6.283); g.fill(); g.globalAlpha = 1 - win; }
    // 眼睛：平常會眨眼，被打中瞇成 > <，快被淨化時變得溫和
    const ex = cr * 0.36, ey = -cr * 0.08, es = Math.max(2.5, cr * 0.13);
    g.strokeStyle = g.fillStyle = mix([255, 120, 160], [255, 255, 255], p);
    g.lineWidth = Math.max(2, es * 0.55); g.lineCap = 'round';
    if (hu > 0.25) {
      for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * ex + es * sd, ey - es); g.lineTo(sd * ex - es * 0.3 * sd, ey); g.lineTo(sd * ex + es * sd, ey + es); g.stroke(); }
    } else if (S.blink < 0) {
      for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * ex - es, ey); g.lineTo(sd * ex + es, ey); g.stroke(); }
    } else {
      for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * ex, ey, es, es * (1.25 - p * 0.5), 0, 0, 6.283); g.fill(); }
    }
    g.restore();
  }
  g.globalAlpha = 1;
  g.save(); S.game.draw(); g.restore();
  // 下方：玩家頭像，光彈從這裡出發
  const gr = 30 + win * 6;
  const glow = g.createRadialGradient(L.gx, L.gy, 4, L.gx, L.gy, gr + 16 + win * 70);
  glow.addColorStop(0, `rgba(255,207,90,${0.5 + win * 0.4})`); glow.addColorStop(1, 'rgba(255,207,90,0)');
  g.fillStyle = glow; g.beginPath(); g.arc(L.gx, L.gy, gr + 16 + win * 70, 0, 6.283); g.fill();
  if (me.complete && me.naturalWidth) {
    g.save(); g.beginPath(); g.arc(L.gx, L.gy, gr, 0, 6.283); g.clip(); g.drawImage(me, L.gx - gr, L.gy - gr, gr * 2, gr * 2); g.restore();
  }
  g.strokeStyle = '#ffcf5a'; g.lineWidth = 2.5; g.beginPath(); g.arc(L.gx, L.gy, gr, 0, 6.283); g.stroke();
  for (const q of S.shots) { g.fillStyle = q.col; g.globalAlpha = 0.9; g.fillRect(q.x - 4, q.y - 4, 8, 8); }
  for (const q of S.fx) { g.globalAlpha = Math.min(1, q.life * 2); g.fillStyle = q.col; g.fillRect(q.x - 3, q.y - 3, 6, 6); }
  g.globalAlpha = 1;
  g.restore();
}

// 方塊元素；k = -1 是濁塊。毛玻璃寶石：半透明漸層、細白框、白色線條圖示
function tile(x, y, z, k, o = {}) {
  const h = z / 2, r = z * 0.22;
  g.globalAlpha = o.alpha ?? 1;
  if (k < 0) {
    g.fillStyle = 'rgba(30,22,48,.82)'; rr(x - h, y - h, z, z, r); g.fill();
    g.strokeStyle = 'rgba(170,150,210,.55)'; g.lineWidth = 1.5; g.setLineDash([4, 4]); g.stroke(); g.setLineDash([]);
    g.strokeStyle = 'rgba(170,150,210,.6)'; g.lineWidth = Math.max(1.5, z * 0.05); g.lineCap = 'round';
    const q = z * 0.16; g.beginPath(); g.moveTo(x - q, y - q); g.lineTo(x + q, y + q); g.moveTo(x + q, y - q); g.lineTo(x - q, y + q); g.stroke();
    g.globalAlpha = 1; return;
  }
  const [col, shape] = TILE[k];
  const gr = g.createLinearGradient(x, y - h, x, y + h);
  gr.addColorStop(0, col + 'e6'); gr.addColorStop(1, col + '8c');
  g.fillStyle = gr; rr(x - h, y - h, z, z, r); g.fill();
  const hl = g.createLinearGradient(x, y - h, x, y);
  hl.addColorStop(0, 'rgba(255,255,255,.28)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = hl; rr(x - h, y - h, z, z, r); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1.2; rr(x - h + 0.6, y - h + 0.6, z - 1.2, z - 1.2, r); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.95)'; g.fillStyle = 'rgba(255,255,255,.95)'; g.lineWidth = Math.max(2, z * 0.065); g.lineCap = 'round'; g.lineJoin = 'round';
  const q = z * 0.22;
  g.beginPath();
  if (shape === 'wave') { for (const dy of [-0.35, 0.45]) { g.moveTo(x - q * 1.2, y + q * dy); g.bezierCurveTo(x - q * 0.6, y + q * (dy - 0.7), x, y + q * (dy + 0.7), x + q * 1.2, y + q * dy); } g.stroke(); }
  else if (shape === 'tri') { g.moveTo(x - q * 1.2, y + q * 0.8); g.lineTo(x - q * 0.2, y - q * 0.9); g.lineTo(x + q * 0.35, y); g.lineTo(x + q * 0.6, y - q * 0.4); g.lineTo(x + q * 1.2, y + q * 0.8); g.stroke(); }
  else if (shape === 'flower') { for (let a = 0; a < 5; a++) { const an = a / 5 * 6.283 - 1.57, cx = x + Math.cos(an) * q * 0.62, cy = y + Math.sin(an) * q * 0.62; g.moveTo(cx + q * 0.42, cy); g.arc(cx, cy, q * 0.42, 0, 6.283); } g.stroke(); g.beginPath(); g.arc(x, y, q * 0.18, 0, 6.283); g.fill(); }
  else if (shape === 'sun') { g.arc(x, y, q * 0.5, 0, 6.283); for (let a = 0; a < 8; a++) { const an = a / 8 * 6.283; g.moveTo(x + Math.cos(an) * q * 0.85, y + Math.sin(an) * q * 0.85); g.lineTo(x + Math.cos(an) * q * 1.2, y + Math.sin(an) * q * 1.2); } g.stroke(); }
  else if (shape === 'moon') { g.arc(x, y, q, 0.75, 5.53); g.arc(x + q * 0.6, y, q * 0.78, 4.4, 1.88, true); g.closePath(); g.stroke(); }
  else { g.moveTo(x, y - q); g.lineTo(x + q, y); g.lineTo(x, y + q); g.lineTo(x - q, y); g.closePath(); g.stroke(); }
  if (o.special) { // 流眼
    g.strokeStyle = '#7fe8ff'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, h * 0.92, S.t * 3, S.t * 3 + 4.6); g.stroke();
    g.strokeStyle = 'rgba(127,232,255,.4)'; g.beginPath(); g.arc(x, y, h * 1.02, 0, 6.283); g.stroke();
  }
  if (o.sel) { g.strokeStyle = '#ffffff'; g.lineWidth = 3; rr(x - h - 3, y - h - 3, z + 6, z + 6, r + 3); g.stroke(); }
  g.lineCap = 'butt'; g.lineJoin = 'miter'; g.globalAlpha = 1;
}
function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const lerp = (a, b, k) => a + (b - a) * k;
const mix = (a, b, k) => { k = Math.max(0, Math.min(1, k)); return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`; };

// 測試用
window.__battle = { get: () => S && S.game, state: () => S };

// 守門獸：濁流的暗紫色罩在身上，淨化越多越淡；被打中往後一縮、壓扁再彈回、閃白；淨化完成後金光一閃、原色現身
function drawBeast(L, spr, p, win, T) {
  const hu = S.hurt, kick = hu * hu, wob = Math.sin((1 - hu) * 14) * hu;
  const sz = Math.min(L.er * 2.9, L.w * 0.62), cx = L.ex + (S.hitT ? (Math.random() - 0.5) * 8 : 0);
  const cy = L.ey + Math.sin(T * 1.6) * 4 - kick * 12 - win * 10;
  // 纏在身上的濁塊：淨化越多越少
  const n = Math.round(18 * (1 - p)) , rad = sz * 0.5;
  for (let i = 0; i < n; i++) {
    const a = i / 18 * 6.283 + T * (0.5 + (i % 3) * 0.2), r = rad * (0.75 + ((i * 37) % 10) / 30) + Math.sin(T * 2 + i) * 4;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.55, s = 7 + (i % 4) * 3;
    g.save(); g.translate(x, y); g.rotate(a + T); g.globalAlpha = 0.75 * (1 - win);
    g.fillStyle = S.hitT > 0.15 ? '#ffffff' : '#3a2a56'; g.fillRect(-s / 2, -s / 2, s, s); g.restore();
  }
  g.globalAlpha = 1;
  for (const q of S.rings) { g.globalAlpha = (1 - q.t / 0.5) * 0.6; g.strokeStyle = '#bff4ff'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, sz * 0.3 + q.t * 160, (sz * 0.3 + q.t * 160) * 0.6, 0, 0, 6.283); g.stroke(); }
  g.globalAlpha = 1;
  // 淨化完成：背後一圈金光
  if (win) { const gl = g.createRadialGradient(cx, cy, 10, cx, cy, sz * (0.5 + win * 0.4)); gl.addColorStop(0, `rgba(255,214,120,${0.7 * win})`); gl.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = gl; g.beginPath(); g.arc(cx, cy, sz, 0, 6.283); g.fill(); }
  // 先在小畫布上把濁色、閃白疊上去，只蓋在身體上
  const px = Math.round(sz * Math.min(2, devicePixelRatio || 1));
  if (tint.width !== px) { tint.width = tint.height = px; }
  tg.globalCompositeOperation = 'source-over'; tg.clearRect(0, 0, px, px); tg.drawImage(spr, 0, 0, px, px);
  tg.globalCompositeOperation = 'source-atop';
  const murk = (1 - p) * 0.62 * (1 - win);
  if (murk > 0.01) { tg.fillStyle = `rgba(34,18,58,${murk})`; tg.fillRect(0, 0, px, px); }
  if (S.hitT > 0.05) { tg.fillStyle = `rgba(255,255,255,${Math.min(0.7, S.hitT * 2.8)})`; tg.fillRect(0, 0, px, px); }
  if (win) { tg.fillStyle = `rgba(255,220,140,${0.35 * Math.sin(win * 3.14)})`; tg.fillRect(0, 0, px, px); }
  g.save(); g.translate(cx, cy + sz * 0.5); g.scale(1 + wob * 0.12, 1 - wob * 0.12); g.drawImage(tint, -sz / 2, -sz, sz, sz); g.restore();
}
// 測試用：在主控台把這一關直接淨化滿
window.__battle = { fill() { if (S && S.run) S.pur = 100; }, game: () => S && S.game, pur: () => S && S.pur };
