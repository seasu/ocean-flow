// 世界生成：一座方塊台灣島（北邊城市、中央山脈、東岸黑潮）
import { Builder } from './gl.js';
import { rng, hex, smooth, clamp } from './math.js';

// 島的尺寸倍率：邏輯座標（原本 128 格的島）乘上 S；?scale=1~4 可調，預設 3 倍
const Q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
export const S = Math.max(1, Math.min(4, +(Q && Q.get('scale')) || 3));
const HS = 1 + (S - 1) * 0.5;                 // 高度倍率：山跟著變高，但不會像平面那麼誇張
const sc = v => Math.round(v * S);
export const N = sc(128), WATER = 2.5;
const CX = 64 * S, CZ = 64 * S, SHORE = 6.6 * S;   // SHORE：黑潮兩側留給海的寬度

// 黑潮中心線（往北流，-z 為北）
export const CURRENT = { x: CX + 30 * S, half: 3.6 * S * 0.7, speed: 7 * Math.sqrt(S) };
export const curX = z => CURRENT.x + 3 * S * Math.sin(z / S * 0.05);

// 地點（x, z）
export const PLACES = {
  spawn: [sc(56), sc(56)],
  gate: [sc(55), sc(78)],
  city: [sc(61), sc(38)],
  sea: [Math.round(curX(36 * S)) - sc(2), sc(36)],     // 龜山島
  lake: [sc(62), sc(65)],                          // 日月潭
  shenmu: [sc(62), sc(86)],                        // 阿里山神木
  gorge: sc(60),                                   // 太魯閣峽谷所在的 z
  // 四獸山：在台北 101 東南側（位置關係依真實地形簡化）
  tiger: [sc(84), sc(31)], leopard: [sc(86), sc(38)], lion: [sc(83), sc(44)], elephant: [sc(77), sc(49)],
  peak: [sc(68), sc(72)],
  tower: [sc(66.5), sc(29.5)],                     // 台北 101
};

// 地塊種類
export const T = { SEA: 0, SAND: 1, GRASS: 2, FOREST: 3, ROCK: 4, ROAD: 5, STONE: 6, BUILDING: 7, TOWER: 8, PARK: 9, MARBLE: 10 };
const TOP = {
  [T.SEA]: hex('#c9b98c'), [T.SAND]: hex('#ecdcaa'), [T.GRASS]: hex('#6cc04f'), [T.FOREST]: hex('#4f9e45'),
  [T.ROCK]: hex('#9aa2a8'), [T.ROAD]: hex('#5c6470'), [T.STONE]: hex('#c8c3b6'), [T.BUILDING]: hex('#d9dee4'),
  [T.TOWER]: hex('#6fa8a0'), [T.PARK]: hex('#79c95a'), [T.MARBLE]: hex('#e9e6dc'),
};
const DIRT = hex('#8d6a47'), DIRT2 = hex('#7b5b3c');

function noise2(seed) {
  const r = rng(seed), P = new Float32Array(256 * 256);
  for (let i = 0; i < P.length; i++) P[i] = r();
  const at = (x, z) => P[((z & 255) << 8) | (x & 255)];
  const n = (x, z) => {
    const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi;
    const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
    const a = at(xi, zi), b = at(xi + 1, zi), c = at(xi, zi + 1), d = at(xi + 1, zi + 1);
    return (a + (b - a) * u) + ((c + (d - c) * u) - (a + (b - a) * u)) * v;
  };
  return (x, z) => (n(x, z) * 0.6 + n(x * 2.1, z * 2.1) * 0.3 + n(x * 4.3, z * 4.3) * 0.1) * 2 - 1;
}

