// 以 WebAudio 即時合成的音效與海潮環境音（不需要任何音檔）
let ctx = null, master = null, sea = null, foam = null;
export let muted = false;

// 海潮音：低沉的遠浪底噪＋一波波湧上來又退下的浪（每 6–10 秒一波，彼此重疊）
function noiseBuffer(sec, brown) {
  const len = ctx.sampleRate * sec, buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c); let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
    }
  }
  return buf;
}
function loop(buf, when = 0) { const n = ctx.createBufferSource(); n.buffer = buf; n.loop = true; n.start(when, Math.random() * buf.duration); return n; }

function wave(t) {
  // 一道浪：先湧起（低頻變亮），浪頭碎開（白噪泡沫），再慢慢退去
  const rise = 2 + Math.random() * 1.5, fall = 3.5 + Math.random() * 2.5, peak = 0.5 + Math.random() * 0.4;
  const src = loop(sea.brown, t), lp = ctx.createBiquadFilter(), g = ctx.createGain(), pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  lp.type = 'lowpass'; lp.Q.value = 0.4;
  lp.frequency.setValueAtTime(250, t); lp.frequency.linearRampToValueAtTime(1100 + Math.random() * 500, t + rise); lp.frequency.exponentialRampToValueAtTime(280, t + rise + fall);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + rise); g.gain.exponentialRampToValueAtTime(0.0001, t + rise + fall);
  src.connect(lp); lp.connect(g);
  if (pan) { pan.pan.value = Math.random() * 1.2 - 0.6; g.connect(pan); pan.connect(sea.out); } else g.connect(sea.out);
  // 浪花：浪頭碎開時的沙沙聲
  const fs = loop(sea.white, t), hp = ctx.createBiquadFilter(), fg = ctx.createGain();
  hp.type = 'bandpass'; hp.frequency.value = 3000 + Math.random() * 1500; hp.Q.value = 0.6;
  const ft = t + rise * 0.85, fv = (0.05 + Math.random() * 0.04) * foam;
  fg.gain.setValueAtTime(0.0001, t); fg.gain.setValueAtTime(0.0001, ft); fg.gain.linearRampToValueAtTime(fv, ft + 0.35); fg.gain.exponentialRampToValueAtTime(0.0001, ft + fall * 0.8);
  fs.connect(hp); hp.connect(fg); fg.connect(pan || sea.out);
  const end = t + rise + fall + 0.2; src.stop(end); fs.stop(end);
}

export function initAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
  foam = 1;
  sea = { brown: noiseBuffer(6, true), white: noiseBuffer(3, false), out: ctx.createGain() };
  sea.out.gain.value = 0; sea.out.connect(master);
  sea.out.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 4);
  // 遠浪底噪
  const bed = loop(sea.brown), blp = ctx.createBiquadFilter(), bg = ctx.createGain();
  blp.type = 'lowpass'; blp.frequency.value = 380; bg.gain.value = 0.22;
  bed.connect(blp); blp.connect(bg); bg.connect(sea.out);
  // 浪：先排兩道，之後每隔 6–10 秒再排下一道
  let next = ctx.currentTime + 0.5;
  const schedule = () => { while (next < ctx.currentTime + 12) { wave(next); next += 6 + Math.random() * 4; } };
  schedule(); setInterval(schedule, 3000);
}

export function setMuted(m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : 0.8, ctx.currentTime, 0.1); }

// 靈界越開，浪花越亮
export function setSpirit(s) { foam = 1 + s * 0.8; }

function tone(freq, dur, type = 'sine', vol = 0.2, delay = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
}

const PENTA = [587.3, 659.3, 740, 880, 987.8, 1174.7];
let pickN = 0;
export const sfx = {
  pick() { const f = PENTA[pickN++ % PENTA.length]; tone(f, 0.5, 'sine', 0.16); tone(f * 2, 0.3, 'triangle', 0.05, 0.02); },
  jump() { if (!ctx) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(620, t + 0.12); g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.2); },
  // 鐘聲：不諧和泛音、長尾音
  bell(base = 196) { for (const [m, v, d] of [[1, 0.28, 4], [2.76, 0.12, 2.5], [5.4, 0.06, 1.2], [0.5, 0.15, 5]]) tone(base * m, d, 'sine', v); },
  sense() { [440, 554, 659, 880].forEach((f, i) => tone(f, 1.2, 'sine', 0.07, i * 0.06)); },
  splash() { tone(180, 0.25, 'triangle', 0.08); },
  deny() { tone(220, 0.2, 'square', 0.04); tone(196, 0.25, 'square', 0.04, 0.12); },
  gate() { [293.7, 370, 440, 587.3, 740, 880].forEach((f, i) => tone(f, 3, 'sine', 0.1, i * 0.12)); this.bell(146.8); },
};
