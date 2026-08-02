// Minimal service worker — exists mainly to satisfy PWA installability
// checks (Android's "Add to Home screen" / share-target eligibility).
// It intentionally does no caching: every request just falls through
// to the network untouched.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // No-op: let the browser handle every request normally.
});
