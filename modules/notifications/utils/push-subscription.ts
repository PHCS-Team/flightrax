// The applicationServerKey must be raw bytes, but VAPID keys travel as
// base64url text. atob only understands standard base64, so the URL-safe
// alphabet has to be translated and the padding restored first.
export function vapidKeyToBytes(base64Url: string): Uint8Array<ArrayBuffer> {
  const padded = base64Url + "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = window.atob(base64);
  // Backed by a plain ArrayBuffer on purpose: applicationServerKey wants a
  // BufferSource, and Uint8Array<ArrayBufferLike> does not satisfy it since
  // that could be a SharedArrayBuffer.
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export type PushSubscriptionPayload = {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
};

// PushSubscription.toJSON() is typed loosely (keys is an optional record), so
// the shape the server needs is validated here rather than trusted.
export function toSubscriptionPayload(
  subscription: PushSubscription,
): PushSubscriptionPayload | null {
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;

  if (!json.endpoint || !p256dh || !auth) {
    return null;
  }

  return {
    endpoint: json.endpoint,
    p256dh,
    auth,
    userAgent: navigator.userAgent.slice(0, 500),
  };
}
