// 連點（虎門・爆發）：在時間內狂點，每一下都化成光打向濁流，偶爾會打出會心一擊
// 點擊會累積「爆發」，集滿就出現虎爪大招；守護獸也會自己定時出手（境界越高，幫得越多）
export function taphero(A, { lv, ease }) {
  const S = { time: 10 + lv * 2 + ease * 4, power: 0, combo: 0, comboT: 0, ripples: [], nums: [], claw: 0, pet: 1, taps: 0 };
  const DMG = 1.4, CRIT = 0.15, POWER = 0.05, CLAW = 14, PET = 1 + lv * 0.6;
  const info = () => A.info(A.t('secondsLeft', { n: Math.max(0, Math.ceil(S.time)) }));
  info();
  const btn = () => { const a = A.lay.area, r = Math.min(56, a.w * 0.16); return { x: a.x + a.w / 2, y: a.y + a.h * 0.42, r }; };

  function hit(x, y) {
    const crit = Math.random() < CRIT, mult = 1 + Math.min(S.combo, 20) * 0.02;
    const d = DMG * mult * (crit ? 3 : 1);
    A.add(d); A.shoot(x, y, crit ? '#ffcf5a' : '#7fe8ff');
    S.nums.push({ x, y, t: 0, s: crit ? A.t('crit') : '+' + d.toFixed(1), crit });
    S.ripples.push({ x, y, t: 0 });
    S.combo++; S.comboT = 0.6; S.taps++;
    S.power = Math.min(1, S.power + POWER);
    A.sfx.hit(Math.min(6, S.combo >> 2)); A.buzz(crit ? 25 : 8);
  }
  function claw() {
    S.power = 0; S.claw = 0.6; A.add(CLAW); A.shake(0.4);
    const a = A.lay.area;
    for (let i = 0; i < 3; i++) A.shoot(a.x + a.w * (0.3 + i * 0.2), a.y + a.h * 0.4, '#ffb35c');
    A.burst(btn().x, btn().y, '#ffb35c', 40, 300); A.sfx.purify(); A.buzz(60);
  }

  return {
    S, hit, claw, btn,
    down(x, y) {
      const a = A.lay.area; if (y < a.y - 20) return;
      const b = btn();
      if (S.power >= 1 && Math.hypot(x - b.x, y - b.y) < b.r + 10) return claw();
      hit(x, y);
    },
    tick(dt) {
      S.time -= dt; info();
      S.comboT -= dt; if (S.comboT <= 0) S.combo = 0;
      S.claw = Math.max(0, S.claw - dt);
      // 守護獸每秒出手一次
      S.pet -= dt;
      if (S.pet <= 0) { S.pet = 1; A.add(PET); A.shoot(A.lay.w / 2, A.lay.gy - 20, '#ffcf5a'); }
      for (const r of S.ripples) r.t += dt; S.ripples = S.ripples.filter(r => r.t < 0.4);
      for (const n of S.nums) n.t += dt; S.nums = S.nums.filter(n => n.t < 0.7);
      if (S.time <= 0 && A.pur < 100) A.lose();
    },
    draw() {
      const g = A.g, a = A.lay.area, b = btn(), T = A.time;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      // 點擊區
      g.fillStyle = 'rgba(8,14,26,.35)'; A.rr(a.x, a.y, a.w, a.h, 16); g.fill();
      g.strokeStyle = 'rgba(255,179,92,.25)'; g.lineWidth = 2; g.setLineDash([6, 8]); g.stroke(); g.setLineDash([]);
      // 爆發條
      const bw = a.w * 0.7, bx = a.x + (a.w - bw) / 2, by = a.y + a.h - 28;
      g.fillStyle = 'rgba(255,255,255,.1)'; A.rr(bx, by, bw, 10, 5); g.fill();
      g.fillStyle = S.power >= 1 ? `rgba(255,179,92,${0.7 + 0.3 * Math.sin(T * 10)})` : '#ffb35c'; A.rr(bx, by, bw * S.power, 10, 5); g.fill();
      g.fillStyle = '#ffd9a8'; g.font = '900 12px system-ui'; g.fillText(A.t('power'), a.x + a.w / 2, by - 12);
      // 虎爪大招按鈕／提示
      if (S.power >= 1) {
        const r = b.r * (1 + 0.08 * Math.sin(T * 8));
        g.fillStyle = '#ffb35c'; g.beginPath(); g.arc(b.x, b.y, r, 0, 6.283); g.fill();
        g.strokeStyle = '#fff3d6'; g.lineWidth = 3; g.stroke();
        g.fillStyle = '#3a2300'; g.font = `900 ${Math.round(r * 0.38)}px system-ui`; g.fillText(A.t('claw'), b.x, b.y);
      } else {
        g.fillStyle = 'rgba(255,217,168,.75)'; g.font = '900 20px system-ui'; g.fillText(A.t('tapFast'), b.x, b.y);
      }
      if (S.claw) { // 三道爪痕
        g.strokeStyle = `rgba(255,243,214,${S.claw / 0.6})`; g.lineWidth = 6;
        for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(A.lay.ex - 60 + i * 26, A.lay.ey - 50); g.lineTo(A.lay.ex + 40 + i * 26, A.lay.ey + 50); g.stroke(); }
      }
      for (const r of S.ripples) { g.strokeStyle = `rgba(127,232,255,${1 - r.t / 0.4})`; g.lineWidth = 3; g.beginPath(); g.arc(r.x, r.y, 10 + r.t * 90, 0, 6.283); g.stroke(); }
      for (const n of S.nums) { g.globalAlpha = 1 - n.t / 0.7; g.fillStyle = n.crit ? '#ffcf5a' : '#e8fbff'; g.font = `900 ${n.crit ? 22 : 16}px system-ui`; g.fillText(n.s, n.x, n.y - 20 - n.t * 50); }
      g.globalAlpha = 1;
      if (S.combo >= 5) { g.fillStyle = '#ffcf5a'; g.font = '900 18px system-ui'; g.fillText(A.t('battleCombo', { n: S.combo }), a.x + a.w / 2, a.y + 22); }
    },
  };
}
taphero.key = 'taphero';
taphero.bonus = lv => lv * 2;
