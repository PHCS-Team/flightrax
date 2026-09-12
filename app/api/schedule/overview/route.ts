import { NextResponse } from "next/server";

import { SCHEDULE_VIEW } from "@/modules/schedule/constants/permissions";
import { getScheduleOverview } from "@/modules/schedule/services/schedule.server";
import { normalizeMonth } from "@/modules/schedule/utils/schedule-date";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";

export async function GET(request: Request) {
  const viewer = await getCurrentAuthorizationProfile();

  if (
    !viewer ||
    !isApproved(viewer) ||
    !hasPermission(viewer.role, SCHEDULE_VIEW, viewer.admin_department)
  ) {
    return NextResponse.json(
      { message: "You do not have permission to view the schedule." },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const month = normalizeMonth(searchParams.get("month"));

  try {
    const entries = await getScheduleOverview(month);

    return NextResponse.json({ entries });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load the schedule.";

    return NextResponse.json({ message }, { status: 500 });
  }
}