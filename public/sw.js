// FlightraX service worker.
//
// Deliberately minimal. The app is auth-gated and entirely data-driven, so
// caching pages would risk serving one user's shell to another or showing
// stale flight data — neither is worth an offline mode nobody asked for.
//
// It exists for two reasons:
//   1. iOS delivers Web Push only to an installed PWA, and only through a
//      service worker. Phase 3 adds the "push" and "notificationclick"
//      handlers here; registering it now means that is a pure addition.
//   2. Browsers that still gate installability on a registered worker.

self.addEventListener("install", () => {
  // Take over immediately rather than waiting for every tab to close, so an
  // updated worker is never a version behind the page that registered it.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Empty on purpose. Chrome detects a no-op fetch handler and skips it
// entirely, so this satisfies the installability check without putting the
// worker in the path of every request.
self.addEventListener("fetch", () => {});
