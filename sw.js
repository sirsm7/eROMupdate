// KEMASKINI: VERSI 5 (PAKSA RESET CACHE UNTUK MIGRASI DB)
const CACHE_NAME = 'erom-ag-v6'; 
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './assets/css/style.css',
  './assets/js/app.js',
  './assets/img/logo-kpm.png',
  './src/api/supabaseClient.js'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Paksa SW baru ambil alih segera
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Meng-cache aset asas (v5)');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate & Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Membuang cache lama:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Ambil alih kawalan page segera
});

// Fetch Strategy: Network First dengan Error Handling Robust
self.addEventListener('fetch', (event) => {
  // Abaikan POST requests (seperti panggilan RPC Supabase) - Biar terus ke network
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        // Jika offline atau network gagal, cuba cari dalam cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback ke index.html jika navigasi gagal
          if (event.request.mode === 'navigate') {
             return caches.match('./index.html');
          }
          // Pulangkan respon kosong jika tiada apa-apa
          return new Response('', {
            status: 408,
            statusText: 'Request Timed Out / Offline'
          });
        });
      })
  );
});