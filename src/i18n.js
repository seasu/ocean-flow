// 多國語系：繁體中文（zh）、English（en）、日本語（ja）
// 語言依序取自 ?lang=、上次選擇（localStorage）、瀏覽器語言；切換語言會重新載入頁面
// 英文與日文為團隊自行翻譯，待母語者校對
export const LANGS = [['zh', '繁中'], ['en', 'EN'], ['ja', '日本語']];
const KEY = 'oceanflow.lang';

function detect() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q && LANGS.some(l => l[0] === q)) return q;
  try { const s = localStorage.getItem(KEY); if (s && LANGS.some(l => l[0] === s)) return s; } catch { }
  for (const l of navigator.languages || [navigator.language || '']) {
    const v = (l || '').toLowerCase();
    if (v.startsWith('zh')) return 'zh';
    if (v.startsWith('ja')) return 'ja';
    if (v.startsWith('en')) return 'en';
  }
  return 'en';
}
export const lang = detect();
document.documentElement.lang = { zh: 'zh-Hant', en: 'en', ja: 'ja' }[lang];

export function setLang(l) {
  try { localStorage.setItem(KEY, l); } catch { }
  const u = new URL(location.href); u.searchParams.delete('lang'); location.href = u.toString();
}

// 依語言挑選：{ zh, en, ja } → 目前語言的值（沒有就用中文）
export const pick = o => (o && (o[lang] ?? o.zh));
// 資料表：把 entry.en / entry.ja 的欄位蓋到 entry 上
export function localize(list) { for (const e of list) Object.assign(e, e[lang] || {}); return list; }

