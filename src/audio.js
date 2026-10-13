// 以 WebAudio 即時合成的音效與環境音（不需要任何音檔）
let ctx = null, master = null, padGain = null, padNodes = [];
export let muted = false;

export function initAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
  // 環境音：D 調低音長音＋海浪雜訊
  padGain = ctx.createGain(); padGain.gain.value = 0.0; padGain.connect(master);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(padGain);
  for (const [f, g] of [[73.4, 0.5], [110, 0.3], [146.8, 0.22], [220.2, 0.12]]) {
    const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'sine'; o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 8;
    og.gain.value = g; o.connect(og); og.connect(lp); o.start(); padNodes.push(o);
  }
  const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const n = ctx.createBufferSource(); n.buffer = buf; n.loop = true;
  const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 500;
  const ng = ctx.createGain(); ng.gain.value = 0.18;
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.12; lg.gain.value = 0.12; lfo.connect(lg); lg.connect(ng.gain); lfo.start();
  n.connect(nf); nf.connect(ng); ng.connect(padGain); n.start();
  padGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 4);
}

export function setMuted(m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : 0.8, ctx.currentTime, 0.1); }

// 靈界越開，環境音越亮
export function setSpirit(s) {
  if (!ctx) return;
  padNodes.forEach((o, i) => o.detune.setTargetAtTime(i === 3 ? s * 400 : 0, ctx.currentTime, 2));
}

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
