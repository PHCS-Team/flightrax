import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import {
  isPushConfigured,
  sendPushToUser,
} from "@/modules/notifications/services/push.server";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const dynamic = "force-dynamic";

const DISPATCH_SECRET = process.env.PUSH_DISPATCH_SECRET ?? "";

function isAuthorized(header: string | null): boolean {
  if (!DISPATCH_SECRET || !header) {
    return false;
  }

  const expected = Buffer.from(DISPATCH_SECRET);
  const received = Buffer.from(header);

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request.headers.get("x-dispatch-secret"))) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (!isPushConfigured()) {
    return NextResponse.json(
      { message: "Push is not configured on this deployment." },
      { status: 503 },
    );
  }

  let notificationId: unknown;

  try {
    const payload: unknown = await request.json();
    notificationId =
      typeof payload === "object" && payload !== null
        ? (payload as { notificationId?: unknown }).notificationId
        : undefined;
  } catch {
    return NextResponse.json({ message: "Invalid body." }, { status: 400 });
  }

  if (typeof notificationId !== "string") {
    return NextResponse.json(
      { message: "notificationId is required." },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  const { data: notification, error } = await supabase
    .from("notifications")
    .select("id, user_id, title, body, href, type")
    .eq("id", notificationId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  if (!notification) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  try {
    const result = await sendPushToUser(notification.user_id, {
      title: notification.title,
      body: notification.body,
      href: notification.href,
      tag: notification.type,
    });

    return NextResponse.json(result);
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : "Unable to send push.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
