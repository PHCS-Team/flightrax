// FlightraX service worker.
//
// Caches nothing on purpose: the app is auth-gated and entirely data-driven,
// so caching pages would risk serving one user's shell to another or showing
// stale flight data.

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

function readPayload(event) {
  if (!event.data) {
    return null;
  }

  try {
    return event.data.json();
  } catch {
    return { title: "FlightraX", body: event.data.text(), href: "/dashboard" };
  }
}

self.addEventListener("push", (event) => {
  const payload = readPayload(event);

  if (!payload) {
    return;
  }

  // userVisibleOnly was set when subscribing, so a push that shows nothing
  // is a contract violation the browser may punish. Always show something.
  event.waitUntil(
    self.registration.showNotification(payload.title || "FlightraX", {
      body: payload.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      // Collapses repeats of the same notification rather than stacking a
      // tray full of them; renotify still buzzes for a genuinely new one.
      tag: payload.tag || undefined,
      renotify: Boolean(payload.tag),
      data: { href: payload.href || "/notifications" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const href = (event.notification.data && event.notification.data.href) || "/";

  // Focus an existing window if one is already on that page, otherwise reuse
  // any open window, otherwise open a new one. Opening blindly would leave
  // users with a pile of duplicate tabs.
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.endsWith(href) && "focus" in client) {
            return client.focus();
          }
        }

        for (const client of clientList) {
          if ("navigate" in client && "focus" in client) {
            return client.navigate(href).then((navigated) =>
              navigated ? navigated.focus() : undefined,
            );
          }
        }

        return self.clients.openWindow(href);
      }),
  );
});