export function makeWorld(seed = 7) {
  const H = new Int16Array(N * N), K = new Uint8Array(N * N), lock = new Uint8Array(N * N);
  const fbm = noise2(seed), id = (x, z) => z * N + x;
  const land = new Uint8Array(N * N);

  // 1. 島形與高度（u, v 是邏輯座標，地形形狀跟原本一樣，只是放大）
  for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) {
    const u = x / S, v = z / S, dx = u - 64, dz = v - 64, vz = dz / 44;
    const wid = 21 * (1 - 0.5 * Math.max(vz, 0)) * (vz < -0.6 ? 1 - (-vz - 0.6) * 0.5 : 1);
    const e = Math.hypot(dx / wid, vz) + fbm(u * 0.08, v * 0.08) * 0.12 + fbm(x * 0.09 + 40, z * 0.09) * 0.02;
    const i = id(x, z);
    if (e < 1 && Math.abs(x - curX(z)) > SHORE) {
      land[i] = 1;
      const plain = 1 + 2 * smooth(0.95, 0.55, e);
      const ridge = 15 * HS * Math.exp(-(((dx - 4) / 9) ** 2)) * Math.exp(-(((dz - 8) / 22) ** 2));
      H[i] = Math.floor(3 + plain + ridge + fbm(u * 0.15 + 9, v * 0.15) * (1 + ridge * 0.15) + fbm(x * 0.2, z * 0.2 + 7) * 0.5);
    } else {
      H[i] = clamp(Math.floor(2 - (e - 1) * 9), 0, 2);
    }
  }
  // 2. 龜山島（海之流痕）：龜背＋往北伸出的龜頭
  {
    const [sx, sz] = PLACES.sea;
    for (let z = sz - sc(5); z <= sz + sc(4); z++) for (let x = sx - sc(4); x <= sx + sc(4); x++) {
      const d = Math.hypot((x - sx) / 1.15, z - sz) / S, i = id(x, z);
      const head = Math.abs(x - sx) <= S * 0.5 && z >= sz - sc(4) && z < sz - sc(2);
      if (d < 3 || head) {
        land[i] = 1; lock[i] = 1;
        H[i] = head ? (z < sz - sc(3) ? 3 : 4) : Math.round(3 + (d < 1.2 ? 2 : d < 2.2 ? 1 : 0) * HS);
        K[i] = d < 2.2 && !head ? T.FOREST : T.ROCK;
      }
    }
  }
  // 2b. 四獸山：101 東側的四座小山
  const BEASTS = ['tiger', 'leopard', 'lion', 'elephant'];
  for (const k of BEASTS) {
    const [bx, bz] = PLACES[k];
    for (let z = bz - sc(6); z <= bz + sc(6); z++) for (let x = bx - sc(6); x <= bx + sc(6); x++) {
      const d = Math.hypot(x - bx, z - bz) / S, i = id(x, z);
      if (d > 6 || Math.abs(x - curX(z)) < SHORE) continue;
      if (!land[i]) { land[i] = 1; H[i] = 3; }
      H[i] = Math.max(H[i], Math.floor(4 + 7 * HS * Math.exp(-((d / 3.2) ** 2))));
    }
  }
  // 3. 城市區先整平
  const C0 = [sc(49), sc(26)], C1 = [sc(75), sc(47)];
  const inCity = (x, z) => x >= C0[0] && x <= C1[0] && z >= C0[1] && z <= C1[1];
  for (let z = C0[1]; z <= C1[1]; z++) for (let x = C0[0]; x <= C1[0]; x++) { const i = id(x, z); land[i] = 1; H[i] = 4; }

  const relax = () => {
    for (let it = 0; it < 4; it++) {
      for (let pass = 0; pass < 2; pass++) {
        const z0 = pass ? N - 2 : 1, z1 = pass ? 0 : N - 1, st = pass ? -1 : 1;
        for (let z = z0; z !== z1; z += st) for (let x = pass ? N - 2 : 1; pass ? x > 0 : x < N - 1; x += st) {
          const i = id(x, z); if (!land[i] || lock[i]) continue;
          let m = 99;
          for (const j of [i - 1, i + 1, i - N, i + N]) m = Math.min(m, land[j] ? H[j] : 2);
          H[i] = Math.max(3, Math.min(H[i], m + 1));
        }
      }
    }
  };
  relax();
  // 4. 平台：出生公園、山門廣場、山頂
  const flatten = (cx, cz, r, kind) => {
    let m = 99;
    for (let z = cz - r; z <= cz + r; z++) for (let x = cx - r; x <= cx + r; x++) if (Math.hypot(x - cx, z - cz) <= r + 0.3 && land[id(x, z)]) m = Math.min(m, H[id(x, z)]);
    for (let z = cz - r; z <= cz + r; z++) for (let x = cx - r; x <= cx + r; x++) if (Math.hypot(x - cx, z - cz) <= r + 0.3) { const i = id(x, z); H[i] = Math.max(3, m); K[i] = kind; lock[i] = 2; land[i] = 1; }
    return m;
  };
  flatten(...PLACES.spawn, sc(4), T.PARK);
  flatten(...PLACES.gate, Math.round(5 * HS), T.STONE);
  flatten(...PLACES.peak, sc(2), T.STONE);
  for (const k of BEASTS) flatten(...PLACES[k], Math.max(1, sc(1)), T.STONE);
  relax();

  // 5. 地表種類
  const sr = sc(2);
  const nearSea = (x, z) => { for (let a = -sr; a <= sr; a++) for (let b = -sr; b <= sr; b++) { const xx = clamp(x + a, 0, N - 1), zz = clamp(z + b, 0, N - 1); if (!land[id(xx, zz)]) return true; } return false; };
  const ROCKH = 3 + 10 * HS, FORESTH = 3 + 3 * HS;
  for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) {
    const i = id(x, z); if (lock[i]) continue;
    if (!land[i]) { K[i] = T.SEA; continue; }
    const h = H[i];
    K[i] = h >= ROCKH ? T.ROCK : h <= 3 && nearSea(x, z) ? T.SAND : h >= FORESTH ? T.FOREST : T.GRASS;
  }

  // 5b. 日月潭：挖到海平面以下（用同一片水面），周圍做成緩坡，中央是拉魯島
  {
    const [lx, lz] = PLACES.lake;
    for (let z = lz - sc(9); z <= lz + sc(9); z++) for (let x = lx - sc(9); x <= lx + sc(9); x++) {
      const i = id(x, z), d = Math.hypot((x - lx) / 1.3, z - lz) / S;
      if (d < 3.6) {
        if (Math.hypot(x - lx, z - lz) / S < 0.8) { H[i] = 3; K[i] = T.PARK; land[i] = 1; }
        else { H[i] = d < 2.4 ? 0 : 1; K[i] = T.SEA; land[i] = 0; }
        lock[i] = 4;
      } else if (d < 8 && land[i] && !lock[i]) {
        H[i] = Math.min(H[i], 3 + Math.floor((d - 3.6) * S));
        if (d < 4.6) K[i] = T.SAND;
      }
    }
  }
  // 5c. 太魯閣：從東岸切進山裡的大理石峽谷
  const gz = PLACES.gorge, gw = sc(2), wall = Math.max(1, Math.round(S / 2));
  let gx1 = CX; while (land[id(gx1 + 1, gz)]) gx1++;
  const gx0 = gx1 - sc(10);
  for (let x = gx0; x <= gx1; x++) {
    const floor = 3 + Math.max(0, Math.floor((gx1 - sc(2) - x) / 2));
    for (let z = gz; z < gz + gw; z++) { const i = id(x, z); H[i] = floor; K[i] = T.SAND; lock[i] = 5; }
    for (let k = 1; k <= wall; k++) for (const z of [gz - k, gz + gw - 1 + k]) { const i = id(x, z); H[i] = Math.max(H[i], floor + 4 + ((x * 7) % 3)); K[i] = T.MARBLE; lock[i] = 5; }
  }
  const gorge = [gx1 - sc(4), gz + Math.floor(gw / 2)];
  relax();
  // 5d. 墾丁：最南端的海岬
  let tip = [CX, CZ];
  for (let z = 0; z < N; z++) for (let x = sc(40); x < sc(90); x++) if (land[id(x, z)] && z > tip[1]) tip = [x, z];

  // 6. 城市：道路格線、大樓、廣場、地標高塔（街廓維持原本大小，城市變大就多出更多街廓）
  const R = rng(seed + 11), lots = [];
  for (let z = C0[1]; z <= C1[1]; z++) for (let x = C0[0]; x <= C1[0]; x++) {
    const i = id(x, z), road = (x - C0[0]) % 7 === 0 || (z - C0[1]) % 7 === 0;
    K[i] = road ? T.ROAD : T.STONE;
    if (!road && (x - C0[0]) % 7 === 1 && (z - C0[1]) % 7 === 1 && x + 5 <= C1[0] && z + 5 <= C1[1]) lots.push([x, z]);
  }
  const [ncx, ncz] = PLACES.city;
  let tw = lots[0], twD = 1e9;
  for (const l of lots) { const d = Math.hypot(l[0] + 2.5 - PLACES.tower[0], l[1] + 2.5 - PLACES.tower[1]); if (d < twD) { twD = d; tw = l; } }
  const TOWERH = Math.round(24 * HS);
  for (const [lx, lz] of lots) {
    const center = [lx + 2.5, lz + 2.5];
    if (Math.hypot(center[0] - ncx, center[1] - ncz) < 3 + S) continue;      // 節點廣場
    const tower = lx === tw[0] && lz === tw[1];
    const park = !tower && R() < 0.18;
    const bh = tower ? TOWERH : 3 + Math.floor(R() * R() * 10);
    for (let z = lz; z < lz + 6; z++) for (let x = lx; x < lx + 6; x++) {
      const i = id(x, z);
      if (park) { K[i] = T.PARK; continue; }
      if (x >= lx + 1 && x <= lx + 4 && z >= lz + 1 && z <= lz + 4) { H[i] = 4 + bh; K[i] = tower ? T.TOWER : T.BUILDING; lock[i] = 3; }
    }
  }
  const towerTop = 4 + TOWERH;

  // 7. 樹（密度除以 S，島變大樹不會多到跑不動）
  const trees = [];
  const TR = rng(seed + 5), keep = (x, z, px, pz, r) => Math.hypot(x - px, z - pz) < r * S;
  for (let z = 2; z < N - 2; z++) for (let x = 2; x < N - 2; x++) {
    const k = K[id(x, z)];
    if ((k === T.FOREST && TR() < 0.07 / S) || (k === T.GRASS && TR() < 0.015 / S) || (k === T.PARK && TR() < 0.05 / S)) {
      if (keep(x, z, ...PLACES.gate, 7) || keep(x, z, ...PLACES.shenmu, 4) || keep(x, z, ...tip, 4) || BEASTS.some(b => keep(x, z, ...PLACES[b], 6)) || keep(x, z, ...PLACES.spawn, 9)) continue;
      trees.push([x, z, H[id(x, z)], k === T.FOREST ? 1 : 0]);
    }
  }

  const world = { H, K, land, trees, towerTop, tower: tw, lots, tip, gorge, road0: C0 };
  world.height = (x, z) => {
    const xi = Math.floor(x), zi = Math.floor(z);
    if (xi < 0 || zi < 0 || xi >= N || zi >= N) return 0;
    return H[zi * N + xi];
  };
  world.kind = (x, z) => { const xi = Math.floor(x), zi = Math.floor(z); if (xi < 0 || zi < 0 || xi >= N || zi >= N) return T.SEA; return K[zi * N + xi]; };
  world.current = (x, z) => {
    const d = Math.abs(x - curX(z));
    const s = 1 - smooth(CURRENT.half - 1.2, CURRENT.half + 0.6, d);
    // 往北流，並微微把人拉向中心線
    return [(curX(z) - x) * 0.25 * s, -CURRENT.speed * s, s];
  };
  return world;
}

