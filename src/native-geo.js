// App 版定位：改用原生背景定位，手機收起來、螢幕關掉也繼續記錄走的路（網頁版不會載入這支）
// Android 會在通知列放一則「走路修行中」的常駐通知；iOS 會在狀態列顯示定位中
import { geo } from './geo.js';
import { t, lang } from './i18n.js';

const MSG = {
  zh: ['走路修行中', '洋流正在記錄你走的路，回到遊戲就能拿到修為。'],
  en: ['Walking practice', 'Ocean Flow is recording your walk. Come back to the game to collect your cultivation.'],
  ja: ['歩いて修行中', '洋流があなたの歩いた道を記録しています。ゲームに戻ると修為を受け取れます。'],
};
const [title, message] = MSG[lang] || MSG.zh;
const BG = window.Capacitor.registerPlugin('BackgroundGeolocation');

geo.start = function () {
  if (this.watching) return;
  this.watching = true;
  BG.addWatcher({ backgroundTitle: title, backgroundMessage: message, requestPermissions: true, stale: false, distanceFilter: 3 }, (p, e) => {
    if (e) {
      this.watching = false;
      this.error = e.code === 'NOT_AUTHORIZED' ? t('geoDenied') : t('geoFail');
      this.emit();
      return;
    }
    const pos = { lat: p.latitude, lng: p.longitude };
    if (!this.sim) { this.pos = pos; this.acc = p.accuracy; }
    this.error = ''; this.real = { ...pos, acc: p.accuracy };
    this.emit();
  }).catch(() => { this.watching = false; this.error = t('geoFail'); this.emit(); });
};
