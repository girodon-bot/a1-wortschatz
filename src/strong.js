/* ---------- Сильные глаголы · Präsens ---------- */
const STRONG = /*STRONG*/[];
const PERS=["ich","du","er","wir","ihr","sie"];
const PLBL={ich:"ich",du:"du",er:"er / sie / es",wir:"wir",ihr:"ihr",sie:"sie / Sie"};
const PRU={ich:"я",du:"ты",er:"он / она / оно",wir:"мы",ihr:"вы",sie:"они / Вы"};
/* лица, где меняется основа (обычно du и er; у wissen ещё ich); отделяемая приставка */
for(const v of STRONG){v.core=PERS.filter(p=>v.f[p].includes("["));const m=v.f.ich.match(/ (\S+)$/);v.sep=m?m[1]:""}
const isCore=(v,p)=>v.core.includes(p);
const coreLbl=v=>{const l=v.core.map(p=>PLBL[p].replace(/ /g,""));return l.length>1?l.slice(0,-1).join(", ")+" и "+l[l.length-1]:l[0]};
const SVBY=Object.fromEntries(STRONG.map(v=>[v.v,v]));
const plainF=f=>f.replace(/[\[\]]/g,"");
const mainF=f=>plainF(f).split(" ")[0];
const hlF=f=>esc(f).replace(/\[(.+?)\]/g,'<span class="svch">$1</span>');
const svId=(v,p)=>`sv|${v.v}|${p}`;
const spkP=p=>p==="er"?"er":p==="sie"?"sie":p;
const SVW={};
function svWord(v,p){const id=svId(v,p);return SVW[id]||(SVW[id]={id,de:`${spkP(p)} ${plainF(v.f[p])}`,ru:`${PRU[p]} · ${v.ru}`,sv:true})}
const getW=id=>BYID[id]||SVW[id]||(id.startsWith("sv|")?(()=>{const[,vv,pp]=id.split("|");return SVBY[vv]?svWord(SVBY[vv],pp):null})():null);
const sibStem=v=>/(s|ss|ß)en$/.test(v.v)&&v.v!=="wissen";
/* форма «как у слабого глагола» — типичная ошибка */
function svRegular(v,p){
  const base=v.sep?v.v.slice(v.sep.length):v.v;
  const stem=base.replace(/e?n$/,"");
  const sib=/(s|ss|ß|z|x)$/.test(stem), ep=/[td]$/.test(stem);
  const f=stem+{ich:"e",du:sib?"t":ep?"est":"st",er:ep?"et":"t",wir:"en",ihr:ep?"et":"t",sie:"en"}[p];
  return v.sep?f+" "+v.sep:f;
}
function svNorm(s){return norm(s).replace(/^(ich|du|er|sie|es|wir|ihr|man)\s+/,"")}
/* part=true — сравниваем только спрягаемую часть (в предложении приставка уже стоит) */
function svCheck(v,p,input,{part=false}={}){
  const F=f=>norm(part?mainF(f):plainF(f));
  const n=svNorm(input);const want=F(v.f[p]);
  if(!n)return{g:1,msg:"Пустой ответ"};
  if(n===want)return{g:3,msg:""};
  if(!part&&v.sep&&n===norm(mainF(v.f[p])))return{g:2,msg:`Не забудь приставку: ${plainF(v.f[p])}`};
  const reg=part?norm(svRegular(v,p).split(" ")[0]):norm(svRegular(v,p));
  if(isCore(v,p)&&n===reg)return{g:1,msg:`Сильный глагол: в ${coreLbl(v)} основа меняется (${v.ch})`};
  if(!isCore(v,p)&&v.core.some(q=>n===F(v.f[q])))return{g:1,msg:`Изменение основы — только в ${coreLbl(v)}`};
  for(const q of PERS)if(q!==p&&n===F(v.f[q]))return{g:1,msg:`Это форма для «${PLBL[q]}». Окончания: du -st, er/sie/es -t, ihr -t`};
  return{g:1,msg:""};
}
function svLevel(v){ /* общий уровень глагола = худший из du и er */
  const order=["new","learn","firm","known"];
  return order[Math.min(...["du","er"].map(p=>order.indexOf(level(svId(v,p)))))];
}
function svStats(verbs){
  const now=Date.now();const c={new:0,learn:0,firm:0,known:0,due:0};
  for(const v of verbs){c[svLevel(v)]++;for(const p of PERS)if(isDue(svId(v,p),now))c.due++}
  return c;
}
function svTable(v,cur){
  return `<table class="svt"><tbody>${PERS.map(p=>`<tr class="${isCore(v,p)?"core":""}${p===cur?" cur":""}" data-svsay="${esc(spkP(p)+" "+plainF(v.f[p]))}"><td class="svpn">${PLBL[p]}</td><td class="svf">${hlF(v.f[p])}</td></tr>`).join("")}</tbody></table>`;
}
function bindSvSay(){$app.querySelectorAll("[data-svsay]").forEach(r=>r.onclick=()=>speak(r.dataset.svsay))}
function svSent(v,p,{gap=false}={}){
  const s=v.s[p];if(!s)return"";
  const de0=gap?esc(s[0]).replace(/\[(.+?)\]/,()=>`<span class="gap">______</span>`):esc(s[0]).replace(/\[(.+?)\]/,"<mark>$1</mark>");
  const de=de0.replace(/\{(.+?)\}/g,'<mark><span class="sep">$1</span></mark>');
  return gap?`<div class="cloze">${de}</div>`:`<div class="exwrap"><div class="exs">${de}</div><div class="exr">${esc(s[1])}</div></div>`;
}
const SV_RULES=[["e → i","geben","g[i]bt"],["e → ie","sehen","s[ie]ht"],["a → ä","fahren","f[ä]hrt"],["au → äu","laufen","l[äu]ft"],["особые","werden","w[ir]d · wissen → ich [weiß]"],["с приставкой","anfangen","du f[ä]ngst an"]];

