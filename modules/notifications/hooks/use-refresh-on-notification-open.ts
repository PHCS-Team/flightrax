"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const NOTIFICATION_OPENED_MESSAGE = "notification-opened";

export function useRefreshOnNotificationOpen() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const onMessage = (event: MessageEvent<unknown>) => {
      const data = event.data;

      if (
        typeof data === "object" &&
        data !== null &&
        "type" in data &&
        data.type === NOTIFICATION_OPENED_MESSAGE
      ) {
        void queryClient.invalidateQueries();
      }
    };

    navigator.serviceWorker.addEventListener("message", onMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, [queryClient]);
}
