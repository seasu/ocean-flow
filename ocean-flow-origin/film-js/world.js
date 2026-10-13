// 方塊世界：等角方塊渲染＋四個場景（08 台灣島甦醒、09 靈界、10 修行之路、11 遠方流場）
// 每個場景都是「本鏡時間 lt」的純函數，沒有隨機狀態，拖曳到哪裡畫面都一樣。
(function(){
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
const lerp=(a,b,u)=>a+(b-a)*u;
function shade(hex,k){const n=parseInt(hex.slice(1),16);const f=c=>Math.max(0,Math.min(255,Math.round(c*k)));return`rgb(${f(n>>16)},${f(n>>8&255)},${f(n&255)})`}

function View(cv){
  const g=cv.getContext("2d");let W=1,H=1,S=1,OX=0,OY=0;
  const v={g,
    size(){const r=cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);W=cv.width=Math.max(2,Math.round(Math.min(1920,r.width*d)));H=cv.height=Math.round(W*9/16)},
    cam(scale,cx,cy,cz,sy=.5){S=W/scale;OX=W/2-(cx-cy)*S*.866;OY=H*sy-(cx+cy)*S*.5+cz*S},
    P(x,y,z){return[OX+(x-y)*S*.866,OY+(x+y)*S*.5-z*S]},
    get W(){return W},get H(){return H},get S(){return S}};
  v.box=(x,y,z,w,d,h,col,glow,alpha)=>{
    const q=(pts,c)=>{g.beginPath();pts.forEach((p,i)=>{const[a,b]=v.P(...p);i?g.lineTo(a,b):g.moveTo(a,b)});g.closePath();g.fillStyle=c;g.fill()};
    if(alpha!==undefined)g.globalAlpha=alpha;
    q([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],shade(col,.78));
    q([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],shade(col,.62));
    q([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],shade(col,1.08));
    if(glow){g.strokeStyle=glow;g.lineWidth=S*.05;g.stroke()}
    if(alpha!==undefined)g.globalAlpha=1;
  };
  v.sky=(top,bot)=>{const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,top);gr.addColorStop(1,bot);g.fillStyle=gr;g.fillRect(0,0,W,H)};
  v.motes=(t,n,seed,a,rgb)=>{g.save();g.globalCompositeOperation="lighter";for(let i=0;i<n;i++){const r=rng(seed+i),x=r()*W,y=((r()*H-t*S*(.25+r()*.5))%H+H)%H,s=S*(.05+r()*.07),tw=.5+.5*Math.sin(t*(1+r()*2)+i);g.fillStyle=`rgba(${i%2?rgb[0]:rgb[1]},${a*tw})`;g.fillRect(x-s/2,y-s/2,s,s)}g.restore()};
  v.ring=(x,y,z,r,col,lw)=>{const[cx,cy]=v.P(x,y,z);g.beginPath();g.ellipse(cx,cy,r*S*.866*1.15,r*S*.5*1.15,0,0,6.2832);g.strokeStyle=col;g.lineWidth=lw*S;g.stroke()};
  return v;
}

