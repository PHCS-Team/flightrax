"use client";

import { useEffect } from "react";

import { ShieldCheckIcon } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { AdminsTable } from "@/modules/admins/components/admins-table";
import { useAdmins } from "@/modules/admins/hooks/use-admins.query";
import { useDebouncedQueryState } from "@/shared/hooks/use-debounced-query-state";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";

const DEFAULT_PAGE_SIZE = 10;

export function AdminsClientSurface() {
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

  const { admins, error, isPending, totalCount, totalPages } = useAdmins(
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
        icon={<ShieldCheckIcon className="size-7" />}
        title="Admins could not be loaded"
      />
    );
  }

  return (
    <AdminsTable
      admins={admins}
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
