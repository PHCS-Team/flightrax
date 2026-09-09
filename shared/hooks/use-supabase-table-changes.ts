"use client";

import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useId, useRef } from "react";

import { createClient } from "@/shared/lib/supabase/client";

const FALLBACK_POLL_MS = 15 * 1000;

type TableChangePayload = RealtimePostgresChangesPayload<
  Record<string, unknown>
>;

export function useSupabaseTableChanges({
  channelName,
  enabled = true,
  filter,
  onChange,
  tables,
}: {
  channelName: string;
  enabled?: boolean;
  filter?: string;
  onChange: (payload?: TableChangePayload) => void;
  tables: readonly string[];
}) {
  const onChangeRef = useRef(onChange);
  const tablesKey = tables.join(",");
  const instanceId = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const supabase = createClient();
    let fallbackTimer: ReturnType<typeof setInterval> | null = null;

    let channel = supabase.channel(`${channelName}-${instanceId}`);

    for (const table of tablesKey.split(",")) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, ...(filter ? { filter } : {}) },
        (payload) => onChangeRef.current(payload),
      );
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          supabase.realtime.setAuth(session.access_token);
        }
      },
    );

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        supabase.realtime.setAuth(data.session.access_token);
      }

      channel.subscribe((status, subscribeError) => {
        if (process.env.NODE_ENV !== "production") {
          console.info(
            `[${channelName}] realtime status: ${status}`,
            subscribeError?.message ?? "",
          );
        }

        if (status === "SUBSCRIBED") {
          if (fallbackTimer) {
            clearInterval(fallbackTimer);
            fallbackTimer = null;
          }

          return;
        }

        if (
          (status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED") &&
          !fallbackTimer
        ) {
          fallbackTimer = setInterval(
            () => onChangeRef.current(),
            FALLBACK_POLL_MS,
          );
        }
      });
    });

    return () => {
      if (fallbackTimer) {
        clearInterval(fallbackTimer);
      }

      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [channelName, enabled, filter, instanceId, tablesKey]);
}
