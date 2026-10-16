// 畫符結印（豹門・敏捷）：照數字順序，一筆把光點連起來，畫成一道符就淨化一段；四道符完成即淨化
// 手指中途離開或連錯順序，這道符就散掉重畫；時間到就重來（下一次時間更多）
const RUNES = [
  [[.15, .7], [.38, .3], [.5, .62], [.62, .3], [.85, .7]],              // 山
  [[.1, .5], [.3, .3], [.5, .5], [.7, .7], [.9, .5]],                   // 水
  [[.5, .15], [.85, .8], [.15, .8], [.5, .15]],                         // 峰
  [[.2, .2], [.8, .2], [.8, .8], [.2, .8], [.2, .2]],                   // 印
  [[.5, .1], [.76, .86], [.1, .38], [.9, .38], [.24, .86], [.5, .1]],   // 星
  [[.5, .5], [.68, .38], [.72, .62], [.42, .74], [.26, .5], [.42, .24], [.84, .2]], // 漩
  [[.12, .6], [.28, .36], [.44, .6], [.6, .36], [.76, .6], [.9, .36], [.88, .78], [.12, .78]], // 雲
  [[.5, .12], [.28, .32], [.24, .76], [.76, .76], [.72, .32], [.5, .12], [.5, .9]],          // 鐘
];
// 星等：1 星三道簡單符；2 星四道（兩簡兩繁）；3 星四道繁符，光點還會飄動
const LEVEL = { 1: { n: 3, pick: [[0, 1, 2, 3]], time: 30, drift: 0 }, 2: { n: 4, pick: [[0, 1, 2, 3], [4, 5]], time: 32, drift: 0 }, 3: { n: 4, pick: [[4, 5, 6, 7]], time: 34, drift: 0.035 } };

