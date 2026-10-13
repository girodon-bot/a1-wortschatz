// Прогресс лежит в IndexedDB и при обновлении не трогается; здесь только кэш файлов.
const CACHE="a1-bada32ba";
const SHELL=["./","index.html","manifest.json","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{
  // cache:"reload" — мимо HTTP-кэша GitHub Pages, иначе в новый кэш попадёт старая версия
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET")return;
  const url=new URL(req.url);
  const isPage=req.mode==="navigate"||(url.origin===location.origin&&/\/(index\.html)?$/.test(url.pathname));
  if(isPage){
    // Страница: сначала сеть (свежая версия), при отсутствии сети или >2.5 c — из кэша
    e.respondWith(new Promise(resolve=>{
      let done=false;
      const fromCache=()=>caches.match("index.html").then(r=>{if(!done&&r){done=true;resolve(r)}});
      const t=setTimeout(fromCache,2500);
      fetch(req,{cache:"no-cache"}).then(r=>{clearTimeout(t);if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put("index.html",cp))}
        if(!done){done=true;resolve(r)}}).catch(()=>{clearTimeout(t);fromCache().then(()=>{if(!done){done=true;resolve(Response.error())}})});
    }));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(r=>{
    if(r&&(r.ok||r.type==="opaque")){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r})));
});