// 地形網格：只畫看得到的面
export function terrainMesh(w) {
  const b = new Builder(), { H, K } = w, [rx0, rz0] = w.road0;
  const win = hex('#9fd3f0'), wall = hex('#e6eaef'), wall2 = hex('#c9d1da'), towerWin = hex('#5d8f8a'), towerWall = hex('#7fb5ad'), rock = hex('#8a9096'), mark = hex('#d8d8c8');
  // 頂面：同一排相同高度、顏色的格子合併成一個長條（棋盤深淺改在 shader 依世界座標畫）
  const topOf = (x, z) => { const k = K[z * N + x]; return k === T.ROAD && ((x - rx0) % 7 === 0) !== ((z - rz0) % 7 === 0) && ((x + z) % 3 === 0) ? mark : TOP[k]; };
  for (let z = 0; z < N; z++) {
    let x = 0;
    while (x < N) {
      const h = H[z * N + x], c = topOf(x, z); let x1 = x + 1;
      while (x1 < N && H[z * N + x1] === h && topOf(x1, z) === c) x1++;
      b.quad([x, h, z], [x, h, z + 1], [x1, h, z + 1], [x1, h, z], [0, 1, 0], c, 0);
      x = x1;
    }
  }
  // 側面：泥土、岩石一面一個長條，分層深淺在 shader 畫（e = -1 代表要畫分層）；大樓窗戶與大理石維持逐格
  const ROCKY = Math.round(3 + 9 * (1 + (S - 1) * 0.5));
  const nb = [[1, 0, 4], [-1, 0, 8], [0, 1, 16], [0, -1, 32]];
  for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) {
    const i = z * N + x, h = H[i], k = K[i], top = TOP[k];
    for (const [ox, oz, f] of nb) {
      const xx = x + ox, zz = z + oz;
      const nh = xx < 0 || zz < 0 || xx >= N || zz >= N ? -4 : H[zz * N + xx];
      if (nh >= h) continue;
      if (k === T.BUILDING || k === T.TOWER || k === T.MARBLE) {
        for (let y = nh; y < h; y++) {
          let c, e = 0;
          if (k === T.MARBLE) c = (y % 3 === 1) ? hex('#b9b6ad') : hex('#ebe8df');
          else {
            const winRow = y > 4 && (y % 2 === 1), tw = k === T.TOWER;
            c = winRow ? (tw ? towerWin : win) : (tw ? towerWall : (((x * 7 + z * 3) & 1) ? wall : wall2));
            e = winRow ? 0.25 : 0;
          }
          b.box(x, y, z, 1, 1, 1, c, e, f);
        }
        continue;
      }
      let y1 = h;
      if (k !== T.SEA && k !== T.ROCK && k !== T.ROAD && k !== T.STONE) { b.box(x, h - 1, z, 1, 1, 1, top.map(v => v * 0.85), 0, f); y1 = h - 1; }
      if (y1 <= nh) continue;
      const ry = k === T.ROCK ? nh : Math.max(nh, Math.min(y1, ROCKY));
      if (ry > nh) b.box(x, nh, z, 1, ry - nh, 1, DIRT, -1, f);
      if (y1 > ry) b.box(x, ry, z, 1, y1 - ry, 1, rock, -1, f);
    }
  }
  // 樹：樹幹＋兩層方塊樹冠
  for (const [x, z, h, big] of w.trees) {
    const th = big ? 2 : 1.5;
    b.box(x + 0.35, h, z + 0.35, 0.3, th, 0.3, hex('#7a5131'));
    const g1 = big ? hex('#2f8445') : hex('#4aa84a'), g2 = big ? hex('#3f9a52') : hex('#62bd55');
    b.box(x - 0.1, h + th, z - 0.1, 1.2, 0.9, 1.2, g1);
    b.box(x + 0.15, h + th + 0.9, z + 0.15, 0.7, 0.6, 0.7, g2);
  }
  // 阿里山神木：巨大的紅檜
  {
    const [sx, sz] = PLACES.shenmu, h = w.height(sx + 0.5, sz + 0.5), bark = hex('#6b4129');
    b.box(sx - 0.4, h, sz - 0.4, 1.8, 9, 1.8, bark);
    b.box(sx - 0.9, h, sz - 0.9, 2.8, 1.2, 2.8, hex('#5a3620'));
    const g = [hex('#2c7a3f'), hex('#368a48'), hex('#43995a')];
    b.box(sx - 3, h + 7, sz - 3, 6.6, 2.2, 6.6, g[0]); b.box(sx - 2.2, h + 9.2, sz - 2.2, 5, 1.8, 5, g[1]); b.box(sx - 1.2, h + 11, sz - 1.2, 3, 1.4, 3, g[2]);
    b.box(sx - 4, h + 6, sz + 0.2, 2, 1.2, 2, g[1]); b.box(sx + 2.6, h + 7.6, sz - 1.4, 2, 1.2, 2, g[1]);
  }
  // 鵝鑾鼻燈塔：白色塔身、黑色燈室
  {
    const [lx, lz] = w.tip, h = w.height(lx + 0.5, lz + 0.5), white = hex('#f4f4f0');
    b.box(lx - 0.2, h, lz - 0.2, 1.4, 4.5, 1.4, white); b.box(lx - 0.05, h + 4.5, lz - 0.05, 1.1, 0.6, 1.1, white);
    b.box(lx - 0.35, h + 5.1, lz - 0.35, 1.7, 0.2, 1.7, hex('#3a3f46'));
    b.box(lx + 0.05, h + 5.3, lz + 0.05, 0.9, 0.8, 0.9, hex('#fff2b0'), 1);
    b.box(lx - 0.05, h + 6.1, lz - 0.05, 1.1, 0.4, 1.1, hex('#30353c'));
    w.lamp = [lx + 0.5, h + 5.7, lz + 0.5];
  }
  // 拉魯島上的小亭
  {
    const [lx, lz] = PLACES.lake, k = S, red = hex('#b9483c');
    for (const [a, c] of [[0.15, 0.15], [0.7, 0.7], [0.7, 0.15], [0.15, 0.7]]) b.box(lx + (a - 0.5) * k + 0.5, 3, lz + (c - 0.5) * k + 0.5, 0.15 * k, 1.2 * k, 0.15 * k, red);
    b.box(lx + (-0.1 - 0.5) * k + 0.5, 3 + 1.2 * k, lz + (-0.1 - 0.5) * k + 0.5, 1.2 * k, 0.25 * k, 1.2 * k, hex('#2f4f6f'));
  }
  // 高塔頂與避雷尖
  const tx = w.tower[0] + 1, tz = w.tower[1] + 1;
  b.box(tx + 0.5, w.towerTop, tz + 0.5, 3, 1.5, 3, hex('#7fb5ad'));
  b.box(tx + 1, w.towerTop + 1.5, tz + 1, 2, 1.5, 2, hex('#6fa8a0'));
  b.box(tx + 1.8, w.towerTop + 3, tz + 1.8, 0.4, 4, 0.4, hex('#e8eef3'), 0.6);
  return b;
}

