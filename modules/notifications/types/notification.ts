import type { Database } from "@/shared/types/supabase";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

export type NotificationListRow = Pick<
  NotificationRow,
  | "id"
  | "type"
  | "title"
  | "body"
  | "href"
  | "entity_type"
  | "entity_id"
  | "read_at"
  | "created_at"
>;

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  entityType: string | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type UnreadNotificationCount = {
  count: number;
};
