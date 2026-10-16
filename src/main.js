// 《洋流：起源》mobile web prototype：主迴圈、操作、任務流程
import { M, clamp, lerp, rng, hex, mixColor, smooth } from './math.js';
import { Renderer, Builder } from './gl.js';
import { makeWorld, terrainMesh, waterData, floatMesh, gateMesh, nodeMesh, portalMesh, bellMesh, beastMesh, bossMesh, N, S, WATER, T, PLACES, CURRENT, curX } from './world.js';
import { drawAvatar2, liuPal, XI2 } from './avatar2.js';
import { initAudio, unlockAudio, sfx, setMuted, muted, setSpirit } from './audio.js';
import { REAL, geo, meters, offset, dirName, saveSpot } from './geo.js';
import { TALES } from './stories.js';
import { t, lang, localize, applyStatic, DIRS } from './i18n.js';
import { roar } from './roar.js';
import { ascend } from './ascend.js';
import { battle, replayVictory, MODS } from './battle.js';
import { ITEMS, ITEM_OF, itemSVG } from './items.js';
import { openCharLab } from './charlab.js';
import { openLore, openRealms, openCast, CH } from './lore.js';
import { VERSION } from './version.js';
import { realmVox, REALM_COL } from './realmicon.js';

applyStatic();

const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const canvas = $('#c');
let r;
try { r = new Renderer(canvas); } catch (e) { $('#title .start').textContent = t('noGL'); throw e; }

// ---------- 世界 ----------
const world = makeWorld(7);
const terrain = r.mesh(terrainMesh(world));
const water = r.waterMesh(waterData(world));
const floats = r.mesh(floatMesh());
const gateM = r.mesh(gateMesh());
const bell = r.mesh(bellMesh());
const ground = (x, z) => world.height(x, z);
const at = ([x, z]) => [x + 0.5, ground(x + 0.5, z + 0.5), z + 0.5];

// 第一階：四獸靈門（象→虎→豹→獅，依序開啟）；第二階的三處靈脈先放在島上預告
const SHOUSHAN = t('shoushan');
const NODES = [
  { id: 'elephant', stage: 1, star: 1, name: '象門', hill: '象山', seal: '第一印', virtue: '穩定・記憶・承載', icon: '🐘', hint: '最靠近 101 的山', pos: at(PLACES.elephant), col: hex('#cfe3ff'), bell: 146.8,
    info: '海拔 183 公尺，是看台北 101 和城市夜景最熱門的步道。山頂有幾塊大石頭，很多人坐在上面等夕陽。',
    en: { name: 'Elephant Gate', hill: 'Elephant Mountain', seal: 'First Seal', virtue: 'Stability · Memory · Bearing', hint: 'The hill closest to 101',
      info: 'At 183 m, its trail is the most popular spot for views of Taipei 101 and the city at night. Big boulders sit on the summit, where many people wait for the sunset.' },
    ja: { name: '象門', hill: '象山', seal: '第一の印', virtue: '安定・記憶・支え', hint: '101 にいちばん近い山',
      info: '標高 183 m。台北101と夜景を眺める一番人気の遊歩道です。山頂の大きな岩に座って夕日を待つ人がたくさんいます。' } },
  { id: 'tiger', stage: 1, star: 1, name: '虎門', hill: '虎山', seal: '第二印', virtue: '行動・勇氣・爆發', icon: '🐯', hint: '101 東北邊的山', pos: at(PLACES.tiger), col: hex('#ffb35c'), bell: 196,
    info: '四獸山最北的一座。虎山自然步道沿著溪谷走，林蔭濃密，是觀察青蛙、蝴蝶等生態的好地方。',
    en: { name: 'Tiger Gate', hill: 'Tiger Mountain', seal: 'Second Seal', virtue: 'Action · Courage · Power', hint: 'The hill northeast of 101',
      info: 'The northernmost of the four. The Tiger Mountain nature trail follows a shady stream valley, a great place to spot frogs and butterflies.' },
    ja: { name: '虎門', hill: '虎山', seal: '第二の印', virtue: '行動・勇気・爆発', hint: '101 の北東の山',
      info: '四獣山でいちばん北の山。虎山自然遊歩道は渓谷沿いの木陰の道で、カエルや蝶など生き物の観察にぴったりです。' } },
  { id: 'leopard', stage: 1, star: 2, name: '豹門', hill: '豹山', seal: '第三印', virtue: '敏捷・感知・身法', icon: '🐆', hint: '虎山南邊的山', pos: at(PLACES.leopard), col: hex('#ffd76a'), bell: 220,
    info: '四獸山裡比較少人知道、也比較安靜的一座，山徑和虎山、獅山相連，適合慢慢走。',
    en: { name: 'Leopard Gate', hill: 'Leopard Mountain', seal: 'Third Seal', virtue: 'Agility · Perception · Movement', hint: 'The hill south of Tiger Mountain',
      info: 'The quietest and least-known of the four. Its paths connect to Tiger and Lion Mountains and are best walked slowly.' },
    ja: { name: '豹門', hill: '豹山', seal: '第三の印', virtue: '敏捷・感知・身のこなし', hint: '虎山の南の山',
      info: '四獣山の中であまり知られていない、静かな山。虎山・獅山へ道がつながっていて、ゆっくり歩くのに向いています。' } },
  { id: 'lion', stage: 1, star: 2, name: '獅門', hill: '獅山', seal: '第四印', virtue: '威勢・領導・氣運', icon: '🦁', hint: '豹山西南邊的山', pos: at(PLACES.lion), col: hex('#ffc58a'), bell: 174.6,
    info: '山形像一頭伏臥的獅子。走在步道上，可以從樹梢間望見信義區的城市天際線。',
    en: { name: 'Lion Gate', hill: 'Lion Mountain', seal: 'Fourth Seal', virtue: 'Presence · Leadership · Fortune', hint: 'The hill southwest of Leopard Mountain',
      info: 'Shaped like a lion lying down. From the trail you can see the Xinyi skyline through the treetops.' },
    ja: { name: '獅門', hill: '獅山', seal: '第四の印', virtue: '威厳・統率・気運', hint: '豹山の南西の山',
      info: '伏せた獅子のような山の形。遊歩道からは木々の間に信義区のスカイラインが見えます。' } },
  // 第二階：城海山三流（3 星），四獸共鳴後開放、要化流境以上，不分順序
  { id: 'city', stage: 2, star: 3, name: '城之回聲', hill: '台北城', seal: '城流', virtue: '人聲・節奏・匯聚', icon: '🏙', pos: at(PLACES.city), col: hex('#8fd3ff'), bell: 261.6,
    info: '城市也有自己的流：車站的人潮、捷運的節奏、街角的叫賣聲。聽得見城市的回聲，就聽得見每個人走過的路。',
    en: { name: 'Echo of the City', hill: 'Taipei City', seal: 'City Flow', virtue: 'Voices · Rhythm · Gathering',
      info: 'The city has its own flow: crowds at the station, the rhythm of the MRT, vendors calling on street corners. Hear the city\'s echo and you hear the paths everyone has walked.' },
    ja: { name: '街のこだま', hill: '台北の街', seal: '街の流れ', virtue: '人の声・リズム・集まり',
      info: '街にも流れがある。駅の人波、MRT のリズム、街角の呼び声。街のこだまが聞こえれば、みんなが歩いた道が聞こえる。' } },
  { id: 'sea', stage: 2, star: 3, name: '海之流痕', hill: '龜山島', seal: '海流', virtue: '潮汐・遠方・連結', icon: '🌊', pos: at(PLACES.sea), col: hex('#5fd3e6'), bell: 293.7,
    info: '黑潮從菲律賓北上，貼著台灣東岸流過，帶來溫暖的海水和豐富的漁場。龜山島就在它經過的地方。',
    en: { name: 'Trace of the Sea', hill: 'Guishan Island', seal: 'Sea Flow', virtue: 'Tides · Distance · Connection',
      info: 'The Kuroshio Current flows north from the Philippines along Taiwan\'s east coast, bringing warm water and rich fishing grounds. Guishan Island sits right in its path.' },
    ja: { name: '海の流れ痕', hill: '亀山島', seal: '海の流れ', virtue: '潮・遠く・つながり',
      info: '黒潮はフィリピンから北上し、台湾の東岸に沿って流れ、暖かい海と豊かな漁場をもたらす。亀山島はその通り道にある。' } },
  { id: 'peak', stage: 2, star: 3, name: '山之鐘聲', hill: '玉山', seal: '山流', virtue: '高度・寂靜・回響', icon: '⛰', pos: at(PLACES.peak), col: hex('#c7d6e8'), bell: 220,
    info: '玉山海拔 3952 公尺，是東北亞最高峰。山上的寂靜裡，連風聲都像鐘聲一樣傳得很遠。',
    en: { name: 'Bell of the Mountain', hill: 'Yushan', seal: 'Mountain Flow', virtue: 'Height · Stillness · Resonance',
      info: 'At 3,952 m, Yushan is the highest peak in Northeast Asia. In its stillness even the wind carries far, like a bell.' },
    ja: { name: '山の鐘の音', hill: '玉山', seal: '山の流れ', virtue: '高さ・静けさ・響き',
      info: '玉山は標高 3952 m、北東アジアの最高峰。山の静けさの中では、風の音さえ鐘のように遠くまで届く。' } },
];
localize(NODES);
const S1 = NODES.filter(n => n.stage === 1), S2 = NODES.filter(n => n.stage === 2);
// 守門獸圖（img/beasts/）：四獸山，加上第三階三流的龍、龜、熊
const BEAST_IMG = { elephant: 'elephant', tiger: 'tiger', leopard: 'leopard', lion: 'lion', city: 'dragon', sea: 'turtle', peak: 'bear' };
const REQ = 2;
const NEAR_R = 300;   // 主畫面提醒附近景點的距離（公尺）   // 第二階需要的境界（化流境）
const stage1Done = () => S1.every(n => n.awake);
// 第二階：台北城市故事（只在現世模式；島上模式直接跳過）
for (const s of TALES) REAL.push(s);
const talesDone = () => TALES.every(s => visited.has(s.id));
// 靈界走走：七個城市故事也放進靈界的台北一帶（位置依真實方位簡化），走過去就能讀故事
{
  const WANT = { shipai: [58, 22], cihcheng: [62, 24], baoan: [58, 28], zaichun: [60, 32], wanhua: [55, 35], xinzhuang: [50, 33], wufenpu: [71, 33] };
  for (const s of TALES) {
    const [wx, wz] = (WANT[s.id] || [60, 30]).map(v => Math.round(v * S)); let best = null, bd = 1e9;
    for (let z = wz - 12; z <= wz + 12; z++) for (let x = wx - 12; x <= wx + 12; x++) {
      const k = world.K[z * N + x]; if (k == null || k === T.SEA || k === T.BUILDING || k === T.TOWER) continue;
      const d = Math.hypot(x - wx, z - wz); if (d < bd) { bd = d; best = [x, z]; }
    }
    s.ipos = [best[0] + 0.5, 0, best[1] + 0.5];
  }
}
const talesStage = () => stage1Done() && !talesDone();
const shown = s => !s.tale || stage1Done();
const placeOf = n => REAL.find(r => r.node === n.id).name;
const nextGate = () => S1.find(n => !n.awake) || (talesDone() ? S2.find(n => !n.awake) : null);
// 這一處現在能不能開：第一階要依序；第二階要四獸共鳴之後、而且境界夠
const canOpen = n => n.stage === 1 ? n === S1.find(m => !m.awake) : stage1Done() && talesDone() && G.realm >= REQ;
for (const n of NODES) {
  n.mesh = r.mesh(nodeMesh(n.id)); n.awake = false; n.charge = 0; n.vein = null; n.flash = 0;
  if (n.stage === 1) { n.beast = r.mesh(beastMesh(n.id)); n.face = Math.atan2(PLACES.spawn[0] - n.pos[0], PLACES.spawn[1] - n.pos[2]) + Math.PI; }
}
const GATE = at(PLACES.gate);

// 序章就是這座島；海的盡頭放著後面七章的入口（鎖著），圖示和世界觀頁同一套
// 方位：流域在北、星航在東北的天上、連界在東、歸源在黑潮底下、新生在東南、萬象在南、無界在最遠的角落
const HS = 1 + (S - 1) * 0.5;
const CHAPS = [
  { i: 1, x: 64 * S, z: 5 * S, col: '#7fe8ff' },
  { i: 2, x: 123 * S, z: 56 * S, col: '#ffd27a' },
  { i: 3, x: 106 * S, z: 14 * S, y: 34 * HS, col: '#c9a8ff' },
  { i: 4, x: 64 * S, z: 123 * S, col: '#9ef0a8' },
  { i: 5, x: Math.round(curX(84 * S)), z: 84 * S, y: WATER - 5, col: '#5fd3e6' },
  { i: 6, x: 118 * S, z: 104 * S, col: '#ffb3c7' },
  { i: 7, x: 124 * S, z: 124 * S, col: '#ffffff' },
].map(c => ({ ...c, y: c.y ?? WATER - 0.2, mesh: r.mesh(portalMesh(hex(c.col))), no: CH[c.i].no[lang === 'en' ? 1 : lang === 'ja' ? 2 : 0], name: CH[c.i].name[lang === 'en' ? 1 : lang === 'ja' ? 2 : 0] }));
const chapEl = document.createElement('div'); chapEl.id = 'chaps';
chapEl.innerHTML = CHAPS.map(c => `<button data-i="${c.i}" style="--c:${c.col}"><img src="img/lore/ch${c.i}.jpg" alt=""><span><small>${c.no}</small><b>${c.name}</b></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></button>`).join('');
$('#tag').before(chapEl);
for (const c of CHAPS) c.el = chapEl.querySelector(`[data-i="${c.i}"]`);
chapEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { e.stopPropagation(); openLore(+b.dataset.i); } });
const chapImg = CHAPS.map(c => { const im = new Image(); im.src = `img/lore/ch${c.i}.jpg`; return im; });

// 靈光：散在城市、洋流上、山坡與各地
const motes = [];
{
  const R = rng(3), K = world.K;
  const pick = (test, n) => {
    let tries = 0;
    while (n > 0 && tries++ < 4000) {
      const x = 2 + Math.floor(R() * (N - 4)), z = 2 + Math.floor(R() * (N - 4)), k = K[z * N + x], h = world.H[z * N + x];
      if (!test(x, z, k, h)) continue;
      if (motes.some(m => Math.hypot(m.x - x, m.z - z) < 6 * S)) continue;
      motes.push({ x: x + 0.5, z: z + 0.5, y: h + 1.1, ph: R() * 6, taken: false }); n--;
    }
  };
  // 島變大，靈光也跟著多一些（約 S 的一半倍數），走起來不會空
  const more = n => Math.round(n * (1 + S) / 2);
  pick((x, z, k) => k === T.ROAD, more(6));
  for (let z = 30 * S; z <= 100 * S; z += 24 * S / (1 + S)) motes.push({ x: curX(z), z, y: WATER + 0.8, ph: R() * 6, taken: false });
  pick((x, z, k, h) => h >= 8 && k !== T.BUILDING && k !== T.TOWER, more(8));
  pick((x, z, k, h) => world.land[z * N + x] && k !== T.BUILDING && k !== T.TOWER && h >= 3, more(10));
}
// 濁影：被濁流附身的守門獸影子，在靈界地圖上遊蕩；靠近會追上來，碰到就開戰（贏 +靈光、輸 −靈光）
const WILD_KINDS = ['tiger', 'leopard', 'lion', 'elephant'], WILD_N = 5, WILD_GAIN = 2, WILD_LOSS = 2;
const bossM = r.mesh(bossMesh());
const wildMesh = Object.fromEntries(WILD_KINDS.map(k => [k, r.mesh(beastMesh(k))]));
const wilds = [];
const wildR = rng(11);
function placeWild(w, kind) {
  for (let i = 0; i < 400; i++) {
    const x = 3 + Math.floor(wildR() * (N - 6)), z = 3 + Math.floor(wildR() * (N - 6)), k = world.K[z * N + x], h = world.H[z * N + x];
    if (!world.land[z * N + x] || k === T.BUILDING || k === T.TOWER || h < 1.5) continue;
    if (Math.hypot(x - PLACES.spawn[0], z - PLACES.spawn[1]) < 14 * S) continue;
    if (NODES.some(n => Math.hypot(n.pos[0] - x, n.pos[2] - z) < 8)) continue;
    if (wilds.some(o => o !== w && Math.hypot(o.x - x, o.z - z) < 14 * S)) continue;
    Object.assign(w, { x: x + 0.5, z: z + 0.5, hx: x + 0.5, hz: z + 0.5, kind: kind || WILD_KINDS[Math.floor(wildR() * WILD_KINDS.length)], yaw: wildR() * 6.28, gone: 0, chase: false });
    return;
  }
}
for (let i = 0; i < WILD_N; i++) { const w = {}; wilds.push(w); placeWild(w, WILD_KINDS[i % WILD_KINDS.length]); }
const COST = 3;

// 台灣之美：走近就會收進圖鑑（內容為真實地景的簡介）
const SPOTS = [
  { id: '101', name: '台北 101', area: '台北・Taipei 101', pos: [Math.round(67 * S), Math.round(30 * S)], r: 8, text: '高 508 公尺，2004 年完工，曾是世界最高的大樓。外型取自節節高升的竹子，每年跨年的煙火是台北的招牌畫面。',
    en: { name: "Taipei 101", area: "Taipei", text: "At 508 m, it was finished in 2004 and was once the world's tallest building. Its shape echoes rising bamboo, and its New Year's Eve fireworks are Taipei's signature scene." },
    ja: { name: "台北101", area: "台北", text: "高さ 508 m、2004 年完成。かつて世界一高いビルでした。伸びていく竹をかたどった姿で、年越しの花火は台北を代表する光景です。" } },
  { id: 'turtle', name: '龜山島', area: '宜蘭外海・Guishan Island', pos: PLACES.sea, r: 7, text: '宜蘭外海的火山島，遠看像一隻浮在海上的烏龜。對宜蘭人來說，看到龜山島就是回到家了。',
    en: { name: "Guishan Island", area: "Off Yilan", text: "A volcanic island off the Yilan coast that looks like a turtle floating on the sea. For people from Yilan, seeing it means you're home." },
    ja: { name: "亀山島", area: "宜蘭沖", text: "宜蘭の沖に浮かぶ火山島で、遠くから見ると海に浮かぶ亀のよう。宜蘭の人にとって、亀山島が見えたら「家に帰ってきた」合図です。" } },
  { id: 'kuroshio', name: '黑潮', area: '台灣東部海域・Kuroshio Current', pos: [Math.round(curX(64 * S)), 64 * S], r: 0, text: '流經台灣東岸、一路往北的強勁暖流，海水深藍近黑而得名。它帶來溫暖的海水和豐富的魚群，也是鯨豚出沒的海路。',
    en: { name: "Kuroshio Current", area: "Waters east of Taiwan", text: "A strong warm current flowing north along Taiwan's east coast, named for its deep blue, almost black water. It brings warm seas, rich fish and whales and dolphins." },
    ja: { name: "黒潮", area: "台湾東部の海域", text: "台湾の東海岸を北へ流れる強い暖流。黒に近い深い藍色からその名が付きました。温かい海水と豊かな魚、そしてクジラやイルカを運んできます。" } },
  { id: 'taroko', name: '太魯閣峽谷', area: '花蓮・Taroko Gorge', pos: world.gorge, r: 5, text: '立霧溪花了千萬年，切穿堅硬的大理石山壁，刻出深邃的峽谷。抬頭只看得見一線天。',
    en: { name: "Taroko Gorge", area: "Hualien", text: "Over millions of years the Liwu River cut through hard marble cliffs to carve this deep gorge. Look up and you see only a sliver of sky." },
    ja: { name: "太魯閣峡谷", area: "花蓮", text: "立霧渓が何百万年もかけて固い大理石の岩壁を削り、深い峡谷を刻みました。見上げると空は細い一本の線だけ。" } },
  { id: 'sunmoon', name: '日月潭', area: '南投・Sun Moon Lake', pos: PLACES.lake, r: 8, text: '台灣最大的湖泊，湖面一邊像日輪、一邊像月鉤。湖中的拉魯島是邵族祖靈的聖地。',
    en: { name: "Sun Moon Lake", area: "Nantou", text: "Taiwan's largest lake: one side looks like the sun, the other like a crescent moon. Lalu Island in the lake is sacred to the Thao people's ancestors." },
    ja: { name: "日月潭", area: "南投", text: "台湾最大の湖。湖の片側は太陽、もう片側は三日月の形に見えます。湖に浮かぶラル島はサオ族の祖霊の聖地です。" } },
  { id: 'yushan', name: '玉山', area: '南投・嘉義・高雄・Yushan', pos: PLACES.peak, r: 5, text: '海拔 3,952 公尺，台灣最高峰，也是東北亞第一高峰。冬天山頂偶爾積雪，遠看如白玉。',
    en: { name: "Yushan (Jade Mountain)", area: "Nantou \u00b7 Chiayi \u00b7 Kaohsiung", text: "At 3,952 m, Taiwan's highest peak and the highest in Northeast Asia. In winter the summit sometimes turns white with snow, like jade." },
    ja: { name: "玉山", area: "南投・嘉義・高雄", text: "標高 3,952 m、台湾最高峰で北東アジアでもいちばん高い山。冬は山頂に雪が積もり、白い玉のように見えることも。" } },
  { id: 'alishan', name: '阿里山神木', area: '嘉義・Alishan', pos: PLACES.shenmu, r: 6, text: '阿里山以千年紅檜巨木、雲海、日出和森林小火車聞名。站在神木下，人顯得好小。',
    en: { name: "Alishan Sacred Tree", area: "Chiayi", text: "Alishan is famous for thousand-year-old red cypress giants, seas of clouds, sunrises and its forest railway. Under the sacred tree, people look tiny." },
    ja: { name: "阿里山の神木", area: "嘉義", text: "阿里山は樹齢千年のベニヒの巨木、雲海、日の出、森林鉄道で有名です。神木の下に立つと、人はとても小さく見えます。" } },
  { id: 'kenting', name: '鵝鑾鼻燈塔', area: '屏東墾丁・Eluanbi Lighthouse', pos: world.tip, r: 6, text: '位在台灣南端的白色燈塔，1883 年點亮，被稱為「東亞之光」。往南望去，就是巴士海峽。',
    en: { name: "Eluanbi Lighthouse", area: "Kenting, Pingtung", text: "A white lighthouse at Taiwan's southern tip, first lit in 1883 and called the \"Light of East Asia.\" Look south and you see the Bashi Channel." },
    ja: { name: "鵝鑾鼻灯台", area: "屏東・墾丁", text: "台湾最南端の白い灯台。1883 年に点灯し「東アジアの光」と呼ばれます。南を見れば、そこはバシー海峡です。" } },
];
// 島放大後，走近的判定範圍跟著放大一些
for (const sp of SPOTS) sp.r = Math.round(sp.r * (1 + (S - 1) * 0.5));
localize(SPOTS);
for (const sp of SPOTS) sp.found = false;