// 水面網格：每個頂點存水深，用來畫淺水與浪花
export function waterData(w) {
  const out = [], S = 2, lo = -160, hi = N + 160;
  const depth = (x, z) => {
    if (x < 0 || z < 0 || x >= N || z >= N) return 8;
    const xi = clamp(Math.round(x), 0, N - 1), zi = clamp(Math.round(z), 0, N - 1);
    return WATER - w.H[zi * N + xi];
  };
  const quad = (x, z, s) => {
    const X = x + s, Z = z + s;
    for (const [px, pz] of [[x, z], [x, Z], [X, Z], [x, z], [X, Z], [X, z]]) out.push(px, pz, depth(px, pz));
  };
  // 近處細格、遠處大格（-16..N+16 的範圍剛好對齊 16 格）
  for (let z = -16; z < N + 16; z += S) for (let x = -16; x < N + 16; x += S) quad(x, z, S);
  for (let z = lo; z < hi; z += 16) for (let x = lo; x < hi; x += 16) {
    if (x >= -16 && x + 16 <= N + 16 && z >= -16 && z + 16 <= N + 16) continue;
    quad(x, z, 16);
  }
  return new Float32Array(out);
}

// 靈界浮島（啟流後從雲下升起）
export function floatMesh() {
  const b = new Builder(), R = rng(99);
  const isles = [[30, 44, 30], [100, 26, 34], [96, 104, 28], [24, 100, 36], [64, 8, 40]].map(([x, z, y]) => [x * S, z * S, y * (1 + (S - 1) * 0.5)]);
  for (const [ix, iz, iy] of isles) {
    const r = 3 + R() * 2;
    for (let z = -6; z <= 6; z++) for (let x = -6; x <= 6; x++) {
      const d = Math.hypot(x, z); if (d > r) continue;
      const depth = Math.floor((r - d) * 1.3) + 1;
      b.box(ix + x, iy - depth, iz + z, 1, depth, 1, hex('#6a5a4a'), 0, 62);
      b.box(ix + x, iy - 0.001, iz + z, 1, 0.001, 1, hex('#7dd3a8'), 0.15, 1);
      b.box(ix + x + 0.3, iy - depth - 0.4, iz + z + 0.3, 0.4, 0.4, 0.4, hex('#ffd98a'), 1, 63);
    }
    // 小亭
    b.box(ix - 1, iy, iz - 1, 0.4, 2.4, 0.4, hex('#b9483c')); b.box(ix + 1.6, iy, iz - 1, 0.4, 2.4, 0.4, hex('#b9483c'));
    b.box(ix - 1, iy, iz + 1.6, 0.4, 2.4, 0.4, hex('#b9483c')); b.box(ix + 1.6, iy, iz + 1.6, 0.4, 2.4, 0.4, hex('#b9483c'));
    b.box(ix - 1.6, iy + 2.4, iz - 1.6, 3.8, 0.4, 3.8, hex('#2f4f6f')); b.box(ix - 0.9, iy + 2.8, iz - 0.9, 2.4, 0.5, 2.4, hex('#2f4f6f'));
    b.box(ix + 0.1, iy + 3.3, iz + 0.1, 0.4, 0.5, 0.4, hex('#ffd98a'), 1);
  }
  return b;
}

