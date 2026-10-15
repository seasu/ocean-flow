// 第三階・台北城市故事：靈門打開之後，流往城市更深處；七個在地故事散在台北各處
// 座標為大略位置（給雷達指方向用），r 是「走到了」的判定半徑（公尺）
import { localize } from './i18n.js';

export const TALES = [
  {
    "id": "wufenpu",
    "name": "五分埔",
    "sub": "城市故事・松山・地名的由來",
    "lat": 25.0503,
    "lng": 121.5772,
    "r": 150,
    "text": "清代時，何、周、沈、杜、李五戶人家合資，向平埔族人買下這片土地開墾，每戶各分得一份，「五分埔」就成了這裡的名字。後來，這裡變成台北人買衣服會想到的成衣批發商圈。",
    "fact": "原來如此：台北很多地名都記著土地的身世，五分埔記下的，是五戶人家一起分地。",
    "lines": [
      "巷子裡掛滿衣服，風一吹，像五面旗子同時揚起來。",
      "這片地，是五戶人家一起買下、一起分的。名字就是他們留下的約定。"
    ],
    "en": {
      "name": "Wufenpu",
      "sub": "City Story · Songshan · Where the name comes from",
      "text": "In the Qing era, five families named He, Zhou, Shen, Du and Li pooled their money to buy this land from the Pingpu people and split it into five shares; \"Wufenpu\" means \"five-share field.\" Today it is the garment wholesale district Taipei goes to for clothes.",
      "fact": "Did you know: many Taipei place names record the land's history. Wufenpu remembers five families sharing a field.",
      "lines": [
        "The lanes are hung with clothes; when the wind blows, it is like five flags rising at once.",
        "Five families bought this land together and shared it. The name is the promise they left behind."
      ]
    },
    "ja": {
      "name": "五分埔",
      "sub": "街の物語・松山・地名の由来",
      "text": "清代、何・周・沈・杜・李の五つの家が資金を出し合い、平埔族からこの土地を買って開墾し、一家に一分ずつ分けました。それが「五分埔」という名前の由来です。今では台北で服を買うならここ、という衣料品の問屋街です。",
      "fact": "なるほど：台北の地名の多くは土地の来歴を覚えています。五分埔が覚えているのは、五つの家で土地を分けたこと。",
      "lines": [
        "路地いっぱいに服が掛かり、風が吹くと五つの旗が一斉にはためくよう。",
        "この土地は五つの家が一緒に買って、一緒に分けた。名前は彼らが残した約束。"
      ]
    }
  },
  {
    "id": "cihcheng",
    "name": "士林慈諴宮",
    "sub": "城市故事・士林夜市旁・漳泉械鬥",
    "lat": 25.0882,
    "lng": 121.5246,
    "r": 150,
    "text": "士林最早的媽祖廟「芝蘭街天后宮」建於 1796 年。1859 年漳州、泉州移民械鬥，舊街連同天后宮被燒毀；地方仕紳潘永清等人在新的地方，用「井」字形規劃街道重建市街，廟就蓋在中央，也就是今天的慈諴宮。廟前的市集，後來長成了士林夜市。",
    "fact": "原來如此：1927 年整修時，正殿的交趾陶由本地匠師陳義雄和嘉義新港的林明必左右分工完成，這就是「對場作」，所以兩邊的風格不太一樣。",
    "lines": [
      "夜市的香味裡，混著一點很淡的線香味。",
      "這裡曾經燒過一次。後來的人選擇在新的地方，一起把街蓋回來。"
    ],
    "en": {
      "name": "Shilin Cihcheng Temple",
      "sub": "City Story · Beside Shilin Night Market · Zhangzhou–Quanzhou feuds",
      "text": "Shilin's first Mazu temple, the Zhilan Street Tianhou Temple, was built in 1796. In 1859, feuds between settlers from Zhangzhou and Quanzhou burned the old street and the temple with it. Local gentry led by Pan Yongqing rebuilt the market town in a new spot, laying out the streets in a tic-tac-toe grid with the temple at its center: today's Cihcheng Temple. The market in front of it grew into Shilin Night Market.",
      "fact": "Did you know: in the 1927 renovation, the koji pottery of the main hall was split between local master Chen Yi-hsiung and Lin Ming-bi from Xingang, Chiayi, one side each. This is \"duichangzuo,\" which is why the two sides look a little different.",
      "lines": [
        "Beneath the night-market smells is a faint trace of incense.",
        "This place burned once. The people who came after chose to build the street again, together, somewhere new."
      ]
    },
    "ja": {
      "name": "士林慈諴宮",
      "sub": "街の物語・士林夜市のそば・漳泉の械闘",
      "text": "士林で最初の媽祖廟「芝蘭街天后宮」は 1796 年に建てられました。1859 年、漳州と泉州からの移民の争いで旧街は天后宮ごと焼け落ちます。潘永清ら地元の有力者が新しい場所に「井」の字形の街路を計画して街を建て直し、その中央に廟を置きました。それが今の慈諴宮です。廟前の市場は、やがて士林夜市になりました。",
      "fact": "なるほど：1927 年の改修で、正殿の交趾焼は地元の匠・陳義雄と嘉義新港の林明必が左右に分かれて手がけました。これが「対場作」で、左右の作風が少し違うのはそのためです。",
      "lines": [
        "夜市の匂いの中に、かすかな線香の香り。",
        "ここは一度焼けた。後の人たちは新しい場所で、一緒に街を建て直すことを選んだ。"
      ]
    }
  },
  {
    "id": "xinzhuang",
    "name": "新莊老街",
    "sub": "城市故事・新北新莊・一府二鹿三新莊",
    "lat": 25.0368,
    "lng": 121.4527,
    "r": 150,
    "text": "清代的新莊是北台灣最熱鬧的河港，大船可以沿著淡水河一路開進來，當時有「一府二鹿三新莊」的說法：台南府城、鹿港，接著就是新莊。後來河道淤積、水位下降，大船進不來了，商人改到下游的艋舺落腳，這句話也就變成更多人熟悉的「一府二鹿三艋舺」。",
    "fact": "原來如此：一條河的深淺，就能決定一座城的興衰。",
    "lines": [
      "老街的廟埕上，好像還聽得見船靠岸的聲音。",
      "河往哪裡流，城市就往哪裡長。"
    ],
    "en": {
      "name": "Xinzhuang Old Street",
      "sub": "City Story · Xinzhuang, New Taipei · \"One Fu, two Lu, three Xinzhuang\"",
      "text": "In the Qing era Xinzhuang was northern Taiwan's busiest river port, and big ships sailed up the Tamsui River to reach it. People said \"One Fu, two Lu, three Xinzhuang\": Tainan, then Lukang, then Xinzhuang. As the river silted up and the water dropped, big ships could no longer reach it, merchants moved downstream to Bangka, and the saying became the better-known \"One Fu, two Lu, three Bangka.\"",
      "fact": "Did you know: the depth of a river can decide whether a town rises or fades.",
      "lines": [
        "In the old temple square you can almost hear boats coming in to dock.",
        "Wherever the river flows, the city grows."
      ]
    },
    "ja": {
      "name": "新荘老街",
      "sub": "街の物語・新北新荘・一府二鹿三新荘",
      "text": "清代の新荘は北台湾でいちばんにぎわった河港で、大きな船が淡水河をさかのぼってやって来ました。当時「一府二鹿三新荘」と言われ、台南府城、鹿港の次が新荘でした。やがて川に土砂がたまって水位が下がり、大きな船が入れなくなると、商人は下流の艋舺へ移り、この言葉もよく知られる「一府二鹿三艋舺」に変わりました。",
      "fact": "なるほど：川の深さひとつで、街の栄枯が決まる。",
      "lines": [
        "老街の廟の広場で、船が着く音がまだ聞こえる気がする。",
        "川が流れる方へ、街は育っていく。"
      ]
    }
  },
  {
    "id": "wanhua",
    "name": "萬華與加蚋仔",
    "sub": "城市故事・萬華・北中南三個萬華",
    "lat": 25.0255,
    "lng": 121.5005,
    "r": 200,
    "text": "萬華可以分成三塊：北萬華以西門町為代表；中萬華是艋舺與龍山寺一帶，「艋舺」來自原住民語的獨木舟；南萬華則是加蚋仔，大約是西藏路以南、到新店溪岸，東園和青年公園都在這裡。很多人知道西門町和龍山寺，卻沒聽過加蚋仔，就算住在附近也一樣。",
    "fact": "原來如此：「加蚋」來自凱達格蘭族語，意思是沼澤地。捷運萬大線的加蚋站，最後也尊重在地人的習慣，唸成「ㄌㄚˋ」。",
    "lines": [
      "同一個萬華，北邊熱鬧、中間香火、南邊安靜。",
      "住得再近，也可能有一個名字，你從來沒聽過。"
    ],
    "en": {
      "name": "Wanhua and Ka-lah-á",
      "sub": "City Story · Wanhua · North, central and south Wanhua",
      "text": "Wanhua has three parts: north Wanhua around Ximending; central Wanhua around Bangka and Longshan Temple, where \"Bangka\" comes from an Indigenous word for canoe; and south Wanhua, Ka-lah-á (Jianaizi), roughly from Xizang Road south to the Xindian River, including Dongyuan and Youth Park. Many people know Ximending and Longshan Temple but have never heard of Ka-lah-á, even if they live nearby.",
      "fact": "Did you know: \"Ka-lah\" comes from the Ketagalan word for marshland. The new MRT Wanda Line station there follows the local pronunciation, \"lah.\"",
      "lines": [
        "One Wanhua: lively in the north, incense in the middle, quiet in the south.",
        "Even close to home, there can be a name you have never heard."
      ]
    },
    "ja": {
      "name": "萬華と加蚋仔",
      "sub": "街の物語・萬華・北・中・南の三つの萬華",
      "text": "萬華は三つに分けられます。北萬華は西門町、中萬華は艋舺と龍山寺のあたりで、「艋舺」は先住民の言葉で丸木舟のこと。南萬華は加蚋仔で、だいたい西蔵路の南から新店渓の岸まで、東園や青年公園もここにあります。西門町や龍山寺は知っていても、加蚋仔は聞いたことがない人が多く、近くに住んでいてもそうです。",
      "fact": "なるほど：「加蚋」はケタガラン族の言葉で湿地のこと。MRT 万大線の加蚋駅も、地元の呼び方にあわせて「ラー」と読むことになりました。",
      "lines": [
        "同じ萬華でも、北はにぎやか、真ん中は線香の香り、南は静か。",
        "どんなに近くに住んでいても、聞いたことのない名前がある。"
      ]
    }
  },
  {
    "id": "baoan",
    "name": "大龍峒保安宮",
    "sub": "城市故事・大同・古蹟修復",
    "lat": 25.0732,
    "lng": 121.5155,
    "r": 150,
    "text": "供奉保生大帝的老廟，是國定古蹟。九〇年代起的大修，保留了剪黏、交趾陶等傳統工藝，也處理白蟻、通風與結構補強，2002 年完工。隔年，這次修復得到聯合國教科文組織亞太文化資產保存獎的榮譽獎，是台灣第一座獲得這項國際肯定的廟宇。",
    "fact": "原來如此：剪黏是把彩色瓷片剪成小片，一片一片黏成屋脊上的人物和花鳥。",
    "lines": [
      "屋脊上的小人物，好像剛剛動了一下。",
      "修一座老廟，修的不只是木頭，是手藝能不能傳下去。"
    ],
    "en": {
      "name": "Dalongdong Baoan Temple",
      "sub": "City Story · Datong · Restoring a monument",
      "text": "An old temple to the Baosheng Emperor and a national monument. Its major restoration, begun in the 1990s, kept traditional cut-porcelain (jiannian) and koji pottery while dealing with termites, ventilation and structural repair, and finished in 2002. The next year it received an Honourable Mention in the UNESCO Asia-Pacific Awards for Cultural Heritage Conservation, the first temple in Taiwan to be recognized this way.",
      "fact": "Did you know: jiannian means cutting colored porcelain into small pieces and setting them one by one into figures, flowers and birds on the roof ridge.",
      "lines": [
        "One of the little figures on the roof ridge seems to have just moved.",
        "Restoring an old temple is not only about wood. It is about whether a craft gets passed on."
      ]
    },
    "ja": {
      "name": "大龍峒保安宮",
      "sub": "街の物語・大同・古跡の修復",
      "text": "保生大帝を祀る古い廟で、国定古跡です。1990 年代から続いた大修理では、剪黏や交趾焼といった伝統工芸を残しながら、シロアリ対策、風通し、構造補強にも取り組み、2002 年に完成しました。翌年、ユネスコのアジア太平洋文化遺産保全賞で栄誉賞を受け、台湾の廟として初めてこの国際的な評価を得ました。",
      "fact": "なるほど：剪黏とは色とりどりの磁器を小さく切り、屋根の上の人物や花鳥に一枚ずつ貼りつける技法です。",
      "lines": [
        "屋根の上の小さな人形が、今ちょっと動いた気がする。",
        "古い廟を直すことは、木を直すだけじゃない。技を受け継げるかどうか。"
      ]
    }
  },
  {
    "id": "zaichun",
    "name": "再春游泳池與明治橋",
    "sub": "城市故事・中山・消失的橋",
    "lat": 25.0722,
    "lng": 121.5222,
    "r": 200,
    "text": "明治橋最早是 1901 年的鐵橋，1933 年改建成優雅的鋼筋混凝土拱橋，戰後改名中山橋。2002 年底為了基隆河防洪拆除，橋身被切成 435 塊，2004 年公告為歷史建築。這些構件至今堆放在圓山橋下的再春游泳池舊址，那裡曾是許多台北人童年游泳、玩水的地方，而重建的地點還沒有定案。",
    "fact": "原來如此：一座橋拆掉了，不一定就消失了；它可能只是換個地方，等人想起它。",
    "lines": [
      "空空的泳池邊，好像還有小孩跳水的聲音。",
      "旁邊躺著一座橋的身體。它等了很久，等人記起它曾經連起兩岸。"
    ],
    "en": {
      "name": "Zaichun Pool and Meiji Bridge",
      "sub": "City Story · Zhongshan · The bridge that disappeared",
      "text": "Meiji Bridge began as an iron bridge in 1901 and was rebuilt in 1933 as an elegant reinforced-concrete arch, renamed Zhongshan Bridge after the war. It was taken down in late 2002 for Keelung River flood control, cut into 435 pieces, and listed as a historic building in 2004. The pieces still lie on the old site of Zaichun Swimming Pool under the bridge at Yuanshan, where many Taipei kids once learned to swim, and where it will be rebuilt is still undecided.",
      "fact": "Did you know: a bridge that is taken down has not always disappeared. Sometimes it just moves, waiting for someone to remember it.",
      "lines": [
        "By the empty pool you can almost hear children diving in.",
        "Beside it lies the body of a bridge, waiting a long time for someone to remember it once joined two shores."
      ]
    },
    "ja": {
      "name": "再春プールと明治橋",
      "sub": "街の物語・中山・消えた橋",
      "text": "明治橋は 1901 年の鉄橋に始まり、1933 年に優美な鉄筋コンクリートのアーチ橋に架け替えられ、戦後は中山橋と呼ばれました。2002 年末、基隆河の治水のために撤去され、435 個に切り分けられて 2004 年に歴史建築に登録されました。その部材は今も圓山の橋の下、再春プールの跡地に置かれています。多くの台北の子どもが泳ぎを覚えた場所で、再建の場所はまだ決まっていません。",
      "fact": "なるほど：取り壊された橋が消えたとは限りません。場所を変えて、誰かが思い出すのを待っているのかもしれない。",
      "lines": [
        "空っぽのプールのそばで、子どもが飛び込む音がまだ聞こえる気がする。",
        "その横に、橋の体が横たわっている。両岸をつないでいたことを、誰かが思い出すのをずっと待っている。"
      ]
    }
  },
  {
    "id": "shipai",
    "name": "石牌商城",
    "sub": "城市故事・北投・石牌夜市",
    "lat": 25.1156,
    "lng": 121.5158,
    "r": 150,
    "text": "石牌夜市以裕民一路到三路為中心，白天是市場、晚上是小吃，在地人和市府的商圈名冊都叫它「石牌商城」。「石牌」這個地名，來自清乾隆年間淡水廳同知曾曰瑛立下的漢番界碑，用來劃分漢人和平埔族的土地。",
    "fact": "原來如此：那塊界碑後來搬到捷運石牌站前的廣場，出站就看得到。地名本身，就站在那裡。",
    "lines": [
      "夜市的燈亮起來，有位阿伯說：「我們都叫這裡商城啦。」",
      "一塊石碑分開過兩邊的土地，現在兩邊的人，在同一條街上吃宵夜。"
    ],
    "en": {
      "name": "Shipai \"Mall\"",
      "sub": "City Story · Beitou · Shipai Night Market",
      "text": "Shipai Night Market centers on Yumin 1st to 3rd Roads: a market by day and street food by night. Locals, and the city's own list of shopping districts, call it the \"Shipai Mall.\" The name Shipai, \"stone tablet,\" comes from a boundary stone set up in the Qianlong era by Zeng Yueying, a Qing official of Tamsui, to divide Han settlers' land from Pingpu land.",
      "fact": "Did you know: the boundary stone now stands in the plaza outside MRT Shipai Station. Step out and you can see the place name itself.",
      "lines": [
        "As the night-market lights come on, an old man says, \"We just call it the mall.\"",
        "A stone once divided the land in two. Now people from both sides eat late-night snacks on the same street."
      ]
    },
    "ja": {
      "name": "石牌商城",
      "sub": "街の物語・北投・石牌夜市",
      "text": "石牌夜市は裕民一路から三路を中心に、昼は市場、夜は屋台が並びます。地元の人も市の商店街名簿も「石牌商城」と呼んでいます。「石牌」という地名は、清の乾隆年間に淡水庁の同知・曽曰瑛が、漢人と平埔族の土地を分けるために立てた境界の石碑に由来します。",
      "fact": "なるほど：その石碑は今、MRT 石牌駅前の広場にあり、駅を出ればすぐ見られます。地名そのものが、そこに立っています。",
      "lines": [
        "夜市の明かりがともると、おじさんが言った。「ここはみんな商城って呼ぶんだよ」",
        "石碑はかつて土地を二つに分けた。今では両側の人が、同じ通りで夜食を食べている。"
      ]
    }
  }
];
for (const s of TALES) s.tale = true;
localize(TALES);
