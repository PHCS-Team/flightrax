"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { FLIGHT_DOCUMENTS_QUERY_KEYS } from "@/modules/flight-documents/queries/query-keys";
import { createClient } from "@/shared/lib/supabase/client";

// Tables whose changes affect aircraft availability in the picker. Each
// must be in the supabase_realtime publication (see the
// enable_realtime_aircraft_availability migration).
const AVAILABILITY_TABLES = [
  "aircrafts",
  "aircraft_types",
  "aircraft_weight_balance_configs",
] as const;

// If the realtime channel cannot subscribe, fall back to polling so an
// open picker still refreshes shortly after admin changes.
const FALLBACK_POLL_MS = 15 * 1000;

// While the aircraft picker is open, refetch the options list whenever an
// admin changes anything availability depends on — type W&B specs, basic
// empty weight configs, or aircraft status.
export function useAircraftOptionsRealtime({ enabled }: { enabled: boolean }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const supabase = createClient();
    let fallbackTimer: ReturnType<typeof setInterval> | null = null;

    function invalidateOptions() {
      queryClient.invalidateQueries({
        queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.aircraftOptionsAll,
      });
      queryClient.invalidateQueries({
        queryKey: FLIGHT_DOCUMENTS_QUERY_KEYS.typeOptions,
      });
    }

    let channel = supabase.channel("flight-plan-aircraft-availability");

    for (const table of AVAILABILITY_TABLES) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        invalidateOptions,
      );
    }

    // Realtime RLS checks run against the subscriber's JWT. Attach it
    // explicitly before joining — without it the socket joins with the
    // publishable key only and RLS silently filters out every event.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        supabase.realtime.setAuth(data.session.access_token);
      }

      channel.subscribe((status, subscribeError) => {
        if (process.env.NODE_ENV !== "production") {
          console.info(
            `[aircraft-options-realtime] status: ${status}`,
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
          (status === "CHANNEL_ERROR" || status === "TIMED_OUT") &&
          !fallbackTimer
        ) {
          fallbackTimer = setInterval(invalidateOptions, FALLBACK_POLL_MS);
        }
      });
    });

    return () => {
      if (fallbackTimer) {
        clearInterval(fallbackTimer);
      }

      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);
}