// 四獸山的方塊神獸雕像（朝 -z 也就是北方）
export function beastMesh(kind) {
  const b = new Builder(), C = c => hex(c);
  const body = { tiger: '#e8923a', leopard: '#e9c25a', lion: '#d9a35f', elephant: '#9aa3ad' }[kind];
  const dark = { tiger: '#2a1f18', leopard: '#5a3d1e', lion: '#8a4f22', elephant: '#7d8590' }[kind];
  const big = kind === 'elephant' ? 1.25 : 1;
  const k = big;
  b.box(-0.5 * k, 0.6 * k, -0.9 * k, 1.0 * k, 0.8 * k, 1.8 * k, C(body));                      // 身體
  for (const [x, z] of [[-0.45, -0.75], [0.15, -0.75], [-0.45, 0.45], [0.15, 0.45]]) b.box(x * k, 0, z * k, 0.3 * k, 0.65 * k, 0.3 * k, C(body));
  b.box(-0.4 * k, 1.0 * k, -1.5 * k, 0.8 * k, 0.75 * k, 0.75 * k, C(body));                    // 頭
  b.box(-0.25 * k, 1.12 * k, -1.52 * k, 0.12 * k, 0.12 * k, 0.02, C('#1a1a1a'));
  b.box(0.13 * k, 1.12 * k, -1.52 * k, 0.12 * k, 0.12 * k, 0.02, C('#1a1a1a'));
  if (kind === 'tiger') for (let i = 0; i < 4; i++) b.box(-0.52, 0.75 + (i % 2) * 0.2, -0.7 + i * 0.4, 1.04, 0.12, 0.14, C(dark));
  if (kind === 'leopard') for (const [x, y, z] of [[-0.52, 1.1, -0.5], [-0.52, 0.85, 0.1], [0.42, 1.0, -0.2], [0.42, 0.8, 0.5], [-0.2, 1.41, 0.3], [0.1, 1.41, -0.4]]) b.box(x, y, z, 0.12, 0.14, 0.14, C(dark));
  if (kind === 'lion') { b.box(-0.6, 0.85, -1.35, 1.2, 1.1, 0.4, C(dark)); b.box(-0.08, 0.9, 0.85, 0.16, 0.16, 0.5, C(dark)); }
  if (kind === 'elephant') {
    b.box(-0.12 * k, 0.35 * k, -1.85 * k, 0.24 * k, 0.75 * k, 0.24 * k, C(body));                // 象鼻
    b.box(-0.75 * k, 0.95 * k, -1.35 * k, 0.3 * k, 0.65 * k, 0.1 * k, C(dark)); b.box(0.45 * k, 0.95 * k, -1.35 * k, 0.3 * k, 0.65 * k, 0.1 * k, C(dark));
    b.box(-0.3 * k, 0.5 * k, -1.75 * k, 0.08, 0.08, 0.3, C('#f4f1e8')); b.box(0.22 * k, 0.5 * k, -1.75 * k, 0.08, 0.08, 0.3, C('#f4f1e8'));
  }
  if (kind !== 'lion' && kind !== 'elephant') b.box(-0.07, 1.05, 0.85, 0.14, 0.14, 0.6, C(body));
  if (kind === 'tiger' || kind === 'leopard') { b.box(-0.38, 1.75, -1.3, 0.16, 0.16, 0.12, C(body)); b.box(0.22, 1.75, -1.3, 0.16, 0.16, 0.12, C(body)); }
  return b;
}

