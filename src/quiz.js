// 第二階・城市故事問答：走到故事地點、聽阿汐說完，先讀故事，再答 3 題；全對才算通關
// 答錯可以回去再看一次故事；隨時可以離開，之後走回來再挑戰
import { lang, t } from './i18n.js';
import { sfx } from './audio.js';

const L = { zh: 0, en: 1, ja: 2 }[lang] ?? 0;
// 每題：[題目, 正解, 錯誤選項, 錯誤選項]，各三語
const Q = {
  wufenpu: [
    [['「五分埔」這個名字是怎麼來的？', 'Where does the name "Wufenpu" come from?', '「五分埔」という名前の由来は？'], ['五戶人家一起買地、分地', 'Five families bought and split the land', '五つの家が土地を買って分けた'], ['五條河在這裡交會', 'Five rivers meet here', '五本の川がここで合流する'], ['走五分鐘就到市場', 'The market is five minutes away', '市場まで歩いて五分']],
    [['當年他們向誰買下這片土地？', 'Who did they buy the land from?', '誰から土地を買った？'], ['平埔族人', 'The Pingpu people', '平埔族'], ['荷蘭人', 'The Dutch', 'オランダ人'], ['日本商人', 'Japanese merchants', '日本の商人']],
    [['今天的五分埔以什麼出名？', 'What is Wufenpu known for today?', '今の五分埔は何で有名？'], ['成衣批發商圈', 'Garment wholesale shops', '衣料品の問屋街'], ['溫泉', 'Hot springs', '温泉'], ['茶園', 'Tea gardens', '茶畑']],
  ],
  cihcheng: [
    [['慈諴宮是哪一位神明的廟？', 'Which deity is Cihcheng Temple for?', '慈諴宮はどの神様の廟？'], ['媽祖', 'Mazu', '媽祖'], ['關公', 'Guan Gong', '関羽'], ['保生大帝', 'Baosheng Dadi', '保生大帝']],
    [['1859 年舊街為什麼被燒毀？', 'Why did the old street burn in 1859?', '1859年、旧街はなぜ焼けた？'], ['漳州、泉州移民械鬥', 'A clash between Zhangzhou and Quanzhou settlers', '漳州と泉州の移民の争い'], ['颱風帶來雷擊', 'Lightning from a typhoon', '台風の落雷'], ['火山爆發', 'A volcanic eruption', '火山の噴火']],
    [['廟前的市集後來變成了什麼？', 'What did the market in front of the temple become?', '廟の前の市場は何になった？'], ['士林夜市', 'Shilin Night Market', '士林夜市'], ['西門町', 'Ximending', '西門町'], ['華山文創園區', 'Huashan Creative Park', '華山クリエイティブパーク']],
  ],
  xinzhuang: [
    [['「一府二鹿三新莊」的「一府」指的是？', 'In "First Fu, second Lu, third Xinzhuang", what is "Fu"?', '「一府二鹿三新荘」の「一府」は？'], ['台南府城', 'Tainan', '台南府城'], ['台北府', 'Taipei', '台北府'], ['新竹', 'Hsinchu', '新竹']],
    [['新莊港後來為什麼沒落？', 'Why did Xinzhuang\'s port decline?', '新荘の港はなぜ衰えた？'], ['河道淤積，大船進不來', 'The river silted up and big ships couldn\'t get in', '川が浅くなり大きな船が入れなくなった'], ['發生大地震', 'A big earthquake', '大地震'], ['鐵路改走別的地方', 'The railway went elsewhere', '鉄道が別の場所を通った']],
    [['商人後來改到哪裡落腳？', 'Where did the merchants move to?', '商人はどこへ移った？'], ['艋舺', 'Monga', '艋舺'], ['基隆', 'Keelung', '基隆'], ['鹿港', 'Lukang', '鹿港']],
  ],
  wanhua: [
    [['「艋舺」原本是什麼意思？', 'What did "Monga" originally mean?', '「艋舺」の元の意味は？'], ['獨木舟', 'A canoe', '丸木舟'], ['大市場', 'A big market', '大きな市場'], ['河邊的廟', 'A riverside temple', '川辺の廟']],
    [['南萬華哪個地方，很多人都沒聽過？', 'Which part of south Wanhua have many people never heard of?', '南萬華で、多くの人が知らない場所は？'], ['加蚋仔', 'Galazi', '加蚋仔'], ['西門町', 'Ximending', '西門町'], ['龍山寺', 'Longshan Temple', '龍山寺']],
    [['「加蚋」在凱達格蘭族語裡是什麼意思？', 'What does "Gala" mean in the Ketagalan language?', 'ケタガラン語で「加蚋」の意味は？'], ['沼澤地', 'Marshland', '沼地'], ['高山', 'High mountain', '高い山'], ['海港', 'Harbor', '港']],
  ],
  baoan: [
    [['保安宮供奉的是哪一位神明？', 'Which deity does Bao\'an Temple honor?', '保安宮が祀る神様は？'], ['保生大帝', 'Baosheng Dadi', '保生大帝'], ['媽祖', 'Mazu', '媽祖'], ['土地公', 'The Earth God', '土地公']],
    [['修復完成後，保安宮得到哪一個國際獎？', 'What international award did the restoration win?', '修復後に受けた国際的な賞は？'], ['UNESCO 亞太文化資產保存獎', 'UNESCO Asia-Pacific Heritage Award', 'ユネスコ・アジア太平洋文化遺産保全賞'], ['普立茲克建築獎', 'The Pritzker Prize', 'プリツカー賞'], ['金馬獎', 'The Golden Horse Award', '金馬奨']],
    [['屋脊上的「剪黏」是怎麼做的？', 'How is "jiannian" on the roof made?', '屋根の「剪黏」はどう作る？'], ['把彩色瓷片剪小，一片片黏成圖案', 'Colored porcelain is cut and pieced together', '色付きの磁器片を切って貼り合わせる'], ['用整塊木頭雕出來', 'Carved from a single block of wood', '一本の木から彫る'], ['用紙剪出窗花', 'Cut from paper', '紙を切って作る']],
  ],
  zaichun: [
    [['明治橋在戰後改名為什麼？', 'What was Meiji Bridge renamed after the war?', '明治橋は戦後なんと改名された？'], ['中山橋', 'Zhongshan Bridge', '中山橋'], ['圓山橋', 'Yuanshan Bridge', '円山橋'], ['中正橋', 'Zhongzheng Bridge', '中正橋']],
    [['2002 年為什麼要拆掉這座橋？', 'Why was the bridge taken down in 2002?', '2002年、なぜ橋は撤去された？'], ['基隆河防洪', 'Flood control on the Keelung River', '基隆河の治水'], ['要蓋捷運', 'To build the MRT', 'MRTを作るため'], ['橋自己塌了', 'It collapsed', '橋が崩れた']],
    [['拆下來的橋身，現在放在哪裡？', 'Where are the pieces of the bridge now?', '解体された橋は今どこにある？'], ['再春游泳池的舊址', 'At the old Zaichun swimming pool', '旧再春プールの跡地'], ['博物館的展廳裡', 'Inside a museum', '博物館の中'], ['沉在河底', 'At the bottom of the river', '川の底']],
  ],
  shipai: [
    [['「石牌」這個地名來自什麼？', 'Where does the name "Shipai" come from?', '「石牌」という地名の由来は？'], ['清代劃分漢人與平埔族土地的界碑', 'A Qing-era boundary stone between Han and Pingpu land', '漢人と平埔族の土地を分けた清代の境界碑'], ['一塊石頭做的招牌', 'A stone shop sign', '石でできた看板'], ['一座石頭牌坊', 'A stone archway', '石の鳥居のような門']],
    [['在地人怎麼稱呼石牌夜市？', 'What do locals call Shipai Night Market?', '地元の人は石牌夜市をなんと呼ぶ？'], ['石牌商城', 'Shipai Mall', '石牌商城'], ['北投夜市', 'Beitou Night Market', '北投夜市'], ['天母市場', 'Tianmu Market', '天母市場']],
    [['現在去哪裡，可以看到那塊界碑？', 'Where can you see the boundary stone today?', '境界碑は今どこで見られる？'], ['捷運石牌站前的廣場', 'In the plaza outside MRT Shipai Station', 'MRT石牌駅前の広場'], ['故宮博物院', 'The National Palace Museum', '故宮博物院'], ['陽明山上', 'Up on Yangmingshan', '陽明山の上']],
  ],
};
export const hasQuiz = id => !!Q[id];

