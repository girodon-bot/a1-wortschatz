/* ---------- Модальные глаголы · Präsens ---------- */
const MODAL = /*MODAL*/[];
/* у всех модальных особые формы в единственном числе (ich, du, er), в ich и er нет окончания */
for(const v of MODAL){v.core=["ich","du","er"];v.sep=""}
const MDBY=Object.fromEntries(MODAL.map(v=>[v.v,v]));
const mdId=(v,p)=>`md|${v.v}|${p}`;
const MDW={};
function mdWord(v,p){const id=mdId(v,p);return MDW[id]||(MDW[id]={id,de:`${spkP(p)} ${plainF(v.f[p])}`,ru:`${PRU[p]} · ${v.ru}`,md:true})}
const mdGetW=id=>{const[,vv,pp]=id.split("|");return MDBY[vv]?mdWord(MDBY[vv],pp):null};
const mdHasInf=v=>Object.values(v.s).some(s=>s[0].includes("{"));
/* типичные ошибки: окончание как у обычного глагола, гласная из инфинитива */
function mdWrongForms(v,p){
  const inf=v.v.replace(/en$/,""), f=plainF(v.f[p]), out=new Set();
  if(p==="ich"){out.add(f+"e");out.add(inf+"e")}
  if(p==="er"){out.add(f+"t");out.add(inf+"t")}
  if(p==="du"){out.add(inf+"st")}
  if(p==="ihr"&&v.v!=="möchten")out.add(f.replace(/t$/,"")+"et");
  if(v.v==="möchten"&&p==="er")out.add("möchtet");
  out.delete(f);return[...out].filter(x=>x&&x!==f);
}
function mdCheck(v,p,input){
  const n=svNorm(input),want=norm(plainF(v.f[p]));
  if(!n)return{g:1,msg:"Пустой ответ"};
  if(n===want)return{g:3,msg:""};
  const inf=norm(v.v.replace(/en$/,""));
  if((p==="ich"||p==="er")&&(n===want+"e"||n===want+"t"||n===inf+"e"||n===inf+"t"))
    return{g:1,msg:`У модальных глаголов в ich и er/sie/es нет окончания: ich ${plainF(v.f.ich)}, er ${plainF(v.f.er)}`};
  if(["ich","du","er"].includes(p)&&n.startsWith(inf)&&v.ch.includes("→"))return{g:1,msg:`В ich, du и er/sie/es гласная меняется: ${v.ch}`};
  if(["wir","ihr","sie"].includes(p)&&v.ch.includes("→")&&["ich","du","er"].some(q=>n.startsWith(norm(plainF(v.f[q])).slice(0,3))))return{g:1,msg:`Во множественном числе гласная как в инфинитиве: ${v.v}`};
  for(const q of PERS)if(q!==p&&n===norm(plainF(v.f[q])))return{g:1,msg:`Это форма для «${PLBL[q]}»`};
  for(const m of MODAL)if(m!==v&&n===norm(plainF(m.f[p])))return{g:1,msg:`Это ${m.v} — ${m.ru}`};
  if(lev(n,want)===1&&want.length>=6)return{g:2,msg:"опечатка"};
  return{g:1,msg:""};
}
function mdLevel(v){const order=["new","learn","firm","known"];
  return order[Math.min(...["ich","du","er"].map(p=>order.indexOf(level(mdId(v,p)))))]}
function mdStats(verbs){const now=Date.now();const c={new:0,learn:0,firm:0,known:0,due:0};
  for(const v of verbs){c[mdLevel(v)]++;for(const p of PERS)if(isDue(mdId(v,p),now))c.due++}return c}
