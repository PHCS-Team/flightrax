"use client";

import { useCallback, useEffect } from "react";

import { BellIcon } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { NotamsTable } from "@/modules/notams/components/notams-table";
import { useNotams } from "@/modules/notams/hooks/use-notams.query";
import { useDebouncedQueryState } from "@/shared/hooks/use-debounced-query-state";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";

const DEFAULT_PAGE_SIZE = 20;

type SeverityFilter = "" | "advisory" | "warning" | "alert";
type ExpiryFilter = "" | "active" | "expired" | "no_expiry";

export function NotamsClientSurface() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  );

  const [searchInput, setSearchInput, committedSearch] = useDebouncedQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const [severityFilter, setSeverityFilter] = useQueryState(
    "severity",
    parseAsString.withDefault(""),
  );

  const [expiryFilter, setExpiryFilter] = useQueryState(
    "expiry",
    parseAsString.withDefault(""),
  );

  const resetPage = useCallback(() => setPage(1), [setPage]);

  useEffect(() => {
    resetPage();
  }, [committedSearch, severityFilter, expiryFilter, resetPage]);

  const hasActiveFilters = Boolean(severityFilter || expiryFilter);

  const { error, isPending, notams, totalCount, totalPages } = useNotams(
    page,
    pageSize,
    committedSearch,
    severityFilter as SeverityFilter,
    expiryFilter as ExpiryFilter,
  );

  if (isPending) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon={<BellIcon className="size-7" />}
        title="NOTAMs could not be loaded"
      />
    );
  }

  return (
    <NotamsTable
      notams={notams}
      onPageChange={setPage}
      onSearchChange={setSearchInput}
      onSeverityFilterChange={setSeverityFilter}
      onExpiryFilterChange={setExpiryFilter}
      page={page}
      pageSize={pageSize}
      search={searchInput}
      severityFilter={severityFilter as SeverityFilter}
      expiryFilter={expiryFilter as ExpiryFilter}
      totalCount={totalCount}
      totalPages={totalPages}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={() => {
        setSeverityFilter("");
        setExpiryFilter("");
      }}
    />
  );
}