const S = {
  title: ['洋流：起源', 'Ocean Flow: Origin', '洋流：起源'],
  liu: ['阿流', 'A-Liu', 'アリュウ'],
  xi: ['阿汐', 'A-Xi', 'アシー'],
  traveler: ['旅人・阿流', 'Traveler · A-Liu', '旅人・アリュウ'],
  qi: ['靈光 {n}', 'Spirit Light {n}', '霊光 {n}'],
  radar: ['📍 現世', '📍 Real World', '📍 現世'],
  beauty: ['台灣之美', 'Beauty of Taiwan', '台湾の美'],
  dexBtn: ['📖 台灣之美 {n}/{m}', '📖 Beauty of Taiwan {n}/{m}', '📖 台湾の美 {n}/{m}'],
  quest: ['主線任務', 'Main Quest', 'メインクエスト'],
  mute: ['靜音', 'Mute', 'ミュート'],
  charging: ['啟流中', 'Awakening…', '啓流中'],
  sense: ['感知', 'Sense', '感知'],
  jump: ['跳', 'Jump', 'ジャンプ'],
  hint: ['左邊拖曳：移動<br>右邊拖曳：轉視角', 'Drag left: move<br>Drag right: look', '左側ドラッグ：移動<br>右側ドラッグ：視点'],
  more: ['介紹 ▴', 'More ▴', '紹介 ▴'],
  less: ['收起 ✕', 'Close ✕', '閉じる ✕'],
  dexTitle: ['台灣之美 圖鑑', 'Beauty of Taiwan · Field Guide', '台湾の美 図鑑'],
  tapClose: ['點一下關閉', 'Tap to close', 'タップで閉じる'],
  radarTitle: ['現世・靈脈雷達', 'Real World · Spirit Radar', '現世・霊脈レーダー'],
  trail: ['文化徑 × 山林徑・走一條路，認識台北這座城', 'Culture Trail × Mountain Trail · Walk one path, get to know Taipei', '文化の道 × 山林の道・一本の道で、台北を知る'],
  backSpirit: ['回到靈界 ✕', 'Back to Spirit World ✕', '霊界へ戻る ✕'],
  enter: ['進入機緣', 'Enter encounter', '縁に入る'],
  simLabel: ['模擬定位：點雷達或清單就走過去（展示用）', 'Simulated location: tap the radar or list to walk there (for demos)', '位置のシミュレーション：レーダーか一覧をタップすると移動（デモ用）'],
  safety: ['請走人行道、注意來車，過馬路時不要看手機。', 'Stay on the sidewalk, watch for traffic, and don\'t look at your phone while crossing.', '歩道を歩き、車に注意してください。横断中はスマホを見ないでください。'],
  tapNext: ['點一下繼續 ▸', 'Tap to continue ▸', 'タップで次へ ▸'],
  tagline: ['山有脈，海有流，人亦有自己的道。<br>走遍一座方塊台灣：台北、龜山島、日月潭、玉山、墾丁。', 'Mountains have veins, the sea has currents, and people have their own way.<br>Explore a blocky Taiwan: Taipei, Guishan Island, Sun Moon Lake, Yushan, Kenting.', '山に脈あり、海に流れあり、人にもまた道あり。<br>ブロックの台湾をめぐろう：台北、亀山島、日月潭、玉山、墾丁。'],
  startGeo: ['走出去・現地探索', 'Go outside · Explore on site', '外へ出よう・現地探索'],
  startIsland: ['先在島上逛逛', 'Explore the island first', 'まず島を歩いてみる'],
  how: ['現地探索會使用定位，從黑客松會場（北平東路30號）出發<br>沒有定位時會自動改用模擬定位・建議開聲音<br>電腦：WASD 移動、空白鍵跳、E 感知',
    'On-site mode uses your location, starting from the hackathon venue (No. 30, Beiping E. Rd.)<br>Without location it switches to a simulated one · Sound on recommended<br>Desktop: WASD to move, Space to jump, E to sense',
    '現地探索は位置情報を使い、ハッカソン会場（北平東路30号）から出発します<br>位置情報がない場合は自動でシミュレーションに切り替え・音声オン推奨<br>PC：WASD で移動、スペースでジャンプ、E で感知'],
  endTitle: ['城市本身，也存在流。', 'The city itself has its own flow.', '都市そのものにも、流れがある。'],
  endTag: ['走出去，遇見你的機緣。', 'Go outside and meet your encounters.', '外へ出て、あなたの縁に出会おう。'],
  again: ['再走一次', 'Walk again', 'もう一度歩く'],
  watchFilm: ['▶ 觀看介紹影片', '▶ Watch the intro film', '▶ 紹介映像を見る'],
  skip: ['略過 ▸', 'Skip ▸', 'スキップ ▸'],
  tapSound: ['🔊 點一下開聲音', '🔊 Tap for sound', '🔊 タップで音声オン'],
  noGL: ['此裝置無法執行 WebGL', 'WebGL is not available on this device', 'この端末では WebGL を実行できません'],

  shoushan: ['四獸山位在台北市信義區東南，屬於南港山系。四座小山因為外形像象、虎、豹、獅而得名，步道彼此相連，就在城市邊上。',
    'The Four Beasts Mountains lie in southeast Xinyi District and belong to the Nangang range. Named for their elephant, tiger, leopard and lion shapes, their trails link together right at the edge of the city.',
    '四獣山は台北市信義区の南東、南港山系にある四つの小山です。象・虎・豹・獅子に似た形から名付けられ、遊歩道がつながり、街のすぐそばにあります。'],
  secMountain: ['山林徑・四獸靈門', 'Mountain Trail · Four Beast Gates', '山林の道・四獣霊門'],
  secCulture: ['文化徑・現世機緣', 'Culture Trail · Real-world encounters', '文化の道・現世の縁'],
  questTitle: ['第一階・山林徑：四獸靈門（{n}/4）', 'Stage 1 · Mountain Trail: Four Beast Gates ({n}/4)', '第一章・山林の道：四獣霊門（{n}/4）'],
  waitPrev: ['等前一印開啟', 'Open the previous seal first', '前の印が開くのを待つ'],
  questGeo: ['現世：{place}（或到島上 101 東邊的{hill}）', 'Real world: {place} (or {hill}, east of 101 on the island)', '現世：{place}（または島の101東側の{hill}）'],
  questNote: ['依序 象→虎→豹→獅，每印需要 {cost} 點靈光・四獸共鳴後開啟台北靈門・第二階：城之回聲、海之流痕、山之鐘聲（尚未開放）',
    'In order: Elephant → Tiger → Leopard → Lion, {cost} Spirit Light per seal · Four Beasts Resonance opens the Taipei Spirit Gate · Stage 2: Echo of the City, Trace of the Sea, Bell of the Mountain (coming later)',
    '順番に 象→虎→豹→獅、各印に霊光 {cost} 点・四獣共鳴で台北霊門が開く・第二章：街のこだま、海の流れ痕、山の鐘の音（未公開）'],
  questDone: ['四獸共鳴・前往台北靈門', 'Four Beasts Resonance · Go to the Taipei Spirit Gate', '四獣共鳴・台北霊門へ'],
  backVenue: ['回到會場', 'Return to the venue', '会場に戻る'],
  gateWaits: ['台北靈門在起點等你', 'The Taipei Spirit Gate waits at the start', '台北霊門がスタート地点で待っている'],
  islandGate: ['島上西側平原的紅色牌樓', 'The red archway on the island\'s western plain', '島の西側の平原にある赤い牌楼'],
  xiWaits: ['阿汐在那裡等你', 'A-Xi is waiting there', 'アシーがそこで待っている'],
  firstSeal: ['第一印：象門', 'First Seal: Elephant Gate', '第一の印：象門'],
  gateName: ['台北靈門', 'Taipei Spirit Gate', '台北霊門'],
  senseToast: ['感知：{name} 在{dir}方 {n} 步', 'Sense: {name} is {n} steps {dir}', '感知：{name} は{dir}へ {n} 歩'],
  battleTitle: ['濁流擋住了{name}', 'Murk blocks the {name}', '濁流が{name}をふさいでいる'],
  battleHow: ['點亮青色的「流眼」來淨化它。\n紫色濁滴飛過來時點掉它，被碰到三次就要重來。', 'Tap the cyan Flow Eyes to purify it.\nTap away the purple murk drops before they reach you. Three hits and you start over.', '青い「流眼」をタップして浄化しよう。\n飛んでくる紫の濁りはタップで消して。三回当たるとやり直し。'],
  battleTip_elephant: ['象門・穩定：沉住氣，一個一個點。', 'Elephant · Stability: stay calm, one at a time.', '象門・安定：落ち着いて、一つずつ。'],
  battleTip_tiger: ['虎門・爆發：流眼一次冒三個，連續點中加倍淨化。', 'Tiger · Power: eyes appear in threes. Chain hits for bonus purity.', '虎門・爆発：流眼は三つずつ現れる。連続で当てると浄化が増える。'],
  battleTip_leopard: ['豹門・敏捷：流眼會游動，眼明手快。', 'Leopard · Agility: the eyes drift. Be quick.', '豹門・敏捷：流眼は泳ぎ回る。すばやく。'],
  battleTip_lion: ['獅門・威勢：最後一道濁流，濁滴最多，守住陣腳。', 'Lion · Presence: the last and strongest murk. Hold your ground.', '獅門・威厳：最後の濁流。濁りが一番多い、踏ん張って。'],
  battleGo: ['開始淨化', 'Purify', '浄化開始'],
  battleLose: ['濁流退回了霧裡', 'The murk slipped back into the mist', '濁流は霧の中へ戻った'],
  battleLoseTip: ['沒關係，流會記得你。再試一次會比較容易。', 'It\'s okay, the flow remembers you. The next try is easier.', '大丈夫、流れはあなたを覚えている。次は少しやさしくなるよ。'],
  battleRetry: ['再試一次', 'Try again', 'もう一度'],
  battleCombo: ['連擊 ×{n}', 'Chain ×{n}', '連続 ×{n}'],
  gateOpened: ['{seal}・{icon} {name}開啟', '{seal} · {icon} {name} opened', '{seal}・{icon} {name}が開いた'],
  cardSub: ['山林徑・{seal}・{virtue}', 'Mountain Trail · {seal} · {virtue}', '山林の道・{seal}・{virtue}'],
  cardEm: ['四獸靈門 {n}/4・{virtue}', 'Four Beast Gates {n}/4 · {virtue}', '四獣霊門 {n}/4・{virtue}'],
  nextSeal: ['下一印：{icon} {name}（{where}）', 'Next seal: {icon} {name} ({where})', '次の印：{icon} {name}（{where}）'],
  resonance: ['四獸共鳴', 'Four Beasts Resonance', '四獣共鳴'],
  gateOpen: ['台北靈門已開啟', 'The Taipei Spirit Gate is open', '台北霊門が開いた'],
  xiGeo: ['阿汐：「城市本身，也存在流。回到起點打開台北靈門吧。」', 'A-Xi: "The city has its own flow. Go back to the start and open the Taipei Spirit Gate."', 'アシー：「都市にも流れがある。スタート地点に戻って台北霊門を開こう。」'],
  xiIsland: ['阿汐：「城市本身，也存在流。我在台北靈門等你。」', 'A-Xi: "The city has its own flow. I\'ll wait for you at the Taipei Spirit Gate."', 'アシー：「都市にも流れがある。台北霊門で待ってるよ。」'],
  levelUp: ['升級！Lv.{lv}　感知力提升', 'Level up! Lv.{lv}  Sense improved', 'レベルアップ！Lv.{lv}　感知力アップ'],
  plusOne: ['＋1 靈光（可用 {n}）', '+1 Spirit Light ({n} available)', '＋1 霊光（使用可能 {n}）'],
  stage2: ['{name}要到第二階才會甦醒，先開啟四獸靈門吧', '{name} awakens in Stage 2. Open the Four Beast Gates first', '{name}は第二章で目覚めます。まず四獣霊門を開こう'],
  outOfOrder: ['{name}還沒回應。靈門要依序開啟，先去{next}（{hill}）', '{name} doesn\'t respond yet. The gates open in order: go to {next} ({hill}) first', '{name}はまだ応えない。霊門は順番に開く。先に{next}（{hill}）へ'],
  notEnough: ['靈光不足：喚醒需要 {cost} 點（目前 {n}）。按「感知」找找看', 'Not enough Spirit Light: you need {cost} (you have {n}). Try "Sense"', '霊光が足りない：{cost} 点必要（現在 {n}）。「感知」で探してみよう'],
  discovered: ['發現台灣之美 {n}/{m}・＋1 靈光', 'Beauty of Taiwan {n}/{m} · +1 Spirit Light', '台湾の美を発見 {n}/{m}・＋1 霊光'],
  creditLink: ['臺北旅遊網・{name}', 'Travel Taipei · {name}', '台北観光サイト・{name}'],
  creditPre: ['介紹與照片：', 'Text and photos: ', '紹介と写真：'],
  creditPost: ['（臺北市政府觀光傳播局）', ' (Department of Information and Tourism, Taipei City Government)', '（台北市政府観光伝播局）'],
  meters: ['{n} 公尺', '{n} m', '{n} m'],
  km: ['{n} 公里', '{n} km', '{n} km'],
  canOpen: ['可以開門了', 'Ready to open', '開けられる'],
  startEnd: ['起點與終點', 'Start and finish', 'スタートとゴール'],
  opened: ['{icon} {name}・已開啟', '{icon} {name} · opened', '{icon} {name}・開いた'],
  bound: ['已結緣', 'Visited', '縁を結んだ'],
  chance: ['機緣', 'Encounter', '縁'],
  distDir: ['{d}・{dir}方', '{d} · {dir}', '{d}・{dir}'],
  setHere: ['設為目前位置', 'Set to my location', '現在地に設定'],
  setDone: ['已把「{name}」設在目前位置', 'Moved "{name}" to your current location', '「{name}」を現在地に設定しました'],
  walkThere: ['{name} 在{dir}方 {d}，請沿人行道走過去', '{name} is {d} {dir}. Please walk there on the sidewalk', '{name} は{dir}へ {d}。歩道を通って向かってください'],
  north: ['北', 'N', '北'],
  simStat: ['模擬定位{err}', 'Simulated location{err}', '位置シミュレーション{err}'],
  gpsStat: ['GPS ±{n} 公尺', 'GPS ±{n} m', 'GPS ±{n} m'],
  sep: ['・', ' · ', '・'],
  list: ['、', ', ', '、'],
  venueSensed: ['台北靈門感應到你了', 'The Taipei Spirit Gate senses you', '台北霊門があなたを感じ取った'],
  venueStart: ['你在起點：台北靈門', 'You are at the start: Taipei Spirit Gate', 'スタート地点：台北霊門'],
  encSensed: ['感應到機緣：{name}', 'Encounter nearby: {name}', '縁を感じた：{name}'],
  openGateBtn: ['打開台北靈門', 'Open the Taipei Spirit Gate', '台北霊門を開く'],
  hearXi: ['聽阿汐說', 'Talk to A-Xi', 'アシーの話を聞く'],
  venueOpen: [['四獸共鳴，台北靈門就在你面前。', '城市本身，也存在流。走過去吧。'],
    ['The four beasts resonate. The Taipei Spirit Gate is right in front of you.', 'The city has its own flow. Walk through.'],
    ['四獣が共鳴し、台北霊門が目の前に現れた。', '都市にも流れがある。さあ、くぐろう。']],
  venueIntro: ['這裡是起點，也是終點。', 'This is the start, and also the finish.', 'ここはスタートであり、ゴールでもある。'],
  venueLeft: ['四獸靈門還有 {n} 道沒開：{list}。', '{n} of the Four Beast Gates are still closed: {list}.', '四獣霊門はあと {n} つ閉じている：{list}。'],
  venueNext: ['下一印是{name}，要依序開喔。', 'The next seal is {name}. They open in order.', '次の印は{name}。順番に開けてね。'],
  venueWait: ['四獸正在共鳴，等一下。', 'The four beasts are resonating. Wait a moment.', '四獣が共鳴している。少し待って。'],
  venueGo: ['打開「現世」雷達，沿著人行道走過去吧。', 'Open the "Real World" radar and walk there on the sidewalk.', '「現世」レーダーを開いて、歩道を歩いて行こう。'],
  shadow: ['{icon} {name}的影子一閃就不見了。', 'A glimpse of {icon} {name}, and it\'s gone.', '{icon} {name}の影が一瞬見えて、消えた。'],
  goFirst: ['靈門要依序開啟。先去{next}：{place}。', 'The gates open in order. Go to {next} first: {place}.', '霊門は順番に開く。先に{next}へ：{place}。'],
  sealWait: ['{seal}・等前一印開啟', '{seal} · open the previous seal first', '{seal}・前の印を待つ'],
  chanceSub: ['現世機緣・{sub}', 'Real-world encounter · {sub}', '現世の縁・{sub}'],
  boundWith: ['已和{name}結緣', 'Bound with {name}', '{name}と縁を結んだ'],
  chanceBonus: ['結下機緣・＋2 靈光（{n} 處）', 'Encounter · +2 Spirit Light ({n} places)', '縁を結んだ・＋2 霊光（{n} か所）'],
  stats: ['走一條路，認識台北這座城。\n四獸共鳴・台北靈門開啟　象・虎・豹・獅 4/4\n用時 {time}　靈光 {qi}/{qim}　台灣之美 {b}/{bm}',
    'Walk one path, get to know Taipei.\nFour Beasts Resonance · Taipei Spirit Gate opened  Elephant · Tiger · Leopard · Lion 4/4\nTime {time}  Spirit Light {qi}/{qim}  Beauty of Taiwan {b}/{bm}',
    '一本の道で、台北を知る。\n四獣共鳴・台北霊門が開いた　象・虎・豹・獅 4/4\nタイム {time}　霊光 {qi}/{qim}　台湾の美 {b}/{bm}'],
  noGeo: ['這個瀏覽器不支援定位', 'This browser does not support location', 'このブラウザは位置情報に対応していません'],
  geoDenied: ['沒有定位權限，已改用模擬定位', 'No location permission; using simulated location', '位置情報の許可がないため、シミュレーションに切り替えました'],
  geoFail: ['暫時抓不到定位，已改用模擬定位', 'Can\'t get your location right now; using simulated location', '位置情報を取得できないため、シミュレーションに切り替えました'],
};
const IDX = { zh: 0, en: 1, ja: 2 }[lang];
export function t(key, vars) {
  const e = S[key]; if (!e) return key;
  const v = e[IDX] ?? e[0];
  if (Array.isArray(v) || !vars) return v;
  return v.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
}
export const DIRS = { zh: ['北', '東北', '東', '東南', '南', '西南', '西', '西北'], en: ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'], ja: ['北', '北東', '東', '南東', '南', '南西', '西', '北西'] }[lang];

// index.html 上 data-i18n 的元素換成目前語言；加上語言切換按鈕
export function applyStatic() {
  document.title = t('title');
  for (const el of document.querySelectorAll('[data-i18n]')) el.innerHTML = t(el.dataset.i18n);
  for (const el of document.querySelectorAll('[data-i18n-label]')) el.setAttribute('aria-label', t(el.dataset.i18nLabel));
  for (const box of document.querySelectorAll('.langs')) {
    box.replaceChildren(...LANGS.map(([k, name]) => {
      const b = document.createElement('button'); b.textContent = name; b.lang = k;
      if (k === lang) b.className = 'on';
      b.addEventListener('click', e => { e.stopPropagation(); if (k !== lang) setLang(k); });
      return b;
    }));
  }
}
