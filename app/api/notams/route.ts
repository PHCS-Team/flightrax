import { NextResponse } from "next/server";

import { NOTAMS_VIEW } from "@/modules/notams/constants/permissions";
import { getNotamsPage } from "@/modules/notams/services/notams.server";
import {
  NOTAM_SEVERITY_FILTERS,
  NOTAM_STATUS_FILTERS,
} from "@/modules/notams/constants/notam-options";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";

export async function GET(request: Request) {
  const viewer = await getCurrentAuthorizationProfile();

  if (
    !viewer ||
    !isApproved(viewer) ||
    !hasPermission(viewer.role, NOTAMS_VIEW, viewer.admin_department)
  ) {
    return NextResponse.json(
      { message: "You do not have permission to view NOTAMs." },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "12", 10)),
  );
  const search = searchParams.get("search") ?? "";
  const requestedStatus = searchParams.get("status");
  const status =
    NOTAM_STATUS_FILTERS.find((candidate) => candidate === requestedStatus) ??
    "active";
  const requestedSeverity = searchParams.get("severity");
  const severity =
    NOTAM_SEVERITY_FILTERS.find(
      (candidate) => candidate === requestedSeverity,
    ) ?? "all";

  try {
    const result = await getNotamsPage(page, pageSize, search, status, severity);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load NOTAMs.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
