// 商圈整合：15 個機緣點各有一樣物品（讀完景點介紹、領靈光時一起拿到）
// 食物拿到就吃、補飽足；衣物換外觀；裝備拿到就生效。收藏頁只記錄與介紹，不做背包。
// 圖示是方塊（Roblox 風）：每樣東西用幾個方塊拼起來，畫成等角 SVG，風格一致

// v：[x, y, z, 寬, 高, 深, 顏色, 透明度]，照順序畫（後面的蓋前面）
export const ITEMS = [
  { id: 'rice', spot: 'venue', stage: 1, type: 'food', fill: 100,
    name: ['啟程飯糰', 'Departure Rice Ball', '出発おにぎり'],
    fx: ['開場先吃飽：飽足補滿', 'Fills you up before the journey', '出発前にお腹いっぱい：満腹度が満タンに'],
    story: ['起點與終點都在這裡。出門前先吃顆飯糰，走起來才有力氣。', 'Where the journey starts and ends. A rice ball before setting out keeps your legs going.', '旅の始まりと終わりの場所。出かける前のおにぎりが、歩く力になる。'],
    v: [[0, 0, 0, 4, 1.2, 2.2, '#f4f2ea'], [0.5, 1.2, 0, 3, 1.1, 2.2, '#f4f2ea'], [1.1, 2.3, 0, 1.8, 1, 2.2, '#f4f2ea'], [1.3, 0, 2.15, 1.4, 1.5, 0.2, '#22392c'], [1.6, 2.6, 2.15, 0.3, 0.3, 0.1, '#e8641c']] },
  { id: 'barrel', spot: 'huashan', stage: 1, type: 'gear',
    name: ['老酒桶護盾', 'Old Wine-Barrel Shield', '古い酒樽の盾'],
    fx: ['象門數獨可以多錯一次', 'One extra mistake allowed in the Elephant Gate sudoku', '象門の数独でミスが一回多くできる'],
    story: ['華山原本是台北酒廠。老酒桶的木板很厚，拿來當盾剛好。', 'Huashan was once the Taipei winery. The old barrel staves are thick enough to make a shield.', '華山はもと台北の酒工場。古い酒樽の板は厚く、盾にちょうどいい。'],
    v: [[0.4, 0, 0.4, 3.2, 4.4, 3.2, '#a8662f'], [0.2, 0.7, 0.2, 3.6, 0.45, 3.6, '#6d7480'], [0.2, 3.25, 0.2, 3.6, 0.45, 3.6, '#6d7480'], [0.3, 1.15, 0.3, 3.4, 2.1, 3.4, '#b87336'], [1.6, 2, 3.65, 0.8, 0.6, 0.15, '#3a2412']] },
  { id: 'brush', spot: 'qidong', stage: 1, type: 'gear',
    name: ['詩人的毛筆', "Poet's Brush", '詩人の筆'],
    fx: ['畫符時光點的判定變寬', 'Wider hit area when drawing sigils', '符を描くとき、光点の判定が広くなる'],
    story: ['齊東詩舍住過許多寫字的人。這支筆沾過的墨，比符還有力量。', 'Many writers once lived at Qidong. The ink this brush has held is stronger than any charm.', '齊東詩舎には多くの書き手が住んだ。この筆が含んだ墨は、どんな符より強い。'],
    v: [[0, 0, 0, 4, 0.6, 3, '#3a3f4f'], [0.5, 0.6, 0.5, 1.4, 0.3, 1.4, '#1b1f2a'], [2.3, 0.6, 1, 1.2, 1.4, 1.2, '#2b2b33'], [2.2, 2, 0.9, 1.4, 0.4, 1.4, '#e8e2d0'], [2.45, 2.4, 1.15, 0.9, 3.2, 0.9, '#c99a5b'], [2.45, 5.6, 1.15, 0.9, 0.4, 0.9, '#d6453a']] },
  { id: 'bracer', spot: 'jinan', stage: 1, type: 'gear',
    name: ['紅磚護腕', 'Red-Brick Bracer', '赤レンガの籠手'],
    fx: ['連點時爆發條集得比較快', 'The burst gauge fills faster in Tap Hero', '連打で必殺ゲージが早くたまる'],
    story: ['濟南教會的紅磚牆站了一百年。戴上它，每一下都更扎實。', 'The red-brick walls of Jinan Church have stood for a century. Wear this and every tap lands harder.', '済南教会の赤レンガは百年立ち続けた。身につければ一打一打が重くなる。'],
    v: [[0, 0, 0, 4.4, 3, 3.2, '#b5452f'], [0, 1.45, 3.15, 4.4, 0.12, 0.1, '#e9d9c4'], [1.4, 0, 3.15, 0.12, 1.45, 0.1, '#e9d9c4'], [3, 0, 3.15, 0.12, 1.45, 0.1, '#e9d9c4'], [2.2, 1.57, 3.15, 0.12, 1.43, 0.1, '#e9d9c4'], [-0.1, 2.9, -0.1, 4.6, 0.4, 3.4, '#d9b46a']] },
  { id: 'bun', spot: 'shandao', stage: 1, type: 'food', fill: 35,
    name: ['素包子', 'Vegetable Bun', '精進まんじゅう'],
    fx: ['吃下補飽足 +35', 'Restores 35 fullness', '満腹度 +35'],
    story: ['善導寺旁的素食點心，熱騰騰的蒸籠一掀開，整條街都香。', 'A vegetarian treat near Shandao Temple. Lift the steamer lid and the whole street smells good.', '善導寺そばの精進点心。せいろを開けると通りじゅうがいい香り。'],
    v: [[-0.3, 0, -0.3, 4.6, 0.9, 4.6, '#c8a165'], [0, 0.9, 0, 4, 1.3, 4, '#f3eee2'], [0.6, 2.2, 0.6, 2.8, 0.8, 2.8, '#f3eee2'], [1.4, 3, 1.4, 1.2, 0.45, 1.2, '#e6dcc6']] },
  { id: 'bento', spot: 'station', stage: 1, type: 'food', fill: 60,
    name: ['鐵路便當', 'Railway Bento', '台鉄弁当'],
    fx: ['份量大，補飽足 +60', 'A big meal: restores 60 fullness', 'ボリューム満点：満腹度 +60'],
    story: ['台北車站的排骨便當，陪過無數人搭車回家。', 'The pork-chop bento of Taipei Station has ridden home with countless travelers.', '台北駅の排骨弁当は、数えきれない人の帰り道に寄り添ってきた。'],
    v: [[0, 0, 0, 5, 1.3, 3.6, '#7a4a2a'], [0.3, 1.3, 0.3, 2.4, 0.3, 3, '#f6f3ea'], [2.9, 1.3, 0.3, 1.8, 0.55, 1.5, '#a8642e'], [3, 1.3, 2.1, 0.8, 0.6, 0.8, '#f2c53d'], [3.95, 1.3, 2.1, 0.75, 0.45, 1.2, '#4f9a3a']] },
  { id: 'lens', spot: 'controlyuan', stage: 1, type: 'gear',
    name: ['古蹟放大鏡', 'Heritage Magnifier', '古跡の虫めがね'],
    fx: ['「感知」範圍變大、時間變長', '"Sense" reaches farther and lasts longer', '「感知」の範囲が広く、長くなる'],
    story: ['監察院的雕花要湊近才看得清。用它看靈界，遠處的靈光也藏不住。', 'The carvings of the Control Yuan reward a close look. Through this lens, even distant spirit light cannot hide.', '監察院の彫刻は近くで見てこそ。このレンズなら遠くの霊光も見逃さない。'],
    v: [[1.6, -2.4, 0.6, 0.8, 2.6, 0.8, '#7a4a2a'], [0, 0, 0.4, 4, 0.8, 1.2, '#d9b46a'], [0, 3.2, 0.4, 4, 0.8, 1.2, '#d9b46a'], [0, 0.8, 0.4, 0.8, 2.4, 1.2, '#d9b46a'], [3.2, 0.8, 0.4, 0.8, 2.4, 1.2, '#d9b46a'], [0.8, 0.8, 0.9, 2.4, 2.4, 0.3, '#9fe6ff', 0.75], [1.1, 2.4, 1.25, 0.6, 0.6, 0.05, '#ffffff', 0.9]] },
  { id: 'phones', spot: 'guanghua', stage: 1, type: 'gear',
    name: ['流光耳機', 'Flowing-Light Headphones', '流光ヘッドホン'],
    fx: ['「指引」的金光更長、更清楚', 'The "Guide" light trail is longer and clearer', '「導き」の光がより長く、はっきりする'],
    story: ['光華商場什麼零件都找得到。這副耳機聽得見洋流的方向。', 'You can find any part at Guanghua. These headphones can hear which way the current flows.', '光華商場ならどんな部品もある。このヘッドホンは潮の流れる方向が聞こえる。'],
    v: [[0.6, 4, 1, 3.6, 0.7, 1.2, '#2d3550'], [0.1, 2.2, 1, 0.7, 2.2, 1.2, '#2d3550'], [3.6, 2.2, 1, 0.7, 2.2, 1.2, '#2d3550'], [-0.4, 0.4, 0.6, 1.3, 2, 2, '#58b0ea'], [3.5, 0.4, 0.6, 1.3, 2, 2, '#58b0ea'], [4.75, 1, 1.1, 0.1, 0.8, 1, '#7fe8ff', 0.9]] },
  { id: 'outfit', spot: 'wufenpu', stage: 2, type: 'cloth',
    name: ['五分埔新衣', 'Wufenpu Outfit', '五分埔の新しい服'],
    fx: ['阿流換上新衣服', 'Ah-Liu changes into a new outfit', 'アリュウが新しい服に着替える'],
    story: ['五分埔的巷子掛滿衣服。挑一件喜歡的，走在靈界也很體面。', 'The lanes of Wufenpu are hung with clothes. Pick one you like and walk the spirit world in style.', '五分埔の路地は服でいっぱい。好きな一着を選べば、霊界でも颯爽と歩ける。'],
    v: [[1, 0, 0, 3, 3.6, 0.8, '#1f8f86'], [-0.2, 2.2, 0, 1.2, 1.4, 0.8, '#1f8f86'], [4, 2.2, 0, 1.2, 1.4, 0.8, '#1f8f86'], [1, 1.2, 0.75, 3, 0.35, 0.1, '#ffcf5a'], [2, 3.3, 0.75, 1, 0.3, 0.1, '#f4f2ee']] },
  { id: 'cake', spot: 'cihcheng', stage: 2, type: 'food', fill: 40,
    name: ['大餅包小餅', 'Big Cake Wraps Small', '大餅包小餅'],
    fx: ['士林夜市小吃，補飽足 +40', 'Shilin night-market snack: restores 40 fullness', '士林夜市の屋台：満腹度 +40'],
    story: ['慈諴宮前就是士林夜市。酥餅包進薄餅裡，一口兩種口感。', 'Shilin Night Market sits right by Cihcheng Temple. A crisp cake wrapped in a soft one: two textures in a bite.', '慈諴宮の前は士林夜市。サクサクの餅を薄い皮で包み、一口で二つの食感。'],
    v: [[0, 0, 0, 4.4, 1.6, 3, '#efd59a'], [0.2, 1.6, 0.2, 4, 0.4, 2.6, '#e2bd73'], [4.3, 0.4, 0.5, 0.25, 0.9, 2, '#c99a5b'], [1, 2, 1, 0.4, 0.15, 0.4, '#a8642e'], [2.6, 2, 1.6, 0.4, 0.15, 0.4, '#a8642e']] },
  { id: 'guangbing', spot: 'xinzhuang', stage: 2, type: 'food', fill: 20, carry: 3,
    name: ['鹹光餅', 'Salty Guangbing', '鹹光餅'],
    fx: ['一串三個帶著走，餓了自動吃一個（+20）', 'A string of three: one is eaten automatically whenever you get hungry (+20 each)', '三つ連ねて持ち歩き、お腹が空くと一つ食べる（各 +20）'],
    story: ['中間有洞的餅可以用繩子串起來，古時候是帶在身上的乾糧。', 'The hole in the middle lets you string them together: travelers once carried them as rations.', '真ん中の穴に紐を通して連ねられる。昔は旅の携帯食だった。'],
    v: [[-0.3, 3.4, 1, 5.6, 0.25, 0.25, '#c0392b'], [0, 1.5, 0.6, 1.4, 1.6, 0.6, '#e2b56a'], [1.8, 1.5, 0.6, 1.4, 1.6, 0.6, '#e2b56a'], [3.6, 1.5, 0.6, 1.4, 1.6, 0.6, '#e2b56a'], [0.5, 2.1, 1.15, 0.4, 0.4, 0.1, '#5a3a1a'], [2.3, 2.1, 1.15, 0.4, 0.4, 0.1, '#5a3a1a'], [4.1, 2.1, 1.15, 0.4, 0.4, 0.1, '#5a3a1a']] },
  { id: 'paddle', spot: 'wanhua', stage: 2, type: 'gear',
    name: ['艋舺獨木舟槳', 'Monga Canoe Paddle', '艋舺の丸木舟の櫂'],
    fx: ['乘黑潮時游得更快', 'Ride the Kuroshio faster', '黒潮に乗るとき、より速く泳げる'],
    story: ['「艋舺」原本就是獨木舟的意思。拿起槳，洋流就是你的路。', '"Monga" first meant canoe. Pick up the paddle and the current becomes your road.', '「艋舺」はもともと丸木舟の意味。櫂を取れば、海流があなたの道になる。'],
    v: [[1.2, -1.2, 0.85, 2.2, 2.8, 0.9, '#c58a4a'], [1.2, 0.2, 1.7, 2.2, 0.4, 0.1, '#d6453a'], [2, 1.6, 1, 0.6, 4.2, 0.6, '#9b6a3c'], [1.6, 5.8, 0.8, 1.4, 0.45, 1, '#7a4a2a']] },
  { id: 'herb', spot: 'baoan', stage: 2, type: 'gear',
    name: ['保生大帝藥籤', 'Baosheng Medicine Slip', '保生大帝の薬籤'],
    fx: ['戰鬥快輸時補一口氣（每場一次）', 'Once per battle, a second wind when you are about to lose', '負けそうな時に一度だけ立て直せる（各戦一回）'],
    story: ['保生大帝是醫神，廟裡的藥籤從前真的能拿去抓藥。', 'Baosheng Dadi is the god of medicine; temple slips were once taken to herbalists for real cures.', '保生大帝は医の神。廟の薬籤は昔、本当に薬と引き換えられた。'],
    v: [[0.6, 0, 0.6, 2.8, 3, 2.8, '#c9a24a'], [0.5, 2.6, 0.5, 3, 0.4, 3, '#a8822f'], [1.1, 3, 1.3, 0.3, 1.8, 0.3, '#e8d8a8'], [1.6, 3, 2.2, 0.3, 2.1, 0.3, '#e8d8a8'], [2.4, 3, 1.5, 0.3, 1.6, 0.3, '#e8d8a8'], [1.9, 3, 1.6, 0.45, 2.8, 0.2, '#c0392b']] },
  { id: 'goggles', spot: 'zaichun', stage: 2, type: 'gear',
    name: ['再春泳鏡', 'Zaichun Goggles', '再春のゴーグル'],
    fx: ['在靈界可以潛水，游得更快', 'Dive in the spirit world and swim faster', '霊界で潜水でき、泳ぎも速くなる'],
    story: ['再春游泳池陪台北人學會游泳。戴上它，往水裡鑽也不怕。', 'Zaichun Pool taught generations of Taipei kids to swim. Put these on and dive without fear.', '再春プールで多くの台北っ子が泳ぎを覚えた。これを着ければ潜るのも怖くない。'],
    v: [[-0.3, 1.2, 0, 5.6, 0.5, 0.6, '#2d3550'], [0.4, 0.6, 0.4, 1.9, 1.6, 0.8, '#2f6fb0'], [3, 0.6, 0.4, 1.9, 1.6, 0.8, '#2f6fb0'], [0.7, 0.9, 1.15, 1.3, 1, 0.1, '#9fe6ff', 0.85], [3.3, 0.9, 1.15, 1.3, 1, 0.1, '#9fe6ff', 0.85], [2.3, 1.1, 0.6, 0.7, 0.4, 0.4, '#2f6fb0']] },
  { id: 'snack', spot: 'shipai', stage: 2, type: 'food', fill: 35,
    name: ['夜市鹽酥雞', 'Night-Market Fried Chicken', '夜市の塩酥鶏'],
    fx: ['補飽足 +35', 'Restores 35 fullness', '満腹度 +35'],
    story: ['石牌的小吃攤從傍晚亮到深夜，一袋鹽酥雞邊走邊吃剛剛好。', "Shipai's food stalls glow from dusk to late night. A bag of fried chicken is perfect for eating on the go.", '石牌の屋台は夕方から深夜まで灯る。塩酥鶏を一袋、歩きながらがちょうどいい。'],
    v: [[0.6, 0, 0.6, 3, 2.8, 3, '#e8e2d0'], [0.55, 1.6, 0.55, 3.1, 0.4, 3.1, '#d6453a'], [1, 2.8, 1, 1, 0.8, 1, '#c87a2e'], [2.1, 2.8, 1.4, 1, 0.9, 1, '#b8692a'], [1.4, 2.8, 2.2, 1, 0.7, 1, '#d08a3a'], [2.9, 2.9, 2.6, 0.2, 2.2, 0.2, '#e8d8a8']] },
  // 商圈信物：打贏序章 BOSS 濁淵才掉落（只在現世修行）；拿去合作店家兌換一次實體優惠
  { id: 'token', spot: null, stage: 0, type: 'token',
    name: ['士林夜市信物', 'Shilin Night Market Token', '士林夜市の証'],
    fx: ['出示給合作店家，可兌換一次實體優惠', 'Show it at a partner shop to redeem one real-world offer', '協力店で見せると、一度だけ実店舗の特典と交換できる'],
    story: ['濁淵散去後，夜市的燈籠一盞盞亮起來。這枚信物記著你真的走過這段路，商圈的店家認得它。', 'When the Murk Abyss fades, the night-market lanterns light up one by one. This token proves you truly walked the route, and the shops know it.', '濁淵が消えると、夜市の提灯が一つずつ灯る。この証はあなたが本当に道を歩いた印。商店街の店はそれを知っている。'],
    v: [[1.8, 4.9, 0.3, 0.4, 1.3, 0.2, '#c0392b'], [1.5, 4.3, 0.15, 1, 0.7, 0.5, '#c99a3a'], [0, 0, 0, 4, 4.4, 0.8, '#e3b452'], [0.55, 0.55, 0.75, 2.9, 3.3, 0.2, '#c0392b'], [1.45, 1.2, 0.9, 1.1, 0.35, 0.2, '#ffcf5a'], [1.25, 1.55, 0.9, 1.5, 1.5, 0.2, '#ffcf5a'], [1.45, 3.05, 0.9, 1.1, 0.35, 0.2, '#ffcf5a'], [1.7, -1.5, 0.25, 0.6, 1.5, 0.3, '#c0392b']] },
];
export const ITEM_OF = Object.fromEntries(ITEMS.filter(x => x.spot).map(x => [x.spot, x]));

