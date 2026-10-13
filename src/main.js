// 《洋流：起源》mobile web prototype：主迴圈、操作、任務流程
import { M, clamp, lerp, rng, hex, mixColor, smooth } from './math.js';
import { Renderer, Builder } from './gl.js';
import { makeWorld, terrainMesh, waterData, floatMesh, gateMesh, nodeMesh, bellMesh, N, WATER, T, PLACES, CURRENT, curX } from './world.js';
import { drawAvatar, BLUE, ORANGE } from './avatar.js';
import { initAudio, sfx, setMuted, muted, setSpirit } from './audio.js';

const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const canvas = $('#c');
let r;
try { r = new Renderer(canvas); } catch (e) { $('#title .start').textContent = '此裝置無法執行 WebGL'; throw e; }

// ---------- 世界 ----------
const world = makeWorld(7);
const terrain = r.mesh(terrainMesh(world));
const water = r.waterMesh(waterData(world));
const floats = r.mesh(floatMesh());
const gateM = r.mesh(gateMesh());
const bell = r.mesh(bellMesh());
const ground = (x, z) => world.height(x, z);
const at = ([x, z]) => [x + 0.5, ground(x + 0.5, z + 0.5), z + 0.5];

const NODES = [
  { id: 'city', name: '城之回聲', icon: '🏙', hint: '北邊城市的廣場', pos: at(PLACES.city), col: hex('#8fe9ff') },
  { id: 'sea', name: '海之流痕', icon: '🌊', hint: '東海小島・跳進洋流', pos: at(PLACES.sea), col: hex('#6fd2ff') },
  { id: 'peak', name: '山之鐘聲', icon: '⛰', hint: '中央山脈最高峰', pos: at(PLACES.peak), col: hex('#ffe08a') },
];
for (const n of NODES) { n.mesh = r.mesh(nodeMesh(n.id)); n.awake = false; n.charge = 0; n.vein = null; n.flash = 0; }
const GATE = at(PLACES.gate);

// 靈光：散在城市、洋流上、山坡與各地
const motes = [];
{
  const R = rng(3), K = world.K;
  const pick = (test, n) => {
    let tries = 0;
    while (n > 0 && tries++ < 4000) {
      const x = 2 + Math.floor(R() * (N - 4)), z = 2 + Math.floor(R() * (N - 4)), k = K[z * N + x], h = world.H[z * N + x];
      if (!test(x, z, k, h)) continue;
      if (motes.some(m => Math.hypot(m.x - x, m.z - z) < 6)) continue;
      motes.push({ x: x + 0.5, z: z + 0.5, y: h + 1.1, ph: R() * 6, taken: false }); n--;
    }
  };
  pick((x, z, k) => k === T.ROAD, 6);
  for (let z = 30; z <= 100; z += 12) motes.push({ x: curX(z), z, y: WATER + 0.8, ph: R() * 6, taken: false });
  pick((x, z, k, h) => h >= 8 && k !== T.BUILDING && k !== T.TOWER, 8);
  pick((x, z, k, h) => world.land[z * N + x] && k !== T.BUILDING && k !== T.TOWER && h >= 3, 10);
}
const COST = 3;

// ---------- 狀態 ----------
const P = { x: PLACES.spawn[0] + 0.5, z: PLACES.spawn[1] - 1.5, y: 0, ry: 0, vx: 0, vz: 0, vy: 0, yaw: 0, onGround: true, swim: false, phase: 0, move: 0 };
P.y = P.ry = ground(P.x, P.z);
const XI = { x: PLACES.spawn[0] + 0.5, z: PLACES.spawn[1] + 1.5, yaw: Math.PI, wave: true };
const cam = { yaw: 0, pitch: 0.5, dist: 9, tx: P.x, ty: P.y + 1.5, tz: P.z };
const G = { state: 'title', t: 0, playT: 0, collected: 0, spent: 0, awakened: 0, gateOpen: false, gateT: 0, spirit: 0, spiritTarget: 0, sense: 0, senseCd: 0, pulse: [0, 0, 0, 0], particles: [], warnT: 0, endT: 0 };
const input = { jx: 0, jy: 0, jump: false, keys: {} };