/* предложение: [форма] — позиция 2, {глагол} — в конце */
function mdSent(v,p,{gap=false,tr=true}={}){
  const s=v.s[p];
  const de=esc(s[0]).replace(/\[(.+?)\]/,(m,t)=>gap?`<span class="gap">______</span>`:`<mark>${t}</mark>`).replace(/\{(.+?)\}/g,'<mark class="mdinf">$1</mark>');
  return gap?`<div class="cloze">${de}</div>`:`<div class="exwrap"><div class="exs">${de}</div>${tr?`<div class="exr">${esc(s[1])}</div>`:""}</div>`;
}
const mdPlainS=s=>s.replace(/[\[\]{}]/g,"");

/* ---------- экраны ---------- */
function renderModal(){
  const st=mdStats(MODAL),total=MODAL.length;
  const newV=MODAL.filter(v=>mdLevel(v)==="new").length;
  const sub=(st.due?`${st.due} к повторению · `:"")+(newV?`${Math.min(2,newV)} новых глагола`:"всё изучено — повторяем");
  $app.innerHTML=`<header class="top"><button class="iconbtn" id="bBack" aria-label="Назад">${ICON.back}</button><div style="flex:1;min-width:0"><div class="label">Тренажёр</div><h2>Модальные глаголы · Präsens</h2></div></header>
  <section class="panel" style="display:flex;flex-direction:column;gap:10px">
    <div><b>Рамка предложения:</b> модальный глагол стоит на 2-м месте, второй глагол — в самом конце в начальной форме.</div>
    <div class="exwrap"><div class="exs">Ich <mark>kann</mark> heute nicht <mark class="mdinf">kommen</mark>.</div><div class="exr">Я не могу сегодня прийти.</div></div>
    <div class="note">В <b>ich</b> и <b>er/sie/es</b> нет окончания: ich kann, er kann. В единственном числе гласная меняется: können → kann, müssen → muss, wollen → will, dürfen → darf.</div>
  </section>
  <section class="panel" style="display:flex;flex-direction:column;gap:8px">
    <div class="setrow"><span class="label">Освоено глаголов</span><b class="num">${st.firm+st.known} / ${total}</b></div>
    ${barHTML(st,total)}
    <div class="legend"><span style="--c:var(--lv-known)">выучено ${st.known}</span><span style="--c:var(--lv-firm)">закрепляю ${st.firm}</span><span style="--c:var(--lv-learn)">учу ${st.learn}</span><span style="--c:var(--lv-new)">новые ${st.new}</span></div>
  </section>
  <button class="primary" id="bMdGo"><div><b>Тренировать</b><span>${sub}</span></div>${ICON.play}</button>
  <button class="mode" id="bMdMean"><b>Какой глагол по смыслу?</b><span>можно или могу, надо или следует, хочу или хотел бы</span></button>
  <div class="label">Глаголы</div>
  <div class="secs">${MODAL.map(v=>{const lv=mdLevel(v);const due=PERS.filter(p=>isDue(mdId(v,p),Date.now())).length;
    const lc={new:0,learn:0,firm:0,known:0};PERS.forEach(p=>lc[level(mdId(v,p))]++);
    return `<button class="sec" data-md="${esc(v.v)}"><div class="t"><b>${esc(v.v)} <span class="svchip">${esc(v.ch)}</span></b><small style="font-style:normal">${esc(v.ru)} · ich ${hlF(v.f.ich)} · du ${hlF(v.f.du)} · er ${hlF(v.f.er)}</small></div>
    <div class="r">${LV_RU[lv]}${due?`<br><span class="due">${due} повт.</span>`:""}</div>${barHTML(lc,6)}</button>`}).join("")}</div>`;
  $app.querySelector("#bBack").onclick=renderHome;
  $app.querySelector("#bMdGo").onclick=()=>startModal();
  $app.querySelector("#bMdMean").onclick=()=>startModalMeaning();
  $app.querySelectorAll("[data-md]").forEach(b=>b.onclick=()=>renderModalVerb(MDBY[b.dataset.md]));
  window.scrollTo(0,0);
}
function renderModalVerb(v){
  $app.innerHTML=`<header class="top"><button class="iconbtn" id="bBack" aria-label="Назад">${ICON.back}</button><div style="flex:1;min-width:0"><div class="label">Модальный глагол · ${esc(v.ch)}</div><h2>${esc(v.v)} — ${esc(v.ru)}</h2></div></header>
  <section class="panel" style="display:flex;flex-direction:column;gap:8px"><div><b>Когда:</b> ${esc(v.use)}</div>${svTable(v)}<div class="note">Нажмите на строку, чтобы услышать форму. ich и er/sie/es совпадают — без окончания.</div></section>
  <button class="primary" id="bMdOne"><div><b>Тренировать этот глагол</b><span>формы, смысл и порядок слов</span></div>${ICON.play}</button>
  <div class="label">Примеры · нажмите, чтобы услышать</div>
  <section class="panel" style="display:flex;flex-direction:column;gap:12px">${PERS.map(p=>`<button class="wfqbtn" data-mds="${p}"><div class="label" style="margin-bottom:2px">${PLBL[p]}</div>${mdSent(v,p)}</button>`).join("")}</section>`;
  $app.querySelector("#bBack").onclick=renderModal;
  $app.querySelector("#bMdOne").onclick=()=>startModal([v]);
  $app.querySelectorAll("[data-mds]").forEach(b=>b.onclick=()=>speak(mdPlainS(v.s[b.dataset.mds][0])));
  bindSvSay();window.scrollTo(0,0);
}

