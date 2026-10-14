// 迷你數獨（象門・記憶）：4×4 的格子，用海、山、花、陽四種元素代替數字
// 每一橫排、每一直列、每個 2×2 小區，四種元素各出現一次；填對一格就化成光打向濁流，填錯會被濁流反擊
export function sudoku(A, { lv, ease }) {
  const N = 4;
  // 解答：基本型 → 隨機換元素、換列、換欄、轉置
  let sol = [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]];
  const perm = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  sol = sol.map(r => r.map(v => perm[v]));
  const sw = (a, i, j) => { [a[i], a[j]] = [a[j], a[i]]; };
  if (Math.random() < 0.5) sw(sol, 0, 1); if (Math.random() < 0.5) sw(sol, 2, 3);
  if (Math.random() < 0.5) { sol = [sol[2], sol[3], sol[0], sol[1]]; }
  if (Math.random() < 0.5) sol = sol.map(r => { sw(r, 0, 1); return r; });
  if (Math.random() < 0.5) sol = sol.map(r => { sw(r, 2, 3); return r; });
  if (Math.random() < 0.5) sol = sol[0].map((_, c) => sol.map(r => r[c]));
  const ans = sol.flat();
  // 題目：先給 7 格（輸過一次多給 2 格），每個 2×2 小區至少一格
  const give = Math.min(12, 7 + ease * 2);
  const idx = [...Array(16).keys()].sort(() => Math.random() - 0.5), shown = new Set();
  for (let b = 0; b < 4; b++) shown.add(idx.find(i => (((i / 8) | 0) * 2 + ((i % 4) >> 1)) === b));
  for (const i of idx) { if (shown.size >= give) break; shown.add(i); }
  const grid = ans.map((v, i) => shown.has(i) ? v : -1);
  const blanks = 16 - shown.size, gain = 100 / blanks;
  const S = { sel: -1, miss: 0, maxMiss: 3 + lv, flash: new Map(), pop: new Map() };
  const info = () => A.info(A.t('mistakes', { n: S.maxMiss - S.miss }));
  info();
  // 預設選第一個空格
  S.sel = grid.indexOf(-1);

  const lay = () => {
    const a = A.lay.area, pal = Math.min(64, a.h * 0.16), s = Math.floor(Math.min(a.w / N, (a.h - pal - 24) / N, 86));
    const x = a.x + (a.w - s * N) / 2, y = a.y + (a.h - s * N - pal - 24) / 2;
    const ps = Math.min(pal, (a.w - 30) / 4);
    return { s, x, y, py: y + s * N + 24 + ps / 2, ps, px: i => a.x + a.w / 2 + (i - 1.5) * (ps + 10) };
  };
  const cellAt = (x, y) => { const L = lay(), c = Math.floor((x - L.x) / L.s), r = Math.floor((y - L.y) / L.s); return c >= 0 && c < N && r >= 0 && r < N ? r * N + c : -1; };
  const palAt = (x, y) => { const L = lay(); for (let i = 0; i < 4; i++) if (Math.abs(x - L.px(i)) < L.ps / 2 + 5 && Math.abs(y - L.py) < L.ps / 2 + 5) return i; return -1; };
  const center = i => { const L = lay(); return [L.x + (i % N + 0.5) * L.s, L.y + (((i / N) | 0) + 0.5) * L.s]; };

  // 判定：不和同排、同列、同區重複，而且填下去之後還解得開（題目可能不只一種解，不硬比對標準答案）
  const peers = i => { const r = (i / N) | 0, c = i % N, b0 = (r >> 1) * 8 + (c >> 1) * 2; return [...Array(4).keys()].flatMap(j => [r * N + j, j * N + c, b0 + (j >> 1) * N + (j & 1)]).filter(j => j !== i); };
  const ok = (gr, i, k) => peers(i).every(j => gr[j] !== k);
  function solvable(gr) {
    const i = gr.indexOf(-1); if (i < 0) return true;
    for (let k = 0; k < 4; k++) if (ok(gr, i, k)) { gr[i] = k; const r = solvable(gr); gr[i] = -1; if (r) return true; }
    return false;
  }
  function place(k) {
    const i = S.sel; if (i < 0 || grid[i] >= 0) return;
    const fits = ok(grid, i, k) && (() => { const gr = grid.slice(); gr[i] = k; return solvable(gr); })();
    if (fits) {
      grid[i] = k; S.pop.set(i, 1);
      const [x, y] = center(i); A.shoot(x, y, A.TILE[k][0]); A.burst(x, y, A.TILE[k][0], 10, 140);
      A.add(gain); A.sfx.hit(16 - grid.filter(v => v < 0).length); A.buzz(12);
      // 自動跳到下一個空格
      const nx = [...Array(16).keys()].map(j => (i + 1 + j) % 16).find(j => grid[j] < 0);
      S.sel = nx ?? -1;
    } else {
      S.miss++; S.flash.set(i, { k, t: 0.5 }); A.hurt(); info();
      if (S.miss >= S.maxMiss) A.lose();
    }
  }

  return {
    grid, ans, place, sel: () => S.sel, setSel: i => { S.sel = i; },
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
      for (let i = 0; i < 16; i++) {
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
      // 2×2 小區的分隔線
      g.strokeStyle = 'rgba(255,207,90,.55)'; g.lineWidth = 2; g.beginPath();
      g.moveTo(L.x + s * 2, L.y - 4); g.lineTo(L.x + s * 2, L.y + s * N + 4); g.moveTo(L.x - 4, L.y + s * 2); g.lineTo(L.x + s * N + 4, L.y + s * 2); g.stroke();
      // 選元素
      for (let k = 0; k < 4; k++) A.tile(L.px(k), L.py, L.ps, k);
    },
  };
}
sudoku.key = 'sudoku';
sudoku.bonus = lv => lv;
