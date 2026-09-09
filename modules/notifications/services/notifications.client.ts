import type {
  AppNotification,
  UnreadNotificationCount,
} from "@/modules/notifications/types/notification";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import type { PaginatedResponse } from "@/shared/types/pagination";

export async function fetchNotificationsPage(
  page: number,
  pageSize: number,
): Promise<PaginatedResponse<AppNotification>> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  const response = await fetch(`/api/notifications?${params}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load notifications."),
    );
  }

  return (await response.json()) as PaginatedResponse<AppNotification>;
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const response = await fetch("/api/notifications/unread-count", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Unable to load the unread notification count.",
      ),
    );
  }

  const payload = (await response.json()) as UnreadNotificationCount;

  return payload.count;
}
