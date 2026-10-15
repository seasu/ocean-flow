// 《洋流：起源》mobile web prototype：主迴圈、操作、任務流程
import { M, clamp, lerp, rng, hex, mixColor, smooth } from './math.js';
import { Renderer, Builder } from './gl.js';
import { makeWorld, terrainMesh, waterData, floatMesh, gateMesh, nodeMesh, bellMesh, beastMesh, N, S, WATER, T, PLACES, CURRENT, curX } from './world.js';
import { drawAvatar, BLUE, ORANGE } from './avatar.js';
import { initAudio, unlockAudio, sfx, setMuted, muted, setSpirit } from './audio.js';
import { REAL, geo, meters, offset, dirName, saveSpot } from './geo.js';
import { TALES } from './stories.js';
import { t, lang, localize, applyStatic, DIRS } from './i18n.js';
import { battle } from './battle.js';
import { openLore, openRealms } from './lore.js';
import { VERSION } from './version.js';

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
const REQ = 2;   // 第二階需要的境界（化流境）
const stage1Done = () => S1.every(n => n.awake);
// 第二階：台北城市故事（只在現世模式；島上模式直接跳過）
for (const s of TALES) REAL.push(s);
const talesDone = () => !G.geo || TALES.every(s => visited.has(s.id));
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
$('#realmBtn').addEventListener('click', () => { settings.hidden = true; openRealms({ realms: REALMS, need: NEED, now: G.state === 'title' ? -1 : G.realm, geo: G.geo }); });
// 個人資訊：點左上角頭像，滿版顯示走了多少步、境界與收集進度
const meEl = $('#me');
$('#meBtn').addEventListener('click', e => { e.stopPropagation(); hudKey = ''; hud(); meEl.hidden = false; });
meEl.addEventListener('click', e => { if (e.target.closest('.xbtn')) meEl.hidden = true; });
// 小地圖：點地圖 icon 才展開，8 秒後自動收起
let miniT = 0;
$('#mapBtn').addEventListener('click', e => {
  e.stopPropagation(); const on = !$('#mini').classList.contains('show');
  $('#mini').classList.toggle('show', on); $('#mapBtn').classList.toggle('on', on);
  if (on) showMini(); else { clearTimeout(miniT); }
});
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
const guideEl = $('#guide'), guideArrow = guideEl.querySelector('i'), guideText = guideEl.querySelector('p');
// 「帶我去」：直接打開雷達（島上是小地圖）標出目的地；遊戲畫面只留一顆小方向箭頭＋距離
// 主畫面的箭頭跟著角色走：量的是島上目標的步數；真實世界的距離和方向看雷達
function guideTarget() {
  const n = nextGate();
  return n ? { name: n.name, pos: n.pos } : { name: t('gateName'), pos: GATE };
}
function updateGuide() {
  if (!guideOn) return;
  const g = guideTarget(), [, n, deg] = islandRel(g.pos), text = n < 3 ? t('guideArrived') : t('guideSteps', { n });
  guideArrow.style.transform = `rotate(${deg.toFixed(0)}deg)`;
  if (guideText.textContent !== text) guideText.textContent = text;
}
function showMini(ms = 8000) {
  $('#mini').classList.add('show'); $('#mapBtn').classList.add('on');
  clearTimeout(miniT); miniT = setTimeout(() => { $('#mini').classList.remove('show'); $('#mapBtn').classList.remove('on'); }, ms);
}
function openGuide() {
  guideOn = true; guideEl.classList.add('show'); sfx.sense();
  if (G.geo) { askCompass(); openRadar(); } else showMini();
  updateGuide();
}
$('#guideBtn').addEventListener('click', e => { e.stopPropagation(); openGuide(); });
guideEl.addEventListener('click', e => { if (e.target.closest('.x')) { guideOn = false; guideEl.classList.remove('show'); return; } e.stopPropagation(); G.geo ? openRadar() : showMini(); });