// ---------- 操作：左半邊搖桿、右半邊轉鏡頭 ----------
const stick = $('#stick'), knob = stick.querySelector('i');
let stickId = null, stickO = [0, 0], camId = null, camLast = [0, 0];
canvas.addEventListener('pointerdown', e => {
  if (G.state !== 'play') return;
  if (e.clientX < innerWidth * 0.45 && stickId === null) {
    stickId = e.pointerId; stickO = [e.clientX, e.clientY]; $('.hint').style.display = 'none';
    stick.style.left = e.clientX + 'px'; stick.style.top = e.clientY + 'px'; stick.classList.add('on');
  } else if (camId === null) { camId = e.pointerId; camLast = [e.clientX, e.clientY]; }
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerId === stickId) {
    let dx = e.clientX - stickO[0], dy = e.clientY - stickO[1]; const l = Math.hypot(dx, dy), R = 56;
    if (l > R) { dx *= R / l; dy *= R / l; }
    knob.style.transform = `translate(${dx}px,${dy}px)`;
    input.jx = dx / R; input.jy = -dy / R;
  } else if (e.pointerId === camId) {
    cam.yaw -= (e.clientX - camLast[0]) * 0.008;
    cam.pitch = clamp(cam.pitch + (e.clientY - camLast[1]) * 0.005, 0.08, 1.25);
    camLast = [e.clientX, e.clientY];
  }
});
const release = e => {
  if (e.pointerId === stickId) { stickId = null; input.jx = input.jy = 0; knob.style.transform = ''; stick.classList.remove('on'); }
  if (e.pointerId === camId) camId = null;
};
canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release);
const hold = (el, on, off) => {
  el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); on(); });
  if (off) for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(ev, off);
};
hold($('#btnJump'), () => { input.jump = true; }, () => { input.jump = false; });
hold($('#btnSense'), () => doSense());
hold($('#mute'), () => { setMuted(!muted); $('#mute').textContent = muted ? '🔇' : '🔊'; });
addEventListener('keydown', e => { input.keys[e.code] = true; if (e.code === 'Space') input.jump = true; if (e.code === 'KeyE' || e.code === 'KeyQ') doSense(); if ((e.code === 'Enter' || e.code === 'Space') && G.state === 'intro') nextLine(); });
addEventListener('keyup', e => { input.keys[e.code] = false; if (e.code === 'Space') input.jump = false; });
document.addEventListener('gesturestart', e => e.preventDefault());

// ---------- HUD ----------
const pop = (text, kind = '') => { const el = $('#pop'); el.textContent = text; el.className = 'show ' + kind; clearTimeout(pop.t); pop.t = setTimeout(() => el.className = '', 2600); };
const toast = text => { const el = $('#toast'); el.textContent = text; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); };
const avail = () => G.collected - G.spent;
let hudKey = '';
function hud() {
  const lv = 1 + Math.floor(G.collected / 5);
  const key = [G.collected, G.spent, G.awakened, G.gateOpen, lv].join();
  if (key !== hudKey) {
    hudKey = key;
    $('#lv').textContent = 'Lv.' + lv;
    $('#qi').textContent = `靈光 ${avail()}`;
    $('#qibar').style.width = Math.min(100, avail() / COST * 100) + '%';
    if (!G.gateOpen) {
      $('#qtitle').textContent = `喚醒三處靈脈（${G.awakened}/3）`;
      $('#qchips').innerHTML = NODES.map(n => `<span class="${n.awake ? 'done' : ''}">${n.icon}${n.awake ? '✓' : ''}</span>`).join('');
      $('#qlist').innerHTML = NODES.map(n => `<li class="${n.awake ? 'done' : ''}"><span>${n.awake ? '✓' : n.icon}</span>${n.name}<small>${n.awake ? '已啟流' : n.hint}</small></li>`).join('')
        + `<li class="note">每處需要 ${COST} 點靈光・點此收合</li>`;
    } else {
      $('#qtitle').textContent = '前往山門';
      $('#qchips').innerHTML = '<span class="done">⛩</span>';
      $('#qlist').innerHTML = `<li><span>⛩</span>西側平原的紅色牌樓<small>阿汐在那裡等你</small></li>`;
    }
  }
  const sb = $('#btnSense');
  sb.style.setProperty('--cd', G.senseCd > 0 ? (G.senseCd / 9 * 100).toFixed(1) + '%' : '0%');
  sb.classList.toggle('ready', G.senseCd <= 0);
}

