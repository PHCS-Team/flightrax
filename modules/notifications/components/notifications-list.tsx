"use client";

import { useRouter } from "next/navigation";
import type { Ref } from "react";

import { NotificationRow } from "@/modules/notifications/components/notification-row";
import { useMarkNotificationRead } from "@/modules/notifications/hooks/use-mark-notification-read.action";
import type { AppNotification } from "@/modules/notifications/types/notification";

export function NotificationsList({
  isFetchingNextPage,
  notifications,
  sentinelRef,
}: {
  isFetchingNextPage: boolean;
  notifications: AppNotification[];
  sentinelRef: Ref<HTMLDivElement>;
}) {
  const router = useRouter();
  const markRead = useMarkNotificationRead();

  const openNotification = (notification: AppNotification) => {
    if (notification.readAt === null) {
      markRead.execute({ notificationId: notification.id });
    }

    if (notification.href) {
      router.push(notification.href);
    }
  };

  return (
    <div className="grid sm:gap-2.5">
      {notifications.map((notification) => (
        <NotificationRow
          key={notification.id}
          notification={notification}
          onOpen={openNotification}
          variant="page"
        />
      ))}

      <div aria-hidden="true" ref={sentinelRef} />

      {isFetchingNextPage && (
        <p className="py-3 text-center text-sm text-primary-foreground/70">
          Loading more notifications...
        </p>
      )}
    </div>
  );
}
