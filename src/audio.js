// 音樂與音效：背景音樂是 Gemini Lyria 生成的管弦樂（audio/），海潮環境音與音效用 WebAudio 即時合成
let ctx = null, master = null, sea = null, foam = null, fx = null, verb = null, music = null, fight = null;
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

// 殘響：用衰減的雜訊當脈衝響應，讓音效像在大廳裡
function makeReverb(sec = 2.6) {
  const len = ctx.sampleRate * sec, buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  const cv = ctx.createConvolver(); cv.buffer = buf; return cv;
}

// 背景音樂：載入後無縫循環；跳過 MP3 編碼頭尾的空白
async function loadTrack(url) {
  const r = await fetch(url); if (!r.ok) throw new Error(url + ' ' + r.status);
  return await ctx.decodeAudioData(await r.arrayBuffer());
}
function startMusic() {
  music = { gain: ctx.createGain(), src: null, buf: null };
  music.gain.gain.value = 0; music.gain.connect(master);
  loadTrack('audio/bgm-loop.mp3').then(buf => {
    const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.loopStart = 0.06; s.loopEnd = buf.duration - 0.06;
    s.connect(music.gain); s.start(0, 0.06); music.src = s;
    music.gain.gain.setValueAtTime(0, ctx.currentTime); music.gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 3);
  }).catch(() => { });
}

// 只開音效通道（片頭用）：要在使用者點擊時呼叫，iOS 才放行
export function unlockAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : 0.8; master.connect(ctx.destination);
  // 音效匯流排：乾聲＋殘響
  fx = ctx.createGain(); fx.connect(master);
  verb = makeReverb(); const wet = ctx.createGain(); wet.gain.value = 0.32; fx.connect(verb); verb.connect(wet); wet.connect(master);
}
let started = false;
export function initAudio() {
  unlockAudio(); if (!ctx || started) return; started = true;
  foam = 1;
  sea = { brown: noiseBuffer(6, true), white: noiseBuffer(3, false), out: ctx.createGain() };
  sea.out.gain.value = 0; sea.out.connect(master);
  sea.out.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 4);
  // 遠浪底噪
  const bed = loop(sea.brown), blp = ctx.createBiquadFilter(), bg = ctx.createGain();
  blp.type = 'lowpass'; blp.frequency.value = 380; bg.gain.value = 0.22;
  bed.connect(blp); blp.connect(bg); bg.connect(sea.out);
  // 浪：先排兩道，之後每隔 6–10 秒再排下一道
  let next = ctx.currentTime + 0.5;
  const schedule = () => { while (next < ctx.currentTime + 12) { wave(next); next += 6 + Math.random() * 4; } };
  schedule(); setInterval(schedule, 3000);
  startMusic();
}

export function setMuted(m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : 0.8, ctx.currentTime, 0.1); }

// 靈界越開，浪花越亮
export function setSpirit(s) { foam = 1 + s * 0.8; }

// 基本音色
function env(g, t, a, peak, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
function tone(freq, dur, type = 'sine', vol = 0.2, delay = 0, out = fx) {
  if (!ctx) return;
  const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq; env(g, t, 0.008, vol, dur); o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
}
// 鋼片琴／鐘琴：基音＋高八度與第四泛音，快速衰減
function celesta(f, vol = 0.12, delay = 0) { tone(f, 1.2, 'sine', vol, delay); tone(f * 2, 0.6, 'sine', vol * 0.35, delay); tone(f * 4.07, 0.25, 'sine', vol * 0.12, delay); }
// 豎琴撥弦：Karplus-Strong（依頻率快取）
const plucks = new Map();
function pluckBuf(f) {
  const k = Math.round(f); if (plucks.has(k)) return plucks.get(k);
  const sr = ctx.sampleRate, len = Math.floor(sr * 2.2), buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0), p = Math.max(2, Math.round(sr / f));
  const ring = new Float32Array(p); for (let i = 0; i < p; i++) ring[i] = Math.random() * 2 - 1;
  let prev = 0;
  for (let i = 0; i < len; i++) { const j = i % p, v = ring[j]; const nv = 0.996 * 0.5 * (v + prev); prev = v; ring[j] = nv; d[i] = v; }
  plucks.set(k, buf); return buf;
}
function harp(f, vol = 0.22, delay = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + delay, s = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = pluckBuf(f); lp.type = 'lowpass'; lp.frequency.value = Math.min(9000, f * 6); g.gain.value = vol;
  s.connect(lp); lp.connect(g); g.connect(fx); s.start(t);
}
// 弦樂長音：微調的鋸齒波經低通，慢起慢收
function strings(freqs, dur = 2.5, vol = 0.05, delay = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + delay, lp = ctx.createBiquadFilter(), g = ctx.createGain();
  lp.type = 'lowpass'; lp.frequency.value = 1800; lp.Q.value = 0.3; lp.connect(g); g.connect(fx);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.35); g.gain.setTargetAtTime(0.0001, t + dur * 0.6, dur * 0.18);
  for (const f of freqs) for (const dt of [-7, 0, 6]) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = dt; o.connect(lp); o.start(t); o.stop(t + dur * 1.5);
  }
}

