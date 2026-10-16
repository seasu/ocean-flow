// 洋流世界觀：八個章節，像一本書一頁一頁翻開（設定 → 洋流世界觀）
// 圖來自 docs/lore/eight-stages.png，切成 img/lore/ch0–7.jpg；中文文案來自專案的 world-chapters.md
import { lang, t } from './i18n.js';
import { realmVox } from './realmicon.js';

export const CH = [
  { no: ['序章', 'Prologue', '序章'], name: ['起源', 'Origin', '起源'], sub: ['覺醒台灣', 'Awakening in Taiwan', '台湾の目覚め'],
    epi: ['這裡，是一切開始被看見的地方。', 'This is where everything was first seen.', 'ここは、すべてが見えはじめた場所。'],
    text: ["我們一直以為，世界只有眼睛看見的樣子。\n直到有一天，有人在山中聽見不存在的鐘聲，有人在海邊看見逆光流動的痕跡。\n山有脈，海有流，人亦有自己的道。\n台灣，成為人類第一個重新啟流的地方。", "We always thought the world was only what our eyes could see.\nThen one day, someone heard a bell in the mountains that did not exist, and someone saw traces flowing against the light by the sea.\nMountains have veins, the sea has currents, and people have their own way.\nTaiwan became the first place where humanity set the Flow moving again.", "世界は目に見えるものだけだと、ずっと思っていた。\nある日、山で存在しない鐘の音を聞いた人がいて、海辺で光に逆らって流れる跡を見た人がいた。\n山には脈があり、海には流れがあり、人にもそれぞれの道がある。\n台湾は、人類が初めてふたたび流れを起こした場所になった。"] },
  { no: ['第一章', 'Chapter One', '第一章'], name: ['流域', 'Watershed', '流域'], sub: ['擴展亞洲', 'Reaching Across Asia', 'アジアへ広がる'],
    epi: ['原來，流從來不只在一座島上。', 'The Flow was never on just one island.', '流れは、ひとつの島だけのものではなかった。'],
    text: ["黑潮北上，季風南來。台灣的流被完整觀測之後，人們才發現，海的另一端早已有相似的訊號甦醒。\n火山的熱，古寺的鐘，季風吹過的群島。\n每一個文明，都曾用自己的語言，描述同一種現象。", "The Kuroshio runs north and the monsoon comes south. Only after Taiwan's Flow was fully observed did people realize that similar signals had already awakened across the sea.\nThe heat of volcanoes, the bells of old temples, islands swept by the monsoon.\nEvery civilization once described the same thing in its own language.", "黒潮は北へ、季節風は南から。台湾の流れがすべて観測されてはじめて、海の向こうでも似た兆しがすでに目覚めていたと人々は知った。\n火山の熱、古寺の鐘、季節風の吹く島々。\nどの文明も、自分の言葉で同じ現象を語っていた。"] },
  { no: ['第二章', 'Chapter Two', '第二章'], name: ['連界', 'Linked Worlds', '連界'], sub: ['連結世界', 'Connecting the World', '世界をつなぐ'],
    epi: ['當每一道流找到彼此，世界第一次完整。', 'When every Flow finds the others, the world is whole for the first time.', 'すべての流れが互いを見つけたとき、世界ははじめてひとつになる。'],
    text: ["峽谷、冰原、荒漠、古城、石陣。不同的流派、宗門與文化開始交會。\n人們不再問誰的修行才是對的，\n而是開始問：我們看見的，會不會是同一個世界？", "Canyons, ice fields, deserts, ancient cities, stone circles. Different schools, orders and cultures begin to meet.\nPeople stop asking whose practice is right,\nand start asking: could we all be seeing the same world?", "峡谷、氷原、砂漠、古都、ストーンサークル。さまざまな流派や宗門、文化が交わりはじめる。\n人々は、誰の修行が正しいかを問うのをやめ、\nこう問いはじめる。わたしたちが見ているのは、同じ世界なのでは？"] },
  { no: ['第三章', 'Chapter Three', '第三章'], name: ['星航', 'Star Voyage', '星航'], sub: ['穿越多元宇宙', 'Across the Multiverse', '多元宇宙を渡る'],
    epi: ['流沒有在海平線停下，也沒有在天空的盡頭停下。', 'The Flow did not stop at the horizon, nor at the edge of the sky.', '流れは水平線で止まらず、空の果てでも止まらなかった。'],
    text: ["當人類學會乘著流前進，夜空不再只是遠方。\n每一顆星都有自己的潮汐，每一個宇宙都有自己的道。\n我們第一次，以修行者的身份，航向未知。", "Once humanity learned to travel on the Flow, the night sky was no longer just far away.\nEvery star has its own tides; every universe has its own way.\nFor the first time, we sail into the unknown as practitioners.", "人類が流れに乗って進むことを覚えたとき、夜空はもう遠いだけの場所ではなくなった。\nどの星にも潮があり、どの宇宙にも道がある。\nわたしたちははじめて、修行者として未知へ航海する。"] },
  { no: ['第四章', 'Chapter Four', '第四章'], name: ['萬象', 'All Things', '万象'], sub: ['共創新文明', 'Building a New Civilization Together', '新しい文明をともに'],
    epi: ['萬流交會的地方，長出了一棵樹。', 'Where all the Flows meet, a tree has grown.', '万の流れが出会う場所に、一本の樹が育った。'],
    text: ["科技與修行不再對立，量測與感知終於開始對話。\n每個人的流，都成為文明的一條根。\n新的文明不是被誰建立的，而是所有人一起長出來的。", "Technology and practice are no longer at odds; measuring and sensing finally begin to talk.\nEach person's Flow becomes a root of civilization.\nThe new civilization was not built by anyone. Everyone grew it together.", "科学と修行はもう対立せず、計測と感知がようやく対話をはじめる。\nひとりひとりの流れが、文明の根になる。\n新しい文明は誰かが築いたものではなく、みんなで育てたもの。"] },
  { no: ['第五章', 'Chapter Five', '第五章'], name: ['歸源', 'Return to Source', '帰源'], sub: ['回到更大的自己', 'Returning to a Greater Self', 'より大きな自分へ還る'],
    epi: ['走得越遠，越接近最初的地方。', 'The farther you go, the closer you come to where it began.', '遠くへ行くほど、はじまりの場所に近づく。'],
    text: ["越過山海、世界與星空，修行者終於回頭。\n原來一路尋找的流，一直都在自己之內。\n歸源不是回到過去，而是回到一個更大的自己。", "Past mountains and seas, worlds and stars, the practitioner finally turns back.\nThe Flow they searched for all along was within them the whole time.\nReturning to the source is not going back to the past. It is returning to a greater self.", "山と海、世界と星空を越えて、修行者はついに振り返る。\n探し続けた流れは、ずっと自分の中にあった。\n帰源とは過去に戻ることではなく、より大きな自分に還ること。"] },
  { no: ['第六章', 'Chapter Six', '第六章'], name: ['新生', 'Rebirth', '新生'], sub: ['融合與超越', 'Union and Transcendence', '融合と超越'],
    epi: ['山與人，光與海，在同一次呼吸裡相遇。', 'Mountain and person, light and sea, meet in a single breath.', '山と人、光と海が、ひとつの呼吸の中で出会う。'],
    text: ["現世與靈界不再是兩種感知，而是同一種生命。\n人與世界的邊界慢慢消融。\n舊的自己沒有消失，而是成為新生的一部分。", "The real world and the spirit world are no longer two ways of sensing, but one life.\nThe boundary between people and the world slowly dissolves.\nThe old self does not vanish. It becomes part of the rebirth.", "現世と霊界は、もう二つの感覚ではなく、ひとつの命になる。\n人と世界の境界が、ゆっくりと溶けていく。\n古い自分は消えるのではなく、新しい命の一部になる。"] },
  { no: ['終章', 'Epilogue', '終章'], name: ['無界', 'Boundless', '無界'], sub: ['未來，仍在展開', 'The Future Is Still Unfolding', '未来は、まだ広がっている'],
    epi: ['這本書，沒有最後一頁。', 'This book has no last page.', 'この本に、最後のページはない。'],
    text: ["每一位走出去的修行者，都在為它寫下新的一行。\n世界才剛開始。\n走出去，遇見你的機緣。", "Every practitioner who steps outside writes a new line in it.\nThe world has only just begun.\nGo out and meet your encounters.", "外へ歩き出す修行者が、ひとりずつ新しい一行を書き加えていく。\n世界は、まだはじまったばかり。\n外へ出て、あなたの縁に出会おう。"] },
];
const L = { zh: 0, en: 1, ja: 2 }[lang] ?? 0;

