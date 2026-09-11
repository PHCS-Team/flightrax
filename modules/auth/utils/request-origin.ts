import "server-only";

import { headers } from "next/headers";

// Where the browser is talking to us from — localhost during development,
// the Vercel domain in production — so links we put in emails point back at
// the same deployment without a per-environment setting. Vercel terminates
// TLS at its edge, so the scheme arrives in a forwarded header rather than
// on the request itself.
export async function getRequestOrigin(): Promise<string> {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return origin;
  }

  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "";
  const proto =
    headerStore.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}