// ---------- 走路修行：走的路轉成修為，修為滿了到機緣點突破境界 ----------
// 現地模式算真實走的公尺數（模擬定位也算），島上算角色走的步數；每升一境，淨化之戰多一步
const REALMS = t('realms'), NEED = [150, 200, 250, 300];
G.realm = 0; G.xiu = 0; G.walked = 0;
const xiuFull = () => G.realm < NEED.length && G.xiu >= NEED[G.realm];
function gainXiu(m) {
  G.walked += m;
  if (G.realm >= NEED.length || xiuFull()) return;
  G.xiu = Math.min(NEED[G.realm], G.xiu + m);
  if (xiuFull()) { toast(t('xiuFull')); sfx.sense(); }
}
function breakthrough() {
  if (!xiuFull()) return;
  G.realm++; G.xiu = 0;
  setTimeout(() => {
    pop(t('breakthrough', { realm: REALMS[G.realm] }), 'gold'); sfx.purify();
    burst(P.x, P.y + 1.2, P.z, [1, 0.9, 0.5], 60, 7);
    try { navigator.vibrate && navigator.vibrate([30, 40, 30, 40, 90]); } catch { }
  }, 300);
}
function xiuLine() {
  if (G.realm >= NEED.length) return t('xiuMax', { realm: REALMS[G.realm] });
  if (xiuFull()) return t('xiuReady');
  return t(G.geo ? 'xiuLeftGeo' : 'xiuLeftIsland', { n: Math.ceil(NEED[G.realm] - G.xiu), next: REALMS[G.realm + 1] });
}
// 現世走路帶動靈界：離真實目的地近了幾成，阿流就在島上朝下一座門走幾成，真的走到時島上也剛好到門前
let sync = null;
function syncIsland(p) {
  const tg = radarTarget(), it = guideTarget(); if (!tg || tg.tale || G.state === 'title') return;
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
$('#qFold').addEventListener('click', e => { e.stopPropagation(); setFold(!questEl.classList.contains('fold') ? true : false); });
questEl.addEventListener('click', e => { if (questEl.classList.contains('fold')) { e.stopPropagation(); setFold(false); } });
const toast = text => { const el = $('#toast'); el.textContent = text; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); };
const avail = () => G.collected + (G.bonus || 0) - G.spent;
let hudKey = '';
function hud() {
  const found = SPOTS.filter(sp => sp.found).length;
  const key = [Math.round(G.walked), visited.size, G.geo, G.collected, G.bonus, G.spent, G.awakened, G.gateOpen, G.realm, Math.ceil(G.xiu), found].join();
  if (key !== hudKey) {
    hudKey = key;
    $('#lv').textContent = REALMS[G.realm];
    $('#xbar').style.width = (G.realm >= NEED.length ? 100 : G.xiu / NEED[G.realm] * 100) + '%';
    const steps = Math.round(G.geo ? G.walked / 0.7 : G.walked);   // 現世：用公尺換算步數（一步約 0.7 公尺）
    $('#meSteps').textContent = t('stepsN', { n: steps.toLocaleString() });
    $('#meDist').textContent = G.geo ? t('meDist', { d: fmt(G.walked) }) : '';
    $('#meXiu').textContent = xiuLine();
    $('#meGrid').innerHTML = [[t('meSeals'), `${G.awakened}/${S1.length + S2.length}`], [t('meQi'), avail()], [t('beauty'), `${found}/${SPOTS.length}`], [t('meChances'), visited.size]]
      .map(([k, v]) => `<li><small>${k}</small><b>${v}</b></li>`).join('');
    $('#dexN').textContent = found; $('#dexSub').textContent = t('dexSub', { n: found, m: SPOTS.length });
    // 已收集的項目可以點開，用景點介紹頁再看一次；有照片就放縮圖
    const ent = (k, key, title, sub, text) => { const im = spotInfo(key)?.images?.[0]?.file; return `<li class="open" data-k="${k}"><div class="t"><b>${title}</b><small>${sub}</small><p>${text}</p></div>${im ? `<img src="${im}" alt="">` : ''}<i class="chev"></i></li>`; };
    const gate = n => n.awake ? ent('g:' + n.id, n.id, `${n.icon} ${n.name}${t('sep')}${n.hill}`, `${n.seal}${t('sep')}${n.virtue}`, n.info) : `<li class="lock open" data-k="xg:${n.id}"><div class="t"><b>${n.icon} ？？？</b><small>${n.seal}</small></div><i class="chev"></i></li>`;
    $('#dexList').innerHTML = `<li class="sec">${t('secMountain')}</li>` + S1.map(gate).join('')
      + (stage1Done() && G.geo ? `<li class="sec">${t('secTales')}</li>` + TALES.map(s => visited.has(s.id) ? ent('t:' + s.id, s.id, s.name, s.sub, s.text) : `<li class="lock open" data-k="xt:${s.id}"><div class="t"><b>？？？</b><small>${s.sub.split('・')[1]}</small></div><i class="chev"></i></li>`).join('') : '')
      + (stage1Done() && talesDone() ? `<li class="sec">${t('secFlows')}</li>` + S2.map(gate).join('') : '')
      + (visited.size ? `<li class="sec">${t('secCulture')}</li>` + REAL.filter(x => !x.tale && visited.has(x.id)).map(x => ent('r:' + x.id, x.id, x.name, x.sub, x.text)).join('') : '')
      + `<li class="sec">${t('beauty')}</li>`
      + SPOTS.map(sp => sp.found ? ent('s:' + sp.id, sp.id, sp.name, sp.area, sp.text) : `<li class="lock open" data-k="xs:${sp.id}"><div class="t"><b>？？？</b><small>${sp.area.split(/・|, | · /)[0]}</small></div><i class="chev"></i></li>`).join('');
    $('#qi').textContent = t('qiOf', { n: avail(), cost: COST });
    $('#qibar').style.width = Math.min(100, avail() / COST * 100) + '%';
    const stars = n => ' ' + '★'.repeat(n.star);
    const dots = list => list.map(n => `<i class="${n.awake ? 'done' : ''}"></i>`).join('');
    let head, title, sub;
    if (talesStage()) {
      const got = TALES.filter(s => visited.has(s.id)).length, tg = radarTarget();
      head = t('talesHead'); $('#qchips').innerHTML = TALES.map(s => `<i class="${visited.has(s.id) ? 'done' : ''}"></i>`).join('');
      title = t('talesTitle', { n: got, m: TALES.length });
      sub = tg ? tg.name + t('sep') + fmt(meters(geo.pos, tg)) : '';
      $('#qlist').innerHTML = TALES.map(s => `<li class="${visited.has(s.id) ? 'done' : ''}"><span>${visited.has(s.id) ? '✓' : '・'}</span>${s.name}<small>${visited.has(s.id) ? t('taleFound') : s.sub.split('・')[1] + t('sep') + fmt(meters(geo.pos, s))}</small></li>`).join('')
        + `<li class="note">${t('talesNote')}</li><li class="note">${xiuLine()}</li>`;
    } else if (!G.gateOpen && stage1Done()) {
      const left = S2.filter(n => !n.awake);
      head = t('stage2Head'); $('#qchips').innerHTML = dots(S2);
      title = G.realm < REQ ? t('train2', { realm: REALMS[REQ] }) : t('wake2');
      sub = G.realm < REQ ? xiuLine() : left.map(n => G.geo ? placeOf(n) : n.name).join(t('list'));
      $('#qlist').innerHTML = S2.map(n => `<li class="${n.awake ? 'done' : G.realm >= REQ ? '' : 'wait'}"><span>${n.awake ? '✓' : n.icon}</span>${n.seal}${t('sep')}${n.name}${stars(n)}<small>${n.awake ? n.virtue : (G.realm < REQ ? t('needRealmShort', { realm: REALMS[REQ], now: REALMS[G.realm] }) + t('sep') : '') + (G.geo ? t('questGeo', { place: placeOf(n), hill: n.hill }) : n.hill)}</small></li>`).join('')
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
{
  const g = base.getContext('2d'), img = g.createImageData(N, N);
  for (let i = 0; i < N * N; i++) {
    const k = world.K[i], h = world.H[i];
    let c = k === T.SEA ? [28, 70, 120] : k === T.SAND ? [220, 205, 160] : k === T.ROCK ? [150, 155, 160] : (k === T.ROAD || k === T.BUILDING || k === T.TOWER || k === T.STONE) ? [170, 176, 186] : [90 - h * 2, 170 - h * 4, 80];
    if (k === T.SEA && Math.abs((i % N) - curX(i / N | 0)) < CURRENT.half) c = [60, 130, 190];
    img.data.set([...c, 255], i * 4);
  }
  g.putImageData(img, 0, 0);
}
function drawMini() {
  const s = mini.width = mini.height = Math.round(mini.clientWidth * Math.min(devicePixelRatio, 2)), k = s / N, q = k * Math.sqrt(S);   // q：標記大小，島變大時標記不會縮成一點
  mg.imageSmoothingEnabled = false; mg.drawImage(base, 0, 0, s, s);
  const dot = (x, z, col, rad) => { mg.fillStyle = col; mg.beginPath(); mg.arc(x * k, z * k, rad * q, 0, 7); mg.fill(); };
  for (const n of NODES) dot(n.pos[0], n.pos[2], n.awake ? '#ffcf5a' : n.stage === 2 && !stage1Done() ? 'rgba(150,165,180,.7)' : `rgba(255,190,110,${0.6 + 0.4 * Math.sin(G.t * 4)})`, n.stage === 2 ? 2.2 : 3.2);
  dot(GATE[0], GATE[2], G.gateOpen ? '#ffcf5a' : '#b9483c', 3.2);
  if (guideOn) { // 「帶我去」的目的地：金色脈動圈＋虛線
    const g = guideTarget(), x = g.pos[0] * k, z = g.pos[2] * k;
    mg.setLineDash([3 * q, 3 * q]); mg.strokeStyle = 'rgba(255,207,90,.85)'; mg.lineWidth = q; mg.beginPath(); mg.moveTo(P.x * k, P.z * k); mg.lineTo(x, z); mg.stroke(); mg.setLineDash([]);
    mg.lineWidth = 1.4 * q; mg.beginPath(); mg.arc(x, z, (6 + 2 * Math.sin(G.t * 4)) * q, 0, 7); mg.stroke();
  }
  for (const sp of SPOTS) if (sp.r) { mg.strokeStyle = '#fff'; mg.lineWidth = q * 0.8; mg.beginPath(); mg.arc((sp.pos[0] + 0.5) * k, (sp.pos[1] + 0.5) * k, 2 * q, 0, 7); sp.found ? (mg.fillStyle = '#fff', mg.fill()) : mg.stroke(); }
  mg.save(); mg.translate(P.x * k, P.z * k); mg.rotate(-P.yaw); mg.scale(q / k, q / k);
  mg.fillStyle = '#fff'; mg.strokeStyle = '#123'; mg.lineWidth = k; mg.beginPath();
  mg.moveTo(0, 5 * k); mg.lineTo(3.4 * k, -3 * k); mg.lineTo(-3.4 * k, -3 * k); mg.closePath(); mg.fill(); mg.stroke(); mg.restore();
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
  talk = { lines, i: 0, done }; $('#dialog b').textContent = who; $('#dialog p').textContent = lines[0]; $('#dialog').classList.add('show');
}
function nextLine() {
  if (!talk) return;
  talk.i++;
  if (talk.i >= talk.lines.length) { const d = talk.done; talk = null; $('#dialog').classList.remove('show'); d && d(); return; }
  $('#dialog p').textContent = talk.lines[talk.i];
}
$('#dialog').addEventListener('pointerdown', e => { e.preventDefault(); nextLine(); });

function start(mode) {
  initAudio();
  $('#title').classList.add('hide');
  G.state = 'intro'; G.geo = mode === 'geo'; $('#hud').classList.add('on');
  // 手機上操作說明 10 秒後收起，讓畫面留給地圖
  if (innerWidth < 600) setTimeout(() => { $('.hint').style.display = 'none'; }, 10000);
  cam.yaw = 0; cam.tx = P.x; cam.ty = P.y + 1.5; cam.tz = P.z;
  if (G.geo) geo.start();
  say(G.geo ? GEO_LINES : LINES, () => {
    G.state = 'play'; $('#hud').classList.add('play'); XI.wave = false;
    pop(t('firstSeal'), 'gold'); setTimeout(() => toast(t('xiuIntro')), 2600);
    // 不直接跳進雷達：讓雷達按鈕發光＋小提示，由玩家自己點開
    if (G.geo) setTimeout(nudgeRadar, 900);
  });
  try { if (matchMedia('(pointer: coarse)').matches && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => { }); } catch { }
}
$('#title .start').addEventListener('click', () => start('geo'));
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
if (!params.has('play') && !params.has('geo') && !params.has('demo') && (wantFilm || (showA2hs && !a2hsShown))) {
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
  G.sense = 6; G.senseCd = 9; G.pulse = [P.x, P.z, 0, 1]; sfx.sense();
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
  n.vein = r.mesh(b);
}

// 開門前先淨化擋在門前的濁流；?nobattle 可跳過（測試用）
function fight(n, then) {
  if (params.has('nobattle')) return then();
  G.state = 'battle'; $('#hud').classList.remove('play', 'on'); $('#card').classList.remove('show'); sfx.battle(true);
  battle(n, G.realm, REALMS[G.realm]).then(ok => { sfx.battle(false); G.state = 'play'; $('#hud').classList.add('play', 'on'); if (ok) then(); else toast(t('battleLeft', { name: n.name })); });
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
  pop(t('resonance'), 'gold'); sfx.bell(146.8); setTimeout(() => sfx.bell(196), 220); setTimeout(() => sfx.bell(220), 440); setTimeout(() => sfx.bell(174.6), 660);
  for (const n of S1) { n.flash = 1; burst(n.pos[0], n.pos[1] + 2, n.pos[2], [1, 0.85, 0.45], 50, 9); }
  try { navigator.vibrate && navigator.vibrate([60, 60, 60, 60, 160]); } catch { }
  setTimeout(() => toast(G.geo ? t('talesOpen') : t('stage2Open', { realm: REALMS[REQ] })), 2600);
}
// 三流歸一：城、海、山三道光一起升起，台北靈門隨後開啟
function unite() {
  pop(t('flowsUnite'), 'gold'); S2.forEach((n, i) => setTimeout(() => sfx.bell(n.bell), i * 260));
  for (const n of NODES) { n.flash = 1; burst(n.pos[0], n.pos[1] + 2, n.pos[2], [1, 0.85, 0.45], 40, 9); }
  try { navigator.vibrate && navigator.vibrate([60, 60, 60, 60, 160]); } catch { }
  setTimeout(openGate, 2600);
}

function openGate() {
  G.gateOpen = true; G.gateT = 0; sfx.gate();
  pop(t('gateOpen'), 'gold');
  XI.x = GATE[0] + 2.2; XI.z = GATE[2] - 2; XI.yaw = Math.PI; XI.wave = true;
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
  if (G.auto > 0 && mag < 0.1 && G.state === 'play') {
    const tp = guideTarget().pos, dx = tp[0] - P.x, dz = tp[2] - P.z, L = Math.hypot(dx, dz);
    if (L < 2.4) G.auto = 0;
    else { mx = dx / L; mz = dz / L; mag = 1; G.auto -= (P.swim ? 3.8 : 7) * dt; }
  }
  const speed = P.swim ? 3.8 : 7;
  const a = 1 - Math.exp(-dt * 12);
  P.vx = lerp(P.vx, mx * speed, a); P.vz = lerp(P.vz, mz * speed, a);
  if (mag > 0.1) {
    const want = Math.atan2(mx, mz); let d = want - P.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
    P.yaw += d * Math.min(1, dt * 14);
  }
  let vx = P.vx, vz = P.vz, curS = 0;
  if (P.swim) { const c = world.current(P.x, P.z); vx += c[0]; vz += c[1]; curS = c[2]; }
  G.riding = curS > 0.4;
  const step = P.swim ? 2.1 : 1.1;
  if (!blocked(P.x + vx * dt, P.z, P.y, step)) P.x += vx * dt;
  if (!blocked(P.x, P.z + vz * dt, P.y, step)) P.z += vz * dt;

  const gnd = footGround(P.x, P.z), swimLv = WATER - 1.05, deep = gnd < WATER - 1.1;
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
      if (avail() >= COST) act = { key: n.id, text: t('gateHere', { icon: n.icon, name: n.name }), btn: t('gateGo'), fn: () => fight(n, () => awaken(n)) };
      else if (G.t - G.warnT > 4) { G.warnT = G.t; sfx.deny(); toast(t('notEnough', { cost: COST, n: avail() })); }
    } else n.charge = Math.max(0, n.charge - dt);
  }
  const pr = $('#prog');
  if (charging && !charging.awake) { pr.classList.add('show'); pr.style.setProperty('--p', (charging.charge * 100).toFixed(1) + '%'); }
  else pr.classList.remove('show');
  // 台北靈門
  if (G.gateOpen) {
    G.gateT += dt;
    if (Math.abs(P.x - GATE[0]) < 2.6 && Math.abs(P.z - GATE[2]) < 2.2) act = { key: 'gate', text: t('finalHere'), btn: t('finalGo'), fn: ending };
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
  if ((a && a.key) === (actNow && actNow.key)) { if (a) actNow.fn = a.fn; return; }
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
  showCard(sp.name, sp.area, sp.text, t('discovered', { n: SPOTS.filter(s => s.found).length, m: SPOTS.length }), sp.id);
}
// 臺北旅遊網 Open API 的介紹與照片（由 tools/fetch-taipei-travel.mjs 產生；沒有檔案時就只用遊戲內文字）
let TT = null, CM = null;
fetch('data/taipei-travel.json').then(r => r.ok ? r.json() : null).then(j => { TT = j; hudKey = ''; }).catch(() => { });
// 臺北旅遊網沒有的景點（外縣市、部分古蹟），照片改用 Wikimedia Commons
fetch('data/commons.json').then(r => r.ok ? r.json() : null).then(j => { CM = j; hudKey = ''; }).catch(() => { });
const spotInfo = k => TT?.spots?.[k]?.images?.length ? TT.spots[k] : CM?.spots?.[k] || TT?.spots?.[k];
const clip = (t, n) => t.length > n ? t.slice(0, n).replace(/\s+$/, '') + '…' : t;
let spotData = null;
function showCard(title, sub, text, em, key) {
  // 地標標籤：一行名字＋地區，點了才開滿版介紹；沒點就自己淡出
  const c = $('#card'), d = key && spotInfo(key);
  spotData = { title, sub, text, em, d };
  c.querySelector('b').textContent = title; c.querySelector('small').textContent = sub;
  c.classList.add('show');
  clearTimeout(showCard.t); showCard.t = setTimeout(() => c.classList.remove('show'), 12000);
}
const spotEl = $('#spot'), spotPh = spotEl.querySelector('.ph'), spotDots = spotEl.querySelector('.dots');
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
    imgs.forEach(im => { const label = [im.author, im.license].filter(Boolean).join('・') || 'Wikimedia Commons'; if (seen.has(label)) return;
      const a = document.createElement('a'); a.href = im.page; a.target = '_blank'; a.rel = 'noopener'; a.textContent = label; cr.append(seen.size ? '、' : '', a); seen.add(label); });
    cr.append(t('photoPost'));
  } else if (d) {
    const dl = (lang !== 'zh' && d.i18n?.[lang]) || d;
    const a = document.createElement('a'); a.href = dl.url || d.url || TT.sourceUrl; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = t('creditLink', { name: dl.name || d.name }); cr.append(t('creditPre'), a, t('creditPost'));
  }
  spotEl.hidden = false; spotEl.scrollTop = 0;
}
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
for (const page of [radar, $('#dex'), $('#spot'), $('#settings'), $('#me')]) {
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
$('#simT').addEventListener('change', e => geo.setSim(e.target.checked));
$('#enc button').addEventListener('click', () => encSpot && encounter(encSpot));
function inRange() {
  return REAL.filter(shown).map(s => ({ s, d: meters(geo.pos, s) })).filter(o => o.d <= o.s.r && (!visited.has(o.s.id) || o.s.id === 'venue')).sort((a, b) => a.d - b.d)[0]?.s || null;
}
function fmt(d) { return d < 1000 ? t('meters', { n: Math.round(d) }) : t('km', { n: (d / 1000).toFixed(1) }); }
function renderList() {
  const items = REAL.filter(shown).map(s => ({ s, d: meters(geo.pos, s) })).sort((a, b) => a.d - b.d), tg = radarTarget();
  const html = items.map(({ s, d }) => {
    const done = visited.has(s.id), node = s.node ? NODES.find(n => n.id === s.node) : null;
    const tag = s.tale ? (done ? t('taleFound') : t('taleTag')) : s.id === 'venue' ? (G.gateOpen ? t('canOpen') : t('startEnd')) : node ? (node.awake ? t('opened', { icon: node.icon, name: node.name }) : node === nextGate() ? `${node.seal}${t('sep')}${node.icon} ${node.name}` : node.seal + t('sep') + node.name) : done ? t('bound') : t('chance');
    return `<li data-id="${s.id}" class="${done ? 'done' : ''} ${d <= s.r ? 'near' : ''} ${node ? 'key' : ''} ${s === tg ? 'target' : ''}"><div><b>${s.name}</b><small>${s.sub}</small></div>`
      + `<span><em>${tag}</em>${t('distDir', { d: fmt(d), dir: dirFor(s) })}</span>`
      + (calib ? `<button data-cal="${s.id}">${t('setHere')}</button>` : '') + `</li>`;
  }).join('');
  if (html !== renderList.html) { renderList.html = html; $('#rlist').innerHTML = html; }   // 沒變就不重畫，點擊才不會被吃掉
  if (calib) $('#calOut').textContent = JSON.stringify(Object.fromEntries(REAL.map(s => [s.id, [+s.lat.toFixed(6), +s.lng.toFixed(6)]])));
}
$('#rlist').addEventListener('click', e => {
  const cal = e.target.closest('[data-cal]');
  if (cal) { const s = REAL.find(x => x.id === cal.dataset.cal), p = geo.real || geo.pos; s.lat = p.lat; s.lng = p.lng; saveSpot(s); renderList(); toast(t('setDone', { name: s.name })); return; }
  const li = e.target.closest('li'); if (!li) return;
  const s = REAL.find(x => x.id === li.dataset.id);
  if (geo.sim) geo.walkTo(s); else toast(t('walkThere', { name: s.name, dir: dirFor(s), d: fmt(meters(geo.pos, s)) }));
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
});
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
    const [x, y] = s.tale ? edge(...P2(s)) : P2(s), near = meters(geo.pos, s) <= s.r, key = s.node || s.id === 'venue' || s.tale;
    const done = visited.has(s.id) || (s.node && NODES.find(n => n.id === s.node).awake);
    g.globalAlpha = near ? 0.35 + 0.25 * Math.sin(G.t * 6) : 0.14;
    g.fillStyle = s.id === 'venue' ? '#ffcf5a' : s.tale ? '#ffa78c' : s.node ? '#6fe3ff' : '#ffffff';
    g.beginPath(); g.arc(x, y, s.r * sc, 0, 7); g.fill();
    g.globalAlpha = crowd && !key ? 0.5 : 0.85;
    g.beginPath(); g.arc(x, y, (key ? 5 : 3.5) * d, 0, 7); g.fill(); g.globalAlpha = 1;
    if (done) { g.strokeStyle = '#ffcf5a'; g.lineWidth = 2 * d; g.stroke(); }
    if (!crowd || s.id === 'venue' || (s.tale && range > 1500)) { g.fillStyle = 'rgba(238,243,248,.75)'; g.font = `${12 * d}px sans-serif`; g.fillText(s.name, x, y - 9 * d); }
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
  const rt = $('#rtarget'), html = tg ? `${t('rTarget', { name: tg.name })}<small>${t('distDir', { d: fmt(td), dir: dirFor(tg) })}</small><a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${tg.lat},${tg.lng}&travelmode=walking">${t('maps')}</a>` : '';
  if (rt.innerHTML !== html) rt.innerHTML = html;
  // 狀態列與機緣按鈕
  $('#gstat').textContent = geo.sim ? t('simStat', { err: geo.error ? t('sep') + geo.error : '' }) : t('gpsStat', { n: Math.round(geo.acc || 0) });
  $('#simT').checked = geo.sim;
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
  visited.add(s.id);
  if (s.tale) { taleFound(s); return; }
  const node = s.node && NODES.find(n => n.id === s.node);
  if (node) {
    P.x = node.pos[0]; P.z = node.pos[2] + 4; P.y = P.ry = footGround(P.x, P.z) + 0.2; P.vy = 0; P.swim = false;
    cam.yaw = Math.PI; cam.tx = P.x; cam.tz = P.z; cam.ty = P.y + 1.6;
    G.state = 'talk';
    const nx = nextGate();
    if (!node.awake && node.stage === 2 && stage1Done() && G.realm < REQ) {
      say([t('shadow', { icon: node.icon, name: node.name }), t('needRealm', { name: node.name, realm: REALMS[REQ], now: REALMS[G.realm] })], () => { G.state = 'play'; setTimeout(() => showCard(s.name, t('chanceSub', { sub: s.sub }), s.text, t('needRealmShort', { realm: REALMS[REQ], now: REALMS[G.realm] }), s.id), 400); });
      return;
    }
    if (!node.awake && !canOpen(node)) {
      G.bonus += 1;
      say([t('shadow', { icon: node.icon, name: node.name }), (nx ? t('goFirst', { next: nx.name, place: placeOf(nx) }) : t('talesNote'))], () => { G.state = 'play'; setTimeout(() => showCard(s.name, t('chanceSub', { sub: s.sub }), s.text, t('sealWait', { seal: node.seal }), s.id), 400); });
      return;
    }
    say(s.story, () => {
      G.state = 'play';
      const card = () => setTimeout(() => showCard(s.name, t('chanceSub', { sub: s.sub }), s.text, t('boundWith', { name: node.name }), s.id), 900);
      if (!node.awake) fight(node, () => { G.bonus += COST; awaken(node); card(); });
      else { G.bonus += 1; card(); }
    });
  } else {
    G.bonus += 2; sfx.pick(); setTimeout(() => sfx.pick(), 150);
    burst(P.x, P.y + 1.5, P.z, [1, 0.9, 0.5], 40, 5);
    showCard(s.name, t('chanceSub', { sub: s.sub }), s.text, t('chanceBonus', { n: visited.size }), s.id);
  }
}
$('#card').addEventListener('click', e => { e.stopPropagation(); openSpot(); });
$('#dexBtn').addEventListener('click', e => { e.stopPropagation(); $('#card').classList.remove('show'); $('#dex').classList.toggle('show'); });
$('#dexClose').addEventListener('click', () => $('#dex').classList.remove('show'));