// D 大調五聲音階
const PENTA = [587.3, 659.3, 740, 880, 987.8, 1174.7, 1318.5];
let pickN = 0;
export const sfx = {
  // 撿到靈光：鋼片琴上行
  pick() { celesta(PENTA[pickN++ % 6], 0.11); },
  // 跳：豎琴兩音
  jump() { harp(440, 0.14); harp(587.3, 0.1, 0.05); },
  // 鐘聲：不諧和泛音、長尾音
  bell(base = 196) { for (const [m, v, d] of [[1, 0.2, 4], [2.76, 0.08, 2.5], [5.4, 0.04, 1.2], [0.5, 0.1, 5]]) tone(base * m, d, 'sine', v); strings([base * 2, base * 3], 3, 0.025); },
  // 感知：豎琴刮奏
  sense() { [293.7, 370, 440, 587.3, 740, 880, 1174.7].forEach((f, i) => harp(f, 0.13, i * 0.045)); },
  splash() {
    if (!ctx) return; const t = ctx.currentTime, s = loop(sea.white, t), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    bp.type = 'bandpass'; bp.frequency.setValueAtTime(1800, t); bp.frequency.exponentialRampToValueAtTime(500, t + 0.35); env(g, t, 0.01, 0.18, 0.4);
    s.connect(bp); bp.connect(g); g.connect(fx); s.stop(t + 0.5);
  },
  // 戰鬥：點中流眼（豎琴五聲，連擊往上爬）、驅散濁滴、被濁滴打中、淨化完成
  hit(n = 0) { harp(PENTA[n % 7] / 2, 0.18); celesta(PENTA[n % 7], 0.06, 0.02); },
  dispel() { harp(440, 0.1); },
  hurt() {
    harp(110, 0.22); harp(103.8, 0.2, 0.08);
    if (!ctx) return; const t = ctx.currentTime, s = loop(sea.white, t), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 500; env(g, t, 0.01, 0.15, 0.3); s.connect(lp); lp.connect(g); g.connect(fx); s.stop(t + 0.4);
  },
  purify() { [587.3, 740, 880, 1174.7, 1480].forEach((f, i) => celesta(f, 0.09, i * 0.07)); strings([293.7, 440, 587.3], 2.5, 0.04, 0.1); },
  // 片頭展開：氣聲往上掃開、弦樂和弦慢慢打開、豎琴往上刮奏，最後鋼片琴點亮——豁然開朗
  reveal() {
    if (!ctx) return;
    const t = ctx.currentTime, n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    n.buffer = noiseBuffer(2, false); bp.type = 'bandpass'; bp.Q.value = 0.8;
    bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(5000, t + 1.1);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.09, t + 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    n.connect(bp); bp.connect(g); g.connect(fx); n.start(t); n.stop(t + 1.6);
    strings([146.8, 220, 293.7, 370, 440], 3.2, 0.045);
    [293.7, 329.6, 370, 440, 493.9, 587.3, 659.3, 740, 880, 987.8, 1174.7].forEach((f, i) => harp(f, 0.11, 0.15 + i * 0.055));
    [1174.7, 1480, 1760].forEach((f, i) => celesta(f, 0.07, 0.85 + i * 0.12));
  },
  // 不行：低音撥弦兩下
  deny() { harp(146.8, 0.2); harp(138.6, 0.18, 0.14); },
  // 靈門開啟：豎琴刮奏＋弦樂和弦＋鐘
  gate() { this.sense(); strings([293.7, 370, 440, 587.3], 4, 0.05, 0.2); this.bell(146.8); },
  // 淨化之戰：探索配樂淡出，換成緊湊的戰鬥配樂；結束再換回來
  battle(on) {
    if (!ctx) return;
    const now = ctx.currentTime;
    if (music) music.gain.gain.setTargetAtTime(on ? 0 : 0.5, now, on ? 0.25 : 0.8);
    if (on) {
      if (!fight) { fight = { gain: ctx.createGain(), src: null }; fight.gain.gain.value = 0; fight.gain.connect(master); }
      const go = buf => { if (!fight.on) return; try { fight.src?.stop(); } catch { }
        const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.loopStart = 0.02; s.loopEnd = buf.duration - 0.02; s.connect(fight.gain); s.start(ctx.currentTime + 0.05, 0.02); fight.src = s;
        fight.gain.gain.cancelScheduledValues(ctx.currentTime); fight.gain.gain.setTargetAtTime(0.55, ctx.currentTime + 0.05, 0.3); };
      fight.on = true;
      if (fight.buf) go(fight.buf); else loadTrack('audio/battle-loop.mp3').then(b => { fight.buf = b; go(b); }).catch(() => { });
    } else if (fight) {
      fight.on = false; fight.gain.gain.setTargetAtTime(0, now, 0.4); const src = fight.src; fight.src = null; if (src) setTimeout(() => { try { src.stop(); } catch { } }, 2500);
    }
  },
  // 結局：背景音樂淡出，播放管弦樂結尾曲
  ending() {
    if (!ctx) return;
    if (music) music.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.6);
    loadTrack('audio/ending.mp3').then(buf => { const s = ctx.createBufferSource(), g = ctx.createGain(); g.gain.value = 0.75; s.buffer = buf; s.connect(g); g.connect(master); s.start(ctx.currentTime + 0.8); }).catch(() => { });
  },
};