// 小地圖：島嶼底圖只畫一次
const mini = $('#mini'), mg = mini.getContext('2d'), base = document.createElement('canvas');
base.width = base.height = N;
{
  const g = base.getContext('2d'), img = g.createImageData(N, N);
  for (let i = 0; i < N * N; i++) {
    const k = world.K[i], h = world.H[i];
    let c = k === T.SEA ? [28, 70, 120] : k === T.SAND ? [220, 205, 160] : k === T.ROCK ? [150, 155, 160] : (k === T.ROAD || k === T.BUILDING || k === T.TOWER || k === T.STONE) ? [170, 176, 186] : [90 - h * 2, 170 - h * 4, 80];
    if (k === T.SEA && Math.abs((i % N) - curX(i / N | 0)) < CURRENT.half) c = [60, 130, 190];
    img.data.set([...c, 255], i * 4);
  }
  g.putImageData(img, 0, 0);
}
function drawMini() {
  const s = mini.width = mini.height = Math.round(mini.clientWidth * Math.min(devicePixelRatio, 2)), k = s / N;
  mg.imageSmoothingEnabled = false; mg.drawImage(base, 0, 0, s, s);
  const dot = (x, z, col, rad) => { mg.fillStyle = col; mg.beginPath(); mg.arc(x * k, z * k, rad * k, 0, 7); mg.fill(); };
  for (const n of NODES) dot(n.pos[0], n.pos[2], n.awake ? '#ffcf5a' : `rgba(111,227,255,${0.6 + 0.4 * Math.sin(G.t * 4)})`, 3.2);
  dot(GATE[0], GATE[2], G.gateOpen ? '#ffcf5a' : '#b9483c', 3.2);
  mg.save(); mg.translate(P.x * k, P.z * k); mg.rotate(-P.yaw);
  mg.fillStyle = '#fff'; mg.strokeStyle = '#123'; mg.lineWidth = k; mg.beginPath();
  mg.moveTo(0, 5 * k); mg.lineTo(3.4 * k, -3 * k); mg.lineTo(-3.4 * k, -3 * k); mg.closePath(); mg.fill(); mg.stroke(); mg.restore();
}

// ---------- 劇情對話 ----------
const LINES = [
  '你也聽見了嗎？山裡，有一陣不存在的鐘聲。',
  '山有脈，海有流，人亦有自己的道。這座島上，有三處靈脈還在沉睡。',
  '收集發光的「靈光」，按「感知」就能看見平常看不見的東西。',
  '北邊的城市、東海的洋流、最高的山——把它們一一喚醒。',
  '我在西邊的山門等你。走出去，遇見你的機緣。',
];
let line = 0;
function showLine() { $('#dialog p').textContent = LINES[line]; }
function nextLine() {
  if (G.state !== 'intro') return;
  line++;
  if (line >= LINES.length) {
    $('#dialog').classList.remove('show'); G.state = 'play'; $('#hud').classList.add('play');
    XI.wave = false;
    pop('新任務：喚醒三處靈脈', 'gold');
    return;
  }
  showLine();
}
$('#dialog').addEventListener('pointerdown', e => { e.preventDefault(); nextLine(); });

function start() {
  initAudio();
  $('#title').classList.add('hide');
  G.state = 'intro'; line = 0; showLine(); $('#dialog').classList.add('show'); $('#hud').classList.add('on');
  cam.yaw = 0; cam.tx = P.x; cam.ty = P.y + 1.5; cam.tz = P.z;
  try { if (matchMedia('(pointer: coarse)').matches && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => { }); } catch { }
}
$('#title .start').addEventListener('click', start);
$('#again').addEventListener('click', () => location.reload());

// ---------- 玩法 ----------
const DIRS = ['北', '東北', '東', '東南', '南', '西南', '西', '西北'];
function doSense() {
  if (G.state !== 'play' || G.senseCd > 0) return;
  G.sense = 6; G.senseCd = 9; G.pulse = [P.x, P.z, 0, 1]; sfx.sense();
  const left = NODES.filter(n => !n.awake);
  const target = left.length ? left.sort((a, b) => Math.hypot(a.pos[0] - P.x, a.pos[2] - P.z) - Math.hypot(b.pos[0] - P.x, b.pos[2] - P.z))[0] : { name: '山門', pos: GATE };
  const dx = target.pos[0] - P.x, dz = target.pos[2] - P.z;
  const ang = Math.atan2(dx, -dz), dir = DIRS[(Math.round(ang / (Math.PI / 4)) + 8) % 8];
  toast(`感知：${target.name} 在${dir}方 ${Math.round(Math.hypot(dx, dz))} 步`);
}