const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
const el = document.createElement('div');
el.id = 'lore'; el.hidden = true;
el.innerHTML = `<button class="ico x" aria-label="close">${X}<path d="M6 6l12 12M18 6L6 18"/></svg></button>
  <div class="pages"></div>
  <nav><button class="ico prev" aria-label="previous">${X}<path d="M15 5l-7 7 7 7"/></svg></button><div class="dots"></div>
    <button class="ico next" aria-label="next">${X}<path d="M9 5l7 7-7 7"/></svg></button></nav>`;
document.body.appendChild(el);

// 同一本「書」用來翻世界觀和境界：換掉頁面內容就好
const pages = el.querySelector('.pages'), dotsEl = el.querySelector('.dots');
let secs = [], dots = [];
const cur = () => Math.round(pages.scrollLeft / pages.clientWidth);
const go = i => pages.scrollTo({ left: Math.max(0, Math.min(secs.length - 1, i)) * pages.clientWidth, behavior: 'smooth' });
function mark() {
  const i = cur();
  dots.forEach((d, k) => d.classList.toggle('on', k === i));
  secs.forEach((s, k) => s.classList.toggle('on', k === i));
  el.querySelector('.prev').disabled = i === 0; el.querySelector('.next').disabled = i === secs.length - 1;
}
pages.addEventListener('scroll', () => requestAnimationFrame(mark), { passive: true });
el.querySelector('.prev').addEventListener('click', () => go(cur() - 1));
el.querySelector('.next').addEventListener('click', () => go(cur() + 1));
dotsEl.addEventListener('click', e => { const k = dots.indexOf(e.target); if (k >= 0) go(k); });
el.querySelector('.x').addEventListener('click', () => { el.hidden = true; });
addEventListener('keydown', e => { if (el.hidden) return; if (e.key === 'ArrowRight') go(cur() + 1); if (e.key === 'ArrowLeft') go(cur() - 1); if (e.key === 'Escape') el.hidden = true; });
function openBook(html) {
  pages.innerHTML = html; secs = [...pages.children];
  dotsEl.innerHTML = secs.map(() => '<i></i>').join(''); dots = [...dotsEl.children];
  el.hidden = false; pages.scrollLeft = 0; mark();
}
const cover = (kicker, title, intro, swipe) => `<section class="cover"><small>${kicker}</small><h2>${title}</h2><p>${intro}</p><span class="hintSwipe">${swipe}</span></section>`;

