// 三消（獅門・威勢）：交換相鄰兩格，連成三個以上就消除，消掉的元素化成光打向濁流
// 連四個會留下「流眼」，消掉時清空整排整列；濁流每隔幾步把格子染成濁塊，在旁邊消除就能洗掉；步數用完就重來
const C = 6, R = 6, MURK = -1;
// 星等：元素種類越多越難連、濁塊越頻繁、每次淨化越少
const LEVEL = {
  1: { kinds: 4, moves: 12, gain: 1.4, murkEvery: 0, murkN: 0, chain: 0.25 },
  2: { kinds: 5, moves: 12, gain: 1.6, murkEvery: 2, murkN: 2, chain: 0.3 },
  3: { kinds: 5, moves: 12, gain: 1.3, murkEvery: 2, murkN: 3, chain: 0.3 },
};

export function match3(A, { star, ease }) {
  const st = { ...LEVEL[star] || LEVEL[1] }, KINDS = st.kinds;
  // 輸過一次：多三步、每次淨化多一點
  st.moves += ease * 3; st.gain *= 1 + ease * 0.15;
  let uid = 0;
  const B = { moves: st.moves, turn: 0, grid: [], phase: 'idle', timer: 0, chain: 0, sel: -1, swapA: -1, swapB: -1 };
  const cell = k => ({ k, s: 0, id: uid++, ox: 0, oy: 0, sc: 1, die: 0 });
  const kindAt = (gr, i) => gr[i] ? gr[i].k : MURK;
  const box = () => { const a = A.lay.area, s = Math.floor(Math.min(a.w / C, a.h / R)); return { s, x: a.x + (a.w - s * C) / 2, y: a.y + (a.h - s * R) / 2 }; };
  const pos = i => { const b = box(); return [b.x + (i % C + 0.5) * b.s, b.y + (((i / C) | 0) + 0.5) * b.s]; };
  const at = (x, y) => { const b = box(), c = Math.floor((x - b.x) / b.s), r = Math.floor((y - b.y) / b.s); return c >= 0 && c < C && r >= 0 && r < R ? r * C + c : -1; };
  const adj = (a, b) => (Math.abs(a - b) === 1 && ((a / C) | 0) === ((b / C) | 0)) || Math.abs(a - b) === C;
  const info = () => A.info(A.t('battleMoves', { n: B.moves }));

  function fill() {
    B.grid = [];
    for (let i = 0; i < C * R; i++) {
      let k; const r = (i / C) | 0, c = i % C;
      do { k = (Math.random() * KINDS) | 0; } while ((c >= 2 && B.grid[i - 1].k === k && B.grid[i - 2].k === k) || (r >= 2 && B.grid[i - C].k === k && B.grid[i - 2 * C].k === k));
      B.grid.push(cell(k));
    }
  }
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
  const swapped = (a, b) => { const gr = B.grid.slice(); [gr[a], gr[b]] = [gr[b], gr[a]]; return gr; };
  const canSwap = (a, b) => B.grid[a].k !== MURK && B.grid[b].k !== MURK;
  function hasMove() {
    for (let i = 0; i < C * R; i++) for (const j of [i + 1, i + C]) {
      if (j >= C * R || (j === i + 1 && j % C === 0) || !canSwap(i, j)) continue;
      if (runs(swapped(i, j)).length) return true;
    }
    return false;
  }
  function trySwap(a, b) {
    if (B.phase !== 'idle' || !A.run || !adj(a, b) || !canSwap(a, b)) return;
    doSwap(a, b); B.swapA = a; B.swapB = b; B.phase = 'swap'; B.chain = 0; B.sel = -1;
  }
  function doSwap(a, b) {
    const gr = B.grid, s = box().s, [ac, ar] = [a % C, (a / C) | 0], [bc, br] = [b % C, (b / C) | 0];
    [gr[a], gr[b]] = [gr[b], gr[a]];
    gr[a].ox = (bc - ac) * s; gr[a].oy = (br - ar) * s; gr[b].ox = (ac - bc) * s; gr[b].oy = (ar - br) * s;
  }
  function clearStep(rs) {
    const gr = B.grid, kill = new Set(rs.flat()), keep = new Set();
    for (const run of rs) if (run.length >= 4) {
      const k = run.find(i => i === B.swapA || i === B.swapB) ?? run[run.length >> 1];
      if (!gr[k].s) keep.add(k);
    }
    const queue = [...kill].filter(i => gr[i].s && !keep.has(i));
    while (queue.length) {
      const i = queue.pop(), r = (i / C) | 0, c = i % C;
      const [x, y] = pos(i); A.burst(x, y, '#7fe8ff', 24, 260); A.sfx.dispel();
      for (let j = 0; j < C; j++) { const x = r * C + j; if (!kill.has(x)) { kill.add(x); if (gr[x].s) queue.push(x); } }
      for (let j = 0; j < R; j++) { const x = j * C + c; if (!kill.has(x)) { kill.add(x); if (gr[x].s) queue.push(x); } }
    }
    for (const k of keep) kill.delete(k);
    for (const i of [...kill]) for (const j of [i - C, i + C, i % C ? i - 1 : -1, (i + 1) % C ? i + 1 : -1]) if (j >= 0 && j < C * R && gr[j].k === MURK) kill.add(j);
    let n = 0;
    for (const i of kill) { gr[i].die = 0.001; n++; const [x, y] = pos(i); A.shoot(x, y, gr[i].k === MURK ? '#b9a6d6' : A.TILE[gr[i].k][0]); }
    for (const k of keep) { gr[k].s = 1; gr[k].sc = 1.4; }
    A.add(n * st.gain * (1 + B.chain * st.chain));
    A.sfx.hit(B.chain * 2 + Math.min(3, n - 3)); A.buzz(10 + B.chain * 8);
    B.phase = 'clear'; B.timer = 0.22;
  }
  function gravity() {
    const gr = B.grid, s = box().s;
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
    B.moves--; B.turn++; B.phase = 'idle'; info();
    if (A.pur >= 99.99) return;
    if (st.murkEvery && B.turn % st.murkEvery === 0) enemyTurn();
    if (B.moves <= 0) return A.lose();
    if (!hasMove()) { do { for (const x of B.grid) if (x.k !== MURK) x.k = (Math.random() * KINDS) | 0; } while (runs().length || !hasMove()); }
  }
  // 濁流反擊：把幾格染成濁塊
  function enemyTurn() {
    const free = B.grid.map((x, i) => x.k !== MURK && !x.s ? i : -1).filter(i => i >= 0);
    for (let n = 0; n < st.murkN && free.length; n++) {
      const i = free.splice((Math.random() * free.length) | 0, 1)[0];
      B.grid[i].k = MURK; B.grid[i].sc = 1.5;
      const [x, y] = pos(i); A.burst(x, y, '#5a4e6e', 10, 120);
    }
    A.hurt();
  }

  do { fill(); } while (!hasMove());
  info();

  let down = null;
  return {
    B, runs, swapped, swap: trySwap, C, R, MURK, box,
    busy: () => B.phase !== 'idle',
    down(x, y) { if (B.phase !== 'idle') return; const i = at(x, y); if (i >= 0) down = { i, x, y, moved: false }; },
    move(x, y) {
      if (!down || down.moved) return;
      const dx = x - down.x, dy = y - down.y;
      if (Math.hypot(dx, dy) < box().s * 0.35) return;
      down.moved = true;
      const i = down.i, c = i % C, r = (i / C) | 0;
      const j = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? (c < C - 1 ? i + 1 : -1) : (c > 0 ? i - 1 : -1)) : (dy > 0 ? (r < R - 1 ? i + C : -1) : (r > 0 ? i - C : -1));
      if (j >= 0) trySwap(i, j);
    },
    up() {
      if (!down) return;
      const i = down.i, moved = down.moved; down = null;
      if (moved || B.phase !== 'idle') return;
      if (B.sel >= 0 && adj(B.sel, i)) trySwap(B.sel, i);
      else { B.sel = B.sel === i ? -1 : i; A.sfx.dispel(); }
    },
    tick(dt) {
      let moving = false;
      const v = box().s * 14 * dt;
      for (const x of B.grid) {
        if (x.ox) { x.ox = Math.abs(x.ox) <= v ? 0 : x.ox - Math.sign(x.ox) * v; moving = true; }
        if (x.oy) { x.oy = Math.abs(x.oy) <= v ? 0 : x.oy - Math.sign(x.oy) * v; moving = true; }
        if (x.die) x.die += dt;
        x.sc += (1 - x.sc) * Math.min(1, dt * 10);
      }
      if (B.phase === 'swap' && !moving) {
        const rs = runs();
        if (rs.length) clearStep(rs);
        else { doSwap(B.swapA, B.swapB); B.phase = 'unswap'; A.sfx.deny(); }
      } else if (B.phase === 'unswap' && !moving) B.phase = 'idle';
      else if (B.phase === 'clear' && (B.timer -= dt) <= 0) { gravity(); B.phase = 'fall'; }
      else if (B.phase === 'fall' && !moving) {
        const rs = runs(); B.swapA = B.swapB = -1;
        if (rs.length) { B.chain++; clearStep(rs); } else endTurn();
      }
    },
    draw() {
      const g = A.g, b = box(), s = b.s;
      g.fillStyle = 'rgba(255,255,255,.06)'; A.rr(b.x - 8, b.y - 8, s * C + 16, s * R + 16, 18); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 1; g.stroke();
      g.save(); g.beginPath(); g.rect(b.x - 6, b.y - 6, s * C + 12, s * R + 12); g.clip();
      for (let i = 0; i < C * R; i++) {
        const x = B.grid[i]; if (!x) continue;
        const [cx, cy] = pos(i), k = x.die ? Math.max(0, 1 - x.die / 0.2) : 1, z = s * 0.86 * x.sc * k;
        if (z > 0) A.tile(cx + x.ox, cy + x.oy, z, x.k, { special: x.s, sel: i === B.sel });
      }
      g.restore();
      if (B.chain >= 1 && (B.phase === 'clear' || B.phase === 'fall')) {
        g.fillStyle = '#ffcf5a'; g.font = '900 18px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(A.t('battleCombo', { n: B.chain + 1 }), A.lay.area.x + A.lay.area.w / 2, b.y - 18);
      }
    },
  };
}
match3.key = 'match3';