// 山門（牌樓）
export function gateMesh() {
  const b = new Builder(), red = hex('#b9483c'), stone = hex('#9aa3ad'), roof = hex('#2f4f6f'), gold = hex('#ffcf5a');
  b.box(-3.2, 0, -0.4, 0.8, 6, 0.8, red); b.box(2.4, 0, -0.4, 0.8, 6, 0.8, red);
  b.box(-3.5, 0, -0.7, 1.4, 0.8, 1.4, stone); b.box(2.1, 0, -0.7, 1.4, 0.8, 1.4, stone);
  b.box(-3.6, 4.6, -0.3, 7.2, 0.6, 0.6, red);
  b.box(-1.1, 5.2, -0.25, 2.2, 0.9, 0.5, gold, 0.6);                 // 匾額
  b.box(-4.6, 6.0, -1.0, 9.2, 0.5, 2.0, roof);
  b.box(-3.8, 6.5, -0.8, 7.6, 0.5, 1.6, roof);
  b.box(-5.0, 5.9, -1.1, 0.6, 0.4, 2.2, gold, 0.4); b.box(4.4, 5.9, -1.1, 0.6, 0.4, 2.2, gold, 0.4);
  b.box(-0.4, 7.0, -0.4, 0.8, 0.6, 0.8, gold, 0.6);
  return b;
}