// 角色：依「洋流 Ocean Currents」設定圖
const BLUE={skin:"#f3d9bd",hair:"#e3e7ee",hairTip:"#8cc4f0",jacket:"#eef2f7",trim:"#1f4f9c",wave:"#58b0ea",inner:"#141b2a",pants:"#192236",pantWave:"#3f8fdc",shoe:"#eef3f8",shoeAcc:"#2b62b5",hp:"#f4f6fa",hpAcc:"#2f6fc0",ribbon:"120,198,245",eye:"#2d6fd0"};
const ORANGE={skin:"#f3d9bd",hair:"#ece9e4",hairTip:"#ffb347",jacket:"#f4f2ee",trim:"#e8641c",wave:"#ffb02e",inner:"#16120e",pants:"#eceef1",pantWave:"#f08a24",shoe:"#f6f2ec",shoeAcc:"#e8641c",hp:"#f7f4ef",hpAcc:"#e8641c",ribbon:"255,170,50",eye:"#d9781b"};
function avatar(v,x0,y0,z0,c,o){
  const {bob=0,sw=0,t=0,k=1.4,sit=false}=o||{};const g=v.g;
  const B=(x,y,z,w,d,h,col,glow)=>v.box(x0+x*k,y0+y*k,z0+z*k,w*k,d*k,h*k,col,glow);
  g.save();g.lineCap="round";
  for(let r=0;r<2;r++){const[sx,sy]=v.P(x0+(.12+r*.36)*k,y0+.2*k,z0+.72*k);g.beginPath();g.moveTo(sx,sy);
    for(let i=1;i<=12;i++){const u=i/12;const[px,py]=v.P(x0+(.12+r*.36-u*.5)*k,y0+(.2-u*.9)*k,z0+(.72-u*.25+.1*Math.sin(t*4+u*5+r))*k);g.lineTo(px,py)}
    g.strokeStyle=`rgba(${c.ribbon},.9)`;g.lineWidth=v.S*.08;g.stroke()}
  g.restore();
  const lz=sit?-.3:0;
  if(sit){B(-.05,.3,0,.7,.3,.2,c.pants);B(-.05,.55,0,.7,.08,.2,c.pantWave)}
  else for(const [lx,ph] of [[.03,sw],[.31,-sw]]){B(lx,.1+ph*.3,0,.26,.26,.12,c.shoe);B(lx+.02,.12+ph*.3,.12,.22,.22,.06,c.shoeAcc);B(lx,.1+ph*.3,.18,.26,.26,.2,c.pantWave);B(lx,.1+ph*.3,.38,.26,.26,.34,c.pants)}
  const arm=(ax,ph)=>{B(ax,.12+ph,lz+.78+bob,.22,.28,.12,c.skin);B(ax,.12+ph,lz+.9+bob,.22,.28,.1,c.wave);B(ax,.12+ph,lz+1.0+bob,.22,.28,.07,c.trim);B(ax,.12+ph,lz+1.07+bob,.22,.28,.33,c.jacket)};
  arm(-.22,-sw*.3);
  B(0,.08,lz+.72+bob,.6,.34,.68,c.jacket);
  B(.18,.42,lz+.72+bob,.24,.01,.68,c.inner);
  B(0,.42,lz+.72+bob,.6,.01,.12,c.wave);B(0,.42,lz+.84+bob,.6,.01,.04,c.trim);
  B(.27,.43,lz+1.02+bob,.06,.01,.14,"#c9d3de","rgba(255,255,255,.9)");
  arm(.6,sw*.3);
  B(.08,.05,lz+1.4+bob,.44,.44,.44,c.skin);
  B(.15,.49,lz+1.56+bob,.07,.01,.09,c.eye);B(.35,.49,lz+1.56+bob,.07,.01,.09,c.eye);
  B(.05,.02,lz+1.72+bob,.5,.5,.16,c.hair);B(.05,.4,lz+1.62+bob,.5,.12,.12,c.hair);
  [[.08,.08],[.3,.1],[.18,.3],[.38,.32]].forEach(([hx,hy],i)=>B(hx,hy,lz+1.88+bob,.14,.14,.1+.05*(i%2),i===1?c.hairTip:c.hair));
  B(-.04,.16,lz+1.48+bob,.12,.22,.24,c.hp);B(-.05,.2,lz+1.52+bob,.02,.14,.16,c.hpAcc);
  B(.48,.16,lz+1.48+bob,.12,.22,.24,c.hp);B(.6,.2,lz+1.52+bob,.02,.14,.16,c.hpAcc);
  B(-.02,.24,lz+1.86+bob,.64,.06,.06,c.hp);
}
function draw(items){items.sort((a,b)=>a[0]-b[0]).forEach(([,f])=>f())}

