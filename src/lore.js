// 洋流世界觀：八個章節，像一本書一頁一頁翻開（設定 → 洋流世界觀）
// 圖來自 docs/lore/eight-stages.png，切成 img/lore/ch0–7.jpg；中文文案來自專案的 world-chapters.md
import { lang, t } from './i18n.js';

const CH = [
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

const el = document.createElement('div');
el.id = 'lore'; el.hidden = true;
el.innerHTML = `<button class="ico x" aria-label="close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  <div class="pages">
    <section class="cover"><small>${t('loreKicker')}</small><h2>${t('loreTitle')}</h2><p>${t('loreIntro')}</p><span class="hintSwipe">${t('loreSwipe')}</span></section>
    ${CH.map((c, i) => `<section class="ch"><img src="img/lore/ch${i}.jpg" alt="" loading="${i < 2 ? 'eager' : 'lazy'}">
      <small>${c.no[L]}${i === 0 ? `<em>${t('loreHere')}</em>` : ''}</small><h2>${t('loreName', { name: c.name[L] })}</h2><b>— ${c.sub[L]} —</b><blockquote>${c.epi[L]}</blockquote><p>${c.text[L]}</p></section>`).join('')}
  </div>
  <nav><button class="ico prev" aria-label="previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>
    <div class="dots">${['', ...CH].map(() => '<i></i>').join('')}</div>
    <button class="ico next" aria-label="next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button></nav>`;
document.body.appendChild(el);

const pages = el.querySelector('.pages'), dots = [...el.querySelectorAll('.dots i')], secs = [...pages.children];
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
dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
el.querySelector('.x').addEventListener('click', () => { el.hidden = true; });
addEventListener('keydown', e => { if (el.hidden) return; if (e.key === 'ArrowRight') go(cur() + 1); if (e.key === 'ArrowLeft') go(cur() - 1); if (e.key === 'Escape') el.hidden = true; });

export function openLore() { el.hidden = false; pages.scrollLeft = 0; mark(); }
