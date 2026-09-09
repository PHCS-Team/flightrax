import { NextResponse } from "next/server";

import { getUnreadNotificationCount } from "@/modules/notifications/services/notifications.server";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";

export async function GET() {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer)) {
    return NextResponse.json(
      { message: "You do not have permission to view notifications." },
      { status: 403 },
    );
  }

  try {
    const count = await getUnreadNotificationCount(viewer.id);

    return NextResponse.json({ count });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load the unread notification count.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