/* ---------- экраны ---------- */
function renderStrong(){
  const st=svStats(STRONG),total=STRONG.length;
  const newV=STRONG.filter(v=>svLevel(v)==="new").length;
  const sub=(st.due?`${st.due} к повторению · `:"")+(newV?`${Math.min(3,newV)} новых глагола`:"всё изучено — повторяем");
  $app.innerHTML=`<header class="top"><button class="iconbtn" id="bBack" aria-label="Назад">${ICON.back}</button><div style="flex:1;min-width:0"><div class="label">Тренажёр</div><h2>Сильные глаголы · Präsens</h2></div></header>
  <section class="panel" style="display:flex;flex-direction:column;gap:10px">
    <div>В <b>du</b> и <b>er/sie/es</b> меняется гласная основы. Остальные формы — как у обычных глаголов. Исключение — wissen: меняется и ich.</div>
    <div class="svrules">${SV_RULES.map(([r,inf,f])=>`<div class="svrule"><b>${r}</b><span>${inf} → ${hlF(f)}</span></div>`).join("")}</div>
  </section>
  <section class="panel" style="display:flex;flex-direction:column;gap:8px">
    <div class="setrow"><span class="label">Освоено глаголов</span><b class="num">${st.firm+st.known} / ${total}</b></div>
    ${barHTML(st,total)}
    <div class="legend"><span style="--c:var(--lv-known)">выучено ${st.known}</span><span style="--c:var(--lv-firm)">закрепляю ${st.firm}</span><span style="--c:var(--lv-learn)">учу ${st.learn}</span><span style="--c:var(--lv-new)">новые ${st.new}</span></div>
  </section>
  <button class="primary" id="bSvGo"><div><b>Тренировать</b><span>${sub}</span></div>${ICON.play}</button>
  <button class="mode" id="bSvTables"><b>Заполнить таблицы</b><span>Все 6 форм глагола по памяти</span></button>
  <div class="label">Глаголы</div>
  <div class="secs">${STRONG.map(v=>{const lv=svLevel(v);const due=PERS.filter(p=>isDue(svId(v,p),Date.now())).length;
    const lc={new:0,learn:0,firm:0,known:0};PERS.forEach(p=>lc[level(svId(v,p))]++);
    return `<button class="sec" data-sv="${esc(v.v)}"><div class="t"><b>${esc(v.v)} <span class="svchip">${esc(v.ch)}</span></b><small style="font-style:normal">${esc(v.ru)} · du ${hlF(v.f.du)} · er ${hlF(v.f.er)}</small></div>
    <div class="r">${LV_RU[lv]}${due?`<br><span class="due">${due} повт.</span>`:""}</div>${barHTML(lc,6)}</button>`}).join("")}</div>`;
  $app.querySelector("#bBack").onclick=renderHome;
  $app.querySelector("#bSvGo").onclick=()=>startStrong();
  $app.querySelector("#bSvTables").onclick=()=>startStrongTables();
  $app.querySelectorAll("[data-sv]").forEach(b=>b.onclick=()=>renderVerb(SVBY[b.dataset.sv]));
  window.scrollTo(0,0);
}
function renderVerb(v){
  $app.innerHTML=`<header class="top"><button class="iconbtn" id="bBack" aria-label="Назад">${ICON.back}</button><div style="flex:1;min-width:0"><div class="label">Сильный глагол · ${esc(v.ch)}</div><h2>${esc(v.v)} — ${esc(v.ru)}</h2></div></header>
  <section class="panel">${svTable(v)}<div class="note" style="margin-top:8px">Нажмите на строку, чтобы услышать форму.${sibStem(v)?" Основа на -s: в du окончание -t, поэтому du и er совпадают.":""}</div></section>
  <button class="primary" id="bSvOne"><div><b>Тренировать этот глагол</b><span>все 6 форм, упор на du и er</span></div>${ICON.play}</button>
  <div class="label">Примеры</div>
  <section class="panel" style="display:flex;flex-direction:column;gap:12px">${PERS.map(p=>`<div><div class="label" style="margin-bottom:2px">${PLBL[p]}</div>${svSent(v,p)}</div>`).join("")}</section>`;
  $app.querySelector("#bBack").onclick=renderStrong;
  $app.querySelector("#bSvOne").onclick=()=>startStrong([v]);
  bindSvSay();window.scrollTo(0,0);
}

