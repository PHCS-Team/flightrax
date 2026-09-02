"use client";

import { NotebookTextIcon, SearchIcon } from "lucide-react";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";

import { useFlightLogsAudit } from "@/modules/flight-documents/hooks/use-flight-logs-audit.query";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { FilterSelect } from "@/shared/components/layout/filter-select";
import { FlightLogListItem } from "@/shared/components/layout/flight-log-list-item";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { useDebouncedQueryState } from "@/shared/hooks/use-debounced-query-state";
import { useInfiniteScrollSentinel } from "@/shared/hooks/use-infinite-scroll-sentinel";
import { Input } from "@/shared/components/ui/input";
import { SelectItem } from "@/shared/components/ui/select";

const PAGE_SIZE = 10;
const STATUS_FILTERS = ["all", "completed", "cancelled"] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

export function FlightPlansAuditClientSurface() {
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(STATUS_FILTERS).withDefault("all"),
  );
  const [searchInput, setSearchInput, committedSearch] = useDebouncedQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const list = useFlightLogsAudit(PAGE_SIZE, committedSearch, status);
  const sentinelRef = useInfiniteScrollSentinel(list);

  if (!list.isPending && !hasLoadedOnce) {
    setHasLoadedOnce(true);
  }

  if (list.isPending && !hasLoadedOnce) {
    return <LoadingScreen />;
  }

  if (list.error) {
    return (
      <EmptyState
        description={list.error.message}
        icon={<NotebookTextIcon className="size-7" />}
        title="Flight plans could not be loaded"
      />
    );
  }

  return (
    <div className="sm:space-y-4">
      <div className="flex gap-2 px-2.5 pt-2.5 pb-3 sm:px-0 sm:py-0">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary-foreground/55" />
          <Input
            className="border-primary-foreground/20 bg-primary-foreground/10 pl-11 text-primary-foreground placeholder:text-primary-foreground/55 focus-visible:border-primary-foreground/45 focus-visible:ring-primary-foreground/20"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search registry, trainee, or instructor..."
            value={searchInput}
          />
        </div>
        <FilterSelect
          isActive={status !== "all"}
          label="Filter by outcome"
          onValueChange={(value) => setStatus(value as StatusFilter)}
          tone="dark"
          value={status}
        >
          <SelectItem value="all">All outcomes</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </FilterSelect>
      </div>

      {list.isPending ? (
        <LoadingScreen />
      ) : list.logs.length === 0 ? (
        <EmptyState
          description={
            committedSearch || status !== "all"
              ? "Try a different search or switch tabs."
              : "Completed and cancelled flights across all pilots will appear here."
          }
          icon={<NotebookTextIcon className="size-7" />}
          title={
            committedSearch || status !== "all"
              ? "No Matching Flights"
              : "No Flight Logs Yet"
          }
        />
      ) : (
        <div className="grid sm:gap-3">
          {list.logs.map((log) => (
            <FlightLogListItem
              href={`/flight-plans/${log.flightPlanId}`}
              key={log.journeyId}
              log={log}
            />
          ))}

          <div aria-hidden ref={sentinelRef} />

          {list.isFetchingNextPage && (
            <p className="py-2 text-center text-sm text-primary-foreground/60">
              Loading more flights...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
