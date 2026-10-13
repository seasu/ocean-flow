// 現世：黑客松會場（北平東路30號）周邊的真實地點與定位
// 座標為事前估計值，請到現場用 ?calib 校正（存在這支手機的瀏覽器裡）
import { t, localize, DIRS as DIR_NAMES } from './i18n.js';

export const VENUE = { lat: 25.0456714, lng: 121.5258123 };

export const REAL = [
  { id: 'venue', name: '台北靈門', sub: '起點與終點・黑客松會場・北平東路30號', lat: 25.0456714, lng: 121.5258123, r: 60,
    text: '一切開始的地方。四道靈門依序開啟、四獸共鳴之後，回到這裡打開台北靈門。',
    en: {"name": "Taipei Spirit Gate", "sub": "Start and finish · Hackathon venue · No. 30, Beiping E. Rd.", "text": "Where it all begins. Open the four beast gates in order, let the four beasts resonate, then come back here to open the Taipei Spirit Gate."},
    ja: {"name": "台北霊門", "sub": "スタートとゴール・ハッカソン会場・北平東路30号", "text": "すべてが始まる場所。四つの霊門を順番に開き、四獣が共鳴したら、ここに戻って台北霊門を開こう。"} },
  { id: 'huashan', name: '華山1914', sub: '文化徑・產業文化遺跡（舊酒廠）・八德路一段', lat: 25.0441, lng: 121.52935, r: 70, node: 'elephant',
    text: '前身是日治時期的酒廠，紅磚廠房與老煙囪留了下來，現在是展覽、市集與表演的文創園區。',
    story: ['紅磚牆上，慢慢浮出一道長長的影子……是象鼻。', '象門守的是穩定與記憶。老酒廠的磚，記得這座城一百年的樣子。', '第一印，象。'],
    en: {"name": "Huashan 1914 Creative Park", "sub": "Culture Trail · Industrial heritage (old winery) · Bade Rd. Sec. 1", "text": "Once a Japanese-era winery. Its red-brick halls and old chimney remain, and it is now a creative park for exhibitions, markets and performances.", "story": ["On the red-brick wall, a long shadow slowly appears… an elephant's trunk.", "The Elephant Gate guards stability and memory. These old winery bricks remember a hundred years of this city.", "First seal: the Elephant."]},
    ja: {"name": "華山1914文創園区", "sub": "文化の道・産業文化遺産（旧酒工場）・八徳路一段", "text": "日本統治時代の酒工場の跡地。赤レンガの工場と古い煙突が残り、今は展示やマーケット、公演が行われる文化創意パークです。", "story": ["赤レンガの壁に、長い影がゆっくりと浮かび上がる……象の鼻だ。", "象門が守るのは安定と記憶。古い酒工場のレンガは、この街の百年を覚えている。", "第一の印、象。"]} },
  { id: 'qidong', name: '台灣文學基地', sub: '文化徑・城市歷史記憶・齊東詩舍', lat: 25.04245, lng: 121.5274, r: 60, node: 'tiger',
    text: '保留下來的日式宿舍群，現在是以詩與文學為主題的基地。巷弄安靜，適合慢慢走。',
    story: ['巷子裡有人在唸詩，唸到最後一句，突然大聲起來。', '虎門守的是行動與勇氣。把想說的話說出口，也是一種勇氣。', '第二印，虎。'],
    en: {"name": "Taiwan Literature Base", "sub": "Culture Trail · Historic city memory · Qidong Poetry Saloon", "text": "A preserved cluster of Japanese-era dormitories, now a base for poetry and literature. The lanes are quiet and good for a slow walk.", "story": ["Someone in the lane is reading a poem, and at the last line their voice suddenly rises.", "The Tiger Gate guards action and courage. Saying what you mean out loud is courage too.", "Second seal: the Tiger."]},
    ja: {"name": "台湾文学基地", "sub": "文化の道・街の歴史の記憶・齊東詩舎", "text": "保存された日本式宿舎群で、今は詩と文学をテーマにした拠点です。路地は静かで、ゆっくり歩くのに向いています。", "story": ["路地で誰かが詩を朗読している。最後の一行で、声が急に大きくなった。", "虎門が守るのは行動と勇気。言いたいことを声に出すのも、ひとつの勇気。", "第二の印、虎。"]} },
  { id: 'jinan', name: '濟南教會', sub: '文化徑・城市歷史記憶・中山南路', lat: 25.043, lng: 121.5204, r: 60, node: 'leopard',
    text: '紅磚砌成的哥德式教堂，是台北少見的日治時期教會建築古蹟。',
    story: ['屋頂上有東西輕輕跳過去……一閃而過的金色斑點。', '豹門守的是敏捷與感知。安靜下來，才看得見牠。', '第三印，豹。'],
    en: {"name": "Jinan Presbyterian Church", "sub": "Culture Trail · Historic city memory · Zhongshan S. Rd.", "text": "A red-brick Gothic church, one of Taipei's rare Japanese-era church buildings and a historic monument.", "story": ["Something leaps lightly across the roof… a flash of golden spots.", "The Leopard Gate guards agility and perception. Only when you are still can you see it.", "Third seal: the Leopard."]},
    ja: {"name": "済南教会", "sub": "文化の道・街の歴史の記憶・中山南路", "text": "赤レンガのゴシック様式の教会で、台北では珍しい日本統治時代の教会建築の古跡です。", "story": ["屋根の上を何かが軽やかに跳んでいった……一瞬だけ見えた金色の斑点。", "豹門が守るのは敏捷と感知。静かにしていると、その姿が見えてくる。", "第三の印、豹。"]} },
  { id: 'shandao', name: '善導寺', sub: '文化徑・城市歷史記憶・忠孝東路一段', lat: 25.0445, lng: 121.5234, r: 60, node: 'lion',
    text: '忠孝東路旁的佛寺，捷運善導寺站就是以它命名。',
    story: ['車聲裡，傳來一聲很深、很穩的低吼。', '獅門守的是威勢與領導。牠一直看著這座城市長大。', '第四印，獅。四獸，到齊了。'],
    en: {"name": "Shandao Temple", "sub": "Culture Trail · Historic city memory · Zhongxiao E. Rd. Sec. 1", "text": "A Buddhist temple beside Zhongxiao East Road; Shandao Temple MRT station is named after it.", "story": ["Through the traffic noise comes a deep, steady roar.", "The Lion Gate guards presence and leadership. It has watched this city grow up.", "Fourth seal: the Lion. The four beasts are complete."]},
    ja: {"name": "善導寺", "sub": "文化の道・街の歴史の記憶・忠孝東路一段", "text": "忠孝東路沿いのお寺で、MRT善導寺駅はこのお寺にちなんで名付けられました。", "story": ["車の音にまじって、深く落ち着いた唸り声が聞こえる。", "獅門が守るのは威厳と統率。この街が育っていくのを、ずっと見守ってきた。", "第四の印、獅子。四獣がそろった。"]} },
  { id: 'station', name: '台北車站', sub: '文化徑・城市歷史記憶・大廳與東側廣場', lat: 25.0478, lng: 121.517, r: 80,
    text: '全台最繁忙的交通樞紐，台鐵、高鐵與捷運在這裡交會，大廳的人潮從早到晚川流不息。',
    en: {"name": "Taipei Main Station", "sub": "Culture Trail · Historic city memory · Main hall and east plaza", "text": "Taiwan's busiest transport hub, where Taiwan Railway, High Speed Rail and the MRT meet. Crowds flow through the hall from morning to night."},
    ja: {"name": "台北駅", "sub": "文化の道・街の歴史の記憶・コンコースと東側広場", "text": "台湾でいちばん忙しい交通の要。台湾鉄道・高速鉄道・MRT が交わり、コンコースは朝から晩まで人が絶えません。"} },
  { id: 'controlyuan', name: '監察院古蹟', sub: '文化徑・城市歷史記憶・在人行道欣賞', lat: 25.04435, lng: 121.52125, r: 60,
    text: '日治時期的臺北州廳，紅磚牆與圓頂塔樓是路口最醒目的古蹟建築。請在人行道上欣賞。',
    en: {"name": "Control Yuan (historic building)", "sub": "Culture Trail · Historic city memory · View from the sidewalk", "text": "Built as the Taihoku Prefecture Hall in the Japanese era, its red-brick walls and domed tower stand out at the intersection. Please admire it from the sidewalk."},
    ja: {"name": "監察院（古跡）", "sub": "文化の道・街の歴史の記憶・歩道から鑑賞", "text": "日本統治時代の台北州庁。赤レンガの壁とドームの塔が交差点でひときわ目を引く古跡建築です。歩道から鑑賞してください。"} },
  { id: 'guanghua', name: '光華數位新天地', sub: '文化徑・城市生活・市民大道三段', lat: 25.04525, lng: 121.5324, r: 70,
    text: '台北的電子商場。早年是光華橋下的舊書攤與電子攤販，拆橋後搬進這棟大樓。',
    en: {"name": "Guanghua Digital Plaza", "sub": "Culture Trail · City life · Civic Blvd. Sec. 3", "text": "Taipei's electronics mall. It began as used-book stalls and electronics vendors under the old Guanghua Bridge, and moved into this building after the bridge came down."},
    ja: {"name": "光華数位新天地", "sub": "文化の道・街の暮らし・市民大道三段", "text": "台北の電気街ビル。かつて光華橋の下にあった古本屋や電子部品の露店が、橋の撤去後にこのビルへ移りました。"} },
];
localize(REAL);

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
export function dirName(a, b) { const [x, y] = offset(a, b); return DIR_NAMES[(Math.round(Math.atan2(x, y) / (Math.PI / 4)) + 8) % 8]; }

// 定位：真實 GPS，失敗時改用模擬（點地點就走過去）
export const geo = {
  pos: { ...VENUE }, acc: null, sim: true, watching: false, error: '', listeners: [],
  on(f) { this.listeners.push(f); },
  emit() { for (const f of this.listeners) f(this.pos); },
  start() {
    if (this.watching) return;
    if (!navigator.geolocation) { this.error = t('noGeo'); this.emit(); return; }
    this.watching = true;
    navigator.geolocation.watchPosition(p => {
      if (!this.sim) { this.pos = { lat: p.coords.latitude, lng: p.coords.longitude }; this.acc = p.coords.accuracy; }
      this.error = ''; this.real = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy };
      if (this.sim && !this.userSim) { this.sim = false; this.pos = { lat: this.real.lat, lng: this.real.lng }; this.acc = this.real.acc; }
      this.emit();
    }, e => {
      this.watching = false; this.sim = true;
      this.error = e.code === 1 ? t('geoDenied') : t('geoFail');
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