function burst(x, y, z, col, n = 40, sp = 6) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, u = Math.random() * 2 - 1, s = sp * (0.4 + Math.random() * 0.6), q = Math.sqrt(1 - u * u);
    G.particles.push({ x, y, z, vx: Math.cos(a) * q * s, vy: Math.abs(u) * s + 2, vz: Math.sin(a) * q * s, life: 1 + Math.random(), col });
  }
}

function buildVein(n) {
  const b = new Builder(), [x0, , z0] = n.pos, [x1, , z1] = GATE, len = Math.hypot(x1 - x0, z1 - z0), steps = Math.ceil(len / 0.7);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, x = lerp(x0, x1, t) + Math.sin(t * 12 + x0) * 0.8, z = lerp(z0, z1, t) + Math.cos(t * 10 + z0) * 0.8;
    const y = Math.max(ground(x, z), WATER) + 0.02;
    b.box(x - 0.2, y, z - 0.2, 0.4, 0.12, 0.4, hex('#ffd98a'), 1);
  }
  n.vein = r.mesh(b);
}

function awaken(n) {
  n.awake = true; n.flash = 1; G.spent += COST; G.awakened++;
  sfx.bell(n.id === 'peak' ? 130.8 : n.id === 'sea' ? 174.6 : 196);
  pop(`啟流！${n.name}`, 'gold');
  burst(n.pos[0], n.pos[1] + 1.5, n.pos[2], [1, 0.85, 0.45], 70, 8);
  buildVein(n);
  G.spiritTarget = G.awakened / 3 * 0.8;
  setSpirit(G.spiritTarget);
  try { navigator.vibrate && navigator.vibrate([40, 60, 80]); } catch { }
  if (G.awakened === 3) setTimeout(openGate, 2200);
  else setTimeout(() => toast(`靈脈甦醒，世界多了一層。還有 ${3 - G.awakened} 處`), 1400);
}

function openGate() {
  G.gateOpen = true; G.gateT = 0; sfx.gate();
  pop('山門已開啟', 'gold');
  XI.x = GATE[0] + 2.2; XI.z = GATE[2] - 2; XI.yaw = Math.PI; XI.wave = true;
  burst(GATE[0], GATE[1] + 3, GATE[2], [1, 0.9, 0.5], 90, 10);
  setTimeout(() => toast('阿汐：「我在山門等你。」'), 1500);
}

function blocked(x, z, y, step) {
  if (x < 1.5 || z < 1.5 || x > N - 1.5 || z > N - 1.5) return true;
  const rr = 0.3;
  for (const [ox, oz] of [[-rr, -rr], [rr, -rr], [-rr, rr], [rr, rr]]) if (ground(x + ox, z + oz) > y + step) return true;
  return false;
}
const footGround = (x, z) => { const rr = 0.28; let m = -9; for (const [ox, oz] of [[-rr, -rr], [rr, -rr], [-rr, rr], [rr, rr]]) m = Math.max(m, ground(x + ox, z + oz)); return m; };

