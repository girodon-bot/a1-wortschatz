/* ---------- Вопросительные слова · W-Fragen ---------- */
const WF = /*WF*/[];
const WFBY=Object.fromEntries(WF.map(w=>[w.id,w]));
const WF_GROUPS=[["who","Кто и что"],["place","Где, куда, откуда"],["time","Время"],["num","Сколько"],["how","Как, почему, какой"]];
/* пары, которые в конкретном вопросе тоже могут подойти — их не даём как неверный вариант */
const WF_EXCL={"wann":["um wie viel Uhr"],"um wie viel Uhr":["wann"],"seit wann":["wie lange"],"welch":["was für"],"was für":["welch"]};
/* группы, где ответы разных слов хорошо различимы и годятся как неверные варианты ответа */
const WF_SAME_ANS=new Set(["place","time","num"]);
const wfId=w=>"wf|"+w.id;
const WFW={};
function wfWord(id){const w=WFBY[id];if(!w)return null;return WFW[id]||(WFW[id]={id:wfId(w),de:w.d,ru:w.ru,wf:true})}
const wfPlain=q=>q.replace(/[\[\]]/g,"");
const wfTarget=q=>q.match(/\[(.+?)\]/)[1];
const wfAtStart=q=>q.startsWith("[");
const cap=s=>s[0].toUpperCase()+s.slice(1);
const wfQHTML=(q,gap)=>esc(q).replace(/\[(.+?)\]/,(m,t)=>gap?`<span class="gap">${"_".repeat(Math.max(4,Math.min(12,t.length)))}</span>`:`<mark>${t}</mark>`);
const wfNorm=s=>norm(s).replace(/\s+/g,"");
function wfStats(list){const now=Date.now();const c={new:0,learn:0,firm:0,known:0,due:0};
  for(const w of list){c[level(wfId(w))]++;if(isDue(wfId(w),now))c.due++}return c}

/* проверка введённого слова */
function wfCheck(w,target,input){
  const n=wfNorm(input),t=wfNorm(target);
  if(!n)return{g:1,msg:"Пустой ответ"};
  if(n===t)return{g:3,msg:""};
  const forms=w.forms.length?w.forms:[w.id];
  if(forms.some(f=>wfNorm(f)===n))return{g:1,msg:w.id==="welch"?"Не та форма: окончание как у артикля (der → welcher, die → welche, das → welches, den → welchen, dem → welchem)":"Не та форма: окончание как у артикля ein / eine / einen"};
  const other=WF.find(x=>x!==w&&(x.forms.length?x.forms:[x.id]).some(f=>wfNorm(f)===n));
  if(other)return{g:1,msg:`«${other.d}» — это ${other.ru}`};
  if(t.length>=7&&lev(n,t)===1)return{g:2,msg:"опечатка"};
  return{g:1,msg:""};
}
/* для упражнения «по-русски → по-немецки»: подходит любая форма */
function wfCheckAny(w,input){
  const n=wfNorm(input);if(!n)return{g:1,msg:"Пустой ответ"};
  const forms=w.forms.length?w.forms:[w.id];
  if(forms.some(f=>wfNorm(f)===n))return{g:3,msg:""};
  return wfCheck(w,forms[0],input);
}

/* ---------- экраны ---------- */
function wfRow(w){const lv=level(wfId(w));const c=state.cards[wfId(w)];const due=c&&c.reps&&c.due<=Date.now();
  return `<button class="witem wfrow" data-wf="${esc(w.id)}"><span class="dot" style="--c:${LV_C[lv]}"></span><span class="d"><b>${esc(w.d)}</b><span>${esc(w.ru)}</span></span><span class="m">${due?"повторить":LV_RU[lv]}</span></button>`}