// 第二階：走到台北城市故事的地點，阿汐說故事、收進圖鑑；七個都找到就開第三階
function taleFound(s) {
  G.bonus += 2; sfx.pick(); setTimeout(() => sfx.pick(), 150);
  burst(P.x, P.y + 1.5, P.z, [1, 0.75, 0.6], 40, 5);
  const n = TALES.filter(x => visited.has(x.id)).length;
  G.state = 'talk';
  say(s.lines, () => {
    G.state = 'play';
    setTimeout(() => showCard(s.name, s.sub, s.text, s.fact, s.id), 400);
    if (talesDone()) setTimeout(() => {
      pop(t('talesAll'), 'gold'); sfx.bell(196); setTimeout(() => sfx.bell(220), 240); setTimeout(() => sfx.bell(293.7), 480);
      setTimeout(() => toast(t('stage2Open', { realm: REALMS[REQ] })), 2600);
    }, 1600);
  });
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
    if (n.vein) r.draw(n.vein, I, [1, 1, 1], 0.6 + 0.4 * Math.sin(G.t * 3));
  }
  if (s > 0.01) { const m = M.ident(); M.translate(m, 0, -(1 - smooth(0, 0.6, s)) * 50, 0); r.draw(floats, m, [1, 1, 1], 0.05); }
  const pa = { phase: P.phase, move: P.move, air: !P.onGround && !P.swim, swim: P.swim, t: G.t };
  drawAvatar(r, BLUE, P.x, P.ry - (P.swim ? 0.0 : 0), P.z, P.yaw, pa, G.state === 'ending' ? 0.3 : 0);
  const xg = ground(XI.x, XI.z);
  drawAvatar(r, ORANGE, XI.x, xg, XI.z, XI.yaw, { phase: 0, move: 0, air: false, swim: false, t: G.t + 1.3, wave: XI.wave });

  // 半透明：水、影子
  r.blend(1);
  r.drawWater(water, env);
  r.blend(1);
  if (!P.swim) { const gy = footGround(P.x, P.z); r.box(P.x, gy + 0.03, P.z, 0.95, 0.02, 0.95, [0, 0, 0], 0, clamp(0.35 - (P.y - gy) * 0.06, 0.08, 0.35)); }
  r.box(XI.x, xg + 0.03, XI.z, 0.95, 0.02, 0.95, [0, 0, 0], 0, 0.3);

  // 加亮：靈光、光柱、粒子、山門
  r.blend(2);
  const near = 9;
  for (const m of motes) {
    if (m.taken) continue;
    const d = Math.hypot(m.x - P.x, m.z - P.z);
    const vis = Math.max(G.sense > 0 ? 1 : 0, 0.35 + s * 0.4, smooth(near + 6, near, d));
    const y = m.y + Math.sin(G.t * 2 + m.ph) * 0.18;
    r.box(m.x, y, m.z, 0.34, 0.34, 0.34, [0.7, 1, 1], 1, vis, G.t * 2 + m.ph);
    r.box(m.x, y, m.z, 0.8, 0.8, 0.8, [0.4, 0.85, 1], 1, vis * 0.25, -G.t + m.ph);
  }
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
  if (G.riding && P.swim) for (let i = 0; i < 3; i++) r.box(P.x + Math.sin(G.t * 7 + i * 2) * 0.6, WATER + 0.05, P.z + 0.6 + i * 0.7, 0.25, 0.05, 0.6, [0.8, 0.95, 1], 1, 0.5 - i * 0.12);
  r.blend(0);

  // 阿汐的名牌
  const tag = $('#tag'), pj = M.project(vp, XI.x, xg + 2.6, XI.z);
  if (pj && G.state !== 'title' && pj[0] > 0 && pj[0] < 1 && pj[1] > 0 && pj[1] < 1) { tag.style.transform = `translate(${pj[0] * innerWidth}px,${pj[1] * innerHeight}px) translate(-50%,-100%)`; tag.style.opacity = 1; }
  else tag.style.opacity = 0;
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
window.__game = { showCard, openGuide, cam, fight, gainXiu, G, P, cam, NODES, motes, input, awaken, doSense, SPOTS, geo, REAL, openRadar, encounter };
