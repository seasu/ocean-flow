// 多國語系：繁體中文（zh）、English（en）、日本語（ja）
// 語言依序取自 ?lang=、上次選擇（localStorage）、瀏覽器語言；切換語言會重新載入頁面
// 英文與日文為團隊自行翻譯，待母語者校對
export const LANGS = [['zh', '繁中'], ['en', 'EN'], ['ja', '日本語']];
const KEY = 'oceanflow.lang';

function detect() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q && LANGS.some(l => l[0] === q)) return q;
  try { const s = localStorage.getItem(KEY); if (s && LANGS.some(l => l[0] === s)) return s; } catch { }
  // 預設一律繁體中文；英文、日文要在語言按鈕切換（會記住）或用 ?lang=
  return 'zh';
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
  stage1Head: ['第一階・四獸靈門', 'Stage 1 · Four Beast Gates', '第一章・四獣霊門'],
  stage2Head: ['第二階・城海山三流', 'Stage 2 · City, Sea, Mountain', '第二章・街・海・山の三流'],
  stageDoneHead: ['終章', 'Finale', '終章'],
  goTo: ['前往{name}', 'Go to {name}', '{name}へ'],
  wake2: ['喚醒三流', 'Awaken the Three Flows', '三流を目覚めさせる'],
  train2: ['走路修行到{realm}', 'Walk to reach {realm}', '歩いて{realm}まで修行'],
  orIsland: ['或島上的{hill}', 'or {hill} on the island', 'または島の{hill}'],
  qiOf: ['靈光 {n}/{cost}', 'Spirit Light {n}/{cost}', '霊光 {n}/{cost}'],
  more2: ['更多', 'More', 'その他'],
  fitTarget: ['回到目的地', 'Fit destination', '目的地に合わせる'],
  rTarget: ['目的地：{name}', 'Destination: {name}', '目的地：{name}'],
  meTitle: ['個人資訊', 'Profile', 'プロフィール'],
  miniMap: ['小地圖', 'Mini map', 'ミニマップ'],
  radarLabel: ['現世雷達', 'Real-world radar', '現世レーダー'],
  langLabel: ['語言', 'Language', '言語'],
  soundLabel: ['聲音', 'Sound', 'サウンド'],
  meSteps: ['走了', 'You have walked', '歩いた歩数'],
  meDist: ['約 {d}', 'About {d}', '約 {d}'],
  meSeals: ['印記', 'Seals', '印'],
  meQi: ['靈光', 'Spirit Light', '霊光'],
  meChances: ['走過的機緣點', 'Encounters visited', '訪れた縁の地'],
  qi: ['靈光 {n}', 'Spirit Light {n}', '霊光 {n}'],
  radar: ['現世', 'Real World', '現世'],
  beauty: ['台灣之美', 'Beauty of Taiwan', '台湾の美'],
  dexBtn: ['台灣之美 {n}/{m}', 'Beauty of Taiwan {n}/{m}', '台湾の美 {n}/{m}'],
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
  backSpirit: ['回到靈界', 'Back to Spirit World', '霊界へ戻る'],
  enter: ['進入機緣', 'Enter encounter', '縁に入る'],
  simLabel: ['模擬定位：點雷達或清單就走過去（展示用）', 'Simulated location: tap the radar or list to walk there (for demos)', '位置のシミュレーション：レーダーか一覧をタップすると移動（デモ用）'],
  safety: ['請走人行道、注意來車，過馬路時不要看手機。', 'Stay on the sidewalk, watch for traffic, and don\'t look at your phone while crossing.', '歩道を歩き、車に注意してください。横断中はスマホを見ないでください。'],
  tapNext: ['點一下繼續 ▸', 'Tap to continue ▸', 'タップで次へ ▸'],
  tagline: ['走出去，遇見你的機緣。', 'Go out and meet your encounters.', '外へ出て、あなたの縁に出会おう。'],
  settings: ['設定', 'Settings', '設定'],
  close: ['關閉', 'Close', '閉じる'],
  startGeo: ['啟程', 'Set Out', '出発'],
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
  launchGo: ['啟程', 'Set Out', '出発'],
  tipsTitle: ['✦ 啟程前的提醒 ✦', '✦ Before You Set Out ✦', '✦ 出発前のひとこと ✦'],
  tipSoundT: ['把聲音打開', 'Turn your sound on', '音をオンに'],
  tipSound: ['出發前先看一段介紹影片，<br>配樂和旁白都很重要喔！', 'A short intro film plays first, and the music and narration are half the magic!', '最初に紹介映像が流れます。音楽とナレーションも大事な旅の一部！'],
  tipHomeT: ['加到主畫面，像 App 一樣玩', 'Add it to your Home Screen', 'ホーム画面に追加しよう'],
  a2hsIos: ['全螢幕玩，下次一點就出發！<br>點 <b>分享</b> <span class="ico">⎙</span> → <b>加入主畫面</b><small>新版 iOS 的分享在 ⋯ 裡</small>', 'Full screen plays better, and next time it is one tap away!<br>Tap <b>Share</b> <span class="ico">⎙</span> → <b>Add to Home Screen</b><small>On newer iOS, Share is under ⋯</small>', '全画面で遊べて、次からワンタップで出発！<br><b>共有</b> <span class="ico">⎙</span> → <b>ホーム画面に追加</b><small>新しい iOS では共有は ⋯ の中</small>'],
  a2hsIosApp: ['全螢幕更好玩！<br>先用 <b>Safari</b> 打開這個網址，再點 <b>分享</b> → <b>加入主畫面</b>', 'Full screen plays better! Open this page in <b>Safari</b>, then <b>Share</b> → <b>Add to Home Screen</b>', '全画面がおすすめ！まず <b>Safari</b> で開き、<b>共有</b> → <b>ホーム画面に追加</b>'],
  a2hsOther: ['全螢幕更好玩！<br>在瀏覽器選單選 <b>加到主畫面</b> 或 <b>安裝應用程式</b>', 'Full screen plays better! In the browser menu choose <b>Add to Home screen</b> or <b>Install app</b>', '全画面がおすすめ！ブラウザのメニューから <b>ホーム画面に追加</b> または <b>アプリをインストール</b>'],
  tipHomeAndroid: ['全螢幕更好玩，下次一點就出發！', 'Full screen plays better, and next time it is one tap away!', '全画面で遊べて、次からワンタップで出発！'],
  a2hsInstall: ['📲 加到主畫面', '📲 Add to Home Screen', '📲 ホーム画面に追加'],
  noGL: ['此裝置無法執行 WebGL', 'WebGL is not available on this device', 'この端末では WebGL を実行できません'],

  shoushan: ['四獸山位在台北市信義區東南，屬於南港山系。四座小山因為外形像象、虎、豹、獅而得名，步道彼此相連，就在城市邊上。',
    'The Four Beasts Mountains lie in southeast Xinyi District and belong to the Nangang range. Named for their elephant, tiger, leopard and lion shapes, their trails link together right at the edge of the city.',
    '四獣山は台北市信義区の南東、南港山系にある四つの小山です。象・虎・豹・獅子に似た形から名付けられ、遊歩道がつながり、街のすぐそばにあります。'],
  secMountain: ['山林徑・四獸靈門', 'Mountain Trail · Four Beast Gates', '山林の道・四獣霊門'],
  secCulture: ['文化徑・現世機緣', 'Culture Trail · Real-world encounters', '文化の道・現世の縁'],
  questTitle: ['第一階・山林徑：四獸靈門（{n}/4）', 'Stage 1 · Mountain Trail: Four Beast Gates ({n}/4)', '第一章・山林の道：四獣霊門（{n}/4）'],
  waitPrev: ['等前一印開啟', 'Open the previous seal first', '前の印が開くのを待つ'],
  questGeo: ['現世：{place}（或到島上 101 東邊的{hill}）', 'Real world: {place} (or {hill}, east of 101 on the island)', '現世：{place}（または島の101東側の{hill}）'],
  questDone: ['三流歸一・前往台北靈門', 'The Three Flows Unite · Go to the Taipei Spirit Gate', '三流が一つに・台北霊門へ'],
  backVenue: ['回到會場', 'Return to the venue', '会場に戻る'],
  gateWaits: ['台北靈門在起點等你', 'The Taipei Spirit Gate waits at the start', '台北霊門がスタート地点で待っている'],
  islandGate: ['島上西側平原的紅色牌樓', 'The red archway on the island\'s western plain', '島の西側の平原にある赤い牌楼'],
  xiWaits: ['阿汐在那裡等你', 'A-Xi is waiting there', 'アシーがそこで待っている'],
  firstSeal: ['第一印：象門', 'First Seal: Elephant Gate', '第一の印：象門'],
  gateName: ['台北靈門', 'Taipei Spirit Gate', '台北霊門'],
  senseToast: ['感知：{name} 在你{rel}，{n} 步', 'Sense: {name} is {rel}, {n} steps', '感知：{name} は{rel}、{n} 歩'],
  realms: [['感流境', '聚流境', '化流境', '御流境', '歸流境'], ['Flow-Sensing', 'Flow-Gathering', 'Flow-Shaping', 'Flow-Command', 'Flow-Return'], ['感流境', '聚流境', '化流境', '御流境', '帰流境']],
  xiuFull: ['修為圓滿！到下一個機緣點突破境界', 'Cultivation full! Break through at the next encounter', '修為が満ちた！次の縁の場所で境地を突破しよう'],
  breakthrough: ['突破！踏入{realm}', 'Breakthrough! You reach {realm}', '突破！{realm}へ'],
  xiuLeftGeo: ['走路修行：再走 {n} 公尺修為圓滿，可突破至{next}', 'Walking cultivation: walk {n} m more to reach {next}', '歩く修行：あと {n} m 歩くと{next}へ突破できる'],
  xiuLeftIsland: ['走路修行：再走 {n} 步修為圓滿，可突破至{next}', 'Walking cultivation: {n} more steps to reach {next}', '歩く修行：あと {n} 歩で{next}へ突破できる'],
  xiuReady: ['走路修行：修為圓滿，到機緣點就能突破', 'Walking cultivation: full. Break through at any encounter', '歩く修行：修為が満ちた。縁の場所で突破できる'],
  xiuMax: ['走路修行：已達{realm}，修行圓滿', 'Walking cultivation: you reached {realm}, the highest realm', '歩く修行：{realm}に到達、修行は満ちた'],
  statsWalk: ['境界 {realm}　走了 {d}', 'Realm {realm}  Walked {d}', '境地 {realm}　歩いた距離 {d}'],
  stepsN: ['{n} 步', '{n} steps', '{n} 歩'],
  guideBtn: ['帶我去', 'Guide me', '案内して'],
  maps: ['Google 地圖步行', 'Walk in Google Maps', 'Google マップで歩く'],
  rel: [['前方', '右前方', '右邊', '右後方', '後方', '左後方', '左邊', '左前方'], ['ahead', 'ahead on your right', 'to your right', 'behind on your right', 'behind you', 'behind on your left', 'to your left', 'ahead on your left'], ['前方', '右前方', '右', '右後方', '後ろ', '左後方', '左', '左前方']],
  guideIsland: ['{name}：在你{rel}，{n} 步', '{name}: {rel}, {n} steps', '{name}：{rel}、{n} 歩'],
  guideGeo: ['{name}：在你{rel}，還有 {d}', '{name}: {rel}, {d} to go', '{name}：{rel}、あと {d}'],
  guideWalk: ['{name}：還有 {d}。先隨便走幾步，我就能分辨左右', '{name}: {d} to go. Walk a few steps so I can tell left from right', '{name}：あと {d}。少し歩くと左右がわかるよ'],
  guideHere: ['{name}：到了！打開「現世」進入機緣', '{name}: you\'re here! Open Real World to enter the encounter', '{name}：着いた！「現世」を開いて縁に入ろう'],
  guideHereIsland: ['{name}：就在這裡', '{name}: right here', '{name}：ここだよ'],
  questNote: ['依序 象→虎→豹→獅，每印需要 {cost} 點靈光・四獸共鳴後開啟第二階', 'In order: Elephant → Tiger → Leopard → Lion, {cost} Spirit Light per seal · Four Beasts Resonance opens Stage 2', '順番に 象→虎→豹→獅、各印に霊光 {cost} 点・四獣共鳴で第二章が開く'],
  questTitle2: ['第二階・城海山三流（{n}/3）', 'Stage 2 · City, Sea, Mountain Flows ({n}/3)', '第二章・街・海・山の三流（{n}/3）'],
  questNote2: ['三流不分順序，每處需要 {cost} 點靈光、{realm}以上・三流歸一後開啟台北靈門', 'Any order, {cost} Spirit Light each, {realm} or above · When the three flows unite, the Taipei Spirit Gate opens', '順番は自由、各所に霊光 {cost} 点・{realm}以上・三流が一つになると台北霊門が開く'],
  needRealmShort: ['需{realm}・目前{now}', 'Needs {realm} · now {now}', '{realm}が必要・現在{now}'],
  needRealm: ['{name}的濁流太濃了，要{realm}以上才淨化得了。再走一段路修行吧（目前：{now}）', 'The murk at {name} is too thick. You need {realm} or above; walk a bit more to cultivate (now: {now})', '{name}の濁流は濃すぎる。{realm}以上でないと浄化できない。もう少し歩いて修行しよう（現在：{now}）'],
  stage2Open: ['第二階開啟：城之回聲、海之流痕、山之鐘聲（需{realm}）', 'Stage 2 opens: Echo of the City, Trace of the Sea, Bell of the Mountain (needs {realm})', '第二章が開いた：街のこだま、海の流れ痕、山の鐘の音（{realm}が必要）'],
  flowsUnite: ['三流歸一', 'The Three Flows Unite', '三流が一つに'],
  secFlows: ['第二階・城海山三流', 'Stage 2 · Three Flows', '第二章・三流'],
  cardSub2: ['第二階・{seal}・{virtue}', 'Stage 2 · {seal} · {virtue}', '第二章・{seal}・{virtue}'],
  cardEm2: ['城海山三流 {n}/3・{virtue}', 'Three Flows {n}/3 · {virtue}', '三流 {n}/3・{virtue}'],
  xiuIntro: ['走路修行：邊走邊累積修為，滿了就到機緣點突破境界。境界越高，淨化力越強。', 'Walking cultivation: walking builds cultivation. When it is full, break through at an encounter. Higher realms purify harder.', '歩く修行：歩くほど修為がたまる。満ちたら縁の場所で境地を突破。境地が高いほど浄化力が強くなる。'],
  realmPower: ['境界加成：{realm}，淨化力 +{p}%', 'Realm bonus: {realm}, purification +{p}%', '境地ボーナス：{realm}、浄化力 +{p}%'],
  loseWalk: ['也可以先去走一段路：境界越高，淨化力越強。', 'Or go walk for a while first: higher realms purify harder.', '先に少し歩いてもいい。境地が高いほど浄化力が強くなる。'],
  blocked: ['擋下', 'Blocked', '防がれた'],
  shieldUp: ['護盾！等它散掉再點', 'Shield! Wait for it to drop', 'シールド！消えるまで待って'],
  battleTip_elephant: ['象門・記憶：迷你數獨。每一橫排、每一直列、每個小區，每種元素各出現一次。', 'Elephant · Memory: mini sudoku. Each row, column and box holds each element exactly once.', '象門・記憶：ミニ数独。横一列、縦一列、各区画に、それぞれの元素が一つずつ入る。'],
  battleTip_city: ['城之回聲：城市的濁流最厚，還會張開護盾。護盾張開時先停手，散掉再狂點。', 'Echo of the City: the city murk is thickest and raises a shield. Stop while it is up, then tap like mad.', '街のこだま：街の濁流は一番厚く、シールドも張る。張っている間は手を止め、消えたら連打。'],
  battleTip_sea: ['海之流痕：洋流的符最繁複，光點還會隨浪飄動。', 'Trace of the Sea: the current sigils are the most complex, and the dots drift with the waves.', '海の流れ痕：海流の符は一番複雑で、光点は波に揺れる。'],
  battleTip_peak: ['山之鐘聲：六格數獨，多了石與月。山記得每一個回聲。', 'Bell of the Mountain: a 6×6 sudoku with stone and moon added. The mountain remembers every echo.', '山の鐘の音：6×6 の数独。石と月が加わる。山はすべてのこだまを覚えている。'],
  battleTitle: ['濁流擋住了{name}', 'Murk blocks the {name}', '濁流が{name}をふさいでいる'],
  battleTip_tiger: ['虎門・爆發：連點！越快越痛，集滿爆發放出虎爪。', 'Tiger · Power: tap fast! Faster hits hurt more. Fill the power bar to unleash the Tiger Claw.', '虎門・爆発：連打！速いほど強い。爆発ゲージをためて虎の爪を放とう。'],
  battleTip_leopard: ['豹門・敏捷：畫符結印。照數字順序一筆畫完，四道符淨化濁流。', 'Leopard · Agility: draw the sigils. Connect the dots in order in one stroke; four sigils purify the murk.', '豹門・敏捷：符を描く。番号の順に一筆で結び、四つの符で濁流を浄化する。'],
  battleTip_lion: ['獅門・威勢：最後一道濁流。三消，濁流每兩步就丟濁塊，守住陣腳。', 'Lion · Presence: the last murk. Match three; it throws murk blocks every two moves. Hold your ground.', '獅門・威厳：最後の濁流。三つそろえて消す。二手ごとに濁りを投げてくる、踏ん張って。'],
  how_sudoku: ['點一個空格，再點下方的元素填進去。填對就打濁流一下，填錯三次要重來。', 'Tap an empty square, then tap an element below to fill it. Right answers strike the murk; three mistakes and you start over.', '空きマスをタップして、下の元素を選んで入れる。正しければ濁流に一撃、三回まちがえるとやり直し。'],
  how_taphero: ['在下方區域狂點，每一下都會打向濁流；守護獸也會幫你出手。時間內淨化完成就贏了。', 'Tap the area below as fast as you can; every tap strikes the murk, and your guardian helps. Purify it before time runs out.', '下のエリアを連打。一回ごとに濁流を撃ち、守護獣も手伝ってくれる。時間内に浄化しよう。'],
  how_sigil: ['從 1 號光點開始，手指不要離開，依序連到最後一點。順序錯或中途放開，這道符就要重畫。', 'Start on dot 1 and, without lifting your finger, connect the dots in order. Wrong order or lifting early means redrawing that sigil.', '1 番の光点から、指を離さずに順番に最後までつなぐ。順番をまちがえたり途中で離すと描き直し。'],
  how_match3: ['拖曳交換相鄰兩格，連成三個就消除，消掉的元素會化成光打向濁流。\n連四個會留下「流眼」，消掉時清空整排整列。\n濁流會把格子染成紫色濁塊，在旁邊消除就能洗掉。', 'Swipe to swap two neighbouring tiles. Line up three to clear them, and the cleared tiles fly at the murk as light.\nLine up four to leave a Flow Eye, which clears its whole row and column.\nThe murk turns tiles into purple blocks; clear next to them to wash them away.', '隣り合う二つをスワイプで入れ替え、三つそろえると消える。消えた元素は光になって濁流を撃つ。\n四つそろえると「流眼」が残り、消すと縦横一列がまとめて消える。\n濁流はマスを紫の濁りブロックに変える。隣で消せば洗い流せる。'],
  lose_sudoku: ['錯了三次。沒關係，流會記得你，再試一次會多給兩格提示。', 'Three mistakes. It\'s okay, the flow remembers you. Next try gives two more starting squares.', '三回まちがえた。大丈夫、流れはあなたを覚えている。次はヒントが二マス増えるよ。'],
  lose_taphero: ['時間到了。沒關係，流會記得你，再試一次會多四秒。', 'Time\'s up. It\'s okay, the flow remembers you. Next try gives four more seconds.', '時間切れ。大丈夫、流れはあなたを覚えている。次は四秒増えるよ。'],
  lose_sigil: ['時間到了。沒關係，流會記得你，再試一次會多八秒。', 'Time\'s up. It\'s okay, the flow remembers you. Next try gives eight more seconds.', '時間切れ。大丈夫、流れはあなたを覚えている。次は八秒増えるよ。'],
  lose_match3: ['步數用完了。沒關係，流會記得你，再試一次會多三步。', 'Out of moves. It\'s okay, the flow remembers you. Next try gives three more moves.', '手数切れ。大丈夫、流れはあなたを覚えている。次は三手多くなるよ。'],
  mistakes: ['還能錯 {n} 次', '{n} mistakes left', 'あと {n} 回ミス可'],
  secondsLeft: ['剩 {n} 秒', '{n} s', '残り {n} 秒'],
  crit: ['會心！', 'Critical!', '会心！'],
  power: ['爆發', 'Power', '爆発'],
  claw: ['虎爪', 'Claw', '虎爪'],
  tapFast: ['連點！', 'Tap fast!', '連打！'],
  battleGo: ['開始淨化', 'Purify', '浄化開始'],
  battleLose: ['濁流退回了霧裡', 'The murk slipped back into the mist', '濁流は霧の中へ戻った'],
  battleMoves: ['剩 {n} 步', '{n} moves', '残り {n} 手'],
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
  distDir: ['{d}・{dir}', '{d} · {dir}', '{d}・{dir}'],
  setHere: ['設為目前位置', 'Set to my location', '現在地に設定'],
  setDone: ['已把「{name}」設在目前位置', 'Moved "{name}" to your current location', '「{name}」を現在地に設定しました'],
  walkThere: ['{name} 在{dir} {d}，請沿人行道走過去', '{name} is {d} {dir}. Please walk there on the sidewalk', '{name} は{dir}へ {d}。歩道を通って向かってください'],
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
  venueLeft: ['還有 {n} 處沒開：{list}。', '{n} still closed: {list}.', 'あと {n} か所閉じている：{list}。'],
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
export const DIRS = { zh: ['北方', '東北方', '東方', '東南方', '南方', '西南方', '西方', '西北方'], en: ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'], ja: ['北', '北東', '東', '南東', '南', '南西', '西', '北西'] }[lang];

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
