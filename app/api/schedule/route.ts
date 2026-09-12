import { NextResponse } from "next/server";

import { SCHEDULE_VIEW } from "@/modules/schedule/constants/permissions";
import { getSchedulePage } from "@/modules/schedule/services/schedule.server";
import { normalizeDateKey, normalizeMonth } from "@/modules/schedule/utils/schedule-date";
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
  const date = searchParams.get("date")
    ? normalizeDateKey(searchParams.get("date"))
    : null;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "50", 10)),
  );

  try {
    const result = await getSchedulePage(month, date, page, pageSize);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load the schedule.";

    return NextResponse.json({ message }, { status: 500 });
  }
}