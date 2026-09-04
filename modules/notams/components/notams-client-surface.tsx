"use client";

import { BellIcon, PlusIcon, SearchIcon } from "lucide-react";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";

import { NotamDeleteConfirmation } from "@/modules/notams/components/notam-delete-confirmation";
import { NotamFormDialog } from "@/modules/notams/components/notam-form-dialog";
import { NotamsList } from "@/modules/notams/components/notams-list";
import { useNotams } from "@/modules/notams/hooks/use-notams.query";
import {
  NOTAM_SEVERITY_FILTERS,
  NOTAM_STATUS_FILTERS,
  NOTAMS_PAGE_SIZE,
} from "@/modules/notams/constants/notam-options";
import { useNotamsRealtime } from "@/modules/notams/hooks/use-notams-realtime";
import type {
  Notam,
  NotamSeverityFilter,
  NotamStatusFilter,
} from "@/modules/notams/types/notam";
import {
  NOTAM_SEVERITIES,
  NOTAM_SEVERITY_META,
} from "@/shared/lib/aviation/notam-options";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { FilterSelect } from "@/shared/components/layout/filter-select";
import { FloatingActionButton } from "@/shared/components/layout/floating-action-button";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { SelectItem } from "@/shared/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { useDebouncedQueryState } from "@/shared/hooks/use-debounced-query-state";
import { useInfiniteScrollSentinel } from "@/shared/hooks/use-infinite-scroll-sentinel";

export function NotamsClientSurface({
  canDeleteAny,
  viewerId,
}: {
  canDeleteAny: boolean;
  viewerId: string | null;
}) {
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(NOTAM_STATUS_FILTERS).withDefault("active"),
  );
  const [severity, setSeverity] = useQueryState(
    "severity",
    parseAsStringLiteral(NOTAM_SEVERITY_FILTERS).withDefault("all"),
  );
  const [searchInput, setSearchInput, committedSearch] = useDebouncedQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [notamPendingDelete, setNotamPendingDelete] = useState<Notam | null>(
    null,
  );
  const list = useNotams(NOTAMS_PAGE_SIZE, committedSearch, status, severity);
  useNotamsRealtime();
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
        icon={<BellIcon className="size-7" />}
        title="NOTAMs could not be loaded"
      />
    );
  }

  const isHistory = status === "expired";
  const isFiltered = Boolean(committedSearch) || severity !== "all";

  return (
    <TooltipProvider>
      <div className="sm:space-y-4">
        <Tabs
          onValueChange={(value) => setStatus(value as NotamStatusFilter)}
          value={status}
        >
          <TabsList className="w-full justify-start border-x-0 border-y border-primary-foreground/15 p-1.5 md:w-fit md:border-x">
            <TabsTrigger className="cursor-pointer" value="active">
              Active
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="expired">
              Expired
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-3 px-2.5 pt-2.5 pb-3 sm:flex-row sm:items-center sm:justify-between sm:px-0 sm:py-0">
          <div className="flex min-w-0 flex-1 gap-2">
            <div className="relative min-w-0 flex-1 sm:max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary-foreground/55" />
              <Input
                className="border-primary-foreground/20 bg-primary-foreground/10 pl-11 text-primary-foreground placeholder:text-primary-foreground/55 focus-visible:border-primary-foreground/45 focus-visible:ring-primary-foreground/20"
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search notices..."
                value={searchInput}
              />
            </div>
            <FilterSelect
              isActive={severity !== "all"}
              label="Filter by severity"
              onValueChange={(value) =>
                setSeverity(value as NotamSeverityFilter)
              }
              tone="dark"
              value={severity}
            >
              <SelectItem value="all">All severities</SelectItem>
              {NOTAM_SEVERITIES.map((option) => (
                <SelectItem key={option} value={option}>
                  {NOTAM_SEVERITY_META[option].label}
                </SelectItem>
              ))}
            </FilterSelect>
          </div>
          <Button
            className="hidden px-4 font-semibold sm:inline-flex"
            onClick={() => setCreateDialogOpen(true)}
            type="button"
          >
            <PlusIcon className="size-4" />
            Post NOTAM
          </Button>
        </div>

        {list.isPending ? (
          <LoadingScreen />
        ) : list.notams.length === 0 ? (
          <EmptyState
            description={
              isFiltered
                ? "Try a different search or severity, or clear the filters."
                : isHistory
                  ? "Notices that have passed their expiry date will be kept here."
                  : "Post the first notice to get started."
            }
            icon={<BellIcon className="size-7" />}
            title={
              isFiltered
                ? "No Matching NOTAMs"
                : isHistory
                  ? "No Expired NOTAMs"
                  : "No Active NOTAMs"
            }
          />
        ) : (
          <NotamsList
            canDeleteAny={canDeleteAny}
            isFetchingNextPage={list.isFetchingNextPage}
            notams={list.notams}
            onDelete={setNotamPendingDelete}
            sentinelRef={sentinelRef}
            viewerId={viewerId}
          />
        )}
      </div>

      <FloatingActionButton
        className="sm:hidden"
        icon={PlusIcon}
        label="Post NOTAM"
        onClick={() => setCreateDialogOpen(true)}
      />

      <NotamFormDialog
        onOpenChange={setCreateDialogOpen}
        open={createDialogOpen}
      />

      <NotamDeleteConfirmation
        notam={notamPendingDelete}
        onOpenChange={(open) => {
          if (!open) setNotamPendingDelete(null);
        }}
        open={Boolean(notamPendingDelete)}
      />
    </TooltipProvider>
  );
}
