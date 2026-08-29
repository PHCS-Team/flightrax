"use client";

import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useId, useRef } from "react";

import { createClient } from "@/shared/lib/supabase/client";

// If the realtime channel cannot subscribe, fall back to polling so the
// open surface still refreshes shortly after a change.
const FALLBACK_POLL_MS = 15 * 1000;

type TableChangePayload = RealtimePostgresChangesPayload<
  Record<string, unknown>
>;

// Subscribes to postgres_changes on the given tables (each must be in
// the supabase_realtime publication) and calls onChange per event —
// without a payload when firing from the polling fallback. Realtime RLS
// checks run against the subscriber's JWT, so the session token is
// attached before joining; without it the socket joins with the
// publishable key only and RLS silently filters out every event.
export function useSupabaseTableChanges({
  channelName,
  enabled = true,
  onChange,
  tables,
}: {
  channelName: string;
  enabled?: boolean;
  onChange: (payload?: TableChangePayload) => void;
  tables: readonly string[];
}) {
  // The callback and table list are read through refs so a new callback
  // identity per render never tears down the subscription.
  const onChangeRef = useRef(onChange);
  const tablesKey = tables.join(",");
  // The browser Supabase client is a singleton, so two mounted surfaces
  // subscribing the same topic collide ("duplicate topic") and the later
  // one silently gets no events. A per-mount suffix keeps topics unique.
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
        { event: "*", schema: "public", table },
        (payload) => onChangeRef.current(payload),
      );
    }

    // Realtime RLS runs against the token the socket holds. Attach the
    // current one before joining, and re-attach on every refresh — with
    // a stale token, RLS silently filters out every event and updates
    // just stop arriving after a while.
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
  }, [channelName, enabled, instanceId, tablesKey]);
}
