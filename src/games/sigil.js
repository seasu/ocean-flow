// 畫符結印（豹門・敏捷）：照數字順序，一筆把光點連起來，畫成一道符就淨化一段；四道符完成即淨化
// 手指中途離開或連錯順序，這道符就散掉重畫；時間到就重來（下一次時間更多）
const RUNES = [
  [[.15, .7], [.38, .3], [.5, .62], [.62, .3], [.85, .7]],              // 山
  [[.1, .5], [.3, .3], [.5, .5], [.7, .7], [.9, .5]],                   // 水
  [[.5, .15], [.85, .8], [.15, .8], [.5, .15]],                         // 峰
  [[.2, .2], [.8, .2], [.8, .8], [.2, .8], [.2, .2]],                   // 印
  [[.5, .1], [.76, .86], [.1, .38], [.9, .38], [.24, .86], [.5, .1]],   // 星
  [[.5, .5], [.68, .38], [.72, .62], [.42, .74], [.26, .5], [.42, .24], [.84, .2]], // 漩
];

export function sigil(A, { lv, ease }) {
  const order = [0, 1, 2, 3].sort(() => Math.random() - 0.5).slice(0, 2).concat([4, 5].sort(() => Math.random() - 0.5)).slice(0, 4);
  const S = { time: 30 + lv * 3 + ease * 8, k: 0, rune: order[0], next: 0, trail: [], drawing: false, done: 0, fail: 0 };
  const info = () => A.info(A.t('secondsLeft', { n: Math.max(0, Math.ceil(S.time)) }));
  info();
  const box = () => { const a = A.lay.area, s = Math.min(a.w, a.h - 30); return { x: a.x + (a.w - s) / 2, y: a.y + (a.h - s) / 2, s }; };
  const pts = () => { const b = box(); return RUNES[S.rune].map(([u, v]) => [b.x + u * b.s, b.y + v * b.s]); };
  const R = () => Math.max(26, box().s * 0.085);

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
    A.add(25); S.done = 0.7; A.burst(p[0][0], p[0][1], '#ffcf5a', 30, 220); A.sfx.purify();
    S.k++; S.drawing = false; S.trail = [];
    if (S.k < 4) { S.rune = order[S.k]; S.next = 0; }
  }

  return {
    S, pts, reach,
    busy: () => S.done > 0,
    down(x, y) {
      if (S.k >= 4) return;
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
      if (S.k < 4) S.time -= dt;
      info();
      S.done = Math.max(0, S.done - dt); S.fail = Math.max(0, S.fail - dt);
      if (S.time <= 0 && A.pur < 100) A.lose();
    },
    draw() {
      const g = A.g, b = box(), T = A.time;
      g.fillStyle = 'rgba(8,14,26,.45)'; A.rr(b.x - 10, b.y - 10, b.s + 20, b.s + 20, 18); g.fill();
      if (S.k >= 4) return;
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
      const seen = new Set();
      p.forEach(([x, y], i) => {
        const key = x + ',' + y; if (seen.has(key)) return; seen.add(key);
        const lit = i < S.next, nx = i === S.next;
        g.fillStyle = lit ? '#ffcf5a' : nx ? `rgba(127,232,255,${0.6 + 0.4 * Math.sin(T * 8)})` : 'rgba(127,232,255,.35)';
        g.beginPath(); g.arc(x, y, r * (nx ? 0.62 : 0.5), 0, 6.283); g.fill();
        if (nx) { g.strokeStyle = 'rgba(127,232,255,.6)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r * (0.8 + 0.2 * Math.sin(T * 6)), 0, 6.283); g.stroke(); }
        g.fillStyle = lit ? '#3a2300' : '#06263f'; g.fillText(String(i + 1), x, y);
      });
      if (S.fail) { g.strokeStyle = `rgba(255,107,107,${S.fail * 2})`; g.lineWidth = 4; A.rr(b.x - 10, b.y - 10, b.s + 20, b.s + 20, 18); g.stroke(); }
      // 進度：四道符
      for (let i = 0; i < 4; i++) { g.fillStyle = i < S.k ? '#ffcf5a' : 'rgba(255,255,255,.2)'; g.beginPath(); g.arc(A.lay.w / 2 + (i - 1.5) * 22, b.y + b.s + 22, 6, 0, 6.283); g.fill(); }
    },
  };
}
sigil.key = 'sigil';
sigil.bonus = lv => lv * 3;