/* ---------- сессия ---------- */
function mdTypeFor(v,p){
  const c=state.cards[mdId(v,p)];const hasInf=v.s[p][0].includes("{");
  if(!c||!c.reps||c.s<1)return Math.random()<.6?"mdForm":"mdMeaning";
  const r=Math.random();
  if(c.s<4)return r<.35?"mdType":r<.65?"mdMeaning":hasInf&&r<.85?"mdOrder":"mdForm";
  return r<.35?"mdCloze":r<.6?"mdMeaning":hasInf&&r<.85?"mdOrder":"mdType";
}
const mdItem=(v,p,t)=>({t:t||mdTypeFor(v,p),v,p,w:mdWord(v,p)});
function startModal(verbs){
  const single=verbs&&verbs.length===1;verbs=verbs||MODAL;
  const now=Date.now(),n=Math.max(12,state.settings.sessionLen);
  S={mode:"modal",mdVerbs:verbs.map(v=>v.v),queue:[],done:0,total:0,right:0,wrongIds:new Set(),started:now};
  const seen=v=>{const c=state.cards[mdId(v,"ich")];return c&&c.reps};
  let head=[],mid=[],tail=[];
  if(single){
    const v=verbs[0];
    if(!seen(v))head.push({t:"mdIntro",v,w:mdWord(v,"ich")});
    for(const p of shuffle(PERS))mid.push(mdItem(v,p,seen(v)?undefined:"mdForm"));
    const withInf=PERS.filter(p=>v.s[p][0].includes("{"));
    if(withInf.length)tail.push(mdItem(v,shuffle(withInf)[0],"mdOrder"));
    tail.push(mdItem(v,"er","mdType"),mdItem(v,"du","mdCloze"),mdItem(v,shuffle(PERS)[0],"mdMeaning"));
  }else{
    const all=[];for(const v of verbs)for(const p of PERS)all.push([v,p]);
    const due=all.filter(([v,p])=>isDue(mdId(v,p),now)).sort((a,b)=>state.cards[mdId(...a)].due-state.cards[mdId(...b)].due);
    mid=due.slice(0,n).map(([v,p])=>mdItem(v,p));
    const newV=verbs.filter(v=>!seen(v)).slice(0,2);
    for(const v of newV){
      const other=shuffle(["wir","ihr","sie"])[0];
      head.push({t:"mdIntro",v,w:mdWord(v,"ich")},mdItem(v,"ich","mdForm"),mdItem(v,"du","mdForm"),mdItem(v,"er","mdForm"),mdItem(v,other,"mdForm"));
      tail.push(mdItem(v,"er","mdType"),mdItem(v,"du","mdType"));
      if(mdHasInf(v))tail.push(mdItem(v,shuffle(PERS.filter(p=>v.s[p][0].includes("{")))[0],"mdOrder"));
    }
    const room=n-head.length-mid.length-tail.length;
    if(room>0){
      const inQ=new Set(mid.map(i=>i.w.id));
      const rest=all.filter(([v,p])=>seen(v)&&!inQ.has(mdId(v,p))&&!newV.includes(v))
        .map(([v,p])=>({v,p,r:retrNow(mdId(v,p))})).sort((a,b)=>a.r-b.r);
      mid.push(...rest.slice(0,room).map(({v,p})=>mdItem(v,p)));
    }
  }
  S.queue=[...head,...shuffle(mid),...shuffle(tail)];
  if(!S.queue.length){toast("Сейчас нечего повторять. Загляните позже");return}
  S.total=S.queue.length;next();
}
/* отдельная тренировка: выбрать глагол по смыслу */
function startModalMeaning(){
  const all=[];for(const v of MODAL)for(const p of PERS)all.push(mdItem(v,p,"mdMeaning"));
  S={mode:"modal",mdVerbs:MODAL.map(v=>v.v),mdMean:true,queue:shuffle(all).slice(0,Math.max(12,state.settings.sessionLen)),done:0,total:0,right:0,wrongIds:new Set(),started:Date.now()};
  S.total=S.queue.length;next();
}
function mdPrompt(v,p){
  return `<div class="svq"><span class="svpn2">${PLBL[p]}</span><span class="svinf">${esc(v.v)}</span></div><div class="hint">${PRU[p]} · ${esc(v.ru)}</div>`;
}
function mdFeedback(res,v,p){
  const cls=res.g===3?"ok":res.g===2?"mid":"bad";
  const vv=res.g===3?"Верно":res.g===2?"Почти":"Неверно";
  return `<div class="fb ${cls}" role="status"><div class="v">${vv}${res.msg?" · "+esc(res.msg):""}</div>
  <div style="display:flex;align-items:center;gap:10px;justify-content:space-between"><div class="ans"><span class="svpn2">${PLBL[p]}</span> ${hlF(v.f[p])} <span style="font-size:17px;font-weight:600;font-family:var(--body)">· ${esc(v.v)}</span></div><button class="speak" data-speak aria-label="Произнести">${ICON.sound}</button></div>
  ${mdSent(v,p)}<div class="note">${esc(v.v)}: ${esc(v.use)}</div>${svTable(v,p)}</div><button class="btn main wide" id="bNext">Дальше</button>`;
}
function bindMdFeedback(v,p,{sentence=false}={}){
  const b=$app.querySelector("#bNext");b.focus({preventScroll:true});b.onclick=next;
  const say=()=>speak(sentence?mdPlainS(v.s[p][0]):spkP(p)+" "+plainF(v.f[p]));
  $app.querySelectorAll("[data-speak]").forEach(x=>x.onclick=say);bindSvSay();
  if(state.settings.autoAudio)say();
}
function mdIntro(it){
  const v=it.v;const ps=["ich","er"].filter(p=>v.s[p]);
  shell(`<div class="panel" style="display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><div class="prompt">${esc(v.v)}</div><div style="font-size:19px;font-weight:600">${esc(v.ru)}</div></div><span class="svchip big">${esc(v.ch)}</span></div>
    <div><b>Когда:</b> ${esc(v.use)}</div>
    ${svTable(v)}
    ${ps.map(p=>mdSent(v,p)).join("")}
    <div class="note">ich и er/sie/es — одинаковые, без окончания.${v.v==="möchten"?" Не путайте: er möchte (без -t), ihr möchtet.":""}${v.v==="mögen"?" mögen обычно без второго глагола: Ich mag Kaffee. Для «хочу» — möchten или wollen.":" Второй глагол уходит в конец предложения."} Нажмите на строку таблицы, чтобы услышать.</div>
  </div><button class="btn main wide" id="bNext">Понятно, тренировать</button>`);
  bindSvSay();
  if(state.settings.autoAudio)speak(`ich ${plainF(v.f.ich)}. du ${plainF(v.f.du)}. er ${plainF(v.f.er)}`);
  const b=$app.querySelector("#bNext");b.focus();b.onclick=()=>{S.done++;next()};
}
/* выбрать форму глагола */
function mdForm(it){
  const {v,p}=it;const want=plainF(v.f[p]);
  const c=new Set([want]);
  for(const x of [...shuffle(mdWrongForms(v,p)),...shuffle(PERS.map(q=>plainF(v.f[q])))]){if(c.size>=4)break;c.add(x)}
  const opts=shuffle([...c]);
  shell(`${mdPrompt(v,p)}<div class="choices">${opts.map((o,i)=>`<button class="choice svopt" data-i="${i}">${esc(o)}</button>`).join("")}</div><div id="fb"></div>`);
  const btns=$app.querySelectorAll(".choice");
  btns.forEach(b=>b.onclick=()=>{const o=opts[+b.dataset.i];const res=o===want?{g:3,msg:""}:mdCheck(v,p,o);
    btns.forEach(x=>{x.disabled=true;if(opts[+x.dataset.i]===want)x.classList.add("ok")});if(res.g<3){b.classList.add("bad");res.g=1}
    grade(res.g);$app.querySelector("#fb").innerHTML=mdFeedback(res,v,p);bindMdFeedback(v,p)});
}
/* выбрать модальный глагол по смыслу: виден перевод, пропуск в предложении */
function mdMeaning(it){
  const {v,p}=it;const want=plainF(v.f[p]);const s=v.s[p];
  const start=s[0].startsWith("[");const fix=x=>start?cap(x):x;
  const others=shuffle(MODAL.filter(m=>m!==v&&(mdHasInf(v)?m.v!=="mögen":true)));
  const c=[fix(want)];for(const m of others){if(c.length>=4)break;const f=fix(plainF(m.f[p]));if(!c.includes(f))c.push(f)}
  const opts=shuffle(c);
  shell(`${mdSent(v,p,{gap:true})}<div class="hint" style="font-size:17px">${esc(s[1])}</div>
    <div class="choices">${opts.map((o,i)=>`<button class="choice svopt" data-i="${i}">${esc(o)}</button>`).join("")}</div><div id="fb"></div>`);
  const btns=$app.querySelectorAll(".choice");
  btns.forEach(b=>b.onclick=()=>{const o=opts[+b.dataset.i];const ok=o===fix(want);
    const other=MODAL.find(m=>fix(plainF(m.f[p]))===o);
    const res=ok?{g:3,msg:""}:{g:1,msg:other?`${other.v} — ${other.use.split(":")[0]}`:""};
    btns.forEach(x=>{x.disabled=true;if(opts[+x.dataset.i]===fix(want))x.classList.add("ok")});if(!ok)b.classList.add("bad");
    grade(res.g);$app.querySelector("#fb").innerHTML=mdFeedback(res,v,p);bindMdFeedback(v,p,{sentence:true})});
}
function mdInputEx(it,promptHTML){
  const {v,p}=it;
  shell(`${promptHTML}<form class="field" id="f"><input class="inp" id="inp" ${INP_ATTR} lang="de" placeholder="Форма глагола" aria-label="Ответ">${umlautBar()}
  <div class="row"><button class="btn" type="button" id="bSkip">Не знаю</button><button class="btn main" type="submit">Проверить</button></div></form><div id="fb"></div>`);
  const inp=$app.querySelector("#inp"),f=$app.querySelector("#f");inp.focus();bindUmlauts(inp);
  const finish=res=>{const typed=inp.value.trim();f.remove();grade(res.g);
    $app.querySelector("#fb").innerHTML=`<div class="mine ${res.g===3?"ok":res.g===2?"mid":"bad"}"><span class="label">Твой ответ</span><span class="mytxt">${typed?(res.g<3?diffHTML(typed.replace(/^(ich|du|er|sie|es|wir|ihr|man)\s+/i,""),plainF(v.f[p])):esc(typed)):"—"}</span></div>`+mdFeedback(res,v,p);
    bindMdFeedback(v,p)};
  f.onsubmit=e=>{e.preventDefault();if(!inp.value.trim())return inp.focus();finish(mdCheck(v,p,inp.value))};
  $app.querySelector("#bSkip").onclick=()=>finish({g:1,msg:"Ничего, повторим"});
}
function mdType(it){mdInputEx(it,mdPrompt(it.v,it.p))}
function mdCloze(it){const {v,p}=it;mdInputEx(it,`${mdSent(v,p,{gap:true})}<div class="hint">${esc(v.v)} · ${esc(v.s[p][1])}</div>`)}
/* собрать предложение: модальный на 2-м месте, второй глагол в конце */
function mdOrder(it){
  const {v,p}=it;const s=v.s[p];const plain=mdPlainS(s[0]);
  const punct=(plain.match(/[.?!]$/)||[""])[0];
  const toks=plain.replace(/[.?!]$/,"").split(" ");
  let pool=shuffle(toks.map((t,i)=>({t,i})));
  if(pool.every((x,k)=>x.i===k))pool=pool.reverse();
  const picked=[];
  shell(`<div class="hint" style="font-size:18px;color:var(--ink)">${esc(s[1])}</div>
    <div class="mdline" id="line" aria-live="polite"></div>
    <div class="mdtoks" id="toks"></div>
    <div class="row"><button class="btn" type="button" id="bUndo">Стереть</button><button class="btn main" type="button" id="bChk" disabled>Проверить</button></div><div id="fb"></div>`);
  const line=$app.querySelector("#line"),tw=$app.querySelector("#toks"),chk=$app.querySelector("#bChk");
  const draw=()=>{
    line.innerHTML=picked.length?picked.map(x=>`<span class="mdtok on">${esc(x.t)}</span>`).join("")+`<span class="mdp">${punct}</span>`:`<span class="note">Нажимайте слова по порядку</span>`;
    tw.innerHTML=pool.map((x,k)=>`<button class="mdtok" data-k="${k}" ${picked.includes(x)?"disabled":""}>${esc(x.t)}</button>`).join("");
    tw.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{picked.push(pool[+b.dataset.k]);draw()});
    chk.disabled=picked.length!==toks.length;
  };
  draw();
  $app.querySelector("#bUndo").onclick=()=>{picked.pop();draw()};
  chk.onclick=()=>{
    const ans=picked.map(x=>x.t).join(" ");const ok=ans===toks.join(" ");
    const form=plainF(v.f[p]).toLowerCase();
    const posV=picked.findIndex(x=>x.t.toLowerCase()===form);
    const posT=toks.findIndex(t=>t.toLowerCase()===form);
    const inf=(s[0].match(/\{(.+?)\}/)||[])[1];
    let msg="";
    if(!ok){
      if(inf&&picked[picked.length-1].t!==inf)msg=`«${inf}» стоит в самом конце`;
      else if(posV!==posT&&posT===0)msg="В вопросе без вопросительного слова глагол — на 1-м месте";
      else if(posV!==posT&&posT===1)msg=`«${plainF(v.f[p])}» стоит на 2-м месте`;
    }
    $app.querySelector(".mdtoks").remove();$app.querySelector(".row").remove();
    line.classList.add(ok?"ok":"bad");
    grade(ok?3:1);
    $app.querySelector("#fb").innerHTML=mdFeedback({g:ok?3:1,msg},v,p);bindMdFeedback(v,p,{sentence:true});
  };
}
const MDR={mdIntro,mdForm,mdMeaning,mdType,mdCloze,mdOrder};