function updatePlayer(dt) {
  let ix = input.jx, iy = input.jy;
  const k = input.keys;
  if (k.KeyW || k.ArrowUp) iy += 1; if (k.KeyS || k.ArrowDown) iy -= 1;
  if (k.KeyA || k.ArrowLeft) ix -= 1; if (k.KeyD || k.ArrowRight) ix += 1;
  if (k.KeyJ) cam.yaw += dt * 2; if (k.KeyL) cam.yaw -= dt * 2;
  let mag = Math.hypot(ix, iy); if (mag > 1) { ix /= mag; iy /= mag; mag = 1; }
  if (G.state !== 'play') { ix = iy = 0; mag = 0; }
  const fx = Math.sin(cam.yaw), fz = Math.cos(cam.yaw);
  const mx = fx * iy - fz * ix, mz = fz * iy + fx * ix;
  const speed = P.swim ? 3.8 : 7;
  const a = 1 - Math.exp(-dt * 12);
  P.vx = lerp(P.vx, mx * speed, a); P.vz = lerp(P.vz, mz * speed, a);
  if (mag > 0.1) {
    const want = Math.atan2(mx, mz); let d = want - P.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
    P.yaw += d * Math.min(1, dt * 14);
  }
  let vx = P.vx, vz = P.vz, curS = 0;
  if (P.swim) { const c = world.current(P.x, P.z); vx += c[0]; vz += c[1]; curS = c[2]; }
  G.riding = curS > 0.4;
  const step = P.swim ? 2.1 : 1.1;
  if (!blocked(P.x + vx * dt, P.z, P.y, step)) P.x += vx * dt;
  if (!blocked(P.x, P.z + vz * dt, P.y, step)) P.z += vz * dt;

  const gnd = footGround(P.x, P.z), swimLv = WATER - 1.05, deep = gnd < WATER - 1.1;
  if (P.swim) {
    if (!deep) P.swim = false;
    else {
      P.vy = (swimLv - P.y) * 6; P.y += P.vy * dt;
      if (input.jump && G.state === 'play') { P.vy = 10.5; P.swim = false; P.y += 0.05; sfx.splash(); }
    }
  }
  if (!P.swim) {
    P.vy -= 32 * dt; P.y += P.vy * dt;
    if (P.y <= gnd) { P.y = gnd; P.vy = 0; P.onGround = true; }
    else P.onGround = P.y - gnd < 0.04;
    if (deep && P.y < swimLv && P.vy <= 0) { P.swim = true; sfx.splash(); burst(P.x, WATER, P.z, [0.8, 0.95, 1], 14, 3); }
    if (input.jump && P.onGround && G.state === 'play') { P.vy = 12; P.onGround = false; sfx.jump(); }
  }
  P.ry = P.y > P.ry ? lerp(P.ry, P.y, 1 - Math.exp(-dt * 22)) : P.y;
  const sp = Math.hypot(P.vx, P.vz);
  P.move = lerp(P.move, Math.min(1, sp / 6), 1 - Math.exp(-dt * 10));
  P.phase += sp * dt * 1.6;
}

function updateGame(dt) {
  // 靈光
  for (const m of motes) {
    if (m.taken) continue;
    if (Math.hypot(m.x - P.x, m.z - P.z) < 1.4 && Math.abs(P.y + 0.9 - m.y) < 2) {
      m.taken = true; G.collected++; sfx.pick();
      burst(m.x, m.y, m.z, [0.6, 0.95, 1], 16, 3);
      if (G.collected % 5 === 0) pop(`升級！Lv.${1 + G.collected / 5}　感知力提升`, 'gold');
      else toast(`＋1 靈光（可用 ${avail()}）`);
    }
  }
  // 靈脈節點
  let charging = null;
  for (const n of NODES) {
    n.flash = Math.max(0, n.flash - dt * 0.6);
    if (n.awake) continue;
    const d = Math.hypot(n.pos[0] - P.x, n.pos[2] - P.z);
    if (d < 2.6 && Math.abs(P.y - n.pos[1]) < 3) {
      if (avail() >= COST) {
        n.charge += dt / 1.6; charging = n;
        if (n.charge >= 1) awaken(n);
      } else if (G.t - G.warnT > 4) { G.warnT = G.t; sfx.deny(); toast(`靈光不足：喚醒需要 ${COST} 點（目前 ${avail()}）。按「感知」找找看`); }
    } else n.charge = Math.max(0, n.charge - dt);
  }
  const pr = $('#prog');
  if (charging && !charging.awake) { pr.classList.add('show'); pr.style.setProperty('--p', (charging.charge * 100).toFixed(1) + '%'); }
  else pr.classList.remove('show');
  // 山門
  if (G.gateOpen) {
    G.gateT += dt;
    if (Math.abs(P.x - GATE[0]) < 2.4 && Math.abs(P.z - GATE[2]) < 0.9 && G.state === 'play') ending();
  }
  // 感知
  G.sense = Math.max(0, G.sense - dt); G.senseCd = Math.max(0, G.senseCd - dt);
  if (G.pulse[3] > 0) { G.pulse[2] += dt * 34; G.pulse[3] = Math.max(0, 1 - G.pulse[2] / 70); }
  // 洋流提示
  if (G.riding && !G.rodeOnce) { G.rodeOnce = true; pop('乘上洋流！', 'cyan'); }
}

