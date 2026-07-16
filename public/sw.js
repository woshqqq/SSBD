// 서비스 워커: 브라우저와 인터넷 사이에 있는 '캐시 창고지기'.
// 앱을 처음 켤 때 필요한 파일들을 창고(캐시)에 저장해두고,
// 다음부터는 인터넷이 없어도 창고에서 바로 꺼내준다.

const CACHE_NAME = 'boardgame-cache-v4';

// 최초 설치 시 저장해둘 파일 목록.
// 서비스워커 안에서 상대경로는 이 스크립트 자신의 위치(scope) 기준으로 풀리기 때문에,
// GitHub Pages처럼 서브경로(/저장소이름/)에 배포돼도 './'가 알아서 그 경로를 가리킨다.
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 요청이 들어오면: 창고(캐시)에 있으면 그걸 주고,
// 없으면 인터넷에서 받아온 뒤 창고에도 복사해둔다 (Cache falling back to network + save).
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => cached);
    })
  );
});