// ---------- 台灣島（08、11 共用） ----------
const TW=(()=>{  // 北→南 28 列，每列寬度與起點；東側中央山脈
  const wid=[2,3,4,5,6,6,7,7,8,8,8,8,8,8,7,7,7,6,6,6,5,5,4,4,3,3,2,1];
  const cols=[];
  wid.forEach((w,i)=>{const st=Math.round(4-w*.55+(i>18?(i-18)*.25:0));for(let j=0;j<w;j++){
    const jj=st+j, ridge=st+w*.62, mh=Math.exp(-(((jj-ridge)/1.5)**2))*(i>3&&i<26?1:.4);
    const h=.35+mh*2.6*(.7+.3*Math.sin(i*1.7));
    cols.push({i,j:jj,x:i*.72+jj*.72,y:i*.72-jj*.72+6,h,mh});}});
  return cols;})();
const CITIES=[[2,3,"台北"],[11,1,"台中"],[22,2,"高雄"]];
function island(v,lt,awake,swirl){
  const g=v.g,items=[];
  // 海
  const [a,b]=v.P(-80,-80,0),[c2,d2]=v.P(120,-80,0),[e,f]=v.P(120,120,0),[h1,h2]=v.P(-80,120,0);
  g.beginPath();g.moveTo(a,b);g.lineTo(c2,d2);g.lineTo(e,f);g.lineTo(h1,h2);g.closePath();g.fillStyle="#123a63";g.fill();
  for(let k=0;k<70;k++){const r=rng(900+k),x=-6+r()*36,y=-4+r()*36;const ph=(lt*.4+r())%1;if(ph<.5)v.box(x,y,0,.5,.12,.02,"#3d82c4",null,Math.sin(ph*6.28)*.6)}
  // 遠方流場
  if(swirl>0){g.save();g.globalCompositeOperation="lighter";for(let k=0;k<5;k++){v.ring(27,-2,0,2.2+k*1.4+((lt*.6)%1.4),`rgba(120,210,255,${swirl*(.55-k*.09)})`,.08)}
    for(let k=0;k<26;k++){const an=k/26*6.283+lt*.5,r=3+((k*7)%5);v.box(27+Math.cos(an)*r,-2+Math.sin(an)*r*.8,.05,.35,.35,.12,"#8fe6ff",null,swirl*.8)}g.restore()}
  // 島
  const front=awake;  // 0..1 由北往南點亮
  for(const col of TW){
    const lit=ease((front*30-col.i)/3);
    const top=col.mh>.5?"#8a929b":col.mh>.25?"#4f9a52":"#5fb35b";
    items.push([col.x+col.y,()=>{
      v.box(col.x,col.y,0,.72,.72,col.h,top,lit>0?`rgba(130,225,255,${lit*.85})`:null);
      if(col.mh>.8&&lit>0)v.box(col.x+.16,col.y+.16,col.h,.4,.4,.08,"#ffe7a3",null,lit);
    }]);
  }
  CITIES.forEach(([i,j])=>{const col=TW.find(c=>c.i===i&&c.j===j)||TW.find(c=>c.i===i);items.push([col.x+col.y+.5,()=>{for(let q=0;q<3;q++)v.box(col.x+.1+q*.2,col.y+.15,col.h,.16,.16,.35+q*.2,"#cfd7e2",ease((front*30-i)/3)>0?"rgba(255,215,120,.9)":null)}])});
  draw(items);
  // 中央山脈的靈脈（金線，北→南）
  g.save();g.globalCompositeOperation="lighter";g.lineCap="round";
  const ridge=TW.filter(c=>c.mh>.85).sort((p,q)=>p.i-q.i);
  for(const [lw,al] of [[.25,.18],[.07,.9]]){g.beginPath();let n=0;for(const c of ridge){if(c.i>front*30)break;const[x,y]=v.P(c.x+.36,c.y+.36,c.h+.1);n++?g.lineTo(x,y):g.moveTo(x,y)}g.strokeStyle=`rgba(255,220,140,${al})`;g.lineWidth=lw*v.S;g.stroke()}
  // 光柱
  CITIES.forEach(([i],k)=>{const u=ease((front*30-i)/4);if(u<=0)return;const col=TW.find(c=>c.i===i);const[x,y]=v.P(col.x+.4,col.y+.4,col.h);const gr=g.createLinearGradient(x,y,x,y-v.S*9);gr.addColorStop(0,`rgba(140,225,255,${.7*u})`);gr.addColorStop(1,"rgba(140,225,255,0)");g.fillStyle=gr;g.fillRect(x-v.S*.25,y-v.S*9,v.S*.5,v.S*9)});
  g.restore();
}

