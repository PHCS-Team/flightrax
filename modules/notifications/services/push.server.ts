import "server-only";

import webpush, { WebPushError } from "web-push";

import { createAdminClient } from "@/shared/lib/supabase/admin";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const SUBJECT = process.env.VAPID_SUBJECT ?? "";

export function isPushConfigured(): boolean {
  return Boolean(PUBLIC_KEY && PRIVATE_KEY && SUBJECT);
}

if (isPushConfigured()) {
  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
}

export type PushPayload = {
  title: string;
  body: string | null;
  href: string | null;
  tag: string;
};

type DispatchResult = {
  sent: number;
  pruned: number;
};

function isGone(error: unknown): boolean {
  return (
    error instanceof WebPushError &&
    (error.statusCode === 404 || error.statusCode === 410)
  );
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<DispatchResult> {
  if (!isPushConfigured()) {
    return { sent: 0, pruned: 0 };
  }

  const supabase = createAdminClient();
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  if (!subscriptions || subscriptions.length === 0) {
    return { sent: 0, pruned: 0 };
  }

  const body = JSON.stringify(payload);
  const dead: string[] = [];
  let sent = 0;

  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        body,
      ),
    ),
  );

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      sent += 1;

      return;
    }

    if (isGone(result.reason)) {
      dead.push(subscriptions[index].endpoint);
    }
  });

  if (dead.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", dead);
  }

  return { sent, pruned: dead.length };
}