// 後續章節的入口：海上一座方塊門框，鎖著（col 是章節的顏色）
export function portalMesh(col) {
  const b = new Builder(), stone = hex('#5d6672'), dark = hex('#3c434d');
  b.box(-3.5, -1.5, -1.5, 7, 1.5, 3, dark);
  b.box(-3, 0, -1, 6, 0.4, 2, stone);
  b.box(-2.6, 0.4, -0.4, 0.8, 6.4, 0.8, stone); b.box(1.8, 0.4, -0.4, 0.8, 6.4, 0.8, stone);
  b.box(-3.2, 6.8, -0.6, 6.4, 0.8, 1.2, stone);
  b.box(-0.6, 7.6, -0.4, 1.2, 0.8, 0.8, col, 0.8);
  for (let y = 1; y < 6.6; y += 1.1) { b.box(-2.7, y, -0.5, 0.2, 0.5, 1, col, 0.7); b.box(2.5, y, -0.5, 0.2, 0.5, 1, col, 0.7); }
  return b;
}

// 靈脈節點底座；山頂多一座鐘架
export function nodeMesh(kind) {
  const b = new Builder(), stone = hex('#b7b0a2'), dark = hex('#6d6a63');
  b.box(-1.2, 0, -1.2, 2.4, 0.4, 2.4, dark);
  b.box(-0.8, 0.4, -0.8, 1.6, 0.6, 1.6, stone);
  b.box(-0.5, 1.0, -0.5, 1.0, 0.3, 1.0, hex('#ddd6c6'));
  if (kind === 'peak') {
    const wood = hex('#7a4a2c');
    b.box(-2.2, 0, -0.3, 0.5, 5, 0.5, wood); b.box(1.7, 0, -0.3, 0.5, 5, 0.5, wood);
    b.box(-2.6, 5, -0.5, 5.2, 0.5, 0.9, wood);
    b.box(-2.9, 5.5, -0.8, 5.8, 0.3, 1.5, hex('#2f4f6f'));
  }
  if (kind === 'city') {
    for (const [x, z] of [[-1.6, -1.6], [1.2, -1.6], [-1.6, 1.2], [1.2, 1.2]]) b.box(x, 0, z, 0.4, 1.8, 0.4, hex('#d0c9b8'));
  }
  return b;
}

export function bellMesh() {
  const b = new Builder(), c = hex('#c9a35a');
  b.cbox(0, -0.2, 0, 0.5, 0.3, 0.5, c);
  b.cbox(0, -0.6, 0, 0.9, 0.6, 0.9, c);
  b.cbox(0, -1.1, 0, 1.2, 0.5, 1.2, c);
  b.cbox(0, -1.42, 0, 1.35, 0.15, 1.35, hex('#e2c27a'));
  return b;
}
