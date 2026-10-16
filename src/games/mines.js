// 踩地雷（萬華・黑貓）：巷弄裡藏著濁流，點開安全的格子就會亮起光，數字是周圍八格藏了幾團濁流
// 下方可以切換「插旗」標記懷疑的格子；踩到濁流會被反擊，生命用完就輸。第一下一定安全
// 星等：1 星 6×6 藏 5 團、2 星 7×7 藏 8 團、3 星 8×8 藏 12 團
const LEVEL = { 1: { n: 6, m: 5, life: 3 }, 2: { n: 7, m: 8, life: 3 }, 3: { n: 8, m: 12, life: 2 } };

export function mines(A, { star, ease }) {
  const LV = LEVEL[star] || LEVEL[1], N = LV.n, M = Math.max(3, LV.m - ease);
  const cells = [...Array(N * N)].map(() => ({ mine: false, open: false, flag: false, n: 0, pop: 0 }));
  const S = { life: LV.life + (ease ? 1 : 0), first: true, flagMode: false, opened: 0, boom: [] };
  const SAFE = N * N - M;
  const info = () => A.info(A.t('lives', { n: S.life }));
  info();
  const nb = i => { const r = (i / N) | 0, c = i % N, o = []; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const rr = r + dr, cc = c + dc; if ((dr || dc) && rr >= 0 && rr < N && cc >= 0 && cc < N) o.push(rr * N + cc); } return o; };
  function plant(safe) {
    const keep = new Set([safe, ...nb(safe)]);
    const pool = [...Array(N * N).keys()].filter(i => !keep.has(i)).sort(() => Math.random() - 0.5);
    for (const i of pool.slice(0, M)) cells[i].mine = true;
    cells.forEach((c, i) => { c.n = nb(i).filter(j => cells[j].mine).length; });
  }
  const lay = () => {
    const a = A.lay.area, bar = 52, s = Math.floor(Math.min(a.w, a.h - bar - 16) / N);
    const x = a.x + (a.w - s * N) / 2, y = a.y + (a.h - s * N - bar - 16) / 2;
    return { s, x, y, by: y + s * N + 16, bh: bar };
  };
  const at = (x, y) => { const L = lay(), c = Math.floor((x - L.x) / L.s), r = Math.floor((y - L.y) / L.s); return c >= 0 && c < N && r >= 0 && r < N ? r * N + c : -1; };
  const center = i => { const L = lay(); return [L.x + (i % N + 0.5) * L.s, L.y + (((i / N) | 0) + 0.5) * L.s]; };
  const flagBtn = () => { const L = lay(), w = Math.min(200, L.s * N); return { x: L.x + (L.s * N - w) / 2, y: L.by, w, h: L.bh }; };

  // 打開一格；空白格會一路往外打開（打開的格子是凹下去的深色）
  function open(i) {
    const st = [i], got = [];
    while (st.length) {
      const k = st.pop(), c = cells[k]; if (c.open || c.flag) continue;
      c.open = true; c.pop = 1; S.opened++; got.push(k);
      if (!c.n) for (const j of nb(k)) if (!cells[j].open && !cells[j].mine) st.push(j);
    }
    const [x, y] = center(i);
    A.shoot(x, y, '#7fe8ff'); if (got.length > 3) A.burst(x, y, '#7fe8ff', 16, 180);
    A.add(got.length * 100 / SAFE, true); A.sfx.hit(Math.min(6, got.length)); A.buzz(10);
  }
  function tap(i) {
    const c = cells[i];
    if (S.flagMode) { if (!c.open) { c.flag = !c.flag; A.sfx.dispel(); } return; }
    if (c.open || c.flag) return;
    if (S.first) { S.first = false; plant(i); }
    if (c.mine) {
      c.open = true; S.boom.push({ i, t: 0.6 }); S.life--; A.hurt(); info();
      if (S.life <= 0) { cells.forEach(x => { if (x.mine) x.open = true; }); A.lose(); }
      return;
    }
    open(i);
  }

  return {
    revive() { S.life = 1; info(); },
    cells, tap,
    down(x, y) {
      const f = flagBtn();
      if (x >= f.x && x <= f.x + f.w && y >= f.y && y <= f.y + f.h) { S.flagMode = !S.flagMode; A.sfx.pick?.(); A.buzz(8); return; }
      const i = at(x, y); if (i >= 0) tap(i);
    },
    tick(dt) {
      for (const c of cells) c.pop = Math.max(0, c.pop - dt * 4);
      for (const b of S.boom) b.t -= dt; S.boom = S.boom.filter(b => b.t > 0);
    },
    draw() {
      const g = A.g, L = lay(), s = L.s, T = A.time, NUMC = ['', '#7fe8ff', '#8fd14f', '#ffcf5a', '#ffa53a', '#ff8fbf', '#c9a8ff', '#ffffff', '#ffffff'];
      g.fillStyle = 'rgba(8,14,26,.6)'; A.rr(L.x - 8, L.y - 8, s * N + 16, s * N + 16, 14); g.fill();
      g.textAlign = 'center'; g.textBaseline = 'middle';
      cells.forEach((c, i) => {
        const [x, y] = center(i), z = s * 0.88 * (1 + c.pop * 0.12);
        if (c.open && c.mine) { A.tile(x, y, z, -1); return; }
        if (c.open) {
          g.fillStyle = 'rgba(0,0,0,.28)'; A.rr(x - z / 2, y - z / 2, z, z, z * 0.16); g.fill();
          if (c.n) { g.fillStyle = NUMC[c.n]; g.font = `900 ${Math.round(s * 0.5)}px system-ui`; g.fillText(c.n, x, y + 1); }
          return;
        }
        // 還沒開：凸起的石板（比打開的格子亮），上緣一道反光
        g.fillStyle = '#4a5a80'; A.rr(x - z / 2, y - z / 2, z, z, z * 0.16); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 1.5; g.stroke();
        g.fillStyle = 'rgba(255,255,255,.12)'; A.rr(x - z / 2 + 2, y - z / 2 + 2, z - 4, z * 0.35, z * 0.12); g.fill();
        if (c.flag) { // 小旗子
          g.strokeStyle = '#ffcf5a'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x - z * 0.12, y + z * 0.26); g.lineTo(x - z * 0.12, y - z * 0.26); g.stroke();
          g.fillStyle = '#ffcf5a'; g.beginPath(); g.moveTo(x - z * 0.12, y - z * 0.26); g.lineTo(x + z * 0.24, y - z * 0.12); g.lineTo(x - z * 0.12, y + z * 0.02); g.closePath(); g.fill();
        }
      });
      for (const b of S.boom) { const [x, y] = center(b.i); g.strokeStyle = `rgba(255,107,107,${b.t / 0.6})`; g.lineWidth = 3; g.beginPath(); g.arc(x, y, s * (1.2 - b.t), 0, 6.283); g.stroke(); }
      // 插旗切換
      const f = flagBtn();
      g.fillStyle = S.flagMode ? '#ffcf5a' : 'rgba(255,255,255,.1)'; A.rr(f.x, f.y, f.w, f.h, f.h / 2); g.fill();
      g.strokeStyle = S.flagMode ? '#fff3d6' : 'rgba(255,255,255,.25)'; g.lineWidth = 1.5; g.stroke();
      g.fillStyle = S.flagMode ? '#3a2300' : '#e8fbff'; g.font = '900 17px system-ui';
      g.fillText(A.t(S.flagMode ? 'minesFlagOn' : 'minesFlagOff'), f.x + f.w / 2, f.y + f.h / 2 + 1);
    },
  };
}
mines.key = 'mines';
