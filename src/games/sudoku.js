// 數獨（象門・記憶／山之鐘聲）：用海、山、花、陽（六格版再加石、月）代替數字
// 每一橫排、每一直列、每個小區，每種元素各出現一次；填對一格就化成光打向濁流，填錯會被濁流反擊
// 星等：1 星 4×4 給 8 格、2 星 4×4 給 6 格、3 星 6×6 給 22 格
const LEVEL = { 1: { n: 4, give: 8 }, 2: { n: 4, give: 6 }, 3: { n: 6, give: 22 } };

export function sudoku(A, { star, ease }) {
  const { n: N, give: give0 } = LEVEL[star] || LEVEL[1];
  const BR = 2, BC = N / 2;   // 小區：2 列 × (N/2) 欄
  const shuffle = a => a.sort(() => Math.random() - 0.5);
  // 解答：基本型 → 換元素、換帶、帶內換列、換欄組、組內換欄
  const base = (r, c) => (BC * (r % BR) + Math.floor(r / BR) + c) % N;
  const perm = shuffle([...Array(N).keys()]);
  const rows = shuffle([...Array(N / BR).keys()]).flatMap(b => shuffle([...Array(BR).keys()]).map(j => b * BR + j));
  const cols = shuffle([...Array(N / BC).keys()]).flatMap(b => shuffle([...Array(BC).keys()]).map(j => b * BC + j));
  const ans = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) ans.push(perm[base(rows[r], cols[c])]);
  const boxOf = i => Math.floor(((i / N) | 0) / BR) * BR + Math.floor((i % N) / BC);
  // 題目：每個小區至少一格，輸過一次多給幾格
  const give = Math.min(N * N - 3, give0 + ease * (N === 6 ? 3 : 2));
  const idx = shuffle([...Array(N * N).keys()]), shown = new Set();
  for (let b = 0; b < N; b++) shown.add(idx.find(i => boxOf(i) === b));
  for (const i of idx) { if (shown.size >= give) break; shown.add(i); }
  const grid = ans.map((v, i) => shown.has(i) ? v : -1);
  const blanks = N * N - shown.size, gain = 100 / blanks;
  const S = { sel: grid.indexOf(-1), miss: 0, maxMiss: 3, flash: new Map(), pop: new Map() };
  const info = () => A.info(A.t('mistakes', { n: S.maxMiss - S.miss }));
  info();

  const lay = () => {
    const a = A.lay.area, pal = Math.min(N === 6 ? 50 : 64, a.h * 0.15), s = Math.floor(Math.min(a.w / N, (a.h - pal - 24) / N, 86));
    const x = a.x + (a.w - s * N) / 2, y = a.y + (a.h - s * N - pal - 24) / 2;
    const ps = Math.min(pal, (a.w - 10 * (N - 1)) / N);
    return { s, x, y, py: y + s * N + 24 + ps / 2, ps, px: i => a.x + a.w / 2 + (i - (N - 1) / 2) * (ps + 10) };
  };
  const cellAt = (x, y) => { const L = lay(), c = Math.floor((x - L.x) / L.s), r = Math.floor((y - L.y) / L.s); return c >= 0 && c < N && r >= 0 && r < N ? r * N + c : -1; };
  const palAt = (x, y) => { const L = lay(); for (let i = 0; i < N; i++) if (Math.abs(x - L.px(i)) < L.ps / 2 + 5 && Math.abs(y - L.py) < L.ps / 2 + 5) return i; return -1; };
  const center = i => { const L = lay(); return [L.x + (i % N + 0.5) * L.s, L.y + (((i / N) | 0) + 0.5) * L.s]; };

  // 判定：不和同排、同列、同區重複，而且填下去之後還解得開（題目可能不只一種解，不硬比對標準答案）
  const peers = [...Array(N * N).keys()].map(i => [...Array(N * N).keys()].filter(j => j !== i && (((j / N) | 0) === ((i / N) | 0) || j % N === i % N || boxOf(j) === boxOf(i))));
  const ok = (gr, i, k) => peers[i].every(j => gr[j] !== k);
  function solvable(gr) {
    const i = gr.indexOf(-1); if (i < 0) return true;
    for (let k = 0; k < N; k++) if (ok(gr, i, k)) { gr[i] = k; const r = solvable(gr); gr[i] = -1; if (r) return true; }
    return false;
  }
  function place(k) {
    const i = S.sel; if (i < 0 || grid[i] >= 0) return;
    const fits = ok(grid, i, k) && (() => { const gr = grid.slice(); gr[i] = k; return solvable(gr); })();
    if (fits) {
      grid[i] = k; S.pop.set(i, 1);
      const [x, y] = center(i); A.shoot(x, y, A.TILE[k][0]); A.burst(x, y, A.TILE[k][0], 10, 140);
      A.add(gain, true); A.sfx.hit(N * N - grid.filter(v => v < 0).length); A.buzz(12);
      // 自動跳到下一個空格
      const nx = [...Array(N * N).keys()].map(j => (i + 1 + j) % (N * N)).find(j => grid[j] < 0);
      S.sel = nx ?? -1;
    } else {
      S.miss++; S.flash.set(i, { k, t: 0.5 }); A.hurt(); info();
      if (S.miss >= S.maxMiss) A.lose();
    }
  }

  return {
    N, grid, ans, place, sel: () => S.sel, setSel: i => { S.sel = i; }, lay, center,
    down(x, y) {
      const p = palAt(x, y); if (p >= 0) return place(p);
      const i = cellAt(x, y); if (i >= 0 && grid[i] < 0) { S.sel = i; A.sfx.dispel(); }
    },
    tick(dt) {
      for (const [i, f] of S.flash) { f.t -= dt; if (f.t <= 0) S.flash.delete(i); }
      for (const [i, v] of S.pop) { const n = v - dt * 4; if (n <= 0) S.pop.delete(i); else S.pop.set(i, n); }
    },
    draw() {
      const g = A.g, L = lay(), s = L.s, T = A.time;
      g.fillStyle = 'rgba(8,14,26,.6)'; A.rr(L.x - 8, L.y - 8, s * N + 16, s * N + 16, 14); g.fill();
      for (let i = 0; i < N * N; i++) {
        const [x, y] = center(i), z = s * 0.84;
        if (grid[i] >= 0) A.tile(x, y, z * (1 + (S.pop.get(i) || 0) * 0.25), grid[i], { alpha: shown.has(i) ? 0.75 : 1 });
        else {
          g.fillStyle = i === S.sel ? 'rgba(127,232,255,.18)' : 'rgba(255,255,255,.1)'; A.rr(x - z / 2, y - z / 2, z, z, z * 0.16); g.fill();
          if (i !== S.sel) { g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1.5; g.stroke(); }
          if (i === S.sel) { g.strokeStyle = `rgba(127,232,255,${0.6 + 0.4 * Math.sin(T * 6)})`; g.lineWidth = 3; g.stroke(); }
          const f = S.flash.get(i);
          if (f) { A.tile(x + Math.sin(T * 60) * 4, y, z * 0.9, f.k, { alpha: f.t * 2 }); g.strokeStyle = '#ff6b6b'; g.lineWidth = 3; A.rr(x - z / 2, y - z / 2, z, z, z * 0.16); g.stroke(); }
        }
      }
      // 小區的分隔線
      g.strokeStyle = 'rgba(255,207,90,.55)'; g.lineWidth = 2; g.beginPath();
      for (let c = BC; c < N; c += BC) { g.moveTo(L.x + s * c, L.y - 4); g.lineTo(L.x + s * c, L.y + s * N + 4); }
      for (let r = BR; r < N; r += BR) { g.moveTo(L.x - 4, L.y + s * r); g.lineTo(L.x + s * N + 4, L.y + s * r); }
      g.stroke();
      // 選元素
      for (let k = 0; k < N; k++) A.tile(L.px(k), L.py, L.ps, k);
    },
  };
}
sudoku.key = 'sudoku';
