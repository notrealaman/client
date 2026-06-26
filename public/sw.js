const CACHE = 'gym-buddy-v1';
const STATIC_ASSETS = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      return caches.open(CACHE).then((cache) => { cache.put(request, response.clone()); return response; });
    }))
  );
});

self.addEventListener('push', (event) => {
  let data = { title: 'GymBuddy', body: '', link: '/' };
  try {
    if (event.data) data = JSON.parse(event.data.text());
  } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon.svg',
      badge: data.badge || '/icons/icon.svg',
      data: { link: data.link || '/' },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const focused = windowClients.find((c) => c.focused);
      if (focused) { focused.focus(); focused.navigate(link); return; }
      const existing = windowClients.find((c) => c.visibilityState === 'visible');
      if (existing) { existing.focus(); existing.navigate(link); return; }
      clients.openWindow(link);
    })
  );
});