// ---------- 靈界（09） ----------
function realm(v,lt){
  const g=v.g;v.sky("#0d1b3a","#3b6a8f");
  v.motes(lt,60,300,.8,["255,226,150","150,225,255"]);
  // 遠方雲海
  for(let k=0;k<26;k++){const r=rng(500+k),x=-8+r()*28+lt*.25,y=-6+r()*24;v.box(x,y,-2.6+r()*.6,1.4+r()*2,1+r()*1.5,.5,"#e9f1f8",null,.75)}
  const items=[];
  // 浮島（下窄上寬）
  for(let lv=0;lv<4;lv++){const m=lv*.8;for(let x=m;x<7-m;x++)for(let y=m;y<7-m;y++)items.push([x+y-lv*3,()=>v.box(x,y,-lv*.8-.8,1,1,.8,lv?"#6b5d55":"#5aa957")])}
  // 山門
  const gx=4.6,gy=.6, glow=.5+.5*Math.sin(lt*2.2);
  items.push([gx+gy+3,()=>{v.box(gx,gy,0,.4,.4,3,"#9aa3ad");v.box(gx+2.2,gy,0,.4,.4,3,"#9aa3ad");v.box(gx-.4,gy-.1,3,3.4,.6,.4,"#6d7884");v.box(gx-.1,gy,2.5,2.8,.45,.28,"#c34a3a",`rgba(255,207,90,${.5+glow*.5})`)}]);
  // 宗門樓閣
  items.push([1.2+1.2+2,()=>{v.box(.6,.6,0,2.2,2.2,1.2,"#e6ddcf");v.box(.3,.3,1.2,2.8,2.8,.3,"#b9483c");v.box(.8,.8,1.5,1.8,1.8,.9,"#e6ddcf");v.box(.55,.55,2.4,2.3,2.3,.28,"#b9483c");v.box(1.5,1.5,2.68,.4,.4,.5,"#ffcf5a","rgba(255,230,150,.9)")}]);
  // 角色登場
  const ap=ease((lt-1.2)/1.2);
  if(ap>0){items.push([3+4.6+1,()=>avatar(v,3,4.6,(1-ap)*1.5,BLUE,{t:lt,bob:Math.sin(lt*2)*.03})]);
           items.push([4.5+4+1,()=>avatar(v,4.5,4,(1-ap)*1.5+.0,ORANGE,{t:lt+1,bob:Math.sin(lt*2+1)*.03})])}
  draw(items);
  // 符紋環
  g.save();g.globalCompositeOperation="lighter";for(let k=0;k<3;k++)v.ring(3.8,4.6,.02,1.2+k*.6+((lt*.4)%.6),`rgba(140,230,255,${.6-k*.15})`,.05);g.restore();
  // 下方城市與靈界回聲（後半段）
  const ec=ease((lt-4)/2);
  for(let k=0;k<14;k++){const r=rng(700+k),x=-2+k*.95,y=9+r()*1.5,h=1+r()*3;v.box(x,y,-4.5,.8,.8,h,"#5c6b7e");if(ec>0){v.box(x,y,-4.5+h,.8,.8,.05,"#8fe6ff",null,ec);g.save();g.globalCompositeOperation="lighter";v.ring(x+.4,y+.4,-4.5+h+((lt*.8+r())%1)*2.5,.5,`rgba(140,230,255,${ec*.5})`,.04);g.restore()}}
}

