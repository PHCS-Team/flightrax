import "server-only";

import { DASHBOARD_VIEW } from "@/modules/dashboard/constants/permissions";
import { toNotamSeverity } from "@/shared/lib/aviation/notam-options";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { NotamSummary } from "@/shared/types/notam";

const ACTIVE_NOTAM_SELECT =
  "id, title, description, severity, expires_at, created_at";

export async function getActiveNotams(): Promise<NotamSummary[]> {
  const viewer = await getCurrentAuthorizationProfile();

  if (
    !viewer ||
    !isApproved(viewer) ||
    !hasPermission(viewer.role, DASHBOARD_VIEW, viewer.admin_department)
  ) {
    throw new Error("You do not have permission to view NOTAMs.");
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("notams")
    .select(ACTIVE_NOTAM_SELECT)
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    severity: toNotamSeverity(row.severity),
    expiresAt: row.expires_at ?? "9999-12-31T23:59:59.999Z",
    createdAt: row.created_at,
  }));
}