const el = document.createElement('div');
el.id = 'quiz'; el.hidden = true;
el.innerHTML = `<header class="phead"><div><b></b><small></small></div><button class="xbtn" aria-label="close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header>
  <div class="dots"></div><div class="body"></div>`;
document.body.appendChild(el);
const body = el.querySelector('.body'), dots = el.querySelector('.dots');
let S = null;
el.querySelector('.xbtn').addEventListener('click', () => end(false));
function end(ok) { if (!S) return; const d = S.done; S = null; el.hidden = true; d(ok); }
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const mark = () => { dots.innerHTML = S.qs.map((_, i) => `<i class="${i < S.i ? 'ok' : i === S.i ? 'on' : ''}"></i>`).join(''); };

// 故事頁：答案都在這裡面
function story(back) {
  dots.hidden = true;
  body.innerHTML = `<div class="card story"><p>${S.s.text}</p><em>${S.s.fact}</em></div>
    <button class="start go">${t(back ? 'quizBack' : 'quizStart')}</button>`;
  body.querySelector('.go').onclick = () => ask();
}
function ask() {
  const q = S.qs[S.i]; dots.hidden = false; mark();
  const opts = shuffle([1, 2, 3]);
  body.innerHTML = `<div class="card"><small>${t('quizNo', { n: S.i + 1, m: S.qs.length })}</small><h3>${q[0][L]}</h3></div>
    <div class="opts">${opts.map(k => `<button data-k="${k}">${q[k][L]}</button>`).join('')}</div><div class="hint" hidden><p>${t('quizWrong')}</p><button class="ghost">${t('quizReread')}</button></div>`;
  body.querySelector('.opts').onclick = e => {
    const b = e.target.closest('button'); if (!b || S.lock) return;
    if (b.dataset.k === '1') {
      S.lock = true; b.classList.add('ok'); sfx.hit(S.i * 2); try { navigator.vibrate?.(15); } catch { }
      setTimeout(() => { S.lock = false; S.i++; S.i < S.qs.length ? ask() : win(); }, 650);
    } else {
      b.classList.add('no'); b.disabled = true; sfx.deny(); try { navigator.vibrate?.([30, 40, 30]); } catch { }
      body.querySelector('.hint').hidden = false;
    }
  };
  body.querySelector('.hint .ghost').onclick = () => story(true);
}
function win() {
  dots.hidden = false; mark(); sfx.purify();
  body.innerHTML = `<div class="card done"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.6 2.6L16 9.6"/></svg>
    <h3>${t('quizWin')}</h3><p>${t('quizReward', { n: S.reward })}</p></div><button class="start go">${t('quizCollect')}</button>`;
  body.querySelector('.go').onclick = () => end(true);
}

// s：城市故事；回傳 Promise<boolean>（true＝通關）
export function quiz(s, reward) {
  return new Promise(done => {
    S = { s, qs: Q[s.id], i: 0, done, reward, lock: false };
    el.querySelector('header b').textContent = s.name; el.querySelector('header small').textContent = t('quizSub');
    el.hidden = false; story(false);
  });
}
