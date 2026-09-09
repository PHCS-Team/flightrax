"use client";

import { BellIcon, CheckIcon } from "lucide-react";

import { NotificationsList } from "@/modules/notifications/components/notifications-list";
import { useMarkAllNotificationsRead } from "@/modules/notifications/hooks/use-mark-all-notifications-read.action";
import { useNotifications } from "@/modules/notifications/hooks/use-notifications.query";
import { useUnreadNotificationCount } from "@/modules/notifications/hooks/use-unread-notification-count.query";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { FloatingActionButton } from "@/shared/components/layout/floating-action-button";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Button } from "@/shared/components/ui/button";
import { useInfiniteScrollSentinel } from "@/shared/hooks/use-infinite-scroll-sentinel";

export function NotificationsClientSurface() {
  const list = useNotifications();
  const { unreadCount } = useUnreadNotificationCount();
  const markAllRead = useMarkAllNotificationsRead();
  const sentinelRef = useInfiniteScrollSentinel(list);

  if (list.isPending) {
    return <LoadingScreen />;
  }

  if (list.error) {
    return (
      <EmptyState
        description={list.error.message}
        icon={<BellIcon className="size-7" />}
        title="Notifications could not be loaded"
      />
    );
  }

  return (
    <div className="sm:space-y-4">
      <div className="hidden sm:flex sm:items-center sm:justify-end">
        <Button
          className="cursor-pointer px-4 font-semibold disabled:cursor-default"
          disabled={unreadCount === 0 || markAllRead.isExecuting}
          onClick={() => markAllRead.execute()}
          type="button"
          variant="outline"
        >
          Mark all as read
        </Button>
      </div>

      {list.notifications.length === 0 ? (
        <EmptyState
          description="Account updates, flight requests and NOTAMs will appear here as they happen."
          icon={<BellIcon className="size-7" />}
          title="No Notifications Yet"
        />
      ) : (
        <NotificationsList
          isFetchingNextPage={list.isFetchingNextPage}
          notifications={list.notifications}
          sentinelRef={sentinelRef}
        />
      )}

      {unreadCount > 0 && (
        <FloatingActionButton
          className="sm:hidden"
          disabled={markAllRead.isExecuting}
          icon={CheckIcon}
          label="Mark All as Read"
          onClick={() => markAllRead.execute()}
        />
      )}
    </div>
  );
}
