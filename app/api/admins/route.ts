import { NextResponse } from "next/server";

import { getAdminsPage } from "@/modules/admins/services/admins.server";
import { ADMINS_VIEW } from "@/modules/admins/constants/permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";

export async function GET(request: Request) {
  const viewer = await getCurrentAuthorizationProfile();

  if (
    !viewer ||
    !isApproved(viewer) ||
    !hasPermission(viewer.role, ADMINS_VIEW, viewer.admin_department)
  ) {
    return NextResponse.json(
      { message: "You do not have permission to view admins." },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10)),
  );
  const search = searchParams.get("search") ?? "";

  try {
    const result = await getAdminsPage(page, pageSize, search);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load admins.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
