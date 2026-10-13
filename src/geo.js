// 現世：黑客松會場（北平東路30號）周邊的真實地點與定位
// 座標為事前估計值，請到現場用 ?calib 校正（存在這支手機的瀏覽器裡）
export const VENUE = { lat: 25.0456714, lng: 121.5258123 };

export const REAL = [
  { id: 'venue', name: '起源之門', sub: '黑客松會場・北平東路30號', lat: 25.0456714, lng: 121.5258123, r: 60,
    text: '一切開始的地方。三處靈脈都甦醒之後，回到這裡打開起源之門。' },
  { id: 'shandao', name: '善導寺', sub: '忠孝東路一段', lat: 25.0445, lng: 121.5234, r: 60, node: 'peak',
    text: '忠孝東路旁的佛寺，捷運善導寺站就是以它命名。',
    story: ['你聽見了嗎？鐘聲從大殿深處傳來，只有你聽得見。', '那是山之鐘聲。它一直在城市底下等你。'] },
  { id: 'huashan', name: '華山1914', sub: '文化創意產業園區・八德路一段', lat: 25.0441, lng: 121.52935, r: 70, node: 'city',
    text: '前身是日治時期的酒廠，紅磚廠房與老煙囪留了下來，現在是展覽、市集與表演的文創園區。',
    story: ['老廠房的牆裡，迴盪著一百年來這座城市的聲音。', '把耳朵貼近紅磚，城之回聲醒過來了。'] },
  { id: 'station', name: '台北車站', sub: '大廳與東側廣場', lat: 25.0478, lng: 121.517, r: 80, node: 'sea',
    text: '全台最繁忙的交通樞紐，台鐵、高鐵與捷運在這裡交會，大廳的人潮從早到晚川流不息。',
    story: ['你看，人群像洋流一樣流動。每個人身上，都有一道微光。', '海之流痕不只在海上，也在人與人之間。'] },
  { id: 'controlyuan', name: '監察院古蹟', sub: '忠孝東路與中山南路口・在人行道欣賞', lat: 25.04435, lng: 121.52125, r: 60,
    text: '日治時期的臺北州廳，紅磚牆與圓頂塔樓是路口最醒目的古蹟建築。請在人行道上欣賞。' },
  { id: 'qidong', name: '台灣文學基地', sub: '齊東詩舍・濟南路二段', lat: 25.04245, lng: 121.5274, r: 60,
    text: '保留下來的日式宿舍群，現在是以詩與文學為主題的基地。巷弄安靜，適合慢慢走。' },
  { id: 'jinan', name: '濟南教會', sub: '中山南路・紅磚教堂', lat: 25.043, lng: 121.5204, r: 60,
    text: '紅磚砌成的哥德式教堂，是台北少見的日治時期教會建築古蹟。' },
  { id: 'guanghua', name: '光華數位新天地', sub: '市民大道三段', lat: 25.04525, lng: 121.5324, r: 70,
    text: '台北的電子商場。早年是光華橋下的舊書攤與電子攤販，拆橋後搬進這棟大樓。' },
];

const KEY = 'oceanflow.spots';
try {
  const o = JSON.parse(localStorage.getItem(KEY) || '{}');
  for (const s of REAL) if (o[s.id]) [s.lat, s.lng] = o[s.id];
} catch { }
export function saveSpot(s) {
  try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); o[s.id] = [s.lat, s.lng]; localStorage.setItem(KEY, JSON.stringify(o)); } catch { }
}

export function meters(a, b) {
  const R = 6371000, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
// 以 a 為原點的平面座標（公尺，東為 +x、北為 +y）
export function offset(a, b) {
  return [(b.lng - a.lng) * Math.cos(a.lat * Math.PI / 180) * 111320, (b.lat - a.lat) * 110540];
}
const DIRS = ['北', '東北', '東', '東南', '南', '西南', '西', '西北'];
export function dirName(a, b) { const [x, y] = offset(a, b); return DIRS[(Math.round(Math.atan2(x, y) / (Math.PI / 4)) + 8) % 8]; }

// 定位：真實 GPS，失敗時改用模擬（點地點就走過去）
export const geo = {
  pos: { ...VENUE }, acc: null, sim: true, watching: false, error: '', listeners: [],
  on(f) { this.listeners.push(f); },
  emit() { for (const f of this.listeners) f(this.pos); },
  start() {
    if (this.watching) return;
    if (!navigator.geolocation) { this.error = '這個瀏覽器不支援定位'; this.emit(); return; }
    this.watching = true;
    navigator.geolocation.watchPosition(p => {
      if (!this.sim) { this.pos = { lat: p.coords.latitude, lng: p.coords.longitude }; this.acc = p.coords.accuracy; }
      this.error = ''; this.real = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy };
      if (this.sim && !this.userSim) { this.sim = false; this.pos = { lat: this.real.lat, lng: this.real.lng }; this.acc = this.real.acc; }
      this.emit();
    }, e => {
      this.watching = false; this.sim = true;
      this.error = e.code === 1 ? '沒有定位權限，已改用模擬定位' : '暫時抓不到定位，已改用模擬定位';
      this.emit();
    }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
  },
  setSim(on) { this.sim = on; this.userSim = on; if (!on && this.real) { this.pos = { lat: this.real.lat, lng: this.real.lng }; this.acc = this.real.acc; } this.emit(); },
  // 模擬模式：用 1.5 秒走到目標
  walkTo(t) {
    const from = { ...this.pos }, t0 = performance.now();
    const step = now => {
      const u = Math.min(1, (now - t0) / 1500), e = u * u * (3 - 2 * u);
      this.pos = { lat: from.lat + (t.lat - from.lat) * e, lng: from.lng + (t.lng - from.lng) * e }; this.acc = null; this.emit();
      if (u < 1 && this.sim) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },
};
