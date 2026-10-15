"""Сборка: python3 build.py  → index.html, sw.js, manifest.json в корне (GitHub Pages)."""
import json,re,hashlib,collections
rows=[]
for f in ['data/data_a_k.txt','data/data_l_z.txt','data/data_groups.txt','data/data_health.txt']:
    for l in open(f,encoding='utf-8'):
        l=l.rstrip('\n')
        if not l.strip(): continue
        s,de,pl,ru,ex=l.split('|')
        art=de.split(' ')[0]; g=''
        if art in('der','die','das') and len(de.split(' '))>=2 and de[4:5].isupper():
            g={'der':'m','die':'f','das':'n'}[art]
            if art=='die' and '(мн.ч.)' in ru: g='p'
        rows.append(dict(id=de,de=de,g=g,pl=pl,ru=ru,s=s,ex=ex))
# переводы примеров: data/ex_ru_*.txt, строки «id|перевод»
import glob
exr={}
for f in sorted(glob.glob('data/ex_ru_*.txt')):
    for l in open(f,encoding='utf-8'):
        if l.strip():
            k,v=l.rstrip('\n').split('|',1); exr[k]=v
for r in rows:
    if r['ex']:
        assert r['id'] in exr, 'нет перевода примера: '+r['id']
        r['exr']=exr[r['id']]
# иконки: data/icons.txt «id|имя» → svg из vendor/phosphor (MIT)
import os
icmap={}
for l in open('data/icons.txt',encoding='utf-8'):
    l=l.rstrip('\n')
    if l and not l.startswith('#'):
        k,v=l.split('|'); icmap[k]=v
icons={}
def rnd(m):
    return ('%.1f'%float(m.group(0))).rstrip('0').rstrip('.')
for r in rows:
    v=icmap.get(r['id'])
    if not v: continue
    r['ic']=v
    n=v.split(':')[0]
    if n=='circle' and ':' in v: continue
    if n not in icons:
        path=f'vendor/custom/{n[3:]}.svg' if n.startswith('my-') else f'vendor/phosphor/{n}.svg'
        svg=open(path,encoding='utf-8').read()
        inner=re.sub(r'^<svg[^>]*>|</svg>\s*$','',svg.strip())
        inner=re.sub(r'-?\d+\.\d{2,}',rnd,inner)
        icons[n]=inner
# сильные глаголы: data/strong_verbs.txt + data/strong_sentences.txt
PERS=['ich','du','er','wir','ihr','sie']
strong=[];svby={}
for l in open('data/strong_verbs.txt',encoding='utf-8'):
    l=l.rstrip('\n')
    if not l or l.startswith('#'): continue
    p_=l.split('|'); assert len(p_)==9,l
    v={'v':p_[0],'ru':p_[1],'ch':p_[2],'f':dict(zip(PERS,p_[3:])),'s':{}}
    strong.append(v); svby[v['v']]=v
for l in open('data/strong_sentences.txt',encoding='utf-8'):
    l=l.rstrip('\n')
    if not l or l.startswith('#'): continue
    vv,pp,de,ru=l.split('|'); v=svby[vv]
    m=re.search(r'\[(.+?)\]',de); assert m,l
    assert m.group(1).lower()==re.sub(r'[\[\]]','',v['f'][pp]).split(' ')[0].lower(),('форма в примере не совпадает',l)
    v['s'][pp]=[de,ru]
for v in strong: assert set(v['s'])==set(PERS),('не на все лица есть пример',v['v'])
dup=[k for k,v in collections.Counter(r['id'] for r in rows).items() if v>1]
assert not dup, dup
words=json.dumps(rows,ensure_ascii=False,separators=(',',':'))
src=open('src/app.html',encoding='utf-8').read().replace('/*STRONG_JS*/',open('src/strong.js',encoding='utf-8').read()).replace('/*WORDS*/[]',words).replace('/*ICONS*/{}',json.dumps(icons,ensure_ascii=False,separators=(',',':'))).replace('/*STRONG*/[]',json.dumps(strong,ensure_ascii=False,separators=(',',':')))
ver=hashlib.sha1(src.encode()).hexdigest()[:8]
head='''<!doctype html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#F4B400"><link rel="manifest" href="manifest.json">
<link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="icon-192.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style>
'''
title=re.search(r'<title>.*?</title>',src).group(0)
open('index.html','w',encoding='utf-8').write(head+title+'</head><body>'+src.replace(title,'')+'</body></html>')
json.dump({"name":"A1 Wortschatz","short_name":"A1 Wörter","start_url":"./","scope":"./","display":"standalone","orientation":"portrait",
 "background_color":"#F2F4F7","theme_color":"#F4B400","lang":"ru",
 "icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"any maskable"}]},
 open('manifest.json','w'),ensure_ascii=False,indent=1)
open('sw.js','w').write(f'''// Прогресс лежит в IndexedDB и при обновлении не трогается; здесь только кэш файлов.
const CACHE="a1-{ver}";
const SHELL=["./","index.html","manifest.json","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{{
  // cache:"reload" — мимо HTTP-кэша GitHub Pages, иначе в новый кэш попадёт старая версия
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{{cache:"reload"}})))).then(()=>self.skipWaiting()));
}});
self.addEventListener("activate",e=>{{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))}});
self.addEventListener("fetch",e=>{{
  const req=e.request; if(req.method!=="GET")return;
  const url=new URL(req.url);
  const isPage=req.mode==="navigate"||(url.origin===location.origin&&/\\/(index\\.html)?$/.test(url.pathname));
  if(isPage){{
    // Страница: сначала сеть (свежая версия), при отсутствии сети или >2.5 c — из кэша
    e.respondWith(new Promise(resolve=>{{
      let done=false;
      const fromCache=()=>caches.match("index.html").then(r=>{{if(!done&&r){{done=true;resolve(r)}}}});
      const t=setTimeout(fromCache,2500);
      fetch(req,{{cache:"no-cache"}}).then(r=>{{clearTimeout(t);if(r.ok){{const cp=r.clone();caches.open(CACHE).then(c=>c.put("index.html",cp))}}
        if(!done){{done=true;resolve(r)}}}}).catch(()=>{{clearTimeout(t);fromCache().then(()=>{{if(!done){{done=true;resolve(Response.error())}}}})}});
    }}));
    return;
  }}
  e.respondWith(caches.match(req,{{ignoreSearch:true}}).then(hit=>hit||fetch(req).then(r=>{{
    if(r&&(r.ok||r.type==="opaque")){{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}}return r}})));
}});
''')

print(len(rows),'words,',len(icons),'icons,',len(src)//1024,'KB, cache',ver)
open('_artifact.html','w',encoding='utf-8').write(src)
