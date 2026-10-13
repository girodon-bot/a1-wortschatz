"""Сборка: python3 build.py  → index.html, sw.js, manifest.json в корне (GitHub Pages)."""
import json,re,hashlib,collections
rows=[]
for f in ['data/data_a_k.txt','data/data_l_z.txt','data/data_groups.txt']:
    for l in open(f,encoding='utf-8'):
        l=l.rstrip('\n')
        if not l.strip(): continue
        s,de,pl,ru,ex=l.split('|')
        art=de.split(' ')[0]; g=''
        if art in('der','die','das') and len(de.split(' '))>=2 and de[4:5].isupper():
            g={'der':'m','die':'f','das':'n'}[art]
            if art=='die' and '(мн.ч.)' in ru: g='p'
        rows.append(dict(id=de,de=de,g=g,pl=pl,ru=ru,s=s,ex=ex))
dup=[k for k,v in collections.Counter(r['id'] for r in rows).items() if v>1]
assert not dup, dup
words=json.dumps(rows,ensure_ascii=False,separators=(',',':'))
src=open('src/app.html',encoding='utf-8').read().replace('/*WORDS*/[]',words)
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
open('sw.js','w').write(f'''// Кэш приложения. Прогресс лежит в IndexedDB и при обновлении не трогается.
const CACHE="a1-{ver}";
const SHELL=["./","index.html","manifest.json","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))}});
self.addEventListener("activate",e=>{{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))}});
self.addEventListener("fetch",e=>{{
  if(e.request.method!=="GET")return;
  e.respondWith(caches.match(e.request,{{ignoreSearch:true}}).then(hit=>{{
    const net=fetch(e.request).then(r=>{{if(r&&(r.ok||r.type==="opaque")){{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}}return r}}).catch(()=>hit);
    return hit||net;
  }}));
}});
''')
print(len(rows),'words, cache',ver)
