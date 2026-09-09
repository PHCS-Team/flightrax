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

// Browsers allow only a budget of pushes that show nothing before they
// substitute their own "site updated in the background" notice. Suppressing
// while focused spends that budget, so it is capped: after this many skips in
// a row the next push is shown regardless. A burst arrives within seconds,
// while the worker is still alive, which is exactly when the counter matters.
//
// The real browser limit is not publicly documented and varies with the
// engagement score of the origin, so this is a safety valve rather than an
// exact match — low enough to keep headroom, high enough that a realistic
// burst never surfaces a banner for something already on screen.
const MAX_CONSECUTIVE_SUPPRESSED = 6;
let consecutiveSuppressed = 0;

// The app is only "in front of the user" when a window is both focused and
// visible. A background tab or a minimised window does not count — those
// users still need the banner.
async function isAppInForeground() {
  const clientList = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  return clientList.some(
    (client) => client.focused && client.visibilityState === "visible",
  );
}

self.addEventListener("push", (event) => {
  const payload = readPayload(event);

  if (!payload) {
    return;
  }

  event.waitUntil(
    (async () => {
      // Suppress the banner when the user is already looking at the app: the
      // bell badge and the realtime feed have shown it, so a system
      // notification on top is the same news twice.
      //
      // This is a deliberate exception to userVisibleOnly, which we set when
      // subscribing. Browsers allow a small budget of pushes that show
      // nothing before substituting their own "site updated in background"
      // notice. Skipping only while focused keeps this rare — a user staring
      // at the app is not receiving many notifications they cannot see.
      if (
        (await isAppInForeground()) &&
        consecutiveSuppressed < MAX_CONSECUTIVE_SUPPRESSED
      ) {
        consecutiveSuppressed += 1;

        return;
      }

      consecutiveSuppressed = 0;

      await self.registration.showNotification(payload.title || "FlightraX", {
        body: payload.body || "",
        icon: "/icons/icon-192.png",
        // Android renders the badge from its alpha channel alone, as a white
        // silhouette in the status bar. A full-colour icon with an opaque
        // background therefore shows as a solid white box — this one is the
        // mark on transparency.
        badge: "/icons/badge-96.png",
        // Collapses repeats of the same notification rather than stacking a
        // tray full of them; renotify still buzzes for a genuinely new one.
        tag: payload.tag || undefined,
        renotify: Boolean(payload.tag),
        data: { href: payload.href || "/notifications" },
      });
    })(),
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
