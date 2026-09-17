import "server-only";

import { SCHEDULE_MANAGE } from "@/modules/schedule/constants/permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import type { ScheduleEntryRow } from "@/modules/schedule/types/schedule";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { describeActionError } from "@/shared/lib/action-error";

export const SCHEDULE_OVERLAP_VIOLATION = "23P01";

type ScheduleEntryFields = Pick<
  ScheduleEntryRow,
  | "aircraft_id"
  | "created_by"
  | "ends_at"
  | "instructor_profile_id"
  | "label"
  | "pilot_profile_id"
  | "session_type"
  | "starts_at"
>;

// A repeated "Post entry" collides with the entry the first tap already
// posted and fails the no-overlap constraint. When the row in the way is
// exactly the one being posted, the post already happened.
export async function isScheduleEntryAlreadyPosted(
  entry: ScheduleEntryFields,
): Promise<boolean> {
  const supabase = createAdminClient();
  let query = supabase
    .from("schedule_entries")
    .select("id")
    .eq("aircraft_id", entry.aircraft_id)
    .eq("starts_at", entry.starts_at)
    .eq("ends_at", entry.ends_at)
    .eq("session_type", entry.session_type)
    .eq("created_by", entry.created_by);

  query = entry.pilot_profile_id
    ? query.eq("pilot_profile_id", entry.pilot_profile_id)
    : query.is("pilot_profile_id", null);
  query = entry.instructor_profile_id
    ? query.eq("instructor_profile_id", entry.instructor_profile_id)
    : query.is("instructor_profile_id", null);
  query = entry.label
    ? query.eq("label", entry.label)
    : query.is("label", null);

  const { data, error } = await query.limit(1).maybeSingle();

  if (error) {
    throw new Error(describeActionError(error));
  }

  return Boolean(data);
}

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
  if (error.code === SCHEDULE_OVERLAP_VIOLATION) {
    return "That time overlaps another entry on the same row.";
  }

  if (error.code === "23514") {
    return "Check the times and people on this entry.";
  }

  return describeActionError(error);
}
