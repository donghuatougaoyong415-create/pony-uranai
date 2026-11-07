/* ちびポニ占い — 日付(日本時間)をシードにして、毎日決まった結果を自動生成します。
   サーバー・API不要。同じ日なら誰が見ても同じ結果になります。 */
(() => {
"use strict";

/* ---------- 乱数（日付シードで再現可能） ---------- */
function hash(str){ let h1=0xdeadbeef^str.length, h2=0x41c6ce57^str.length;
  for(let i=0;i<str.length;i++){const c=str.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677);}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);
  h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
  return (h2>>>0)*4096+(h1>>>0); }
function rng(seed){ let a=hash(seed)>>>0; return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}; }
const pick=(r,arr)=>arr[Math.floor(r()*arr.length)];
function shuffle(r,arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

/* ---------- データ ---------- */
const SIGNS=[
 {id:"aries",name:"おひつじ座",sym:"♈",from:[3,21],to:[4,19], pony:{name:"ルビー",coat:"#c96f43",mane:"#6b2d14",muzzle:"#f0c09c",kind:"栗毛",mane_style:"fluffy",mark:"blaze",trait:"元気いっぱいの先頭ランナー。走りだしたら止まらない"}},
 {id:"taurus",name:"おうし座",sym:"♉",from:[4,20],to:[5,20], pony:{name:"モカ",coat:"#93603f",mane:"#2e1a10",muzzle:"#d9b297",kind:"鹿毛",mane_style:"bangs",mark:"socks",trait:"おいしい草を見つける天才。マイペースな食いしんぼう"}},
 {id:"gemini",name:"ふたご座",sym:"♊",from:[5,21],to:[6,21], pony:{name:"ミント",coat:"#f7f0e7",mane:"#86d3bb",muzzle:"#fbdcd4",kind:"白毛",mane_style:"curly",mark:"none",trait:"好奇心旺盛でおしゃべり。新しいものに目がない"}},
 {id:"cancer",name:"かに座",sym:"♋",from:[6,22],to:[7,22], pony:{name:"ミルク",coat:"#fbefdc",mane:"#efc195",muzzle:"#f8d8cc",kind:"月毛",mane_style:"tuft",mark:"star",trait:"みんなのお母さん役。寄りそうのが得意"}},
 {id:"leo",name:"しし座",sym:"♌",from:[7,23],to:[8,22], pony:{name:"レオ",coat:"#e8a94f",mane:"#fff1c4",muzzle:"#f6d4a4",kind:"パロミノ",mane_style:"fluffy",mark:"star",trait:"自慢のたてがみが輝くリーダー。目立つのが大好き"}},
 {id:"virgo",name:"おとめ座",sym:"♍",from:[8,23],to:[9,22], pony:{name:"アイリス",coat:"#cfc6c3",mane:"#7f706c",muzzle:"#ecdcd5",kind:"連銭葦毛",mane_style:"bangs",mark:"dapple",trait:"きれい好きのしっかり者。毛並みはいつもピカピカ"}},
 {id:"libra",name:"てんびん座",sym:"♎",from:[9,23],to:[10,23], pony:{name:"ベル",coat:"#dcb08c",mane:"#fbeedd",muzzle:"#f2d2bc",kind:"河原毛",mane_style:"curly",mark:"socks",trait:"おしゃれで社交的。ケンカの仲裁もおまかせ"}},
 {id:"scorpio",name:"さそり座",sym:"♏",from:[10,24],to:[11,22], pony:{name:"ノワール",coat:"#3d3230",mane:"#151010",muzzle:"#76625c",kind:"青毛",mane_style:"tuft",mark:"star",dark:true,trait:"クールに見えて実は甘えんぼう。一度なついたら一途"}},
 {id:"sagittarius",name:"いて座",sym:"♐",from:[11,23],to:[12,21], pony:{name:"ソラ",coat:"#a06b45",mane:"#f4e6d6",muzzle:"#ddb79a",kind:"ピント",mane_style:"fluffy",mark:"pinto",trait:"冒険好きの旅ポニー。知らない道ほどわくわくする"}},
 {id:"capricorn",name:"やぎ座",sym:"♑",from:[12,22],to:[1,19], pony:{name:"ココア",coat:"#6e4b3a",mane:"#2a1a13",muzzle:"#bb9480",kind:"黒鹿毛",mane_style:"bangs",mark:"blaze",dark:true,trait:"こつこつ努力家。毎朝いちばんに起きる"}},
 {id:"aquarius",name:"みずがめ座",sym:"♒",from:[1,20],to:[2,18], pony:{name:"ルナ",coat:"#c3c3d0",mane:"#f6f4fc",muzzle:"#e2dbe4",kind:"アパルーサ",mane_style:"curly",mark:"spots",trait:"ちょっと不思議な発明家。星を見るのが趣味"}},
 {id:"pisces",name:"うお座",sym:"♓",from:[2,19],to:[3,20], pony:{name:"マシュ",coat:"#f6dfd5",mane:"#c39fdc",muzzle:"#fbe6df",kind:"佐目毛",mane_style:"tuft",mark:"none",trait:"夢見がちなやさしい子。泣いている子をほうっておけない"}},
];

const MSG={
 top:[
  "朝から追い風が吹いています。気になっていたことに、今日こそ手をつけてみて。",
  "あなたの笑顔がまわりを動かす日。小さなお願いごとも通りやすそうです。",
  "思いがけない場所でうれしい知らせが届きそう。スマホの通知はこまめにチェックを。",
  "直感がよく当たる日。迷ったら、最初に「いいな」と思ったほうを選んで正解です。",
  "がんばってきたことが目に見える形になりはじめます。自分をたくさんほめてあげて。",
  "人との縁が広がる日。久しぶりの相手に連絡すると、話が思わぬ方向に弾みます。",
  "やる気も体力も十分。少し背伸びした目標にも、軽い足取りで届きそうです。",
  "ツキがあなたに寄ってくる日。ちょっとした抽選やくじにも挑戦してみては。",
 ],
 mid:[
  "おだやかで過ごしやすい一日。いつもの習慣をていねいにこなすと運が安定します。",
  "午後から調子が上向きます。午前中は準備にあてて、本番は後半に。",
  "人の話をじっくり聞くと、ヒントが見つかる日。聞き役にまわるのが吉です。",
  "新しいことより、やりかけのことを片づけるのに向いています。すっきりすると運も開きます。",
  "小さなごほうびが元気の素に。帰り道に好きなおやつを買ってみて。",
  "マイペースが一番の味方。まわりのペースに合わせすぎないで大丈夫。",
  "整理整頓で運気アップ。カバンの中やデスクを少し片づけてみましょう。",
  "思いつきをメモしておくと、あとで役立ちます。アイデアの種がたくさん転がっている日。",
  "気分転換の散歩がラッキーアクション。外の空気が頭をすっきりさせてくれます。",
 ],
 low:[
  "少しお疲れぎみかも。今日は予定を詰めこまず、早めに休むのがいちばんの開運法。",
  "うっかりミスに注意。出かける前の持ち物チェックで、トラブルはぐっと減らせます。",
  "思いどおりに進まなくても、それは準備期間のサイン。焦らずのんびりいきましょう。",
  "言葉がきつく伝わりやすい日。いつもよりひと呼吸おいてから話すと安心です。",
  "無理は禁物。ポニーのように、ゆっくりでも一歩ずつ進めば大丈夫です。",
  "予定変更がありそう。代わりの案をひとつ用意しておくと気持ちが楽になります。",
  "お金の使いすぎに気をつけて。買う前に一晩おくと、本当に欲しいものが見えてきます。",
 ],
};
const RESCUE=["ラッキーアイテムを身につけると運気が回復します","寝る前に温かい飲み物を飲むと、明日の運気がアップします","誰かに「ありがとう」を伝えると流れが変わります","にんじん色のものを見ると元気が出ます"];
const PONY_TALK=["ブルルッ、今日もいっしょにがんばろうね！","ひづめの音も軽やかに、いってらっしゃい！","にんじんを食べて元気満タン！あなたもね。","たてがみ、ととのえておいたよ。準備ばっちり！","ちいさな一歩でも、ちゃんと前に進んでるよ。","ひなたぼっこしたら、いいこと思いついたよ。","しっぽをふりふり、応援してるからね。","休むのも大事なお仕事だよ。","今日のあなた、なんだかいい匂いがする！（干し草みたいな）","となりで草を食べながら見守ってるね。"];
const COLORS=[["ミルクティー","#d9b99b"],["にんじんオレンジ","#f08a3e"],["ひだまりイエロー","#f6c94b"],["わかくさグリーン","#8cc46b"],["そらいろ","#8ecbe8"],["ラベンダー","#b9a3dc"],["さくらピンク","#f4b3c2"],["チョコブラウン","#7a4f37"],["ホワイト","#ffffff"],["ネイビー","#2f3f6b"],["ミントグリーン","#9fdcc8"],["ワインレッド","#8c2f3a"],["シルバーグレー","#b8bcc4"],["コーラル","#f4876f"]];
const ITEMS=["にんじん柄のもの","角砂糖","蹄鉄モチーフのアクセサリー","ブラシ","ふわふわのマフラー","リボン","りんご","手帳","温かいお茶","ハンドクリーム","ポケットティッシュ","お気に入りのペン","麦わら色の小物","鈴のついたキーホルダー","チェック柄のハンカチ","はちみつ","星のシール","丸いクッキー","青いノート","スニーカー"];
const PLACES=["公園","カフェ","本屋","駅のホーム","パン屋","川沿いの道","図書館","花屋","コンビニ","ベランダ","雑貨屋","自分の部屋"];

/* ポニーのイラスト（img/星座id.webp） */
const ponyImg=(s,cls="")=>`<img class="pimg ${cls}" src="img/${s.id}.webp" alt="ミニチュアポニーの${s.pony.name}" width="480" height="384" loading="lazy" decoding="async">`;

/* ---------- 日付（日本時間） ---------- */
const jstToday=()=>new Date().toLocaleDateString("sv-SE",{timeZone:"Asia/Tokyo"});
function addDays(ymd,n){const d=new Date(ymd+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function fmt(ymd){const d=new Date(ymd+"T12:00:00Z");const w="日月火水木金土"[d.getUTCDay()];
  return `${d.getUTCFullYear()}年${d.getUTCMonth()+1}月${d.getUTCDate()}日（${w}）`;}
function signFromDate(m,d){return SIGNS.find(s=>{const [fm,fd]=s.from,[tm,td]=s.to;
  return fm<=tm ? (m>fm||m===fm&&d>=fd)&&(m<tm||m===tm&&d<=td) : (m>fm||m===fm&&d>=fd)||(m<tm||m===tm&&d<=td);});}

/* ---------- 運勢生成 ---------- */
function fortune(ymd){
  const order=shuffle(rng("rank:"+ymd),SIGNS);
  const mr=rng("msg:"+ymd), pools={top:shuffle(mr,MSG.top),mid:shuffle(mr,MSG.mid),low:shuffle(mr,MSG.low)}, used={top:0,mid:0,low:0};
  const results=order.map((s,i)=>{
    const rank=i+1, r=rng(ymd+":"+s.id);
    const tier=rank<=3?"top":rank<=8?"mid":"low";
    const base=rank<=3?4:rank<=6?3.4:rank<=9?2.8:2.2;
    const sc=()=>Math.max(1,Math.min(5,Math.round(base+(r()*2-1))));
    const scores={love:sc(),work:sc(),money:sc(),health:sc()};
    const total=Math.max(1,Math.min(5,Math.round(6-rank*0.42)));
    return {rank,sign:s,tier,scores,total,
      msg:pools[tier][used[tier]++],
      rescue:rank>=11?pick(r,RESCUE):null,
      color:pick(r,COLORS),item:pick(r,ITEMS),place:pick(r,PLACES),
      num:1+Math.floor(r()*9),
      time:`${String(6+Math.floor(r()*16)).padStart(2,"0")}:00`,
      talk:pick(r,PONY_TALK)};
  });
  const dayR=rng("day:"+ymd);
  return {results,dayPony:pick(dayR,SIGNS)};
}

/* ---------- 表示 ---------- */
const $=id=>document.getElementById(id);
const stars=n=>`<span class="stars" aria-label="5段階中${n}">${"★".repeat(n)}<span class="off">${"★".repeat(5-n)}</span></span>`;
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
let mySign=store.get("ponyuranai:sign");
const today=jstToday();
let current=today;
const qd=new URLSearchParams(location.search).get("d");
if(qd&&/^\d{4}-\d{2}-\d{2}$/.test(qd)&&qd<=today) current=qd;
const MIN=addDays(today,-30);
let data;

function render(){
  data=fortune(current);
  $("dateLabel").textContent=fmt(current)+(current===today?"":"");
  $("prevDay").disabled=current<=MIN;
  $("nextDay").disabled=current>=today;
  $("rankTitle").textContent=(current===today?"今日":fmt(current).replace(/^\d+年/,""))+"の12星座ランキング";
  const dp=data.dayPony.pony;
  $("dayPony").innerHTML=`<div class="pv">${ponyImg(data.dayPony)}</div>
   <div><span class="tag">${current===today?"今日":"この日"}の当番ポニー</span>
   <h2>${dp.name}（${dp.kind}）</h2><p class="trait">${dp.trait}</p><p>「${pick(rng("dp:"+current),PONY_TALK)}」</p></div>`;
  $("ranking").innerHTML=data.results.map(x=>`<li class="rank-item${x.sign.id===mySign?" me":""}">
   <button data-id="${x.sign.id}" aria-label="${x.rank}位 ${x.sign.name}の詳細を見る">
    <span class="rk">${x.rank}<small>位</small></span>
    <span class="pv">${ponyImg(x.sign)}</span>
    <span><span class="sign"><span class="sym">${x.sign.sym}</span>${x.sign.name}${x.sign.id===mySign?'<span class="me-badge">あなた</span>':""}</span>
    <span class="one">${x.msg.split("。")[0]}。</span></span>
    <span class="total">${stars(x.total)}</span>
   </button></li>`).join("");
}

function openDetail(id){
  const x=data.results.find(r=>r.sign.id===id); if(!x) return;
  mySign=id; store.set("ponyuranai:sign",id);
  const p=x.sign.pony;
  const shareText=`${fmt(current)}の${x.sign.name}は${x.rank}位！ラッキーアイテムは「${x.item}」🐴 #ちびポニ占い`;
  const url=location.origin+location.pathname+(current===today?"":"?d="+current);
  $("detailBody").innerHTML=`<div class="d-head"><div class="pv">${ponyImg(x.sign)}</div>
   <div><p class="d-rank">${x.rank}位 / 12</p><h3 id="dTitle">${x.sign.sym} ${x.sign.name}</h3>
   <p class="pname">担当：${p.name}（${p.kind}）</p>${stars(x.total)}</div></div>
   <div class="d-msg"><p>${x.msg}${x.rescue?`<br><b>おまじない：</b>${x.rescue}`:""}</p></div>
   <ul class="scores"><li>恋愛運 ${stars(x.scores.love)}</li><li>仕事運 ${stars(x.scores.work)}</li>
   <li>金運 ${stars(x.scores.money)}</li><li>健康運 ${stars(x.scores.health)}</li></ul>
   <dl class="lucky"><dt>ラッキーカラー</dt><dd><span class="swatch" style="background:${x.color[1]}"></span>${x.color[0]}</dd>
   <dt>ラッキーアイテム</dt><dd>${x.item}</dd><dt>ラッキースポット</dt><dd>${x.place}</dd>
   <dt>ラッキーナンバー</dt><dd>${x.num}</dd><dt>ラッキータイム</dt><dd>${x.time}ごろ</dd></dl>
   <div class="ponytalk"><b>${p.name}：</b><span>「${x.talk}」</span></div>
   <a class="share" target="_blank" rel="noopener" href="https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}">Xでシェアする</a>`;
  $("detail").showModal();
  render();
}

$("ranking").addEventListener("click",e=>{const b=e.target.closest("button[data-id]");if(b)openDetail(b.dataset.id);});
$("closeDetail").addEventListener("click",()=>$("detail").close());
$("detail").addEventListener("click",e=>{if(e.target===$("detail"))$("detail").close();});
$("prevDay").addEventListener("click",()=>{current=addDays(current,-1);sync();});
$("nextDay").addEventListener("click",()=>{current=addDays(current,1);sync();});
$("birthday").addEventListener("change",e=>{const v=e.target.value;if(!v)return;
  const [,m,d]=v.split("-").map(Number);const s=signFromDate(m,d);if(s)openDetail(s.id);});
function sync(){history.replaceState(null,"",current===today?location.pathname:"?d="+current);render();}

const top1=fortune(today).results[0].sign;
$("heroPony").innerHTML=ponyImg(top1).replace('loading="lazy"','fetchpriority="high"')+`<span class="hero-badge">今日の1位　${top1.pony.name}</span>`;
$("gallery").innerHTML=SIGNS.map((s,i)=>`<li><div class="pv">${ponyImg(s)}</div>
  <b>${s.pony.name}</b><span class="gk">${s.sym}${s.name}・${s.pony.kind}</span><span class="gt">${s.pony.trait}</span></li>`).join("");
$("year").textContent=today.slice(0,4);
render();

/* 日付が変わったら自動で更新（開きっぱなし対策） */
setInterval(()=>{const t=jstToday();if(t!==today)location.href=location.pathname;},60000);

window.__pony={fortune,signFromDate,SIGNS};
})();
