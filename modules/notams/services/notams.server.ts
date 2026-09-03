import "server-only";

import { NOTAMS_VIEW } from "@/modules/notams/constants/permissions";
import type {
  Notam,
  NotamSeverityFilter,
  NotamStatusFilter,
} from "@/modules/notams/types/notam";
import { toNotamSeverity } from "@/shared/lib/aviation/notam-options";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { PaginatedResponse } from "@/shared/types/pagination";

const NOTAM_LIST_SELECT =
  "id, title, description, severity, expires_at, created_at, created_by, profiles!notams_created_by_fkey(full_name)";

export async function getNotamsPage(
  page: number,
  pageSize: number,
  search: string,
  status: NotamStatusFilter,
  severity: NotamSeverityFilter,
): Promise<PaginatedResponse<Notam>> {
  const viewer = await getCurrentAuthorizationProfile();

  if (
    !viewer ||
    !isApproved(viewer) ||
    !hasPermission(viewer.role, NOTAMS_VIEW, viewer.admin_department)
  ) {
    throw new Error("You do not have permission to view NOTAMs.");
  }

  const supabase = createAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const now = new Date().toISOString();

  let query = supabase
    .from("notams")
    .select(NOTAM_LIST_SELECT, { count: "exact" });

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (severity !== "all") {
    query = query.eq("severity", severity);
  }

  query =
    status === "expired"
      ? query.lt("expires_at", now)
      : query.or(`expires_at.is.null,expires_at.gte.${now}`);

  const {
    data,
    error,
    count: totalCount,
  } = await query.order("created_at", { ascending: false }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = totalCount ?? 0;

  return {
    data: (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      severity: toNotamSeverity(row.severity),
      expiresAt: row.expires_at ?? "9999-12-31T23:59:59.999Z",
      createdAt: row.created_at,
      createdBy: row.created_by,
      postedBy: row.profiles?.full_name ?? null,
    })),
    totalCount: total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