export function sigil(A, { star, ease }) {
  const LV = LEVEL[star] || LEVEL[1], shuf = a => [...a].sort(() => Math.random() - 0.5);
  const order = (LV.pick.length > 1 ? shuf(LV.pick[0]).slice(0, 2).concat(shuf(LV.pick[1])) : shuf(LV.pick[0])).slice(0, LV.n);
  const NUM = order.length;
  const S = { time: LV.time + ease * 8, k: 0, rune: order[0], next: 0, trail: [], drawing: false, done: 0, fail: 0 };
  const info = () => A.info(A.t('secondsLeft', { n: Math.max(0, Math.ceil(S.time)) }));
  info();
  const box = () => { const a = A.lay.area, s = Math.min(a.w, a.h - 30); return { x: a.x + (a.w - s) / 2, y: a.y + (a.h - s) / 2, s }; };
  // 飄動以座標為相位，重複的同一點（起點＝終點）會一起動
  const pts = () => { const b = box(), T = A.time, d = LV.drift * b.s; return RUNES[S.rune].map(([u, v]) => [b.x + u * b.s + Math.sin(T * 1.3 + u * 7 + v * 11) * d, b.y + v * b.s + Math.cos(T * 1.1 + u * 13 + v * 5) * d]); };
  const R = () => Math.max(26, box().s * 0.085) * (A.perk('brush') ? 1.35 : 1);   // 詩人的毛筆：判定變寬

  function reset(fail) {
    S.next = 0; S.trail = []; S.drawing = false;
    if (fail) { S.fail = 0.4; A.sfx.deny(); }
  }
  function reach(x, y) {
    const p = pts();
    if (S.next < p.length && Math.hypot(x - p[S.next][0], y - p[S.next][1]) < R()) {
      S.next++; A.sfx.hit(S.next); A.buzz(8);
      if (S.next === p.length) complete();
    }
  }
  function complete() {
    const p = pts();
    for (const [x, y] of p) A.shoot(x, y, '#ffcf5a');
    A.add(100 / NUM, true); S.done = 0.7; A.burst(p[0][0], p[0][1], '#ffcf5a', 30, 220); A.sfx.purify();
    S.k++; S.drawing = false; S.trail = [];
    if (S.k < NUM) { S.rune = order[S.k]; S.next = 0; }
  }

  return {
    revive() { S.time += 10; info(); },
    S, pts, reach,
    busy: () => S.done > 0,
    down(x, y) {
      if (S.k >= NUM) return;
      const p = pts();
      if (Math.hypot(x - p[0][0], y - p[0][1]) < R()) { S.drawing = true; S.next = 0; S.trail = [[x, y]]; reach(x, y); }
      else { S.fail = 0.25; }
    },
    move(x, y) {
      if (!S.drawing) return;
      S.trail.push([x, y]); if (S.trail.length > 200) S.trail.shift();
      // 經過下一個以外的光點（順序錯）就散掉
      const p = pts();
      for (let i = S.next + 1; i < p.length; i++) {
        if (Math.hypot(x - p[i][0], y - p[i][1]) < R() * 0.7 && !(p[i][0] === p[S.next - 1]?.[0] && p[i][1] === p[S.next - 1]?.[1])) {
          const same = p.findIndex(q => q[0] === p[i][0] && q[1] === p[i][1]);
          if (same >= S.next - 1 && same < S.next) continue;
          return reset(true);
        }
      }
      reach(x, y);
    },
    up() { if (S.drawing && S.next < pts().length) reset(true); },
    tick(dt) {
      if (S.k < NUM) S.time -= dt;
      info();
      S.done = Math.max(0, S.done - dt); S.fail = Math.max(0, S.fail - dt);
      if (S.time <= 0 && A.pur < 99.99) A.lose();
    },
    draw() {
      const g = A.g, b = box(), T = A.time;
      g.fillStyle = 'rgba(8,14,26,.45)'; A.rr(b.x - 10, b.y - 10, b.s + 20, b.s + 20, 18); g.fill();
      if (S.k >= NUM) return;
      const p = pts(), r = R();
      // 符紋底線
      g.strokeStyle = 'rgba(127,232,255,.18)'; g.lineWidth = 10; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); p.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
      // 已連上的段
      g.strokeStyle = '#7fe8ff'; g.lineWidth = 8;
      g.beginPath(); p.slice(0, S.next).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
      if (S.drawing && S.trail.length) g.lineTo(...S.trail[S.trail.length - 1]);
      g.stroke();
      // 光點與順序
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 15px system-ui';
      // 同一個光點出現兩次（起點＝終點）就標「1·6」
      const spots = new Map();
      p.forEach(([x, y], i) => { const key = x + ',' + y; if (!spots.has(key)) spots.set(key, { x, y, ids: [] }); spots.get(key).ids.push(i); });
      for (const { x, y, ids } of spots.values()) {
        const lit = ids.every(i => i < S.next), nx = ids.includes(S.next);
        g.fillStyle = nx ? `rgba(127,232,255,${0.6 + 0.4 * Math.sin(T * 8)})` : lit ? '#ffcf5a' : 'rgba(127,232,255,.35)';
        g.beginPath(); g.arc(x, y, r * (nx ? 0.62 : 0.5), 0, 6.283); g.fill();
        if (nx) { g.strokeStyle = 'rgba(127,232,255,.6)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r * (0.8 + 0.2 * Math.sin(T * 6)), 0, 6.283); g.stroke(); }
        g.fillStyle = lit && !nx ? '#3a2300' : '#06263f'; g.fillText(ids.map(i => i + 1).join('·'), x, y);
      }
      if (S.fail) { g.strokeStyle = `rgba(255,107,107,${S.fail * 2})`; g.lineWidth = 4; A.rr(b.x - 10, b.y - 10, b.s + 20, b.s + 20, 18); g.stroke(); }
      // 進度：四道符
      for (let i = 0; i < NUM; i++) { g.fillStyle = i < S.k ? '#ffcf5a' : 'rgba(255,255,255,.2)'; g.beginPath(); g.arc(A.lay.area.x + A.lay.area.w / 2 + (i - (NUM - 1) / 2) * 22, b.y + b.s + 22, 6, 0, 6.283); g.fill(); }
    },
  };
}
sigil.key = 'sigil';