export function openLore(at = 0) {
  openBook(cover(t('loreKicker'), t('loreTitle'), t('loreIntro'), t('loreSwipe'))
    + CH.map((c, i) => `<section class="ch"><img src="img/lore/ch${i}.jpg" alt="" loading="${i < 2 ? 'eager' : 'lazy'}">
      <small>${c.no[L]}${i === 0 ? `<em>${t('loreHere')}</em>` : ''}</small><h2>${t('loreName', { name: c.name[L] })}</h2><b>— ${c.sub[L]} —</b><blockquote>${c.epi[L]}</blockquote><p>${c.text[L]}</p></section>`).join(''));
  if (at) requestAnimationFrame(() => { pages.scrollLeft = (at + 1) * pages.clientWidth; mark(); });
}

// 境界：走路修行的五個境界；核心問題取自世界觀聖經第 11 章
const RQ = [
  { q: ['我能不能聽見世界？', 'Can I hear the world?', '世界の声が聞こえるだろうか？'],
    text: ['開始感知流。第一次察覺地脈、情緒、靈氣、危險與機緣。\n走出門的第一步，就站在這裡。', 'You begin to sense the Flow. For the first time you notice earth veins, emotions, spirit, danger and chance encounters.\nYour first step out the door brings you here.', '流れを感じはじめる。地脈、感情、霊気、危険、そして縁に、はじめて気づく。\n外へ出た最初の一歩で、ここに立つ。'] },
  { q: ['我是誰？', 'Who am I?', 'わたしは誰だろう？'],
    text: ['開始建立自己的內在秩序。\n不再只是被外界的流帶著走。', 'You begin to build an order within yourself.\nYou are no longer simply carried along by the currents around you.', '自分の内側に秩序を築きはじめる。\nもう外の流れに流されるだけではない。'] },
  { q: ['我的流往哪裡去？', 'Where is my Flow going?', 'わたしの流れはどこへ向かう？'],
    text: ['形成屬於自己的穩定「內在之流」，開始走出自己的路。\n城、海、山三流，要到這個境界才喚得醒。', 'A steady inner Flow of your own takes shape, and you begin to walk your own path.\nThe City, Sea and Mountain Flows only wake for those who reach this realm.', '自分だけの安定した「内なる流れ」が生まれ、自分の道を歩きはじめる。\n街・海・山の三流は、この境地に至ってはじめて目覚める。'] },
  { q: ['我與世界的邊界在哪裡？', 'Where do I end and the world begin?', 'わたしと世界の境界はどこにある？'],
    text: ['意識不再完全受限於身體與單一空間。\n能感知更大範圍的流。', 'Your awareness is no longer bound to one body and one place.\nYou can sense the Flow across a far wider range.', '意識はもう、身体とひとつの空間だけに縛られない。\nより広い範囲の流れを感じとれる。'] },
  { q: ['我的存在如何影響世界？', 'How does my being change the world?', 'わたしの存在は世界をどう変える？'],
    text: ['你本身開始成為一個「流源」。\n你的選擇、想法與存在，都會改變周圍的世界。', 'You yourself begin to become a source of Flow.\nYour choices, your thoughts and your very presence change the world around you.', 'あなた自身が「流れの源」になりはじめる。\n選択も、思いも、存在そのものも、まわりの世界を変えていく。'] },
];
// 境界的徽記：一圈一圈往外長的光環，境界越高圈越多、越亮；中間是這個境界的圖示
const emblem = (k, now) => `<svg class="emblem${now ? ' now' : ''}" viewBox="0 0 200 200">${[...Array(5)].map((_, r) => {
  const on = r <= k, rad = 26 + r * 16;
  return `<circle cx="100" cy="100" r="${rad}" fill="none" stroke="${on ? (r === k ? '#ffcf5a' : '#7fe8ff') : 'rgba(255,255,255,.12)'}" stroke-width="${r === k ? 3.5 : 2}" ${on ? '' : 'stroke-dasharray="3 7"'} opacity="${on ? 1 - (k - r) * 0.12 : 1}"/>`;
}).join('')}${realmVox(k).replace('<svg ', '<svg x="68" y="68" width="64" height="64" ')}</svg>`;
export function openRealms({ realms, need, now, geo }) {
  openBook(cover(t('realmKicker'), t('realmTitle'), t('realmIntro'), t('realmSwipe'))
    + realms.map((name, i) => `<section class="ch realm">${emblem(i, i === now)}
      <small>${t('realmNo', { n: i + 1 })}${i === now ? `<em>${t('loreHere')}</em>` : ''}</small><h2>${name}</h2>
      <blockquote>${L === 1 ? `“${RQ[i].q[L]}”` : `「${RQ[i].q[L]}」`}</blockquote><p>${RQ[i].text[L]}</p>
      <ul class="facts"><li><small>${t('realmPurify')}</small><b>${i ? `+${i * 20}%` : t('realmBase')}</b></li><li><small>${t('realmNeed')}</small><b>${i ? t(geo ? 'realmNeedGeo' : 'realmNeedIsland', { n: need[i - 1] }) : t('realmStart')}</b></li></ul></section>`).join(''));
  if (now > 0) setTimeout(() => go(now + 1), 350);
}