// ---------- 狀態 ----------
const P = { x: PLACES.spawn[0] + 0.5, z: PLACES.spawn[1] - 1.5, y: 0, ry: 0, vx: 0, vz: 0, vy: 0, yaw: 0, onGround: true, swim: false, phase: 0, move: 0 };
P.y = P.ry = ground(P.x, P.z);
const XI = { x: PLACES.spawn[0] + 0.5, z: PLACES.spawn[1] + 1.5, yaw: Math.PI, wave: true };
const cam = { yaw: 0, pitch: 0.5, dist: 9, tx: P.x, ty: P.y + 1.5, tz: P.z };
const G = { state: 'title', t: 0, playT: 0, bonus: 0, collected: 0, spent: 0, awakened: 0, gateOpen: false, gateT: 0, spirit: 0, spiritTarget: 0, sense: 0, senseCd: 0, pulse: [0, 0, 0, 0], particles: [], warnT: 0, endT: 0 };
const input = { jx: 0, jy: 0, jump: false, keys: {} };

// ---------- 操作：左半邊搖桿、右半邊轉鏡頭 ----------
const stick = $('#stick'), knob = stick.querySelector('i');
let stickId = null, stickO = [0, 0], camId = null, camLast = [0, 0];
canvas.addEventListener('pointerdown', e => {
  if (G.state !== 'play') return;
  if (e.clientX < innerWidth * 0.45 && stickId === null) {
    stickId = e.pointerId; stickO = [e.clientX, e.clientY]; $('.hint').style.display = 'none';
    stick.style.left = e.clientX + 'px'; stick.style.top = e.clientY + 'px'; stick.classList.add('on');
  } else if (camId === null) { camId = e.pointerId; camLast = [e.clientX, e.clientY]; }
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerId === stickId) {
    let dx = e.clientX - stickO[0], dy = e.clientY - stickO[1]; const l = Math.hypot(dx, dy), R = 56;
    if (l > R) { dx *= R / l; dy *= R / l; }
    knob.style.transform = `translate(${dx}px,${dy}px)`;
    input.jx = dx / R; input.jy = -dy / R;
  } else if (e.pointerId === camId) {
    cam.yaw -= (e.clientX - camLast[0]) * 0.008;
    cam.pitch = clamp(cam.pitch + (e.clientY - camLast[1]) * 0.005, 0.08, 1.25);
    camLast = [e.clientX, e.clientY];
  }
});
const release = e => {
  if (e.pointerId === stickId) { stickId = null; input.jx = input.jy = 0; knob.style.transform = ''; stick.classList.remove('on'); }
  if (e.pointerId === camId) camId = null;
};
canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release);
const hold = (el, on, off) => {
  el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); on(); });
  if (off) for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(ev, off);
};
hold($('#btnJump'), () => { input.jump = true; }, () => { input.jump = false; });
hold($('#btnSense'), () => doSense());
// 設定：主畫面和遊戲裡共用同一個齒輪與面板，只放語言和聲音
const settings = $('#settings'), soundT = $('#soundT');
const syncSound = () => soundT.setAttribute('aria-checked', String(!muted));
syncSound();
for (const b of document.querySelectorAll('#menuBtn, #title .more')) b.addEventListener('click', e => { e.stopPropagation(); syncSound(); settings.hidden = false; });
soundT.addEventListener('click', () => { setMuted(!muted); syncSound(); });
settings.addEventListener('click', e => { if (e.target.closest('.xbtn')) settings.hidden = true; });
$('#loreBtn').addEventListener('click', () => { settings.hidden = true; openLore(); });
$('#castBtn').addEventListener('click', () => { settings.hidden = true; openCast(); });
$('#howBtn').addEventListener('click', () => { settings.hidden = true; say([{ title: t('goTitle'), steps: [t('goS1'), t('goS2'), t('goS3')] }]); });
$('#realmBtn').addEventListener('click', () => { settings.hidden = true; openRealms({ realms: REALMS, need: NEED, now: G.state === 'title' ? -1 : G.realm, geo: G.geo }); });
// 個人資訊：點左上角頭像，滿版顯示走了多少步、境界與收集進度
const meEl = $('#me');
// 頭像：預設用角色設計圖裡的六個角色，也能換成自己的照片（縮成 256px 存在這台裝置）
const AVATARS = ['liu', 'xi', 'orange', 'green', 'pink', 'purple'], avSrc = id => `img/avatars/${id}.jpg`;
let avatar = 'liu';
try { avatar = localStorage.getItem('of-avatar') || 'liu'; } catch { }
function setAvatar(v, save) {
  avatar = v; const src = v.startsWith('data:') ? v : avSrc(v);
  $('#avImg').src = src; $('#meBtn .avm').src = src; $('#meBtn').classList.add('has');
  for (const b of document.querySelectorAll('#avList button')) b.classList.toggle('on', b.dataset.av === v);
  if (save) try { localStorage.setItem('of-avatar', v); } catch { }
}
$('#avList').innerHTML = AVATARS.map(id => `<li><button data-av="${id}"><img src="${avSrc(id)}" alt=""></button></li>`).join('');
setAvatar(avatar);
$('#avBtn').addEventListener('click', e => { e.stopPropagation(); $('#avPick').hidden = !$('#avPick').hidden; });
$('#avList').addEventListener('click', e => { const b = e.target.closest('button[data-av]'); if (!b) return; setAvatar(b.dataset.av, true); $('#avPick').hidden = true; });
$('#avPick input').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const img = new Image(); img.onload = () => {
    const c = document.createElement('canvas'), k = Math.min(img.width, img.height); c.width = c.height = 256;
    c.getContext('2d').drawImage(img, (img.width - k) / 2, (img.height - k) / 2, k, k, 0, 0, 256, 256);
    setAvatar(c.toDataURL('image/jpeg', 0.85), true); $('#avPick').hidden = true; URL.revokeObjectURL(img.src);
  };
  img.src = URL.createObjectURL(f); e.target.value = '';
});
$('#meBtn').addEventListener('click', e => { e.stopPropagation(); hudKey = ''; hud(); meEl.hidden = false; });
meEl.addEventListener('click', e => { if (e.target.closest('.xbtn')) meEl.hidden = true; });
// ---------- 台北集章簿：每個真實地點一枚，人在現世走到附近就自動收集（模擬定位測試也算） ----------
const STAMP_TXT = { venue: '台北靈門', huashan: '華山', qidong: '文學基地', jinan: '濟南教會', shandao: '善導寺', station: '台北車站', controlyuan: '監察院', guanghua: '光華',
  wufenpu: '五分埔', cihcheng: '慈諴宮', xinzhuang: '新莊', wanhua: '萬華', baoan: '保安宮', zaichun: '再春', shipai: '石牌' };
let stamps = {};
try { stamps = JSON.parse(localStorage.getItem('of-stamps') || '{}'); } catch { }
const seal = (id, cls = '') => `<span class="seal ph ${cls}" style="--ph:url(img/stamps/${id}.jpg)"><i>${[...(STAMP_TXT[id] || '')].map(c => `<b>${c}</b>`).join('')}</i></span>`;
const stampFx = document.createElement('div'); stampFx.id = 'stampFx'; document.body.appendChild(stampFx);
function stamp(s) {
  if (stamps[s.id]) return;
  const d = new Date(); stamps[s.id] = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
  try { localStorage.setItem('of-stamps', JSON.stringify(stamps)); } catch { }
  // 收集：印記從畫面上方落下來，咚一聲，兩秒後收起（不擋操作）
  stampFx.innerHTML = `${seal(s.id)}<p>${t('stampGot', { name: s.name })}</p>`;
  stampFx.className = ''; void stampFx.offsetWidth; stampFx.className = 'go';
  setTimeout(() => { sfx.bell(98); try { navigator.vibrate && navigator.vibrate(60); } catch { } }, 380);
  clearTimeout(stamp.t); stamp.t = setTimeout(() => stampFx.className = '', 2600);
  hudKey = '';
}
const stampEl = $('#stampbook');
function renderStamps() {
  const groups = [[t('stampCulture'), REAL.filter(x => !x.tale)], [t('stampTales'), REAL.filter(x => x.tale)]];
  const n = Object.keys(stamps).filter(k => STAMP_TXT[k]).length, m = Object.keys(STAMP_TXT).length;
  $('#stampSub').textContent = G.geo ? t('stampSub', { n, m }) : t('spiritNoRec');
  // 跟成就頁同一套樣式：分區標題＋兩欄卡片，圓圈裡放景點照片，還沒收集的是灰的
  const GLY = ['<path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/>', '<path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h11"/>'];
  const COL = ['#ffcf5a', '#7fe8ff'];
  $('#stampList').innerHTML = groups.map(([h, list], gi) => `<li class="chd" style="--c:${COL[gi]}"><i class="gl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${GLY[gi]}</svg></i><span><b>${h}</b></span><em>${list.filter(x => stamps[x.id]).length}/${list.length}</em></li>`
    + list.map(x => `<li data-id="${x.id}"><button class="${stamps[x.id] ? 'on' : 'lock'}" type="button"><span class="ic photo" style="--ph:url(img/stamps/${x.id}.jpg)"></span><b>${x.name}</b><small>${stamps[x.id] || (x.sub || '').split(/・| · /).slice(1).join('・')}</small></button></li>`).join('')).join('');
}
$('#stampBtn').addEventListener('click', () => { renderStamps(); stampEl.hidden = false; });
stampEl.addEventListener('click', e => {
  if (e.target.closest('.xbtn')) { stampEl.hidden = true; return; }
  const li = e.target.closest('li[data-id]'); if (!li) return;
  const x = REAL.find(r => r.id === li.dataset.id);
  if (!stamps[x.id]) { li.classList.remove('nope'); void li.offsetWidth; li.classList.add('nope'); sfx.deny(); return; }
  spotData = { title: x.name, sub: x.sub, text: x.text, em: x.fact || '', d: spotInfo(x.id), key: x.id }; openSpot();
});

// ---------- 成就：完成過的階段用 icon 排成格子，點一下重播當時的過關動畫 ----------
// 達成過就記在這台裝置（重新整理也還在）；跳階測試時依目前進度補記
const ACH = [
  ...['elephant', 'tiger', 'leopard', 'lion'].map(id => ({ id: 'g:' + id, img: [id], live: () => NODES.find(n => n.id === id).awake, play: () => replayVictory(NODES.find(n => n.id === id)), name: () => t('achGate', { beast: t('beast_' + id) }), hint: () => t('achHintGate', { name: NODES.find(n => n.id === id).name }) })),
  { id: 'four', img: ['elephant', 'tiger', 'leopard', 'lion'], live: stage1Done, play: () => roar(t('resSub')), name: () => t('resonance'), hint: () => t('achHintFour') },
  // 第二階：七隻守門街貓，各自淨化就各算一個成就
  ...TALES.map(s => ({ id: 't:' + s.id, img: ['cat-' + s.id], live: () => visited.has(s.id), play: () => replayVictory({ id: s.id, name: s.name }), name: () => t('achGate', { beast: t('beast_' + s.id) }), hint: () => t('achHintCat', { name: s.name }) })),
  { id: 'tales', book: true, live: () => stage1Done() && TALES.every(s => visited.has(s.id)), play: () => roar(t('talesAllSub'), { kind: 'tales', title: t('talesAllTitle'), book: t('taipeiBook'), lamps: TALES.map(x => x.name) }), name: () => t('talesAllTitle'), hint: () => t('achHintTales') },
  { id: 'flows', img: ['dragon', 'turtle', 'bear'], live: () => S2.every(n => n.awake), play: () => roar(t('flowsSub'), { kind: 'flows', title: t('flowsUnite'), beasts: S2.map(n => n.id) }), name: () => t('flowsUnite'), hint: () => t('achHintFlows') },
  { id: 'boss', img: ['boss'], live: () => G.bossDone, play: () => replayVictory({ id: 'boss', boss: true, name: t('beast_boss') }), name: () => t('achBoss'), hint: () => t('achHintBoss') },
];
let achGot = new Set();
try { achGot = new Set(JSON.parse(localStorage.getItem('of-ach') || '[]')); } catch { }
function syncAch() {
  let add = false;
  for (const a of ACH) if (G.geo && !achGot.has(a.id) && G.state !== 'title' && a.live()) { achGot.add(a.id); add = true; }
  // 修行境界：到過的境界都記下來（只在現世修行）
  if (G.geo && G.state !== 'title') for (let i = 0; i <= G.realm; i++) if (!achGot.has('realm:' + i)) { achGot.add('realm:' + i); add = true; }
  if (add) try { localStorage.setItem('of-ach', JSON.stringify([...achGot])); } catch { }
  $('#realmN').textContent = `${REALMS.filter((_, i) => achGot.has('realm:' + i)).length}/${REALMS.length}`;
  $('#achN').textContent = `${ACH.filter(a => achGot.has(a.id)).length}/${ACH.length}`;
  $('#stampN').textContent = `${Object.keys(stamps).filter(k => STAMP_TXT[k]).length}/${Object.keys(STAMP_TXT).length}`;
}
const achEl = $('#ach'), BOOK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h11"/><path d="M9 7v6"/></svg>';
// 成就依世界觀八章分區：章節圖當分隔；序章放已開放的成就，後面的章節先放灰色 icon（尚未開放）
const CH_GLYPH = [, '<path d="M3 9c3-3 6 3 9 0s6 3 9 0M3 15c3-3 6 3 9 0s6 3 9 0"/>', '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>', '<path d="M12 21v-8M12 13c-4 0-7-3-7-7 4 0 7 3 7 7zM12 13c4 0 7-3 7-7-4 0-7 3-7 7z"/>',
  '<path d="M12 12a2 2 0 1 0 2 2 4 4 0 0 0-4-4 6 6 0 0 0-6 6M12 12a6 6 0 0 1 6 6"/><circle cx="12" cy="12" r="9"/>', '<path d="M12 20v-7M12 13c0-3 2-5 5-5 0 3-2 5-5 5zM12 15c0-3-2-5-5-5 0 3 2 5 5 5z"/>',
  '<path d="M6 9a3 3 0 1 0 0 6c3 0 9-6 12-6a3 3 0 1 1 0 6c-3 0-9-6-12-6z"/>'];
const CH_COL = ['#ffcf5a', '#7fe8ff', '#ffd27a', '#c9a8ff', '#9ef0a8', '#5fd3e6', '#ffb3c7', '#ffffff'];
function renderAch() {
  syncAch();
  const L = lang === 'en' ? 1 : lang === 'ja' ? 2 : 0, BIMG = { city: 'dragon', sea: 'turtle', peak: 'bear' };
  $('#achSub').textContent = G.geo ? t('achSub', { n: ACH.filter(a => achGot.has(a.id)).length, m: ACH.length }) : t('spiritNoRec');
  const head = (i, open) => `<li class="chd${open ? '' : ' shut'}" style="--c:${CH_COL[i]}"><img src="img/lore/ch${i}.jpg" alt=""><span><small>${CH[i].no[L]}</small><b>${CH[i].name[L]}</b></span><em>${open ? `${ACH.filter(a => achGot.has(a.id)).length}/${ACH.length}` : t('achSoon')}</em></li>`;
  const tile = (a, i) => {
    const on = achGot.has(a.id);
    const icon = a.book ? `<span class="ic book">${BOOK_SVG}</span>` : `<span class="ic n${a.img.length}">${a.img.map(k => `<img src="img/beasts/${BIMG[k] || k}.png" alt="">`).join('')}</span>`;
    return `<li><button class="${on ? 'on' : 'lock'}" data-i="${i}">${icon}<b>${a.name()}</b><small>${on ? t('achReplay') : a.hint()}</small></button></li>`;
  };
  const ghost = i => `<li class="ghosts">${[0, 1, 2, 3].map(() => `<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${CH_GLYPH[i]}</svg></span>`).join('')}</li>`;
  $('#achList').innerHTML = head(0, true) + ACH.map(tile).join('') + [1, 2, 3, 4, 5, 6, 7].map(i => head(i, false) + ghost(i)).join('');
}
$('#achBtn').addEventListener('click', () => { renderAch(); achEl.hidden = false; });
// 修行境界：自己一頁，五個境界的圖示，到過就亮起來，點一下重播突破動畫；最後的歸流境佔整行
const realmEl = $('#realmAch');
function renderRealms() {
  syncAch();
  const n = REALMS.filter((_, i) => achGot.has('realm:' + i)).length;
  $('#realmSub').textContent = G.geo ? t('achSub', { n, m: REALMS.length }) : t('spiritNoRec');
  $('#realmList').innerHTML = REALMS.map((name, i) => { const on = achGot.has('realm:' + i); return `<li><button class="${on ? 'on' : 'lock'}" data-r="${i}"><span class="ic realm" style="--c:${REALM_COL[i]}">${realmVox(i)}</span><b>${name}</b><small>${on ? t('achReplay') : i ? t('realmNeedGeo', { n: NEED[i - 1] }) : t('realmStartHint')}</small></button></li>`; }).join('');
}
$('#realmAchBtn').addEventListener('click', () => { renderRealms(); realmEl.hidden = false; });
realmEl.addEventListener('click', e => {
  if (e.target.closest('.xbtn')) { realmEl.hidden = true; return; }
  const b = e.target.closest('button[data-r]'); if (!b) return;
  const i = +b.dataset.r;
  if (!achGot.has('realm:' + i)) { sfx.deny(); b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); return; }
  initAudio(); ascend(i, lookNow());
});
achEl.addEventListener('click', e => {
  if (e.target.closest('.xbtn')) { achEl.hidden = true; return; }
  const b = e.target.closest('button[data-i]'); if (!b) return;
  const a = ACH[+b.dataset.i];
  if (!achGot.has(a.id)) { sfx.deny(); b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); return; }   // 還沒達成：搖一下，提示就寫在格子裡
  initAudio(); a.play();
});
// ---------- 商圈整合：飽足與物品 ----------
// 15 個機緣點各有一樣物品，讀完景點介紹按「領取靈光」時一起拿到；食物直接吃、衣物直接換、裝備直接生效
// 收藏只在現世修行記錄（存在這台裝置）；靈界走走這一趟可以用，但不記錄
const LI = lang === 'en' ? 1 : lang === 'ja' ? 2 : 0;
G.full = 70; G.cakes = 0;
const hungry = () => G.full < 30;
let itemsGot = new Set();
try { itemsGot = new Set(JSON.parse(localStorage.getItem('of-items') || '[]')); } catch { }
const itemsRun = new Set();
const perk = id => itemsRun.has(id) || (G.geo && itemsGot.has(id));
MODS.perk = perk; Object.defineProperty(MODS, 'hungry', { get: hungry });
const eat = n => { G.full = Math.min(100, G.full + n); };
// 角色搭配：衣服、頭部、手腕、背後各放一樣拿到的物品（只換外觀，效果拿到就生效）；記在這台裝置
const LOOK_SLOTS = { body: ['outfit'], head: ['goggles', 'phones'], wrist: ['bracer'], back: ['paddle', 'barrel'] };
let look = {};
try { look = JSON.parse(localStorage.getItem('of-look') || '{}'); } catch { }
const setLook = (slot, id) => { look[slot] = id || ''; try { localStorage.setItem('of-look', JSON.stringify(look)); } catch { } };
const lookNow = () => ({ ...Object.fromEntries(Object.entries(look).filter(([, v]) => v && perk(v))), realm: G.realm || 0 });   // realm：境界衣服與背後圖示
// 走路慢慢消耗飽足；餓了先吃身上帶的鹹光餅
function hunger(m) {
  const was = hungry();
  G.full = Math.max(0, G.full - m * 0.08);
  if (!hungry()) return;
  if (G.cakes > 0) { G.cakes--; eat(ITEM_OF.xinzhuang.fill); toast(t('cakeToast', { n: G.cakes })); }
  else if (!was) toast(t('hungryToast'));
}
function grantItem(key) {
  const it = ITEM_OF[key]; if (!it) return null;
  itemsRun.add(it.id);
  if (G.geo && !itemsGot.has(it.id)) { itemsGot.add(it.id); try { localStorage.setItem('of-items', JSON.stringify([...itemsGot])); } catch { } }
  if (it.type === 'food') it.carry ? (G.cakes += it.carry) : eat(it.fill);
  // 拿到能穿戴的就直接換上（那一格原本空著才換）
  const slot = Object.keys(LOOK_SLOTS).find(k => LOOK_SLOTS[k].includes(it.id));
  if (slot && (!look[slot] || !perk(look[slot]) || slot === 'body')) setLook(slot, it.id);
  hudKey = '';
  return it;
}
const itemOwned = it => G.geo ? itemsGot.has(it.id) : itemsRun.has(it.id);
function syncItems() { $('#itemsN').textContent = `${ITEMS.filter(itemOwned).length}/${ITEMS.length}`; }
const placeName = it => (REAL.find(r => r.id === it.spot) || TALES.find(r => r.id === it.spot))?.name || '';
// 收藏頁：跟成就一樣，小 icon 排成格子，依階段分區，還沒拿到的是灰色
const itemsEl = $('#items'), itemPg = $('#itemPage');
const STAGE_GLYPH = ['<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>', '<path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/>', '<path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h11"/>'];
const STAGE_COL = ['#c9a8ff', '#ffcf5a', '#7fe8ff'];
function renderItems() {
  const n = ITEMS.filter(itemOwned).length;
  $('#itemsSub').textContent = G.geo ? t('itemsSub', { n, m: ITEMS.length }) : t('spiritNoRec');
  const head = st => { const list = ITEMS.filter(x => x.stage === st); return `<li class="chd" style="--c:${STAGE_COL[st]}"><i class="gl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${STAGE_GLYPH[st]}</svg></i><span><b>${t('itemStage' + st)}</b></span><em>${list.filter(itemOwned).length}/${list.length}</em></li>`; };
  const tile = it => { const on = itemOwned(it), used = it.type === 'token' && tokenUsed(); return `<li${it.type === 'token' ? ' class="wide"' : ''}><button class="${on ? 'on' : 'lock'}${used ? ' used' : ''}" data-id="${it.id}"><span class="ic item">${itemSVG(it)}${used ? `<i class="usedmk">${t('tokenUsedMk')}</i>` : ''}</span><b>${on ? it.name[LI] : '？？？'}</b><small>${!on ? (it.type === 'token' ? t('tokenHint') : t('itemHint', { place: placeName(it) })) : used ? t('tokenUsedAt', { time: tokenUsed() }) : it.type === 'token' ? t('tokenOpen') : t('type_' + it.type) + '・' + t('itemOpen')}</small></button></li>`; };
  $('#itemList').innerHTML = [1, 2, 0].map(st => head(st) + ITEMS.filter(x => x.stage === st).map(tile).join('')).join('');
}
function openItem(it) {
  itemPg.querySelector('.phead b').textContent = it.name[LI];
  itemPg.querySelector('.phead small').textContent = `${t('type_' + it.type)}・${it.type === 'token' ? t('tokenShop') : placeName(it)}`;
  itemPg.querySelector('.hero').innerHTML = itemSVG(it);
  itemPg.querySelector('.fx b').textContent = it.fx[LI];
  itemPg.querySelector('.fx small').textContent = t('auto_' + it.type);
  itemPg.querySelector('.story').textContent = it.story[LI];
  itemPg.querySelector('.where b').textContent = it.type === 'token' ? t('tokenWhere') : placeName(it);
  // 商圈信物：底下放「出示給店家兌換」；用過就蓋「已使用」
  const tk = it.type === 'token', used = tk && tokenUsed();
  itemPg.querySelector('.fx small').textContent = tk ? t(used ? 'tokenUsedAt' : 'tokenShopNote', { time: used }) : t('auto_' + it.type);
  itemPg.querySelector('.hero').classList.toggle('used', !!used);
  itemPg.querySelector('.hero').insertAdjacentHTML('beforeend', used ? `<i class="usedmk">${t('tokenUsedMk')}</i>` : '');
  const go = itemPg.querySelector('.redeemgo'); go.hidden = !tk || !!used;
  itemPg.hidden = false; itemPg.scrollTop = 0;
}
// ---------- 商圈信物：打贏濁淵掉落（只在現世修行），出示給合作店家兌換一次 ----------
const TOKEN = ITEMS.find(x => x.type === 'token');
const tokenUsed = () => { try { return localStorage.getItem('of-token-used') || ''; } catch { return ''; } };
function dropToken() {
  if (!G.geo || itemsGot.has(TOKEN.id)) return;
  itemsGot.add(TOKEN.id); try { localStorage.setItem('of-items', JSON.stringify([...itemsGot])); } catch { }
  hudKey = '';
  setTimeout(() => toast(t('tokenDrop', { item: TOKEN.name[LI] })), 1800);
}
const redeemEl = $('#redeem'), redeemUse = redeemEl.querySelector('.use');
let redeemT = 0, confirmT = 0;
const two = n => String(n).padStart(2, '0');
function redeemTick() {
  const d = new Date();
  redeemEl.querySelector('.clock b').textContent = `${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`;
  redeemEl.querySelector('.clock small').textContent = `${d.getFullYear()}/${two(d.getMonth() + 1)}/${two(d.getDate())}`;
}
function openRedeem() {
  redeemEl.querySelector('.phead b').textContent = TOKEN.name[LI];
  redeemEl.querySelector('.hero').innerHTML = itemSVG(TOKEN);
  redeemUse.classList.remove('confirm'); redeemUse.textContent = t('redeemBtn'); redeemEl.classList.remove('done');
  redeemTick(); clearInterval(redeemT); redeemT = setInterval(redeemTick, 250);
  redeemEl.hidden = false;
}
function closeRedeem() { clearInterval(redeemT); redeemEl.hidden = true; }
itemPg.querySelector('.redeemgo').addEventListener('click', () => { sfx.pick(); openRedeem(); });
redeemEl.addEventListener('click', e => { if (e.target.closest('.xbtn')) closeRedeem(); });
// 兌換要按兩次（第二次由店家確認），避免誤觸；用過這支手機就不能再用
redeemUse.addEventListener('click', () => {
  if (tokenUsed()) return;
  if (!redeemUse.classList.contains('confirm')) {
    redeemUse.classList.add('confirm'); redeemUse.textContent = t('redeemConfirm'); sfx.sense();
    clearTimeout(confirmT); confirmT = setTimeout(() => { redeemUse.classList.remove('confirm'); redeemUse.textContent = t('redeemBtn'); }, 5000);
    return;
  }
  clearTimeout(confirmT);
  const d = new Date(), stampT = `${d.getFullYear()}/${two(d.getMonth() + 1)}/${two(d.getDate())} ${two(d.getHours())}:${two(d.getMinutes())}`;
  try { localStorage.setItem('of-token-used', stampT); } catch { }
  redeemEl.classList.add('done'); redeemEl.querySelector('.donemk small').textContent = stampT;
  sfx.bell(98); try { navigator.vibrate && navigator.vibrate([40, 40, 90]); } catch { }
  openItem(TOKEN); renderItems();
});
$('#itemsBtn').addEventListener('click', () => { renderItems(); itemsEl.hidden = false; });
$('#labBtn').addEventListener('click', () => { sfx.pick(); openCharLab({ realm: () => G.realm || 0, slots: LOOK_SLOTS, owned: perk, look: () => look, setLook, deny: () => sfx.deny(), pick: () => sfx.pick() }); });
itemsEl.addEventListener('click', e => {
  if (e.target.closest('.xbtn')) { itemsEl.hidden = true; return; }
  const b = e.target.closest('button[data-id]'); if (!b) return;
  const it = ITEMS.find(x => x.id === b.dataset.id);
  if (!itemOwned(it)) { sfx.deny(); b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); return; }
  sfx.pick(); openItem(it);
});
itemPg.addEventListener('click', e => { if (e.target.closest('.xbtn')) itemPg.hidden = true; });

