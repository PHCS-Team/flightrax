import "server-only";

import { SCHEDULE_MANAGE } from "@/modules/schedule/constants/permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { describeActionError } from "@/shared/lib/action-error";

export async function getScheduleManager() {
  const actor = await getCurrentAuthorizationProfile();

  if (
    !actor ||
    !isApproved(actor) ||
    !hasPermission(actor.role, SCHEDULE_MANAGE, actor.admin_department)
  ) {
    return null;
  }

  return actor;
}

export function describeScheduleWriteError(error: {
  code?: string;
  message: string;
}): string {
  if (error.code === "23P01") {
    return "That time overlaps another entry on the same row.";
  }

  if (error.code === "23514") {
    return "Check the times and people on this entry.";
  }

  return describeActionError(error);
}
