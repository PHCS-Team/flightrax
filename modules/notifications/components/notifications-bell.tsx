"use client";

import Link from "next/link";
import { useState } from "react";

import { BellIcon } from "lucide-react";

import { NotificationsPanel } from "@/modules/notifications/components/notifications-panel";
import { useNotificationsRealtime } from "@/modules/notifications/hooks/use-notifications-realtime";
import { useUnreadNotificationCount } from "@/modules/notifications/hooks/use-unread-notification-count.query";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

const BELL_CLASSES =
  "relative cursor-pointer rounded-full text-primary-foreground/85 hover:bg-primary-foreground/10 hover:text-primary-foreground";

function bellLabel(unreadCount: number) {
  return unreadCount > 0
    ? `Notifications, ${unreadCount} unread`
    : "Notifications";
}

function BellContent({ unreadCount }: { unreadCount: number }) {
  return (
    <>
      <BellIcon className="size-6 sm:size-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-warning px-1 text-[10px] font-bold leading-4 text-primary">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </>
  );
}

export function NotificationsBell({ userId }: { userId: string | undefined }) {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useUnreadNotificationCount();

  useNotificationsRealtime(userId);

  return (
    <>
      <Button
        asChild
        aria-label={bellLabel(unreadCount)}
        className={cn(BELL_CLASSES, "sm:hidden")}
        size="icon"
        variant="ghost"
      >
        <Link href="/notifications">
          <BellContent unreadCount={unreadCount} />
        </Link>
      </Button>

      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-label={bellLabel(unreadCount)}
            className={cn(BELL_CLASSES, "hidden sm:inline-flex")}
            size="icon"
            type="button"
            variant="ghost"
          >
            <BellContent unreadCount={unreadCount} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-88 p-0" sideOffset={8}>
          <NotificationsPanel
            onNavigate={() => setOpen(false)}
            unreadCount={unreadCount}
          />
        </PopoverContent>
      </Popover>
    </>
  );
}