function renderWf(){
  const st=wfStats(WF),total=WF.length,newN=st.new;
  const sub=(st.due?`${st.due} к повторению · `:"")+(newN?`${Math.min(3,newN)} новых слова`:"всё изучено — повторяем");
  $app.innerHTML=`<header class="top"><button class="iconbtn" id="bBack" aria-label="Назад">${ICON.back}</button><div style="flex:1;min-width:0"><div class="label">Тренажёр</div><h2>Вопросительные слова · W-Fragen</h2></div></header>
  <section class="panel" style="display:flex;flex-direction:column;gap:8px">
    <div>Подсказку даёт ответ: <b>In</b> Berlin → <b>Wo?</b> · <b>Nach</b> Berlin → <b>Wohin?</b> · <b>Aus</b> Berlin → <b>Woher?</b></div>
    <div class="note">Вопросительное слово стоит в начале, глагол — сразу за ним: <i>Wohin <u>fährst</u> du?</i></div>
  </section>
  <section class="panel" style="display:flex;flex-direction:column;gap:8px">
    <div class="setrow"><span class="label">Освоено слов</span><b class="num">${st.firm+st.known} / ${total}</b></div>
    ${barHTML(st,total)}
    <div class="legend"><span style="--c:var(--lv-known)">выучено ${st.known}</span><span style="--c:var(--lv-firm)">закрепляю ${st.firm}</span><span style="--c:var(--lv-learn)">учу ${st.learn}</span><span style="--c:var(--lv-new)">новые ${st.new}</span></div>
  </section>
  <button class="primary" id="bWfGo"><div><b>Тренировать</b><span>${sub}</span></div>${ICON.play}</button>
  ${WF_GROUPS.map(([g,t])=>`<div class="label">${t}</div><div class="wlist panel" style="padding:4px 12px">${WF.filter(w=>w.g===g).map(wfRow).join("")}</div>`).join("")}`;
  $app.querySelector("#bBack").onclick=renderHome;
  $app.querySelector("#bWfGo").onclick=()=>startWf();
  $app.querySelectorAll("[data-wf]").forEach(b=>b.onclick=()=>renderWfWord(WFBY[b.dataset.wf]));
  window.scrollTo(0,0);
}
const wfQA=(q,{tr=true}={})=>`<div class="wfqa"><div class="wfq">${wfQHTML(q[0])}</div><div class="wfa">— ${esc(q[1])}</div>${tr?`<div class="exr">${esc(q[2])} — ${esc(q[3])}</div>`:""}</div>`;
const wfSayQA=q=>speak(wfPlain(q[0])+" "+q[1]);
function wfSiblings(w){const sib=WF.filter(x=>x.g===w.g&&x!==w);
  return sib.length?`<div class="note">Сравни: <b>${esc(w.d)}</b> — ${esc(w.ru)}${sib.map(x=>` · ${esc(x.d)} — ${esc(x.ru)}`).join("")}</div>`:""}
function renderWfWord(w){
  $app.innerHTML=`<header class="top"><button class="iconbtn" id="bBack" aria-label="Назад">${ICON.back}</button><div style="flex:1;min-width:0"><div class="label">Вопросительное слово</div><h2>${esc(w.d)} — ${esc(w.ru)}</h2></div></header>
  <section class="panel" style="display:flex;flex-direction:column;gap:8px"><div>${esc(w.rule)}</div>${wfSiblings(w)}</section>
  <button class="primary" id="bWfOne"><div><b>Тренировать это слово</b><span>все вопросы с «${esc(w.d)}»</span></div>${ICON.play}</button>
  <div class="label">Вопросы и ответы · нажмите, чтобы услышать</div>
  <section class="panel" style="display:flex;flex-direction:column;gap:4px">${w.q.map((q,i)=>`<button class="wfqbtn" data-q="${i}">${wfQA(q)}</button>`).join("")}</section>`;
  $app.querySelector("#bBack").onclick=renderWf;
  $app.querySelector("#bWfOne").onclick=()=>startWf([w]);
  $app.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>wfSayQA(w.q[+b.dataset.q]));
  window.scrollTo(0,0);
}

/* ---------- сессия ---------- */
const wfPickQ=(w,not)=>{const qs=w.q.filter(q=>q!==not);return shuffle(qs.length?qs:w.q)[0]};
function wfTypeFor(w){
  const c=state.cards[wfId(w)];
  if(!c||!c.reps||c.s<1)return"wfChoice";
  if(c.s<5){const r=Math.random();return r<.45?"wfChoice":r<.75?"wfAnswer":"wfType"}
  const r=Math.random();return r<.4?"wfType":r<.7?"wfRu":"wfAnswer";
}
const wfItem=(w,t,q)=>({t:t||wfTypeFor(w),x:w,q:q||wfPickQ(w),w:wfWord(w.id)});
function startWf(list){
  const single=list&&list.length===1;list=list||WF;
  const now=Date.now(),n=Math.max(12,state.settings.sessionLen);
  S={mode:"wf",wfIds:list.map(w=>w.id),queue:[],done:0,total:0,right:0,wrongIds:new Set(),started:now};
  const seen=w=>{const c=state.cards[wfId(w)];return c&&c.reps};
  let head=[],mid=[],tail=[];
  if(single){
    const w=list[0];
    if(!seen(w))head.push({t:"wfIntro",x:w,w:wfWord(w.id)});
    const qs=shuffle(w.q);
    qs.forEach((q,i)=>mid.push(wfItem(w,i%3===2?"wfAnswer":"wfChoice",q)));
    tail.push(wfItem(w,"wfType",qs[0]),wfItem(w,"wfRu"));
  }else{
    const due=list.filter(w=>isDue(wfId(w),now)).sort((a,b)=>state.cards[wfId(a)].due-state.cards[wfId(b)].due);
    for(const w of due.slice(0,n)){mid.push(wfItem(w));if(mid.length<n/2&&state.cards[wfId(w)].s<3)mid.push(wfItem(w,"wfAnswer"))}
    const newW=list.filter(w=>!seen(w)).slice(0,3);
    for(const w of newW){
      const q1=wfPickQ(w),q2=wfPickQ(w,q1);
      head.push({t:"wfIntro",x:w,w:wfWord(w.id)},wfItem(w,"wfChoice",q1));
      mid.push(wfItem(w,"wfAnswer",q2));
      tail.push(wfItem(w,"wfType",wfPickQ(w,q1)),wfItem(w,"wfRu"));
    }
    const room=n-head.length-mid.length-tail.length;
    if(room>0){
      const inQ=new Set(mid.map(i=>i.x.id));
      const rest=list.filter(w=>seen(w)&&!inQ.has(w.id)&&!newW.includes(w)).sort((a,b)=>retrNow(wfId(a))-retrNow(wfId(b)));
      mid.push(...rest.slice(0,room).map(w=>wfItem(w)));
    }
  }
  S.queue=[...head,...shuffle(mid),...shuffle(tail)];
  if(!S.queue.length){toast("Сейчас нечего повторять. Загляните позже");return}
  S.total=S.queue.length;next();
}