/* ---------- сессия ---------- */
function svTypeFor(v,p){
  const c=state.cards[svId(v,p)];
  if(!c||!c.reps||c.s<1)return"svChoice";
  if(c.s<4)return Math.random()<.7?"svType":"svChoice";
  return Math.random()<.5?"svCloze":"svType";
}
const svItem=(v,p,t)=>({t:t||svTypeFor(v,p),v,p,w:svWord(v,p)});
function startStrong(verbs){
  const single=verbs&&verbs.length===1;verbs=verbs||STRONG;
  const now=Date.now(),n=Math.max(12,state.settings.sessionLen);
  S={mode:"strong",svVerbs:verbs.map(v=>v.v),queue:[],done:0,total:0,right:0,wrongIds:new Set(),started:now};
  const seen=v=>{const c=state.cards[svId(v,"du")];return c&&c.reps};
  let head=[],mid=[],tail=[];
  if(single){
    const v=verbs[0];
    if(!seen(v))head.push({t:"svIntro",v,w:svWord(v,"du")});
    for(const p of shuffle(PERS))mid.push(svItem(v,p,seen(v)?undefined:"svChoice"));
    tail.push(svItem(v,"du",seen(v)?"svCloze":"svType"),svItem(v,"er",seen(v)?"svCloze":"svType"),{t:"svTable",v,w:svWord(v,"du")});
  }else{
    const all=[];for(const v of verbs)for(const p of PERS)all.push([v,p]);
    const due=all.filter(([v,p])=>isDue(svId(v,p),now)).sort((a,b)=>state.cards[svId(...a)].due-state.cards[svId(...b)].due);
    mid=due.slice(0,n).map(([v,p])=>svItem(v,p));
    const newV=verbs.filter(v=>!seen(v)).slice(0,3);
    for(const v of newV){
      const other=shuffle(["ich","wir","ihr","sie"])[0];
      head.push({t:"svIntro",v,w:svWord(v,"du")},svItem(v,"du","svChoice"),svItem(v,"er","svChoice"),svItem(v,other,"svChoice"));
      tail.push(svItem(v,"du","svType"),svItem(v,"er","svType"));
    }
    const room=n-head.length-mid.length-tail.length;
    if(room>0){
      const inQ=new Set(mid.map(i=>i.w.id));
      const rest=all.filter(([v,p])=>seen(v)&&!inQ.has(svId(v,p))&&!newV.includes(v))
        .map(([v,p])=>({v,p,r:retrNow(svId(v,p))-(isCore(v,p)?.25:0)})).sort((a,b)=>a.r-b.r);
      mid.push(...rest.slice(0,room).map(({v,p})=>svItem(v,p)));
    }
    const tab=verbs.filter(v=>seen(v)&&!newV.includes(v)&&(state.cards[svId(v,"du")].s||0)>=2);
    if(tab.length&&Math.random()<.6)mid.push({t:"svTable",v:shuffle(tab)[0],w:svWord(tab[0],"du")});
  }
  S.queue=[...head,...shuffle(mid),...shuffle(tail)];
  if(!S.queue.length){toast("Сейчас нечего повторять. Загляните позже");return}
  S.total=S.queue.length;next();
}
function startStrongTables(){
  const seenV=STRONG.filter(v=>{const c=state.cards[svId(v,"du")];return c&&c.reps});
  const pool=shuffle(seenV.length>=3?seenV:STRONG).slice(0,6);
  S={mode:"strongTables",svVerbs:pool.map(v=>v.v),queue:pool.map(v=>({t:"svTable",v,w:svWord(v,"du")})),done:0,total:pool.length,right:0,wrongIds:new Set(),started:Date.now()};
  next();
}
function svPrompt(v,p){
  return `<div class="svq"><span class="svpn2">${PLBL[p]}</span><span class="svinf">${esc(v.v)}</span></div><div class="hint">${PRU[p]} · ${esc(v.ru)}</div>`;
}
function svFeedback(res,v,p){
  const cls=res.g===3?"ok":res.g===2?"mid":"bad";
  const vv=res.g===3?"Верно":res.g===2?"Почти":"Неверно";
  return `<div class="fb ${cls}" role="status"><div class="v">${vv}${res.msg?" · "+esc(res.msg):""}</div>
  <div style="display:flex;align-items:center;gap:10px;justify-content:space-between"><div class="ans"><span class="svpn2">${PLBL[p]}</span> ${hlF(v.f[p])}</div><button class="speak" data-speak aria-label="Произнести">${ICON.sound}</button></div>
  ${svSent(v,p)}${svTable(v,p)}</div><button class="btn main wide" id="bNext">Дальше</button>`;
}
function bindSvFeedback(v,p){
  const b=$app.querySelector("#bNext");b.focus({preventScroll:true});b.onclick=next;
  const say=()=>speak(spkP(p)+" "+plainF(v.f[p]));
  $app.querySelectorAll("[data-speak]").forEach(x=>x.onclick=say);bindSvSay();
  if(state.settings.autoAudio)say();
}
function svIntro(it){
  const v=it.v;
  shell(`<div class="panel" style="display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><div class="prompt">${esc(v.v)}</div><div style="font-size:19px;font-weight:600">${esc(v.ru)}</div></div><span class="svchip big">${esc(v.ch)}</span></div>
    ${svTable(v)}
    <div class="note">Основа меняется только в <b>${coreLbl(v)}</b> (выделены), остальные формы — как у обычных глаголов.${sibStem(v)?" Основа на -s: du и er совпадают.":""}${v.v==="werden"?" Запомните: du wirst, er wird — без -t в конце.":""}${v.v==="halten"?" er hält — без окончания -t (основа уже на t); ihr haltet.":""}${v.sep?` Отделяемая приставка «${v.sep}» уходит в конец: du ${plainF(v.f.du)}.`:""} Нажмите на строку, чтобы услышать.</div>
  </div><button class="btn main wide" id="bNext">Понятно, тренировать</button>`);
  bindSvSay();
  if(state.settings.autoAudio)speak(v.core.map(p=>`${spkP(p)} ${plainF(v.f[p])}`).join(". "));
  const b=$app.querySelector("#bNext");b.focus();b.onclick=()=>{S.done++;next()};
}
function svChoice(it){
  const {v,p}=it;const want=plainF(v.f[p]);
  const c=new Set([want]);
  const cand=[svRegular(v,p),...(isCore(v,p)?[plainF(v.f[p==="du"?"er":"du"]),plainF(v.f.ihr)]:v.core.map(q=>plainF(v.f[q]))),...shuffle(PERS.map(q=>plainF(v.f[q])))];
  for(const x of cand){if(c.size>=4)break;c.add(x)}
  const opts=shuffle([...c]);
  shell(`${svPrompt(v,p)}<div class="choices">${opts.map((o,i)=>`<button class="choice svopt" data-i="${i}">${esc(o)}</button>`).join("")}</div><div id="fb"></div>`);
  const btns=$app.querySelectorAll(".choice");
  btns.forEach(b=>b.onclick=()=>{const o=opts[+b.dataset.i];const res=o===want?{g:3,msg:""}:svCheck(v,p,o);
    btns.forEach(x=>{x.disabled=true;if(opts[+x.dataset.i]===want)x.classList.add("ok")});if(res.g<3)b.classList.add("bad");
    grade(res.g);$app.querySelector("#fb").innerHTML=svFeedback(res,v,p);bindSvFeedback(v,p)});
}
function svInputEx(it,promptHTML,opt={}){
  const {v,p}=it;
  shell(`${promptHTML}<form class="field" id="f"><input class="inp" id="inp" ${INP_ATTR} lang="de" placeholder="Форма глагола" aria-label="Ответ">${umlautBar()}
  <div class="row"><button class="btn" type="button" id="bSkip">Не знаю</button><button class="btn main" type="submit">Проверить</button></div></form><div id="fb"></div>`);
  const inp=$app.querySelector("#inp"),f=$app.querySelector("#f");inp.focus();bindUmlauts(inp);
  const finish=res=>{const typed=inp.value.trim();f.remove();grade(res.g);
    $app.querySelector("#fb").innerHTML=`<div class="mine ${res.g===3?"ok":res.g===2?"mid":"bad"}"><span class="label">Твой ответ</span><span class="mytxt">${typed?(res.g<3?diffHTML(typed.replace(/^(ich|du|er|sie|es|wir|ihr|man)\s+/i,""),opt.part?mainF(v.f[p]):plainF(v.f[p])):esc(typed)):"—"}</span></div>`+svFeedback(res,v,p);
    bindSvFeedback(v,p)};
  f.onsubmit=e=>{e.preventDefault();if(!inp.value.trim())return inp.focus();finish(svCheck(v,p,inp.value,opt))};
  $app.querySelector("#bSkip").onclick=()=>finish({g:1,msg:"Ничего, повторим"});
}
function svType(it){svInputEx(it,svPrompt(it.v,it.p))}
function svCloze(it){const {v,p}=it;svInputEx(it,`${svSent(v,p,{gap:true})}<div class="hint">${esc(v.v)} · ${esc(v.ru)} · лицо: ${PLBL[p]}</div>`,{part:true})}
function svTableEx(it){
  const v=it.v;
  shell(`<div class="svq"><span class="svinf">${esc(v.v)}</span></div><div class="hint">${esc(v.ru)} · заполни все формы Präsens</div>
  <form id="f" class="field"><table class="svt"><tbody>${PERS.map(p=>`<tr class="${isCore(v,p)?"core":""}"><td class="svpn">${PLBL[p]}</td><td><input class="inp svin" data-p="${p}" ${INP_ATTR} lang="de" aria-label="${PLBL[p]}"></td></tr>`).join("")}</tbody></table>${umlautBar()}
  <button class="btn main wide" type="submit">Проверить</button></form><div id="fb"></div>`);
  const ins=[...$app.querySelectorAll(".svin")];ins[0].focus();
  let last=ins[0];ins.forEach(i=>i.onfocus=()=>last=i);
  $app.querySelectorAll("[data-u]").forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=()=>{const i=last;const s=i.selectionStart??i.value.length;i.value=i.value.slice(0,s)+b.dataset.u+i.value.slice(i.selectionEnd??s);i.focus();i.setSelectionRange(s+1,s+1)}});
  ins.forEach((i,k)=>i.onkeydown=e=>{if(e.key==="Enter"&&k<ins.length-1){e.preventDefault();ins[k+1].focus()}});
  $app.querySelector("#f").onsubmit=e=>{e.preventDefault();
    let ok=0;const msgs=[];
    for(const i of ins){const p=i.dataset.p;const r=svCheck(v,p,i.value);i.disabled=true;i.classList.add(r.g===3?"svok":"svbad");
      review(svId(v,p),r.g===3?3:1);
      if(r.g===3)ok++;else{S.wrongIds.add(svId(v,p));msgs.push(`${PLBL[p]}: ${plainF(v.f[p])}`);S.queue.splice(Math.min(S.queue.length,2),0,svItem(v,p,"svType"));S.total++}}
    S.done++;if(ok===6)S.right++;
    $app.querySelector("#f").querySelector("button[type=submit]").remove();$app.querySelector(".umls").remove();
    $app.querySelector("#fb").innerHTML=`<div class="fb ${ok===6?"ok":ok>=4?"mid":"bad"}"><div class="v">${ok} из 6 верно</div>${msgs.length?`<div>Правильно: ${msgs.map(esc).join(" · ")}</div>`:""}${svTable(v)}</div><button class="btn main wide" id="bNext">Дальше</button>`;
    const b=$app.querySelector("#bNext");b.focus({preventScroll:true});b.onclick=next;bindSvSay();
  };
}
const SVR={svIntro,svChoice,svType,svCloze,svTable:svTableEx};
