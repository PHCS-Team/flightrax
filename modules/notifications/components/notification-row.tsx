"use client";

import { formatDistanceToNow } from "date-fns";

import { getNotificationPresentation } from "@/modules/notifications/utils/notification-presentation";
import type { AppNotification } from "@/modules/notifications/types/notification";
import { cn } from "@/shared/lib/utils";

const ICON_TONE = {
  panel: {
    default: "border-border bg-muted text-foreground",
    success: "border-emerald-600/20 bg-emerald-600/10 text-emerald-700",
    destructive: "border-destructive/20 bg-destructive/10 text-destructive",
  },
  page: {
    default:
      "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground",
    success: "border-emerald-300/30 bg-emerald-300/15 text-emerald-200",
    destructive: "border-red-300/30 bg-red-300/15 text-red-200",
  },
} as const;

export function NotificationRow({
  notification,
  onOpen,
  variant,
}: {
  notification: AppNotification;
  onOpen: (notification: AppNotification) => void;
  variant: "panel" | "page";
}) {
  const { icon: Icon, tone } = getNotificationPresentation(notification.type);
  const isUnread = notification.readAt === null;
  const isPanel = variant === "panel";

  return (
    <button
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 overflow-hidden text-left transition-colors",
        isPanel
          ? "px-3.5 py-3 hover:bg-muted/60"
          : "border-b border-primary-foreground/10 bg-primary p-3.5 first:border-t hover:bg-primary-foreground/5 md:rounded-2xl md:border",
      )}
      onClick={() => onOpen(notification)}
      type="button"
    >
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border",
          ICON_TONE[variant][tone],
        )}
      >
        <Icon className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-sm",
            isUnread ? "font-semibold" : "font-medium",
            isPanel ? "text-foreground" : "text-primary-foreground",
          )}
        >
          {notification.title}
        </span>

        {notification.body && (
          <span
            className={cn(
              "mt-0.5 block text-xs leading-5 line-clamp-2",
              isPanel ? "text-muted-foreground" : "text-primary-foreground/70",
            )}
          >
            {notification.body}
          </span>
        )}

        <span
          className={cn(
            "mt-1 block text-xs",
            isPanel ? "text-muted-foreground" : "text-primary-foreground/60",
          )}
        >
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </span>
      </span>

      {isUnread && (
        <span
          aria-hidden="true"
          className="mt-2 size-2 shrink-0 rounded-full bg-warning"
        />
      )}
    </button>
  );
}