/* ---------- упражнения ---------- */
function wfFeedback(res,it){
  const {x:w,q}=it;const cls=res.g===3?"ok":res.g===2?"mid":"bad";
  const v=res.g===3?"Верно":res.g===2?"Почти":"Неверно";
  return `<div class="fb ${cls}" role="status"><div class="v">${v}${res.msg?" · "+esc(res.msg):""}</div>
  <div style="display:flex;align-items:center;gap:10px;justify-content:space-between"><div class="ans">${esc(w.d)} <span style="font-size:18px;font-weight:600;font-family:var(--body)">— ${esc(w.ru)}</span></div><button class="speak" data-speak aria-label="Произнести">${ICON.sound}</button></div>
  ${q?wfQA(q):""}<div class="note">${esc(w.rule)}</div></div><button class="btn main wide" id="bNext">Дальше</button>`;
}
function bindWfFeedback(it){
  const b=$app.querySelector("#bNext");b.focus({preventScroll:true});b.onclick=next;
  const say=()=>it.q?wfSayQA(it.q):speak(it.x.d);
  $app.querySelectorAll("[data-speak]").forEach(x=>x.onclick=say);
  if(state.settings.autoAudio)say();
}
function wfIntro(it){
  const w=it.x;const qs=w.q.slice(0,2);
  shell(`<div class="panel" style="display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div><div class="prompt">${esc(w.d)}</div><div style="font-size:20px;font-weight:600">${esc(w.ru)}</div></div><button class="speak" data-speak aria-label="Произнести">${ICON.sound}</button></div>
    <div>${esc(w.rule)}</div>
    ${qs.map(q=>wfQA(q)).join("")}
    ${wfSiblings(w)}
  </div><button class="btn main wide" id="bNext">Понятно, тренировать</button>`);
  const say=()=>speak(w.d+". "+wfPlain(qs[0][0])+" "+qs[0][1]);
  $app.querySelectorAll("[data-speak]").forEach(x=>x.onclick=say);
  if(state.settings.autoAudio)say();
  const b=$app.querySelector("#bNext");b.focus();b.onclick=()=>{S.done++;next()};
}
/* Выбери вопросительное слово по ответу */
function wfChoice(it){
  const {x:w,q}=it;const t=wfTarget(q[0]);const start=wfAtStart(q[0]);
  const fix=s=>start?cap(s):s;
  const excl=new Set([w.id,...(WF_EXCL[w.id]||[])]);
  const c=[t];
  if(w.forms.length){const wrong=shuffle(w.forms.filter(f=>f.toLowerCase()!==t.toLowerCase()))[0];if(wrong)c.push(fix(wrong))}
  const same=shuffle(WF.filter(x=>x.g===w.g&&!excl.has(x.id))),other=shuffle(WF.filter(x=>x.g!==w.g&&!excl.has(x.id)));
  for(const x of [...same,...other]){if(c.length>=4)break;const d=fix(x.forms.length?(x.id==="welch"?"welche":"was für ein"):x.d);
    if(!c.some(y=>y.toLowerCase()===d.toLowerCase()))c.push(d)}
  const opts=shuffle(c);
  shell(`<div class="cloze wfbig">${wfQHTML(q[0],true)}</div><div class="wfa big">— ${esc(q[1])}</div>
    <div class="hint">Какое слово подходит к этому ответу?</div>
    <div class="choices">${opts.map((o,i)=>`<button class="choice svopt" data-i="${i}">${esc(o)}</button>`).join("")}</div><div id="fb"></div>`);
  const btns=$app.querySelectorAll(".choice");
  btns.forEach(b=>b.onclick=()=>{const o=opts[+b.dataset.i];const ok=o===t;const res=ok?{g:3,msg:""}:wfCheck(w,t,o);
    btns.forEach(x=>{x.disabled=true;if(opts[+x.dataset.i]===t)x.classList.add("ok")});if(!ok)b.classList.add("bad");
    grade(ok?3:1);$app.querySelector("#fb").innerHTML=wfFeedback(ok?res:{...res,g:1},it);bindWfFeedback(it)});
}
/* Выбери правильный ответ на вопрос */
function wfAnswer(it){
  const {x:w,q}=it;
  const excl=new Set([w.id,...(WF_EXCL[w.id]||[])]);
  const pool=x=>!excl.has(x.id)&&(x.g!==w.g||WF_SAME_ANS.has(w.g));
  const same=shuffle(WF.filter(x=>x.g===w.g&&pool(x))),other=shuffle(WF.filter(x=>x.g!==w.g&&pool(x)));
  const c=[q[1]];
  for(const x of [...same.slice(0,2),...other]){if(c.length>=4)break;const a=shuffle(x.q)[0][1];if(!c.includes(a))c.push(a)}
  const opts=shuffle(c);
  shell(`<div style="display:flex;align-items:center;gap:10px;justify-content:space-between"><div class="cloze wfbig">${wfQHTML(q[0])}</div><button class="speak" data-speak aria-label="Произнести">${ICON.sound}</button></div>
    <div class="hint">Выбери подходящий ответ</div>
    <div class="choices">${opts.map((o,i)=>`<button class="choice" data-i="${i}">${esc(o)}</button>`).join("")}</div><div id="fb"></div>`);
  const sayQ=()=>speak(wfPlain(q[0]));
  $app.querySelector("[data-speak]").onclick=sayQ;if(state.settings.autoAudio)sayQ();
  const btns=$app.querySelectorAll(".choice");
  btns.forEach(b=>b.onclick=()=>{const ok=opts[+b.dataset.i]===q[1];
    btns.forEach(x=>{x.disabled=true;if(opts[+x.dataset.i]===q[1])x.classList.add("ok")});if(!ok)b.classList.add("bad");
    grade(ok?3:1);$app.querySelector("#fb").innerHTML=wfFeedback({g:ok?3:1,msg:ok?"":`«${w.d}» — ${w.ru}`},it);bindWfFeedback(it)});
}
function wfInputEx(it,promptHTML,checker,target){
  shell(`${promptHTML}<form class="field" id="f"><input class="inp" id="inp" ${INP_ATTR} lang="de" placeholder="Вопросительное слово" aria-label="Ответ">${umlautBar()}
  <div class="row"><button class="btn" type="button" id="bSkip">Не знаю</button><button class="btn main" type="submit">Проверить</button></div></form><div id="fb"></div>`);
  const inp=$app.querySelector("#inp"),f=$app.querySelector("#f");inp.focus();bindUmlauts(inp);
  const finish=res=>{const typed=inp.value.trim();f.remove();grade(res.g);
    $app.querySelector("#fb").innerHTML=`<div class="mine ${res.g===3?"ok":res.g===2?"mid":"bad"}"><span class="label">Твой ответ</span><span class="mytxt">${typed?(res.g<3?diffHTML(typed,target):esc(typed)):"—"}</span></div>`+wfFeedback(res,it);
    bindWfFeedback(it)};
  f.onsubmit=e=>{e.preventDefault();if(!inp.value.trim())return inp.focus();finish(checker(inp.value))};
  $app.querySelector("#bSkip").onclick=()=>finish({g:1,msg:"Ничего, повторим"});
}
/* Вставь слово в вопрос (видны ответ и перевод вопроса) */
function wfType(it){const {x:w,q}=it;const t=wfTarget(q[0]);
  wfInputEx(it,`<div class="cloze wfbig">${wfQHTML(q[0],true)}</div><div class="wfa big">— ${esc(q[1])}</div><div class="hint">${esc(q[2])}</div>`,v=>wfCheck(w,t,v),t)}
/* По-русски → по-немецки */
function wfRu(it){const w=it.x;
  wfInputEx(it,`<div class="prompt ru">${esc(w.ru)}</div><div class="hint">Напиши вопросительное слово по-немецки</div>`,v=>wfCheckAny(w,v),w.forms.length?w.forms[0]:w.d)}
const WFR={wfIntro,wfChoice,wfAnswer,wfType,wfRu};
