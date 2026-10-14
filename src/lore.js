// 洋流世界觀：八個章節，像一本書一頁一頁翻開（設定 → 洋流世界觀）
// 圖來自 docs/lore/eight-stages.png，切成 img/lore/ch0–7.jpg
import { lang, t } from './i18n.js';

const CH = [
  { no: ['序章', 'Prologue', '序章'], name: ['起源', 'Origin', '起源'], sub: ['覺醒台灣', 'Awakening in Taiwan', '台湾の目覚め'],
    text: ['在島嶼的最深處，有一股流從來沒有停過。它在山脊上奔走，在街角裡迴旋，等著第一個聽見它的人。\n你走出門的那一步，洋流醒了。',
      'Deep within the island, a current has never stopped moving. It runs along the ridges and circles through street corners, waiting for the first person to hear it.\nThe moment you step outside, the Ocean Flow awakens.',
      '島のいちばん深いところに、一度も止まったことのない流れがある。尾根を駆け、街角を巡りながら、最初に気づく人を待っていた。\nあなたが一歩外へ出たとき、洋流は目を覚ます。'] },
  { no: ['第一章', 'Chapter One', '第一章'], name: ['流域', 'Watershed', '流域'], sub: ['擴展亞洲', 'Reaching Across Asia', 'アジアへ広がる'],
    text: ['流從不屬於一座島。它順著黑潮北上，越過海峽與群山，把亞洲的城市一座座點亮。\n每一條河都記得，自己來自同一片海。',
      'A current never belongs to one island. It rides the Kuroshio north, crosses straits and mountains, and lights up the cities of Asia one by one.\nEvery river remembers it came from the same sea.',
      '流れはひとつの島のものではない。黒潮に乗って北へ、海峡と山々を越え、アジアの街をひとつずつ灯していく。\nどの川も、同じ海から来たことを覚えている。'] },
  { no: ['第二章', 'Chapter Two', '第二章'], name: ['連界', 'Linked Worlds', '連界'], sub: ['連結世界', 'Connecting the World', '世界をつなぐ'],
    text: ['當足跡多到能繞地球一圈，各大洲的流開始彼此呼應。\n遠方的陌生人，原來和你走在同一條看不見的線上。',
      'When there are enough footsteps to circle the Earth, the currents of every continent begin to answer one another.\nA stranger far away, it turns out, walks the same invisible line as you.',
      '足あとが地球を一周するほどになると、大陸ごとの流れが呼び合いはじめる。\n遠くの見知らぬ人も、あなたと同じ見えない線の上を歩いていた。'] },
  { no: ['第三章', 'Chapter Three', '第三章'], name: ['星航', 'Star Voyage', '星航'], sub: ['穿越多元宇宙', 'Across the Multiverse', '多元宇宙を渡る'],
    text: ['地圖的邊界之外是星海。洋流化成星河，載著行者航向其他世界。\n那裡也有人，正等著被喚醒。',
      'Beyond the edge of every map lies a sea of stars. The Ocean Flow becomes a river of light and carries travelers toward other worlds.\nThere, too, someone is waiting to be awakened.',
      '地図の果ての向こうは星の海。洋流は星の川となり、旅人をほかの世界へ運んでいく。\nそこにも、目覚めを待つ誰かがいる。'] },
  { no: ['第四章', 'Chapter Four', '第四章'], name: ['萬象', 'All Things', '万象'], sub: ['共創新文明', 'Building a New Civilization Together', '新しい文明をともに'],
    text: ['無數的流交會，長成一棵巨樹。每一段走過的路是一條根，每一次相遇長出新的枝葉。\n文明不再由誰賜予，而是大家一起長成。',
      'Countless currents meet and grow into one great tree. Every path walked becomes a root; every encounter grows new leaves.\nCivilization is no longer handed down. It is grown together.',
      '無数の流れが出会い、一本の大樹になる。歩いた道は根に、出会いは新しい枝葉になる。\n文明は誰かから与えられるものではなく、みんなで育てるもの。'] },
  { no: ['第五章', 'Chapter Five', '第五章'], name: ['歸源', 'Return to Source', '帰源'], sub: ['回到更大的自己', 'Returning to a Greater Self', 'より大きな自分へ還る'],
    text: ['走得越遠，越接近起點。原來洋流一直在你身體裡流動。\n所謂旅程，是認出那個更大的自己。',
      'The farther you walk, the closer you come to where you began. The Ocean Flow has been moving inside you all along.\nThe journey is learning to recognize your greater self.',
      '遠くへ行くほど、始まりに近づいていく。洋流はずっと、あなたの中を流れていた。\n旅とは、より大きな自分に気づくこと。'] },
  { no: ['第六章', 'Chapter Six', '第六章'], name: ['新生', 'Rebirth', '新生'], sub: ['融合與超越', 'Union and Transcendence', '融合と超越'],
    text: ['光與暗、山與海、你與世界，在潮汐之間交融。\n舊的形狀退去，新的生命從浪裡站起來。',
      'Light and dark, mountain and sea, you and the world blend between the tides.\nOld shapes fall away, and new life rises from the waves.',
      '光と闇、山と海、あなたと世界が、潮のあいだで溶け合う。\n古いかたちは去り、新しい命が波の中から立ち上がる。'] },
  { no: ['終章', 'Epilogue', '終章'], name: ['無界', 'Boundless', '無界'], sub: ['未來，仍在展開', 'The Future Is Still Unfolding', '未来は、まだ広がっている'],
    text: ['這本書沒有最後一頁。蓮花在星光裡綻開，每一位行者都是下一章的作者。\n洋流，仍在展開。',
      'This book has no last page. A lotus opens in the starlight, and every traveler is the author of the next chapter.\nThe Ocean Flow is still unfolding.',
      'この本に最後のページはない。星明かりの中で蓮が開き、旅人の一人ひとりが次の章の作者になる。\n洋流は、まだ広がり続けている。'] },
];
const L = { zh: 0, en: 1, ja: 2 }[lang] ?? 0;

const el = document.createElement('div');
el.id = 'lore'; el.hidden = true;
el.innerHTML = `<button class="ico x" aria-label="close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  <div class="pages">
    <section class="cover"><small>${t('loreKicker')}</small><h2>${t('loreTitle')}</h2><p>${t('loreIntro')}</p><span class="hintSwipe">${t('loreSwipe')}</span></section>
    ${CH.map((c, i) => `<section class="ch"><img src="img/lore/ch${i}.jpg" alt="" loading="${i < 2 ? 'eager' : 'lazy'}">
      <small>${c.no[L]}${i === 0 ? `<em>${t('loreHere')}</em>` : ''}</small><h2>${t('loreName', { name: c.name[L] })}</h2><b>— ${c.sub[L]} —</b><p>${c.text[L]}</p></section>`).join('')}
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
