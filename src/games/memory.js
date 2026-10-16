// 記憶配對（五分埔・三花貓）：翻開兩張一樣的元素牌就配成一對，化成光打向濁流；配錯會被濁流反擊、扣一點時間
// 開場先讓你看一眼所有牌；星等：1 星 3×4 看 2.5 秒、2 星 3×4 看 1.5 秒、3 星 4×4（多兩對）看 1.5 秒，每 12 秒濁流會把兩張沒翻開的牌偷偷換位置
const LEVEL = { 1: { r: 4, c: 3, peek: 2.5, time: 45, swap: 0 }, 2: { r: 4, c: 3, peek: 1.5, time: 40, swap: 0 }, 3: { r: 4, c: 4, peek: 1.5, time: 55, swap: 12 } };

// 再春・賓士貓：一開始就全部蓋著（不先看），4×4 翻兩張一樣就消掉，時間給多一點
const NODE = { zaichun: { r: 4, c: 4, peek: 0, time: 75, swap: 0 } };

export function memory(A, { star, ease }) {
  const LV = NODE[A.node?.()?.id] || LEVEL[star] || LEVEL[1], N = LV.r * LV.c, PAIRS = N / 2;
  // 六種元素；4×4 多出的兩對用同元素的「金框」版本區分
  const kinds = [...Array(PAIRS).keys()].map(i => ({ k: i % 6, gold: i >= 6 }));
  const deck = kinds.flatMap(x => [x, x]).sort(() => Math.random() - 0.5).map(x => ({ ...x, open: 0, done: false }));
  const S = { time: LV.time + ease * 10, peek: LV.peek ? LV.peek + ease * 0.5 : 0, pick: [], wait: 0, got: 0, swapT: LV.swap, shake: new Map() };
  const info = () => A.info(A.t('secondsLeft', { n: Math.max(0, Math.ceil(S.time)) }));
  info();
  const box = () => { const a = A.lay.area, s = Math.min(a.w, a.h - 30); return { x: a.x + (a.w - s) / 2, y: a.y + (a.h - s) / 2, s }; };
  const cell = () => { const b = box(), z = Math.min(b.s / LV.c, b.s / LV.r); return { z, x: b.x + (b.s - z * LV.c) / 2, y: b.y + (b.s - z * LV.r) / 2 }; };
  const center = i => { const L = cell(); return [L.x + (i % LV.c + 0.5) * L.z, L.y + (((i / LV.c) | 0) + 0.5) * L.z]; };
  const at = (x, y) => { const L = cell(), c = Math.floor((x - L.x) / L.z), r = Math.floor((y - L.y) / L.z); return c >= 0 && c < LV.c && r >= 0 && r < LV.r ? r * LV.c + c : -1; };
  const same = (a, b) => a.k === b.k && a.gold === b.gold;

  function check() {
    const [i, j] = S.pick, a = deck[i], b = deck[j];
    if (same(a, b)) {
      a.done = b.done = true; S.got++;
      for (const k of [i, j]) { const [x, y] = center(k); A.shoot(x, y, A.TILE[a.k][0]); A.burst(x, y, A.TILE[a.k][0], 12, 150); }
      A.add(100 / PAIRS, true); A.sfx.hit(S.got); A.buzz(15);
      S.pick = [];
    } else {
      S.wait = 0.7; S.time -= 2; A.hurt(); info();
      for (const k of [i, j]) S.shake.set(k, 0.4);
    }
  }

  return {
    revive() { S.time += 15; info(); },
    deck,
    down(x, y) {
      if (S.peek > 0 || S.wait > 0) return;
      const i = at(x, y); if (i < 0) return;
      const c = deck[i]; if (c.done || S.pick.includes(i)) return;
      S.pick.push(i); A.sfx.dispel();
      if (S.pick.length === 2) check();
    },
    tick(dt) {
      for (const c of deck) c.open = Math.max(0, Math.min(1, c.open + ((c.done || S.peek > 0 || S.pick.includes(deck.indexOf(c))) ? dt : -dt) * 6));
      for (const [k, v] of S.shake) { if (v - dt <= 0) S.shake.delete(k); else S.shake.set(k, v - dt); }
      if (S.peek > 0) { S.peek -= dt; return; }
      if (S.wait > 0) { S.wait -= dt; if (S.wait <= 0) S.pick = []; }
      // 3 星：濁流偷偷換兩張還沒配對的牌
      if (LV.swap) {
        S.swapT -= dt;
        if (S.swapT <= 0) {
          S.swapT = LV.swap;
          const free = deck.map((c, i) => i).filter(i => !deck[i].done && !S.pick.includes(i));
          if (free.length >= 2) { const a = free.splice(Math.random() * free.length | 0, 1)[0], b = free[Math.random() * free.length | 0]; [deck[a], deck[b]] = [deck[b], deck[a]]; S.shake.set(a, 0.5); S.shake.set(b, 0.5); A.sfx.dispel(); }
        }
      }
      S.time -= dt; info();
      if (S.time <= 0 && A.pur < 99.99) A.lose();
    },
    draw() {
      const g = A.g, b = box(), L = cell(), T = A.time;
      g.fillStyle = 'rgba(8,14,26,.6)'; A.rr(b.x - 8, b.y - 8, b.s + 16, b.s + 16, 16); g.fill();
      deck.forEach((c, i) => {
        let [x, y] = center(i); const z = L.z * 0.84, sh = S.shake.get(i);
        if (sh) x += Math.sin(T * 60) * 4 * sh / 0.4;
        // 翻牌：寬度從 1 縮到 0 再展開，背面是濁流紋、正面是元素
        const f = c.open, w = Math.abs(Math.cos(f * Math.PI)) * z;
        g.save(); g.translate(x, y); g.scale(Math.max(0.04, w / z), 1);
        if (f < 0.5) {
          g.fillStyle = '#2a2142'; A.rr(-z / 2, -z / 2, z, z, z * 0.18); g.fill();
          g.strokeStyle = 'rgba(170,150,210,.55)'; g.lineWidth = 2; g.stroke();
          g.strokeStyle = 'rgba(170,150,210,.35)'; g.beginPath();
          for (const d of [-0.18, 0.12]) { g.moveTo(-z * 0.28, z * d); g.bezierCurveTo(-z * 0.1, z * (d - 0.14), z * 0.1, z * (d + 0.14), z * 0.28, z * d); }
          g.stroke();
        } else {
          A.tile(0, 0, z, c.k, { alpha: c.done ? 0.55 : 1 });
          if (c.gold) { g.strokeStyle = '#ffcf5a'; g.lineWidth = 3; A.rr(-z / 2 - 2, -z / 2 - 2, z + 4, z + 4, z * 0.2); g.stroke(); }
        }
        g.restore();
      });
      if (S.peek > 0) { g.fillStyle = '#ffd9a8'; g.font = '900 16px system-ui'; g.textAlign = 'center'; g.fillText(A.t('memPeek'), b.x + b.s / 2, b.y + b.s + 22); }
    },
  };
}
memory.key = 'memory';
