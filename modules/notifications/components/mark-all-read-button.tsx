"use client";

import { CheckIcon } from "lucide-react";

import { useMarkAllNotificationsRead } from "@/modules/notifications/hooks/use-mark-all-notifications-read.action";
import { useUnreadNotificationCount } from "@/modules/notifications/hooks/use-unread-notification-count.query";
import { Button } from "@/shared/components/ui/button";

export function MarkAllReadButton() {
  const { unreadCount } = useUnreadNotificationCount();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <Button
      className="hidden h-10 cursor-pointer border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:cursor-default sm:inline-flex"
      disabled={unreadCount === 0 || markAllRead.isExecuting}
      onClick={() => markAllRead.execute()}
      type="button"
      variant="outline"
    >
      <CheckIcon className="size-4" />
      Mark all as read
    </Button>
  );
}
