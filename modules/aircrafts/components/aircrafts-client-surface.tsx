"use client";

import { useEffect } from "react";

import { PlaneIcon } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { AircraftsTable } from "@/modules/aircrafts/components/aircrafts-table";
import { useAircrafts } from "@/modules/aircrafts/hooks/use-aircrafts.query";
import { useDebouncedQueryState } from "@/shared/hooks/use-debounced-query-state";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";

const DEFAULT_PAGE_SIZE = 10;

export function AircraftsClientSurface() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  );

  const [searchInput, setSearchInput, committedSearch] = useDebouncedQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  useEffect(() => {
    setPage(1);
  }, [committedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const { aircrafts, error, isPending, totalCount, totalPages } = useAircrafts(
    page,
    pageSize,
    committedSearch,
  );

  if (isPending) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon={<PlaneIcon className="size-7" />}
        title="Aircraft could not be loaded"
      />
    );
  }

  return (
    <AircraftsTable
      aircrafts={aircrafts}
      onPageChange={setPage}
      onSearchChange={setSearchInput}
      page={page}
      pageSize={pageSize}
      search={searchInput}
      totalCount={totalCount}
      totalPages={totalPages}
    />
  );
}