// ---------- 修行之路（10） ----------
const FOREST=(()=>{const R=rng(7),ground=[],trees=[];
  for(let x=0;x<18;x++)for(let y=0;y<14;y++){const path=Math.abs(y-x*.5-2)<1.05;ground.push([x,y,path?"#c9b48a":((x+y)%2?"#5fae5a":"#58a553")])}
  for(let i=0;i<34;i++){const x=Math.floor(R()*18),y=Math.floor(R()*14);if(Math.abs(y-x*.5-2)<2.4||(x>9&&x<15&&y>5&&y<12))continue;trees.push([x,y,2+Math.floor(R()*3)])}
  return {ground,trees}})();
function path(v,lt){
  const g=v.g;v.sky("#9fd0ee","#eaf5f8");
  const items=[];
  FOREST.ground.forEach(([x,y,c])=>items.push([x+y,()=>v.box(x,y,0,1,1,.4,c)]));
  FOREST.trees.forEach(([x,y,h])=>items.push([x+y+1,()=>{v.box(x+.35,y+.35,.4,.3,.3,h*.5,"#7a5131");for(let k=0;k<2;k++)v.box(x+.05+k*.1,y+.05+k*.1,.4+h*.5+k*.8,.9-k*.2,.9-k*.2,.8,k?"#3f9a52":"#2f8445")}]));
  // 打坐修行的夥伴
  items.push([12+7+1,()=>{avatar(v,12,7,.7+Math.sin(lt*1.5)*.08,ORANGE,{t:lt,sit:true})}]);
  // 機緣：發光羅盤
  const found=lt>7.6;
  if(!found)items.push([10.6+7.3+.5,()=>v.box(10.6,7.3,.4+.3+Math.sin(lt*3)*.1,.4,.4,.4,"#ffd76a","rgba(255,240,180,.95)")]);
  // 玩家沿步道走
  const wx=lerp(3,10,ease(lt/7.4)), wy=wx*.5+2-.3, moving=lt<7.4;
  items.push([wx+wy+.8,()=>avatar(v,wx,wy,.4,BLUE,{t:lt,bob:moving?Math.abs(Math.sin(lt*9))*.05:0,sw:moving?Math.sin(lt*9)*.22:0})]);
  draw(items);
  g.save();g.globalCompositeOperation="lighter";
  v.ring(12.4,7.4,.42,1+.15*Math.sin(lt*2),"rgba(255,190,90,.7)",.05);
  if(found){const u=ease((lt-7.6)/.8);v.ring(wx+.4,wy+.4,.42,u*3,`rgba(255,230,150,${1-u})`,.1)}
  g.restore();
  v.motes(lt,40,77,.5,["255,220,140","140,220,255"]);
}

// ---------- 對外介面 ----------
const SCENES={
  "08":{draw:(v,lt,L)=>{v.sky("#06121f","#0f2c4a");const z=ease(lt/L);v.cam(lerp(40,46,z),12.5,12.5,1,.5);island(v,lt,ease((lt-.6)/(L*.85)),0);v.motes(lt,50,11,.7,["255,226,150","150,225,255"])}},
  "09":{draw:(v,lt,L)=>{const u=ease(lt/L);v.cam(lerp(24,20,u),lerp(5,4.4,u),lerp(4,4.6,u),.2,.5);realm(v,lt)}},
  "10":{draw:(v,lt,L)=>{const u=ease(lt/L);v.cam(lerp(15,13,u),lerp(6,9,u),lerp(5,6.5,u),.8,.55);path(v,lt)}},
  "11":{draw:(v,lt,L)=>{v.sky("#040b16","#0c2238");const u=ease(lt/L);v.cam(lerp(44,66,u),lerp(12.5,17,u),lerp(12.5,8,u),0,.5);island(v,lt+8,1,ease((lt-1)/2));v.motes(lt,70,21,.6,["255,226,150","150,225,255"])}}
};
window.World={View,SCENES};
})();
