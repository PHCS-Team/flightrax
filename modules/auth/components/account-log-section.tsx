"use client";

import { PlaneIcon } from "lucide-react";

import { useAccountFlightLogs } from "@/modules/auth/hooks/use-flight-logs.query";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { FlightLogListItem } from "@/shared/components/layout/flight-log-list-item";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { useInfiniteScrollSentinel } from "@/shared/hooks/use-infinite-scroll-sentinel";

const PAGE_SIZE = 10;

export function AccountLogSection() {
  const {
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    logs,
  } = useAccountFlightLogs(PAGE_SIZE);
  const sentinelRef = useInfiniteScrollSentinel({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  });

  if (isPending) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon={<PlaneIcon className="size-7" />}
        title="Flight logs could not be loaded"
      />
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        description="Completed and cancelled flights land here — file a flight plan and take to the skies."
        icon={<PlaneIcon className="size-7" />}
        title="No Flights Logged Yet"
      />
    );
  }

  return (
    <div className="grid sm:gap-3">
      {logs.map((log) => (
        <FlightLogListItem
          href={`/flight-documents/flight-plans/${log.flightPlanId}/log`}
          key={log.journeyId}
          log={log}
        />
      ))}

      <div aria-hidden ref={sentinelRef} />

      {isFetchingNextPage && (
        <p className="py-2 text-center text-sm text-primary-foreground/60">
          Loading more flights...
        </p>
      )}
    </div>
  );
}
