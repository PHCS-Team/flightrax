"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { BellIcon } from "lucide-react";

import { NotificationRow } from "@/modules/notifications/components/notification-row";
import { useMarkAllNotificationsRead } from "@/modules/notifications/hooks/use-mark-all-notifications-read.action";
import { useMarkNotificationRead } from "@/modules/notifications/hooks/use-mark-notification-read.action";
import { useNotifications } from "@/modules/notifications/hooks/use-notifications.query";
import type { AppNotification } from "@/modules/notifications/types/notification";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

const PANEL_LIMIT = 8;

function PanelLoading() {
  return (
    <div className="space-y-4 px-3.5 py-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="flex items-start gap-3" key={index}>
          <Skeleton className="size-9 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationsPanel({
  onNavigate,
  unreadCount,
}: {
  onNavigate: () => void;
  unreadCount: number;
}) {
  const router = useRouter();
  const { error, isPending, notifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const openNotification = (notification: AppNotification) => {
    if (notification.readAt === null) {
      markRead.execute({ notificationId: notification.id });
    }

    onNavigate();

    if (notification.href) {
      router.push(notification.href);
    }
  };

  return (
    <div className="flex max-h-[70vh] flex-col sm:max-h-112">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-3">
        <p className="text-sm font-semibold text-foreground">Notifications</p>
        <Button
          className="h-auto cursor-pointer px-2 py-1 text-xs disabled:cursor-default"
          disabled={unreadCount === 0 || markAllRead.isExecuting}
          onClick={() => markAllRead.execute()}
          size="sm"
          type="button"
          variant="ghost"
        >
          Mark all as read
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isPending ? (
          <PanelLoading />
        ) : error ? (
          <p className="px-3.5 py-8 text-center text-sm text-muted-foreground">
            {error.message}
          </p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-3.5 py-10 text-center">
            <span className="flex size-11 items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground">
              <BellIcon className="size-5" />
            </span>
            <p className="text-sm font-medium text-foreground">
              You are all caught up
            </p>
            <p className="text-xs text-muted-foreground">
              New activity will show up here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.slice(0, PANEL_LIMIT).map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onOpen={openNotification}
                variant="panel"
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border px-3.5 py-2.5">
        <Button
          asChild
          className="w-full cursor-pointer text-xs"
          size="sm"
          variant="ghost"
        >
          <Link href="/notifications" onClick={onNavigate}>
            View all
          </Link>
        </Button>
      </div>
    </div>
  );
}