function ending() {
  G.state = 'ending'; G.spiritTarget = 1; setSpirit(1); sfx.gate();
  const s = Math.round(G.playT), mm = String(Math.floor(s / 60)).padStart(2, '0'), ss = String(s % 60).padStart(2, '0');
  $('#stats').textContent = `用時 ${mm}:${ss}　靈光 ${G.collected}/${motes.length}　靈脈 3/3`;
  setTimeout(() => $('#ending').classList.add('show'), 600);
  $('#hud').classList.remove('play');
}

// ---------- 繪製 ----------
const C = {
  fog0: hex('#cfe3ee'), fog1: hex('#1d4b62'), top0: hex('#6faee6'), top1: hex('#0a1838'),
  amb0: [0.56, 0.6, 0.68], amb1: [0.34, 0.42, 0.62], sun0: [0.62, 0.6, 0.55], sun1: [0.62, 0.5, 0.36],
  sh0: hex('#5fd3e6'), sh1: hex('#33c2c9'), dp0: hex('#1f62a6'), dp1: hex('#0d2f5f'),
  glow: hex('#7fe8ff'), gold: hex('#ffcf5a'),
};
const LIGHT = (() => { const v = [0.45, 0.8, 0.35], l = Math.hypot(...v); return v.map(x => x / l); })();

