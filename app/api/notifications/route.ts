import { NextResponse } from "next/server";

import { getNotificationsPage } from "@/modules/notifications/services/notifications.server";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";

export async function GET(request: Request) {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer)) {
    return NextResponse.json(
      { message: "You do not have permission to view notifications." },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "15", 10)),
  );

  try {
    const result = await getNotificationsPage(viewer.id, page, pageSize);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load notifications.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
