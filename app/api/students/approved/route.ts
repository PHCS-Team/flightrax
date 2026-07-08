import { NextResponse } from "next/server";

import { getApprovedStudentsForAuthorizedViewer } from "@/modules/students/services/students.server";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";

export async function GET() {
  const viewer = await getCurrentAuthorizationProfile();

  if (
    !viewer ||
    !isApproved(viewer) ||
    !hasPermission(viewer.role, "students.view", viewer.admin_department)
  ) {
    return NextResponse.json(
      { message: "You do not have permission to view students." },
      { status: 403 },
    );
  }

  try {
    const students = await getApprovedStudentsForAuthorizedViewer();

    return NextResponse.json(students);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load approved students.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
