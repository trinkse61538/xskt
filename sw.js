const CACHE_VERSION='xskt-v51-pwa-v44-performance-stats';
const APP_SHELL=[
  '/','/index.html','/assets/style.v43.css','/assets/stats.v44.css','/assets/app.v43.js','/assets/stats.v44.js',
  '/data/v51-2026-2050.v41.js','/data/history/recent-history.v40.js',
  '/data/history/research-summary.v43.js','/data/history/anomaly-history.v43.js','/manifest.webmanifest',
  '/icons/icon-192.png','/icons/icon-512.png','/icons/apple-touch-icon.png','/offline.html'
];
self.addEventListener('install',e=>e.waitUntil(
  caches.open(CACHE_VERSION).then(c=>c.addAll(APP_SHELL.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting())
));
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);if(u.origin!==self.location.origin)return;
  e.respondWith(fetch(new Request(e.request,{cache:'no-store'})).then(r=>{
    if(r&&r.ok){const cp=r.clone();caches.open(CACHE_VERSION).then(c=>c.put(e.request,cp))}
    return r;
  }).catch(async()=>{
    const c=await caches.match(e.request);if(c)return c;
    if(e.request.mode==='navigate')return caches.match('/offline.html');
    return Response.error();
  }));
});
