const CACHE_NAME = 'erom-ag-v2'; // Versi dinaikkan untuk memaksa kemaskini
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
  // Paksa SW baru aktif segera
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Meng-cache aset asas');
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
  // Ambil alih kawalan halaman dengan segera
  return self.clients.claim();
});

// Fetch Strategy: Network First dengan Error Handling Robust
self.addEventListener('fetch', (event) => {
  // Abaikan request bukan GET (POST, PUT, dll) dan skrip Chrome Extension
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Jika rangkaian berjaya, pulangkan response rangkaian
        return response;
      })
      .catch(() => {
        // Jika rangkaian gagal (offline/blocked), cari dalam cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // PEMBAIKAN KRITIKAL:
          // Jika tiada network DAN tiada cache, jangan biarkan ia return undefined.
          // Punca error "Failed to convert value to 'Response'" adalah di sini sebelum ini.

          // Jika pengguna cuba masuk ke laman utama (navigation), pulangkan index.html
          if (event.request.mode === 'navigate') {
             return caches.match('./index.html');
          }

          // Untuk fail lain (gambar/skrip luaran) yang gagal, pulangkan status 408 atau kosong
          // Ini mengelakkan aplikasi crash jika Analytics/CDN disekat
          return new Response('', {
            status: 408,
            statusText: 'Request Timed Out / Offline'
          });
        });
      })
  );
});