function frame(dt) {
  const asp = r.resize();
  const s = G.spirit;
  const portrait = asp < 1, fov = (portrait ? 68 : 55) * Math.PI / 180;
  let eye, target;
  if (G.state === 'title') {
    const a = G.t * 0.06;
    target = [64, 8, 66]; eye = [64 + Math.sin(a) * 62, 46, 66 + Math.cos(a) * 62];
  } else {
    const k = 1 - Math.exp(-dt * 10);
    cam.tx = lerp(cam.tx, P.x, k); cam.ty = lerp(cam.ty, P.ry + 1.6, k); cam.tz = lerp(cam.tz, P.z, k);
    let dist = (portrait ? 11 : 9) * (G.state === 'ending' ? 1.6 : 1);
    if (G.state === 'intro') dist = 7;
    target = [cam.tx, cam.ty, cam.tz];
    // 鏡頭被地形或大樓擋住時：先試著抬高，仍擋住再拉近
    const reach = pitch => {
      const cp = Math.cos(pitch), sp = Math.sin(pitch), dir = [-Math.sin(cam.yaw) * cp, sp, -Math.cos(cam.yaw) * cp];
      for (let i = 1; i <= 16; i++) {
        const u = i / 16, x = target[0] + dir[0] * dist * u, y = target[1] + dir[1] * dist * u, z = target[2] + dir[2] * dist * u;
        if (ground(x, z) > y - 0.4) return [Math.max(0.15, (i - 1) / 16), dir];
      }
      return [1, dir];
    };
    let [f, dir] = reach(cam.pitch);
    if (f < 0.75) { const up = reach(Math.min(1.35, cam.pitch + 0.5)); if (up[0] > f) [f, dir] = up; }
    cam.f = cam.f === undefined ? f : (f < cam.f ? f : lerp(cam.f, f, 1 - Math.exp(-dt * 4)));
    f = cam.f;
    cam.dir = cam.dir ? cam.dir.map((v, i) => lerp(v, dir[i], 1 - Math.exp(-dt * 12))) : dir;
    dir = cam.dir;
    eye = [target[0] + dir[0] * dist * f, target[1] + dir[1] * dist * f, target[2] + dir[2] * dist * f];
  }
  const vp = M.mul(M.persp(fov, asp, 0.1, 400), M.lookAt(eye, target, [0, 1, 0]));
  const lookPitch = Math.atan2(eye[1] - target[1], Math.hypot(eye[0] - target[0], eye[2] - target[2]));
  const env = {
    time: G.t, spirit: s, sense: G.sense > 0 ? Math.min(1, G.sense) : 0,
    fog: mixColor(C.fog0, C.fog1, s), skyTop: mixColor(C.top0, C.top1, s),
    fogR: G.state === 'title' ? [70, 150] : [38, 92], light: LIGHT,
    sun: mixColor(C.sun0, C.sun1, s), amb: mixColor(C.amb0, C.amb1, s), glow: mixColor(C.glow, C.gold, 0.35),
    pulse: G.pulse, waterLevel: WATER, shallow: mixColor(C.sh0, C.sh1, s), deep: mixColor(C.dp0, C.dp1, s),
    current: [CURRENT.x, CURRENT.half, CURRENT.speed],
    horizon: Math.tan(lookPitch) / Math.tan(fov / 2),
  };
  r.begin(vp, eye, env);
  const I = M.ident();

  // 不透明
  r.blend(0);
  r.draw(terrain, I, [1, 1, 1], 0, 1, 1);
  { const m = M.ident(); M.translate(m, GATE[0], GATE[1], GATE[2]); r.draw(gateM, m, [1, 1, 1], G.gateOpen ? 0.15 + 0.1 * Math.sin(G.t * 3) : 0); }
  for (const n of NODES) {
    const m = M.ident(); M.translate(m, n.pos[0], n.pos[1], n.pos[2]); r.draw(n.mesh, m);
    // 核心：旋轉的發光方塊
    const lift = n.awake ? 2.2 + Math.sin(G.t * 2) * 0.2 : 1.9 + Math.sin(G.t * 1.5) * 0.12;
    const col = n.awake ? C.gold : n.col, sz = n.id === 'peak' ? 0 : 0.7 + n.charge * 0.4;
    if (sz) { const mc = M.ident(); M.translate(mc, n.pos[0], n.pos[1] + lift, n.pos[2]); M.rotY(mc, G.t * (n.awake ? 2 : 0.8)); M.rotX(mc, 0.6); M.rotZ(mc, 0.6); M.scale(mc, sz, sz, sz); r.draw(r.cube, mc, col, n.awake ? 1 : 0.6 + n.charge * 0.4); }
    if (n.id === 'peak') {
      const mb = M.ident(); M.translate(mb, n.pos[0], n.pos[1] + 5, n.pos[2]);
      M.rotX(mb, Math.sin(G.t * (n.awake ? 3 : 0.8)) * (n.awake ? 0.25 * Math.max(0.2, n.flash) : 0.05) + n.charge * Math.sin(G.t * 9) * 0.15);
      r.draw(bell, mb, n.awake ? [1.15, 1.05, 0.85] : [1, 1, 1], n.awake ? 0.35 : 0);
    }
    if (n.vein) r.draw(n.vein, I, [1, 1, 1], 0.6 + 0.4 * Math.sin(G.t * 3));
  }
  if (s > 0.01) { const m = M.ident(); M.translate(m, 0, -(1 - smooth(0, 0.6, s)) * 50, 0); r.draw(floats, m, [1, 1, 1], 0.05); }
  const pa = { phase: P.phase, move: P.move, air: !P.onGround && !P.swim, swim: P.swim, t: G.t };
  drawAvatar(r, BLUE, P.x, P.ry - (P.swim ? 0.0 : 0), P.z, P.yaw, pa, G.state === 'ending' ? 0.3 : 0);
  const xg = ground(XI.x, XI.z);
  drawAvatar(r, ORANGE, XI.x, xg, XI.z, XI.yaw, { phase: 0, move: 0, air: false, swim: false, t: G.t + 1.3, wave: XI.wave });

  // 半透明：水、影子
  r.blend(1);
  r.drawWater(water, env);
  r.blend(1);
  if (!P.swim) { const gy = footGround(P.x, P.z); r.box(P.x, gy + 0.03, P.z, 0.95, 0.02, 0.95, [0, 0, 0], 0, clamp(0.35 - (P.y - gy) * 0.06, 0.08, 0.35)); }
  r.box(XI.x, xg + 0.03, XI.z, 0.95, 0.02, 0.95, [0, 0, 0], 0, 0.3);

  // 加亮：靈光、光柱、粒子、山門
  r.blend(2);
  const near = 9;
  for (const m of motes) {
    if (m.taken) continue;
    const d = Math.hypot(m.x - P.x, m.z - P.z);
    const vis = Math.max(G.sense > 0 ? 1 : 0, 0.35 + s * 0.4, smooth(near + 6, near, d));
    const y = m.y + Math.sin(G.t * 2 + m.ph) * 0.18;
    r.box(m.x, y, m.z, 0.34, 0.34, 0.34, [0.7, 1, 1], 1, vis, G.t * 2 + m.ph);
    r.box(m.x, y, m.z, 0.8, 0.8, 0.8, [0.4, 0.85, 1], 1, vis * 0.25, -G.t + m.ph);
  }
  for (const n of NODES) {
    const bright = n.awake ? 0.22 : 0.1 + (G.sense > 0 ? 0.25 : 0) + n.charge * 0.3;
    r.box(n.pos[0], n.pos[1] + 40, n.pos[2], 0.6, 80, 0.6, n.awake ? C.gold : n.col, 1, bright);
    r.box(n.pos[0], n.pos[1] + 40, n.pos[2], 1.6, 80, 1.6, n.awake ? C.gold : n.col, 1, bright * 0.25);
    if (n.flash > 0) r.box(n.pos[0], n.pos[1] + 2, n.pos[2], 6 * (2 - n.flash), 0.2, 6 * (2 - n.flash), C.gold, 1, n.flash);
  }
  if (G.gateOpen) {
    const a = Math.min(1, G.gateT / 1.5);
    r.box(GATE[0], GATE[1] + 2.35, GATE[2], 4.8, 4.5, 0.12, mixColor(C.glow, C.gold, 0.5 + 0.5 * Math.sin(G.t * 2)), 1, 0.55 * a);
    r.box(GATE[0], GATE[1] + 2.35, GATE[2], 4.2, 3.9, 0.3, [1, 1, 1], 1, 0.25 * a * (0.6 + 0.4 * Math.sin(G.t * 5)));
    r.box(GATE[0], GATE[1] + 40, GATE[2], 2.5, 80, 2.5, C.gold, 1, 0.12 * a);
  }
  for (const p of G.particles) r.box(p.x, p.y, p.z, 0.18, 0.18, 0.18, p.col, 1, Math.min(1, p.life), p.life * 4);
  if (G.riding && P.swim) for (let i = 0; i < 3; i++) r.box(P.x + Math.sin(G.t * 7 + i * 2) * 0.6, WATER + 0.05, P.z + 0.6 + i * 0.7, 0.25, 0.05, 0.6, [0.8, 0.95, 1], 1, 0.5 - i * 0.12);
  r.blend(0);

  // 阿汐的名牌
  const tag = $('#tag'), pj = M.project(vp, XI.x, xg + 2.6, XI.z);
  if (pj && G.state !== 'title' && pj[0] > 0 && pj[0] < 1 && pj[1] > 0 && pj[1] < 1) { tag.style.transform = `translate(${pj[0] * innerWidth}px,${pj[1] * innerHeight}px) translate(-50%,-100%)`; tag.style.opacity = 1; }
  else tag.style.opacity = 0;
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  G.t += dt;
  if (G.state === 'play') G.playT += dt;
  G.spirit = lerp(G.spirit, G.spiritTarget, 1 - Math.exp(-dt * 0.8));
  updatePlayer(dt);
  if (G.state === 'play') updateGame(dt);
  for (const p of G.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vy -= 6 * dt; p.vx *= 0.98; p.vz *= 0.98; p.life -= dt; }
  G.particles = G.particles.filter(p => p.life > 0);
  frame(dt);
  if (G.state !== 'title') { hud(); drawMini(); }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// 測試用：?play 跳過片頭，?awake=n 直接喚醒 n 處，?at=sea|peak|city|gate 傳送
if (params.has('play') || params.has('at') || params.has('awake')) {
  start(); line = LINES.length - 1; nextLine();
  const a = +params.get('awake') || 0; G.collected = COST * a;
  for (let i = 0; i < a; i++) awaken(NODES[i]);
  const to = params.get('at');
  if (to) { const p = to === 'gate' ? GATE : NODES.find(n => n.id === to)?.pos; if (p) { P.x = p[0] - 3; P.z = p[2] - 3; P.y = P.ry = footGround(P.x, P.z) + 0.5; cam.tx = P.x; cam.tz = P.z; } }
  if (params.has('yaw')) cam.yaw = +params.get('yaw');
  if (params.has('pitch')) cam.pitch = +params.get('pitch');
}
window.__game = { G, P, cam, NODES, motes, input, awaken, doSense };