// ---------- 方塊圖示：等角投影，上面亮、正面原色、側面暗，加深色描邊 ----------
const C30 = Math.cos(Math.PI / 6), S30 = 0.5;
const proj = (x, y, z) => [(x - z) * C30, (x + z) * S30 - y];
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, n >> 8 & 255, n & 255].map(v => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
const cache = {};
export function itemSVG(it) {
  if (cache[it.id]) return cache[it.id];
  const polys = [], pts = [];
  for (const [x, y, z, w, h, d, col, a = 1] of it.v) {
    const P = (i, j, k) => { const p = proj(x + i * w, y + j * h, z + k * d); pts.push(p); return p; };
    const top = [P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1)];
    const front = [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)];
    const right = [P(1, 0, 0), P(1, 0, 1), P(1, 1, 1), P(1, 1, 0)];
    const edge = shade(col, -0.55);
    for (const [f, k] of [[front, 0], [right, -0.25], [top, 0.22]]) polys.push(`<polygon points="${f.map(p => p.map(v => v.toFixed(2)).join(',')).join(' ')}" fill="${shade(col, k)}" fill-opacity="${a}" stroke="${edge}" />`);
  }
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), pad = 0.5;
  const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad, w = Math.max(...xs) + pad - x0, h = Math.max(...ys) + pad - y0, s = Math.max(w, h);
  return cache[it.id] = `<svg viewBox="${(x0 - (s - w) / 2).toFixed(2)} ${(y0 - (s - h) / 2).toFixed(2)} ${s.toFixed(2)} ${s.toFixed(2)}" stroke-width="0.09" stroke-linejoin="round">${polys.join('')}</svg>`;
}