// 角色圖鑑：主角與守門獸，每一頁一位；「看設定圖」打開整張設定板（設定 → 角色圖鑑）
const CAST = [
  { id: 'liu', img: 'img/cast/liu.png', board: 'liu', beast: 1,
    kick: ['主角', 'Protagonist', '主人公'], name: ['阿流', 'A-Liu', 'アリュウ'], sub: ['旅人', 'The Traveler', '旅人'],
    epi: ['隨洋流而行，去更廣闊的地方。', 'Ride the ocean currents to a wider world.', '海流とともに、もっと広い場所へ。'],
    text: ['在台灣第一個聽見流的人。戴著能聽見地脈的耳機，胸前的洋流羅盤指向下一個機緣。\n走路修行、收集靈光，喚醒四獸山的守門獸。', 'The first person in Taiwan to hear the Flow. The headphones pick up the earth veins, and the Ocean Flow compass points to the next encounter.\nWalk to cultivate, gather Spirit Light, and awaken the guardians of the Four Beasts Mountains.', '台湾で最初に流れを聞いた人。地脈を聞くヘッドホンをつけ、胸の洋流コンパスが次の縁を指す。\n歩いて修行し、霊光を集め、四獣山の守門獣を目覚めさせる。'] },
  { id: 'xi', img: 'img/cast/xi.png', board: 'xi', beast: 1,
    kick: ['夥伴', 'Companion', '仲間'], name: ['阿汐', 'A-Xi', 'アシー'], sub: ['引路人', 'The Guide', '道案内'],
    epi: ['城市本身，也存在流。', 'The city has its own flow.', '都市にも、流れがある。'],
    text: ['比阿流早一步醒來的修行者，熟悉靈界的路。\n一路告訴你下一步往哪走，最後在台北靈門等你。', 'A practitioner who woke a step before A-Liu and knows the paths of the spirit world.\nAlways ready to point you to the next step, and waiting for you at the Taipei Spirit Gate.', 'アリュウより一足先に目覚めた修行者で、霊界の道をよく知っている。\n次の行き先を教えてくれて、最後は台北霊門で待っている。'] },
  { id: 'elephant', img: 'img/beasts/elephant.png', board: 'elephant', beast: 1,
    kick: ['守門獸・象山', 'Guardian · Elephant Mountain', '守門獣・象山'], name: ['象靈', 'Elephant Spirit', '象霊'], sub: ['記憶', 'Memory', '記憶'],
    epi: ['記得每一道流走過的路。', 'It remembers every path the Flow has taken.', 'すべての流れが通った道を覚えている。'],
    text: ['玉青色的大耳刻著浪紋，沉穩又有智慧。\n被濁流纏住時，要用數獨淨化。', 'Jade ears carved with waves; calm and wise.\nWhen the Murk binds it, purify it with sudoku.', '玉色の大きな耳に波の紋。落ち着いていて賢い。\n濁流に絡まれたら、数独で浄化する。'] },
  { id: 'tiger', img: 'img/beasts/tiger.png', board: 'tiger', beast: 1,
    kick: ['守門獸・虎山', 'Guardian · Tiger Mountain', '守門獣・虎山'], name: ['虎靈', 'Tiger Spirit', '虎霊'], sub: ['爆發', 'Power', '爆発'],
    epi: ['一聲虎嘯，濁流退散。', 'One roar, and the Murk scatters.', 'ひと吠えで、濁流が散る。'],
    text: ['橘白相間的方塊虎，力量一口氣爆發。\n被濁流纏住時，要用連點淨化。', 'An orange-and-white block tiger whose strength bursts out all at once.\nWhen the Murk binds it, purify it with rapid taps.', 'オレンジと白のブロックの虎。力を一気に爆発させる。\n濁流に絡まれたら、連打で浄化する。'] },
  { id: 'leopard', img: 'img/beasts/leopard.png', board: 'leopard', beast: 1,
    kick: ['守門獸・豹山', 'Guardian · Leopard Mountain', '守門獣・豹山'], name: ['豹靈', 'Leopard Spirit', '豹霊'], sub: ['敏捷', 'Agility', '敏捷'],
    epi: ['比風更快，比影更輕。', 'Faster than wind, lighter than shadow.', '風より速く、影より軽く。'],
    text: ['金黃身上點著方形斑紋，身手輕巧。\n被濁流纏住時，要畫符淨化。', 'Golden with square spots, light on its feet.\nWhen the Murk binds it, purify it by drawing sigils.', '金色の体に四角い斑点。身のこなしが軽い。\n濁流に絡まれたら、符を描いて浄化する。'] },
  { id: 'lion', img: 'img/beasts/lion.png', board: 'lion', beast: 1,
    kick: ['守門獸・獅山', 'Guardian · Lion Mountain', '守門獣・獅山'], name: ['獅靈', 'Lion Spirit', '獅霊'], sub: ['威勢', 'Might', '威勢'],
    epi: ['踩著繡球，守住陣腳。', 'Paw on the embroidered ball, it holds the line.', '鞠を踏みしめ、陣を守る。'],
    text: ['像廟口的石獅，朱紅捲鬃、金色紋路。\n被濁流纏住時，要用三消淨化。', 'Like a temple guardian lion, with a curly crimson mane and gold markings.\nWhen the Murk binds it, purify it with match-three.', '廟の石獅子のような、朱色の巻き毛と金の紋。\n濁流に絡まれたら、三消しで浄化する。'] },
  // 第二階・台北城市故事的守門街貓（img/beasts/cat-*.png，原圖在 ocean-flow-origin/character-ref/cats/）
  { id: 'cat-wufenpu', img: 'img/beasts/cat-wufenpu.png', beast: 1,
    kick: ['守門貓・五分埔', 'Guardian Cat · Wufenpu', '守り猫・五分埔'], name: ['布布', 'Bubu', 'ブブ'], sub: ['三花貓', 'Calico', '三毛猫'],
    epi: ['五塊布，五戶人家，一個約定。', 'Five cloths, five families, one promise.', '五枚の布、五軒の家、ひとつの約束。'],
    text: ['在成衣巷子裡長大的三花貓，圍巾是五塊不同的布拼成的。\n濁流把布料翻成背面時，要用記憶配對找回每一塊。', 'A calico raised among the garment lanes, wearing a scarf patched from five different cloths.\nWhen the Murk turns the cloth face down, match pairs from memory to find every piece.', '衣料品の路地で育った三毛猫。マフラーは五枚の布の継ぎはぎ。\n濁流が布を裏返したら、記憶で二枚ずつそろえて取り戻す。'] },
  { id: 'cat-cihcheng', img: 'img/beasts/cat-cihcheng.png', beast: 1,
    kick: ['守門貓・士林慈諴宮', 'Guardian Cat · Cihcheng Temple', '守り猫・士林慈諴宮'], name: ['圓仔', 'Yuanzai', 'ユエンザイ'], sub: ['橘貓', 'Ginger', '茶トラ'],
    epi: ['廟口的燈一亮，夜市就醒了。', 'When the temple lights come on, the night market wakes.', '廟の灯がともれば、夜市が目を覚ます。'],
    text: ['圓滾滾的橘貓，脖子上掛著廟會的紅繩與金鈴，天天在廟前巡夜市。\n濁流打亂攤位時，要用三消把攤位排回去。', 'A round ginger cat with a temple-fair red cord and golden bell, patrolling the night market every evening.\nWhen the Murk scrambles the stalls, match three to set them right.', '丸い茶トラ。廟の祭りの赤い紐と金の鈴をつけ、毎晩夜市を見回る。\n濁流が屋台を乱したら、三消しで並べ直す。'] },
  { id: 'cat-xinzhuang', img: 'img/beasts/cat-xinzhuang.png', beast: 1,
    kick: ['守門貓・新莊老街', 'Guardian Cat · Xinzhuang', '守り猫・新荘老街'], name: ['船長', 'Captain', '船長'], sub: ['虎斑貓', 'Tabby', 'キジトラ'],
    epi: ['一府二鹿三新莊，牠都記得。', 'One Fu, two Lu, three Xinzhuang. It remembers them all.', '一府二鹿三新荘、ぜんぶ覚えている。'],
    text: ['戴著斗笠、腰繫麻繩的虎斑貓，河港最熱鬧時就在碼頭搬貨。\n濁流讓大船卡住時，要連點幫牠把貨搬上岸。', 'A tabby in a straw hat and rope sash who hauled cargo when the river port was busiest.\nWhen the Murk strands the big boats, tap fast to help unload.', '笠をかぶり縄を締めたキジトラ。河港がにぎわった頃、波止場で荷を運んだ。\n濁流で大船が動けなくなったら、連打で荷揚げを手伝う。'] },
  { id: 'cat-wanhua', img: 'img/beasts/cat-wanhua.png', beast: 1,
    kick: ['守門貓・萬華與加蚋仔', 'Guardian Cat · Wanhua', '守り猫・萬華と加蚋仔'], name: ['小舺', 'Monga', 'モンガ'], sub: ['黑貓', 'Black Cat', '黒猫'],
    epi: ['三個萬華的巷子，牠閉著眼都走得出來。', 'It could walk the alleys of all three Wanhuas with its eyes closed.', '三つの萬華の路地を、目を閉じても歩ける。'],
    text: ['琥珀色眼睛的黑貓，圍巾上掛著一艘小小的獨木舟，那是「艋舺」的由來。\n濁流藏進巷子時，要用踩地雷找出它們、把巷子點亮。', 'An amber-eyed black cat with a tiny canoe charm on its scarf, the origin of the name "Monga."\nWhen the Murk hides in the alleys, sweep the grid to find it and light the lanes.', '琥珀色の目の黒猫。マフラーの小さな丸木舟は「艋舺」の由来。\n濁流が路地に潜んだら、マインスイーパーで見つけて路地を照らす。'] },
  { id: 'cat-baoan', img: 'img/beasts/cat-baoan.png', beast: 1,
    kick: ['守門貓・大龍峒保安宮', 'Guardian Cat · Baoan Temple', '守り猫・大龍峒保安宮'], name: ['陶陶', 'Taotao', 'タオタオ'], sub: ['白貓', 'White Cat', '白猫'],
    epi: ['一片交趾陶，也值得慢慢修好。', 'Even one piece of koji pottery is worth mending slowly.', '交趾焼の一片も、ゆっくり直す価値がある。'],
    text: ['毛茸茸的白貓，項圈鑲著綠、黃、紅的交趾陶片，看著老廟一點一點修好。\n濁流弄壞紋樣時，要畫符把剪黏與交趾陶的紋路描回來。', 'A fluffy white cat whose collar is set with green, yellow and red koji tiles; it watched the old temple mended piece by piece.\nWhen the Murk breaks the patterns, draw the sigils to trace them back.', 'ふわふわの白猫。首輪に緑・黄・赤の交趾焼。古い廟が少しずつ直るのを見てきた。\n濁流が文様を壊したら、符を描いてなぞり直す。'] },
  { id: 'cat-zaichun', img: 'img/beasts/cat-zaichun.png', beast: 1,
    kick: ['守門貓・再春游泳池與明治橋', 'Guardian Cat · Zaichun Pool', '守り猫・再春プールと明治橋'], name: ['明治', 'Meiji', 'メイジ'], sub: ['賓士貓', 'Tuxedo', 'ハチワレ'],
    epi: ['435 塊橋身，牠一塊一塊數過。', 'It has counted all 435 pieces of the bridge, one by one.', '435 個の橋の欠片を、一つずつ数えてきた。'],
    text: ['戴著復古泳鏡、套著救生圈的賓士貓，常在再春游泳池舊址守著明治橋的構件。\n濁流把照片打散時，要用滑塊拼圖拼回原樣。', 'A tuxedo cat in retro goggles and a life ring, keeping watch over the Meiji Bridge pieces at the old Zaichun Pool.\nWhen the Murk scatters the photo, slide the pieces back into place.', 'レトロなゴーグルと浮き輪のハチワレ。再春プール跡で明治橋の部材を見守る。\n濁流が写真を散らしたら、スライドパズルで元に戻す。'] },
  { id: 'cat-shipai', img: 'img/beasts/cat-shipai.png', beast: 1,
    kick: ['守門貓・石牌商城', 'Guardian Cat · Shipai', '守り猫・石牌'], name: ['阿碑', 'Abei', 'アベイ'], sub: ['暹羅貓', 'Siamese', 'シャム猫'],
    epi: ['界碑分開土地，也讓人記得彼此。', 'The boundary stone divided the land, and made people remember each other.', '境界碑は土地を分け、互いを思い出させた。'],
    text: ['藍眼睛的暹羅貓，胸前掛著一塊小小的界碑，白天逛市場、晚上守夜市。\n濁流模糊了界線時，要用數獨把每一格分清楚。', 'A blue-eyed Siamese wearing a tiny boundary-stone pendant, browsing the market by day and guarding the night market after dark.\nWhen the Murk blurs the lines, solve sudoku to set every square straight.', '青い目のシャム猫。胸に小さな境界碑。昼は市場、夜は夜市を守る。\n濁流が境界をぼかしたら、数独で一マスずつはっきりさせる。'] },
  { id: 'dragon', img: 'img/beasts/dragon.png', board: 'dragon', beast: 1,
    kick: ['守門獸・城之回聲', 'Guardian · Echo of the City', '守門獣・街のこだま'], name: ['龍靈', 'Dragon Spirit', '龍霊'], sub: ['城', 'City', '街'],
    epi: ['從廟頂醒來，聽得見整座城的心跳。', 'Awake on the temple roof, it hears the whole city\'s heartbeat.', '廟の屋根で目覚め、街じゅうの鼓動を聞く。'],
    text: ['廟頂剪黏的龍，玉綠鱗片鑲著金紅邊，抱著一顆明珠。\n城之回聲被濁流擋住時，要跟上城市的節奏連點淨化。', 'The mosaic dragon from the temple roof, jade scales trimmed in gold and red, holding a pearl.\nWhen the Murk blocks the Echo of the City, tap along to the city\'s rhythm to purify it.', '廟の屋根の剪黏の龍。玉色の鱗に金と赤の縁、宝珠を抱く。\n街のこだまが濁流にふさがれたら、街のリズムで連打して浄化する。'] },
  { id: 'turtle', img: 'img/beasts/turtle.png', board: 'turtle', beast: 1,
    kick: ['守門獸・海之流痕', 'Guardian · Trace of the Sea', '守門獣・海の流れ跡'], name: ['龜靈', 'Turtle Spirit', '亀霊'], sub: ['海', 'Sea', '海'],
    epi: ['乘著黑潮，記得每一條洋流的方向。', 'Riding the Kuroshio, it remembers where every current goes.', '黒潮に乗り、すべての海流の向きを覚えている。'],
    text: ['龜山島外的大海龜，殼上的六角方塊刻著浪紋。\n海之流痕被濁流擋住時，要畫符描出洋流淨化。', 'The great sea turtle off Guishan Island, its hexagon-block shell carved with waves.\nWhen the Murk blocks the Trace of the Sea, draw the current as a sigil to purify it.', '亀山島沖の大海亀。六角ブロックの甲羅に波の紋。\n海の流れ跡が濁流にふさがれたら、海流を符に描いて浄化する。'] },
  { id: 'bear', img: 'img/beasts/bear.png', board: 'bear', beast: 1,
    kick: ['守門獸・山之鐘聲', 'Guardian · Bell of the Mountain', '守門獣・山の鐘'], name: ['熊靈', 'Bear Spirit', '熊霊'], sub: ['山', 'Mountain', '山'],
    epi: ['山霧散去時，鐘聲就從牠胸前響起。', 'When the mountain mist lifts, the bell rings from its chest.', '山霧が晴れると、その胸から鐘が鳴る。'],
    text: ['台灣黑熊，胸前有白色的 V 字月牙，守著玉山的鐘。\n山之鐘聲被濁流擋住時，要用數獨找回山的記憶。', 'A Formosan black bear with a white V crescent on its chest, guarding the bell of Yushan.\nWhen the Murk blocks the Bell of the Mountain, solve sudoku to recover the mountain\'s memory.', '胸に白いV字の月の輪がある台湾黒熊。玉山の鐘を守る。\n山の鐘が濁流にふさがれたら、数独で山の記憶を取り戻す。'] },
  { id: 'boss', img: 'img/beasts/boss.png', board: 'boss', beast: 1,
    kick: ['序章・終極 BOSS', 'Prologue · Final Boss', '序章・最終ボス'], name: ['濁淵', 'Zhuoyuan', '濁淵'], sub: ['濁流之淵', 'Abyss of the Murk', '濁流の淵'],
    epi: ['四獸的影子被吞進同一個深淵。', 'Four beasts\' shadows, swallowed into one abyss.', '四獣の影が、ひとつの深淵に飲みこまれた。'],
    text: ['濁流把四獸的影子揉成一頭巨獸，擋在台北靈門前。\n四關連戰要一次打完，輸了會被吸光所有靈光。', 'The Murk kneaded the four beasts\' shadows into one giant that blocks the Taipei Spirit Gate.\nClear four rounds in one go, or lose all your spirit light.', '濁流が四獣の影をこねた巨獣。台北霊門の前に立ちはだかる。\n四連戦を一度で勝ち抜け。負ければ霊光をすべて失う。'] },
];
const box = document.createElement('div');
box.id = 'boardView'; box.hidden = true;
box.innerHTML = `<button class="ico x" aria-label="close">${X}<path d="M6 6l12 12M18 6L6 18"/></svg></button><div class="scroll"><img alt=""></div><p></p>`;
document.body.appendChild(box);
box.addEventListener('click', e => { if (!e.target.closest('.scroll')) box.hidden = true; });
pages.addEventListener('click', e => {
  const b = e.target.closest('[data-board]'); if (!b) return;
  box.querySelector('img').src = `img/cast/board-${b.dataset.board}.jpg`; box.querySelector('p').textContent = t('boardHint');
  box.hidden = false; box.querySelector('.scroll').scrollLeft = 0;
});
export function openCast() {
  openBook(cover(t('castKicker'), t('castTitle'), t('castIntro'), t('castSwipe'))
    + CAST.map((c, i) => `<section class="ch cast${c.beast ? ' beast' : ''}${c.wide ? ' wide' : ''}"><img src="${c.img}" alt="" loading="${i < 2 ? 'eager' : 'lazy'}">
      <small>${c.kick[L]}</small><h2>${c.name[L]}</h2><b>— ${c.sub[L]} —</b><blockquote>${c.epi[L]}</blockquote><p>${c.text[L]}</p>
      ${c.board ? `<button class="ghost" data-board="${c.board}">${t('seeBoard')}</button>` : ''}</section>`).join(''));
}