// 小地圖：點地圖 icon 才展開，8 秒後自動收起
let miniT = 0;
// 靈界地圖：點地圖 icon（或角落的小地圖）直接滿版，一次只看「我在哪裡、下一站在哪」
const bigEl = $('#bigmap'), bigCv = $('#bigcv'), bg = bigCv.getContext('2d');
function openBigMap() { bigZoom = 1; clearTimeout(miniT); $('#mini').classList.remove('show'); $('#mapBtn').classList.remove('on'); bigEl.hidden = false; }
$('#mapBtn').addEventListener('click', e => { e.stopPropagation(); openBigMap(); });
$('#mini').addEventListener('click', e => { e.stopPropagation(); openBigMap(); });
bigEl.addEventListener('click', e => { if (e.target.closest('.xbtn')) bigEl.hidden = true; });
{ // 雙指縮放／滾輪縮放滿版地圖
  const pts = new Map(); let d0 = 0, z0 = 1;
  const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  const setZ = z => { bigZoom = clamp(z, 1, 8); };
  bigCv.addEventListener('pointerdown', e => { pts.set(e.pointerId, e); if (pts.size === 2) { d0 = dist(); z0 = bigZoom; } });
  bigCv.addEventListener('pointermove', e => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, e); if (pts.size === 2 && d0) setZ(z0 * dist() / d0); });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) bigCv.addEventListener(ev, e => { pts.delete(e.pointerId); d0 = 0; });
  bigCv.addEventListener('wheel', e => { e.preventDefault(); setZ(bigZoom * Math.exp(-e.deltaY / 400)); }, { passive: false });
}
addEventListener('keydown', e => { input.keys[e.code] = true; if (e.code === 'Space') input.jump = true; if (e.code === 'KeyE' || e.code === 'KeyQ') doSense(); if ((e.code === 'Enter' || e.code === 'Space') && talk) nextLine(); });
addEventListener('keyup', e => { input.keys[e.code] = false; if (e.code === 'Space') input.jump = false; });
document.addEventListener('gesturestart', e => e.preventDefault());

