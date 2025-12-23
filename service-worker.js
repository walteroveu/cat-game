// 缓存名称
const CACHE_NAME = 'cat-game-v1';

// 需要缓存的资源列表
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css',
  'https://p3-flow-imagex-download-sign.byteimg.com/tos-cn-i-a9rns2rl98/6827d6351cec4356968bc298698295a7.png~tplv-a9rns2rl98-24:720:720.png?rcl=2025122316233519D5AB42B335312F9DC3&rk3s=8e244e95&rrcfp=8a172a1a&x-expires=1767083016&x-signature=TuipAbmK07U2Q3Z9KJpBczhnTNY%3D',
  'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/362140db564d4bdf999db240217c9118~tplv-a9rns2rl98-image.image?rcl=2025122316193038C5E5C4A833BB2AEEBB&rk3s=8e244e95&rrcfp=f06b921b&x-expires=1769070001&x-signature=RLCHQXKOkOAstdvFo0ILX%2BWQajU%3D',
  'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/2cdad272ad3143e7a493cb17569eb7cb~tplv-a9rns2rl98-image.image?rcl=2025122316193038C5E5C4A833BB2AEEBB&rk3s=8e244e95&rrcfp=f06b921b&x-expires=1769070001&x-signature=PQpIJOzrE%2F0zY7MF1dz3UMQ%2BU00%3D',
  'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/d1ea317be87f4413bd2e9ff20e34bdbe~tplv-a9rns2rl98-image.image?rcl=202512231616004061641C43E77112A60A&rk3s=8e244e95&rrcfp=f06b921b&x-expires=1769069778&x-signature=WZSGA6RxCC4tLFvttS7GTywxw8o%3D'
];

// 安装 Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活 Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截请求并从缓存中返回资源
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果找到缓存的资源，则返回缓存的资源
        if (response) {
          return response;
        }
        
        // 否则发起网络请求
        return fetch(event.request).then(
          response => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆响应
            const responseToCache = response.clone();

            // 将响应添加到缓存中
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      }).catch(() => {
        // 如果网络请求失败且没有缓存的资源，则返回一个默认的离线页面
        // 这里我们简单地返回一个错误信息
        return new Response('网络连接失败，请检查您的网络连接。', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
  );
});