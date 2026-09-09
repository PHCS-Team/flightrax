import "server-only";

import type {
  AppNotification,
  NotificationListRow,
} from "@/modules/notifications/types/notification";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { PaginatedResponse } from "@/shared/types/pagination";

const LIST_COLUMNS =
  "id, type, title, body, href, entity_type, entity_id, read_at, created_at";

function toAppNotification(row: NotificationListRow): AppNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    entityType: row.entity_type,
    entityId: row.entity_id,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export async function getNotificationsPage(
  userId: string,
  page: number,
  pageSize: number,
): Promise<PaginatedResponse<AppNotification>> {
  const supabase = createAdminClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const {
    data,
    error,
    count: totalCount,
  } = await supabase
    .from("notifications")
    .select(LIST_COLUMNS, { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = totalCount ?? 0;

  return {
    data: (data ?? []).map(toAppNotification),
    totalCount: total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