// ---------- HUD ----------
const pop = (text, kind = '') => { const el = $('#pop'); el.textContent = text; el.className = 'show ' + kind; clearTimeout(pop.t); pop.t = setTimeout(() => el.className = '', 2600); };
// ---------- 路線導引：點任務的「帶我去」，用左右前後告訴你怎麼走（不講東南西北） ----------
const REL = t('rel');
const relWord = deg => REL[((Math.round(deg / 45) % 8) + 8) % 8];
// 島上：以鏡頭朝向為前方；回傳 [方向詞, 步數, 角度（右為正）]
function islandRel(pos) {
  const dx = pos[0] - P.x, dz = pos[2] - P.z, s = Math.sin(cam.yaw), c = Math.cos(cam.yaw);
  const deg = Math.atan2(-dx * c + dz * s, dx * s + dz * c) * 180 / Math.PI;
  return [relWord(deg), Math.round(Math.hypot(dx, dz)), deg];
}
// 現地：手機指南針；沒有指南針時用最近走的方向當前方
let heading = null, course = null, courseFrom = null, compassAsked = false;
function onOrient(e) {
  let h = e.webkitCompassHeading ?? (e.absolute && e.alpha != null ? 360 - e.alpha : null);
  if (h == null) return;
  heading = (h + (screen.orientation?.angle || 0)) % 360;
}
function askCompass() {
  if (compassAsked) return; compassAsked = true;
  const go = () => { addEventListener('deviceorientationabsolute', onOrient); addEventListener('deviceorientation', onOrient); };
  try {
    if (window.DeviceOrientationEvent?.requestPermission) DeviceOrientationEvent.requestPermission().then(r => { if (r === 'granted') go(); }).catch(() => { });
    else go();
  } catch { }
}
geo.on(p => {
  if (!courseFrom) { courseFrom = { ...p }; return; }
  if (meters(courseFrom, p) >= 8) { const [x, y] = offset(courseFrom, p); course = (Math.atan2(x, y) * 180 / Math.PI + 360) % 360; courseFrom = { ...p }; }
});
// 有指南針（或已經走出方向）就說左右前後，否則才退回東南西北
function dirFor(s) {
  const h = heading ?? course; if (h == null) return dirName(geo.pos, s);
  const [x, y] = offset(geo.pos, s); return relWord(((Math.atan2(x, y) * 180 / Math.PI - h + 540) % 360) - 180);
}
let guideOn = false;
const guideEl = $('#guide'), guideArrow = guideEl.querySelector('i'), guideText = guideEl.querySelector('p'), guideNm = guideEl.querySelector('small');
// 任務卡、雷達、靈界地圖都有「導航」（Google 地圖）和「指引」（靈界方向箭頭）
// 主畫面的箭頭跟著角色走：量的是島上目標的步數；真實世界的距離和方向看雷達
// 指引永遠跟著任務卡現在那一項走：第一階下一座門 → 城市故事（最近還沒去的那個，只在現世）→ 第二階（現世取最近的那一處）→ 台北靈門
// 第三階三流沿途的台灣之美：城＝台北 101；海＝龜山島、黑潮、鵝鑾鼻；山＝玉山、阿里山、日月潭、太魯閣
const FLOW_SPOTS = { city: ['101'], sea: ['turtle', 'kuroshio', 'kenting'], peak: ['yushan', 'alishan', 'sunmoon', 'taroko'] };
const spotPos = sp => [sp.pos[0] + 0.5, 0, sp.pos[1] + 0.5];
const flowSpots = n => (FLOW_SPOTS[n.id] || []).map(id => SPOTS.find(sp => sp.id === id));
function guideTarget() {
  if (talesStage()) {
    if (G.geo) { const s = radarTarget(); if (s) return { name: s.name, real: s }; }
    else { const s = TALES.filter(x => !visited.has(x.id)).sort((a, b) => Math.hypot(a.ipos[0] - P.x, a.ipos[2] - P.z) - Math.hypot(b.ipos[0] - P.x, b.ipos[2] - P.z))[0]; if (s) return { name: s.name, pos: s.ipos }; }
  }
  if (!G.gateOpen && stage1Done()) {
    let n;
    if (G.geo) { const s = radarTarget(); n = s && NODES.find(m => m.id === s.node && !m.awake); }
    n = n || nextGate();
    if (n) {
      // 喚醒三流時順便帶去沿途還沒收的台灣之美：境界還不夠時先去最近的地景（邊走邊修行）；
      // 境界夠了就往這一流走，但這一流的地景比門還近時先繞過去
      const d = p => Math.hypot(p[0] - P.x, p[2] - P.z), left = sp => !sp.found;
      const pool = G.realm < REQ ? S2.filter(m => !m.awake).flatMap(flowSpots).filter(left) : flowSpots(n).filter(left);
      const sp = pool.sort((a, b) => d(spotPos(a)) - d(spotPos(b)))[0];
      if (sp && (G.realm < REQ || d(spotPos(sp)) < d(n.pos))) return { name: t('beauty') + t('sep') + sp.name, pos: spotPos(sp), spot: true };
      return { name: n.name, pos: n.pos };
    }
  }
  const n = nextGate();
  return n ? { name: n.name, pos: n.pos } : { name: t('gateName'), pos: GATE };
}
let guideName = '';
function updateGuide() {
  if (!guideOn) return;
  const g = guideTarget();
  let deg = 0, text;
  if (g.real) {
    // 城市故事只在現世：箭頭指真實方向（有指南針或走出方向時），字寫距離
    // 有指南針就照手機朝向；沒有就照靈界地圖的方位（北＝地圖上方），箭頭和地上的金光都指得出去
    const h = heading ?? course, [x, y] = offset(geo.pos, g.real), d = meters(geo.pos, g.real);
    if (h != null) deg = ((Math.atan2(x, y) * 180 / Math.PI - h + 540) % 360) - 180;
    else deg = islandRel([P.x + x, 0, P.z - y])[2];
    guideEl.classList.remove('nodir');
    text = d <= (g.real.r || 60) ? t('guideArrived') : (h == null ? dirName(geo.pos, g.real) + ' ' : '') + fmt(d);
  } else {
    const [, n, a] = islandRel(g.pos); deg = a; guideEl.classList.remove('nodir');
    text = n < 3 ? t('guideArrived') : t('guideSteps', { n });
  }
  // 目標換了（上一項完成）：亮一下，讓人知道指引已經換到下一站
  if (g.name !== guideName) { if (guideName) { sfx.sense(); guideEl.classList.remove('next'); void guideEl.offsetWidth; guideEl.classList.add('next'); } guideName = g.name; guideNm.textContent = g.name; }
  guideArrow.style.transform = `rotate(${deg.toFixed(0)}deg)`;
  if (guideText.textContent !== text) guideText.textContent = text;
}
// 「指引」：留在靈界，畫面上出現方向箭頭＋地上一串金光指向下一站；不打開任何地圖
function openGuide() {
  guideOn = true; guideEl.classList.add('show'); sfx.sense();
  closeRadar(); bigEl.hidden = true;
  updateGuide();
}
// 金光一串串從腳下往目標方向流過去，走到了就停
// 靈界的城市故事：一根暖金色光柱＋上下浮動的方塊燈，讀完就熄
function taleMarks() {
  if (G.geo || !talesStage()) return;
  for (const s of TALES) {
    if (visited.has(s.id)) continue;
    const [x, , z] = s.ipos, y = ground(x, z), b = Math.sin(G.t * 2 + x) * 0.25;
    r.box(x, y + 0.3, z, 0.9, 0.6, 0.9, [0.55, 0.32, 0.18], 0, 1);
    r.box(x, y + 1.6 + b, z, 0.6, 0.6, 0.6, [1, 0.82, 0.45], 1, 1, G.t);
    r.box(x, y + 4, z, 0.25, 7, 0.25, [1, 0.85, 0.5], 1, 0.28);
  }
}
function guideTrail() {
  if (!guideOn || G.state !== 'play') return;
  const g = guideTarget(); let dx, dz, d;
  if (g.pos) { dx = g.pos[0] - P.x; dz = g.pos[2] - P.z; d = Math.hypot(dx, dz); }
  else if (g.real) {
    // 現世的目的地：金光照真實方位往外流（北＝靈界地圖的上方），到了就停
    const [x, y] = offset(geo.pos, g.real), m = Math.hypot(x, y);
    if (m <= (g.real.r || 60)) return;
    dx = x; dz = -y; d = 1e3;
  } else return;
  if (d < 3) return;
  const k0 = Math.hypot(dx, dz), ux = dx / k0, uz = dz / k0, ph = (G.t * 2.4) % 1.2, L = Math.min(d - 1, perk('phones') ? 24 : 12);   // 流光耳機：金光更長
  for (let k = 1 + ph; k < L; k += 1.2) {
    const a = Math.min(1, (k - 1) / 1.2) * Math.min(1, (L - k) / 3);
    r.box(P.x + ux * k, P.y + 0.12, P.z + uz * k, 0.5, 0.08, 0.5, [1, 0.85, 0.4], 1, a, Math.atan2(ux, uz));
  }
}
// 「導航」：用 Google 地圖帶你走到現世的目的地（步行）
function openNav(s = radarTarget()) {
  if (!s) return;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&travelmode=walking`;
  const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.click();
}
document.addEventListener('click', e => {
  const b = e.target.closest('.navpair button'); if (!b) return;
  e.stopPropagation(); b.classList.contains('navgo') ? openNav() : openGuide();
}, true);
guideEl.addEventListener('click', e => { e.stopPropagation(); if (e.target.closest('.x')) { guideOn = false; guideEl.classList.remove('show'); } });

// ---------- 走路修行：走的路轉成修為，修為滿了到機緣點突破境界 ----------
// 現地模式算真實走的公尺數（模擬定位也算），島上算角色走的步數；每升一境，淨化之戰多一步
const REALMS = t('realms'), NEED = [150, 200, 250, 300];
G.realm = 0; G.xiu = 0; G.walked = 0;
const xiuFull = () => G.realm < NEED.length && G.xiu >= NEED[G.realm];
function gainXiu(m) {
  G.walked += m;
  hunger(m);
  if (G.realm >= NEED.length || xiuFull()) return;
  G.xiu = Math.min(NEED[G.realm], G.xiu + m * (hungry() ? 0.5 : 1));   // 肚子餓：修為長得慢一半
  if (xiuFull()) { toast(t('xiuFull')); sfx.sense(); }
}
function breakthrough() {
  if (!xiuFull()) return;
  G.realm++; G.xiu = 0;
  // 全畫面突破動畫：阿流打坐、背後爆出四色宏光，收起後在世界裡再爆一次光
  setTimeout(() => ascend(G.realm, lookNow()).then(() => burst(P.x, P.y + 1.2, P.z, [1, 0.9, 0.5], 60, 7)), 300);
}
function xiuLine() {
  if (G.realm >= NEED.length) return t('xiuMax', { realm: REALMS[G.realm] });
  if (xiuFull()) return t('xiuReady');
  return t(G.geo ? 'xiuLeftGeo' : 'xiuLeftIsland', { n: Math.ceil(NEED[G.realm] - G.xiu), next: REALMS[G.realm + 1] });
}
// 現世走路帶動靈界：離真實目的地近了幾成，阿流就在島上朝下一座門走幾成，真的走到時島上也剛好到門前
let sync = null;
function syncIsland(p) {
  const tg = radarTarget(), tn = tg && NODES.find(n => n.id === tg.node), it = tn ? { pos: tn.pos } : guideTarget(); if (!tg || tg.tale || !it.pos || G.state === 'title') return;
  const d = meters(p, tg), key = tg.id + (geo.sim ? 's' : 'g');
  const left = () => Math.max(0, Math.hypot(it.pos[0] - P.x, it.pos[2] - P.z) - 2.4);
  if (!sync || sync.key !== key || Math.abs(d - sync.last) > 250) { sync = { key, d0: Math.max(d, 30), f: 0, L0: left(), last: d }; G.auto = 0; return; }
  sync.last = d;
  const f = Math.min(1, Math.max(0, 1 - d / sync.d0));
  if (f > sync.f) { G.auto = Math.min(left(), (G.auto || 0) + (f - sync.f) * sync.L0); sync.f = f; }
}
let anchor = null;
geo.on(p => {
  if (!G.geo || G.state === 'title') return;
  const acc = geo.sim ? 0 : (geo.acc || 50), now = performance.now();
  if (acc > 40) return;   // 定位太飄就不算
  syncIsland(p);
  if (!anchor) { anchor = { ...p, ts: now }; return; }
  const d = meters(anchor, p);
  if (d < Math.max(4, acc * 0.5)) return;
  // 真實定位時速度超過每秒 3.5 公尺（騎車、搭車）不算修為
  walkFold();
  if (geo.sim || d / ((now - anchor.ts) / 1000) < 3.5) gainXiu(d);
  anchor = { ...p, ts: now };
});

// 下一步卡可收合；收起時目標換了就自動展開 5 秒再收回，重要的事不會錯過
const questEl = $('#quest');
let questFold = false, peekT = 0;
try { questFold = localStorage.getItem('of-quest-fold') === '1'; } catch { }
const setFold = on => { questFold = on; clearTimeout(peekT); questEl.classList.toggle('fold', on); if (on) questEl.classList.add('min'); try { localStorage.setItem('of-quest-fold', on ? '1' : '0'); } catch { } };
function peekQuest() { if (!questFold) return; questEl.classList.remove('fold'); clearTimeout(peekT); peekT = setTimeout(() => questFold && questEl.classList.add('fold'), 5000); }
questEl.classList.toggle('fold', questFold);
// 開始走動（搖桿、鍵盤或真的在走）就把任務卡縮到最小，畫面讓給路；正在「目標換了」短暫展開時不打斷
function walkFold() { if (!questFold || !questEl.classList.contains('min')) setFold(true); }
$('#qFold').addEventListener('click', e => { e.stopPropagation(); setFold(!questEl.classList.contains('fold') ? true : false); });
questEl.addEventListener('click', e => { if (questEl.classList.contains('fold')) { e.stopPropagation(); setFold(false); } });
const toast = text => { const el = $('#toast'); el.textContent = text; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); };
const avail = () => G.collected + (G.bonus || 0) - G.spent;
let hudKey = '';
function hud() {
  const found = SPOTS.filter(sp => sp.found).length;
  const key = [Math.round(G.walked), Math.round(G.full), itemsRun.size, visited.size, G.wildWins, G.geo, G.collected, G.bonus, G.spent, G.awakened, G.gateOpen, G.realm, Math.ceil(G.xiu), found].join();
  if (key !== hudKey) {
    hudKey = key;
    $('#lv').textContent = REALMS[G.realm];
    $('#xbar').style.width = (G.realm >= NEED.length ? 100 : G.xiu / NEED[G.realm] * 100) + '%';
    $('#fbar').style.width = G.full + '%'; $('#fbar').parentNode.classList.toggle('low', hungry());
    $('#meFull').textContent = `${t('meFull')} ${Math.round(G.full)}%${G.cakes ? `・${t('type_food')} ${ITEM_OF.xinzhuang.name[LI]}×${G.cakes}` : ''}`;
    $('#meFullTip').textContent = t(hungry() ? 'fullHungry' : 'fullOk');
    $('#meBtn').classList.toggle('hungry', hungry());
    syncItems();
    const steps = Math.round(G.geo ? G.walked / 0.7 : G.walked);   // 現世：用公尺換算步數（一步約 0.7 公尺）
    $('#meSteps').textContent = t('stepsN', { n: steps.toLocaleString() });
    $('#meDist').textContent = G.geo ? t('meDist', { d: fmt(G.walked) }) : '';
    $('#meXiu').textContent = xiuLine();
    // 跟著現在的玩法：淨化了幾隻守門獸（四獸＋三流）、城市故事（只在現世）、打贏幾次濁影、手上的靈光
    const tales = TALES.filter(x => visited.has(x.id)).length;
    $('#meGrid').innerHTML = [[t('meBeasts'), `${G.awakened}/${S1.length + S2.length}`], [t('meTales'), `${tales}/${TALES.length}`], [t('meWilds'), G.wildWins || 0], [t('meQi'), avail()]]
      .map(([k, v]) => `<li><small>${k}</small><b>${v}</b></li>`).join('');
    // 圖鑑總數：靈門、城市故事（現世）與台灣地景
    const dn = G.awakened + TALES.filter(x => visited.has(x.id)).length + found, dm = S1.length + S2.length + TALES.length + SPOTS.length;
    $('#dexN').textContent = dn; $('#dexSub').textContent = t('dexSub', { n: dn, m: dm });
    // 已收集的項目可以點開，用景點介紹頁再看一次；有照片就放縮圖
    const ent = (k, key, title, sub, text) => { const im = spotInfo(key)?.images?.[0]?.file; return `<li class="open" data-k="${k}"><div class="t"><b>${title}</b><small>${sub}</small><p>${text}</p></div>${im ? `<img src="${im}" alt="">` : ''}<i class="chev"></i></li>`; };
    // 靈門用守門獸的小圖代替 emoji；還沒打開的只顯示剪影
    const bimg = n => BEAST_IMG[n.id] ? `<img class="bi" src="img/beasts/${BEAST_IMG[n.id]}.png" alt="">` : '';
    const gate = n => n.awake ? ent('g:' + n.id, n.id, `${bimg(n)}${n.name}${t('sep')}${n.hill}`, `${t('beast_' + n.id)}${t('sep')}${n.seal}${t('sep')}${n.virtue}`, n.info) : `<li class="lock open" data-k="xg:${n.id}"><div class="t"><b>${bimg(n)}？？？</b><small>${n.seal}</small></div><i class="chev"></i></li>`;
    const sec = (label, list, ok) => `<li class="sec">${label}<em>${list.filter(ok).length}/${list.length}</em></li>`;
    $('#dexList').innerHTML = sec(t('secMountain'), S1, n => n.awake) + S1.map(gate).join('')
      + (stage1Done() ? sec(t('secTales'), TALES, x => visited.has(x.id)) + TALES.map(s => visited.has(s.id) ? ent('t:' + s.id, s.id, s.name, s.sub, s.text) : `<li class="lock open" data-k="xt:${s.id}"><div class="t"><b>？？？</b><small>${s.sub.split('・')[1]}</small></div><i class="chev"></i></li>`).join('') : '')
      + (stage1Done() && talesDone() ? sec(t('secFlows'), S2, n => n.awake) + S2.map(gate).join('') : '')
      + (REAL.some(x => !x.tale && visited.has(x.id)) ? `<li class="sec">${t('secCulture')}</li>` + REAL.filter(x => !x.tale && visited.has(x.id)).map(x => ent('r:' + x.id, x.id, x.name, x.sub, x.text)).join('') : '')
      + sec(t('beauty'), SPOTS, x => x.found)
      + SPOTS.map(sp => sp.found ? ent('s:' + sp.id, sp.id, sp.name, sp.area, sp.text) : `<li class="lock open" data-k="xs:${sp.id}"><div class="t"><b>？？？</b><small>${sp.area.split(/・|, | · /)[0]}</small></div><i class="chev"></i></li>`).join('');
    syncAch();
    $('#qi').textContent = t('qiOf', { n: avail(), cost: COST });
    $('#qibar').style.width = Math.min(100, avail() / COST * 100) + '%';
    const stars = n => ' ' + '★'.repeat(n.star);
    const dots = list => list.map(n => `<i class="${n.awake ? 'done' : ''}"></i>`).join('');
    let head, title, sub;
    if (talesStage()) {
      const got = TALES.filter(s => visited.has(s.id)).length, tg = radarTarget();
      head = t('talesHead'); $('#qchips').innerHTML = TALES.map(s => `<i class="${visited.has(s.id) ? 'done' : ''}"></i>`).join('');
      title = t('talesTitle', { n: got, m: TALES.length });
      const gt = !G.geo && guideTarget();
      sub = G.geo ? (tg ? tg.name + t('sep') + fmt(meters(geo.pos, tg)) : '') : gt ? gt.name + t('sep') + t('guideSteps', { n: Math.round(Math.hypot(gt.pos[0] - P.x, gt.pos[2] - P.z)) }) : '';
      $('#qlist').innerHTML = TALES.map(s => `<li class="${visited.has(s.id) ? 'done' : ''}"><span>${visited.has(s.id) ? '✓' : '・'}</span>${s.name}<small>${visited.has(s.id) ? t('taleFound') : s.sub.split('・')[1] + (G.geo ? t('sep') + fmt(meters(geo.pos, s)) : '')}</small></li>`).join('')
        + `<li class="note">${t('talesNote')}</li><li class="note">${xiuLine()}</li>`;
    } else if (!G.gateOpen && stage1Done()) {
      const left = S2.filter(n => !n.awake);
      head = t('stage2Head'); $('#qchips').innerHTML = dots(S2);
      title = G.realm < REQ ? t('train2', { realm: REALMS[REQ] }) : t('wake2');
      sub = G.realm < REQ ? xiuLine() : left.map(n => G.geo ? placeOf(n) : n.name).join(t('list'));
      $('#qlist').innerHTML = S2.map(n => `<li class="${n.awake ? 'done' : G.realm >= REQ ? '' : 'wait'}"><span>${n.awake ? '✓' : n.icon}</span>${n.seal}${t('sep')}${n.name}${stars(n)}<small>${n.awake ? n.virtue : (G.realm < REQ ? t('needRealmShort', { realm: REALMS[REQ], now: REALMS[G.realm] }) + t('sep') : '') + (G.geo ? t('questGeo', { place: placeOf(n), hill: n.hill }) : n.hill)}${FLOW_SPOTS[n.id] ? `<em class="fs">${t('flowSpots', { list: flowSpots(n).map(sp => (sp.found ? '✓' : '') + sp.name).join(t('list')) })}</em>` : ''}</small></li>`).join('')
        + `<li class="note">${t('questNote2', { cost: COST, realm: REALMS[REQ] })}</li><li class="note">${xiuLine()}</li>`;
    } else if (!G.gateOpen) {
      const n = nextGate();
      head = t('stage1Head'); $('#qchips').innerHTML = dots(S1);
      title = t('goTo', { name: n.name });
      sub = G.geo ? placeOf(n) + t('sep') + t('orIsland', { hill: n.hill }) : n.hint + t('sep') + n.hill;
      $('#qlist').innerHTML = S1.map(n => `<li class="${n.awake ? 'done' : n === nextGate() ? '' : 'wait'}"><span>${n.awake ? '✓' : n.icon}</span>${n.seal}${t('sep')}${n.name}${stars(n)}<small>${n.awake ? n.virtue : n !== nextGate() ? t('waitPrev') : G.geo ? t('questGeo', { place: placeOf(n), hill: n.hill }) : n.hint + t('sep') + n.hill}</small></li>`).join('')
        + `<li class="note">${t('questNote', { cost: COST })}</li><li class="note">${xiuLine()}</li>`;
    } else {
      head = t('stageDoneHead'); $('#qchips').innerHTML = '';
      title = t('questDone'); sub = G.geo ? t('gateWaits') : t('xiWaits');
      $('#qlist').innerHTML = (G.geo ? `<li><span>⛩</span>${t('backVenue')}<small>${t('gateWaits')}</small></li>` : '') + `<li><span>⛩</span>${t('islandGate')}<small>${t('xiWaits')}</small></li>`;
    }
    $('#qhead').textContent = head; $('#qsub').textContent = sub;
    if ($('#qtitle').textContent !== title) { $('#qtitle').textContent = title; peekQuest(); }
    $('#quest .qi').style.display = G.gateOpen ? 'none' : '';
  }
  const sb = $('#btnSense');
  sb.style.setProperty('--cd', G.senseCd > 0 ? (G.senseCd / 9 * 100).toFixed(1) + '%' : '0%');
  sb.classList.toggle('ready', G.senseCd <= 0);
}

// 小地圖：島嶼底圖只畫一次
const mini = $('#mini'), mg = mini.getContext('2d'), base = document.createElement('canvas');
base.width = base.height = N;
const LAND = { x0: N, z0: N, x1: 0, z1: 0 };   // 陸地範圍，滿版地圖用來剛好框住全島
{
  const g = base.getContext('2d'), img = g.createImageData(N, N);
  for (let i = 0; i < N * N; i++) {
    const k = world.K[i], h = world.H[i];
    let c = k === T.SEA ? [28, 70, 120] : k === T.SAND ? [220, 205, 160] : k === T.ROCK ? [150, 155, 160] : (k === T.ROAD || k === T.BUILDING || k === T.TOWER || k === T.STONE) ? [170, 176, 186] : [90 - h * 2, 170 - h * 4, 80];
    if (k === T.SEA && Math.abs((i % N) - curX(i / N | 0)) < CURRENT.half) c = [60, 130, 190];
    img.data.set([...c, 255], i * 4);
  }
  g.putImageData(img, 0, 0);
  for (let i = 0; i < N * N; i++) if (world.K[i] !== T.SEA) { const x = i % N, z = i / N | 0; LAND.x0 = Math.min(LAND.x0, x); LAND.x1 = Math.max(LAND.x1, x + 1); LAND.z0 = Math.min(LAND.z0, z); LAND.z1 = Math.max(LAND.z1, z + 1); }
  for (const kk of ['x0', 'z0']) LAND[kk] = Math.max(0, LAND[kk] - 4);
  for (const kk of ['x1', 'z1']) LAND[kk] = Math.min(N, LAND[kk] + 4);
}
function drawMini() {
  drawMap(mini, mg, false);
  if (!bigEl.hidden) {
    drawMap(bigCv, bg, true);
    const g = guideTarget(), sub = t('mapNext', { name: g.name });
    if ($('#mapSub').textContent !== sub) $('#mapSub').textContent = sub;
  }
}
let bigZoom = 1;   // 滿版地圖的放大倍數：1＝整座島剛好塞滿螢幕，雙指可再放大（放大時改以「我」為中心）
function drawMap(cv, mg, big) {
  // 小地圖看整個世界；滿版地圖先看全島全貌，放大後跟著「我」
  const dpr = Math.min(devicePixelRatio, 2), cw = cv.width = Math.round(cv.clientWidth * dpr), ch = cv.height = big ? Math.round(cv.clientHeight * dpr) : cw;
  if (!cw || !ch) return;
  const s = Math.min(cw, ch);
  let k = s / N, x0 = 0, z0 = 0;
  if (big) {
    const top = 96 * dpr, bw = LAND.x1 - LAND.x0, bh = LAND.z1 - LAND.z0;   // 上方留給標題卡
    k = Math.min(cw / bw, (ch - top) / bh) * bigZoom;
    const f = clamp(bigZoom - 1, 0, 1), cx = (LAND.x0 + LAND.x1) / 2 + (P.x - (LAND.x0 + LAND.x1) / 2) * f, cz = (LAND.z0 + LAND.z1) / 2 + (P.z - (LAND.z0 + LAND.z1) / 2) * f;
    const wx = cw / k, wz = (ch - top) / k;
    x0 = wx < N ? clamp(cx - wx / 2, 0, N - wx) : cx - wx / 2;
    z0 = (wz < N ? clamp(cz - wz / 2, 0, N - wz) : cz - wz / 2) - top / k;
  }
  const q = (s / N) * Math.sqrt(S) * (big ? (cw > ch ? 1 : 1.5) : 1);   // q：標記大小，島變大時標記不會縮成一點
  mg.imageSmoothingEnabled = false; mg.fillStyle = 'rgb(28,70,120)'; mg.fillRect(0, 0, cw, ch);
  { // 只畫底圖落在世界範圍內的部分
    const sx = Math.max(0, x0), sz = Math.max(0, z0), ex = Math.min(N, x0 + cw / k), ez = Math.min(N, z0 + ch / k);
    if (ex > sx && ez > sz) mg.drawImage(base, sx, sz, ex - sx, ez - sz, (sx - x0) * k, (sz - z0) * k, (ex - sx) * k, (ez - sz) * k);
  }
  mg.save(); mg.translate(-x0 * k, -z0 * k);
  const dot = (x, z, col, rad) => { mg.fillStyle = col; mg.beginPath(); mg.arc(x * k, z * k, rad * q, 0, 7); mg.fill(); };
  for (const n of NODES) dot(n.pos[0], n.pos[2], n.awake ? '#ffcf5a' : n.stage === 2 && !stage1Done() ? 'rgba(150,165,180,.7)' : `rgba(255,190,110,${0.6 + 0.4 * Math.sin(G.t * 4)})`, n.stage === 2 ? 2.2 : 3.2);
  dot(GATE[0], GATE[2], G.gateOpen ? '#ffcf5a' : '#b9483c', 3.2);
  const gt = guideTarget();
  if ((guideOn || big) && gt.pos) { // 指引的目的地：金色脈動圈＋虛線（城市故事只在現世，島上不畫）
    const g = gt, x = g.pos[0] * k, z = g.pos[2] * k;
    mg.setLineDash([3 * q, 3 * q]); mg.strokeStyle = 'rgba(255,207,90,.85)'; mg.lineWidth = q; mg.beginPath(); mg.moveTo(P.x * k, P.z * k); mg.lineTo(x, z); mg.stroke(); mg.setLineDash([]);
    mg.lineWidth = 1.4 * q; mg.beginPath(); mg.arc(x, z, (6 + 2 * Math.sin(G.t * 4)) * q, 0, 7); mg.stroke();
    const m = 14 * q, lx = x0 * k + m, rx = x0 * k + cw - m, tz = z0 * k + 96 * dpr, bz = z0 * k + ch - m;
    if (big && (x < lx || x > rx || z < tz || z > bz)) { // 下一站在畫面外：在邊緣放一顆金色箭頭指過去
      const px = P.x * k, pz = P.z * k, dx = x - px, dz = z - pz, a = Math.atan2(dz, dx);
      const f = Math.min(dx ? ((dx > 0 ? rx : lx) - px) / dx : 1e9, dz ? ((dz > 0 ? bz : tz) - pz) / dz : 1e9), ex = px + dx * f, ez = pz + dz * f;
      mg.save(); mg.translate(ex, ez); mg.rotate(a); mg.fillStyle = '#ffcf5a'; mg.strokeStyle = 'rgba(6,14,26,.85)'; mg.lineWidth = 2 * dpr;
      mg.beginPath(); mg.moveTo(8 * q, 0); mg.lineTo(-6 * q, 6 * q); mg.lineTo(-6 * q, -6 * q); mg.closePath(); mg.stroke(); mg.fill(); mg.restore();
    }
  }
  for (const [k2, c] of CHAPS.entries()) {
    const m = 7 * q / k, vx0 = Math.max(0, x0), vz0 = Math.max(0, z0 + (big ? 96 * dpr / k : 0)), vx1 = Math.min(N, x0 + cw / k), vz1 = Math.min(N, z0 + ch / k);
    if (big && bigZoom > 1.05 && (c.x < vx0 || c.x > vx1 || c.z < vz0 || c.z > vz1)) continue;   // 放大時畫面外的章節入口不硬塞到邊上
    const x = clamp(c.x, vx0 + m, vx1 - m) * k, z = clamp(c.z, vz0 + m, vz1 - m) * k, rr = 5 * q;
    mg.save(); mg.beginPath(); mg.arc(x, z, rr, 0, 7); mg.closePath(); mg.fillStyle = '#0b1a2c'; mg.fill(); mg.clip();
    if (chapImg[k2].complete && chapImg[k2].naturalWidth) mg.drawImage(chapImg[k2], x - rr, z - rr, rr * 2, rr * 2);
    mg.restore(); mg.strokeStyle = c.col; mg.lineWidth = 0.9 * q; mg.beginPath(); mg.arc(x, z, rr, 0, 7); mg.stroke();
  }
  for (const sp of SPOTS) if (sp.r) { mg.strokeStyle = '#fff'; mg.lineWidth = q * 0.8; mg.beginPath(); mg.arc((sp.pos[0] + 0.5) * k, (sp.pos[1] + 0.5) * k, 2 * q, 0, 7); sp.found ? (mg.fillStyle = '#fff', mg.fill()) : mg.stroke(); }
  if (big) { // 滿版時把「我」放大，外面一圈脈動光，旁邊寫「你在這裡」
    const px = P.x * k, pz = P.z * k, pr = (10 + 3 * Math.sin(G.t * 4)) * q;
    mg.fillStyle = 'rgba(88,176,234,.25)'; mg.beginPath(); mg.arc(px, pz, pr * 1.6, 0, 7); mg.fill();
    mg.strokeStyle = '#fff'; mg.lineWidth = 1.2 * q; mg.beginPath(); mg.arc(px, pz, pr, 0, 7); mg.stroke();
    mg.font = `900 ${16 * dpr}px sans-serif`; mg.textAlign = 'center'; mg.lineWidth = 4 * dpr; mg.strokeStyle = 'rgba(6,14,26,.85)';
    const ty = pz - pr * 1.6 - 6 * dpr - z0 * k < 90 * dpr ? pz + pr * 1.6 + 20 * dpr : pz - pr * 1.6 - 6 * dpr;
    mg.strokeText(t('youHere'), px, ty); mg.fillStyle = '#fff'; mg.fillText(t('youHere'), px, ty);
  }
  const ps = big ? 1.8 : 1;
  mg.save(); mg.translate(P.x * k, P.z * k); mg.rotate(-P.yaw); mg.scale(q * ps / k, q * ps / k);
  mg.fillStyle = '#fff'; mg.strokeStyle = '#123'; mg.lineWidth = k; mg.beginPath();
  mg.moveTo(0, 5 * k); mg.lineTo(3.4 * k, -3 * k); mg.lineTo(-3.4 * k, -3 * k); mg.closePath(); mg.fill(); mg.stroke(); mg.restore();
  mg.restore();
}

// ---------- 劇情對話 ----------
const LINES = {
  zh: [
    '你也聽見了嗎？山裡，有一陣不存在的鐘聲。',
    '山有脈，海有流，人亦有自己的道。城市邊上，有四座守門的山還在沉睡。',
    '收集發光的「靈光」，按「感知」就能看見平常看不見的東西。',
    '台北 101 東邊的四獸山，是城市之流和山之流交會的四道靈門。',
    '依序開啟：象門、虎門、豹門、獅門。四印齊了，四獸共鳴，城海山三流就會甦醒；邊走邊修行，三流歸一，台北靈門就會打開。',
    '路上也去看看這座島：日月潭、阿里山、太魯閣、墾丁……每一處都會收進你的圖鑑。',
    '我在西邊的台北靈門等你。走出去，遇見你的機緣。',
  ],
  en: [
    'Did you hear it too? A bell that doesn\'t exist, ringing in the mountains.',
    'Mountains have veins, the sea has currents, and people have their own way. At the edge of the city, four guardian mountains are still asleep.',
    'Collect the glowing Spirit Light. Press "Sense" to see what is usually hidden.',
    'East of Taipei 101, the Four Beasts Mountains are four spirit gates where the flow of the city meets the flow of the mountains.',
    'Open them in order: Elephant, Tiger, Leopard, Lion. With all four seals the beasts resonate and the three flows of city, sea and mountain awaken. Keep walking to cultivate; when the three flows unite, the Taipei Spirit Gate opens.',
    'Along the way, see the island too: Sun Moon Lake, Alishan, Taroko, Kenting… each goes into your field guide.',
    'I\'ll wait for you at the Taipei Spirit Gate in the west. Go out and meet your encounters.',
  ],
  ja: [
    'あなたにも聞こえた？山の奥で、存在しないはずの鐘が鳴っている。',
    '山に脈あり、海に流れあり、人にもまた道あり。街のはずれで、四つの守りの山がまだ眠っている。',
    '光る「霊光」を集めて。「感知」を押すと、ふだん見えないものが見えてくる。',
    '台北101の東にある四獣山は、街の流れと山の流れが交わる四つの霊門。',
    '順番に開こう：象門、虎門、豹門、獅門。四つの印がそろえば四獣が共鳴し、街・海・山の三流が目覚める。歩いて修行し、三流が一つになれば台北霊門が開く。',
    '途中で島もめぐってみて：日月潭、阿里山、太魯閣、墾丁……どこも図鑑に載っていくよ。',
    '西の台北霊門で待ってる。外へ出て、あなたの縁に出会おう。',
  ],
}[lang];
const GEO_LINES = {
  zh: [
    '你也聽見了嗎？這座城市底下，有一陣不存在的鐘聲。',
    '山有脈，海有流，人亦有自己的道。靈脈就藏在我們身邊的街道裡。',
    '打開「現世」雷達，走到附近的地點。靠近時，手機會感應到機緣。',
    '四獸山是城市之流和山之流交會的四道靈門。走一段文化徑，就能開啟山林徑上的靈門。',
    '依序走：象門在華山1914，虎門在台灣文學基地，豹門在濟南教會，獅門在善導寺。',
    '走人行道、注意來車喔。到了地點，牠們就會現身。',
    '四印齊了，台北各處會浮現七個城市故事。找齊之後，城海山三流會在台北車站、光華、監察院甦醒，要走到化流境才淨化得了。三流歸一，就回到這裡打開台北靈門。',
  ],
  en: [
    'Did you hear it too? A bell that doesn\'t exist, ringing beneath this city.',
    'Mountains have veins, the sea has currents, and people have their own way. Spirit veins hide in the streets around us.',
    'Open the "Real World" radar and walk to nearby places. When you get close, your phone senses an encounter.',
    'The Four Beasts Mountains are four spirit gates where the city\'s flow meets the mountains\'. Walk a Culture Trail to open the gates on the Mountain Trail.',
    'In order: the Elephant Gate is at Huashan 1914, the Tiger Gate at the Taiwan Literature Base, the Leopard Gate at Jinan Church, and the Lion Gate at Shandao Temple.',
    'Stay on the sidewalk and watch for cars. When you arrive, the beasts will appear.',
    'With all four seals, seven city stories surface across Taipei. Find them all and the three flows awaken at Taipei Main Station, Guanghua and the Control Yuan; you will need Flow-Shaping to purify them. When the three flows unite, come back here to open the Taipei Spirit Gate.',
  ],
  ja: [
    'あなたにも聞こえた？この街の下で、存在しないはずの鐘が鳴っている。',
    '山に脈あり、海に流れあり、人にもまた道あり。霊脈はわたしたちのすぐそばの街に隠れている。',
    '「現世」レーダーを開いて、近くの場所へ歩いてみて。近づくと、スマホが縁を感じ取る。',
    '四獣山は、街の流れと山の流れが交わる四つの霊門。文化の道を歩けば、山林の道の霊門が開く。',
    '順番に：象門は華山1914、虎門は台湾文学基地、豹門は済南教会、獅門は善導寺。',
    '歩道を歩いて、車に気をつけてね。着いたら、獣たちが姿を現すよ。',
    '四つの印がそろうと、台北のあちこちに七つの街の物語が浮かび上がる。全部見つけたら、台北駅・光華・監察院で三流が目覚める。浄化するには化流境が必要。三流が一つになったら、ここに戻って台北霊門を開こう。',
  ],
}[lang];
let talk = null;
function say(lines, done, who = t('xi')) {
  talk = { lines, i: 0, done, who }; showLine(); $('#dialog').classList.add('show');
}
// 一句台詞可以是字串，或 { title, text }：重要說明，用金框顯示，按「我知道了」才關
function showLine() {
  const l = talk.lines[talk.i], em = typeof l === 'object';
  $('#dialog').classList.toggle('em', em);
  $('#dialog b').textContent = em ? l.title : talk.who;
  if (em && l.steps) $('#dialog p').innerHTML = '<ol>' + l.steps.map((x, i) => `<li><i>${i + 1}</i><span>${x}</span></li>`).join('') + '</ol>';
  else $('#dialog p').textContent = em ? l.text : l;
  $('#dialog small').textContent = em ? t('gotIt') : t('tapNext');
}
function nextLine() {
  if (!talk) return;
  talk.i++;
  if (talk.i >= talk.lines.length) { const d = talk.done; talk = null; $('#dialog').classList.remove('show'); d && d(); return; }
  showLine();
}
// 對話時點畫面任何地方都能繼續；重要說明（金框）要點框裡的「我知道了」才關，其他地方的點擊先擋掉
addEventListener('pointerdown', e => {
  if (!talk || !$('#dialog').classList.contains('show')) return;
  e.preventDefault(); e.stopPropagation();
  if (!$('#dialog').classList.contains('em') || e.target.closest('#dialog')) nextLine();
}, true);

function start(mode) {
  initAudio();
  $('#title').classList.add('hide');
  G.state = 'intro'; G.geo = mode === 'geo'; $('#hud').classList.add('on'); document.body.classList.toggle('spiritmode', !G.geo);
  // 手機上操作說明 10 秒後收起，讓畫面留給地圖
  if (innerWidth < 600) setTimeout(() => { $('.hint').style.display = 'none'; }, 10000);
  cam.yaw = 0; cam.tx = P.x; cam.ty = P.y + 1.5; cam.tz = P.z;
  if (G.geo) geo.start();
  say([...(G.geo ? GEO_LINES : LINES), { title: t('goTitle'), steps: [t('goS1'), t('goS2'), t('goS3')] }], () => {
    G.state = 'play'; $('#hud').classList.add('play'); XI.wave = false;
    pop(t('firstSeal'), 'gold');
    // 不直接跳進雷達：讓雷達按鈕發光＋小提示，由玩家自己點開
    if (G.geo) setTimeout(nudgeRadar, 900);
  });
  try { if (matchMedia('(pointer: coarse)').matches && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => { }); } catch { }
}
$('#title .start').addEventListener('click', () => start('geo'));
$('#title .spirit').addEventListener('click', () => start('island'));
// 版本號：頁面和程式各自的版本，不一致時兩個都列出來，方便判斷是不是快取到舊檔
{
  const el = $('#title .ver'), hv = el.dataset.v.startsWith('__') ? 'dev' : el.dataset.v, jv = new URL(import.meta.url).searchParams.get('v') || 'dev';
  el.textContent = 'v' + VERSION + (hv === jv ? '' : ' · ' + t('verStale'));
  $('#verV').textContent = 'v' + VERSION;
  $('#verB').textContent = hv === jv ? 'build ' + jv : `html ${hv} · js ${jv}`;
}
$('#title .alt')?.addEventListener('click', () => start('island'));
$('#again').addEventListener('click', () => location.reload());

// ---------- 介紹影片：第一次開啟時自動播放，之後可從片頭／片尾按鈕重看 ----------
const FILM_KEY = 'oceanflow.filmSeen';
const film = $('#film'), video = film.querySelector('video');
function closeFilm() {
  video.pause(); film.classList.remove('show', 'muted');
  window.armTitle?.();
  try { localStorage.setItem(FILM_KEY, '1'); } catch { }
}
// 手機直拿播直式（9:16），橫拿或電腦播橫式；播放中轉向就換檔、接著同一秒播
const tall = matchMedia('(orientation: portrait)');
function filmSrc() {
  const v = tall.matches ? 'video/intro-portrait' : 'video/intro';
  if (video.dataset.v === v) return false;
  video.dataset.v = v; video.poster = v + '-poster.jpg'; video.src = v + '.mp4'; return true;
}
tall.addEventListener('change', () => {
  if (!film.classList.contains('show')) return;
  const at = video.currentTime, playing = !video.paused;
  if (filmSrc()) video.addEventListener('loadedmetadata', () => { video.currentTime = at; if (playing) video.play().catch(() => { }); }, { once: true });
});
function openFilm() {
  film.classList.add('show'); film.classList.remove('muted');
  filmSrc(); video.muted = false; video.currentTime = 0;
  // 瀏覽器常擋有聲自動播放：擋了就先靜音播放，顯示「點一下開聲音」
  video.play().catch(() => { video.muted = true; film.classList.add('muted'); video.play().catch(() => { video.controls = true; }); });
}
video.addEventListener('ended', closeFilm);
film.querySelector('.skip').addEventListener('click', e => { e.stopPropagation(); closeFilm(); });
film.querySelector('.sound').addEventListener('click', e => { e.stopPropagation(); video.muted = false; film.classList.remove('muted'); video.play().catch(() => { }); });
film.addEventListener('click', () => { if (video.muted) { video.muted = false; film.classList.remove('muted'); } else if (video.paused) video.play().catch(() => { }); else video.pause(); });
for (const b of document.querySelectorAll('.film-btn')) b.addEventListener('click', e => { e.stopPropagation(); openFilm(); });
// 每次開啟都先播介紹影片（可略過），之後才到主畫面
const wantFilm = !params.has('play') && !params.has('geo') && !params.has('nofilm') && !params.has('demo');

// ---------- 開場：點一下開始 ----------
// 瀏覽器不讓影片自己有聲播放，要先有一次點擊；趁這一頁提示「加到主畫面」
const launch = $('#launch'), A2HS_KEY = 'oceanflow.a2hsShown';
const standalone = matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches || navigator.standalone === true;
const ua = navigator.userAgent, ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const mobile = ios || /Android/.test(ua);
let a2hsShown = false, installEvt = null;
try { a2hsShown = !!localStorage.getItem(A2HS_KEY); } catch { }
const showA2hs = mobile && !standalone && !params.has('noa2hs');
if (showA2hs) {
  const box = launch.querySelector('.a2hs'), p = box.querySelector('p');
  box.hidden = false;
  // iOS 只有 Safari 能加到主畫面；LINE、FB、Chrome 等內建瀏覽器要先換到 Safari
  if (ios) { const safari = !/CriOS|FxiOS|EdgiOS|Line\/|FBAN|FBAV|Instagram/.test(ua); p.innerHTML = t(safari ? 'a2hsIos' : 'a2hsIosApp'); }
  else p.innerHTML = t('a2hsOther');
}
// Android Chrome 會給安裝事件，可以直接跳出「安裝」視窗
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; const b = launch.querySelector('.install'); b.hidden = false; launch.querySelector('.a2hs p').textContent = t('tipHomeAndroid'); });
launch.querySelector('.install').addEventListener('click', async e => { e.stopPropagation(); if (!installEvt) return; installEvt.prompt(); await installEvt.userChoice.catch(() => { }); installEvt = null; e.target.hidden = true; });
// 已從主畫面開啟（獨立模式）：跳過開場提醒和介紹影片，直接到「啟程」主畫面（影片之後還能從選單看）
if (standalone) launch.classList.remove('show');
// 電腦版：不需要加到主畫面，直接播介紹影片（有聲被擋就先靜音播，點一下開聲音）
else if (!mobile) { launch.classList.remove('show'); if (wantFilm) openFilm(); }
else if (!params.has('play') && !params.has('geo') && !params.has('demo') && (wantFilm || (showA2hs && !a2hsShown))) {
  launch.classList.add('show');
  if (!wantFilm) launch.querySelector('.tip').hidden = true;
  launch.querySelector('.go').addEventListener('click', () => {
    launch.classList.remove('show');
    try { localStorage.setItem(A2HS_KEY, '1'); } catch { }
    if (wantFilm) openFilm();   // 這一下點擊讓影片可以直接有聲播放
    else window.armTitle?.();
  });
}

// 片頭「洋流」與「啟程」第一次滑開時的音效；音效通道要在第一次點擊時打開
addEventListener('pointerdown', () => unlockAudio(), { once: true, capture: true });
addEventListener('of-title-open', () => { if (G.state === 'title') sfx.reveal(); }, { once: true });

// ---------- 玩法 ----------
function doSense() {
  if (G.state !== 'play' || G.senseCd > 0) return;
  G.sense = perk('lens') ? 10 : 6; G.senseCd = 9; G.pulse = [P.x, P.z, 0, 1]; sfx.sense();
  const target = nextGate() || { name: t('gateName'), pos: GATE };
  const [rel, n] = islandRel(target.pos);
  toast(t('senseToast', { name: target.name, rel, n }));
}

function burst(x, y, z, col, n = 40, sp = 6) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, u = Math.random() * 2 - 1, s = sp * (0.4 + Math.random() * 0.6), q = Math.sqrt(1 - u * u);
    G.particles.push({ x, y, z, vx: Math.cos(a) * q * s, vy: Math.abs(u) * s + 2, vz: Math.sin(a) * q * s, life: 1 + Math.random(), col });
  }
}

function buildVein(n) {
  const b = new Builder(), [x0, , z0] = n.pos, [x1, , z1] = GATE, len = Math.hypot(x1 - x0, z1 - z0), steps = Math.ceil(len / 0.7);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, x = lerp(x0, x1, t) + Math.sin(t * 12 + x0) * 0.8, z = lerp(z0, z1, t) + Math.cos(t * 10 + z0) * 0.8;
    const y = Math.max(ground(x, z), WATER) + 0.02;
    b.box(x - 0.2, y, z - 0.2, 0.4, 0.12, 0.4, hex('#ffd98a'), 1);
  }
  // 開門時亮一下、連到台北靈門，幾秒後就收起來，不留在地上
  n.vein = r.mesh(b); n.veinEnd = G.t + 6;
}

function updateWilds(dt) {
  G.wildCd = Math.max(0, (G.wildCd || 0) - dt);
  const live = G.state === 'play' && G.playT > 20 && !talk;
  for (const w of wilds) {
    if (w.gone) { w.gone = Math.max(0, w.gone - dt); if (!w.gone) placeWild(w); continue; }
    const dx = P.x - w.x, dz = P.z - w.z, d = Math.hypot(dx, dz);
    const chase = live && !G.wildCd && d < 9 && !P.swim;
    if (chase && !w.chase && G.t - (G.wildWarnT ?? -99) > 6) { G.wildWarnT = G.t; sfx.deny(); toast(t('wildNear', { beast: t('beast_' + w.kind) })); }
    w.chase = chase;
    let tx = w.hx + Math.sin(G.t * 0.4 + w.hx) * 3 - w.x, tz = w.hz + Math.cos(G.t * 0.35 + w.hz) * 3 - w.z, sp = 1.2;
    if (chase) { tx = dx; tz = dz; sp = 3.2; }
    const td = Math.hypot(tx, tz);
    if (td > 0.3) {
      const nx = w.x + tx / td * sp * dt, nz = w.z + tz / td * sp * dt, gx = Math.floor(nx), gz = Math.floor(nz);
      if (gx > 1 && gz > 1 && gx < N - 2 && gz < N - 2 && world.land[gz * N + gx] && world.K[gz * N + gx] !== T.BUILDING && world.K[gz * N + gx] !== T.TOWER) { w.x = nx; w.z = nz; }
      w.yaw = Math.atan2(tx, tz) + Math.PI;
    }
    if (chase && d < 1.4) wildFight(w);
  }
}
function wildFight(w) {
  G.wildCd = 8; w.chase = false;
  if (params.has('nobattle')) { w.gone = 45; G.bonus += WILD_GAIN; G.wildWins = (G.wildWins || 0) + 1; return; }
  const node = { id: w.kind, wild: true, star: 1, name: t('wildName', { beast: t('beast_' + w.kind) }) };
  G.state = 'battle'; $('#hud').classList.remove('play', 'on'); $('#card').classList.remove('show'); sfx.battle(true);
  battle(node, G.realm, REALMS[G.realm], [t('rwLight', { n: WILD_GAIN })]).then(ok => {
    sfx.battle(false); G.state = 'play'; $('#hud').classList.add('play', 'on'); G.wildCd = 8;
    if (ok) { xiDance(); w.gone = 45; G.bonus += WILD_GAIN; G.wildWins = (G.wildWins || 0) + 1; burst(w.x, ground(w.x, w.z) + 1.5, w.z, [1, 0.85, 0.5], 40, 5); pop(t('wildWin', { n: WILD_GAIN }), 'gold'); }
    else {
      const loss = Math.min(WILD_LOSS, avail()); G.bonus -= loss;
      // 被打退：往後退幾步，濁影也先離開
      const a = Math.atan2(P.x - w.x, P.z - w.z); P.x += Math.sin(a) * 3; P.z += Math.cos(a) * 3; w.gone = 20;
      toast(loss ? t('wildLose', { n: loss }) : t('wildLose0'));
    }
  });
}

// 第一章終極 BOSS 濁淵：擋在台北靈門前，四關連戰（最高難度）要一次打完；輸了或離開，靈光全部清空
const BOSS_COST = 6;
function bossFight() {
  if (avail() < BOSS_COST) { sfx.deny(); toast(t('bossNeed', { n: BOSS_COST, have: avail() })); return; }
  if (params.has('nobattle')) { G.bossDone = true; dropToken(); return; }
  const node = { id: 'boss', boss: true, star: 3, name: t('beast_boss') };
  G.state = 'battle'; $('#hud').classList.remove('play', 'on'); $('#card').classList.remove('show'); sfx.battle(true);
  battle(node, G.realm, REALMS[G.realm], [t('rwBoss'), t('rwFinal'), t(G.geo ? 'rwToken' : 'rwTokenSpirit')]).then(ok => {
    sfx.battle(false); G.state = 'play'; $('#hud').classList.add('play', 'on'); G.wildCd = 8;
    if (ok) { xiDance(6); G.bossDone = true; burst(GATE[0], GATE[1] + 3, GATE[2] - 1.6, [1, 0.85, 0.5], 120, 10); sfx.gate(); pop(t('bossWin'), 'gold'); dropToken(); }
    else { G.bonus -= avail(); P.z = GATE[2] - 5; toast(t('bossLose')); }
  });
}

// 過關後阿汐跑到身邊跳舞慶祝幾秒，跳完回原位
function xiDance(sec = 4.5) {
  if (!XI.home) XI.home = [XI.x, XI.z, XI.yaw];
  const a = cam.yaw + 0.9; XI.x = P.x + Math.sin(a) * 1.8; XI.z = P.z + Math.cos(a) * 1.8; XI.yaw = Math.atan2(P.x - XI.x, P.z - XI.z);
  XI.danceEnd = G.t + sec;
}
// 開門前先淨化擋在門前的濁流；?nobattle 可跳過（測試用）
function fight(n, then) {
  if (params.has('nobattle')) return then();
  G.state = 'battle'; $('#hud').classList.remove('play', 'on'); $('#card').classList.remove('show'); sfx.battle(true);
  const rw = [t('rwGate', { seal: n.seal, name: n.name }), t('rwBeast', { beast: t('beast_' + n.id) })];
  if (n.stage === 1 && S1.filter(m => !m.awake).length === 1) rw.push(t('rwStage2'));
  battle(n, G.realm, REALMS[G.realm], rw).then(ok => { sfx.battle(false); G.state = 'play'; $('#hud').classList.add('play', 'on'); if (ok) { xiDance(); then(); } else toast(t('battleLeft', { name: n.name })); });
}

function awaken(n) {
  breakthrough();
  n.awake = true; n.flash = 1; G.spent += COST; G.awakened++;
  sfx.bell(n.bell || 196);
  pop(t('gateOpened', { seal: n.seal, icon: n.icon, name: n.name }), 'gold');
  const s2 = n.stage === 2, k2 = S2.filter(m => m.awake).length;
  setTimeout(() => showCard(n.name + t('sep') + n.hill, t(s2 ? 'cardSub2' : 'cardSub', { seal: n.seal, virtue: n.virtue }), n.info + (G.awakened === 1 ? '\n\n' + SHOUSHAN : ''), s2 ? t('cardEm2', { n: k2, virtue: n.virtue }) : t('cardEm', { n: G.awakened, virtue: n.virtue }), n.id), 1300);
  burst(n.pos[0], n.pos[1] + 1.5, n.pos[2], [1, 0.85, 0.45], 70, 8);
  buildVein(n);
  G.spiritTarget = G.awakened / NODES.length * 0.85;
  setSpirit(G.spiritTarget);
  try { navigator.vibrate && navigator.vibrate([40, 60, 80]); } catch { }
  if (n.stage === 1 && stage1Done()) setTimeout(resonance, 3600);
  else if (n.stage === 2 && S2.every(m => m.awake)) setTimeout(unite, 3600);
  else { const nx = nextGate(); setTimeout(() => toast(t('nextSeal', { icon: nx.icon, name: nx.name, where: G.geo ? placeOf(nx) : nx.hill })), 1400); }
}

// 四獸共鳴：四座靈門的光同時升起，第二階城海山三流隨後開放
function resonance() {
  for (const n of S1) { n.flash = 1; burst(n.pos[0], n.pos[1] + 2, n.pos[2], [1, 0.85, 0.45], 50, 9); }
  // 全畫面：四隻守門獸一起登場怒吼，收起後才告訴你第二階開了
  roar(t('resSub')).then(() => setTimeout(() => toast(G.geo ? t('talesOpen') : t('talesOpenIsland')), 400));
}
// 三流歸一：城、海、山三道光一起升起，台北靈門隨後開啟
function unite() {
  for (const n of NODES) { n.flash = 1; burst(n.pos[0], n.pos[1] + 2, n.pos[2], [1, 0.85, 0.45], 40, 9); }
  // 全畫面：龍、龜、熊一起登場齊吼，收起後台北靈門才打開
  roar(t('flowsSub'), { kind: 'flows', title: t('flowsUnite'), beasts: S2.map(n => n.id) }).then(() => setTimeout(openGate, 300));
}

function openGate() {
  G.gateOpen = true; G.gateT = 0; sfx.gate();
  pop(t('gateOpen'), 'gold');
  if (XI.home) XI.home = [GATE[0] + 3.6, GATE[2] - 3, Math.PI]; else { XI.x = GATE[0] + 3.6; XI.z = GATE[2] - 3; XI.yaw = Math.PI; } XI.wave = true;
  burst(GATE[0], GATE[1] + 3, GATE[2], [1, 0.9, 0.5], 90, 10);
  setTimeout(() => toast(G.geo ? t('xiGeo') : t('xiIsland')), 1500);
}

function blocked(x, z, y, step) {
  if (x < 1.5 || z < 1.5 || x > N - 1.5 || z > N - 1.5) return true;
  const rr = 0.3;
  for (const [ox, oz] of [[-rr, -rr], [rr, -rr], [-rr, rr], [rr, rr]]) if (ground(x + ox, z + oz) > y + step) return true;
  return false;
}
const footGround = (x, z) => { const rr = 0.28; let m = -9; for (const [ox, oz] of [[-rr, -rr], [rr, -rr], [-rr, rr], [rr, rr]]) m = Math.max(m, ground(x + ox, z + oz)); return m; };

function updatePlayer(dt) {
  let ix = input.jx, iy = input.jy;
  const k = input.keys;
  if (k.KeyW || k.ArrowUp) iy += 1; if (k.KeyS || k.ArrowDown) iy -= 1;
  if (k.KeyA || k.ArrowLeft) ix -= 1; if (k.KeyD || k.ArrowRight) ix += 1;
  if (k.KeyJ) cam.yaw += dt * 2; if (k.KeyL) cam.yaw -= dt * 2;
  let mag = Math.hypot(ix, iy); if (mag > 1) { ix /= mag; iy /= mag; mag = 1; }
  if (G.state !== 'play') { ix = iy = 0; mag = 0; }
  const fx = Math.sin(cam.yaw), fz = Math.cos(cam.yaw);
  let mx = fx * iy - fz * ix, mz = fz * iy + fx * ix;
  // 現世走路累積的距離：玩家沒操作時，阿流自己朝下一座門走
  if (G.auto > 0 && mag < 0.1 && G.state === 'play' && guideTarget().pos) {
    const tp = guideTarget().pos, dx = tp[0] - P.x, dz = tp[2] - P.z, L = Math.hypot(dx, dz);
    if (L < 2.4) G.auto = 0;
    else { mx = dx / L; mz = dz / L; mag = 1; G.auto -= (P.swim ? 3.8 : 7) * dt; }
  }
  const speed = P.swim ? (perk('goggles') ? 5.2 : 3.8) : 7;   // 再春泳鏡：游得快
  const a = 1 - Math.exp(-dt * 12);
  P.vx = lerp(P.vx, mx * speed, a); P.vz = lerp(P.vz, mz * speed, a);
  if (mag > 0.1) {
    const want = Math.atan2(mx, mz); let d = want - P.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
    P.yaw += d * Math.min(1, dt * 14);
  }
  let vx = P.vx, vz = P.vz, curS = 0;
  if (P.swim) { const c = world.current(P.x, P.z), k = perk('paddle') ? 1.7 : 1; vx += c[0] * k; vz += c[1] * k; curS = c[2]; }   // 艋舺獨木舟槳：乘黑潮更快
  G.riding = curS > 0.4;
  const step = P.swim ? 2.1 : 1.1;
  if (!blocked(P.x + vx * dt, P.z, P.y, step)) P.x += vx * dt;
  if (!blocked(P.x, P.z + vz * dt, P.y, step)) P.z += vz * dt;

  const gnd = footGround(P.x, P.z), deep = gnd < WATER - 1.1;
  // 再春泳鏡：游動時往水裡潛（底下夠深才潛）
  const swimLv = WATER - 1.05 - (perk('goggles') && P.move > 0.3 ? clamp(WATER - 1.45 - gnd, 0, 0.9) : 0);
  if (P.swim) {
    if (!deep) P.swim = false;
    else {
      P.vy = (swimLv - P.y) * 6; P.y += P.vy * dt;
      if (input.jump && G.state === 'play') { P.vy = 10.5; P.swim = false; P.y += 0.05; sfx.splash(); }
    }
  }
  if (!P.swim) {
    P.vy -= 32 * dt; P.y += P.vy * dt;
    if (P.y <= gnd) { P.y = gnd; P.vy = 0; P.onGround = true; }
    else P.onGround = P.y - gnd < 0.04;
    if (deep && P.y < swimLv && P.vy <= 0) { P.swim = true; sfx.splash(); burst(P.x, WATER, P.z, [0.8, 0.95, 1], 14, 3); }
    if (input.jump && P.onGround && G.state === 'play') { P.vy = 12; P.onGround = false; sfx.jump(); }
  }
  P.ry = P.y > P.ry ? lerp(P.ry, P.y, 1 - Math.exp(-dt * 22)) : P.y;
  const sp = Math.hypot(P.vx, P.vz);
  if (sp > 1.5 && G.state === 'play') walkFold();
  P.move = lerp(P.move, Math.min(1, sp / 6), 1 - Math.exp(-dt * 10));
  P.phase += sp * dt * 1.6;
}

function updateGame(dt) {
  if (!G.geo) gainXiu(Math.hypot(P.vx, P.vz) * dt * 2);   // 走路修行：島上半單位算一步
  // 靈光
  for (const m of motes) {
    if (m.taken) continue;
    if (Math.hypot(m.x - P.x, m.z - P.z) < 1.4 && Math.abs(P.y + 0.9 - m.y) < 2) {
      m.taken = true; G.collected++; sfx.pick();
      burst(m.x, m.y, m.z, [0.6, 0.95, 1], 16, 3);
      toast(t('plusOne', { n: avail() }));
    }
  }
  updateWilds(dt);
  // 靈脈節點：走到門前只提示，按了才開始
  let charging = null, act = null;
  for (const n of NODES) {
    n.flash = Math.max(0, n.flash - dt * 0.6);
    if (n.awake) continue;
    const d = Math.hypot(n.pos[0] - P.x, n.pos[2] - P.z);
    if (n.stage === 2 && !(stage1Done() && talesDone())) { if (d < 2.6 && G.t - G.warnT > 4) { G.warnT = G.t; toast(t('stage2', { name: n.name })); } continue; }
    if (n.stage === 2 && G.realm < REQ) { if (d < 2.6 && G.t - G.warnT > 4) { G.warnT = G.t; sfx.deny(); toast(t('needRealm', { name: n.name, realm: REALMS[REQ], now: REALMS[G.realm] })); } continue; }
    if (!canOpen(n)) { if (d < 2.6 && G.t - G.warnT > 4) { G.warnT = G.t; sfx.deny(); const nx = nextGate(); toast(t('outOfOrder', { name: n.name, next: nx.name, hill: nx.hill })); } continue; }
    if (d < 2.6 && Math.abs(P.y - n.pos[1]) < 3) {
      // 現世模式：要先在現世走到這一處觸發過一次，靈界的門才會回應（模擬定位走過去也算）
      const spot = G.geo && REAL.find(r => r.node === n.id);
      if (spot && !visited.has(spot.id)) act = { key: 'real:' + n.id, text: t('gateReal', { name: n.name, place: spot.name }), btn: t('navBtn'), fn: () => openNav(spot) };
      else if (avail() >= COST) {
        // 靈界走走：碰到靈門就是觸發機緣，一樣先看這一處的景點介紹，再「開始挑戰」
        const rs = !G.geo && REAL.find(r => r.node === n.id), go = () => fight(n, () => awaken(n));
        act = rs ? { key: n.id, text: t('gateHere', { icon: n.icon, name: n.name }), btn: t('enter'), fn: () => showCard(rs.name, t('chanceSub', { sub: rs.sub }), rs.text, t('challengeEm', { name: n.name }), rs.id, true, { label: t('startFight'), fn: go }) }
          : { key: n.id, text: t('gateHere', { icon: n.icon, name: n.name }), btn: t('gateGo'), fn: go };
      }
      else if (G.t - G.warnT > 4) { G.warnT = G.t; sfx.deny(); toast(t('notEnough', { cost: COST, n: avail() })); }
    } else n.charge = Math.max(0, n.charge - dt);
  }
  const pr = $('#prog');
  if (charging && !charging.awake) { pr.classList.add('show'); pr.style.setProperty('--p', (charging.charge * 100).toFixed(1) + '%'); }
  else pr.classList.remove('show');
  // 台北靈門
  if (G.gateOpen) {
    G.gateT += dt;
    if (Math.abs(P.x - GATE[0]) < 2.6 && Math.abs(P.z - GATE[2]) < 2.2) act = G.bossDone ? { key: 'gate', text: t('finalHere'), btn: t('finalGo'), fn: ending } : { key: 'boss', text: t('bossHere'), btn: t('bossGo'), fn: bossFight };
  }
  for (const c of CHAPS) if (Math.hypot(c.x - P.x, c.z - P.z) < 8 && Math.abs(P.y - c.y) < 12) act = { key: 'ch' + c.i, text: t('chapLocked', { no: c.no, name: c.name }), btn: t('chapRead'), fn: () => openLore(c.i) };
  // 靈界走走：走到靈界台北的故事光柱，就能讀故事
  if (!G.geo && !act && talesStage()) {
    const s = TALES.find(x => !visited.has(x.id) && Math.hypot(x.ipos[0] - P.x, x.ipos[2] - P.z) < 2.8);
    if (s) act = { key: 'tale:' + s.id, text: t('taleHere', { name: s.name }), btn: t('taleRead'), fn: () => taleFound(s) };
  }
  // 現世：走進機緣範圍時，主畫面直接出現進入按鈕（不用先打開雷達）
  if (G.geo && !act) { const s = inRange(); if (s && s.id !== 'venue') act = { key: 'enc:' + s.id, text: t('encSensed', { name: s.name }), btn: t('enter'), fn: () => encounter(s) }; }
  // 現世：300 公尺內有還沒去過的景點，主畫面主動提醒，附導航（不用打開雷達找）
  if (G.geo && !act) {
    const o = REAL.filter(x => shown(x) && x.id !== 'venue' && !visited.has(x.id)).map(x => ({ x, d: meters(geo.pos, x) })).filter(o => o.d <= NEAR_R).sort((a, b) => a.d - b.d)[0];
    if (o) act = { key: 'near:' + o.x.id, text: t('nearReal', { dir: dirFor(o.x), d: fmt(Math.max(o.d - o.x.r, 10)), name: o.x.name }), btn: t('navBtn'), fn: () => openNav(o.x) };
  }
  setAct(G.state === 'play' ? act : null);
  // 感知
  G.sense = Math.max(0, G.sense - dt); G.senseCd = Math.max(0, G.senseCd - dt);
  if (G.pulse[3] > 0) { G.pulse[2] += dt * 34; G.pulse[3] = Math.max(0, 1 - G.pulse[2] / 70); }
  // 台灣之美
  let near = null, nd = 1e9;
  G.sparkT = (G.sparkT || 0) - dt;
  const spark = G.sparkT <= 0; if (spark) G.sparkT = 0.45;
  for (const sp of SPOTS) {
    if (sp.found) continue;
    const d = Math.hypot(sp.pos[0] + 0.5 - P.x, sp.pos[1] + 0.5 - P.z);
    const hit = sp.id === 'kuroshio' ? G.riding : d < sp.r;
    if (hit) { discover(sp); continue; }
    if (!sp.r) continue;
    // 遠處：景點上空冒金色光點；近處：震一下、響一聲，畫面浮出方向提示
    if (spark && d < 45) { const i = sp.pos[1] * N + sp.pos[0]; burst(sp.pos[0] + 0.5, (world.H[i] || 2) + 2.5, sp.pos[1] + 0.5, [1, 0.85, 0.45], 5, 2.2); }
    if (d < sp.r + 20 && d < nd) { near = sp; nd = d; }
  }
  nearHint(near, nd);
}
const nearEl = $('#near'), nearArrow = nearEl.querySelector('i'), nearText = nearEl.querySelector('p');
const actEl = $('#act'); let actNow = null;
function setAct(a) {
  if ((a && a.key) === (actNow && actNow.key)) { if (a) { actNow.fn = a.fn; if (a.text !== actNow.text) { actNow.text = a.text; actEl.querySelector('p').textContent = a.text; } } return; }
  actNow = a; actEl.classList.toggle('show', !!a); if (!a) return;
  actEl.querySelector('p').textContent = a.text; actEl.querySelector('button').textContent = a.btn;
  sfx.sense(); try { navigator.vibrate && navigator.vibrate(40); } catch { }
}
actEl.addEventListener('pointerdown', e => e.stopPropagation());
actEl.querySelector('button').addEventListener('click', e => { e.stopPropagation(); const a = actNow; if (!a || G.state !== 'play') return; setAct(null); a.fn(); });
function nearHint(sp, d) {
  const on = !!sp && G.state === 'play';
  nearEl.classList.toggle('show', on);
  if (!on) return;
  if (!sp.hinted) { sp.hinted = true; sfx.sense(); try { navigator.vibrate && navigator.vibrate(40); } catch { } }
  const [, , deg] = islandRel([sp.pos[0] + 0.5, 0, sp.pos[1] + 0.5]), text = t('nearSpot', { n: Math.max(1, Math.round(d - sp.r)) });
  nearArrow.style.transform = `rotate(${deg.toFixed(0)}deg)`;
  if (nearText.textContent !== text) nearText.textContent = text;
}

function discover(sp) {
  breakthrough();
  sp.found = true; G.bonus = (G.bonus || 0) + 1; sfx.pick(); setTimeout(() => sfx.pick(), 120);
  showCard(sp.name, sp.area, sp.text, t('discovered', { n: SPOTS.filter(s => s.found).length, m: SPOTS.length }), sp.id, true);
}
// 臺北旅遊網 Open API 的介紹與照片（由 tools/fetch-taipei-travel.mjs 產生；沒有檔案時就只用遊戲內文字）
let TT = null, CM = null;
fetch('data/taipei-travel.json').then(r => r.ok ? r.json() : null).then(j => { TT = j; hudKey = ''; }).catch(() => { });
// 臺北旅遊網沒有的景點（外縣市、部分古蹟），照片改用 Wikimedia Commons
fetch('data/commons.json').then(r => r.ok ? r.json() : null).then(j => { CM = j; hudKey = ''; }).catch(() => { });
const spotInfo = k => TT?.spots?.[k]?.images?.length ? TT.spots[k] : CM?.spots?.[k] || TT?.spots?.[k];
const clip = (t, n) => t.length > n ? t.slice(0, n).replace(/\s+$/, '') + '…' : t;
let spotData = null;
function showCard(title, sub, text, em, key, open = false, action = null) {
  // 地標標籤：一行名字＋地區，點了才開滿版介紹；沒點就自己淡出
  const c = $('#card'), d = key && spotInfo(key);
  spotData = { title, sub, text, em, d, key, action };
  // 觸發機緣與景點時直接打開完整介紹（讀到底還能領靈光），讓人真的認識這個地方
  if (open && G.state === 'play') { openSpot(); return; }
  c.querySelector('b').textContent = title; c.querySelector('small').textContent = sub;
  c.classList.add('show');
  clearTimeout(showCard.t); showCard.t = setTimeout(() => c.classList.remove('show'), 12000);
}
const spotEl = $('#spot'), spotPh = spotEl.querySelector('.ph'), spotDots = spotEl.querySelector('.dots'), spotGo = spotEl.querySelector('.spotgo');
function openSpot() {
  if (!spotData) return;
  const { title, sub, text, em, d } = spotData;
  $('#card').classList.remove('show');
  spotEl.querySelector('header b').textContent = title; spotEl.querySelector('header small').textContent = sub;
  spotEl.querySelector('em').textContent = em;
  const intro = lang === 'zh' ? d?.introduction : d?.i18n?.[lang]?.introduction;
  spotEl.querySelector('p').textContent = intro ? intro.replace(/\r/g, '').replace(/\n\s*\n+/g, '\n\n').trim() : text;
  const imgs = d?.images || [];
  spotPh.replaceChildren(...imgs.map(im => { const i = document.createElement('img'); i.src = im.file; i.alt = im.subject || d.name; i.onerror = () => i.remove(); return i; }));
  spotDots.innerHTML = imgs.length > 1 ? imgs.map((_, k) => `<i class="${k ? '' : 'on'}"></i>`).join('') : '';
  spotPh.scrollLeft = 0;
  const cr = spotEl.querySelector('.cr'); cr.replaceChildren();
  if (d?.src === 'commons') {
    cr.append(t('photoPre'));
    const seen = new Set();
    imgs.forEach(im => { const label = [/^No machine-readable/i.test(im.author || '') ? '' : im.author, im.license].filter(Boolean).join('・') || 'Wikimedia Commons'; if (seen.has(label)) return;
      const a = document.createElement('a'); a.href = im.page; a.target = '_blank'; a.rel = 'noopener'; a.textContent = label; cr.append(seen.size ? '、' : '', a); seen.add(label); });
    cr.append(t('photoPost'));
  } else if (d) {
    const dl = (lang !== 'zh' && d.i18n?.[lang]) || d;
    const a = document.createElement('a'); a.href = dl.url || d.url || TT.sourceUrl; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = t('creditLink', { name: dl.name || d.name }); cr.append(t('creditPre'), a, t('creditPost'));
  }
  // 介紹頁最下面：有挑戰（靈門、城市故事）就放「開始挑戰」，看完直接開打
  // 要讀完才解鎖；一打開正中間先提示一次
  const act = spotData.action; spotGo.hidden = !act;
  if (act) {
    goAct = act; goState(readGot.has(spotData.key));
    spotGo.onclick = () => {
      if (spotGo.classList.contains('lock')) { spotGo.classList.remove('nope'); void spotGo.offsetWidth; spotGo.classList.add('nope'); sfx.deny(); hintRead(); return; }
      spotEl.hidden = true; spotData.action = null; goAct = null; act.fn();
    };
  } else goAct = null;
  spotEl.hidden = false; spotEl.scrollTop = 0;
  setupRead(spotData.key, !!act);
  if (act && spotGo.classList.contains('lock')) hintRead();
}
let goAct = null;
const readHint = spotEl.querySelector('.readhint');
function goState(open) {
  spotGo.classList.toggle('lock', !open);
  spotGo.querySelector('span').textContent = open ? goAct.label : t('readFirst');
}
function hintRead() {
  readHint.querySelector('b').textContent = t('readFirstHint');
  readHint.classList.remove('show'); void readHint.offsetWidth; readHint.classList.add('show');
}
// 讀完有獎：滑到介紹最下面（而且至少看了幾秒）就能領靈光，每個地點一次
const READ_GAIN = 1, readGot = new Set(), readBtn = spotEl.querySelector('.readrw');
let readKey = null, readT0 = 0, readTimer = 0;
function readState(s) {
  readBtn.className = 'readrw' + (s === 'lock' ? '' : ' ' + s); readBtn.disabled = s !== 'ready';
  const it = ITEM_OF[readKey], item = it?.name[LI];
  readBtn.querySelector('b').textContent = t(s === 'got' ? 'readGot' : s === 'ready' ? 'readTake' : 'readLock', { n: READ_GAIN });
  readBtn.querySelector('small').textContent = t(s === 'got' ? (it ? 'readGotItem' : 'readGotSub') : s === 'ready' ? (it ? 'readTakeItem' : 'readTakeSub') : (it ? 'readLockItem' : 'readLockSub'), { n: READ_GAIN, item });
  readBtn.querySelector('.it').innerHTML = it ? itemSVG(it) : '';   // 這裡拿得到的物品，先讓人看到
}
// 領到物品：介紹頁正中間亮一下（拿到什麼、效果）；點一下或幾秒後收起
const itemFx = spotEl.querySelector('.itemfx');
function showItemFx(it) {
  itemFx.querySelector('.hero').innerHTML = itemSVG(it);
  itemFx.querySelector('b').textContent = t('itemGot', { item: it.name[LI] });
  itemFx.querySelector('p').textContent = it.fx[LI];
  itemFx.querySelector('small').textContent = G.geo ? '' : t('itemSpirit');
  itemFx.classList.remove('show'); void itemFx.offsetWidth; itemFx.classList.add('show');
  clearTimeout(showItemFx.t); showItemFx.t = setTimeout(() => itemFx.classList.remove('show'), 3600);
}
itemFx.addEventListener('click', () => itemFx.classList.remove('show'));
function setupRead(key, gate = false) {
  clearTimeout(readTimer); readKey = key || null;
  readBtn.hidden = !readKey || G.state === 'title';
  if (readBtn.hidden) { if (gate && goAct) goState(true); return; }
  readT0 = performance.now(); readState(readGot.has(readKey) ? 'got' : 'lock');
  readTimer = setTimeout(checkRead, 3200);   // 內容很短、不用滑也能看完的，看幾秒後也算讀完
}
function checkRead() {
  if (!readKey || spotEl.hidden) return;
  const locked = goAct && spotGo.classList.contains('lock');
  if (!locked && (readGot.has(readKey) || readBtn.classList.contains('ready'))) return;
  const r = readBtn.getBoundingClientRect(), seen = r.bottom <= innerHeight + 4;
  if (seen && performance.now() - readT0 > 3000) {
    if (!readGot.has(readKey)) { readState('ready'); sfx.sense(); }
    if (locked) { goState(true); readHint.classList.remove('show'); }
  }
  else if (seen) { clearTimeout(readTimer); readTimer = setTimeout(checkRead, 3000 - (performance.now() - readT0) + 50); }
}
spotEl.addEventListener('scroll', checkRead, { passive: true });
readBtn.addEventListener('click', () => {
  if (!readBtn.classList.contains('ready')) return;
  readGot.add(readKey); G.bonus += READ_GAIN; readState('got');
  sfx.pick(); setTimeout(() => sfx.pick(), 120);
  const it = grantItem(readKey);
  if (it) { showItemFx(it); if (it.type === 'food' && !it.carry) setTimeout(() => toast(t('ateToast', { item: it.name[LI], n: it.fill })), 3700); }
  else pop(t('readPop', { n: READ_GAIN }), 'gold');
});
spotPh.addEventListener('scroll', () => { const k = Math.round(spotPh.scrollLeft / spotPh.clientWidth); spotDots.querySelectorAll('i').forEach((el, n) => el.classList.toggle('on', n === k)); }, { passive: true });
$('#dexList').addEventListener('click', e => {
  const li = e.target.closest('li[data-k]'); if (!li) return;
  const [kind, id] = li.dataset.k.split(':'), d = spotInfo(id);
  if (kind === 'xg') { const n = NODES.find(x => x.id === id); spotData = { title: `${n.icon} ？？？`, sub: n.seal, text: t('lockedGate', { hint: G.geo ? placeOf(n) : n.hint }), em: '', d: null }; }
  else if (kind === 'xs') { const sp = SPOTS.find(q => q.id === id), area = sp.area.split(/・|, | · /)[0]; spotData = { title: '？？？', sub: area, text: t('lockedSpot', { area }), em: '', d: null }; }
  else if (kind === 'g') { const n = NODES.find(x => x.id === id); spotData = { title: `${n.name}${t('sep')}${n.hill}`, sub: `${n.seal}${t('sep')}${n.virtue}`, text: n.info, em: '', d }; }
  else if (kind === 't') { const x = TALES.find(r => r.id === id); spotData = { title: x.name, sub: x.sub, text: x.text, em: x.fact, d }; }
  else if (kind === 'xt') { const x = TALES.find(r => r.id === id), area = x.sub.split('・')[1]; spotData = { title: '？？？', sub: area, text: t('lockedTale', { area }), em: '', d: null }; }
  else if (kind === 'r') { const x = REAL.find(r => r.id === id); spotData = { title: x.name, sub: x.sub, text: x.text, em: '', d }; }
  else { const sp = SPOTS.find(q => q.id === id); spotData = { title: sp.name, sub: sp.area, text: sp.text, em: '', d }; }
  if (kind[0] !== 'x') spotData.key = id;   // 還沒解鎖的不能領
  openSpot();
});
spotEl.querySelector('.xbtn').addEventListener('click', () => { spotEl.hidden = true; });

// ---------- 現世雷達：真實地點觸發機緣事件 ----------
const visited = new Set();
const radar = $('#radar'), rcv = $('#rcv'), rg = rcv.getContext('2d');
const calib = params.has('calib');
let radarOpen = false, encSpot = null;
// 雷達縮放：zoom = null 時自動框住「我＋目的地」；手動縮放後記住範圍（公尺），按準星回到自動
let zoom = null, pinch = null, noClick = 0;
function radarTarget() {
  if (talesStage()) return TALES.filter(s => !visited.has(s.id)).sort((a, b) => meters(geo.pos, a) - meters(geo.pos, b))[0];
  if (G.gateOpen || !nextGate()) return REAL.find(s => s.id === 'venue');
  const nodes = stage1Done() ? S2.filter(n => !n.awake) : [nextGate()];
  return REAL.filter(s => nodes.some(n => n.id === s.node)).sort((a, b) => meters(geo.pos, a) - meters(geo.pos, b))[0];
}
const clampR = r => Math.max(80, Math.min(16000, r));
function setZoom(r) { zoom = r == null ? null : clampR(r); $('.rzoom [data-z="fit"]').classList.toggle('on', zoom === null); }
$('.rzoom').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; e.stopPropagation();
  const cur = drawRadar.range || 500;
  setZoom(b.dataset.z === 'in' ? cur / 1.6 : b.dataset.z === 'out' ? cur * 1.6 : null);
});
const ptrs = new Map();
rcv.addEventListener('pointerdown', e => { ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), r: drawRadar.range || 500 }; } });
rcv.addEventListener('pointermove', e => {
  if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, [e.clientX, e.clientY]);
  if (pinch && ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (d > 10) { setZoom(pinch.r * pinch.d / d); noClick = performance.now() + 400; } }
});
const ptrUp = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; };
rcv.addEventListener('pointerup', ptrUp); rcv.addEventListener('pointercancel', ptrUp);
rcv.addEventListener('wheel', e => { e.preventDefault(); setZoom((drawRadar.range || 500) * (e.deltaY > 0 ? 1.15 : 1 / 1.15)); }, { passive: false });
// iPhone 上畫面一直在更新時，Safari 有時會把點擊當成「懸停」而不送出 click；
// 在滿版頁裡手指按下又放開、沒拖動，卻等不到 click 時，自己補送一次
for (const page of [radar, $('#dex'), $('#spot'), $('#settings'), $('#me'), $('#bigmap')]) {
  let down = null, wait = 0;
  page.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, el: e.target }; }, true);
  page.addEventListener('pointerup', e => {
    if (!down || e.pointerType === 'mouse') return;
    const d = down; down = null;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10) return;
    clearTimeout(wait); wait = setTimeout(() => d.el.isConnected && d.el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: e.clientX, clientY: e.clientY, view: window })), 400);
  }, true);
  page.addEventListener('pointercancel', () => { down = null; }, true);
  page.addEventListener('click', () => clearTimeout(wait), true);
}
function nudgeRadar() {
  const b = $('#radarBtn'); if (radarOpen) return;
  if (!b.querySelector('.tip')) { const tip = document.createElement('span'); tip.className = 'tip'; b.append(tip); }
  b.querySelector('.tip').textContent = t('radarNudge'); b.classList.add('nudge');
}
function openRadar() { if (G.state !== 'play' && G.state !== 'ending') return; radarOpen = true; $('#radarBtn').classList.remove('nudge'); radar.classList.add('show'); setZoom(null); geo.start(); renderList(); }
function closeRadar() { radarOpen = false; radar.classList.remove('show'); }
$('#radarBtn').addEventListener('click', e => { e.stopPropagation(); openRadar(); });
$('#rClose').addEventListener('click', closeRadar);
$('#enc button').addEventListener('click', () => encSpot && encounter(encSpot));
function inRange() {
  return REAL.filter(shown).map(s => ({ s, d: meters(geo.pos, s) })).filter(o => o.d <= o.s.r && (!visited.has(o.s.id) || o.s.id === 'venue')).sort((a, b) => a.d - b.d)[0]?.s || null;
}
function fmt(d) { return d < 1000 ? t('meters', { n: Math.round(d) }) : t('km', { n: (d / 1000).toFixed(1) }); }
function renderList() {
  // 依階段分組、照要走的順序編號：第一階四門 → 第二階城市故事 → 第三階三流 → 終點
  const tg = radarTarget(), atNode = n => REAL.find(r => r.node === n.id);
  const cur = !stage1Done() ? 0 : talesStage() ? 1 : 2;
  const groups = [
    { h: t('stage1Head'), list: S1.map(atNode) },
    { h: t('talesHead'), list: TALES.filter(shown), lock: !stage1Done() },
    { h: t('stage2Head'), list: S2.map(atNode), lock: cur < 2 },
    { h: t('rFinish'), list: REAL.filter(s => s.id === 'venue'), fin: true },
  ];
  const used = new Set(groups.flatMap(g => g.list.filter(Boolean).map(s => s.id)));
  const rest = REAL.filter(s => shown(s) && !used.has(s.id));
  if (rest.length) groups.splice(3, 0, { h: t('rOther'), list: rest.sort((a, b) => meters(geo.pos, a) - meters(geo.pos, b)), free: true });
  const row = (s, no) => {
    const d = meters(geo.pos, s), done = visited.has(s.id), node = s.node ? NODES.find(n => n.id === s.node) : null;
    const tag = s.tale ? (done ? t('taleFound') : t('taleTag')) : s.id === 'venue' ? (G.gateOpen ? t('canOpen') : t('startEnd')) : node ? (node.awake ? t('opened', { icon: node.icon, name: node.name }) : node === nextGate() ? `${node.seal}${t('sep')}${node.icon} ${node.name}` : node.seal + t('sep') + node.name) : done ? t('bound') : t('chance');
    const ok = node ? node.awake : done;
    return `<li data-id="${s.id}" class="${done ? 'done' : ''} ${d <= s.r ? 'near' : ''} ${node ? 'key' : ''} ${s === tg ? 'target' : ''}">`
      + (no ? `<i class="no${ok ? ' ok' : ''}">${ok ? '✓' : no}</i>` : '') + `<div><b>${s.name}</b><em>${tag}</em><small>${t('distDir', { d: fmt(d), dir: dirFor(s) })}</small></div>`
      + (s.id === 'venue' && d <= s.r ? '' : `<a class="nav" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&travelmode=walking"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-8-8 18-2-8z"/></svg>${t('navGo')}</a>`)
      + (geo.sim ? `<button class="sim" data-sim="${s.id}" aria-label="${t('simGo')}"><svg viewBox="0 0 24 24"><circle cx="13.5" cy="4.5" r="2"/><path d="M9 21l2.2-6.2 3 3V21M6.5 12.5l2.2-3.8 4.3-1 2.8 3.6 3 1M11.2 14.8L9.6 10"/></svg></button>` : '')
      + (calib ? `<button data-cal="${s.id}">${t('setHere')}</button>` : '') + `</li>`;
  };
  const html = groups.map((g, gi) => {
    const list = g.list.filter(Boolean), isCur = gi === cur && !g.fin && !g.free;
    const doneN = list.filter(s => s.node ? NODES.find(n => n.id === s.node)?.awake : visited.has(s.id)).length;
    const head = `<li class="sec${isCur ? ' cur' : ''}${g.lock ? ' lock' : ''}"><b>${g.h}</b>${g.fin || g.free ? '' : `<small>${g.lock ? t('rLocked') : `${doneN}/${list.length}`}</small>`}</li>`;
    return head + (g.lock ? '' : list.map((s, i) => row(s, g.fin || g.free ? 0 : i + 1)).join(''));   // 還沒開的階段只留標題
  }).join('');
  if (html !== renderList.html) { renderList.html = html; $('#rlist').innerHTML = html; }   // 沒變就不重畫，點擊才不會被吃掉
  if (calib) $('#calOut').textContent = JSON.stringify(Object.fromEntries(REAL.map(s => [s.id, [+s.lat.toFixed(6), +s.lng.toFixed(6)]])));
}
$('#rlist').addEventListener('click', e => {
  const cal = e.target.closest('[data-cal]');
  if (cal) { const s = REAL.find(x => x.id === cal.dataset.cal), p = geo.real || geo.pos; s.lat = p.lat; s.lng = p.lng; saveSpot(s); renderList(); toast(t('setDone', { name: s.name })); return; }
  if (e.target.closest('a.nav')) return;
  const sim = e.target.closest('[data-sim]');
  if (sim) { if (geo.sim) geo.walkTo(REAL.find(x => x.id === sim.dataset.sim)); return; }
  const li = e.target.closest('li[data-id]'); if (!li) return;
  const s = REAL.find(x => x.id === li.dataset.id);
  toast(t('walkThere', { name: s.name, dir: dirFor(s), d: fmt(meters(geo.pos, s)) }));
});
rcv.addEventListener('click', e => {
  if (!geo.sim || performance.now() < noClick) return;
  const rect = rcv.getBoundingClientRect(), x = e.clientX - rect.left - rect.width / 2, y = e.clientY - rect.top - rect.height / 2;
  const sc = drawRadar.scale; if (!sc) return;
  const hit = REAL.filter(shown).find(s => { const [ox, oy] = offset(geo.pos, s); return Math.hypot(ox * sc - x, -oy * sc - y) < 22; });
  if (hit) return geo.walkTo(hit);
  const lat = geo.pos.lat - y / sc / 110540, lng = geo.pos.lng + x / sc / (Math.cos(geo.pos.lat * Math.PI / 180) * 111320);
  geo.walkTo({ lat, lng });
});
let lastNear = null, listT = 0;
geo.on(() => {
  const s = inRange();
  if (s && s !== lastNear) { sfx.sense(); try { navigator.vibrate && navigator.vibrate([60, 40, 60]); } catch { } }
  lastNear = s;
  // 四獸靈門還沒開完時，城市故事還沒浮現；走到了也要說一聲，不然會以為壞掉
  if (!stage1Done()) {
    const tl = TALES.find(x => !visited.has(x.id) && meters(geo.pos, x) <= x.r);
    if (tl && tl !== lastTale && G.state === 'play') { toast(t('taleLater', { name: tl.name })); sfx.sense(); }
    lastTale = tl;
  }
});
let lastTale = null;
function drawRadar() {
  const css = rcv.clientWidth, d = Math.min(devicePixelRatio || 1, 2), W = Math.round(css * d);
  if (rcv.width !== W) { rcv.width = rcv.height = W; }
  const g = rg, c = W / 2, tg = radarTarget(), td = tg ? meters(geo.pos, tg) : 300;
  const want = zoom ?? clampR(Math.max(150, td * 1.6));
  drawRadar.range = drawRadar.range ? lerp(drawRadar.range, want, 0.2) : want; // 平滑縮放
  const range = drawRadar.range, sc = (c - 18 * d) / range; drawRadar.scale = sc / d;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, W);
  g.save(); g.beginPath(); g.arc(c, c, c - 2, 0, 7); g.clip();
  g.fillStyle = '#0b1a2c'; g.fillRect(0, 0, W, W);
  const step = [50, 100, 200, 250, 500, 1000, 2000].find(v => range / v <= 4) || 2000;
  g.strokeStyle = 'rgba(111,227,255,.18)'; g.lineWidth = d; g.fillStyle = 'rgba(159,176,194,.85)'; g.font = `${12 * d}px sans-serif`; g.textAlign = 'left';
  for (let m = step; m < range; m += step) { g.beginPath(); g.arc(c, c, m * sc, 0, 7); g.stroke(); if (m * sc < c - 34 * d) g.fillText(fmt(m), c + 4 * d, c - m * sc - 4 * d); }
  // 掃描線
  const a = G.t * 1.6; const grd = g.createConicGradient ? g.createConicGradient(a, c, c) : null;
  if (grd) { grd.addColorStop(0, 'rgba(111,227,255,.22)'); grd.addColorStop(0.12, 'rgba(111,227,255,0)'); grd.addColorStop(1, 'rgba(111,227,255,0)'); g.fillStyle = grd; g.fillRect(0, 0, W, W); }
  g.fillStyle = '#ffcf5a'; g.font = `900 ${13 * d}px sans-serif`; g.textAlign = 'center'; g.fillText(t('north'), c, 16 * d);
  const P2 = s => { const [ox, oy] = offset(geo.pos, s); return [c + ox * sc, c - oy * sc]; };
  const edge = (x, y) => { const dx = x - c, dy = y - c, L = Math.hypot(dx, dy), max = c - 22 * d; return L > max ? [c + dx / L * max, c + dy / L * max, true] : [x, y, false]; };
  // 往目的地的虛線
  if (tg) {
    const [x, y] = edge(...P2(tg));
    g.setLineDash([6 * d, 6 * d]); g.strokeStyle = 'rgba(255,207,90,.7)'; g.lineWidth = 2 * d; g.beginPath(); g.moveTo(c, c); g.lineTo(x, y); g.stroke(); g.setLineDash([]);
  }
  // 範圍拉遠時，不重要的機緣點縮小、拿掉名字，畫面才不會擠
  const crowd = range > 700;
  for (const s of REAL) {
    if (s === tg || !shown(s)) continue;
    const [x, y, out] = s.tale ? edge(...P2(s)) : P2(s), near = meters(geo.pos, s) <= s.r, key = s.node || s.id === 'venue' || s.tale;
    const done = visited.has(s.id) || (s.node && NODES.find(n => n.id === s.node).awake);
    g.globalAlpha = near ? 0.35 + 0.25 * Math.sin(G.t * 6) : 0.14;
    g.fillStyle = s.id === 'venue' ? '#ffcf5a' : s.tale ? '#ffa78c' : s.node ? '#6fe3ff' : '#ffffff';
    g.beginPath(); g.arc(x, y, s.r * sc, 0, 7); g.fill();
    g.globalAlpha = crowd && !key ? 0.5 : 0.85;
    g.beginPath(); g.arc(x, y, (key ? 5 : 3.5) * d, 0, 7); g.fill(); g.globalAlpha = 1;
    if (done) { g.strokeStyle = '#ffcf5a'; g.lineWidth = 2 * d; g.stroke(); }
    if (!out && (!crowd || s.id === 'venue' || (s.tale && range > 1500))) { g.fillStyle = 'rgba(238,243,248,.75)'; g.font = `${12 * d}px sans-serif`; g.fillText(s.name, x, y - 9 * d); }
  }
  // 目的地：金色、脈動、名字放大；超出範圍就貼在邊緣
  if (tg) {
    const [x, y, out] = edge(...P2(tg)), pr = (10 + 4 * Math.sin(G.t * 4)) * d;
    g.strokeStyle = 'rgba(255,207,90,.55)'; g.lineWidth = 3 * d; g.beginPath(); g.arc(x, y, pr + 6 * d, 0, 7); g.stroke();
    g.fillStyle = '#ffcf5a'; g.strokeStyle = '#fff'; g.lineWidth = 2 * d; g.beginPath(); g.arc(x, y, 8 * d, 0, 7); g.fill(); g.stroke();
    if (!out) { g.font = `900 ${15 * d}px sans-serif`; g.lineWidth = 4 * d; g.strokeStyle = 'rgba(6,14,26,.85)'; g.strokeText(tg.name, x, y - 18 * d); g.fillStyle = '#ffcf5a'; g.fillText(tg.name, x, y - 18 * d); }
  }
  // 玩家
  if (geo.acc && geo.acc < 300) { g.fillStyle = 'rgba(88,176,234,.18)'; g.beginPath(); g.arc(c, c, geo.acc * sc, 0, 7); g.fill(); }
  g.fillStyle = '#58b0ea'; g.strokeStyle = '#fff'; g.lineWidth = 2 * d; g.beginPath(); g.arc(c, c, 7 * d, 0, 7); g.fill(); g.stroke();
  g.restore();
  // 副標題跟著階段走
  const trail = G.gateOpen ? t('trailDone') : !stage1Done() ? t('stage1Head') : talesStage() ? t('talesHead') : t('stage2Head');
  const tr = $('#radar .trail'); if (tr.textContent !== trail) tr.textContent = trail;
  // 狀態列與機緣按鈕
  $('#gstat').textContent = geo.sim ? t('simStat', { err: geo.error ? t('sep') + geo.error : '' }) : t('gpsStat', { n: Math.round(geo.acc || 0) });
  const s = inRange(); encSpot = s;
  const enc = $('#enc');
  if (s) {
    enc.classList.add('show');
    enc.querySelector('span').textContent = s.id === 'venue' ? (G.gateOpen ? t('venueSensed') : t('venueStart')) : t('encSensed', { name: s.name });
    enc.querySelector('button').textContent = s.id === 'venue' ? (G.gateOpen ? t('openGateBtn') : t('hearXi')) : t('enter');
  } else enc.classList.remove('show');
  if (G.t - listT > 0.5) { listT = G.t; renderList(); }
}

function encounter(s) {
  closeRadar(); breakthrough();
  if (G.geo) stamp(s);
  if (s.id === 'venue') {
    const left = talesStage() ? TALES.filter(s => !visited.has(s.id)).map(s => s.name) : (stage1Done() ? S2 : S1).filter(n => !n.awake).map(n => `${n.name} (${placeOf(n)})`);
    if (G.gateOpen) {
      P.x = GATE[0] + 0.5; P.z = GATE[2] - 4; P.y = P.ry = footGround(P.x, P.z); cam.yaw = 0; cam.tx = P.x; cam.tz = P.z;
      G.state = 'talk'; say(t('venueOpen'), () => { G.state = 'play'; });
    } else {
      G.state = 'talk'; say([t('venueIntro'), t(talesStage() ? 'taleLeft' : 'venueLeft', { n: left.length, list: left.join(t('list')) }), talesStage() ? t('talesNote') : nextGate() ? t('venueNext', { name: nextGate().name }) : t('venueWait'), t('venueGo')], () => { G.state = 'play'; });
    }
    return;
  }
  if (s.tale) { taleFound(s); return; }
  visited.add(s.id);
  const node = s.node && NODES.find(n => n.id === s.node);
  if (node) {
    P.x = node.pos[0]; P.z = node.pos[2] + 4; P.y = P.ry = footGround(P.x, P.z) + 0.2; P.vy = 0; P.swim = false;
    cam.yaw = Math.PI; cam.tx = P.x; cam.tz = P.z; cam.ty = P.y + 1.6;
    G.state = 'talk';
    const nx = nextGate();
    if (!node.awake && node.stage === 2 && stage1Done() && G.realm < REQ) {
      say([t('shadow', { icon: node.icon, name: node.name }), t('needRealm', { name: node.name, realm: REALMS[REQ], now: REALMS[G.realm] })], () => { G.state = 'play'; setTimeout(() => showCard(s.name, t('chanceSub', { sub: s.sub }), s.text, t('needRealmShort', { realm: REALMS[REQ], now: REALMS[G.realm] }), s.id, true), 400); });
      return;
    }
    if (!node.awake && !canOpen(node)) {
      G.bonus += 1;
      say([t('shadow', { icon: node.icon, name: node.name }), (nx ? t('goFirst', { next: nx.name, place: placeOf(nx) }) : t('talesNote'))], () => { G.state = 'play'; setTimeout(() => showCard(s.name, t('chanceSub', { sub: s.sub }), s.text, t('sealWait', { seal: node.seal }), s.id, true), 400); });
      return;
    }
    // 觸發機緣 → 看景點介紹 → 最下面「領靈光」＋「開始挑戰」
    say(s.story, () => {
      G.state = 'play';
      if (node.awake) { G.bonus += 1; showCard(s.name, t('chanceSub', { sub: s.sub }), s.text, t('boundWith', { name: node.name }), s.id, true); return; }
      showCard(s.name, t('chanceSub', { sub: s.sub }), s.text, t('challengeEm', { name: node.name }), s.id, true, { label: t('startFight'), fn: () => fight(node, () => { G.bonus += COST; awaken(node); }) });
    });
  } else {
    G.bonus += 2; sfx.pick(); setTimeout(() => sfx.pick(), 150);
    burst(P.x, P.y + 1.5, P.z, [1, 0.9, 0.5], 40, 5);
    showCard(s.name, t('chanceSub', { sub: s.sub }), s.text, t('chanceBonus', { n: visited.size }), s.id, true);
  }
}
$('#card').addEventListener('click', e => { e.stopPropagation(); openSpot(); });
$('#dexBtn').addEventListener('click', e => { e.stopPropagation(); $('#card').classList.remove('show'); $('#dex').classList.toggle('show'); });
$('#dexClose').addEventListener('click', () => $('#dex').classList.remove('show'));

// 第二階：走到台北城市故事的地點，先讀故事（景點介紹），再跟守門的街貓打一場小遊戲；淨化了才收進圖鑑；七隻都淨化就開第三階
const TALE_REWARD = 3;
const TALE_STAR = { wufenpu: 1, cihcheng: 2, xinzhuang: 1, wanhua: 2, baoan: 2, zaichun: 2, shipai: 3 };
function taleFound(s) {
  sfx.pick(); setTimeout(() => sfx.pick(), 150);
  burst(P.x, P.y + 1.5, P.z, [1, 0.75, 0.6], 40, 5);
  const photo = spotInfo(s.id)?.images?.[0]?.file;
  const node = { id: s.id, name: s.name, star: TALE_STAR[s.id] || 1, tale: true, photo };
  showCard(s.name, s.sub, s.text, s.lines.join('\n'), s.id, true, { label: t('startQuiz'), fn: () => {
    G.state = 'battle'; $('#hud').classList.remove('play', 'on'); $('#card').classList.remove('show'); sfx.battle(true);
    const rw = [t('rwLight', { n: TALE_REWARD }), t('rwTale', { name: s.name })];
    battle(node, G.realm, REALMS[G.realm], rw).then(ok => {
      sfx.battle(false); G.state = 'play'; $('#hud').classList.add('play', 'on');
      if (!ok) { toast(t('taleRetry', { name: s.name })); return; }
      xiDance();
      visited.add(s.id); G.bonus += TALE_REWARD;
      const card = () => showCard(s.name, s.sub, s.text, s.fact, s.id);
      if (!talesDone()) { setTimeout(card, 400); return; }
      // 七個故事都回來了：全畫面七個故事化成金球、匯成一本《台北誌》，收起後才看最後一則故事卡、告訴你下一階開了
      setTimeout(() => roar(t('talesAllSub'), { kind: 'tales', title: t('talesAllTitle'), book: t('taipeiBook'), lamps: TALES.map(x => x.name) }).then(() => {
        card(); setTimeout(() => toast(t('stage2Open', { realm: REALMS[REQ] })), 800);
      }), 600);
    });
  } });
}

function ending() {
  G.state = 'ending'; G.spiritTarget = 1; setSpirit(1); sfx.gate(); sfx.ending();
  const s = Math.round(G.playT), mm = String(Math.floor(s / 60)).padStart(2, '0'), ss = String(s % 60).padStart(2, '0');
  $('#stats').textContent = t('stats', { time: `${mm}:${ss}`, qi: G.collected, qim: motes.length, b: SPOTS.filter(s => s.found).length, bm: SPOTS.length })
    + '\n' + t('statsWalk', { realm: REALMS[G.realm], d: G.geo ? fmt(G.walked) : t('stepsN', { n: Math.round(G.walked) }) });
  setTimeout(() => $('#ending').classList.add('show'), 600);
  $('#hud').classList.remove('play');
}

// ---------- 繪製 ----------
const C = {
  fog0: hex('#cfe3ee'), fog1: hex('#1d4b62'), top0: hex('#6faee6'), top1: hex('#0a1838'),
  amb0: [0.56, 0.6, 0.68], amb1: [0.34, 0.42, 0.62], sun0: [0.62, 0.6, 0.55], sun1: [0.62, 0.5, 0.36],
  sh0: hex('#5fd3e6'), sh1: hex('#33c2c9'), dp0: hex('#1f62a6'), dp1: hex('#0d2f5f'),
  glow: hex('#7fe8ff'), gold: hex('#ffcf5a'),
};
const LIGHT = (() => { const v = [0.45, 0.8, 0.35], l = Math.hypot(...v); return v.map(x => x / l); })();

function frame(dt) {
  const asp = r.resize();
  const s = G.spirit;
  const portrait = asp < 1, fov = (portrait ? 68 : 55) * Math.PI / 180;
  let eye, target;
  if (G.state === 'title') {
    const a = G.t * 0.06;
    target = [64 * S, 8, 66 * S]; eye = [64 * S + Math.sin(a) * 62 * S, 46 * S, 66 * S + Math.cos(a) * 62 * S];
  } else {
    const k = 1 - Math.exp(-dt * 10);
    cam.tx = lerp(cam.tx, P.x, k); cam.ty = lerp(cam.ty, P.ry + 1.6, k); cam.tz = lerp(cam.tz, P.z, k);
    let dist = (portrait ? 11 : 9) * (G.state === 'ending' ? 1.6 : 1);
    if (talk) dist = 7;
    target = [cam.tx, cam.ty, cam.tz];
    // 鏡頭被地形或大樓擋住時：先試著抬高，仍擋住再拉近
    const reach = pitch => {
      const cp = Math.cos(pitch), sp = Math.sin(pitch), dir = [-Math.sin(cam.yaw) * cp, sp, -Math.cos(cam.yaw) * cp];
      for (let i = 1; i <= 16; i++) {
        const u = i / 16, x = target[0] + dir[0] * dist * u, y = target[1] + dir[1] * dist * u, z = target[2] + dir[2] * dist * u;
        if (ground(x, z) > y - 0.4) return [Math.max(0.15, (i - 1) / 16), dir];
      }
      return [1, dir];
    };
    let [f, dir] = reach(cam.pitch);
    if (f < 0.75) { const up = reach(Math.min(1.35, cam.pitch + 0.5)); if (up[0] > f) [f, dir] = up; }
    cam.f = cam.f === undefined ? f : (f < cam.f ? f : lerp(cam.f, f, 1 - Math.exp(-dt * 4)));
    f = cam.f;
    cam.dir = cam.dir ? cam.dir.map((v, i) => lerp(v, dir[i], 1 - Math.exp(-dt * 12))) : dir;
    dir = cam.dir;
    eye = [target[0] + dir[0] * dist * f, target[1] + dir[1] * dist * f, target[2] + dir[2] * dist * f];
  }
  const vp = M.mul(M.persp(fov, asp, 0.1, 400), M.lookAt(eye, target, [0, 1, 0]));
  const lookPitch = Math.atan2(eye[1] - target[1], Math.hypot(eye[0] - target[0], eye[2] - target[2]));
  const env = {
    time: G.t, spirit: s, sense: G.sense > 0 ? Math.min(1, G.sense) : 0,
    fog: mixColor(C.fog0, C.fog1, s), skyTop: mixColor(C.top0, C.top1, s),
    fogR: G.state === 'title' ? [70 * S, 150 * S] : [38, 92], light: LIGHT,
    sun: mixColor(C.sun0, C.sun1, s), amb: mixColor(C.amb0, C.amb1, s), glow: mixColor(C.glow, C.gold, 0.35),
    pulse: G.pulse, waterLevel: WATER, shallow: mixColor(C.sh0, C.sh1, s), deep: mixColor(C.dp0, C.dp1, s),
    current: [CURRENT.x, CURRENT.half, CURRENT.speed],
    horizon: Math.tan(lookPitch) / Math.tan(fov / 2),
  };
  r.begin(vp, eye, env);
  const I = M.ident();

  // 不透明
  r.blend(0);
  r.draw(terrain, I, [1, 1, 1], 0, 1, 1);
  { const m = M.ident(); M.translate(m, GATE[0], GATE[1], GATE[2]); r.draw(gateM, m, [1, 1, 1], G.gateOpen ? 0.15 + 0.1 * Math.sin(G.t * 3) : 0); }
  for (const n of NODES) {
    const m = M.ident(); M.translate(m, n.pos[0], n.pos[1], n.pos[2]); r.draw(n.mesh, m);
    if (n.beast) { const mb = M.ident(); M.translate(mb, n.pos[0], n.pos[1] + 1.3, n.pos[2]); M.rotY(mb, n.face); r.draw(n.beast, mb, [1, 1, 1], n.awake ? 0.15 + 0.1 * Math.sin(G.t * 3) : 0); }
    // 核心：旋轉的發光方塊
    const lift = (n.beast ? 1.6 : 0) + (n.awake ? 2.2 + Math.sin(G.t * 2) * 0.2 : 1.9 + Math.sin(G.t * 1.5) * 0.12);
    const col = n.awake ? C.gold : n.col, sz = n.id === 'peak' ? 0 : 0.7 + n.charge * 0.4;
    if (sz) { const mc = M.ident(); M.translate(mc, n.pos[0], n.pos[1] + lift, n.pos[2]); M.rotY(mc, G.t * (n.awake ? 2 : 0.8)); M.rotX(mc, 0.6); M.rotZ(mc, 0.6); M.scale(mc, sz, sz, sz); r.draw(r.cube, mc, col, n.awake ? 1 : 0.6 + n.charge * 0.4); }
    if (n.id === 'peak') {
      const mb = M.ident(); M.translate(mb, n.pos[0], n.pos[1] + 5, n.pos[2]);
      M.rotX(mb, Math.sin(G.t * (n.awake ? 3 : 0.8)) * (n.awake ? 0.25 * Math.max(0.2, n.flash) : 0.05) + n.charge * Math.sin(G.t * 9) * 0.15);
      r.draw(bell, mb, n.awake ? [1.15, 1.05, 0.85] : [1, 1, 1], n.awake ? 0.35 : 0);
    }
    if (n.vein && G.t > n.veinEnd) n.vein = null;
    if (n.vein) r.draw(n.vein, I, [1, 1, 1], 0.6 + 0.4 * Math.sin(G.t * 3));
  }
  if (s > 0.01) { const m = M.ident(); M.translate(m, 0, -(1 - smooth(0, 0.6, s)) * 50, 0); r.draw(floats, m, [1, 1, 1], 0.05); }
  for (const c of CHAPS) { const m = M.ident(); M.translate(m, c.x, c.y + Math.sin(G.t * 0.8 + c.i) * 0.3, c.z); M.rotY(m, Math.atan2(64 * S - c.x, 64 * S - c.z)); r.draw(c.mesh, m, [1, 1, 1], 0.12 + 0.08 * Math.sin(G.t * 1.6 + c.i)); }
  const pa = { phase: P.phase, move: P.move, air: !P.onGround && !P.swim, swim: P.swim, t: G.t };
  const lk = lookNow();
  drawAvatar2(r, liuPal(lk), P.x, P.ry, P.z, P.yaw, pa, G.state === 'ending' ? 0.3 : 0, lk);
  const xg = ground(XI.x, XI.z);
  const dn = G.t < (XI.danceEnd || 0), hop = dn ? Math.abs(Math.sin(G.t * 6)) * 0.45 : 0;
  drawAvatar2(r, XI2, XI.x, xg + hop, XI.z, dn ? XI.yaw + Math.sin(G.t * 3) * 1.2 : XI.yaw, { phase: 0, move: 0, air: false, swim: false, t: G.t + 1.3, wave: XI.wave, dance: dn });
  if (XI.home && !dn) { XI.x = XI.home[0]; XI.z = XI.home[1]; XI.yaw = XI.home[2]; XI.home = null; }

  // 濁影：暗紫色的守門獸，追人的時候發紅光
  for (const w of wilds) {
    if (w.gone) continue;
    const gy = ground(w.x, w.z), bob = Math.sin(G.t * 3 + w.hx) * 0.08, mw = M.ident();
    M.translate(mw, w.x, gy + bob, w.z); M.rotY(mw, w.yaw); M.scale(mw, 0.85, 0.85, 0.85);
    r.draw(wildMesh[w.kind], mw, w.chase ? [0.75, 0.35, 0.6] : [0.42, 0.34, 0.62], w.chase ? 0.25 + 0.15 * Math.sin(G.t * 10) : 0.12);
  }
  // 濁淵：靈門打開後蹲在門前，淨化前一直在
  if (G.gateOpen && !G.bossDone) {
    const m = M.ident(), bz = GATE[2] - 1.6;
    M.translate(m, GATE[0] + 0.5, ground(GATE[0] + 0.5, bz) + Math.sin(G.t * 1.5) * 0.08, bz); M.scale(m, 1.45, 1.45, 1.45);
    r.draw(bossM, m, [1, 1, 1], 0.06 + 0.06 * Math.sin(G.t * 4));
  }
  // 半透明：水、影子
  r.blend(1);
  r.drawWater(water, env);
  r.blend(1);
  if (!P.swim) { const gy = footGround(P.x, P.z); r.box(P.x, gy + 0.03, P.z, 0.95, 0.02, 0.95, [0, 0, 0], 0, clamp(0.35 - (P.y - gy) * 0.06, 0.08, 0.35)); }
  r.box(XI.x, xg + 0.03, XI.z, 0.95, 0.02, 0.95, [0, 0, 0], 0, 0.3);

  // 加亮：靈光、光柱、粒子、山門
  r.blend(2);
  const near = perk('lens') ? 14 : 9;   // 古蹟放大鏡：看得更遠
  for (const m of motes) {
    if (m.taken) continue;
    const d = Math.hypot(m.x - P.x, m.z - P.z);
    const vis = Math.max(G.sense > 0 ? 1 : 0, 0.35 + s * 0.4, smooth(near + 6, near, d));
    const y = m.y + Math.sin(G.t * 2 + m.ph) * 0.18;
    r.box(m.x, y, m.z, 0.34, 0.34, 0.34, [0.7, 1, 1], 1, vis, G.t * 2 + m.ph);
    r.box(m.x, y, m.z, 0.8, 0.8, 0.8, [0.4, 0.85, 1], 1, vis * 0.25, -G.t + m.ph);
  }
  for (const w of wilds) {
    if (w.gone) continue;
    const gy = ground(w.x, w.z);
    for (let i = 0; i < 5; i++) { const a = G.t * 1.4 + i * 1.256 + w.hx; r.box(w.x + Math.cos(a) * 1.1, gy + 1 + Math.sin(G.t * 2 + i) * 0.4, w.z + Math.sin(a) * 1.1, 0.26, 0.26, 0.26, w.chase ? [1, 0.3, 0.5] : [0.6, 0.4, 1], 1, 0.7, a); }
  }
  if (G.gateOpen && !G.bossDone) for (let i = 0; i < 12; i++) { const a = G.t * 0.9 + i * 0.5236, bz = GATE[2] - 1.6; r.box(GATE[0] + 0.5 + Math.cos(a) * 2.4, ground(GATE[0] + 0.5, bz) + 1.5 + Math.sin(G.t * 1.7 + i) * 0.9, bz + Math.sin(a) * 2.4, 0.36, 0.36, 0.36, [0.8, 0.25, 0.9], 1, 0.7, a); }
  for (const n of NODES) {
    const bright = n.stage === 2 && !stage1Done() ? 0.05 : n.awake ? 0.22 : !canOpen(n) ? 0.06 : 0.14 + (G.sense > 0 ? 0.25 : 0) + n.charge * 0.3;
    r.box(n.pos[0], n.pos[1] + 40, n.pos[2], 0.6, 80, 0.6, n.awake ? C.gold : n.col, 1, bright);
    r.box(n.pos[0], n.pos[1] + 40, n.pos[2], 1.6, 80, 1.6, n.awake ? C.gold : n.col, 1, bright * 0.25);
    if (n.flash > 0) r.box(n.pos[0], n.pos[1] + 2, n.pos[2], 6 * (2 - n.flash), 0.2, 6 * (2 - n.flash), C.gold, 1, n.flash);
  }
  if (G.gateOpen) {
    const a = Math.min(1, G.gateT / 1.5);
    r.box(GATE[0], GATE[1] + 2.35, GATE[2], 4.8, 4.5, 0.12, mixColor(C.glow, C.gold, 0.5 + 0.5 * Math.sin(G.t * 2)), 1, 0.55 * a);
    r.box(GATE[0], GATE[1] + 2.35, GATE[2], 4.2, 3.9, 0.3, [1, 1, 1], 1, 0.25 * a * (0.6 + 0.4 * Math.sin(G.t * 5)));
    r.box(GATE[0], GATE[1] + 40, GATE[2], 2.5, 80, 2.5, C.gold, 1, 0.12 * a);
  }
  if (world.lamp) r.box(world.lamp[0], world.lamp[1], world.lamp[2], 30, 0.35, 0.7, [1, 0.95, 0.7], 1, 0.12 + s * 0.25, G.t * 0.9);
  for (const p of G.particles) r.box(p.x, p.y, p.z, 0.18, 0.18, 0.18, p.col, 1, Math.min(1, p.life), p.life * 4);
  guideTrail(); taleMarks();
  if (G.riding && P.swim) for (let i = 0; i < 3; i++) r.box(P.x + Math.sin(G.t * 7 + i * 2) * 0.6, WATER + 0.05, P.z + 0.6 + i * 0.7, 0.25, 0.05, 0.6, [0.8, 0.95, 1], 1, 0.5 - i * 0.12);
  r.blend(0);

  // 阿汐的名牌
  const tag = $('#tag'), pj = M.project(vp, XI.x, xg + 2.6, XI.z);
  if (pj && G.state !== 'title' && pj[0] > 0 && pj[0] < 1 && pj[1] > 0 && pj[1] < 1) { tag.style.transform = `translate(${pj[0] * innerWidth}px,${pj[1] * canvas.clientHeight}px) translate(-50%,-100%)`; tag.style.opacity = 1; }
  else tag.style.opacity = 0;
  // 章節入口的圖示：靠近海邊才看得到，越近越清楚
  for (const c of CHAPS) {
    const d = Math.hypot(c.x - P.x, c.z - P.z), pc = G.state === 'play' && d < 110 && M.project(vp, c.x, c.y + 9.5, c.z);
    if (pc && pc[0] > 0.04 && pc[0] < 0.96 && pc[1] > -0.5 && pc[1] < 0.9) {
      c.el.style.transform = `translate(${pc[0] * innerWidth}px,${Math.max(pc[1], 0.34) * canvas.clientHeight}px) translate(-50%,-100%) scale(${clamp(1.25 - d / 120, 0.6, 1).toFixed(2)})`;
      c.el.style.opacity = clamp((110 - d) / 30, 0, 1).toFixed(2); c.el.style.pointerEvents = 'auto';
    } else { c.el.style.opacity = 0; c.el.style.pointerEvents = 'none'; }
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  G.t += dt;
  if (G.state === 'play') G.playT += dt;
  G.spirit = lerp(G.spirit, G.spiritTarget, 1 - Math.exp(-dt * 0.8));
  updatePlayer(dt);
  if (G.state === 'play') updateGame(dt);
  for (const p of G.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vy -= 6 * dt; p.vx *= 0.98; p.vz *= 0.98; p.life -= dt; }
  G.particles = G.particles.filter(p => p.life > 0);
  frame(dt);
  if (G.state !== 'title') { hud(); drawMini(); updateGuide(); }
  if (radarOpen) drawRadar();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// 測試用：?play 跳過片頭，?awake=n 直接喚醒 n 處，?at=sea|peak|city|gate 傳送
if (params.has('play') || params.has('at') || params.has('awake') || params.has('geo')) {
  start(params.has('geo') ? 'geo' : 'island'); while (talk) nextLine();
  // ?realm=n 直接設定境界；?awake=n 直接喚醒前 n 處（第一階 4 處、第二階 3 處）
  if (params.has('realm')) G.realm = Math.min(4, +params.get('realm') || 0);
  const a = Math.min(NODES.length, +params.get('awake') || 0); G.collected = COST * a;
  for (let i = 0; i < a; i++) awaken(NODES[i]);
  const to = params.get('at');
  if (to) { const p = to === 'gate' ? GATE : NODES.find(n => n.id === to)?.pos; if (p) { P.x = p[0] - 3; P.z = p[2] - 3; P.y = P.ry = footGround(P.x, P.z) + 0.5; cam.tx = P.x; cam.tz = P.z; } }
  if (params.has('yaw')) cam.yaw = +params.get('yaw');
  if (params.has('pitch')) cam.pitch = +params.get('pitch');
}
// Demo 階段：設定裡直接跳到第二階（四門已開）或第三階（台北故事也找齊、境界夠解三流）
{
  const cur = +params.get('demo') || 1, box = $('#demoSt');
  box.innerHTML = t('demoStage').map((x, i) => `<button data-k="${i + 1}" class="${i + 1 === cur ? 'on' : ''}">${x}</button>`).join('');
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const q = new URLSearchParams(); if (b.dataset.k !== '1') q.set('demo', b.dataset.k); else q.set('nofilm', '');
    for (const k of ['scale', 'lang']) if (params.has(k)) q.set(k, params.get(k));
    location.search = q.toString().replace(/=(&|$)/g, '$1');
  });
  if (cur > 1) {
    start('geo'); while (talk) nextLine();
    G.realm = cur === 3 ? REQ + 1 : 1;
    const quiet = n => { n.awake = true; G.spent += COST; G.awakened++; G.collected += COST; buildVein(n); };
    S1.forEach(quiet);
    if (cur === 3) { for (const s of TALES) visited.add(s.id); G.bonus += COST * S2.length; }
    G.spiritTarget = G.awakened / NODES.length * 0.85; setSpirit(G.spiritTarget);
    setTimeout(() => { pop(t('demoSet', { stage: t('demoStage')[cur - 1] }), 'gold'); setTimeout(() => toast(cur === 3 ? t('stage2Open', { realm: REALMS[REQ] }) : t('talesOpen')), 2200); }, 600);
  }
}
window.__game = { resonance, ending, GATE, wilds, showCard, openGuide, cam, fight, gainXiu, G, P, cam, NODES, motes, input, awaken, doSense, SPOTS, geo, REAL, openRadar, encounter, bossFight, ascend: (i = 1) => ascend(i, lookNow()), visited, taleFound: id => taleFound(TALES.find(s => s.id === id)) };
