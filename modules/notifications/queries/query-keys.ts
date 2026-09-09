export const NOTIFICATIONS_QUERY_KEYS = {
  all: ["notifications"] as const,
  list: (pageSize: number) => ["notifications", "list", { pageSize }] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};
