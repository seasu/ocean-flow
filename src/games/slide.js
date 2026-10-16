// 滑塊拼圖（再春游泳池與明治橋・賓士貓）：明治橋被切成 435 塊，濁流把景點照片也打散了
// 開場先看一眼完整的照片，接著被打亂；點空格旁邊（同一排或同一列）的塊就滑過去，拼回原圖就淨化
// 每多一塊回到正確位置就有光打向濁流。星等：1 星 3×3 打亂 24 步、2 星 3×3 打亂 50 步、3 星 4×4 打亂 70 步
const LEVEL = { 1: { n: 3, mix: 24, time: 70 }, 2: { n: 3, mix: 50, time: 80 }, 3: { n: 4, mix: 70, time: 130 } };

export function slide(A, { star, ease }) {
  const LV = LEVEL[star] || LEVEL[1], N = LV.n, NN = N * N;
  const node = A.node(), img = new Image();
  img.src = node.photo || `img/stamps/${node.id}.jpg`;
  // board[位置] = 塊的編號；NN-1 是空格
  const board = [...Array(NN).keys()];
  const S = { time: LV.time + ease * 20, peek: 1.6, best: 0, anim: new Map(), solved: false };
  const info = () => A.info(A.t('secondsLeft', { n: Math.max(0, Math.ceil(S.time)) }));
  info();
  const nbs = p => { const r = (p / N) | 0, c = p % N, o = []; if (r) o.push(p - N); if (r < N - 1) o.push(p + N); if (c) o.push(p - 1); if (c < N - 1) o.push(p + 1); return o; };
  // 從完成的樣子隨機走 mix 步打亂（一定解得開），不走回頭路
  let blank = NN - 1, prev = -1;
  for (let k = 0; k < LV.mix - ease * 8 || board.every((v, i) => v === i); k++) {
    const opts = nbs(blank).filter(p => p !== prev), p = opts[Math.random() * opts.length | 0];
    [board[blank], board[p]] = [board[p], board[blank]]; prev = blank; blank = p;
  }
  const correct = () => board.filter((v, i) => v === i && v !== NN - 1).length;
  S.best = correct();
  A.add(S.best * 100 / (NN - 1) * 0.5, true);   // 本來就在位置上的塊算一半
  const box = () => { const a = A.lay.area, s = Math.min(a.w, a.h - 30); return { x: a.x + (a.w - s) / 2, y: a.y + (a.h - s) / 2, s }; };
  const at = (x, y) => { const b = box(), z = b.s / N, c = Math.floor((x - b.x) / z), r = Math.floor((y - b.y) / z); return c >= 0 && c < N && r >= 0 && r < N ? r * N + c : -1; };

  function move(p) {
    const b = board.indexOf(NN - 1), pr = (p / N) | 0, pc = p % N, br = (b / N) | 0, bc = b % N;
    if (p === b || (pr !== br && pc !== bc)) { A.sfx.deny(); return; }
    // 同一排／列：中間的塊一起往空格推
    const step = pr === br ? (pc > bc ? 1 : -1) : (pr > br ? N : -N);
    for (let q = b; q !== p; q += step) { board[q] = board[q + step]; S.anim.set(q, { from: q + step, t: 1 }); }
    board[p] = NN - 1;
    A.sfx.dispel(); A.buzz(6);
    const now = correct();
    if (now > S.best) {
      const bx = box(), z = bx.s / N;
      A.add((now - S.best) * 100 / (NN - 1) * 0.5, true); S.best = now;
      A.shoot(bx.x + (b % N + 0.5) * z, bx.y + (((b / N) | 0) + 0.5) * z, '#7fe8ff'); A.sfx.hit(now);
    }
    if (board.every((v, i) => v === i)) { S.solved = true; A.burst(box().x + box().s / 2, box().y + box().s / 2, '#ffcf5a', 40, 260); A.add(100, true); }
  }

  return {
    revive() { S.time += 30; info(); },
    board, move,
    down(x, y) { if (S.peek > 0 || S.solved) return; const p = at(x, y); if (p >= 0) move(p); },
    tick(dt) {
      for (const [k, a] of S.anim) { a.t -= dt * 8; if (a.t <= 0) S.anim.delete(k); }
      if (S.peek > 0) { S.peek -= dt; return; }
      if (S.solved) return;
      S.time -= dt; info();
      if (S.time <= 0 && A.pur < 99.99) A.lose();
    },
    draw() {
      const g = A.g, b = box(), z = b.s / N, ok = img.complete && img.naturalWidth;
      g.fillStyle = 'rgba(8,14,26,.6)'; A.rr(b.x - 8, b.y - 8, b.s + 16, b.s + 16, 16); g.fill();
      // 照片裁成正方形
      const iw = ok ? img.naturalWidth : 1, ih = ok ? img.naturalHeight : 1, sq = Math.min(iw, ih), ox = (iw - sq) / 2, oy = (ih - sq) / 2, u = sq / N;
      const piece = (v, x, y, w) => {
        if (ok) g.drawImage(img, ox + (v % N) * u, oy + ((v / N) | 0) * u, u, u, x, y, w, w);
        else { g.fillStyle = A.TILE[v % 6][0]; g.fillRect(x, y, w, w); }
      };
      if (S.peek > 0 || S.solved) {
        g.save(); A.rr(b.x, b.y, b.s, b.s, 12); g.clip();
        if (ok) g.drawImage(img, ox, oy, sq, sq, b.x, b.y, b.s, b.s); g.restore();
        if (S.peek > 0) { g.fillStyle = '#ffd9a8'; g.font = '900 16px system-ui'; g.textAlign = 'center'; g.fillText(A.t('slidePeek'), b.x + b.s / 2, b.y + b.s + 22); }
        return;
      }
      for (let p = 0; p < NN; p++) {
        const v = board[p]; if (v === NN - 1) continue;
        const an = S.anim.get(p), from = an ? an.from : p, k = an ? an.t : 0;
        const x = b.x + ((p % N) * (1 - k) + (from % N) * k) * z, y = b.y + ((((p / N) | 0)) * (1 - k) + ((from / N) | 0) * k) * z;
        g.save(); A.rr(x + 2, y + 2, z - 4, z - 4, 8); g.clip(); piece(v, x + 2, y + 2, z - 4); g.restore();
        g.strokeStyle = v === p ? 'rgba(255,207,90,.8)' : 'rgba(255,255,255,.35)'; g.lineWidth = v === p ? 2.5 : 1.5; A.rr(x + 2, y + 2, z - 4, z - 4, 8); g.stroke();
      }
    },
  };
}
slide.key = 'slide';
